import { useRef, useMemo, useEffect, useState } from 'react';
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

interface HardscapePoint {
  x: number;
  y: number;
  id: string;
}

interface FencePoint {
  x: number;
  y: number;
  id: string;
}

interface PoolFeature {
  type: 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home' | 'shrub' | 'umbrella' | 'fence' | 'pathway';
  x: number;
  y: number;
  id: string;
  angle?: number;
  steps?: number;
  width?: number;
  height?: number;
  treeType?: 'palm' | 'oak' | 'pine' | 'willow' | 'maple' | 'cypress';
  shrubType?: 'round' | 'flowering' | 'hedge';
  roofPoints?: any[];
}

interface Pool3DViewerProps {
  points: Point[];
  depthPoints: DepthPoint[];
  scale: number;
  poolShape: 'rectangle' | 'kidney' | 'freeform';
  hardscapePoints?: HardscapePoint[];
  fencePoints?: FencePoint[];
  features?: PoolFeature[];
  paverTextureUrl?: string;
  linerTextureUrl?: string;
  copingTextureUrl?: string;
}

const PoolMesh = ({ points, depthPoints, scale, poolShape, linerTextureUrl }: Pool3DViewerProps & { linerTextureUrl?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    if (linerTextureUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(linerTextureUrl, (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(5, 5);
        setTexture(loadedTexture);
      });
    }
  }, [linerTextureUrl]);

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
      <mesh ref={meshRef} geometry={geometry} position={[0, -0.5, 0]}>
        <meshPhongMaterial
          map={texture}
          color="#4DD0E1"
          transparent
          opacity={texture ? 0.85 : 0.75}
          side={THREE.DoubleSide}
          shininess={100}
          specular="#ffffff"
        />
      </mesh>

      {/* Pool walls */}
      <mesh geometry={wallsGeometry} position={[0, -0.5, 0]}>
        <meshStandardMaterial
          map={texture}
          color="#2196F3"
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Pool outline wireframe for reference */}
      <lineSegments position={[0, -0.5, 0]}>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#1976D2" opacity={0.3} transparent />
      </lineSegments>
    </>
  );
};

// Deck component with proper thickness, texture, and CSG hole cutting
const DeckMesh = ({ 
  hardscapePoints, 
  poolPoints, 
  poolCenterX, 
  poolCenterY, 
  scale,
  paverTextureUrl,
  features = []
}: { 
  hardscapePoints: HardscapePoint[], 
  poolPoints: Point[],
  poolCenterX: number,
  poolCenterY: number,
  scale: number,
  paverTextureUrl?: string,
  features?: PoolFeature[]
}) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    if (paverTextureUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(paverTextureUrl, (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(10, 10);
        setTexture(loadedTexture);
      });
    }
  }, [paverTextureUrl]);

  const deckWithHoles = useMemo(() => {
    if (hardscapePoints.length < 3) return null;

    const deckThickness = 0.5; // 6 inches = 0.5 feet
    const deckY = 0; // Deck at ground level
    
    // Create deck shape from hardscape points
    const deckShape = new THREE.Shape();
    hardscapePoints.forEach((p, i) => {
      const x = (p.x - poolCenterX) / scale;
      const z = (p.y - poolCenterY) / scale;
      
      if (i === 0) {
        deckShape.moveTo(x, z);
      } else {
        deckShape.lineTo(x, z);
      }
    });
    deckShape.closePath();
    
    // Add pool hole as a hole in the deck shape
    if (poolPoints.length >= 3) {
      const poolHole = new THREE.Path();
      poolPoints.forEach((p, i) => {
        const x = (p.x - poolCenterX) / scale;
        const z = (p.y - poolCenterY) / scale;
        
        if (i === 0) {
          poolHole.moveTo(x, z);
        } else {
          poolHole.lineTo(x, z);
        }
      });
      poolHole.closePath();
      deckShape.holes.push(poolHole);
    }
    
    // Add feature holes
    features.forEach(feature => {
      if (feature.type === 'fountain' || feature.type === 'light') {
        const featureX = (feature.x - poolCenterX) / scale;
        const featureZ = (feature.y - poolCenterY) / scale;
        const holeRadius = feature.type === 'fountain' ? 0.8 : 0.4;
        
        const featureHole = new THREE.Path();
        featureHole.absarc(featureX, featureZ, holeRadius, 0, Math.PI * 2, false);
        deckShape.holes.push(featureHole);
      }
    });
    
    // Create extruded deck geometry with holes
    const extrudeSettings = {
      depth: deckThickness,
      bevelEnabled: false
    };
    
    const deckGeometry = new THREE.ExtrudeGeometry(deckShape, extrudeSettings);
    
    // Rotate and position deck geometry to be horizontal
    deckGeometry.rotateX(-Math.PI / 2);
    deckGeometry.translate(0, deckY, 0);
    
    return deckGeometry;
  }, [hardscapePoints, poolPoints, poolCenterX, poolCenterY, scale, features]);

  if (!deckWithHoles) return null;

  const material = texture ? (
    <meshStandardMaterial 
      map={texture}
      roughness={0.8}
      metalness={0.1}
    />
  ) : (
    <meshStandardMaterial 
      color="#D4C4B0" 
      roughness={0.8}
      metalness={0.1}
    />
  );

  return (
    <mesh geometry={deckWithHoles} receiveShadow castShadow>
      {material}
    </mesh>
  );
};

