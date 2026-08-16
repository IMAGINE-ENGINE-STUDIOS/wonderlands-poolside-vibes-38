import * as THREE from 'three';
import {
  Pt as P3Base,
  offsetPolygonSingle,
  offsetPolygon,
  polygonArea,
  pointInRing,
  buildSlabGeometry,
  subtractRegions,
  mitredOffsetRing,

} from '@/utils/polygonGeometry';

export type P3 = P3Base;

/**
 * Single source of truth for deck boundaries.
 *
 * The geometry is produced by exact polygon booleans (see polygonGeometry.ts):
 * the deck is literally `outerOutline - (poolOpening + coping)`, so a triangular
 * pool yields a perfectly triangular cutout and no paver triangle can ever land
 * inside the waterline.
 */

const dedupe = (points: P3[]): P3[] => {
  const out: P3[] = [];
  for (const p of points || []) {
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z)) continue;
    const last = out[out.length - 1];
    if (!last || Math.hypot(last.x - p.x, last.z - p.z) > 1e-4) out.push({ x: p.x, z: p.z });
  }
  while (out.length > 1) {
    const a = out[0];
    const b = out[out.length - 1];
    if (Math.hypot(a.x - b.x, a.z - b.z) <= 1e-4) out.pop();
    else break;
  }
  return out;
};

/**
 * Sanitize a boundary polygon. Self-intersections are resolved by a zero-width
 * boolean round-trip (dilate/erode), which preserves concave detail instead of
 * collapsing sharp shapes into a hull.
 */
export function sanitizeBoundary(points: P3[], _maxVertices = 160): P3[] {
  const clean = dedupe(points);
  if (clean.length < 3) return clean;
  const resolved = offsetPolygon(clean, 0);
  if (!resolved.length) return clean;
  return resolved.reduce((best, r) => (polygonArea(r) > polygonArea(best) ? r : best));
}

/** True when every vertex of `child` lies inside `parent`. */
function polygonContainsPolygon(parent: P3[], child: P3[]): boolean {
  if (!parent || parent.length < 3 || !child || child.length < 3) return false;
  return child.every((p) => pointInRing(p, parent));
}

/** Standard ray-casting point-in-polygon test (XZ plane). */
export function pointInPolygon(point: P3, polygon: P3[]): boolean {
  return pointInRing(point, polygon);
}

/**
 * Resolve the inner (coping edge) and outer (hardscape) deck boundaries.
 * The outer boundary is guaranteed to enclose the inner one.
 */
export function resolveDeckBoundaries(params: {
  poolCurve: P3[];
  hardscapePoints?: P3[];
  copingWidth: number;
  copingEnabled: boolean;
  deckWidth: number;
  minDeckWidth?: number;
}): { inner: P3[]; outer: P3[] } | null {
  const {
    poolCurve,
    hardscapePoints,
    copingWidth,
    copingEnabled,
    deckWidth,
    minDeckWidth = 0.5,
  } = params;

  const pool = dedupe(poolCurve);
  if (pool.length < 3) return null;

  const copingOffset = copingEnabled ? Math.max(0, copingWidth) : 0;

  // Mitred offset — matches CopingGeometry EXACTLY (same helper, same miter limit),
  // so the deck hole never leaves an unpaved notch at a sharp pool tip the way the
  // rounded Minkowski offset did.
  let inner =
    copingOffset > 0.001
      ? sanitizeBoundary(mitredOffsetRing(pool, copingOffset, { miterLimit: 2.5 }).offset)
      : sanitizeBoundary(pool);
  if (inner.length < 3) inner = pool;

  if (!polygonContainsPolygon(inner, pool)) {
    const grown = offsetPolygonSingle(pool, Math.max(copingOffset, 0.15) + 0.05);
    inner = grown.length >= 3 ? grown : pool;
  }


  const innerArea = polygonArea(inner);
  const ringWidth = Math.max(minDeckWidth, deckWidth);

  let outer: P3[] | null = null;
  if (hardscapePoints && hardscapePoints.length >= 3) {
    const candidate = sanitizeBoundary(hardscapePoints);
    if (
      candidate.length >= 3 &&
      polygonArea(candidate) > innerArea * 1.02 &&
      polygonContainsPolygon(candidate, inner)
    ) {
      outer = candidate;
    }
  }

  if (!outer) outer = offsetPolygonSingle(pool, copingOffset + ringWidth);

  if (outer.length < 3 || polygonArea(outer) <= innerArea) {
    outer = offsetPolygonSingle(inner, ringWidth);
  }

  return { inner, outer };
}

/**
 * Solid paved ring between an arbitrary inner and outer boundary, built with an
 * exact boolean difference. `exclude` (the raw pool opening) is subtracted too,
 * so water is never paved regardless of boundary inputs.
 */
export function buildDeckRingGeometry(
  inner: P3[],
  outer: P3[],
  topY: number,
  bottomY: number,
  exclude?: P3[]
): THREE.BufferGeometry {
  const innerClean = dedupe(inner);
  const outerClean = dedupe(outer);
  if (innerClean.length < 3 || outerClean.length < 3) return new THREE.BufferGeometry();

  const holes: P3[][] = [innerClean];
  const excludeClean = dedupe(exclude || []);
  if (excludeClean.length >= 3) holes.push(excludeClean);

  return buildSlabGeometry({
    subject: outerClean,
    holes,
    topY,
    bottomY,
    maxEdgeLength: 2,
  });
}

/** Exact deck regions (outer ring + holes) — useful for area math and overlays. */
export function deckRegions(inner: P3[], outer: P3[], exclude?: P3[]) {
  const holes: P3[][] = [dedupe(inner)];
  const ex = dedupe(exclude || []);
  if (ex.length >= 3) holes.push(ex);
  return subtractRegions(dedupe(outer), holes.filter((h) => h.length >= 3));
}
