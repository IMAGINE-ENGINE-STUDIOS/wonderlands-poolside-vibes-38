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
}

export const WaterlineMesh: React.FC<WaterlineMeshProps> = ({ 
  poolPoints, 
  waterlineTextureUrl,
  waterlineHeight = 0.0833, // Exactly 1 inch thick (1/12 feet = 0.0833ft)
  waterlineWidth = 1.0,      // 1 foot tile along perimeter
  selectedCategory,
  waterlineTextureScale = 1,
  waterlineTextureOffset = [0, 0]
}) => {
  const [waterlineTexture, setWaterlineTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (waterlineTextureUrl) {
      // Calculate pool perimeter for waterline tiles
      const poolPerimeter = poolPoints.reduce((sum, p, i) => {
        const nextP = poolPoints[(i + 1) % poolPoints.length];
        return sum + Math.sqrt(Math.pow(nextP.x - p.x, 2) + Math.pow(nextP.y - p.y, 2));
      }, 0);
      
      // Waterline tiles: scale control
      const repeatX = (poolPerimeter / waterlineWidth) * waterlineTextureScale;
      const repeatY = waterlineTextureScale;
      
      textureCache.loadTexture(waterlineTextureUrl, { x: repeatX, y: repeatY })
        .then(texture => {
          texture.offset.set(waterlineTextureOffset[0], waterlineTextureOffset[1]);
          setWaterlineTexture(texture);
        })
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
      
      // Waterline: 1 inch thick band attached to upper pool wall
      // Positioned just below water surface (y=0) at top of pool wall
      // Top edge (at y=0, at water surface level)
      vertices.push(p1.x, 0, p1.z);
      vertices.push(p2.x, 0, p2.z);
      
      // Bottom edge (exactly 1 inch = 0.0833ft below water surface)
      vertices.push(p1.x, -waterlineHeight, p1.z);
      vertices.push(p2.x, -waterlineHeight, p2.z);
      
      // UV mapping: tiles are 1ft along perimeter x 1 inch tall
      const numTiles = segmentLength / waterlineWidth;
      
      // Face UVs (facing pool interior, visible from inside pool)
      uvs.push(0, 1, numTiles, 1, 0, 0, numTiles, 0);
      
      // Face indices (visible from inside pool, normals facing inward)
      indices.push(
        baseIdx, baseIdx + 3, baseIdx + 1,
        baseIdx, baseIdx + 2, baseIdx + 3
      );
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
    <mesh geometry={waterlineGeometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        map={waterlineTexture}
        color="#ffffff"
        roughness={0.3}
        metalness={0.2}
        side={THREE.DoubleSide}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};
