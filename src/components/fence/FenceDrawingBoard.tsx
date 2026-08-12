import * as React from 'react';
import { Button } from '@/components/ui/button';
import BoardDensityToggle from '@/components/drawing/BoardDensityToggle';
import useBoardDensity from '@/hooks/useBoardDensity';
import { Badge } from '@/components/ui/badge';
import { Undo2, Trash2, DoorOpen, MousePointer2, Ruler } from 'lucide-react';

export interface FencePoint {
  x: number;
  y: number;
}

export interface FenceLayout {
  points: FencePoint[];
  closed: boolean;
  /** Indices of segments flagged as gate openings */
  gateSegments: number[];
}

interface FenceDrawingBoardProps {
  layout: FenceLayout;
  onChange: (layout: FenceLayout) => void;
  /** Total length reported back in feet (excludes gate segments) */
  onMeasure?: (linearFt: number, gateSegments: number) => void;
  /** Fence color hex for the drawn run */
  colorHex?: string;
}

const PX_PER_FT = 10;
const GRID_FT = 1;
const MAJOR_FT = 5;

const dist = (a: FencePoint, b: FencePoint) => Math.hypot(a.x - b.x, a.y - b.y);

/** Same drafting conventions as the 2D pool studio: 10px = 1 ft, snap to the foot grid. */
const FenceDrawingBoard = ({ layout, onChange, onMeasure, colorHex = '#111827' }: FenceDrawingBoardProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = React.useState<'draw' | 'select' | 'gate'>('draw');
  const { compact, toggle: toggleDensity } = useBoardDensity();
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [hover, setHover] = React.useState<FencePoint | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 520 });
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: Math.max(360, Math.min(560, Math.round(el.clientWidth * 0.55))) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const segments = React.useMemo(() => {
    const pts = layout.points;
    const segs: Array<{ a: FencePoint; b: FencePoint; index: number }> = [];
    for (let i = 0; i < pts.length - 1; i++) segs.push({ a: pts[i], b: pts[i + 1], index: i });
    if (layout.closed && pts.length > 2) segs.push({ a: pts[pts.length - 1], b: pts[0], index: pts.length - 1 });
    return segs;
  }, [layout]);

  const measurements = React.useMemo(() => {
    let fenceFt = 0;
    let gateFt = 0;
    segments.forEach(seg => {
      const ft = dist(seg.a, seg.b) / PX_PER_FT;
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

    // grid
    for (let x = 0; x <= size.w; x += GRID_FT * PX_PER_FT) {
      const major = Math.round(x / PX_PER_FT) % MAJOR_FT === 0;
      ctx.strokeStyle = major ? gridMajor : gridMinor;
      ctx.lineWidth = major ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, size.h);
      ctx.stroke();
    }
    for (let y = 0; y <= size.h; y += GRID_FT * PX_PER_FT) {
      const major = Math.round(y / PX_PER_FT) % MAJOR_FT === 0;
      ctx.strokeStyle = major ? gridMajor : gridMinor;
      ctx.lineWidth = major ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(size.w, y + 0.5);
      ctx.stroke();
    }

    // segments
    segments.forEach(seg => {
      const isGate = layout.gateSegments.includes(seg.index);
      ctx.strokeStyle = isGate ? '#0891b2' : colorHex;
      ctx.lineWidth = isGate ? 5 : 3.5;
      ctx.setLineDash(isGate ? [8, 6] : []);
      ctx.beginPath();
      ctx.moveTo(seg.a.x, seg.a.y);
      ctx.lineTo(seg.b.x, seg.b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // picket ticks for visual fidelity
      if (!isGate) {
        const len = dist(seg.a, seg.b);
        const step = 4; // ~4.75" picket spacing at 10px/ft
        const ux = (seg.b.x - seg.a.x) / (len || 1);
        const uy = (seg.b.y - seg.a.y) / (len || 1);
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let d = step; d < len; d += step) {
          const px = seg.a.x + ux * d;
          const py = seg.a.y + uy * d;
          ctx.beginPath();
          ctx.moveTo(px - uy * 4, py + ux * 4);
          ctx.lineTo(px + uy * 4, py - ux * 4);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // dimension label
      const ft = dist(seg.a, seg.b) / PX_PER_FT;
      if (ft >= 1) {
        const mx = (seg.a.x + seg.b.x) / 2;
        const my = (seg.a.y + seg.b.y) / 2;
        const label = `${ft.toFixed(1)} ft${isGate ? ' • GATE' : ''}`;
        ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
        const w = ctx.measureText(label).width + 8;
        ctx.fillStyle = bg;
        ctx.fillRect(mx - w / 2, my - 16, w, 15);
        ctx.strokeStyle = gridMajor;
        ctx.lineWidth = 1;
        ctx.strokeRect(mx - w / 2, my - 16, w, 15);
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(label, mx, my - 5);
      }
    });

    // preview segment
    if (mode === 'draw' && hover && layout.points.length > 0 && !layout.closed) {
      const last = layout.points[layout.points.length - 1];
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(hover.x, hover.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const ft = dist(last, hover) / PX_PER_FT;
      ctx.fillStyle = textColor;
      ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${ft.toFixed(1)} ft`, hover.x + 10, hover.y - 8);
    }

    // posts
    layout.points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === dragIndex ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#f97066' : colorHex;
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [layout, segments, size, hover, mode, dragIndex, colorHex]);

  // ---- interaction ----
  const toLocal = (e: React.MouseEvent): FencePoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const raw = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

  const handleDown = (e: React.MouseEvent) => {
    const p = toLocal(e);
    if (mode === 'select') {
      const idx = hitPoint(p);
      if (idx >= 0) setDragIndex(idx);
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
    onChange({ ...layout, points: [...layout.points, p] });
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
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={mode === 'draw' ? 'default' : 'outline'} onClick={() => setMode('draw')}>
          <Ruler className="h-3.5 w-3.5 mr-1" /> Draw run
        </Button>
        <Button size="sm" variant={mode === 'select' ? 'default' : 'outline'} onClick={() => setMode('select')}>
          <MousePointer2 className="h-3.5 w-3.5 mr-1" /> Move posts
        </Button>
        <Button size="sm" variant={mode === 'gate' ? 'default' : 'outline'} onClick={() => setMode('gate')}>
          <DoorOpen className="h-3.5 w-3.5 mr-1" /> Mark gate
        </Button>
        <Button size="sm" variant="ghost" onClick={undo} disabled={!layout.points.length}>
          <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={() => onChange({ points: [], closed: false, gateSegments: [] })}
          disabled={!layout.points.length}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {!compact && (
            <>
              <Badge variant="secondary">{measurements.fenceFt.toLocaleString()} linear ft</Badge>
              {layout.gateSegments.length > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {layout.gateSegments.length} gate opening{layout.gateSegments.length > 1 ? 's' : ''} • {measurements.gateFt} ft
                </Badge>
              )}
            </>
          )}
          <BoardDensityToggle compact={compact} onToggle={toggleDensity} />
        </div>
      </div>

      <div ref={wrapRef} className="rounded-lg border overflow-hidden bg-card">
        <canvas
          ref={canvasRef}
          style={{ width: size.w, height: size.h, cursor: mode === 'select' ? 'grab' : 'crosshair' }}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
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
