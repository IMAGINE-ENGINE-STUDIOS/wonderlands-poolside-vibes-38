import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Undo2, Trash2, DoorOpen, MousePointer2, Ruler, Home, Square } from 'lucide-react';

export interface EnclosurePoint {
  x: number;
  y: number;
}

export type EnclosureSegmentKind = 'wall' | 'door' | 'house';

export interface EnclosureFeature {
  kind: Extract<EnclosureSegmentKind, 'door' | 'house'>;
  /** Normalized start position along the segment (0 = start point, 1 = end point) */
  start: number;
  /** Normalized end position along the segment */
  end: number;
}

export interface EnclosureLayout {
  points: EnclosurePoint[];
  closed: boolean;
  /** Segment index -> list of door/house bays placed along that segment. */
  features: Record<number, EnclosureFeature[]>;
  /** @deprecated Kept for cache migration only. */
  segmentKinds?: Record<number, EnclosureSegmentKind>;
}

export interface EnclosureTakeoff {
  areaSqFt: number;
  perimeterFt: number;
  /** Screened wall + door footage (house-attached runs excluded) */
  screenWallFt: number;
  houseWallFt: number;
  doorOpeningFt: number;
  longestSpanFt: number;
  widthFt: number;
  depthFt: number;
}

interface Props {
  layout: EnclosureLayout;
  onChange: (layout: EnclosureLayout) => void;
  onMeasure?: (takeoff: EnclosureTakeoff) => void;
  frameColorHex?: string;
}

const PX_PER_FT = 10;
const GRID_FT = 1;
const MAJOR_FT = 5;
const DEFAULT_DOOR_FT = 3; // standard 36" swing door width

const dist = (a: EnclosurePoint, b: EnclosurePoint) => Math.hypot(a.x - b.x, a.y - b.y);

const KIND_COLOR: Record<EnclosureSegmentKind, string> = {
  wall: '#111827',
  door: '#0891b2',
  house: '#f97066',
};

