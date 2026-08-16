import { DepthAxis, LinearDepthAnchor, PerimeterDepthPoint, Point } from './types';

/** Absolute floor limits used everywhere (0 = zero-entry / beach edge). */
export const MIN_FLOOR_DEPTH = 0;
export const MAX_FLOOR_DEPTH = 12;

/**
 * Interpolates depth at a given position (0-1) along the depth axis
 * from linear depth anchors
 */
export function interpolateDepthFromAnchors(
  position: number,
  anchors: LinearDepthAnchor[]
): number {
  if (anchors.length === 0) return 6; // Default depth
  if (anchors.length === 1) return anchors[0].depth;

  const sorted = [...anchors].sort((a, b) => a.position - b.position);
  const clampedPos = Math.max(0, Math.min(1, position));

  // Find surrounding anchors
  for (let i = 0; i < sorted.length - 1; i++) {
    if (clampedPos >= sorted[i].position && clampedPos <= sorted[i + 1].position) {
      const span = sorted[i + 1].position - sorted[i].position;
      if (span <= 0) return sorted[i + 1].depth;
      const t = (clampedPos - sorted[i].position) / span;
      return sorted[i].depth + t * (sorted[i + 1].depth - sorted[i].depth);
    }
  }

  // Edge cases: before first or after last anchor
  if (clampedPos < sorted[0].position) return sorted[0].depth;
  return sorted[sorted.length - 1].depth;
}

/** Plan-space bounds of the pool outline (pool-point coordinates). */
export function getPoolBounds(poolPoints: Point[] | Array<{ x: number; z: number }>) {
  const xs: number[] = [];
  const zs: number[] = [];
  (poolPoints as any[]).forEach((p) => {
    xs.push(p.x);
    zs.push('z' in p ? p.z : p.y);
  });
  if (!xs.length) return { minX: -8, maxX: 8, minZ: -14, maxZ: 14, centerX: 0, centerZ: 0 };
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  return { minX, maxX, minZ, maxZ, centerX: (minX + maxX) / 2, centerZ: (minZ + maxZ) / 2 };
}

/**
 * Default depth axis: runs edge to edge along the pool's longer dimension,
 * through its centre. Expressed in centred (normalised) plan feet so it lines
 * up with the geometry the 3D scene builds.
 */
export function createDefaultDepthAxis(
  poolPoints: Point[] = [],
  poolDimensions?: { length: number; width: number }
): DepthAxis {
  let halfLength = 14;
  let halfWidth = 8;
  if (poolPoints.length >= 3) {
    const b = getPoolBounds(poolPoints);
    halfWidth = (b.maxX - b.minX) / 2;
    halfLength = (b.maxZ - b.minZ) / 2;
  } else if (poolDimensions) {
    halfWidth = poolDimensions.width / 2;
    halfLength = poolDimensions.length / 2;
  }
  return halfLength >= halfWidth
    ? { start: { x: 0, z: -halfLength }, end: { x: 0, z: halfLength } }
    : { start: { x: -halfWidth, z: 0 }, end: { x: halfWidth, z: 0 } };
}

/** 0-1 position of a plan point projected onto the depth axis. */
export function positionAlongAxis(x: number, z: number, axis: DepthAxis): number {
  const dx = axis.end.x - axis.start.x;
  const dz = axis.end.z - axis.start.z;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return 0;
  const t = ((x - axis.start.x) * dx + (z - axis.start.z) * dz) / lenSq;
  return Math.max(0, Math.min(1, t));
}

/** Axis heading in degrees (0 = along +Z, clockwise in plan). */
export const axisAngleDeg = (axis: DepthAxis) =>
  (Math.atan2(axis.end.x - axis.start.x, axis.end.z - axis.start.z) * 180) / Math.PI;

export const axisLength = (axis: DepthAxis) =>
  Math.hypot(axis.end.x - axis.start.x, axis.end.z - axis.start.z);

export const axisCenter = (axis: DepthAxis) => ({
  x: (axis.start.x + axis.end.x) / 2,
  z: (axis.start.z + axis.end.z) / 2,
});

/** Rebuild an axis from angle / length / centre — used by the rotate + move controls. */
export function buildAxis(angleDeg: number, length: number, center: { x: number; z: number }): DepthAxis {
  const rad = (angleDeg * Math.PI) / 180;
  const hx = (Math.sin(rad) * length) / 2;
  const hz = (Math.cos(rad) * length) / 2;
  return {
    start: { x: center.x - hx, z: center.z - hz },
    end: { x: center.x + hx, z: center.z + hz },
  };
}

/**
 * Creates a getFloorDepthAt function that uses linear depth anchors along the
 * depth axis (falling back to the pool's Z extent when no axis is set).
 */
