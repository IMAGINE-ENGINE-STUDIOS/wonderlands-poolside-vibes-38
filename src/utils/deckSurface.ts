import * as THREE from 'three';
import { generateOffsetCurve } from '@/utils/curveUtils';
import {
  calculatePolygonArea,
  ensureCounterClockwise,
  ensureClockwise,
  validateAndRepairPolygon,
  hasSelfIntersections,
  simplifyPolygon,
  calculateConvexHull,
} from '@/utils/shapeValidation';

export type P3 = { x: number; z: number };

const to2D = (pts: P3[]) => pts.map((p) => ({ x: p.x, y: p.z }));
const to3D = (pts: Array<{ x: number; y: number }>) => pts.map((p) => ({ x: p.x, z: p.y }));

const area2D = (pts: P3[]) => Math.abs(calculatePolygonArea(to2D(pts)));

/**
 * A hole polygon MUST be simple (no self-intersections) or THREE/earcut silently
 * ignores it and fills the whole deck — which is what paved over the water.
 */
function makeSimple(points: P3[]): P3[] {
  if (points.length < 3) return points;
  if (!hasSelfIntersections(to2D(points))) return points;

  const simplified = to3D(simplifyPolygon(to2D(points), 0.15));
  if (simplified.length >= 3 && !hasSelfIntersections(to2D(simplified))) return simplified;

  // Convex hull is always simple; slightly larger hole is safe (never paves water).
  const hull = to3D(calculateConvexHull(to2D(points)));
  return hull.length >= 3 ? hull : points;
}


/**
 * Sanitize a boundary polygon: repair self-intersections, drop duplicates, keep CCW order.
 * Always returns a usable polygon (never empty when input has >= 3 points).
 */
export function sanitizeBoundary(points: P3[], maxVertices = 160): P3[] {
  if (!points || points.length < 3) return points || [];
  const repaired = validateAndRepairPolygon(to2D(points), {
    maxVertices,
    simplifyEpsilon: 0.05,
    fallbackToConvexHull: true,
    fallbackToBoundingBox: true,
  });
  const ccw = ensureCounterClockwise(repaired);
  return to3D(ccw);
}

/**
 * Resolve the inner (coping edge) and outer (hardscape) deck boundaries.
 * Guarantees the outer boundary always encloses the inner one, so the paved
 * surface can never leave an untextured gap around the pool.
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

  if (!poolCurve || poolCurve.length < 3) return null;

  const copingOffset = copingEnabled ? Math.max(0, copingWidth) : 0;
  let inner = makeSimple(sanitizeBoundary(generateOffsetCurve(poolCurve, copingOffset)));

  // HARD RULE: the deck hole must always fully contain the pool opening, otherwise
  // pavers would be drawn on top of the water surface.
  if (!polygonContainsPolygon(inner, poolCurve)) {
    const grown = makeSimple(
      sanitizeBoundary(generateOffsetCurve(poolCurve, Math.max(copingOffset, 0.25) + 0.1))
    );
    inner = polygonContainsPolygon(grown, poolCurve)
      ? grown
      : makeSimple(sanitizeBoundary(poolCurve));
  }

  // Final guarantee: a hole that still isn't simple would be dropped by the
  // triangulator, so fall back to the convex hull of the pool opening.
  if (hasSelfIntersections(to2D(inner))) {
    inner = to3D(calculateConvexHull(to2D(generateOffsetCurve(poolCurve, copingOffset))));
  }

  const innerArea = area2D(inner);

  const fallbackOuter = () =>
    makeSimple(
      sanitizeBoundary(generateOffsetCurve(poolCurve, copingOffset + Math.max(minDeckWidth, deckWidth)))
    );

  let outer: P3[] | null = null;

  if (hardscapePoints && hardscapePoints.length >= 3) {
    const candidate = makeSimple(sanitizeBoundary(hardscapePoints));
    const candidateArea = area2D(candidate);
    // Only trust the 2D hardscape outline when it genuinely encloses the coping edge
    // AND geometrically wraps around it (a shifted/offset outline would pave the water).
    if (
      candidate.length >= 3 &&
      candidateArea > innerArea * 1.02 &&
      polygonContainsPolygon(candidate, inner)
    ) {
      outer = candidate;
    }
  }

  if (!outer) outer = fallbackOuter();

  // Absolute safety net: outer must enclose inner, otherwise the ring is degenerate.
  if (area2D(outer) <= innerArea || !polygonContainsPolygon(outer, inner)) {
    outer = makeSimple(sanitizeBoundary(generateOffsetCurve(inner, Math.max(minDeckWidth, deckWidth))));
  }

  return { inner, outer };
}


/** Standard ray-casting point-in-polygon test (XZ plane). */
export function pointInPolygon(point: P3, polygon: P3[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const zi = polygon[i].z;
    const xj = polygon[j].x;
    const zj = polygon[j].z;
    const intersects =
      zi > point.z !== zj > point.z &&
      point.x < ((xj - xi) * (point.z - zi)) / (zj - zi || 1e-9) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** True when every vertex of `child` lies inside `parent`. */
function polygonContainsPolygon(parent: P3[], child: P3[]): boolean {
  if (!parent || parent.length < 3 || !child || child.length < 3) return false;
  return child.every((p) => pointInPolygon(p, parent));
}


/** Build a closed THREE.Path from a polygon (used for shape holes). */
function pathFrom(points: Array<{ x: number; y: number }>): THREE.Path {
  const path = new THREE.Path();
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) path.lineTo(points[i].x, points[i].y);
  path.closePath();
  return path;
}

/** Sum of the triangle areas of a flat (XZ) geometry — used to verify the hole survived. */
function geometryArea(geom: THREE.BufferGeometry): number {
  const pos = geom.getAttribute('position');
  const idx = geom.getIndex();
  if (!pos || !idx) return 0;
  let total = 0;
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i);
    const b = idx.getX(i + 1);
    const c = idx.getX(i + 2);
    total += Math.abs(
      (pos.getX(b) - pos.getX(a)) * (pos.getZ(c) - pos.getZ(a)) -
        (pos.getX(c) - pos.getX(a)) * (pos.getZ(b) - pos.getZ(a))
    ) / 2;
  }
  return total;
}

