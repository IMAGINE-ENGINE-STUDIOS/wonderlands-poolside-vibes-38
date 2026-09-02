/**
 * Architect curvature — precise curve geometry for the Wonderlands drawing boards.
 *
 * Why this exists
 * ---------------
 * The boards used to know only two states per corner: hard, or "smooth"
 * (Catmull-Rom). That reads well but a designer cannot *specify* it: you cannot
 * tell a shotcrete crew "make this bow slightly nicer". Real drafting tools work
 * in three precise instruments, and this module implements all three so a
 * designer can leave their CAD seat behind:
 *
 *   1. ARC          A segment becomes a true circular arc, stored as a signed
 *                   bulge (sagitta ÷ chord — the same idea as a DXF bulge).
 *                   Radius, sweep angle and arc length are exact, so a radius
 *                   can be typed in feet and read back off the sheet.
 *   2. FILLET       A corner is rounded by a tangent arc of a given radius —
 *                   the coping return, the deck corner, the cage knee. Tangency
 *                   is exact: the arc meets both runs without a kink.
 *   3. SPLINE       Free-form curvature with per-vertex tension (0 = straight
 *                   through the point, 1 = generous sweep), for lagoon shells.
 *
 * Everything is pure geometry in canvas pixels: no React, no canvas state, so
 * measurement, rendering, hit-testing, estimating and export all read the same
 * numbers and can never disagree.
 */

export interface CPt {
  x: number;
  y: number;
}

/** Curvature specification carried alongside a shape's vertex list. */
export interface CurvatureSpec {
  /** Legacy/per-vertex smooth flags: this vertex is a spline handle. */
  curves?: boolean[];
  /**
   * Signed bulge per SEGMENT i (vertex i → i+1): sagitta ÷ chord.
   * 0 = governed by the spline flags (straight unless smoothed).
   * Positive bows to the right of the direction a→b, negative to the left.
   */
  arcs?: number[];
  /** Fillet radius per VERTEX, in canvas px. 0 = sharp corner. */
  fillets?: number[];
  /** Spline tension per VERTEX, 0…1. Undefined = DEFAULT_TENSION. */
  tension?: number[];
}

export const DEFAULT_TENSION = 0.5;
/** Bulge beyond this is a semicircle; clamp keeps the maths well conditioned. */
export const MAX_BULGE = 1; // a semicircle — the tightest arc a single run can hold
const STEPS = 28;

export const dist = (a: CPt, b: CPt) => Math.hypot(a.x - b.x, a.y - b.y);

const flags = (f: boolean[] | undefined, n: number) => {
  const out = new Array<boolean>(n).fill(false);
  if (f) for (let i = 0; i < Math.min(n, f.length); i++) out[i] = !!f[i];
  return out;
};

const nums = (a: number[] | undefined, n: number, fallback = 0) => {
  const out = new Array<number>(n).fill(fallback);
  if (a) for (let i = 0; i < Math.min(n, a.length); i++) out[i] = Number.isFinite(a[i]) ? a[i] : fallback;
  return out;
};

/** Normalised, length-correct view of a shape's curvature. */
export const readSpec = (spec: CurvatureSpec | undefined, n: number) => ({
  curves: flags(spec?.curves, n),
  arcs: nums(spec?.arcs, n).map(b => Math.max(-MAX_BULGE, Math.min(MAX_BULGE, b))),
  fillets: nums(spec?.fillets, n).map(r => Math.max(0, r)),
  tension: nums(spec?.tension, n, DEFAULT_TENSION).map(t => Math.max(0, Math.min(1, t))),
});

export const segmentCount = (n: number, closed: boolean) => (closed && n > 2 ? n : Math.max(0, n - 1));

/* ------------------------------------------------------------------ *
 * Circular arcs from a signed bulge
 * ------------------------------------------------------------------ */

/**
 * Exact geometry of an arc segment.
 * `bulge` is the DXF/CAD bulge — tan(sweep ÷ 4) — so 1 is a semicircle, the
 * radius is R = chord (1 + b²) / (4 |b|) and the rise off the chord (the
 * sagitta) is chord × |b| ÷ 2. Matching the DXF convention exactly is what lets
 * an imported plan and an arc drawn here mean the same curve.
 */
