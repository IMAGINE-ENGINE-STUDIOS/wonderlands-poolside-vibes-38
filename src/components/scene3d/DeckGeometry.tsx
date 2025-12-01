import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { generateOffsetCurve } from '@/utils/curveUtils';

interface DeckGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  hardscapePoints?: Array<{ x: number; z: number }>; // From 2D designer for exact sync
  deckWidth: number;
  deckHeight: number;
  copingWidth: number;
  copingEnabled: boolean;
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
}

export const DeckGeometry = ({ 
  poolPoints,
  hardscapePoints,
  deckWidth = 5, 
  deckHeight = 0.25, 
  copingWidth = 1,
  copingEnabled = true,
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0]
}: DeckGeometryProps) => {
  
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }
    
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (loadedTexture) => {
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(textureScale, textureScale);
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Failed to load deck texture:', error);
        setTexture(null);
      }
    );
  }, [textureUrl, textureScale, textureOffset]);
  
  const geometry = useMemo(() => {
    if (!poolPoints || poolPoints.length < 3) return new THREE.BufferGeometry();
    
    
    // CRITICAL FIX: When hardscapePoints provided from 2D designer, use them as-is for outer boundary
    // The 2D designer already accounts for pool + coping + deck spacing
    let deckInnerBoundary: Array<{ x: number; z: number }>;
    let deckOuterBoundary: Array<{ x: number; z: number }>;
    
    if (hardscapePoints && hardscapePoints.length >= 4) {
      // 2D designer mode: Use exact points from designer
      // Inner boundary = pool edge + coping width
      const copingOffset = copingEnabled ? copingWidth : 0;
      deckInnerBoundary = generateOffsetCurve(poolPoints, copingOffset);
      deckOuterBoundary = hardscapePoints;
      
      
      if (deckInnerBoundary.length !== deckOuterBoundary.length) {
        const deckOuterOffset = copingOffset + deckWidth;
        deckOuterBoundary = generateOffsetCurve(poolPoints, deckOuterOffset);
      }
    } else {
      // 3D-only mode: Calculate both boundaries
      const copingOffset = copingEnabled ? copingWidth : 0;
      deckInnerBoundary = generateOffsetCurve(poolPoints, copingOffset);
      const deckOuterOffset = copingOffset + deckWidth;
      deckOuterBoundary = generateOffsetCurve(poolPoints, deckOuterOffset);
    }
    
    // Create manual BufferGeometry for proper ring-shaped deck
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    const numPoints = deckInnerBoundary.length;
    
    // Create top surface vertices (ring shape at ground level y=0)
    for (let i = 0; i < numPoints; i++) {
      // Inner vertex (at coping outer edge or pool edge)
      vertices.push(deckInnerBoundary[i].x, 0, deckInnerBoundary[i].z);
      uvs.push(0, i / numPoints);
      
      // Outer vertex (at deck outer edge)
      vertices.push(deckOuterBoundary[i].x, 0, deckOuterBoundary[i].z);
      uvs.push(1, i / numPoints);
    }
    
    // Create top face triangles (continuous ring)
    for (let i = 0; i < numPoints; i++) {
      const curr = i * 2;
      const next = ((i + 1) % numPoints) * 2;
      
      // Triangle 1: inner-curr, inner-next, outer-curr
      indices.push(curr, next, curr + 1);
      // Triangle 2: outer-curr, inner-next, outer-next
      indices.push(curr + 1, next, next + 1);
    }
    
    // Create bottom surface vertices (at -deckHeight)
    const bottomBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      vertices.push(deckInnerBoundary[i].x, -deckHeight, deckInnerBoundary[i].z);
      uvs.push(0, i / numPoints);
      
      vertices.push(deckOuterBoundary[i].x, -deckHeight, deckOuterBoundary[i].z);
      uvs.push(1, i / numPoints);
    }
    
    // Create bottom face triangles (reversed winding)
    for (let i = 0; i < numPoints; i++) {
      const curr = bottomBaseIdx + i * 2;
      const next = bottomBaseIdx + ((i + 1) % numPoints) * 2;
      
      indices.push(curr, curr + 1, next);
      indices.push(curr + 1, next + 1, next);
    }
    
    // Create outer vertical wall
    const outerWallBase = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      vertices.push(deckOuterBoundary[i].x, 0, deckOuterBoundary[i].z);
      vertices.push(deckOuterBoundary[i].x, -deckHeight, deckOuterBoundary[i].z);
      uvs.push(i / numPoints, 1);
      uvs.push(i / numPoints, 0);
    }
    
    for (let i = 0; i < numPoints; i++) {
      const curr = outerWallBase + i * 2;
      const next = outerWallBase + ((i + 1) % numPoints) * 2;
      
      indices.push(curr, next, curr + 1);
      indices.push(curr + 1, next, next + 1);
    }
    
    // Create inner vertical wall
    const innerWallBase = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      vertices.push(deckInnerBoundary[i].x, 0, deckInnerBoundary[i].z);
      vertices.push(deckInnerBoundary[i].x, -deckHeight, deckInnerBoundary[i].z);
      uvs.push(i / numPoints, 1);
      uvs.push(i / numPoints, 0);
    }
    
    for (let i = 0; i < numPoints; i++) {
      const curr = innerWallBase + i * 2;
      const next = innerWallBase + ((i + 1) % numPoints) * 2;
      
      // Reversed winding for inner wall
      indices.push(curr, curr + 1, next);
      indices.push(curr + 1, next + 1, next);
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, [poolPoints, hardscapePoints, deckWidth, deckHeight, copingWidth, copingEnabled]);
  
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? '#ffffff' : '#d4d4d8'}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};
