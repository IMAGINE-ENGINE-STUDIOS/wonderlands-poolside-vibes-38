import { boardAltitudeFtOr, setBoardAltitudeFt } from '@/lib/design/boardAltitude';
import * as React from 'react';
import { createPortal } from 'react-dom';

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
  Maximize2,
  Scissors,
  CircleDot,
  CornerUpRight,


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
import {
  arcMetrics,
  arcMidpoint,
  bulgeForRadius,
  bulgeFromPoint,
  hasCurvature,
  readSpec,
  samplePathAdvanced,
  sampleSegmentAdvanced,
  segmentCount,
  segmentKind,
  segmentLength,
  withValueAt,
  MAX_BULGE,
  DEFAULT_TENSION,
} from '@/lib/design/curvature';
import {
  CROPPABLE_LAYERS,
  cropRing,
  cropRings,
  cutsThrough,
  netArea,
  type CroppedShape,
} from '@/lib/design/shapeCrop';
import { TRADE_LAYERS, tradeFeaturePrice, solarPanelsForArea, type TradeFeature } from '@/lib/design/siteTradeLayers';

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
  /**
   * Architect curvature. A segment is a TRUE CIRCULAR ARC when `arcs[i]` is set
   * (signed bulge = sagitta ÷ chord, exactly like a DXF bulge), a corner is
   * rounded by a tangent fillet of `fillets[i]` px, and spline runs bend with
   * `tension[i]`. See `@/lib/design/curvature`.
   */
  arcs?: number[];
  fillets?: number[];
  tension?: number[];
  /** Opt this element out of the cropping engine (draw it uncut). */
  noCrop?: boolean;
  /** Additional features selected on this element (see TRADE_LAYERS) */
  features?: string[];
  /** Set when the shape came from an imported PDF/DXF/SVG plan */
  importedFrom?: string;
}

/**
 * Curve-aware outline used for rendering and all measurements — arcs, tangent
 * fillets and tensioned splines resolved into one polyline. Every consumer
 * (canvas, hatch, area, perimeter, price, export) reads this, so the drawing and
 * the estimate can never disagree.
 */
export const siteShapeOutline = (shape: SiteShape) =>
  hasCurvature(shape, shape.points.length)
    ? samplePathAdvanced(shape.points, shape.closed, shape)
    : shape.points;

/**
 * True overlap logic. A pool, spa, ledge or building dropped on a paver deck or
 * a turf field CUTS it: the sheet paints the hole and the SF printed on the
 * element is the net field the crew installs.
 */
export const croppedSiteShape = (shape: SiteShape, all: SiteShape[]): CroppedShape => {
  const outline = siteShapeOutline(shape);
  if (!shape.closed || shape.noCrop || !CROPPABLE_LAYERS.has(shape.layer) || outline.length < 3) {
    return [[outline]];
  }
  const cutters = all
    .filter(o => o.id !== shape.id && o.closed && o.points.length > 2 && cutsThrough(o.layer, shape.layer))
    .map(siteShapeOutline);
  return cropRing(outline, cutters);
};

/**
 * The surface option selected on an element — the paver on a deck, the blade on
 * a turf field, the finish on a pool. It is the option that must be *visible* on
 * the sheet, so the board paints the element with its real catalogue photograph
 * instead of a flat colour. Exclusive options win (a surface is one choice).
 */
export const shapeSurfaceFeature = (shape: SiteShape): TradeFeature | undefined => {
  const spec = TRADE_LAYERS[shape.layer];
  if (!spec || !shape.features?.length) return undefined;
  const picked = shape.features
    .map(id => spec.features.find(f => f.id === id))
    .filter((f): f is TradeFeature => !!f && !!f.image);
  return picked.find(f => f.exclusive) ?? picked[0];
};

/* Catalogue photographs used as canvas fills, loaded once and shared by every
   board on the page. `crossOrigin` keeps the sheet exportable (toDataURL). */
const surfaceImages = new Map<string, HTMLImageElement>();
const surfaceLoading = new Set<string>();
const surfaceImage = (src: string, onLoad: () => void): HTMLImageElement | null => {
  const hit = surfaceImages.get(src);
  if (hit) return hit;
  if (!surfaceLoading.has(src)) {
    surfaceLoading.add(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      surfaceImages.set(src, img);
      surfaceLoading.delete(src);
      onLoad();
    };
    img.onerror = () => surfaceLoading.delete(src);
    img.src = src;
  }
  return null;
};

/** Is a point inside the polygon? Lets a click anywhere on the deck select it. */
const pointInPolygon = (pts: { x: number; y: number }[], p: { x: number; y: number }) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y || 1e-9) + a.x) inside = !inside;
  }
  return inside;
};



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

/**
 * Default camera altitude, in real feet of frontage across the sheet.
 *
 * This board is used above all to lay out pools and the patio around them. A
 * 16 x 36 shell with a generous 12 ft deck on every side measures about 60 x 40
 * ft, so 70 ft across (about 43 ft deep on this sheet) opens with the whole
 * pool-and-patio composition on the paper, dimensions legible, and still leaves
 * room to draw. Whole-lot work — the 160 ft frontages and 400 ft depths our
 * customers own — is one press of Fit away, and the camera the customer leaves
 * behind is remembered for every board.
 */
export const DEFAULT_VIEW_WIDTH_FT = 70;
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

/**
 * Board tools. `point` is the architect's insert-vertex tool: a ghost point
 * rides the outline under the cursor, sliding along the spline, and clicking
 * drops the new vertex exactly where the ghost sits.
 */
type Mode = 'draw' | 'select' | 'underlay' | 'calibrate' | 'point';

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
  /**
   * How much land the camera should show across the sheet when the board opens
   * (the Global Design Board asks for 400 ft of frontage). This moves the
   * camera only — the drafting scale, and therefore every drawn dimension,
   * is untouched.
   */
  defaultViewWidthFt?: number;
}


/**
 * Architect-style 2D site plan board. Draw the property boundary, the
 * residence, hardscape and the pool on a scaled grid; every polygon feeds the
 * impervious area table on sheet A1. Imported PDF/JPG sheets sit behind the
 * grid as a calibratable underlay so an existing blueprint can be traced and
 * then edited like native geometry.
 */
