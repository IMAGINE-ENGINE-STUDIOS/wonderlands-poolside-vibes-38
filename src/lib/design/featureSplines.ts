/**
 * Feature splines — benches, seats, stairs and chairs as DRAWN GEOMETRY.
 * Imagine Engine Studios Corp. (Pool Geometry General Fix, Job 1, 2026-11-03;
 * founder directive: no hardcoded shapes, no perimeter-fraction replay —
 * features are drawn with the spline tools, "to exactitud", like VIP3D.)
 *
 * A feature is stored as real points (its wall line) in the model's own
 * frame — the same frame as the pool outline and the traced zones
 * (additionalPools). It is placed by frame alignment (the same origin +
 * orientation offset the stairs specs already use) and rendered from those
 * points identically in 2D and 3D. The drawn spline IS the stored geometry.
 *
 * Legacy catalog specs stored `start`/`end` arc-length fractions on the
 * model's own outline ring. Those fractions are exact ON THAT RING, so the
 * true wall line is derivable without inventing anything: it is the ring's
 * own sub-arc between the two fractions (`ringSubArc`). Conversion happens
 * once, here; downstream code only ever sees points.
 */

export interface Pt2 { x: number; y: number }

/** One catalog seating spec as stored in poolModelShapes (legacy fractions
 *  and, after the 2026-11-03 bake, the derived true wall line in `path`). */
export interface SeatingSpecLike {
  id: string;
  start: number;
  end: number;
  width: number;
  height: number;
  path?: Pt2[];
}

/** A seating feature as geometry: wall-line points in the model's frame. */
export interface SeatingSpline {
  id: string;
  /** Wall-line points, model frame, feet. */
  path: Pt2[];
  /** True when the span covers (nearly) the whole ring — a closed loop. */
  closed: boolean;
  width: number;
  height: number;
}

const EPS = 1e-9;

/** Cumulative arc lengths of a closed ring; last entry = full perimeter. */
export function ringCumulative(ring: Pt2[]): number[] {
  const acc = [0];
  for (let i = 1; i <= ring.length; i++) {
    const a = ring[i - 1], b = ring[i % ring.length];
    acc.push(acc[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  return acc;
}

/** Point at arc distance `d` along the closed ring (wraps). */
function ringPointAt(ring: Pt2[], acc: number[], d: number): Pt2 {
  const total = acc[acc.length - 1] || 1;
  let dd = d % total; if (dd < 0) dd += total;
  let i = 0;
  while (i < ring.length - 1 && acc[i + 1] < dd) i++;
  const a = ring[i], b = ring[(i + 1) % ring.length];
  const seg = acc[i + 1] - acc[i];
  const f = seg > EPS ? Math.min(1, Math.max(0, (dd - acc[i]) / seg)) : 0;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

/**
 * The ring's own sub-arc between arc-length fractions `start`→`end`
 * (may wrap past 1, exactly as the legacy specs store it). Returns the
 * ring's own vertices strictly inside the span, bracketed by the exact
 * interpolated end points — points OF the stored trace, nothing invented.
 * A span ≥ 0.995 of the ring is the full ring (closed).
 */
export function ringSubArc(ring: Pt2[], start: number, end: number): { points: Pt2[]; closed: boolean } {
  const n = ring.length;
  if (n < 3) return { points: [], closed: false };
  const span = end - start;
  if (span >= 0.995) return { points: ring.map(p => ({ ...p })), closed: true };
  const acc = ringCumulative(ring);
  const total = acc[acc.length - 1];
  if (total < EPS || span <= 0) return { points: [], closed: false };
  const d0 = start * total;
  const d1 = end * total;
  const pts: Pt2[] = [ringPointAt(ring, acc, d0)];
  // Ring vertices whose cumulative arc distance falls strictly inside
  // (d0, d1), walking forward with wrap — collected by unwrapped distance
  // so the path stays in ring order across the origin.
  const inside: Array<{ dv: number; p: Pt2 }> = [];
  for (let idx = 1; idx <= n; idx++) {
    let dv = acc[idx];
    while (dv <= d0) dv += total;
    if (dv < d1) inside.push({ dv, p: ring[idx % n] });
  }
  inside.sort((a, b) => a.dv - b.dv);
  for (const v of inside) pts.push({ ...v.p });
  pts.push(ringPointAt(ring, acc, d1));
  return { points: pts, closed: false };
}

/** Decimate a dense traced path for storage: keep endpoints, any point
 *  where the direction turns more than `angleDeg`, and at least one point
 *  every `maxStep` feet. The rendering resamples the polyline, so dropping
 *  collinear points changes nothing geometrically (≤ the chord error of
 *  the kept segments, which the turn threshold bounds). */
export function decimatePath(pts: Pt2[], maxStep = 2, angleDeg = 2): Pt2[] {
  if (pts.length <= 2) return pts.map(p => ({ ...p }));
  const keep: boolean[] = pts.map(() => false);
  keep[0] = keep[pts.length - 1] = true;
  let lastKept = 0;
  let alongSinceKept = 0; // path distance, NOT straight-line (wrap spans double back)
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[lastKept], b = pts[i], c = pts[i + 1];
    alongSinceKept += Math.hypot(b.x - pts[i - 1].x, b.y - pts[i - 1].y);
    const v1x = b.x - a.x, v1y = b.y - a.y, v2x = c.x - b.x, v2y = c.y - b.y;
    const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
    let turn = 0;
    if (l1 > EPS && l2 > EPS) {
      const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (l1 * l2)));
      turn = Math.acos(cos) * 180 / Math.PI;
    }
    if (turn > angleDeg || alongSinceKept >= maxStep) { keep[i] = true; lastKept = i; alongSinceKept = 0; }
  }
  return pts.filter((_, i) => keep[i]).map(p => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 }));
}

