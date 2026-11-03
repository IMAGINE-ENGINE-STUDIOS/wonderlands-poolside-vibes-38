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
  unionRegions,

} from '@/utils/polygonGeometry';

export type P3 = P3Base;

/**
 * THE coping outer ring (Pool Geometry Fix step 4, 2026-11-03): every
 * surface that must meet the coping — the coping band itself, the deck
 * cut, the elevated outer wall / riser, the access stairs — derives its
 * outer edge from THIS function and nothing else: a mitred offset of the
 * one outline ring (miter limit 2.5, bevel fallback on sharper tips),
 * fold-sanitized by the shared boolean round-trip (a corner too tight for
 * the offset is smoothed/pinned there instead of folding or pinching).
 * Two parts built from two different rings is the root of every coping
 * break on record (Oct 29 grass slot, Nov 2 pinch, Nov 3 slit + tab) —
 * call this instead of offsetting a ring inline.
 */
export function copingOuterRingFor(ring: P3[], width: number): P3[] {
  if (!ring || ring.length < 3) return [];
  return sanitizeBoundary(mitredOffsetRing(ring, width, { miterLimit: 2.5 }).offset);
}

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

  // Tuck the deck slightly UNDER the coping band. Building the deck hole at the
  // exact coping outer edge left a hairline void between the two slabs (they sit
  // at different Y levels), which read as an empty gap in the 3D view.
  const seamOverlap = copingOffset > 0.001 ? Math.min(0.08, copingOffset * 0.25) : 0;
  const innerOffset = Math.max(0, copingOffset - seamOverlap);

  // Mitred offset — matches CopingGeometry EXACTLY (same helper, same miter limit),
  // so the deck hole never leaves an unpaved notch at a sharp pool tip the way the
  // rounded Minkowski offset did.
  let inner =
    innerOffset > 0.001
      ? sanitizeBoundary(mitredOffsetRing(pool, innerOffset, { miterLimit: 2.5 }).offset)
      : sanitizeBoundary(pool);
  if (inner.length < 3) inner = pool;


  if (!polygonContainsPolygon(inner, pool)) {
    if (pool.length <= 64) {
      // Sparse (hand-authored Studio) rings: the original exact fallback,
      // unchanged — its boolean cost is trivial at this size.
      const grown = offsetPolygonSingle(pool, Math.max(copingOffset, 0.15) + 0.05);
      inner = grown.length >= 3 ? grown : pool;
    } else {
      // Trace-density rings: the mitred inner undershoots the pool by
      // ~0.1 ft around tight traced arcs, and the exact rounded offset
      // that used to repair it costs seconds here (its ~2N-piece union
      // was profiled as the most expensive call in a scene commit — and
      // can fail outright at this density, silently returning the pool).
      // Repair by unioning the pool into the mitred inner instead: one
      // two-ring union, and the largest region's outer ring contains the
      // pool. If the union yields nothing usable, keep the mitred inner:
      // every deck built from these boundaries also subtracts the pool
      // itself (buildDeckRingGeometry's exclude), so no paver can enter
      // the water either way, and the undershoot sits under the coping.
      const merged = unionRegions([pool, inner]);
      const best = merged.length
        ? merged.reduce((a, b) => (polygonArea(b[0]) > polygonArea(a[0]) ? b : a))[0]
        : null;
      if (best && best.length >= 3) inner = best;
    }
  }


  const innerArea = polygonArea(inner);
  const ringWidth = Math.max(minDeckWidth, deckWidth);

  let outer: P3[] | null = null;
  // Smooth mitred ring — continuous normals, no faceted caps (no saw marks).
  const smoothRing = (base: P3[], d: number) => {
    const r = sanitizeBoundary(mitredOffsetRing(base, d, { miterLimit: 2.5 }).offset);
    return r.length >= 3 ? r : offsetPolygonSingle(base, d);
  };

  if (hardscapePoints && hardscapePoints.length >= 3) {
    const candidate = sanitizeBoundary(hardscapePoints);
    if (candidate.length >= 3 && polygonArea(candidate) > innerArea * 1.02) {
      if (polygonContainsPolygon(candidate, inner)) {
        outer = candidate;
      } else {
        // The drawn deck slightly clips the coping: keep the user's shape and
        // union in a thin ring around the coping instead of discarding it.
        const merged = unionRegions([candidate, smoothRing(inner, 0.25)]);
        const best = merged.length
          ? merged.reduce((a, b) => (polygonArea(b[0]) > polygonArea(a[0]) ? b : a))[0]
          : null;
        if (best && best.length >= 3 && polygonContainsPolygon(best, inner)) outer = sanitizeBoundary(best);
      }
    }
  }

  if (!outer) outer = smoothRing(inner, Math.max(0.05, ringWidth - (copingOffset - innerOffset)));

  if (outer.length < 3 || polygonArea(outer) <= innerArea) {
    outer = offsetPolygonSingle(inner, ringWidth);
  }

  // Round off faceted curves on the outer edge (sharp design corners are kept).
  // A drawn outline is shared with the surface boolean engine. Moving it here
  // would open grass seams between independently owned but adjacent decks.
  if (!hardscapePoints?.length) {
    const smoothed = smoothCurvedRing(outer);
    if (smoothed.length >= 3 && polygonContainsPolygon(smoothed, inner)) outer = smoothed;
  }

  return { inner, outer };
}

