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
import { ArrowLeft, Fence, Grid2x2, Layers, MousePointer2, Trash2, Undo2, Waves, Droplets, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePersistentState from "@/hooks/usePersistentState";
import { getAllProducts } from "@/data/poolProductLookup";
import { gilmerSpas } from "@/data/gilmerSpas";
import { cn } from "@/lib/utils";

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
  { id: "standard", label: "Standard cage", rate: SCREEN_ENCLOSURE_PRICING.standard },
  { id: "deluxe", label: "Deluxe cage", rate: SCREEN_ENCLOSURE_PRICING.deluxe },
  { id: "premium", label: "2-story cage", rate: SCREEN_ENCLOSURE_PRICING.premium },
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
  const screens: Product[] = SCREEN_STYLES.flatMap((s) => SCREEN_COLORS.map((c) => ({ id: `enclosure:${s.id}:${c.id}`, kind: "enclosure" as Kind, label: s.label, detail: `${c.id} frame`, rate: s.rate, unit: "sqft" as const, color: c.hex })));
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

const priceOf = (it: BoardItem, p?: Product) => {
  if (!p) return 0;
  if (p.price) return p.price;
  const q = p.unit === "lf" ? length(it.pts) : area(it.pts);
  return q * (p.rate ?? 0);
};

/* ======================================================================= */
const GlobalDesignBoardV2: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const catalog = React.useMemo(buildCatalog, []);
  const byId = React.useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);
  const [items, setItems] = usePersistentState<BoardItem[]>("global_design_v2_scene", []);
  const [kind, setKind] = usePersistentState<Kind>("global_design_v2_kind", "pool");
  const [productId, setProductId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Pt[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [view, setView] = React.useState({ x: 0, y: 0, zoom: 1 });
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ id?: string; last: Pt; pan?: boolean } | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 600 });

  const product = productId ? byId.get(productId) : undefined;
  const choices = React.useMemo(() => catalog.filter((p) => p.kind === kind), [catalog, kind]);

  React.useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const toWorld = (cx: number, cy: number): Pt => {
    const s = PX_PER_FT * view.zoom;
    return { x: (cx - size.w / 2 - view.x) / s, y: (cy - size.h / 2 - view.y) / s };
  };

  /* ---------- render ---------- */
  React.useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const g = cv.getContext("2d"); if (!g) return;
    const s = PX_PER_FT * view.zoom;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#8fa77a"; g.fillRect(0, 0, size.w, size.h);
    g.translate(size.w / 2 + view.x, size.h / 2 + view.y);
    // 1-ft grid with 10-ft emphasis
    const x0 = Math.floor((-size.w / 2 - view.x) / s), x1 = Math.ceil((size.w / 2 - view.x) / s);
    const y0 = Math.floor((-size.h / 2 - view.y) / s), y1 = Math.ceil((size.h / 2 - view.y) / s);
    for (let x = x0; x <= x1; x++) { g.strokeStyle = x % 10 ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.12)"; g.beginPath(); g.moveTo(x * s, y0 * s); g.lineTo(x * s, y1 * s); g.stroke(); }
    for (let y = y0; y <= y1; y++) { g.strokeStyle = y % 10 ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.12)"; g.beginPath(); g.moveTo(x0 * s, y * s); g.lineTo(x1 * s, y * s); g.stroke(); }

    const order: Kind[] = ["turf", "deck", "pool", "spa", "enclosure", "fence"];
    const path = (pts: Pt[], close: boolean) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x * s, p.y * s) : g.moveTo(p.x * s, p.y * s))); if (close) g.closePath(); };
    for (const k of order) for (const it of items) {
      if (it.kind !== k) continue;
      const p = byId.get(it.productId); if (!p) continue;
      const sel = it.id === selected;
      if (k === "fence") {
        path(it.pts, false); g.strokeStyle = p.color; g.lineWidth = Math.max(2, 0.4 * s); g.stroke();
        it.pts.forEach((q) => { g.fillStyle = p.color; g.fillRect(q.x * s - 3, q.y * s - 3, 6, 6); });
        const L = length(it.pts); // posts every 6 ft
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
      if (sel) { path(it.pts, k !== "fence"); g.setLineDash([6, 4]); g.lineWidth = 2; g.strokeStyle = "#f97066"; g.stroke(); g.setLineDash([]); }
      // label
      const c = it.pts.reduce((a, q) => ({ x: a.x + q.x / it.pts.length, y: a.y + q.y / it.pts.length }), { x: 0, y: 0 });
      g.font = "11px ui-sans-serif"; g.textAlign = "center"; g.fillStyle = "rgba(20,20,20,0.85)";
      g.fillText(p.label, c.x * s, c.y * s);
    }
    if (draft.length) {
      path(draft, false); g.strokeStyle = "#f97066"; g.lineWidth = 2; g.setLineDash([5, 4]); g.stroke(); g.setLineDash([]);
      draft.forEach((q) => { g.fillStyle = "#fff"; g.strokeStyle = "#f97066"; g.beginPath(); g.arc(q.x * s, q.y * s, 4, 0, 7); g.fill(); g.stroke(); });
    }
  }, [items, draft, selected, view, size, byId]);

  /* ---------- interaction ---------- */
  const finish = React.useCallback(() => {
    if (!product) return;
    const min = product.kind === "fence" ? 2 : 3;
    if (draft.length >= min) setItems((prev) => [...prev, { id: `${Date.now()}`, productId: product.id, kind: product.kind, pts: draft }]);
    setDraft([]);
  }, [draft, product, setItems]);

  const hit = (w: Pt) => [...items].reverse().find((it) => (it.kind === "fence" ? nearLine(w, it.pts, 1.5) : inside(w, it.pts)));

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const w = toWorld(e.clientX - r.left, e.clientY - r.top);
    const snap = { x: Math.round(w.x * 2) / 2, y: Math.round(w.y * 2) / 2 };
    if (e.button === 1 || e.shiftKey) { drag.current = { pan: true, last: { x: e.clientX, y: e.clientY } }; return; }
    if (product) {
      if (product.size) {
        const { w: W, l: L } = product.size;
        setItems((prev) => [...prev, { id: `${Date.now()}`, productId: product.id, kind: product.kind, pts: [
          { x: snap.x - L / 2, y: snap.y - W / 2 }, { x: snap.x + L / 2, y: snap.y - W / 2 }, { x: snap.x + L / 2, y: snap.y + W / 2 }, { x: snap.x - L / 2, y: snap.y + W / 2 },
        ] }]);
      } else setDraft((d) => [...d, snap]);
      return;
    }
    const h = hit(w);
    setSelected(h?.id ?? null);
    drag.current = h ? { id: h.id, last: w } : { pan: true, last: { x: e.clientX, y: e.clientY } };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current; if (!d) return;
    if (d.pan) { setView((v) => ({ ...v, x: v.x + e.clientX - d.last.x, y: v.y + e.clientY - d.last.y })); d.last = { x: e.clientX, y: e.clientY }; return; }
    const r = e.currentTarget.getBoundingClientRect();
    const w = toWorld(e.clientX - r.left, e.clientY - r.top);
    const dx = w.x - d.last.x, dy = w.y - d.last.y; d.last = w;
    setItems((prev) => prev.map((it) => (it.id === d.id ? { ...it, pts: it.pts.map((q) => ({ x: q.x + dx, y: q.y + dy })) } : it)));
  };
  const onUp = () => { drag.current = null; };
  const onWheel = (e: React.WheelEvent) => setView((v) => ({ ...v, zoom: Math.min(6, Math.max(0.25, v.zoom * (e.deltaY < 0 ? 1.1 : 0.9))) }));

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "Enter") finish();
      if (e.key === "Escape") { setDraft([]); setProductId(null); }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) { setItems((p) => p.filter((i) => i.id !== selected)); setSelected(null); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [finish, selected, setItems]);

  /* ---------- take-off ---------- */
  const lines = items.map((it) => { const p = byId.get(it.productId); return { it, p, qty: p?.unit === "lf" ? length(it.pts) : p?.unit === "sqft" ? area(it.pts) : 1, total: priceOf(it, p) }; });
  const total = lines.reduce((s, l) => s + l.total, 0);
  const hint = KINDS.find((k) => k.id === kind)?.hint;

  return (
    <div className={cn("flex flex-col bg-background text-foreground", embedded ? "h-[760px]" : "h-screen")}>
      {!embedded && <Helmet><title>Global Design Board V2 · Wonderlands</title><meta name="description" content="Design the whole property on one board: pools, spas, decks, turf, fences and screens, priced as you draw." /></Helmet>}
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          {!embedded && <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Link>}
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Wonderlands · Global Design Board V2</p>
            <h1 className="font-serif text-lg leading-none">The whole property, on one board</h1>
          </div>
        </div>
        <div className="text-right"><p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Project as drawn</p><p className="font-serif text-xl">{money(total)}</p></div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Product-first palette */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-border">
          <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
            {KINDS.map((k) => (
              <button key={k.id} onClick={() => { setKind(k.id); setProductId(null); setDraft([]); }}
                className={cn("flex flex-col items-center gap-1 bg-background py-2 text-[9px] uppercase tracking-[0.2em]", kind === k.id && "bg-foreground text-background")}>
                <k.Icon className="h-3.5 w-3.5" />{k.label}
              </button>
            ))}
          </div>
          <p className="border-b border-border px-3 py-2 text-[11px] text-muted-foreground">1. Choose the product · 2. {hint}</p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {choices.map((p) => (
              <button key={p.id} onClick={() => { setProductId(p.id === productId ? null : p.id); setDraft([]); setSelected(null); }}
                className={cn("flex w-full items-center gap-3 border-b border-border/60 px-3 py-2 text-left hover:bg-muted/50", productId === p.id && "bg-muted")}>
                <span className="h-6 w-6 shrink-0 border border-border" style={{ background: p.color }} />
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
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onDoubleClick={finish} />
          <div className="absolute left-3 top-3 flex gap-1">
            <Button size="sm" variant={product ? "outline" : "default"} className="h-8 rounded-none text-[10px] uppercase tracking-[0.2em]" onClick={() => { setProductId(null); setDraft([]); }}><MousePointer2 className="mr-1 h-3 w-3" />Select / move</Button>
            {draft.length > 0 && <>
              <Button size="sm" className="h-8 rounded-none text-[10px] uppercase tracking-[0.2em]" onClick={finish}>Finish</Button>
              <Button size="sm" variant="outline" className="h-8 rounded-none" onClick={() => setDraft((d) => d.slice(0, -1))} aria-label="Undo last point"><Undo2 className="h-3 w-3" /></Button>
            </>}
            {selected && <Button size="sm" variant="outline" className="h-8 rounded-none" onClick={() => { setItems((p) => p.filter((i) => i.id !== selected)); setSelected(null); }} aria-label="Delete selected"><Trash2 className="h-3 w-3" /></Button>}
          </div>
          <p className="absolute bottom-3 left-3 bg-background/85 px-2 py-1 text-[10px] text-muted-foreground">
            {product ? `Drawing: ${product.label} — ${product.detail}` : "Pick a product on the left to draw. Drag empty space to pan, scroll to zoom."} · 1 square = 1 ft
          </p>
        </div>

        {/* Take-off */}
        <aside className="hidden w-72 shrink-0 flex-col border-l border-border lg:flex">
          <p className="border-b border-border px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Take-off</p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!lines.length && <p className="px-3 py-6 text-sm text-muted-foreground">Nothing drawn yet.</p>}
            {lines.map(({ it, p, qty, total: t }) => (
              <button key={it.id} onClick={() => setSelected(it.id)} className={cn("block w-full border-b border-border/60 px-3 py-2 text-left", selected === it.id && "bg-muted")}>
                <span className="flex justify-between gap-2 text-sm"><span className="truncate">{p?.label}</span><span>{money(t)}</span></span>
                <span className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{p?.detail}{p?.unit ? ` · ${Math.round(qty)} ${p.unit === "lf" ? "lin ft" : "sq ft"}` : ""}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex justify-between font-serif text-lg"><span>Total</span><span>{money(total)}</span></div>
            <Button variant="outline" className="mt-2 w-full rounded-none text-[10px] uppercase tracking-[0.2em]" onClick={() => { if (window.confirm("Clear the whole board?")) { setItems([]); setSelected(null); } }}>Clear board</Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GlobalDesignBoardV2;
