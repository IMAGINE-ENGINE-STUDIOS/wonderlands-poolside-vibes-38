// Shared GIS layer — Florida parcel lookup against the proven public
// cadastral services (see ~/workspace/ar-feature/GIS-PARCEL-SOURCES.md;
// field-level facts re-verified live 2026-11-22 after the founder's
// Auburndale defect report):
//   - Orange County (best record: carries the zoning district), and
//   - the Florida DOR statewide cadastral layer (all 67 counties, one
//     endpoint, no key) as the universal fallback.
// Address search geocodes FIRST (Mapbox, the layer's public token) and
// then asks which parcel contains the point — the county record's own
// spelling of an address is never the gate. The recorded-address LIKE
// lookup remains only as a fallback when geocoding finds nothing.
// Two statewide traps, both proven the hard way: its point queries only
// honour the JSON geometry form (a bare "lon,lat" pair is read in the
// layer's native projected CRS and silently matches nothing), and it
// has no ACRES field — land area rides LND_SQFOOT.
// Owner name / mailing fields are never requested (public-record privacy
// rule from the sources file): only parcel id, situs address, acreage and
// zoning ride along.

import { MAPBOX_TOKEN } from "./mapboxToken";

export interface ParcelFields {
  parcelId: string;
  situs: string;
  acreage: number | null;
  zoning: string | null;
  source: string;
}

export interface ParcelResult {
  feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
  fields: ParcelFields;
}

const ORANGE_URL =
  "https://vgispublic.ocpafl.org/server/rest/services/DYNAMIC/Dynamic_Parcels/MapServer/3/query";
const STATEWIDE_URL =
  "https://services9.arcgis.com/Gh9awoU677aKree0/ArcGIS/rest/services/Florida_Statewide_Cadastral/FeatureServer/0/query";

