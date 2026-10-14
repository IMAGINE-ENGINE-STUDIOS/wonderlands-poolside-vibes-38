/**
 * Global Design Board V2 → 3D Studio handoff.
 * Imagine Engine Studios Corp.
 *
 * The board is in feet (y down). The 3D studio is in feet with the pool centred
 * at the origin, so everything is shifted to the centre of the first pool (or
 * the drawing when there is none): board (x, y) → 3D (x, z).
 * Turf/deck keep exact net regions (pools/spas/decks punched out), fences keep
 * style/height/color, screens keep frame color and cage height.
 */
import { netRegions, type NetItem } from "@/lib/design/boardNetArea";

export const BOARD_3D_KEY = "studio3d.globalDesign.v1";
export const BOARD_3D_EVENT = "studio3d:globalDesign";

type XZ = { x: number; z: number };
export interface Fence3D { pts: XZ[]; style: string; height: number; color: string }
export interface Screen3D { pts: XZ[]; height: number; color: string; roof?: "mansard" | "flat" }
export interface Surface3D { kind: "turf" | "deck"; color: string; regions: XZ[][][] }
/** Extra water bodies (every pool/spa after the first, which is the studio's main pool). */
export interface Water3D { kind: "pool" | "spa"; label: string; pts: XZ[]; depth: number; finish: string; coping: string; waterline: string; copingWidth: number }
export interface Board3D { pool?: { w: number; l: number }; fences: Fence3D[]; screens: Screen3D[]; surfaces: Surface3D[]; waters?: Water3D[] }

/** 3D-side edits from the element widgets. Keeps the same storage + event. */
export function updateBoard3D(fn: (d: Board3D) => Board3D) {
  const cur = loadBoard3D(); if (!cur) return;
  saveBoard3D(fn(cur));
}

type BoardProduct = { id: string; color: string; size?: { w: number; l: number } };

const centroid = (pts: { x: number; y: number }[]) => pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 });

export function boardTo3D(items: NetItem[], productOf: (id: string) => BoardProduct | undefined, productIdOf: (it: NetItem) => string): Board3D {
  const pool = items.find((i) => i.kind === "pool") ?? items.find((i) => i.kind === "spa");
  let c = { x: 0, y: 0 };
  if (pool) c = centroid(pool.pts);
  else if (items.length) { const all = items.flatMap((i) => i.pts); const xs = all.map((p) => p.x), ys = all.map((p) => p.y); c = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }; }
  const to = (p: { x: number; y: number }): XZ => ({ x: p.x - c.x, z: p.y - c.y });
  const out: Board3D = { fences: [], screens: [], surfaces: [], waters: [] };
  if (pool) { const p = productOf(productIdOf(pool)); if (p?.size) out.pool = p.size; }
  for (const it of items) {
    const p = productOf(productIdOf(it)); if (!p) continue;
    const parts = p.id.split(":");
    if ((it.kind === "pool" || it.kind === "spa") && it !== pool) out.waters!.push({
      kind: it.kind, label: (p as BoardProduct & { label?: string }).label ?? it.kind, pts: it.pts.map(to),
      depth: it.kind === "spa" ? 3 : 5, finish: "#5fb7d4", coping: "#d8d2c8", waterline: "#2f6f8f", copingWidth: 1,
    });
    else if (it.kind === "fence") out.fences.push({ pts: it.pts.map(to), style: parts[1], height: parseFloat(parts[3]) || 4, color: p.color });
    else if (it.kind === "enclosure") out.screens.push({ pts: it.pts.map(to), height: parseFloat(parts[3]) || 10, color: p.color });
    else if (it.kind === "turf" || it.kind === "deck") out.surfaces.push({ kind: it.kind, color: p.color, regions: netRegions(items, it).map((poly) => poly.map((r) => r.map(to))) });
  }
  return out;
}

export function saveBoard3D(data: Board3D) {
  try { localStorage.setItem(BOARD_3D_KEY, JSON.stringify(data)); } catch { /* quota */ }
  window.dispatchEvent(new Event(BOARD_3D_EVENT));
}
export function loadBoard3D(): Board3D | null {
  try { const raw = localStorage.getItem(BOARD_3D_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