export const SiteDrawingBoard: React.FC<Props> = ({ data, onChange, onSnapshot, readOnly, height, onRequestImport, header, defaultLayer, menuSide, defaultViewWidthFt }) => {
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
  /** The run (segment i → i+1) under the curvature inspector. */
  const [selectedSegment, setSelectedSegment] = React.useState<number | null>(null);
  /** True overlap logic: pools, spas, ledges and buildings cut deck and turf. */
  const [cropping, setCropping] = React.useState(true);
  /* Element under the pointer while picking — the sheet lights it up so it is
     obvious that clicking the paver deck opens the paver book for that deck. */
  const [hoverShapeId, setHoverShapeId] = React.useState<string | null>(null);


  const [showGrid, setShowGrid] = React.useState(true);
  const [calibration, setCalibration] = React.useState<{ x: number; y: number }[]>([]);
  /** Ghost vertex riding the outline under the cursor while the point tool is armed. */
  const [insertGhost, setInsertGhost] = React.useState<
    { shapeId: string; segment: number; point: { x: number; y: number } } | null
  >(null);
  const drag = React.useRef<
    | { kind: 'vertex'; shapeId: string; index: number }
    | { kind: 'bulge'; shapeId: string; index: number }
    | { kind: 'shape'; shapeId: string; last: { x: number; y: number } }
    | { kind: 'underlay'; last: { x: number; y: number } }
    | null
  >(null);
  /** Camera pan in progress (middle button or shift-drag), in client pixels. */
  const pan = React.useRef<{ x: number; y: number } | null>(null);


  const underlay = data.underlay;
  const pxPerFt = data.pxPerFt;

  /* ── the camera ──────────────────────────────────────────────────────────
     A real zoom: `z` scales the sheet on screen and `x`/`y` pan it. Drawn
     geometry and the drafting scale are never touched, so a 14 ft pool stays
     14 ft whether the camera shows 20 ft or 800 ft of land. */
  const MIN_Z = 0.04;
  const MAX_Z = 6;
  const [view, setView] = React.useState({ z: 1, x: 0, y: 0 });
  const viewRef = React.useRef(view);
  viewRef.current = view;
  const zoom = view.z;
  const viewWidthFt = CANVAS_W / (pxPerFt * zoom);

  const clampZ = (z: number) => Math.min(MAX_Z, Math.max(MIN_Z, z));

  /** Zoom about a point in screen (sheet) space — the cursor, or the centre. */
  const zoomAt = React.useCallback(
    (factor: number, sx = CANVAS_W / 2, sy = CANVAS_H / 2) => {
      setView(v => {
        const z = clampZ(v.z * factor);
        const k = z / v.z;
        return { z, x: sx - (sx - v.x) * k, y: sy - (sy - v.y) * k };
      });
    },
    [],
  );
  const zoomBy = (factor: number) => zoomAt(factor);

  /* The slider is logarithmic so every notch feels the same at any distance. */
  const zoomSlider = Math.round((Math.log(zoom / MIN_Z) / Math.log(MAX_Z / MIN_Z)) * 200 - 100);
  const setZoomFromSlider = (v: number) =>
    zoomAt(clampZ(MIN_Z * Math.pow(MAX_Z / MIN_Z, (v + 100) / 200)) / zoom);

  /** Frame the drawing — or, on an empty sheet, the requested acreage. */
  const fitView = React.useCallback(() => {
    const pts = data.shapes.flatMap(s => s.points);
    if (!pts.length) {
      const wantFt = defaultViewWidthFt ?? DEFAULT_VIEW_WIDTH_FT;
      const z = clampZ(CANVAS_W / (wantFt * pxPerFt));
      setView({ z, x: (CANVAS_W * (1 - z)) / 2, y: (CANVAS_H * (1 - z)) / 2 });
      return;
    }
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const w = Math.max(40, Math.max(...xs) - Math.min(...xs));
    const h = Math.max(40, Math.max(...ys) - Math.min(...ys));
    const z = clampZ(Math.min((CANVAS_W * 0.86) / w, (CANVAS_H * 0.86) / h));
    setView({
      z,
      x: CANVAS_W / 2 - ((Math.min(...xs) + Math.max(...xs)) / 2) * z,
      y: CANVAS_H / 2 - ((Math.min(...ys) + Math.max(...ys)) / 2) * z,
    });
  }, [data.shapes, defaultViewWidthFt, pxPerFt]);

  /* Open at the altitude the draughtsman last flew at on ANY board, falling
     back to this board's own default width of land (400 ft on the Global Design
     Board) the very first time. */
  const framed = React.useRef(false);
  React.useEffect(() => {
    if (framed.current) return;
    framed.current = true;
    const wantFt = boardAltitudeFtOr(defaultViewWidthFt ?? DEFAULT_VIEW_WIDTH_FT);
    const z = clampZ(CANVAS_W / (wantFt * pxPerFt));
    setView({ z, x: (CANVAS_W * (1 - z)) / 2, y: (CANVAS_H * (1 - z)) / 2 });
  }, [defaultViewWidthFt, pxPerFt]);

  /* Every zoom here becomes the altitude every other board opens at. */
  React.useEffect(() => {
    setBoardAltitudeFt(viewWidthFt);
  }, [viewWidthFt]);

  /* Grid density follows what the camera can actually resolve on screen. */
  const screenPxPerFt = pxPerFt * zoom;
  const gridFt = screenPxPerFt >= 8 ? 1 : screenPxPerFt >= 4 ? 5 : screenPxPerFt >= 1.2 ? 10 : 25;
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

    /* Camera: everything below draws in sheet coordinates and the transform
       moves/scales the paper. Line weights are divided by the zoom where they
       matter so hairlines stay hairlines at any distance. */
    ctx.setTransform(dpr * view.z, 0, 0, dpr * view.z, dpr * view.x, dpr * view.y);
    const hair = 1 / view.z;
    /* Visible sheet window, in sheet units — used to draw only the grid we see. */
    const vx0 = -view.x / view.z;
    const vy0 = -view.y / view.z;
    const vx1 = (CANVAS_W - view.x) / view.z;
    const vy1 = (CANVAS_H - view.y) / view.z;

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
        ctx.setLineDash([8 * hair, 5 * hair]);
        ctx.lineWidth = 2 * hair;
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
      ctx.lineWidth = hair;
      ctx.globalAlpha = underlay?.visible ? 0.5 : 1;
      for (let x = Math.floor(vx0 / step) * step; x <= vx1; x += step) {
        ctx.strokeStyle = Math.abs(x % majorStep) < 0.01 ? '#d4d4d8' : '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(x, vy0);
        ctx.lineTo(x, vy1);
        ctx.stroke();
      }
      for (let y = Math.floor(vy0 / step) * step; y <= vy1; y += step) {
        ctx.strokeStyle = Math.abs(y % majorStep) < 0.01 ? '#d4d4d8' : '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(vx0, y);
        ctx.lineTo(vx1, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }


    const renderShape = (shape: SiteShape, isDraft = false) => {
      const meta = layerMeta(shape.layer);
      if (shape.points.length === 0) return;
      const flags = normalizeFlags(shape.curves, shape.points.length);
      const outline = siteShapeOutline(shape);
      /* The chosen surface — paver, turf blade, pool finish — is painted into the
         element with its catalogue photograph, tiled at roughly 2 ft, so a paver
         change is visible on the sheet the instant it is selected. */
      const surface = isDraft ? undefined : shapeSurfaceFeature(shape);
      /* TRUE OVERLAP LOGIC — the deck / turf is cut around whatever sits on it.
         `rings` is the surviving geometry: outer boundaries plus holes, filled
         even-odd, so a pool reads as a real void in the paver field. */
      const cropped = isDraft || !cropping ? ([[outline]] as CroppedShape) : croppedSiteShape(shape, data.shapes);
      const rings = cropRings(cropped);
      const isCut = rings.length > 1 || rings[0] !== outline;
      const traceRings = () => {
        ctx.beginPath();
        rings.forEach(ring => {
          ring.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
          ctx.closePath();
        });
      };
      if (shape.closed && isCut) traceRings();
      else tracePolyline(ctx, outline, shape.closed);
      if (shape.closed && !meta.linear) {
        const img = surface?.image ? surfaceImage(surface.image, () => setImgReady(n => n + 1)) : null;
        let painted = false;
        if (img && img.width && typeof DOMMatrix !== 'undefined') {
          const pat = ctx.createPattern(img, 'repeat');
          if (pat) {
            const k = (pxPerFt * 2) / img.width;
            pat.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0]));
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = pat;
            ctx.fill('evenodd');
            ctx.restore();
            painted = true;
          }
        }
        ctx.fillStyle = meta.color + (painted ? '14' : '22');
        ctx.fill('evenodd');
      }

      /* Each trade keeps its own spline signature: cages and arrays are hatched
         planes, spa and ledge shells are dashed, the lot line stays chain-dot. */
      if (shape.closed && meta.hatch && !isDraft && outline.length > 2) {
        /* Hatch is clipped to the *cropped* element, so the cage or array hatch
           stops dead at a pool void instead of running through it. */
        ctx.save();
        traceRings();
        ctx.clip('evenodd');
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
        ctx.restore();
        void span;
      }
      const hovered = !isDraft && hoverShapeId === shape.id && selected !== shape.id;
      ctx.strokeStyle = selected === shape.id ? '#f59e0b' : hovered ? '#0891b2' : meta.color;
      ctx.lineWidth = selected === shape.id ? 3 : hovered ? 3 : meta.id === 'property' ? 2.5 : 2;

      ctx.setLineDash(isDraft ? [6, 4] : meta.dash ?? []);
      if (shape.closed && isCut) traceRings();
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
        const kind = segmentKind(shape.points, shape.closed, shape, i);
        const curved = kind !== 'straight';
        const segPts = curved ? sampleSegmentAdvanced(shape.points, shape.closed, shape, i) : [a, b];
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

        /* an arc is dimensioned the way a drawing is: length, then its radius */
        const bulge = readSpec(shape, shape.points.length).arcs[i];
        const rFt = kind === 'arc' ? arcMetrics(chord, bulge).radiusPx / pxPerFt : 0;
        const text = kind === 'arc' && rFt > 0 ? `${ft.toFixed(1)}'  R ${rFt.toFixed(1)}'` : `${ft.toFixed(1)}'`;
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


      /* CURVATURE HANDLES — one grab per run at its arc midpoint. Pull it and the
         run becomes a true circular arc; the radius is printed as you pull, and
         can be typed to the inch in the curvature inspector. Diamonds are live
         arcs, hollow lozenges are straight runs waiting to be bowed. */
      if (active && shape.points.length >= 2) {
        const spec = readSpec(shape, shape.points.length);
        const segs = segmentCount(shape.points.length, shape.closed);
        for (let i = 0; i < segs; i++) {
          const a = shape.points[i];
          const b = shape.points[(i + 1) % shape.points.length];
          if (Math.hypot(b.x - a.x, b.y - a.y) < 22) continue;
          const isArc = Math.abs(spec.arcs[i]) > 1e-4;
          const h = arcMidpoint(a, b, spec.arcs[i]);
          const on = selectedSegment === i;
          ctx.save();
          ctx.translate(h.x, h.y);
          ctx.rotate(Math.PI / 4);
          /* constant on-screen size, whatever the camera altitude */
          const r = (on ? 5.6 : 4.4) / view.z;
          ctx.beginPath();
          ctx.rect(-r, -r, r * 2, r * 2);
          ctx.fillStyle = isArc ? '#0891b2' : 'rgba(255,255,255,0.95)';
          ctx.strokeStyle = on ? '#f59e0b' : '#0891b2';
          ctx.lineWidth = (on ? 2 : 1.3) / view.z;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        /* a filleted corner announces its radius, as a detail drawing would */
        ctx.font = '600 11px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        shape.points.forEach((p, i) => {
          const rFt = spec.fillets[i] / pxPerFt;
          if (rFt < 0.2) return;
          const label = `R ${rFt.toFixed(1)}'`;
          const w = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(255,255,255,0.94)';
          ctx.fillRect(p.x + 8, p.y - 15, w + 6, 14);
          ctx.fillStyle = '#0891b2';
          ctx.fillText(label, p.x + 11, p.y - 8);
        });
      }


      // label + area
      if (shape.closed && !meta.linear && shape.points.length > 2) {
        const cx = shape.points.reduce((s, p) => s + p.x, 0) / shape.points.length;
        const cy = shape.points.reduce((s, p) => s + p.y, 0) / shape.points.length;
        /* NET area: what the crew installs, with every overlap already cut out */
        const area = netArea(cropped) / (pxPerFt * pxPerFt);
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
        /* the selected surface is named on the element itself */
        if (surface) {
          ctx.font = '600 11px ui-sans-serif, system-ui';
          const surfText = surface.label.toUpperCase();
          ctx.strokeStyle = 'rgba(255,255,255,0.92)';
          ctx.strokeText(surfText, cx, cy + 26);
          ctx.fillStyle = '#0f172a';
          ctx.fillText(surfText, cx, cy + 26);
        }
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

    };


    data.shapes.forEach(s => renderShape(s));
    if (draft.length) {
      const preview = hover ? [...draft, hover] : draft;
      renderShape({ id: 'draft', layer, points: preview, closed: false }, true);
    }

    /* GHOST VERTEX — the point tool's anchor. It rides the outline under the
       cursor, sliding along the run, so the designer sees exactly where the new
       point will land before clicking. Constant on-screen size at any altitude. */
    if (!readOnly && mode === 'point' && insertGhost) {
      const g = insertGhost.point;
      const r = 6 / view.z;
      ctx.save();
      ctx.beginPath();
      ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 2 / view.z;
      ctx.stroke();
      /* crosshair so the anchor reads as a drafting insertion, not a handle */
      ctx.beginPath();
      ctx.moveTo(g.x - r * 1.9, g.y);
      ctx.lineTo(g.x + r * 1.9, g.y);
      ctx.moveTo(g.x, g.y - r * 1.9);
      ctx.lineTo(g.x, g.y + r * 1.9);
      ctx.strokeStyle = 'rgba(8,145,178,0.75)';
      ctx.lineWidth = 1.2 / view.z;
      ctx.stroke();
      ctx.restore();
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

    /* ── sheet furniture, drawn in screen space so it never zooms away ── */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // scale bar — a round number of feet at the current camera distance
    const barFt = [1, 2, 5, 10, 20, 50, 100, 200, 500].find(f => f * pxPerFt * view.z >= 90) ?? 1000;
    const barPx = barFt * pxPerFt * view.z;
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
    hoverShapeId,

    showGrid,
    underlay,
    imgReady,
    mode,
    readOnly,
    calibration,
    view,
    selectedSegment,
    cropping,
  ]);


  React.useEffect(() => {
    draw();
    if (!onSnapshot) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      onSnapshot(data.shapes.length || data.underlay ? canvas.toDataURL('image/png') : null);
    } catch {
      /* a catalogue photograph served without CORS taints the sheet — the board
         keeps working, only the printed snapshot is skipped */
      onSnapshot(null);
    }
  }, [draw, onSnapshot, data.shapes.length, data.underlay]);


  /** Pointer → sheet coordinates, through the camera. */
  const toLocal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) * CANVAS_W) / rect.width;
    const sy = ((e.clientY - rect.top) * CANVAS_H) / rect.height;
    const v = viewRef.current;
    return { x: (sx - v.x) / v.z, y: (sy - v.y) / v.z };
  };

  /* Wheel and trackpad-pinch zoom, anchored under the cursor. React's onWheel is
     passive, so the listener is attached natively to keep preventDefault. */
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      zoomAt(
        Math.exp(-dy * 0.0018),
        ((e.clientX - rect.left) * CANVAS_W) / rect.width,
        ((e.clientY - rect.top) * CANVAS_H) / rect.height,
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);


  /**
   * What is under the pointer. Edges win (so a corner of the deck can be grabbed
   * even where it overlaps the pool), then the *inside* of a closed element — a
   * click anywhere on the paver deck picks that deck and opens its paver book.
   * Smaller elements are tested first so a pool on top of a deck stays clickable.
   */
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
    const inside = data.shapes
      .filter(s => s.closed && !layerMeta(s.layer).linear && s.points.length > 2)
      .filter(s => pointInPolygon(siteShapeOutline(s), p))
      .sort((a, b) => polygonArea(siteShapeOutline(a)) - polygonArea(siteShapeOutline(b)));
    return inside[0]?.id ?? null;
  };


  const hitVertex = (p: { x: number; y: number }): { shapeId: string; index: number } | null => {
    for (let i = data.shapes.length - 1; i >= 0; i--) {
      const shape = data.shapes[i];
      const v = hitVertexIndex(shape.points, p, 8);
      if (v >= 0) return { shapeId: shape.id, index: v };
    }
    return null;
  };

  /**
   * Curvature handle under the pointer — the diamond at a run's arc midpoint.
   * Only the selected element offers handles, exactly as a CAD seat does, so a
   * dense sheet never fights the pointer.
   */
  const hitArcHandle = (p: { x: number; y: number }): { shapeId: string; index: number } | null => {
    const shape = data.shapes.find(sh => sh.id === selected);
    if (!shape || shape.points.length < 2) return null;
    const spec = readSpec(shape, shape.points.length);
    const segs = segmentCount(shape.points.length, shape.closed);
    for (let i = 0; i < segs; i++) {
      const a = shape.points[i];
      const b = shape.points[(i + 1) % shape.points.length];
      if (Math.hypot(b.x - a.x, b.y - a.y) < 22) continue;
      const h = arcMidpoint(a, b, spec.arcs[i]);
      /* grab radius is constant on screen, so the handle is as easy to catch
         zoomed out over a whole lot as it is up close on a bench seat */
      if (Math.hypot(h.x - p.x, h.y - p.y) <= 11 / viewRef.current.z) return { shapeId: shape.id, index: i };
    }
    return null;
  };

  /** Nearest run of a shape to the pointer, for the curvature inspector. */
  const nearestSegmentIndex = (shape: SiteShape, p: { x: number; y: number }): number | null => {
    const segs = segmentCount(shape.points.length, shape.closed);
    let best: { i: number; d: number } | null = null;
    for (let i = 0; i < segs; i++) {
      const pts = sampleSegmentAdvanced(shape.points, shape.closed, shape, i);
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1];
        const b = pts[k];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len)));
        const d = Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
        if (!best || d < best.d) best = { i, d };
      }
    }
    return best ? best.i : null;
  };

  const updateShape = (id: string, patch: (s: SiteShape) => SiteShape) => {
    onChange({ ...data, shapes: data.shapes.map(s => (s.id === id ? patch(s) : s)) });
  };

  /**
   * Closest point ON the drawn outline — the true sampled spline, so the ghost
   * follows a bowed arc exactly as it follows a straight run. Preference goes to
   * the selected element, then to whatever run is nearest the cursor.
   */
  const nearestOnOutline = (
    p: { x: number; y: number },
    tolerance: number,
  ): { shapeId: string; segment: number; point: { x: number; y: number }; distance: number } | null => {
    let best: { shapeId: string; segment: number; point: { x: number; y: number }; distance: number } | null = null;
    for (const shape of data.shapes) {
      if (shape.points.length < 2) continue;
      const segs = segmentCount(shape.points.length, shape.closed);
      for (let i = 0; i < segs; i++) {
        const pts = sampleSegmentAdvanced(shape.points, shape.closed, shape, i);
        for (let k = 1; k < pts.length; k++) {
          const a = pts[k - 1];
          const b = pts[k];
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len)));
          const proj = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
          const d = Math.hypot(p.x - proj.x, p.y - proj.y);
          /* the selected element wins ties comfortably, as a CAD seat does */
          const weighted = shape.id === selected ? d * 0.6 : d;
          if (d <= tolerance && (!best || weighted < best.distance)) {
            best = { shapeId: shape.id, segment: i, point: proj, distance: weighted };
          }
        }
      }
    }
    return best;
  };

  /** Widen a per-point / per-run numeric spec when a vertex is spliced in. */
  const spliceSpec = (arr: number[] | undefined, n: number, at: number, fallback = 0): number[] | undefined => {
    if (!arr?.length) return arr;
    const out = new Array(n).fill(fallback) as number[];
    for (let i = 0; i < Math.min(n, arr.length); i++) out[i] = arr[i];
    out.splice(at, 0, fallback);
    return out;
  };

  /** Drop the ghost vertex onto its run, splitting that run in two. */
  const insertVertexOnOutline = (shapeId: string, segment: number, point: { x: number; y: number }) => {
    const shape = data.shapes.find(s => s.id === shapeId);
    if (!shape) return;
    const n = shape.points.length;
    const at = segment + 1;
    const points = [...shape.points];
    points.splice(at, 0, point);
    const flags = normalizeFlags(shape.curves, n);
    /* the new point inherits the curvature of the run it was dropped on */
    flags.splice(at, 0, !!(flags[segment] || flags[(segment + 1) % n]));
    updateShape(shapeId, s => ({
      ...s,
      points,
      curves: flags,
      /* both halves of a bowed run restart straight — the designer re-bows each */
      arcs: spliceSpec(s.arcs, n, at),
      fillets: spliceSpec(s.fillets, n, at),
      tension: spliceSpec(s.tension, n, at, DEFAULT_TENSION),
    }));
    setSelected(shapeId);
    setSelectedVertex(at);
    setSelectedSegment(null);
  };

  /** Drop a new vertex on the nearest run of a shape (Alt-click shortcut). */
  const insertVertexNear = (p: { x: number; y: number }): boolean => {
    const hit = nearestOnOutline(p, 12 / viewRef.current.z);
    if (!hit) return false;
    insertVertexOnOutline(hit.shapeId, hit.segment, hit.point);
    return true;
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
    /* Middle button or shift-drag pans the camera over the sheet. */
    if (e.button === 1 || e.shiftKey) {
      pan.current = { x: e.clientX, y: e.clientY };
      return;
    }
    const raw = toLocal(e);

    if (mode === 'underlay' && underlay && !underlay.locked) {
      drag.current = { kind: 'underlay', last: raw };
      return;
    }
    if (e.altKey || e.button === 2) {
      const vertex = hitVertex(raw);
      if (vertex) {
        /* Erasing a point is deliberate: the first click only picks the point,
           a second Alt-click on that same picked point removes it. Nothing is
           ever deleted just because the cursor passed over it. */
        if (vertex.shapeId === selected && vertex.index === selectedVertex) {
          removeVertexFrom(vertex.shapeId, vertex.index);
        } else {
          setSelected(vertex.shapeId);
          setSelectedVertex(vertex.index);
          setSelectedSegment(null);
        }
        return;
      }
      if (insertVertexNear(raw)) return;
    }
    /* Point tool: the ghost riding the spline is dropped where the designer sees it */
    if (mode === 'point') {
      const hit = insertGhost ?? nearestOnOutline(raw, 16 / viewRef.current.z);
      if (hit) {
        insertVertexOnOutline(hit.shapeId, hit.segment, hit.point);
        setInsertGhost(null);
      }
      return;
    }
    if (mode !== 'select') return;
    /* the curvature diamond wins: pulling it bows the run into a true arc */
    const handle = hitArcHandle(raw);
    if (handle) {
      setSelectedSegment(handle.index);
      setSelectedVertex(null);
      drag.current = { kind: 'bulge', ...handle };
      return;
    }
    const vertex = hitVertex(raw);
    if (vertex) {
      setSelected(vertex.shapeId);
      setSelectedVertex(vertex.index);
      setSelectedSegment(null);
      drag.current = { kind: 'vertex', ...vertex };
      return;
    }
    const shapeId = hitTest(raw);
    setSelected(shapeId);
    setSelectedVertex(null);
    const picked = shapeId ? data.shapes.find(sh => sh.id === shapeId) : null;
    setSelectedSegment(picked ? nearestSegmentIndex(picked, raw) : null);
    if (shapeId) drag.current = { kind: 'shape', shapeId, last: raw };
  };


  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    if (pan.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const k = CANVAS_W / rect.width;
      const dx = (e.clientX - pan.current.x) * k;
      const dy = (e.clientY - pan.current.y) * k;
      pan.current = { x: e.clientX, y: e.clientY };
      setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
      return;
    }
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
      if (active.kind === 'bulge') {
        const shape = data.shapes.find(sh => sh.id === active.shapeId);
        if (!shape) return;
        const a = shape.points[active.index];
        const b = shape.points[(active.index + 1) % shape.points.length];
        /* quarter-inch resolution on the sagitta keeps the pull smooth but exact */
        let bulge = bulgeFromPoint(a, b, raw);
        if (Math.abs(bulge) < 0.012) bulge = 0; // snap back to a dead straight run
        onChange({
          ...data,
          shapes: data.shapes.map(sh =>
            sh.id === active.shapeId
              ? { ...sh, arcs: withValueAt(sh.arcs, sh.points.length, active.index, bulge) }
              : sh,
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
    if (mode === 'point') {
      /* the new point is anchored to the cursor AND to the spline: it slides
         along the run nearest the pointer so the designer chooses exactly where
         it lands before committing */
      const hit = nearestOnOutline(raw, 26 / viewRef.current.z);
      setInsertGhost(prev => {
        if (!hit) return prev ? null : prev;
        if (
          prev &&
          prev.shapeId === hit.shapeId &&
          prev.segment === hit.segment &&
          Math.hypot(prev.point.x - hit.point.x, prev.point.y - hit.point.y) < 0.05
        )
          return prev;
        return { shapeId: hit.shapeId, segment: hit.segment, point: hit.point };
      });
      setHoverShapeId(prev => (prev === (hit?.shapeId ?? null) ? prev : hit?.shapeId ?? null));
      return;
    }
    if (mode === 'select') {
      /* light up whatever the pointer is over so it is obvious which element
         will take the option change on the next click */
      const over = hitTest(raw);
      setHoverShapeId(prev => (prev === over ? prev : over));
      return;
    }
    if (mode !== 'draw' || !draft.length) return;
    setHover({ x: snap(raw.x), y: snap(raw.y) });
  };


  const endDrag = () => {
    drag.current = null;
    pan.current = null;
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
    if (mode === 'select' || mode === 'point') return;
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
      aria-label={opts.title}
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

  /* ── instrument header ────────────────────────────────────────────────────
     The tools live in the sheet's own header, in the empty band beside the
     live price, so the drawing keeps every pixel below it. Icon-only controls
     (each with a tooltip) keep the strip one line on a desktop and a single
     comfortable, swipeable row on a phone. */
  const toolButtons = (
    <div className="-mx-0.5 flex items-center gap-1 overflow-x-auto px-0.5 py-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible md:justify-end [&::-webkit-scrollbar]:hidden">
      {onRequestImport ? ctrl(<ImageIcon className="h-3.5 w-3.5" />, { onClick: onRequestImport, title: 'Import a plan' }) : null}
      {/* Two separate instruments, exactly as the artificial-turf board: the pen
          traces new elements, the pointer picks a drawn one to change its
          options (click the paver deck to change its paver). */}
      {ctrl(<PenLine className="h-3.5 w-3.5" />, {
        on: mode === 'draw',
        title: 'Draw — trace a new element on the armed layer',
        onClick: () => {
          setMode('draw');
          setHoverShapeId(null);
        },
      })}
      {ctrl(<MousePointer2 className="h-3.5 w-3.5" />, {
        on: mode === 'select',
        title: 'Pick — click a drawn element to open its features and options',
        onClick: () => {
          setMode('select');
          setDraft([]);
          setHover(null);
        },
      })}
      {ctrl(<Ruler className="h-3.5 w-3.5" />, {
        on: mode === 'calibrate',
        title: 'Calibrate — set the drawing scale from a known dimension',
        onClick: () => {
          setCalibration([]);
          setMode(mode === 'calibrate' ? 'draw' : 'calibrate');
        },
      })}
      {ctrl(<Plus className="h-3.5 w-3.5" />, {
        onClick: addVertexAfterSelected,
        disabled: !selected || selectedVertex === null,
        title: 'Add a point after the selected one (or Alt-click a line to insert)',
      })}
      {ctrl(<Spline className="h-3.5 w-3.5" />, {
        on: selectedShapeCurved,
        onClick: toggleSelectedCurve,
        disabled: !selected,
        title: selectedShapeCurved ? 'Curved — straighten this point' : 'Straight — curve this point',
      })}
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
      {ctrl(<RotateCcw className="h-3.5 w-3.5" />, {
        onClick: resetProject,
        disabled: !data.shapes.length && !draft.length && !underlay,
        danger: true,
        title: 'Reset — erase everything and start the project over',
      })}
      {ctrl(<CornerUpRight className="h-3.5 w-3.5" />, {
        on: selectedSegment !== null,
        onClick: () => {
          setMode('select');
          if (selectedShape && selectedSegment === null) setSelectedSegment(0);
        },
        disabled: !selected,
        title: 'Curvature — pick a run, then drag its diamond or type an exact radius',
      })}
      {ctrl(<Scissors className="h-3.5 w-3.5" />, {
        on: cropping,
        onClick: () => setCropping(c => !c),
        title: 'Crop — pools, spas, ledges and buildings cut the deck and turf they sit on',
      })}
      {ctrl(<Grid3X3 className="h-3.5 w-3.5" />, { on: showGrid, onClick: () => setShowGrid(g => !g), title: 'Grid' })}
      {/* REAL zoom — a view transform over the sheet. The drafting scale
          (px per foot) never changes, so nothing a customer drew is resized;
          the camera simply moves closer or further from the paper. */}
      {ctrl(<ZoomOut className="h-3.5 w-3.5" />, { onClick: () => zoomBy(1 / 1.25), title: 'Zoom out' })}
      <input
        type="range"
        min={-100}
        max={100}
        value={zoomSlider}
        onChange={e => setZoomFromSlider(+e.target.value)}
        aria-label="Zoom"
        className="hidden h-1 w-24 shrink-0 cursor-pointer appearance-none rounded-full bg-foreground/15 accent-foreground lg:block"
      />
      {ctrl(<ZoomIn className="h-3.5 w-3.5" />, { onClick: () => zoomBy(1.25), title: 'Zoom in' })}
      <span className="shrink-0 whitespace-nowrap px-1 text-center text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {Math.round(viewWidthFt).toLocaleString()} ft
      </span>
      {ctrl(<Maximize2 className="h-3.5 w-3.5" />, {
        onClick: fitView,
        title: data.shapes.length ? 'Fit the drawing to the sheet' : `Fit ${Math.round(defaultViewWidthFt ?? DEFAULT_VIEW_WIDTH_FT)} ft of land`,
      })}

    </div>
  );

  /** The sheet header: what is drawn, what it costs, and every tool beside it. */
  const instrumentHeader =
    header || !readOnly ? (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {header ? <div className="min-w-0 max-w-full grow md:grow-0">{header}</div> : null}
        {!readOnly ? <div className="min-w-0 w-full md:ml-auto md:w-auto md:flex-1">{toolButtons}</div> : null}
      </div>
    ) : null;



  /* ── element options ──────────────────────────────────────────────────────
     Selecting an element opens its own option drawer straight away: what it is,
     its measured size, its geometry controls and its additional features. The
     same selection is broadcast so the discipline's dossier opens on its
     options tab, exactly like the boards inside the FLIP edition. */
  const selectedMeasure = React.useMemo(() => {
    if (!selectedShape) return null;
    /* arcs and fillets change both figures, and overlaps change the SF — read
       the same geometry the sheet draws so the panel can never disagree */
    const outline = siteShapeOutline(selectedShape);
    const lenFt = polylineLength(outline, selectedShape.closed) / data.pxPerFt;
    const shape = cropping ? croppedSiteShape(selectedShape, data.shapes) : ([[outline]] as CroppedShape);
    const sqFt = netArea(shape) / (data.pxPerFt * data.pxPerFt);
    return {
      lenFt: Math.round(lenFt),
      sqFt: Math.round(sqFt),
      points: selectedShape.points.length,
      cut: cropRings(shape).length > 1,
    };
  }, [selectedShape, data.pxPerFt, data.shapes, cropping]);

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

  /* Every catalogued option, filed under its heading, presented exactly as
     Wonderlands Studio presents it: photograph, title, price. Titles, prices
     and images all come from the studio catalogues via TRADE_LAYERS, so a tile
     here and a tile on the studio product card are the same product.
     Long catalogues (the paver book, the fence book) scroll inside the drawer
     instead of pushing the board down. */
  const priceLabel = (f: { perSqFt?: number; perLinearFt?: number; flat?: number }) => {
    if (f.perSqFt) return `+$${f.perSqFt}/sq ft`;
    if (f.perLinearFt) return `+$${f.perLinearFt}/lf`;
    if (f.flat) return `+$${f.flat.toLocaleString()}`;
    return 'Included';
  };

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
      <div className="mt-1.5 max-h-[46vh] space-y-3 overflow-y-auto pr-1">
        {groups.map(g => (
          <div key={g.name}>
            <p className="text-[8.5px] uppercase tracking-[0.26em] text-muted-foreground/80">{g.name}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {g.items.map(f => {
                const on = activeIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    title={f.hint}
                    aria-pressed={on}
                    onClick={() => onToggle(f.id)}
                    className={`flex flex-col overflow-hidden border p-1.5 text-left transition-all duration-300 ${
                      on
                        ? 'border-foreground bg-foreground/[0.07]'
                        : 'border-border/60 bg-foreground/[0.02] hover:border-foreground/70'
                    }`}
                  >
                    <span className="mb-1 flex h-14 w-full items-center justify-center overflow-hidden bg-muted/40">
                      {f.image ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          src={f.image}
                          alt={f.label}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="px-1 text-center text-[8px] uppercase tracking-[0.18em] text-muted-foreground">
                          {f.label}
                        </span>
                      )}
                    </span>
                    <span className="line-clamp-2 text-[9.5px] font-light leading-tight">{f.label}</span>
                    <span
                      className={`mt-0.5 text-[9px] uppercase tracking-[0.16em] ${
                        on ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {priceLabel(f)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };


  /* ── ARCHITECT CURVATURE ────────────────────────────────────────────────
     Every run of every element can be a dead-straight line, a TRUE CIRCULAR ARC
     with a typed radius, or a tensioned spline; every corner can carry a tangent
     fillet. Values are exact and read back in feet and inches, so the sheet is
     as precise as a drafting seat — and the same numbers drive the estimate. */
  const segCount = selectedShape ? segmentCount(selectedShape.points.length, selectedShape.closed) : 0;
  const segIndex = selectedSegment !== null && selectedSegment < segCount ? selectedSegment : null;
  const curvature = React.useMemo(() => {
    if (!selectedShape || segIndex === null) return null;
    const pts = selectedShape.points;
    const a = pts[segIndex];
    const b = pts[(segIndex + 1) % pts.length];
    const spec = readSpec(selectedShape, pts.length);
    const chord = Math.hypot(b.x - a.x, b.y - a.y);
    const kind = segmentKind(pts, selectedShape.closed, selectedShape, segIndex);
    const m = arcMetrics(chord, spec.arcs[segIndex]);
    return {
      kind,
      bulge: spec.arcs[segIndex],
      chordFt: chord / data.pxPerFt,
      radiusFt: m.radiusPx / data.pxPerFt,
      runFt: segmentLength(pts, selectedShape.closed, selectedShape, segIndex) / data.pxPerFt,
      sweepDeg: (m.sweepRad * 180) / Math.PI,
      chordPx: chord,
    };
  }, [selectedShape, segIndex, data.pxPerFt]);

  const patchSelected = (patch: (sh: SiteShape) => SiteShape) => {
    if (!selectedShape) return;
    onChange({ ...data, shapes: data.shapes.map(sh => (sh.id === selectedShape.id ? patch(sh) : sh)) });
  };
  const setBulge = (bulge: number) => {
    if (!selectedShape || segIndex === null) return;
    const n = selectedShape.points.length;
    patchSelected(sh => ({
      ...sh,
      arcs: withValueAt(sh.arcs, n, segIndex, Math.max(-MAX_BULGE, Math.min(MAX_BULGE, bulge))),
      /* an arc owns its run — clear the spline flags that would fight it */
      curves: bulge
        ? (sh.curves ?? []).map((c, i) => (i === segIndex || i === (segIndex + 1) % n ? false : c))
        : sh.curves,
    }));
  };
  /** Type a radius in feet and the run resolves to that exact circle. */
  const setRadiusFt = (ft: number) => {
    if (!curvature || !Number.isFinite(ft)) return;
    const rPx = ft * data.pxPerFt;
    if (rPx < curvature.chordPx / 2) return; // a circle smaller than the chord cannot close
    setBulge(bulgeForRadius(curvature.chordPx, rPx, curvature.bulge < 0 ? -1 : 1));
  };
  /** Tangent fillet on the selected corner, in feet. */
  const setFilletFt = (ft: number) => {
    if (!selectedShape || selectedVertex === null || !Number.isFinite(ft)) return;
    const n = selectedShape.points.length;
    patchSelected(sh => ({ ...sh, fillets: withValueAt(sh.fillets, n, selectedVertex, Math.max(0, ft) * data.pxPerFt) }));
  };
  const setTension = (t: number) => {
    if (!selectedShape || selectedVertex === null) return;
    const n = selectedShape.points.length;
    patchSelected(sh => ({ ...sh, tension: withValueAt(sh.tension, n, selectedVertex, t, DEFAULT_TENSION) }));
  };

  const numField = (label: string, value: number, onCommit: (v: number) => void, step = 0.25, disabled = false) => (
    <label className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        type="number"
        step={step}
        min={0}
        disabled={disabled}
        defaultValue={Number.isFinite(value) ? Number(value.toFixed(2)) : 0}
        key={`${label}-${value.toFixed(2)}`}
        onBlur={e => onCommit(parseFloat(e.target.value))}
        onKeyDown={e => e.key === 'Enter' && onCommit(parseFloat((e.target as HTMLInputElement).value))}
        className="w-16 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 text-[11px] tabular-nums text-foreground outline-none focus:border-primary/70 disabled:opacity-40"
      />
    </label>
  );

  const curvatureInspector =
    !readOnly && selectedShape ? (
      <div className="mt-2 border-t border-border/50 pt-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Curvature</p>
          {curvature ? (
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Run {(segIndex ?? 0) + 1} of {segCount} · {curvature.runFt.toFixed(2)}′
              {curvature.kind === 'arc' ? ` · R ${curvature.radiusFt.toFixed(2)}′ · ${curvature.sweepDeg.toFixed(1)}°` : ''}
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Pick a run on the sheet — or drag a diamond handle to bow it
            </span>
          )}
        </div>
        {curvature ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {ctrl('Straight', { on: curvature.kind === 'straight', onClick: () => setBulge(0) })}
            {ctrl(
              <>
                <CircleDot className="h-3.5 w-3.5" /> Arc
              </>,
              {
                on: curvature.kind === 'arc',
                onClick: () => setBulge(curvature.bulge || 0.25),
              },
            )}
            {ctrl(
              <>
                <Spline className="h-3.5 w-3.5" /> Spline
              </>,
              { on: curvature.kind === 'spline', onClick: toggleSelectedCurve },
            )}
            {numField('Radius ft', curvature.radiusFt, setRadiusFt, 0.25, curvature.kind !== 'arc')}
            <input
              type="range"
              min={-90}
              max={90}
              value={Math.round(curvature.bulge * 100)}
              onChange={e => setBulge(+e.target.value / 100)}
              className="h-1 w-24 cursor-pointer accent-primary"
              title="Bow this run — drag through centre for a dead straight line"
            />
            {ctrl('Flip', { onClick: () => setBulge(-curvature.bulge), disabled: curvature.kind !== 'arc' })}
          </div>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {numField(
            'Fillet ft',
            selectedVertex !== null ? readSpec(selectedShape, selectedShape.points.length).fillets[selectedVertex] / data.pxPerFt : 0,
            setFilletFt,
            0.25,
            selectedVertex === null,
          )}
          <label className="flex items-center gap-1.5" title="Spline tension at the selected point">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Tension</span>
            <input
              type="range"
              min={0}
              max={100}
              disabled={selectedVertex === null}
              value={Math.round(
                (selectedVertex !== null
                  ? readSpec(selectedShape, selectedShape.points.length).tension[selectedVertex]
                  : DEFAULT_TENSION) * 100,
              )}
              onChange={e => setTension(+e.target.value / 100)}
              className="h-1 w-20 cursor-pointer accent-primary disabled:opacity-40"
            />
          </label>
          {ctrl(
            <>
              <Scissors className="h-3.5 w-3.5" /> {selectedShape.noCrop ? 'Uncut' : 'Cut around overlaps'}
            </>,
            {
              on: !selectedShape.noCrop,
              onClick: () => patchSelected(sh => ({ ...sh, noCrop: !sh.noCrop })),
              title: 'Overlapping pools, spas, ledges and buildings cut this element',
            },
          )}
        </div>
      </div>
    ) : null;

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
                : `${selectedMeasure.sqFt.toLocaleString()} SF${selectedMeasure.cut ? ' net' : ''} · ${selectedMeasure.lenFt} LF perimeter`}{' '}
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
        {curvatureInspector}
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
          setHoverShapeId(null);
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
              ? hoverShapeId
                ? 'pointer'
                : 'default'
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
                ? 'Click an element — the paver deck, the pool, the cage — to open its own features and options: the paver, finish or screen you pick applies to that element only. Drag a corner to reshape, drag it to move, Delete to remove.'
                : `Click to place corners, click the first corner (or press Enter / double-click) to close the shape. The ${layerMeta(layer).label.toLowerCase()} options armed below travel onto the element you are drawing.`}{' '}

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

  /* FLIP dossier layout — the tools ride in the sheet header, so everything
     under it is drawing. Only the element palette stays docked below. */
  if (menuSide) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-2.5">
        {instrumentHeader}
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
          {instrumentHeader && (
            <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 backdrop-blur-md">
              {instrumentHeader}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">{layerTags}</div>
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
