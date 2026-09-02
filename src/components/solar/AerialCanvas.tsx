// Wonderlands Solar — the aerial canvas.
//
// A small, dependency-free slippy map: Esri World Imagery tiles as positioned
// <img> layers with an SVG overlay for the captured roof planes, the live hand
// trace and its dimension labels. It replaces the Google Maps JavaScript API on
// this board so the aerial never depends on a referrer-restricted browser key
// (see src/lib/solar/aerialTiles.ts for why).
//
// Camera model (rewritten for game-like control):
//  • one authoritative camera in `camRef`; every gesture writes through `apply()`
//    which clamps, keeps a fractional zoom and reports upward. Handlers are read
//    through refs so the native, non-passive wheel listener never sees stale state.
//  • wheel/pinch zoom is exponential and scaled by the delta magnitude, anchored
//    on the pointer — one trackpad flick no longer teleports the reader across
//    the county (the old code jumped a whole zoom level per wheel event).
//  • dragging pans on requestAnimationFrame and releases into a decaying glide,
//    so the imagery follows the hand and settles instead of stuttering.
//  • the +/- buttons, double click and the keyboard animate the same camera with
//    an eased tween, always anchored so the point of interest stays put.
//
// Interaction: drag to pan, wheel/pinch to zoom, click to capture, drag a vertex
// of the selected plane to correct its outline, double click to zoom in.

