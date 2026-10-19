/**
 * Planting edits shared by the look presets and Genius.
 *
 * Everything works in feet and converts to board pixels (10 px = 1 ft) at the
 * edge, so a request like "a hedge along the back" lands on real spacing.
 */
import { landscapingPlants, type LandscapingPlant } from "@/data/landscapingData";
import {
  LANDSCAPE_PX_PER_FT as PX,
  sampleBed,
  type BedFillId,
  type LandscapeBed,
  type LandscapeLayout,
  type LandscapePlanting,
  type LandscapePoint,
} from "./landscapeEstimate";
import { drawnSpreadFt, getPlantSpec } from "./plantSpecs";

export type Side = "back" | "front" | "left" | "right" | "around" | "pool" | "center";
export type Pattern = "hedge" | "cluster" | "row" | "accent";

export interface PlantOp {
  query: string;
  count?: number;
  pattern?: Pattern;
  side?: Side;
  size?: string;
}

export interface LandscapeEdit {
  summary?: string;
  add?: PlantOp[];
  remove?: string[];
  clear?: boolean;
  bedFill?: BedFillId;
  newBed?: { side: Side; depthFt?: number; fill?: BedFillId };
  irrigation?: boolean;
}

/** Yard frame in feet used when the plan is empty. */
export interface Frame {
  x0: number; y0: number; x1: number; y1: number;
  /** Optional obstacle (pool + deck) in feet */
  hole?: { x0: number; y0: number; x1: number; y1: number };
}

const uid = () => Math.random().toString(36).slice(2, 9);

/** Best catalog match for free text ("palm", "red ixora", "privacy hedge"). */
export function findPlant(query: string): LandscapingPlant | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const alias: Record<string, string> = {
    "privacy hedge": "clusia", hedge: "clusia", privacy: "clusia", palm: "palm", palms: "palm",
    "shade tree": "oak", tree: "oak", flowers: "ixora", "ground cover": "perennial peanut",
    grass: "muhly", "ornamental grass": "muhly",
  };
  const term = alias[q] ?? q;
  const words = term.split(/\s+/).filter((w) => w.length > 2).map((w) => w.replace(/s$/, ""));
  let best: LandscapingPlant | null = null;
  let bestScore = 0;
  for (const p of landscapingPlants) {
    const hay = `${p.name} ${p.category} ${p.variants.map((v) => v.label).join(" ")}`.toLowerCase();
    let s = 0;
    for (const w of words) if (hay.includes(w)) s += p.name.toLowerCase().includes(w) ? 3 : 1;
    if (s > bestScore) { bestScore = s; best = p; }
  }
  return best;
}

/** Bounding frame of the current plan (or a default 60×40 ft yard). */
export function frameOf(layout: LandscapeLayout, hole?: Frame["hole"], boundsFt?: { x0: number; y0: number; x1: number; y1: number }): Frame {
  /* A real boundary (the fence/screen line) beats the synthesized yard:
   * everything composes INSIDE the fenced area. */
  if (boundsFt && boundsFt.x1 - boundsFt.x0 >= 20 && boundsFt.y1 - boundsFt.y0 >= 14) return { ...boundsFt, hole };
  const pts: LandscapePoint[] = [
    ...layout.beds.flatMap((b) => b.points),
    ...layout.plantings.map((p) => ({ x: p.x, y: p.y })),
  ];
  if (hole) pts.push({ x: (hole.x0 - 12) * PX, y: (hole.y0 - 12) * PX }, { x: (hole.x1 + 12) * PX, y: (hole.y1 + 12) * PX });
  if (pts.length < 2) return { x0: 0, y0: 0, x1: 60, y1: 40, hole };
  const xs = pts.map((p) => p.x / PX), ys = pts.map((p) => p.y / PX);
  const f = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), hole };
  if (f.x1 - f.x0 < 30) f.x1 = f.x0 + 30;
  if (f.y1 - f.y0 < 20) f.y1 = f.y0 + 20;
  return f;
}

/** Line (in feet) a pattern runs along for a given side. */
function lineFor(side: Side, f: Frame): [LandscapePoint, LandscapePoint][] {
  const inset = 2;
  const { x0, y0, x1, y1 } = f;
  const back: [LandscapePoint, LandscapePoint] = [{ x: x0 + inset, y: y0 + inset }, { x: x1 - inset, y: y0 + inset }];
  const front: [LandscapePoint, LandscapePoint] = [{ x: x0 + inset, y: y1 - inset }, { x: x1 - inset, y: y1 - inset }];
  const left: [LandscapePoint, LandscapePoint] = [{ x: x0 + inset, y: y0 + inset }, { x: x0 + inset, y: y1 - inset }];
  const right: [LandscapePoint, LandscapePoint] = [{ x: x1 - inset, y: y0 + inset }, { x: x1 - inset, y: y1 - inset }];
  if (side === "pool" && f.hole) {
    const h = f.hole, o = 3;
    return [
      [{ x: h.x0 - o, y: h.y0 - o }, { x: h.x1 + o, y: h.y0 - o }],
      [{ x: h.x1 + o, y: h.y0 - o }, { x: h.x1 + o, y: h.y1 + o }],
      [{ x: h.x1 + o, y: h.y1 + o }, { x: h.x0 - o, y: h.y1 + o }],
      [{ x: h.x0 - o, y: h.y1 + o }, { x: h.x0 - o, y: h.y0 - o }],
    ];
  }
  if (side === "around" || side === "pool") return [back, right, [front[1], front[0]], [left[1], left[0]]];
  return [{ back, front, left, right, center: back }[side] ?? back];
}

