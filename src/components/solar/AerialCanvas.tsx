// Wonderlands Solar — the aerial canvas.
//
// A small, dependency-free slippy map: Esri World Imagery tiles as positioned
// <img> layers with an SVG overlay for the captured roof planes, the live hand
// trace and its dimension labels. It replaces the Google Maps JavaScript API on
// this board so the aerial never depends on a referrer-restricted browser key
// (see src/lib/solar/aerialTiles.ts for why).
//
// Interaction: drag to pan, wheel or the +/− keys to zoom, click to capture,
// drag a vertex of the selected plane to correct its outline.

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import {
  AERIAL_CREDIT,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE,
  aerialTileUrl,
  feetPerPixel,
  worldLatLng,
  worldPx,
} from "@/lib/solar/aerialTiles";
import { distanceFt, type LatLng } from "@/lib/solar/solarEngine";

export interface AerialView {
  lat: number;
  lng: number;
  zoom: number;
}

export interface AerialFace {
  id: string;
  path: LatLng[];
  fill: string;
  stroke: string;
  fillOpacity: number;
  selected?: boolean;
  caption?: string;
}

interface Props {
  view: AerialView;
  onViewChange: (v: AerialView) => void;
  height: number;
  faces: AerialFace[];
  /** the in-progress hand trace, drawn as it is laid down */
  draft?: LatLng[];
  marker?: LatLng | null;
  /** true while a capture mode is armed — shows a crosshair cursor */
  capturing?: boolean;
  onMapClick?: (at: LatLng) => void;
  onFaceClick?: (id: string) => void;
  onVertexMove?: (faceId: string, index: number, at: LatLng) => void;
  /** Report the measured map size so the parent can sample the same frame for auto-trace. */
  onSizeChange?: (size: { width: number; height: number }) => void;
}

