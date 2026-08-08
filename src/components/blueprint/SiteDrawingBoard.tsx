import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Trash2, MousePointer2, PenLine, ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';

export type SiteLayerId =
  | 'property'
  | 'building'
  | 'driveway'
  | 'patio'
  | 'pool'
  | 'deck'
  | 'gravel'
  | 'fence'
  | 'equipment';

export interface SiteLayerMeta {
  id: SiteLayerId;
  label: string;
  color: string;
  /** Counted as impervious area in the areas table */
  impervious: boolean;
  /** Open polyline instead of a closed area (fence runs) */
  linear?: boolean;
}

export const SITE_LAYERS: SiteLayerMeta[] = [
  { id: 'property', label: 'Property boundary', color: '#111827', impervious: false },
  { id: 'building', label: 'Building / residence', color: '#6b7280', impervious: true },
  { id: 'driveway', label: 'Driveway', color: '#9ca3af', impervious: true },
  { id: 'patio', label: 'Conc. patio / AC pad', color: '#78716c', impervious: true },
  { id: 'pool', label: 'Pool / spa', color: '#0891b2', impervious: true },
  { id: 'deck', label: 'Paver deck', color: '#f97066', impervious: true },
  { id: 'gravel', label: 'Gravel area', color: '#a3a3a3', impervious: true },
  { id: 'fence', label: 'Fence / barrier', color: '#16a34a', impervious: false, linear: true },
  { id: 'equipment', label: 'Equipment pad', color: '#7c3aed', impervious: true },
];

export interface SiteShape {
  id: string;
  layer: SiteLayerId;
  points: { x: number; y: number }[];
  closed: boolean;
}

export interface SitePlanData {
  shapes: SiteShape[];
  /** Canvas pixels per foot */
  pxPerFt: number;
}

export interface SiteAreas {
  /** Area in sq ft per layer */
  byLayer: Record<SiteLayerId, number>;
  propertySqFt: number;
  imperviousSqFt: number;
  imperviousPct: number;
  fenceLinearFt: number;
}

const CANVAS_W = 1180;
const CANVAS_H = 720;

const layerMeta = (id: SiteLayerId) => SITE_LAYERS.find(l => l.id === id) || SITE_LAYERS[0];

const polygonArea = (pts: { x: number; y: number }[]) => {
  if (pts.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
};

const pathLength = (pts: { x: number; y: number }[], closed: boolean) => {
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) len += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
  if (closed && pts.length > 2) len += Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
  return len;
};

/** Areas and linear footage derived from the drawn site plan */
export function measureSitePlan(data: SitePlanData): SiteAreas {
  const byLayer = SITE_LAYERS.reduce((acc, l) => {
    acc[l.id] = 0;
    return acc;
  }, {} as Record<SiteLayerId, number>);
  const sq = data.pxPerFt * data.pxPerFt || 1;
  let fenceLinearFt = 0;

  data.shapes.forEach(shape => {
    const meta = layerMeta(shape.layer);
    if (meta.linear) {
      fenceLinearFt += pathLength(shape.points, shape.closed) / (data.pxPerFt || 1);
      return;
    }
    byLayer[shape.layer] += polygonArea(shape.points) / sq;
  });

  const propertySqFt = Math.round(byLayer.property);
  const imperviousSqFt = Math.round(
    SITE_LAYERS.filter(l => l.impervious).reduce((sum, l) => sum + byLayer[l.id], 0)
  );
  return {
    byLayer,
    propertySqFt,
    imperviousSqFt,
    imperviousPct: propertySqFt > 0 ? Math.round((imperviousSqFt / propertySqFt) * 100) : 0,
    fenceLinearFt: Math.round(fenceLinearFt),
  };
}

interface Props {
  data: SitePlanData;
  onChange: (data: SitePlanData) => void;
  onSnapshot?: (dataUrl: string | null) => void;
  /** Read-only render for the printed sheet */
  readOnly?: boolean;
  height?: number;
}

/**
 * Architect-style 2D site plan board. Draw the property boundary, the
 * residence, hardscape and the pool on a scaled grid; every polygon feeds the
 * impervious area table on sheet A1.
 */
