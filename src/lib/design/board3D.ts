/**
 * Global Design Board V2 ⇄ 3D Studio bridge (two-way).
 * Imagine Engine Studios Corp.
 *
 * The board is in feet (y down). The 3D studio is in feet with the pool centred
 * at the origin, so everything is shifted to the centre of the first pool (or
 * the drawing when there is none): board (x, y) → 3D (x, z). The shift is kept
 * in `origin` so 3D edits can be mapped back onto the board exactly.
 *
 * Every pool/spa after the first is a `Water3D` keyed by the board item id
 * (`itemId`), never by array position: each one owns its own depth profile,
 * depth axis, zero entry, finish, waterline, coping and outline, so editing one
 * never changes another. The first pool is sent as `primaryId`/`primaryPts` and its
 * 3D edits (shape, size) flow back the same way via applyBoard3DToItems. Re-opening the 3D Studio keeps those 3D-only settings.
 */
import { netRegions, type NetItem } from "@/lib/design/boardNetArea";
import type { DepthAxis, LinearDepthAnchor } from "@/components/scene3d/types";
import type { PoolStairConfig, ContourSeatingConfig } from "@/components/scene3d/poolAssetTypes";

export const BOARD_3D_KEY = "studio3d.globalDesign.v1";
export const BOARD_3D_EVENT = "studio3d:globalDesign";

type XZ = { x: number; z: number };
/** `postColor` is used by vinyl fences (posts colored apart from panels). */
export interface Fence3D { pts: XZ[]; style: string; height: number; color: string; postColor?: string; itemId?: string }
export interface Screen3D { pts: XZ[]; height: number; color: string; roof?: "mansard" | "flat"; itemId?: string }
export interface Surface3D { kind: "turf" | "deck"; color: string; /** Catalog photo for turf (real texture in 3D). */ image?: string; regions: XZ[][][]; itemId?: string; /** Own paver tile size; unset = main pool's. */ scale?: number }
/** Extra water bodies (every pool/spa after the first, which is the studio's main pool). */
export interface Water3D {
  itemId?: string;
  kind: "pool" | "spa"; label: string; pts: XZ[];
  /** Flat depth, used when no profile is set. */
  depth: number;
  /** Own shallow→deep profile + axis, in this water body's centred plan coords. */
  anchors?: LinearDepthAnchor[];
  axis?: DepthAxis;
  /** Catalog photo URLs (same library as the main pool); hex kept for legacy saves. */
  finish: string; coping: string; waterline: string; copingWidth: number; copingHeight?: number;
  /** Own stairs / contour seats, same configs the main pool's asset manager edits. */
  stairs?: PoolStairConfig[]; seating?: ContourSeatingConfig[]; chairs?: PoolChairConfig[];
  /** Water surface hidden for this body only (header water button while it is selected). */
  waterOff?: boolean;
  /** Per-body texture scales; when unset they follow the main pool's scales. */
  finishScale?: number; copingScale?: number; waterlineScale?: number;
}
export interface Board3D {
  pool?: { w: number; l: number };
  /** First pool/spa = the studio's main pool: its board id, outline (centred on origin) and finish photo. */
  primaryId?: string; primaryPts?: XZ[]; primaryFinish?: string; origin?: { x: number; y: number }; fences: Fence3D[]; screens: Screen3D[]; surfaces: Surface3D[]; waters?: Water3D[] }

/** 3D-side edits from the element widgets. Keeps the same storage + event. */
export function updateBoard3D(fn: (d: Board3D) => Board3D) {
  const cur = loadBoard3D(); if (!cur) return;
  saveBoard3D(fn(cur));
}

type BoardProduct = { id: string; color: string; size?: { w: number; l: number } };

/** Keeps only the 3D-edited fields of a previous hand-off entry. */
const pick = <T extends object>(o: T | undefined, keys: (keyof T)[]): Partial<T> => { const r: Partial<T> = {}; if (o) keys.forEach((k) => { if (o[k] !== undefined) r[k] = o[k]; }); return r; };
const centroid = (pts: { x: number; y: number }[]) => pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 });

