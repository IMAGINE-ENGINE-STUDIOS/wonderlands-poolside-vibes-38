import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { generateOffsetCurve } from '@/utils/curveUtils';
import { textureCache } from '@/utils/textureCache';

interface CopingGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  copingWidth: number;
  copingHeight: number;
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
  paverTextureUrl?: string;
}

export const CopingGeometry = ({ 
  poolPoints, 
  copingWidth = 1, 
  copingHeight = 0.25,
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0],
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
    
    // Use textureCache for proper texture management
    textureCache.loadTexture(surfaceTextureUrl, { x: 1, y: 1 })
      .then((loadedTexture) => {
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(1, 1);
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      })
      .catch((error) => {
        console.error('CopingGeometry: Failed to load texture:', error);
        setTexture(null);
      });
  }, [surfaceTextureUrl, textureOffset, textureScale]);
  
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
    // Top surface
    for (let i = 0; i < numPoints; i++) {
      const inner = copingInnerBoundary[i];
      const outer = copingOuterBoundary[i];
      
      // Top surface vertices (at copingHeight)
      vertices.push(inner.x, copingHeight, inner.z);
      vertices.push(outer.x, copingHeight, outer.z);
      
      // UV mapping: 1 foot = 1 UV unit for 1ft x 1ft squares
      // U = distance along perimeter (in feet)
      // V = 0 for inner edge, copingWidth for outer edge
      const uCoord = distances[i]; // Distance in feet = UV units
      
      uvs.push(uCoord, 0);
      uvs.push(uCoord, copingWidth);
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
      
      const uCoord = distances[i];
      uvs.push(uCoord, 0);
      uvs.push(uCoord, copingWidth);
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
      
      vertices.push(inner.x, copingHeight, inner.z);
      vertices.push(inner.x, 0, inner.z);
      
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
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? '#ffffff' : '#d4a574'}
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
