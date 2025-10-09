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
}

export const WaterlineMesh: React.FC<WaterlineMeshProps> = ({ 
  poolPoints, 
  waterlineTextureUrl,
  waterlineHeight = 0.0833, // Height of waterline tile (1 inch = 0.0833 feet)
  waterlineWidth = 1.0,      // Width/depth: 1 sq ft tile (1ft along perimeter)
  selectedCategory
}) => {
  const [waterlineTexture, setWaterlineTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

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
      
      // Waterline: 1 inch thick, 1 sq ft tile attached to upper pool wall
      // Top edge (at bottom of coping = 0.15)
      vertices.push(p1.x, 0, p1.z);
      vertices.push(p2.x, 0, p2.z);
      
      // Bottom edge (1 inch below = -0.0833)
      vertices.push(p1.x, -0.0833, p1.z);
      vertices.push(p2.x, -0.0833, p2.z);
      
      // UV mapping: 1 sq ft tiles along perimeter
      const numTiles = Math.ceil(segmentLength / 1.0);
      
      // Front face UVs (facing outward, showing liner pattern)
      uvs.push(0, 1, numTiles, 1, 0, 0, numTiles, 0);
      
      // Front face indices (visible from outside pool)
      indices.push(
        baseIdx, baseIdx + 1, baseIdx + 3,
        baseIdx, baseIdx + 3, baseIdx + 2
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

  const isSelected = selectedCategory === 'waterline';

  return (
    <mesh geometry={waterlineGeometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        map={waterlineTexture}
        color={waterlineTexture ? "#ffffff" : "#1976D2"}
        roughness={0.3}
        metalness={0.2}
        side={THREE.DoubleSide}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};