/**
 * Convert one catalog seating spec to stored geometry on the model's own
 * ring. A previously baked `path` wins verbatim (stored = drawn); otherwise
 * the path is the ring's exact sub-arc for the spec's fractions.
 */
export function seatingSpecToSpline(spec: SeatingSpecLike, ring: Pt2[]): SeatingSpline {
  if (spec.path && spec.path.length >= 2) {
    const span = spec.end - spec.start;
    return { id: spec.id, path: spec.path.map(p => ({ ...p })), closed: span >= 0.995, width: spec.width, height: spec.height };
  }
  const { points, closed } = ringSubArc(ring, spec.start, spec.end);
  return { id: spec.id, path: points, closed, width: spec.width, height: spec.height };
}

/** Ray-cast point-in-polygon for a closed ring (boundary counts as in). */
export function pointInRing(p: Pt2, ring: Pt2[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > p.y) !== (b.y > p.y)) {
      const xInt = b.x + ((p.y - b.y) / (a.y - b.y)) * (a.x - b.x);
      if (p.x < xInt) inside = !inside;
    }
  }
  return inside;
}

/** Distance from a point to the nearest point of the closed ring. */
export function distToRing(p: Pt2, ring: Pt2[]): number {
  let best = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const vx = b.x - a.x, vy = b.y - a.y;
    const l2 = vx * vx + vy * vy;
    const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2));
    const dx = p.x - (a.x + vx * t), dy = p.y - (a.y + vy * t);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

/**
 * Validation gate (fix plan item 0): every point of a feature spline must
 * lie inside its pool outline — on the wall line (within `tol` of the ring)
 * or strictly inside. Returns the offending points (empty = valid).
 */
export function validateSplineInside(path: Pt2[], ring: Pt2[], tol = 0.05): Pt2[] {
  return path.filter(p => distToRing(p, ring) > tol && !pointInRing(p, ring));
}

export interface PathSample { x: number; z: number; nx: number; nz: number }

/**
 * Resample a stored wall-line path ({x, z} scene frame) at ~`step` feet,
 * with smoothed inward normals. `interior` is any point inside the pool
 * (e.g. the outline centroid) — normals are flipped to face it. This is
 * the geometry the bench sweep consumes; it depends ONLY on the stored
 * path, never on perimeter fractions.
 */
export function samplesAlongPath(path: Array<{ x: number; z: number }>, closed: boolean, interior: { x: number; z: number }, step = 0.5): PathSample[] {
  const n = path.length;
  if (n < 2) return [];
  // Densify the polyline.
  const dense: Array<{ x: number; z: number }> = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = path[i], b = path[(i + 1) % n];
    const L = Math.hypot(b.x - a.x, b.z - a.z);
    const cnt = Math.max(1, Math.round(L / step));
    for (let k = 0; k < cnt; k++) dense.push({ x: a.x + (b.x - a.x) * (k / cnt), z: a.z + (b.z - a.z) * (k / cnt) });
  }
  if (!closed) dense.push({ ...path[n - 1] });
  const m = dense.length;
  if (m < 2) return [];
  return dense.map((p, i) => {
    const pa = closed ? dense[(i - 1 + m) % m] : dense[Math.max(0, i - 1)];
    const pb = closed ? dense[(i + 1) % m] : dense[Math.min(m - 1, i + 1)];
    let tx = pb.x - pa.x, tz = pb.z - pa.z;
    const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    // Normal candidates: rotate tangent ±90°. Pick the one facing interior.
    let nx = -tz, nz = tx;
    if ((interior.x - p.x) * nx + (interior.z - p.z) * nz < 0) { nx = -nx; nz = -nz; }
    return { x: p.x, z: p.z, nx, nz };
  });
}
