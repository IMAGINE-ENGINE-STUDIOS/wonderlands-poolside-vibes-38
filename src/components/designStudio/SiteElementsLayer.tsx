/**
 * SiteElementsLayer — the Global Design Board features inside the 2D Design Studio.
 * Imagine Engine Studios Corp.
 *
 * The pool, its auto-attached deck, extra pools/spas and features stay owned by
 * PoolBuilder (the canonical 2D pool + deck tool). This layer draws the rest of
 * the property on the SAME board, in the SAME world pixels (10 px = 1 ft) and
 * with the SAME pan/zoom transform PoolBuilder uses, so everything lines up:
 *   - Fences: material → height → color, then click the line on the board.
 *   - Screen enclosures: cage style → height → frame color, then click the footprint.
 *   - Artificial turf: product, then click the area (pools/deck are cut out).
 * Product-first: nothing can be drawn until a product is chosen.
 * Rates come only from the site's own price lists (fence configurator, screen
 * enclosure pricing, turf catalog) — never invented here.
 * Elements persist per browser and are handed to the 3D Studio by `siteElementsTo3D`.
 */
import * as React from "react";
import { Fence, Grid2x2, Layers, MousePointer2, Trash2, Undo2, Check, X, LayoutList } from "lucide-react";
import usePersistentState from "@/hooks/usePersistentState";
import { cn } from "@/lib/utils";
import { FENCE_HEIGHTS as CONFIG_FENCE_HEIGHTS, FENCE_GATES } from "@/data/fenceConfigurator";
import { ENCLOSURE_DOORS } from "@/data/screenEnclosureConfigurator";
import { SCREEN_ENCLOSURE_PRICING } from "@/utils/paverPricing";
import { artificialGrassOptions, getGrassPricePerSqFt } from "@/data/artificialGrassData";
import aluFenceImg from "@/assets/fencing/aluminum-panel-2.webp";
import vinylFenceAsset from "@/assets/fencing/vinyl-fence.avif.asset.json";
/* Seamless full-bleed grass (catalog swatches carry white borders that tile as a grid). Credit: Imagine Engine Studios Corp */
import grassTexture from "@/assets/turf/grass-texture.avif";
import { paverTypes } from "@/data/paverData";
import type { StudioMaterials } from '@/lib/design/studioMaterials';
import { buildFinishTextures } from '@/data/textureLibrary';
import { densifyPoolOutline } from "@/utils/curveUtils";
import { PoolDesignerHeader, POOL_SHELL_PRICE_PER_SQFT } from "@/components/scene3d/PoolDesignerHeader";
import { getDeckPricePerSqFt } from "@/utils/poolBuilderPricing";
import screenPremiumImg from "@/assets/enclosures/screen-enclosure-premium.webp";

/* ---------- catalog (same lists as the Global Design Board) ---------- */
const MAIN_FENCE_IMG = "/media/96e12412-10ac-45a5-b879-6ed8fc8e8046.webp";
const MAIN_SCREEN_IMG = "/media/8bf11ea9-c402-4834-a163-0876545498bd.webp";
export const FENCE_MATERIALS = [
  { id: "alu", label: "Aluminum picket", image: MAIN_FENCE_IMG },
  { id: "vinyl", label: "Vinyl privacy", image: (vinylFenceAsset as { url: string }).url },
  { id: "glass", label: "Glass pool fence", image: aluFenceImg },
];
export const FENCE_COLORS = [{ id: "black", hex: "#1f1f1f" }, { id: "bronze", hex: "#6b4a2b" }, { id: "white", hex: "#f4f4f2" }];
export const FENCE_HEIGHTS = CONFIG_FENCE_HEIGHTS.map((h) => ({ ft: h.heightIn / 12, rate: h.pricePerFt, label: h.label }));
export const SCREEN_STYLES = [
  { id: "standard", label: "Standard cage", rate: SCREEN_ENCLOSURE_PRICING.standard, heights: [8, 10], image: MAIN_SCREEN_IMG },
  { id: "deluxe", label: "Deluxe cage", rate: SCREEN_ENCLOSURE_PRICING.deluxe, heights: [10, 12], image: MAIN_SCREEN_IMG },
  { id: "premium", label: "2-story cage", rate: SCREEN_ENCLOSURE_PRICING.premium, heights: [18, 20], image: screenPremiumImg },
];
export const SCREEN_COLORS = [{ id: "bronze", hex: "#6b4a2b" }, { id: "white", hex: "#e9e9e6" }, { id: "black", hex: "#222222" }];
const TURF_COLORS: Record<string, string> = { "light-green": "#7fb24a", "dark-green": "#3f7a32", "natural-green": "#5b9a40", emerald: "#2f8a4a", olive: "#6f7f3a" };
export const TURFS = artificialGrassOptions.map((g) => ({ id: g.id, label: `${g.name} turf`, rate: getGrassPricePerSqFt(g.name), color: TURF_COLORS[g.id] ?? "#5b9a40", image: g.image, texture: grassTexture }));

/* ---------- model ---------- */
export type SiteKind = "fence" | "enclosure" | "turf" | "deck";
type Pt = { x: number; y: number };
export interface SiteElement {
  id: string; kind: SiteKind; pts: Pt[]; label: string; detail: string;
  color: string; height?: number; style?: string; rate: number; unit: "lf" | "sqft";
  /** Fence gates / screen doors from the original drawing boards: segment index, position 0-1 along it, catalog model. */
  textureUrl?: string; textureScale?: number; details3D?: any;
  gates?: Array<{ seg: number; t: number; typeId: string }>;
}
/** Gate (fence) or door (screen) catalog option for an element — same catalogs as the original drawing boards. */
export const gateOptionsFor = (kind: SiteKind) => (kind === "fence" ? FENCE_GATES : kind === "enclosure" ? ENCLOSURE_DOORS : []);
export const gateOption = (kind: SiteKind, id: string) => gateOptionsFor(kind).find((g) => g.id === id) as { id: string; label: string; widthFt: number; price: number } | undefined;
/** Gate/door take-off lines for one element. */
export const gateLines = (e: SiteElement) => {
  const m = new Map<string, number>();
  (e.gates ?? []).forEach((g) => m.set(g.typeId, (m.get(g.typeId) ?? 0) + 1));
  return [...m].map(([id, n]) => { const o = gateOption(e.kind, id); return o ? { name: `${e.kind === "fence" ? "Fence door" : "Screen door"} · ${o.label}${n > 1 ? ` × ${n}` : ""}`, price: o.price * n, n, label: o.label } : null; }).filter(Boolean) as Array<{ name: string; price: number; n: number; label: string }>;
};
type Choice = Omit<SiteElement, "id" | "pts" | "kind"> & { kind: SiteKind };
/** Drawn decks use the main page paver list (photo + rate per sq ft). */
export const DECK_PAVERS = paverTypes.filter((x) => x.category === "paver").map((x) => ({ id: x.id, label: x.name, rate: x.basePrice, image: x.image }));
/** Catalog photo of the exact product a site element was drawn with (quotes use it; never a random image). */
export function siteElementImage(e: SiteElement): string | undefined {
  if (e.kind === "fence") return FENCE_MATERIALS.find((m) => m.id === e.style)?.image;
  if (e.kind === "enclosure") return SCREEN_STYLES.find((m) => m.id === e.style)?.image;
  if (e.kind === "deck") return DECK_PAVERS.find((m) => m.id === e.style)?.image;
  return TURFS.find((m) => m.label === e.label)?.image;
}
/** Pavers grouped by family (Appian, Catalina Grana, …) for a symmetrical picker. */
const DECK_FAMILIES: [string, typeof DECK_PAVERS][] = (() => {
  const fams = ["Catalina Grana", "Gloca Mirage", "Appian", "Catalina", "Coralina", "Travertine"];
  const m = new Map<string, typeof DECK_PAVERS>();
  for (const d of DECK_PAVERS) { const f = fams.find((x) => d.label.startsWith(x)) ?? "Other"; m.set(f, [...(m.get(f) ?? []), d]); }
  return [...m.entries()];
})();
const deckChoice = (id?: string): Choice => { const d = DECK_PAVERS.find((x) => x.id === id) ?? DECK_PAVERS[0]; return { kind: "deck", label: d?.label ?? "Deck", detail: "Paver deck", color: "#c9b79c", style: d?.id, rate: d?.rate ?? 0, unit: "sqft" }; };
const DECK_CHOICE: Choice = deckChoice();
/** Pool outline exactly as the canvas draws it (curves sampled) so cuts follow curves. */
const poolRing = (pts: Pt[]) => (pts.length >= 3 ? densifyPoolOutline(pts as never, "freeform") : pts);
/** Fence posts: every corner plus one every `step` px along each run (GDB V1 look). */
const fencePosts = (pts: Pt[], step: number): Pt[] => {
  const out: Pt[] = pts.length ? [pts[0]] : [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.round(L / (step || 1)));
    for (let k = 1; k <= n; k++) out.push({ x: a.x + (b.x - a.x) * (k / n), y: a.y + (b.y - a.y) * (k / n) });
  }
  return out;
};
const KIND_LABEL: Record<SiteKind, string> = { fence: "Fence", enclosure: "Screen", turf: "Turf", deck: "Deck" };

