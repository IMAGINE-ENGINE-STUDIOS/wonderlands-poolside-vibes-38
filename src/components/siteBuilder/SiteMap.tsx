/**
 * SiteMap — the Website Builder map block (Leaflet + OpenStreetMap, no API key).
 * In the builder (editable) the designer sets the pin ON the map in the page:
 * click anywhere to drop/move it, or drag it; the address box fills itself
 * from the pin (reverse geocode) and offers Google-style suggestions as you
 * type (Nominatim). On the published site visitors see the same map with the
 * pin, but no pin-setting pointer — the marker is static there.
 * Address-only sites (no pin yet) geocode the address; legacy behaviour is
 * preserved so saved sites keep working.
 * Imagine Engine Studios Corp.
 */
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Place { label: string; lat: number; lng: number }
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const cache = new Map<string, Place[] | Place | null>();

/** Address suggestions as you type (debounced by the caller). */
export async function searchPlaces(q: string): Promise<Place[]> {
  const key = `s:${q.toLowerCase()}`;
  if (cache.has(key)) return (cache.get(key) as Place[]) ?? [];
  try {
    const r = await fetch(`${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`, { headers: { Accept: 'application/json' } });
    const j = await r.json();
    const out: Place[] = (Array.isArray(j) ? j : []).map((x: any) => ({ label: String(x.display_name || ''), lat: Number(x.lat), lng: Number(x.lon) })).filter((p: Place) => p.label && isFinite(p.lat) && isFinite(p.lng));
    cache.set(key, out); return out;
  } catch { return []; }
}

/** One address → coordinates (first match), or null. */
export async function geocodeAddress(q: string): Promise<Place | null> {
  const key = `g:${q.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key) as Place | null;
  const out = await searchPlaces(q);
  const one = out[0] ?? null; cache.set(key, one); return one;
}

/** Coordinates → a readable address for the address box. */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(`${NOMINATIM}/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lng}`, { headers: { Accept: 'application/json' } });
    const j = await r.json();
    return String(j?.display_name || '');
  } catch { return ''; }
}

/** The pin: a CSS teardrop (no image assets, so it works under any base path). */
const pinIcon = (color: string, editing: boolean) => L.divIcon({
  className: 'sb-pin',
  html: `<div style="position:relative;width:30px;height:42px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))">
    <div style="position:absolute;inset:0;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff"></div>
    <div style="position:absolute;left:9px;top:9px;width:12px;height:12px;background:#fff;border-radius:50%"></div>
    ${editing ? '<div style="position:absolute;left:50%;bottom:-7px;transform:translateX(-50%);width:14px;height:3px;border-radius:50%;background:rgba(0,0,0,.35)"></div>' : ''}
  </div>`,
  iconSize: [30, 42], iconAnchor: [15, 40],
});

interface MapProps {
  address?: string; lat?: number | null; lng?: number | null; zoom?: number;
  height?: number; radius: number; color: string;
  /** Builder only: pin can be dragged/clicked into place; reports every move. */
  editable?: boolean;
  onPin?: (lat: number, lng: number) => void;
}

const SiteMap: React.FC<MapProps> = ({ address, lat, lng, zoom, height, radius, color, editable, onPin }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pinRef = useRef<{ lat: number; lng: number } | null>(lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null);
  const onPinRef = useRef(onPin); onPinRef.current = onPin;
  const [hint, setHint] = useState('');

  // Create the map once; centre on the pin, the address, or a default city view.
  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    const map = L.map(boxRef.current, { scrollWheelZoom: !!editable, zoomControl: !!editable, attributionControl: true });
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(map);
    const start = pinRef.current ?? { lat: 28.5383, lng: -81.3792 }; // Orlando, FL until a place is set
    map.setView([start.lat, start.lng], pinRef.current ? (zoom || 15) : 11);
    const marker = L.marker([start.lat, start.lng], { icon: pinIcon(color, !!editable), draggable: !!editable, opacity: pinRef.current ? 1 : 0 }).addTo(map);
    markerRef.current = marker;
    if (editable) {
      setHint(pinRef.current ? 'Drag the pin or click the map to move it.' : 'Click the map to drop your pin.');
      const place = (ll: L.LatLng) => { pinRef.current = { lat: ll.lat, lng: ll.lng }; marker.setLatLng(ll); marker.setOpacity(1); onPinRef.current?.(ll.lat, ll.lng); };
      map.on('click', (e: L.LeafletMouseEvent) => place(e.latlng));
      marker.on('dragend', () => place(marker.getLatLng()));
    }
    if (!pinRef.current && address) geocodeAddress(address).then((p) => { if (p && !pinRef.current) { map.setView([p.lat, p.lng], zoom || 15); marker.setLatLng([p.lat, p.lng]); marker.setOpacity(1); } });
    const t = setTimeout(() => map.invalidateSize(), 60);
    return () => { clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to outside changes (autocomplete pick, Genius edit, undo): move view + pin.
  useEffect(() => {
    const map = mapRef.current, marker = markerRef.current;
    if (!map || !marker) return;
    if (lat != null && lng != null) {
      const cur = pinRef.current;
      if (!cur || Math.abs(cur.lat - Number(lat)) > 1e-6 || Math.abs(cur.lng - Number(lng)) > 1e-6) {
        pinRef.current = { lat: Number(lat), lng: Number(lng) };
        marker.setLatLng([Number(lat), Number(lng)]); marker.setOpacity(1);
        map.setView([Number(lat), Number(lng)], Math.max(map.getZoom(), zoom || 15));
      }
    } else if (address) {
      geocodeAddress(address).then((p) => { if (p && !pinRef.current) { marker.setLatLng([p.lat, p.lng]); marker.setOpacity(1); map.setView([p.lat, p.lng], zoom || 15); } });
    }
  }, [lat, lng, address, zoom]);

  return (
    <div data-map-edit={editable ? '1' : undefined} style={{ position: 'relative' }}>
      <div ref={boxRef} style={{ width: '100%', height: height || 380, borderRadius: radius, overflow: 'hidden', zIndex: 0 }} />
      {editable && hint && <div style={{ position: 'absolute', left: 10, bottom: 10, zIndex: 500, background: 'rgba(10,10,10,.78)', color: '#fff', fontSize: 12, padding: '5px 10px', borderRadius: 999, pointerEvents: 'none' }}>{hint}</div>}
    </div>
  );
};

export default SiteMap;

/** Address box with Google-style suggestions; picking one sets address + pin. */
export const AddressField: React.FC<{
  value: string; disabled?: boolean;
  onChange: (address: string) => void;
  onPlace: (p: Place) => void;
}> = ({ value, disabled, onChange, onPlace }) => {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Place[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setQ(value || ''); }, [value]);
  const type = (v: string) => {
    setQ(v); onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 3) { setList([]); setOpen(false); return; }
    timer.current = setTimeout(async () => { setList(await searchPlaces(v.trim())); setOpen(true); }, 350);
  };
  return (
    <div style={{ position: 'relative' }}>
      <input disabled={disabled} value={q} onChange={(e) => type(e.target.value)} onFocus={() => list.length && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Start typing an address…" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" autoComplete="off" />
      {open && list.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-background shadow-lg">
          {list.map((p, i) => (
            <li key={i}>
              <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-muted" onMouseDown={(e) => { e.preventDefault(); setQ(p.label); setOpen(false); onChange(p.label); onPlace(p); }}>{p.label}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
