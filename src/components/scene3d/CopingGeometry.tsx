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
  paverTextureUrl?: string; // Use paver texture for coping surface
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
  
  // Use paver texture for coping surface if provided, otherwise use coping texture
  const surfaceTextureUrl = paverTextureUrl || textureUrl;
  
  useEffect(() => {
    if (!surfaceTextureUrl) {
      console.warn('⚠️ CopingGeometry: No texture URL provided');
      setTexture(null);
      return;
    }
    
    console.log('🔄 CopingGeometry: Loading texture:', surfaceTextureUrl);
    
    const loader = new THREE.TextureLoader();
    loader.load(
      surfaceTextureUrl,
      (loadedTexture) => {
        console.log('✅ CopingGeometry: Texture loaded successfully');
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
        // Texture will repeat at 1ft intervals based on UV coordinates
        loadedTexture.repeat.set(textureScale, textureScale);
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('❌ CopingGeometry: Failed to load texture:', surfaceTextureUrl, error);
        setTexture(null);
      }
    );
    
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [surfaceTextureUrl, textureOffset]);
  
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
      
      // UV mapping: Map texture to create 1ft squares
      // U = distance along perimeter (in feet)
      // V = width from inner to outer edge (in feet)
      const distanceAlongPerimeter = distances[i];
      const uInner = distanceAlongPerimeter;
      const vInner = 0;
      const vOuter = copingWidth;
      
      uvs.push(uInner, vInner);
      uvs.push(uInner, vOuter);
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
      
      // Same UV mapping for bottom
      const distanceAlongPerimeter = distances[i];
      const uInner = distanceAlongPerimeter;
      const vInner = 0;
      const vOuter = copingWidth;
      
      uvs.push(uInner, vInner);
      uvs.push(uInner, vOuter);
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
      
      // UV mapping for vertical wall
      const distanceAlongPerimeter = distances[i];
      const u = distanceAlongPerimeter;
      const vTop = copingHeight;
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
      
      // UV mapping for vertical wall
      const distanceAlongPerimeter = distances[i];
      const u = distanceAlongPerimeter;
      const vTop = copingHeight;
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
  
  // Debug: Log render state
  console.log('🎨 CopingGeometry render:', { 
    hasTexture: !!texture, 
    textureUrl: surfaceTextureUrl,
    copingWidth,
    pointCount: poolPoints.length
  });
  
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? '#ffffff' : '#ff00ff'}
        roughness={0.8}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
