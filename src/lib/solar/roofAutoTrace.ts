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

/** Feet per bitmap pixel for a frame — Web Mercator ground resolution. */
export const feetPerPixel = (frame: TileFrame): number => {
  const mPerPx =
    (156543.03392 * Math.cos((frame.lat * Math.PI) / 180)) / 2 ** frame.zoom / frame.scale;
  return mPerPx * 3.28084;
};

export interface TraceResult {
  path: LatLng[] | null;
  /** Set when the capture was refused, with the reason to show the reader */
  rejected?: string;
}

const luma = (d: Uint8ClampedArray, o: number) => 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];

/**
 * Magnet for hand tracing.
 *
 * A dropped vertex rarely lands exactly on the roof edge. This looks in a small
 * window around the drop point for the pixel with the strongest luminance
 * gradient — a ridge, a gutter, a hip or the wall shadow line — and returns that
 * coordinate instead, biased towards the click so a clean click is not dragged
 * far. Returns the original point when nothing distinct is nearby.
 */
export const snapVertexToEdge = async (
  frame: TileFrame,
  at: LatLng,
  radiusPx = 9,
): Promise<LatLng> => {
  try {
    const img = await loadBitmap(frame.dataUrl);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return at;
    ctx.drawImage(img, 0, 0);

    const seed = latLngToTilePixel(frame, at);
    const sx = Math.round(seed.x);
    const sy = Math.round(seed.y);
    if (sx < 2 || sy < 2 || sx > w - 3 || sy > h - 3) return at;

    const x0 = Math.max(1, sx - radiusPx);
    const y0 = Math.max(1, sy - radiusPx);
    const x1 = Math.min(w - 2, sx + radiusPx);
    const y1 = Math.min(h - 2, sy + radiusPx);
    const data = ctx.getImageData(x0 - 1, y0 - 1, x1 - x0 + 3, y1 - y0 + 3).data;
    const stride = x1 - x0 + 3;
    const lumaAt = (x: number, y: number) => luma(data, ((y - y0 + 1) * stride + (x - x0 + 1)) * 4);

    let best = { x: sx, y: sy, score: -1 };
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const gx = lumaAt(x + 1, y) - lumaAt(x - 1, y);
        const gy = lumaAt(x, y + 1) - lumaAt(x, y - 1);
        const grad = Math.hypot(gx, gy);
        /* pull towards the click: distance costs a little contrast */
        const dist = Math.hypot(x - sx, y - sy);
        const score = grad - dist * 2.2;
        if (score > best.score) best = { x, y, score };
      }
    }
    /* only move when the edge is genuinely distinct */
    if (best.score < 14) return at;
    return tilePixelToLatLng(frame, best.x, best.y);
  } catch {
    return at;
  }
};

/**
 * Captures the roof plane under a click as a clean, corner-accurate outline.
 *
 * 1. the seed colour is averaged over a small patch so one speckled shingle or a
 *    vent shadow cannot poison it;
 * 2. the region grows from the seed bounded by a hard ground radius (so it can
 *    never reach the street), an area guard and a luminance-gradient brake that
 *    refuses to step across ridge lines, gutters and wall shadow;
 * 3. the mask is walked once, in order, for a single closed contour;
 * 4. the contour is reduced to corners (Douglas–Peucker at ground scale) and the
 *    edges are snapped to the two dominant roof directions;
 * 5. the candidate is accepted only when it measures like a roof plane.
 */
