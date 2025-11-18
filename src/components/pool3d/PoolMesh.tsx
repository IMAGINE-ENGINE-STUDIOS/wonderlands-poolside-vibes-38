import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';
import earcut from 'earcut';

interface Point {
  x: number;
  y: number;
}

interface DepthPoint {
  position: number;
  depth: number;
}

interface PoolMeshProps {
  points: Point[];
  depthPoints: DepthPoint[];
  linerTextureUrl?: string;
  poolDimensions?: { length: number; width: number; depth: number };
  selectedCategory?: string | null;
}

export const PoolMesh: React.FC<PoolMeshProps> = ({
  points,
  depthPoints,
  linerTextureUrl,
  poolDimensions: providedDimensions,
  selectedCategory
}) => {
  const [linerTexture, setLinerTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const poolDimensions = useMemo(() => {
    if (providedDimensions) return providedDimensions;
    
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);
    const maxDepth = depthPoints.length > 0 
      ? Math.max(...depthPoints.map(d => d.depth))
      : 6;
    return { width, length, depth: maxDepth };
  }, [points, depthPoints, providedDimensions]);

  useEffect(() => {
    if (linerTextureUrl) {
      const repeatX = poolDimensions.width / 3;
      const repeatY = poolDimensions.length / 3;
      
      textureCache.loadTexture(linerTextureUrl, { x: repeatX, y: repeatY })
        .then(setLinerTexture)
        .catch(() => setLinerTexture(null));
    }

    return () => {
      if (linerTexture) disposeTexture(linerTexture);
    };
  }, [linerTextureUrl, poolDimensions]);

  useEffect(() => {
    if (selectedCategory !== 'pool') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev >= 1 ? 0 : prev + 0.0125));
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const geometry = useMemo(() => {
    if (points.length < 3) return new THREE.BufferGeometry();

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const normalizedPoints = points.map(p => ({
      x: p.x - centerX,
      z: p.y - centerY
    }));

    const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);
    const getDepthAtPosition = (positionRatio: number): number => {
      if (sortedDepths.length === 0) return poolDimensions.depth;
      if (positionRatio <= sortedDepths[0].position) return sortedDepths[0].depth;
      if (positionRatio >= sortedDepths[sortedDepths.length - 1].position) {
        return sortedDepths[sortedDepths.length - 1].depth;
      }

      for (let i = 0; i < sortedDepths.length - 1; i++) {
        const d1 = sortedDepths[i];
        const d2 = sortedDepths[i + 1];
        
        if (positionRatio >= d1.position && positionRatio <= d2.position) {
          const t = (positionRatio - d1.position) / (d2.position - d1.position);
          return d1.depth + (d2.depth - d1.depth) * t;
        }
      }
      return sortedDepths[0].depth;
    };

    const poolLength = maxY - minY;
    const poolWidth = maxX - minX;

    // Create floor and wall vertices
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];

    // FLOOR: Sloped bottom surface
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const posRatio = i / segments;
      const depth = getDepthAtPosition(posRatio);
      
      for (let j = 0; j < normalizedPoints.length; j++) {
        const p = normalizedPoints[j];
        vertices.push(p.x, -depth, p.z);
        normals.push(0, 1, 0);
        uvs.push(j / normalizedPoints.length, posRatio);
      }
    }

    // Floor indices
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < normalizedPoints.length; j++) {
        const current = i * normalizedPoints.length + j;
        const next = i * normalizedPoints.length + ((j + 1) % normalizedPoints.length);
        const currentNext = (i + 1) * normalizedPoints.length + j;
        const nextNext = (i + 1) * normalizedPoints.length + ((j + 1) % normalizedPoints.length);

        indices.push(current, next, currentNext);
        indices.push(next, nextNext, currentNext);
      }
    }

    // WALLS: Connect floor to water surface (y=0)
    const wallStart = vertices.length / 3;
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      // Top edge vertices (at water surface y=0)
      vertices.push(p1.x, 0, p1.z);
      normals.push(0, 0, -1);
      uvs.push(i / normalizedPoints.length, 0);
      
      vertices.push(p2.x, 0, p2.z);
      normals.push(0, 0, -1);
      uvs.push((i + 1) / normalizedPoints.length, 0);
      
      // Bottom edge vertices (at pool floor)
      const depthStart = getDepthAtPosition(0);
      const depthEnd = getDepthAtPosition(1);
      
      vertices.push(p1.x, -depthStart, p1.z);
      normals.push(0, 0, -1);
      uvs.push(i / normalizedPoints.length, 1);
      
      vertices.push(p2.x, -depthEnd, p2.z);
      normals.push(0, 0, -1);
      uvs.push((i + 1) / normalizedPoints.length, 1);
      
      // Wall quad indices
      const base = wallStart + i * 4;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [points, depthPoints, poolDimensions]);

  const isSelected = selectedCategory === 'pool';

  return (
    <mesh geometry={geometry} position={[0, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial
        map={linerTexture}
        roughness={0.3}
        metalness={0.1}
        side={THREE.DoubleSide}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};
