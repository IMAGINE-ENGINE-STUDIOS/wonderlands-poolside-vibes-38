/**
 * Spill-over edges — water falling from a pool/spa over part of one spline
 * segment into another water body, a sunken deck or down a raised wall.
 * Credits: Imagine Engine Studios Corp.
 *
 * Stored per browser (shared by the 2D board and the 3D Studio) and keyed by
 * the board pool id ("__pool" or "__xp:<id>") + segment index, so the edge
 * follows the spline when its points move. `t0`/`t1` choose the stretch along
 * the segment; `pitch` (0–45°) throws the sheet outward, 0 = clinging to the wall.
 */
import * as React from "react";

/** Chosen finish for this spill's elevated (riser) wall face: a waterline tile or a paver/stone. */
export interface SpillWallChoice { kind: "waterline" | "paver"; url: string; name?: string }
export interface Spillover { id: string; poolId: string; seg: number; t0: number; t1: number; pitch: number; wall?: SpillWallChoice }
export const SPILL_KEY = "studio.spillovers.v1";
export const SPILL_EVENT = "studio:spillovers";

export function loadSpills(): Spillover[] {
  try { return JSON.parse(localStorage.getItem(SPILL_KEY) || "[]"); } catch { return []; }
}
export function saveSpills(list: Spillover[]) {
  localStorage.setItem(SPILL_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(SPILL_EVENT));
}
export const spillActions = {
  add: (poolId: string, seg: number) => { const s: Spillover = { id: `sp${Date.now().toString(36)}`, poolId, seg, t0: 0, t1: 1, pitch: 0 }; saveSpills([...loadSpills(), s]); return s; },
  update: (id: string, patch: Partial<Spillover>) => saveSpills(loadSpills().map((s) => (s.id === id ? { ...s, ...patch } : s))),
  remove: (id: string) => saveSpills(loadSpills().filter((s) => s.id !== id)),
};
export function useSpills(): Spillover[] {
  const [list, setList] = React.useState(loadSpills);
  React.useEffect(() => {
    const on = () => setList(loadSpills());
    window.addEventListener(SPILL_EVENT, on); window.addEventListener("storage", on);
    return () => { window.removeEventListener(SPILL_EVENT, on); window.removeEventListener("storage", on); };
  }, []);
  return list;
}

/* ---------- Shared spill selection (2D board, 3D Studio, shell panel) ----------
 * One selection everywhere: clicking a spill in any view selects it in all,
 * and the Pool Elevation panel edits only this spill's elevated wall. */
export const SPILL_SEL_KEY = "studio.spillovers.sel";
export const SPILL_SEL_EVENT = "studio:spillovers:sel";
export function loadSelectedSpill(): string | null {
  try { return localStorage.getItem(SPILL_SEL_KEY) || null; } catch { return null; }
}
export function selectSpill(id: string | null) {
  try { id ? localStorage.setItem(SPILL_SEL_KEY, id) : localStorage.removeItem(SPILL_SEL_KEY); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(SPILL_SEL_EVENT));
}
/** useState-shaped so existing local selection state can swap in directly. */
export function useSpillSelection(): [string | null, (id: string | null) => void] {
  const [sel, setSel] = React.useState<string | null>(loadSelectedSpill);
  React.useEffect(() => {
    const on = () => setSel(loadSelectedSpill());
    window.addEventListener(SPILL_SEL_EVENT, on); window.addEventListener("storage", on);
    return () => { window.removeEventListener(SPILL_SEL_EVENT, on); window.removeEventListener("storage", on); };
  }, []);
  return [sel, selectSpill];
}
type P = { x: number; y: number };
type PX = P & { curveType?: string; curveFlip?: boolean };