const insideHole = (x: number, y: number, h?: Frame["hole"]) =>
  !!h && x > h.x0 - 1 && x < h.x1 + 1 && y > h.y0 - 1 && y < h.y1 + 1;

/** Places plants for one op and returns the new plantings. */
export function placeOp(op: PlantOp, f: Frame): LandscapePlanting[] {
  const plant = findPlant(op.query);
  if (!plant) return [];
  const variant = plant.variants[0];
  const size = variant.sizes.find((s) => s.size === op.size)?.size ?? variant.sizes[Math.min(1, variant.sizes.length - 1)].size;
  const spec = getPlantSpec(plant, variant.label);
  const spacing = Math.max(spec.spacingFt, drawnSpreadFt(spec, size) * 0.9);
  const pattern: Pattern = op.pattern ?? (/(hedge|privacy)/i.test(op.query) ? "hedge" : plant.category === "Trees" || plant.category === "Palms" ? "accent" : "cluster");
  const mk = (x: number, y: number): LandscapePlanting => ({
    id: uid(), plantId: plant.id, variantId: variant.id, size, x: x * PX, y: y * PX, rot: Math.random() * Math.PI * 2,
  });
  const out: LandscapePlanting[] = [];
  const side = op.side ?? (pattern === "hedge" ? "back" : "center");
  if (pattern === "hedge" || pattern === "row") {
    for (const [a, b] of lineFor(side, f)) {
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const n = Math.max(1, Math.floor(len / spacing));
      for (let i = 0; i <= n; i++) {
        const t = n === 0 ? 0.5 : i / n;
        const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        if (!insideHole(x, y, f.hole)) out.push(mk(x, y));
        if (op.count && out.length >= op.count) return out;
      }
    }
    return out;
  }
  const count = Math.max(1, Math.min(op.count ?? (pattern === "accent" ? 3 : 7), 60));
  const lines = lineFor(side, f);
  const [a, b] = lines[0];
  const cx = side === "center" ? (f.x0 + f.x1) / 2 : (a.x + b.x) / 2;
  const cy = side === "center" ? (f.y0 + f.y1) / 2 : (a.y + b.y) / 2 + (side === "back" ? spacing : side === "front" ? -spacing : 0);
  // golden-angle drift: natural, never stamped, deterministic per count
  for (let i = 0; out.length < count && i < count * 4; i++) {
    let x: number, y: number;
    if (pattern === "accent" && lines.length > 1) {
      const [p, q] = lines[i % lines.length];
      const t = (Math.floor(i / lines.length) + 0.5) / Math.ceil(count / lines.length);
      x = p.x + (q.x - p.x) * t; y = p.y + (q.y - p.y) * t;
    } else if (pattern === "accent") {
      const t = (i + 0.5) / count;
      x = a.x + (b.x - a.x) * t; y = a.y + (b.y - a.y) * t;
    } else {
      const r = spacing * Math.sqrt(i) * 0.95, th = i * 2.39996;
      x = cx + r * Math.cos(th); y = cy + r * Math.sin(th);
    }
    if (!insideHole(x, y, f.hole)) out.push(mk(x, y));
  }
  return out;
}

/** Rectangular bed strip (ft) along a side. */
export function bedAlong(side: Side, f: Frame, depthFt = 5, fill: BedFillId = "mulch-brown"): LandscapeBed {
  const { x0, y0, x1, y1 } = f;
  const d = depthFt;
  const r = (ax: number, ay: number, bx: number, by: number) =>
    [{ x: ax, y: ay }, { x: bx, y: ay }, { x: bx, y: by }, { x: ax, y: by }];
  let pts: LandscapePoint[];
  if (side === "pool" && f.hole) {
    const h = f.hole;
    pts = r(h.x0 - d - 1, h.y0 - d - 1, h.x1 + d + 1, h.y0 - 1);
  } else {
    pts = side === "front" ? r(x0, y1 - d, x1, y1)
      : side === "left" ? r(x0, y0, x0 + d, y1)
      : side === "right" ? r(x1 - d, y0, x1, y1)
      : r(x0, y0, x1, y0 + d);
  }
  return {
    id: uid(), closed: true, fill, edged: true,
    points: pts.map((p) => ({ x: p.x * PX, y: p.y * PX })),
    curves: pts.map(() => true),
  };
}

/** Applies an edit and returns the new layout (never mutates). */
export interface KeepOutOpts { polys: LandscapePoint[][]; clearFt?: number; boundsFt?: { x0: number; y0: number; x1: number; y1: number } }

