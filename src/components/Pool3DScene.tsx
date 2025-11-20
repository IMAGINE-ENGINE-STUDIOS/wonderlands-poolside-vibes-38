import { useState, useMemo, useEffect } from 'react';
import { PerspectiveCamera, Grid, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';
import { WaterlineMesh } from './WaterlineMesh';
import WaterSurface from './WaterSurface';
import { PoolStairs } from './PoolStairs';
import { StairsPlacementMode } from './StairsPlacementMode';
import { SplineEditor, SplinePoint } from './scene3d/SplineEditor';
import earcut from 'earcut';
import grassTexture from '@/assets/grass-texture.avif';

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
  paverTextureScale?: number;
  copingTextureScale?: number;
  waterlineTextureScale?: number;
  linerTextureScale?: number;
  paverTextureOffset?: [number, number];
  copingTextureOffset?: [number, number];
  waterlineTextureOffset?: [number, number];
  linerTextureOffset?: [number, number];
  poolPosition?: [number, number, number];
  copingHeight?: number;
  deckHeight?: number;
  copingWidth?: number;
  stairs?: Array<{
    id: string;
    position: [number, number, number];
    rotation: number;
    shape: 'rectangle' | 'square' | 'rounded';
    width: number;
    numSteps: number;
    stepHeight: number;
    stepDepth: number;
  }>;
  onStairsChange?: (stairs: Array<any>) => void;
  isStairsPlacementMode?: boolean;
  onStairsPlacementComplete?: (position: [number, number, number], rotation: number) => void;
  selectedStairId?: string | null;
  onSelectStair?: (id: string | null) => void;
  enablePoolSplineEdit?: boolean;
  enableDeckSplineEdit?: boolean;
  onPoolPointsChange?: (points: Point[]) => void;
  onDeckPointsChange?: (points: HardscapePoint[]) => void;
}

