import { useMemo } from 'react';
import * as THREE from 'three';
import earcut from 'earcut';

interface Point {
  x: number;
  y: number;
}

interface WaterMeshProps {
  poolPoints: Point[];
}

export const WaterMesh: React.FC<WaterMeshProps> = ({ poolPoints }) => {
  const waterGeometry = useMemo(() => {
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

    // Create water surface at y = -0.08 (just below coping/deck level)
    const coords = normalizedPoints.flatMap(p => [p.x, p.z]);
    const triangles = earcut(coords);
    
    const vertices: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];
    
    for (const p of normalizedPoints) {
      vertices.push(p.x, -0.08, p.z);
      normals.push(0, 1, 0);
      uvs.push((p.x - normalizedPoints[0].x) / 10, (p.z - normalizedPoints[0].z) / 10);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(triangles);

    return geo;
  }, [poolPoints]);

  return (
    <mesh geometry={waterGeometry}>
      <meshStandardMaterial
        color="#1e90ff"
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
