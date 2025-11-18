import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';

interface Point {
  x: number;
  y: number;
}

interface CopingMeshProps {
  poolPoints: Point[];
  copingTextureUrl?: string;
  selectedCategory?: string | null;
}

export const CopingMesh: React.FC<CopingMeshProps> = ({
  poolPoints,
  copingTextureUrl,
  selectedCategory
}) => {
  const [copingTexture, setCopingTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const poolPerimeter = useMemo(() => {
    if (poolPoints.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const p1 = poolPoints[i];
      const p2 = poolPoints[(i + 1) % poolPoints.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }, [poolPoints]);

  useEffect(() => {
    if (copingTextureUrl) {
      const repeatX = Math.max(1, poolPerimeter / 1);
      const repeatY = 1;
      
      textureCache.loadTexture(copingTextureUrl, { x: repeatX, y: repeatY })
        .then(setCopingTexture)
        .catch(() => setCopingTexture(null));
    }

    return () => {
      if (copingTexture) disposeTexture(copingTexture);
    };
  }, [copingTextureUrl, poolPerimeter]);

  useEffect(() => {
    if (selectedCategory !== 'coping') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev >= 1 ? 0 : prev + 0.0125));
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const geometry = useMemo(() => {
    if (poolPoints.length < 3) return new THREE.BufferGeometry();

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
    const normals: number[] = [];
    
    // Coping sits FLUSH on deck at y=0, extends 1ft outward from pool edge
    const copingWidth = 1.0;    // 1 foot wide
    const copingHeight = 0.25;  // 3 inches tall above deck
    
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      
      // Outward normal
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const nx = -dz / segmentLength;
      const nz = dx / segmentLength;
      
      const baseIdx = vertices.length / 3;
      
      // TOP SURFACE (y = copingHeight)
      // Inner edge (pool edge)
      vertices.push(p1.x, copingHeight, p1.z);
      normals.push(0, 1, 0);
      uvs.push(i / normalizedPoints.length, 0);
      
      vertices.push(p2.x, copingHeight, p2.z);
      normals.push(0, 1, 0);
      uvs.push((i + 1) / normalizedPoints.length, 0);
      
      // Outer edge
      vertices.push(p1.x + nx * copingWidth, copingHeight, p1.z + nz * copingWidth);
      normals.push(0, 1, 0);
      uvs.push(i / normalizedPoints.length, 1);
      
      vertices.push(p2.x + nx * copingWidth, copingHeight, p2.z + nz * copingWidth);
      normals.push(0, 1, 0);
      uvs.push((i + 1) / normalizedPoints.length, 1);
      
      // Top face indices
      indices.push(baseIdx, baseIdx + 2, baseIdx + 1);
      indices.push(baseIdx + 1, baseIdx + 2, baseIdx + 3);
      
      // INNER SIDE (facing pool water)
      const sideBaseIdx = vertices.length / 3;
      vertices.push(p1.x, copingHeight, p1.z);
      normals.push(-nx, 0, -nz);
      uvs.push(i / normalizedPoints.length, 0);
      
      vertices.push(p2.x, copingHeight, p2.z);
      normals.push(-nx, 0, -nz);
      uvs.push((i + 1) / normalizedPoints.length, 0);
      
      vertices.push(p1.x, 0, p1.z);
      normals.push(-nx, 0, -nz);
      uvs.push(i / normalizedPoints.length, 1);
      
      vertices.push(p2.x, 0, p2.z);
      normals.push(-nx, 0, -nz);
      uvs.push((i + 1) / normalizedPoints.length, 1);
      
      indices.push(sideBaseIdx, sideBaseIdx + 1, sideBaseIdx + 2);
      indices.push(sideBaseIdx + 1, sideBaseIdx + 3, sideBaseIdx + 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    return geo;
  }, [poolPoints]);

  const isSelected = selectedCategory === 'coping';

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={copingTexture}
        roughness={0.7}
        metalness={0.0}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};