export const traceRoofPlane = async (
  frame: TileFrame,
  click: LatLng,
  opts: { maxRadiusFt?: number; tolerance?: number } = {},
): Promise<TraceResult> => {
  const img = await loadBitmap(frame.dataUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { path: null, rejected: "The aerial photo could not be sampled." };
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const ftPerPx = feetPerPixel(frame);
  const maxRadiusFt = opts.maxRadiusFt ?? 70;
  const radiusPx = Math.max(12, Math.round(maxRadiusFt / ftPerPx));

  const start = latLngToTilePixel(frame, click);
  const sx = Math.round(start.x);
  const sy = Math.round(start.y);
  if (sx < 2 || sy < 2 || sx >= w - 2 || sy >= h - 2)
    return { path: null, rejected: "Click inside the aerial view." };

  const at = (x: number, y: number) => (y * w + x) * 4;

  /* ── 1. seed colour + local variance, averaged over a 7×7 patch ── */
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let n = 0;
  for (let y = sy - 3; y <= sy + 3; y++)
    for (let x = sx - 3; x <= sx + 3; x++) {
      const o = at(Math.max(0, Math.min(w - 1, x)), Math.max(0, Math.min(h - 1, y)));
      sr += data[o];
      sg += data[o + 1];
      sb += data[o + 2];
      n++;
    }
  sr /= n;
  sg /= n;
  sb /= n;

  /* variance in the same patch drives the colour tolerance — uniform roofs
     (shingle, metal) get a tighter gate, mottled tiles get more room. */
  let vr = 0;
  let vg = 0;
  let vb = 0;
  for (let y = sy - 3; y <= sy + 3; y++)
    for (let x = sx - 3; x <= sx + 3; x++) {
      const o = at(Math.max(0, Math.min(w - 1, x)), Math.max(0, Math.min(h - 1, y)));
      vr += (data[o] - sr) ** 2;
      vg += (data[o + 1] - sg) ** 2;
      vb += (data[o + 2] - sb) ** 2;
    }
  const std = Math.sqrt((vr + vg + vb) / (3 * n));
  const baseTol = (opts.tolerance ?? 32) * 2.5;
  const tol = Math.min(120, Math.max(40, baseTol + std * 1.5));

  /* ── 2. bounded, edge-aware region grow ── */
  const gradientLimit = Math.max(24, 60 - std * 0.8); // lower on textured roofs
  const mask = new Uint8Array(w * h);
  const stack: number[] = [sx, sy];
  let filled = 0;
  const areaLimitPx = Math.floor(4500 / (ftPerPx * ftPerPx)); // ~4500 sq ft plane cap
  let minX = sx;
  let maxX = sx;
  let minY = sy;
  let maxY = sy;

  const x0 = Math.max(1, sx - radiusPx);
  const x1 = Math.min(w - 2, sx + radiusPx);
  const y0 = Math.max(1, sy - radiusPx);
  const y1 = Math.min(h - 2, sy + radiusPx);

  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const idx = y * w + x;
    if (mask[idx]) continue;
    const o = idx * 4;
    const d = Math.abs(data[o] - sr) + Math.abs(data[o + 1] - sg) + Math.abs(data[o + 2] - sb);
    if (d > tol) continue;
    // gradient brake — do not step across a hard edge
    const gx = Math.abs(luma(data, at(Math.min(w - 1, x + 1), y)) - luma(data, at(Math.max(0, x - 1), y)));
    const gy = Math.abs(luma(data, at(x, Math.min(h - 1, y + 1))) - luma(data, at(x, Math.max(0, y - 1))));
    if (Math.hypot(gx, gy) > gradientLimit && (x !== sx || y !== sy)) continue;

    mask[idx] = 1;
    filled++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (filled > areaLimitPx)
      return { path: null, rejected: "That fill ran past the roof — click nearer the middle of one plane." };
    stack.push(x - 1, y, x + 1, y, x, y - 1, x, y + 1);
  }

  const minAreaPx = Math.max(120, Math.floor(80 / (ftPerPx * ftPerPx)));
  if (filled < minAreaPx)
    return { path: null, rejected: "No roof plane read there — click nearer the middle of a plane." };

  /* runaway guard: a region pressed against the radius on both axes is not a plane */
  const spread = (maxX - minX) / (2 * radiusPx) + (maxY - minY) / (2 * radiusPx);
  if (spread > 1.75)
    return { path: null, rejected: "That area reads as ground, not roof — click on the roof itself." };

  /* ── 3. one ordered closed contour (Moore boundary tracing) ── */
  const contour = traceContour(mask, w, h, minX, minY, maxX, maxY);
  if (!contour || contour.length < 8)
    return { path: null, rejected: "The plane edge could not be read — trace it by hand." };

  /* ── 4. corners ── */
  const epsilonPx = Math.max(2, 1.5 / ftPerPx);
  let ring = simplify(contour, epsilonPx);
  ring = snapToDominantAngles(ring, epsilonPx);
  ring = dropShortEdges(ring, Math.max(3, 3 / ftPerPx));

  /* ── 5. validate, with oriented-rectangle fallback ── */
  const tooFew = ring.length < 4;
  const tooMany = ring.length > 12;
  const polyArea = Math.abs(shoelace(ring));
  const areaRatio = polyArea / filled;
  const bbw = maxX - minX + 1;
  const bbh = maxY - minY + 1;
  const stripLike = Math.max(bbw, bbh) / Math.max(1, Math.min(bbw, bbh)) > 8;

  if (stripLike)
    return { path: null, rejected: "That reads as a strip, not a roof plane." };

  if (tooFew || tooMany || areaRatio < 0.45 || areaRatio > 1.25) {
    /* The fill found a real roof plane but its outline is messy. Return the
       oriented bounding box of the filled mask so the user can edit it. */
    const obb = orientedBoundingBox(mask, w, h, minX, minY, maxX, maxY);
    if (obb.length === 4) return { path: obb.map(([x, y]) => tilePixelToLatLng(frame, x, y)) };
    return { path: null, rejected: "That outline came back irregular — trace it by hand." };
  }

  return { path: ring.map(([x, y]) => tilePixelToLatLng(frame, x, y)) };
};