export function boardTo3D(items: NetItem[], productOf: (id: string) => BoardProduct | undefined, productIdOf: (it: NetItem) => string, finishUrlOf?: (it: NetItem) => string | undefined): Board3D {
  const last = loadBoard3D();
  const prev = new Map((last?.waters ?? []).filter((w) => w.itemId).map((w) => [w.itemId!, w]));
  const prevF = new Map((last?.fences ?? []).filter((f) => f.itemId).map((f) => [f.itemId!, f]));
  const prevS = new Map((last?.screens ?? []).filter((f) => f.itemId).map((f) => [f.itemId!, f]));
  const pool = items.find((i) => i.kind === "pool") ?? items.find((i) => i.kind === "spa");
  let c = { x: 0, y: 0 };
  if (pool) c = centroid(pool.pts);
  else if (items.length) { const all = items.flatMap((i) => i.pts); const xs = all.map((p) => p.x), ys = all.map((p) => p.y); c = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }; }
  const to = (p: { x: number; y: number }): XZ => ({ x: p.x - c.x, z: p.y - c.y });
  const out: Board3D = { origin: c, fences: [], screens: [], surfaces: [], waters: [] };
  if (pool) {
    const p = productOf(productIdOf(pool)); if (p?.size) out.pool = p.size;
    out.primaryId = pool.id; out.primaryPts = pool.pts.map(to); out.primaryFinish = finishUrlOf?.(pool);
  }
  for (const it of items) {
    const p = productOf(productIdOf(it)); if (!p) continue;
    const parts = p.id.split(":");
    if ((it.kind === "pool" || it.kind === "spa") && it !== pool) {
      const old = prev.get(it.id);
      out.waters!.push({
        depth: it.kind === "spa" ? 3 : 5, finish: "#5fb7d4", coping: "#d8d2c8", waterline: "#2f6f8f", copingWidth: 1,
        ...old,
        ...(finishUrlOf?.(it) && !old?.finish?.startsWith("/") ? { finish: finishUrlOf(it)! } : {}),
        itemId: it.id, kind: it.kind, label: (p as BoardProduct & { label?: string }).label ?? it.kind, pts: it.pts.map(to),
      });
    }
    else if (it.kind === "fence") out.fences.push({ height: parseFloat(parts[3]) || 4, color: p.color, ...pick(prevF.get(it.id), ["height", "color"]), itemId: it.id, pts: it.pts.map(to), style: parts[1] });
    else if (it.kind === "enclosure") out.screens.push({ height: parseFloat(parts[3]) || 10, color: p.color, ...pick(prevS.get(it.id), ["height", "color", "roof"]), itemId: it.id, pts: it.pts.map(to) });
    else if (it.kind === "turf" || it.kind === "deck") out.surfaces.push({ itemId: it.id, kind: it.kind, color: p.color, regions: netRegions(items, it).map((poly) => poly.map((r) => r.map(to))) });
  }
  return out;
}

/**
 * 3D → board: returns the board items with every extra pool/spa outline taken
 * from the 3D Studio (matched by item id). Returns the same array when nothing
 * changed so callers can skip a state update.
 */
export function applyBoard3DToItems<T extends { id: string; pts: { x: number; y: number }[] }>(items: T[], data: Board3D | null): T[] {
  if (!data?.origin) return items;
  const o = data.origin;
  const byId = new Map<string, { pts: XZ[] }>((data.waters ?? []).filter((w) => w.itemId).map((w) => [w.itemId!, w]));
  if (data.primaryId && data.primaryPts) byId.set(data.primaryId, { pts: data.primaryPts });
  let changed = false;
  const next = items.map((it) => {
    const w = byId.get(it.id); if (!w || w.pts.length < 3) return it;
    const pts = w.pts.map((p) => ({ x: Math.round((p.x + o.x) * 100) / 100, y: Math.round((p.z + o.y) * 100) / 100 }));
    const same = pts.length === it.pts.length && pts.every((p, i) => Math.abs(p.x - it.pts[i].x) < 0.01 && Math.abs(p.y - it.pts[i].y) < 0.01);
    if (same) return it;
    changed = true; return { ...it, pts };
  });
  return changed ? next : items;
}

export function saveBoard3D(data: Board3D) {
  try { localStorage.setItem(BOARD_3D_KEY, JSON.stringify(data)); } catch { /* quota */ }
  window.dispatchEvent(new Event(BOARD_3D_EVENT));
}
export function loadBoard3D(): Board3D | null {
  try { const raw = localStorage.getItem(BOARD_3D_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

/* ---------- per-water depth helpers (shared by renderer + widget) ---------- */
export const waterCenter = (pts: XZ[]) => {
  const xs = pts.map((p) => p.x), zs = pts.map((p) => p.z);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2 };
};
/** Default axis: along the longer side, through the centre (local coords). */
export function waterAxis(w: Water3D): DepthAxis {
  if (w.axis) return w.axis;
  const xs = w.pts.map((p) => p.x), zs = w.pts.map((p) => p.z);
  const hx = (Math.max(...xs) - Math.min(...xs)) / 2, hz = (Math.max(...zs) - Math.min(...zs)) / 2;
  return hx >= hz ? { start: { x: -hx, z: 0 }, end: { x: hx, z: 0 } } : { start: { x: 0, z: -hz }, end: { x: 0, z: hz } };
}
/** Floor depth (ft, positive) at a world XZ point of this water body. */
export function waterDepthAt(w: Water3D, x: number, z: number): number {
  if (!w.anchors?.length) return w.depth;
  const c = waterCenter(w.pts), a = waterAxis(w);
  const lx = x - c.x, lz = z - c.z;
  const dx = a.end.x - a.start.x, dz = a.end.z - a.start.z, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((lx - a.start.x) * dx + (lz - a.start.z) * dz) / L2));
  const s = [...w.anchors].sort((p, q) => p.position - q.position);
  if (t <= s[0].position) return s[0].depth;
  for (let i = 0; i < s.length - 1; i++) if (t <= s[i + 1].position) { const sp = s[i + 1].position - s[i].position || 1; return s[i].depth + ((t - s[i].position) / sp) * (s[i + 1].depth - s[i].depth); }
  return s[s.length - 1].depth;
}
