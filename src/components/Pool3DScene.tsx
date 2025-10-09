import { useState, useMemo, useEffect } from 'react';
import { PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';
import { WaterlineMesh } from './WaterlineMesh';
import earcut from 'earcut';

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

export interface Pool3DSceneProps {
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
  waterlineTextureUrl?: string;
  fenceTextureUrl?: string;
  poolDimensions?: { length: number; width: number; depth: number };
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  fenceHeight?: number;
}

const PoolMesh: React.FC<{
  points: Point[];
  depthPoints: DepthPoint[];
  linerTextureUrl?: string;
  poolDimensions?: { length: number; width: number; depth: number };
  selectedCategory?: string | null;
}> = ({ points, depthPoints, linerTextureUrl, poolDimensions: providedDimensions, selectedCategory }) => {
  const [linerTexture, setLinerTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const poolDimensions = useMemo(() => {
    if (providedDimensions) return providedDimensions;
    
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);
    
    // Use maximum depth from depth points
    const maxDepth = depthPoints.length > 0 
      ? Math.max(...depthPoints.map(d => d.depth))
      : 5;
    return { width, length, depth: maxDepth };
  }, [points, depthPoints, providedDimensions]);

  useEffect(() => {
    if (linerTextureUrl) {
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

  // Pulsing red effect when selected (8 second cycle)
  useEffect(() => {
    if (selectedCategory !== 'pool') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => {
        if (prev >= 1) return 0;
        return prev + 0.0125; // 8 second cycle (1/8000ms * 50ms = 0.0125)
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

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

    const poolShape = new THREE.Shape();
    normalizedPoints.forEach((p, i) => {
      if (i === 0) poolShape.moveTo(p.x, p.z);
      else poolShape.lineTo(p.x, p.z);
    });
    poolShape.closePath();

    // Create floor with variable depth profile (sloped bottom)
    const floorVertices: number[] = [];
    const floorIndices: number[] = [];
    const floorUVs: number[] = [];
    
    // Triangulate the pool shape for floor
    const flatCoords = normalizedPoints.flatMap(p => [p.x, p.z]);
    const triangles = earcut(flatCoords);
    
    // Create floor vertices at y=0 (will be positioned by mesh)
    for (let i = 0; i < normalizedPoints.length; i++) {
      const point = normalizedPoints[i];
      
      // Floor vertices at y=0
      floorVertices.push(point.x, 0, point.z);
      
      // UV mapping for texture tiling
      const u = (point.x - minX) / (maxX - minX) * 3;
      const v = (point.z - minY) / (maxY - minY) * 3;
      floorUVs.push(u, v);
    }
    
    // Floor indices from triangulation
    for (let i = 0; i < triangles.length; i++) {
      floorIndices.push(triangles[i]);
    }
    
    const floorGeometry = new THREE.BufferGeometry();
    floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(floorVertices, 3));
    floorGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(floorUVs, 2));
    floorGeometry.setIndex(floorIndices);
    floorGeometry.computeVertexNormals();

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
      
      // Wall indices - normals facing inward toward pool interior
      wallIndices.push(
        baseIdx, baseIdx + 3, baseIdx + 1,
        baseIdx, baseIdx + 2, baseIdx + 3
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

  // Calculate max depth for positioning floor at deepest point
  const maxDepth = depthPoints.length > 0
    ? Math.max(...depthPoints.map(d => d.depth))
    : poolDimensions.depth;

  const isSelected = selectedCategory === 'pool';

  return (
    <>
      <mesh geometry={geometry} position={[0, -maxDepth, 0]}>
        <meshPhongMaterial
          color={linerTexture ? "#ffffff" : "#4DD0E1"}
          map={linerTexture}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          shininess={100}
          specular="#ffffff"
          emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
          emissiveIntensity={pulseIntensity * 0.3}
        />
      </mesh>

      <mesh geometry={wallsGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={linerTexture ? "#ffffff" : "#2196F3"}
          map={linerTexture}
          roughness={0.7}
          metalness={0.1}
          side={THREE.DoubleSide}
          emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
          emissiveIntensity={pulseIntensity * 0.5}
        />
      </mesh>
    </>
  );
};

const CopingMesh: React.FC<{
  poolPoints: Point[];
  copingTextureUrl?: string;
  selectedCategory?: string | null;
}> = ({ poolPoints, copingTextureUrl, selectedCategory }) => {
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
      // Coping texture: 1 sq ft tiles around perimeter
      const repeatX = Math.max(1, Math.ceil(poolPerimeter / 1));
      const repeatY = 1;
      
      textureCache.loadTexture(copingTextureUrl, { x: repeatX, y: repeatY })
        .then(setCopingTexture)
        .catch(err => {
          console.error('Failed to load coping texture');
          setCopingTexture(null);
        });
    }

    return () => {
      if (copingTexture) {
        disposeTexture(copingTexture);
      }
    };
  }, [copingTextureUrl, poolPerimeter]);

  // Pulsing red effect when selected (8 second cycle)
  useEffect(() => {
    if (selectedCategory !== 'coping') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => {
        if (prev >= 1) return 0;
        return prev + 0.0125; // 8 second cycle
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const copingGeometry = useMemo(() => {
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
    
    // Coping: 1 sq ft tiles (1ft wide x 1ft along perimeter)
    const copingWidth = 1.0; // Exactly 1 foot wide extending from pool edge
    const copingHeight = 0.15; // Exactly 0.15 feet raised above deck
    
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
      );
      
      // Calculate outward normal (pointing away from pool)
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const nx = -dz / segmentLength;
      const nz = dx / segmentLength;
      
      const baseIdx = vertices.length / 3;
      
      // Inner edge (at pool edge, top of coping)
      vertices.push(p1.x, copingHeight, p1.z);
      vertices.push(p2.x, copingHeight, p2.z);
      
      // Outer edge (1ft away from pool, top of coping)
      vertices.push(
        p1.x + nx * copingWidth,
        copingHeight,
        p1.z + nz * copingWidth
      );
      vertices.push(
        p2.x + nx * copingWidth,
        copingHeight,
        p2.z + nz * copingWidth
      );
      
      // UV mapping: 1 sq ft tiles along perimeter
      const numTiles = Math.ceil(segmentLength / copingWidth);
      uvs.push(
        0, 0,
        numTiles, 0,
        0, 1,
        numTiles, 1
      );
      
      // Top face indices (visible from above)
      indices.push(
        baseIdx, baseIdx + 2, baseIdx + 3,
        baseIdx, baseIdx + 3, baseIdx + 1
      );
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, [poolPoints]);

  if (!copingGeometry) return null;

  const isSelected = selectedCategory === 'coping';

  return (
    <mesh geometry={copingGeometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        map={copingTexture}
        color="#ffffff"
        roughness={0.7}
        metalness={0.1}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};

const DeckMesh: React.FC<{
  hardscapePoints: HardscapePoint[];
  poolPoints: Point[];
  features: PoolFeature[];
  paverTextureUrl?: string;
  selectedCategory?: string | null;
}> = ({ hardscapePoints, poolPoints, features, paverTextureUrl, selectedCategory }) => {
  const [paverTexture, setPaverTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const deckDimensions = useMemo(() => {
    const xs = hardscapePoints.map(p => p.x);
    const ys = hardscapePoints.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);
    return { width, length };
  }, [hardscapePoints]);

  useEffect(() => {
    if (paverTextureUrl) {
      // Deck texture: 1 sqft tiles (1 foot = 1 tile)
      const repeatX = Math.ceil(deckDimensions.width); // Each tile is 1ft wide
      const repeatY = Math.ceil(deckDimensions.length); // Each tile is 1ft long
      
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

  // Pulsing red effect when selected (8 second cycle)
  useEffect(() => {
    if (selectedCategory !== 'deck') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => {
        if (prev >= 1) return 0;
        return prev + 0.0125; // 8 second cycle
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

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

    // Create hole that includes coping (1 foot larger than pool)
    const copingHole = new THREE.Path();
    poolPoints.forEach((p, i) => {
      const x = p.x - centerX;
      const z = p.y - centerY;
      const angle = Math.atan2(z, x);
      const offsetX = x + Math.cos(angle) * 1; // 1 foot offset for coping
      const offsetZ = z + Math.sin(angle) * 1;
      if (i === 0) copingHole.moveTo(offsetX, offsetZ);
      else copingHole.lineTo(offsetX, offsetZ);
    });
    copingHole.closePath();
    deckShape.holes.push(copingHole);

    const deckGeom = new THREE.ExtrudeGeometry(deckShape, {
      depth: 0.5,
      bevelEnabled: false
    });
    deckGeom.rotateX(-Math.PI / 2);

    return deckGeom;
  }, [hardscapePoints, poolPoints]);

  if (!deckGeometry) return null;

  const isSelected = selectedCategory === 'deck';
  const redTint = isSelected ? Math.sin(pulseIntensity * Math.PI) : 0;

  return (
    <mesh geometry={deckGeometry} receiveShadow castShadow>
      <meshStandardMaterial
        map={paverTexture}
        color={isSelected ? `rgb(${255}, ${Math.floor(255 * (1 - redTint * 0.7))}, ${Math.floor(255 * (1 - redTint * 0.7))})` : (paverTexture ? "#ffffff" : "#D4C4B0")}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

const FenceMesh: React.FC<{
  fencePoints: FencePoint[];
  fenceTextureUrl?: string;
  fenceHeight?: number;
}> = ({ fencePoints, fenceTextureUrl, fenceHeight = 6 }) => {
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
      // Fence texture should fit sections of 6ft tall x 12ft long
      const repeatX = Math.max(1, Math.ceil(fenceLength / 12));
      const repeatY = 1;
      
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
    
    for (let i = 0; i < fencePoints.length - 1; i++) {
      const p1 = fencePoints[i];
      const p2 = fencePoints[i + 1];
      
      const baseIdx = vertices.length / 3;
      
      vertices.push(p1.x, 0, p1.y, p2.x, 0, p2.y, p1.x, fenceHeight, p1.y, p2.x, fenceHeight, p2.y);
      
      const segmentLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      // UV mapping for fence sections (12ft wide, height is dynamic)
      uvs.push(0, 0, segmentLength / 12, 0, 0, fenceHeight / 6, segmentLength / 12, fenceHeight / 6);
      
      indices.push(baseIdx, baseIdx + 1, baseIdx + 3, baseIdx, baseIdx + 3, baseIdx + 2);
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return geo;
  }, [fencePoints, fenceHeight]);

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

const PoolFeatures: React.FC<{ features: PoolFeature[] }> = ({ features }) => {
  return (
    <>
      {features.map((feature) => {
        if (feature.type === 'stairs') {
          const steps = feature.steps || 3;
          const width = feature.width || 4;
          const stepHeight = 0.67;
          const stepDepth = 0.92;
          
          return (
            <group key={feature.id} position={[feature.x, 0, feature.y]} rotation={[0, feature.angle || 0, 0]}>
              {Array.from({ length: steps }).map((_, i) => (
                <mesh key={i} position={[0, -i * stepHeight, i * stepDepth]}>
                  <boxGeometry args={[width, stepHeight, stepDepth]} />
                  <meshStandardMaterial color="#D4C4B0" roughness={0.8} />
                </mesh>
              ))}
            </group>
          );
        }

        if (feature.type === 'light') {
          return (
            <mesh key={feature.id} position={[feature.x, -0.3, feature.y]} castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.2} />
              <pointLight color="#FFD700" intensity={3} distance={8} />
            </mesh>
          );
        }

        if (feature.type === 'jet') {
          return (
            <mesh key={feature.id} position={[feature.x, -0.2, feature.y]}>
              <cylinderGeometry args={[0.167, 0.167, 0.33, 16]} />
              <meshStandardMaterial color="#B8C9D9" metalness={0.9} roughness={0.1} />
            </mesh>
          );
        }

        if (feature.type === 'fountain') {
          return (
            <group key={feature.id} position={[feature.x, 0, feature.y]}>
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.83, 1, 0.5, 16]} />
                <meshStandardMaterial color="#8B7355" roughness={0.6} />
              </mesh>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.33, 0.33, 2.5, 12]} />
                <meshStandardMaterial color="#A8D8EA" roughness={0.4} />
              </mesh>
              <mesh position={[0, 2.83, 0]}>
                <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#A8D8EA" roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        }

        if (feature.type === 'tree') {
          const treeType = feature.treeType || 'palm';
          
          if (treeType === 'palm') {
            return (
              <group key={feature.id} position={[feature.x, 0, feature.y]}>
                <mesh position={[0, 6, 0]}>
                  <cylinderGeometry args={[0.5, 0.67, 12, 8]} />
                  <meshStandardMaterial color="#8B7355" roughness={0.9} />
                </mesh>
                {Array.from({ length: 8 }).map((_, i) => (
                  <mesh
                    key={i}
                    position={[
                      Math.cos((i / 8) * Math.PI * 2) * 0.5,
                      12,
                      Math.sin((i / 8) * Math.PI * 2) * 0.5
                    ]}
                    rotation={[Math.PI / 4, (i / 8) * Math.PI * 2, 0]}
                  >
                    <boxGeometry args={[0.3, 0.2, 4]} />
                    <meshStandardMaterial color="#228B22" roughness={0.8} />
                  </mesh>
                ))}
              </group>
            );
          }
          
          return (
            <group key={feature.id} position={[feature.x, 0, feature.y]}>
              <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.5, 0.67, 8, 8]} />
                <meshStandardMaterial color="#654321" roughness={0.9} />
              </mesh>
              <mesh position={[0, 9, 0]}>
                <sphereGeometry args={[3, 12, 12]} />
                <meshStandardMaterial color="#228B22" roughness={0.8} />
              </mesh>
            </group>
          );
        }

        if (feature.type === 'shrub') {
          const shrubType = feature.shrubType || 'round';
          const size = shrubType === 'hedge' ? 1.5 : 1;
          const height = shrubType === 'hedge' ? 3 : 2;
          
          return (
            <mesh key={feature.id} position={[feature.x, height / 2, feature.y]}>
              <sphereGeometry args={[size, 12, 12]} />
              <meshStandardMaterial 
                color={shrubType === 'flowering' ? "#90EE90" : "#2E8B57"} 
                roughness={0.9}
              />
            </mesh>
          );
        }

        if (feature.type === 'umbrella') {
          return (
            <group key={feature.id} position={[feature.x, 0, feature.y]}>
              <mesh position={[0, 4.5, 0]}>
                <cylinderGeometry args={[0.083, 0.083, 9, 8]} />
                <meshStandardMaterial color="#8B7355" metalness={0.3} roughness={0.6} />
              </mesh>
              <mesh position={[0, 9, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[3, 2, 8]} />
                <meshStandardMaterial color="#DC143C" roughness={0.7} />
              </mesh>
            </group>
          );
        }

        return null;
      })}
    </>
  );
};

export const Pool3DScene: React.FC<Pool3DSceneProps> = ({
  points,
  depthPoints,
  hardscapePoints,
  linerTextureUrl,
  paverTextureUrl,
  copingTextureUrl,
  waterlineTextureUrl,
  fenceTextureUrl,
  features,
  fencePoints,
  scale = 1,
  poolShape = 'rectangle',
  poolDimensions,
  selectedCategory,
  onSelectCategory,
  fenceHeight = 6
}) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[30, 25, 30]} fov={50} />

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

      <group onClick={() => onSelectCategory?.('pool')}>
        <PoolMesh
          key={linerTextureUrl}
          points={points}
          depthPoints={depthPoints}
          linerTextureUrl={linerTextureUrl}
          poolDimensions={poolDimensions}
          selectedCategory={selectedCategory}
        />
      </group>

      {hardscapePoints && hardscapePoints.length > 0 && (
        <group onClick={() => onSelectCategory?.('deck')}>
          <DeckMesh
            key={paverTextureUrl}
            hardscapePoints={hardscapePoints}
            poolPoints={points}
            features={features || []}
            paverTextureUrl={paverTextureUrl}
            selectedCategory={selectedCategory}
          />
        </group>
      )}

      <group onClick={() => onSelectCategory?.('coping')}>
        <CopingMesh
          key={copingTextureUrl}
          poolPoints={points}
          copingTextureUrl={copingTextureUrl}
          selectedCategory={selectedCategory}
        />
      </group>

      <group onClick={() => onSelectCategory?.('waterline')}>
        <WaterlineMesh
          key={waterlineTextureUrl}
          poolPoints={points}
          waterlineTextureUrl={waterlineTextureUrl}
          selectedCategory={selectedCategory}
        />
      </group>

      {fencePoints && fencePoints.length > 0 && (
        <FenceMesh
          fencePoints={fencePoints}
          fenceTextureUrl={fenceTextureUrl}
          fenceHeight={fenceHeight}
        />
      )}

      {features && features.length > 0 && (
        <PoolFeatures features={features} />
      )}

      <axesHelper args={[5]} />
    </>
  );
};
