/** Precision controls for the drawing board. Copyright Imagine Engine Studios Corp. */
import { densifyPoolOutline } from './curveUtils';
import { nearestSegment } from './splineEditing';

export function splineHandleRadius(zoom: number): number {
  const z = Math.max(0.1, zoom);
  return Math.max(1.5, 3 / Math.sqrt(Math.max(1, z))) / z;
}

export function splineHitRadius(zoom: number): number {
  return (splineHandleRadius(zoom) * Math.max(0.1, zoom) + 2) / Math.max(0.1, zoom);
}

/** Inside the visible outline or within a small screen-space edge tolerance. */
export function poolInsertionHit<T extends { x: number; y: number; curveType?: 'linear' | 'curve' | 'arc' | 'freeform' }>(
  points: T[], shape: string, cursor: { x: number; y: number }, zoom: number,
) {
  if (points.length < 3) return null;
  const ring = densifyPoolOutline(points, shape);
  const edge = nearestSegment(ring, true, cursor);
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > cursor.y) !== (b.y > cursor.y) && cursor.x < (b.x - a.x) * (cursor.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  if (!edge || (!inside && edge.distance > splineHitRadius(zoom))) return null;
  // Preserve the existing Add Point segment semantics, without duplicate anchors.
  const source = nearestSegment(points, true, edge.projection);
  if (!source) return null;
  return { index: source.index, point: edge.projection };
}