const distToSeg = (p: LandscapePoint, a: LandscapePoint, b: LandscapePoint): number => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

/** The placement law for fences and screens: no planting inside a barrier
 * polygon or within clearance of its line. Beds may hug a fence; plants may
 * not sit on it. Returns the layout with offending plantings removed. */
export function filterKeepOut(layout: LandscapeLayout, polys: LandscapePoint[][], clearFt = 1.2): LandscapeLayout {
  if (!polys.length) return layout;
  const clearPx = clearFt * PX;
  /* A fence or screen is a LINE, not a solid: the yard inside it is exactly
   * where plants belong ("inside the fenced area"). Only the line itself —
   * within clearance — is forbidden ground. */
  const violates = (p: LandscapePoint) => polys.some((poly) => {
    for (let i = 1; i < poly.length; i++) if (distToSeg(p, poly[i - 1], poly[i]) < clearPx) return true;
    if (poly.length >= 3) { const a = poly[poly.length - 1], b = poly[0]; if (a.x !== b.x || a.y !== b.y) if (distToSeg(p, a, b) < clearPx) return true; }
    return false;
  });
  const plantings = layout.plantings.filter((p) => !violates(p));
  return plantings.length === layout.plantings.length ? layout : { ...layout, plantings };
}

export function applyLandscapeEdit(layout: LandscapeLayout, edit: LandscapeEdit, hole?: Frame["hole"], opts?: KeepOutOpts): LandscapeLayout {
  let beds = edit.clear ? [] : [...layout.beds];
  let plantings = edit.clear ? [] : [...layout.plantings];
  const f = frameOf({ beds, plantings }, hole, opts?.boundsFt);
  if (edit.remove?.length) {
    const ids = new Set(edit.remove.map((q) => findPlant(q)?.id).filter(Boolean) as string[]);
    plantings = plantings.filter((p) => !ids.has(p.plantId));
  }
  if (edit.newBed) beds.push(bedAlong(edit.newBed.side, f, edit.newBed.depthFt, edit.newBed.fill));
  if (edit.bedFill) beds = beds.map((b) => ({ ...b, fill: edit.bedFill! }));
  for (const op of edit.add ?? []) plantings.push(...placeOp(op, f));
  const out = { ...layout, beds, plantings, irrigation: edit.irrigation ?? layout.irrigation };
  return opts?.polys?.length ? filterKeepOut(out, opts.polys, opts.clearFt) : out;
}

/** Deterministic phrase parser — works offline and before Genius replies. */
export function parseLocalEdit(text: string): LandscapeEdit | null {
  const t = text.toLowerCase();
  const edit: LandscapeEdit = {};
  const side: Side | undefined =
    /around the pool|by the pool|near the pool|pool ?side/.test(t) ? "pool"
      : /around|perimeter|all sides/.test(t) ? "around"
      : /back|rear/.test(t) ? "back" : /front/.test(t) ? "front"
      : /left/.test(t) ? "left" : /right/.test(t) ? "right" : undefined;
  const num = Number((t.match(/\b(\d{1,2})\b/) ?? [])[1]) || undefined;
  if (/clear|start over|remove everything/.test(t)) edit.clear = true;
  if (/irrigation|drip|sprinkler/.test(t)) edit.irrigation = !/no |remove|without/.test(t);
  const fills: [RegExp, BedFillId][] = [[/black mulch/, "mulch-black"], [/mulch/, "mulch-brown"], [/shell/, "shell"], [/river rock|rock/, "river-rock"], [/lava/, "lava-rock"], [/sod|lawn/, "sod"]];
  for (const [re, id] of fills) if (re.test(t)) { if (/bed/.test(t) && /add|new|make|create/.test(t)) edit.newBed = { side: side ?? "back", fill: id }; else edit.bedFill = id; break; }
  if (/low.?maint/.test(t)) edit.bedFill = "river-rock";
  const add: PlantOp[] = [];
  if (/hedge|privacy/.test(t)) add.push({ query: "clusia", pattern: "hedge", side: side ?? "back" });
  const named = t.match(/(?:add|plant|put|place)\s+(?:a |an |some |\d+\s+)?([a-z' ]+?)(?:\s+(?:along|around|by|near|on|in|at|to)\b|$|,|\.)/);
  if (named && !/hedge|privacy|bed/.test(named[1])) add.push({ query: named[1].trim(), count: num, side });
  if (add.length) edit.add = add;
  const remove = t.match(/remove (?:the |all )?([a-z' ]+)/);
  if (remove && !edit.clear) edit.remove = [remove[1].trim()];
  /* "add drip irrigation" is an irrigation request, not a plant. */
  if (edit.add) { edit.add = edit.add.filter((o) => !/irrigation/.test(o.query)); if (!edit.add.length) delete edit.add; }
  if (!Object.keys(edit).length) return null;
  edit.summary = "Updated the plan as asked.";
  return edit;
}

/** Outline helper so other boards can draw a bed exactly as planted. */
export const bedOutlineFt = (b: LandscapeBed) => sampleBed(b).map((p) => ({ x: p.x / PX, y: p.y / PX }));
