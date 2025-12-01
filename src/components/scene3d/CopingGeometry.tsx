import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';

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
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    // Coping is a ring directly at the pool edge, extending outward by copingWidth
    for (let i = 0; i < poolPoints.length; i++) {
      const p1 = poolPoints[i];
      const p2 = poolPoints[(i + 1) % poolPoints.length];
      
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const length = Math.sqrt(dx * dx + dz * dz);
      
      // Outward normal
      const nx = dz / length;
      const nz = -dx / length;
      
      const baseIdx = vertices.length / 3;
      
      // Inner edge (at pool boundary)
      const innerP1 = { x: p1.x, z: p1.z };
      const innerP2 = { x: p2.x, z: p2.z };
      
      // Outer edge (copingWidth outward)
      const outerP1 = { x: p1.x + nx * copingWidth, z: p1.z + nz * copingWidth };
      const outerP2 = { x: p2.x + nx * copingWidth, z: p2.z + nz * copingWidth };
      
      // Top surface vertices
      vertices.push(innerP1.x, copingHeight, innerP1.z); // 0
      vertices.push(outerP1.x, copingHeight, outerP1.z); // 1
      vertices.push(innerP2.x, copingHeight, innerP2.z); // 2
      vertices.push(outerP2.x, copingHeight, outerP2.z); // 3
      
      // UVs for top surface
      const u1 = i / poolPoints.length;
      const u2 = (i + 1) / poolPoints.length;
      uvs.push(u1, 0, u1, 1, u2, 0, u2, 1);
      
      // Top face triangles
      indices.push(baseIdx, baseIdx + 2, baseIdx + 1);
      indices.push(baseIdx + 1, baseIdx + 2, baseIdx + 3);
      
      // Bottom surface vertices
      const bottomBaseIdx = vertices.length / 3;
      vertices.push(innerP1.x, 0, innerP1.z);
      vertices.push(outerP1.x, 0, outerP1.z);
      vertices.push(innerP2.x, 0, innerP2.z);
      vertices.push(outerP2.x, 0, outerP2.z);
      
      uvs.push(u1, 0, u1, 1, u2, 0, u2, 1);
      
      // Bottom face (reversed winding)
      indices.push(bottomBaseIdx, bottomBaseIdx + 1, bottomBaseIdx + 2);
      indices.push(bottomBaseIdx + 1, bottomBaseIdx + 3, bottomBaseIdx + 2);
      
      // Outer vertical face
      const outerBaseIdx = vertices.length / 3;
      vertices.push(outerP1.x, copingHeight, outerP1.z);
      vertices.push(outerP1.x, 0, outerP1.z);
      vertices.push(outerP2.x, copingHeight, outerP2.z);
      vertices.push(outerP2.x, 0, outerP2.z);
      
      uvs.push(u1, 1, u1, 0, u2, 1, u2, 0);
      
      indices.push(outerBaseIdx, outerBaseIdx + 2, outerBaseIdx + 1);
      indices.push(outerBaseIdx + 1, outerBaseIdx + 2, outerBaseIdx + 3);
      
      // Inner vertical face
      const innerFaceIdx = vertices.length / 3;
      vertices.push(innerP1.x, copingHeight, innerP1.z);
      vertices.push(innerP1.x, 0, innerP1.z);
      vertices.push(innerP2.x, copingHeight, innerP2.z);
      vertices.push(innerP2.x, 0, innerP2.z);
      
      uvs.push(u1, 1, u1, 0, u2, 1, u2, 0);
      
      // Reversed winding for inner face
      indices.push(innerFaceIdx, innerFaceIdx + 1, innerFaceIdx + 2);
      indices.push(innerFaceIdx + 1, innerFaceIdx + 3, innerFaceIdx + 2);
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
