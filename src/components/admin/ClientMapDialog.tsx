/**
 * ClientMapDialog — free client map for the CRM.
 *
 * Renders every client with a usable address on an OpenStreetMap (Leaflet) map:
 * no API key and no usage cost. Addresses are geocoded once through Nominatim
 * and cached in localStorage (see src/lib/crm/geocodeCache.ts).
 *
 * Features:
 *  - "Home ZIP" reference point (defaults to 33823, Auburndale FL) with a
 *    distance-sorted client list so the closest jobs are on top.
 *  - Popups and side list expose phone / email so a rep can call from the map.
 *  - Native full-screen mode for the whole map panel.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Phone, Mail, Crosshair, Loader2, MapPin } from 'lucide-react';
import { buildAddressQuery, geocodeAddress, milesBetween, type GeoPoint } from '@/lib/crm/geocodeCache';

export interface MapClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  status: string;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  location_region?: string | null;
}

interface Located extends MapClient {
  point: GeoPoint;
  miles: number | null;
  addressLabel: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: MapClient[];
}

const DEFAULT_ZIP = '33823';

const pinIcon = (highlight: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${
      highlight ? '#22d3ee' : '#f97066'
    };border:2px solid rgba(255,255,255,.9);box-shadow:0 0 10px ${
      highlight ? 'rgba(34,211,238,.9)' : 'rgba(249,112,102,.8)'
    }"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const ClientMapDialog: React.FC<Props> = ({ open, onOpenChange, clients }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const homeMarkerRef = useRef<L.Marker | null>(null);

  const [homeZip, setHomeZip] = useState(() => localStorage.getItem('wl_crm_home_zip') || DEFAULT_ZIP);
  const [home, setHome] = useState<GeoPoint | null>(null);
  const [located, setLocated] = useState<Located[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Only clients with an address we can place
  const mappable = useMemo(
    () =>
      clients
        .map(c => ({
          client: c,
          query: buildAddressQuery({
            street: c.address_street,
            city: c.address_city || c.location_region,
            state: c.address_state || 'FL',
            zip: c.address_zip,
          }),
        }))
        .filter(x => !!x.query) as Array<{ client: MapClient; query: string }>,
    [clients]
  );

  /* ---------- map instance ----------
   * Leaflet stamps `_leaflet_id` on the container; React StrictMode mounts
   * effects twice, so we clear the stamp before re-initialising to avoid the
   * "Map container is already initialized" failure (blank map panel).
   * A ResizeObserver keeps tiles sized correctly inside the dialog/fullscreen. */
  useEffect(() => {
    if (!open) return;
    const node = mapNodeRef.current;
    console.log("MAPDBG", { open, node: !!node, hasMap: !!mapRef.current, Lmap: typeof (L as any)?.map });
    if (!node || mapRef.current) return;
    delete (node as unknown as { _leaflet_id?: number })._leaflet_id;
    node.innerHTML = '';
    const map = L.map(node, { center: [28.07, -81.79], zoom: 9, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    const raf = requestAnimationFrame(() => map.invalidateSize());
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      homeMarkerRef.current = null;
    };
  }, [open]);

  /* ---------- geocode home ZIP ---------- */
  useEffect(() => {
    if (!open || !homeZip.trim()) return;
    let cancelled = false;
    (async () => {
      const p = await geocodeAddress(`${homeZip.trim()}, FL`);
      if (!cancelled && p) setHome(p);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, homeZip]);

  /* ---------- geocode clients (cached, sequential) ---------- */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setProgress({ done: 0, total: mappable.length });
    (async () => {
      const results: Located[] = [];
      for (let i = 0; i < mappable.length; i++) {
        if (cancelled) return;
        const { client, query } = mappable[i];
        const point = await geocodeAddress(query);
        if (point) {
          results.push({
            ...client,
            point,
            miles: null,
            addressLabel: query.replace(/, USA$/, ''),
          });
          if (!cancelled) setLocated([...results]);
        }
        if (!cancelled) setProgress({ done: i + 1, total: mappable.length });
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mappable]);

  /* ---------- distances ---------- */
  const withDistance = useMemo(() => {
    const list = located.map(c => ({
      ...c,
      miles: home ? milesBetween(home, c.point) : null,
    }));
    return list.sort((a, b) => (a.miles ?? 1e9) - (b.miles ?? 1e9));
  }, [located, home]);

  /* ---------- render markers ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    withDistance.forEach(c => {
      const existing = markersRef.current.get(c.id);
      const popup = `
        <div style="font-family:ui-sans-serif;min-width:190px">
          <strong>${c.first_name} ${c.last_name}</strong><br/>
          <span style="color:#555">${c.addressLabel}</span><br/>
          ${c.miles != null ? `<span style="color:#0891b2">${c.miles.toFixed(1)} mi away</span><br/>` : ''}
          ${c.phone ? `<a href="tel:${c.phone}" style="color:#0891b2">📞 ${c.phone}</a><br/>` : ''}
          ${c.email ? `<a href="mailto:${c.email}" style="color:#0891b2">✉️ ${c.email}</a>` : ''}
        </div>`;
      if (existing) {
        existing.setIcon(pinIcon(c.id === selectedId));
        existing.setPopupContent(popup);
      } else {
        const m = L.marker([c.point.lat, c.point.lon], { icon: pinIcon(false) })
          .addTo(map)
          .bindPopup(popup);
        m.on('click', () => setSelectedId(c.id));
        markersRef.current.set(c.id, m);
      }
    });
  }, [withDistance, selectedId]);

  /* ---------- home marker ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !home) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:20px;height:20px;border-radius:9999px;background:#0891b2;border:3px solid #fff;box-shadow:0 0 14px rgba(8,145,178,.9)"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    if (homeMarkerRef.current) {
      homeMarkerRef.current.setLatLng([home.lat, home.lon]);
    } else {
      homeMarkerRef.current = L.marker([home.lat, home.lon], { icon })
        .addTo(map)
        .bindPopup(`<strong>Your base</strong><br/>ZIP ${homeZip}`);
    }
    map.setView([home.lat, home.lon], 10);
  }, [home, homeZip]);

  const focusClient = useCallback((c: Located) => {
    setSelectedId(c.id);
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([c.point.lat, c.point.lon], 13, { duration: 0.8 });
    markersRef.current.get(c.id)?.openPopup();
  }, []);

  /* ---------- fullscreen ---------- */
  const toggleFullscreen = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => mapRef.current?.invalidateSize(), 250);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const saveZip = (value: string) => {
    setHomeZip(value);
    localStorage.setItem('wl_crm_home_zip', value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="holographic-panel neon-border-cyan max-w-6xl p-0 overflow-hidden">
        <div ref={panelRef} className="flex flex-col bg-[#0a0a0f] h-[80vh] fullscreen:h-screen">
          <DialogHeader className="p-4 pb-3 border-b border-cyan-500/20">
            <DialogTitle className="text-cyan-300 font-mono flex items-center gap-2">
              <MapPin className="h-5 w-5" /> CLIENT MAP
            </DialogTitle>
            <DialogDescription className="text-cyan-400/60 font-mono text-xs">
              Closest clients to your base ZIP — click a pin or a card to call.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-cyan-500/20">
            <div className="relative">
              <Crosshair className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
              <Input
                value={homeZip}
                onChange={e => saveZip(e.target.value)}
                placeholder="Your ZIP"
                className="pl-10 w-36 holographic-panel border-cyan-500/30 text-cyan-300 font-mono"
              />
            </div>
            <Badge className="text-cyan-300 bg-cyan-500/10 font-mono">
              {withDistance.length} mapped
            </Badge>
            {loading && (
              <span className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono">
                <Loader2 className="h-3 w-3 animate-spin" />
                locating {progress.done}/{progress.total}
              </span>
            )}
            <Button
              variant="outline"
              onClick={toggleFullscreen}
              className="ml-auto holographic-panel border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-mono"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
              {isFullscreen ? 'EXIT FULL SCREEN' : 'FULL SCREEN'}
            </Button>
          </div>

          <div className="flex flex-1 min-h-0 flex-col md:flex-row">
            <div ref={mapNodeRef} className="flex-1 min-h-[300px]" />
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-cyan-500/20 overflow-y-auto">
              {withDistance.map(c => (
                <button
                  key={c.id}
                  onClick={() => focusClient(c)}
                  className={`w-full text-left p-3 border-b border-cyan-500/10 transition-colors ${
                    selectedId === c.id ? 'bg-cyan-500/10' : 'hover:bg-cyan-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cyan-200 font-mono text-sm">
                      {c.first_name} {c.last_name}
                    </span>
                    {c.miles != null && (
                      <span className="text-cyan-400 font-mono text-xs">{c.miles.toFixed(1)} mi</span>
                    )}
                  </div>
                  <p className="text-cyan-400/60 text-xs font-mono">{c.addressLabel}</p>
                  <div className="flex gap-3 mt-1">
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-emerald-300 font-mono"
                      >
                        <Phone className="h-3 w-3" /> {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-blue-300 font-mono"
                      >
                        <Mail className="h-3 w-3" /> email
                      </a>
                    )}
                  </div>
                </button>
              ))}
              {!loading && withDistance.length === 0 && (
                <p className="p-4 text-cyan-400/60 font-mono text-sm">
                  No client addresses could be placed on the map yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientMapDialog;
