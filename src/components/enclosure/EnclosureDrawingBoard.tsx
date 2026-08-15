import * as React from 'react';
import { Button } from '@/components/ui/button';
import BoardDensityToggle from '@/components/drawing/BoardDensityToggle';
import useBoardDensity from '@/hooks/useBoardDensity';
import { Undo2, Trash2, DoorOpen, MousePointer2, Ruler, Home, Square, X } from 'lucide-react';
import { ENCLOSURE_DOORS, EnclosureDoorOption } from '@/data/screenEnclosureConfigurator';

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
  /** Catalog door model dropped on the plan (doors only) */
  doorTypeId?: string;
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

/** Selected drawing element the user can delete */
type Selection =
  | { type: 'point'; index: number }
  | { type: 'feature'; segIndex: number; featIndex: number; kind: 'door' | 'house' }
  | { type: 'segment'; segIndex: number }
  | null;

interface Props {
  layout: EnclosureLayout;
  onChange: (layout: EnclosureLayout) => void;
  onMeasure?: (takeoff: EnclosureTakeoff) => void;
  /** PNG data-URL of the drawn footprint, or null when nothing is drawn */
  onSnapshot?: (dataUrl: string | null) => void;
  frameColorHex?: string;
  /** Title block rendered inside the board toolbar card */
  header?: React.ReactNode;
}

const PX_PER_FT = 10;
const GRID_FT = 1;
const MAJOR_FT = 5;
const DEFAULT_DOOR_ID = 'single-36-sl';

const dist = (a: EnclosurePoint, b: EnclosurePoint) => Math.hypot(a.x - b.x, a.y - b.y);
const doorById = (id?: string): EnclosureDoorOption =>
  ENCLOSURE_DOORS.find(d => d.id === id) || ENCLOSURE_DOORS.find(d => d.id === DEFAULT_DOOR_ID) || ENCLOSURE_DOORS[0];

const KIND_COLOR: Record<EnclosureSegmentKind, string> = {
  wall: '#111827',
  door: '#0891b2',
  house: '#f97066',
};

const SELECT_COLOR = '#f59e0b';

/** Convert legacy segmentKinds into sized features. Doors become 3 ft bays centered on each segment. */
export function migrateEnclosureLayout(layout: EnclosureLayout): EnclosureLayout {
  if (layout.features && Object.keys(layout.features).length > 0) return layout;
  if (!layout.segmentKinds || Object.keys(layout.segmentKinds).length === 0) {
    return { points: layout.points, closed: layout.closed, features: {} };
  }
  const points = layout.points;
  const features: Record<number, EnclosureFeature[]> = {};
  Object.entries(layout.segmentKinds).forEach(([k, kind]) => {
    const idx = Number(k);
    if (kind === 'wall') return;
    const a = points[idx];
    const b = points[(idx + 1) % points.length];
    if (!a || !b) return;
    const segFt = dist(a, b) / PX_PER_FT;
    if (kind === 'house') {
      features[idx] = [{ kind: 'house', start: 0, end: 1 }];
    } else {
      const doorFt = Math.min(doorById(DEFAULT_DOOR_ID).widthFt, segFt);
      const margin = Math.max(0, (segFt - doorFt) / 2 / segFt);
      features[idx] = [{ kind: 'door', start: margin, end: 1 - margin, doorTypeId: DEFAULT_DOOR_ID }];
    }
  });
  return { points: layout.points, closed: layout.closed, features };
}

/** Every door bay currently drawn on the plan, grouped by catalog model id */
export function countDrawnDoors(layout: EnclosureLayout): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.values(layout.features || {}).forEach(list =>
    (list || []).forEach(f => {
      if (f.kind !== 'door') return;
      const id = f.doorTypeId || DEFAULT_DOOR_ID;
      counts[id] = (counts[id] || 0) + 1;
    })
  );
  return counts;
}

/** Remove every drawn door of a given catalog model (cart -> drawing sync) */
export function removeDrawnDoorsOfType(layout: EnclosureLayout, doorTypeId: string): EnclosureLayout {
  const features: Record<number, EnclosureFeature[]> = {};
  Object.entries(layout.features || {}).forEach(([k, list]) => {
    const kept = (list || []).filter(f => !(f.kind === 'door' && (f.doorTypeId || DEFAULT_DOOR_ID) === doorTypeId));
    if (kept.length) features[Number(k)] = kept;
  });
  return { ...layout, features };
}

