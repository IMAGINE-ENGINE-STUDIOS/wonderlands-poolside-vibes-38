/**
 * LedgeShelf — a merged tanning-ledge / sun-shelf zone rendered as what it
 * physically is: a submerged bench INSIDE the main pool (Job V Phase 2,
 * founder directive 2026-11-03 — Astoria's left zone "is a sun bench, so no
 * coping in the pool there, no wall, just a bench cover all that area, then
 * stairs").
 *
 * The shelf is a finish-surfaced top covering the whole zone ring at the
 * zone's depth, open to the pool: the main pool's water surface already
 * covers the zone (the ring lies inside the main outline), so no separate
 * water body, coping ring, waterline band or shell wall is built. Every
 * edge gets a plain sealing skirt.
 *
 * Pool Geometry Fix (2026-11-03): (a) the invented two-step profile that
 * used to step open edges down (hard-coded STEP_DROPS/STEP_RUNS) is GONE —
 * steps exist only where a stair spline/config was actually drawn or
 * traced (PoolStairs); a ledge with no drawn stairs shows none. (b) The
 * shelf top is subdivided on concentric rings toward the centroid — the
 * same approach as Pool3DScene's pool floor — instead of one flat fan
 * triangulation, so curved shelves bend smoothly and the finish texture
 * (UVs in feet) wraps at true scale.
 *
 * Shared by BoardElements3D (2D→3D board flow) and LathamModelVisualizer
 * (standalone viewer) so both surfaces compose the same scene. Material and
 * texture tiling follow ContourSeating exactly (the Studio's own seating
 * family): useTiledTexture (UVs authored in feet) + meshStandardMaterial
 * roughness 0.6, DoubleSide.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { type Pt } from '@/utils/polygonGeometry';

/** Consecutive-duplicate removal (same tolerance the shared utils use). */
function dedupe(ring: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of ring) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.z - last.z) > 1e-9) out.push(p);
  }
  if (out.length > 1) {
    const first = out[0];
    const last = out[out.length - 1];
    if (Math.hypot(first.x - last.x, first.z - last.z) <= 1e-9) out.pop();
  }
  return out;
}
import { useTiledTexture } from '@/hooks/useTiledTexture';

export interface LedgeShelfProps {
  /** Zone ring in the caller's local frame ({x, z}); mainRing/otherRings share it. */
  ring: Pt[];
  /** Shelf depth below the water surface (ft). */
  depth: number;
  /** Pool-finish texture URL (callers guarantee a URL via their fallbacks). */
  textureUrl: string;
  /** Main pool outline in the same frame — classifies wall vs open edges. */
  mainRing?: Pt[];
  /** Sibling zone rings in the same frame (kept for callers; the skirt no
   *  longer classifies edges — every edge is a plain skirt now). */
  otherRings?: Pt[][];
  isSelected?: boolean;
  onPick?: (e: any) => void;
}

const SKIRT_BELOW = 2.8; // skirt bottom below the water surface datum (depth + penetration)

function centroid(ring: Pt[]): Pt {
  const n = ring.length || 1;
  return {
    x: ring.reduce((s, p) => s + p.x, 0) / n,
    z: ring.reduce((s, p) => s + p.z, 0) / n,
  };
}

