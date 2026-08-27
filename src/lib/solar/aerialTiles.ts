// Wonderlands Solar — aerial imagery without a browser map key.
//
// The board used to depend on the Google Maps JavaScript API, which fails with
// RefererNotAllowedMapError on any host that is not on the key's referrer list
// (localhost, previews, new custom domains) — the reader then saw a blanket
// "aerial service unavailable". Imagery here comes instead from Esri's public
// World Imagery XYZ service: no key, CORS-open (so the pixels can be sampled
// for the click-to-trace fill) and high resolution over Florida.
//
// Roof intelligence still comes from Google Solar through the solar-report edge
// function, where the key is a server key and referrer rules do not apply.

import type { LatLng } from "./solarEngine";
import type { TileFrame } from "./roofAutoTrace";

export const TILE = 256;
export const MAX_ZOOM = 21;
export const MIN_ZOOM = 4;

/** Esri World Imagery — {z}/{y}/{x} order, key-free, CORS enabled. */
export const aerialTileUrl = (z: number, x: number, y: number) =>
  `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

/** Attribution required by the imagery terms. */
export const AERIAL_CREDIT = "Imagery © Esri, Maxar, Earthstar Geographics";

/** lat/lng → world pixels at the given zoom. */
export const worldPx = (at: LatLng, zoom: number) => {
  const scale = TILE * 2 ** zoom;
  const siny = Math.min(Math.max(Math.sin((at.lat * Math.PI) / 180), -0.9999), 0.9999);
  return {
    x: scale * (0.5 + at.lng / 360),
    y: scale * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
  };
};

/** world pixels → lat/lng at the given zoom. */
export const worldLatLng = (x: number, y: number, zoom: number): LatLng => {
  const scale = TILE * 2 ** zoom;
  const lng = (x / scale - 0.5) * 360;
  const n = Math.PI * (1 - (2 * y) / scale);
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lng };
};

/** Ground resolution in feet per screen pixel — used for the scale bar. */
export const feetPerPixel = (lat: number, zoom: number) =>
  ((156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom) * 3.28084;

const loadTile = (url: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

/**
 * Composites the aerial tiles around a point into one square bitmap so the
 * flood-fill tracer can read its pixels. Same contract as the old server tile,
 * so `autoTraceAt` works unchanged.
 */
export const composeAerialFrame = async (
  centre: LatLng,
  zoom: number,
  size = 640,
): Promise<TileFrame | null> => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const c = worldPx(centre, zoom);
  const originX = c.x - size / 2;
  const originY = c.y - size / 2;
  const first = { x: Math.floor(originX / TILE), y: Math.floor(originY / TILE) };
  const last = { x: Math.floor((originX + size) / TILE), y: Math.floor((originY + size) / TILE) };
  const span = 2 ** zoom;

  const jobs: Promise<void>[] = [];
  for (let tx = first.x; tx <= last.x; tx++)
    for (let ty = first.y; ty <= last.y; ty++) {
      const wrapped = ((tx % span) + span) % span;
      if (ty < 0 || ty >= span) continue;
      jobs.push(
        loadTile(aerialTileUrl(zoom, wrapped, ty)).then((img) => {
          if (img) ctx.drawImage(img, tx * TILE - originX, ty * TILE - originY, TILE, TILE);
        }),
      );
    }
  await Promise.all(jobs);

  try {
    return { dataUrl: canvas.toDataURL("image/png"), lat: centre.lat, lng: centre.lng, zoom, size, scale: 1 };
  } catch {
    /* a tile without CORS headers would taint the canvas — trace falls back */
    return null;
  }
};