const AerialCanvas: React.FC<Props> = ({
  view,
  onViewChange,
  height,
  faces,
  draft = [],
  marker,
  capturing,
  onMapClick,
  onFaceClick,
  onVertexMove,
  onSizeChange,
}) => {
  const host = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 800, h: height });
  const drag = React.useRef<{ x: number; y: number; moved: number } | null>(null);
  const vertex = React.useRef<{ faceId: string; index: number } | null>(null);

  React.useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 800;
      const h = el.clientHeight || height;
      setSize({ w, h });
      onSizeChange?.({ width: w, height: h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [height, onSizeChange]);

  /* ── projection between screen pixels and coordinates ───────────────── */

  const centre = worldPx({ lat: view.lat, lng: view.lng }, view.zoom);
  const toScreen = React.useCallback(
    (at: LatLng) => {
      const p = worldPx(at, view.zoom);
      return { x: p.x - centre.x + size.w / 2, y: p.y - centre.y + size.h / 2 };
    },
    [centre.x, centre.y, size.w, size.h, view.zoom],
  );
  const toLatLng = React.useCallback(
    (x: number, y: number) => worldLatLng(centre.x + x - size.w / 2, centre.y + y - size.h / 2, view.zoom),
    [centre.x, centre.y, size.w, size.h, view.zoom],
  );

  const local = (e: React.PointerEvent | React.MouseEvent | PointerEvent) => {
    const r = host.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  /* ── tiles ─────────────────────────────────────────────────────────── */

  const tiles = React.useMemo(() => {
    const z = Math.round(view.zoom);
    const zc = worldPx({ lat: view.lat, lng: view.lng }, z);
    const k = 2 ** (view.zoom - z); // fractional zoom is applied as a scale
    const originX = zc.x - size.w / (2 * k);
    const originY = zc.y - size.h / (2 * k);
    const span = 2 ** z;
    const out: Array<{ key: string; url: string; left: number; top: number; px: number }> = [];
    const px = TILE * k;
    for (let tx = Math.floor(originX / TILE); tx <= Math.floor((originX + size.w / k) / TILE); tx++)
      for (let ty = Math.floor(originY / TILE); ty <= Math.floor((originY + size.h / k) / TILE); ty++) {
        if (ty < 0 || ty >= span) continue;
        const wrapped = ((tx % span) + span) % span;
        out.push({
          key: `${z}/${wrapped}/${ty}`,
          url: aerialTileUrl(z, wrapped, ty),
          left: (tx * TILE - originX) * k,
          top: (ty * TILE - originY) * k,
          px,
        });
      }
    return out;
  }, [view.lat, view.lng, view.zoom, size.w, size.h]);

  /* ── pan, zoom, click ──────────────────────────────────────────────── */

  const zoomBy = (delta: number, anchor?: { x: number; y: number }) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom + delta));
    if (next === view.zoom) return;
    if (!anchor) return onViewChange({ ...view, zoom: next });
    /* keep the point under the cursor fixed while zooming */
    const at = toLatLng(anchor.x, anchor.y);
    const p = worldPx(at, next);
    const c = worldLatLng(p.x - (anchor.x - size.w / 2), p.y - (anchor.y - size.h / 2), next);
    onViewChange({ lat: c.lat, lng: c.lng, zoom: next });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (vertex.current) return;
    const p = local(e);
    drag.current = { x: p.x, y: p.y, moved: 0 };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = local(e);
    if (vertex.current) {
      const { faceId, index } = vertex.current;
      onVertexMove?.(faceId, index, toLatLng(p.x, p.y));
      return;
    }
    const d = drag.current;
    if (!d) return;
    const dx = p.x - d.x;
    const dy = p.y - d.y;
    if (!dx && !dy) return;
    d.moved += Math.abs(dx) + Math.abs(dy);
    d.x = p.x;
    d.y = p.y;
    const c = worldLatLng(centre.x - dx, centre.y - dy, view.zoom);
    onViewChange({ lat: c.lat, lng: c.lng, zoom: view.zoom });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (vertex.current) {
      vertex.current = null;
      drag.current = null;
      return;
    }
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved > 6) return; // it was a pan, not a click
    const p = local(e);
    onMapClick?.(toLatLng(p.x, p.y));
  };

  const ftPerPx = feetPerPixel(view.lat, view.zoom);
  const barFeet = [10, 20, 30, 50, 100, 200].find((f) => f / ftPerPx > 60) ?? 200;

  return (
    <div
      ref={host}
      style={{ height, touchAction: "none", cursor: capturing ? "crosshair" : "grab" }}
      className="relative w-full select-none overflow-hidden bg-[#101014]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={(e) => {
        e.preventDefault();
        zoomBy(e.deltaY < 0 ? 1 : -1, local(e));
      }}
    >
      {/* imagery */}
      {tiles.map((t) => (
        <img
          key={t.key}
          src={t.url}
          alt=""
          draggable={false}
          loading="eager"
          decoding="async"
          className="pointer-events-none absolute"
          style={{ left: t.left, top: t.top, width: t.px, height: t.px }}
        />
      ))}

      {/* geometry */}
      <svg className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
        {faces.map((f) => {
          const pts = f.path.map(toScreen);
          if (pts.length < 3) return null;
          const d = `${pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} Z`;
          const cx = pts.reduce((n, p) => n + p.x, 0) / pts.length;
          const cy = pts.reduce((n, p) => n + p.y, 0) / pts.length;
          return (
            <g key={f.id}>
              <path
                d={d}
                fill={f.fill}
                fillOpacity={f.fillOpacity}
                stroke={f.selected ? "#ffffff" : f.stroke}
                strokeWidth={f.selected ? 2.5 : 1.5}
                style={{ cursor: "pointer", pointerEvents: "auto" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onFaceClick?.(f.id);
                }}
              />
              {f.caption && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  className="pointer-events-none"
                  style={{ fontSize: 11, fill: "#fff", paintOrder: "stroke", stroke: "#0a0a0f", strokeWidth: 3 }}
                >
                  {f.caption}
                </text>
              )}
              {f.selected &&
                pts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="#ffffff"
                    stroke="#0a0a0f"
                    strokeWidth={1.5}
                    style={{ cursor: "move", pointerEvents: "auto" }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      (e.target as Element).setPointerCapture?.(e.pointerId);
                      vertex.current = { faceId: f.id, index: i };
                    }}
                  />
                ))}
            </g>
          );
        })}

        {/* live hand trace: spline, vertices and a length on every side */}
        {draft.length > 0 &&
          (() => {
            const pts = draft.map(toScreen);
            const closed = draft.length >= 3;
            const sides = closed ? draft.length : draft.length - 1;
            return (
              <g className="pointer-events-none">
                {closed && (
                  <path
                    d={`${pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ")} Z`}
                    fill="#f97316"
                    fillOpacity={0.22}
                  />
                )}
                <polyline
                  points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                />
                {pts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={i === pts.length - 1 ? "#f97316" : "#ffffff"}
                    stroke="#0a0a0f"
                    strokeWidth={1.5}
                  />
                ))}
                {Array.from({ length: Math.max(0, sides) }).map((_, i) => {
                  const a = draft[i];
                  const b = draft[(i + 1) % draft.length];
                  const feet = distanceFt(a, b);
                  if (feet < 1) return null;
                  const pa = pts[i];
                  const pb = pts[(i + 1) % pts.length];
                  return (
                    <text
                      key={`d${i}`}
                      x={(pa.x + pb.x) / 2}
                      y={(pa.y + pb.y) / 2 - 6}
                      textAnchor="middle"
                      style={{
                        fontSize: 11,
                        fill: "#fff",
                        paintOrder: "stroke",
                        stroke: "#0a0a0f",
                        strokeWidth: 3.5,
                        letterSpacing: ".04em",
                      }}
                    >
                      {feet.toFixed(1)} ft
                    </text>
                  );
                })}
              </g>
            );
          })()}

        {marker &&
          (() => {
            const p = toScreen(marker);
            return (
              <g className="pointer-events-none">
                <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="#ffffff" strokeWidth={2} />
                <circle cx={p.x} cy={p.y} r={2} fill="#ffffff" />
              </g>
            );
          })()}
      </svg>

      {/* zoom + scale + credit */}
      <div className="absolute right-3 top-3 flex flex-col border border-white/25 bg-black/45 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Zoom in"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => zoomBy(1)}
          className="p-2 text-white/90 hover:bg-white/15"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => zoomBy(-1)}
          className="border-t border-white/25 p-2 text-white/90 hover:bg-white/15"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-3 text-[8px] uppercase tracking-[0.2em] text-white/70">
        <span className="flex items-center gap-1">
          <span className="inline-block border-b-2 border-white/70" style={{ width: barFeet / ftPerPx }} />
          {barFeet} ft
        </span>
        <span className="normal-case tracking-normal">{AERIAL_CREDIT}</span>
      </div>
    </div>
  );
};

export default AerialCanvas;