/** Escape a value for an ArcGIS SQL LIKE literal. */
export function sqlLikeEscape(value: string): string {
  return value.replace(/'/g, "''").replace(/[%_]/g, "");
}

/**
 * Turn a typed street address into the LIKE pattern the cadastral services
 * answer: house number + first street word, e.g.
 * "4000 Round Lake Road, Apopka" -> "%4000%ROUND LAKE%".
 * Returns null when no house number is present (the services key on it).
 */
export function addressLikePattern(address: string): string | null {
  const cleaned = sqlLikeEscape(address.toUpperCase()).trim();
  const m = cleaned.match(/^(\d+)\s+([A-Z0-9]+(?:\s+[A-Z0-9]+)?)/);
  if (!m) return null;
  return `%${m[1]}%${m[2]}%`;
}

async function queryGeoJson(url: string, params: Record<string, string>): Promise<GeoJSON.FeatureCollection | null> {
  const qs = new URLSearchParams({ ...params, returnGeometry: "true", outSR: "4326", f: "geojson" });
  const res = await fetch(`${url}?${qs.toString()}`);
  if (!res.ok) return null;
  const body = (await res.json()) as GeoJSON.FeatureCollection;
  if (!body || !Array.isArray(body.features) || body.features.length === 0) return null;
  return body;
}

function firstPolygon(fc: GeoJSON.FeatureCollection): GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null {
  const f = fc.features.find(
    (x) => x.geometry && (x.geometry.type === "Polygon" || x.geometry.type === "MultiPolygon"),
  );
  return (f as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>) ?? null;
}

const STATEWIDE_FIELDS = "PARCEL_ID,PHY_ADDR1,PHY_CITY,PHY_ZIPCD,LND_SQFOOT";

/** Map one statewide record to the shared fields (acreage from LND_SQFOOT). */
export function statewideFields(p: Record<string, unknown>): ParcelFields {
  const situs = [p.PHY_ADDR1, p.PHY_CITY, p.PHY_ZIPCD].filter(Boolean).join(", ");
  const sqft = typeof p.LND_SQFOOT === "number" ? p.LND_SQFOOT : null;
  return {
    parcelId: String(p.PARCEL_ID ?? ""),
    situs,
    acreage: sqft != null && sqft > 0 ? sqft / 43560 : null,
    zoning: null,
    source: "Florida statewide cadastral (DOR)",
  };
}

function orangeFields(p: Record<string, unknown>): ParcelFields {
  return {
    parcelId: String(p.PARCEL ?? ""),
    situs: String(p.SITUS ?? ""),
    acreage: typeof p.ACREAGE === "number" ? p.ACREAGE : null,
    zoning: p.ZONING_CODE ? String(p.ZONING_CODE) : null,
    source: "Orange County Property Appraiser",
  };
}

/**
 * Geocode a typed address with Mapbox (the layer's public token).
 * Returns the best match's centre, or null when nothing matches or the
 * token is not in place.
 */
export async function geocodeAddress(
  address: string,
): Promise<{ lon: number; lat: number; placeName: string } | null> {
  if (!MAPBOX_TOKEN || !address.trim()) return null;
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json` +
    `?access_token=${MAPBOX_TOKEN}&country=US&types=address&limit=1`;
  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok) return null;
  const body = (await res.json().catch(() => null)) as MapboxGeocodeBody | null;
  return parseGeocodeCenter(body);
}

interface MapboxGeocodeBody {
  features?: { center?: unknown; place_name?: unknown }[];
}

/** Pure: the first feature's centre from a Mapbox geocoding response. */
export function parseGeocodeCenter(
  body: MapboxGeocodeBody | null,
): { lon: number; lat: number; placeName: string } | null {
  const f = body?.features?.[0];
  if (!f || !Array.isArray(f.center) || f.center.length !== 2) return null;
  const [lon, lat] = f.center as [number, number];
  if (typeof lon !== "number" || typeof lat !== "number") return null;
  return { lon, lat, placeName: typeof f.place_name === "string" ? f.place_name : "" };
}

/**
 * The address search: geocode first, then the point lookup — the record's
 * spelling never gates the result. Falls back to the recorded-address
 * LIKE lookup only when geocoding finds nothing.
 */
export async function lookupParcelForAddress(address: string): Promise<ParcelResult | null> {
  const geo = await geocodeAddress(address).catch(() => null);
  if (geo) {
    const byPoint = await lookupParcelByPoint(geo.lon, geo.lat).catch(() => null);
    if (byPoint) return byPoint;
  }
  return lookupParcelByAddress(address);
}

/** Recorded-address lookup (fallback): Orange first (zoning), statewide next. */
export async function lookupParcelByAddress(address: string): Promise<ParcelResult | null> {
  const pattern = addressLikePattern(address);
  if (!pattern) return null;
  const orange = await queryGeoJson(ORANGE_URL, {
    where: `SITUS LIKE '${pattern}'`,
    outFields: "PARCEL,SITUS,ACREAGE,ZONING_CODE",
  });
  const of = orange && firstPolygon(orange);
  if (of) return { feature: of, fields: orangeFields((of.properties ?? {}) as Record<string, unknown>) };
  const state = await queryGeoJson(STATEWIDE_URL, {
    where: `PHY_ADDR1 LIKE '${pattern}'`,
    outFields: STATEWIDE_FIELDS,
  });
  const sf = state && firstPolygon(state);
  if (sf) return { feature: sf, fields: statewideFields((sf.properties ?? {}) as Record<string, unknown>) };
  return null;
}

/**
 * The point geometry both services honour: the JSON form carrying its
 * own spatial reference. A bare "lon,lat" pair is read by the statewide
 * layer in its native projected CRS and silently matches nothing.
 */
export function pointGeometryParam(lon: number, lat: number): string {
  return JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } });
}

/** Point lookup — the scan's lookup: which parcel contains this lat/lon. */
export async function lookupParcelByPoint(lon: number, lat: number): Promise<ParcelResult | null> {
  const pointParams = {
    geometry: pointGeometryParam(lon, lat),
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
  };
  const orange = await queryGeoJson(ORANGE_URL, {
    ...pointParams,
    outFields: "PARCEL,SITUS,ACREAGE,ZONING_CODE",
  });
  const of = orange && firstPolygon(orange);
  if (of) return { feature: of, fields: orangeFields((of.properties ?? {}) as Record<string, unknown>) };
  const state = await queryGeoJson(STATEWIDE_URL, {
    ...pointParams,
    outFields: STATEWIDE_FIELDS,
  });
  const sf = state && firstPolygon(state);
  if (sf) return { feature: sf, fields: statewideFields((sf.properties ?? {}) as Record<string, unknown>) };
  return null;
}

const EARTH_RADIUS_FT = 20_902_231;

/** Great-circle distance in feet between two lon/lat points. */
export function distanceFt(a: [number, number], b: [number, number]): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_FT * Math.asin(Math.sqrt(s));
}

export interface ParcelEdge {
  from: [number, number];
  to: [number, number];
  midpoint: [number, number];
  feet: number;
}

/** The outer ring's edges with true ground lengths — the measurement layer. */
export function parcelEdges(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): ParcelEdge[] {
  const ring: number[][] | undefined =
    geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates[0]?.[0];
  if (!ring || ring.length < 2) return [];
  const edges: ParcelEdge[] = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const from = ring[i] as [number, number];
    const to = ring[i + 1] as [number, number];
    edges.push({
      from,
      to,
      midpoint: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
      feet: distanceFt(from, to),
    });
  }
  return edges;
}

/** Bounds of a parcel geometry, for fitting the map. */
export function parcelBounds(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
): [[number, number], [number, number]] {
  let minLon = Infinity,
    minLat = Infinity,
    maxLon = -Infinity,
    maxLat = -Infinity;
  const rings: number[][][] =
    geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates.flat();
  for (const ring of rings)
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lat < minLat) minLat = lat;
      if (lon > maxLon) maxLon = lon;
      if (lat > maxLat) maxLat = lat;
    }
  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}
