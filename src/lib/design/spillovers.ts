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
/** The stretch of a spline segment a spill covers (control points; straight chord). */
export function spillEnds(pts: P[], s: Spillover): [P, P] | null {
  const a = pts[s.seg], b = pts[(s.seg + 1) % pts.length];
  if (!a || !b) return null;
  const at = (t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  return [at(Math.min(s.t0, s.t1)), at(Math.max(s.t0, s.t1))];
}
