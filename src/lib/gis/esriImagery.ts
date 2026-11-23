// Esri World Imagery — the shared GIS layer's second satellite source
// (founder order, 2026-11-22: "fix it from our side"). Mapbox's satellite
// tiles can be refused at the account's rate state (429) while the style
// and labels still load, leaving a dark basemap under the parcel. Esri
// World Imagery serves the same photographic tiles with no key, so the
// map inserts it directly UNDER the style's own satellite layer: where
// Mapbox tiles paint, they win; where they are refused, Esri shows
// through and the basemap is a real satellite photo either way.

export const ESRI_IMAGERY_SOURCE_ID = "esri-world-imagery";
export const ESRI_IMAGERY_LAYER_ID = "esri-world-imagery-layer";
export const ESRI_IMAGERY_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export function esriImagerySource() {
  return {
    type: "raster" as const,
    tiles: [ESRI_IMAGERY_TILE_URL],
    tileSize: 256,
    maxzoom: 18,
    attribution: "Esri, Maxar, Earthstar Geographics",
  };
}

export function esriImageryLayer() {
  return {
    id: ESRI_IMAGERY_LAYER_ID,
    type: "raster" as const,
    source: ESRI_IMAGERY_SOURCE_ID,
  };
}

/**
 * Where the Esri layer sits in the style: directly before (under) the
 * style's own satellite raster when the style carries one, else before
 * its first symbol (label) layer so labels stay on top, else undefined
 * (appended on top — a style with neither is not expected).
 */
export function pickEsriBeforeLayerId(
  layers: Array<{ id: string; type: string }> | undefined,
): string | undefined {
  if (!layers?.length) return undefined;
  const satellite = layers.find((l) => l.type === "raster");
  if (satellite) return satellite.id;
  return layers.find((l) => l.type === "symbol")?.id;
}

/** Minimal structural view of the map this helper needs. */
export interface EsriFallbackMap {
  getSource(id: string): unknown;
  addSource(id: string, source: ReturnType<typeof esriImagerySource>): void;
  getLayer(id: string): unknown;
  addLayer(layer: ReturnType<typeof esriImageryLayer>, beforeId?: string): void;
  getStyle(): { layers?: Array<{ id: string; type: string }> } | undefined;
}

/** Idempotent: safe to call on every map load. */
export function addEsriSatelliteFallback(map: EsriFallbackMap): void {
  if (!map.getSource(ESRI_IMAGERY_SOURCE_ID)) {
    map.addSource(ESRI_IMAGERY_SOURCE_ID, esriImagerySource());
  }
  if (!map.getLayer(ESRI_IMAGERY_LAYER_ID)) {
    map.addLayer(esriImageryLayer(), pickEsriBeforeLayerId(map.getStyle()?.layers));
  }
}
