import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface DepthPoint {
  position: number;
  depth: number;
  id: string;
}

interface Pool3DViewerProps {
  points: Point[];
  depthPoints: DepthPoint[];
  scale: number;
  poolShape: 'rectangle' | 'kidney' | 'freeform';
}

const PoolMesh = ({ points, depthPoints, scale, poolShape }: Pool3DViewerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create pool geometry based on points and depths
  const geometry = useMemo(() => {
    if (points.length < 3) return new THREE.BoxGeometry(1, 1, 1);

    // Calculate pool bounds
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const poolWidth = (maxX - minX) / scale;
    const poolLength = (maxY - minY) / scale;

    // Sort depth points by position
    const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);
    
    // Create segments for varying depth
    const segments = 20;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // Create top surface (water level at y=0)
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * poolWidth;
        const z = (j / segments - 0.5) * poolLength;
        
        vertices.push(x, 0, z);
        normals.push(0, 1, 0);
        uvs.push(i / segments, j / segments);
      }
    }

    // Create bottom surface with varying depths
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * poolWidth;
        const z = (j / segments - 0.5) * poolLength;
        
        // Interpolate depth based on position along length
        const depthPosition = j / segments;
        let depth = 3; // default depth
        
        // Find depth at this position
        for (let d = 0; d < sortedDepths.length - 1; d++) {
          const d1 = sortedDepths[d];
          const d2 = sortedDepths[d + 1];
          
          if (depthPosition >= d1.position && depthPosition <= d2.position) {
            const t = (depthPosition - d1.position) / (d2.position - d1.position);
            depth = d1.depth + (d2.depth - d1.depth) * t;
            break;
          }
        }
        
        vertices.push(x, -depth, z);
        normals.push(0, -1, 0);
        uvs.push(i / segments, j / segments);
      }
    }

    // Create indices for top and bottom faces
    const verticesPerRow = segments + 1;
    
    // Top face
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * verticesPerRow + j;
        const b = i * verticesPerRow + j + 1;
        const c = (i + 1) * verticesPerRow + j + 1;
        const d = (i + 1) * verticesPerRow + j;
        
        indices.push(a, b, c);
        indices.push(a, c, d);
      }
    }

    // Bottom face
    const bottomOffset = (segments + 1) * (segments + 1);
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = bottomOffset + i * verticesPerRow + j;
        const b = bottomOffset + i * verticesPerRow + j + 1;
        const c = bottomOffset + (i + 1) * verticesPerRow + j + 1;
        const d = bottomOffset + (i + 1) * verticesPerRow + j;
        
        indices.push(a, c, b);
        indices.push(a, d, c);
      }
    }

    // Create side walls
    // Front wall
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * poolWidth;
      const topIdx = i;
      const bottomIdx = bottomOffset + i;
      
      vertices.push(x, 0, -poolLength / 2);
      vertices.push(x, vertices[bottomIdx * 3 + 1], -poolLength / 2);
      normals.push(0, 0, -1);
      normals.push(0, 0, -1);
      uvs.push(i / segments, 0);
      uvs.push(i / segments, 1);
    }

    // Back wall
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * poolWidth;
      const topIdx = i * verticesPerRow + segments;
      const bottomIdx = bottomOffset + i * verticesPerRow + segments;
      
      vertices.push(x, 0, poolLength / 2);
      vertices.push(x, vertices[bottomIdx * 3 + 1], poolLength / 2);
      normals.push(0, 0, 1);
      normals.push(0, 0, 1);
      uvs.push(i / segments, 0);
      uvs.push(i / segments, 1);
    }

    // Left wall
    for (let j = 0; j <= segments; j++) {
      const z = (j / segments - 0.5) * poolLength;
      const topIdx = j;
      const bottomIdx = bottomOffset + j;
      
      vertices.push(-poolWidth / 2, 0, z);
      vertices.push(-poolWidth / 2, vertices[bottomIdx * 3 + 1], z);
      normals.push(-1, 0, 0);
      normals.push(-1, 0, 0);
      uvs.push(j / segments, 0);
      uvs.push(j / segments, 1);
    }

    // Right wall
    for (let j = 0; j <= segments; j++) {
      const z = (j / segments - 0.5) * poolLength;
      const topIdx = segments * verticesPerRow + j;
      const bottomIdx = bottomOffset + segments * verticesPerRow + j;
      
      vertices.push(poolWidth / 2, 0, z);
      vertices.push(poolWidth / 2, vertices[bottomIdx * 3 + 1], z);
      normals.push(1, 0, 0);
      normals.push(1, 0, 0);
      uvs.push(j / segments, 0);
      uvs.push(j / segments, 1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [points, depthPoints, scale, poolShape]);

  return (
    <>
      {/* Pool water */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhongMaterial
          color="#4DD0E1"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          shininess={100}
        />
      </mesh>

      {/* Pool walls (solid) */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#2196F3"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

const Scene = ({ points, depthPoints, scale, poolShape }: Pool3DViewerProps) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[25, 20, 25]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {/* Grid */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Pool mesh */}
      <PoolMesh
        points={points}
        depthPoints={depthPoints}
        scale={scale}
        poolShape={poolShape}
      />
    </>
  );
};

export const Pool3DViewer = ({ points, depthPoints, scale, poolShape }: Pool3DViewerProps) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <Scene
          points={points}
          depthPoints={depthPoints}
          scale={scale}
          poolShape={poolShape}
        />
      </Canvas>
    </div>
  );
};