export function arcMetrics(chordPx: number, bulge: number) {
  const b = Math.max(-MAX_BULGE, Math.min(MAX_BULGE, bulge));
  if (!chordPx || Math.abs(b) < 1e-6) {
    return { radiusPx: Infinity, sweepRad: 0, arcLenPx: chordPx, sagittaPx: 0, sign: 0 as -1 | 0 | 1 };
  }
  const radiusPx = (chordPx * (1 + b * b)) / (4 * Math.abs(b));
  const sweepRad = 4 * Math.atan(Math.abs(b));
  return {
    radiusPx,
    sweepRad,
    arcLenPx: radiusPx * sweepRad,
    sagittaPx: (Math.abs(b) * chordPx) / 2,
    sign: (b > 0 ? 1 : -1) as -1 | 1,
  };
}

/** The bulge that produces a given radius on a given chord (0 if impossible). */
export function bulgeForRadius(chordPx: number, radiusPx: number, sign: 1 | -1 = 1) {
  if (!(chordPx > 0) || !(radiusPx > 0)) return 0;
  const half = chordPx / 2;
  if (radiusPx <= half) return sign * 1; // tightest real arc: the semicircle
  const sagitta = radiusPx - Math.sqrt(radiusPx * radiusPx - half * half);
  return sign * Math.min(MAX_BULGE, (2 * sagitta) / chordPx);
}

/** Signed bulge implied by dragging the arc's midpoint to `p`. */
export function bulgeFromPoint(a: CPt, b: CPt, p: CPt) {
  const chord = dist(a, b);
  if (chord < 1e-6) return 0;
  const ux = (b.x - a.x) / chord;
  const uy = (b.y - a.y) / chord;
  const mx = p.x - (a.x + b.x) / 2;
  const my = p.y - (a.y + b.y) / 2;
  /* signed offset along the chord's right-hand normal (-uy, ux) */
  const offset = mx * -uy + my * ux;
  /* sagitta → bulge (DXF): b = 2 × rise ÷ chord */
  return Math.max(-MAX_BULGE, Math.min(MAX_BULGE, (2 * offset) / chord));
}

/** Midpoint of the arc — the grab handle a designer pulls to bow a run. */
export function arcMidpoint(a: CPt, b: CPt, bulge: number): CPt {
  const chord = dist(a, b);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (chord < 1e-6) return mid;
  const ux = (b.x - a.x) / chord;
  const uy = (b.y - a.y) / chord;
  const off = (bulge * chord) / 2; // the arc's true rise off the chord
  return { x: mid.x + -uy * off, y: mid.y + ux * off };
}

/** Polyline along a circular arc, `a` → `b`, inclusive of both ends. */
export function sampleArc(a: CPt, b: CPt, bulge: number, steps = STEPS): CPt[] {
  const chord = dist(a, b);
  if (chord < 1e-6 || Math.abs(bulge) < 1e-6) return [a, b];
  const { radiusPx, sweepRad, sagittaPx, sign } = arcMetrics(chord, bulge);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const ux = (b.x - a.x) / chord;
  const uy = (b.y - a.y) / chord;
  /* right-hand normal of the chord: the bow leans this way for a +bulge */
  const nx = -uy;
  const ny = ux;
  /* the apex the designer sees, and the centre sitting opposite it */
  const apex = { x: mid.x + nx * sagittaPx * sign, y: mid.y + ny * sagittaPx * sign };
  const d = Math.sqrt(Math.max(0, radiusPx * radiusPx - (chord / 2) * (chord / 2)));
  const c = { x: mid.x - nx * d * sign, y: mid.y - ny * d * sign };
  const a0 = Math.atan2(a.y - c.y, a.x - c.x);
  /* sweep whichever way actually passes through the apex — no wrap guesswork */
  const at = (t: number) => ({ x: c.x + radiusPx * Math.cos(t), y: c.y + radiusPx * Math.sin(t) });
  const cw = at(a0 + sweepRad / 2);
  const ccw = at(a0 - sweepRad / 2);
  const delta = dist(cw, apex) <= dist(ccw, apex) ? sweepRad : -sweepRad;
  const n = Math.max(6, Math.min(96, Math.round(steps * Math.max(0.35, sweepRad / Math.PI))));
  const out: CPt[] = [];
  for (let i = 0; i <= n; i++) out.push(at(a0 + (delta * i) / n));
  /* land exactly on the drawn corners, whatever the floating-point drift */
  out[0] = a;
  out[out.length - 1] = b;
  return out;
}