const PoolMesh: React.FC<{
  points: Point[];
  depthPoints: DepthPoint[];
  linerTextureUrl?: string;
  poolDimensions?: { length: number; width: number; depth: number };
  selectedCategory?: string | null;
  linerTextureScale?: number;
  linerTextureOffset?: [number, number];
  copingHeight?: number;
}> = ({ 
  points, 
  depthPoints, 
  linerTextureUrl, 
  poolDimensions: providedDimensions, 
  selectedCategory, 
  linerTextureScale = 1.8, 
  linerTextureOffset = [0, 0],
  copingHeight = 2 / 12
}) => {
  const [linerTexture, setLinerTexture] = useState<THREE.Texture | null>(null);
  const [previousLinerTexture, setPreviousLinerTexture] = useState<THREE.Texture | null>(null);
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
      // 1ft x 1ft base scale
      const repeatX = 1.0 / linerTextureScale;
      const repeatY = 1.0 / linerTextureScale;
      
      textureCache.loadTexture(linerTextureUrl, { x: repeatX, y: repeatY })
        .then(texture => {
          texture.userData.url = linerTextureUrl;
          texture.offset.set(linerTextureOffset?.[0] || 0, linerTextureOffset?.[1] || 0);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.needsUpdate = true;
          setLinerTexture(texture);
        })
        .catch(err => {
          console.error('Failed to load liner texture');
          setLinerTexture(null);
        });
    }
  }, [linerTextureUrl, linerTextureScale, linerTextureOffset]);

  // Dispose of previous texture after new one is loaded
  useEffect(() => {
    if (previousLinerTexture) {
      disposeTexture(previousLinerTexture);
      setPreviousLinerTexture(null);
    }
  }, [previousLinerTexture]);

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
      if (sortedDepths.length === 0) return poolDimensions.depth || 5;
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

    // Pool orientation: length direction determines depth progression
    const poolWidth = maxX - minX;
    const poolLength = maxY - minY;
    const lengthDirection = poolLength > poolWidth ? 'z' : 'x';

    // === POOL FLOOR GEOMETRY ===
    // Thick floor (9 inches = 0.75 ft) with top and bottom surfaces
    const floorThickness = 0.75; // 9 inches
    const floorVertices: number[] = [];
    const floorIndices: number[] = [];
    const floorUVs: number[] = [];
    
    // Triangulate pool shape
    const flatCoords = normalizedPoints.flatMap(p => [p.x, p.z]);
    const triangles = earcut(flatCoords);
    
    // Create TOP surface floor vertices (visible inside pool)
    for (let i = 0; i < normalizedPoints.length; i++) {
      const point = normalizedPoints[i];
      
      // Calculate depth based on position along pool length
      let lengthRatio;
      if (lengthDirection === 'z') {
        lengthRatio = (point.z - (minY - centerY)) / poolLength;
      } else {
        lengthRatio = (point.x - (minX - centerX)) / poolWidth;
      }
      
      lengthRatio = Math.max(0, Math.min(1, lengthRatio));
      const depth = getDepthAtPosition(lengthRatio);
      
      // Floor at negative Y (below water surface at y=0)
      floorVertices.push(point.x, -depth, point.z);
      
      // Perfect UV mapping: world-space coordinates for 1ft x 1ft tiles
      floorUVs.push(point.x, point.z);
    }
    
    // Create BOTTOM surface floor vertices (9 inches below top)
    const bottomVertexOffset = normalizedPoints.length;
    for (let i = 0; i < normalizedPoints.length; i++) {
      const point = normalizedPoints[i];
      
      let lengthRatio;
      if (lengthDirection === 'z') {
        lengthRatio = (point.z - (minY - centerY)) / poolLength;
      } else {
        lengthRatio = (point.x - (minX - centerX)) / poolWidth;
      }
      
      lengthRatio = Math.max(0, Math.min(1, lengthRatio));
      const depth = getDepthAtPosition(lengthRatio);
      
      // Bottom surface 9 inches below top
      floorVertices.push(point.x, -depth - floorThickness, point.z);
      floorUVs.push(point.x, point.z);
    }
    
    // Top surface triangulation indices
    for (let i = 0; i < triangles.length; i++) {
      floorIndices.push(triangles[i]);
    }
    
    // Bottom surface triangulation indices (reversed winding)
    for (let i = 0; i < triangles.length; i += 3) {
      floorIndices.push(
        bottomVertexOffset + triangles[i + 2],
        bottomVertexOffset + triangles[i + 1],
        bottomVertexOffset + triangles[i]
      );
    }
    
    // Side edges connecting top and bottom surfaces
    for (let i = 0; i < normalizedPoints.length; i++) {
      const nextI = (i + 1) % normalizedPoints.length;
      
      floorIndices.push(i, nextI, bottomVertexOffset + nextI);
      floorIndices.push(i, bottomVertexOffset + nextI, bottomVertexOffset + i);
    }
    
    const floorGeometry = new THREE.BufferGeometry();
    floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(floorVertices, 3));
    floorGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(floorUVs, 2));
    floorGeometry.setIndex(floorIndices);
    floorGeometry.computeVertexNormals();

    // === POOL WALLS GEOMETRY ===
    // Thick walls (9 inches = 0.75 ft) extending OUTWARD from pool boundary into the ground
    // Inner face = pool boundary (visible with liner)
    // Outer face = pool boundary + 0.75ft outward (buried in ground)
    const wallThickness = 0.75; // 9 inches for better visibility
    const wallVertices: number[] = [];
    const wallIndices: number[] = [];
    const wallUVs: number[] = [];
    let perimeterDistance = 0;
    
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p1 = normalizedPoints[i];
      const p2 = normalizedPoints[(i + 1) % normalizedPoints.length];
      
      // Calculate depth at each wall vertex position
      const p1LengthRatio = lengthDirection === 'z' 
        ? (p1.z - (minY - centerY)) / poolLength
        : (p1.x - (minX - centerX)) / poolWidth;
      const p2LengthRatio = lengthDirection === 'z'
        ? (p2.z - (minY - centerY)) / poolLength
        : (p2.x - (minX - centerX)) / poolWidth;
        
      const depth1 = getDepthAtPosition(Math.max(0, Math.min(1, p1LengthRatio)));
      const depth2 = getDepthAtPosition(Math.max(0, Math.min(1, p2LengthRatio)));
      
      const wallLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
      
      // Calculate OUTWARD normal (pointing away from pool center into the ground)
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const outwardNx = dz / wallLength;  // Points OUTWARD (reversed from inward)
      const outwardNz = -dx / wallLength;
      
      const baseIdx = wallVertices.length / 3;
      
      // INNER surface (at pool boundary - visible with liner texture)
      const innerP1 = { x: p1.x, z: p1.z };
      const innerP2 = { x: p2.x, z: p2.z };
      
      // OUTER surface (wallThickness outward into ground - not visible)
      const outerP1 = { x: p1.x + outwardNx * wallThickness, z: p1.z + outwardNz * wallThickness };
      const outerP2 = { x: p2.x + outwardNx * wallThickness, z: p2.z + outwardNz * wallThickness };
      
      // === INNER WALL SURFACE (textured, visible from inside pool) ===
      // Position walls extending from deck level (y = 1/36) down to pool floor
      // This ensures no gap between wall top and deck/coping
      const deckLevel = 1 / 36; // 1 inch above water surface
      const wallTopY = deckLevel; // Wall top touches deck (no gap)
      wallVertices.push(innerP1.x, wallTopY, innerP1.z);
      wallVertices.push(innerP2.x, wallTopY, innerP2.z);
      wallVertices.push(innerP1.x, -depth1, innerP1.z);
      wallVertices.push(innerP2.x, -depth2, innerP2.z);
      
      // Perfect UV mapping for inner surface
      const avgDepth = (depth1 + depth2) / 2;
      wallUVs.push(
        perimeterDistance, avgDepth,
        perimeterDistance + wallLength, avgDepth,
        perimeterDistance, 0,
        perimeterDistance + wallLength, 0
      );
      
      perimeterDistance += wallLength;
      
      // Inner wall face (normals pointing INWARD so visible from inside pool)
      wallIndices.push(
        baseIdx, baseIdx + 3, baseIdx + 1,
        baseIdx, baseIdx + 2, baseIdx + 3
      );
      
      // === OUTER WALL SURFACE (concrete, not visible) ===
      const outerBaseIdx = wallVertices.length / 3;
      wallVertices.push(outerP1.x, wallTopY, outerP1.z);
      wallVertices.push(outerP2.x, wallTopY, outerP2.z);
      wallVertices.push(outerP1.x, -depth1, outerP1.z);
      wallVertices.push(outerP2.x, -depth2, outerP2.z);
      
      wallUVs.push(0, avgDepth, wallLength, avgDepth, 0, 0, wallLength, 0);
      
      // Outer wall face (reversed winding)
      wallIndices.push(
        outerBaseIdx, outerBaseIdx + 3, outerBaseIdx + 1,
        outerBaseIdx, outerBaseIdx + 2, outerBaseIdx + 3
      );
      
      // === TOP EDGE (connecting below coping) ===
      const topBaseIdx = wallVertices.length / 3;
      wallVertices.push(innerP1.x, wallTopY, innerP1.z);
      wallVertices.push(innerP2.x, wallTopY, innerP2.z);
      wallVertices.push(outerP1.x, wallTopY, outerP1.z);
      wallVertices.push(outerP2.x, wallTopY, outerP2.z);
      
      wallUVs.push(0, 0, wallLength, 0, 0, wallThickness, wallLength, wallThickness);
      
      wallIndices.push(
        topBaseIdx, topBaseIdx + 2, topBaseIdx + 3,
        topBaseIdx, topBaseIdx + 3, topBaseIdx + 1
      );
      
      // === BOTTOM EDGE (connecting at floor) ===
      const bottomBaseIdx = wallVertices.length / 3;
      wallVertices.push(innerP1.x, -depth1, innerP1.z);
      wallVertices.push(innerP2.x, -depth2, innerP2.z);
      wallVertices.push(outerP1.x, -depth1, outerP1.z);
      wallVertices.push(outerP2.x, -depth2, outerP2.z);
      
      wallUVs.push(0, 0, wallLength, 0, 0, wallThickness, wallLength, wallThickness);
      
      wallIndices.push(
        bottomBaseIdx, bottomBaseIdx + 1, bottomBaseIdx + 3,
        bottomBaseIdx, bottomBaseIdx + 3, bottomBaseIdx + 2
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
  }, [points, depthPoints, poolDimensions, copingHeight]);

  const isSelected = selectedCategory === 'pool';

  return (
    <>
      {/* Pool floor - positioned at world origin, vertices have depth baked in */}
      <mesh geometry={geometry} position={[0, 0, 0]}>
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

      {/* Pool walls - from water level (y=0) down to floor */}
      <mesh key={linerTexture?.uuid || 'no-liner-texture'} geometry={wallsGeometry} position={[0, 0, 0]}>
        <meshPhongMaterial
          map={linerTexture}
          color="#ffffff"
          shininess={30}
          side={THREE.FrontSide}
          emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
          emissiveIntensity={pulseIntensity * 0.5}
        />
      </mesh>
    </>
  );
};