export function createDepthInterpolator(
  anchors: LinearDepthAnchor[],
  poolPoints: Point[],
  poolDimensions?: { length: number; width: number },
  depthAxis?: DepthAxis
): (x: number, z: number) => number {
  const axis = depthAxis ?? createDefaultDepthAxis(poolPoints, poolDimensions);
  return (x: number, z: number): number =>
    interpolateDepthFromAnchors(positionAlongAxis(x, z, axis), anchors);
}

/**
 * Depth for every perimeter point of the pool, derived from the anchors and the
 * axis. This is what the 3D floor/wall geometry consumes, so rotating or moving
 * the axis immediately re-shapes the pool bottom.
 */
export function computePerimeterDepths(
  perimeterPoints: Array<{ x: number; z: number; id?: string; type?: 'linear' | 'smooth' }>,
  anchors: LinearDepthAnchor[],
  axis: DepthAxis
): PerimeterDepthPoint[] {
  return perimeterPoints.map((p, i) => ({
    x: p.x,
    z: p.z,
    id: p.id ?? `perimeter-depth-${i}`,
    type: p.type ?? 'smooth',
    depth: Math.max(
      MIN_FLOOR_DEPTH,
      Math.min(MAX_FLOOR_DEPTH, interpolateDepthFromAnchors(positionAlongAxis(p.x, p.z, axis), anchors)),
    ),
  }));
}

/**
 * Default linear anchors for a pool
 */
export function createDefaultLinearAnchors(
  shallowDepth: number = 3.75,
  deepDepth: number = 8.5
): LinearDepthAnchor[] {
  return [
    { id: 'anchor-0', position: 0, depth: shallowDepth },
    { id: 'anchor-33', position: 0.33, depth: shallowDepth + (deepDepth - shallowDepth) * 0.33 },
    { id: 'anchor-67', position: 0.67, depth: shallowDepth + (deepDepth - shallowDepth) * 0.67 },
    { id: 'anchor-100', position: 1, depth: deepDepth },
  ];
}

/* ------------------------------------------------------------------ *
 * Bottom-shape presets — the reason this tool exists: beach / lagoon
 * zero-entry floors, sports bottoms, flat bottoms, classic slopes.
 * ------------------------------------------------------------------ */

export type DepthPresetId = 'standard' | 'zero-entry' | 'lagoon' | 'sport' | 'flat' | 'deep-end';

export const DEPTH_PRESETS: Array<{
  id: DepthPresetId;
  label: string;
  description: string;
  build: (shallow: number, deep: number) => LinearDepthAnchor[];
}> = [
  {
    id: 'standard',
    label: 'Standard slope',
    description: 'Even grade from the shallow end to the deep end',
    build: (s, d) => createDefaultLinearAnchors(s, d),
  },
  {
    id: 'zero-entry',
    label: 'Zero entry',
    description: 'Walk-in beach edge at 0 ft, rising to full depth',
    build: (s, d) => [
      { id: 'anchor-0', position: 0, depth: 0 },
      { id: 'anchor-18', position: 0.18, depth: Math.max(0.6, s * 0.35) },
      { id: 'anchor-45', position: 0.45, depth: s },
      { id: 'anchor-100', position: 1, depth: d },
    ],
  },
  {
    id: 'lagoon',
    label: 'Lagoon / beach',
    description: 'Long sandy shelf, gentle drop into a soft basin',
    build: (s, d) => [
      { id: 'anchor-0', position: 0, depth: 0 },
      { id: 'anchor-25', position: 0.25, depth: 0.9 },
      { id: 'anchor-5', position: 0.5, depth: Math.max(1.5, s * 0.6) },
      { id: 'anchor-75', position: 0.75, depth: s },
      { id: 'anchor-100', position: 1, depth: Math.max(s, d * 0.8) },
    ],
  },
  {
    id: 'sport',
    label: 'Sport bottom',
    description: 'Shallow at both ends, deepest through the middle',
    build: (s, d) => [
      { id: 'anchor-0', position: 0, depth: s },
      { id: 'anchor-35', position: 0.35, depth: d },
      { id: 'anchor-65', position: 0.65, depth: d },
      { id: 'anchor-100', position: 1, depth: s },
    ],
  },
  {
    id: 'flat',
    label: 'Flat bottom',
    description: 'One level floor across the whole shell',
    build: (s, d) => [
      { id: 'anchor-0', position: 0, depth: (s + d) / 2 },
      { id: 'anchor-100', position: 1, depth: (s + d) / 2 },
    ],
  },
  {
    id: 'deep-end',
    label: 'Shelf + deep end',
    description: 'Level swim shelf, then a defined drop to the deep end',
    build: (s, d) => [
      { id: 'anchor-0', position: 0, depth: s },
      { id: 'anchor-55', position: 0.55, depth: s },
      { id: 'anchor-75', position: 0.75, depth: d },
      { id: 'anchor-100', position: 1, depth: d },
    ],
  },
];
