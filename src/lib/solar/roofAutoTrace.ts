// Wonderlands Solar — roof outline capture.
//
// Two ways to get a roof face without the reader drawing it:
//   1. Google Solar roof segments — measured planes with pitch, azimuth and
//      annual sunshine. Preferred whenever the address is covered.
//   2. Click-to-auto-trace on the aerial tile — a colour flood fill from the
//      clicked pixel, outlined and simplified into a polygon. Used where Solar
//      has no coverage, and always correctable by dragging the vertices.

import type { LatLng, RoofFace } from "./solarEngine";
import { pathAreaSqFt } from "./solarEngine";

/* ── 1. Google Solar segments ─────────────────────────────────────────── */

export interface SolarSegment {
  index: number;
  pitchDegrees: number;
  azimuthDegrees: number;
  areaMeters2: number;
  sunshineHours: number | null;
  center: { latitude: number; longitude: number } | null;
  boundingBox: { sw: { latitude: number; longitude: number }; ne: { latitude: number; longitude: number } } | null;
}

export interface BuildingInsights {
  covered: boolean;
  center?: { latitude: number; longitude: number };
  imageryDate?: { year: number; month: number; day: number } | null;
  maxSunshineHoursPerYear?: number | null;
  roofAreaMeters2?: number | null;
  segments?: SolarSegment[];
}

/**
 * Turns measured roof segments into faces. Google gives an axis-aligned bounding
 * box per plane, which is rotated to the plane's ridge direction so the outline
 * sits the way the roof actually runs, then scaled to the reported plan area.
 */
export const facesFromInsights = (insights: BuildingInsights): RoofFace[] => {
  const segments = (insights.segments ?? []).filter((s) => s.boundingBox && s.areaMeters2 > 3);
  return segments.map((s) => {
    const bb = s.boundingBox!;
    const cLat = s.center?.latitude ?? (bb.sw.latitude + bb.ne.latitude) / 2;
    const cLng = s.center?.longitude ?? (bb.sw.longitude + bb.ne.longitude) / 2;
    const halfLat = Math.abs(bb.ne.latitude - bb.sw.latitude) / 2 || 0.00004;
    const halfLng = Math.abs(bb.ne.longitude - bb.sw.longitude) / 2 || 0.00004;

    // the ridge runs across the slope direction
    const theta = ((s.azimuthDegrees + 90) * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const corners: [number, number][] = [
      [-halfLng, -halfLat],
      [halfLng, -halfLat],
      [halfLng, halfLat],
      [-halfLng, halfLat],
    ];
    const path: LatLng[] = corners.map(([dx, dy]) => ({
      lat: cLat + (dx * sin + dy * cos),
      lng: cLng + (dx * cos - dy * sin),
    }));

    const planArea = s.areaMeters2 * 10.7639 * Math.cos((s.pitchDegrees * Math.PI) / 180);
    const scaled = scalePathToArea(path, planArea);

    return {
      id: `auto-${s.index}`,
      path: scaled,
      planAreaSqFt: pathAreaSqFt(scaled),
      azimuthDeg: s.azimuthDegrees,
      pitchDeg: s.pitchDegrees,
      shadeFactor: 0,
      measuredSunshineHours: s.sunshineHours,
      source: "auto" as const,
    };
  });
};

/** Grows or shrinks a ring about its centroid until it measures the given area. */
const scalePathToArea = (path: LatLng[], targetSqFt: number): LatLng[] => {
  const current = pathAreaSqFt(path);
  if (!current || !targetSqFt) return path;
  const k = Math.sqrt(targetSqFt / current);
  const cLat = path.reduce((n, p) => n + p.lat, 0) / path.length;
  const cLng = path.reduce((n, p) => n + p.lng, 0) / path.length;
  return path.map((p) => ({ lat: cLat + (p.lat - cLat) * k, lng: cLng + (p.lng - cLng) * k }));
};

/* ── 2. Click-to-auto-trace on the aerial tile ────────────────────────── */

/** Web Mercator helpers for a static map of known centre, zoom and scale. */
export interface TileFrame {
  dataUrl: string;
  lat: number;
  lng: number;
  zoom: number;
  /** CSS pixels of the square tile (before scale) */
  size: number;
  scale: number;
}

const TILE = 256;

const project = (lat: number, lng: number) => {
  const siny = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  return {
    x: TILE * (0.5 + lng / 360),
    y: TILE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
  };
};

const unproject = (x: number, y: number) => {
  const lng = (x / TILE - 0.5) * 360;
  const n = Math.PI * (1 - (2 * y) / TILE);
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
};

/** Pixel (in the returned bitmap, i.e. scaled) → lat/lng. */
export const tilePixelToLatLng = (frame: TileFrame, px: number, py: number): LatLng => {
  const s = 2 ** frame.zoom;
  const centre = project(frame.lat, frame.lng);
  const half = (frame.size * frame.scale) / 2;
  const worldX = centre.x + (px - half) / (s * frame.scale);
  const worldY = centre.y + (py - half) / (s * frame.scale);
  return unproject(worldX, worldY);
};

/** lat/lng → pixel in the returned bitmap. */
export const latLngToTilePixel = (frame: TileFrame, at: LatLng): { x: number; y: number } => {
  const s = 2 ** frame.zoom;
  const centre = project(frame.lat, frame.lng);
  const p = project(at.lat, at.lng);
  const half = (frame.size * frame.scale) / 2;
  return {
    x: half + (p.x - centre.x) * s * frame.scale,
    y: half + (p.y - centre.y) * s * frame.scale,
  };
};

const loadBitmap = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The aerial tile could not be read."));
    img.src = dataUrl;
  });