/* ------------------------------------------------------------------ *
 * Tensioned spline
 * ------------------------------------------------------------------ */

function catmull(p0: CPt, p1: CPt, p2: CPt, p3: CPt, s: number, tension: number): CPt {
  /* Cardinal spline: tension scales the tangents, so 0 runs dead straight
     through the point and 1 gives a generous, lagoon-like sweep. */
  const k = tension;
  const t1x = k * (p2.x - p0.x);
  const t1y = k * (p2.y - p0.y);
  const t2x = k * (p3.x - p1.x);
  const t2y = k * (p3.y - p1.y);
  const s2 = s * s;
  const s3 = s2 * s;
  const h1 = 2 * s3 - 3 * s2 + 1;
  const h2 = -2 * s3 + 3 * s2;
  const h3 = s3 - 2 * s2 + s;
  const h4 = s3 - s2;
  return {
    x: h1 * p1.x + h2 * p2.x + h3 * t1x + h4 * t2x,
    y: h1 * p1.y + h2 * p2.y + h3 * t1y + h4 * t2y,
  };
}

/* ------------------------------------------------------------------ *
 * Segment + path sampling
 * ------------------------------------------------------------------ */

export type SegmentKind = 'straight' | 'arc' | 'spline';

export function segmentKind(points: CPt[], closed: boolean, spec: CurvatureSpec | undefined, index: number): SegmentKind {
  const n = points.length;
  if (n < 2) return 'straight';
  const s = readSpec(spec, n);
  if (Math.abs(s.arcs[index]) > 1e-4) return 'arc';
  const next = (index + 1) % n;
  return s.curves[index] || s.curves[next] ? 'spline' : 'straight';
}

/** Polyline for one segment, honouring arcs then splines. Ends inclusive. */
export function sampleSegmentAdvanced(
  points: CPt[],
  closed: boolean,
  spec: CurvatureSpec | undefined,
  index: number,
  steps = STEPS,
): CPt[] {
  const n = points.length;
  if (n < 2) return points.slice();
  const s = readSpec(spec, n);
  const next = (index + 1) % n;
  const p1 = points[index];
  const p2 = points[next];
  if (Math.abs(s.arcs[index]) > 1e-4) return sampleArc(p1, p2, s.arcs[index], steps);
  if (!s.curves[index] && !s.curves[next]) return [p1, p2];
  const at = (i: number) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  const tension = (s.tension[index] + s.tension[next]) / 2;
  const p0 = at(index - 1);
  const p3 = at(index + 2);
  const out: CPt[] = [];
  for (let i = 0; i <= steps; i++) out.push(catmull(p0, p1, p2, p3, i / steps, tension));
  return out;
}

/** True length of one segment, in px. */
export function segmentLength(points: CPt[], closed: boolean, spec: CurvatureSpec | undefined, index: number) {
  const pts = sampleSegmentAdvanced(points, closed, spec, index);
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += dist(pts[i - 1], pts[i]);
  return d;
}

/**
 * Fillet arc at vertex `i`, or null when it cannot be cut (radius too large for
 * the shorter run, a curved neighbour, an open end). Tangency is exact.
 */
