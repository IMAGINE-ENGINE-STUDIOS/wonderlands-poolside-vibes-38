import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Undo2,
  Trash2,
  Eraser,
  RotateCcw,
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
import { TRADE_LAYERS, tradeFeaturePrice, solarPanelsForArea } from '@/lib/design/siteTradeLayers';

/**
 * Toggle one additional feature on a layer. Options that belong to the same
 * `exclusive` family (a paver surface, a fence height, a screen mesh) behave as
 * a single choice, exactly like the standalone configurators.
 */
const applyFeatureToggle = (layer: string, current: string[], featureId: string): string[] => {
  const spec = TRADE_LAYERS[layer];
  const feature = spec?.features.find(f => f.id === featureId);
  if (current.includes(featureId)) return current.filter(f => f !== featureId);
  const siblings = feature?.exclusive
    ? new Set(spec!.features.filter(f => f.exclusive === feature.exclusive).map(f => f.id))
    : null;
  const kept = siblings ? current.filter(id => !siblings.has(id)) : current;
  return [...kept, featureId];
};



export type SiteLayerId =
  | 'property'
  | 'building'
  | 'driveway'
  | 'patio'
  | 'pool'
  | 'spa'
  | 'ledge'
  | 'deck'
  | 'enclosure'
  | 'turf'
  | 'solar'
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
  /** Stroke pattern — each trade keeps its own spline signature on the sheet */
  dash?: number[];
  /** Diagonal hatch inside the shape (cage roofs, solar planes, turf fields) */
  hatch?: boolean;
}

export const SITE_LAYERS: SiteLayerMeta[] = [
  { id: 'property', label: 'Property boundary', color: '#111827', impervious: false, dash: [10, 4, 2, 4] },
  { id: 'building', label: 'Building / residence', color: '#6b7280', impervious: true },
  { id: 'driveway', label: 'Driveway', color: '#9ca3af', impervious: true },
  { id: 'patio', label: 'Conc. patio / AC pad', color: '#78716c', impervious: true },
  { id: 'pool', label: 'Pool / spa', color: '#0891b2', impervious: true },
  { id: 'spa', label: 'Spa / hot tub', color: '#0e7490', impervious: true, dash: [7, 3] },
  { id: 'ledge', label: 'Tanning ledge', color: '#38bdf8', impervious: true, dash: [3, 3] },
  { id: 'deck', label: 'Paver deck', color: '#f97066', impervious: true },
  { id: 'enclosure', label: 'Screen enclosure / lanai', color: '#334155', impervious: false, dash: [12, 5], hatch: true },
  { id: 'turf', label: 'Artificial turf', color: '#4d7c0f', impervious: false, hatch: true },
  { id: 'solar', label: 'Solar array', color: '#f59e0b', impervious: false, dash: [9, 4], hatch: true },
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
  /** Additional features selected on this element (see TRADE_LAYERS) */
  features?: string[];
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

/**
 * Default view height in real feet. 50 ft read far too small — a 14 ft pool was
 * a thumbnail on the sheet. 28 ft top to bottom puts a pool, its deck and the
 * dimensions at a workable drafting scale (~1/2" = 1'-0" on screen).
 */
export const DEFAULT_VIEW_HEIGHT_FT = 28;
export const DEFAULT_PX_PER_FT = +(CANVAS_H / DEFAULT_VIEW_HEIGHT_FT).toFixed(2); // 25.7 px/ft

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
  /**
   * Puts every control in a menu column on the right of the canvas instead of a
   * tag strip above it — used on the FLIP dossier boards.
   */
  menuSide?: boolean;
}

/**
 * Architect-style 2D site plan board. Draw the property boundary, the
 * residence, hardscape and the pool on a scaled grid; every polygon feeds the
 * impervious area table on sheet A1. Imported PDF/JPG sheets sit behind the
 * grid as a calibratable underlay so an existing blueprint can be traced and
 * then edited like native geometry.
 */