// Fence component
const FenceMesh = ({ fencePoints, poolCenterX, poolCenterY, scale }: { 
  fencePoints: FencePoint[], 
  poolCenterX: number,
  poolCenterY: number,
  scale: number 
}) => {
  const geometry = useMemo(() => {
    if (fencePoints.length < 2) return null;

    const vertices: number[] = [];
    const indices: number[] = [];
    const fenceHeight = 6; // 6 feet tall
    
    for (let i = 0; i < fencePoints.length - 1; i++) {
      const p1 = fencePoints[i];
      const p2 = fencePoints[i + 1];
      
      // Use the same pool center for all conversions
      const x1 = (p1.x - poolCenterX) / scale;
      const z1 = (p1.y - poolCenterY) / scale;
      const x2 = (p2.x - poolCenterX) / scale;
      const z2 = (p2.y - poolCenterY) / scale;
      
      const baseIdx = vertices.length / 3;
      
      // Bottom edge
      vertices.push(x1, 0, z1);
      vertices.push(x2, 0, z2);
      
      // Top edge
      vertices.push(x1, fenceHeight, z1);
      vertices.push(x2, fenceHeight, z2);
      
      // Create quad
      indices.push(
        baseIdx, baseIdx + 1, baseIdx + 3,
        baseIdx, baseIdx + 3, baseIdx + 2
      );
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return geo;
  }, [fencePoints, poolCenterX, poolCenterY, scale]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#8B6F47" 
        roughness={0.6}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Pool Features component
const PoolFeatures = ({ features, poolCenterX, poolCenterY, scale }: { 
  features: PoolFeature[], 
  poolCenterX: number,
  poolCenterY: number,
  scale: number 
}) => {
  return (
    <>
      {features.map((feature) => {
        // Use the same pool center for all conversions
        const x = (feature.x - poolCenterX) / scale;
        const z = (feature.y - poolCenterY) / scale;

        if (feature.type === 'light') {
          return (
            <mesh key={feature.id} position={[x, 0.2, z]} castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700"
                emissiveIntensity={0.8}
              />
              <pointLight color="#FFD700" intensity={2} distance={5} />
            </mesh>
          );
        }

        if (feature.type === 'jet') {
          return (
            <mesh key={feature.id} position={[x, 0.1, z]}>
              <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
              <meshStandardMaterial color="#5BA5C6" metalness={0.8} roughness={0.2} />
            </mesh>
          );
        }

        if (feature.type === 'fountain') {
          return (
            <group key={feature.id} position={[x, 0, z]}>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.5, 0.7, 1, 16]} />
                <meshStandardMaterial color="#A8D8EA" />
              </mesh>
              <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial 
                  color="#4DD0E1" 
                  transparent 
                  opacity={0.6}
                />
              </mesh>
            </group>
          );
        }

        if (feature.type === 'tree') {
          return (
            <group key={feature.id} position={[x, 0, z]}>
              {/* Trunk */}
              <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              {/* Foliage */}
              <mesh position={[0, 5, 0]}>
                <sphereGeometry args={[1.5, 8, 8]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            </group>
          );
        }

        if (feature.type === 'shrub') {
          return (
            <mesh key={feature.id} position={[x, 0.5, z]}>
              <sphereGeometry args={[0.8, 8, 8]} />
              <meshStandardMaterial color="#2E8B57" />
            </mesh>
          );
        }

        if (feature.type === 'grass') {
          const width = (feature.width || 60) / scale;
          const height = (feature.height || 60) / scale;
          
          return (
            <mesh key={feature.id} position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[width, height]} />
              <meshStandardMaterial color="#7CB342" roughness={1} />
            </mesh>
          );
        }

        if (feature.type === 'home' && feature.roofPoints) {
          const houseWidth = (feature.width || 80) / scale;
          const houseDepth = (feature.height || 80) / scale;
          const houseHeight = 8;
          
          return (
            <group key={feature.id} position={[x, 0, z]}>
              {/* House walls */}
              <mesh position={[0, houseHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[houseWidth, houseHeight, houseDepth]} />
                <meshStandardMaterial color="#E8D5C4" />
              </mesh>
              {/* Roof */}
              <mesh position={[0, houseHeight + 1, 0]} castShadow>
                <coneGeometry args={[houseWidth * 0.7, 3, 4]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            </group>
          );
        }

        if (feature.type === 'umbrella') {
          return (
            <group key={feature.id} position={[x, 0, z]}>
              {/* Pole */}
              <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
                <meshStandardMaterial color="#654321" />
              </mesh>
              {/* Umbrella top */}
              <mesh position={[0, 7.5, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[2, 1.5, 8, 1, true]} />
                <meshStandardMaterial color="#FF6B6B" side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        }

        return null;
      })}
    </>
  );
};

const Scene = ({ 
  points, 
  depthPoints, 
  scale, 
  poolShape, 
  hardscapePoints = [], 
  fencePoints = [], 
  features = [],
  paverTextureUrl,
  linerTextureUrl,
  copingTextureUrl
}: Pool3DViewerProps) => {
  // Calculate pool center once for all objects to use
  const poolCenter = useMemo(() => {
    if (points.length === 0) return { x: 0, y: 0 };
    
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    };
  }, [points]);

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
        linerTextureUrl={linerTextureUrl}
      />

      {/* Deck with auto-cut holes */}
      {hardscapePoints.length > 0 && (
        <DeckMesh 
          hardscapePoints={hardscapePoints}
          poolPoints={points}
          poolCenterX={poolCenter.x}
          poolCenterY={poolCenter.y}
          scale={scale}
          paverTextureUrl={paverTextureUrl}
          features={features}
        />
      )}

      {/* Fence */}
      {fencePoints.length > 0 && (
        <FenceMesh 
          fencePoints={fencePoints} 
          poolCenterX={poolCenter.x}
          poolCenterY={poolCenter.y}
          scale={scale} 
        />
      )}

      {/* Pool Features */}
      {features.length > 0 && (
        <PoolFeatures 
          features={features} 
          poolCenterX={poolCenter.x}
          poolCenterY={poolCenter.y}
          scale={scale} 
        />
      )}

      {/* Axes helper */}
      <axesHelper args={[5]} />
    </>
  );
};

export const Pool3DViewer = ({ 
  points, 
  depthPoints, 
  scale, 
  poolShape, 
  hardscapePoints = [], 
  fencePoints = [], 
  features = [],
  paverTextureUrl,
  linerTextureUrl,
  copingTextureUrl
}: Pool3DViewerProps) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-100 to-background rounded-lg overflow-hidden">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <Scene
          points={points}
          depthPoints={depthPoints}
          scale={scale}
          poolShape={poolShape}
          hardscapePoints={hardscapePoints}
          fencePoints={fencePoints}
          features={features}
          paverTextureUrl={paverTextureUrl}
          linerTextureUrl={linerTextureUrl}
          copingTextureUrl={copingTextureUrl}
        />
      </Canvas>
    </div>
  );
};
