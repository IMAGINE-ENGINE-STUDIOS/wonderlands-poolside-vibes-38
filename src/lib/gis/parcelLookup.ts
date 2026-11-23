// Shared GIS layer — Florida parcel lookup against the proven public
// cadastral services (see ~/workspace/ar-feature/GIS-PARCEL-SOURCES.md,
// verified live 2026-11-22):
//   - Orange County (best record: carries the zoning district), and
//   - the Florida DOR statewide cadastral layer (all 67 counties, one
//     endpoint, no key) as the universal fallback.
// Owner name / mailing fields are never requested (public-record privacy
// rule from the sources file): only parcel id, situs address, acreage and
// zoning ride along.

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

/** Address lookup: Orange County first (zoning), statewide as the fallback. */
export async function lookupParcelByAddress(address: string): Promise<ParcelResult | null> {
  const pattern = addressLikePattern(address);
  if (!pattern) return null;
  const orange = await queryGeoJson(ORANGE_URL, {
    where: `SITUS LIKE '${pattern}'`,
    outFields: "PARCEL,SITUS,ACREAGE,ZONING_CODE",
  });
  const of = orange && firstPolygon(orange);
  if (of) {
    const p = (of.properties ?? {}) as Record<string, unknown>;
    return {
      feature: of,
      fields: {
        parcelId: String(p.PARCEL ?? ""),
        situs: String(p.SITUS ?? ""),
        acreage: typeof p.ACREAGE === "number" ? p.ACREAGE : null,
        zoning: p.ZONING_CODE ? String(p.ZONING_CODE) : null,
        source: "Orange County Property Appraiser",
      },
    };
  }
  const state = await queryGeoJson(STATEWIDE_URL, {
    where: `PHY_ADDR1 LIKE '${pattern}'`,
    outFields: "PARCEL_ID,PHY_ADDR1,PHY_CITY,PHY_ZIPCD,ACRES",
  });
  const sf = state && firstPolygon(state);
  if (sf) {
    const p = (sf.properties ?? {}) as Record<string, unknown>;
    const situs = [p.PHY_ADDR1, p.PHY_CITY, p.PHY_ZIPCD].filter(Boolean).join(", ");
    return {
      feature: sf,
      fields: {
        parcelId: String(p.PARCEL_ID ?? ""),
        situs,
        acreage: typeof p.ACRES === "number" ? p.ACRES : null,
        zoning: null,
        source: "Florida statewide cadastral (DOR)",
      },
    };
  }
  return null;
}

/** Point lookup — the scan's lookup: which parcel contains this lat/lon. */
export async function lookupParcelByPoint(lon: number, lat: number): Promise<ParcelResult | null> {
  const pointParams = {
    geometry: `${lon},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
  };
  const orange = await queryGeoJson(ORANGE_URL, {
    ...pointParams,
    outFields: "PARCEL,SITUS,ACREAGE,ZONING_CODE",
  });
  const of = orange && firstPolygon(orange);
  if (of) {
    const p = (of.properties ?? {}) as Record<string, unknown>;
    return {
      feature: of,
      fields: {
        parcelId: String(p.PARCEL ?? ""),
        situs: String(p.SITUS ?? ""),
        acreage: typeof p.ACREAGE === "number" ? p.ACREAGE : null,
        zoning: p.ZONING_CODE ? String(p.ZONING_CODE) : null,
        source: "Orange County Property Appraiser",
      },
    };
  }
  const state = await queryGeoJson(STATEWIDE_URL, {
    ...pointParams,
    outFields: "PARCEL_ID,PHY_ADDR1,PHY_CITY,PHY_ZIPCD,ACRES",
  });
  const sf = state && firstPolygon(state);
  if (sf) {
    const p = (sf.properties ?? {}) as Record<string, unknown>;
    const situs = [p.PHY_ADDR1, p.PHY_CITY, p.PHY_ZIPCD].filter(Boolean).join(", ");
    return {
      feature: sf,
      fields: {
        parcelId: String(p.PARCEL_ID ?? ""),
        situs,
        acreage: typeof p.ACRES === "number" ? p.ACRES : null,
        zoning: null,
        source: "Florida statewide cadastral (DOR)",
      },
    };
  }
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