import * as React from "react";
import { Crosshair, Minus, Plus } from "lucide-react";
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

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
const ease = (t: number) => 1 - (1 - t) ** 3;

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
  const sizeRef = React.useRef(size);
  sizeRef.current = size;

  const [grabbing, setGrabbing] = React.useState(false);
  const vertex = React.useRef<{ faceId: string; index: number } | null>(null);

  /* ── the camera ─────────────────────────────────────────────────────── */

  const camRef = React.useRef<AerialView>(view);
  camRef.current = view;
  const emit = React.useRef(onViewChange);
  emit.current = onViewChange;

  const apply = React.useCallback((next: AerialView) => {
    const v = { lat: next.lat, lng: next.lng, zoom: clampZoom(next.zoom) };
    camRef.current = v;
    emit.current(v);
  }, []);

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

  /** Live (camera-ref based) unprojection — safe inside native listeners. */
  const unproject = React.useCallback((x: number, y: number, cam = camRef.current) => {
    const { w, h } = sizeRef.current;
    const c = worldPx({ lat: cam.lat, lng: cam.lng }, cam.zoom);
    return worldLatLng(c.x + x - w / 2, c.y + y - h / 2, cam.zoom);
  }, []);

  const toLatLng = React.useCallback((x: number, y: number) => unproject(x, y), [unproject]);

  /** The camera centre that keeps `at` pinned under the pixel `px` at `zoom`. */
  const centreForAnchor = React.useCallback((at: LatLng, px: { x: number; y: number }, zoom: number): AerialView => {
    const { w, h } = sizeRef.current;
    const p = worldPx(at, zoom);
    const c = worldLatLng(p.x - (px.x - w / 2), p.y - (px.y - h / 2), zoom);
    return { lat: c.lat, lng: c.lng, zoom };
  }, []);

  const local = (e: { clientX: number; clientY: number }) => {
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

  /* ── animation: eased zoom tweens and pan glide ─────────────────────── */

  const raf = React.useRef<number | null>(null);
  const stopAnim = React.useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);
  React.useEffect(() => stopAnim, [stopAnim]);

  /** Animate to a zoom level, holding the anchor pixel still. */
  const zoomTo = React.useCallback(
    (target: number, anchorPx?: { x: number; y: number }, ms = 260) => {
      stopAnim();
      const from = camRef.current.zoom;
      const to = clampZoom(target);
      if (Math.abs(to - from) < 0.001) return;
      const { w, h } = sizeRef.current;
      const px = anchorPx ?? { x: w / 2, y: h / 2 };
      const anchor = unproject(px.x, px.y);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        apply(centreForAnchor(anchor, px, from + (to - from) * ease(t)));
        if (t < 1) raf.current = requestAnimationFrame(step);
        else raf.current = null;
      };
      raf.current = requestAnimationFrame(step);
    },
    [apply, centreForAnchor, stopAnim, unproject],
  );

  /** Instant, anchored zoom by a fractional amount — used by wheel and pinch. */
  const zoomByAt = React.useCallback(
    (delta: number, px: { x: number; y: number }) => {
      stopAnim();
      const cam = camRef.current;
      const next = clampZoom(cam.zoom + delta);
      if (next === cam.zoom) return;
      const anchor = unproject(px.x, px.y, cam);
      apply(centreForAnchor(anchor, px, next));
    },
    [apply, centreForAnchor, stopAnim, unproject],
  );

  /* ── drag pan with momentum ─────────────────────────────────────────── */

  const drag = React.useRef<{
    id: number;
    x: number;
    y: number;
    moved: number;
    pending: { x: number; y: number };
    vx: number;
    vy: number;
    at: number;
    frame: number | null;
  } | null>(null);

  const panBy = React.useCallback(
    (dx: number, dy: number) => {
      const cam = camRef.current;
      const c = worldPx({ lat: cam.lat, lng: cam.lng }, cam.zoom);
      const next = worldLatLng(c.x - dx, c.y - dy, cam.zoom);
      apply({ lat: next.lat, lng: next.lng, zoom: cam.zoom });
    },
    [apply],
  );

  const flush = React.useCallback(() => {
    const d = drag.current;
    if (!d) return;
    d.frame = null;
    const { x, y } = d.pending;
    if (!x && !y) return;
    d.pending = { x: 0, y: 0 };
    panBy(x, y);
  }, [panBy]);

  const glide = React.useCallback(
    (vx: number, vy: number) => {
      stopAnim();
      let x = vx;
      let y = vy;
      const step = () => {
        x *= 0.9;
        y *= 0.9;
        if (Math.abs(x) < 0.15 && Math.abs(y) < 0.15) {
          raf.current = null;
          return;
        }
        panBy(x, y);
        raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    [panBy, stopAnim],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (vertex.current) return;
    stopAnim();
    const p = local(e);
    drag.current = { id: e.pointerId, x: p.x, y: p.y, moved: 0, pending: { x: 0, y: 0 }, vx: 0, vy: 0, at: performance.now(), frame: null };
    host.current?.setPointerCapture?.(e.pointerId);
    setGrabbing(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = local(e);
    if (vertex.current) {
      const { faceId, index } = vertex.current;
      onVertexMove?.(faceId, index, toLatLng(p.x, p.y));
      return;
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = p.x - d.x;
    const dy = p.y - d.y;
    if (!dx && !dy) return;
    const now = performance.now();
    const dt = Math.max(8, now - d.at);
    d.vx = (dx / dt) * 16;
    d.vy = (dy / dt) * 16;
    d.at = now;
    d.moved += Math.hypot(dx, dy);
    d.x = p.x;
    d.y = p.y;
    d.pending.x += dx;
    d.pending.y += dy;
    if (d.frame === null) d.frame = requestAnimationFrame(flush);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setGrabbing(false);
    if (vertex.current) {
      vertex.current = null;
      drag.current = null;
      return;
    }
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.frame !== null) cancelAnimationFrame(d.frame);
    if (d.pending.x || d.pending.y) panBy(d.pending.x, d.pending.y);
    if (d.moved <= 5) {
      const p = local(e);
      onMapClick?.(toLatLng(p.x, p.y));
      return;
    }
    /* let the imagery keep travelling briefly, then settle */
    if (Math.hypot(d.vx, d.vy) > 3 && performance.now() - d.at < 90) glide(d.vx, d.vy);
  };

  /* ── wheel + trackpad pinch (native, non-passive) ───────────────────── */

  const wheelRef = React.useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    /* pinch gestures arrive as ctrl+wheel and deserve a firmer response */
    const intensity = e.ctrlKey ? 0.012 : 0.0035;
    zoomByAt(-dy * intensity, local(e));
  };

  React.useEffect(() => {
    const el = host.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ── keyboard: arrows nudge, +/- zoom ───────────────────────────────── */

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 220 : 90;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (map[e.key]) {
      e.preventDefault();
      const [dx, dy] = map[e.key];
      glide(dx / 6, dy / 6);
      return;
    }
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomTo(camRef.current.zoom + 1);
    }
    if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      zoomTo(camRef.current.zoom - 1);
    }
  };

  const ftPerPx = feetPerPixel(view.lat, view.zoom);
  const barFeet = [10, 20, 30, 50, 100, 200].find((f) => f / ftPerPx > 60) ?? 200;

  const ctrl =
    "flex h-9 w-9 items-center justify-center text-white/85 transition-colors hover:bg-white/20 active:bg-white/30";

  return (
    <div
      ref={host}
      tabIndex={0}
      role="application"
      aria-label="Aerial map — drag to pan, scroll to zoom"
      style={{
        height,
        touchAction: "none",
        cursor: capturing ? "crosshair" : grabbing ? "grabbing" : "grab",
      }}
      className="relative w-full select-none overflow-hidden bg-[#0b0b0f] outline-none ring-inset focus-visible:ring-1 focus-visible:ring-white/40"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={(e) => {
        e.preventDefault();
        zoomTo(camRef.current.zoom + 1, local(e));
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
          style={{ left: t.left, top: t.top, width: t.px + 0.5, height: t.px + 0.5 }}
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

      {/* camera controls */}
      <div className="absolute right-3 top-3 flex flex-col divide-y divide-white/20 border border-white/25 bg-black/50 backdrop-blur-md">
        <button
          type="button"
          aria-label="Zoom in"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => zoomTo(camRef.current.zoom + 1)}
          className={ctrl}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => zoomTo(camRef.current.zoom - 1)}
          className={ctrl}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        {marker && (
          <button
            type="button"
            aria-label="Centre on the property"
            title="Centre on the property"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              stopAnim();
              apply({ lat: marker.lat, lng: marker.lng, zoom: Math.max(camRef.current.zoom, 19) });
            }}
            className={ctrl}
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* live camera readout */}
      <div className="pointer-events-none absolute left-3 top-3 border border-white/20 bg-black/45 px-2 py-1 text-[8px] uppercase tracking-[0.24em] text-white/75 backdrop-blur-md">
        {capturing ? "Click to capture" : "Drag to pan · scroll to zoom"} · z{view.zoom.toFixed(1)}
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
