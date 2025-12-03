import * as React from 'react';
const { useState, useMemo, useEffect, useRef } = React;
import { PerspectiveCamera, Grid, useTexture, TransformControls, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';
import { WaterlineMesh } from './WaterlineMesh';
import WaterSurface from './WaterSurface';
import { PoolStairs } from './PoolStairs';
import { StairsPlacementMode } from './StairsPlacementMode';
import { SplineEditor, SplinePoint } from './scene3d/SplineEditor';
import { PoolBottomSplineEditor } from './scene3d/PoolBottomSplineEditor';
import { ComponentRuler } from './scene3d/ComponentRuler';
import { DeckGeometry } from './scene3d/DeckGeometry';
import { CopingGeometry } from './scene3d/CopingGeometry';
import { DeckBorderGeometry } from './scene3d/DeckBorderGeometry';
import earcut from 'earcut';
import grassTexture from '@/assets/grass-texture.avif';
import { Maximize2, Minimize2, Move } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { generateCurvedPoolPoints, normalize2DTo3D } from '@/utils/curveUtils';
import { BoundaryDebugOverlay } from './scene3d/BoundaryDebugOverlay';

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
  perimeterDepthPoints?: Array<{ x: number; z: number; depth: number; id: string; type?: 'linear' | 'smooth' }>;
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
  onSelectComponent?: (component: 'pool' | 'deck' | 'coping' | 'waterline' | null) => void;
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
  deckWidth?: number;
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
  enableFloorDepthSplineEdit?: boolean;
  onPoolPointsChange?: (points: Point[]) => void;
  onDeckPointsChange?: (points: HardscapePoint[]) => void;
  onPerimeterDepthPointsChange?: (points: Array<{ x: number; z: number; depth: number; id: string; type?: 'linear' | 'smooth' }>) => void;
  showWireframe?: boolean;
  showRulers?: boolean;
  showDebugBoundaries?: boolean;
  onDebugBoundariesChange?: (show: boolean) => void;
}

