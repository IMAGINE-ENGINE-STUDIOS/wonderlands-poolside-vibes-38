import { useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface WaterlineMeshProps {
  poolPoints: Point[];
  waterlineTextureUrl?: string;
  waterlineHeight?: number;
  waterlineWidth?: number;
  selectedCategory?: string | null;
  waterlineTextureScale?: number;
  waterlineTextureOffset?: [number, number];
  copingHeight?: number;
}

export const WaterlineMesh: React.FC<WaterlineMeshProps> = ({ 
  poolPoints, 
  waterlineTextureUrl,
  waterlineHeight = 1.0, // 1ft tall waterline band
  waterlineWidth = 0.5 / 12,  // 0.5 inch depth into wall (half inch)
  selectedCategory,
  waterlineTextureScale = 1.8,
  waterlineTextureOffset = [0, 0],
  copingHeight = 2 / 12 // Default 2 inches
}) => {
  const [waterlineTexture, setWaterlineTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    // CRITICAL: Validate URL BEFORE any processing
    if (!waterlineTextureUrl || waterlineTextureUrl === '' || waterlineTextureUrl === 'undefined' || waterlineTextureUrl === 'null') {
      setWaterlineTexture(null);
      return;
    }
    
    // 1ft x 1ft tile base scale
    const repeatX = 1.0 / waterlineTextureScale;
    const repeatY = 1.0 / waterlineTextureScale;
    
    textureCache.loadTexture(waterlineTextureUrl, { x: repeatX, y: repeatY })
      .then(texture => {
        texture.offset.set(waterlineTextureOffset[0], waterlineTextureOffset[1]);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.userData.textureUrl = waterlineTextureUrl;
        texture.needsUpdate = true;
        setWaterlineTexture(texture);
      })
      .catch(err => {
        console.error('Failed to load waterline texture');
        setWaterlineTexture(null);
      });
  }, [waterlineTextureUrl, poolPoints, waterlineWidth, waterlineTextureScale, waterlineTextureOffset]);

  // Pulsing red effect when selected (8 second cycle)
  useEffect(() => {
    if (selectedCategory !== 'waterline') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => {
        if (prev >= 1) return 0;
        return prev + 0.0125; // 8 second cycle
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const waterlineGeometry = useMemo(() => {
    if (poolPoints.length < 3) {
      return new THREE.BoxGeometry(1, 0.5, 0.5);
    }

    const minX = Math.min(...poolPoints.map(p => p.x));
    const maxX = Math.max(...poolPoints.map(p => p.x));
    const minY = Math.min(...poolPoints.map(p => p.y));
    const maxY = Math.max(...poolPoints.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const normalizedPoints = poolPoints.map(p => ({
      x: p.x - centerX,
      z: p.y - centerY
    }));

    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    // Create 3D waterline band around the pool perimeter
    // Split into 1ft segments for proper texture tiling
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      
      // Calculate normal (pointing INWARD toward pool center)
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const nx = -dz / segmentLength;  // Normal pointing INWARD
      const nz = dx / segmentLength;   // Normal pointing INWARD
      
      // Waterline positioning: attached directly below coping bottom
      const deckLevel = 1 / 36; // 0.028 ft (1 inch above water surface, coping bottom)
      const waterlineTop = deckLevel; // Attached just below coping
      const waterlineBottom = waterlineTop - waterlineHeight; // waterlineHeight below that
      
      // Subdivide segment into 1ft blocks for texture mapping
      const numBlocks = Math.max(1, Math.ceil(segmentLength / 1.0));
      const blockLength = segmentLength / numBlocks;
      
      for (let block = 0; block < numBlocks; block++) {
        const t1 = block / numBlocks;
        const t2 = (block + 1) / numBlocks;
        
        // Interpolate points along the segment
        const blockP1 = {
          x: p1.x + (p2.x - p1.x) * t1,
          z: p1.z + (p2.z - p1.z) * t1
        };
        const blockP2 = {
          x: p1.x + (p2.x - p1.x) * t2,
          z: p1.z + (p2.z - p1.z) * t2
        };
        
        const baseIdx = vertices.length / 3;
        
        // Create OUTER edge (at pool boundary)
        const outerP1 = { x: blockP1.x, z: blockP1.z };
        const outerP2 = { x: blockP2.x, z: blockP2.z };
        
        // Create INNER edge (offset inward by waterlineWidth for 3D depth)
        const innerP1 = { x: blockP1.x + nx * waterlineWidth, z: blockP1.z + nz * waterlineWidth };
        const innerP2 = { x: blockP2.x + nx * waterlineWidth, z: blockP2.z + nz * waterlineWidth };
        
        // Front face (outer wall - visible from pool)
        vertices.push(outerP1.x, waterlineTop, outerP1.z);
        vertices.push(outerP2.x, waterlineTop, outerP2.z);
        vertices.push(outerP1.x, waterlineBottom, outerP1.z);
        vertices.push(outerP2.x, waterlineBottom, outerP2.z);
        
        // Back face (inner wall - visible from water)
        vertices.push(innerP1.x, waterlineTop, innerP1.z);
        vertices.push(innerP2.x, waterlineTop, innerP2.z);
        vertices.push(innerP1.x, waterlineBottom, innerP1.z);
        vertices.push(innerP2.x, waterlineBottom, innerP2.z);
        
        // Top face
        vertices.push(outerP1.x, waterlineTop, outerP1.z);
        vertices.push(outerP2.x, waterlineTop, outerP2.z);
        vertices.push(innerP1.x, waterlineTop, innerP1.z);
        vertices.push(innerP2.x, waterlineTop, innerP2.z);
        
        // Bottom face
        vertices.push(outerP1.x, waterlineBottom, outerP1.z);
        vertices.push(outerP2.x, waterlineBottom, outerP2.z);
        vertices.push(innerP1.x, waterlineBottom, innerP1.z);
        vertices.push(innerP2.x, waterlineBottom, innerP2.z);
        
        // UV mapping for 1ft blocks (each block gets full 0-1 UV range)
        const uStart = 0;
        const uEnd = blockLength / 1.0; // Normalize to 1ft blocks
        
        // UVs for front face (4 vertices)
        uvs.push(uStart, 1.0, uEnd, 1.0, uStart, 0.0, uEnd, 0.0);
        // UVs for back face (4 vertices)
        uvs.push(uStart, 1.0, uEnd, 1.0, uStart, 0.0, uEnd, 0.0);
        // UVs for top face (4 vertices)
        uvs.push(uStart, 0, uEnd, 0, uStart, 1, uEnd, 1);
        // UVs for bottom face (4 vertices)
        uvs.push(uStart, 0, uEnd, 0, uStart, 1, uEnd, 1);
        
        // Front face indices (outer wall)
        indices.push(
          baseIdx, baseIdx + 3, baseIdx + 1,
          baseIdx, baseIdx + 2, baseIdx + 3
        );
        
        // Back face indices (inner wall)
        indices.push(
          baseIdx + 4, baseIdx + 5, baseIdx + 7,
          baseIdx + 4, baseIdx + 7, baseIdx + 6
        );
        
        // Top face indices
        indices.push(
          baseIdx + 8, baseIdx + 10, baseIdx + 9,
          baseIdx + 9, baseIdx + 10, baseIdx + 11
        );
        
        // Bottom face indices
        indices.push(
          baseIdx + 12, baseIdx + 13, baseIdx + 14,
          baseIdx + 13, baseIdx + 15, baseIdx + 14
        );
      }
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, [poolPoints, waterlineHeight, waterlineWidth]);

  const isSelected = selectedCategory === 'waterline';

  return (
    <mesh key={waterlineTexture?.uuid || 'no-waterline-texture'} geometry={waterlineGeometry} position={[0, 0, 0]}>
      <meshPhongMaterial
        map={waterlineTexture}
        color="#ffffff"
        shininess={40}
        side={THREE.DoubleSide}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};