/** Back-compatible wrapper: the outline only, or null when refused. */
export const autoTraceAt = async (
  frame: TileFrame,
  click: LatLng,
  tolerance = 30,
): Promise<LatLng[] | null> => (await traceRoofPlane(frame, click, { tolerance })).path;

/* ── contour and polygon helpers ───────────────────────────────────────── */

type Pt = [number, number];

/** Moore-neighbour boundary trace of the mask, clockwise, from its top-left pixel. */
const traceContour = (
  mask: Uint8Array,
  w: number,
  h: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): Pt[] | null => {
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x] === 1;

  let startX = -1;
  let startY = -1;
  for (let y = minY; y <= maxY && startX < 0; y++)
    for (let x = minX; x <= maxX; x++)
      if (inside(x, y)) {
        startX = x;
        startY = y;
        break;
      }
  if (startX < 0) return null;

  const N: Pt[] = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ];
  const out: Pt[] = [];
  let cx = startX;
  let cy = startY;
  let dir = 6; // came from above
  const limit = 8 * (maxX - minX + maxY - minY + 8) * 4;

  do {
    out.push([cx, cy]);
    let moved = false;
    for (let k = 0; k < 8; k++) {
      const d = (dir + 5 + k) % 8; // start looking back-left of travel
      const nx = cx + N[d][0];
      const ny = cy + N[d][1];
      if (inside(nx, ny)) {
        cx = nx;
        cy = ny;
        dir = d;
        moved = true;
        break;
      }
    }
    if (!moved) break;
  } while ((cx !== startX || cy !== startY) && out.length < limit);

  return out.length > 7 ? out : null;
};

const shoelace = (ring: Pt[]): number => {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
};

/** Douglas–Peucker on a closed ring. */
const simplify = (ring: Pt[], eps: number): Pt[] => {
  if (ring.length < 4) return ring;
  /* split the ring at its two most distant points so the open-curve reduction
     cannot shortcut across the plane */
  let a = 0;
  let b = 0;
  let best = -1;
  for (let i = 0; i < ring.length; i += Math.max(1, Math.floor(ring.length / 64)))
    for (let j = i + 1; j < ring.length; j += Math.max(1, Math.floor(ring.length / 64))) {
      const d = (ring[i][0] - ring[j][0]) ** 2 + (ring[i][1] - ring[j][1]) ** 2;
      if (d > best) {
        best = d;
        a = i;
        b = j;
      }
    }
  const first = ring.slice(a, b + 1);
  const second = [...ring.slice(b), ...ring.slice(0, a + 1)];
  const reduced = [...dp(first, eps), ...dp(second, eps).slice(1, -1)];
  return dedupe(reduced);
};

const dp = (pts: Pt[], eps: number): Pt[] => {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  const len = Math.hypot(bx - ax, by - ay) || 1;
  let worst = 0;
  let index = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
    if (d > worst) {
      worst = d;
      index = i;
    }
  }
  if (worst <= eps) return [pts[0], pts[pts.length - 1]];
  return [...dp(pts.slice(0, index + 1), eps).slice(0, -1), ...dp(pts.slice(index), eps)];
};

