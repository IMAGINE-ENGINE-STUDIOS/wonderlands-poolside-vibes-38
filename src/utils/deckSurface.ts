import * as THREE from 'three';
import { generateOffsetCurve } from '@/utils/curveUtils';
import {
  calculatePolygonArea,
  ensureCounterClockwise,
  ensureClockwise,
  validateAndRepairPolygon,
} from '@/utils/shapeValidation';

export type P3 = { x: number; z: number };

const to2D = (pts: P3[]) => pts.map((p) => ({ x: p.x, y: p.z }));
const to3D = (pts: Array<{ x: number; y: number }>) => pts.map((p) => ({ x: p.x, z: p.y }));

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
  const inner = sanitizeBoundary(generateOffsetCurve(poolCurve, copingOffset));
  const innerArea = Math.abs(calculatePolygonArea(to2D(inner)));

  const fallbackOuter = () =>
    sanitizeBoundary(
      generateOffsetCurve(poolCurve, copingOffset + Math.max(minDeckWidth, deckWidth))
    );

  let outer: P3[] | null = null;

  if (hardscapePoints && hardscapePoints.length >= 3) {
    const candidate = sanitizeBoundary(hardscapePoints);
    const candidateArea = Math.abs(calculatePolygonArea(to2D(candidate)));
    // Only trust the 2D hardscape outline when it genuinely encloses the coping edge.
    if (candidate.length >= 3 && candidateArea > innerArea * 1.02) {
      outer = candidate;
    }
  }

  if (!outer) outer = fallbackOuter();

  // Absolute safety net: outer must be larger than inner, otherwise the ring is degenerate.
  if (Math.abs(calculatePolygonArea(to2D(outer))) <= innerArea) {
    outer = sanitizeBoundary(generateOffsetCurve(inner, Math.max(minDeckWidth, deckWidth)));
  }

  return { inner, outer };
}

/** Build a closed THREE.Path from a polygon (used for shape holes). */
function pathFrom(points: Array<{ x: number; y: number }>): THREE.Path {
  const path = new THREE.Path();
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) path.lineTo(points[i].x, points[i].y);
  path.closePath();
  return path;
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
 */
export function buildDeckRingGeometry(
  inner: P3[],
  outer: P3[],
  topY: number,
  bottomY: number
): THREE.BufferGeometry {
  if (!inner || inner.length < 3 || !outer || outer.length < 3) {
    return new THREE.BufferGeometry();
  }

  const parts: THREE.BufferGeometry[] = [];
  try {
    parts.push(ringFace(inner, outer, topY, false));
    parts.push(ringFace(inner, outer, bottomY, true));
  } catch (e) {
    console.warn('deckSurface: ring face triangulation failed, using skirts only', e);
  }
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

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;
}
