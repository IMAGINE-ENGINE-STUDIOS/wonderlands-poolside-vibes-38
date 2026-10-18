/** Exact grass openings, including concave curves. Copyright Imagine Engine Studios Corp. */
import { offsetPolygon, unionRegions, type Pt } from './polygonGeometry';

export function poolTerrainOpening(pool: Pt[], tuck: number): Pt[][][] {
  if (pool.length < 3) return [];
  // Centroid-directed normals turn inward at concavities; keep raw water in the union.
  return unionRegions([pool, ...offsetPolygon(pool, Math.max(0, tuck))]);
}