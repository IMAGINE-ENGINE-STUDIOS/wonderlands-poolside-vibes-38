import { useDraggablePanel } from './useDraggablePanel';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, ArrowUpDown, RefreshCw, Plus, Trash2, RotateCw, Repeat, Crosshair } from 'lucide-react';
import { LinearDepthAnchor, PerimeterDepthPoint, DepthAxis, Point } from './types';
import {
  DEPTH_PRESETS,
  MAX_FLOOR_DEPTH,
  MIN_FLOOR_DEPTH,
  axisAngleDeg,
  axisCenter,
  axisLength,
  buildAxis,
  createDefaultDepthAxis,
  createDefaultLinearAnchors,
  getPoolBounds,
  positionAlongAxis,
} from './depthUtils';

interface DepthProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  linearDepthAnchors: LinearDepthAnchor[];
  onLinearDepthAnchorsChange: (anchors: LinearDepthAnchor[]) => void;
  selectedAnchorId: string | null;
  onSelectAnchor: (id: string | null) => void;
  // Pool depth from selected product
  poolShallowDepth?: number;
  poolDeepDepth?: number;
  /** Pool outline (plan feet) used to draw the axis gizmo over the real shape */
  poolPoints?: Point[];
  poolDimensions?: { length: number; width: number; depth?: number };
  /** Direction the profile runs across the pool — movable and rotatable */
  depthAxis?: DepthAxis;
  onDepthAxisChange?: (axis: DepthAxis) => void;
  // Perimeter depth points, kept so callers can still read the resolved floor
  perimeterDepthPoints?: PerimeterDepthPoint[];
  onPerimeterDepthPointsChange?: (points: PerimeterDepthPoint[]) => void;
  /** Pool shape editing (wall spline points) */
  shapeEditEnabled?: boolean;
  onShapeEditToggle?: () => void;
  /** Fly the camera to a corner and freeze it until Done */
  onFocusCorner?: (index: number) => void;
  activeCornerIndex?: number | null;
}

const clampDepth = (v: number) => Math.max(MIN_FLOOR_DEPTH, Math.min(MAX_FLOOR_DEPTH, v));
const MAX_ANCHORS = 16;

/* ------------------------------------------------------------------ *
 * Section chart: shallow (left) → deep (right). Every point is
 * draggable (vertical = depth, horizontal = position; end points move
 * vertically only). Clicking the floor line adds a point exactly there.
 * ------------------------------------------------------------------ */