/** Remove the last drawn door of a model, or null when none is present */
export function removeLastDrawnDoor(layout: EnclosureLayout, doorTypeId: string): EnclosureLayout | null {
  const segKeys = Object.keys(layout.features || {})
    .map(Number)
    .sort((a, b) => b - a);
  for (const seg of segKeys) {
    const list = layout.features[seg] || [];
    for (let i = list.length - 1; i >= 0; i--) {
      const f = list[i];
      if (f.kind !== 'door' || (f.doorTypeId || DEFAULT_DOOR_ID) !== doorTypeId) continue;
      const kept = list.filter((_, idx) => idx !== i);
      const features = { ...layout.features };
      if (kept.length) features[seg] = kept;
      else delete features[seg];
      return { ...layout, features };
    }
  }
  return null;
}

/** Swap every drawn door of one model to another (cart option change -> drawing) */
export function swapDrawnDoorType(layout: EnclosureLayout, fromId: string, toId: string): EnclosureLayout {
  const from = doorById(fromId);
  const to = doorById(toId);
  const features: Record<number, EnclosureFeature[]> = {};
  Object.entries(layout.features || {}).forEach(([k, list]) => {
    const segIndex = Number(k);
    const a = layout.points[segIndex];
    const b = layout.points[(segIndex + 1) % layout.points.length];
    const segFt = a && b ? dist(a, b) / PX_PER_FT : 0;
    features[segIndex] = (list || []).map(f => {
      if (f.kind !== 'door' || (f.doorTypeId || DEFAULT_DOOR_ID) !== from.id) return f;
      if (!segFt) return { ...f, doorTypeId: to.id };
      const mid = (f.start + f.end) / 2;
      const halfT = Math.min(to.widthFt, segFt) / 2 / segFt;
      return { ...f, doorTypeId: to.id, start: Math.max(0, mid - halfT), end: Math.min(1, mid + halfT) };
    });
  });
  return { ...layout, features };
}

/** Drop a door of a given model onto the longest free wall run (cart/list -> drawing) */
export function addDoorToLongestWall(layout: EnclosureLayout, doorTypeId: string): EnclosureLayout | null {
  const pts = layout.points;
  if (pts.length < 2) return null;
  const door = doorById(doorTypeId);
  const segs: Array<{ index: number; ft: number }> = [];
  for (let i = 0; i < pts.length - 1; i++) segs.push({ index: i, ft: dist(pts[i], pts[i + 1]) / PX_PER_FT });
  if (layout.closed && pts.length > 2) segs.push({ index: pts.length - 1, ft: dist(pts[pts.length - 1], pts[0]) / PX_PER_FT });

  let best: { index: number; t: number } | null = null;
  let bestGap = 0;
  segs.forEach(seg => {
    const feats = (layout.features[seg.index] || []).slice().sort((a, b) => a.start - b.start);
    let cursor = 0;
    const gaps: Array<[number, number]> = [];
    feats.forEach(f => {
      if (f.start > cursor) gaps.push([cursor, f.start]);
      cursor = Math.max(cursor, f.end);
    });
    if (cursor < 1) gaps.push([cursor, 1]);
    gaps.forEach(([g0, g1]) => {
      const gapFt = (g1 - g0) * seg.ft;
      if (gapFt > bestGap) {
        bestGap = gapFt;
        best = { index: seg.index, t: (g0 + g1) / 2 };
      }
    });
  });
  if (!best || bestGap < door.widthFt) return null;
  const segFt = segs.find(s => s.index === best!.index)!.ft;
  const halfT = door.widthFt / 2 / segFt;
  const feature: EnclosureFeature = {
    kind: 'door',
    start: Math.max(0, best.t - halfT),
    end: Math.min(1, best.t + halfT),
    doorTypeId: door.id,
  };
  const list = [...(layout.features[best.index] || []), feature].sort((a, b) => a.start - b.start);
  return { ...layout, features: { ...layout.features, [best.index]: list } };
}

