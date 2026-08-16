import * as React from "react";
import { Trash2, Plus } from "lucide-react";

export type DepthPoint = { id: string; position: number; depth: number };

const VB_W = 200;
const VB_H = 90;
const PAD_X = 6;
const TOP = 6;
const FLOOR = VB_H - 8;
const MAX_DEPTH = 12;
const MIN_DEPTH = 1;

const xOf = (position: number) => PAD_X + position * (VB_W - PAD_X * 2);
const yOf = (depth: number) => TOP + (depth / MAX_DEPTH) * (FLOOR - TOP);
const positionOf = (x: number) => (x - PAD_X) / (VB_W - PAD_X * 2);
const depthOf = (y: number) => ((y - TOP) / (FLOOR - TOP)) * MAX_DEPTH;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface Props {
  depthPoints: DepthPoint[];
  setDepthPoints: (updater: (prev: DepthPoint[]) => DepthPoint[]) => void;
}

/**
 * Interactive depth profile: drag anchors up/down (depth) and left/right
 * (position along the pool), click the water to add an anchor, right-click or
 * use the trash affordance to remove one. Two anchors are always kept so the
 * pool floor stays solvable.
 */
export default function DepthProfileEditor({ depthPoints, setDepthPoints }: Props) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () => [...depthPoints].sort((a, b) => a.position - b.position),
    [depthPoints],
  );

  const toViewBox = React.useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * VB_W,
      y: ((clientY - r.top) / r.height) * VB_H,
    };
  }, []);

  const updatePoint = React.useCallback(
    (id: string, patch: Partial<DepthPoint>) => {
      setDepthPoints((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    [setDepthPoints],
  );

  const removePoint = React.useCallback(
    (id: string) => {
      setDepthPoints((prev) => (prev.length <= 2 ? prev : prev.filter((d) => d.id !== id)));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [setDepthPoints],
  );

  const addPointAt = React.useCallback(
    (position: number, depth: number) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `dp_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
      setDepthPoints((prev) => [
        ...prev,
        { id, position: clamp(position, 0, 1), depth: clamp(depth, MIN_DEPTH, MAX_DEPTH) },
      ]);
      setSelectedId(id);
    },
    [setDepthPoints],
  );

  // Pointer drag on the whole surface so the anchor keeps following outside its hit box.
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragId) return;
    const { x, y } = toViewBox(e.clientX, e.clientY);
    updatePoint(dragId, {
      position: clamp(positionOf(x), 0, 1),
      depth: clamp(Number(depthOf(y).toFixed(1)), MIN_DEPTH, MAX_DEPTH),
    });
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragId) return;
    try {
      (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released */
    }
    setDragId(null);
  };

  const handleSurfaceClick = (e: React.MouseEvent<SVGRectElement>) => {
    const { x, y } = toViewBox(e.clientX, e.clientY);
    addPointAt(positionOf(x), depthOf(y));
  };

  const area = React.useMemo(() => {
    if (sorted.length === 0) return "";
    let d = `M ${xOf(sorted[0].position)},${TOP}`;
    sorted.forEach((dp) => {
      d += ` L ${xOf(dp.position)},${yOf(dp.depth)}`;
    });
    d += ` L ${xOf(sorted[sorted.length - 1].position)},${TOP} Z`;
    return d;
  }, [sorted]);

  const selected = sorted.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="space-y-1.5">
      <div className="bg-muted/20 rounded p-2">
        <svg
          ref={svgRef}
          width="100%"
          height="110"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="touch-none select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* depth grid */}
          {[3, 6, 9, 12].map((ft) => (
            <g key={ft}>
              <line
                x1={PAD_X}
                y1={yOf(ft)}
                x2={VB_W - PAD_X}
                y2={yOf(ft)}
                stroke="currentColor"
                strokeWidth="0.4"
                className="text-muted-foreground"
                opacity="0.3"
              />
              <text
                x={VB_W - PAD_X + 1}
                y={yOf(ft) + 2}
                fontSize="4"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {ft}
              </text>
            </g>
          ))}

          {/* click-to-add surface, sits under the anchors */}
          <rect
            x={PAD_X}
            y={TOP}
            width={VB_W - PAD_X * 2}
            height={FLOOR - TOP}
            fill="transparent"
            className="cursor-copy"
            onClick={handleSurfaceClick}
          />

          {/* waterline */}
          <line
            x1={PAD_X}
            y1={TOP}
            x2={VB_W - PAD_X}
            y2={TOP}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0.6"
            pointerEvents="none"
          />

          <path
            d={area}
            fill="hsl(var(--primary)/0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            pointerEvents="none"
          />

          {sorted.map((dp) => {
            const isActive = dp.id === selectedId || dp.id === dragId;
            return (
              <g key={dp.id}>
                <circle
                  cx={xOf(dp.position)}
                  cy={yOf(dp.depth)}
                  r="6"
                  fill="transparent"
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(
                      e.pointerId,
                    );
                    setDragId(dp.id);
                    setSelectedId(dp.id);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removePoint(dp.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    removePoint(dp.id);
                  }}
                />
                <circle
                  cx={xOf(dp.position)}
                  cy={yOf(dp.depth)}
                  r={isActive ? 3.4 : 2.6}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth={isActive ? 1.2 : 0.6}
                  pointerEvents="none"
                />
                <text
                  x={xOf(dp.position)}
                  y={yOf(dp.depth) - 5}
                  fontSize="4.5"
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-foreground"
                  pointerEvents="none"
                >
                  {dp.depth.toFixed(1)}'
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] text-muted-foreground leading-tight">
          Drag anchors to reshape · click water to add · double-click or right-click to remove
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              const mid =
                sorted.length >= 2
                  ? {
                      position: (sorted[0].position + sorted[sorted.length - 1].position) / 2,
                      depth: (sorted[0].depth + sorted[sorted.length - 1].depth) / 2,
                    }
                  : { position: 0.5, depth: 5 };
              addPointAt(mid.position, mid.depth);
            }}
            className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[9px] hover:bg-muted"
          >
            <Plus className="h-2.5 w-2.5" />Add
          </button>
          <button
            type="button"
            disabled={!selected || depthPoints.length <= 2}
            onClick={() => selected && removePoint(selected.id)}
            className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[9px] hover:bg-muted disabled:opacity-40"
          >
            <Trash2 className="h-2.5 w-2.5" />Remove
          </button>
        </div>
      </div>
    </div>
  );
}
