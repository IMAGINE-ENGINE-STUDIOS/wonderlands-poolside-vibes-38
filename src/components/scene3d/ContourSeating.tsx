/**
 * Contour seating — a bench swept along the pool wall.
 * - Follows the pool outline (smoothed vertex normals, so curves stay curved).
 * - Wraps across the 0/1 seam and can loop a full 360° around the pool:
 *   endPosition may exceed 1 (up to startPosition + 1).
 * - Soft, rounded nosing on the inner top edge (seating.softEdge, ft).
 * - Bottom always meets the local pool floor.
 */
import * as THREE from 'three';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTiledTexture } from '@/hooks/useTiledTexture';
import { ContourSeatingConfig } from './poolAssetTypes';
import { samplesAlongPath } from '@/lib/design/featureSplines';

interface ContourSeatingProps {
  seating: ContourSeatingConfig;
  poolPerimeter: Array<{ x: number; z: number }>;
  onPositionChange: (id: string, startPosition: number, endPosition: number) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  getFloorDepthAt: (x: number, z: number) => number;
}

type Sample = { x: number; z: number; nx: number; nz: number };

/** Signed area > 0 → counter-clockwise in x/z. */
function signedArea(p: Array<{ x: number; z: number }>) {
  let a = 0;
  for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i].x * q.z - q.x * p[i].z; }
  return a / 2;
}

/** Samples the perimeter between start and end (0-1, wraps), with inward normals. */
export function samplePerimeter(start: number, end: number, perimeter: Array<{ x: number; z: number }>, closed: boolean): Sample[] {
  const n = perimeter.length;
  if (n < 3) return [];
  const lens: number[] = []; let total = 0;
  for (let i = 0; i < n; i++) { const a = perimeter[i], b = perimeter[(i + 1) % n]; const l = Math.hypot(b.x - a.x, b.z - a.z); lens.push(l); total += l; }
  if (total < 1e-6) return [];
  // Vertex normals (averaged edge normals) pointing into the pool.
  const inwardSign = signedArea(perimeter) > 0 ? 1 : -1;
  const vn = perimeter.map((_, i) => {
    const a = perimeter[(i - 1 + n) % n], b = perimeter[i], c = perimeter[(i + 1) % n];
    const e1x = b.x - a.x, e1z = b.z - a.z, e2x = c.x - b.x, e2z = c.z - b.z;
    const l1 = Math.hypot(e1x, e1z) || 1, l2 = Math.hypot(e2x, e2z) || 1;
    let nx = (-e1z / l1 - e2z / l2) * inwardSign, nz = (e1x / l1 + e2x / l2) * inwardSign;
    const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
    return { nx, nz };
  });
  const span = closed ? 1 : Math.max(0.002, end - start);
  const count = Math.max(24, Math.min(400, Math.round(span * total * 2)));
  const out: Sample[] = [];
  const steps = closed ? count : count + 1;
  for (let k = 0; k < steps; k++) {
    let t = (start + (span * k) / count) % 1; if (t < 0) t += 1;
    let d = t * total, i = 0;
    while (i < n - 1 && d > lens[i]) { d -= lens[i]; i++; }
    const a = perimeter[i], b = perimeter[(i + 1) % n], f = lens[i] ? Math.min(1, d / lens[i]) : 0;
    const na = vn[i], nb = vn[(i + 1) % n];
    let nx = na.nx + (nb.nx - na.nx) * f, nz = na.nz + (nb.nz - na.nz) * f;
    const l = Math.hypot(nx, nz) || 1;
    out.push({ x: a.x + (b.x - a.x) * f, z: a.z + (b.z - a.z) * f, nx: nx / l, nz: nz / l });
  }
  return out;
}