export function filletAt(
  points: CPt[],
  closed: boolean,
  spec: CurvatureSpec | undefined,
  i: number,
): { arc: CPt[]; trimIn: number; trimOut: number } | null {
  const n = points.length;
  if (n < 3) return null;
  const s = readSpec(spec, n);
  const r = s.fillets[i];
  if (!(r > 0.5)) return null;
  const prevIdx = (i - 1 + n) % n;
  const nextIdx = (i + 1) % n;
  if (!closed && (i === 0 || i === n - 1)) return null;
  /* a fillet only makes sense between two straight runs */
  if (segmentKind(points, closed, spec, prevIdx) !== 'straight') return null;
  if (segmentKind(points, closed, spec, i) !== 'straight') return null;

  const v = points[i];
  const a = points[prevIdx];
  const b = points[nextIdx];
  const la = dist(v, a);
  const lb = dist(v, b);
  if (la < 1e-6 || lb < 1e-6) return null;
  const ua = { x: (a.x - v.x) / la, y: (a.y - v.y) / la };
  const ub = { x: (b.x - v.x) / lb, y: (b.y - v.y) / lb };
  const cosT = Math.max(-1, Math.min(1, ua.x * ub.x + ua.y * ub.y));
  const theta = Math.acos(cosT);
  if (theta < 0.08 || Math.PI - theta < 0.02) return null; // spike or straight
  const tangent = r / Math.tan(theta / 2);
  /* never eat more than 45% of either run, so neighbouring fillets can coexist */
  if (tangent > la * 0.45 || tangent > lb * 0.45) return null;
  const pIn = { x: v.x + ua.x * tangent, y: v.y + ua.y * tangent };
  const pOut = { x: v.x + ub.x * tangent, y: v.y + ub.y * tangent };
  /* the arc bulges away from the corner: its sagitta is r (1 − cos(φ/2)) with
     φ = π − θ, and the sign follows the turn direction */
  const cross = ua.x * ub.y - ua.y * ub.x;
  const phi = Math.PI - theta;
  const chord = dist(pIn, pOut);
  const sag = r * (1 - Math.cos(phi / 2));
  const bulge = chord > 1e-6 ? Math.min(MAX_BULGE, (2 * sag) / chord) * (cross > 0 ? -1 : 1) : 0;
  return { arc: sampleArc(pIn, pOut, bulge, 24), trimIn: tangent, trimOut: tangent };
}

/**
 * The whole outline as a polyline: arcs, splines, straights and corner fillets,
 * assembled in drafting order. This is the single source used for rendering,
 * areas, perimeters, hatching and every price on the sheet.
 */
export function samplePathAdvanced(
  points: CPt[],
  closed: boolean,
  spec: CurvatureSpec | undefined,
  steps = STEPS,
): CPt[] {
  const n = points.length;
  if (n < 2) return points.slice();
  const segs = segmentCount(n, closed);
  const fillets = points.map((_, i) => filletAt(points, closed, spec, i));

  const out: CPt[] = [];
  const push = (p: CPt) => {
    const last = out[out.length - 1];
    if (!last || dist(last, p) > 0.01) out.push(p);
  };

  for (let i = 0; i < segs; i++) {
    const next = (i + 1) % n;
    const kind = segmentKind(points, closed, spec, i);
    if (kind === 'straight') {
      const a = points[i];
      const b = points[next];
      const len = dist(a, b) || 1;
      const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
      const startTrim = fillets[i]?.trimOut ?? 0;
      const endTrim = fillets[next]?.trimIn ?? 0;
      push({ x: a.x + u.x * startTrim, y: a.y + u.y * startTrim });
      push({ x: b.x - u.x * endTrim, y: b.y - u.y * endTrim });
    } else {
      sampleSegmentAdvanced(points, closed, spec, i, steps).forEach(push);
    }
    /* round the corner we just arrived at */
    const f = fillets[next];
    if (f && (closed || next !== n - 1)) f.arc.forEach(push);
  }
  if (!closed) push(points[n - 1]);
  return out;
}

/** Does this shape carry any curvature at all? */
export function hasCurvature(spec: CurvatureSpec | undefined, n: number) {
  const s = readSpec(spec, n);
  return s.curves.some(Boolean) || s.arcs.some(b => Math.abs(b) > 1e-4) || s.fillets.some(r => r > 0.5);
}

/** Set one value in a per-index numeric array, padded to `n`. */
export function withValueAt(arr: number[] | undefined, n: number, index: number, value: number, fallback = 0) {
  const out = nums(arr, n, fallback);
  if (index >= 0 && index < n) out[index] = value;
  return out;
}
