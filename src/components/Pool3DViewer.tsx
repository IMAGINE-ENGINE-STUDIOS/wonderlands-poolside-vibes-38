import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';

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
  fenceTextureUrl?: string;
}

const PoolMesh: React.FC<{
  points: Point[];
  depthPoints: DepthPoint[];
  linerTextureUrl?: string;
}> = ({ points, depthPoints, linerTextureUrl }) => {
  const [linerTexture, setLinerTexture] = useState<THREE.Texture | null>(null);

  // Calculate pool dimensions for dynamic texture repeats
  const poolDimensions = useMemo(() => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);
    return { width, length };
  }, [points]);

  useEffect(() => {
    if (linerTextureUrl) {
      // Dynamic repeat based on pool size (roughly 1 texture per 3 feet)
      const repeatX = Math.ceil(poolDimensions.width / 3);
      const repeatY = Math.ceil(poolDimensions.length / 3);
      
      textureCache.loadTexture(linerTextureUrl, { x: repeatX, y: repeatY })
        .then(setLinerTexture)
        .catch(err => {
          console.error('Failed to load liner texture, using default');
          setLinerTexture(null);
        });
    }

    return () => {
      if (linerTexture) {
        disposeTexture(linerTexture);
      }
    };
  }, [linerTextureUrl, poolDimensions]);

  // Create accurate pool geometry from points and depth
  const { geometry, wallsGeometry } = useMemo(() => {
    if (points.length < 3) {
      return {
        geometry: new THREE.BoxGeometry(1, 1, 1),
        wallsGeometry: new THREE.BoxGeometry(1, 1, 1)
      };
    }

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

    // Create floor geometry
    const poolShape = new THREE.Shape();
    normalizedPoints.forEach((p, i) => {
      if (i === 0) poolShape.moveTo(p.x, p.z);
      else poolShape.lineTo(p.x, p.z);
    });
    poolShape.closePath();

    const avgDepth = sortedDepths.reduce((sum, d) => sum + d.depth, 0) / sortedDepths.length;
    const floorGeometry = new THREE.ExtrudeGeometry(poolShape, {
      depth: 0.1,
      bevelEnabled: false
    });
    floorGeometry.rotateX(-Math.PI / 2);
    floorGeometry.translate(0, -avgDepth, 0);

    // Create wall geometry
    const wallVertices: number[] = [];
    const wallIndices: number[] = [];
    const wallUVs: number[] = [];
    
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      const depth = getDepthAtPosition(i / normalizedPoints.length);
      const wallLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
      
      const baseIdx = wallVertices.length / 3;
      
      wallVertices.push(p1.x, 0, p1.z);
      wallVertices.push(p2.x, 0, p2.z);
      wallVertices.push(p1.x, -depth, p1.z);
      wallVertices.push(p2.x, -depth, p2.z);
      
      wallUVs.push(0, 0, wallLength / 3, 0, 0, depth / 3, wallLength / 3, depth / 3);
      
      wallIndices.push(
        baseIdx, baseIdx + 1, baseIdx + 3,
        baseIdx, baseIdx + 3, baseIdx + 2
      );
    }
    
    const poolWallsGeometry = new THREE.BufferGeometry();
    poolWallsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wallVertices, 3));
    poolWallsGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(wallUVs, 2));
    poolWallsGeometry.setIndex(wallIndices);
    poolWallsGeometry.computeVertexNormals();

    return {
      geometry: floorGeometry,
      wallsGeometry: poolWallsGeometry
    };
  }, [points, depthPoints]);

  const waterLevel = -0.5;

  return (
    <>
      {/* Pool floor */}
      <mesh geometry={geometry} position={[0, waterLevel, 0]}>
        <meshPhongMaterial
          color={linerTexture ? "#ffffff" : "#4DD0E1"}
          map={linerTexture}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          shininess={100}
          specular="#ffffff"
        />
      </mesh>

      {/* Pool walls with better texture visibility */}
      <mesh geometry={wallsGeometry} position={[0, waterLevel, 0]}>
        <meshStandardMaterial
          color={linerTexture ? "#e8f4f8" : "#2196F3"}
          map={linerTexture}
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

// Deck component
const DeckMesh: React.FC<{
  hardscapePoints: HardscapePoint[];
  poolPoints: Point[];
  features: PoolFeature[];
  paverTextureUrl?: string;
}> = ({ hardscapePoints, poolPoints, features, paverTextureUrl }) => {
  const [paverTexture, setPaverTexture] = useState<THREE.Texture | null>(null);

  // Calculate deck dimensions for dynamic texture repeats
  const deckDimensions = useMemo(() => {
    const xs = hardscapePoints.map(p => p.x);
    const ys = hardscapePoints.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);
    return { width, length };
  }, [hardscapePoints]);

  useEffect(() => {
    if (paverTextureUrl) {
      // Dynamic repeat based on deck size (roughly 1 texture per 2 feet for pavers)
      const repeatX = Math.ceil(deckDimensions.width / 2);
      const repeatY = Math.ceil(deckDimensions.length / 2);
      
      textureCache.loadTexture(paverTextureUrl, { x: repeatX, y: repeatY })
        .then(setPaverTexture)
        .catch(err => {
          console.error('Failed to load paver texture, using default');
          setPaverTexture(null);
        });
    }

    return () => {
      if (paverTexture) {
        disposeTexture(paverTexture);
      }
    };
  }, [paverTextureUrl, deckDimensions]);

  const deckGeometry = useMemo(() => {
    if (hardscapePoints.length < 3 || poolPoints.length < 3) return null;

    const minX = Math.min(...poolPoints.map(p => p.x));
    const maxX = Math.max(...poolPoints.map(p => p.x));
    const minY = Math.min(...poolPoints.map(p => p.y));
    const maxY = Math.max(...poolPoints.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const deckShape = new THREE.Shape();
    hardscapePoints.forEach((p, i) => {
      const x = p.x - centerX;
      const z = p.y - centerY;
      if (i === 0) deckShape.moveTo(x, z);
      else deckShape.lineTo(x, z);
    });
    deckShape.closePath();

    const poolHole = new THREE.Path();
    poolPoints.forEach((p, i) => {
      const x = p.x - centerX;
      const z = p.y - centerY;
      if (i === 0) poolHole.moveTo(x, z);
      else poolHole.lineTo(x, z);
    });
    poolHole.closePath();
    deckShape.holes.push(poolHole);

    const deckGeom = new THREE.ExtrudeGeometry(deckShape, {
      depth: 0.5,
      bevelEnabled: false
    });
    deckGeom.rotateX(-Math.PI / 2);

    return deckGeom;
  }, [hardscapePoints, poolPoints]);

  if (!deckGeometry) return null;

  return (
    <mesh geometry={deckGeometry} receiveShadow castShadow>
      <meshStandardMaterial
        map={paverTexture}
        color={paverTexture ? "#ffffff" : "#D4C4B0"}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

// Coping Mesh - raised edge around pool
const CopingMesh: React.FC<{
  poolPoints: Point[];
  copingTextureUrl?: string;
}> = ({ poolPoints, copingTextureUrl }) => {
  const [copingTexture, setCopingTexture] = useState<THREE.Texture | null>(null);

  // Calculate pool perimeter for dynamic texture repeats
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
      // Dynamic repeat based on perimeter (roughly 1 texture per 4 feet)
      const repeatX = Math.ceil(poolPerimeter / 4);
      const repeatY = 1;
      
      textureCache.loadTexture(copingTextureUrl, { x: repeatX, y: repeatY })
        .then(setCopingTexture)
        .catch(err => {
          console.error('Failed to load coping texture, using default');
          setCopingTexture(null);
        });
    }

    return () => {
      if (copingTexture) {
        disposeTexture(copingTexture);
      }
    };
  }, [copingTextureUrl, poolPerimeter]);

  const copingGeometry = useMemo(() => {
    if (poolPoints.length < 3) return null;

    const minX = Math.min(...poolPoints.map(p => p.x));
    const maxX = Math.max(...poolPoints.map(p => p.x));
    const minY = Math.min(...poolPoints.map(p => p.y));
    const maxY = Math.max(...poolPoints.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const copingWidth = 1; // 12 inches
    const copingHeight = 0.167; // 2 inches raised
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    let uvDistance = 0;

    for (let i = 0; i < poolPoints.length; i++) {
      const p1 = poolPoints[i];
      const p2 = poolPoints[(i + 1) % poolPoints.length];
      
      const x1 = p1.x - centerX;
      const z1 = p1.y - centerY;
      const x2 = p2.x - centerX;
      const z2 = p2.y - centerY;
      
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.sqrt(dx * dx + dz * dz);
      const nx = -dz / length;
      const nz = dx / length;
      
      const outerX1 = x1 + nx * copingWidth;
      const outerZ1 = z1 + nz * copingWidth;
      const outerX2 = x2 + nx * copingWidth;
      const outerZ2 = z2 + nz * copingWidth;
      
      const baseIndex = i * 8;
      
      // Top surface
      vertices.push(x1, copingHeight, z1, outerX1, copingHeight, outerZ1, x2, copingHeight, z2, outerX2, copingHeight, outerZ2);
      // Bottom surface
      vertices.push(x1, 0, z1, outerX1, 0, outerZ1, x2, 0, z2, outerX2, 0, outerZ2);
      
      const uvStart = uvDistance / poolPerimeter;
      uvDistance += length;
      const uvEnd = uvDistance / poolPerimeter;
      
      uvs.push(0, uvStart, 1, uvStart, 0, uvEnd, 1, uvEnd);
      uvs.push(0, uvStart, 1, uvStart, 0, uvEnd, 1, uvEnd);
      
      // Top face
      indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
      indices.push(baseIndex + 1, baseIndex + 2, baseIndex + 3);
      
      // Outer face
      indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 5);
      indices.push(baseIndex + 5, baseIndex + 3, baseIndex + 7);
      
      // Inner face
      indices.push(baseIndex, baseIndex + 4, baseIndex + 2);
      indices.push(baseIndex + 2, baseIndex + 4, baseIndex + 6);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [poolPoints, poolPerimeter]);

  if (!copingGeometry) return null;

  return (
    <mesh geometry={copingGeometry}>
      <meshStandardMaterial
        map={copingTexture}
        color={copingTexture ? "#ffffff" : "#b8a088"}
        roughness={0.7}
        metalness={0.2}
      />
    </mesh>
  );
};

// Fence component
const FenceMesh: React.FC<{
  fencePoints: FencePoint[];
  fenceTextureUrl?: string;
}> = ({ fencePoints, fenceTextureUrl }) => {
  const [fenceTexture, setFenceTexture] = useState<THREE.Texture | null>(null);

  const fenceLength = useMemo(() => {
    if (fencePoints.length < 2) return 0;
    let length = 0;
    for (let i = 0; i < fencePoints.length; i++) {
      const p1 = fencePoints[i];
      const p2 = fencePoints[(i + 1) % fencePoints.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }, [fencePoints]);

  useEffect(() => {
    if (fenceTextureUrl) {
      // Dynamic repeat based on fence length
      const repeatX = Math.max(1, Math.ceil(fenceLength / 6));
      const repeatY = 2;
      
      textureCache.loadTexture(fenceTextureUrl, { x: repeatX, y: repeatY })
        .then(setFenceTexture)
        .catch(err => {
          console.error('Failed to load fence texture, using default');
          setFenceTexture(null);
        });
    }

    return () => {
      if (fenceTexture) {
        disposeTexture(fenceTexture);
      }
    };
  }, [fenceTextureUrl, fenceLength]);

  const geometry = useMemo(() => {
    if (fencePoints.length < 2) return null;

    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const fenceHeight = 6;
    
    for (let i = 0; i < fencePoints.length - 1; i++) {
      const p1 = fencePoints[i];
      const p2 = fencePoints[i + 1];
      
      const baseIdx = vertices.length / 3;
      
      vertices.push(p1.x, 0, p1.y, p2.x, 0, p2.y, p1.x, fenceHeight, p1.y, p2.x, fenceHeight, p2.y);
      
      const segmentLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      uvs.push(0, 0, segmentLength / 6, 0, 0, 1, segmentLength / 6, 1);
      
      indices.push(baseIdx, baseIdx + 1, baseIdx + 3, baseIdx, baseIdx + 3, baseIdx + 2);
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return geo;
  }, [fencePoints]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={fenceTexture}
        color={fenceTexture ? "#ffffff" : "#8B7355"}
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Pool Features
const PoolFeatures: React.FC<{ features: PoolFeature[] }> = ({ features }) => {
  return (
    <>
      {features.map((feature) => {
        if (feature.type === 'light') {
          return (
            <mesh key={feature.id} position={[feature.x, 0.2, feature.y]} castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
              <pointLight color="#FFD700" intensity={2} distance={5} />
            </mesh>
          );
        }

        if (feature.type === 'jet') {
          return (
            <mesh key={feature.id} position={[feature.x, 0.1, feature.y]}>
              <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
              <meshStandardMaterial color="#5BA5C6" metalness={0.8} roughness={0.2} />
            </mesh>
          );
        }

        if (feature.type === 'fountain') {
          return (
            <group key={feature.id} position={[feature.x, 0, feature.y]}>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.5, 0.7, 1, 16]} />
                <meshStandardMaterial color="#A8D8EA" />
              </mesh>
            </group>
          );
        }

        if (feature.type === 'tree') {
          return (
            <group key={feature.id} position={[feature.x, 0, feature.y]}>
              <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 5, 0]}>
                <sphereGeometry args={[1.5, 8, 8]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            </group>
          );
        }

        if (feature.type === 'shrub') {
          return (
            <mesh key={feature.id} position={[feature.x, 0.5, feature.y]}>
              <sphereGeometry args={[0.8, 8, 8]} />
              <meshStandardMaterial color="#2E8B57" />
            </mesh>
          );
        }

        return null;
      })}
    </>
  );
};

const Scene: React.FC<Pool3DViewerProps> = ({
  points,
  depthPoints,
  hardscapePoints,
  linerTextureUrl,
  paverTextureUrl,
  copingTextureUrl,
  fenceTextureUrl,
  features,
  fencePoints,
  scale = 1,
  poolShape = 'rectangle',
}) => {
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

      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-20, 20, -10]} intensity={0.6} />
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffffff" />
      <hemisphereLight intensity={0.5} color="#87CEEB" groundColor="#8B7355" />

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

      <PoolMesh
        points={points}
        depthPoints={depthPoints}
        linerTextureUrl={linerTextureUrl}
      />

      {hardscapePoints && hardscapePoints.length > 0 && (
        <DeckMesh
          hardscapePoints={hardscapePoints}
          poolPoints={points}
          features={features || []}
          paverTextureUrl={paverTextureUrl}
        />
      )}

      {copingTextureUrl && (
        <CopingMesh
          poolPoints={points}
          copingTextureUrl={copingTextureUrl}
        />
      )}

      {fencePoints && fencePoints.length > 0 && (
        <FenceMesh
          fencePoints={fencePoints}
          fenceTextureUrl={fenceTextureUrl}
        />
      )}

      {features && features.length > 0 && (
        <PoolFeatures features={features} />
      )}

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
  copingTextureUrl,
  fenceTextureUrl
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
          fenceTextureUrl={fenceTextureUrl}
        />
      </Canvas>
    </div>
  );
};
