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

export interface Place { label: string; sub: string; lat: number; lng: number }
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const cache = new Map<string, Place[] | Place | null>();

/**
 * Build a clean postal label from Nominatim's address parts. Raw
 * display_name leads with business names ("Bosphorous Turkish Cuisine,
 * 6900, …") which reads as a wrong suggestion; the parts are correct:
 * "6900 Tavistock Lakes Boulevard" + sub "Orlando, FL 32827".
 */
function formatParts(a: any, fallback: string): { label: string; sub: string } {
  if (!a) return { label: fallback, sub: '' };
  const road = a.road || a.pedestrian || a.footway || a.cycleway || '';
  const street = [a.house_number, road].filter(Boolean).join(' ');
  const city = a.city || a.town || a.village || a.hamlet || a.suburb || a.neighbourhood || '';
  const iso = String(a['ISO3166-2-lvl4'] || '');
  const state = (iso.includes('-') ? iso.split('-').pop() : '') || a.state || '';
  const place = [city, [state, a.postcode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  if (street) return { label: [street, place].filter(Boolean).join(', '), sub: place };
  return { label: fallback.split(',').slice(0, 2).join(',').trim() || fallback, sub: place };
}

function toPlaces(j: any): Place[] {
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const x of Array.isArray(j) ? j : []) {
    const f = formatParts(x.address, String(x.display_name || ''));
    if (!f.label || seen.has(f.label.toLowerCase())) continue;
    seen.add(f.label.toLowerCase());
    out.push({ label: f.label, sub: f.sub, lat: Number(x.lat), lng: Number(x.lon) });
  }
  return out.filter(p => isFinite(p.lat) && isFinite(p.lng));
}

async function nominatim(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', ...params });
  const r = await fetch(`${NOMINATIM}/search?${qs}`, { headers: { Accept: 'application/json' } });
  return r.json();
}

/**
 * Address suggestions as you type. Nominatim free-form search on its own
 * ranks POIs and fuzzy-matches street names badly, so: restrict to the
 * address layer, bias toward the current pin's area when there is one,
 * merge a structured street search when the query starts with a house
 * number, format labels from address parts, and rank numbered addresses
 * first.
 */
export async function searchPlaces(q: string, bias?: { lat: number; lng: number } | null): Promise<Place[]> {
  const key = `s:${q.toLowerCase()}${bias ? '@b' : ''}`;
  if (cache.has(key)) return (cache.get(key) as Place[]) ?? [];
  const common: Record<string, string> = { limit: '10', dedupe: '1', layer: 'address' };
  if (bias) common.viewbox = `${bias.lng - 0.7},${bias.lat + 0.5},${bias.lng + 0.7},${bias.lat - 0.5}`;
  try {
    let out = toPlaces(await nominatim({ ...common, q }));
    const num = q.match(/^\s*(\d+)\s+/);
    if (num) {
      const structured = toPlaces(await nominatim({ ...common, street: q }));
      const have = new Set(out.map(p => p.label.toLowerCase()));
      out = [...structured.filter(p => !have.has(p.label.toLowerCase())), ...out];
      const hn = num[1];
      out.sort((a, b) => Number(b.label.startsWith(`${hn} `)) - Number(a.label.startsWith(`${hn} `)));
    }
    out = out.slice(0, 8);
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

/** Coordinates → a clean postal address for the address box. */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`, { headers: { Accept: 'application/json' } });
    const j = await r.json();
    return formatParts(j?.address, String(j?.display_name || '')).label;
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
  /** Current pin, when set — suggestions are biased toward its area. */
  bias?: { lat: number; lng: number } | null;
  onChange: (address: string) => void;
  onPlace: (p: Place) => void;
}> = ({ value, disabled, bias, onChange, onPlace }) => {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Place[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setQ(value || ''); }, [value]);
  const type = (v: string) => {
    setQ(v); onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 3) { setList([]); setOpen(false); return; }
    timer.current = setTimeout(async () => { setList(await searchPlaces(v.trim(), bias)); setOpen(true); }, 350);
  };
  return (
    <div style={{ position: 'relative' }}>
      <input disabled={disabled} value={q} onChange={(e) => type(e.target.value)} onFocus={() => list.length && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Start typing an address…" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" autoComplete="off" />
      {open && list.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-background shadow-lg">
          {list.map((p, i) => (
            <li key={i}>
              <button type="button" className="block w-full px-3 py-2 text-left hover:bg-muted" onMouseDown={(e) => { e.preventDefault(); setQ(p.label); setOpen(false); onChange(p.label); onPlace(p); }}>
                <span className="block truncate text-sm font-medium">{p.sub ? p.label.slice(0, p.label.length - p.sub.length).replace(/,\s*$/, '') : p.label}</span>
                {p.sub && <span className="block truncate text-xs text-muted-foreground">{p.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