/** Horizontal ring face (outer polygon with an inner hole) triangulated by THREE. */
function ringFace(inner: P3[], outer: P3[], y: number, flip: boolean): THREE.BufferGeometry {
  const outer2D = ensureCounterClockwise(to2D(outer));
  const inner2D = ensureClockwise(to2D(inner));

  const shape = new THREE.Shape();
  shape.moveTo(outer2D[0].x, outer2D[0].y);
  for (let i = 1; i < outer2D.length; i++) shape.lineTo(outer2D[i].x, outer2D[i].y);
  shape.closePath();
  shape.holes.push(pathFrom(inner2D));

  const geom = new THREE.ShapeGeometry(shape);
  // ShapeGeometry lays out in XY with uv = (x, y) → perfect 1ft x 1ft world UVs.
  geom.rotateX(-Math.PI / 2);

  // If earcut silently dropped the hole, the face area equals the full outer area
  // and pavers would cover the pool. Reject so the caller can retry with a hull.
  const expected = area2D(outer) - area2D(inner);
  if (geometryArea(geom) > expected * 1.15 + 0.01) {
    geom.dispose();
    throw new Error('deck ring hole was dropped by triangulation');
  }

  if (flip) geom.rotateX(Math.PI);
  geom.translate(0, y, 0);
  return geom;
}


/** Vertical skirt along a boundary, UV mapped by perimeter distance (1ft grid). */
function skirt(boundary: P3[], topY: number, bottomY: number, outward: boolean): THREE.BufferGeometry {
  const n = boundary.length;
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let dist = 0;
  for (let i = 0; i < n; i++) {
    const p = boundary[i];
    vertices.push(p.x, topY, p.z, p.x, bottomY, p.z);
    uvs.push(dist, topY, dist, bottomY);
    const next = boundary[(i + 1) % n];
    dist += Math.hypot(next.x - p.x, next.z - p.z);
  }

  for (let i = 0; i < n; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = ((i + 1) % n) * 2;
    const d = c + 1;
    if (outward) {
      indices.push(a, c, b, b, c, d);
    } else {
      indices.push(a, b, c, b, d, c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  return geom;
}

/**
 * Build a solid paved ring (top face, bottom face and both skirts) between an
 * arbitrary inner and outer boundary. Point counts do not need to match.
 *
 * `exclude` (normally the raw pool opening) is an ABSOLUTE guarantee: any
 * triangle whose centroid falls inside it is discarded, so pavers can never be
 * drawn over the water even if the triangulator drops the hole.
 */
export function buildDeckRingGeometry(
  inner: P3[],
  outer: P3[],
  topY: number,
  bottomY: number,
  exclude?: P3[]
): THREE.BufferGeometry {
  if (!inner || inner.length < 3 || !outer || outer.length < 3) {
    return new THREE.BufferGeometry();
  }

  const parts: THREE.BufferGeometry[] = [];
  // Candidate holes, from most accurate to most forgiving. A slightly larger hole
  // is always preferable to a dropped hole (which would pave over the water).
  const holeCandidates: P3[][] = [inner, makeSimple(inner), to3D(calculateConvexHull(to2D(inner)))];

  let usedInner = inner;
  let built = false;

  for (const candidate of holeCandidates) {
    if (!candidate || candidate.length < 3) continue;
    try {
      const top = ringFace(candidate, outer, topY, false);
      const bottom = ringFace(candidate, outer, bottomY, true);
      parts.push(top, bottom);
      usedInner = candidate;
      built = true;
      break;
    } catch {
      // try the next, safer hole
    }
  }

  if (!built) {
    console.warn('deckSurface: ring face triangulation failed, using skirts only');
  }
  inner = usedInner;

  parts.push(skirt(outer, topY, bottomY, true));
  parts.push(skirt(inner, topY, bottomY, false));

  // Merge manually (avoids extra dependency and keeps attributes consistent).
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let offset = 0;

  for (const part of parts) {
    const pos = part.getAttribute('position');
    const uv = part.getAttribute('uv');
    if (!pos) continue;
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (uv) uvs.push(uv.getX(i), uv.getY(i));
      else uvs.push(0, 0);
    }
    const idx = part.getIndex();
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset);
    } else {
      for (let i = 0; i < pos.count; i++) indices.push(i + offset);
    }
    offset += pos.count;
    part.dispose();
  }

  // FINAL RULE: never any paver geometry over the pool opening.
  // Shrink the exclusion slightly so the ring edge itself is kept intact.
  const forbidden = exclude && exclude.length >= 3 ? sanitizeBoundary(generateOffsetCurve(exclude, -0.05)) : null;
  let finalIndices = indices;
  if (forbidden && forbidden.length >= 3) {
    finalIndices = [];
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * 3;
      const b = indices[i + 1] * 3;
      const c = indices[i + 2] * 3;
      const cx = (positions[a] + positions[b] + positions[c]) / 3;
      const cz = (positions[a + 2] + positions[b + 2] + positions[c + 2]) / 3;
      if (pointInPolygon({ x: cx, z: cz }, forbidden)) continue;
      finalIndices.push(indices[i], indices[i + 1], indices[i + 2]);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(finalIndices);
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;

}
