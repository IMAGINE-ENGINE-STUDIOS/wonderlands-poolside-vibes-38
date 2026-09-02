import { boardAltitudeFtOr, setBoardAltitudeFt } from '@/lib/design/boardAltitude';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useBoardDensity from '@/hooks/useBoardDensity';
import {
  MousePointer2,
  PenTool,
  Undo2,
  Trash2,
  Square,
  Waves,
  CornerDownRight,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Plus,
  Spline,
} from 'lucide-react';
import { artificialGrassOptions, getGrassPricePerSqFt } from '@/data/artificialGrassData';
import { cn } from '@/lib/utils';
import {
  allCurved,
  insertVertexAfter,
  insertVertexAt,
  normalizeFlags,
  removeVertex,
  samplePath,
  toggleCurveFlag,
} from '@/utils/splineEditing';

export interface GrassPoint {
  x: number;
  y: number;
}

export interface GrassArea {
  id: string;
  points: GrassPoint[];
  closed: boolean;
  /** Curved (Catmull-Rom spline) instead of straight segments */
  spline: boolean;
  /** Per-vertex curvature handles — a flagged point rounds both of its edges */
  curves?: boolean[];
  /** Artificial grass product id applied to this area */
  grassId: string;
}


export interface GrassLayout {
  areas: GrassArea[];
}

export interface GrassAreaMeasure {
  id: string;
  grassId: string;
  grassName: string;
  areaSqFt: number;
  perimeterFt: number;
}

export interface GrassTakeoff {
  areaSqFt: number;
  perimeterFt: number;
  areas: GrassAreaMeasure[];
}

type Tool = 'draw' | 'select';
type Selection = { type: 'area'; id: string } | { type: 'point'; id: string; index: number } | null;

interface Props {
  layout: GrassLayout;
  onChange: (layout: GrassLayout) => void;
  onMeasure?: (takeoff: GrassTakeoff) => void;
  onSnapshot?: (dataUrl: string | null) => void;
  /** Grass product applied to newly drawn areas */
  activeGrassId: string;
  onActiveGrassChange?: (grassId: string) => void;
  /** Title block rendered inside the board toolbar card */
  header?: React.ReactNode;
}

const PX_PER_FT = 10;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
/** Every drawing board opens on 20 ft of frontage. */
const VIEW_WIDTH_FT = 20;
const HIT_PX = 9;

const uid = () => Math.random().toString(36).slice(2, 9);
const grassById = (id: string) => artificialGrassOptions.find(g => g.id === id) || artificialGrassOptions[0];

/** Curvature handles in effect for an area (legacy `spline` = every point curved) */
function curveFlagsOf(area: GrassArea): boolean[] {
  if (area.spline) return allCurved(area.points.length);
  return normalizeFlags(area.curves, area.points.length);
}

/** Catmull-Rom sampling per curvature handle — straight edges stay straight */
function sampleArea(area: GrassArea): GrassPoint[] {
  const pts = area.points;
  if (pts.length < 3) return pts;
  return samplePath(pts, area.closed, curveFlagsOf(area));
}


function polygonAreaSqFt(pts: GrassPoint[]): number {
  if (pts.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum / 2) / (PX_PER_FT * PX_PER_FT);
}

function perimeterFt(pts: GrassPoint[], closed: boolean): number {
  if (pts.length < 2) return 0;
  let d = 0;
  const last = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < last; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    d += Math.hypot(a.x - b.x, a.y - b.y);
  }
  return d / PX_PER_FT;
}