export const SiteDrawingBoard: React.FC<Props> = ({ data, onChange, onSnapshot, readOnly, height }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [layer, setLayer] = React.useState<SiteLayerId>('property');
  const [mode, setMode] = React.useState<'draw' | 'select'>('draw');
  const [draft, setDraft] = React.useState<{ x: number; y: number }[]>([]);
  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [showGrid, setShowGrid] = React.useState(true);

  const pxPerFt = data.pxPerFt;
  const gridFt = pxPerFt >= 8 ? 1 : pxPerFt >= 4 ? 5 : 10;
  const majorFt = gridFt * 5;

  const snap = (v: number) => Math.round(v / (pxPerFt * gridFt)) * (pxPerFt * gridFt);

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (showGrid) {
      const step = pxPerFt * gridFt;
      const majorStep = pxPerFt * majorFt;
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_W; x += step) {
        ctx.strokeStyle = Math.abs(x % majorStep) < 0.01 ? '#d4d4d8' : '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_H; y += step) {
        ctx.strokeStyle = Math.abs(y % majorStep) < 0.01 ? '#d4d4d8' : '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }
    }

    const renderShape = (shape: SiteShape, isDraft = false) => {
      const meta = layerMeta(shape.layer);
      if (shape.points.length === 0) return;
      ctx.beginPath();
      shape.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      if (shape.closed) ctx.closePath();
      if (shape.closed && !meta.linear) {
        ctx.fillStyle = meta.color + '22';
        ctx.fill();
      }
      ctx.strokeStyle = selected === shape.id ? '#f59e0b' : meta.color;
      ctx.lineWidth = selected === shape.id ? 3 : meta.id === 'property' ? 2.5 : 2;
      ctx.setLineDash(isDraft ? [6, 4] : meta.id === 'property' ? [10, 4, 2, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // vertices
      shape.points.forEach(p => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // segment dimensions
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = '#334155';
      const segCount = shape.closed ? shape.points.length : shape.points.length - 1;
      for (let i = 0; i < segCount; i++) {
        const a = shape.points[i];
        const b = shape.points[(i + 1) % shape.points.length];
        const ft = Math.hypot(b.x - a.x, b.y - a.y) / pxPerFt;
        if (ft < 3) continue;
        ctx.fillText(`${ft.toFixed(1)}'`, (a.x + b.x) / 2 + 4, (a.y + b.y) / 2 - 4);
      }

      // label + area
      if (shape.closed && !meta.linear && shape.points.length > 2) {
        const cx = shape.points.reduce((s, p) => s + p.x, 0) / shape.points.length;
        const cy = shape.points.reduce((s, p) => s + p.y, 0) / shape.points.length;
        const area = polygonArea(shape.points) / (pxPerFt * pxPerFt);
        ctx.fillStyle = meta.color;
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(meta.label.toUpperCase(), cx, cy - 6);
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText(`${Math.round(area).toLocaleString()} SF`, cx, cy + 8);
        ctx.textAlign = 'left';
      }
    };

    data.shapes.forEach(s => renderShape(s));
    if (draft.length) {
      const preview = hover ? [...draft, hover] : draft;
      renderShape({ id: 'draft', layer, points: preview, closed: false }, true);
    }

    // scale bar
    const barFt = 20;
    const barPx = barFt * pxPerFt;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, CANVAS_H - 24);
    ctx.lineTo(20 + barPx, CANVAS_H - 24);
    ctx.stroke();
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = '#111827';
    ctx.fillText(`0'`, 18, CANVAS_H - 10);
    ctx.fillText(`${barFt}'`, 14 + barPx, CANVAS_H - 10);

    // north arrow
    ctx.beginPath();
    ctx.moveTo(CANVAS_W - 40, CANVAS_H - 60);
    ctx.lineTo(CANVAS_W - 32, CANVAS_H - 34);
    ctx.lineTo(CANVAS_W - 40, CANVAS_H - 42);
    ctx.lineTo(CANVAS_W - 48, CANVAS_H - 34);
    ctx.closePath();
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.fillText('N', CANVAS_W - 44, CANVAS_H - 66);
  }, [data.shapes, draft, hover, layer, pxPerFt, gridFt, majorFt, selected, showGrid]);

  React.useEffect(() => {
    draw();
    if (!onSnapshot) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSnapshot(data.shapes.length ? canvas.toDataURL('image/png') : null);
  }, [draw, onSnapshot, data.shapes.length]);

  const toLocal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const hitTest = (p: { x: number; y: number }): string | null => {
    for (let i = data.shapes.length - 1; i >= 0; i--) {
      const shape = data.shapes[i];
      const segCount = shape.closed ? shape.points.length : shape.points.length - 1;
      for (let s = 0; s < segCount; s++) {
        const a = shape.points[s];
        const b = shape.points[(s + 1) % shape.points.length];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        if (len === 0) continue;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len)));
        const d = Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
        if (d < 8) return shape.id;
      }
    }
    return null;
  };

  const commitDraft = (points: { x: number; y: number }[], closed: boolean) => {
    if (points.length < 2) return;
    const shape: SiteShape = {
      id: `${layer}-${Date.now()}`,
      layer,
      points,
      closed: closed && points.length > 2,
    };
    onChange({ ...data, shapes: [...data.shapes, shape] });
    setDraft([]);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const raw = toLocal(e);
    const p = { x: snap(raw.x), y: snap(raw.y) };
    if (mode === 'select') {
      setSelected(hitTest(raw));
      return;
    }
    // clicking the first vertex closes the polygon
    if (draft.length > 2) {
      const first = draft[0];
      if (Math.hypot(p.x - first.x, p.y - first.y) < 10) {
        commitDraft(draft, true);
        return;
      }
    }
    setDraft(prev => [...prev, p]);
  };

  const handleDouble = () => {
    if (readOnly) return;
    if (draft.length >= 2) commitDraft(draft, layerMeta(layer).linear ? false : true);
  };

  const deleteSelected = () => {
    if (!selected) return;
    onChange({ ...data, shapes: data.shapes.filter(s => s.id !== selected) });
    setSelected(null);
  };

  React.useEffect(() => {
    if (readOnly) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDraft([]);
      if (e.key === 'Enter' && draft.length >= 2) commitDraft(draft, !layerMeta(layer).linear);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const areas = measureSitePlan(data);

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {SITE_LAYERS.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLayer(l.id);
                  setMode('draw');
                  setDraft([]);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  layer === l.id && mode === 'draw'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={mode === 'select' ? 'default' : 'outline'}
              onClick={() => setMode(mode === 'select' ? 'draw' : 'select')}
            >
              {mode === 'select' ? <MousePointer2 className="mr-1 h-3.5 w-3.5" /> : <PenLine className="mr-1 h-3.5 w-3.5" />}
              {mode === 'select' ? 'Select' : 'Draw'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setDraft(p => p.slice(0, -1))} disabled={!draft.length}>
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={deleteSelected} disabled={!selected}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowGrid(g => !g)}>
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChange({ ...data, pxPerFt: Math.max(1, +(data.pxPerFt - 0.5).toFixed(1)) })}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="w-24 text-center text-[11px] text-muted-foreground">{data.pxPerFt} px / ft</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChange({ ...data, pxPerFt: Math.min(12, +(data.pxPerFt + 0.5).toFixed(1)) })}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleClick}
        onDoubleClick={handleDouble}
        onMouseMove={e => {
          if (readOnly || mode !== 'draw' || !draft.length) return;
          const raw = toLocal(e);
          setHover({ x: snap(raw.x), y: snap(raw.y) });
        }}
        onMouseLeave={() => setHover(null)}
        className="w-full rounded-md border border-border bg-white"
        style={{ height: height ?? undefined, cursor: readOnly ? 'default' : mode === 'select' ? 'pointer' : 'crosshair' }}
      />

      {!readOnly && (
        <p className="text-[11px] text-muted-foreground">
          Click to place corners, click the first corner (or press Enter / double-click) to close the shape. Switch to Select to
          click a line and delete it. Drawn: {areas.propertySqFt.toLocaleString()} SF lot &middot; {areas.imperviousSqFt.toLocaleString()} SF
          impervious ({areas.imperviousPct}%) &middot; {areas.fenceLinearFt} LF barrier.
        </p>
      )}
    </div>
  );
};

export default SiteDrawingBoard;