// NEW COPING: Simple rectangular frame around pool, like a deck section
const CopingMesh: React.FC<{
  poolPoints: Point[];
  copingTextureUrl?: string;
  selectedCategory?: string | null;
  copingTextureScale?: number;
  copingTextureOffset?: [number, number];
  copingHeight?: number;
  copingWidth?: number;
}> = ({ 
  poolPoints, 
  copingTextureUrl, 
  selectedCategory, 
  copingTextureScale = 1.8, 
  copingTextureOffset = [0, 0], 
  copingHeight = 2 / 12,
  copingWidth = 1.0
}) => {
  const [copingTexture, setCopingTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Load texture with 1x1 ft base dimensions
  useEffect(() => {
    if (copingTextureUrl) {
      // 1ft x 1ft base scale
      const repeatX = 1.0 / copingTextureScale;
      const repeatY = 1.0 / copingTextureScale;
      
      textureCache.loadTexture(copingTextureUrl, { x: repeatX, y: repeatY })
        .then(texture => {
          texture.userData.url = copingTextureUrl;
          texture.offset.set(copingTextureOffset[0], copingTextureOffset[1]);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.needsUpdate = true;
          setCopingTexture(texture);
        })
        .catch(err => {
          console.error('Failed to load coping texture');
          setCopingTexture(null);
        });
    }
  }, [copingTextureUrl, copingTextureScale, copingTextureOffset]);

  // Pulsing effect when selected
  useEffect(() => {
    if (selectedCategory !== 'coping') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => prev >= 1 ? 0 : prev + 0.0125);
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  // Create coping as a simple horizontal rectangle frame
  const copingGeometry = useMemo(() => {
    if (poolPoints.length < 3) return new THREE.BoxGeometry(1, 0.1, 1);

    const xs = poolPoints.map(p => p.x);
    const ys = poolPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const poolWidth = maxX - minX;
    const poolLength = maxY - minY;

    // Coping frame dimensions
    const innerHalfWidth = poolWidth / 2;
    const innerHalfLength = poolLength / 2;
    const outerHalfWidth = innerHalfWidth + copingWidth;
    const outerHalfLength = innerHalfLength + copingWidth;

    // Create shape for coping (outer rectangle with inner hole)
    const copingShape = new THREE.Shape();
    
    // Outer rectangle
    copingShape.moveTo(-outerHalfWidth, -outerHalfLength);
    copingShape.lineTo(outerHalfWidth, -outerHalfLength);
    copingShape.lineTo(outerHalfWidth, outerHalfLength);
    copingShape.lineTo(-outerHalfWidth, outerHalfLength);
    copingShape.lineTo(-outerHalfWidth, -outerHalfLength);

    // Inner hole EXACTLY matches pool dimensions (no gap with pool wall)
    const hole = new THREE.Path();
    hole.moveTo(-innerHalfWidth, -innerHalfLength);
    hole.lineTo(-innerHalfWidth, innerHalfLength);
    hole.lineTo(innerHalfWidth, innerHalfLength);
    hole.lineTo(innerHalfWidth, -innerHalfLength);
    hole.lineTo(-innerHalfWidth, -innerHalfLength);
    copingShape.holes.push(hole);

    // Extrude to create 3D geometry
    const extrudeSettings = {
      depth: copingHeight,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(copingShape, extrudeSettings);
    
    // Rotate to be horizontal (XZ plane)
    geometry.rotateX(-Math.PI / 2);
    
    // Position coping: 1/3 inch (1/36 ft) above deck (y=0) to prevent overlap
    // Bottom at 1/36, top at 1/36 + copingHeight
    geometry.translate(0, 1/36, 0);

    // Apply 1x1 ft UV mapping
    const uvAttribute = geometry.getAttribute('uv');
    if (uvAttribute) {
      const positions = geometry.getAttribute('position');
      const uvs = uvAttribute.array;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        
        // Map UVs based on world position (1 ft = 1 UV unit)
        uvs[i * 2] = x;
        uvs[i * 2 + 1] = z;
      }
      
      uvAttribute.needsUpdate = true;
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [poolPoints, copingHeight, copingWidth]);

  const isSelected = selectedCategory === 'coping';

  return (
    <mesh key={copingTexture?.uuid || 'coping-mesh'} geometry={copingGeometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        map={copingTexture}
        color="#ffffff"
        roughness={0.8}
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
  paverTextureScale?: number;
  paverTextureOffset?: [number, number];
  deckHeight?: number;
  copingWidth?: number;
}> = ({ 
  hardscapePoints, 
  poolPoints, 
  features, 
  paverTextureUrl, 
  selectedCategory, 
  paverTextureScale = 1.8, 
  paverTextureOffset = [0, 0], 
  deckHeight = 2 / 12,
  copingWidth = 1.0
}) => {
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
      // 1ft x 1ft base scale
      const repeatX = 1.0 / paverTextureScale;
      const repeatY = 1.0 / paverTextureScale;
      
      textureCache.loadTexture(paverTextureUrl, { x: repeatX, y: repeatY })
        .then(texture => {
          texture.userData.url = paverTextureUrl;
          texture.offset.set(paverTextureOffset[0], paverTextureOffset[1]);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.needsUpdate = true;
          setPaverTexture(texture);
        })
        .catch(err => {
          console.error('Failed to load paver texture');
          setPaverTexture(null);
        });
    }
  }, [paverTextureUrl, paverTextureScale, paverTextureOffset]);

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

    // Create hole matching coping outer edge exactly
    const totalCutout = copingWidth;
    
    const copingHole = new THREE.Path();
    poolPoints.forEach((p, i) => {
      const x = p.x - centerX;
      const z = p.y - centerY;
      
      // Move outward by coping width to match coping outer edge
      const distance = Math.sqrt(x * x + z * z);
      const offsetX = distance > 0 ? x * (distance + totalCutout) / distance : x;
      const offsetZ = distance > 0 ? z * (distance + totalCutout) / distance : z;
      
      if (i === 0) {
        copingHole.moveTo(offsetX, offsetZ);
      }
      else copingHole.lineTo(offsetX, offsetZ);
    });
    copingHole.closePath();
    deckShape.holes.push(copingHole);

    const deckGeom = new THREE.ExtrudeGeometry(deckShape, {
      depth: deckHeight, // Use deckHeight for thickness
      bevelEnabled: false
    });
    deckGeom.rotateX(-Math.PI / 2);

    // Fix UV mapping for EXACT 1 sq ft tiles
    const positionAttribute = deckGeom.getAttribute('position');
    const uvAttribute = deckGeom.getAttribute('uv');
    if (positionAttribute && uvAttribute) {
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const z = positionAttribute.getZ(i);
        // Each 1 foot = 1 tile (UV coordinates directly from position)
        uvAttribute.setXY(i, x / 1.0, z / 1.0);
      }
      uvAttribute.needsUpdate = true;
    }

    return deckGeom;
  }, [hardscapePoints, poolPoints, deckHeight, copingWidth]); // Add copingWidth dependency

  if (!deckGeometry) return null;

  const isSelected = selectedCategory === 'deck';
  const redTint = isSelected ? Math.sin(pulseIntensity * Math.PI) : 0;

  return (
    <mesh key={paverTexture?.uuid || 'no-paver-texture'} geometry={deckGeometry} position={[0, 0, 0]} receiveShadow castShadow>
      <meshPhongMaterial
        map={paverTexture}
        color={paverTexture ? "#ffffff" : "#D4C4B0"}
        shininess={20}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.3}
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

// Grass Terrain Component with Precise Pool Cutout
const GrassTerrain: React.FC<{ poolPoints: Point[]; copingWidth?: number; poolPosition?: [number, number, number] }> = ({ poolPoints, copingWidth = 1.0, poolPosition = [0, 0, 0] }) => {
  const texture = useTexture(grassTexture);
  
  const terrainGeometry = useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(200, 200);
    
    if (poolPoints.length < 3) {
      // No pool, just flat terrain
      const geo = new THREE.PlaneGeometry(10000, 10000);
      geo.rotateX(-Math.PI / 2);
      return geo;
    }
    
    // Create terrain shape (10000ft x 10000ft centered at origin)
    const terrainShape = new THREE.Shape();
    terrainShape.moveTo(-5000, -5000);
    terrainShape.lineTo(5000, -5000);
    terrainShape.lineTo(5000, 5000);
    terrainShape.lineTo(-5000, 5000);
    terrainShape.closePath();
    
    // Create pool cutout hole - use outer edge (coping boundary)
    const poolHole = new THREE.Path();
    
    // Calculate coping outer boundary
    const copingOuterPoints: Array<{x: number, y: number}> = [];
    
    for (let i = 0; i < poolPoints.length; i++) {
      const p1 = poolPoints[i];
      const p2 = poolPoints[(i + 1) % poolPoints.length];
      const p0 = poolPoints[(i - 1 + poolPoints.length) % poolPoints.length];
      
      // Calculate normals for both edges meeting at this point
      const dx1 = p1.x - p0.x;
      const dy1 = p1.y - p0.y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const nx1 = -dy1 / len1;
      const nz1 = dx1 / len1;
      
      const dx2 = p2.x - p1.x;
      const dy2 = p2.y - p1.y;
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const nx2 = -dy2 / len2;
      const nz2 = dx2 / len2;
      
      // Average normal at corner
      const avgNx = (nx1 + nx2) / 2;
      const avgNz = (nz1 + nz2) / 2;
      const avgLen = Math.sqrt(avgNx * avgNx + avgNz * avgNz);
      
      // Push point outward by coping width
      copingOuterPoints.push({
        x: p1.x - (avgNx / avgLen) * copingWidth + poolPosition[0],
        y: p1.y - (avgNz / avgLen) * copingWidth + poolPosition[2]
      });
    }
    
    copingOuterPoints.forEach((point, i) => {
      if (i === 0) {
        poolHole.moveTo(point.x, point.y);
      } else {
        poolHole.lineTo(point.x, point.y);
      }
    });
    poolHole.closePath();
    
    terrainShape.holes.push(poolHole);
    
    // Create geometry from shape
    const geometry = new THREE.ShapeGeometry(terrainShape);
    geometry.rotateX(-Math.PI / 2);
    
    
    return geometry;
  }, [poolPoints, texture, copingWidth, poolPosition]);
  
  return (
    <mesh geometry={terrainGeometry} position={[0, -0.02, 0]} receiveShadow>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
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
  fenceHeight = 6,
  paverTextureScale = 1.8,
  copingTextureScale = 1.8,
  waterlineTextureScale = 1.8,
  linerTextureScale = 1.8,
  paverTextureOffset = [0, 0],
  copingTextureOffset = [0, 0],
  waterlineTextureOffset = [0, 0],
  linerTextureOffset = [0, 0],
  poolPosition = [0, 0, 0],
  copingHeight = 2 / 12,
  deckHeight = 2 / 12,
  copingWidth = 1.1, // Minimum 1.1 ft
  stairs = [],
  onStairsChange,
  isStairsPlacementMode = false,
  onStairsPlacementComplete,
  selectedStairId,
  onSelectStair,
  enablePoolSplineEdit = false,
  enableDeckSplineEdit = false,
  onPoolPointsChange,
  onDeckPointsChange
}) => {
  const [linerTexture] = useTexture([linerTextureUrl || '']);
  const poolDepth = poolDimensions?.depth || (depthPoints.length > 0 
    ? Math.max(...depthPoints.map(dp => dp.depth)) 
    : 8);
  
  // Convert Point[] to SplinePoint[] for pool
  const poolSplinePoints: SplinePoint[] = useMemo(() => 
    points.map(p => ({ x: p.x, y: 0, z: p.y, id: p.id })),
    [points]
  );
  
  // Convert HardscapePoint[] to SplinePoint[] for deck
  const deckSplinePoints: SplinePoint[] = useMemo(() => 
    (hardscapePoints || []).map(p => ({ x: p.x, y: deckHeight, z: p.y, id: p.id })),
    [hardscapePoints, deckHeight]
  );
  
  const handlePoolSplineChange = (splinePoints: SplinePoint[]) => {
    if (onPoolPointsChange) {
      const newPoints = splinePoints.map(sp => ({ x: sp.x, y: sp.z, id: sp.id }));
      onPoolPointsChange(newPoints);
    }
  };
  
  const handleDeckSplineChange = (splinePoints: SplinePoint[]) => {
    if (onDeckPointsChange) {
      const newPoints = splinePoints.map(sp => ({ x: sp.x, y: sp.z, id: sp.id }));
      onDeckPointsChange(newPoints);
    }
  };
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[30, 25, 30]} fov={50} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-20, 20, -10]} intensity={0.6} />
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffffff" />
      <hemisphereLight intensity={0.5} color="#87CEEB" groundColor="#8B7355" />

      {/* Grass Terrain Base - 10000ft x 10000ft with pool cutout at world origin */}
      <GrassTerrain poolPoints={points} copingWidth={copingWidth} poolPosition={poolPosition} />

      <group position={poolPosition}>

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

      {/* Pool Mesh */}
      <group onClick={() => onSelectCategory?.('pool')}>
        <PoolMesh
          points={points}
          depthPoints={depthPoints}
          linerTextureUrl={linerTextureUrl}
          poolDimensions={poolDimensions}
          linerTextureScale={linerTextureScale}
          linerTextureOffset={linerTextureOffset}
          selectedCategory={selectedCategory}
          copingHeight={copingHeight}
        />
      </group>

      {/* Deck */}
      {hardscapePoints && hardscapePoints.length > 0 && (
        <group onClick={() => onSelectCategory?.('deck')}>
          <DeckMesh
            hardscapePoints={hardscapePoints}
            poolPoints={points}
            features={features || []}
            paverTextureUrl={paverTextureUrl}
            selectedCategory={selectedCategory}
            paverTextureScale={paverTextureScale}
            paverTextureOffset={paverTextureOffset}
            deckHeight={deckHeight}
            copingWidth={copingWidth}
          />
        </group>
      )}

      {/* Coping */}
      <group onClick={() => onSelectCategory?.('coping')}>
        <CopingMesh
          poolPoints={points}
          copingTextureUrl={copingTextureUrl}
          selectedCategory={selectedCategory}
          copingTextureScale={copingTextureScale}
          copingTextureOffset={copingTextureOffset}
          copingHeight={copingHeight}
          copingWidth={copingWidth}
        />
      </group>

      {/* Waterline Tile */}
      <group onClick={() => onSelectCategory?.('waterline')}>
        <WaterlineMesh
          poolPoints={points}
          waterlineTextureUrl={waterlineTextureUrl}
          selectedCategory={selectedCategory}
          waterlineTextureScale={waterlineTextureScale}
          waterlineTextureOffset={waterlineTextureOffset}
          copingHeight={copingHeight}
        />
      </group>

      {/* Realistic Water Surface with Waves, Reflections, God Rays, and Depth-Based Colors */}
      <WaterSurface poolPoints={points} depthPoints={depthPoints} poolDimensions={poolDimensions} />

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

      {/* Pool Stairs */}
      {stairs && stairs.map((stair) => (
        <PoolStairs
          key={stair.id}
          stair={stair}
          poolDepth={poolDepth}
          texture={linerTexture}
          onSelect={onSelectStair}
          isSelected={selectedStairId === stair.id}
        />
      ))}

      </group>

      {/* Stairs Placement Mode */}
      {isStairsPlacementMode && onStairsPlacementComplete && (
        <StairsPlacementMode
          poolPoints={points}
          copingWidth={copingWidth}
          isActive={isStairsPlacementMode}
          onPlace={onStairsPlacementComplete}
          onCancel={() => onStairsPlacementComplete([0, 0, 0], 0)}
          numSteps={Math.ceil((poolDimensions?.depth || 8) / 0.625)}
          stepHeight={0.625}
          stepDepth={0.9167}
          stairWidth={3}
          stairShape="rectangle"
        />
      )}

      {/* Pool Spline Editor */}
      {enablePoolSplineEdit && (
        <SplineEditor
          points={poolSplinePoints}
          onPointsChange={handlePoolSplineChange}
          color="#00ff00"
          lineWidth={3}
          enableDrag={true}
          name="Pool Boundary"
          yPosition={0}
        />
      )}

      {/* Deck Spline Editor */}
      {enableDeckSplineEdit && hardscapePoints && hardscapePoints.length > 0 && (
        <SplineEditor
          points={deckSplinePoints}
          onPointsChange={handleDeckSplineChange}
          color="#ffaa00"
          lineWidth={3}
          enableDrag={true}
          name="Deck Boundary"
          yPosition={deckHeight}
        />
      )}

      <axesHelper args={[5]} />
    </>
  );
};