/** Shared surface ownership in world feet: existing decks/turf win; water and coping are protected. */
export function studioNetItems(all: SiteElement[], poolPts: Pt[], deckPts: Pt[], scale: number, extras: Array<{ id: string; type?: string; points: Pt[]; shape?: string; materials?: StudioMaterials; details3D?: any }> = [], extraDecks: Record<string, Pt[]> = {}) {
  const f = (p: Pt) => ({ x: p.x / scale, y: p.y / scale });
  const waters = [ ...(poolPts.length >= 3 ? [{ id: '__pool', kind: 'pool', pts: poolRing(poolPts).map(f), width: 1 }] : []), ...extras.filter(p => p.points.length >= 3).map(p => ({ id: p.id, kind: p.type === 'spa' ? 'spa' : 'pool', pts: densifyPoolOutline(p.points as never, p.shape ?? 'freeform').map(f), width: p.details3D?.copingWidth ?? 1 })) ];
  const coping = waters.map(w => ({ id: `coping:${w.id}`, kind: 'coping', pts: mitredOffsetRing(w.pts.map(p => ({ x: p.x, z: p.y })), w.width, { miterLimit: 2.5 }).offset.map(p => ({ x: p.x, y: p.z })) }));
  // Main attached deck, extra attached decks, then drawn surfaces in creation order.
  return [...waters, ...coping, ...(deckPts.length >= 3 ? [{ id: '__deck', kind: 'deck', pts: deckPts.map(f) }] : []), ...extras.filter(p => (extraDecks[p.id]?.length ?? 0) >= 3).map(p => ({ id: `__deck_${p.id}`, kind: 'deck', pts: extraDecks[p.id].map(f) })), ...all.map(e => ({ id: e.id, kind: e.kind, pts: e.pts.map(f) }))];
}
export function turfNetSqft(e: SiteElement, all: SiteElement[], poolPts: Pt[], deckPts: Pt[], scale: number, extras: Array<{ id: string; points: Pt[]; shape?: string }> = [], extraDecks: Record<string, Pt[]> = {}) {
  const net = studioNetItems(all, poolPts, deckPts, scale, extras, extraDecks);
  return computeNetAreas(net).get(e.id) ?? 0;
}
export interface BoardView {
  width: number; height: number; pan: { x: number; y: number }; zoom: number; scale: number;
  /** Main pool + its deck (PoolBuilder state) — turf is cut around both. */
  poolPts?: Pt[]; deckPts?: Pt[]; deckMode?: boolean; addMode?: boolean; poolDrawMode?: boolean;
  setDeck?: (pts: Pt[]) => void; setPool?: (pts: Pt[]) => void; endDeckMode?: () => void; erasePool?: () => void;
  /** Extra pools/spas and their attached decks (PoolBuilder state). */
  extraPools?: { id: string; type?: string; points: Pt[]; shape?: string }[]; extraDecks?: Record<string, Pt[]>;
  setExtraPool?: (id: string, pts: Pt[]) => void; setExtraDeck?: (id: string, pts: Pt[]) => void; eraseExtraPool?: (id: string) => void;
}

export const SITE_ELEMENTS_KEY = "design_studio_site_elements_v1";
const ft = (px: number, scale: number) => px / scale;
const lengthFt = (pts: Pt[], scale: number) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0) / scale;
const areaFt = (pts: Pt[], scale: number) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p.x * q.y - q.x * p.y; }, 0) / 2) / (scale * scale);
export const elementQty = (e: SiteElement, scale: number) => (e.unit === "lf" ? lengthFt(e.pts, scale) : areaFt(e.pts, scale));
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Read-only hook for other parts of the studio (take-off, 3D hand-off). */
export function useSiteElements(): [SiteElement[], React.Dispatch<React.SetStateAction<SiteElement[]>>] {
  const [v, setV] = usePersistentState<SiteElement[]>(SITE_ELEMENTS_KEY, []);
  /* Keep every reader (board layer, header take-off) in step. */
  React.useEffect(() => {
    const on = (e: Event) => setV((e as CustomEvent<SiteElement[]>).detail);
    window.addEventListener(SITE_EVENT, on); return () => window.removeEventListener(SITE_EVENT, on);
  }, [setV]);
  const set: React.Dispatch<React.SetStateAction<SiteElement[]>> = React.useCallback((u) => {
    setV((prev) => { const next = typeof u === "function" ? (u as (p: SiteElement[]) => SiteElement[])(prev) : u; queueMicrotask(() => window.dispatchEvent(new CustomEvent(SITE_EVENT, { detail: next }))); return next; });
  }, [setV]);
  return [v, set];
}
export const SITE_ELEMENTS_EVENT = "design-studio:site-elements";
const SITE_EVENT = SITE_ELEMENTS_EVENT;

interface Props {
  view: BoardView | null;
  /** Pool + deck totals from PoolBuilder so the take-off covers the whole property. */
  poolTotals?: { pool: number; deck: number; coping: number; features: number; deckArea: number; area: number } | null;
}

