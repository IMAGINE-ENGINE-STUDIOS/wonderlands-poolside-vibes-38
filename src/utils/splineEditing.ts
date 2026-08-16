/**
 * Shared spline-point editing helpers used by every Wonderlands drawing board
 * (grass, fence, screen enclosure, blueprint site plan).
 *
 * Model: a board stores a flat list of vertices plus an optional parallel
 * boolean array (`curves`) marking which vertices are curvature handles.
 * A segment is drawn as a Catmull-Rom curve whenever either of its end
 * vertices is flagged; otherwise it stays a straight drafting line.
 */

export interface SplinePt {
  x: number;
  y: number;
}

const SEGMENTS_PER_CURVE = 16;

export const distPt = (a: SplinePt, b: SplinePt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Vertex index under the cursor, or -1. `tolerance` is in canvas px. */
export function hitVertexIndex(points: SplinePt[], p: SplinePt, tolerance = 9): number {
  for (let i = 0; i < points.length; i++) if (distPt(points[i], p) <= tolerance) return i;
  return -1;
}

/** Nearest segment to a point. `index` is the start-vertex index of the segment. */
export function nearestSegment(
  points: SplinePt[],
  closed: boolean,
  p: SplinePt
): { index: number; t: number; distance: number; projection: SplinePt } | null {
  if (points.length < 2) return null;
  const last = closed && points.length > 2 ? points.length : points.length - 1;
  let best: { index: number; t: number; distance: number; projection: SplinePt } | null = null;
  for (let i = 0; i < last; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const len = distPt(a, b) || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len)));
    const projection = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
    const distance = distPt(projection, p);
    if (!best || distance < best.distance) best = { index: i, t, distance, projection };
  }
  return best;
}

/**
 * Insert a new vertex on the segment closest to `p`.
 * Returns null when nothing is within `tolerance`.
 */
export function insertVertexAt(
  points: SplinePt[],
  closed: boolean,
  p: SplinePt,
  tolerance = 14,
  curves?: boolean[]
): { points: SplinePt[]; curves?: boolean[]; index: number } | null {
  const hit = nearestSegment(points, closed, p);
  if (!hit || hit.distance > tolerance) return null;
  const index = hit.index + 1;
  const next = [...points];
  next.splice(index, 0, hit.projection);
  return { points: next, curves: curves ? insertFlag(curves, index, points.length) : undefined, index };
}

/** Insert a vertex at the midpoint of the segment that follows `index`. */
export function insertVertexAfter(
  points: SplinePt[],
  closed: boolean,
  index: number,
  curves?: boolean[]
): { points: SplinePt[]; curves?: boolean[]; index: number } | null {
  if (points.length < 2) return null;
  const hasNext = index < points.length - 1 || (closed && points.length > 2);
  const a = points[index];
  const b = hasNext ? points[(index + 1) % points.length] : points[index - 1];
  if (!a || !b) return null;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const at = hasNext ? index + 1 : index;
  const next = [...points];
  next.splice(at, 0, mid);
  return { points: next, curves: curves ? insertFlag(curves, at, points.length) : undefined, index: at };
}

/** Remove a vertex, keeping at least `min` points. */
export function removeVertex(
  points: SplinePt[],
  index: number,
  min = 2,
  curves?: boolean[]
): { points: SplinePt[]; curves?: boolean[] } | null {
  if (points.length <= min) return null;
  return {
    points: points.filter((_, i) => i !== index),
    curves: curves ? normalizeFlags(curves, points.length).filter((_, i) => i !== index) : undefined,
  };
}

export function normalizeFlags(flags: boolean[] | undefined, length: number): boolean[] {
  const out = new Array(length).fill(false) as boolean[];
  if (flags) for (let i = 0; i < Math.min(length, flags.length); i++) out[i] = !!flags[i];
  return out;
}

function insertFlag(flags: boolean[] | undefined, at: number, length: number): boolean[] {
  const out = normalizeFlags(flags, length);
  // A newly inserted point inherits the curvature of its neighbours so that a
  // curved run stays curved when the user adds detail to it.
  const inherit = !!(out[at - 1] || out[at % Math.max(length, 1)]);
  out.splice(at, 0, inherit);
  return out;
}

/** Toggle the curvature handle on one vertex. */
export function toggleCurveFlag(flags: boolean[] | undefined, index: number, length: number): boolean[] {
  const out = normalizeFlags(flags, length);
  out[index] = !out[index];
  return out;
}

export function allCurved(length: number, value = true): boolean[] {
  return new Array(length).fill(value) as boolean[];
}

export function hasAnyCurve(flags: boolean[] | undefined): boolean {
  return !!flags?.some(Boolean);
}

function catmullRom(p0: SplinePt, p1: SplinePt, p2: SplinePt, p3: SplinePt, s: number): SplinePt {
  const s2 = s * s;
  const s3 = s2 * s;
  return {
    x:
      0.5 *
      (2 * p1.x + (-p0.x + p2.x) * s + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3),
    y:
      0.5 *
      (2 * p1.y + (-p0.y + p2.y) * s + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3),
  };
}

/** Polyline for a single segment: straight, or Catmull-Rom when a handle is set. */
export function sampleSegment(
  points: SplinePt[],
  closed: boolean,
  curves: boolean[] | undefined,
  index: number,
  segmentsPerCurve = SEGMENTS_PER_CURVE
): SplinePt[] {
  const n = points.length;
  if (n < 2) return points.slice();
  const nextIndex = (index + 1) % n;
  const p1 = points[index];
  const p2 = points[nextIndex];
  const flags = normalizeFlags(curves, n);
  if (!flags[index] && !flags[nextIndex]) return [p1, p2];

  const at = (i: number) => {
    if (closed) return points[(i + n) % n];
    return points[Math.max(0, Math.min(n - 1, i))];
  };
  const p0 = at(index - 1);
  const p3 = at(index + 2);
  const out: SplinePt[] = [];
  for (let s = 0; s <= segmentsPerCurve; s++) out.push(catmullRom(p0, p1, p2, p3, s / segmentsPerCurve));
  return out;
}

/** Full outline polyline honouring per-vertex curvature handles. */
export function samplePath(
  points: SplinePt[],
  closed: boolean,
  curves?: boolean[],
  segmentsPerCurve = SEGMENTS_PER_CURVE
): SplinePt[] {
  const n = points.length;
  if (n < 2) return points.slice();
  const last = closed && n > 2 ? n : n - 1;
  const out: SplinePt[] = [];
  for (let i = 0; i < last; i++) {
    const seg = sampleSegment(points, closed, curves, i, segmentsPerCurve);
    for (let j = 0; j < seg.length - 1; j++) out.push(seg[j]);
  }
  if (!closed) out.push(points[n - 1]);
  return out;
}

/** Length of a polyline in px. */
export function polylineLength(pts: SplinePt[], closed = false): number {
  if (pts.length < 2) return 0;
  let d = 0;
  for (let i = 0; i < pts.length - 1; i++) d += distPt(pts[i], pts[i + 1]);
  if (closed) d += distPt(pts[pts.length - 1], pts[0]);
  return d;
}

/** Trace a canvas path along a polyline. */
export function tracePolyline(ctx: CanvasRenderingContext2D, pts: SplinePt[], closed = false) {
  if (pts.length === 0) return;
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  if (closed) ctx.closePath();
}
