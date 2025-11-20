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
  waterlineHeight = 0.5, // 6 inches tall (6/12 feet = 0.5ft)
  waterlineWidth = 1.0,      // 1 foot tile along perimeter
  selectedCategory,
  waterlineTextureScale = 1.8,
  waterlineTextureOffset = [0, 0],
  copingHeight = 2 / 12 // Default 2 inches
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
    let cumulativePerimeter = 0; // Track cumulative distance for UV mapping
    
    // Create waterline tiles around the pool perimeter
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
      
      const baseIdx = vertices.length / 3;
      
      // Waterline positioning: sits exactly between coping bottom and deck/water level
      // Top of waterline = bottom of coping (y = 1/36 + copingHeight)
      // Bottom of waterline = deck level / water surface (y = 1/36)
      const deckLevel = 1 / 36; // 0.028 ft (1 inch above water surface)
      const waterlineTop = deckLevel + copingHeight; // Bottom of coping
      const waterlineBottom = deckLevel; // Top of water surface
      
      // Position waterline on the INNER wall surface (at pool boundary, NOT offset)
      // The inner wall face is AT the pool points, so waterline goes there
      const waterlineP1 = { x: p1.x, z: p1.z };
      const waterlineP2 = { x: p2.x, z: p2.z };
      
      // Create waterline face vertices (vertical band on inner wall at pool boundary)
      vertices.push(waterlineP1.x, waterlineTop, waterlineP1.z);
      vertices.push(waterlineP2.x, waterlineTop, waterlineP2.z);
      vertices.push(waterlineP1.x, waterlineBottom, waterlineP1.z);
      vertices.push(waterlineP2.x, waterlineBottom, waterlineP2.z);
      
      // UV mapping: EXACTLY 1ft x 1ft sections using cumulative perimeter
      // U = cumulative distance along perimeter (in feet)
      // V = normalized height within waterline band (0 to 1 for proper tiling)
      const uStart = cumulativePerimeter;
      const uEnd = cumulativePerimeter + segmentLength;
      const vTop = 1.0; // Top of 1ft tile
      const vBottom = 1.0 - ((waterlineTop - waterlineBottom) / 1.0); // Scale height within 1ft tile
      
      // UV coordinates for perfect 1x1 ft tiling
      uvs.push(uStart, vTop, uEnd, vTop, uStart, vBottom, uEnd, vBottom);
      
      // Update cumulative perimeter for next segment
      cumulativePerimeter += segmentLength;
      
      // Face indices (normals facing OUTWARD so visible from inside pool looking out)
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
