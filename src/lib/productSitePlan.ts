/**
 * Default product drawing for every board.
 *
 * A board opened from a product dossier never starts empty: the product is
 * drawn to its published dimensions on the 2D studio grid (e.g. Milan — the
 * exact Milan contour at 14' x 30'), with its paver deck ring around it, so the
 * reader lands on a real plan they can immediately edit.
 */

import { getPoolModelShape } from "@/data/poolModelShapes";
import { findProductInfo } from "@/data/poolProductLookup";
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_PX_PER_FT,
  type SiteLayerId,
  type SitePlanData,
  type SiteShape,
} from "@/components/blueprint/SiteDrawingBoard";

export type Dims = { widthFt: number; lengthFt: number };

/** Pull "14' x 30'", "14ft x 30ft", "14 x 30" out of any descriptive string. */
export function parseDims(text?: string | null): Dims | null {
  if (!text) return null;
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:'|ft|feet)?\s*[x×by]{1,2}\s*(\d+(?:\.\d+)?)/i);
  if (!m) return null;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  if (!a || !b || a > 200 || b > 200) return null;
  return { widthFt: Math.min(a, b), lengthFt: Math.max(a, b) };
}

/** Published dimensions for a model, from its meta line or the product index. */
export function resolveDims(modelName?: string, meta?: string): Dims | null {
  return parseDims(meta) ?? parseDims(findProductInfo(modelName ?? "")?.dimensions) ?? null;
}

const roundedRect = (w: number, l: number, r = Math.min(w, l) * 0.16) => {
  const pts: { x: number; y: number }[] = [];
  const corners: Array<[number, number, number]> = [
    [w - r, r, -90],
    [w - r, l - r, 0],
    [r, l - r, 90],
    [r, r, 180],
  ];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= 4; i++) {
      const a = ((start + (i / 4) * 90) * Math.PI) / 180;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
  }
  return pts;
};

/** Offset a convex-ish outline outward by `ft` (deck ring around the shell). */
const outsetRing = (pts: { x: number; y: number }[], ft: number) => {
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return pts.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * ft, y: p.y + (dy / len) * ft };
  });
};

/** Which layer the product itself is drawn on. */
const PRODUCT_LAYER: Record<string, SiteLayerId> = {
  pools: "pool",
  "concrete-pools": "pool",
  spas: "pool",
  "tanning-ledges": "pool",
  finishes: "pool",
  liners: "pool",
  covers: "pool",
  saunas: "building",
  pavers: "deck",
  "artificial-grass": "gravel",
  landscaping: "gravel",
  lanai: "patio",
  "screen-enclosures": "patio",
  "patio-fencing": "fence",
  "driveway-gates": "driveway",
};

const DEFAULT_DIMS: Record<string, Dims> = {
  pools: { widthFt: 14, lengthFt: 28 },
  "concrete-pools": { widthFt: 16, lengthFt: 32 },
  spas: { widthFt: 7, lengthFt: 7 },
  "tanning-ledges": { widthFt: 8, lengthFt: 10 },
  saunas: { widthFt: 6, lengthFt: 8 },
  pavers: { widthFt: 20, lengthFt: 30 },
  "artificial-grass": { widthFt: 20, lengthFt: 25 },
  landscaping: { widthFt: 20, lengthFt: 25 },
  lanai: { widthFt: 14, lengthFt: 24 },
  "screen-enclosures": { widthFt: 20, lengthFt: 34 },
  "patio-fencing": { widthFt: 24, lengthFt: 34 },
  "driveway-gates": { widthFt: 12, lengthFt: 3 },
};

export type SeedInput = {
  categoryId: string;
  modelName?: string;
  meta?: string;
};

/**
 * Build the opening drawing for a product board — the product at real scale,
 * centred on the canvas, with its deck ring where a deck belongs.
 */
export function buildProductSitePlan({ categoryId, modelName, meta }: SeedInput): SitePlanData | null {
  const layer = PRODUCT_LAYER[categoryId] ?? "pool";
  const dims = resolveDims(modelName, meta) ?? DEFAULT_DIMS[categoryId] ?? null;
  if (!dims) return null;

  /* the exact manufacturer contour when we hold it, else a soft rectangle */
  const model = modelName ? getPoolModelShape(modelName) : undefined;
  let outline: { x: number; y: number }[];
  if (model?.points?.length) {
    const xs = model.points.map((p) => p.x);
    const ys = model.points.map((p) => p.y);
    const mw = Math.max(...xs) - Math.min(...xs) || 1;
    const ml = Math.max(...ys) - Math.min(...ys) || 1;
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    outline = model.points.map((p) => ({
      x: ((p.x - minX) / mw) * dims.widthFt,
      y: ((p.y - minY) / ml) * dims.lengthFt,
    }));
  } else {
    outline = roundedRect(dims.widthFt, dims.lengthFt);
  }

  /* fit the whole plan (product + 6 ft deck ring) inside the canvas */
  const deckFt = layer === "pool" ? 6 : 0;
  const planW = dims.widthFt + deckFt * 2;
  const planL = dims.lengthFt + deckFt * 2;
  const pxPerFt = +Math.min(
    24,
    Math.max(4, Math.min((CANVAS_W * 0.72) / planW, (CANVAS_H * 0.78) / planL)),
  ).toFixed(1);

  const originX = CANVAS_W / 2 - (dims.widthFt / 2) * pxPerFt;
  const originY = CANVAS_H / 2 - (dims.lengthFt / 2) * pxPerFt;
  const toPx = (p: { x: number; y: number }) => ({
    x: +(originX + p.x * pxPerFt).toFixed(1),
    y: +(originY + p.y * pxPerFt).toFixed(1),
  });

  const shapes: SiteShape[] = [];

  if (deckFt > 0) {
    shapes.push({
      id: `seed-deck-${categoryId}`,
      layer: "deck",
      points: outsetRing(outline, deckFt).map(toPx),
      closed: true,
      curves: model ? outline.map(() => true) : undefined,
    });
  }

  shapes.push({
    id: `seed-${layer}-${categoryId}`,
    layer,
    points: outline.map(toPx),
    closed: layer !== "fence",
    curves: model ? outline.map(() => true) : undefined,
  });

  return { shapes, pxPerFt: pxPerFt || DEFAULT_PX_PER_FT };
}

/** Human dimension line for the board header. */
export const dimsLabel = (d: Dims) => `${d.widthFt}′ × ${d.lengthFt}′`;
