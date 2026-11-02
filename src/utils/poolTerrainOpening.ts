/** Exact grass openings, including concave curves. Copyright Imagine Engine Studios Corp. */
import {
  mitredOffsetRing,
  offsetPolygon,
  polygonArea,
  unionRegions,
  type Pt,
} from './polygonGeometry';

/**
 * Rings at or below this size keep the original exact boolean path bit-for-bit
 * (hand-authored Design Studio outlines stay in that class — their boolean
 * cost is trivial). Denser rings are engineering-trace density: the exact
 * union of ~2N rounded-cap pieces was profiled at tens of seconds per scene
 * commit (polygon-clipping's exact-rational sweep over 36 cap segments per
 * vertex), freezing phone-class CPUs until WebKit killed the renderer. For
 * those, the opening is the pool unioned with the same constant-width mitred
 * offset the coping and deck already use in this engine (mitredOffsetRing):
 * a single two-ring union (~30 ms measured) instead of a ~2N-piece one.
 * Containment is guaranteed by construction — the pool is a union operand —
 * which matters: a bare mitred ring locally undershoots the true offset by
 * up to ~0.1 ft around tight traced arcs (the spa neck on Astoria 14), so it
 * is never trusted on its own. The union result is sanity-checked on area
 * and the exact path runs if anything is off.
 */
const EXACT_PATH_MAX_POINTS = 64;

/**
 * Value-keyed memo. Scene components re-render with fresh array identities on
 * unrelated state changes (a finish switch hands the terrain a new
 * poolPosition literal, invalidating its useMemo), but the opening is a pure
 * function of ring + tuck — so cache on values, not identity. Without this, a
 * finish switch rebuilt the whole opening. Bounded LRU.
 */
const CACHE_MAX = 8;
const cache = new Map<string, Pt[][][]>();

function ringKey(ring: Pt[], tuck: number): string {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < ring.length; i++) {
    h1 = (Math.imul(h1, 31) + Math.round(ring[i].x * 512)) | 0;
    h2 = (Math.imul(h2, 37) + Math.round(ring[i].z * 512)) | 0;
  }
  return `${tuck}|${ring.length}|${h1}|${h2}`;
}

function exactOpening(pool: Pt[], tuck: number): Pt[][][] {
  // Centroid-directed normals turn inward at concavities; keep raw water in the union.
  return unionRegions([pool, ...offsetPolygon(pool, Math.max(0, tuck))]);
}

const regionArea = (regions: Pt[][][]): number =>
  regions.reduce(
    (s, r) => s + polygonArea(r[0]) - r.slice(1).reduce((s2, h) => s2 + polygonArea(h), 0),
    0
  );

export function poolTerrainOpening(pool: Pt[], tuck: number): Pt[][][] {
  if (pool.length < 3) return [];
  const key = ringKey(pool, tuck);
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }

  const t = Math.max(0, tuck);
  let result: Pt[][][];
  if (pool.length <= EXACT_PATH_MAX_POINTS || t < 1e-6) {
    result = exactOpening(pool, t);
  } else {
    let perimeter = 0;
    for (let i = 0; i < pool.length; i++) {
      const a = pool[i];
      const b = pool[(i + 1) % pool.length];
      perimeter += Math.hypot(b.x - a.x, b.z - a.z);
    }
    const band = perimeter * t;
    const poolArea = polygonArea(pool);
    // Miter limit 1.5 (tighter than the coping/deck 2.5): at the outline's
    // few real corners a full miter spikes up to (limit-1)*t past the exact
    // rounded offset; 1.5 caps that at 0.5*t — still tucked under the 1 ft
    // coping — and bevels the rest, which undershoot by even less.
    const grown = mitredOffsetRing(pool, t, { miterLimit: 1.5 }).offset;
    let fast: Pt[][][] | null = null;
    if (grown.length >= 3) {
      try {
        const u = unionRegions([pool, grown]);
        const area = regionArea(u);
        // Gross-error tripwire: the exact offset's area is poolArea + band +
        // PI*t^2 (round caps); the mitred union lands within ~1% of it on
        // real outlines (532.7 vs 528.5 measured on Astoria 14).
        if (u.length && area >= poolArea && area <= poolArea + band * 1.3 + Math.PI * t * t) {
          fast = u;
        }
      } catch {
        fast = null;
      }
    }
    result = fast ?? exactOpening(pool, t);
  }

  cache.set(key, result);
  if (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return result;
}
