/**
 * Free geocoding helper for the CRM client map.
 *
 * Uses OpenStreetMap's Nominatim service (no API key, no cost). Results are
 * cached in localStorage forever-ish so we only ever hit the network once per
 * unique address — keeps the map instant on reload and respects Nominatim's
 * fair-use policy (max 1 request per second, enforced below).
 */

export interface GeoPoint {
  lat: number;
  lon: number;
}

const CACHE_KEY = 'wl_geocode_cache_v1';
const THROTTLE_MS = 1100;

type CacheShape = Record<string, GeoPoint | null>;

let cache: CacheShape | null = null;
let lastRequest = 0;

const loadCache = (): CacheShape => {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as CacheShape;
  } catch {
    cache = {};
  }
  return cache;
};

let saveTimer: number | undefined;
const saveCache = () => {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache || {}));
    } catch {
      /* storage full — ignore, map still works this session */
    }
  }, 400);
};

export const buildAddressQuery = (parts: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}): string | null => {
  const segments = [parts.street, parts.city, parts.state, parts.zip]
    .map(p => (p || '').trim())
    .filter(Boolean);
  // Need at least a city or ZIP to place a pin meaningfully
  if (!parts.city?.trim() && !parts.zip?.trim()) return null;
  return `${segments.join(', ')}, USA`;
};

/** Geocode one address, using cache first. Returns null when not found. */
export const geocodeAddress = async (query: string): Promise<GeoPoint | null> => {
  const key = query.toLowerCase().trim();
  const store = loadCache();
  if (key in store) return store[key];

  const wait = THROTTLE_MS - (Date.now() - lastRequest);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequest = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const hit = data[0]
      ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      : null;
    store[key] = hit;
    saveCache();
    return hit;
  } catch {
    return null;
  }
};

/** Great-circle distance in miles. */
export const milesBetween = (a: GeoPoint, b: GeoPoint): number => {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
