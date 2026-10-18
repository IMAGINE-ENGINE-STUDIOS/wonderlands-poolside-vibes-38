/**
 * Site levels for the 3D Studio — raised pools, raised / sunken decks and the
 * underground "x-ray" pool shell.
 * Credits: Imagine Engine Studios Corp.
 *
 * - RiserWall: finished vertical band along a ring (pool skirt, deck riser,
 *   sunken-pit retaining wall).
 * - AutoSteps: access steps (max 7" rise, 12" tread, 4 ft wide) on the edge
 *   facing the default camera, outside a raised deck or inside a sunken pit.
 * - XrayShell: the pool's outer hull below grade, drawn BackSide so the near
 *   walls vanish and the far walls stay visible from any angle.
 */
import * as React from "react";
import * as THREE from "three";
import { InstancedBoxes } from "./InstancedBoxes";

type XZ = { x: number; z: number };

const RISER_FT = 7 / 12;
const TREAD_FT = 1;
const STEP_WIDTH_FT = 4;

/** Drops missing / NaN points so a stale outline can never crash the canvas. */
const clean = (ring: XZ[] | undefined) => (ring ?? []).filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.z));

function bandGeometry(raw: XZ[], y0: number, y1: number) {
  const ring = clean(raw);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let run = 0;
  for (let i = 0; i <= ring.length; i++) {
    const p = ring[i % ring.length];
    if (i) { const q = ring[i - 1]; run += Math.hypot(p.x - q.x, p.z - q.z); }
    pos.push(p.x, y0, p.z, p.x, y1, p.z);
    uv.push(run, y0, run, y1);
    if (i) { const b = (i - 1) * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

const wallMat = new THREE.MeshStandardMaterial({ color: "#d6cdbf", roughness: 0.85, side: THREE.DoubleSide });

export function RiserWall({ ring, y0, y1, texture }: { ring: XZ[]; y0: number; y1: number; texture?: THREE.Texture | null }) {
  const geo = React.useMemo(() => (clean(ring).length >= 3 && Math.abs(y1 - y0) > 0.01 ? bandGeometry(ring, Math.min(y0, y1), Math.max(y0, y1)) : null), [ring, y0, y1]);
  const mat = React.useMemo(() => (texture ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, side: THREE.DoubleSide }) : wallMat), [texture]);
  if (!geo) return null;
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
}

/** Steps between `level` (deck top) and ground y=0 on the ring's camera-facing edge. */
export function AutoSteps({ ring: raw, level }: { ring: XZ[]; level: number }) {
  const boxes = React.useMemo(() => {
    const ring = clean(raw);
    if (ring.length < 3 || Math.abs(level) < 0.2) return [];
    const c = ring.reduce((a, p) => ({ x: a.x + p.x / ring.length, z: a.z + p.z / ring.length }), { x: 0, z: 0 });
    const k = ring.reduce((best, p, i) => (p.x + p.z > ring[best].x + ring[best].z ? i : best), 0);
    const p = ring[k], a = ring[(k - 1 + ring.length) % ring.length], b = ring[(k + 1) % ring.length];
    let tx = b.x - a.x, tz = b.z - a.z; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    // Outward normal: perpendicular to the edge, pointing away from the centroid.
    let nx = -tz, nz = tx; if (nx * (p.x - c.x) + nz * (p.z - c.z) < 0) { nx = -nx; nz = -nz; }
    const ry = -Math.atan2(tz, tx);
    const h = Math.abs(level), n = Math.max(2, Math.ceil(h / RISER_FT));
    const out: { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number }[] = [];
    for (let j = 1; j < n; j++) {
      const d = (j - 0.5) * TREAD_FT;
      if (level > 0) {
        // Raised deck: steps march outward and down to grade.
        const top = (h * (n - j)) / n;
        out.push({ x: p.x + nx * d, y: top / 2, z: p.z + nz * d, sx: STEP_WIDTH_FT, sy: top, sz: TREAD_FT, ry });
      } else {
        // Sunken pit: steps sit inside the pit, highest at the wall.
        const top = -(h * j) / n, bottom = level;
        out.push({ x: p.x - nx * d, y: (top + bottom) / 2, z: p.z - nz * d, sx: STEP_WIDTH_FT, sy: top - bottom, sz: TREAD_FT, ry });
      }
    }
    return out;
  }, [raw, level]);
  if (!boxes.length) return null;
  return <InstancedBoxes boxes={boxes} material={wallMat} castShadow />;
}

const xrayMat = new THREE.MeshStandardMaterial({ color: "#9aa3ad", roughness: 0.9, side: THREE.BackSide, transparent: true, opacity: 0.6, depthWrite: false });

/** Outer pool hull below grade, visible only from outside through the far walls. */
export function XrayShell({ ring, depth }: { ring: XZ[]; depth: number }) {
  const geo = React.useMemo(() => {
    if (ring.length < 3) return null;
    const wall = bandGeometry(ring, -depth, 0);
    const shape = new THREE.Shape(ring.map((p) => new THREE.Vector2(p.x, -p.z)));
    const floor = new THREE.ShapeGeometry(shape); floor.rotateX(-Math.PI / 2); floor.translate(0, -depth, 0);
    // Flip the floor so its back face points up into the pool (BackSide shows it from below).
    floor.scale(1, 1, 1);
    return { wall, floor };
  }, [ring, depth]);
  if (!geo) return null;
  return (
    <group renderOrder={-1}>
      <mesh geometry={geo.wall} material={xrayMat} />
      <mesh geometry={geo.floor} material={xrayMat} />
    </group>
  );
}

/* ------------------------------------------------------------------------- */
/* Perimeter access stairs — sweep along any stretch of a ring, up to a full  */
/* 360° wrap, and can be dragged around the edge. Imagine Engine Studios Corp. */
/* ------------------------------------------------------------------------- */
import { useThree } from "@react-three/fiber";
import { ringLengths, ringAt, nearestU, updateStairs, type StairKey, type StairRun } from "@/lib/design/siteStairs";

const handleMat = new THREE.MeshStandardMaterial({ color: "#f97066", roughness: 0.4 });

/**
 * Steps from `hi` (at the ring) down to `lo`, marching away from the ring:
 * dir +1 = outward (raised deck / raised pool), −1 = inward (sunken pit).
 */
export function PerimeterStairs({ ring: raw, hi, lo, dir, run, stairKey, material }: {
  ring: XZ[]; hi: number; lo: number; dir: 1 | -1; run: StairRun; stairKey: StairKey; material?: THREE.Material;
}) {
  const ring = React.useMemo(() => clean(raw), [raw]);
  const acc = React.useMemo(() => ringLengths(ring), [ring]);
  const { boxes, handle } = React.useMemo(() => {
    const h = hi - lo;
    if (!run.enabled || ring.length < 3 || h < 0.2) return { boxes: [], handle: null };
    const L = acc[acc.length - 1] || 1;
    let area = 0; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; area += a.x * b.z - b.x * a.z; }
    const sgn = area >= 0 ? 1 : -1;
    const full = run.span >= 0.999;
    const len = full ? L : Math.min(L, Math.max(run.width, run.span * L));
    const pieces = Math.max(1, Math.ceil(len / 1));
    const n = Math.max(2, Math.ceil(h / RISER_FT));
    const out: { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number }[] = [];
    const u0 = run.start - len / L / 2;
    for (let k = 0; k < pieces; k++) {
      const p = ringAt(ring, acc, u0 + ((k + 0.5) * len) / pieces / L);
      const nx = p.tz * sgn * dir, nz = -p.tx * sgn * dir;
      const ry = -Math.atan2(p.tz, p.tx);
      for (let j = 1; j < n; j++) {
        const d = (j - 0.5) * TREAD_FT, top = hi - (h * j) / n;
        // Outer steps sweep a longer arc on convex edges; widen them a touch so no gaps show.
        const sx = (len / pieces) * (1 + (dir > 0 ? d * 0.08 : 0)) + 0.04;
        out.push({ x: p.x + nx * d, y: (top + lo) / 2, z: p.z + nz * d, sx, sy: top - lo, sz: TREAD_FT, ry });
      }
    }
    const c = ringAt(ring, acc, run.start);
    const cnx = c.tz * sgn * dir, cnz = -c.tx * sgn * dir;
    return { boxes: out, handle: { x: c.x + cnx * 0.5, y: hi + 0.35, z: c.z + cnz * 0.5 } };
  }, [ring, acc, hi, lo, dir, run]);

  const controls = useThree((s) => s.controls) as { enabled?: boolean } | null;
  const dragging = React.useRef(false);
  const plane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -hi), [hi]);
  const hit = React.useMemo(() => new THREE.Vector3(), []);
  if (!boxes.length) return null;
  return (
    <group>
      <InstancedBoxes boxes={boxes} material={material ?? wallMat} castShadow />
      {handle && (
        <mesh position={[handle.x, handle.y, handle.z]} material={handleMat}
          onPointerDown={(e) => { e.stopPropagation(); dragging.current = true; (e.target as Element)?.setPointerCapture?.(e.pointerId); if (controls) controls.enabled = false; }}
          onPointerMove={(e) => { if (!dragging.current) return; e.stopPropagation(); if (e.ray.intersectPlane(plane, hit)) updateStairs(stairKey, { start: nearestU(ring, acc, { x: hit.x, z: hit.z }) }); }}
          onPointerUp={(e) => { dragging.current = false; (e.target as Element)?.releasePointerCapture?.(e.pointerId); if (controls) controls.enabled = true; }}
        >
          <sphereGeometry args={[0.3, 16, 12]} />
        </mesh>
      )}
    </group>
  );
}
