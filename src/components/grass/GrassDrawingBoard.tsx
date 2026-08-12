import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { artificialGrassOptions, getGrassPricePerSqFt } from '@/data/artificialGrassData';
import { cn } from '@/lib/utils';

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
}

const PX_PER_FT = 10;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const HIT_PX = 9;

const uid = () => Math.random().toString(36).slice(2, 9);
const grassById = (id: string) => artificialGrassOptions.find(g => g.id === id) || artificialGrassOptions[0];

/** Catmull-Rom sampling for smooth organic turf edges */
function sampleArea(area: GrassArea): GrassPoint[] {
  const pts = area.points;
  if (!area.spline || pts.length < 3) return pts;
  const out: GrassPoint[] = [];
  const n = pts.length;
  const last = area.closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let t = 0; t < 12; t++) {
      const s = t / 12;
      const s2 = s * s;
      const s3 = s2 * s;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * s + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * s + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3),
      });
    }
  }
  if (!area.closed) out.push(pts[n - 1]);
  return out;
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

const GrassDrawingBoard: React.FC<Props> = ({
  layout,
  onChange,
  onMeasure,
  onSnapshot,
  activeGrassId,
  onActiveGrassChange,
}) => {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = React.useState<Tool>('draw');
  const [spline, setSpline] = React.useState(false);
  const [selection, setSelection] = React.useState<Selection>(null);
  const [hover, setHover] = React.useState<GrassPoint | null>(null);
  const [view, setView] = React.useState({ zoom: 1, ox: 40, oy: 30 });
  const dragRef = React.useRef<{ mode: 'point' | 'pan'; id?: string; index?: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 540 });

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
        const tile = buildSeamlessTile(img);
        if (tile) setTextures(prev => ({ ...prev, [g.id]: tile }));
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
        const tex = textures[area.grassId];
        if (tex) {
          const pattern = ctx.createPattern(tex, 'repeat');
          if (pattern) {
            const scale = (PX_PER_FT * zoom * 2) / tex.width; // 2 ft texture tile
            (pattern as CanvasPattern).setTransform?.(new DOMMatrix([scale, 0, 0, scale, ox, oy]));
            ctx.fillStyle = pattern;
            ctx.fill();
          }
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

      // segment dimensions (straight areas only, keeps curved plans clean)
      if (!area.spline && area.points.length >= 2) {
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillStyle = 'rgba(15,23,42,0.72)';
        const last = area.closed ? area.points.length : area.points.length - 1;
        for (let i = 0; i < last; i++) {
          const a = area.points[i];
          const b = area.points[(i + 1) % area.points.length];
          const ft = Math.hypot(a.x - b.x, a.y - b.y) / PX_PER_FT;
          if (ft < 1.5) continue;
          const m = S({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
          ctx.fillText(`${ft.toFixed(1)}'`, m.x + 4, m.y - 4);
        }
      }

      // vertices
      area.points.forEach((p, i) => {
        const s = S(p);
        const isSel = selection?.type === 'point' && selection.id === area.id && selection.index === i;
        ctx.beginPath();
        ctx.arc(s.x, s.y, isSel ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? '#f59e0b' : '#ffffff';
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

    const ptHit = hitPoint(w);
    if (ptHit) {
      setSelection({ type: 'point', id: ptHit.id, index: ptHit.index });
      dragRef.current = { mode: 'point', id: ptHit.id, index: ptHit.index, sx, sy, ox: view.ox, oy: view.oy };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    if (tool === 'select') {
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
    } else {
      patch(
        layout.areas
          .map(a => (a.id === selection.id ? { ...a, points: a.points.filter((_, i) => i !== selection.index) } : a))
          .filter(a => a.points.length >= (a.closed ? 3 : 1))
      );
    }
    setSelection(null);
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

  const fitView = () => setView({ zoom: 1, ox: 40, oy: 30 });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/40 bg-white/60 p-2 backdrop-blur-md">
        <Button type="button" size="sm" variant={tool === 'draw' ? 'default' : 'outline'} onClick={() => setTool('draw')} className="h-8">
          <PenTool className="mr-1.5 h-3.5 w-3.5" /> Draw
        </Button>
        <Button type="button" size="sm" variant={tool === 'select' ? 'default' : 'outline'} onClick={() => setTool('select')} className="h-8">
          <MousePointer2 className="mr-1.5 h-3.5 w-3.5" /> Select
        </Button>
        <Button type="button" size="sm" variant={spline ? 'default' : 'outline'} onClick={() => setSpline(s => !s)} className="h-8">
          <Waves className="mr-1.5 h-3.5 w-3.5" /> {spline ? 'Curved edges' : 'Straight edges'}
        </Button>
        <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <Button type="button" size="sm" variant="outline" onClick={closeCurrent} disabled={!openArea || openArea.points.length < 3} className="h-8">
          <CornerDownRight className="mr-1.5 h-3.5 w-3.5" /> Close area
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={undo} disabled={layout.areas.length === 0} className="h-8">
          <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Undo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={deleteSelection}
          disabled={!selection}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={fitView} className="h-8">
          <Maximize2 className="mr-1.5 h-3.5 w-3.5" /> Reset view
        </Button>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="font-mono">
            {takeoff.areaSqFt.toLocaleString()} sq ft
          </Badge>
          <Badge variant="secondary" className="font-mono">
            {takeoff.perimeterFt.toLocaleString()} lf edge
          </Badge>
        </div>
      </div>

      {/* Turf swatch carousel — applies to new or selected areas */}
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

      {/* Canvas */}
      <div ref={wrapRef} className="overflow-hidden rounded-xl border border-white/40 bg-white/60 shadow-inner backdrop-blur-md">
        <canvas
          ref={canvasRef}
          style={{ width: size.w, height: size.h, touchAction: 'none', cursor: tool === 'draw' ? 'crosshair' : 'default' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={() => setHover(null)}
          onDoubleClick={closeCurrent}
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
        <p className="ml-auto text-[11px] text-muted-foreground">
          Click to place points · click the first point or double-click to close · scroll to zoom · shift-drag to pan
        </p>
      </div>
    </div>
  );
};

export default GrassDrawingBoard;
