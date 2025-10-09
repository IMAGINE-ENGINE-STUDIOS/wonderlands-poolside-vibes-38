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
}

export const WaterlineMesh: React.FC<WaterlineMeshProps> = ({ 
  poolPoints, 
  waterlineTextureUrl,
  waterlineHeight = 0.0833, // Height of waterline tile (1 inch = 0.0833 feet)
  waterlineWidth = 0.5      // Width/depth into pool wall
}) => {
  const [waterlineTexture, setWaterlineTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (waterlineTextureUrl) {
      textureCache.loadTexture(waterlineTextureUrl, { x: 1, y: 1 })
        .then(setWaterlineTexture)
        .catch(err => {
          console.error('Failed to load waterline texture');
          setWaterlineTexture(null);
        });
    }

    return () => {
      if (waterlineTexture) {
        disposeTexture(waterlineTexture);
      }
    };
  }, [waterlineTextureUrl]);

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
    
    // Create waterline tiles around the pool perimeter
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      
      // Calculate normal (pointing inward)
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const nx = -dz / segmentLength;
      const nz = dx / segmentLength;
      
      const baseIdx = vertices.length / 3;
      
      // Outer edge (at bottom of coping, touching pool wall)
      vertices.push(p1.x, -0.65, p1.z);  // Positioned at bottom of coping
      vertices.push(p2.x, -0.65, p2.z);
      
      // Outer edge bottom (1 inch below)
      vertices.push(p1.x, -0.65 - waterlineHeight, p1.z);
      vertices.push(p2.x, -0.65 - waterlineHeight, p2.z);
      
      // Inner edge (waterlineWidth into pool)
      vertices.push(
        p1.x + nx * waterlineWidth,
        -0.65,
        p1.z + nz * waterlineWidth
      );
      vertices.push(
        p2.x + nx * waterlineWidth,
        -0.65,
        p2.z + nz * waterlineWidth
      );
      
      // Inner edge bottom
      vertices.push(
        p1.x + nx * waterlineWidth,
        -0.65 - waterlineHeight,
        p1.z + nz * waterlineWidth
      );
      vertices.push(
        p2.x + nx * waterlineWidth,
        -0.65 - waterlineHeight,
        p2.z + nz * waterlineWidth
      );
      
      // UV mapping: each tile gets one texture repeat
      const numTiles = Math.ceil(segmentLength / 1.0); // 1ft tiles
      
      // Front face (facing outward)
      uvs.push(0, 1, numTiles, 1, 0, 0, numTiles, 0);
      
      // Top face
      uvs.push(0, 0, numTiles, 0, 0, 1, numTiles, 1);
      
      // Front face indices
      indices.push(
        baseIdx, baseIdx + 1, baseIdx + 3,
        baseIdx, baseIdx + 3, baseIdx + 2
      );
      
      // Top face indices
      indices.push(
        baseIdx, baseIdx + 4, baseIdx + 5,
        baseIdx, baseIdx + 5, baseIdx + 1
      );
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, [poolPoints, waterlineHeight, waterlineWidth]);

  if (!waterlineTextureUrl) return null;

  return (
    <mesh geometry={waterlineGeometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        map={waterlineTexture}
        color={waterlineTexture ? "#ffffff" : "#1976D2"}
        roughness={0.3}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
