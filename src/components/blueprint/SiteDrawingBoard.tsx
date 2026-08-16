import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Undo2,
  Trash2,
  MousePointer2,
  PenLine,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Image as ImageIcon,
  Ruler,
  Move,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Spline,

} from 'lucide-react';
import {
  hitVertexIndex,
  insertVertexAt,
  insertVertexAfter,
  removeVertex,
  normalizeFlags,
  toggleCurveFlag,
  hasAnyCurve,
  samplePath,
  sampleSegment,

  polylineLength,
  tracePolyline,
} from '@/utils/splineEditing';


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
  /** Per-point curvature flags — true renders that vertex as a smooth spline handle */
  curves?: boolean[];
  /** Set when the shape came from an imported PDF/DXF/SVG plan */
  importedFrom?: string;
}

/** Curve-aware outline used for rendering and all measurements. */
export const siteShapeOutline = (shape: SiteShape) =>
  hasAnyCurve(shape.curves)
    ? samplePath(shape.points, shape.closed, normalizeFlags(shape.curves, shape.points.length))
    : shape.points;


/** Imported raster plan placed behind the drawing, used to trace over */
export interface SiteUnderlay {
  dataUrl: string;
  /** Top-left position on the canvas, in canvas px */
  x: number;
  y: number;
  /** Uniform scale applied to the source image */
  scale: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  label: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface SitePlanData {
  shapes: SiteShape[];
  /** Canvas pixels per foot */
  pxPerFt: number;
  /** Traced-over imported sheet */
  underlay?: SiteUnderlay;
}

export interface SiteAreas {
  /** Area in sq ft per layer */
  byLayer: Record<SiteLayerId, number>;
  propertySqFt: number;
  imperviousSqFt: number;
  imperviousPct: number;
  fenceLinearFt: number;
}

export const CANVAS_W = 1180;
export const CANVAS_H = 720;

/** Default view height in real feet — the canvas shows 50 ft top to bottom. */
export const DEFAULT_VIEW_HEIGHT_FT = 50;
export const DEFAULT_PX_PER_FT = +(CANVAS_H / DEFAULT_VIEW_HEIGHT_FT).toFixed(2); // 14.4 px/ft

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
    const outline = siteShapeOutline(shape);
    if (meta.linear) {
      fenceLinearFt += pathLength(outline, shape.closed) / (data.pxPerFt || 1);
      return;
    }
    byLayer[shape.layer] += polygonArea(outline) / sq;
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

type Mode = 'draw' | 'select' | 'underlay' | 'calibrate';

interface Props {
  data: SitePlanData;
  onChange: (data: SitePlanData) => void;
  onSnapshot?: (dataUrl: string | null) => void;
  /** Read-only render for the printed sheet */
  readOnly?: boolean;
  height?: number;
  /** Opens the import dialog from the board toolbar */
  onRequestImport?: () => void;
  /** Title block rendered inside the board toolbar */
  header?: React.ReactNode;
  /** Layer armed for drawing when the board first mounts */
  defaultLayer?: SiteLayerId;
}

/**
 * Architect-style 2D site plan board. Draw the property boundary, the
 * residence, hardscape and the pool on a scaled grid; every polygon feeds the
 * impervious area table on sheet A1. Imported PDF/JPG sheets sit behind the
 * grid as a calibratable underlay so an existing blueprint can be traced and
 * then edited like native geometry.
 */
export const SiteDrawingBoard: React.FC<Props> = ({ data, onChange, onSnapshot, readOnly, height, onRequestImport, header, defaultLayer }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [imgReady, setImgReady] = React.useState(0);
  const [layer, setLayer] = React.useState<SiteLayerId>(defaultLayer ?? 'property');
  const [mode, setMode] = React.useState<Mode>('draw');
  const [draft, setDraft] = React.useState<{ x: number; y: number }[]>([]);
  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [selectedVertex, setSelectedVertex] = React.useState<number | null>(null);

  const [showGrid, setShowGrid] = React.useState(true);
  const [calibration, setCalibration] = React.useState<{ x: number; y: number }[]>([]);
  const drag = React.useRef<
    | { kind: 'vertex'; shapeId: string; index: number }
    | { kind: 'shape'; shapeId: string; last: { x: number; y: number } }
    | { kind: 'underlay'; last: { x: number; y: number } }
    | null
  >(null);

  const underlay = data.underlay;
  const pxPerFt = data.pxPerFt;
  const gridFt = pxPerFt >= 8 ? 1 : pxPerFt >= 4 ? 5 : 10;
  const majorFt = gridFt * 5;

  const snap = (v: number) => Math.round(v / (pxPerFt * gridFt)) * (pxPerFt * gridFt);

  // Load / reload the underlay bitmap
  React.useEffect(() => {
    if (!underlay?.dataUrl) {
      imgRef.current = null;
      setImgReady(n => n + 1);
      return;
    }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgReady(n => n + 1);
    };
    img.src = underlay.dataUrl;
  }, [underlay?.dataUrl]);

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // imported sheet underlay
    if (underlay && underlay.visible && imgRef.current) {
      ctx.save();
      ctx.globalAlpha = underlay.opacity;
      ctx.drawImage(
        imgRef.current,
        underlay.x,
        underlay.y,
        underlay.naturalWidth * underlay.scale,
        underlay.naturalHeight * underlay.scale
      );
      ctx.restore();
      if (!readOnly && mode === 'underlay') {
        ctx.strokeStyle = '#0891b2';
        ctx.setLineDash([8, 5]);
        ctx.lineWidth = 2;
        ctx.strokeRect(
          underlay.x,
          underlay.y,
          underlay.naturalWidth * underlay.scale,
          underlay.naturalHeight * underlay.scale
        );
        ctx.setLineDash([]);
      }
    }

