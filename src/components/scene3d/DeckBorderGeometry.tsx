import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { generateOffsetCurve } from '@/utils/curveUtils';

interface DeckBorderGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  deckWidth: number;
  copingWidth: number;
  borderHeight?: number; // Default 3 inches (0.25ft)
  borderWidth?: number; // Default 3ft minimum
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
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0]
}: DeckBorderGeometryProps) => {
  
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    if (!textureUrl) {
      console.warn('⚠️ DeckBorderGeometry: No texture URL provided');
      setTexture(null);
      return;
    }
    
    console.log('🔄 DeckBorderGeometry: Loading texture:', textureUrl);
    
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (loadedTexture) => {
        console.log('✅ DeckBorderGeometry: Texture loaded successfully');
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
        // 1ft x 1ft UV mapping like pool walls
        loadedTexture.repeat.set(1, 1);
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('❌ DeckBorderGeometry: Failed to load texture:', textureUrl, error);
        setTexture(null);
      }
    );
    
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [textureUrl, textureOffset]);
  
  const geometry = useMemo(() => {
    if (!poolPoints || poolPoints.length < 3) return new THREE.BufferGeometry();
    
    // Calculate total offset from pool edge
    // Border starts at deck outer edge (pool + coping + deck)
    const deckOuterOffset = copingWidth + deckWidth;
    
    // Inner boundary = deck outer edge
    const borderInnerBoundary = generateOffsetCurve(poolPoints, deckOuterOffset);
    
    // Outer boundary = deck outer edge + border width (can grow to 5000sqft)
    const borderOuterBoundary = generateOffsetCurve(poolPoints, deckOuterOffset + borderWidth);
    
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
    
    // TOP SURFACE - at ground level (y = 0)
    for (let i = 0; i < numPoints; i++) {
      const inner = borderInnerBoundary[i];
      const outer = borderOuterBoundary[i];
      
      // Top surface vertices at y = 0
      vertices.push(inner.x, 0, inner.z);
      vertices.push(outer.x, 0, outer.z);
      
      // UV mapping: 1 foot = 1 UV unit for 1ft x 1ft squares
      const uCoord = distances[i];
      uvs.push(uCoord, 0);
      uvs.push(uCoord, borderWidth);
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
    
    // BOTTOM SURFACE - at -borderHeight
    const bottomBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const inner = borderInnerBoundary[i];
      const outer = borderOuterBoundary[i];
      
      vertices.push(inner.x, -borderHeight, inner.z);
      vertices.push(outer.x, -borderHeight, outer.z);
      
      const uCoord = distances[i];
      uvs.push(uCoord, 0);
      uvs.push(uCoord, borderWidth);
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
    
    // OUTER VERTICAL WALL (looking from pool outward) - this is the main visible face
    const outerWallBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const outer = borderOuterBoundary[i];
      
      vertices.push(outer.x, 0, outer.z);
      vertices.push(outer.x, -borderHeight, outer.z);
      
      // UV: distance along perimeter for U, height for V
      const uCoord = distances[i];
      uvs.push(uCoord, borderHeight);
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
    
    // INNER VERTICAL WALL
    const innerWallBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const inner = borderInnerBoundary[i];
      
      vertices.push(inner.x, 0, inner.z);
      vertices.push(inner.x, -borderHeight, inner.z);
      
      const uCoord = distances[i];
      uvs.push(uCoord, borderHeight);
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
  }, [poolPoints, deckWidth, copingWidth, borderHeight, borderWidth]);
  
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? '#ffffff' : '#a3a3a3'}
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