const dedupe = (ring: Pt[]): Pt[] => {
  const out: Pt[] = [];
  for (const p of ring) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(last[0] - p[0], last[1] - p[1]) > 1) out.push(p);
  }
  if (out.length > 2) {
    const f = out[0];
    const l = out[out.length - 1];
    if (Math.hypot(f[0] - l[0], f[1] - l[1]) <= 1) out.pop();
  }
  return out;
};

/**
 * Roofs are built square: the edges of one plane run along two perpendicular
 * directions. The longest edge sets that grid and every edge within 22° of it
 * (or of its normal) is re-laid on the grid, which turns a slightly ragged fill
 * boundary into a clean plane without moving the real corners.
 */
const snapToDominantAngles = (ring: Pt[], eps: number): Pt[] => {
  if (ring.length < 4) return ring;
  let theta = 0;
  let longest = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len > longest) {
      longest = len;
      theta = Math.atan2(b[1] - a[1], b[0] - a[0]);
    }
  }
  const cos = Math.cos(-theta);
  const sin = Math.sin(-theta);
  const rot = (p: Pt): Pt => [p[0] * cos - p[1] * sin, p[0] * sin + p[1] * cos];
  const unrot = (p: Pt): Pt => [p[0] * cos + p[1] * sin, -p[0] * sin + p[1] * cos];

  const local = ring.map(rot);
  /* in the roof's own frame, an edge that is nearly axis-aligned is levelled */
  for (let i = 0; i < local.length; i++) {
    const a = local[i];
    const b = local[(i + 1) % local.length];
    const dx = Math.abs(b[0] - a[0]);
    const dy = Math.abs(b[1] - a[1]);
    if (dy < dx * 0.4 && dy < eps * 3) {
      const y = (a[1] + b[1]) / 2;
      a[1] = y;
      b[1] = y;
    } else if (dx < dy * 0.4 && dx < eps * 3) {
      const x = (a[0] + b[0]) / 2;
      a[0] = x;
      b[0] = x;
    }
  }
  return local.map(unrot);
};

/** Merges corners that sit closer together than a roof detail could be. */
const dropShortEdges = (ring: Pt[], minLen: number): Pt[] => {
  if (ring.length <= 4) return ring;
  const out: Pt[] = [];
  for (const p of ring) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(last[0] - p[0], last[1] - p[1]) >= minLen) out.push(p);
    else {
      last[0] = (last[0] + p[0]) / 2;
      last[1] = (last[1] + p[1]) / 2;
    }
  }
  return out.length >= 4 ? out : ring;
};


/**
 * Builds the oriented bounding box of a filled mask. The longest dimension of the
 * filled region sets the rectangle's axis; the result is a 4-corner roof plane the
 * reader can drag into shape when the raw contour is too noisy to use directly.
 */
const orientedBoundingBox = (
  mask: Uint8Array,
  w: number,
  h: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): Pt[] => {
  const pts: Pt[] = [];
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) if (mask[y * w + x]) pts.push([x, y]);
  if (pts.length < 4) return [];

  /* find the two most distant points -> the long axis */
  let a = 0;
  let b = 0;
  let best = -1;
  for (let i = 0; i < pts.length; i += Math.max(1, Math.floor(pts.length / 64)))
    for (let j = i + 1; j < pts.length; j += Math.max(1, Math.floor(pts.length / 64))) {
      const d = (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2;
      if (d > best) {
        best = d;
        a = i;
        b = j;
      }
    }

  const [ax, ay] = pts[a];
  const [bx, by] = pts[b];
  const theta = Math.atan2(by - ay, bx - ax);
  const cos = Math.cos(-theta);
  const sin = Math.sin(-theta);
  const rot = (p: Pt): Pt => [p[0] * cos - p[1] * sin, p[0] * sin + p[1] * cos];
  const unrot = (p: Pt): Pt => [p[0] * cos + p[1] * sin, -p[0] * sin + p[1] * cos];

  const local = pts.map(rot);
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  for (const [u, v] of local) {
    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }
  const corners: Pt[] = [
    [minU, minV],
    [maxU, minV],
    [maxU, maxV],
    [minU, maxV],
  ];
  return corners.map(unrot);
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