    if (showGrid) {
      const step = pxPerFt * gridFt;
      const majorStep = pxPerFt * majorFt;
      ctx.lineWidth = 1;
      ctx.globalAlpha = underlay?.visible ? 0.5 : 1;
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
      ctx.globalAlpha = 1;
    }

    const renderShape = (shape: SiteShape, isDraft = false) => {
      const meta = layerMeta(shape.layer);
      if (shape.points.length === 0) return;
      const flags = normalizeFlags(shape.curves, shape.points.length);
      const outline = siteShapeOutline(shape);
      tracePolyline(ctx, outline, shape.closed);
      if (shape.closed && !meta.linear) {
        ctx.fillStyle = meta.color + '22';
        ctx.fill();
      }
      ctx.strokeStyle = selected === shape.id ? '#f59e0b' : meta.color;
      ctx.lineWidth = selected === shape.id ? 3 : meta.id === 'property' ? 2.5 : 2;
      ctx.setLineDash(isDraft ? [6, 4] : meta.id === 'property' ? [10, 4, 2, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // vertices — round handles are curved, squares are hard corners
      const showHandles = !readOnly && (mode === 'select' ? true : isDraft);
      const active = selected === shape.id && showHandles;
      shape.points.forEach((p, i) => {
        ctx.fillStyle = active ? (flags[i] ? '#0891b2' : '#f59e0b') : '#ffffff';
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 1.5;
        const r = active ? 5 : 3.5;
        ctx.beginPath();
        if (flags[i]) ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        else ctx.rect(p.x - r, p.y - r, r * 2, r * 2);
        ctx.fill();
        ctx.stroke();
      });

      // segment dimensions — arc length on curved runs, offset perpendicular so text never sits on the line
      ctx.font = 'bold 14px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const segCount = shape.closed ? shape.points.length : shape.points.length - 1;
      for (let i = 0; i < segCount; i++) {
        const a = shape.points[i];
        const b = shape.points[(i + 1) % shape.points.length];
        const chord = Math.hypot(b.x - a.x, b.y - a.y);
        const curved = flags[i] || flags[(i + 1) % shape.points.length];
        const segPts = curved ? sampleSegment(shape.points, shape.closed, flags, i) : [a, b];
        const len = curved ? polylineLength(segPts) : chord;
        const ft = len / pxPerFt;
        if (ft < 3 || chord < 1) continue;
        const mid = segPts[Math.floor(segPts.length / 2)];
        const nx = -(b.y - a.y) / chord;
        const ny = (b.x - a.x) / chord;
        const off = 14;
        const tx = mid.x + nx * off;
        const ty = mid.y + ny * off;
        const text = `${ft.toFixed(1)}'`;
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        ctx.lineJoin = 'round';
        ctx.strokeText(text, tx, ty);
        ctx.fillStyle = '#1e293b';
        ctx.fillText(text, tx, ty);
      }

      // label + area
      if (shape.closed && !meta.linear && shape.points.length > 2) {
        const cx = shape.points.reduce((s, p) => s + p.x, 0) / shape.points.length;
        const cy = shape.points.reduce((s, p) => s + p.y, 0) / shape.points.length;
        const area = polygonArea(outline) / (pxPerFt * pxPerFt);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        ctx.lineJoin = 'round';
        ctx.font = 'bold 13px ui-sans-serif, system-ui';
        ctx.strokeText(meta.label.toUpperCase(), cx, cy - 9);
        ctx.fillStyle = meta.color;
        ctx.fillText(meta.label.toUpperCase(), cx, cy - 9);
        ctx.font = 'bold 14px ui-monospace, monospace';
        const areaText = `${Math.round(area).toLocaleString()} SF`;
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeText(areaText, cx, cy + 9);
        ctx.fillStyle = meta.color;
        ctx.fillText(areaText, cx, cy + 9);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

    };


    data.shapes.forEach(s => renderShape(s));
    if (draft.length) {
      const preview = hover ? [...draft, hover] : draft;
      renderShape({ id: 'draft', layer, points: preview, closed: false }, true);
    }

    // calibration line
    if (calibration.length) {
      const pts = hover && calibration.length === 1 ? [...calibration, hover] : calibration;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
      ctx.setLineDash([]);
      pts.forEach(p => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
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
  }, [
    data.shapes,
    draft,
    hover,
    layer,
    pxPerFt,
    gridFt,
    majorFt,
    selected,
    showGrid,
    underlay,
    imgReady,
    mode,
    readOnly,
    calibration,
  ]);

  React.useEffect(() => {
    draw();
    if (!onSnapshot) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSnapshot(data.shapes.length || data.underlay ? canvas.toDataURL('image/png') : null);
  }, [draw, onSnapshot, data.shapes.length, data.underlay]);

  const toLocal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const hitTest = (p: { x: number; y: number }): string | null => {
    for (let i = data.shapes.length - 1; i >= 0; i--) {
      const shape = data.shapes[i];
      const outline = siteShapeOutline(shape);
      const segCount = shape.closed ? outline.length : outline.length - 1;
      for (let s = 0; s < segCount; s++) {
        const a = outline[s];
        const b = outline[(s + 1) % outline.length];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        if (len === 0) continue;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len)));
        const d = Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
        if (d < 8) return shape.id;
      }
    }
    return null;
  };

