/**
 * True overlap logic — the cropping engine for the site sheet.
 *
 * A designer draws the way a builder builds: the paver deck is drawn as one
 * generous field, then the pool, the spa and the tanning ledge are dropped on
 * top of it. On paper those elements overlap. In reality the deck is *cut* around
 * them: no paver is laid inside the shell, no turf is rolled under the spa.
 *
 * This module performs that cut as a real polygon boolean (difference), so:
 *   · the sheet paints the deck with a hole exactly where the shell sits,
 *   · the SF printed on the element is the NET field the crew will install,
 *   · elements may overlap freely while the take-off stays honest.
 *
 * Trade order is fixed by how a site is actually built: water and structures win
 * over surfaces, and hard surfaces win over soft ones.
 */

import polygonClipping from 'polygon-clipping';

export type CropPt = { x: number; y: number };
export type Ring = CropPt[];

/**
 * Cutting order. A layer is cut by every layer with a STRICTLY LOWER rank that
 * overlaps it. Water and structures (rank 0) cut everything; hard surfaces cut
 * soft ones; the lot line and linear runs are never cut.
 */
const CUT_RANK: Record<string, number> = {
  pool: 0,
  spa: 0,
  ledge: 0,
  building: 0,
  equipment: 1,
  driveway: 2,
  patio: 3,
  deck: 3,
  gravel: 4,
  turf: 5,
  solar: 99, // sits above, on the roof plane — never cuts the ground
  enclosure: 99, // a cage encloses, it does not remove surface
  property: 99,
  fence: 99,
};

/** Layers whose printed area and painted fill are net of what sits on them. */
export const CROPPABLE_LAYERS = new Set(['patio', 'deck', 'turf', 'gravel', 'driveway']);

export const cutsThrough = (cutterLayer: string, targetLayer: string) => {
  const a = CUT_RANK[cutterLayer] ?? 99;
  const b = CUT_RANK[targetLayer] ?? 99;
  return a < b && a !== 99;
};

const toGeom = (ring: Ring): [number, number][][] => [
  [...ring.map(p => [p.x, p.y] as [number, number]), [ring[0].x, ring[0].y] as [number, number]],
];

/** polygon-clipping returns MultiPolygon: polygon → [outer, ...holes] → ring. */
const fromGeom = (geom: unknown): Ring[][] => {
  const out: Ring[][] = [];
  const polys = (geom as [number, number][][][]) ?? [];
  for (const poly of polys) {
    const rings: Ring[] = [];
    for (const ring of poly) {
      if (!ring || ring.length < 4) continue;
      const pts = ring.slice(0, -1).map(([x, y]) => ({ x, y }));
      if (pts.length > 2) rings.push(pts);
    }
    if (rings.length) out.push(rings);
  }
  return out;
};

const bbox = (ring: Ring) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of ring) {
    if (p.x < x0) x0 = p.x;
    if (p.y < y0) y0 = p.y;
    if (p.x > x1) x1 = p.x;
    if (p.y > y1) y1 = p.y;
  }
  return { x0, y0, x1, y1 };
};

const overlaps = (a: Ring, b: Ring) => {
  const m = bbox(a), n = bbox(b);
  return m.x0 <= n.x1 && n.x0 <= m.x1 && m.y0 <= n.y1 && n.y0 <= m.y1;
};

/** Signed shoelace area of a ring, in the ring's own units (px²). */
export const ringArea = (ring: Ring) => {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j].x * ring[i].y - ring[i].x * ring[j].y;
  return Math.abs(a) / 2;
};

/** A cropped element: one or more polygons, each `[outer, ...holes]`. */
export type CroppedShape = Ring[][];

/**
 * Cut `target` by every cutter that sits on it.
 *
 * Returns the surviving polygons — a deck cut by a pool comes back as one outer
 * ring plus one hole, a deck split in two by a lap pool comes back as two
 * polygons. Cheap bbox rejection runs first, so a sheet with dozens of elements
 * stays interactive.
 */
export function cropRing(target: Ring, cutters: Ring[]): CroppedShape {
  if (target.length < 3) return [[target]];
  const live = cutters.filter(c => c.length > 2 && overlaps(target, c));
  if (!live.length) return [[target]];
  try {
    const result = polygonClipping.difference(toGeom(target), ...live.map(toGeom));
    const polys = fromGeom(result);
    return polys.length ? polys : [[target]];
  } catch {
    /* degenerate geometry (a self-touching trace mid-drag) — draw it uncut
       rather than dropping the element off the sheet */
    return [[target]];
  }
}

/** Net area of a cropped element: every outer ring, less its holes, in px². */
export function netArea(shape: CroppedShape): number {
  return shape.reduce((sum, rings) => {
    if (!rings.length) return sum;
    const outer = ringArea(rings[0]);
    const holes = rings.slice(1).reduce((h, r) => h + ringArea(r), 0);
    return sum + Math.max(0, outer - holes);
  }, 0);
}

/** Flat list of rings, for tracing on a canvas with an even-odd fill. */
export const cropRings = (shape: CroppedShape): Ring[] => shape.flat();