/** Top-view enclosure footprint board. Same drafting conventions as the 2D pool studio: 10px = 1 ft. */
const EnclosureDrawingBoard = ({ layout, onChange, onMeasure, frameColorHex }: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = React.useState<'draw' | 'select' | 'door' | 'house'>('draw');
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [hover, setHover] = React.useState<EnclosurePoint | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 520 });

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: Math.max(360, Math.min(560, Math.round(el.clientWidth * 0.58))) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const segments = React.useMemo(() => {
    const pts = layout.points;
    const segs: Array<{ a: EnclosurePoint; b: EnclosurePoint; index: number }> = [];
    for (let i = 0; i < pts.length - 1; i++) segs.push({ a: pts[i], b: pts[i + 1], index: i });
    if (layout.closed && pts.length > 2) segs.push({ a: pts[pts.length - 1], b: pts[0], index: pts.length - 1 });
    return segs;
  }, [layout]);

  const featuresOf = (index: number): EnclosureFeature[] => layout.features[index] || [];

  /** Split a segment into wall/door/house intervals based on its features. */
  const segmentIntervals = (seg: { a: EnclosurePoint; b: EnclosurePoint; index: number }) => {
    const len = dist(seg.a, seg.b);
    const ft = len / PX_PER_FT;
    const feats = featuresOf(seg.index)
      .filter(f => f.end > f.start)
      .sort((a, b) => a.start - b.start);
    const intervals: Array<{ kind: EnclosureSegmentKind; t0: number; t1: number; ft: number }> = [];
    let cursor = 0;
    feats.forEach(f => {
      if (f.start > cursor) {
        intervals.push({ kind: 'wall', t0: cursor, t1: f.start, ft: (f.start - cursor) * ft });
      }
      intervals.push({ kind: f.kind, t0: f.start, t1: f.end, ft: (f.end - f.start) * ft });
      cursor = f.end;
    });
    if (cursor < 1) intervals.push({ kind: 'wall', t0: cursor, t1: 1, ft: (1 - cursor) * ft });
    return intervals;
  };

  const takeoff = React.useMemo<EnclosureTakeoff>(() => {
    const pts = layout.points;
    let perimeter = 0;
    let screenWall = 0;
    let houseWall = 0;
    let doorFt = 0;
    let longest = 0;
    segments.forEach(seg => {
      const ft = dist(seg.a, seg.b) / PX_PER_FT;
      perimeter += ft;
      longest = Math.max(longest, ft);
      const intervals = segmentIntervals(seg);
      intervals.forEach(iv => {
        if (iv.kind === 'house') houseWall += iv.ft;
        else {
          screenWall += iv.ft;
          if (iv.kind === 'door') doorFt += iv.ft;
        }
      });
    });
    // Shoelace area (only meaningful for a closed footprint)
    let area = 0;
    if (layout.closed && pts.length > 2) {
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const q = pts[(i + 1) % pts.length];
        area += p.x * q.y - q.x * p.y;
      }
      area = Math.abs(area) / 2 / (PX_PER_FT * PX_PER_FT);
    }
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const widthFt = pts.length ? (Math.max(...xs) - Math.min(...xs)) / PX_PER_FT : 0;
    const depthFt = pts.length ? (Math.max(...ys) - Math.min(...ys)) / PX_PER_FT : 0;
    const r1 = (n: number) => Math.round(n * 10) / 10;
    return {
      areaSqFt: Math.round(area),
      perimeterFt: r1(perimeter),
      screenWallFt: r1(screenWall),
      houseWallFt: r1(houseWall),
      doorOpeningFt: r1(doorFt),
      longestSpanFt: r1(longest),
      widthFt: r1(widthFt),
      depthFt: r1(depthFt),
    };
  }, [segments, layout]);

  const measureRef = React.useRef(onMeasure);
  measureRef.current = onMeasure;
  React.useEffect(() => {
    measureRef.current?.(takeoff);
  }, [takeoff]);

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
    const wallColor = frameColorHex || KIND_COLOR.wall;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.w, size.h);

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

    // footprint fill
    if (layout.closed && layout.points.length > 2) {
      ctx.beginPath();
      layout.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = 'rgba(8, 145, 178, 0.08)';
      ctx.fill();
    }

    segments.forEach(seg => {
      const intervals = segmentIntervals(seg);
      const lenPx = dist(seg.a, seg.b);
      const ux = (seg.b.x - seg.a.x) / (lenPx || 1);
      const uy = (seg.b.y - seg.a.y) / (lenPx || 1);

      intervals.forEach(iv => {
        const color = iv.kind === 'wall' ? wallColor : KIND_COLOR[iv.kind];
        const a = { x: seg.a.x + ux * iv.t0 * lenPx, y: seg.a.y + uy * iv.t0 * lenPx };
        const b = { x: seg.a.x + ux * iv.t1 * lenPx, y: seg.a.y + uy * iv.t1 * lenPx };
        ctx.strokeStyle = color;
        ctx.lineWidth = iv.kind === 'house' ? 6 : iv.kind === 'door' ? 5 : 3.5;
        ctx.setLineDash(iv.kind === 'door' ? [9, 6] : []);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // upright ticks on screened wall intervals only
        if (iv.kind === 'wall') {
          const ivLen = dist(a, b);
          const step = 6 * PX_PER_FT; // uprights at 6 ft o.c.
          ctx.fillStyle = color;
          for (let d = step; d < ivLen; d += step) {
            const px = a.x + ux * d;
            const py = a.y + uy * d;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // label each interval
        if (iv.ft >= 1) {
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const suffix = iv.kind === 'door' ? ' • DOOR' : iv.kind === 'house' ? ' • HOUSE' : '';
          const label = `${iv.ft.toFixed(1)} ft${suffix}`;
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

      // small perpendicular hatch marks at feature boundaries so the eye sees the door/house edges
      featuresOf(seg.index).forEach(f => {
        const t = f.start;
        const px = seg.a.x + ux * t * lenPx;
        const py = seg.a.y + uy * t * lenPx;
        const nx = -uy * 8;
        const ny = ux * 8;
        ctx.strokeStyle = KIND_COLOR[f.kind];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - nx, py - ny);
        ctx.lineTo(px + nx, py + ny);
        ctx.stroke();
      });
    });

    // area callout
    if (layout.closed && takeoff.areaSqFt > 0) {
      const cx = layout.points.reduce((s, p) => s + p.x, 0) / layout.points.length;
      const cy = layout.points.reduce((s, p) => s + p.y, 0) / layout.points.length;
      const label = `${takeoff.areaSqFt.toLocaleString()} SQ FT`;
      ctx.font = '700 14px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = textColor;
      ctx.fillText(label, cx, cy);
      ctx.font = '500 11px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`${takeoff.widthFt.toFixed(1)} ft x ${takeoff.depthFt.toFixed(1)} ft envelope`, cx, cy + 16);
    }

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
      ctx.fillStyle = textColor;
      ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${(dist(last, hover) / PX_PER_FT).toFixed(1)} ft`, hover.x + 10, hover.y - 8);
    }

    layout.points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === dragIndex ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#f97066' : wallColor;
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [layout, segments, size, hover, mode, dragIndex, frameColorHex, takeoff]);

  // ---- interaction ----
  const toLocal = (e: React.MouseEvent): EnclosurePoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const raw = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    return {
      x: Math.round(raw.x / PX_PER_FT) * PX_PER_FT,
      y: Math.round(raw.y / PX_PER_FT) * PX_PER_FT,
    };
  };

  const hitPoint = (p: EnclosurePoint) => layout.points.findIndex(pt => dist(pt, p) < 9);
  const hitSegment = (p: EnclosurePoint) => {
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

  const tagSegment = (index: number, kind: EnclosureSegmentKind) => {
    const next = { ...layout.segmentKinds };
    if (next[index] === kind) delete next[index];
    else next[index] = kind;
    onChange({ ...layout, segmentKinds: next });
  };

  const handleDown = (e: React.MouseEvent) => {
    const p = toLocal(e);
    if (mode === 'select') {
      const idx = hitPoint(p);
      if (idx >= 0) setDragIndex(idx);
      return;
    }
    if (mode === 'door' || mode === 'house') {
      const seg = hitSegment(p);
      if (seg >= 0) tagSegment(seg, mode === 'door' ? 'door' : 'house');
      return;
    }
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
      onChange({ ...layout, points: layout.points.map((pt, i) => (i === dragIndex ? p : pt)) });
    }
  };

  const undo = () => {
    if (layout.closed) return onChange({ ...layout, closed: false });
    const nextLen = Math.max(0, layout.points.length - 1);
    const kinds: Record<number, EnclosureSegmentKind> = {};
    Object.entries(layout.segmentKinds).forEach(([k, v]) => {
      if (Number(k) < nextLen - 1) kinds[Number(k)] = v;
    });
    onChange({ points: layout.points.slice(0, -1), closed: false, segmentKinds: kinds });
  };

  const clear = () => onChange({ points: [], closed: false, segmentKinds: {} });

  const preset = (w: number, d: number) => {
    const ox = 60;
    const oy = 60;
    onChange({
      points: [
        { x: ox, y: oy },
        { x: ox + w * PX_PER_FT, y: oy },
        { x: ox + w * PX_PER_FT, y: oy + d * PX_PER_FT },
        { x: ox, y: oy + d * PX_PER_FT },
      ],
      closed: true,
      segmentKinds: { 0: 'house' },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={mode === 'draw' ? 'default' : 'outline'} onClick={() => setMode('draw')}>
          <Ruler className="h-3.5 w-3.5 mr-1" /> Draw footprint
        </Button>
        <Button size="sm" variant={mode === 'select' ? 'default' : 'outline'} onClick={() => setMode('select')}>
          <MousePointer2 className="h-3.5 w-3.5 mr-1" /> Move corners
        </Button>
        <Button size="sm" variant={mode === 'door' ? 'default' : 'outline'} onClick={() => setMode('door')}>
          <DoorOpen className="h-3.5 w-3.5 mr-1" /> Tag door
        </Button>
        <Button size="sm" variant={mode === 'house' ? 'default' : 'outline'} onClick={() => setMode('house')}>
          <Home className="h-3.5 w-3.5 mr-1" /> Tag house wall
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button size="sm" variant="ghost" onClick={undo}>
          <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
        </Button>
        <Button size="sm" variant="ghost" onClick={clear}>
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button size="sm" variant="outline" onClick={() => preset(30, 20)}>
          <Square className="h-3.5 w-3.5 mr-1" /> 30 x 20
        </Button>
        <Button size="sm" variant="outline" onClick={() => preset(40, 24)}>
          <Square className="h-3.5 w-3.5 mr-1" /> 40 x 24
        </Button>
      </div>

      <div ref={wrapRef} className="rounded-lg border border-border overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width: size.w, height: size.h, cursor: mode === 'select' ? 'grab' : 'crosshair', display: 'block' }}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={() => setDragIndex(null)}
          onMouseLeave={() => {
            setDragIndex(null);
            setHover(null);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">Area {takeoff.areaSqFt.toLocaleString()} sq ft</Badge>
        <Badge variant="secondary">Perimeter {takeoff.perimeterFt.toLocaleString()} ft</Badge>
        <Badge variant="secondary">Screened wall {takeoff.screenWallFt.toLocaleString()} ft</Badge>
        <Badge variant="secondary">House-attached {takeoff.houseWallFt.toLocaleString()} ft</Badge>
        <Badge variant="secondary">Longest span {takeoff.longestSpanFt.toFixed(1)} ft</Badge>
        <span className="text-muted-foreground">
          Scale 10 px = 1 ft • click to place corners, click the first corner to close the footprint
        </span>
      </div>
    </div>
  );
};

export default EnclosureDrawingBoard;