function pointInPolygon(p: GrassPoint, pts: GrassPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function measureGrassLayout(layout: GrassLayout): GrassTakeoff {
  const areas: GrassAreaMeasure[] = layout.areas
    .filter(a => a.closed && a.points.length >= 3)
    .map(a => {
      const sampled = sampleArea(a);
      return {
        id: a.id,
        grassId: a.grassId,
        grassName: grassById(a.grassId).name,
        areaSqFt: Math.round(polygonAreaSqFt(sampled) * 10) / 10,
        perimeterFt: Math.round(perimeterFt(sampled, true) * 10) / 10,
      };
    });
  return {
    areas,
    areaSqFt: Math.round(areas.reduce((s, a) => s + a.areaSqFt, 0) * 10) / 10,
    perimeterFt: Math.round(areas.reduce((s, a) => s + a.perimeterFt, 0) * 10) / 10,
  };
}

const rect = (x: number, y: number, w: number, h: number): GrassPoint[] => [
  { x, y },
  { x: x + w, y },
  { x: x + w, y: y + h },
  { x, y: y + h },
];

/**
 * Turns a grass product photo into a seamless repeating tile:
 * 1. trims the white studio border (which otherwise tiles as white grid lines)
 * 2. insets a few percent to drop soft vignette edges
 * 3. mirrors the crop 2x2 so opposite edges always match
 */
function buildSeamlessTile(img: HTMLImageElement): HTMLCanvasElement | null {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return null;

  const probe = document.createElement('canvas');
  const max = 512;
  const s = Math.min(1, max / Math.max(iw, ih));
  probe.width = Math.max(1, Math.round(iw * s));
  probe.height = Math.max(1, Math.round(ih * s));
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  if (!pctx) return null;
  pctx.drawImage(img, 0, 0, probe.width, probe.height);

  // find bounding box of non-white content
  let x0 = 0, y0 = 0, x1 = probe.width - 1, y1 = probe.height - 1;
  try {
    const { data } = pctx.getImageData(0, 0, probe.width, probe.height);
    const isContent = (px: number, py: number) => {
      const i = (py * probe.width + px) * 4;
      return data[i] + data[i + 1] + data[i + 2] < 720 && data[i + 3] > 8;
    };
    const rowHas = (py: number) => {
      for (let px = 0; px < probe.width; px += 2) if (isContent(px, py)) return true;
      return false;
    };
    const colHas = (px: number) => {
      for (let py = 0; py < probe.height; py += 2) if (isContent(px, py)) return true;
      return false;
    };
    while (y0 < y1 && !rowHas(y0)) y0++;
    while (y1 > y0 && !rowHas(y1)) y1--;
    while (x0 < x1 && !colHas(x0)) x0++;
    while (x1 > x0 && !colHas(x1)) x1--;
  } catch {
    // cross-origin / unreadable: fall back to the full image
  }

  // map back to source pixels, then take the CENTRE core of the swatch.
  // The product photos are studio swatches with soft, feathered blade edges that
  // stay pale even after trimming pure white, so only the dense middle tiles cleanly.
  const scale = 1 / s;
  let bx = x0 * scale;
  let by = y0 * scale;
  let bw = (x1 - x0 + 1) * scale;
  let bh = (y1 - y0 + 1) * scale;
  if (bw < 16 || bh < 16) {
    bx = 0; by = 0; bw = iw; bh = ih;
  }
  const core = Math.min(bw, bh) * 0.52;
  const sx = bx + (bw - core) / 2;
  const sy = by + (bh - core) / 2;

  // square, capped quarter used for the mirrored tile
  const q = Math.max(32, Math.min(256, Math.round(core / 2)));
  const tile = document.createElement('canvas');
  tile.width = q * 2;
  tile.height = q * 2;
  const tctx = tile.getContext('2d');
  if (!tctx) return null;
  tctx.imageSmoothingQuality = 'high';

  // top-left quarter
  tctx.drawImage(img, sx, sy, core, core, 0, 0, q, q);
  // mirror horizontally, vertically and both
  tctx.save();
  tctx.translate(tile.width, 0);
  tctx.scale(-1, 1);
  tctx.drawImage(tile, 0, 0, q, q, 0, 0, q, q);
  tctx.restore();
  tctx.save();
  tctx.translate(0, tile.height);
  tctx.scale(1, -1);
  tctx.drawImage(tile, 0, 0, tile.width, q, 0, 0, tile.width, q);
  tctx.restore();

  return tile;
}

/** Cache of seamless tiles pre-rendered at the exact on-screen pixel size. */
const scaledTileCache = new Map<string, HTMLCanvasElement>();
function getScaledTile(id: string, tile: HTMLCanvasElement, px: number): HTMLCanvasElement | null {
  const key = `${id}:${px}`;
  const hit = scaledTileCache.get(key);
  if (hit) return hit;
  const out = document.createElement('canvas');
  out.width = px;
  out.height = px;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = 'high';
  // step down in halves for clean minification (avoids aliasing artifacts)
  let src: HTMLCanvasElement = tile;
  while (src.width > px * 2) {
    const half = document.createElement('canvas');
    half.width = Math.max(px, Math.round(src.width / 2));
    half.height = half.width;
    const hctx = half.getContext('2d');
    if (!hctx) break;
    hctx.imageSmoothingQuality = 'high';
    hctx.drawImage(src, 0, 0, half.width, half.height);
    src = half;
  }
  octx.drawImage(src, 0, 0, px, px);
  if (scaledTileCache.size > 40) scaledTileCache.clear();
  scaledTileCache.set(key, out);
  return out;
}



const GrassDrawingBoard: React.FC<Props> = ({
  layout,
  onChange,
  onMeasure,
  onSnapshot,
  activeGrassId,
  onActiveGrassChange,
  header,

}) => {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = React.useState<Tool>('draw');
  const { compact, toggle: toggleDensity } = useBoardDensity();
  const [spline, setSpline] = React.useState(false);
  const [selection, setSelection] = React.useState<Selection>(null);
  const [hover, setHover] = React.useState<GrassPoint | null>(null);
  const [view, setView] = React.useState({ zoom: 1, ox: 40, oy: 30 });
  const dragRef = React.useRef<{ mode: 'point' | 'pan'; id?: string; index?: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 540 });
  /* frame the altitude last flown on any board — see lib/design/boardAltitude */
  const framedRef = React.useRef(false);
  React.useEffect(() => {
    if (framedRef.current || !size.w) return;
    framedRef.current = true;
    setView(v => ({ ...v, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, size.w / (boardAltitudeFtOr(VIEW_WIDTH_FT) * PX_PER_FT))) }));
  }, [size.w]);
  /* …and publish this board's altitude so every other board opens level with it */
  React.useEffect(() => {
    if (size.w) setBoardAltitudeFt(size.w / (view.zoom * PX_PER_FT));
  }, [view.zoom, size.w]);


  // Grass textures for pattern fills — product photos carry a white studio border,
  // so we trim it and mirror the crop into a seamless tile (no white seam lines).
  const [textures, setTextures] = React.useState<Record<string, HTMLCanvasElement>>({});
  React.useEffect(() => {
    let alive = true;
    artificialGrassOptions.forEach(g => {
      const img = new Image();
      img.decoding = 'async';
      img.src = g.image;
      img.onload = () => {
        if (!alive) return;
        try {
          const tile = buildSeamlessTile(img);
          if (tile) setTextures(prev => ({ ...prev, [g.id]: tile }));
        } catch {
          /* texture stays unavailable; the board falls back to a flat wash */
        }
      };
    });
    return () => {
      alive = false;
    };
  }, []);

  // Responsive canvas sizing
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = Math.max(320, Math.floor(entries[0].contentRect.width));
      setSize({ w, h: Math.round(Math.min(620, Math.max(380, w * 0.58))) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toWorld = React.useCallback(
    (sx: number, sy: number): GrassPoint => ({ x: (sx - view.ox) / view.zoom, y: (sy - view.oy) / view.zoom }),
    [view]
  );

  const openArea = layout.areas.find(a => !a.closed) || null;

  const patch = (areas: GrassArea[]) => onChange({ areas });

  /* ------------------------------- rendering ------------------------------ */
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    // paper
    ctx.fillStyle = '#fbfbf9';
    ctx.fillRect(0, 0, size.w, size.h);

    const { zoom, ox, oy } = view;
    const step = PX_PER_FT * zoom;

    // grid
    const drawGrid = (mult: number, color: string, width: number) => {
      const s = step * mult;
      if (s < 6) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let x = ox % s; x < size.w; x += s) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, size.h);
      }
      for (let y = oy % s; y < size.h; y += s) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(size.w, Math.round(y) + 0.5);
      }
      ctx.stroke();
    };
    drawGrid(1, 'rgba(15,23,42,0.06)', 1);
    drawGrid(5, 'rgba(15,23,42,0.14)', 1);

    const S = (p: GrassPoint) => ({ x: p.x * zoom + ox, y: p.y * zoom + oy });

    layout.areas.forEach(area => {
      const pts = sampleArea(area);
      if (pts.length === 0) return;
      const selected = selection?.type === 'area' && selection.id === area.id;

      ctx.beginPath();
      pts.forEach((p, i) => {
        const s = S(p);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      if (area.closed) ctx.closePath();

      if (area.closed) {
        const texId = grassById(area.grassId).id;
        const tex = textures[texId];
        // 4 ft tile, pre-rendered at the exact on-screen pixel size so the
        // pattern never gets hard-downscaled (which is what produced seams).
        const tilePx = Math.max(24, Math.round(PX_PER_FT * zoom * 4 * dpr));
        const scaled = tex ? getScaledTile(texId, tex, tilePx) : null;
        const pattern = scaled ? ctx.createPattern(scaled, 'repeat') : null;
        if (pattern) {
          const k = 1 / dpr;
          (pattern as CanvasPattern).setTransform?.(new DOMMatrix([k, 0, 0, k, ox, oy]));
          ctx.fillStyle = pattern;
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(34,120,72,0.35)';
          ctx.fill();
        }
        // subtle depth wash so the plan still reads as a drawing
        ctx.fillStyle = selected ? 'rgba(245,158,11,0.16)' : 'rgba(8,145,178,0.06)';
        ctx.fill();
      }

      ctx.strokeStyle = selected ? '#f59e0b' : '#14532d';
      ctx.lineWidth = selected ? 3 : 2;
      ctx.setLineDash(area.closed ? [] : [6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // live rubber band while drawing
      if (!area.closed && hover && tool === 'draw' && area.points.length > 0) {
        const a = S(area.points[area.points.length - 1]);
        const b = S(hover);
        ctx.strokeStyle = 'rgba(8,145,178,0.7)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        const ft = Math.hypot(area.points[area.points.length - 1].x - hover.x, area.points[area.points.length - 1].y - hover.y) / PX_PER_FT;
        ctx.fillStyle = '#0f172a';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(`${ft.toFixed(1)} ft`, b.x + 8, b.y - 8);
      }

      const flags = curveFlagsOf(area);

      // segment dimensions (straight runs only, keeps curved plans clean)
      if (area.points.length >= 2) {
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillStyle = 'rgba(15,23,42,0.72)';
        const last = area.closed ? area.points.length : area.points.length - 1;
        for (let i = 0; i < last; i++) {
          const j = (i + 1) % area.points.length;
          if (flags[i] || flags[j]) continue;
          const a = area.points[i];
          const b = area.points[j];
          const ft = Math.hypot(a.x - b.x, a.y - b.y) / PX_PER_FT;
          if (ft < 1.5) continue;
          const m = S({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
          ctx.fillText(`${ft.toFixed(1)}'`, m.x + 4, m.y - 4);
        }
      }

      // vertices — round handles are curvature points, squares are hard corners
      area.points.forEach((p, i) => {
        const s = S(p);
        const isSel = selection?.type === 'point' && selection.id === area.id && selection.index === i;
        const curved = flags[i];
        const r = isSel ? 6 : 4;
        ctx.beginPath();
        if (curved) ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        else ctx.rect(s.x - r, s.y - r, r * 2, r * 2);
        ctx.fillStyle = isSel ? '#f59e0b' : curved ? '#0891b2' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });


      // area label
      if (area.closed && pts.length >= 3) {
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        const c = S({ x: cx, y: cy });
        const sq = polygonAreaSqFt(pts);
        const name = grassById(area.grassId).name;
        const label = `${name} · ${Math.round(sq).toLocaleString()} sq ft`;
        ctx.font = '600 12px ui-sans-serif, system-ui';
        const w = ctx.measureText(label).width + 16;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeStyle = 'rgba(20,83,45,0.35)';
        ctx.lineWidth = 1;
        const bx = c.x - w / 2;
        const by = c.y - 12;
        ctx.beginPath();
        ctx.roundRect?.(bx, by, w, 24, 12);
        if (!ctx.roundRect) ctx.rect(bx, by, w, 24);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#14532d';
        ctx.fillText(label, bx + 8, by + 16);
      }
    });

    // scale bar
    const barFt = 10;
    const barPx = barFt * PX_PER_FT * zoom;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(16, size.h - 20);
    ctx.lineTo(16 + barPx, size.h - 20);
    ctx.moveTo(16, size.h - 25);
    ctx.lineTo(16, size.h - 15);
    ctx.moveTo(16 + barPx, size.h - 25);
    ctx.lineTo(16 + barPx, size.h - 15);
    ctx.stroke();
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${barFt} FT`, 16 + barPx + 8, size.h - 16);
  }, [layout, view, size, selection, hover, tool, textures]);

  React.useEffect(() => {
    draw();
  }, [draw]);

  // measurements + snapshot
  React.useEffect(() => {
    onMeasure?.(measureGrassLayout(layout));
    const hasArea = layout.areas.some(a => a.closed && a.points.length >= 3);
    if (!onSnapshot) return;
    const t = window.setTimeout(() => {
      if (!hasArea) return onSnapshot(null);
      try {
        onSnapshot(canvasRef.current?.toDataURL('image/png') || null);
      } catch {
        onSnapshot(null);
      }
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, textures, view, size]);

  /* ------------------------------ interaction ----------------------------- */
  const handleWheelRef = React.useRef<(e: WheelEvent) => void>(() => {});
  handleWheelRef.current = (e: WheelEvent) => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    setView(v => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * Math.exp(-dy * 0.0015)));
      const k = next / v.zoom;
      return { zoom: next, ox: px - (px - v.ox) * k, oy: py - (py - v.oy) * k };
    });
  };

  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleWheelRef.current(e);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const hitPoint = (w: GrassPoint) => {
    for (const area of layout.areas) {
      for (let i = 0; i < area.points.length; i++) {
        if (Math.hypot(area.points[i].x - w.x, area.points[i].y - w.y) * view.zoom <= HIT_PX + 3) {
          return { id: area.id, index: i };
        }
      }
    }
    return null;
  };

  const hitArea = (w: GrassPoint) => {
    for (let i = layout.areas.length - 1; i >= 0; i--) {
      const a = layout.areas[i];
      if (a.closed && a.points.length >= 3 && pointInPolygon(w, sampleArea(a))) return a.id;
    }
    return null;
  };

  /* --------------------------- spline point editing -------------------------- */
  const updateArea = (id: string, fn: (a: GrassArea) => GrassArea) =>
    patch(layout.areas.map(a => (a.id === id ? fn(a) : a)));

  /** Insert a spline point on the edge nearest the cursor. Returns true when placed. */
  const insertPointNear = (w: GrassPoint): boolean => {
    const tolerance = (HIT_PX + 4) / view.zoom;
    for (const area of layout.areas) {
      if (area.points.length < 2) continue;
      const res = insertVertexAt(area.points, area.closed, w, tolerance, curveFlagsOf(area));
      if (!res) continue;
      updateArea(area.id, a => ({ ...a, points: res.points, spline: false, curves: res.curves }));
      setSelection({ type: 'point', id: area.id, index: res.index });
      return true;
    }
    return false;
  };

  /** Add a point half way along the edge after the selected one. */
  const addPointAfterSelected = () => {
    if (selection?.type !== 'point') return;
    const area = layout.areas.find(a => a.id === selection.id);
    if (!area) return;
    const res = insertVertexAfter(area.points, area.closed, selection.index, curveFlagsOf(area));
    if (!res) return;
    updateArea(area.id, a => ({ ...a, points: res.points, spline: false, curves: res.curves }));
    setSelection({ type: 'point', id: area.id, index: res.index });
  };

  const removePointAt = (id: string, index: number) => {
    const area = layout.areas.find(a => a.id === id);
    if (!area) return;
    const res = removeVertex(area.points, index, area.closed ? 3 : 2, curveFlagsOf(area));
    if (!res) return;
    updateArea(id, a => ({ ...a, points: res.points, spline: false, curves: res.curves }));
    setSelection(null);
  };

  /** Toggle the curvature handle on the selected point. */
  const toggleCurveOnSelected = () => {
    if (selection?.type !== 'point') return;
    const area = layout.areas.find(a => a.id === selection.id);
    if (!area) return;
    const next = toggleCurveFlag(curveFlagsOf(area), selection.index, area.points.length);
    updateArea(area.id, a => ({ ...a, spline: false, curves: next }));
  };

  const selectedPointCurved = React.useMemo(() => {
    if (selection?.type !== 'point') return false;
    const area = layout.areas.find(a => a.id === selection.id);
    return area ? curveFlagsOf(area)[selection.index] : false;
  }, [selection, layout]);



  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - r.left;
    const sy = e.clientY - r.top;
    const w = toWorld(sx, sy);

    if (e.button === 1 || e.shiftKey) {
      dragRef.current = { mode: 'pan', sx, sy, ox: view.ox, oy: view.oy };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    // In draw mode, clicking the first vertex of the open area closes it —
    // this must win over the vertex drag hit-test.
    const drawing = tool === 'draw' ? layout.areas.find(a => !a.closed) : null;
    if (drawing && drawing.points.length >= 3) {
      const first = drawing.points[0];
      if (Math.hypot(first.x - w.x, first.y - w.y) * view.zoom <= HIT_PX + 4) {
        patch(layout.areas.map(a => (a.id === drawing.id ? { ...a, closed: true } : a)));
        setSelection(null);
        return;
      }
    }

    // Alt/right click on an existing point removes it; alt click on an edge adds one.
    if (e.altKey || e.button === 2) {
      const removeHit = hitPoint(w);
      if (removeHit) {
        removePointAt(removeHit.id, removeHit.index);
        return;
      }
      if (insertPointNear(w)) return;
    }

    const ptHit = hitPoint(w);
    if (ptHit) {
      setSelection({ type: 'point', id: ptHit.id, index: ptHit.index });
      dragRef.current = { mode: 'point', id: ptHit.id, index: ptHit.index, sx, sy, ox: view.ox, oy: view.oy };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    if (tool === 'select') {
      // clicking an edge in select mode drops a new, draggable spline point there
      if (insertPointNear(w)) return;
      const areaId = hitArea(w);
      setSelection(areaId ? { type: 'area', id: areaId } : null);
      return;
    }


    // draw mode — snap to 0.5 ft
    const snapped = { x: Math.round(w.x / (PX_PER_FT / 2)) * (PX_PER_FT / 2), y: Math.round(w.y / (PX_PER_FT / 2)) * (PX_PER_FT / 2) };
    const areas = [...layout.areas];
    const idx = areas.findIndex(a => !a.closed);
    if (idx === -1) {
      areas.push({ id: uid(), points: [snapped], closed: false, spline, grassId: activeGrassId });
    } else {
      const a = areas[idx];
      const first = a.points[0];
      if (a.points.length >= 3 && first && Math.hypot(first.x - snapped.x, first.y - snapped.y) * view.zoom <= HIT_PX + 4) {
        areas[idx] = { ...a, closed: true };
      } else {
        areas[idx] = { ...a, points: [...a.points, snapped] };
      }
    }
    patch(areas);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - r.left;
    const sy = e.clientY - r.top;
    const d = dragRef.current;
    if (d?.mode === 'pan') {
      setView(v => ({ ...v, ox: d.ox + (sx - d.sx), oy: d.oy + (sy - d.sy) }));
      return;
    }
    if (d?.mode === 'point' && d.id !== undefined && d.index !== undefined) {
      const w = toWorld(sx, sy);
      const snapped = { x: Math.round(w.x / (PX_PER_FT / 2)) * (PX_PER_FT / 2), y: Math.round(w.y / (PX_PER_FT / 2)) * (PX_PER_FT / 2) };
      patch(
        layout.areas.map(a =>
          a.id === d.id ? { ...a, points: a.points.map((p, i) => (i === d.index ? snapped : p)) } : a
        )
      );
      return;
    }
    setHover(toWorld(sx, sy));
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
    dragRef.current = null;
  };

  const closeCurrent = () => {
    patch(layout.areas.map(a => (!a.closed && a.points.length >= 3 ? { ...a, closed: true } : a)).filter(a => a.closed || a.points.length > 0));
  };

  const undo = () => {
    const areas = [...layout.areas];
    const idx = areas.findIndex(a => !a.closed);
    if (idx !== -1) {
      const pts = areas[idx].points.slice(0, -1);
      if (pts.length === 0) areas.splice(idx, 1);
      else areas[idx] = { ...areas[idx], points: pts };
      patch(areas);
      return;
    }
    patch(areas.slice(0, -1));
  };

  const deleteSelection = () => {
    if (!selection) return;
    if (selection.type === 'area') {
      patch(layout.areas.filter(a => a.id !== selection.id));
      setSelection(null);
    } else {
      removePointAt(selection.id, selection.index);
    }
  };


  const addPreset = (points: GrassPoint[], asSpline = false) => {
    const cx = size.w / 2 / view.zoom - view.ox / view.zoom;
    const cy = size.h / 2 / view.zoom - view.oy / view.zoom;
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const dx = cx - (minX + maxX) / 2;
    const dy = cy - (minY + maxY) / 2;
    patch([
      ...layout.areas.filter(a => a.closed),
      { id: uid(), points: points.map(p => ({ x: p.x + dx, y: p.y + dy })), closed: true, spline: asSpline, grassId: activeGrassId },
    ]);
  };

  const takeoff = measureGrassLayout(layout);
  const selectedArea =
    selection && layout.areas.find(a => a.id === selection.id && (selection.type === 'area' || selection.type === 'point'));

  /* Every board frames 20 ft of the sheet by default. */
  const fitView = () =>
    setView({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, size.w / (boardAltitudeFtOr(VIEW_WIDTH_FT) * PX_PER_FT))), ox: 40, oy: 30 });

  return (
    <div className="space-y-3">
      {/* Slim instrument header — glyph tools, names in the tooltips */}
      <div className="board-console board-console-slim rounded-xl border border-border/50 bg-background/55 px-2 py-1.5 backdrop-blur-xl">
      {header && <div className="px-0.5 pb-2">{header}</div>}
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" size="sm" variant={tool === 'draw' ? 'default' : 'outline'} onClick={() => setTool('draw')} title="Draw area" aria-label="Draw area">
          <PenTool />
        </Button>
        <Button type="button" size="sm" variant={tool === 'select' ? 'default' : 'outline'} onClick={() => setTool('select')} title="Select" aria-label="Select">
          <MousePointer2 />
        </Button>
        <Button type="button" size="sm" variant={spline ? 'default' : 'outline'} onClick={() => setSpline(s => !s)} title={spline ? 'Curved edges' : 'Straight edges'} aria-label="Toggle curved edges">
          <Waves />
        </Button>
        <span className="mx-0.5 h-4 w-px bg-border" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addPointAfterSelected}
          disabled={selection?.type !== 'point'}
          title="Add a spline point after the selected one"
          aria-label="Add point"
        >
          <Plus />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={selectedPointCurved ? 'default' : 'outline'}
          onClick={toggleCurveOnSelected}
          disabled={selection?.type !== 'point'}
          title="Toggle curvature on the selected point"
          aria-label="Curve point"
        >
          <Spline />
        </Button>

        <span className="mx-0.5 h-4 w-px bg-border" />
        <Button type="button" size="sm" variant="outline" onClick={closeCurrent} disabled={!openArea || openArea.points.length < 3} title="Close area" aria-label="Close area">
          <CornerDownRight />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={undo} disabled={layout.areas.length === 0} title="Undo" aria-label="Undo">
          <Undo2 />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={deleteSelection}
          disabled={!selection}
          className="text-destructive hover:text-destructive"
          title="Delete selection"
          aria-label="Delete selection"
        >
          <Trash2 />
        </Button>
        <span className="mx-0.5 h-4 w-px bg-border" />
        <Button type="button" size="sm" variant="ghost" onClick={() => setView(v => ({ ...v, zoom: Math.max(MIN_ZOOM, v.zoom / 1.25) }))} title="Zoom out" aria-label="Zoom out">
          <ZoomOut />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="has-label tabular-nums" onClick={fitView} title="Fit the sheet" aria-label="Fit sheet">
          {Math.round(size.w / (view.zoom * PX_PER_FT))} ft
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setView(v => ({ ...v, zoom: Math.min(MAX_ZOOM, v.zoom * 1.25) }))} title="Zoom in" aria-label="Zoom in">
          <ZoomIn />
        </Button>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="secondary" className="font-mono text-[9px]">
            {takeoff.areaSqFt.toLocaleString()} sq ft
          </Badge>
          <Badge variant="secondary" className="font-mono text-[9px]">
            {takeoff.perimeterFt.toLocaleString()} lf
          </Badge>
          <Button type="button" size="sm" variant="ghost" onClick={toggleDensity} aria-pressed={compact} title={compact ? 'Show all panels' : 'Compact view'} aria-label="Toggle panels">
            {compact ? <Maximize2 /> : <Minimize2 />}
          </Button>
        </div>
      </div>
      </div>


      {/* Turf swatch carousel — applies to new or selected areas */}
      {!compact && (
      <div className="rounded-xl border border-white/40 bg-white/50 p-2 backdrop-blur-md">
        <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Turf applied to {selectedArea ? 'selected area' : 'new areas'}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {artificialGrassOptions.map(g => {
            const active = selectedArea ? selectedArea.grassId === g.id : activeGrassId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  onActiveGrassChange?.(g.id);
                  if (selectedArea) patch(layout.areas.map(a => (a.id === selectedArea.id ? { ...a, grassId: g.id } : a)));
                }}
                className={cn(
                  'w-28 shrink-0 rounded-lg border p-1.5 text-left transition-all',
                  active ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/70 bg-background hover:border-primary/50'
                )}
              >
                <div className="product-media-frame aspect-[4/3] overflow-hidden rounded-md">
                  <img loading="lazy" decoding="async" src={g.image} alt={g.name} className="h-full w-full object-cover" />
                </div>
                <p className="mt-1 truncate text-[11px] font-medium">{g.name}</p>
                <p className="text-[11px] text-primary">${getGrassPricePerSqFt(g.name)}/sq ft</p>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Canvas */}
      <div ref={wrapRef} className="overflow-hidden rounded-xl border border-white/40 bg-white/60 shadow-inner backdrop-blur-md">
        <canvas
          ref={canvasRef}
          style={{ width: size.w, height: size.h, position: 'relative', touchAction: 'none', cursor: tool === 'draw' ? 'crosshair' : 'default' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={() => setHover(null)}
          onDoubleClick={closeCurrent}
          onContextMenu={e => e.preventDefault()}

        />
      </div>

      {/* Presets + hint */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Start from:</span>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addPreset(rect(0, 0, 20 * PX_PER_FT, 20 * PX_PER_FT))}>
          <Square className="mr-1 h-3 w-3" /> 20 × 20 lawn
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addPreset(rect(0, 0, 10 * PX_PER_FT, 30 * PX_PER_FT))}>
          Dog run 10 × 30
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() =>
            addPreset([
              { x: 0, y: 0 },
              { x: 30 * PX_PER_FT, y: 0 },
              { x: 30 * PX_PER_FT, y: 14 * PX_PER_FT },
              { x: 14 * PX_PER_FT, y: 14 * PX_PER_FT },
              { x: 14 * PX_PER_FT, y: 26 * PX_PER_FT },
              { x: 0, y: 26 * PX_PER_FT },
            ])
          }
        >
          L-shaped patio
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() =>
            addPreset(
              Array.from({ length: 8 }, (_, i) => {
                const t = (i / 8) * Math.PI * 2;
                return { x: Math.cos(t) * 12 * PX_PER_FT, y: Math.sin(t) * 8 * PX_PER_FT };
              }),
              true
            )
          }
        >
          <Waves className="mr-1 h-3 w-3" /> Organic island
        </Button>
        {!compact && (
          <p className="ml-auto text-[11px] text-muted-foreground">
            Click to place points · click the first point or double-click to close · scroll to zoom · shift-drag to pan
          </p>
        )}
      </div>
    </div>
  );
};

export default GrassDrawingBoard;