/**
 * Flood fills the roof face under the clicked point and returns its outline.
 *
 * Roof planes on an aerial photo read as one broad tone bounded by ridge lines,
 * gutters and shadow, so a tolerance fill from the click lands on the face and
 * stops at those edges. The filled mask is walked for its boundary, reduced by
 * a coarse angular hull and returned in geographic coordinates. Returns null
 * when the fill runs away (too large — a click on grass or a driveway).
 */
export const autoTraceAt = async (
  frame: TileFrame,
  click: LatLng,
  tolerance = 26,
): Promise<LatLng[] | null> => {
  const img = await loadBitmap(frame.dataUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const start = latLngToTilePixel(frame, click);
  const sx = Math.round(start.x);
  const sy = Math.round(start.y);
  if (sx < 1 || sy < 1 || sx >= w - 1 || sy >= h - 1) return null;

  const at = (x: number, y: number) => (y * w + x) * 4;
  const seed = at(sx, sy);
  const sr = data[seed];
  const sg = data[seed + 1];
  const sb = data[seed + 2];

  const mask = new Uint8Array(w * h);
  const stack: number[] = [sx, sy];
  let filled = 0;
  const limit = Math.floor(w * h * 0.35);

  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    const idx = y * w + x;
    if (mask[idx]) continue;
    const o = idx * 4;
    const d = Math.abs(data[o] - sr) + Math.abs(data[o + 1] - sg) + Math.abs(data[o + 2] - sb);
    if (d > tolerance * 3) continue;
    mask[idx] = 1;
    if (++filled > limit) return null; // ran off the roof
    if (x > 0) stack.push(x - 1, y);
    if (x < w - 1) stack.push(x + 1, y);
    if (y > 0) stack.push(x, y - 1);
    if (y < h - 1) stack.push(x, y + 1);
  }

  if (filled < 400) return null; // too small to be a roof face

  /* boundary points of the mask, then a 24-spoke hull about the centroid so the
     outline comes back as a handful of draggable vertices rather than thousands */
  let cx = 0;
  let cy = 0;
  const edge: [number, number][] = [];
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      cx += x;
      cy += y;
      if (!mask[i - 1] || !mask[i + 1] || !mask[i - w] || !mask[i + w]) edge.push([x, y]);
    }
  cx /= filled;
  cy /= filled;

  const spokes = 24;
  const best: ([number, number] | null)[] = Array.from({ length: spokes }, () => null);
  const bestR = new Array(spokes).fill(-1);
  for (const [x, y] of edge) {
    const a = Math.atan2(y - cy, x - cx);
    const k = Math.floor((((a + Math.PI) / (2 * Math.PI)) * spokes) % spokes);
    const r = Math.hypot(x - cx, y - cy);
    if (r > bestR[k]) {
      bestR[k] = r;
      best[k] = [x, y];
    }
  }

  const ring = best.filter(Boolean) as [number, number][];
  if (ring.length < 6) return null;
  return ring.map(([x, y]) => tilePixelToLatLng(frame, x, y));
};

/** A plain rectangle around a point — the last-resort starting outline. */
export const rectangleAround = (at: LatLng, widthFt = 40, depthFt = 28): LatLng[] => {
  const dLat = depthFt / 364000;
  const dLng = widthFt / (364000 * Math.cos((at.lat * Math.PI) / 180));
  return [
    { lat: at.lat - dLat / 2, lng: at.lng - dLng / 2 },
    { lat: at.lat - dLat / 2, lng: at.lng + dLng / 2 },
    { lat: at.lat + dLat / 2, lng: at.lng + dLng / 2 },
    { lat: at.lat + dLat / 2, lng: at.lng - dLng / 2 },
  ];
};

/**
 * The slope direction of a traced face, guessed from its shape: a roof plane
 * slopes across its short axis, and in Florida the sunward half of the building
 * is the safer assumption, so the southerly of the two normals is returned.
 */
export const guessAzimuth = (path: LatLng[]): number => {
  if (path.length < 3) return 180;
  let longest = 0;
  let angle = 0;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const dx = (b.lng - a.lng) * Math.cos((a.lat * Math.PI) / 180);
    const dy = b.lat - a.lat;
    const len = Math.hypot(dx, dy);
    if (len > longest) {
      longest = len;
      angle = (Math.atan2(dx, dy) * 180) / Math.PI;
    }
  }
  const normals = [(angle + 90 + 360) % 360, (angle - 90 + 360) % 360];
  return normals.reduce((best, n) =>
    Math.abs(((n - 180 + 540) % 360) - 180) < Math.abs(((best - 180 + 540) % 360) - 180) ? n : best,
  );
};