/**
 * The pool outline ring every 3D part (shell, coping, deck, terrain, waterline)
 * is built from. An outline that is already sampled — at or above the dense
 * marker (DENSE_OUTLINE_MIN_POINTS in curveUtils, the same threshold
 * generateCurvedPoolPoints and densifyPoolOutline honour) — IS the curve:
 * re-curving it with Chaikin only manufactures micro-segments (~0.02 ft) whose
 * direction jitter the mitred offsets amplify into fold-pins and torn coping /
 * deck edges on trace-density outlines (Job V, 2026-11-03: Astoria 12 coping
 * pins 0 on the raw ring vs 28 after Chaikin). The gate is the SOURCE point
 * count, so a sparsely authored outline (a drawn pool's handful of control
 * points, however densely the curve sampler later expands them) keeps the
 * exact smoothing below, byte for byte.
 */
export function poolOutlineRing(ring: P3[], sourcePointCount: number): P3[] {
  const clean = dedupe(ring);
  if (sourcePointCount >= 64) return clean;
  return smoothCurvedRing(clean);
}

/**
 * Corner-preserving Chaikin smoothing + densify. Vertices whose turn is gentler
 * than `cornerDeg` are treated as part of a curve and rounded; real corners
 * (rectangle corners, sharp tips) are left exactly where they are. Removes the
 * visible flat segments on curved decks without moving straight edges.
 */
export function smoothCurvedRing(ring: P3[], iterations = 3, cornerDeg = 50): P3[] {
  let pts = dedupe(ring);
  if (pts.length < 4) return pts;
  const cosLimit = Math.cos((cornerDeg * Math.PI) / 180);
  for (let it = 0; it < iterations; it++) {
    // Dense rings (engineering traces and already-sampled curves) gain
    // nothing from further Chaikin subdivision — each pass mostly densifies
    // a curve that has already converged (later passes move points by
    // < 1/16 of the first pass's corner cut) — while every downstream
    // boolean and triangulation pays per vertex. Stop subdividing once the
    // ring is dense; sparse Studio rings sit far below this and smooth
    // exactly as before.
    if (pts.length > 768) break;
    const n = pts.length;
    const out: P3[] = [];
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
      const v1x = b.x - a.x, v1z = b.z - a.z, v2x = c.x - b.x, v2z = c.z - b.z;
      const l1 = Math.hypot(v1x, v1z), l2 = Math.hypot(v2x, v2z);
      const cos = l1 > 1e-6 && l2 > 1e-6 ? (v1x * v2x + v1z * v2z) / (l1 * l2) : 1;
      const isCorner = cos < cosLimit;
      const isStraight = cos > 0.99995;
      if (isCorner || isStraight) { out.push(b); continue; }
      out.push({ x: b.x * 0.75 + a.x * 0.25, z: b.z * 0.75 + a.z * 0.25 });
      out.push({ x: b.x * 0.75 + c.x * 0.25, z: b.z * 0.75 + c.z * 0.25 });
    }
    pts = out;
    if (pts.length > 2400) break;
  }
  return pts;
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
    maxEdgeLength: 1,
  });
}

/** Exact deck regions (outer ring + holes) — useful for area math and overlays. */
export function deckRegions(inner: P3[], outer: P3[], exclude?: P3[]) {
  const holes: P3[][] = [dedupe(inner)];
  const ex = dedupe(exclude || []);
  if (ex.length >= 3) holes.push(ex);
  return subtractRegions(dedupe(outer), holes.filter((h) => h.length >= 3));
}
