import * as THREE from 'three';
import earcut from 'earcut';
import { useMemo, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { mitredOffsetRing, unionRegions } from '@/utils/polygonGeometry';
import { textureCache } from '@/utils/textureCache';
import { useTextureInvalidation } from '@/hooks/useTextureInvalidation';

interface CopingGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  copingWidth: number;
  copingHeight: number;
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
  /** Texture rotation in degrees */
  textureRotation?: number;
  paverTextureUrl?: string;
  /** Spillway openings (same space as poolPoints): coping is removed over each stretch. */
  cuts?: SpillCut[];
}

export type SpillCut = { a: { x: number; z: number }; b: { x: number; z: number } };
/** True when (x,z) lies on the coping band over the spill chord a→b. */
export function inSpillCut(x: number, z: number, c: SpillCut, width: number) {
  const dx = c.b.x - c.a.x, dz = c.b.z - c.a.z, L2 = dx * dx + dz * dz;
  if (L2 < 1e-6) return false;
  const t = ((x - c.a.x) * dx + (z - c.a.z) * dz) / L2;
  if (t < 0 || t > 1) return false;
  const d = Math.abs((x - c.a.x) * dz - (z - c.a.z) * dx) / Math.sqrt(L2);
  return d <= width + 0.05;
}

export const CopingGeometry = ({ 
  poolPoints, 
  copingWidth = 1, 
  copingHeight = 0.25,
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0],
  textureRotation = 0,
  paverTextureUrl,
  cuts
}: CopingGeometryProps) => {
  const cutKey = cuts?.map((c) => `${c.a.x.toFixed(2)},${c.a.z.toFixed(2)},${c.b.x.toFixed(2)},${c.b.z.toFixed(2)}`).join('|') ?? '';
   
  
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Use the provided coping texture URL
  const surfaceTextureUrl = textureUrl;
  
  useEffect(() => {
    if (!surfaceTextureUrl || surfaceTextureUrl === '' || surfaceTextureUrl === 'undefined') {
      setTexture(null);
      return;
    }
    
    // Match pool wall texture loading exactly
    const repeatX = 1.0 / textureScale;
    const repeatY = 1.0 / textureScale;
    
    textureCache.loadTexture(surfaceTextureUrl, { x: repeatX, y: repeatY })
      .then((loadedTexture) => {
        loadedTexture.userData.url = surfaceTextureUrl;
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        loadedTexture.center.set(0.5, 0.5);
        loadedTexture.rotation = (textureRotation * Math.PI) / 180;
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
        // Don't call invalidate here - useTextureInvalidation handles post-commit invalidation
      })
      .catch((error) => {
        console.error('CopingGeometry: Failed to load texture:', error);
        setTexture(null);
      });
  }, [surfaceTextureUrl, textureOffset, textureScale, textureRotation]);
  
  // Post-commit invalidation: ensures render happens AFTER React commits the texture
  useTextureInvalidation(texture?.uuid);
  
  const geometry = useMemo(() => {
    if (!poolPoints || poolPoints.length < 3) return new THREE.BufferGeometry();

    // With spill cuts, long straight edges are split into ≤0.25 ft steps so the notch
    // removes only stones over the stretch — a whole side (or its corner) never vanishes.
    const ring = cuts && cuts.length
      ? poolPoints.flatMap((p, i) => {
          const q = poolPoints[(i + 1) % poolPoints.length];
          const n = Math.max(1, Math.ceil(Math.hypot(q.x - p.x, q.z - p.z) / 0.25));
          return Array.from({ length: n }, (_, k) => ({ x: p.x + ((q.x - p.x) * k) / n, z: p.z + ((q.z - p.z) * k) / n }));
        })
      : poolPoints;

    // Exact mitred band: sharp tips (triangular pools) get a bevel instead of a
    // collapsed/overlapping corner, and the inner ring is expanded in lockstep so
    // every inner vertex pairs with exactly one outer vertex.
    const { base: copingInnerBoundary, offset: copingOuterBoundary } = mitredOffsetRing(
      ring,
      copingWidth,
      { miterLimit: 2.5 }
    );

    if (copingInnerBoundary.length < 3) return new THREE.BufferGeometry();
    // Unpinned mitred outer ring, kept for the fold-flap fill below.
    const unpinnedOuterBoundary = copingOuterBoundary.map((p) => ({ ...p }));
    // Tight inward curves make neighbouring offset points cross; pin folded
    // ones to the previous point so the band never overlaps itself.
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < copingInnerBoundary.length; i++) {
        const j = (i + 1) % copingInnerBoundary.length;
        const bi = copingInnerBoundary[i], bj = copingInnerBoundary[j];
        const oi = copingOuterBoundary[i], oj = copingOuterBoundary[j];
        if ((bj.x - bi.x) * (oj.x - oi.x) + (bj.z - bi.z) * (oj.z - oi.z) < 0) copingOuterBoundary[j] = { ...oi };
      }
    }

    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const numPoints = copingInnerBoundary.length;

    // Vertical placement: pool walls / waterline top sit at 1/36 ft. Sinking the
    // coping bottom slightly below that keeps faces from being coplanar (the dark
    // z-fighting lines that showed "behind" the coping).
    const deckLevel = 1 / 36;
    // Extend the coping skirt below the deck top surface (y = 0) so the two slabs
    // physically overlap and no empty seam can be seen between them.
    const bottomY = -0.1;
    const topY = deckLevel + copingHeight;


    // Calculate cumulative distance along perimeter for 1ft x 1ft UV mapping
    const distances: number[] = [0];
    let totalDistance = 0;
    
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const p1 = copingInnerBoundary[i];
      const p2 = copingInnerBoundary[next];
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      totalDistance += segmentLength;
      distances.push(totalDistance);
    }

    
    // Create continuous ring geometry with 1ft x 1ft UV squares
    // Top surface - use world-space UV (x, z) for perfect 1ft grid alignment
    for (let i = 0; i < numPoints; i++) {
      const inner = copingInnerBoundary[i];
      const outer = copingOuterBoundary[i];
      
      // Top surface vertices (at copingHeight)
      vertices.push(inner.x, topY, inner.z);
      vertices.push(outer.x, topY, outer.z);
      
      // World-space UV mapping: x = U, z = V for perfect 1ft x 1ft grid
      // This prevents distortion on curves
      uvs.push(inner.x, inner.z);
      uvs.push(outer.x, outer.z);
    }
    
    // Top surface triangles
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const innerIdx = i * 2;
      const outerIdx = i * 2 + 1;
      const nextInnerIdx = next * 2;
      const nextOuterIdx = next * 2 + 1;
      
      indices.push(innerIdx, nextInnerIdx, outerIdx);
      indices.push(outerIdx, nextInnerIdx, nextOuterIdx);
    }

    // Fold-flap fill (Job N, 2026-11-02): the pinning above keeps the band
    // from overlapping itself, but where it collapses a run of outer
    // vertices onto one point — sharp concave corners on dense traced
    // outlines (Latham spill notches, tight traced arcs) — the strip's top
    // face leaves a triangular hole between the pinned chord and the true
    // mitred corner. The deck hole and the terrain opening are both cut
    // wider than the band, so the ground showed through that hole (the
    // founder's green-triangle photo: Astoria 14 / Bermuda / the
    // spillover spas on /app/latham-pools). Fill each pin run's flap —
    // the polygon between the pinned position and the unpinned mitred
    // chain — triangulated with earcut (the triangulator the deck and
    // terrain already use) at top height with the top face's world UVs.
    // Skipped when spill cuts are active, so a cut still removes its
    // stones; outlines whose pinning moves nothing (hand-authored Studio
    // rings) get byte-identical geometry.
    if (!cuts || !cuts.length) {
      const nB = copingOuterBoundary.length;
      const moved = copingOuterBoundary.map((p, i) => {
        const u = unpinnedOuterBoundary[i];
        return Math.abs(p.x - u.x) > 1e-9 || Math.abs(p.z - u.z) > 1e-9;
      });
      const anchor = moved.findIndex((m) => !m);
      if (anchor >= 0 && moved.some(Boolean)) {
        let scanned = 0;
        while (scanned < nB) {
          const idx = (anchor + scanned) % nB;
          if (!moved[idx]) { scanned++; continue; }
          const a = copingOuterBoundary[(idx - 1 + nB) % nB];
          const flap: Array<{ x: number; z: number }> = [{ x: a.x, z: a.z }];
          let k = idx;
          while (scanned < nB && moved[(anchor + scanned) % nB]) {
            flap.push({ ...unpinnedOuterBoundary[(anchor + scanned) % nB] });
            scanned++;
            k = (anchor + scanned) % nB;
          }
          const zend = copingOuterBoundary[k];
          flap.push({ x: zend.x, z: zend.z });
          // Drop consecutive duplicates (pinned chains can repeat points).
          const poly = flap.filter((p, i) => i === 0 || Math.abs(p.x - flap[i - 1].x) > 1e-9 || Math.abs(p.z - flap[i - 1].z) > 1e-9);
          if (poly.length >= 3) {
            let area2 = 0;
            for (let i = 0; i < poly.length; i++) {
              const p = poly[i], q = poly[(i + 1) % poly.length];
              area2 += p.x * q.z - q.x * p.z;
            }
            if (Math.abs(area2) > 2e-6) {
              // A fold can cross the pinned chord twice (an S-fold), making
              // the flap polygon self-intersecting; earcut alone then
              // underfills one lobe (a residual ~0.003 sq ft nick measured
              // on Astoria 14). Decompose with the engine's own unionRegions
              // — the same machinery resolveDeckBoundaries uses — and fill
              // every resulting outer ring.
              let rings: Array<Array<{ x: number; z: number }>> = [];
              try {
                rings = unionRegions([poly]).map((r) => r[0]).filter((r) => r && r.length >= 3);
              } catch { rings = []; }
              if (!rings.length) rings = [poly];
              for (const ringPts of rings) {
                const baseIdx = vertices.length / 3;
                for (const p of ringPts) {
                  vertices.push(p.x, topY, p.z);
                  uvs.push(p.x, p.z);
                }
                const tris = earcut(ringPts.flatMap((p) => [p.x, p.z]));
                for (let t = 0; t + 2 < tris.length; t += 3) {
                  let i0 = tris[t], i1 = tris[t + 1], i2 = tris[t + 2];
                  const A = ringPts[i0], B = ringPts[i1], C = ringPts[i2];
                  // Enforce an upward (+Y) face normal in the XZ plane.
                  if ((B.z - A.z) * (C.x - A.x) - (B.x - A.x) * (C.z - A.z) < 0) {
                    const tmp = i1; i1 = i2; i2 = tmp;
                  }
                  indices.push(baseIdx + i0, baseIdx + i1, baseIdx + i2);
                }
              }
              // Skirt the flap's outer chain (anchor -> unpinned chain ->
              // next anchor) down to bottomY, in the outer wall's scheme:
              // the band's own skirt follows the PINNED ring, so without
              // this the seam between the inset skirt and the deck edge
              // stayed open to a grazing view (a green dash at Regal
              // Spillover's notch from the default camera).
              const anchorIdx = (idx - 1 + nB) % nB;
              let uAcc = distances[anchorIdx] ?? 0;
              for (let e = 0; e + 1 < poly.length; e++) {
                const p = poly[e], q = poly[e + 1];
                const uP = uAcc;
                uAcc += Math.hypot(q.x - p.x, q.z - p.z);
                const wallBase = vertices.length / 3;
                vertices.push(p.x, topY, p.z); vertices.push(p.x, bottomY, p.z);
                vertices.push(q.x, topY, q.z); vertices.push(q.x, bottomY, q.z);
                uvs.push(uP, copingHeight); uvs.push(uP, 0);
                uvs.push(uAcc, copingHeight); uvs.push(uAcc, 0);
                indices.push(wallBase, wallBase + 2, wallBase + 1);
                indices.push(wallBase + 1, wallBase + 2, wallBase + 3);
              }
            }
          }
        }
      }
    }

    // Bottom surface
    // Bottom surface
    const bottomBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const inner = copingInnerBoundary[i];
      const outer = copingOuterBoundary[i];
      
      vertices.push(inner.x, bottomY, inner.z);
      vertices.push(outer.x, bottomY, outer.z);
      
      // World-space UV for bottom surface too
      uvs.push(inner.x, inner.z);
      uvs.push(outer.x, outer.z);
    }
    
    // Bottom surface triangles (reversed winding)
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const innerIdx = bottomBaseIdx + i * 2;
      const outerIdx = bottomBaseIdx + i * 2 + 1;
      const nextInnerIdx = bottomBaseIdx + next * 2;
      const nextOuterIdx = bottomBaseIdx + next * 2 + 1;
      
      indices.push(innerIdx, outerIdx, nextInnerIdx);
      indices.push(outerIdx, nextOuterIdx, nextInnerIdx);
    }
    
    // Outer vertical wall
    const outerWallBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const outer = copingOuterBoundary[i];
      
      vertices.push(outer.x, topY, outer.z);
      vertices.push(outer.x, bottomY, outer.z);
      
      const uCoord = distances[i];
      uvs.push(uCoord, copingHeight);
      uvs.push(uCoord, 0);
    }
    
    // Outer wall triangles
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const topIdx = outerWallBaseIdx + i * 2;
      const bottomIdx = outerWallBaseIdx + i * 2 + 1;
      const nextTopIdx = outerWallBaseIdx + next * 2;
      const nextBottomIdx = outerWallBaseIdx + next * 2 + 1;
      
      indices.push(topIdx, nextTopIdx, bottomIdx);
      indices.push(bottomIdx, nextTopIdx, nextBottomIdx);
    }
    
    // Inner vertical wall
    const innerWallBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const inner = copingInnerBoundary[i];
      
      vertices.push(inner.x, topY, inner.z);
      vertices.push(inner.x, bottomY, inner.z);
      
      const uCoord = distances[i];
      uvs.push(uCoord, copingHeight);
      uvs.push(uCoord, 0);
    }
    
    // Inner wall triangles (reversed winding)
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const topIdx = innerWallBaseIdx + i * 2;
      const bottomIdx = innerWallBaseIdx + i * 2 + 1;
      const nextTopIdx = innerWallBaseIdx + next * 2;
      const nextBottomIdx = innerWallBaseIdx + next * 2 + 1;
      
      indices.push(topIdx, bottomIdx, nextTopIdx);
      indices.push(bottomIdx, nextBottomIdx, nextTopIdx);
    }
    
    // Spillway notches: drop whole steps (all four faces of a step at once) so
    // no diagonal half-triangle shards survive at the notch edges, then seal
    // the exposed cross-sections with end caps reusing the boundary vertices —
    // the coping never shows a hollow end at a spill (lib/design/spillovers).
    const kept = cuts && cuts.length
      ? (() => {
          const N = numPoints;
          const cutStep = new Array<boolean>(N).fill(false);
          for (let i = 0; i < N; i++) {
            const j = (i + 1) % N;
            const mx = (copingInnerBoundary[i].x + copingInnerBoundary[j].x + copingOuterBoundary[i].x + copingOuterBoundary[j].x) / 4;
            const mz = (copingInnerBoundary[i].z + copingInnerBoundary[j].z + copingOuterBoundary[i].z + copingOuterBoundary[j].z) / 4;
            cutStep[i] = cuts.some((c) => inSpillCut(mx, mz, c, copingWidth));
          }
          // Triangles were appended surface by surface (top, bottom, outer wall,
          // inner wall), each surface contributing exactly N steps × 2 triangles
          // in step order — so a triangle's step is derivable from its ordinal.
          const per = N * 2;
          const out: number[] = [];
          for (let t = 0; t < indices.length; t += 3) {
            const step = Math.floor(((t / 3) % per) / 2);
            if (!cutStep[step]) out.push(indices[t], indices[t + 1], indices[t + 2]);
          }
          // End caps: at every ring vertex where exactly one neighbouring step
          // is cut, close the extrusion cross-section with the existing corners.
          for (let v = 0; v < N; v++) {
            const prevCut = cutStep[(v - 1 + N) % N], nextCut = cutStep[v];
            if (prevCut === nextCut) continue;
            const iT = v * 2, oT = v * 2 + 1, iB = bottomBaseIdx + v * 2, oB = bottomBaseIdx + v * 2 + 1;
            out.push(iT, oT, iB, oT, oB, iB);
          }
          return out;
        })()
      : indices;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(kept);
    geom.computeVertexNormals();
    
    return geom;
  }, [poolPoints, copingWidth, copingHeight, cutKey]);
  
  return (
    <mesh key={texture?.uuid || 'no-coping-texture'} geometry={geometry} castShadow receiveShadow>
      <meshPhongMaterial
        map={texture}
        color="#ffffff"
        shininess={40}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