const PoolMesh: React.FC<{
  points: Point[];
  depthPoints: DepthPoint[];
  perimeterDepthPoints?: Array<{ x: number; z: number; depth: number; id: string; type?: 'linear' | 'smooth' }>;
  linerTextureUrl: string;
  poolDimensions?: { length: number; width: number; depth: number };
  selectedCategory?: string | null;
  linerTextureScale?: number;
  linerTextureOffset?: [number, number];
  copingHeight?: number;
  onSelectComponent?: (comp: 'pool' | 'deck' | 'coping' | 'waterline' | null) => void;
}> = ({
  points, 
  depthPoints, 
  linerTextureUrl = '/textures/finishes/sapphire-blue-g3.jpg',
  poolDimensions: providedDimensions, 
  selectedCategory, 
  linerTextureScale = 1.8, 
  linerTextureOffset = [0, 0],
  copingHeight = 2 / 12,
  onSelectComponent,
  perimeterDepthPoints: providedPerimeterDepthPoints
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
    if (linerTextureUrl && linerTextureUrl !== '' && linerTextureUrl !== 'undefined') {
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

  // Helper to get depth from perimeter depth points
  const getPerimeterDepth = (x: number, z: number): number => {
    if (!providedPerimeterDepthPoints || providedPerimeterDepthPoints.length === 0) {
      // Fallback to old 1D system
      return poolDimensions.depth || 5;
    }
    
    // Find the closest perimeter segment and interpolate along it
    let minDist = Infinity;
    let closestDepth = providedPerimeterDepthPoints[0].depth;
    
    for (let i = 0; i < providedPerimeterDepthPoints.length; i++) {
      const p1 = providedPerimeterDepthPoints[i];
      const p2 = providedPerimeterDepthPoints[(i + 1) % providedPerimeterDepthPoints.length];
      
      // Calculate distance from point (x, z) to segment [p1, p2]
      const segmentLengthSq = (p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2;
      
      if (segmentLengthSq === 0) {
        // Segment is a point
        const dist = Math.sqrt((p1.x - x) ** 2 + (p1.z - z) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closestDepth = p1.depth;
        }
        continue;
      }
      
      // Project point onto segment
      const t = Math.max(0, Math.min(1, 
        ((x - p1.x) * (p2.x - p1.x) + (z - p1.z) * (p2.z - p1.z)) / segmentLengthSq
      ));
      
      const projX = p1.x + t * (p2.x - p1.x);
      const projZ = p1.z + t * (p2.z - p1.z);
      const dist = Math.sqrt((x - projX) ** 2 + (z - projZ) ** 2);
      
      if (dist < minDist) {
        minDist = dist;
        // Interpolate depth along the segment
        closestDepth = p1.depth + t * (p2.depth - p1.depth);
      }
    }
    
    return closestDepth;
  };

  const { geometry, wallsGeometry } = useMemo(() => {
    if (points.length < 3) {
      return {
        geometry: new THREE.BoxGeometry(1, 1, 1),
        wallsGeometry: new THREE.BoxGeometry(1, 1, 1)
      };
    }

    // Generate smooth curved points from the original points
    // This creates smooth curves that match the 2D designer shapes exactly
    // ONLY curves very gentle bends (< 20°), keeps 90° corners and all sharp angles linear
    const curvedPoints = generateCurvedPoolPoints(
      points.map(p => ({ x: p.x, y: p.y })),
      30, // segments per edge for very smooth curves
      0.3  // tension for natural-looking curves
    );

    const minX = Math.min(...curvedPoints.map(p => p.x));
    const maxX = Math.max(...curvedPoints.map(p => p.x));
    const minY = Math.min(...curvedPoints.map(p => p.y));
    const maxY = Math.max(...curvedPoints.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const normalizedPoints = curvedPoints.map(p => ({
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

    // === POOL FLOOR GEOMETRY - SNAPPED TO WALL BOTTOMS ===
    // Floor uses exact normalizedPoints to match wall bottoms perfectly
    const floorThickness = 0.75; // 9 inches
    const floorVertices: number[] = [];
    const floorIndices: number[] = [];
    const floorUVs: number[] = [];
    
    // Step 1: Create perimeter ring using exact normalizedPoints (same as walls)
    // This ensures floor edges perfectly match wall bottom vertices
    const perimeterRing: Array<{x: number, z: number, depth: number}> = [];
    
    for (let i = 0; i < normalizedPoints.length; i++) {
      const p = normalizedPoints[i];
      const depth = getPerimeterDepth(p.x, p.z);
      perimeterRing.push({ x: p.x, z: p.z, depth });
    }
    
    // Step 2: Create floor top surface using triangulation from center
    // Calculate center point and average depth
    const centerFloorX = perimeterRing.reduce((sum, p) => sum + p.x, 0) / perimeterRing.length;
    const centerFloorZ = perimeterRing.reduce((sum, p) => sum + p.z, 0) / perimeterRing.length;
    const centerFloorDepth = perimeterRing.reduce((sum, p) => sum + p.depth, 0) / perimeterRing.length;
    
    // Add center vertex (top surface)
    const centerTopIdx = 0;
    floorVertices.push(centerFloorX, -centerFloorDepth, centerFloorZ);
    floorUVs.push(centerFloorX, centerFloorZ);
    
    // Add perimeter vertices (top surface) - these match wall bottoms exactly
    const perimeterTopStart = floorVertices.length / 3;
    for (const p of perimeterRing) {
      floorVertices.push(p.x, -p.depth, p.z);
      floorUVs.push(p.x, p.z);
    }
    
    // Add center vertex (bottom surface - 9 inches below)
    const centerBottomIdx = floorVertices.length / 3;
    floorVertices.push(centerFloorX, -centerFloorDepth - floorThickness, centerFloorZ);
    floorUVs.push(centerFloorX, centerFloorZ);
    
    // Add perimeter vertices (bottom surface)
    const perimeterBottomStart = floorVertices.length / 3;
    for (const p of perimeterRing) {
      floorVertices.push(p.x, -p.depth - floorThickness, p.z);
      floorUVs.push(p.x, p.z);
    }
    
    // Step 3: Create triangles for top surface (fan from center)
    for (let i = 0; i < perimeterRing.length; i++) {
      const currIdx = perimeterTopStart + i;
      const nextIdx = perimeterTopStart + ((i + 1) % perimeterRing.length);
      // Top surface triangles (counterclockwise when viewed from above)
      floorIndices.push(centerTopIdx, nextIdx, currIdx);
    }
    
    // Create triangles for bottom surface (reversed winding)
    for (let i = 0; i < perimeterRing.length; i++) {
      const currIdx = perimeterBottomStart + i;
      const nextIdx = perimeterBottomStart + ((i + 1) % perimeterRing.length);
      // Bottom surface triangles (clockwise when viewed from below)
      floorIndices.push(centerBottomIdx, currIdx, nextIdx);
    }
    
    // Step 4: Create side walls connecting top and bottom perimeters
    for (let i = 0; i < perimeterRing.length; i++) {
      const topCurr = perimeterTopStart + i;
      const topNext = perimeterTopStart + ((i + 1) % perimeterRing.length);
      const botCurr = perimeterBottomStart + i;
      const botNext = perimeterBottomStart + ((i + 1) % perimeterRing.length);
      
      // Side wall quad (two triangles)
      floorIndices.push(topCurr, botCurr, topNext);
      floorIndices.push(topNext, botCurr, botNext);
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
      
      // Use perimeter-based depth calculation
      const depth1 = getPerimeterDepth(p1.x, p1.z);
      const depth2 = getPerimeterDepth(p2.x, p2.z);
      
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
  }, [points, depthPoints, providedPerimeterDepthPoints, poolDimensions, copingHeight]);

  const isSelected = selectedCategory === 'pool';

  return (
    <>
      {/* Pool floor - positioned at world origin, vertices have depth baked in */}
      <mesh 
        geometry={geometry} 
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('pool');
        }}
      >
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
      <mesh 
        key={linerTexture?.uuid || 'no-liner-texture'} 
        geometry={wallsGeometry} 
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('pool');
        }}
      >
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

// Duplicate removed - using generateOffsetCurve from curveUtils.ts

// Dead code removed - using DeckGeometry and CopingGeometry components

// Dead component removed - using DeckGeometry and CopingGeometry components instead




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
    if (fenceTextureUrl && fenceTextureUrl !== '' && fenceTextureUrl !== 'undefined') {
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

// Grass Terrain Component with Pool Cutout Following Exact Pool Walls
const GrassTerrain: React.FC<{ poolPoints: Point[]; copingWidth?: number; poolPosition?: [number, number, number] }> = ({ poolPoints, copingWidth = 1.0, poolPosition = [0, 0, 0] }) => {
  const texture = useTexture(grassTexture);
  
  const terrainGeometry = useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(200, 200);
    
    // Create terrain shape (10000ft x 10000ft centered at origin)
    const terrainShape = new THREE.Shape();
    terrainShape.moveTo(-5000, -5000);
    terrainShape.lineTo(5000, -5000);
    terrainShape.lineTo(5000, 5000);
    terrainShape.lineTo(-5000, 5000);
    terrainShape.closePath();
    
    // Create hole following exact pool wall boundaries with validation
    try {
      if (poolPoints.length >= 3) {
        // Use curved pool points for the hole (same as pool walls/water surface)
        const poolCurve2D = poolPoints.map(p => ({ x: p.x, y: p.y }));
        const smoothPoolCurve = generateCurvedPoolPoints(poolCurve2D, 30, 0.3);
        
        if (smoothPoolCurve.length >= 3) {
          // CRITICAL: Normalize coordinates to match pool walls (centered at origin)
          const minX = Math.min(...smoothPoolCurve.map(p => p.x));
          const maxX = Math.max(...smoothPoolCurve.map(p => p.x));
          const minY = Math.min(...smoothPoolCurve.map(p => p.y));
          const maxY = Math.max(...smoothPoolCurve.map(p => p.y));
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          
          const normalizedPoints = smoothPoolCurve.map(p => ({
            x: p.x - centerX,
            y: p.y - centerY
          }));
          
          const poolHole = new THREE.Path();
          poolHole.moveTo(normalizedPoints[0].x, normalizedPoints[0].y);
          for (let i = 1; i < normalizedPoints.length; i++) {
            poolHole.lineTo(normalizedPoints[i].x, normalizedPoints[i].y);
          }
          poolHole.closePath();
          terrainShape.holes.push(poolHole);
          
          console.log('✅ GrassTerrain: Created NORMALIZED pool hole with', normalizedPoints.length, 'smooth points');
        }
      } else {
        console.warn('⚠️ GrassTerrain: Not enough pool points for hole, using default');
        // Fallback to simple rectangular hole
        const poolHole = new THREE.Path();
        poolHole.moveTo(-10, -20);
        poolHole.lineTo(10, -20);
        poolHole.lineTo(10, 20);
        poolHole.lineTo(-10, 20);
        poolHole.closePath();
        terrainShape.holes.push(poolHole);
      }
    } catch (error) {
      console.error('❌ GrassTerrain: Error creating pool hole, using fallback:', error);
      // Clear any partial holes
      terrainShape.holes = [];
      // Use safe rectangular hole as fallback
      const poolHole = new THREE.Path();
      poolHole.moveTo(-10, -20);
      poolHole.lineTo(10, -20);
      poolHole.lineTo(10, 20);
      poolHole.lineTo(-10, 20);
      poolHole.closePath();
      terrainShape.holes.push(poolHole);
    }
    
    // Create geometry from shape with error handling
    try {
      const geometry = new THREE.ShapeGeometry(terrainShape);
      geometry.rotateX(-Math.PI / 2);
      return geometry;
    } catch (error) {
      console.error('❌ GrassTerrain: ShapeGeometry creation failed, using simple plane:', error);
      // Fallback to a simple plane without hole
      const geometry = new THREE.PlaneGeometry(10000, 10000);
      return geometry;
    }
  }, [texture, poolPoints]);
  
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
  linerTextureUrl = '/src/assets/finishes/sapphire-blue-g3.jpg',
  paverTextureUrl = '/lovable-uploads/6f65c8d2-ad09-4fef-b01f-cb3c2e96cf11.png',
  copingTextureUrl = '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png',
  waterlineTextureUrl = '/src/assets/finishes/sapphire-blue-g3.jpg',
  fenceTextureUrl = '/src/assets/fence-texture.png',
  features,
  fencePoints,
  scale = 1,
  poolShape = 'rectangle',
  poolDimensions,
  selectedCategory,
  onSelectCategory,
  onSelectComponent,
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
  copingWidth = 1.1,
  deckWidth = 3,
  stairs = [],
  onStairsChange,
  isStairsPlacementMode = false,
  onStairsPlacementComplete,
  selectedStairId,
  onSelectStair,
  enablePoolSplineEdit = false,
  enableDeckSplineEdit = false,
  enableFloorDepthSplineEdit = false,
  perimeterDepthPoints: providedPerimeterDepthPoints,
  onPoolPointsChange,
  onDeckPointsChange,
  onPerimeterDepthPointsChange,
  showWireframe = false,
  showRulers = false,
  showDebugBoundaries: externalShowDebugBoundaries = false,
  onDebugBoundariesChange
}) => {
  // Remove local state - use parent's onSelectComponent callback instead
  const [copingEnabled, setCopingEnabled] = useState(true);
  const [localDeckWidth, setLocalDeckWidth] = useState(deckWidth);
  const [localCopingWidth, setLocalCopingWidth] = useState(copingWidth);
  const [localDeckHeight, setLocalDeckHeight] = useState(deckHeight);
  const [localCopingHeight, setLocalCopingHeight] = useState(copingHeight);
  const [splineEditMode, setSplineEditMode] = useState<'none' | 'pool' | 'deck'>('none');
  const [showDebugBoundaries, setShowDebugBoundaries] = useState(externalShowDebugBoundaries);

  // Sync external debug boundaries control
  useEffect(() => {
    setShowDebugBoundaries(externalShowDebugBoundaries);
  }, [externalShowDebugBoundaries]);

  // Notify parent when debug mode changes
  useEffect(() => {
    if (onDebugBoundariesChange) {
      onDebugBoundariesChange(showDebugBoundaries);
    }
  }, [showDebugBoundaries, onDebugBoundariesChange]);
  
  // Calculate normalized pool curve for deck/coping geometry
  const poolCurve3D = useMemo(() => {
    if (points.length < 3) return [];
    
    // Generate smooth curved pool boundary
    const poolCurve2D = points.map(p => ({ x: p.x, y: p.y }));
    const smoothPoolCurve = generateCurvedPoolPoints(poolCurve2D, 30, 0.3);
    
    // Normalize to world coordinates using shared utility
    return normalize2DTo3D(smoothPoolCurve);
  }, [points]);
  
  // Calculate normalized hardscape points for exact deck sync
  const normalizedHardscapePoints = useMemo(() => {
    if (!hardscapePoints || hardscapePoints.length < 4) return undefined;
    
    // Convert hardscape points to 2D format and normalize
    const hardscape2D = hardscapePoints.map(p => ({ x: p.x, y: p.y }));
    return normalize2DTo3D(hardscape2D);
  }, [hardscapePoints]);
  
  // Initialize perimeter depth points from 1D depth profile if not provided
  const perimeterDepthPoints = useMemo(() => {
    if (providedPerimeterDepthPoints && providedPerimeterDepthPoints.length > 0) {
      return providedPerimeterDepthPoints;
    }
    
    // Generate initial perimeter depths from pool boundary points and 1D depth profile
    if (poolCurve3D.length === 0 || depthPoints.length === 0) return [];
    
    const maxDepth = Math.max(...depthPoints.map(d => d.depth));
    const minDepth = Math.min(...depthPoints.map(d => d.depth));
    
    return poolCurve3D.map((p, i) => ({
      x: p.x,
      z: p.z,
      depth: minDepth + (maxDepth - minDepth) * (i / (poolCurve3D.length - 1)),
      id: `perimeter-depth-${i}`,
      type: 'smooth' as const
    }));
  }, [providedPerimeterDepthPoints, poolCurve3D, depthPoints]);
  
  // Helper function to get depth at any perimeter position
  const getPerimeterDepth = (x: number, z: number, perimeterPoints: typeof perimeterDepthPoints): number => {
    if (perimeterPoints.length === 0) {
      return depthPoints[0]?.depth || 5;
    }
    
    // Find two nearest perimeter points and interpolate
    let minDist1 = Infinity;
    let minDist2 = Infinity;
    let nearest1 = perimeterPoints[0];
    let nearest2 = perimeterPoints[1];
    
    perimeterPoints.forEach(p => {
      const dist = Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2);
      if (dist < minDist1) {
        minDist2 = minDist1;
        nearest2 = nearest1;
        minDist1 = dist;
        nearest1 = p;
      } else if (dist < minDist2) {
        minDist2 = dist;
        nearest2 = p;
      }
    });
    
    // Interpolate depth
    const totalDist = minDist1 + minDist2;
    if (totalDist === 0) return nearest1.depth;
    return (nearest1.depth * minDist2 + nearest2.depth * minDist1) / totalDist;
  };
  // CRITICAL: Normalize empty strings to fallback URLs
  const normalizedLinerUrl = linerTextureUrl && linerTextureUrl.trim() !== '' && linerTextureUrl !== 'undefined' 
    ? linerTextureUrl 
    : '/src/assets/finishes/sapphire-blue-g3.jpg';
    
  const normalizedPaverUrl = paverTextureUrl && paverTextureUrl.trim() !== '' && paverTextureUrl !== 'undefined'
    ? paverTextureUrl 
    : '/lovable-uploads/6f65c8d2-ad09-4fef-b01f-cb3c2e96cf11.png';
    
  const normalizedCopingUrl = copingTextureUrl && copingTextureUrl.trim() !== '' && copingTextureUrl !== 'undefined'
    ? copingTextureUrl 
    : '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
    
  const normalizedWaterlineUrl = waterlineTextureUrl && waterlineTextureUrl.trim() !== '' && waterlineTextureUrl !== 'undefined'
    ? waterlineTextureUrl 
    : '/src/assets/finishes/sapphire-blue-g3.jpg';
    
  const normalizedFenceUrl = fenceTextureUrl && fenceTextureUrl.trim() !== '' && fenceTextureUrl !== 'undefined'
    ? fenceTextureUrl 
    : '/src/assets/fence-texture.png';

  const [linerTexture] = useTexture([normalizedLinerUrl || '']);
  const poolDepth = poolDimensions?.depth || (depthPoints.length > 0 
    ? Math.max(...depthPoints.map(dp => dp.depth)) 
    : 8);
  
  // Convert pool points to spline editor format
  // Pool points should be INSIDE the coping (offset inward by coping width)
  const poolSplinePoints: SplinePoint[] = useMemo(() => {
    if (points.length < 3) return points.map((p, i) => ({ x: p.x, y: 0, z: p.y, id: p.id || `pool-${i}` }));
    
    // Calculate center of pool
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    
    // Offset each point INWARD by coping width
    return points.map((p, i) => {
      const dx = centerX - p.x;
      const dy = centerY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Move point toward center by coping width
      const offsetX = p.x + (dx / dist) * (copingWidth || 1.0);
      const offsetY = p.y + (dy / dist) * (copingWidth || 1.0);
      
      return { x: offsetX, y: 0, z: offsetY, id: p.id || `pool-${i}` };
    });
  }, [points, copingWidth]);
  
  // Convert HardscapePoint[] to SplinePoint[] for deck
  // Deck points should be on OUTER perimeter
  const deckSplinePoints: SplinePoint[] = useMemo(() => 
    (hardscapePoints || []).map(p => ({ x: p.x, y: deckHeight, z: p.y, id: p.id })),
    [hardscapePoints, deckHeight]
  );
  
  // Handle pool spline changes
  // When user drags pool points, offset them OUTWARD by coping width to get actual pool boundary
  const handlePoolSplineChange = (splinePoints: SplinePoint[]) => {
    if (onPoolPointsChange) {
      // Calculate center
      const centerX = splinePoints.reduce((sum, p) => sum + p.x, 0) / splinePoints.length;
      const centerZ = splinePoints.reduce((sum, p) => sum + p.z, 0) / splinePoints.length;
      
      // Offset each point OUTWARD by coping width to get actual pool boundary
      const newPoints = splinePoints.map(sp => {
        const dx = sp.x - centerX;
        const dz = sp.z - centerZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        // Move point away from center by coping width
        const actualX = sp.x + (dx / dist) * (copingWidth || 1.0);
        const actualY = sp.z + (dz / dist) * (copingWidth || 1.0);
        
        return { x: actualX, y: actualY, id: sp.id };
      });
      
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
      <group onClick={(e) => {
        e.stopPropagation();
        onSelectCategory?.('pool');
        onSelectComponent?.('pool');
      }}>
        <PoolMesh
          points={points}
          depthPoints={depthPoints}
          perimeterDepthPoints={perimeterDepthPoints}
          linerTextureUrl={normalizedLinerUrl}
          poolDimensions={poolDimensions}
          linerTextureScale={linerTextureScale}
          linerTextureOffset={linerTextureOffset}
          selectedCategory={selectedCategory}
          copingHeight={copingHeight}
          onSelectComponent={onSelectComponent}
        />
      </group>

      {/* NEW SPLINE-BASED DECK AND COPING SYSTEM */}
      {points.length >= 3 && (
        <>
          {/* Coping - 1ft band at pool edge (toggleable) */}
          {copingEnabled && (
            <group onClick={(e) => {
              e.stopPropagation();
              onSelectCategory?.('coping');
              onSelectComponent?.('coping');
            }}>
              <CopingGeometry
                poolPoints={poolCurve3D}
                copingWidth={localCopingWidth}
                copingHeight={localCopingHeight}
                textureUrl={normalizedCopingUrl}
                textureScale={copingTextureScale}
                textureOffset={copingTextureOffset}
                paverTextureUrl={normalizedPaverUrl}
              />
            </group>
          )}

          {/* Deck Border - outer face around coping, 3" tall, min 3ft wide */}
          <group onClick={(e) => {
            e.stopPropagation();
            onSelectCategory?.('deck');
            onSelectComponent?.('deck');
          }}>
            <DeckBorderGeometry
              poolPoints={poolCurve3D}
              deckWidth={localDeckWidth}
              copingWidth={localCopingWidth}
              borderHeight={0.25} // 3 inches
              borderWidth={Math.max(3, localDeckWidth)} // minimum 3ft, can grow
              textureUrl={normalizedPaverUrl}
              textureScale={paverTextureScale}
              textureOffset={paverTextureOffset}
            />
          </group>
        </>
      )}

      {/* Waterline Tile */}
      <group onClick={(e) => {
        e.stopPropagation();
        onSelectCategory?.('waterline');
        onSelectComponent?.('waterline');
      }}>
        <WaterlineMesh
          poolPoints={points}
          waterlineTextureUrl={normalizedWaterlineUrl}
          selectedCategory={selectedCategory}
          waterlineTextureScale={waterlineTextureScale}
          waterlineTextureOffset={waterlineTextureOffset}
          copingHeight={copingHeight}
        />
      </group>

      {/* Water is now rendered independently in UnifiedPoolVisualizer */}

      {fencePoints && fencePoints.length > 0 && (
        <FenceMesh
          fencePoints={fencePoints}
          fenceTextureUrl={normalizedFenceUrl}
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

      {/* Boundary Debug Overlay */}
      {showDebugBoundaries && poolCurve3D.length > 0 && (
        <BoundaryDebugOverlay
          poolPoints={poolCurve3D.map(p => new THREE.Vector2(p.x, p.z))}
          copingWidth={localCopingWidth}
          deckWidth={localDeckWidth}
          showCoping={copingEnabled}
        />
      )}

      {/* Dimension Labels - Always visible */}
      {poolCurve3D.length > 0 && (() => {
        const xs = poolCurve3D.map(p => p.x);
        const zs = poolCurve3D.map(p => p.z);
        const bounds = {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...zs),
          maxY: Math.max(...zs)
        };
        return (
          <ComponentRuler
            bounds={bounds}
            height={copingHeight + 0.5}
          />
        );
      })()}

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

      {/* Spline Editors - Enable to edit pool and deck shapes in 3D */}
      {splineEditMode === 'pool' && (
        <SplineEditor
          points={poolSplinePoints}
          onPointsChange={handlePoolSplineChange}
          color="#00ff00"
          enableDrag={true}
          name="Pool Boundary"
          yPosition={0.5}
        />
      )}

      {splineEditMode === 'deck' && hardscapePoints && hardscapePoints.length > 0 && (
        <SplineEditor
          points={deckSplinePoints}
          onPointsChange={handleDeckSplineChange}
          color="#ffaa00"
          enableDrag={true}
          name="Deck Boundary"
          yPosition={localDeckHeight + 0.1}
        />
      )}
      
      {/* Pool Bottom Depth Spline Editor */}
      {enableFloorDepthSplineEdit && perimeterDepthPoints.length > 0 && (
        <PoolBottomSplineEditor
          perimeterDepthPoints={perimeterDepthPoints}
          onPointsChange={(newPoints) => {
            if (onPerimeterDepthPointsChange) {
              onPerimeterDepthPointsChange(newPoints);
            }
          }}
          enabled={enableFloorDepthSplineEdit}
        />
      )}
      
      {/* Component Rulers - removed as they depended on local state */}

      <axesHelper args={[5]} />
    </>
  );
};
