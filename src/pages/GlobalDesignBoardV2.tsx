/**
 * GLOBAL DESIGN BOARD V2 — one drawing board for the whole property.
 *
 * Architecture (kept deliberately small and fast):
 *  - One scene model (`BoardItem[]`) in feet, persisted with usePersistentState
 *    under `global_design_v2_scene` so the design stays on screen across visits.
 *  - Product-first: every tool is a catalog product (pool model, spa model,
 *    fence style + color + height, screen style + frame color, turf, pavers).
 *    Nothing can be drawn until a product is chosen; the item keeps its product.
 *  - One <canvas> renderer with procedural texture patterns (turf blades, paver
 *    joints, water, screen mesh) cached per color — no image downloads.
 *  - Live take-off: every item is priced from its own product (model price, or
 *    rate × sq ft / linear ft) and summed.
 * Rates come from the site's published trade rates (see geniusKnowledge RATES).
 */
import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, Fence, Grid2x2, Layers, MousePointer2, Trash2, Undo2, Redo2, Waves, Droplets, Check, Save, FolderOpen, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
const SurveyQuoteTool = React.lazy(() => import("@/components/SurveyQuoteTool"));
import { Button } from "@/components/ui/button";
import usePersistentState from "@/hooks/usePersistentState";
import { getAllProducts } from "@/data/poolProductLookup";
import { gilmerSpas } from "@/data/gilmerSpas";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { computeNetAreas } from "@/lib/design/boardNetArea";
import { boardTo3D, saveBoard3D } from "@/lib/design/board3D";
import { FENCE_HEIGHTS as CONFIG_FENCE_HEIGHTS } from "@/data/fenceConfigurator";
import { SCREEN_ENCLOSURE_PRICING, CONCRETE_DECK_PRICE_PER_SQFT } from "@/utils/paverPricing";
import { paverTypes } from "@/data/paverData";
import { artificialGrassOptions, getGrassPricePerSqFt } from "@/data/artificialGrassData";

const TURF_COLORS: Record<string, string> = { "light-green": "#7fb24a", "dark-green": "#3f7a32", "natural-green": "#5b9a40", emerald: "#2f8a4a", olive: "#6f7f3a" };
const GRASS_PRODUCTS_FOR_BOARD = () => artificialGrassOptions.map((g) => ({
  id: `turf:${g.id}`, kind: "turf" as const, label: `${g.name} turf`, detail: "Artificial turf", rate: getGrassPricePerSqFt(g.name), unit: "sqft" as const, color: TURF_COLORS[g.id] ?? "#5b9a40",
}));

type Kind = "pool" | "spa" | "deck" | "turf" | "fence" | "enclosure";
type Pt = { x: number; y: number };
type Product = { id: string; kind: Kind; label: string; detail: string; price?: number; rate?: number; unit?: "sqft" | "lf"; color: string; size?: { w: number; l: number } };
type BoardItem = { id: string; productId: string; kind: Kind; pts: Pt[] };

