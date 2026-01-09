import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { generateOffsetCurve } from '@/utils/curveUtils';
import { textureCache } from '@/utils/textureCache';

interface DeckBorderGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  deckWidth: number;
  copingWidth: number;
  borderHeight?: number; // Default 3 inches (0.25ft)
  borderWidth?: number; // Default 3ft minimum
  deckElevation?: number; // Height above/below ground (positive = above, negative = below, 0 = flush)
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
}

export const DeckBorderGeometry = ({ 
  poolPoints, 
  deckWidth = 5,
  copingWidth = 1,
  borderHeight = 0.25, // 3 inches
  borderWidth = 3, // 3ft minimum
  deckElevation = 0, // Default flush with ground
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0]
}: DeckBorderGeometryProps) => {
  
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { invalidate } = useThree();
  
  useEffect(() => {
    if (!textureUrl || textureUrl === '' || textureUrl === 'undefined') {
      setTexture(null);
      invalidate();
      return;
    }
    
    // Match pool wall texture loading exactly
    const repeatX = 1.0 / textureScale;
    const repeatY = 1.0 / textureScale;
    
    textureCache.loadTexture(textureUrl, { x: repeatX, y: repeatY })
      .then((loadedTexture) => {
        loadedTexture.userData.url = textureUrl;
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
        // IMPORTANT: Canvas is frameloop="demand"; force a frame when async texture finishes.
        invalidate();
      })
      .catch((error) => {
        console.error('DeckBorderGeometry: Failed to load texture:', error);
        setTexture(null);
        invalidate();
      });
  }, [textureUrl, textureOffset, textureScale, invalidate]);
  
  const geometry = useMemo(() => {
    if (!poolPoints || poolPoints.length < 3) return new THREE.BufferGeometry();
    
    // Deck starts RIGHT at coping outer edge (snapped to coping, no gap)
    // Inner boundary = coping outer edge (pool + copingWidth)
    const borderInnerBoundary = generateOffsetCurve(poolPoints, copingWidth);
    
    // Outer boundary = coping outer edge + borderWidth (grows OUTWARD from coping)
    const borderOuterBoundary = generateOffsetCurve(poolPoints, copingWidth + borderWidth);
    
    if (borderInnerBoundary.length !== borderOuterBoundary.length) {
      console.error('⚠️ DeckBorderGeometry: Inner and outer boundaries have different point counts!');
      return new THREE.BufferGeometry();
    }
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const numPoints = borderInnerBoundary.length;
    
    // Calculate cumulative distance along perimeter for 1ft x 1ft UV mapping (like pool walls)
    const distances: number[] = [0];
    let totalDistance = 0;
    
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const p1 = borderInnerBoundary[i];
      const p2 = borderInnerBoundary[next];
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      totalDistance += segmentLength;
      distances.push(totalDistance);
    }
    
    // TOP SURFACE - at deckElevation level
    // Deck surface is at deckElevation (positive = above ground, 0 = flush, negative = below)
    const deckTopY = deckElevation;
    const deckBottomY = deckElevation - borderHeight;
    
    // When elevated, we need walls down to ground level (y=0)
    // When below ground, walls go up to ground level
    const wallBottomY = Math.min(deckBottomY, 0);
    const wallTopY = Math.max(deckTopY, 0);
    const wallHeight = Math.abs(deckTopY) + borderHeight;
    
    for (let i = 0; i < numPoints; i++) {
      const inner = borderInnerBoundary[i];
      const outer = borderOuterBoundary[i];
      
      // Top surface vertices at deckElevation
      vertices.push(inner.x, deckTopY, inner.z);
      vertices.push(outer.x, deckTopY, outer.z);
      
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
    
    // BOTTOM SURFACE - at deckBottomY
    const bottomBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const inner = borderInnerBoundary[i];
      const outer = borderOuterBoundary[i];
      
      vertices.push(inner.x, deckBottomY, inner.z);
      vertices.push(outer.x, deckBottomY, outer.z);
      
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
    
    // OUTER VERTICAL WALL (looking from pool outward) - from deck surface to ground level
    const outerWallBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const outer = borderOuterBoundary[i];
      
      // Wall from deck top to ground (or deck bottom if below ground)
      vertices.push(outer.x, deckTopY, outer.z);
      vertices.push(outer.x, wallBottomY, outer.z);
      
      // UV: distance along perimeter for U, height for V
      const uCoord = distances[i];
      uvs.push(uCoord, wallHeight);
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
    
    // INNER VERTICAL WALL - from deck surface to ground level
    const innerWallBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const inner = borderInnerBoundary[i];
      
      vertices.push(inner.x, deckTopY, inner.z);
      vertices.push(inner.x, wallBottomY, inner.z);
      
      const uCoord = distances[i];
      uvs.push(uCoord, wallHeight);
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
  }, [poolPoints, deckWidth, copingWidth, borderHeight, borderWidth, deckElevation]);
  
  return (
    <mesh key={texture?.uuid || 'no-deck-texture'} geometry={geometry} castShadow receiveShadow>
      <meshPhongMaterial
        map={texture}
        color="#ffffff"
        shininess={40}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
