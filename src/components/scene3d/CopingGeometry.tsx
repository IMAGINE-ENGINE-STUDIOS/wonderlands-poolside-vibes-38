import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { mitredOffsetRing } from '@/utils/polygonGeometry';
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
}

export const CopingGeometry = ({ 
  poolPoints, 
  copingWidth = 1, 
  copingHeight = 0.25,
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0],
  textureRotation = 0,
  paverTextureUrl
}: CopingGeometryProps) => {
  
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

    // Exact mitred band: sharp tips (triangular pools) get a bevel instead of a
    // collapsed/overlapping corner, and the inner ring is expanded in lockstep so
    // every inner vertex pairs with exactly one outer vertex.
    const { base: copingInnerBoundary, offset: copingOuterBoundary } = mitredOffsetRing(
      poolPoints,
      copingWidth,
      { miterLimit: 2.5 }
    );

    if (copingInnerBoundary.length < 3) return new THREE.BufferGeometry();

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
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, [poolPoints, copingWidth, copingHeight]);
  
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