function buildSkirtGeometry(
  ring: Pt[],
  depth: number
): THREE.BufferGeometry {
  const pts = dedupe(ring);
  const n = pts.length;
  const geom = new THREE.BufferGeometry();
  if (n < 3) return geom;
  const shelfC = centroid(pts);
  const bottomY = -Math.max(SKIRT_BELOW, depth + 2.8);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let dist = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const edgeLen = Math.hypot(b.x - a.x, b.z - a.z);
    // Plain profile on EVERY edge (Pool Geometry Fix, 2026-11-03): steps
    // are never synthesized here — they exist only where a stair config
    // was drawn/traced and rendered by PoolStairs.
    const profile: Array<[number, number]> = [[0, -depth], [0, bottomY]];
    // Outward unit normal of this edge (away from the shelf centroid).
    const mid = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    let nx = mid.x - shelfC.x;
    let nz = mid.z - shelfC.z;
    const nl = Math.hypot(nx, nz) || 1;
    nx /= nl;
    nz /= nl;
    const base = positions.length / 3;
    for (let k = 0; k < profile.length; k++) {
      const [off, y] = profile[k];
      positions.push(a.x + nx * off, y, a.z + nz * off, b.x + nx * off, y, b.z + nz * off);
      uvs.push(dist, y, dist + edgeLen, y);
    }
    for (let k = 0; k + 1 < profile.length; k++) {
      const r0 = base + k * 2;
      const r1 = base + (k + 1) * 2;
      indices.push(r0, r1, r0 + 1, r0 + 1, r1, r1 + 1);
    }
    dist += edgeLen;
  }
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Shelf top on concentric rings from the centroid — the same construction
 * as Pool3DScene's pool floor (RINGS interpolations of the perimeter), so
 * a curved shelf gets a regular mesh that follows the curve instead of one
 * flat fan of long triangles. All vertices sit at the shelf depth; UVs are
 * plan feet, so the finish wraps at true scale. The outer ring reuses the
 * exact ring points so the top meets the skirt without a gap.
 */
function buildShelfTopGeometry(ring: Pt[], depth: number): THREE.BufferGeometry | null {
  const pts = dedupe(ring);
  if (pts.length < 3) return null;
  // Resample the ring evenly (~0.5 ft) so the concentric mesh is regular.
  const dense: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const L = Math.hypot(b.x - a.x, b.z - a.z);
    const cnt = Math.max(1, Math.round(L / 0.5));
    for (let k = 0; k < cnt; k++) dense.push({ x: a.x + (b.x - a.x) * (k / cnt), z: a.z + (b.z - a.z) * (k / cnt) });
  }
  const N = dense.length;
  if (N < 3) return null;
  const c = centroid(dense);
  const RINGS = 8;
  const positions: number[] = [c.x, -depth, c.z];
  const uvs: number[] = [c.x, c.z];
  for (let r = 1; r <= RINGS; r++) {
    const s = r / RINGS;
    for (let i = 0; i < N; i++) {
      const x = c.x + (dense[i].x - c.x) * s;
      const z = c.z + (dense[i].z - c.z) * s;
      positions.push(x, -depth, z);
      uvs.push(x, z);
    }
  }
  const indices: number[] = [];
  const ringStart = (r: number) => 1 + (r - 1) * N;
  for (let i = 0; i < N; i++) indices.push(0, ringStart(1) + ((i + 1) % N), ringStart(1) + i);
  for (let r = 1; r < RINGS; r++) {
    for (let i = 0; i < N; i++) {
      const i2 = (i + 1) % N;
      const a = ringStart(r) + i, b = ringStart(r) + i2, cc = ringStart(r + 1) + i, d = ringStart(r + 1) + i2;
      indices.push(a, b, cc, b, d, cc);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export function LedgeShelf({ ring, depth, textureUrl, isSelected = false, onPick }: LedgeShelfProps) {
  const texture = useTiledTexture(textureUrl);
  const topGeo = useMemo(() => buildShelfTopGeometry(ring, depth), [ring, depth]);
  const skirtGeo = useMemo(
    () => buildSkirtGeometry(ring, depth),
    [ring, depth]
  );
  if (!topGeo) return null;
  return (
    <group onClick={onPick}>
      <mesh geometry={topGeo} receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} side={THREE.DoubleSide} emissive={isSelected ? '#0e7490' : '#000000'} emissiveIntensity={isSelected ? 0.15 : 0} />
      </mesh>
      <mesh geometry={skirtGeo} receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} side={THREE.DoubleSide} emissive={isSelected ? '#0e7490' : '#000000'} emissiveIntensity={isSelected ? 0.15 : 0} />
      </mesh>
    </group>
  );
}