const PX_PER_FT = 10;
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const parseSize = (d?: string) => {
  const m = d?.match(/([\d.]+)'?\s*[×x]\s*([\d.]+)/);
  return m ? { w: parseFloat(m[1]), l: parseFloat(m[2]) } : { w: 7, l: 7 };
};

/* ---------- catalog (built once) ---------- */
// Rates come from the site's own price lists (fence configurator, screen
// enclosure pricing, turf configurator, paver catalog) — never invented here.
const FENCE_STYLES = [
  { id: "alu", label: "Aluminum picket", delta: 0 },
  { id: "vinyl", label: "Vinyl privacy", delta: 0 },
  { id: "glass", label: "Glass pool fence", delta: 0 },
];
const FENCE_COLORS = [{ id: "black", hex: "#1f1f1f" }, { id: "bronze", hex: "#6b4a2b" }, { id: "white", hex: "#f4f4f2" }];
const FENCE_HEIGHTS = CONFIG_FENCE_HEIGHTS.map((h) => ({ ft: h.heightIn / 12, rate: h.pricePerFt, label: h.label }));
const SCREEN_STYLES = [
  { id: "standard", label: "Standard cage", rate: SCREEN_ENCLOSURE_PRICING.standard, heights: [8, 10] },
  { id: "deluxe", label: "Deluxe cage", rate: SCREEN_ENCLOSURE_PRICING.deluxe, heights: [10, 12] },
  { id: "premium", label: "2-story cage", rate: SCREEN_ENCLOSURE_PRICING.premium, heights: [18, 20] },
];
const SCREEN_COLORS = [{ id: "bronze", hex: "#6b4a2b" }, { id: "white", hex: "#e9e9e6" }, { id: "black", hex: "#222" }];
const DECK_COLORS: Record<string, string> = { appian: "#b98a62", catalina: "#c9a27c", travertine: "#e2d3b8", coralina: "#d8d2c8" };

const buildCatalog = (): Product[] => {
  const seen = new Set<string>();
  const pools: Product[] = getAllProducts()
    .filter((p) => p.category === "Pool" && !seen.has(p.name) && seen.add(p.name))
    .map((p) => ({ id: `pool:${p.name}`, kind: "pool", label: p.name, detail: `${p.dimensions} · ${(p as any).brand ?? ""}`, price: p.price, color: "#2aa7c9", size: parseSize(p.dimensions) }));
  const spas: Product[] = gilmerSpas.map((s) => ({ id: `spa:${s.model}`, kind: "spa", label: s.model, detail: s.dimensions ?? "", price: s.price, color: "#1f8fb3", size: parseSize(s.dimensions) }));
  const fences: Product[] = FENCE_STYLES.flatMap((s) => FENCE_COLORS.flatMap((c) => FENCE_HEIGHTS.map((h) => ({
    id: `fence:${s.id}:${c.id}:${h.ft}`, kind: "fence" as Kind, label: `${s.label}`, detail: `${c.id} · ${h.label}`, rate: h.rate + s.delta, unit: "lf" as const, color: c.hex,
  }))));
  const screens: Product[] = SCREEN_STYLES.flatMap((s) => SCREEN_COLORS.flatMap((c) => s.heights.map((h) => ({ id: `enclosure:${s.id}:${c.id}:${h}`, kind: "enclosure" as Kind, label: s.label, detail: `${c.id} frame · ${h}' tall`, rate: s.rate, unit: "sqft" as const, color: c.hex }))));
  const turf: Product[] = GRASS_PRODUCTS_FOR_BOARD();
  const deck: Product[] = [
    { id: "deck:concrete", kind: "deck", label: "Concrete deck", detail: "Broom finish", rate: CONCRETE_DECK_PRICE_PER_SQFT, unit: "sqft", color: "#c9c3b8" },
    ...paverTypes.filter((p) => p.category === "paver").map((p) => ({
      id: `deck:${p.id}`, kind: "deck" as Kind, label: p.name, detail: "Paver", rate: p.basePrice, unit: "sqft" as const,
      color: DECK_COLORS[Object.keys(DECK_COLORS).find((k) => p.id.includes(k)) ?? ""] ?? "#d6cbb8",
    })),
  ];
  return [...pools, ...spas, ...deck, ...turf, ...fences, ...screens];
};

const KINDS: { id: Kind; label: string; Icon: typeof Waves; hint: string }[] = [
  { id: "pool", label: "Pools", Icon: Waves, hint: "Click to place the model at its real size." },
  { id: "spa", label: "Spas", Icon: Droplets, hint: "Click to place the spa at its real size." },
  { id: "deck", label: "Deck", Icon: Grid2x2, hint: "Click corners, then Finish." },
  { id: "turf", label: "Turf", Icon: Layers, hint: "Click the lawn outline, then Finish." },
  { id: "fence", label: "Fences", Icon: Fence, hint: "Click along the fence run, then Finish." },
  { id: "enclosure", label: "Screens", Icon: Grid2x2, hint: "Click the cage footprint, then Finish." },
];

/* ---------- geometry ---------- */
const area = (p: Pt[]) => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a.x * b.y - b.x * a.y; }, 0) / 2);
const length = (p: Pt[]) => p.slice(1).reduce((s, b, i) => s + Math.hypot(b.x - p[i].x, b.y - p[i].y), 0);
const inside = (pt: Pt, poly: Pt[]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};
const nearLine = (pt: Pt, p: Pt[], tol: number) => p.slice(1).some((b, i) => {
  const a = p[i]; const dx = b.x - a.x, dy = b.y - a.y; const L = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / L));
  return Math.hypot(pt.x - (a.x + t * dx), pt.y - (a.y + t * dy)) < tol;
});

/* ---------- procedural textures (cached) ---------- */
const patternCache = new Map<string, HTMLCanvasElement>();
const texture = (kind: Kind, color: string) => {
  const key = `${kind}:${color}`;
  const hit = patternCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 40;
  const g = c.getContext("2d")!;
  g.fillStyle = color; g.fillRect(0, 0, 40, 40);
  let s = 7;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  if (kind === "turf") {
    for (let i = 0; i < 140; i++) { g.strokeStyle = rnd() > 0.5 ? "rgba(255,255,255,0.13)" : "rgba(0,40,0,0.22)"; const x = rnd() * 40, y = rnd() * 40; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd() * 2 - 1, y - 3 - rnd() * 3); g.stroke(); }
  } else if (kind === "deck") {
    g.strokeStyle = "rgba(80,60,40,0.25)"; g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, 20, 20); g.strokeRect(20.5, 0.5, 19, 20); g.strokeRect(0.5, 20.5, 39, 19);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.05})`; g.fillRect(rnd() * 40, rnd() * 40, 2, 2); }
  } else if (kind === "pool" || kind === "spa") {
    for (let i = 0; i < 8; i++) { g.strokeStyle = "rgba(255,255,255,0.25)"; g.beginPath(); const y = rnd() * 40; g.moveTo(0, y); g.bezierCurveTo(12, y - 4, 26, y + 4, 40, y); g.stroke(); }
  } else if (kind === "enclosure") {
    g.fillStyle = "rgba(255,255,255,0)"; g.clearRect(0, 0, 40, 40);
    g.strokeStyle = "rgba(60,60,60,0.18)";
    for (let i = 0; i < 40; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 40); g.moveTo(0, i); g.lineTo(40, i); g.stroke(); }
  }
  patternCache.set(key, c);
  return c;
};

const priceOf = (it: BoardItem, p?: Product, net?: number) => {
  if (!p) return 0;
  if (p.price) return p.price;
  const q = p.unit === "lf" ? length(it.pts) : net ?? area(it.pts);
  return q * (p.rate ?? 0);
};

/* ---------- grouping: fences / screens are chosen style first, then color ---------- */
/* Fences & screens: 1. material  2. model size (height)  3. color for that material.
   Ids: fence:<material>:<color>:<heightFt>, enclosure:<material>:<color>:<heightFt>. */
const materialOf = (p: Product) => p.id.split(":")[1] ?? "";
const colorOf = (p: Product) => p.id.split(":")[2] ?? "";
const sizeOf = (p: Product) => p.id.split(":")[3] ?? "";
const STEPPED = (k: Kind) => k === "fence" || k === "enclosure";
type Step = "material" | "size" | "color";

const ft = (n: number) => `${Math.round(n * 10) / 10}'`;
const bbox = (pts: Pt[]) => {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};