export const SiteDrawingBoard: React.FC<Props> = ({ data, onChange, onSnapshot, readOnly, height, onRequestImport, header, defaultLayer, menuSide }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [imgReady, setImgReady] = React.useState(0);
  const [layer, setLayer] = React.useState<SiteLayerId>(defaultLayer ?? 'property');
  /* Additional features armed per trade before anything is drawn — the options
     of the armed element are always on screen, not hidden behind a selection. */
  const [armedFeatures, setArmedFeatures] = React.useState<Partial<Record<SiteLayerId, string[]>>>({});
  /* Host page may offer a project column for the options drawers */
  const [optionsSlot, setOptionsSlot] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setOptionsSlot(typeof document === 'undefined' ? null : document.getElementById('wl-board-options'));
  }, []);

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

    /* ULTRA HIGH-RES, CHEAP: the drawing logic keeps working in logical
       CANVAS_W x CANVAS_H units, but the bitmap is allocated at the device
       pixel ratio (capped at 2 so large 4K screens don't pay for a 3x buffer).
       Everything below then renders crisp with zero extra draw calls. */
    const dpr = Math.min(2, Math.max(1, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1));
    const bw = Math.round(CANVAS_W * dpr);
    const bh = Math.round(CANVAS_H * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
      /* Each trade keeps its own spline signature: cages and arrays are hatched
         planes, spa and ledge shells are dashed, the lot line stays chain-dot. */
      if (shape.closed && meta.hatch && !isDraft && outline.length > 2) {
        /* Trade hatch, cut exactly to the polygon: each hatch line is trimmed by
           its real intersections with the outline (cheap scanline, no clipping
           state, so it stays crisp at any device pixel ratio). */
        const ys = outline.map(p => p.y);
        const xs = outline.map(p => p.x);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const span = maxY - minY;
        const step = meta.id === 'solar' ? Math.max(10, pxPerFt * 3.4) : Math.max(8, pxPerFt * 1.5);
        ctx.strokeStyle = meta.color + (meta.id === 'solar' ? '66' : '44');
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        // Hatch direction is 45°: y = x - c, i.e. c = x - y.
        for (let c = minX - maxY; c <= maxX - minY; c += step) {
          const hits: { x: number; y: number }[] = [];
          for (let i = 0; i < outline.length; i++) {
            const a = outline[i];
            const b = outline[(i + 1) % outline.length];
            // Solve for t where (a + t(b-a)).x - (a + t(b-a)).y === c
            const den = (b.x - a.x) - (b.y - a.y);
            if (Math.abs(den) < 1e-6) continue;
            const t = (c - (a.x - a.y)) / den;
            if (t < 0 || t > 1) continue;
            hits.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
          }
          if (hits.length < 2) continue;
          hits.sort((u, v) => u.y - v.y);
          for (let i = 0; i + 1 < hits.length; i += 2) {
            ctx.moveTo(hits[i].x, hits[i].y);
            ctx.lineTo(hits[i + 1].x, hits[i + 1].y);
          }
        }
        ctx.stroke();
        void span;
      }
      ctx.strokeStyle = selected === shape.id ? '#f59e0b' : meta.color;
      ctx.lineWidth = selected === shape.id ? 3 : meta.id === 'property' ? 2.5 : 2;
      ctx.setLineDash(isDraft ? [6, 4] : meta.dash ?? []);
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

      /* Segment dimensions — architectural convention: the figure rides ON the
         run itself, rotated to the line and centred at its true midpoint, with
         a knockout halo so the line reads through. Corners stay clean. */
      ctx.font = '600 13px ui-monospace, monospace';
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
        if (ft < 2 || chord < 24) continue;

        /* true midpoint of the run — half the arc length along the samples */
        let mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        let dir = { x: (b.x - a.x) / chord, y: (b.y - a.y) / chord };
        if (curved && segPts.length > 1) {
          const half = len / 2;
          let walked = 0;
          for (let k = 1; k < segPts.length; k++) {
            const p0 = segPts[k - 1];
            const p1 = segPts[k];
            const d = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1e-6;
            if (walked + d >= half) {
              const t = (half - walked) / d;
              mid = { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
              dir = { x: (p1.x - p0.x) / d, y: (p1.y - p0.y) / d };
              break;
            }
            walked += d;
          }
        }

        /* keep the figure upright — never read upside down */
        let angle = Math.atan2(dir.y, dir.x);
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;

        const text = `${ft.toFixed(1)}'`;
        ctx.save();
        ctx.translate(mid.x, mid.y);
        ctx.rotate(angle);
        const w = ctx.measureText(text).width;
        /* knock the run out behind the figure so the dimension sits in the line */
        ctx.fillStyle = 'rgba(255,255,255,0.94)';
        ctx.fillRect(-w / 2 - 4, -7.5, w + 8, 15);
        ctx.fillStyle = '#0f172a';
        ctx.fillText(text, 0, 0.5);
        ctx.restore();
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
      /* features armed on the trade before drawing carry onto the element */
      features: armedFeatures[layer]?.length ? [...armedFeatures[layer]] : undefined,
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

  /** Erase the whole drawing — geometry, imported sheet, draft and selection. */
  const resetProject = () => {
    if (typeof window !== 'undefined' && (data.shapes.length || underlay)) {
      if (!window.confirm('Erase this drawing and start the project over? This cannot be undone.')) return;
    }
    setDraft([]);
    setCalibration([]);
    setSelected(null);
    setSelectedVertex(null);
    onChange({ ...data, shapes: [], underlay: undefined });
  };


  const assignSelectedLayer = (id: SiteLayerId) => {
    if (!selected) return;
    onChange({
      ...data,
      shapes: data.shapes.map(s => (s.id === selected ? { ...s, layer: id, closed: layerMeta(id).linear ? false : s.closed } : s)),
    });
  };

  /** Toggle one additional feature on the selected element. */
  const toggleSelectedFeature = (featureId: string) => {
    if (!selected) return;
    onChange({
      ...data,
      shapes: data.shapes.map(s => {
        if (s.id !== selected) return s;
        return { ...s, features: applyFeatureToggle(s.layer, s.features ?? [], featureId) };
      }),
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

  /* ── console styling ──────────────────────────────────────────────────────
     Same language as the Latham / GlimmerGlass gateways in the FLIP edition:
     hairline glass panes, letter-spaced micro caps, a rule that sweeps in on
     hover and a full invert when the control is engaged. */
  const CTRL =
    'group relative inline-flex items-center gap-1.5 overflow-hidden rounded-sm border px-3 py-1.5 text-[9px] uppercase tracking-[0.26em] backdrop-blur-md transition-all duration-500 disabled:pointer-events-none disabled:opacity-35';
  const CTRL_OFF = 'border-border/50 bg-foreground/[0.035] text-muted-foreground hover:border-foreground/70 hover:text-foreground';
  const CTRL_ON = 'border-foreground bg-foreground text-background';
  const sweep = (
    <span aria-hidden className="absolute bottom-0 left-0 h-px w-0 bg-foreground transition-all duration-500 group-hover:w-full" />
  );

  const ctrl = (
    label: React.ReactNode,
    opts: { on?: boolean; onClick: () => void; disabled?: boolean; title?: string; danger?: boolean },
  ) => (
    <button
      type="button"
      onClick={opts.onClick}
      disabled={opts.disabled}
      title={opts.title}
      className={`${CTRL} ${opts.on ? CTRL_ON : CTRL_OFF} ${opts.danger && !opts.on ? 'hover:border-destructive hover:text-destructive' : ''}`}
    >
      {label}
      {!opts.on && sweep}
    </button>
  );

  const layerTags = (
    <div className="flex flex-wrap gap-1.5">
      {SITE_LAYERS.map(l => {
        const on = layer === l.id && mode === 'draw';
        return (
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
            className={`${CTRL} ${on ? CTRL_ON : CTRL_OFF}`}
          >
            <span
              className="h-2 w-2 rounded-full ring-1 ring-inset ring-black/10"
              style={{ background: l.color }}
            />
            {l.label}
            {!on && sweep}
          </button>
        );
      })}
    </div>
  );

  const toolButtons = (
    <div className={menuSide ? 'flex flex-wrap items-center gap-1.5' : 'ml-auto flex flex-wrap items-center gap-1.5'}>
      {onRequestImport
        ? ctrl(
            <>
              <ImageIcon className="h-3.5 w-3.5" /> Import plan
            </>,
            { onClick: onRequestImport },
          )
        : null}
      {ctrl(
        <>
          {mode === 'select' ? <MousePointer2 className="h-3.5 w-3.5" /> : <PenLine className="h-3.5 w-3.5" />}
          {mode === 'select' ? 'Select' : 'Draw'}
        </>,
        { on: mode === 'select', onClick: () => setMode(mode === 'select' ? 'draw' : 'select') },
      )}
      {ctrl(
        <>
          <Ruler className="h-3.5 w-3.5" /> Calibrate
        </>,
        {
          on: mode === 'calibrate',
          title: 'Set the drawing scale from a known dimension',
          onClick: () => {
            setCalibration([]);
            setMode(mode === 'calibrate' ? 'draw' : 'calibrate');
          },
        },
      )}
      {ctrl(
        <>
          <Plus className="h-3.5 w-3.5" /> Point
        </>,
        {
          onClick: addVertexAfterSelected,
          disabled: !selected || selectedVertex === null,
          title: 'Add a point after the selected one (or Alt-click a line to insert)',
        },
      )}
      {ctrl(
        <>
          <Spline className="h-3.5 w-3.5" /> {selectedShapeCurved ? 'Curved' : 'Straight'}
        </>,
        {
          on: selectedShapeCurved,
          onClick: toggleSelectedCurve,
          disabled: !selected,
          title: 'Toggle curvature on the selected point (or the whole shape)',
        },
      )}
      {ctrl(<Minus className="h-3.5 w-3.5" />, {
        onClick: () => selected && selectedVertex !== null && removeVertexFrom(selected, selectedVertex),
        disabled: !selected || selectedVertex === null,
        title: 'Remove the selected point',
      })}
      {ctrl(<Undo2 className="h-3.5 w-3.5" />, {
        onClick: () => setDraft(p => p.slice(0, -1)),
        disabled: !draft.length,
        title: 'Undo the last placed corner',
      })}
      {ctrl(<Eraser className="h-3.5 w-3.5" />, {
        onClick: deleteSelected,
        disabled: !selected,
        danger: true,
        title: 'Erase the selected element',
      })}
      {ctrl(
        <>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </>,
        {
          onClick: resetProject,
          disabled: !data.shapes.length && !draft.length && !underlay,
          danger: true,
          title: 'Erase everything and start the project over',
        },
      )}
      {ctrl(<Grid3X3 className="h-3.5 w-3.5" />, { on: showGrid, onClick: () => setShowGrid(g => !g), title: 'Grid' })}
      {ctrl(<ZoomOut className="h-3.5 w-3.5" />, {
        onClick: () => onChange({ ...data, pxPerFt: Math.max(1, +(data.pxPerFt - 0.5).toFixed(1)) }),
        title: 'Zoom out',
      })}
      <span className="w-20 text-center text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {data.pxPerFt} px/ft
      </span>
      {ctrl(<ZoomIn className="h-3.5 w-3.5" />, {
        onClick: () => onChange({ ...data, pxPerFt: Math.min(24, +(data.pxPerFt + 0.5).toFixed(1)) }),
        title: 'Zoom in',
      })}
    </div>
  );


  /* ── element options ──────────────────────────────────────────────────────
     Selecting an element opens its own option drawer straight away: what it is,
     its measured size, its geometry controls and its additional features. The
     same selection is broadcast so the discipline's dossier opens on its
     options tab, exactly like the boards inside the FLIP edition. */
  const selectedMeasure = React.useMemo(() => {
    if (!selectedShape) return null;
    const pts = selectedShape.points;
    const lenFt = polylineLength(pts, selectedShape.closed) / data.pxPerFt;
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      a += p.x * q.y - q.x * p.y;
    }
    const sqFt = Math.abs(a / 2) / (data.pxPerFt * data.pxPerFt);
    return { lenFt: Math.round(lenFt), sqFt: Math.round(sqFt), points: pts.length };
  }, [selectedShape, data.pxPerFt]);

  React.useEffect(() => {
    if (!selectedShape || typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('wl:board-element-selected', {
        detail: { layer: selectedShape.layer, label: layerMeta(selectedShape.layer).label },
      }),
    );
  }, [selectedShape?.id, selectedShape?.layer]);

  const tradeSpec = selectedShape ? TRADE_LAYERS[selectedShape.layer] : undefined;
  const selectedFeatureCost =
    selectedShape && selectedMeasure
      ? tradeFeaturePrice(selectedShape.layer, selectedShape.features, selectedMeasure.sqFt, selectedMeasure.lenFt)
      : 0;

  /* Every catalogued option, filed under its heading, priced exactly as the
     configurators and the FLIP book price it. Long catalogues (the paver book,
     the fence book) scroll inside the drawer instead of pushing the board down. */
  const featureChips = (
    spec: (typeof TRADE_LAYERS)[string],
    activeIds: string[],
    onToggle: (id: string) => void,
  ) => {
    const groups: { name: string; items: typeof spec.features }[] = [];
    spec.features.forEach(f => {
      const name = f.group ?? 'Options';
      const bucket = groups.find(g => g.name === name);
      if (bucket) bucket.items.push(f);
      else groups.push({ name, items: [f] });
    });
    return (
      <div className="mt-1.5 max-h-[46vh] space-y-2 overflow-y-auto pr-1">
        {groups.map(g => (
          <div key={g.name}>
            <p className="text-[8.5px] uppercase tracking-[0.26em] text-muted-foreground/80">{g.name}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {g.items.map(f => (
                <span key={f.id} className="contents">
                  {ctrl(
                    <>
                      {f.label}
                      {f.perSqFt ? <span className="opacity-60">+${f.perSqFt}/sf</span> : null}
                      {f.perLinearFt ? <span className="opacity-60">+${f.perLinearFt}/lf</span> : null}
                      {f.flat ? <span className="opacity-60">+${f.flat.toLocaleString()}</span> : null}
                    </>,
                    { on: activeIds.includes(f.id), onClick: () => onToggle(f.id), title: f.hint },
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };


  const elementOptions =
    !readOnly && selectedShape ? (
      <div className="rounded-2xl border border-border/50 bg-foreground/[0.03] p-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: layerMeta(selectedShape.layer).color }} />
            {layerMeta(selectedShape.layer).label}
          </span>
          {selectedMeasure ? (
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {layerMeta(selectedShape.layer).linear
                ? `${selectedMeasure.lenFt} LF`
                : `${selectedMeasure.sqFt.toLocaleString()} SF · ${selectedMeasure.lenFt} LF perimeter`}{' '}
              · {selectedMeasure.points} points
            </span>
          ) : null}
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {ctrl(
              <>
                <Spline className="h-3.5 w-3.5" /> {selectedShapeCurved ? 'Curved' : 'Straight'}
              </>,
              { on: selectedShapeCurved, onClick: toggleSelectedCurve },
            )}
            {ctrl(
              <>
                <Plus className="h-3.5 w-3.5" /> Point
              </>,
              { onClick: addVertexAfterSelected, disabled: selectedVertex === null },
            )}
            {ctrl(<Minus className="h-3.5 w-3.5" />, {
              onClick: () => selectedVertex !== null && removeVertexFrom(selectedShape.id, selectedVertex),
              disabled: selectedVertex === null,
            })}
            {ctrl(
              <>
                <Eraser className="h-3.5 w-3.5" /> Erase
              </>,
              { onClick: deleteSelected, danger: true },
            )}
          </div>
        </div>
        {tradeSpec ? (
          <div className="mt-2 border-t border-border/50 pt-2">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Additional features</p>
              {tradeSpec.rate ? (
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  ${tradeSpec.rate}/sq ft base
                </span>
              ) : null}
              {tradeSpec.linearRate ? (
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  ${tradeSpec.linearRate}/lf base
                </span>
              ) : null}
              {selectedShape.layer === 'solar' && selectedMeasure ? (
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {solarPanelsForArea(selectedMeasure.sqFt)} panels fit
                </span>
              ) : null}
              {selectedFeatureCost > 0 ? (
                <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-foreground">
                  +${Math.round(selectedFeatureCost).toLocaleString()} options
                </span>
              ) : null}
            </div>
            {featureChips(tradeSpec, selectedShape.features ?? [], toggleSelectedFeature)}

            {tradeSpec.note ? (
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{tradeSpec.note}</p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-2 border-t border-border/50 pt-2 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
          Reassign this element
        </p>
        <div className="mt-1.5">{layerTags}</div>
      </div>
    ) : null;

  /* ── armed trade options ──────────────────────────────────────────────────
     Before anything is drawn the armed trade still shows its own rate sheet and
     its additional features, exactly as it does on its own drawing board. What
     is switched on here is carried onto the next element traced on that layer. */
  const armedSpec = TRADE_LAYERS[layer];
  const armedOn = armedFeatures[layer] ?? [];
  const armedOptions =
    !readOnly && !selectedShape && armedSpec ? (
      <div className="rounded-2xl border border-border/50 bg-foreground/[0.03] p-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: layerMeta(layer).color }} />
            {layerMeta(layer).label} — additional features
          </span>
          {armedSpec.rate ? (
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              ${armedSpec.rate}/sq ft base
            </span>
          ) : null}
          {armedSpec.linearRate ? (
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              ${armedSpec.linearRate}/lf base
            </span>
          ) : null}
          <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Armed for the next element
          </span>
        </div>
        {featureChips(armedSpec, armedOn, id =>
          setArmedFeatures(prev => ({ ...prev, [layer]: applyFeatureToggle(layer, prev[layer] ?? [], id) })),
        )}

        {armedSpec.note ? (
          <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{armedSpec.note}</p>
        ) : null}
      </div>
    ) : null;



  const underlayBar =

          underlay ? (
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
          ) : null;

  const canvasEl = (
      <canvas
        ref={canvasRef}
        /* bitmap size is owned by draw() (device-pixel-ratio aware) */

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
  );

  const footNote = !readOnly ? (
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
  ) : null;

  /* The options drawers are rendered into the page's project column when one is
     offered (`#wl-board-options`, as on the Global Design Board), so the drawing
     keeps the full width of the leaf. Without a slot they stay under the board. */
  const optionPanels = (
    <>
      {elementOptions}
      {armedOptions}
    </>
  );
  const optionsInline = optionsSlot ? null : optionPanels;
  const optionsPortal = optionsSlot ? createPortal(optionPanels, optionsSlot) : null;

  /* FLIP dossier layout — the drawing takes the full width of the leaf and every
     control lives in a glass console docked BELOW the canvas, so the board is as
     wide as the page allows instead of losing a column to a sidebar. */
  if (menuSide) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-2.5">
        {header}
        {canvasEl}
        {optionsInline}
        {optionsPortal}
        {underlayBar}


        {!readOnly && (
          <div className="rounded-2xl border border-border/50 bg-background/55 p-2.5 shadow-[0_18px_50px_-34px_rgba(8,12,24,0.55)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">Elements</span>
              {layerTags}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/50 pt-2">
              <span className="text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">Tools</span>
              {toolButtons}
            </div>
          </div>
        )}
        {footNote}
      </div>
    );
  }


  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="space-y-2">
          {header && (
            <div className="rounded-xl border border-border/60 bg-background/60 p-3 backdrop-blur-md">{header}</div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {layerTags}
            {toolButtons}
          </div>
          {underlayBar}
        </div>
      )}
      {canvasEl}
      {optionsInline}
      {optionsPortal}

      {footNote}
    </div>
  );
};

export default SiteDrawingBoard;