  const hitVertex = (p: { x: number; y: number }): { shapeId: string; index: number } | null => {
    for (let i = data.shapes.length - 1; i >= 0; i--) {
      const shape = data.shapes[i];
      const v = hitVertexIndex(shape.points, p, 8);
      if (v >= 0) return { shapeId: shape.id, index: v };
    }
    return null;
  };

  const updateShape = (id: string, patch: (s: SiteShape) => SiteShape) => {
    onChange({ ...data, shapes: data.shapes.map(s => (s.id === id ? patch(s) : s)) });
  };

  /** Drop a new vertex on the nearest run of a shape. */
  const insertVertexNear = (p: { x: number; y: number }): boolean => {
    for (let i = data.shapes.length - 1; i >= 0; i--) {
      const shape = data.shapes[i];
      const res = insertVertexAt(shape.points, shape.closed, p, 10, normalizeFlags(shape.curves, shape.points.length));
      if (!res) continue;
      updateShape(shape.id, s => ({ ...s, points: res.points, curves: res.curves }));
      setSelected(shape.id);
      setSelectedVertex(res.index);
      return true;
    }
    return false;
  };

  const removeVertexFrom = (shapeId: string, index: number) => {
    const shape = data.shapes.find(s => s.id === shapeId);
    if (!shape) return;
    const res = removeVertex(shape.points, index, shape.closed ? 3 : 2, normalizeFlags(shape.curves, shape.points.length));
    if (!res) return;
    updateShape(shapeId, s => ({ ...s, points: res.points, curves: res.curves, closed: res.points.length > 2 ? s.closed : false }));
    setSelectedVertex(null);
  };

