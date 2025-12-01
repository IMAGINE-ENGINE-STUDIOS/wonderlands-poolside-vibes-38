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
    
    console.log('🔧 CopingGeometry: Creating coping ring at pool edge');
    
    // Coping sits OUTSIDE the pool walls
    // Inner edge: AT the pool wall boundary (water edge)
    const copingInner = poolPoints;
    
    // Outer edge: copingWidth outward from pool walls
    const copingOuter = generateOffsetCurve(poolPoints, copingWidth);
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    const numPoints = copingInner.length;
    
    // Create top surface at copingHeight (above water level)
    for (let i = 0; i < numPoints; i++) {
      // Inner vertex (at pool wall / water edge)
      vertices.push(copingInner[i].x, copingHeight, copingInner[i].z);
      uvs.push(0, i / numPoints);
      
      // Outer vertex (copingWidth outward)
      vertices.push(copingOuter[i].x, copingHeight, copingOuter[i].z);
      uvs.push(1, i / numPoints);
    }
    
    // Create top face triangles
    for (let i = 0; i < numPoints; i++) {
      const curr = i * 2;
      const next = ((i + 1) % numPoints) * 2;
      
      indices.push(curr, next, curr + 1);
      indices.push(curr + 1, next, next + 1);
    }
    
    // Create bottom surface at ground level (y=0)
    const bottomBaseIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      vertices.push(copingInner[i].x, 0, copingInner[i].z);
      uvs.push(0, i / numPoints);
      
      vertices.push(copingOuter[i].x, 0, copingOuter[i].z);
      uvs.push(1, i / numPoints);
    }
    
    // Bottom face (reversed winding)
    for (let i = 0; i < numPoints; i++) {
      const curr = bottomBaseIdx + i * 2;
      const next = bottomBaseIdx + ((i + 1) % numPoints) * 2;
      
      indices.push(curr, curr + 1, next);
      indices.push(curr + 1, next + 1, next);
    }
    
    // Outer vertical wall
    const outerWallBase = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      vertices.push(copingOuter[i].x, copingHeight, copingOuter[i].z);
      vertices.push(copingOuter[i].x, 0, copingOuter[i].z);
      uvs.push(i / numPoints, 1);
      uvs.push(i / numPoints, 0);
    }
    
    for (let i = 0; i < numPoints; i++) {
      const curr = outerWallBase + i * 2;
      const next = outerWallBase + ((i + 1) % numPoints) * 2;
      
      indices.push(curr, next, curr + 1);
      indices.push(curr + 1, next, next + 1);
    }
    
    // Inner vertical wall (facing pool interior)
    const innerWallBase = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      vertices.push(copingInner[i].x, copingHeight, copingInner[i].z);
      vertices.push(copingInner[i].x, 0, copingInner[i].z);
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
    
    console.log('✅ Coping ring created at water edge with', geom.getAttribute('position').count, 'vertices');
    
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
