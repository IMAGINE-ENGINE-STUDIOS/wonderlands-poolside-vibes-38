import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Line } from '@react-three/drei';
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

  // Create accurate pool geometry from top view outline and depth profile
  const { geometry, wallsGeometry } = useMemo(() => {
    if (points.length < 3) {
      return {
        geometry: new THREE.BoxGeometry(1, 1, 1),
        wallsGeometry: new THREE.BoxGeometry(1, 1, 1)
      };
    }

    // Calculate pool bounds from the actual points
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const poolWidthPx = maxX - minX;
    const poolLengthPx = maxY - minY;
    const poolWidth = poolWidthPx / scale;
    const poolLength = poolLengthPx / scale;

    // Determine which dimension is longer - depth profile should run along the longest dimension
    const isWidthLonger = poolWidth > poolLength;
    const longDimension = isWidthLonger ? poolWidth : poolLength;
    const shortDimension = isWidthLonger ? poolLength : poolWidth;

    // Convert 2D pool points to 3D coordinates (canvas space to world space)
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Normalize points to center around origin
    const normalizedPoints = points.map(p => ({
      x: (p.x - centerX) / scale,
      z: (p.y - centerY) / scale
    }));

    // Sort depth points by position
    const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);

    // Create shape from top-view outline
    const shape = new THREE.Shape();
    normalizedPoints.forEach((p, i) => {
      if (i === 0) {
        shape.moveTo(p.x, p.z);
      } else {
        shape.lineTo(p.x, p.z);
      }
    });
    shape.closePath();

    // Interpolate depth at any position
    const getDepthAtPosition = (positionRatio: number): number => {
      if (sortedDepths.length === 0) return 5;
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

    // Create detailed pool geometry with varying depth
    const segments = 40;
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // Create top surface (water level at y = 0)
    const topVertices: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const u = i / segments;
        const v = j / segments;
        
        // Interpolate position within pool outline
        const x = (u - 0.5) * poolWidth;
        const z = (v - 0.5) * poolLength;
        
        vertices.push(x, 0, z);
        normals.push(0, 1, 0);
        uvs.push(u, v);
        topVertices.push(new THREE.Vector3(x, 0, z));
      }
    }

    const verticesPerRow = segments + 1;
    
    // Create bottom surface with varying depth based on position along LONGEST dimension
    const bottomVertices: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const u = i / segments;
        const v = j / segments;
        
        const x = (u - 0.5) * poolWidth;
        const z = (v - 0.5) * poolLength;
        
        // Calculate depth based on position along the LONGEST dimension
        // If width is longer (x-axis), use u; if length is longer (z-axis), use v
        const depthPosition = isWidthLonger ? u : v;
        const depth = getDepthAtPosition(depthPosition);
        
        vertices.push(x, -depth, z);
        normals.push(0, -1, 0);
        uvs.push(u, v);
        bottomVertices.push(new THREE.Vector3(x, -depth, z));
      }
    }

    // Create indices for top surface
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

    // Create indices for bottom surface
    const bottomOffset = topVertices.length;
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

    // Create pool walls geometry
    const wallVertices: number[] = [];
    const wallIndices: number[] = [];
    const wallNormals: number[] = [];
    
    // Create walls along pool perimeter
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      // Calculate position ratios for depth along the longest dimension
      let pos1, pos2;
      if (isWidthLonger) {
        // Depth varies along X axis
        pos1 = (p1.x + poolWidth / 2) / poolWidth;
        pos2 = (p2.x + poolWidth / 2) / poolWidth;
      } else {
        // Depth varies along Z axis
        pos1 = (p1.z + poolLength / 2) / poolLength;
        pos2 = (p2.z + poolLength / 2) / poolLength;
      }
      
      const depth1 = getDepthAtPosition(pos1);
      const depth2 = getDepthAtPosition(pos2);
      
      const baseIdx = wallVertices.length / 3;
      
      // Top edge of wall
      wallVertices.push(p1.x, 0, p1.z);
      wallVertices.push(p2.x, 0, p2.z);
      
      // Bottom edge of wall
      wallVertices.push(p1.x, -depth1, p1.z);
      wallVertices.push(p2.x, -depth2, p2.z);
      
      // Calculate wall normal (perpendicular to wall)
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      const nx = -dz / len;
      const nz = dx / len;
      
      // Add normals for all 4 vertices
      for (let v = 0; v < 4; v++) {
        wallNormals.push(nx, 0, nz);
      }
      
      // Create wall quad
      wallIndices.push(
        baseIdx, baseIdx + 1, baseIdx + 3,
        baseIdx, baseIdx + 3, baseIdx + 2
      );
    }

    const poolGeometry = new THREE.BufferGeometry();
    poolGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    poolGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    poolGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    poolGeometry.setIndex(indices);
    poolGeometry.computeVertexNormals();

    const poolWallsGeometry = new THREE.BufferGeometry();
    poolWallsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wallVertices, 3));
    poolWallsGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(wallNormals, 3));
    poolWallsGeometry.setIndex(wallIndices);
    poolWallsGeometry.computeVertexNormals();

    return {
      geometry: poolGeometry,
      wallsGeometry: poolWallsGeometry
    };
  }, [points, depthPoints, scale, poolShape]);

  return (
    <>
      {/* Pool water surface and floor */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhongMaterial
          color="#4DD0E1"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          shininess={100}
          specular="#ffffff"
        />
      </mesh>

      {/* Pool walls */}
      <mesh geometry={wallsGeometry}>
        <meshStandardMaterial
          color="#2196F3"
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Pool outline wireframe for reference */}
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#1976D2" opacity={0.3} transparent />
      </lineSegments>
    </>
  );
};

const Scene = ({ points, depthPoints, scale, poolShape }: Pool3DViewerProps) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[30, 25, 30]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-20, 20, -10]} intensity={0.6} />
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffffff" />
      <hemisphereLight intensity={0.4} color="#87CEEB" groundColor="#8B7355" />

      {/* Grid */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#9ca3af"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#6b7280"
        fadeDistance={80}
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

      {/* Axes helper */}
      <axesHelper args={[5]} />
    </>
  );
};

export const Pool3DViewer = ({ points, depthPoints, scale, poolShape }: Pool3DViewerProps) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-100 to-background rounded-lg overflow-hidden">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
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