  const addVertexAfterSelected = () => {
    const shape = data.shapes.find(s => s.id === selected);
    if (!shape || selectedVertex === null) return;
    const res = insertVertexAfter(shape.points, shape.closed, selectedVertex, normalizeFlags(shape.curves, shape.points.length));
    if (!res) return;
    updateShape(shape.id, s => ({ ...s, points: res.points, curves: res.curves }));
    setSelectedVertex(res.index);
  };

  const toggleSelectedCurve = () => {
    const shape = data.shapes.find(s => s.id === selected);
    if (!shape) return;
    if (selectedVertex === null) {
      // No single handle picked: smooth or straighten the whole outline
      const smooth = !hasAnyCurve(shape.curves);
      updateShape(shape.id, s => ({ ...s, curves: s.points.map(() => smooth) }));
      return;
    }
    updateShape(shape.id, s => ({ ...s, curves: toggleCurveFlag(s.curves, selectedVertex, s.points.length) }));
  };

  const selectedShapeCurved = (() => {
    const shape = data.shapes.find(s => s.id === selected);
    if (!shape) return false;
    const flags = normalizeFlags(shape.curves, shape.points.length);
    return selectedVertex !== null ? !!flags[selectedVertex] : hasAnyCurve(flags);
  })();

  const commitDraft = (points: { x: number; y: number }[], closed: boolean) => {
    if (points.length < 2) return;
    const shape: SiteShape = {
      id: `${layer}-${Date.now()}`,
      layer,
      points,
      closed: closed && points.length > 2,
      curves: points.map(() => false),
    };
    onChange({ ...data, shapes: [...data.shapes, shape] });
    setDraft([]);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const raw = toLocal(e);
    if (mode === 'underlay' && underlay && !underlay.locked) {
      drag.current = { kind: 'underlay', last: raw };
      return;
    }
    if (e.altKey || e.button === 2) {
      const vertex = hitVertex(raw);
      if (vertex) {
        removeVertexFrom(vertex.shapeId, vertex.index);
        return;
      }
      if (insertVertexNear({ x: snap(raw.x), y: snap(raw.y) })) return;
    }
    if (mode !== 'select') return;
    const vertex = hitVertex(raw);
    if (vertex) {
      setSelected(vertex.shapeId);
      setSelectedVertex(vertex.index);
      drag.current = { kind: 'vertex', ...vertex };
      return;
    }
    const shapeId = hitTest(raw);
    setSelected(shapeId);
    setSelectedVertex(null);
    if (shapeId) drag.current = { kind: 'shape', shapeId, last: raw };
  };


  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const raw = toLocal(e);
    const active = drag.current;
    if (active) {
      if (active.kind === 'underlay' && underlay) {
        const dx = raw.x - active.last.x;
        const dy = raw.y - active.last.y;
        active.last = raw;
        onChange({ ...data, underlay: { ...underlay, x: underlay.x + dx, y: underlay.y + dy } });
        return;
      }
      if (active.kind === 'vertex') {
        const p = { x: snap(raw.x), y: snap(raw.y) };
        onChange({
          ...data,
          shapes: data.shapes.map(s =>
            s.id === active.shapeId ? { ...s, points: s.points.map((pt, i) => (i === active.index ? p : pt)) } : s
          ),
        });
        return;
      }
      if (active.kind === 'shape') {
        const dx = raw.x - active.last.x;
        const dy = raw.y - active.last.y;
        active.last = raw;
        onChange({
          ...data,
          shapes: data.shapes.map(s =>
            s.id === active.shapeId ? { ...s, points: s.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) } : s
          ),
        });
        return;
      }
    }
    if (mode === 'calibrate' && calibration.length === 1) {
      setHover(raw);
      return;
    }
    if (mode !== 'draw' || !draft.length) return;
    setHover({ x: snap(raw.x), y: snap(raw.y) });
  };

  const endDrag = () => {
    drag.current = null;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const raw = toLocal(e);
    if (mode === 'underlay') return;
    if (mode === 'calibrate') {
      const next = [...calibration, raw];
      if (next.length < 2) {
        setCalibration(next);
        return;
      }
      const px = Math.hypot(next[1].x - next[0].x, next[1].y - next[0].y);
      const answer = window.prompt(
        'Known real-world length of that line, in feet (a dimension on the imported sheet, a property line, etc.):',
        '20'
      );
      setCalibration([]);
      setHover(null);
      const ft = Number(answer);
      if (!answer || !Number.isFinite(ft) || ft <= 0 || px < 4) return;
      onChange({ ...data, pxPerFt: +(px / ft).toFixed(3) });
      setMode('draw');
      return;
    }
    if (mode === 'select') return;
    const p = { x: snap(raw.x), y: snap(raw.y) };
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
    if (readOnly || mode !== 'draw') return;
    if (draft.length >= 2) commitDraft(draft, layerMeta(layer).linear ? false : true);
  };

  const deleteSelected = () => {
    if (!selected) return;
    onChange({ ...data, shapes: data.shapes.filter(s => s.id !== selected) });
    setSelected(null);
  };

  const assignSelectedLayer = (id: SiteLayerId) => {
    if (!selected) return;
    onChange({
      ...data,
      shapes: data.shapes.map(s => (s.id === selected ? { ...s, layer: id, closed: layerMeta(id).linear ? false : s.closed } : s)),
    });
  };

  React.useEffect(() => {
    if (readOnly) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraft([]);
        setCalibration([]);
      }
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
  const selectedShape = data.shapes.find(s => s.id === selected);

  const setUnderlay = (patch: Partial<SiteUnderlay>) => {
    if (!underlay) return;
    onChange({ ...data, underlay: { ...underlay, ...patch } });
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="space-y-2">
          {header && (
            <div className="rounded-xl border border-border/60 bg-background/60 p-3 backdrop-blur-md">{header}</div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {SITE_LAYERS.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setLayer(l.id);
                    if (selected) assignSelectedLayer(l.id);
                    else {
                      setMode('draw');
                      setDraft([]);
                    }
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
              {onRequestImport ? (
                <Button type="button" size="sm" variant="outline" onClick={onRequestImport}>
                  <ImageIcon className="mr-1 h-3.5 w-3.5" /> Import plan
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant={mode === 'select' ? 'default' : 'outline'}
                onClick={() => setMode(mode === 'select' ? 'draw' : 'select')}
              >
                {mode === 'select' ? <MousePointer2 className="mr-1 h-3.5 w-3.5" /> : <PenLine className="mr-1 h-3.5 w-3.5" />}
                {mode === 'select' ? 'Select' : 'Draw'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'calibrate' ? 'default' : 'outline'}
                onClick={() => {
                  setCalibration([]);
                  setMode(mode === 'calibrate' ? 'draw' : 'calibrate');
                }}
                title="Set the drawing scale from a known dimension"
              >
                <Ruler className="mr-1 h-3.5 w-3.5" /> Calibrate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addVertexAfterSelected}
                disabled={!selected || selectedVertex === null}
                title="Add a point after the selected one (or Alt-click a line to insert)"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Point
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selectedShapeCurved ? 'default' : 'outline'}
                onClick={toggleSelectedCurve}
                disabled={!selected}
                title="Toggle curvature on the selected point (or the whole shape)"
              >
                <Spline className="mr-1 h-3.5 w-3.5" /> {selectedShapeCurved ? 'Curved' : 'Straight'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => selected && selectedVertex !== null && removeVertexFrom(selected, selectedVertex)}
                disabled={!selected || selectedVertex === null}
                title="Remove the selected point"
              >
                <Minus className="h-3.5 w-3.5" />
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
                onClick={() => onChange({ ...data, pxPerFt: Math.min(24, +(data.pxPerFt + 0.5).toFixed(1)) })}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {underlay ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-[11px]">
              <span className="font-medium">Underlay: {underlay.label}</span>
              <Button
                type="button"
                size="sm"
                variant={mode === 'underlay' ? 'default' : 'outline'}
                onClick={() => setMode(mode === 'underlay' ? 'draw' : 'underlay')}
                disabled={underlay.locked}
              >
                <Move className="mr-1 h-3.5 w-3.5" /> Position
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setUnderlay({ visible: !underlay.visible })}>
                {underlay.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </Button>
              <label className="flex items-center gap-1.5">
                Opacity
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={underlay.opacity}
                  onChange={e => setUnderlay({ opacity: Number(e.target.value) })}
                  className="w-24"
                />
              </label>
              <label className="flex items-center gap-1.5">
                Scale
                <input
                  type="range"
                  min={0.05}
                  max={3}
                  step={0.01}
                  value={underlay.scale}
                  onChange={e => setUnderlay({ scale: Number(e.target.value) })}
                  className="w-28"
                />
                <span className="w-10 font-mono">{underlay.scale.toFixed(2)}x</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={underlay.locked} onChange={e => setUnderlay({ locked: e.target.checked })} />
                Lock
              </label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange({ ...data, underlay: undefined })}
                className="text-destructive"
              >
                Remove
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleClick}
        onDoubleClick={handleDouble}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onContextMenu={e => e.preventDefault()}

        onMouseUp={endDrag}
        onMouseLeave={() => {
          endDrag();
          setHover(null);
        }}
        className="mx-auto block rounded-md border border-border bg-white"
        style={{
          /* the bitmap is CANVAS_W x CANVAS_H, so the element must always be laid
             out at that exact ratio — otherwise the drawing shears */
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          width: '100%',
          height: 'auto',
          /* react-pageflip forces `position:absolute` on every canvas inside the
             flipbook; declared inline so the board stays in the page flow */
          position: 'relative',
          /* a requested height becomes a width cap so the ratio is never broken */
          maxWidth: height ? Math.round((height * CANVAS_W) / CANVAS_H) : undefined,

          cursor: readOnly
            ? 'default'
            : mode === 'select'
              ? 'pointer'
              : mode === 'underlay'
                ? 'move'
                : 'crosshair',
        }}

      />

      {!readOnly && (
        <p className="text-[11px] text-muted-foreground">
          {mode === 'calibrate'
            ? 'Click two points with a known distance on the imported sheet, then type the real length in feet to set the scale.'
            : mode === 'underlay'
              ? 'Drag the imported sheet to position it, then use Scale and Calibrate so the drawing matches real dimensions.'
              : mode === 'select'
                ? 'Drag a corner to reshape, drag a line to move the whole element, click a layer chip to reassign it, Delete to remove.'
                : 'Click to place corners, click the first corner (or press Enter / double-click) to close the shape.'}{' '}
          Drawn: {areas.propertySqFt.toLocaleString()} SF lot &middot; {areas.imperviousSqFt.toLocaleString()} SF impervious (
          {areas.imperviousPct}%) &middot; {areas.fenceLinearFt} LF barrier.
          {selectedShape ? ` Selected: ${layerMeta(selectedShape.layer).label}${selectedShape.importedFrom ? ` (imported from ${selectedShape.importedFrom})` : ''}.` : ''}
        </p>
      )}
    </div>
  );
};

export default SiteDrawingBoard;