import { curvedSegmentControls } from "../../utils/curveUtils";
/**
 * The point at parameter t along ONE pool-outline segment, evaluated EXACTLY
 * as the pool outline itself is drawn/sampled (PoolBuilder's canvas segments
 * and densifyPoolOutline in SceneConverter):
 * - the segment's shape is the END point's curveType when points carry types
 *   ('linear' stays straight; 'curve'/'arc' use curvedSegmentControls;
 *   'freeform' uses the freeform Bézier);
 * - a 'rectangle' pool with no per-point types is straight;
 * - otherwise the legacy Catmull-Rom Bézier (p1 + (p2-p0)/6, p2 - (p3-p1)/6).
 * The old code lerped the straight CHORD for the ends and sampled
 * densifyPoolOutline(pts, "freeform") for the arc: on a rectangle / sharp
 * corner the Catmull-Rom controls sit feet OUTSIDE the pool (e.g. left edge
 * cp x = -4.5 ft on a 27×22 rectangle), so the spill bulged off the edge and
 * past the corner over the deck, and the chord ends sat off the spline —
 * in 2D and, via the hand-off, in 3D alike (founder, 2026-11-03).
 */
export function spillSegmentPoint(pts: P[], seg: number, t: number, shape?: string): P | null {
  const n = pts.length;
  if (n < 2) return null;
  const px = pts as PX[];
  const p1 = px[((seg % n) + n) % n], p2 = px[(((seg + 1) % n) + n) % n];
  if (!p1 || !p2) return null;
  const lerp = () => ({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
  const hasTypes = px.some((p) => p.curveType);
  let cp1: P, cp2: P;
  if (hasTypes) {
    const type = p2.curveType || "linear";
    if (type === "linear") return lerp();
    if (type === "curve" || type === "arc") {
      ({ cp1, cp2 } = curvedSegmentControls(px as never, ((seg % n) + n) % n));
    } else {
      const dx = p2.x - p1.x, dy = p2.y - p1.y, qx = -dy * 0.15, qy = dx * 0.15;
      cp1 = { x: p1.x + dx * 0.3 + qx * 0.5, y: p1.y + dy * 0.3 + qy * 0.5 };
      cp2 = { x: p1.x + dx * 0.7 - qx * 0.3, y: p1.y + dy * 0.7 - qy * 0.3 };
    }
  } else if (shape === "rectangle") {
    return lerp();
  } else {
    const p0 = px[((seg - 1) % n + n) % n], p3 = px[((seg + 2) % n + n) % n];
    cp1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    cp2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
  }
  const u = 1 - t;
  return {
    x: u * u * u * p1.x + 3 * u * u * t * cp1.x + 3 * u * t * t * cp2.x + t * t * t * p2.x,
    y: u * u * u * p1.y + 3 * u * u * t * cp1.y + 3 * u * t * t * cp2.y + t * t * t * p2.y,
  };
}
const segIsLinear = (pts: P[], seg: number, shape?: string): boolean => {
  const px = pts as PX[];
  if (px.some((p) => p.curveType)) return (px[(seg + 1) % px.length]?.curveType || "linear") === "linear";
  return shape === "rectangle";
};

/** The stretch of a spline segment a spill covers — ends ON the spline, not on the chord. */
export function spillEnds(pts: P[], s: Spillover, shape?: string): [P, P] | null {
  const a = spillSegmentPoint(pts, s.seg, Math.min(s.t0, s.t1), shape);
  const b = spillSegmentPoint(pts, s.seg, Math.max(s.t0, s.t1), shape);
  return a && b ? [a, b] : null;
}

/**
 * The spill stretch as a polyline that FOLLOWS the pool spline exactly: the
 * segment's own Bézier (same controls the outline is drawn with) evaluated
 * from t0 to t1, so the first/last points are the true ends on the edge and
 * nothing runs past a corner (founder, 2026-11-03 — spill overs must bend
 * with the spline and end where their stretch ends).
 */
export function spillCurve(pts: P[], s: Spillover, shape?: string): P[] | null {
  const ends = spillEnds(pts, s, shape);
  if (!ends) return null;
  if (pts.length < 3 || segIsLinear(pts, s.seg, shape)) return ends;
  const t0 = Math.min(s.t0, s.t1), t1 = Math.max(s.t0, s.t1);
  const N = 24, out: P[] = [];
  for (let k = 0; k <= N; k++) {
    const p = spillSegmentPoint(pts, s.seg, t0 + (t1 - t0) * (k / N), shape);
    if (p) out.push(p);
  }
  return out.length >= 2 ? out : ends;
}