const SC_W = 420, SC_H = 170, SC_L = 30, SC_R = 12, SC_T = 18, SC_B = 14;
function SectionChart({
  anchors, selectedAnchorId, onSelect, onMove, onAdd,
}: {
  anchors: LinearDepthAnchor[];
  selectedAnchorId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, position: number, depth: number) => void;
  onAdd: (position: number, depth: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragId = useRef<string | null>(null);
  const plotW = SC_W - SC_L - SC_R, plotH = SC_H - SC_T - SC_B;
  const toX = (p: number) => SC_L + p * plotW;
  const toY = (d: number) => SC_T + (d / MAX_FLOOR_DEPTH) * plotH;
  const fromEvent = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * SC_W;
    const y = ((e.clientY - r.top) / r.height) * SC_H;
    return {
      pos: Math.max(0, Math.min(1, (x - SC_L) / plotW)),
      depth: Math.round(((y - SC_T) / plotH) * MAX_FLOOR_DEPTH * 10) / 10,
    };
  };
  const path = anchors.map((a, i) => `${i ? 'L' : 'M'} ${toX(a.position)},${toY(a.depth)}`).join(' ');
  const fill = `M ${toX(0)},${SC_T} ${anchors.map((a) => `L ${toX(a.position)},${toY(a.depth)}`).join(' ')} L ${toX(1)},${SC_T} Z`;
  const grid = Array.from({ length: Math.floor(MAX_FLOOR_DEPTH / 2) + 1 }, (_, i) => i * 2);

  return (
    <div className="bg-muted/30 rounded-lg border p-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SC_W} ${SC_H}`}
        className="w-full touch-none select-none"
        onPointerMove={(e) => {
          if (!dragId.current) return;
          const { pos, depth } = fromEvent(e);
          onMove(dragId.current, pos, depth);
        }}
        onPointerUp={() => { dragId.current = null; }}
        onPointerLeave={() => { dragId.current = null; }}
      >
        {grid.map((d) => (
          <g key={d}>
            <line x1={SC_L} x2={SC_W - SC_R} y1={toY(d)} y2={toY(d)} stroke="hsl(var(--border))" strokeWidth="0.6" />
            <text x={SC_L - 5} y={toY(d) + 3} fontSize="9" textAnchor="end" fill="hsl(var(--muted-foreground))">{d}'</text>
          </g>
        ))}
        <line x1={SC_L} x2={SC_W - SC_R} y1={SC_T} y2={SC_T} stroke="hsl(var(--primary))" strokeWidth="2" />
        <text x={SC_L} y={SC_T - 6} fontSize="9" fill="hsl(var(--muted-foreground))">Shallow</text>
        <text x={SC_W - SC_R} y={SC_T - 6} fontSize="9" textAnchor="end" fill="hsl(var(--muted-foreground))">Deep</text>
        <path d={fill} fill="hsl(var(--primary) / 0.15)" />
        {/* Wide invisible hit line: click to add a point here */}
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth="14"
          style={{ cursor: 'copy' }}
          onPointerDown={(e) => {
            if (dragId.current) return;
            const { pos, depth } = fromEvent(e);
            onAdd(pos, depth);
          }}
        />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" pointerEvents="none" />
        {anchors.map((a, i) => {
          const sel = selectedAnchorId === a.id;
          const isEnd = i === 0 || i === anchors.length - 1;
          return (
            <g key={a.id}>
              <circle
                cx={toX(a.position)}
                cy={toY(a.depth)}
                r={sel ? 8 : 6}
                fill={sel ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                style={{ cursor: isEnd ? 'ns-resize' : 'move' }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId);
                  dragId.current = a.id;
                  onSelect(a.id);
                }}
              />
              <text x={toX(a.position)} y={toY(a.depth) + 20} fontSize="10" fontWeight="600" textAnchor="middle" fill="hsl(var(--foreground))" pointerEvents="none">
                {a.depth.toFixed(1)}'
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Plan-view gizmo: the depth axis sitting inside the pool outline.
 * Drag either end to rotate / stretch, drag the shaft to slide it.
 * ------------------------------------------------------------------ */
const VB = 240;
const PAD = 18;

function DepthAxisPlan({
  poolPoints,
  axis,
  anchors,
  onAxisChange,
}: {
  poolPoints: Point[];
  axis: DepthAxis;
  anchors: LinearDepthAnchor[];
  onAxisChange: (axis: DepthAxis) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drag, setDrag] = useState<'start' | 'end' | 'shaft' | null>(null);
  const dragOffset = useRef({ x: 0, z: 0 });

  const bounds = useMemo(() => getPoolBounds(poolPoints), [poolPoints]);

  /** Normalised (centred) plan points, matching the 3D geometry origin. */
  const outline = useMemo(
    () => poolPoints.map((p) => ({ x: p.x - bounds.centerX, z: p.y - bounds.centerZ })),
    [poolPoints, bounds],
  );

  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanZ = Math.max(1, bounds.maxZ - bounds.minZ);
  const scale = (VB - PAD * 2) / Math.max(spanX, spanZ) / 1.15;

  const toSvg = useCallback(
    (x: number, z: number) => ({ x: VB / 2 + x * scale, y: VB / 2 + z * scale }),
    [scale],
  );

  const toPlan = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, z: 0 };
      const r = svg.getBoundingClientRect();
      const sx = ((clientX - r.left) / r.width) * VB;
      const sy = ((clientY - r.top) / r.height) * VB;
      return { x: (sx - VB / 2) / scale, z: (sy - VB / 2) / scale };
    },
    [scale],
  );

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const p = toPlan(e.clientX, e.clientY);
    if (drag === 'start') onAxisChange({ ...axis, start: p });
    else if (drag === 'end') onAxisChange({ ...axis, end: p });
    else {
      const c = axisCenter(axis);
      const dx = p.x - dragOffset.current.x - c.x;
      const dz = p.z - dragOffset.current.z - c.z;
      onAxisChange({
        start: { x: axis.start.x + dx, z: axis.start.z + dz },
        end: { x: axis.end.x + dx, z: axis.end.z + dz },
      });
    }
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    setDrag(null);
  };

  const grab = (which: 'start' | 'end' | 'shaft') => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as SVGElement).ownerSVGElement?.setPointerCapture(e.pointerId);
    if (which === 'shaft') {
      const p = toPlan(e.clientX, e.clientY);
      const c = axisCenter(axis);
      dragOffset.current = { x: p.x - c.x, z: p.z - c.z };
    }
    setDrag(which);
  };

  const a = toSvg(axis.start.x, axis.start.z);
  const b = toSvg(axis.end.x, axis.end.z);
  const path = outline.length
    ? outline.map((p, i) => {
        const s = toSvg(p.x, p.z);
        return `${i === 0 ? 'M' : 'L'} ${s.x.toFixed(1)},${s.y.toFixed(1)}`;
      }).join(' ') + ' Z'
    : '';

  const shallow = anchors.length ? Math.min(...anchors.map((x) => x.depth)) : 0;
  const deep = anchors.length ? Math.max(...anchors.map((x) => x.depth)) : 0;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="180"
      viewBox={`0 0 ${VB} ${VB}`}
      className="touch-none select-none"
      onPointerMove={handleMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* depth shading of the floor, sampled on a coarse grid */}
      {outline.length > 2 &&
        Array.from({ length: 18 }).map((_, gx) =>
          Array.from({ length: 18 }).map((__, gz) => {
            const x = bounds.minX - bounds.centerX + ((gx + 0.5) / 18) * spanX;
            const z = bounds.minZ - bounds.centerZ + ((gz + 0.5) / 18) * spanZ;
            const t = positionAlongAxis(x, z, axis);
            const s = toSvg(x, z);
            const cell = (spanX / 18) * scale + 1;
            return (
              <rect
                key={`${gx}-${gz}`}
                x={s.x - cell / 2}
                y={s.y - ((spanZ / 18) * scale + 1) / 2}
                width={cell}
                height={(spanZ / 18) * scale + 1}
                fill="hsl(var(--primary))"
                opacity={0.06 + t * 0.34}
                pointerEvents="none"
              />
            );
          }),
        )}

      {/* pool outline */}
      {path && (
        <path
          d={path}
          fill="hsl(var(--primary) / 0.06)"
          stroke="hsl(var(--primary))"
          strokeWidth="1.6"
          pointerEvents="none"
        />
      )}

      {/* axis shaft */}
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="hsl(var(--foreground))"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0"
        className="cursor-move"
        onPointerDown={grab('shaft')}
      />
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        strokeDasharray="6 4"
        pointerEvents="none"
      />

      {/* shallow handle */}
      <circle
        cx={a.x}
        cy={a.y}
        r="9"
        fill="transparent"
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={grab('start')}
      />
      <circle cx={a.x} cy={a.y} r="5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2.2" pointerEvents="none" />
      <text x={a.x} y={a.y - 9} fontSize="9" textAnchor="middle" fill="hsl(var(--foreground))" pointerEvents="none">
        {shallow.toFixed(1)}'
      </text>

      {/* deep handle */}
      <circle
        cx={b.x}
        cy={b.y}
        r="9"
        fill="transparent"
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={grab('end')}
      />
      <circle cx={b.x} cy={b.y} r="5" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2.2" pointerEvents="none" />
      <text x={b.x} y={b.y - 9} fontSize="9" textAnchor="middle" fill="hsl(var(--foreground))" pointerEvents="none">
        {deep.toFixed(1)}'
      </text>
    </svg>
  );
}

