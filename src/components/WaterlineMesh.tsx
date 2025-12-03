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
  waterlineHeight = 0.5, // 0.5ft tall waterline band
  waterlineWidth = 0.5 / 12,  // 0.5 inch depth into wall (half inch)
  selectedCategory,
  waterlineTextureScale = 1,
  waterlineTextureOffset = [0, 0],
  copingHeight = 2 / 12 // Default 2 inches
}) => {
  const [waterlineTexture, setWaterlineTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (!waterlineTextureUrl || waterlineTextureUrl === '' || waterlineTextureUrl === 'undefined' || waterlineTextureUrl === 'null') {
      setWaterlineTexture(null);
      return;
    }
    
    // 1ft x 1ft tile - using RepeatWrapping with scale 1,1
    textureCache.loadTexture(waterlineTextureUrl, { x: 1, y: 1 })
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
  }, [waterlineTextureUrl, poolPoints, waterlineWidth, waterlineTextureOffset]);

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
    
    // Calculate cumulative distance for UV mapping (like pool walls)
    let cumulativeDistance = 0;
    const distances: number[] = [0];
    
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      cumulativeDistance += segmentLength;
      distances.push(cumulativeDistance);
    }

    // Waterline positioning: attached directly below coping bottom
    const deckLevel = 1 / 36; // 0.028 ft (1 inch above water surface, coping bottom)
    const waterlineTop = deckLevel;
    const waterlineBottom = waterlineTop - waterlineHeight;

    // Build geometry segment by segment using cumulative distance UV
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      
      // Calculate normal (pointing INWARD toward pool center)
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const nx = -dz / segmentLength;
      const nz = dx / segmentLength;

      const baseIdx = vertices.length / 3;
      
      // Outer points (at pool boundary)
      const outerP1 = { x: p1.x, z: p1.z };
      const outerP2 = { x: p2.x, z: p2.z };
      
      // Inner points (offset inward by waterlineWidth)
      const innerP1 = { x: p1.x + nx * waterlineWidth, z: p1.z + nz * waterlineWidth };
      const innerP2 = { x: p2.x + nx * waterlineWidth, z: p2.z + nz * waterlineWidth };

      // UV coordinates using cumulative distance (1ft = 1 UV unit)
      const u1 = distances[i];
      const u2 = distances[i + 1];

      // FRONT FACE (outer wall - visible from pool) - cumulative distance UV
      vertices.push(outerP1.x, waterlineTop, outerP1.z);
      vertices.push(outerP2.x, waterlineTop, outerP2.z);
      vertices.push(outerP1.x, waterlineBottom, outerP1.z);
      vertices.push(outerP2.x, waterlineBottom, outerP2.z);
      
      uvs.push(u1, waterlineHeight);
      uvs.push(u2, waterlineHeight);
      uvs.push(u1, 0);
      uvs.push(u2, 0);
      
      indices.push(
        baseIdx, baseIdx + 3, baseIdx + 1,
        baseIdx, baseIdx + 2, baseIdx + 3
      );

      // BACK FACE (inner wall) - same UV
      const backBase = vertices.length / 3;
      vertices.push(innerP1.x, waterlineTop, innerP1.z);
      vertices.push(innerP2.x, waterlineTop, innerP2.z);
      vertices.push(innerP1.x, waterlineBottom, innerP1.z);
      vertices.push(innerP2.x, waterlineBottom, innerP2.z);
      
      uvs.push(u1, waterlineHeight);
      uvs.push(u2, waterlineHeight);
      uvs.push(u1, 0);
      uvs.push(u2, 0);
      
      indices.push(
        backBase, backBase + 1, backBase + 3,
        backBase, backBase + 3, backBase + 2
      );

      // TOP FACE - world-space UV for 1ft grid
      const topBase = vertices.length / 3;
      vertices.push(outerP1.x, waterlineTop, outerP1.z);
      vertices.push(outerP2.x, waterlineTop, outerP2.z);
      vertices.push(innerP1.x, waterlineTop, innerP1.z);
      vertices.push(innerP2.x, waterlineTop, innerP2.z);
      
      uvs.push(outerP1.x, outerP1.z);
      uvs.push(outerP2.x, outerP2.z);
      uvs.push(innerP1.x, innerP1.z);
      uvs.push(innerP2.x, innerP2.z);
      
      indices.push(
        topBase, topBase + 2, topBase + 1,
        topBase + 1, topBase + 2, topBase + 3
      );

      // BOTTOM FACE - world-space UV
      const bottomBase = vertices.length / 3;
      vertices.push(outerP1.x, waterlineBottom, outerP1.z);
      vertices.push(outerP2.x, waterlineBottom, outerP2.z);
      vertices.push(innerP1.x, waterlineBottom, innerP1.z);
      vertices.push(innerP2.x, waterlineBottom, innerP2.z);
      
      uvs.push(outerP1.x, outerP1.z);
      uvs.push(outerP2.x, outerP2.z);
      uvs.push(innerP1.x, innerP1.z);
      uvs.push(innerP2.x, innerP2.z);
      
      indices.push(
        bottomBase, bottomBase + 1, bottomBase + 2,
        bottomBase + 1, bottomBase + 3, bottomBase + 2
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
