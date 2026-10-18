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

function bandGeometry(ring: XZ[], y0: number, y1: number) {
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
  const geo = React.useMemo(() => (ring.length >= 3 && Math.abs(y1 - y0) > 0.01 ? bandGeometry(ring, Math.min(y0, y1), Math.max(y0, y1)) : null), [ring, y0, y1]);
  const mat = React.useMemo(() => (texture ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, side: THREE.DoubleSide }) : wallMat), [texture]);
  if (!geo) return null;
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
}

/** Steps between `level` (deck top) and ground y=0 on the ring's camera-facing edge. */
export function AutoSteps({ ring, level }: { ring: XZ[]; level: number }) {
  const boxes = React.useMemo(() => {
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
  }, [ring, level]);
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
