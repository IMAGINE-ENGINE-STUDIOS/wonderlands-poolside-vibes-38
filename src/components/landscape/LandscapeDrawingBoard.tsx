import * as React from "react";
import {
  Flower2,
  MousePointer2,
  PenTool,
  Repeat,
  Route,
  Search,
  Sprout,
  Trash2,
  TreeDeciduous,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { landscapingCategories, landscapingPlants, type LandscapingCategory } from "@/data/landscapingData";
import {
  BED_FILLS,
  LANDSCAPE_PX_PER_FT,
  bedFill,
  emptyLandscapeLayout,
  measureLandscapeLayout,
  perimeterFt,
  pointInPolygon,
  polygonAreaSqFt,
  sampleBed,
  type BedFillId,
  type LandscapeBed,
  type LandscapeLayout,
  type LandscapePlanting,
  type LandscapePoint,
  type LandscapeTakeoff,
} from "@/lib/landscape/landscapeEstimate";
import { drawnSpreadFt, resolvePick, type PlantSpec } from "@/lib/landscape/plantSpecs";
import { hitVertexIndex, insertVertexAt, nearestSegment, removeVertex, toggleCurveFlag } from "@/utils/splineEditing";

/**
 * Wonderlands Planting Studio — the landscape drawing board.
 *
 * A planting plan, not a shaded polygon: beds are traced on the same 10 px = 1 ft
 * grid every other Wonderlands board uses (so the drawing drops straight into the
 * global design board), and each plant is placed as a real catalog item drawn at
 * its true mature canopy for the container size, with its own foliage colour and
 * flowers rendered from above.
 *
 * Tools
 *  - Bed      trace a bed outline; press C on a vertex to round the edge
 *  - Plant    click to set one plant, drag to sweep a natural drift
 *  - Hedge    click a run, finish to space the plant on centre along it
 *  - Fill     mass-plant the selected bed on its recommended spacing
 *  - Select   move / delete plants, restyle beds
 */

export type { LandscapeLayout, LandscapePlanting, LandscapeBed } from "@/lib/landscape/landscapeEstimate";
export { measureLandscapeLayout } from "@/lib/landscape/landscapeEstimate";

const PX = LANDSCAPE_PX_PER_FT;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 4;
const HIT_PX = 9;

type Tool = "select" | "bed" | "plant" | "hedge";
type Selection =
  | { type: "bed"; id: string }
  | { type: "vertex"; id: string; index: number }
  | { type: "plant"; id: string }
  | null;

export interface LandscapeTakeoffReport extends LandscapeTakeoff {}

interface Props {
  layout: LandscapeLayout;
  onChange: (layout: LandscapeLayout) => void;
  onMeasure?: (takeoff: LandscapeTakeoff) => void;
  /** Catalog plant armed for placement, as `plantId|variantId|size` */
  activePlantKey?: string;
  onActivePlantChange?: (key: string) => void;
  /** Title block printed inside the board chrome */
  header?: React.ReactNode;
  /** Magazine leaf layout: console docked below the canvas instead of beside it */
  menuSide?: boolean;
  readOnly?: boolean;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const parseKey = (key: string | undefined) => {
  const [plantId = "", variantId = "", size = ""] = (key ?? "").split("|");
  return { plantId, variantId, size };
};

const defaultKey = () => {
  const p = landscapingPlants.find((x) => /ixora/i.test(x.name)) ?? landscapingPlants[0];
  const v = p.variants[0];
  return `${p.id}|${v.id}|${v.sizes[0].size}`;
};

/* ------------------------------------------------------------------ *
 * Plan-view plant rendering
 * ------------------------------------------------------------------ */

/** Deterministic jitter so every plant of a species looks individual but stable. */
const noise = (seed: number, i: number) => {
  const n = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

const seedOf = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return h;
};

function drawPlant(
  ctx: CanvasRenderingContext2D,
  spec: PlantSpec,
  x: number,
  y: number,
  r: number,
  seed: number,
  rot: number,
  selected: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // cast shadow — reads as height on the plan
  ctx.fillStyle = "rgba(15,23,20,0.16)";
  ctx.beginPath();
  ctx.ellipse(r * 0.16, r * 0.2, r * 0.98, r * 0.92, 0, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  grad.addColorStop(0, spec.foliage);
  grad.addColorStop(1, shade(spec.foliage, -0.35));
  ctx.fillStyle = grad;
  ctx.strokeStyle = shade(spec.foliage, -0.5);
  ctx.lineWidth = Math.max(0.6, r * 0.05);

  if (spec.form === "palm") {
    const fronds = 9;
    ctx.strokeStyle = spec.foliage;
    ctx.lineWidth = Math.max(1.1, r * 0.16);
    ctx.lineCap = "round";
    for (let i = 0; i < fronds; i++) {
      const a = (i / fronds) * Math.PI * 2 + noise(seed, i) * 0.25;
      const len = r * (0.72 + noise(seed, i + 40) * 0.28);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(a) * len * 0.6, Math.sin(a) * len * 0.6, Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.fillStyle = shade(spec.foliage, -0.55);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1.2, r * 0.17), 0, Math.PI * 2);
    ctx.fill();
  } else if (spec.form === "grass") {
    const blades = 14;
    ctx.strokeStyle = spec.foliage;
    ctx.lineWidth = Math.max(0.7, r * 0.1);
    for (let i = 0; i < blades; i++) {
      const a = (i / blades) * Math.PI * 2;
      const len = r * (0.55 + noise(seed, i) * 0.45);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }
  } else if (spec.form === "spike") {
    const leaves = 7;
    for (let i = 0; i < leaves; i++) {
      const a = (i / leaves) * Math.PI * 2 + noise(seed, i) * 0.3;
      const len = r * (0.8 + noise(seed, i + 9) * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(a + 0.25) * len * 0.7,
        Math.sin(a + 0.25) * len * 0.7,
        Math.cos(a) * len,
        Math.sin(a) * len,
      );
      ctx.quadraticCurveTo(
        Math.cos(a - 0.25) * len * 0.7,
        Math.sin(a - 0.25) * len * 0.7,
        0,
        0,
      );
      ctx.fill();
    }
  } else {
    // lobed canopy — mound, tree, mat, vine
    const lobes = spec.form === "tree" ? 11 : 8;
    ctx.beginPath();
    for (let i = 0; i <= lobes; i++) {
      const a = (i / lobes) * Math.PI * 2;
      const rr = r * (0.82 + noise(seed, i) * 0.28);
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.quadraticCurveTo(Math.cos(a - 0.3) * r * 1.02, Math.sin(a - 0.3) * r * 1.02, px, py);
    }
    ctx.closePath();
    ctx.fill();
    if (r > 5) ctx.stroke();

    if (spec.form === "tree") {
      ctx.fillStyle = "rgba(58,40,26,0.85)";
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.3, r * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    if (spec.form === "mat" && r > 4) {
      ctx.strokeStyle = shade(spec.foliage, 0.25);
      ctx.lineWidth = 0.7;
      for (let i = 0; i < 5; i++) {
        const a = noise(seed, i) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
        ctx.stroke();
      }
    }
  }

  // flowers — the reason a planting plan is worth reading
  if (spec.bloom && r > 3) {
    const count = spec.form === "tree" || spec.form === "vine" ? 14 : 9;
    const dot = Math.max(0.9, r * (spec.form === "tree" ? 0.11 : 0.16));
    for (let i = 0; i < count; i++) {
      const a = noise(seed, i + 100) * Math.PI * 2;
      const rr = r * (0.2 + noise(seed, i + 200) * 0.72);
      ctx.fillStyle = spec.bloom;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, dot, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rr - dot * 0.25, Math.sin(a) * rr - dot * 0.25, dot * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  if (selected) {
    ctx.save();
    ctx.strokeStyle = "rgba(8,145,178,0.95)";
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/** Lighten (t>0) or darken (t<0) a hex colour. */
function shade(hex: string, t: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const mix = (v: number) => Math.round(t >= 0 ? v + (255 - v) * t : v * (1 + t));
  r = mix(r);
  g = mix(g);
  b = mix(b);
  return `rgb(${r},${g},${b})`;
}

/* ------------------------------------------------------------------ *
 * Board
 * ------------------------------------------------------------------ */

const LandscapeDrawingBoard: React.FC<Props> = ({
  layout,
  onChange,
  onMeasure,
  activePlantKey,
  onActivePlantChange,
  header,
  menuSide = false,
  readOnly = false,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 900, h: 560 });
  const [tool, setTool] = React.useState<Tool>("plant");
  const [sel, setSel] = React.useState<Selection>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [draft, setDraft] = React.useState<LandscapePoint[]>([]);
  const [hedge, setHedge] = React.useState<LandscapePoint[]>([]);
  const [cursor, setCursor] = React.useState<LandscapePoint | null>(null);
  const [bedFillId, setBedFillId] = React.useState<BedFillId>("mulch-brown");
  const [showSpacing, setShowSpacing] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState<LandscapingCategory>("Flowering");
  const dragRef = React.useRef<{ mode: "pan" | "plant" | "vertex" | "drift"; id?: string; index?: number; last?: LandscapePoint } | null>(null);

  const key = activePlantKey && activePlantKey.includes("|") ? activePlantKey : defaultKey();
  const parsed = parseKey(key);
  const active = React.useMemo(() => resolvePick(parsed.plantId, parsed.variantId, parsed.size), [parsed.plantId, parsed.variantId, parsed.size]);

  const takeoff = React.useMemo(() => measureLandscapeLayout(layout), [layout]);
  React.useEffect(() => {
    onMeasure?.(takeoff);
  }, [takeoff, onMeasure]);

  /* ------------------------------ sizing ------------------------------ */
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ w: Math.max(320, rect.width), h: Math.max(280, rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toWorld = React.useCallback(
    (ev: { clientX: number; clientY: number }): LandscapePoint => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: (ev.clientX - rect.left - pan.x) / zoom,
        y: (ev.clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan.x, pan.y, zoom],
  );

  /* ------------------------------ drawing ------------------------------ */
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    // paper
    ctx.fillStyle = "#f7f5f0";
    ctx.fillRect(0, 0, size.w, size.h);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1 ft / 5 ft grid
    const step = PX;
    const x0 = -pan.x / zoom;
    const y0 = -pan.y / zoom;
    const x1 = x0 + size.w / zoom;
    const y1 = y0 + size.h / zoom;
    ctx.lineWidth = 1 / zoom;
    for (let gx = Math.floor(x0 / step) * step; gx < x1; gx += step) {
      const major = Math.round(gx / step) % 5 === 0;
      if (!major && zoom < 0.7) continue;
      ctx.strokeStyle = major ? "rgba(20,40,30,0.16)" : "rgba(20,40,30,0.07)";
      ctx.beginPath();
      ctx.moveTo(gx, y0);
      ctx.lineTo(gx, y1);
      ctx.stroke();
    }
    for (let gy = Math.floor(y0 / step) * step; gy < y1; gy += step) {
      const major = Math.round(gy / step) % 5 === 0;
      if (!major && zoom < 0.7) continue;
      ctx.strokeStyle = major ? "rgba(20,40,30,0.16)" : "rgba(20,40,30,0.07)";
      ctx.beginPath();
      ctx.moveTo(x0, gy);
      ctx.lineTo(x1, gy);
      ctx.stroke();
    }

    // beds
    for (const bed of layout.beds) {
      const outline = sampleBed(bed);
      if (outline.length < 2) continue;
      const fill = bedFill(bed.fill);
      ctx.beginPath();
      ctx.moveTo(outline[0].x, outline[0].y);
      for (let i = 1; i < outline.length; i++) ctx.lineTo(outline[i].x, outline[i].y);
      if (bed.closed) ctx.closePath();
      if (bed.closed) {
        ctx.fillStyle = fill.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        // speckle texture
        ctx.save();
        ctx.clip();
        const seed = seedOf(bed.id);
        const flecks = 260;
        ctx.fillStyle = fill.fleck;
        const bx = Math.min(...outline.map((p) => p.x));
        const by = Math.min(...outline.map((p) => p.y));
        const bw = Math.max(...outline.map((p) => p.x)) - bx;
        const bh = Math.max(...outline.map((p) => p.y)) - by;
        for (let i = 0; i < flecks; i++) {
          const px = bx + noise(seed, i) * bw;
          const py = by + noise(seed, i + 500) * bh;
          ctx.beginPath();
          ctx.ellipse(px, py, 1.6, 0.9, noise(seed, i + 900) * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.strokeStyle = sel?.type !== "plant" && sel && "id" in sel && sel.id === bed.id ? "#0891b2" : shade(fill.color, -0.45);
      ctx.lineWidth = (bed.edged ? 2.4 : 1.4) / zoom;
      ctx.stroke();
    }

    // spacing rings under the plants
    if (showSpacing) {
      for (const p of layout.plantings) {
        const pick = resolvePick(p.plantId, p.variantId, p.size);
        if (!pick) continue;
        ctx.strokeStyle = "rgba(20,60,45,0.18)";
        ctx.setLineDash([3 / zoom, 3 / zoom]);
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (pick.spec.spacingFt * PX) / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // plants, short to tall so canopies overlap believably
    const ordered = [...layout.plantings]
      .map((p) => ({ p, pick: resolvePick(p.plantId, p.variantId, p.size) }))
      .filter((x) => x.pick)
      .sort((a, b) => a.pick!.spec.heightFt - b.pick!.spec.heightFt);

    for (const { p, pick } of ordered) {
      const r = (drawnSpreadFt(pick!.spec, pick!.size) * PX) / 2;
      drawPlant(ctx, pick!.spec, p.x, p.y, r, seedOf(p.id), p.rot ?? 0, sel?.type === "plant" && sel.id === p.id);
    }

    // labels
    if (showLabels && zoom > 0.65) {
      ctx.font = `${9 / zoom}px ui-sans-serif, system-ui`;
      ctx.textAlign = "center";
      for (const { p, pick } of ordered) {
        const r = (drawnSpreadFt(pick!.spec, pick!.size) * PX) / 2;
        if (r < 8) continue;
        const label = pick!.plant.name.split(" ")[0].toUpperCase();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(label, p.x + 0.6 / zoom, p.y + r + 11 / zoom);
        ctx.fillStyle = "rgba(18,40,30,0.85)";
        ctx.fillText(label, p.x, p.y + r + 10.4 / zoom);
      }
    }

    // bed in progress
    const drawDraft = (pts: LandscapePoint[], colour: string) => {
      if (!pts.length) return;
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1.6 / zoom;
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (cursor) ctx.lineTo(cursor.x, cursor.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colour;
      for (const pt of pts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 / zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawDraft(draft, "#0891b2");
    drawDraft(hedge, "#3f7a48");

    // vertex handles on the selected bed
    if (sel && sel.type !== "plant") {
      const bed = layout.beds.find((b) => b.id === (sel as { id: string }).id);
      if (bed) {
        bed.points.forEach((pt, i) => {
          const rounded = (bed.spline || bed.curves?.[i]) ?? false;
          ctx.fillStyle = sel.type === "vertex" && sel.index === i ? "#0891b2" : rounded ? "#f97066" : "#ffffff";
          ctx.strokeStyle = "#0f3d2e";
          ctx.lineWidth = 1.2 / zoom;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4 / zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
    }

    // ghost of the plant about to be placed
    if (tool === "plant" && cursor && active) {
      const r = (drawnSpreadFt(active.spec, active.size) * PX) / 2;
      ctx.globalAlpha = 0.55;
      drawPlant(ctx, active.spec, cursor.x, cursor.y, r, 7, 0, false);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [layout, size, zoom, pan, draft, hedge, cursor, sel, tool, active, showSpacing, showLabels]);

  /* ------------------------------ mutations ------------------------------ */
  const commit = React.useCallback((next: Partial<LandscapeLayout>) => onChange({ ...layout, ...next }), [layout, onChange]);

  const addPlanting = React.useCallback(
    (at: LandscapePoint, rot = Math.random() * Math.PI * 2) => {
      if (!active) return;
      const planting: LandscapePlanting = {
        id: uid(),
        plantId: active.plant.id,
        variantId: active.variantId,
        size: active.size,
        x: at.x,
        y: at.y,
        rot,
      };
      onChange({ ...layout, plantings: [...layout.plantings, planting] });
    },
    [active, layout, onChange],
  );

  /** Space the armed plant along a polyline at its on-centre spacing. */
  const plantRun = React.useCallback(
    (pts: LandscapePoint[]) => {
      if (!active || pts.length < 2) return;
      const spacing = Math.max(1, active.spec.spacingFt) * PX;
      const added: LandscapePlanting[] = [];
      let carry = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        for (let d = carry; d <= len; d += spacing) {
          const t = d / len;
          added.push({
            id: uid(),
            plantId: active.plant.id,
            variantId: active.variantId,
            size: active.size,
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            rot: Math.random() * Math.PI * 2,
          });
        }
        carry = spacing - ((len - carry) % spacing);
      }
      onChange({ ...layout, plantings: [...layout.plantings, ...added] });
    },
    [active, layout, onChange],
  );

  /** Mass-plant the selected bed on a staggered grid at recommended spacing. */
  const fillBed = React.useCallback(() => {
    if (!active || !sel || sel.type === "plant") return;
    const bed = layout.beds.find((b) => b.id === (sel as { id: string }).id);
    if (!bed || !bed.closed) return;
    const outline = sampleBed(bed);
    const spacing = Math.max(1, active.spec.spacingFt) * PX;
    const xs = outline.map((p) => p.x);
    const ys = outline.map((p) => p.y);
    const added: LandscapePlanting[] = [];
    let row = 0;
    for (let y = Math.min(...ys) + spacing / 2; y < Math.max(...ys); y += spacing * 0.87, row++) {
      for (let x = Math.min(...xs) + spacing / 2 + (row % 2 ? spacing / 2 : 0); x < Math.max(...xs); x += spacing) {
        if (!pointInPolygon({ x, y }, outline)) continue;
        added.push({
          id: uid(),
          plantId: active.plant.id,
          variantId: active.variantId,
          size: active.size,
          x,
          y,
          rot: Math.random() * Math.PI * 2,
        });
      }
    }
    if (added.length) onChange({ ...layout, plantings: [...layout.plantings, ...added] });
  }, [active, sel, layout, onChange]);

  const hitPlanting = React.useCallback(
    (p: LandscapePoint) => {
      // topmost (tallest) first
      const ordered = [...layout.plantings]
        .map((x) => ({ x, pick: resolvePick(x.plantId, x.variantId, x.size) }))
        .filter((v) => v.pick)
        .sort((a, b) => b.pick!.spec.heightFt - a.pick!.spec.heightFt);
      for (const { x, pick } of ordered) {
        const r = (drawnSpreadFt(pick!.spec, pick!.size) * PX) / 2;
        if (Math.hypot(x.x - p.x, x.y - p.y) <= Math.max(r, 5)) return x;
      }
      return null;
    },
    [layout.plantings],
  );

  /* ------------------------------ pointer ------------------------------ */
  const onPointerDown = (ev: React.PointerEvent) => {
    if (readOnly) return;
    const p = toWorld(ev);
    (ev.target as Element).setPointerCapture?.(ev.pointerId);

    if (ev.button === 1 || ev.altKey) {
      dragRef.current = { mode: "pan", last: { x: ev.clientX, y: ev.clientY } };
      return;
    }

    if (tool === "bed") {
      setDraft((d) => [...d, p]);
      return;
    }
    if (tool === "hedge") {
      setHedge((d) => [...d, p]);
      return;
    }
    if (tool === "plant") {
      addPlanting(p);
      dragRef.current = { mode: "drift", last: p };
      return;
    }

    // select
    const bedSel = sel && sel.type !== "plant" ? layout.beds.find((b) => b.id === (sel as { id: string }).id) : null;
    if (bedSel) {
      const vi = hitVertexIndex(bedSel.points, p, HIT_PX / zoom);
      if (vi >= 0) {
        setSel({ type: "vertex", id: bedSel.id, index: vi });
        dragRef.current = { mode: "vertex", id: bedSel.id, index: vi };
        return;
      }
    }
    const plant = hitPlanting(p);
    if (plant) {
      setSel({ type: "plant", id: plant.id });
      dragRef.current = { mode: "plant", id: plant.id };
      return;
    }
    const bed = [...layout.beds].reverse().find((b) => b.closed && pointInPolygon(p, sampleBed(b)));
    if (bed) {
      setSel({ type: "bed", id: bed.id });
      setBedFillId(bed.fill);
      return;
    }
    setSel(null);
    dragRef.current = { mode: "pan", last: { x: ev.clientX, y: ev.clientY } };
  };

  const onPointerMove = (ev: React.PointerEvent) => {
    const p = toWorld(ev);
    setCursor(p);
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.mode === "pan" && drag.last) {
      setPan((prev) => ({ x: prev.x + (ev.clientX - drag.last!.x), y: prev.y + (ev.clientY - drag.last!.y) }));
      drag.last = { x: ev.clientX, y: ev.clientY };
      return;
    }
    if (drag.mode === "drift" && drag.last && active) {
      const spacing = Math.max(1, active.spec.spacingFt) * PX * 0.9;
      if (Math.hypot(p.x - drag.last.x, p.y - drag.last.y) >= spacing) {
        addPlanting({ x: p.x + (Math.random() - 0.5) * spacing * 0.3, y: p.y + (Math.random() - 0.5) * spacing * 0.3 });
        drag.last = p;
      }
      return;
    }
    if (drag.mode === "plant" && drag.id) {
      commit({ plantings: layout.plantings.map((x) => (x.id === drag.id ? { ...x, x: p.x, y: p.y } : x)) });
      return;
    }
    if (drag.mode === "vertex" && drag.id !== undefined && drag.index !== undefined) {
      commit({
        beds: layout.beds.map((b) =>
          b.id === drag.id ? { ...b, points: b.points.map((pt, i) => (i === drag.index ? p : pt)) } : b,
        ),
      });
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const finishBed = () => {
    if (draft.length >= 3) {
      const bed: LandscapeBed = { id: uid(), points: draft, closed: true, fill: bedFillId, edged: true, curves: [] };
      onChange({ ...layout, beds: [...layout.beds, bed] });
      setSel({ type: "bed", id: bed.id });
    }
    setDraft([]);
  };

  const finishHedge = () => {
    plantRun(hedge);
    setHedge([]);
  };

  const onDoubleClick = () => {
    if (tool === "bed") finishBed();
    if (tool === "hedge") finishHedge();
  };

  const onWheel = (ev: React.WheelEvent) => {
    ev.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = ev.clientX - rect.left;
    const cy = ev.clientY - rect.top;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (ev.deltaY < 0 ? 1.1 : 1 / 1.1)));
    const k = next / zoom;
    setPan((prev) => ({ x: cx - (cx - prev.x) * k, y: cy - (cy - prev.y) * k }));
    setZoom(next);
  };

  /* keyboard: Enter finishes, Delete removes, C rounds a bed corner */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (readOnly) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "Enter") {
        if (draft.length) finishBed();
        if (hedge.length) finishHedge();
      }
      if (e.key === "Escape") {
        setDraft([]);
        setHedge([]);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && sel) {
        if (sel.type === "plant") commit({ plantings: layout.plantings.filter((x) => x.id !== sel.id) });
        else if (sel.type === "vertex")
          commit({
            beds: layout.beds.map((b) =>
              b.id === sel.id ? { ...b, points: removeVertex(b.points, sel.index), curves: b.curves } : b,
            ),
          });
        else commit({ beds: layout.beds.filter((b) => b.id !== sel.id) });
        setSel(null);
      }
      if ((e.key === "c" || e.key === "C") && sel?.type === "vertex") {
        commit({
          beds: layout.beds.map((b) =>
            b.id === sel.id ? { ...b, spline: false, curves: toggleCurveFlag(b.curves, sel.index, b.points.length) } : b,
          ),
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ------------------------------ palette ------------------------------ */
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? landscapingPlants.filter((p) => p.name.toLowerCase().includes(q))
      : landscapingPlants.filter((p) => p.category === cat);
    return pool.slice(0, 48);
  }, [query, cat]);

  const selectedBed = sel && sel.type !== "plant" ? layout.beds.find((b) => b.id === (sel as { id: string }).id) : null;

  const toolBtn = (id: Tool, label: string, Icon: typeof PenTool) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setTool(id);
        setDraft([]);
        setHedge([]);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.24em] transition-colors",
        tool === id ? "border-foreground bg-foreground text-background" : "border-border/60 hover:bg-muted",
      )}
    >
      <Icon className="h-3 w-3" /> {label}
    </button>
  );

  const canvasEl = (
    <div
      ref={wrapRef}
      className="relative min-h-[280px] flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-[0_24px_60px_-40px_rgba(8,20,16,0.6)]"
      style={{ height: menuSide ? 340 : 560 }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size.w, height: size.h, touchAction: "none" }}
        className={cn(
          "block",
          tool === "select" ? "cursor-default" : tool === "plant" ? "cursor-crosshair" : "cursor-crosshair",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          setCursor(null);
          dragRef.current = null;
        }}
        onDoubleClick={onDoubleClick}
        onWheel={onWheel}
      />
      <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-2 text-[8px] uppercase tracking-[0.28em] text-muted-foreground">
        <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1 backdrop-blur">
          {takeoff.plantCount} plants
        </span>
        <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1 backdrop-blur">
          {takeoff.bedSqFt.toLocaleString()} sq ft beds
        </span>
        <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1 backdrop-blur">
          {takeoff.mulchYards} cu yd mulch
        </span>
        <span className="rounded-full border border-border/50 bg-background/80 px-2 py-1 backdrop-blur">
          {Math.round(zoom * PX * 10) / 10} px / ft
        </span>
      </div>
      {(draft.length > 0 || hedge.length > 0) && (
        <div className="pointer-events-none absolute right-2 top-2 rounded-full border border-border/50 bg-background/85 px-2.5 py-1 text-[8px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
          {draft.length
            ? `${polygonAreaSqFt(draft).toFixed(0)} sq ft — double-click to close`
            : `${perimeterFt(hedge, false).toFixed(0)} lf run — double-click to plant`}
        </div>
      )}
    </div>
  );

  const console_ = (
    <div className="rounded-2xl border border-border/50 bg-background/60 p-3 shadow-[0_18px_50px_-34px_rgba(8,20,16,0.55)] backdrop-blur-xl">
      {/* tools */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">Tools</span>
        {toolBtn("plant", "Plant", Flower2)}
        {toolBtn("hedge", "Hedge run", Route)}
        {toolBtn("bed", "Bed", PenTool)}
        {toolBtn("select", "Select", MousePointer2)}
        <button
          type="button"
          onClick={fillBed}
          disabled={!selectedBed}
          className="inline-flex items-center gap-1.5 border border-border/60 px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.24em] transition-colors hover:bg-muted disabled:opacity-40"
        >
          <Repeat className="h-3 w-3" /> Mass-plant bed
        </button>
        <button
          type="button"
          onClick={() => commit({ plantings: layout.plantings.slice(0, -1) })}
          disabled={!layout.plantings.length}
          className="inline-flex items-center gap-1.5 border border-border/60 px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.24em] transition-colors hover:bg-muted disabled:opacity-40"
        >
          <Undo2 className="h-3 w-3" /> Undo plant
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(emptyLandscapeLayout());
            setSel(null);
          }}
          className="inline-flex items-center gap-1.5 border border-border/60 px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.24em] transition-colors hover:bg-muted"
        >
          <Trash2 className="h-3 w-3" /> Clear
        </button>
        <label className="ml-auto flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.24em] text-muted-foreground">
          <input type="checkbox" checked={showSpacing} onChange={(e) => setShowSpacing(e.target.checked)} /> Spacing
        </label>
        <label className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.24em] text-muted-foreground">
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> Labels
        </label>
        <label className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.24em] text-muted-foreground">
          <input
            type="checkbox"
            checked={!!layout.irrigation}
            onChange={(e) => commit({ irrigation: e.target.checked })}
          />
          Irrigation
        </label>
      </div>

      {/* bed surface */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/50 pt-2">
        <span className="text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">Bed surface</span>
        {BED_FILLS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setBedFillId(f.id);
              if (selectedBed) commit({ beds: layout.beds.map((b) => (b.id === selectedBed.id ? { ...b, fill: f.id } : b)) });
            }}
            className={cn(
              "inline-flex items-center gap-1.5 border px-2 py-1 text-[8px] uppercase tracking-[0.22em] transition-colors",
              (selectedBed?.fill ?? bedFillId) === f.id ? "border-foreground" : "border-border/60 hover:bg-muted",
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
            {f.name}
          </button>
        ))}
        {selectedBed && (
          <button
            type="button"
            onClick={() => commit({ beds: layout.beds.map((b) => (b.id === selectedBed.id ? { ...b, edged: !b.edged } : b)) })}
            className="inline-flex items-center gap-1.5 border border-border/60 px-2 py-1 text-[8px] uppercase tracking-[0.22em] hover:bg-muted"
          >
            {selectedBed.edged ? "Edging on" : "Edging off"}
          </button>
        )}
      </div>

      {/* plant palette */}
      <div className="mt-2 border-t border-border/50 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">Nursery</span>
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 400+ plants"
              className="h-6 w-44 rounded-full border border-border/60 bg-background/70 pl-7 pr-2 text-[10px] outline-none focus:border-foreground"
            />
          </div>
          {landscapingCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCat(c);
                setQuery("");
              }}
              className={cn(
                "border px-2 py-1 text-[8px] uppercase tracking-[0.22em] transition-colors",
                !query && cat === c ? "border-foreground bg-foreground text-background" : "border-border/60 hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-2 grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => {
            const variant = p.variants[0];
            const sizeOpt = variant.sizes[0];
            const pick = resolvePick(p.id, variant.id, sizeOpt.size);
            const isActive = parsed.plantId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onActivePlantChange?.(`${p.id}|${variant.id}|${sizeOpt.size}`);
                  setTool("plant");
                }}
                className={cn(
                  "flex items-center gap-2 border px-2 py-1.5 text-left transition-colors",
                  isActive ? "border-foreground bg-muted/70" : "border-border/50 hover:bg-muted/50",
                )}
              >
                <span
                  className="relative h-5 w-5 shrink-0 rounded-full"
                  style={{ background: pick?.spec.foliage ?? "#3f7a48" }}
                >
                  {pick?.spec.bloom && (
                    <span
                      className="absolute inset-1 rounded-full"
                      style={{ background: pick.spec.bloom, opacity: 0.9 }}
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10px] leading-tight">{p.name}</span>
                  <span className="block text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
                    {sizeOpt.size} · {pick ? `${pick.spec.spreadFt}′ spread` : ""} · ${Math.round(sizeOpt.finalPrice)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {active && (
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/50 pt-2">
            <span className="text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">Armed</span>
            <span className="text-[11px]">{active.plant.name}</span>
            {active.plant.variants.length > 1 &&
              active.plant.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onActivePlantChange?.(`${active.plant.id}|${v.id}|${v.sizes[0].size}`)}
                  className={cn(
                    "border px-2 py-0.5 text-[8px] uppercase tracking-[0.2em]",
                    v.id === active.variantId ? "border-foreground" : "border-border/60 hover:bg-muted",
                  )}
                >
                  {v.label}
                </button>
              ))}
            {(active.plant.variants.find((v) => v.id === active.variantId)?.sizes ?? []).map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => onActivePlantChange?.(`${active.plant.id}|${active.variantId}|${s.size}`)}
                className={cn(
                  "border px-2 py-0.5 text-[8px] uppercase tracking-[0.2em]",
                  s.size === active.size ? "border-foreground bg-foreground text-background" : "border-border/60 hover:bg-muted",
                )}
              >
                {s.size} · ${Math.round(s.finalPrice)}
              </button>
            ))}
            <span className="text-[8px] uppercase tracking-[0.24em] text-muted-foreground">
              {active.spec.spacingFt}′ on centre · {active.spec.heightFt}′ tall
            </span>
          </div>
        )}
      </div>

      {/* plant schedule */}
      {takeoff.species.length > 0 && (
        <div className="mt-2 border-t border-border/50 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">Plant schedule</span>
            <span className="text-[8.5px] uppercase tracking-[0.24em] text-muted-foreground">
              ${takeoff.total.toLocaleString()} installed
            </span>
          </div>
          <div className="mt-1.5 grid max-h-28 grid-cols-1 gap-1 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {takeoff.species.map((s) => (
              <div key={s.key} className="flex items-center gap-2 border border-border/40 px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.bloom ?? s.foliage }} />
                <span className="min-w-0 flex-1 truncate text-[10px]">{s.name}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.qty} × {s.size}
                </span>
                <span className="text-[10px]">${Math.round(s.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      {header}
      {!header && (
        <div className="flex items-center gap-2">
          <Sprout className="h-4 w-4 text-muted-foreground" />
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Planting studio — 1 ft grid, plants drawn at mature canopy
          </p>
          <TreeDeciduous className="ml-auto h-4 w-4 text-muted-foreground" />
        </div>
      )}
      {canvasEl}
      {!readOnly && console_}
    </div>
  );
};

export default LandscapeDrawingBoard;
