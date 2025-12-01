import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { generateOffsetCurve } from '@/utils/curveUtils';

interface CopingGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  copingWidth: number;
  copingHeight: number;
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
}

export const CopingGeometry = ({ 
  poolPoints, 
  copingWidth = 1, 
  copingHeight = 0.25,
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0]
}: CopingGeometryProps) => {
  
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
        console.error('Failed to load coping texture:', error);
        setTexture(null);
      }
    );
  }, [textureUrl, textureScale, textureOffset]);
  
  const geometry = useMemo(() => {
    if (!poolPoints || poolPoints.length < 3) return new THREE.BufferGeometry();
    
    // Coping inner boundary = pool edge
    const copingInnerBoundary = poolPoints;
    
    // Coping outer boundary = offset OUTWARD by copingWidth
    const copingOuterBoundary = generateOffsetCurve(poolPoints, copingWidth);
    
    if (copingInnerBoundary.length !== copingOuterBoundary.length) {
      console.error('⚠️ CopingGeometry: Inner and outer boundaries have different point counts!');
      return new THREE.BufferGeometry();
    }
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const numPoints = copingInnerBoundary.length;
    
    // Calculate cumulative distance along perimeter for 1ft sectioned UV mapping
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
    
    // Create continuous ring geometry with 1ft square UV sections
    // Top surface
    for (let i = 0; i < numPoints; i++) {
      const inner = copingInnerBoundary[i];
      const outer = copingOuterBoundary[i];
      
      // Top surface vertices (at copingHeight)
      vertices.push(inner.x, copingHeight, inner.z);
      vertices.push(outer.x, copingHeight, outer.z);
      
      // UV mapping: section into 1ft squares along perimeter
      // U = distance along perimeter modulo 1ft (creates 1ft repeating sections)
      // V = 0 (inner edge) to 1 (outer edge) - normalized by copingWidth
      const distanceAlongPerimeter = distances[i];
      const u = distanceAlongPerimeter % 1.0; // Wrap every 1 foot
      
      // V coordinate: 0 at inner edge, 1 at outer edge (normalized to copingWidth for square aspect)
      const vInner = 0;
      const vOuter = copingWidth / 1.0; // Normalize to create square tiles
      
      uvs.push(u, vInner);
      uvs.push(u, vOuter);
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
    const bottomBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const inner = copingInnerBoundary[i];
      const outer = copingOuterBoundary[i];
      
      vertices.push(inner.x, 0, inner.z);
      vertices.push(outer.x, 0, outer.z);
      
      // Same 1ft square UV mapping for bottom
      const distanceAlongPerimeter = distances[i];
      const u = distanceAlongPerimeter % 1.0;
      const vInner = 0;
      const vOuter = copingWidth / 1.0;
      
      uvs.push(u, vInner);
      uvs.push(u, vOuter);
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
      
      vertices.push(outer.x, copingHeight, outer.z);
      vertices.push(outer.x, 0, outer.z);
      
      // 1ft square UV mapping for vertical wall
      const distanceAlongPerimeter = distances[i];
      const u = distanceAlongPerimeter % 1.0;
      const vTop = copingHeight / 1.0; // Normalize height
      const vBottom = 0;
      
      uvs.push(u, vTop);
      uvs.push(u, vBottom);
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
      
      vertices.push(inner.x, copingHeight, inner.z);
      vertices.push(inner.x, 0, inner.z);
      
      // 1ft square UV mapping for vertical wall
      const distanceAlongPerimeter = distances[i];
      const u = distanceAlongPerimeter % 1.0;
      const vTop = copingHeight / 1.0;
      const vBottom = 0;
      
      uvs.push(u, vTop);
      uvs.push(u, vBottom);
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
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? '#ffffff' : '#a8a29e'}
        roughness={0.7}
        metalness={0.2}
      />
    </mesh>
  );
};