type Hover = { pt: Pt; gx?: number; gy?: number; close?: boolean; eq?: boolean };
type Project = { id: string; name: string; items: BoardItem[]; updatedAt: number };

/** Mini plan of a pool/spa at its exact proportions, with its dimensions. */
const SizeChip: React.FC<{ w: number; l: number }> = ({ w, l }) => {
  const k = 56 / Math.max(w, l);
  return (
    <svg width={64} height={40} viewBox="0 0 64 40" className="shrink-0" aria-hidden>
      <rect x={32 - (l * k) / 2} y={20 - (w * k) / 2} width={l * k} height={w * k} className="fill-primary/20 stroke-foreground" strokeWidth={1} />
      <text x={32} y={39} textAnchor="middle" className="fill-muted-foreground" fontSize={7}>{`${w}' × ${l}'`}</text>
    </svg>
  );
};

const GlobalDesignBoardV2: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const { user } = useAuth();
  const catalog = React.useMemo(buildCatalog, []);
  const byId = React.useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);
  const [items, setItems] = usePersistentState<BoardItem[]>("global_design_v2_scene", []);
  const [kind, setKind] = usePersistentState<Kind>("global_design_v2_kind", "pool");
  const [productId, setProductId] = React.useState<string | null>(null);
  const [material, setMaterial] = React.useState<string | null>(null);
  const [sizeSel, setSizeSel] = React.useState<string | null>(null);
  const [needStep, setNeedStep] = React.useState<Step | null>(null);
  const navigate = useNavigate();
  const [draft, setDraft] = React.useState<Pt[]>([]);
  const [hover, setHover] = React.useState<Hover | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [view, setView] = React.useState({ x: 0, y: 0, zoom: 1 });
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ id?: string; vi?: number; last: Pt; pan?: boolean } | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 600 });

  /* ---------- undo / redo ---------- */
  const past = React.useRef<BoardItem[][]>([]);
  const future = React.useRef<BoardItem[][]>([]);
  const [, bump] = React.useReducer((n: number) => n + 1, 0);
  const snapshot = React.useCallback(() => { past.current.push(items); if (past.current.length > 80) past.current.shift(); future.current = []; bump(); }, [items]);
  const commit = React.useCallback((next: BoardItem[]) => { snapshot(); setItems(next); }, [snapshot, setItems]);
  const undo = React.useCallback(() => { const prev = past.current.pop(); if (!prev) return; future.current.push(items); setItems(prev); setSelected(null); bump(); }, [items, setItems]);
  const redo = React.useCallback(() => { const nx = future.current.pop(); if (!nx) return; past.current.push(items); setItems(nx); bump(); }, [items, setItems]);

  /* ---------- projects (saved per account) ---------- */
  const projKey = `global_design_v2_projects:${user?.id ?? "guest"}`;
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [projOpen, setProjOpen] = React.useState(false);
  React.useEffect(() => { try { setProjects(JSON.parse(localStorage.getItem(projKey) || "[]")); } catch { setProjects([]); } }, [projKey]);
  const writeProjects = (list: Project[]) => { setProjects(list); try { localStorage.setItem(projKey, JSON.stringify(list)); } catch { /* storage full */ } };
  const saveProject = () => {
    const cur = projects.find((p) => p.id === projectId);
    const name = cur?.name ?? window.prompt("Name this project", `Property design ${projects.length + 1}`);
    if (!name) return;
    const id = cur?.id ?? `${Date.now()}`;
    writeProjects([{ id, name, items, updatedAt: Date.now() }, ...projects.filter((p) => p.id !== id)]);
    setProjectId(id);
    toast({ title: "Project saved", description: name });
  };
  const openProject = (p: Project) => { commit(p.items); setProjectId(p.id); setProjOpen(false); setSelected(null); };

  const product = productId ? byId.get(productId) : undefined;
  const choices = React.useMemo(() => catalog.filter((p) => p.kind === kind), [catalog, kind]);
  const materials = React.useMemo(() => {
    if (!STEPPED(kind)) return [];
    const m = new Map<string, Product>();
    choices.forEach((p) => { if (!m.has(materialOf(p))) m.set(materialOf(p), p); });
    return [...m.entries()].map(([id, first]) => ({ id, first }));
  }, [choices, kind]);
  const sizes = React.useMemo(() => {
    const m = new Map<string, Product>();
    choices.filter((p) => materialOf(p) === material).forEach((p) => { if (!m.has(sizeOf(p))) m.set(sizeOf(p), p); });
    return [...m.entries()].map(([id, first]) => ({ id, first }));
  }, [choices, material]);
  const colors = React.useMemo(() => choices.filter((p) => materialOf(p) === material && sizeOf(p) === sizeSel), [choices, material, sizeSel]);
  const resetSteps = () => { setMaterial(null); setSizeSel(null); setNeedStep(null); };
  const pickKind = (k: Kind) => { setKind(k); setProductId(null); resetSteps(); setDraft([]); };

  React.useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const toWorld = (cx: number, cy: number): Pt => {
    const s = PX_PER_FT * view.zoom;
    return { x: (cx - size.w / 2 - view.x) / s, y: (cy - size.h / 2 - view.y) / s };
  };

  /** 2D-studio style drafting aids: close-the-shape, axis guides, 45°, equal lengths. */
  const snapDraft = (raw: Pt): Hover => {
    const tol = 12 / (PX_PER_FT * view.zoom);
    let pt = { x: Math.round(raw.x * 2) / 2, y: Math.round(raw.y * 2) / 2 };
    if (!draft.length) return { pt };
    const first = draft[0], last = draft[draft.length - 1];
    if (draft.length >= 3 && Math.hypot(raw.x - first.x, raw.y - first.y) < tol * 1.4) return { pt: first, close: true };
    let gx: number | undefined, gy: number | undefined;
    const refs = [...draft, ...items.flatMap((i) => i.pts)];
    for (const q of refs) { if (gx === undefined && Math.abs(raw.x - q.x) < tol) { pt.x = q.x; gx = q.x; } if (gy === undefined && Math.abs(raw.y - q.y) < tol) { pt.y = q.y; gy = q.y; } }
    let dx = pt.x - last.x, dy = pt.y - last.y;
    if (gx === undefined && gy === undefined && Math.abs(Math.abs(dx) - Math.abs(dy)) < tol) { dy = Math.sign(dy || 1) * Math.abs(dx); pt = { x: last.x + dx, y: last.y + dy }; }
    // equal-length (symmetry) suggestion
    const L = Math.hypot(dx, dy);
    let eq = false;
    for (let i = 1; i < draft.length && L > 0; i++) {
      const Lp = Math.hypot(draft[i].x - draft[i - 1].x, draft[i].y - draft[i - 1].y);
      if (Math.abs(L - Lp) < tol) { const k = Lp / L; pt = { x: last.x + dx * k, y: last.y + dy * k }; eq = true; break; }
    }
    return { pt, gx, gy, eq };
  };

  /* ---------- render ---------- */
  React.useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const g = cv.getContext("2d"); if (!g) return;
    const s = PX_PER_FT * view.zoom;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#8fa77a"; g.fillRect(0, 0, size.w, size.h);
    g.translate(size.w / 2 + view.x, size.h / 2 + view.y);
    const x0 = Math.floor((-size.w / 2 - view.x) / s), x1 = Math.ceil((size.w / 2 - view.x) / s);
    const y0 = Math.floor((-size.h / 2 - view.y) / s), y1 = Math.ceil((size.h / 2 - view.y) / s);
    for (let x = x0; x <= x1; x++) { g.strokeStyle = x % 10 ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.12)"; g.beginPath(); g.moveTo(x * s, y0 * s); g.lineTo(x * s, y1 * s); g.stroke(); }
    for (let y = y0; y <= y1; y++) { g.strokeStyle = y % 10 ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.12)"; g.beginPath(); g.moveTo(x0 * s, y * s); g.lineTo(x1 * s, y * s); g.stroke(); }

    const path = (pts: Pt[], close: boolean) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x * s, p.y * s) : g.moveTo(p.x * s, p.y * s))); if (close) g.closePath(); };
    const label = (txt: string, x: number, y: number) => {
      g.font = "10px ui-sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      const w = g.measureText(txt).width + 6;
      g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(x - w / 2, y - 7, w, 14);
      g.fillStyle = "#111"; g.fillText(txt, x, y);
    };
    const edgeLabels = (pts: Pt[], closed: boolean) => {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; label(ft(Math.hypot(b.x - a.x, b.y - a.y)), ((a.x + b.x) / 2) * s, ((a.y + b.y) / 2) * s); }
    };
    const order: Kind[] = ["turf", "deck", "pool", "spa", "enclosure", "fence"];
    for (const k of order) for (const it of items) {
      if (it.kind !== k) continue;
      const p = byId.get(it.productId); if (!p) continue;
      if (k === "fence") {
        path(it.pts, false); g.strokeStyle = p.color; g.lineWidth = Math.max(2, 0.4 * s); g.stroke();
        const L = length(it.pts);
        for (let d = 0; d <= L; d += 6) {
          let acc = 0;
          for (let i = 1; i < it.pts.length; i++) { const a = it.pts[i - 1], b = it.pts[i], seg = Math.hypot(b.x - a.x, b.y - a.y); if (acc + seg >= d) { const t = (d - acc) / (seg || 1); g.fillStyle = p.color; g.beginPath(); g.arc((a.x + t * (b.x - a.x)) * s, (a.y + t * (b.y - a.y)) * s, Math.max(2, 0.3 * s), 0, 7); g.fill(); break; } acc += seg; }
        }
      } else {
        path(it.pts, true);
        const pat = g.createPattern(texture(k, p.color), "repeat");
        if (pat) { pat.setTransform(new DOMMatrix().scale(view.zoom)); g.fillStyle = pat; g.fill(); }
        if (k === "pool" || k === "spa") { g.lineWidth = Math.max(3, 1 * s); g.strokeStyle = "#e8e2d6"; g.stroke(); }
        else if (k === "enclosure") { g.lineWidth = 3; g.strokeStyle = p.color; g.stroke(); }
        else { g.lineWidth = 1; g.strokeStyle = "rgba(0,0,0,0.25)"; g.stroke(); }
      }
      const c = it.pts.reduce((a, q) => ({ x: a.x + q.x / it.pts.length, y: a.y + q.y / it.pts.length }), { x: 0, y: 0 });
      g.font = "11px ui-sans-serif"; g.textAlign = "center"; g.fillStyle = "rgba(20,20,20,0.85)"; g.fillText(p.label, c.x * s, c.y * s);
      if (it.id === selected) {
        path(it.pts, k !== "fence"); g.setLineDash([6, 4]); g.lineWidth = 2; g.strokeStyle = "#f97066"; g.stroke(); g.setLineDash([]);
        it.pts.forEach((q) => { g.fillStyle = "#fff"; g.strokeStyle = "#f97066"; g.fillRect(q.x * s - 4, q.y * s - 4, 8, 8); g.strokeRect(q.x * s - 4, q.y * s - 4, 8, 8); });
        edgeLabels(it.pts, k !== "fence");
      }
    }
    // pool / spa ghost at its exact size
    if (product?.size && hover) {
      const { w: W, l: L } = product.size; const h = hover.pt;
      g.setLineDash([6, 4]); g.strokeStyle = "#f97066"; g.lineWidth = 2; g.strokeRect((h.x - L / 2) * s, (h.y - W / 2) * s, L * s, W * s); g.setLineDash([]);
      label(`${L}'`, h.x * s, (h.y - W / 2) * s - 10); label(`${W}'`, (h.x + L / 2) * s + 18, h.y * s);
    }
    if (draft.length) {
      const live = hover && !product?.size ? [...draft, hover.pt] : draft;
      path(live, false); g.strokeStyle = "#f97066"; g.lineWidth = 2; g.setLineDash([5, 4]); g.stroke(); g.setLineDash([]);
      draft.forEach((q, i) => { g.fillStyle = i === 0 && hover?.close ? "#f97066" : "#fff"; g.strokeStyle = "#f97066"; g.beginPath(); g.arc(q.x * s, q.y * s, i === 0 && hover?.close ? 7 : 4, 0, 7); g.fill(); g.stroke(); });
      edgeLabels(live, false);
      if (hover?.eq) label("= equal side", hover.pt.x * s, hover.pt.y * s - 16);
      if (hover?.close) label("Click to close", draft[0].x * s, draft[0].y * s - 16);
    }
    if (hover && (hover.gx !== undefined || hover.gy !== undefined)) {
      g.strokeStyle = "rgba(8,145,178,0.8)"; g.lineWidth = 1; g.setLineDash([3, 3]);
      if (hover.gx !== undefined) { g.beginPath(); g.moveTo(hover.gx * s, y0 * s); g.lineTo(hover.gx * s, y1 * s); g.stroke(); }
      if (hover.gy !== undefined) { g.beginPath(); g.moveTo(x0 * s, hover.gy * s); g.lineTo(x1 * s, hover.gy * s); g.stroke(); }
      g.setLineDash([]);
    }
  }, [items, draft, hover, selected, view, size, byId, product]);

  /* ---------- interaction ---------- */
  const finish = React.useCallback((closeFence = false) => {
    if (!product) return;
    const min = product.kind === "fence" ? 2 : 3;
    const pts = closeFence && draft.length > 2 ? [...draft, draft[0]] : draft;
    if (pts.length >= min) commit([...items, { id: `${Date.now()}`, productId: product.id, kind: product.kind, pts }]);
    setDraft([]);
  }, [draft, product, items, commit]);

  const hit = (w: Pt) => [...items].reverse().find((it) => (it.kind === "fence" ? nearLine(w, it.pts, 1.5) : inside(w, it.pts)));

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const w = toWorld(e.clientX - r.left, e.clientY - r.top);
    if (e.button === 1 || e.shiftKey) { drag.current = { pan: true, last: { x: e.clientX, y: e.clientY } }; return; }
    if (STEPPED(kind) && !product) {
      const step: Step = !material ? "material" : !sizeSel ? "size" : "color";
      setNeedStep(step);
      toast({ title: step === "material" ? "Choose the material first" : step === "size" ? "Choose a size" : "Choose a color", description: "Pick one of the highlighted options, then draw." });
      return;
    }
    if (product) {
      if (product.size) {
        const { w: W, l: L } = product.size; const c = { x: Math.round(w.x * 2) / 2, y: Math.round(w.y * 2) / 2 };
        commit([...items, { id: `${Date.now()}`, productId: product.id, kind: product.kind, pts: [
          { x: c.x - L / 2, y: c.y - W / 2 }, { x: c.x + L / 2, y: c.y - W / 2 }, { x: c.x + L / 2, y: c.y + W / 2 }, { x: c.x - L / 2, y: c.y + W / 2 },
        ] }]);
        return;
      }
      const h = snapDraft(w);
      if (h.close) { finish(product.kind === "fence"); setHover(null); return; }
      setDraft((d) => [...d, h.pt]);
      return;
    }
    // vertex editing on the selected item
    const sel = items.find((i) => i.id === selected);
    const tol = 10 / (PX_PER_FT * view.zoom);
    const vi = sel ? sel.pts.findIndex((q) => Math.hypot(q.x - w.x, q.y - w.y) < tol) : -1;
    if (sel && vi >= 0) { snapshot(); drag.current = { id: sel.id, vi, last: w }; e.currentTarget.setPointerCapture(e.pointerId); return; }
    const h = hit(w);
    setSelected(h?.id ?? null);
    if (h) snapshot();
    drag.current = h ? { id: h.id, last: w } : { pan: true, last: { x: e.clientX, y: e.clientY } };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const w = toWorld(e.clientX - r.left, e.clientY - r.top);
    const d = drag.current;
    if (!d) { if (product) setHover(product.size ? { pt: { x: Math.round(w.x * 2) / 2, y: Math.round(w.y * 2) / 2 } } : snapDraft(w)); return; }
    if (d.pan) { setView((v) => ({ ...v, x: v.x + e.clientX - d.last.x, y: v.y + e.clientY - d.last.y })); d.last = { x: e.clientX, y: e.clientY }; return; }
    if (d.vi !== undefined) {
      const p = { x: Math.round(w.x * 2) / 2, y: Math.round(w.y * 2) / 2 };
      setItems((prev) => prev.map((it) => (it.id === d.id ? { ...it, pts: it.pts.map((q, i) => (i === d.vi ? p : q)) } : it)));
      return;
    }
    const dx = w.x - d.last.x, dy = w.y - d.last.y; d.last = w;
    setItems((prev) => prev.map((it) => (it.id === d.id ? { ...it, pts: it.pts.map((q) => ({ x: q.x + dx, y: q.y + dy })) } : it)));
  };
  const onUp = () => { drag.current = null; };
  const onWheel = (e: React.WheelEvent) => setView((v) => ({ ...v, zoom: Math.min(6, Math.max(0.25, v.zoom * (e.deltaY < 0 ? 1.1 : 0.9))) }));
  const removeSelected = () => { if (!selected) return; commit(items.filter((i) => i.id !== selected)); setSelected(null); };

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
      if (e.key === "Enter") finish();
      if (e.key === "Escape") { setDraft([]); setProductId(null); resetSteps(); setHover(null); }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) removeSelected();
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  /* ---------- take-off & summary ---------- */
  const net = React.useMemo(() => computeNetAreas(items), [items]);
  const netOf = (i: BoardItem) => net.get(i.id) ?? area(i.pts);
  const lines = items.map((it) => { const p = byId.get(it.productId); const n = netOf(it); return { it, p, gross: area(it.pts), qty: p?.unit === "lf" ? length(it.pts) : p?.unit === "sqft" ? n : 1, total: priceOf(it, p, n) }; });
  const total = lines.reduce((s, l) => s + l.total, 0);
  const sum = (k: Kind, f: (pts: Pt[]) => number) => Math.round(items.filter((i) => i.kind === k).reduce((s, i) => s + f(i.pts), 0));
  const sumNet = (k: Kind) => Math.round(items.filter((i) => i.kind === k).reduce((s, i) => s + netOf(i), 0));
  const open3D = () => {
    saveBoard3D(boardTo3D(items, (id) => byId.get(id), (it) => (it as BoardItem).productId));
    navigate("/studio-3d?from=board");
  };
  const selItem = items.find((i) => i.id === selected);
  const selBox = selItem ? bbox(selItem.pts) : null;
  const hint = KINDS.find((k) => k.id === kind)?.hint;
  const iconBtn = "h-8 rounded-none";

  return (
    <div className={cn("flex flex-col bg-background text-foreground", embedded ? "h-[760px]" : "h-screen")}>
      {!embedded && <Helmet><title>Global Design Board V2 · Wonderlands</title><meta name="description" content="Design the whole property on one board: pools, spas, decks, turf, fences and screens, priced as you draw." /></Helmet>}
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          {!embedded && <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Link>}
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Wonderlands · Global Design Board V2{projectId ? ` · ${projects.find((p) => p.id === projectId)?.name ?? ""}` : ""}</p>
            <h1 className="font-serif text-lg leading-none">The whole property, on one board</h1>
          </div>
        </div>
        {/* Dimension summary, like the 2D studio header */}
        <div className="hidden flex-1 flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:flex">
          {selItem && selBox ? (
            <>
              <span className="text-foreground">{byId.get(selItem.productId)?.label}</span>
              <span>{ft(selBox.h)} × {ft(selBox.w)}</span>
              {selItem.kind !== "fence" && <span>{Math.round(netOf(selItem))} sq ft{Math.round(netOf(selItem)) !== Math.round(area(selItem.pts)) ? ` net (${Math.round(area(selItem.pts))} drawn)` : ""}</span>}
              <span>{Math.round(selItem.kind === "fence" ? length(selItem.pts) : length([...selItem.pts, selItem.pts[0]]))} lin ft</span>
            </>
          ) : (
            <>
              <span>Pools {items.filter((i) => i.kind === "pool").length}</span>
              <span>Spas {items.filter((i) => i.kind === "spa").length}</span>
              <span>Deck {sumNet("deck")} sq ft</span>
              <span>Turf {sumNet("turf")} sq ft</span>
              <span>Fence {sum("fence", length)} lin ft</span>
              <span>Screens {sum("enclosure", area)} sq ft</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className={iconBtn} onClick={undo} disabled={!past.current.length} aria-label="Undo"><Undo2 className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className={iconBtn} onClick={redo} disabled={!future.current.length} aria-label="Redo"><Redo2 className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className={cn(iconBtn, "text-[10px] uppercase tracking-[0.2em]")} onClick={saveProject}><Save className="mr-1 h-3.5 w-3.5" />Save</Button>
          <Button size="sm" variant="outline" className={cn(iconBtn, "text-[10px] uppercase tracking-[0.2em]")} disabled={!items.length} onClick={open3D}><Layers className="mr-1 h-3.5 w-3.5" />3D Studio</Button>
          <div className="relative">
            <Button size="sm" variant="outline" className={cn(iconBtn, "text-[10px] uppercase tracking-[0.2em]")} onClick={() => setProjOpen((o) => !o)}><FolderOpen className="mr-1 h-3.5 w-3.5" />Projects</Button>
            {projOpen && (
              <div className="absolute right-0 top-9 z-50 w-72 border border-border bg-background shadow-xl">
                <p className="border-b border-border px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{user ? "Your projects" : "Projects on this device"}</p>
                <button className="block w-full border-b border-border/60 px-3 py-2 text-left text-sm hover:bg-muted/50" onClick={() => { commit([]); setProjectId(null); setProjOpen(false); }}>+ New project</button>
                {!projects.length && <p className="px-3 py-3 text-sm text-muted-foreground">No saved projects yet.</p>}
                {projects.map((p) => (
                  <div key={p.id} className={cn("flex items-center gap-2 border-b border-border/60 px-3 py-2", p.id === projectId && "bg-muted")}>
                    <button className="min-w-0 flex-1 text-left" onClick={() => openProject(p)}>
                      <span className="block truncate text-sm">{p.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{new Date(p.updatedAt).toLocaleString()} · {p.items.length} pieces</span>
                    </button>
                    <button aria-label={`Delete ${p.name}`} className="text-muted-foreground hover:text-foreground" onClick={() => { writeProjects(projects.filter((x) => x.id !== p.id)); if (p.id === projectId) setProjectId(null); }}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="ml-3 text-right"><p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Project as drawn</p><p className="font-serif text-xl">{money(total)}</p></div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Product-first palette */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-border">
          <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
            {KINDS.map((k) => (
              <button key={k.id} onClick={() => pickKind(k.id)}
                className={cn("flex flex-col items-center gap-1 bg-background py-2 text-[9px] uppercase tracking-[0.2em]", kind === k.id && "bg-foreground text-background")}>
                <k.Icon className="h-3.5 w-3.5" />{k.label}
              </button>
            ))}
          </div>
          <p className="border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
            {STEPPED(kind) ? `1. Material · 2. Size · 3. Color · 4. ${hint}` : `1. Choose the product · 2. ${hint}`}
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {STEPPED(kind)
              ? (() => {
                const box = (st: Step) => cn("border-b border-border/60 px-3 py-3", needStep === st && "animate-pulse ring-2 ring-inset ring-primary");
                const chip = (on: boolean) => cn("border px-2 py-1 text-[10px] uppercase tracking-[0.15em]", on ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted/50");
                return (<>
                  <div className={box("material")}>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">1 · Material</p>
                    {materials.map(({ id, first }) => (
                      <button key={id} onClick={() => { setMaterial(id); setSizeSel(null); setProductId(null); setNeedStep(null); setDraft([]); setSelected(null); }}
                        className={cn("mb-1 flex w-full items-center justify-between border px-2 py-2 text-left text-sm", material === id ? "border-foreground bg-muted" : "border-border hover:bg-muted/50")}>
                        <span>{first.label}</span>{material === id && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                  {material && (
                    <div className={box("size")}>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">2 · {kind === "fence" ? "Height" : "Cage height"}</p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map(({ id, first }) => (
                          <button key={id} onClick={() => { setSizeSel(id); setProductId(null); setNeedStep(null); }} className={chip(sizeSel === id)}>
                            {`${id}' · $${first.rate}/${first.unit === "lf" ? "lin ft" : "sq ft"}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {material && sizeSel && (
                    <div className={box("color")}>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">3 · Color</p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((p) => (
                          <button key={p.id} onClick={() => { setProductId(p.id); setNeedStep(null); }} aria-label={colorOf(p)} className={cn(chip(productId === p.id), "flex items-center gap-1.5")}>
                            <span className="h-3.5 w-3.5 border border-border" style={{ background: p.color }} />{colorOf(p)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>);
              })()
              : choices.map((p) => (
                <button key={p.id} onClick={() => { setProductId(p.id === productId ? null : p.id); setDraft([]); setSelected(null); }}
                  className={cn("flex w-full items-center gap-3 border-b border-border/60 px-3 py-2 text-left hover:bg-muted/50", productId === p.id && "bg-muted")}>
                  {p.size ? <SizeChip w={p.size.w} l={p.size.l} /> : <span className="h-6 w-6 shrink-0 border border-border" style={{ background: p.color }} />}
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm">{p.label}</span><span className="block truncate text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{p.detail}</span></span>
                  <span className="shrink-0 text-xs">{p.price ? money(p.price) : `$${p.rate}/${p.unit}`}</span>
                  {productId === p.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
          </div>
        </aside>

        {/* Board */}
        <div ref={wrapRef} className="relative min-w-0 flex-1 overflow-hidden" onWheel={onWheel}>
          <canvas ref={canvasRef} width={size.w} height={size.h} className={cn("block", product ? "cursor-crosshair" : "cursor-grab")}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => setHover(null)} onDoubleClick={() => finish()} />
          <div className="absolute left-3 top-3 flex gap-1">
            <Button size="sm" variant={product ? "outline" : "default"} className="h-8 rounded-none text-[10px] uppercase tracking-[0.2em]" onClick={() => { setProductId(null); resetSteps(); setDraft([]); }}><MousePointer2 className="mr-1 h-3 w-3" />Select / move</Button>
            <Button size="sm" variant="outline" className={iconBtn} onClick={undo} disabled={!past.current.length} aria-label="Undo"><Undo2 className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" className={iconBtn} onClick={redo} disabled={!future.current.length} aria-label="Redo"><Redo2 className="h-3 w-3" /></Button>
            {draft.length > 0 && <>
              <Button size="sm" className="h-8 rounded-none text-[10px] uppercase tracking-[0.2em]" onClick={() => finish()}>Finish</Button>
              <Button size="sm" variant="outline" className="h-8 rounded-none text-[10px] uppercase tracking-[0.2em]" onClick={() => setDraft((d) => d.slice(0, -1))}>Remove last point</Button>
            </>}
            {selected && <Button size="sm" variant="outline" className={iconBtn} onClick={removeSelected} aria-label="Delete selected"><Trash2 className="h-3 w-3" /></Button>}
          </div>
          <p className="absolute bottom-3 left-3 bg-background/85 px-2 py-1 text-[10px] text-muted-foreground">
            {product ? `Drawing: ${product.label} — ${product.detail}. Guides line up corners, sides snap to equal lengths, click the first point to close.` : selected ? "Drag a corner square to reshape, or drag the piece to move it." : "Pick a product on the left to draw. Drag empty space to pan, scroll to zoom."} · 1 square = 1 ft
          </p>
        </div>

        {/* Take-off */}
        <aside className="hidden w-72 shrink-0 flex-col border-l border-border lg:flex">
          <p className="border-b border-border px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Take-off</p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!lines.length && <p className="px-3 py-6 text-sm text-muted-foreground">Nothing drawn yet.</p>}
            {lines.map(({ it, p, qty, gross, total: t }) => (
              <button key={it.id} onClick={() => setSelected(it.id)} className={cn("block w-full border-b border-border/60 px-3 py-2 text-left", selected === it.id && "bg-muted")}>
                <span className="flex justify-between gap-2 text-sm"><span className="truncate">{p?.label}</span><span>{money(t)}</span></span>
                <span className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{p?.detail}{p?.unit ? ` · ${Math.round(qty)} ${p.unit === "lf" ? "lin ft" : "sq ft"}` : ""}{p?.unit === "sqft" && Math.round(qty) !== Math.round(gross) ? ` net of ${Math.round(gross)} drawn` : ""}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex justify-between font-serif text-lg"><span>Total</span><span>{money(total)}</span></div>
            <Button className="mt-2 w-full rounded-none text-[10px] uppercase tracking-[0.2em]" disabled={!items.length} onClick={() => setQuoteOpen(true)}><FileText className="mr-1 h-3.5 w-3.5" />Quote</Button>
            <Button variant="outline" className="mt-2 w-full rounded-none text-[10px] uppercase tracking-[0.2em]" disabled={!items.length} onClick={open3D}><Layers className="mr-1 h-3.5 w-3.5" />3D Studio</Button>
            <Button variant="outline" className="mt-2 w-full rounded-none text-[10px] uppercase tracking-[0.2em]" onClick={() => { if (window.confirm("Clear the whole board?")) { commit([]); setSelected(null); } }}>Clear board</Button>
          </div>
        </aside>
      </div>
      {quoteOpen && (
        <React.Suspense fallback={null}>
          <SurveyQuoteTool pool={null} isOpen={quoteOpen} onClose={() => setQuoteOpen(false)}
            customProduct={{ name: projects.find((p) => p.id === projectId)?.name ?? "Property design", price: Math.round(total), type: "Global design" }} />
        </React.Suspense>
      )}
    </div>
  );
};

export default GlobalDesignBoardV2;