export const SiteElementsLayer: React.FC<Props> = ({ view, poolTotals }) => {
  const [items, setItems] = useSiteElements();
  const layerState = useSceneLayers();
  const [tab, setTabRaw] = React.useState<SiteKind | null>(null);
  const [boardOpen, setBoardOpen] = React.useState(false);
  // One floating rail: opening a site panel closes the 2D tool flyout and vice-versa.
  const setTab = React.useCallback((t: SiteKind | null) => { setTabRaw(t); if (t) window.dispatchEvent(new CustomEvent("studio-rail:open", { detail: "site" })); }, []);
  React.useEffect(() => { const h = (e: Event) => { if ((e as CustomEvent).detail !== "site") { setTabRaw(null); setBoardOpen(false); } }; window.addEventListener("studio-rail:open", h); return () => window.removeEventListener("studio-rail:open", h); }, []);
  const [choice, setChoice] = React.useState<Choice | null>(null);
  const [draft, setDraft] = React.useState<Pt[]>([]);
  const [hover, setHover] = React.useState<Pt | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  /* Spill-over edges (water falling over part of a pool/spa spline). Imagine Engine Studios Corp. */
  const spills = useSpills();
  const [spillSel, setSpillSel] = React.useState<string | null>(null);
  /* Materials panel (DesignerToolPanel) listens to the board selection and restyles it here. */
  React.useEffect(() => {
    const kind = !selected ? null : selected === "__pool" || selected.startsWith("__xp:") ? "pool" : selected === "__deck" || selected.startsWith("__xd:") ? "deck" : items.find((x) => x.id === selected)?.kind ?? null;
    window.dispatchEvent(new CustomEvent("design-studio:selection", { detail: { id: kind ? selected : null, kind, color: items.find((x) => x.id === selected)?.color, style: items.find((x) => x.id === selected)?.style } }));
  }, [selected, items]);
  React.useEffect(() => {
    const onSel = (e: Event) => setSelected((e as CustomEvent<string | null>).detail);
    const onStyle = (e: Event) => { const d = (e as CustomEvent<{ id: string; patch: Partial<SiteElement> }>).detail; setItems((p) => p.map((x) => x.id === d.id ? { ...x, ...d.patch, ...(d.patch.style ? { textureUrl: undefined } : {}) } : x)); };
    window.addEventListener("design-studio:select", onSel); window.addEventListener("design-studio:site-restyle", onStyle);
    return () => { window.removeEventListener("design-studio:select", onSel); window.removeEventListener("design-studio:site-restyle", onStyle); };
  }, [setItems]);
  // Product-first selection steps
  const [fMat, setFMat] = React.useState<string | null>(null);
  const [fH, setFH] = React.useState<number | null>(null);
  const [sStyle, setSStyle] = React.useState<string | null>(null);
  const [sH, setSH] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const scale = view?.scale ?? 10;
  const drawing = !!choice;

  const toWorld = React.useCallback((e: { clientX: number; clientY: number }, snap = true) => {
    const r = svgRef.current!.getBoundingClientRect();
    const v = view!;
    const sx = e.clientX - r.left, sy = e.clientY - r.top;
    const x = (sx - v.width / 2 - v.pan.x) / v.zoom + v.width / 2;
    const y = (sy - v.height / 2 - v.pan.y) / v.zoom + v.height / 2;
    // 1 ft snap keeps measurements clean
    return snap ? { x: Math.round(x / scale) * scale, y: Math.round(y / scale) * scale } : { x, y };
  }, [view, scale]);

  const finish = React.useCallback((close = false) => {
    if (!choice) return;
    const min = choice.kind === "fence" ? 2 : 3;
    if (choice.kind === "deck") view?.endDeckMode?.();
    if (draft.length >= min) {
      const id = `${choice.kind}-${Date.now().toString(36)}`;
      // A fence closed on its first post becomes a full loop (last post = first post).
      const pts = close && choice.kind === "fence" ? [...draft, { ...draft[0] }] : draft;
      setItems((prev) => [...prev, { ...(choice as Omit<SiteElement, "id" | "pts">), id, pts }]);
      setSelected(id);
    }
    setDraft([]); setChoice(null);
  }, [choice, draft, setItems, view]);

  /* Header "Deck" tool → draw the deck boundary on this same board. */
  React.useEffect(() => { if (view?.deckMode && !choice) { setDraft([]); setChoice(DECK_CHOICE); } }, [view?.deckMode, choice]);

  const removeSelected = React.useCallback(() => {
    if (!selected) return;
    eraseId(selected);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, setItems, view]);
  const recolor = (hex: string, id: string) => setItems((p) => p.map((x) => x.id === selected ? { ...x, color: hex, detail: x.detail.replace(/^\w+/, id) } : x));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "");
      if (!drawing && !typing && selected && (e.key === "Delete" || e.key === "Backspace")) { e.preventDefault(); removeSelected(); return; }
      if (!drawing) return;
      if (e.key === "Enter") finish(false);
      if (e.key === "Escape") { setDraft([]); setChoice(null); }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); setDraft((d) => d.slice(0, -1)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawing, finish, selected, removeSelected]);

  /** Magnetic first point: within ~18 screen px (or 1.5 ft) the cursor locks onto it. */
  const nearFirst = (raw: Pt) => !!view && draft.length >= 3 &&
    Math.hypot(raw.x - draft[0].x, raw.y - draft[0].y) < Math.max(scale * 2, 36 / view.zoom);
  const onClick = (e: React.MouseEvent) => {
    if (!view || !choice) return;
    const p = toWorld(e);
    if (nearFirst(p) || nearFirst(toWorld(e, false))) { finish(true); return; }
    setDraft((d) => [...d, p]);
  };
  const drawHover = (e: React.MouseEvent): Pt => {
    const raw = toWorld(e, false);
    return nearFirst(raw) ? draft[0] : toWorld(e);
  };

  const t = view ? `translate(${view.width / 2 + view.pan.x} ${view.height / 2 + view.pan.y}) scale(${view.zoom}) translate(${-view.width / 2} ${-view.height / 2})` : undefined;

  /* ---------- spline editing: any spline (pool, decks, fences, screens, turf) ---------- */
  const [menu, setMenu] = React.useState<{ x: number; y: number; id: string; at: Pt; seg: number; sub?: boolean } | null>(null);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [moving, setMoving] = React.useState<{ id: string; start: Pt; orig: Pt[]; deck?: Pt[]; deckId?: string } | null>(null);
  const dragRef = React.useRef<{ id: string; i: number } | null>(null);
  /* Ids: "__pool"/"__deck" = main pool + deck, "__xp:<id>"/"__xd:<id>" = extra pool/spa + its deck. */
  const extras = React.useMemo(() => (view?.extraPools ?? []).filter((p) => p.points?.length >= 3), [view?.extraPools]);
  const getPts = React.useCallback((id: string): Pt[] => {
    if (id === "__pool") return view?.poolPts ?? [];
    if (id === "__deck") return view?.deckPts ?? [];
    if (id.startsWith("__xp:")) return extras.find((p) => p.id === id.slice(5))?.points ?? [];
    if (id.startsWith("__xd:")) return view?.extraDecks?.[id.slice(5)] ?? [];
    return items.find((x) => x.id === id)?.pts ?? [];
  }, [view, items, extras]);
  const setPts = React.useCallback((id: string, pts: Pt[]) => {
    if (id === "__pool") view?.setPool?.(pts); else if (id === "__deck") view?.setDeck?.(pts);
    else if (id.startsWith("__xp:")) view?.setExtraPool?.(id.slice(5), pts);
    else if (id.startsWith("__xd:")) view?.setExtraDeck?.(id.slice(5), pts);
    else setItems((p) => p.map((x) => x.id === id ? { ...x, pts } : x));
  }, [view, setItems]);
  const isOpen = (id: string) => items.find((x) => x.id === id)?.kind === "fence";
  const isPoolId = (id: string) => id === "__pool" || id.startsWith("__xp:");
  /** Spline under the cursor: nearest edge, or — if none is close — the smallest shape the cursor is inside. */
  const nearest = React.useCallback((w: Pt) => {
    const ids = [...items.map((x) => x.id).reverse(), ...extras.map((p) => `__xp:${p.id}`), ...extras.filter((p) => (view?.extraDecks?.[p.id]?.length ?? 0) >= 3).map((p) => `__xd:${p.id}`), ...((view?.deckPts?.length ?? 0) >= 3 ? ["__deck"] : []), ...((view?.poolPts?.length ?? 0) >= 3 ? ["__pool"] : [])];
    let best: { id: string; seg: number; d: number; at: Pt } | null = null;
    let inside: { id: string; seg: number; d: number; at: Pt; area: number } | null = null;
    for (const id of ids) {
      const pts = getPts(id); const n = isOpen(id) ? pts.length - 1 : pts.length;
      let own: { id: string; seg: number; d: number; at: Pt } | null = null;
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length]; const dx = b.x - a.x, dy = b.y - a.y; const L = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / L)); const at = { x: a.x + dx * t, y: a.y + dy * t };
        const d = Math.hypot(w.x - at.x, w.y - at.y); if (!own || d < own.d) own = { id, seg: i, d, at };
      }
      if (!own) continue;
      if (!best || own.d < best.d) best = own;
      if (!isOpen(id) && pts.length >= 3) {
        let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a.y > w.y) !== (b.y > w.y) && w.x < ((b.x - a.x) * (w.y - a.y)) / (b.y - a.y) + a.x) c = !c; }
        const area = Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p.x * q.y - q.x * p.y; }, 0));
        if (c && (!inside || area < inside.area)) inside = { ...own, area };
      }
    }
    // Inside a pool/spa: the pool wins over a nearby deck edge, so the pool widget opens.
    if (inside && isPoolId(inside.id) && !(best && isPoolId(best.id) && best.d < 24 / (view?.zoom || 1))) return inside;
    if (best && best.d < 24 / (view?.zoom || 1)) return best;
    return inside;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, view, getPts, extras]);
  const insertPoint = (id: string, seg: number, at: Pt) => {
    const pts = getPts(id);
    const np = isPoolId(id) ? { ...at, id: String(Math.max(0, ...pts.map((p) => parseInt((p as { id?: string }).id ?? "0") || 0)) + 1), curveType: "linear" } : id === "__deck" || id.startsWith("__xd:") ? { ...at, id: `h${Date.now().toString(36)}` } : at;
    setPts(id, [...pts.slice(0, seg + 1), np as Pt, ...pts.slice(seg + 1)]);
  };
  const eraseId = (id: string) => {
    if (id === "__pool") view?.erasePool?.(); else if (id === "__deck") view?.setDeck?.([]);
    else if (id.startsWith("__xp:")) view?.eraseExtraPool?.(id.slice(5)); else if (id.startsWith("__xd:")) view?.setExtraDeck?.(id.slice(5), []);
    else setItems((p) => p.filter((x) => x.id !== id));
    setSelected(null); setEditId(null);
  };
  const extraLabel = (pid: string) => { const i = extras.findIndex((p) => p.id === pid); const p = extras[i]; return `${p?.type === "spa" ? "Spa" : p?.type === "tanning-ledge" ? "Tanning ledge" : "Pool"} ${i + 2}`; };
  const labelOf = (id: string) => id === "__pool" ? "Pool" : id === "__deck" ? "Pool deck" : id.startsWith("__xp:") ? extraLabel(id.slice(5)) : id.startsWith("__xd:") ? `${extraLabel(id.slice(5))} deck` : (() => { const it = items.find((x) => x.id === id); return it ? `${KIND_LABEL[it.kind]} · ${it.label}` : ""; })();
  /* Right-click opens the spline menu; double-click goes straight into editing. Works on every element. */
  React.useEffect(() => {
    if (!view) return;
    // Window-level capture so the canvas underneath can never swallow the gesture.
    const open = (e: MouseEvent) => {
      const host = svgRef.current?.parentElement; if (!host || drawing) return;
      const r = host.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      if ((e.target as HTMLElement)?.closest?.("aside,button,[data-spline-menu],[role=dialog]")) return;
      const hit = nearest(toWorld(e, false));
      // Double-click on empty board = stop editing any spline, design freely.
      if (!hit) { if (e.type === "dblclick") { setEditId(null); setMoving(null); setMenu(null); setSelected(null); } return; }
      e.preventDefault(); e.stopPropagation();
      setSelected(hit.id);
      if (e.type === "dblclick") { setEditId(hit.id); setMenu(null); return; }
      setMenu({ x: e.clientX - r.left, y: e.clientY - r.top, id: hit.id, seg: hit.seg, at: hit.at });
    };
    // Single click only selects (never blocks the canvas) so the Materials panel can follow it.
    const pick = (e: MouseEvent) => {
      const host = svgRef.current?.parentElement; if (!host || drawing) return;
      const r = host.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      if ((e.target as HTMLElement)?.closest?.("aside,button,nav,[data-spline-menu],[role=dialog]")) return;
      const hit = nearest(toWorld(e, false)); if (hit) setSelected(hit.id);
    };
    window.addEventListener("contextmenu", open, true); window.addEventListener("dblclick", open, true); window.addEventListener("click", pick, true);
    return () => { window.removeEventListener("contextmenu", open, true); window.removeEventListener("dblclick", open, true); window.removeEventListener("click", pick, true); };
  }, [view, drawing, nearest, toWorld]);
  /* Vertex dragging + whole-shape move. */
  React.useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (dragRef.current) { const w = toWorld(e); const { id, i } = dragRef.current; const pts = getPts(id); setPts(id, pts.map((p, k) => k === i ? { ...p, x: w.x, y: w.y } : p)); }
      else if (moving) { const w = toWorld(e); const dx = w.x - moving.start.x, dy = w.y - moving.start.y; setPts(moving.id, moving.orig.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))); if (moving.deck) setPts(moving.deckId ?? "__deck", moving.deck.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))); }
    };
    const up = () => { dragRef.current = null; };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [moving, toWorld, getPts, setPts, view]);
  /** Anchor any element (pool moves with its deck) to the cursor; the next click drops it. */
  const startMove = React.useCallback((id: string, at: Pt) => {
    const xp = id.startsWith("__xp:") ? id.slice(5) : null;
    setMoving({ id, start: at, orig: getPts(id), deck: id === "__pool" ? view?.deckPts : xp ? view?.extraDecks?.[xp] : undefined, deckId: xp ? `__xd:${xp}` : "__deck" });
    setSelected(id); setMenu(null);
  }, [getPts, view]);
  /* Press and hold (~350 ms, without moving) on any pool, deck, fence, screen or turf to pick it up. */
  React.useEffect(() => {
    if (!view || drawing || moving || view.addMode) return;
    let timer = 0; let sx = 0, sy = 0;
    const cancel = () => { if (timer) { window.clearTimeout(timer); timer = 0; } };
    const down = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const host = svgRef.current?.parentElement; if (!host) return;
      const r = host.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      if ((e.target as HTMLElement)?.closest?.("aside,button,nav,[data-spline-menu],[role=dialog]")) return;
      const at = toWorld(e, false); const hit = nearest(at); if (!hit || editId === hit.id) return;
      sx = e.clientX; sy = e.clientY; cancel();
      timer = window.setTimeout(() => { timer = 0; startMove(hit.id, at); }, 350);
    };
    const mv = (e: MouseEvent) => { if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 4) cancel(); };
    window.addEventListener("mousedown", down, true); window.addEventListener("mousemove", mv, true); window.addEventListener("mouseup", cancel, true);
    return () => { cancel(); window.removeEventListener("mousedown", down, true); window.removeEventListener("mousemove", mv, true); window.removeEventListener("mouseup", cancel, true); };
  }, [view, drawing, moving, editId, nearest, toWorld, startMove]);
  /* While an element rides the cursor, the next click anywhere on the board drops it.
     Window capture so the canvas underneath can't swallow it; the release of the
     pick-up hold is ignored. — Imagine Engine Studios Corp */
  React.useEffect(() => {
    if (!moving) return;
    let armed = false;
    const arm = window.setTimeout(() => { armed = true; }, 120);
    const swallow = (e: MouseEvent) => { if (armed) { e.preventDefault(); e.stopPropagation(); } };
    const drop = (e: MouseEvent) => {
      if (!armed || e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      setMoving(null);
    };
    window.addEventListener("mousedown", drop, true);
    window.addEventListener("click", swallow, true);
    return () => { window.clearTimeout(arm); window.removeEventListener("mousedown", drop, true); window.removeEventListener("click", swallow, true); };
  }, [moving]);
  /* Finger input (phones/tablets) — Imagine Engine Studios Corp.
     Long-press = right-click menu, double-tap = edit spline, drag a square = move a point,
     while an element rides the finger it follows the drag and drops on release. */
  React.useEffect(() => {
    if (!view || drawing) return;
    let timer = 0, sx = 0, sy = 0, lastTap = 0, lx = 0, ly = 0, moved = false;
    const inside = (t: Touch, target: EventTarget | null) => {
      const host = svgRef.current?.parentElement; if (!host) return null;
      const r = host.getBoundingClientRect();
      if (t.clientX < r.left || t.clientX > r.right || t.clientY < r.top || t.clientY > r.bottom) return null;
      if ((target as HTMLElement)?.closest?.("aside,button,nav,[data-spline-menu],[role=dialog]")) return null;
      return r;
    };
    const cancel = () => { if (timer) { window.clearTimeout(timer); timer = 0; } };
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) { cancel(); return; }
      const t = e.touches[0]; const r = inside(t, e.target); if (!r) return;
      sx = t.clientX; sy = t.clientY; moved = false; cancel();
      if (dragRef.current || moving) return;
      timer = window.setTimeout(() => {
        timer = 0; const at = toWorld(t, false); const hit = nearest(at); if (!hit) return;
        setSelected(hit.id); setMenu({ x: sx - r.left, y: sy - r.top, id: hit.id, seg: hit.seg, at: hit.at });
      }, 450);
    };
    const move = (e: TouchEvent) => {
      const t = e.touches[0]; if (!t) return;
      if (Math.hypot(t.clientX - sx, t.clientY - sy) > 8) { moved = true; cancel(); }
      if (dragRef.current) { e.preventDefault(); const w = toWorld(t); const { id, i } = dragRef.current; setPts(id, getPts(id).map((p, k) => k === i ? { ...p, x: w.x, y: w.y } : p)); }
      else if (moving) { e.preventDefault(); const w = toWorld(t); const dx = w.x - moving.start.x, dy = w.y - moving.start.y; setPts(moving.id, moving.orig.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))); if (moving.deck) setPts(moving.deckId ?? "__deck", moving.deck.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))); }
    };
    const end = (e: TouchEvent) => {
      cancel();
      if (dragRef.current) { dragRef.current = null; return; }
      if (moving && moved) { setMoving(null); return; }
      const t = e.changedTouches[0]; if (!t || moved || !inside(t, e.target)) return;
      const now = Date.now();
      if (now - lastTap < 320 && Math.hypot(t.clientX - lx, t.clientY - ly) < 30) {
        lastTap = 0; const hit = nearest(toWorld(t, false));
        if (hit) { setSelected(hit.id); setEditId(hit.id); setMenu(null); } else { setEditId(null); setMenu(null); setSelected(null); }
      } else { lastTap = now; lx = t.clientX; ly = t.clientY; }
    };
    window.addEventListener("touchstart", start, { capture: true, passive: true });
    window.addEventListener("touchmove", move, { capture: true, passive: false });
    window.addEventListener("touchend", end, true); window.addEventListener("touchcancel", cancel, true);
    return () => { cancel(); window.removeEventListener("touchstart", start, true); window.removeEventListener("touchmove", move, true); window.removeEventListener("touchend", end, true); window.removeEventListener("touchcancel", cancel, true); };
  }, [view, drawing, moving, nearest, toWorld, getPts, setPts]);
  /** Adds a door/gate on the longest free side (or a given side) of a fence/screen. */
  const addGate = React.useCallback((id: string, typeId: string) => {
    setItems((p) => p.map((x) => {
      if (x.id !== id || x.pts.length < 2) return x;
      const n = x.kind === "fence" ? x.pts.length - 1 : x.pts.length;
      let seg = 0, best = -1;
      for (let i = 0; i < n; i++) { const a = x.pts[i], b = x.pts[(i + 1) % x.pts.length]; const L = Math.hypot(b.x - a.x, b.y - a.y) / (1 + (x.gates ?? []).filter((g) => g.seg === i).length); if (L > best) { best = L; seg = i; } }
      const k = (x.gates ?? []).filter((g) => g.seg === seg).length;
      return { ...x, gates: [...(x.gates ?? []), { seg, t: (k + 1) / (k + 2), typeId }] };
    }));
  }, [setItems]);
  /* Genius asks for a door/gate: add it to the selected (or first) fence/screen only. */
  React.useEffect(() => {
    const on = (ev: Event) => {
      const { kind, count = 1, double } = (ev as CustomEvent).detail || {};
      const target = items.find((x) => x.id === selected && x.kind === kind) ?? items.find((x) => x.kind === kind);
      const reply = (ok: boolean) => window.dispatchEvent(new CustomEvent("design-studio:gate-result", { detail: { ok, kind } }));
      if (!target) return reply(false);
      const opts = gateOptionsFor(kind); const o = (double ? opts.find((g) => /double/i.test(g.label)) : null) ?? opts[0];
      if (!o) return reply(false);
      for (let i = 0; i < Math.min(6, count); i++) addGate(target.id, o.id);
      setSelected(target.id); reply(true);
    };
    window.addEventListener("design-studio:add-gate", on);
    return () => window.removeEventListener("design-studio:add-gate", on);
  }, [items, selected, addGate]);
  const retexture =  (id: string, opt: { color?: string; label?: string; style?: string; rate?: number }) => setItems((p) => p.map((x) => x.id === id ? { ...x, ...opt, ...(opt.style ? { textureUrl: undefined } : {}) } : x));
  const menuItem = items.find((x) => x.id === menu?.id);
  const textureOptions = !menuItem ? [] : menuItem.kind === "turf" ? TURFS.map((g) => ({ key: g.id, label: g.label, apply: { color: g.color, label: g.label, rate: g.rate } }))
    : menuItem.kind === "deck" ? DECK_PAVERS.map((d) => ({ key: d.id, label: `${d.label} · $${d.rate}/sqft`, apply: { style: d.id, label: d.label, rate: d.rate } }))
    : (menuItem.kind === "fence" ? FENCE_COLORS : SCREEN_COLORS).map((c) => ({ key: c.id, label: c.id, apply: { color: c.hex } }));

  const startFence = (colorHex: string, colorId: string) => {
    const m = FENCE_MATERIALS.find((x) => x.id === fMat)!; const h = FENCE_HEIGHTS.find((x) => x.ft === fH)!;
    setChoice({ kind: "fence", label: m.label, detail: `${colorId} · ${h.label}`, color: colorHex, height: h.ft, style: m.id, rate: h.rate, unit: "lf" });
  };
  const startScreen = (colorHex: string, colorId: string) => {
    const s = SCREEN_STYLES.find((x) => x.id === sStyle)!;
    setChoice({ kind: "enclosure", label: s.label, detail: `${colorId} frame · ${sH}' tall`, color: colorHex, height: sH!, style: s.id, rate: s.rate, unit: "sqft" });
  };

  const sel = items.find((x) => x.id === selected);
  const Row = ({ id, label }: { id: string; label: string }) => (
    <li className={cn("flex items-center justify-between gap-2", selected === id && "font-semibold")}>
      <button onClick={() => setSelected(id)} className="truncate text-left">{label}</button>
      <button onClick={() => eraseId(id)} title="Erase" className="text-muted-foreground hover:text-foreground"><Trash2 className="h-3 w-3" /></button>
    </li>
  );
  const Step = ({ n, label, children }: { n: number; label: string; children: React.ReactNode }) => (
    <div className="mt-3">
      <p className="mb-1.5 text-sm font-bold uppercase tracking-[0.15em] text-foreground">{n}. {label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
  const Chip = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className={cn("border px-2.5 py-1.5 text-[11px] transition-colors", on ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground")}>{children}</button>
  );

  const surfaceRegions = React.useMemo(() => {
    if (!view) return new Map<string, Pt[][][]>();
    const net = studioNetItems(items, view.poolPts ?? [], view.deckPts ?? [], scale, extras, view.extraDecks ?? {});
    return new Map(items.filter(e => e.kind === 'deck' || e.kind === 'turf').map(e => {
      const item = net.find(n => n.id === e.id);
      return [e.id, item ? netRegions(net, item).map(poly => poly.map(r => r.map(p => ({ x: p.x * scale, y: p.y * scale })))) : []];
    }));
  }, [items, view?.poolPts, view?.deckPts, view?.extraDecks, extras, scale]);
  const surfacePath = (id: string) => (surfaceRegions.get(id) ?? []).map(poly => poly.map(r => r.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ') + ' Z').join(' ')).join(' ');
  return (
    <>
      {/* Drawing overlay — same transform as the PoolBuilder canvas */}
      {view && (
        <svg ref={svgRef} data-site-drawing={drawing ? "1" : "0"} className="absolute inset-0 z-[5]" width={view.width} height={view.height}
          style={{ pointerEvents: drawing || moving || view.addMode ? "auto" : "none", cursor: drawing || view.addMode ? "crosshair" : moving ? "move" : undefined }}
          onClick={(e) => {
            if (moving) { setMoving(null); return; }
            // Add Point tool anchors to whichever spline is under the cursor: pool, deck, fence, screen or turf.
            if (view.addMode && !drawing) { const hit = nearest(toWorld(e, false)); if (hit) { insertPoint(hit.id, hit.seg, hit.at); setSelected(hit.id); setEditId(hit.id); } return; }
            onClick(e); }} onDoubleClick={(e) => { e.preventDefault(); finish(false); }} onMouseMove={(e) => { if (drawing) setHover(drawHover(e)); else if (view.addMode) setHover(nearest(toWorld(e, false))?.at ?? null); }}>
          <defs>
            {TURFS.map((g) => (
              <pattern key={g.id} id={`turf-${g.id}`} width={scale * 4} height={scale * 4} patternUnits="userSpaceOnUse">
                <rect width={scale * 4} height={scale * 4} fill={g.color} />
                <image href={g.texture} width={scale * 4} height={scale * 4} preserveAspectRatio="xMidYMid slice" style={{ mixBlendMode: "multiply" }} opacity={0.9} />
              </pattern>
            ))}
            {items.filter(e => e.kind === "deck" && e.textureUrl).map(e => <pattern key={e.id} id={`own-${e.id}`} width={scale * (e.textureScale ?? 1)} height={scale * (e.textureScale ?? 1)} patternUnits="userSpaceOnUse"><image href={e.textureUrl} width={scale * (e.textureScale ?? 1)} height={scale * (e.textureScale ?? 1)} preserveAspectRatio="xMidYMid slice" /></pattern>)}
            {DECK_PAVERS.map((d) => (
              <pattern key={d.id} id={`paver-${d.id}`} width={scale * 2} height={scale * 2} patternUnits="userSpaceOnUse">
                <image href={d.image} width={scale * 2} height={scale * 2} preserveAspectRatio="xMidYMid slice" />
              </pattern>
            ))}
            <pattern id="screen-mesh" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0 L4 4 M4 0 L0 4" stroke="#000" strokeOpacity=".12" strokeWidth=".4" /></pattern>
          </defs>
          <g transform={t}>
            {[...items].filter((e) => !isObjectHidden(boardObjectId(e.kind === "fence" ? "fence" : e.kind === "enclosure" ? "screen" : "surface", e.id, 0), e.kind === "fence" || e.kind === "enclosure" ? "fences" : e.kind === "deck" ? "deck" : "landscape", layerState)).sort((a, b) => (a.kind === "turf" ? 0 : a.kind === "deck" ? 1 : 2) - (b.kind === "turf" ? 0 : b.kind === "deck" ? 1 : 2)).map((e) => {
              const pts = e.pts.map((p) => `${p.x},${p.y}`).join(" ");
              const sel = selected === e.id;
              const turf = TURFS.find((g) => g.color === e.color);
              return (
                <g key={e.id} style={{ pointerEvents: view.poolDrawMode ? "none" : "auto", cursor: "pointer" }} onClick={(ev) => { if (drawing) return; ev.stopPropagation(); setSelected(e.id); }}>
                  {e.kind === "turf" && <path d={surfacePath(e.id)} fillRule="evenodd" fill={turf ? `url(#turf-${turf.id})` : e.color} fillOpacity={0.95} stroke={sel ? "hsl(var(--foreground))" : "none"} strokeWidth={2 / (view.zoom || 1)} strokeDasharray="6 4" />}
                  {e.kind === "deck" && <path d={surfacePath(e.id)} fillRule="evenodd" fill={e.textureUrl ? `url(#own-${e.id})` : `url(#paver-${e.style ?? DECK_PAVERS[0]?.id})`} stroke={sel ? "hsl(var(--foreground))" : "#8a7a62"} strokeWidth={(sel ? 2.5 : 1.5) / (view.zoom || 1)} />}
                  {/* Placed fences/screens keep the exact drawing-board look: solid round-joined line + ringed post handles. */}
                  {/* Global Design Board V1 look: screens = frame-color outline over mesh; fences = run in the fence color with posts every 6 ft. */}
                  {e.kind === "enclosure" && <polygon points={pts} fill="url(#screen-mesh)" stroke={e.color} strokeWidth={Math.max(3 / (view.zoom || 1), scale * 0.3)} strokeLinejoin="miter" />}
                  {e.kind === "enclosure" && <CageRoofPlan pts={e.pts} scale={scale} heightFt={e.height ?? 10} color={e.color} zoom={view.zoom || 1} />}
                  {e.kind === "fence" && <polyline points={pts} fill="none" stroke={e.color} strokeWidth={Math.max(2 / (view.zoom || 1), scale * 0.4)} strokeLinejoin="round" strokeLinecap="round" />}
                  {e.kind === "fence" && fencePosts(e.pts, scale * 6).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={Math.max(2 / (view.zoom || 1), scale * 0.3)} fill={e.color} stroke="rgba(0,0,0,0.35)" strokeWidth={0.5 / (view.zoom || 1)} />)}
                  {(e.gates ?? []).map((g, gi) => {
                    const a = e.pts[g.seg], b = e.pts[(g.seg + 1) % e.pts.length]; const o = gateOption(e.kind, g.typeId);
                    if (!a || !b || !o) return null;
                    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, half = Math.min(L / 2, (o.widthFt * scale) / 2);
                    const cx = a.x + (b.x - a.x) * g.t, cy = a.y + (b.y - a.y) * g.t, sw = Math.max(3 / (view.zoom || 1), scale * 0.5);
                    const x1 = cx - ux * half, y1 = cy - uy * half, x2 = cx + ux * half, y2 = cy + uy * half;
                    return <g key={gi} style={{ pointerEvents: "none" }}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--background))" strokeWidth={sw * 1.6} />
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--foreground))" strokeWidth={sw * 0.5} strokeDasharray={`${sw} ${sw * 0.6}`} />
                      <path d={`M ${x1} ${y1} L ${x1 - uy * half * 2} ${y1 + ux * half * 2} A ${half * 2} ${half * 2} 0 0 0 ${x2} ${y2}`} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1 / (view.zoom || 1)} strokeDasharray="3 3" />
                    </g>;
                  })}
                  {sel && (e.kind === "fence" || e.kind === "enclosure") && <polyline points={e.kind === "fence" ? pts : `${pts} ${e.pts[0].x},${e.pts[0].y}`} fill="none" stroke="hsl(var(--foreground))" strokeWidth={2 / (view.zoom || 1)} strokeDasharray="6 4" style={{ pointerEvents: "none" }} />}
                </g>
              );
            })}
            {spills.map((sp) => { const pts = getPts(sp.poolId); const e = pts.length >= 3 ? spillEnds(pts, sp) : null; if (!e) return null; const z = view.zoom || 1; const on = spillSel === sp.id;
              return <g key={sp.id} style={{ pointerEvents: view.poolDrawMode ? "none" : "auto", cursor: "pointer" }} onClick={(ev) => { ev.stopPropagation(); setSpillSel(sp.id); }}>
                <line x1={e[0].x} y1={e[0].y} x2={e[1].x} y2={e[1].y} stroke="hsl(var(--background))" strokeWidth={Math.max(6 / z, scale * 0.9)} strokeLinecap="round" />
                <line x1={e[0].x} y1={e[0].y} x2={e[1].x} y2={e[1].y} stroke="hsl(var(--primary))" strokeWidth={Math.max(4 / z, scale * 0.6)} strokeDasharray={`${scale * 0.6} ${scale * 0.3}`} strokeLinecap="round" opacity={on ? 1 : 0.8} />
              </g>; })}
            {drawing && draft.length > 0 && (
              <>
                {/* Same look as main-pool spline drawing: solid placed edges, dashed live edge + closing guide, ringed handles. */}
                <polyline points={draft.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="hsl(var(--foreground))" strokeWidth={2.5 / view.zoom} strokeLinejoin="round" />
                {hover && <line x1={draft[draft.length - 1].x} y1={draft[draft.length - 1].y} x2={hover.x} y2={hover.y} stroke="hsl(var(--foreground))" strokeWidth={2 / view.zoom} strokeDasharray="6 4" />}
                {hover && draft.length >= 2 && <line x1={hover.x} y1={hover.y} x2={draft[0].x} y2={draft[0].y} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5 / view.zoom} strokeDasharray="3 5" />}
                {draft.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={(i === 0 ? 7 : 5) / view.zoom} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--background))"} stroke="hsl(var(--foreground))" strokeWidth={2 / view.zoom} />)}
                {hover && <text x={hover.x + 8} y={hover.y - 8} fontSize={12 / view.zoom} fill="hsl(var(--foreground))">{(Math.hypot(hover.x - draft[draft.length - 1].x, hover.y - draft[draft.length - 1].y) / scale).toFixed(1)} ft</text>}
              </>
            )}
            {view.addMode && !drawing && hover && <circle cx={hover.x} cy={hover.y} r={6 / (view.zoom || 1)} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2 / (view.zoom || 1)} />}
            {selected && (selected.startsWith("__xp:") || selected.startsWith("__xd:") || selected === "__pool" || selected === "__deck") && getPts(selected).length >= 3 && <polygon points={(isPoolId(selected) ? poolRing(getPts(selected)) : getPts(selected)).map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="hsl(var(--foreground))" strokeWidth={2.5 / (view.zoom || 1)} strokeDasharray="6 4" style={{ pointerEvents: "none" }} />}
            {editId && (() => { const pts = getPts(editId); const z = view.zoom || 1; const open = isOpen(editId); return (
              <g style={{ pointerEvents: "auto" }}>
                {pts.map((a, i) => { if (open && i === pts.length - 1) return null; const b = pts[(i + 1) % pts.length]; return <circle key={`m${i}`} cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={4 / z} fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth={1 / z} style={{ cursor: "copy" }} onMouseDown={(ev) => { ev.stopPropagation(); insertPoint(editId, i, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }); dragRef.current = { id: editId, i: i + 1 }; }} onTouchStart={(ev) => { ev.stopPropagation(); insertPoint(editId, i, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }); dragRef.current = { id: editId, i: i + 1 }; }} />; })}
                {pts.map((p, i) => <rect key={`v${i}`} x={p.x - 5 / z} y={p.y - 5 / z} width={10 / z} height={10 / z} fill="hsl(var(--foreground))" style={{ cursor: "grab" }} onMouseDown={(ev) => { ev.stopPropagation(); dragRef.current = { id: editId, i }; }} onTouchStart={(ev) => { ev.stopPropagation(); dragRef.current = { id: editId, i }; }} onContextMenu={(ev) => { ev.preventDefault(); ev.stopPropagation(); if (pts.length > (open ? 2 : 3)) setPts(editId, pts.filter((_, k) => k !== i)); }} />)}
              </g>); })()}
          </g>
        </svg>
      )}

      {/* Spline menu — right-click or double-click any spline */}
      {menu && (
        <div data-spline-menu className="absolute z-[40] w-52 border border-border bg-background/95 p-1 text-[12px] shadow-sm backdrop-blur" style={{ left: menu.x, top: menu.y }} onMouseLeave={() => setMenu(null)}>
          <p className="px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{labelOf(menu.id)}</p>
          {!menu.sub ? (<>
            <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { setEditId(menu.id); setMenu(null); }}>Edit spline</button>
            <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { insertPoint(menu.id, menu.seg, menu.at); setEditId(menu.id); setMenu(null); }}>Add point here</button>
            <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => startMove(menu.id, menu.at)}>Move</button>
            {textureOptions.length > 0 && <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => setMenu({ ...menu, sub: true })}>{menuItem!.kind === "fence" || menuItem!.kind === "enclosure" ? "Change color" : "Change texture"}</button>}
            {menuItem && (menuItem.kind === "fence" || menuItem.kind === "enclosure") && gateOptionsFor(menuItem.kind).map((o) => (
              <button key={o.id} className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => {
                const a = menuItem.pts[menu.seg], b = menuItem.pts[(menu.seg + 1) % menuItem.pts.length];
                const L2 = a && b ? (b.x - a.x) ** 2 + (b.y - a.y) ** 2 : 0;
                const t = L2 ? Math.min(0.95, Math.max(0.05, ((menu.at.x - a.x) * (b.x - a.x) + (menu.at.y - a.y) * (b.y - a.y)) / L2)) : 0.5;
                setItems((p) => p.map((x) => x.id === menuItem.id ? { ...x, gates: [...(x.gates ?? []), { seg: menu.seg, t, typeId: o.id }] } : x)); setMenu(null);
              }}>Add {menuItem.kind === "fence" ? "gate" : "door"} · {o.label} (${o.price.toLocaleString()})</button>
            ))}
            {menuItem && (menuItem.gates?.length ?? 0) > 0 && <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { setItems((p) => p.map((x) => x.id === menuItem.id ? { ...x, gates: [] } : x)); setMenu(null); }}>Remove {menuItem.kind === "fence" ? "gates" : "doors"}</button>}
            {isPoolId(menu.id) && <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { const pts = getPts(menu.id) as Array<Pt & { curveFlip?: boolean }>; const j = (menu.seg + 1) % pts.length; setPts(menu.id, pts.map((q, k) => k === j ? { ...q, curveFlip: !q.curveFlip } : q)); setMenu(null); }}>Flip curve (outward / inward)</button>}
            {isPoolId(menu.id) && (extras.length > 0 || (loadBoard3D()?.waters ?? []).some((w) => (w.elevation ?? 0) > 0) || localStorage.getItem("studio3d.levels.elevated") === "1") && <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { const sp = spillActions.add(menu.id, menu.seg); setSpillSel(sp.id); setMenu(null); }}>Make this edge a spill over</button>}
            {isPoolId(menu.id) && <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { eraseId(menu.id === "__pool" ? "__deck" : `__xd:${menu.id.slice(5)}`); setMenu(null); }}>Remove deck (no deck)</button>}
            <button className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { eraseId(menu.id); setMenu(null); }}>Erase</button>
          </>) : textureOptions.map((o) => <button key={o.key} className="block w-full px-2 py-1.5 text-left hover:bg-muted" onClick={() => { retexture(menu.id, o.apply); setMenu(null); }}>{o.label}</button>)}
        </div>
      )}
      {spillSel && (() => { const sp = spills.find((x) => x.id === spillSel); if (!sp) return null; return (
        <div className="absolute left-1/2 top-14 z-[33] w-72 -translate-x-1/2 rounded-2xl border border-border/50 bg-background/95 p-3 text-xs shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center justify-between"><b className="uppercase tracking-[0.2em]">Spill over · {labelOf(sp.poolId)}</b><button title="Close" onClick={() => setSpillSel(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button></div>
          {([["Start along edge", "t0"], ["End along edge", "t1"]] as const).map(([l, k]) => (
            <label key={k} className="mb-2 block"><span className="flex justify-between"><span>{l}</span><span>{Math.round(sp[k] * 100)}%</span></span>
              <input type="range" min={0} max={1} step={0.01} value={sp[k]} onChange={(e) => spillActions.update(sp.id, { [k]: Number(e.target.value) })} className="w-full accent-[hsl(var(--primary))]" /></label>))}
          <div className="mb-2 flex gap-1.5">
            <button onClick={() => spillActions.update(sp.id, { pitch: 0 })} className={cn("flex-1 border px-2 py-1.5", sp.pitch === 0 ? "border-foreground bg-foreground text-background" : "border-border")}>Down the wall</button>
            <button onClick={() => spillActions.update(sp.id, { pitch: sp.pitch || 20 })} className={cn("flex-1 border px-2 py-1.5", sp.pitch > 0 ? "border-foreground bg-foreground text-background" : "border-border")}>Thrown out</button>
          </div>
          <label className="mb-2 block"><span className="flex justify-between"><span>Water pitch</span><span>{sp.pitch}°</span></span>
            <input type="range" min={0} max={45} step={1} value={sp.pitch} onChange={(e) => spillActions.update(sp.id, { pitch: Number(e.target.value) })} className="w-full accent-[hsl(var(--primary))]" /></label>
          <button onClick={() => { spillActions.remove(sp.id); setSpillSel(null); }} className="flex w-full items-center justify-center gap-1.5 border border-border py-1.5 hover:bg-muted"><Trash2 className="h-3.5 w-3.5" />Remove spill over</button>
        </div>); })()}
      {(editId || moving) && (
        <div className="absolute left-1/2 top-3 z-[30] flex -translate-x-1/2 items-center gap-3 border border-border bg-background/95 px-4 py-2 text-xs shadow-sm backdrop-blur">
          <span>{moving ? "Move the mouse, click to drop" : "Drag squares to move points · click a circle to add a point · right-click a square to remove it"}</span>
          <button onClick={() => { setEditId(null); setMoving(null); }} title="Done" className="text-muted-foreground hover:text-foreground"><Check className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Drawing hint */}
      {drawing && (
        <div className="absolute left-1/2 top-3 z-[30] flex -translate-x-1/2 items-center gap-3 border border-border bg-background/95 px-4 py-2 text-xs shadow-sm backdrop-blur">
          <span><b>{choice!.label}</b> · {choice!.kind === "fence" ? "click each post" : "click each corner, click the first point to close"} · Enter to finish</span>
          <button onClick={() => setDraft((d) => d.slice(0, -1))} title="Undo last point" className="hover:text-foreground text-muted-foreground"><Undo2 className="h-3.5 w-3.5" /></button>
          <button onClick={() => finish(false)} title="Finish" className="hover:text-foreground text-muted-foreground"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => { setDraft([]); setChoice(null); }} title="Cancel" className="hover:text-foreground text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Site catalog + take-off */}
      {/* Unified floating rail (flip-book style pill): site elements + 2D tools. Credit: Imagine Engine Studios Corp. */}
      <nav aria-label="Studio menu" className="absolute left-2 sm:left-3 top-14 sm:top-16 z-[31] flex max-h-[calc(100%-8rem)] overflow-y-auto [scrollbar-width:none] flex-col items-center gap-0.5 sm:gap-1 rounded-[28px] sm:rounded-full border border-border/50 bg-background/95 px-1.5 py-2 shadow-[0_16px_44px_-24px_rgba(8,12,24,0.5)] backdrop-blur-xl">
        <div id="studio-rail-slot" className="flex flex-col items-center gap-1" />
        <div id="studio-rail-slot-pools" className="flex flex-col items-center gap-1" />
        {([["deck", "Decks", Layers], ["fence", "Fences", Fence], ["turf", "Turf", Grid2x2], ["enclosure", "Screens", Layers]] as const).map(([k, l, Icon]) => (
          <button key={k} title={l} aria-pressed={tab === k} onClick={() => setTab(tab === k ? null : k)} className={cn("flex h-10 w-10 sm:h-14 sm:w-14 flex-col items-center justify-center gap-0.5 rounded-full text-[7.5px] sm:text-[9px] font-semibold uppercase tracking-[0.04em] sm:tracking-[0.06em] transition-colors", tab === k ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/10")}>
            <Icon className="h-4 w-4" />{l}
          </button>
        ))}
        <button title="On the board" aria-pressed={boardOpen} onClick={() => { const v = !boardOpen; setBoardOpen(v); if (v) window.dispatchEvent(new CustomEvent("studio-rail:open", { detail: "site" })); }} className={cn("flex h-10 w-10 sm:h-14 sm:w-14 flex-col items-center justify-center gap-0.5 rounded-full text-[7.5px] sm:text-[9px] font-semibold uppercase tracking-[0.04em] sm:tracking-[0.06em] transition-colors", boardOpen ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/10")}>
          <LayoutList className="h-4 w-4" />Board
        </button>
        <div id="studio-rail-slot-end" className="flex flex-col items-center gap-1" />
      </nav>

      {(tab || boardOpen) && (
      <aside className="absolute left-[3.75rem] sm:left-[5.25rem] top-14 sm:top-16 z-[32] w-[calc(100vw-4.5rem)] sm:w-72 max-h-[calc(100%-9rem)] overflow-y-auto rounded-2xl border border-border/50 bg-background/95 p-4 text-sm shadow-[0_16px_44px_-34px_rgba(8,12,24,0.6)] backdrop-blur-xl">
        {tab === "fence" && (
          <>
            <Step n={1} label="Material">
              {FENCE_MATERIALS.map((m) => (
                <button key={m.id} onClick={() => { setFMat(m.id); setFH(null); }} className={cn("w-[31%] border text-left text-[10px]", fMat === m.id ? "border-foreground" : "border-border")}>
                  <img src={m.image} alt={m.label} loading="lazy" className="aspect-square w-full object-cover" /><span className="block p-1">{m.label}</span>
                </button>
              ))}
            </Step>
            {fMat && <Step n={2} label="Height">{FENCE_HEIGHTS.map((h) => <Chip key={h.ft} on={fH === h.ft} onClick={() => setFH(h.ft)}>{h.label} · ${h.rate}/lf</Chip>)}</Step>}
            {fMat && fH && <Step n={3} label="Color — then draw">{FENCE_COLORS.map((c) => <Chip key={c.id} onClick={() => startFence(c.hex, c.id)}><span className="mr-1 inline-block h-2.5 w-2.5 align-middle" style={{ background: c.hex }} />{c.id}</Chip>)}</Step>}
          </>
        )}
        {tab === "enclosure" && (
          <>
            <Step n={1} label="Cage">
              {SCREEN_STYLES.map((s) => (
                <button key={s.id} onClick={() => { setSStyle(s.id); setSH(null); }} className={cn("w-[31%] border text-left text-[10px]", sStyle === s.id ? "border-foreground" : "border-border")}>
                  <img src={s.image} alt={s.label} loading="lazy" className="aspect-square w-full object-cover" /><span className="block p-1">{s.label} · ${s.rate}/sqft</span>
                </button>
              ))}
            </Step>
            {sStyle && <Step n={2} label="Height">{SCREEN_STYLES.find((s) => s.id === sStyle)!.heights.map((h) => <Chip key={h} on={sH === h} onClick={() => setSH(h)}>{h}′</Chip>)}</Step>}
            {sStyle && sH && <Step n={3} label="Frame color — then draw">{SCREEN_COLORS.map((c) => <Chip key={c.id} onClick={() => startScreen(c.hex, c.id)}><span className="mr-1 inline-block h-2.5 w-2.5 align-middle" style={{ background: c.hex }} />{c.id}</Chip>)}</Step>}
          </>
        )}
        {tab === "turf" && (
          <Step n={1} label="Turf — then draw">
            {TURFS.map((g) => (
              <button key={g.id} onClick={() => setChoice({ kind: "turf", label: g.label, detail: "Artificial turf", color: g.color, rate: g.rate, unit: "sqft" })} className="w-[31%] border border-border text-left text-[10px] hover:border-foreground">
                <img src={g.image} alt={g.label} loading="lazy" className="aspect-square w-full object-cover" /><span className="block p-1">{g.label} · ${g.rate}/sqft</span>
              </button>
            ))}
          </Step>
        )}

        {tab === "deck" && (
          <div className="mt-3">
            <button onClick={() => { setDraft([]); setChoice(DECK_CHOICE); }} className="w-full bg-foreground py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-background hover:opacity-90">Draw deck</button>
            {DECK_FAMILIES.map(([fam, list]) => (
              <div key={fam} className="mt-2">
                <p className="mb-1.5 text-base font-bold uppercase tracking-[0.15em] text-foreground">{fam}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {list.map((d) => (
                    <button key={d.id} onClick={() => { setDraft([]); setChoice(deckChoice(d.id)); }} className="flex flex-col border border-border text-left text-[10px] hover:border-foreground">
                      <img src={d.image} alt={d.label} loading="lazy" className="aspect-square w-full object-cover" />
                      <span className="block min-h-[2.5rem] p-1 leading-tight">{d.label.replace(fam, "").trim() || d.label}<br /><span className="text-muted-foreground">${d.rate}/sqft</span></span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Erase / edit — everything on the board, pool and deck included */}
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">On the board</p>
          </div>
          <ul className="mt-2 space-y-1 text-[12px]">
            {(view?.poolPts?.length ?? 0) >= 3 && <Row id="__pool" label="Pool" />}
            {(view?.deckPts?.length ?? 0) >= 3 && <Row id="__deck" label={`Pool deck · ${Math.round(poolTotals?.deckArea ?? 0)} sqft`} />}
            {extras.map((x) => <React.Fragment key={x.id}><Row id={`__xp:${x.id}`} label={`${extraLabel(x.id)} · ${Math.round(areaFt(x.points, scale))} sqft`} />{(view?.extraDecks?.[x.id]?.length ?? 0) >= 3 && <Row id={`__xd:${x.id}`} label={`${extraLabel(x.id)} deck · ${Math.round(Math.max(0, areaFt(view!.extraDecks![x.id], scale) - areaFt(x.points, scale)))} sqft`} />}</React.Fragment>)}
            {items.map((e) => <Row key={e.id} id={e.id} label={`${KIND_LABEL[e.kind]} · ${e.label} · ${Math.round(e.kind === "turf" || e.kind === "deck" ? turfNetSqft(e, items, view?.poolPts ?? [], view?.deckPts ?? [], scale, extras, view?.extraDecks ?? {}) : elementQty(e, scale))} ${e.unit}`} />)}
          </ul>
          {sel && (sel.kind === "fence" || sel.kind === "enclosure") && (
            <div className="mt-2">
              <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Color</p>
              <div className="flex gap-1.5">{(sel.kind === "fence" ? FENCE_COLORS : SCREEN_COLORS).map((c) => <Chip key={c.id} on={sel.color === c.hex} onClick={() => recolor(c.hex, c.id)}><span className="mr-1 inline-block h-2.5 w-2.5 align-middle" style={{ background: c.hex }} />{c.id}</Chip>)}</div>
            </div>
          )}
          {sel && (sel.kind === "fence" || sel.kind === "enclosure") && (
            <div className="mt-2">
              <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{sel.kind === "fence" ? "Gates" : "Doors"}</p>
              <div className="flex flex-wrap gap-1.5">{gateOptionsFor(sel.kind).map((o) => <Chip key={o.id} onClick={() => addGate(sel.id, o.id)}>+ {o.label} · ${o.price.toLocaleString()}</Chip>)}</div>
              {(sel.gates?.length ?? 0) > 0 && <ul className="mt-1.5 space-y-0.5 text-[11px]">{sel.gates!.map((g, gi) => <li key={gi} className="flex items-center justify-between"><span>{gateOption(sel.kind, g.typeId)?.label ?? "Door"} · side {g.seg + 1}</span><button title="Remove" className="text-muted-foreground hover:text-foreground" onClick={() => setItems((p) => p.map((x) => x.id === sel.id ? { ...x, gates: x.gates!.filter((_, k) => k !== gi) } : x))}><X className="h-3 w-3" /></button></li>)}</ul>}
            </div>
          )}
          {selected && <p className="mt-2 text-[10px] text-muted-foreground">Press Delete to erase. Right-click or double-click (phone: press and hold or double-tap) any line to edit, add a point, move, retexture or erase.</p>}
          {!items.length && <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><MousePointer2 className="h-3 w-3" />Pick fences, screens or turf above, then draw on the board.</p>}
        </div>
      </aside>
      )}
    </>
  );
};

/* ---------- 3D hand-off ---------- */
import { netRegions, computeNetAreas } from "@/lib/design/boardNetArea";
import { loadBoard3D, type Board3D } from "@/lib/design/board3D";
import { mitredOffsetRing } from "@/utils/polygonGeometry";
import { useSceneLayers, isObjectHidden, boardObjectId } from "@/lib/design/sceneLayers";
import { useSpills, spillActions, spillEnds, loadSpills } from "@/lib/design/spillovers";
import { loadBoard3D } from "@/lib/design/board3D";

/**
 * Builds the 3D Studio hand-off from the Design Studio: fences, screens and turf
 * in 3D feet, centred on the main pool's bounding-box centre (the 3D viewer
 * centres the pool the same way). Pools cut the turf. No extra waters are sent:
 * the Design Studio's extra pools/spas already travel inside its own scene.
 */
export function siteElementsTo3D(items: SiteElement[], poolPts: Pt[], scale: number, deckPts: Pt[] = [], extraPools: Array<{ id: string; type?: string; points: Pt[]; shape?: string; materials?: StudioMaterials; details3D?: any }> = [], extraDeckPts: Record<string, Pt[]> = {}): Board3D {
  const f = (p: Pt) => ({ x: p.x / scale, y: p.y / scale });
  const pool = poolRing(poolPts).map(f);
  const c = pool.length >= 3 ? { x: (Math.min(...pool.map(p => p.x)) + Math.max(...pool.map(p => p.x))) / 2, y: (Math.min(...pool.map(p => p.y)) + Math.max(...pool.map(p => p.y))) / 2 } : { x: 0, y: 0 };
  const to = (p: Pt) => ({ x: p.x - c.x, z: p.y - c.y });
  const net = studioNetItems(items, poolPts, deckPts, scale, extraPools, extraDeckPts);
  const regionsOf = (id: string) => { const n = net.find(n => n.id === id); return n ? netRegions(net, n).map(poly => poly.map(r => r.map(to))) : []; };
  const out: Board3D = { origin: c, fences: [], screens: [], surfaces: [], waters: [] };
  const finishes = buildFinishTextures();
  for (const p of extraPools.filter(p => p.points.length >= 3)) {
    const m = p.materials;
    const finish = m?.finishUrl ?? finishes.find(f => `cat-${f.id}` === m?.finishId)?.url;
    const coping = m?.copingUrl ?? paverTypes.find(f => f.id === m?.copingId)?.image;
    const image = m?.paverUrl ?? paverTypes.find(f => f.id === m?.paverId)?.image;
    const pts = densifyPoolOutline(p.points as never, p.shape ?? 'freeform').map(f).map(to);
    out.waters?.push({ depth: p.type === 'spa' ? 3 : 5, finish: finish ?? '#5fb7d4', coping: coping ?? '#d8d2c8', waterline: m?.waterlineUrl ?? '#2f6f8f', copingWidth: 1, ...p.details3D, ...(finish ? { finish } : {}), ...(coping ? { coping } : {}), ...(m?.waterlineUrl ? { waterline: m.waterlineUrl } : {}), finishScale: m?.finishScale, copingScale: m?.copingScale, waterlineScale: m?.waterlineScale, itemId: p.id, kind: p.type === 'spa' ? 'spa' : 'pool', label: p.type === 'spa' ? 'Spa' : 'Pool', pts });
    if ((extraDeckPts[p.id]?.length ?? 0) >= 3) out.surfaces.push({ itemId: `__deck_${p.id}`, kind: 'deck', color: '#ffffff', image, scale: m?.paverScale, regions: regionsOf(`__deck_${p.id}`) });
  }
  for (const e of items) {
    const pts = e.pts.map(f).map(to);
    const gates = (e.gates ?? []).map(g => ({ ...g, widthFt: gateOption(e.kind, g.typeId)?.widthFt ?? 3 }));
    if (e.kind === 'fence') out.fences.push({ ...e.details3D, itemId: e.id, pts, gates, style: e.style ?? 'alu', height: e.height ?? 4, color: e.color, postColor: e.details3D?.postColor ?? (e.style === 'vinyl' ? '#ffffff' : undefined) });
    else if (e.kind === 'enclosure') out.screens.push({ ...e.details3D, itemId: e.id, pts, gates, height: e.height ?? 10, color: e.color });
    else out.surfaces.push({ itemId: e.id, kind: e.kind, color: e.kind === 'deck' ? '#ffffff' : e.color, image: e.textureUrl ?? (e.kind === 'deck' ? DECK_PAVERS.find(d => d.id === e.style)?.image : TURFS.find(g => g.color === e.color)?.texture), scale: e.textureScale, regions: regionsOf(e.id) });
  }
  /* Spill-over edges in 3D feet (ends + pitch); the 3D Studio draws the falling water sheet. */
  out.spills = loadSpills().map((sp) => {
    const src = sp.poolId === "__pool" ? poolPts : extraPools.find((p) => `__xp:${p.id}` === sp.poolId)?.points ?? [];
    const e = src.length >= 3 ? spillEnds(src, sp) : null;
    if (!e) return null;
    // Outward = away from the body's centre.
    const cx = src.reduce((s, p) => s + p.x, 0) / src.length, cy = src.reduce((s, p) => s + p.y, 0) / src.length;
    return { id: sp.id, a: to(f(e[0])), b: to(f(e[1])), center: to(f({ x: cx, y: cy })), pitch: sp.pitch, waterId: sp.poolId === "__pool" ? undefined : sp.poolId.slice(5) };
  }).filter(Boolean) as NonNullable<Board3D["spills"]>;
  return out;
}
/** Auto deck width around each extra pool/spa (ft), same default as the main pool. */
const EXTRA_DECK_FT = 4;

/* ---------- Header take-off (one place for every measure and cost) ---------- */
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
/**
 * Header measures & costs for the 2D Designer — the exact 3D Studio widget
 * (PoolDesignerHeader), fed the same pool geometry in feet, plus fences,
 * screens and turf as extra lines. Credit: Imagine Engine Studios Corp.
 */
export const SiteTakeoffMenu: React.FC<{ scale: number; poolPts: Pt[]; deckPts: Pt[]; poolDepth?: number; deckWidth?: number; copingWidth?: number; poolPrice?: number; stats?: unknown; totals?: unknown; deckAreaSqFt?: number; featuresList?: Array<{ type: string; cost: number }>; additionalPools?: Array<{ id: string; type?: string; points: Pt[] }>; additionalDecks?: Record<string, Pt[]>; paver?: { id: string; name: string } }> = ({ scale, poolPts, deckPts, poolDepth = 6, deckWidth = 4, copingWidth = 1, poolPrice = 0, deckAreaSqFt, featuresList = [], additionalPools = [], additionalDecks = {}, paver }) => {
  const [items] = useSiteElements();
  const feet = React.useMemo(() => poolPts.map((p) => ({ x: p.x / scale, y: p.y / scale })), [poolPts, scale]);
  // Every element on the board: site pieces, placed features and extra water bodies.
  const extras = React.useMemo(() => {
    const site = items.filter((e) => e.kind !== "deck").map((e) => { const q = e.kind === "turf" || e.kind === "deck" ? turfNetSqft(e, items, poolPts, deckPts, scale, additionalPools, additionalDecks) : elementQty(e, scale); return [{ name: `${KIND_LABEL[e.kind]} · ${e.label} (${Math.round(q)} ${e.unit})`, price: q * e.rate }, ...gateLines(e)]; }).flat();
    const counts = new Map<string, { n: number; cost: number }>();
    featuresList.forEach((f) => { const c = counts.get(f.type) ?? { n: 0, cost: 0 }; c.n++; c.cost += f.cost; counts.set(f.type, c); });
    const feats = [...counts].map(([t, c]) => ({ name: `${t.replace(/-/g, " ").replace(/^./, (m) => m.toUpperCase())}${c.n > 1 ? ` × ${c.n}` : ""}`, price: c.cost }));
    return [...site, ...feats].filter((l) => l.price > 0);
  }, [items, poolPts, deckPts, scale, featuresList]);
  const bodies = React.useMemo(() => additionalPools.filter((p) => p.points?.length >= 3).map((p, i) => {
    const a = areaFt(p.points, scale);
    const label = p.type === "spa" ? "Spa" : p.type === "tanning-ledge" ? "Tanning ledge" : "Pool";
    return { name: `${label} ${i + 1}`, areaSqFt: a, price: a * POOL_SHELL_PRICE_PER_SQFT };
  }), [additionalPools, scale]);
  // Every paved deck (pool deck, extra pool/spa decks, drawn decks) grouped by paver at its own rate.
  const deckLines = React.useMemo(() => {
    const g = new Map<string, { name: string; areaSqFt: number; rate: number }>();
    const add = (name: string, rate: number, a: number) => { if (a <= 0) return; const k = `${name}|${rate}`; const c = g.get(k) ?? { name, areaSqFt: 0, rate }; c.areaSqFt += a; g.set(k, c); };
    const mainName = paver?.name ?? "Concrete deck"; const mainRate = getDeckPricePerSqFt(paver?.id ?? "concrete-deck");
    add(mainName, mainRate, deckAreaSqFt ?? 0);
    additionalPools.forEach((p) => { const d = additionalDecks[p.id]; if (d?.length >= 3 && p.points?.length >= 3) add(mainName, mainRate, Math.max(0, areaFt(d, scale) - areaFt(p.points, scale))); });
    items.filter((e) => e.kind === "deck").forEach((e) => add(e.label, e.rate, turfNetSqft(e, items, poolPts, deckPts, scale, additionalPools, additionalDecks)));
    return [...g.values()];
  }, [paver, deckAreaSqFt, additionalPools, additionalDecks, items, poolPts, deckPts, scale]);
  return <PoolDesignerHeader deckLines={deckLines} paverName={paver?.name} poolPoints={feet as never} poolDepth={poolDepth} deckWidth={deckWidth} copingWidth={copingWidth} poolPrice={poolPrice} deckAreaSqFt={deckAreaSqFt} additionalFeatures={extras} additionalBodies={bodies} />;
};

/**
 * 2D roof plan of a pool cage (matches the 3D framing): dashed ridge frame,
 * hip rafters from every corner, posts every 8 ft.
 * © Imagine Engine Studios Corp.
 */
function CageRoofPlan({ pts, scale, heightFt, color, zoom }: { pts: { x: number; y: number }[]; scale: number; heightFt: number; color: string; zoom: number }) {
  const plan = React.useMemo(() => {
    if (pts.length < 3) return null;
    const ring = mitredOffsetRing(pts.map((p) => ({ x: p.x, z: p.y })), -Math.min(5, heightFt * 0.35) * scale);
    const posts: { x: number; y: number }[] = [];
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / (8 * scale)));
      for (let i = 0; i < n; i++) posts.push({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n });
    });
    return { base: ring.base, top: ring.offset, posts };
  }, [pts, scale, heightFt]);
  if (!plan) return null;
  const w = 1 / zoom;
  return (
    <g style={{ pointerEvents: "none" }} stroke={color} strokeOpacity={0.55} fill="none">
      <polygon points={plan.top.map((p) => `${p.x},${p.z}`).join(" ")} strokeWidth={1.2 * w} strokeDasharray={`${5 * w} ${3 * w}`} />
      {plan.base.map((b, k) => <line key={k} x1={b.x} y1={b.z} x2={plan.top[k].x} y2={plan.top[k].z} strokeWidth={1.2 * w} strokeDasharray={`${5 * w} ${3 * w}`} />)}
      {plan.posts.map((p, k) => <rect key={`p${k}`} x={p.x - 2.5 * w} y={p.y - 2.5 * w} width={5 * w} height={5 * w} fill={color} stroke="none" />)}
    </g>
  );
}