export function DepthProfileEditor({
  isOpen,
  onClose,
  linearDepthAnchors,
  onLinearDepthAnchorsChange,
  selectedAnchorId,
  onSelectAnchor,
  poolShallowDepth = 3.75,
  poolDeepDepth = 8.5,
  poolPoints = [],
  poolDimensions,
  depthAxis,
  onDepthAxisChange,
  shapeEditEnabled = false,
  onShapeEditToggle,
  onFocusCorner,
  activeCornerIndex = null,
}: DepthProfileEditorProps) {
  // Initialize anchors from props or defaults
  const [anchors, setAnchors] = useState<LinearDepthAnchor[]>(() => {
    if (linearDepthAnchors.length >= 2) {
      return [...linearDepthAnchors].sort((a, b) => a.position - b.position);
    }
    return createDefaultLinearAnchors(poolShallowDepth, poolDeepDepth);
  });

  // Sync from props when they change externally
  useEffect(() => {
    if (linearDepthAnchors.length >= 2) {
      setAnchors([...linearDepthAnchors].sort((a, b) => a.position - b.position));
    }
  }, [linearDepthAnchors]);

  const axis = useMemo(
    () => depthAxis ?? createDefaultDepthAxis(poolPoints, poolDimensions),
    [depthAxis, poolPoints, poolDimensions],
  );

  const setAxis = (next: DepthAxis) => onDepthAxisChange?.(next);

  // Update parent when anchors change
  const updateAnchors = (newAnchors: LinearDepthAnchor[]) => {
    const sorted = [...newAnchors].sort((a, b) => a.position - b.position);
    setAnchors(sorted);
    onLinearDepthAnchorsChange(sorted);
  };

  const handleAnchorDepthChange = (id: string, newDepth: number) => {
    updateAnchors(anchors.map((a) => (a.id === id ? { ...a, depth: clampDepth(newDepth) } : a)));
  };

  const handleAnchorPositionChange = (id: string, newPosition: number) => {
    const anchor = anchors.find((a) => a.id === id);
    if (!anchor) return;

    // Don't allow moving first (0%) or last (100%) anchors
    const sorted = [...anchors].sort((a, b) => a.position - b.position);
    if (anchor.id === sorted[0].id || anchor.id === sorted[sorted.length - 1].id) {
      return;
    }

    const clampedPos = Math.max(0.01, Math.min(0.99, newPosition));
    updateAnchors(anchors.map((a) => (a.id === id ? { ...a, position: clampedPos } : a)));
  };

  const handleResetToProductDepths = () => {
    updateAnchors(createDefaultLinearAnchors(poolShallowDepth, poolDeepDepth));
  };

  const handleAddAnchor = () => {
    if (anchors.length >= MAX_ANCHORS) return;

    const sorted = [...anchors].sort((a, b) => a.position - b.position);
    let maxGap = 0;
    let insertPos = 0.5;
    let insertDepth = (poolShallowDepth + poolDeepDepth) / 2;

    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        insertPos = (sorted[i].position + sorted[i + 1].position) / 2;
        insertDepth = (sorted[i].depth + sorted[i + 1].depth) / 2;
      }
    }

    updateAnchors([...anchors, { id: `d${Date.now()}`, position: insertPos, depth: insertDepth }]);
  };

  const handleRemoveAnchor = (id: string) => {
    if (anchors.length <= 2) return;
    const sorted = [...anchors].sort((a, b) => a.position - b.position);
    if (id === sorted[0].id || id === sorted[sorted.length - 1].id) return;
    updateAnchors(anchors.filter((a) => a.id !== id));
  };

  /* ---- axis controls ---- */
  const angle = Math.round(axisAngleDeg(axis));
  const length = axisLength(axis);

  const rotateTo = (deg: number) => setAxis(buildAxis(deg, length, axisCenter(axis)));
  const flipAxis = () => setAxis({ start: axis.end, end: axis.start });
  const fitToPool = () => setAxis(createDefaultDepthAxis(poolPoints, poolDimensions));
  const centerAxis = () => setAxis(buildAxis(angle, length, { x: 0, z: 0 }));
  const setAxisLength = (val: number) => setAxis(buildAxis(angle, Math.max(1, val), axisCenter(axis)));

  const dragPanel = useDraggablePanel('depth');
  if (!isOpen) return null;

  const sortedAnchors = [...anchors].sort((a, b) => a.position - b.position);
  const shallowAnchor = sortedAnchors[0];
  const deepAnchor = sortedAnchors[sortedAnchors.length - 1];
  const maxAxisLength = Math.max(
    8,
    Math.round(
      Math.hypot(
        (poolDimensions?.width ?? 20),
        (poolDimensions?.length ?? 40),
      ) * 1.2,
    ),
  );

  return (
    <div {...dragPanel.panelProps} className="absolute top-4 left-1/2 -translate-x-1/2 w-[460px] max-w-[calc(100vw-2rem)] bg-background/95 backdrop-blur-sm rounded-xl border shadow-xl z-30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Pool Bottom / Depth Profile</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-4 max-h-[70vh] overflow-y-auto">
        <p className="text-xs text-muted-foreground">
          Place the depth direction across the pool, then shape the floor along it. Changes apply to
          the 3D bottom live.
        </p>

        {/* Bottom style presets */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Bottom style</Label>
          <div className="grid grid-cols-2 gap-2">
            {DEPTH_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                className="h-auto min-h-[52px] py-2 px-3 whitespace-normal text-left flex-col items-start justify-start gap-1"
                title={preset.description}
                onClick={() => updateAnchors(preset.build(poolShallowDepth, poolDeepDepth))}
              >
                <span className="text-xs font-semibold leading-tight">{preset.label}</span>
                <span className="text-[10px] font-normal leading-snug text-muted-foreground break-words">
                  {preset.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Depth direction gizmo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Depth direction (plan view)</Label>
            <span className="text-[10px] text-muted-foreground">{angle}° · {length.toFixed(1)} ft</span>
          </div>
          <div className="bg-muted/30 rounded-lg border p-2">
            <DepthAxisPlan
              poolPoints={poolPoints}
              axis={axis}
              anchors={sortedAnchors}
              onAxisChange={setAxis}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Drag the light dot (shallow) or dark dot (deep) to aim the slope · drag the dashed line to
            move it across the shell.
          </p>

          <div className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Slider
              value={[angle]}
              min={-180}
              max={180}
              step={1}
              onValueChange={([val]) => rotateTo(val)}
              className="flex-1"
            />
            <span className="text-[10px] w-9 text-right">{angle}°</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 rotate-90" />
            <Slider
              value={[Math.min(length, maxAxisLength)]}
              min={2}
              max={maxAxisLength}
              step={0.5}
              onValueChange={([val]) => setAxisLength(val)}
              className="flex-1"
            />
            <span className="text-[10px] w-9 text-right">{length.toFixed(0)}'</span>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px]" onClick={fitToPool}>
              <Crosshair className="w-3 h-3 mr-1" />Fit to pool
            </Button>
            <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px]" onClick={centerAxis}>
              Center
            </Button>
            <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px]" onClick={flipAxis}>
              <Repeat className="w-3 h-3 mr-1" />Flip
            </Button>
          </div>
        </div>

        {/* Product Depths Reference */}
        <div className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded-lg">
          <span>Product Spec:</span>
          <span className="font-medium">{poolShallowDepth.toFixed(1)}' - {poolDeepDepth.toFixed(1)}'</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleResetToProductDepths}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Depth Anchor Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Depth Anchors</Label>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleAddAnchor}
              disabled={anchors.length >= MAX_ANCHORS}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {sortedAnchors.map((anchor, index) => {
              const isEndpoint = index === 0 || index === sortedAnchors.length - 1;
              const label = index === 0 ? 'Shallow End' : index === sortedAnchors.length - 1 ? 'Deep End' : `Point ${index}`;

              return (
                <div
                  key={anchor.id}
                  className={`p-2 rounded-lg border ${selectedAnchorId === anchor.id ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                  onClick={() => onSelectAnchor(anchor.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {(anchor.position * 100).toFixed(0)}%
                      </span>
                      {!isEndpoint && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAnchor(anchor.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={anchor.depth.toFixed(1)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) handleAnchorDepthChange(anchor.id, val);
                      }}
                      className="h-7 text-xs w-16"
                      min={MIN_FLOOR_DEPTH}
                      max={MAX_FLOOR_DEPTH}
                      step="0.1"
                    />
                    <span className="text-xs text-muted-foreground">ft</span>
                    {!isEndpoint && (
                      <>
                        <div className="flex-1" />
                        <Input
                          type="number"
                          value={(anchor.position * 100).toFixed(0)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) / 100;
                            if (!isNaN(val)) handleAnchorPositionChange(anchor.id, val);
                          }}
                          className="h-7 text-xs w-14"
                          min="1"
                          max="99"
                          step="1"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Cut — drag points, click the floor line to add a point */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Section cut · shallow → deep</Label>
            <span className="text-[10px] text-muted-foreground">Drag points · click floor to add</span>
          </div>
          <SectionChart
            anchors={sortedAnchors}
            selectedAnchorId={selectedAnchorId}
            onSelect={onSelectAnchor}
            onMove={(id, pos, depth) => {
              const isEnd = id === shallowAnchor?.id || id === deepAnchor?.id;
              updateAnchors(
                anchors.map((a) =>
                  a.id === id
                    ? {
                        ...a,
                        depth: clampDepth(depth),
                        position: isEnd ? a.position : Math.max(0.01, Math.min(0.99, pos)),
                      }
                    : a,
                ),
              );
            }}
            onAdd={(pos, depth) => {
              if (anchors.length >= MAX_ANCHORS) return;
              const id = `d${Date.now()}`;
              updateAnchors([...anchors, { id, position: Math.max(0.01, Math.min(0.99, pos)), depth: clampDepth(depth) }]);
              onSelectAnchor(id);
            }}
          />
        </div>

        {/* Quick Depth Sliders */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Quick Adjust</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Shallow:</span>
              <Slider
                value={[shallowAnchor?.depth ?? poolShallowDepth]}
                min={MIN_FLOOR_DEPTH}
                max={6}
                step={0.25}
                onValueChange={([val]) => shallowAnchor && handleAnchorDepthChange(shallowAnchor.id, val)}
                className="flex-1"
              />
              <span className="text-xs w-10">{(shallowAnchor?.depth ?? poolShallowDepth).toFixed(1)}'</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Deep:</span>
              <Slider
                value={[deepAnchor?.depth ?? poolDeepDepth]}
                min={2}
                max={MAX_FLOOR_DEPTH}
                step={0.25}
                onValueChange={([val]) => deepAnchor && handleAnchorDepthChange(deepAnchor.id, val)}
                className="flex-1"
              />
              <span className="text-xs w-10">{(deepAnchor?.depth ?? poolDeepDepth).toFixed(1)}'</span>
            </div>
          </div>
        </div>

        {/* Pool Shape Editor — moved here from the finish settings.
            Selecting a corner flies the camera to it and freezes the view
            until the user presses Done (handled by the visualizer). */}
        {onShapeEditToggle && (
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Pool Shape Editor</Label>
              <Button
                size="sm"
                variant={shapeEditEnabled ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={onShapeEditToggle}
              >
                {shapeEditEnabled ? 'Editing walls' : 'Edit pool walls'}
              </Button>
            </div>
            {poolPoints && poolPoints.length > 0 && (
              <>
                <p className="text-[11px] text-muted-foreground">
                  Pick a corner: the camera moves to it and locks so you can drag the point.
                </p>
                <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto">
                  {poolPoints.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onFocusCorner?.(i)}
                      className={`h-7 rounded-md border text-[11px] font-medium transition-colors ${
                        activeCornerIndex === i
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/40 hover:border-primary/60'
                      }`}
                    >
                      C{i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="p-2 bg-primary/5 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="space-y-0.5">
            <li>• Set 0 ft at the shallow end for a zero-entry / beach edge</li>
            <li>• Rotate the axis for diagonal or corner-entry floors</li>
            <li>• Add anchors for shelves, benches and custom slope breaks</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
