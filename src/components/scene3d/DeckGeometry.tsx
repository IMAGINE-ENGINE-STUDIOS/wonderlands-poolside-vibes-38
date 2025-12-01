import * as THREE from 'three';
import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';

interface DeckGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  deckWidth: number; // Width in feet (default 5ft)
  deckHeight: number; // Height in feet (default 0.25ft = 3 inches)
  copingWidth: number; // If coping enabled, deck starts after coping width
  copingEnabled: boolean;
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
}

export const DeckGeometry = ({ 
  poolPoints, 
  deckWidth = 5, 
  deckHeight = 0.25, 
  copingWidth = 1,
  copingEnabled = true,
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0]
}: DeckGeometryProps) => {
  
  const texture = textureUrl ? useTexture(textureUrl) : null;
  
  const geometry = useMemo(() => {
    if (poolPoints.length < 3) return new THREE.BufferGeometry();
    
    // Deck starts either at pool edge (if no coping) or after coping width
    const innerOffset = copingEnabled ? copingWidth : 0;
    const outerOffset = innerOffset + deckWidth;
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    // Create deck as an extruded ring around the pool
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
      
      // Top surface vertices
      // Inner edge (at pool + innerOffset)
      const innerP1 = { x: p1.x + nx * innerOffset, z: p1.z + nz * innerOffset };
      const innerP2 = { x: p2.x + nx * innerOffset, z: p2.z + nz * innerOffset };
      
      // Outer edge (at pool + outerOffset)
      const outerP1 = { x: p1.x + nx * outerOffset, z: p1.z + nz * outerOffset };
      const outerP2 = { x: p2.x + nx * outerOffset, z: p2.z + nz * outerOffset };
      
      // Top surface (4 vertices per segment)
      vertices.push(innerP1.x, deckHeight, innerP1.z); // 0
      vertices.push(outerP1.x, deckHeight, outerP1.z); // 1
      vertices.push(innerP2.x, deckHeight, innerP2.z); // 2
      vertices.push(outerP2.x, deckHeight, outerP2.z); // 3
      
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
      
      // UVs for bottom
      uvs.push(u1, 0, u1, 1, u2, 0, u2, 1);
      
      // Bottom face (reversed winding)
      indices.push(bottomBaseIdx, bottomBaseIdx + 1, bottomBaseIdx + 2);
      indices.push(bottomBaseIdx + 1, bottomBaseIdx + 3, bottomBaseIdx + 2);
      
      // Outer vertical face
      const outerBaseIdx = vertices.length / 3;
      vertices.push(outerP1.x, deckHeight, outerP1.z);
      vertices.push(outerP1.x, 0, outerP1.z);
      vertices.push(outerP2.x, deckHeight, outerP2.z);
      vertices.push(outerP2.x, 0, outerP2.z);
      
      uvs.push(u1, 1, u1, 0, u2, 1, u2, 0);
      
      indices.push(outerBaseIdx, outerBaseIdx + 2, outerBaseIdx + 1);
      indices.push(outerBaseIdx + 1, outerBaseIdx + 2, outerBaseIdx + 3);
      
      // Inner vertical face (only if no coping)
      if (!copingEnabled) {
        const innerFaceIdx = vertices.length / 3;
        vertices.push(innerP1.x, deckHeight, innerP1.z);
        vertices.push(innerP1.x, 0, innerP1.z);
        vertices.push(innerP2.x, deckHeight, innerP2.z);
        vertices.push(innerP2.x, 0, innerP2.z);
        
        uvs.push(u1, 1, u1, 0, u2, 1, u2, 0);
        
        // Reversed winding for inner face
        indices.push(innerFaceIdx, innerFaceIdx + 1, innerFaceIdx + 2);
        indices.push(innerFaceIdx + 1, innerFaceIdx + 3, innerFaceIdx + 2);
      }
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, [poolPoints, deckWidth, deckHeight, copingWidth, copingEnabled]);
  
  if (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(textureScale, textureScale);
    texture.offset.set(textureOffset[0], textureOffset[1]);
  }
  
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