/** Top-view enclosure footprint board. Same drafting conventions as the 2D pool studio: 10px = 1 ft. */
const EnclosureDrawingBoard = ({ layout, onChange, onMeasure, onSnapshot, frameColorHex, header }: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = React.useState<'draw' | 'select' | 'door' | 'house'>('draw');
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [hover, setHover] = React.useState<EnclosurePoint | null>(null);
  const [size, setSize] = React.useState({ w: 900, h: 520 });
  const [doorTypeId, setDoorTypeId] = React.useState<string>(DEFAULT_DOOR_ID);
  const [selection, setSelection] = React.useState<Selection>(null);
  const { compact, toggle: toggleDensity } = useBoardDensity();

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

  /** Split a segment into wall/door/house intervals based on its features. Overlaps are clipped. */
  const segmentIntervals = (seg: { a: EnclosurePoint; b: EnclosurePoint; index: number }) => {
    const len = dist(seg.a, seg.b);
    const ft = len / PX_PER_FT;
    const feats = featuresOf(seg.index)
      .map((f, featIndex) => ({ f, featIndex }))
      .filter(x => x.f.end > x.f.start)
      .sort((a, b) => a.f.start - b.f.start);
    const intervals: Array<{
      kind: EnclosureSegmentKind;
      t0: number;
      t1: number;
      ft: number;
      featIndex?: number;
      doorTypeId?: string;
    }> = [];
    let cursor = 0;
    feats.forEach(({ f, featIndex }) => {
      const start = Math.max(f.start, cursor);
      const end = Math.min(1, f.end);
      if (end <= start) return;
      if (start > cursor + 1e-6) {
        intervals.push({ kind: 'wall', t0: cursor, t1: start, ft: (start - cursor) * ft });
      }
      intervals.push({ kind: f.kind, t0: start, t1: end, ft: (end - start) * ft, featIndex, doorTypeId: f.doorTypeId });
      cursor = end;
    });
    if (cursor < 1 - 1e-6) intervals.push({ kind: 'wall', t0: cursor, t1: 1, ft: (1 - cursor) * ft });
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

    // centroid used to push labels / door swings to the outside of the footprint
    const cxAll = layout.points.length ? layout.points.reduce((s, p) => s + p.x, 0) / layout.points.length : 0;
    const cyAll = layout.points.length ? layout.points.reduce((s, p) => s + p.y, 0) / layout.points.length : 0;

    type Label = { text: string; x: number; y: number; kind: EnclosureSegmentKind };
    const labels: Label[] = [];

    segments.forEach(seg => {
      const intervals = segmentIntervals(seg);
      const lenPx = dist(seg.a, seg.b);
      const ux = (seg.b.x - seg.a.x) / (lenPx || 1);
      const uy = (seg.b.y - seg.a.y) / (lenPx || 1);
      // outward normal
      let nx = -uy;
      let ny = ux;
      const midSeg = { x: (seg.a.x + seg.b.x) / 2, y: (seg.a.y + seg.b.y) / 2 };
      if ((midSeg.x + nx - cxAll) ** 2 + (midSeg.y + ny - cyAll) ** 2 < (midSeg.x - cxAll) ** 2 + (midSeg.y - cyAll) ** 2) {
        nx = -nx;
        ny = -ny;
      }

      const segmentSelected = selection?.type === 'segment' && selection.segIndex === seg.index;

      intervals.forEach(iv => {
        const a = { x: seg.a.x + ux * iv.t0 * lenPx, y: seg.a.y + uy * iv.t0 * lenPx };
        const b = { x: seg.a.x + ux * iv.t1 * lenPx, y: seg.a.y + uy * iv.t1 * lenPx };
        const ivLen = dist(a, b);
        const featureSelected =
          selection?.type === 'feature' && selection.segIndex === seg.index && selection.featIndex === iv.featIndex;
        const highlighted = featureSelected || (segmentSelected && iv.kind === 'wall');

        if (highlighted) {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        if (iv.kind === 'door') {
          // architectural door: clean opening in the wall, jambs, and a swing arc
          ctx.strokeStyle = bg;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          ctx.strokeStyle = featureSelected ? SELECT_COLOR : KIND_COLOR.door;
          ctx.lineWidth = 2.5;
          [a, b].forEach(j => {
            ctx.beginPath();
            ctx.moveTo(j.x - nx * 5, j.y - ny * 5);
            ctx.lineTo(j.x + nx * 5, j.y + ny * 5);
            ctx.stroke();
          });

          // swing: leaf from jamb a, rotating outward
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.x + nx * ivLen, a.y + ny * ivLen);
          ctx.stroke();
          ctx.lineWidth = 1.25;
          ctx.setLineDash([4, 4]);
          const start = Math.atan2(b.y - a.y, b.x - a.x);
          const end = Math.atan2(ny, nx);
          ctx.beginPath();
          ctx.arc(a.x, a.y, ivLen, Math.min(start, end), Math.max(start, end));
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          const base = iv.kind === 'wall' ? wallColor : KIND_COLOR.house;
          const color = featureSelected ? SELECT_COLOR : base;
          ctx.strokeStyle = color;
          ctx.lineWidth = iv.kind === 'house' ? 6 : 3.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // upright ticks on screened wall intervals only
          if (iv.kind === 'wall') {
            const step = 6 * PX_PER_FT; // uprights at 6 ft o.c.
            ctx.fillStyle = color;
            for (let d = step; d < ivLen; d += step) {
              ctx.beginPath();
              ctx.arc(a.x + ux * d, a.y + uy * d, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // queue one label per interval, offset outward so it never sits on the line
        const showLabel = iv.kind === 'door' ? true : iv.ft >= 3;
        if (showLabel) {
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const off = iv.kind === 'door' ? 26 : 15;
          const doorName = iv.kind === 'door' ? doorById(iv.doorTypeId).widthFt : 0;
          labels.push({
            text:
              iv.kind === 'door'
                ? `DOOR ${doorName}'`
                : iv.kind === 'house'
                ? `HOUSE ${iv.ft.toFixed(1)}'`
                : `${iv.ft.toFixed(1)}'`,
            x: mx + nx * off,
            y: my + ny * off,
            kind: iv.kind,
          });
        }
      });
    });

    // draw labels last, skipping any that would overlap an already placed one
    const placed: Array<{ x: number; y: number; w: number; h: number }> = [];
    labels.forEach(l => {
      ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
      const w = ctx.measureText(l.text).width + 8;
      const h = 14;
      const box = { x: l.x - w / 2, y: l.y - h / 2, w, h };
      const clash = placed.some(p => Math.abs(p.x + p.w / 2 - (box.x + w / 2)) < (p.w + w) / 2 && Math.abs(p.y + p.h / 2 - (box.y + h / 2)) < (p.h + h) / 2);
      if (clash) return;
      placed.push(box);
      ctx.fillStyle = bg;
      ctx.fillRect(box.x, box.y, w, h);
      ctx.strokeStyle = l.kind === 'wall' ? gridMajor : KIND_COLOR[l.kind];
      ctx.lineWidth = 1;
      ctx.strokeRect(box.x, box.y, w, h);
      ctx.fillStyle = l.kind === 'wall' ? textColor : KIND_COLOR[l.kind];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(l.text, box.x + w / 2, box.y + h / 2 + 0.5);
      ctx.textBaseline = 'alphabetic';
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
      const pointSelected = selection?.type === 'point' && selection.index === i;
      if (pointSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === dragIndex || pointSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = pointSelected ? SELECT_COLOR : i === 0 ? '#f97066' : wallColor;
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [layout, segments, size, hover, mode, dragIndex, frameColorHex, takeoff, selection]);

  // ---- snapshot export (footprint plan for cart / quote) ----
  const snapshotRef = React.useRef(onSnapshot);
  snapshotRef.current = onSnapshot;
  React.useEffect(() => {
    if (!snapshotRef.current) return;
    const t = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas || layout.points.length < 3) {
        snapshotRef.current?.(null);
        return;
      }
      try {
        snapshotRef.current?.(canvas.toDataURL('image/png'));
      } catch {
        snapshotRef.current?.(null);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [layout, size, takeoff]);

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
    let bestT = 0;
    segments.forEach(seg => {
      const len = dist(seg.a, seg.b) || 1;
      const t = Math.max(0, Math.min(1, ((p.x - seg.a.x) * (seg.b.x - seg.a.x) + (p.y - seg.a.y) * (seg.b.y - seg.a.y)) / (len * len)));
      const proj = { x: seg.a.x + t * (seg.b.x - seg.a.x), y: seg.a.y + t * (seg.b.y - seg.a.y) };
      const d = dist(proj, p);
      if (d < bestDist) {
        bestDist = d;
        best = seg.index;
        bestT = t;
      }
    });
    return { index: best, t: bestT };
  };

  /** Remove [s,e] from a house run, splitting it if the cut is in the middle. */
  const subtractHouse = (f: EnclosureFeature, s: number, e: number): EnclosureFeature[] => {
    if (e <= f.start || s >= f.end) return [f];
    const out: EnclosureFeature[] = [];
    if (f.start < s) out.push({ ...f, end: s });
    if (f.end > e) out.push({ ...f, start: e });
    return out;
  };

  const tagFeature = (segIndex: number, kind: Extract<EnclosureSegmentKind, 'door' | 'house'>, t: number) => {
    const seg = segments.find(s => s.index === segIndex);
    if (!seg) return;
    const segFt = dist(seg.a, seg.b) / PX_PER_FT;
    const next: Record<number, EnclosureFeature[]> = { ...layout.features };
    let list = [...(next[segIndex] || [])];

    if (kind === 'house') {
      const hasHouse = list.some(f => f.kind === 'house');
      if (hasHouse) {
        list = list.filter(f => f.kind !== 'house');
      } else {
        // House run spans the segment but yields to any door bays already placed.
        let runs: EnclosureFeature[] = [{ kind: 'house', start: 0, end: 1 }];
        list
          .filter(f => f.kind === 'door')
          .forEach(d => {
            runs = runs.flatMap(r => subtractHouse(r, d.start, d.end));
          });
        list = [...list, ...runs.filter(r => r.end - r.start > 0.001)];
      }
    } else {
      const door = doorById(doorTypeId);
      const widthFt = Math.min(door.widthFt, segFt);
      const halfT = widthFt / 2 / Math.max(segFt, 0.001);
      let start = Math.max(0, t - halfT);
      let end = Math.min(1, t + halfT);
      // Nudge door-sized bays away from segment ends when possible
      if ((end - start) * segFt < widthFt && segFt >= widthFt) {
        const missing = (widthFt - (end - start) * segFt) / segFt / 2;
        if (start === 0) end = Math.min(1, end + missing * 2);
        else if (end === 1) start = Math.max(0, start - missing * 2);
      }
      const existing = list.findIndex(f => f.kind === 'door' && t >= f.start - 0.02 && t <= f.end + 0.02);
      if (existing >= 0) {
        list.splice(existing, 1);
      } else {
        // Carve the opening out of any house run so the two never overlap.
        list = list.flatMap(f => (f.kind === 'house' ? subtractHouse(f, start, end) : [f]));
        list.push({ kind: 'door', start, end, doorTypeId: door.id });
      }
    }
    list = list.filter(f => f.end - f.start > 0.001).sort((a, b) => a.start - b.start);
    if (list.length === 0) delete next[segIndex];
    else next[segIndex] = list;
    onChange({ ...layout, features: next });
  };

  // ---- selection & deletion ----
  const selectAt = (p: EnclosurePoint) => {
    const pIdx = hitPoint(p);
    if (pIdx >= 0) {
      setSelection({ type: 'point', index: pIdx });
      return pIdx;
    }
    const { index, t } = hitSegment(p);
    if (index < 0) {
      setSelection(null);
      return -1;
    }
    const featIndex = featuresOf(index).findIndex(f => t >= f.start && t <= f.end);
    if (featIndex >= 0) {
      setSelection({ type: 'feature', segIndex: index, featIndex, kind: featuresOf(index)[featIndex].kind });
    } else {
      setSelection({ type: 'segment', segIndex: index });
    }
    return -1;
  };

  /** Delete a corner point and re-index the features of the segments it touched. */
  const removePoint = (index: number) => {
    const points = layout.points.filter((_, i) => i !== index);
    const features: Record<number, EnclosureFeature[]> = {};
    Object.entries(layout.features).forEach(([k, list]) => {
      const seg = Number(k);
      if (seg === index || seg === index - 1) return; // segments destroyed by the deletion
      features[seg > index ? seg - 1 : seg] = list;
    });
    onChange({ points, closed: points.length > 2 ? layout.closed : false, features });
  };

  const deleteSelection = () => {
    if (!selection) return;
    if (selection.type === 'point') {
      removePoint(selection.index);
    } else if (selection.type === 'feature') {
      const list = featuresOf(selection.segIndex).filter((_, i) => i !== selection.featIndex);
      const features = { ...layout.features };
      if (list.length) features[selection.segIndex] = list;
      else delete features[selection.segIndex];
      onChange({ ...layout, features });
    } else if (selection.type === 'segment') {
      // Removing a wall line: open the loop if it is the closing run, otherwise drop its end point
      const isClosing = layout.closed && selection.segIndex === layout.points.length - 1;
      if (isClosing) {
        onChange({ ...layout, closed: false });
      } else {
        removePoint(selection.segIndex + 1);
      }
    }
    setSelection(null);
  };

  const deleteRef = React.useRef(deleteSelection);
  deleteRef.current = deleteSelection;
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (!selection) return;
      e.preventDefault();
      deleteRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection]);

  const handleDown = (e: React.MouseEvent) => {
    const p = toLocal(e);
    if (mode === 'select') {
      const idx = selectAt(p);
      if (idx >= 0) setDragIndex(idx);
      return;
    }
    if (mode === 'door' || mode === 'house') {
      const { index, t } = hitSegment(p);
      if (index < 0) return;
      tagFeature(index, mode === 'door' ? 'door' : 'house', t);
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
    const features: Record<number, EnclosureFeature[]> = {};
    Object.entries(layout.features).forEach(([k, list]) => {
      if (Number(k) < nextLen - 1) features[Number(k)] = list;
    });
    onChange({ points: layout.points.slice(0, -1), closed: false, features });
  };

  const clear = () => {
    setSelection(null);
    onChange({ points: [], closed: false, features: {} });
  };

  const preset = (w: number, d: number) => {
    const widthPx = w * PX_PER_FT;
    const depthPx = d * PX_PER_FT;
    const ox = Math.round((size.w - widthPx) / 2 / PX_PER_FT) * PX_PER_FT;
    const oy = Math.round((size.h - depthPx) / 2 / PX_PER_FT) * PX_PER_FT;
    setSelection(null);
    onChange({
      points: [
        { x: ox, y: oy },
        { x: ox + widthPx, y: oy },
        { x: ox + widthPx, y: oy + depthPx },
        { x: ox, y: oy + depthPx },
      ],
      closed: true,
      features: { 0: [{ kind: 'house', start: 0, end: 1 }] },
    });
  };

  const selectionLabel = (() => {
    if (!selection) return null;
    if (selection.type === 'point') return `Corner ${selection.index + 1}`;
    if (selection.type === 'segment') return `Wall line ${selection.segIndex + 1}`;
    const f = featuresOf(selection.segIndex)[selection.featIndex];
    if (!f) return null;
    return f.kind === 'door' ? doorById(f.doorTypeId).label : 'House-attached wall';
  })();

  const drawnCounts = countDrawnDoors(layout);

  return (
    <div className="space-y-3">
      <div className="rounded-xl glass-tile p-2">
      {header && <div className="px-1 pt-1 pb-3">{header}</div>}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={mode === 'draw' ? 'default' : 'ghost'} onClick={() => { setMode('draw'); setSelection(null); }}>
          <Ruler className="h-3.5 w-3.5 mr-1" /> Draw footprint
        </Button>
        <Button size="sm" variant={mode === 'select' ? 'default' : 'ghost'} onClick={() => setMode('select')}>
          <MousePointer2 className="h-3.5 w-3.5 mr-1" /> Select &amp; delete
        </Button>
        <Button size="sm" variant={mode === 'door' ? 'default' : 'ghost'} onClick={() => { setMode('door'); setSelection(null); }}>
          <DoorOpen className="h-3.5 w-3.5 mr-1" /> Place door
        </Button>
        <Button size="sm" variant={mode === 'house' ? 'default' : 'ghost'} onClick={() => { setMode('house'); setSelection(null); }}>
          <Home className="h-3.5 w-3.5 mr-1" /> Tag house wall
        </Button>
        <div className="mx-1 h-5 w-px bg-border/60" />
        <Button size="sm" variant="ghost" onClick={undo}>
          <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
        </Button>
        <Button size="sm" variant="ghost" onClick={clear}>
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
        {!compact && (
          <>
            <div className="mx-1 h-5 w-px bg-border/60" />
            <Button size="sm" variant="outline" onClick={() => preset(30, 20)}>
              <Square className="h-3.5 w-3.5 mr-1" /> 30 x 20
            </Button>
            <Button size="sm" variant="outline" onClick={() => preset(40, 24)}>
              <Square className="h-3.5 w-3.5 mr-1" /> 40 x 24
            </Button>
          </>
        )}
        <BoardDensityToggle compact={compact} onToggle={toggleDensity} className="ml-auto" />
      </div>
      </div>

      {/* Glass door carousel — pick a model, then click a wall to drop it in */}
      {mode === 'door' && (
        <div className="rounded-2xl glass-panel-soft p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="quote-eyebrow">Door models</p>
              {!compact && (
                <p className="text-[11px] text-muted-foreground">
                  Select a model, then click any wall line to drop it into the plan. It is added to your shopping list automatically.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
            {ENCLOSURE_DOORS.map(d => {
              const active = d.id === doorTypeId;
              const placedCount = drawnCounts[d.id] || 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDoorTypeId(d.id)}
                  className={`snap-start shrink-0 w-[220px] text-left rounded-xl p-3 transition-all duration-300 backdrop-blur-xl border ${
                    active
                      ? 'border-primary/70 bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]'
                      : 'border-white/20 bg-white/10 hover:bg-white/20 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <DoorOpen className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    {placedCount > 0 && (
                      <span className="text-[10px] font-semibold rounded-full bg-primary/15 text-primary px-2 py-0.5">
                        {placedCount} placed
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold mt-2 leading-tight line-clamp-2">{d.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {d.widthFt} ft wide{d.selfLatching ? ' • self-latching' : ''}
                  </p>
                  <p className="text-sm font-semibold mt-1.5 tabular-nums">${d.price.toLocaleString()}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'select' && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl glass-tile px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            {selectionLabel ? 'Selected:' : 'Click a door, house wall, wall line or corner to select it.'}
          </p>
          {selectionLabel && (
            <>
              <span className="text-xs font-semibold">{selectionLabel}</span>
              <Button size="sm" variant="destructive" className="h-7 ml-auto" onClick={deleteSelection}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
              <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelection(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      )}

      <div ref={wrapRef} className="rounded-2xl glass-panel-soft overflow-hidden p-1.5">
        <div className="rounded-xl overflow-hidden">
          <canvas
            ref={canvasRef}
            style={{ width: size.w, height: size.h, position: 'relative', cursor: mode === 'select' ? 'pointer' : 'crosshair', display: 'block' }}
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

      {!compact && (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Area', value: `${takeoff.areaSqFt.toLocaleString()} sq ft` },
          { label: 'Perimeter', value: `${takeoff.perimeterFt.toLocaleString()} ft` },
          { label: 'Screened wall', value: `${takeoff.screenWallFt.toLocaleString()} ft` },
          { label: 'House-attached', value: `${takeoff.houseWallFt.toLocaleString()} ft` },
          { label: 'Longest span', value: `${takeoff.longestSpanFt.toFixed(1)} ft` },
        ].map(item => (
          <div key={item.label} className="rounded-xl glass-tile px-3 py-2">
            <p className="quote-eyebrow">{item.label}</p>
            <p className="text-sm font-semibold tabular-nums mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default EnclosureDrawingBoard;
