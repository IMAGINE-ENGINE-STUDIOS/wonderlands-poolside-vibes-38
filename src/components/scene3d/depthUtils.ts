import { LinearDepthAnchor, Point } from './types';

/**
 * Interpolates depth at a given position (0-1) along the pool length
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
      const t = (clampedPos - sorted[i].position) / (sorted[i + 1].position - sorted[i].position);
      return sorted[i].depth + t * (sorted[i + 1].depth - sorted[i].depth);
    }
  }
  
  // Edge cases: before first or after last anchor
  if (clampedPos < sorted[0].position) return sorted[0].depth;
  return sorted[sorted.length - 1].depth;
}

/**
 * Creates a getFloorDepthAt function that uses linear depth anchors
 * and pool bounds to calculate depth at any (x, z) position
 */
export function createDepthInterpolator(
  anchors: LinearDepthAnchor[],
  poolPoints: Point[],
  poolDimensions?: { length: number; width: number }
): (x: number, z: number) => number {
  // Calculate pool bounds from points
  let minZ = Infinity, maxZ = -Infinity;
  
  if (poolDimensions) {
    minZ = -poolDimensions.length / 2;
    maxZ = poolDimensions.length / 2;
  } else if (poolPoints.length > 0) {
    poolPoints.forEach(p => {
      const z = 'z' in p ? (p as any).z : p.y;
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    });
  } else {
    // Default bounds
    minZ = -10;
    maxZ = 10;
  }
  
  const poolLength = maxZ - minZ || 1;
  
  return (x: number, z: number): number => {
    // Calculate normalized position along pool length (shallow to deep)
    // Assuming shallow end is at minZ (or negative Z) and deep end at maxZ
    const normalizedPosition = (z - minZ) / poolLength;
    return interpolateDepthFromAnchors(normalizedPosition, anchors);
  };
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