export function ContourSeating({ seating, poolPerimeter, isSelected, onSelect, getFloorDepthAt }: ContourSeatingProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { gl } = useThree();
  const texture = useTiledTexture(seating.textureUrl);

  const geometry = useMemo(() => {
    // Drawn geometry first (Job 1, 2026-11-03): a seat that carries its own
    // wall-line points sweeps along THOSE points — never perimeter
    // fractions. Only the Studio's hand-placed procedural presets (no
    // pathPoints) still sample the perimeter by fraction.
    const hasPath = !!seating.pathPoints && seating.pathPoints.length >= 2;
    const closed = hasPath ? !!seating.pathClosed : (seating.endPosition - seating.startPosition) >= 0.995;
    let samples: Sample[];
    if (hasPath) {
      const c = poolPerimeter.length
        ? { x: poolPerimeter.reduce((s, p) => s + p.x, 0) / poolPerimeter.length, z: poolPerimeter.reduce((s, p) => s + p.z, 0) / poolPerimeter.length }
        : { x: 0, z: 0 };
      samples = samplesAlongPath(seating.pathPoints!, closed, c);
    } else {
      const span = seating.endPosition - seating.startPosition;
      const end = span < 0 ? seating.endPosition + 1 : seating.endPosition; // seam wrap
      samples = samplePerimeter(seating.startPosition, end, poolPerimeter, closed);
    }
    const geo = new THREE.BufferGeometry();
    if (samples.length < 2) return geo;

    const w = Math.max(0.5, seating.width);
    const topY = -seating.height;
    const r = Math.min(Math.max(0, seating.softEdge ?? 0.15), w * 0.45, 0.6);
    // Cross-section (inward offset, y) — floor depth substituted per sample.
    const ARC = r > 0.01 ? 6 : 0;
    const profile = (floor: number, we: number): Array<[number, number]> => {
      const ri = Math.min(r, we * 0.45);
      const pts: Array<[number, number]> = [[0, topY], [we - ri, topY]];
      for (let j = 1; j <= ARC; j++) { const a = (Math.PI / 2) * (j / ARC); pts.push([we - ri + Math.sin(a) * ri, topY - ri + Math.cos(a) * ri]); }
      if (!ARC) pts.push([we, topY]);
      const bottom = Math.min(topY - 0.1, -floor);
      pts.push([we, bottom], [0, bottom]);
      return pts;
    };

    // Effective width per sample (Job V, 2026-11-03): a swept band folds into
    // a thin fin where the wall's turn radius is tighter than the bench width
    // — its inner edge reverses on itself. Engineering-trace outlines carry
    // true ~0.4 ft corners (Astoria seat: radius 0.43 ft vs width 1.56 ft, two
    // measured folds); Studio-smoothed outlines turn gently (radius >> width),
    // so this is a no-op there. Two stages, both measured fold-free on the
    // traced catalogue: (1) clamp each sample's width to the local turn
    // radius, min-filtered over a window of ~one bench width so the taper is
    // gradual; (2) a pin pass — any sample whose inner segment still reverses
    // against the wall segment has its width halved until it doesn't (the
    // fold-pinning idea CopingGeometry uses, in width space).
    const nS = samples.length;
    const stepRadius = (k: number): number => {
      const ia = closed ? ((k % nS) + nS) % nS : k;
      const ib = closed ? (((k + 1) % nS) + nS) % nS : k + 1;
      if (!closed && (ia < 0 || ib >= nS)) return Infinity;
      const a = samples[ia], b = samples[ib];
      const step = Math.hypot(b.x - a.x, b.z - a.z);
      const dth = Math.acos(Math.max(-1, Math.min(1, a.nx * b.nx + a.nz * b.nz)));
      return dth > 1e-4 && step > 1e-6 ? step / dth : Infinity;
    };
    let avgStep = 0.5;
    if (nS > 1) {
      let sum = 0;
      for (let i = 1; i < nS; i++) sum += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].z - samples[i - 1].z);
      avgStep = sum / (nS - 1) || 0.5;
    }
    const win = Math.max(2, Math.round(w / Math.max(0.2, avgStep)));
    const wEff = samples.map((_, i) => {
      let rMin = Infinity;
      for (let k = i - win; k <= i + win; k++) {
        const kk = closed ? ((k % nS) + nS) % nS : k;
        if (!closed && (kk < 0 || kk >= nS)) continue;
        rMin = Math.min(rMin, stepRadius(kk), stepRadius(kk - 1));
      }
      return Math.min(w, Math.max(0.3, rMin * 0.9));
    });
    const pairs = closed ? nS : nS - 1;
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < pairs; i++) {
        const j = closed ? (i + 1) % nS : i + 1;
        const a = samples[i], b = samples[j];
        const cx = a.x + a.nx * wEff[i], cz = a.z + a.nz * wEff[i];
        let guard = 0;
        while (guard++ < 8) {
          const dx = b.x + b.nx * wEff[j], dz = b.z + b.nz * wEff[j];
          if ((b.x - a.x) * (dx - cx) + (b.z - a.z) * (dz - cz) >= 0) break;
          wEff[j] *= 0.5;
          if (wEff[j] < 0.15) { wEff[j] = 0.15; break; }
        }
      }
    }

    const verts: number[] = [], uvs: number[] = [], idx: number[] = [];
    const ringLen = profile(1, w).length;
    let along = 0;
    samples.forEach((s, i) => {
      if (i > 0) along += Math.hypot(s.x - samples[i - 1].x, s.z - samples[i - 1].z);
      const floor = getFloorDepthAt(s.x + s.nx * wEff[i] * 0.5, s.z + s.nz * wEff[i] * 0.5);
      let v = 0; let prev: [number, number] | null = null;
      for (const [o, y] of profile(floor, wEff[i])) {
        if (prev) v += Math.hypot(o - prev[0], y - prev[1]);
        verts.push(s.x + s.nx * o, y, s.z + s.nz * o); uvs.push(along, v); prev = [o, y];
      }
    });
    const rings = samples.length;
    const segs = closed ? rings : rings - 1;
    for (let i = 0; i < segs; i++) {
      const a = i * ringLen, b = ((i + 1) % rings) * ringLen;
      for (let j = 0; j < ringLen - 1; j++) {
        idx.push(a + j, b + j, a + j + 1, a + j + 1, b + j, b + j + 1);
      }
    }
    if (!closed) {
      // End caps: fan from the profile centroid.
      [0, rings - 1].forEach((ri, k) => {
        const base = ri * ringLen; let cx = 0, cy = 0, cz = 0;
        for (let j = 0; j < ringLen; j++) { cx += verts[(base + j) * 3]; cy += verts[(base + j) * 3 + 1]; cz += verts[(base + j) * 3 + 2]; }
        const c = verts.length / 3; verts.push(cx / ringLen, cy / ringLen, cz / ringLen); uvs.push(0, 0);
        for (let j = 0; j < ringLen; j++) {
          const p = base + j, q = base + ((j + 1) % ringLen);
          if (k === 0) idx.push(c, q, p); else idx.push(c, p, q);
        }
      });
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }, [seating, poolPerimeter, getFloorDepthAt]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(seating.id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  }, [seating.id, onSelect, gl.domElement]);

  const handlePointerUp = useCallback(() => { setIsDragging(false); gl.domElement.style.cursor = 'auto'; }, [gl.domElement]);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [isDragging, handlePointerUp]);

  return (
    <group>
      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerOver={() => (gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab')}
        onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
      >
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} side={THREE.DoubleSide} emissive={isSelected ? '#0e7490' : '#000000'} emissiveIntensity={isSelected ? 0.15 : 0} />
      </mesh>
    </group>
  );
}
