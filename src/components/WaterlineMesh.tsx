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
  waterlineHeight = 0.5, // 6 inches tall (6/12 feet = 0.5ft)
  waterlineWidth = 1.0,      // 1 foot tile along perimeter
  selectedCategory,
  waterlineTextureScale = 46,
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
      
      // Waterline tiles: scale control (inverted to fix backwards scaling)
      const repeatX = (poolPerimeter / waterlineWidth) / waterlineTextureScale;
      const repeatY = 1 / waterlineTextureScale;
      
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
    }
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
      
      // Calculate normal (pointing inward toward pool center)
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const nx = -dz / segmentLength;
      const nz = dx / segmentLength;
      
      const baseIdx = vertices.length / 3;
      
      // Waterline: 1 inch thick ceramic band, positioned 2 inches below coping top
      const copingHeight = 2 / 12; // 2 inches
      const waterlineTop = copingHeight - (2 / 12); // 2 inches below coping top = 0ft (water surface)
      const waterlineThickness = 1 / 12; // 1 inch thick
      
      // Position on pool wall - offset inward by 3mm to be in front of pool wall
      const offsetDist = 0.01;
      const innerP1 = { x: p1.x - nx * offsetDist, z: p1.z - nz * offsetDist };
      const innerP2 = { x: p2.x - nx * offsetDist, z: p2.z - nz * offsetDist };
      
      // Outer edge (toward pool center, 1 inch inward)
      const outerP1 = { x: p1.x - nx * (offsetDist + waterlineThickness), z: p1.z - nz * (offsetDist + waterlineThickness) };
      const outerP2 = { x: p2.x - nx * (offsetDist + waterlineThickness), z: p2.z - nz * (offsetDist + waterlineThickness) };
      
      // Outer edge vertices (facing pool center)
      vertices.push(outerP1.x, waterlineTop, outerP1.z);
      vertices.push(outerP2.x, waterlineTop, outerP2.z);
      vertices.push(outerP1.x, waterlineTop - waterlineHeight, outerP1.z);
      vertices.push(outerP2.x, waterlineTop - waterlineHeight, outerP2.z);
      
      // UV mapping: EXACTLY 1ft x 1ft sections (not deformed)
      // U = distance along perimeter (in feet), V = height (in feet)
      const uStart = 0;
      const uEnd = segmentLength; // Actual segment length in feet
      const vTop = waterlineHeight; // 0.5 ft (6 inches)
      const vBottom = 0;
      
      // UV coordinates for 1x1 ft tiling
      uvs.push(uStart, vTop, uEnd, vTop, uStart, vBottom, uEnd, vBottom);
      
      // Face indices (normals facing inward toward pool center)
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
