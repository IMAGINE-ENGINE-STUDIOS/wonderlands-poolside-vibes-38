import * as React from 'react';
import { Button } from '@/components/ui/button';
import useBoardDensity from '@/hooks/useBoardDensity';
import { Badge } from '@/components/ui/badge';
import { Undo2, Trash2, DoorOpen, MousePointer2, Ruler, Plus, Spline, Minus, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import {
  insertVertexAfter,
  insertVertexAt,
  normalizeFlags,
  polylineLength,
  removeVertex,
  sampleSegment,
  toggleCurveFlag,
  tracePolyline,
} from '@/utils/splineEditing';

export interface FencePoint {
  x: number;
  y: number;
}

export interface FenceLayout {
  points: FencePoint[];
  closed: boolean;
  /** Indices of segments flagged as gate openings */
  gateSegments: number[];
  /** Per-post curvature handles — a flagged post curves its adjoining runs */
  curves?: boolean[];
}

interface FenceDrawingBoardProps {
  layout: FenceLayout;
  onChange: (layout: FenceLayout) => void;
  /** Total length reported back in feet (excludes gate segments) */
  onMeasure?: (linearFt: number, gateSegments: number) => void;
  /** Fence color hex for the drawn run */
  colorHex?: string;
  /** Title block rendered inside the board toolbar */
  header?: React.ReactNode;
}

const PX_PER_FT = 10;
/** Every drawing board opens on 20 ft of frontage. */
const VIEW_WIDTH_FT = 20;
const GRID_FT = 1;
const MAJOR_FT = 5;

const dist = (a: FencePoint, b: FencePoint) => Math.hypot(a.x - b.x, a.y - b.y);

/** Same drafting conventions as the 2D pool studio: 10px = 1 ft, snap to the foot grid. */
const FenceDrawingBoard = ({ layout, onChange, onMeasure, colorHex = '#111827', header }: FenceDrawingBoardProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = React.useState<'draw' | 'select' | 'gate'>('draw');
  const { compact, toggle: toggleDensity } = useBoardDensity();
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [hover, setHover] = React.useState<FencePoint | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 520 });
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  /* Camera over the sheet — the drafting scale stays 10 px = 1 ft. */
  const [view, setView] = React.useState({ z: 1, x: 0, y: 0 });
  const framedRef = React.useRef(false);
  /* Open at the altitude last flown on any board — see lib/design/boardAltitude */
  React.useEffect(() => {
    if (framedRef.current || !size.w) return;
    framedRef.current = true;
    const wantFt = boardAltitudeFtOr(VIEW_WIDTH_FT);
    setView({ z: Math.max(0.25, Math.min(8, size.w / (wantFt * PX_PER_FT))), x: 0, y: 0 });
  }, [size.w]);
  /* …and publish this board's altitude back for the others. */
  React.useEffect(() => {
    if (size.w) setBoardAltitudeFt(size.w / (view.z * PX_PER_FT));
  }, [view.z, size.w]);
  const zoomBy = (factor: number) =>
    setView(v => {
      const next = Math.max(0.25, Math.min(8, v.z * factor));
      const k = next / v.z;
      const px = size.w / 2;
      const py = size.h / 2;
      return { z: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  const fitSheet = () => setView({ z: Math.max(0.25, Math.min(8, size.w / (boardAltitudeFtOr(VIEW_WIDTH_FT) * PX_PER_FT))), x: 0, y: 0 });
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      setView(v => {
        const next = Math.max(0.25, Math.min(8, v.z * Math.exp(-dy * 0.0015)));
        const k = next / v.z;
        return { z: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);


  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: Math.max(360, Math.min(560, Math.round(el.clientWidth * 0.55))) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const curves = React.useMemo(() => normalizeFlags(layout.curves, layout.points.length), [layout.curves, layout.points.length]);

  /** Each run carries its sampled polyline so curved runs measure by arc length. */
  const segments = React.useMemo(() => {
    const pts = layout.points;
    const segs: Array<{ a: FencePoint; b: FencePoint; index: number; path: FencePoint[] }> = [];
    const count = layout.closed && pts.length > 2 ? pts.length : pts.length - 1;
    for (let i = 0; i < count; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      segs.push({ a, b, index: i, path: sampleSegment(pts, layout.closed, curves, i) });
    }
    return segs;
  }, [layout.points, layout.closed, curves]);

  const measurements = React.useMemo(() => {
    let fenceFt = 0;
    let gateFt = 0;
    segments.forEach(seg => {
      const ft = polylineLength(seg.path) / PX_PER_FT;
      if (layout.gateSegments.includes(seg.index)) gateFt += ft;
      else fenceFt += ft;
    });
    return { fenceFt: Math.round(fenceFt * 10) / 10, gateFt: Math.round(gateFt * 10) / 10 };
  }, [segments, layout.gateSegments]);


  React.useEffect(() => {
    onMeasure?.(measurements.fenceFt, layout.gateSegments.length);
  }, [measurements.fenceFt, layout.gateSegments.length, onMeasure]);

  // ---- rendering ----
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    const styles = getComputedStyle(document.documentElement);
    const readColor = (token: string, fallback: string) => {
      const raw = styles.getPropertyValue(token).trim();
      return raw ? `hsl(${raw})` : fallback;
    };
    const bg = readColor('--card', '#ffffff');
    const gridMinor = readColor('--muted', '#eef2f7');
    const gridMajor = readColor('--border', '#cbd5e1');
    const textColor = readColor('--muted-foreground', '#64748b');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.w, size.h);

    /* camera: the sheet below is drawn in world coordinates */
    const Z = view.z;
    ctx.translate(view.x, view.y);
    ctx.scale(Z, Z);
    const gstep = GRID_FT * PX_PER_FT;
    const wx0 = Math.floor(-view.x / Z / gstep) * gstep;
    const wx1 = wx0 + size.w / Z + gstep;
    const wy0 = Math.floor(-view.y / Z / gstep) * gstep;
    const wy1 = wy0 + size.h / Z + gstep;

    // grid
    for (let x = wx0; x <= wx1; x += gstep) {
      const major = Math.round(x / PX_PER_FT) % MAJOR_FT === 0;
      ctx.strokeStyle = major ? gridMajor : gridMinor;
      ctx.lineWidth = (major ? 1 : 0.5) / Z;
      ctx.beginPath();
      ctx.moveTo(x, wy0);
      ctx.lineTo(x, wy1);
      ctx.stroke();
    }
    for (let y = wy0; y <= wy1; y += gstep) {
      const major = Math.round(y / PX_PER_FT) % MAJOR_FT === 0;
      ctx.strokeStyle = major ? gridMajor : gridMinor;
      ctx.lineWidth = (major ? 1 : 0.5) / Z;
      ctx.beginPath();
      ctx.moveTo(wx0, y);
      ctx.lineTo(wx1, y);
      ctx.stroke();
    }

    // segments (curved runs render as sampled polylines)
    segments.forEach(seg => {
      const isGate = layout.gateSegments.includes(seg.index);
      ctx.strokeStyle = isGate ? '#0891b2' : colorHex;
      ctx.lineWidth = isGate ? 5 : 3.5;
      ctx.setLineDash(isGate ? [8, 6] : []);
      tracePolyline(ctx, seg.path);
      ctx.stroke();
      ctx.setLineDash([]);

      const len = polylineLength(seg.path);

      // picket ticks for visual fidelity, following the run
      if (!isGate) {
        const step = 4; // ~4.75" picket spacing at 10px/ft
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        let travelled = 0;
        let next = step;
        for (let i = 0; i < seg.path.length - 1; i++) {
          const a = seg.path[i];
          const b = seg.path[i + 1];
          const segLen = dist(a, b) || 1;
          const ux = (b.x - a.x) / segLen;
          const uy = (b.y - a.y) / segLen;
          while (next <= travelled + segLen && next < len) {
            const d = next - travelled;
            const px = a.x + ux * d;
            const py = a.y + uy * d;
            ctx.beginPath();
            ctx.moveTo(px - uy * 4, py + ux * 4);
            ctx.lineTo(px + uy * 4, py - ux * 4);
            ctx.stroke();
            next += step;
          }
          travelled += segLen;
        }
        ctx.globalAlpha = 1;
      }

      // dimension label at the run's midpoint
      const ft = len / PX_PER_FT;
      if (ft >= 1) {
        const mid = seg.path[Math.floor(seg.path.length / 2)];
        const mx = mid.x;
        const my = mid.y;
        const label = `${ft.toFixed(1)} ft${isGate ? ' • GATE' : ''}`;
        ctx.font = `600 ${11 / Z}px ui-sans-serif, system-ui, sans-serif`;
        const w = ctx.measureText(label).width + 8 / Z;
        ctx.fillStyle = bg;
        ctx.fillRect(mx - w / 2, my - 16 / Z, w, 15 / Z);
        ctx.strokeStyle = gridMajor;
        ctx.lineWidth = 1 / Z;
        ctx.strokeRect(mx - w / 2, my - 16 / Z, w, 15 / Z);
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(label, mx, my - 5 / Z);
      }
    });


    // preview segment
    if (mode === 'draw' && hover && layout.points.length > 0 && !layout.closed) {
      const last = layout.points[layout.points.length - 1];
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 2 / Z;
      ctx.setLineDash([5 / Z, 5 / Z]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(hover.x, hover.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const ft = dist(last, hover) / PX_PER_FT;
      ctx.fillStyle = textColor;
      ctx.font = `600 ${11 / Z}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`${ft.toFixed(1)} ft`, hover.x + 10 / Z, hover.y - 8 / Z);
    }

    // posts — round = curvature handle, square = hard corner
    layout.points.forEach((p, i) => {
      const active = i === dragIndex || i === selectedIndex;
      const r = (active ? 7 : 5) / Z;
      ctx.beginPath();
      if (curves[i]) ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      else ctx.rect(p.x - r, p.y - r, r * 2, r * 2);
      ctx.fillStyle = i === selectedIndex ? '#f59e0b' : curves[i] ? '#0891b2' : i === 0 ? '#f97066' : colorHex;
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = 2 / Z;
      ctx.stroke();
    });
  }, [layout, segments, curves, size, hover, mode, dragIndex, selectedIndex, colorHex, view]);


  // ---- interaction ----
  const toLocal = (e: React.MouseEvent): FencePoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const raw = { x: (e.clientX - rect.left - view.x) / view.z, y: (e.clientY - rect.top - view.y) / view.z };
    return {
      x: Math.round(raw.x / PX_PER_FT) * PX_PER_FT,
      y: Math.round(raw.y / PX_PER_FT) * PX_PER_FT,
    };
  };

  const hitPoint = (p: FencePoint) => layout.points.findIndex(pt => dist(pt, p) < 9);
  const hitSegment = (p: FencePoint) => {
    let best = -1;
    let bestDist = 10;
    segments.forEach(seg => {
      const len = dist(seg.a, seg.b) || 1;
      const t = Math.max(0, Math.min(1, ((p.x - seg.a.x) * (seg.b.x - seg.a.x) + (p.y - seg.a.y) * (seg.b.y - seg.a.y)) / (len * len)));
      const proj = { x: seg.a.x + t * (seg.b.x - seg.a.x), y: seg.a.y + t * (seg.b.y - seg.a.y) };
      const d = dist(proj, p);
      if (d < bestDist) {
        bestDist = d;
        best = seg.index;
      }
    });
    return best;
  };

  /** Gate flags are stored per segment index, so they must be re-mapped when posts change. */
  const shiftGatesForInsert = (at: number) => layout.gateSegments.map(g => (g >= at ? g + 1 : g));
  const shiftGatesForRemove = (at: number) =>
    layout.gateSegments.filter(g => g !== at && g !== at - 1).map(g => (g > at ? g - 1 : g));

  const insertPostNear = (p: FencePoint): boolean => {
    const res = insertVertexAt(layout.points, layout.closed, p, 12, curves);
    if (!res) return false;
    onChange({ ...layout, points: res.points, curves: res.curves, gateSegments: shiftGatesForInsert(res.index) });
    setSelectedIndex(res.index);
    return true;
  };

  const addPostAfterSelected = () => {
    if (selectedIndex === null) return;
    const res = insertVertexAfter(layout.points, layout.closed, selectedIndex, curves);
    if (!res) return;
    onChange({ ...layout, points: res.points, curves: res.curves, gateSegments: shiftGatesForInsert(res.index) });
    setSelectedIndex(res.index);
  };

  const removePostAt = (index: number) => {
    const res = removeVertex(layout.points, index, layout.closed ? 3 : 2, curves);
    if (!res) return;
    onChange({ ...layout, points: res.points, curves: res.curves, gateSegments: shiftGatesForRemove(index) });
    setSelectedIndex(null);
  };

  const toggleCurveOnSelected = () => {
    if (selectedIndex === null) return;
    onChange({ ...layout, curves: toggleCurveFlag(curves, selectedIndex, layout.points.length) });
  };

  const handleDown = (e: React.MouseEvent) => {
    const p = toLocal(e);
    if (e.altKey || e.button === 2) {
      const idx = hitPoint(p);
      if (idx >= 0) {
        removePostAt(idx);
        return;
      }
      if (insertPostNear(p)) return;
    }
    if (mode === 'select') {
      const idx = hitPoint(p);
      if (idx >= 0) {
        setSelectedIndex(idx);
        setDragIndex(idx);
        return;
      }
      // clicking a run drops a new, draggable post there
      if (insertPostNear(p)) return;
      setSelectedIndex(null);
      return;
    }
    if (mode === 'gate') {
      const seg = hitSegment(p);
      if (seg >= 0) {
        const next = layout.gateSegments.includes(seg)
          ? layout.gateSegments.filter(s => s !== seg)
          : [...layout.gateSegments, seg];
        onChange({ ...layout, gateSegments: next });
      }
      return;
    }
    // draw
    if (layout.points.length > 2 && dist(layout.points[0], p) < 10) {
      onChange({ ...layout, closed: true });
      return;
    }
    onChange({ ...layout, points: [...layout.points, p], curves: normalizeFlags(curves, layout.points.length + 1) });
  };


  const handleMove = (e: React.MouseEvent) => {
    const p = toLocal(e);
    setHover(p);
    if (dragIndex !== null) {
      const points = layout.points.map((pt, i) => (i === dragIndex ? p : pt));
      onChange({ ...layout, points });
    }
  };

  const undo = () => {
    if (layout.closed) return onChange({ ...layout, closed: false });
    onChange({
      ...layout,
      points: layout.points.slice(0, -1),
      gateSegments: layout.gateSegments.filter(s => s < layout.points.length - 2),
    });
  };

  return (
    <div className="space-y-3">
      {header && (
        <div className="rounded-xl border border-border/60 bg-background/60 p-3 backdrop-blur-md">{header}</div>
      )}
      {/* Slim instrument header — glyph tools, names in the tooltips */}
      <div className="board-console board-console-slim flex flex-wrap items-center gap-1 rounded-xl border border-border/50 bg-background/55 px-2 py-1.5 backdrop-blur-xl">
        <Button size="sm" variant={mode === 'draw' ? 'default' : 'outline'} onClick={() => setMode('draw')} title="Draw run" aria-label="Draw run">
          <Ruler />
        </Button>
        <Button size="sm" variant={mode === 'select' ? 'default' : 'outline'} onClick={() => setMode('select')} title="Move posts" aria-label="Move posts">
          <MousePointer2 />
        </Button>
        <Button size="sm" variant={mode === 'gate' ? 'default' : 'outline'} onClick={() => setMode('gate')} title="Mark gate" aria-label="Mark gate">
          <DoorOpen />
        </Button>
        <span className="mx-0.5 h-4 w-px bg-border" />
        <Button size="sm" variant="outline" onClick={addPostAfterSelected} disabled={selectedIndex === null} title="Add a post after the selected one" aria-label="Add post">
          <Plus />
        </Button>
        <Button
          size="sm"
          variant={selectedIndex !== null && curves[selectedIndex] ? 'default' : 'outline'}
          onClick={toggleCurveOnSelected}
          disabled={selectedIndex === null}
          title="Toggle curvature on the selected post"
          aria-label="Curve post"
        >
          <Spline />
        </Button>
        <Button size="sm" variant="outline" onClick={() => selectedIndex !== null && removePostAt(selectedIndex)} disabled={selectedIndex === null} title="Remove point" aria-label="Remove point">
          <Minus />
        </Button>
        <Button size="sm" variant="ghost" onClick={undo} disabled={!layout.points.length} title="Undo" aria-label="Undo">
          <Undo2 />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={() => {
            onChange({ points: [], closed: false, gateSegments: [], curves: [] });
            setSelectedIndex(null);
          }}
          disabled={!layout.points.length}
          title="Clear the sheet"
          aria-label="Clear"
        >
          <Trash2 />
        </Button>
        <span className="mx-0.5 h-4 w-px bg-border" />
        {/* camera */}
        <Button size="sm" variant="ghost" onClick={() => zoomBy(1 / 1.25)} title="Zoom out" aria-label="Zoom out">
          <ZoomOut />
        </Button>
        <Button size="sm" variant="ghost" className="has-label tabular-nums" onClick={fitSheet} title="Fit the sheet" aria-label="Fit sheet">
          {Math.round(size.w / (view.z * PX_PER_FT))} ft
        </Button>
        <Button size="sm" variant="ghost" onClick={() => zoomBy(1.25)} title="Zoom in" aria-label="Zoom in">
          <ZoomIn />
        </Button>

        <div className="ml-auto flex items-center gap-1.5">
          {!compact && (
            <>
              <Badge variant="secondary" className="text-[9px]">{measurements.fenceFt.toLocaleString()} lf</Badge>
              {layout.gateSegments.length > 0 && (
                <Badge className="bg-primary text-[9px] text-primary-foreground">
                  {layout.gateSegments.length} gate{layout.gateSegments.length > 1 ? 's' : ''} • {measurements.gateFt} ft
                </Badge>
              )}
            </>
          )}
          <Button size="sm" variant="ghost" onClick={toggleDensity} aria-pressed={compact} title={compact ? 'Show all panels' : 'Compact view'} aria-label="Toggle panels">
            {compact ? <Maximize2 /> : <Minimize2 />}
          </Button>
        </div>
      </div>


      <div ref={wrapRef} className="rounded-lg border overflow-hidden bg-card">
        <canvas
          ref={canvasRef}
          style={{ width: size.w, height: size.h, position: 'relative', cursor: mode === 'select' ? 'grab' : 'crosshair' }}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onContextMenu={e => e.preventDefault()}
          onMouseUp={() => setDragIndex(null)}
          onMouseLeave={() => {
            setDragIndex(null);
            setHover(null);
          }}

        />
      </div>
    </div>
  );
};

export default FenceDrawingBoard;
