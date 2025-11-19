import { useState, useMemo, useEffect } from 'react';
import { PerspectiveCamera, Grid, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';
import { WaterlineMesh } from './WaterlineMesh';
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
}

const PoolMesh: React.FC<{
  points: Point[];
  depthPoints: DepthPoint[];
  linerTextureUrl?: string;
  poolDimensions?: { length: number; width: number; depth: number };
  selectedCategory?: string | null;
  linerTextureScale?: number;
  linerTextureOffset?: [number, number];
}> = ({ 
  points, 
  depthPoints, 
  linerTextureUrl, 
  poolDimensions: providedDimensions, 
  selectedCategory, 
  linerTextureScale = 1, 
  linerTextureOffset = [0, 0] 
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
      // Pool finish tiles: 1ft x 1ft base scale
      const baseRepeatX = poolDimensions.width / 1.0;
      const baseRepeatY = poolDimensions.length / 1.0;
      const repeatX = baseRepeatX * linerTextureScale;
      const repeatY = baseRepeatY * linerTextureScale;
      
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
          console.error('Failed to load liner texture, using default');
          setLinerTexture(null);
        });
    }
  }, [linerTextureUrl, poolDimensions.width, poolDimensions.length, linerTextureScale, linerTextureOffset]);

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
    // Solid floor with sloped depth profile from shallow to deep
    const floorVertices: number[] = [];
    const floorIndices: number[] = [];
    const floorUVs: number[] = [];
    
    // Triangulate pool shape
    const flatCoords = normalizedPoints.flatMap(p => [p.x, p.z]);
    const triangles = earcut(flatCoords);
    
    // Create floor vertices with actual depth variation
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
      
      // UV mapping: 1ft x 1ft pool finish tiles
      const u = (point.x - (minX - centerX)) / 1;
      const v = (point.z - (minY - centerY)) / 1;
      floorUVs.push(u, v);
    }
    
    // Floor triangulation indices
    for (let i = 0; i < triangles.length; i++) {
      floorIndices.push(triangles[i]);
    }
    
    const floorGeometry = new THREE.BufferGeometry();
    floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(floorVertices, 3));
    floorGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(floorUVs, 2));
    floorGeometry.setIndex(floorIndices);
    floorGeometry.computeVertexNormals();

    // === POOL WALLS GEOMETRY ===
    // Solid walls from water surface (y=0) to sloped floor
    const wallVertices: number[] = [];
    const wallIndices: number[] = [];
    const wallUVs: number[] = [];
    
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
      
      const baseIdx = wallVertices.length / 3;
      
      // Wall quad: top at water level, bottom follows floor slope
      wallVertices.push(p1.x, 0, p1.z);          // Top left at water surface
      wallVertices.push(p2.x, 0, p2.z);          // Top right at water surface
      wallVertices.push(p1.x, -depth1, p1.z);    // Bottom left at floor
      wallVertices.push(p2.x, -depth2, p2.z);    // Bottom right at floor
      
      // UV mapping: 1ft x 1ft tiles on walls
      const avgDepth = (depth1 + depth2) / 2;
      wallUVs.push(
        0, 0,
        wallLength / 1, 0,
        0, avgDepth / 1,
        wallLength / 1, avgDepth / 1
      );
      
      // Wall face (normals facing inward to pool interior)
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
  }, [points, depthPoints, poolDimensions]);

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
      <mesh geometry={wallsGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          map={linerTexture}
          roughness={0.6}
          metalness={0.0}
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
  copingTextureScale?: number;
  copingTextureOffset?: [number, number];
  copingHeight?: number;
}> = ({ poolPoints, copingTextureUrl, selectedCategory, copingTextureScale = 1, copingTextureOffset = [0, 0], copingHeight = 2 / 12 }) => {
  const [copingTexture, setCopingTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Calculate pool bounds for coping dimensions
  const copingDimensions = useMemo(() => {
    if (poolPoints.length < 3) return { width: 0, length: 0, perimeter: 0 };
    
    const xs = poolPoints.map(p => p.x);
    const ys = poolPoints.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);
    
    // Calculate perimeter for texture mapping
    let perimeter = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const p1 = poolPoints[i];
      const p2 = poolPoints[(i + 1) % poolPoints.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    return { width, length, perimeter };
  }, [poolPoints]);

  useEffect(() => {
    if (copingTextureUrl) {
      // Coping texture: 1x1 ft base scale
      const repeatX = (copingDimensions.perimeter / 1.0) * copingTextureScale;
      const repeatY = 1.0 * copingTextureScale;
      
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
  }, [copingTextureUrl, copingDimensions.perimeter, copingTextureScale, copingTextureOffset]);

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

  // Create rectangular coping frame geometry with vertical walls
  const copingGeometry = useMemo(() => {
    if (poolPoints.length < 3) {
      return new THREE.BoxGeometry(1, 0.5, 0.5);
    }

    // Calculate pool bounds
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

    // COORDINATE SYSTEM:
    // Origin (0,0,0) = pool center at water surface
    // X-axis = pool width direction
    // Y-axis = vertical (up/down), water surface at y=0
    // Z-axis = pool length direction

    const copingWidth = 1.0; // 1 foot wide coping

    // Pool outer edge (at pool perimeter)
    const innerHalfWidth = poolWidth / 2;
    const innerHalfLength = poolLength / 2;
    
    // Coping outer edge (1 foot beyond pool edge)
    const outerHalfWidth = innerHalfWidth + copingWidth;
    const outerHalfLength = innerHalfLength + copingWidth;

    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    // Create 4 rectangular strips forming a frame - TOP SURFACE at y = copingHeight
    const topStrips = [
      // Top strip (along +Z edge)
      { 
        corners: [
          [-outerHalfWidth, copingHeight, outerHalfLength],  // outer top-left
          [outerHalfWidth, copingHeight, outerHalfLength],   // outer top-right
          [innerHalfWidth, copingHeight, innerHalfLength],   // inner top-right
          [-innerHalfWidth, copingHeight, innerHalfLength]   // inner top-left
        ],
        uStart: 0,
        length: poolWidth + copingWidth * 2
      },
      // Right strip (along +X edge)
      {
        corners: [
          [outerHalfWidth, copingHeight, outerHalfLength],   // outer top-right
          [outerHalfWidth, copingHeight, -outerHalfLength],  // outer bottom-right
          [innerHalfWidth, copingHeight, -innerHalfLength],  // inner bottom-right
          [innerHalfWidth, copingHeight, innerHalfLength]    // inner top-right
        ],
        uStart: (poolWidth + copingWidth * 2),
        length: poolLength + copingWidth * 2
      },
      // Bottom strip (along -Z edge)
      {
        corners: [
          [outerHalfWidth, copingHeight, -outerHalfLength],  // outer bottom-right
          [-outerHalfWidth, copingHeight, -outerHalfLength], // outer bottom-left
          [-innerHalfWidth, copingHeight, -innerHalfLength], // inner bottom-left
          [innerHalfWidth, copingHeight, -innerHalfLength]   // inner bottom-right
        ],
        uStart: (poolWidth + copingWidth * 2) + (poolLength + copingWidth * 2),
        length: poolWidth + copingWidth * 2
      },
      // Left strip (along -X edge)
      {
        corners: [
          [-outerHalfWidth, copingHeight, -outerHalfLength], // outer bottom-left
          [-outerHalfWidth, copingHeight, outerHalfLength],  // outer top-left
          [-innerHalfWidth, copingHeight, innerHalfLength],  // inner top-left
          [-innerHalfWidth, copingHeight, -innerHalfLength]  // inner bottom-left
        ],
        uStart: (poolWidth + copingWidth * 2) * 2 + (poolLength + copingWidth * 2),
        length: poolLength + copingWidth * 2
      }
    ];

    // Add top surface vertices
    topStrips.forEach(strip => {
      const baseIdx = vertices.length / 3;
      
      // Add 4 corner vertices for this strip
      strip.corners.forEach(([x, y, z], i) => {
        vertices.push(x, y, z);
        
        // UV mapping: 1ft x 1ft tiles (matching pool bottom pattern)
        // Map based on actual world position for consistent tile size
        const uPos = (i < 2) ? strip.length : 0; // Along perimeter
        const vPos = (i % 2 === 0) ? copingWidth : 0; // Across width (1 ft)
        uvs.push(uPos / 1.0, vPos / 1.0); // Each foot = 1 tile
      });
      
      // Two triangles forming the rectangular strip
      indices.push(
        baseIdx, baseIdx + 1, baseIdx + 2,
        baseIdx, baseIdx + 2, baseIdx + 3
      );
    });

    // Add INNER VERTICAL WALLS (2-inch drop from coping to water level at y=0)
    // These walls connect the inner edge of the coping top surface down to the water surface
    const innerPerimeterPoints = [
      [-innerHalfWidth, innerHalfLength],   // top-left
      [innerHalfWidth, innerHalfLength],    // top-right
      [innerHalfWidth, -innerHalfLength],   // bottom-right
      [-innerHalfWidth, -innerHalfLength]   // bottom-left
    ];

    for (let i = 0; i < innerPerimeterPoints.length; i++) {
      const p1 = innerPerimeterPoints[i];
      const p2 = innerPerimeterPoints[(i + 1) % innerPerimeterPoints.length];
      
      const baseIdx = vertices.length / 3;
      
      // Calculate wall segment length for UV mapping
      const wallLength = Math.sqrt(
        Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
      );
      
      // Top edge vertices (at coping height)
      vertices.push(p1[0], copingHeight, p1[1]);
      vertices.push(p2[0], copingHeight, p2[1]);
      
      // Bottom edge vertices (at water surface, y=0)
      vertices.push(p1[0], 0, p1[1]);
      vertices.push(p2[0], 0, p2[1]);
      
      // UV mapping: 1ft x 1ft tiles on vertical walls
      uvs.push(
        0, 0,
        wallLength / 1.0, 0,
        0, copingHeight / 1.0,
        wallLength / 1.0, copingHeight / 1.0
      );
      
      // Two triangles for the wall segment
      indices.push(
        baseIdx, baseIdx + 1, baseIdx + 2,
        baseIdx + 1, baseIdx + 3, baseIdx + 2
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [poolPoints, copingDimensions, copingHeight]);

  const isSelected = selectedCategory === 'coping';

  return (
    <mesh geometry={copingGeometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={copingTexture ? "#ffffff" : "#8B7355"}
        map={copingTexture}
        roughness={0.6}
        metalness={0.0}
        side={THREE.DoubleSide}
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
}> = ({ hardscapePoints, poolPoints, features, paverTextureUrl, selectedCategory, paverTextureScale = 1, paverTextureOffset = [0, 0], deckHeight = 2 / 12 }) => {
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
      // Deck paver tiles: 1ft x 1ft base scale
      const repeatX = (deckDimensions.width / 1.0) * paverTextureScale;
      const repeatY = (deckDimensions.length / 1.0) * paverTextureScale;
      
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
          console.error('Failed to load paver texture, using default');
          setPaverTexture(null);
        });
    }
  }, [paverTextureUrl, deckDimensions.width, deckDimensions.length, paverTextureScale, paverTextureOffset]);

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
    // Debug: log the pool and hole coordinates
    console.log('[DeckMesh] Pool center:', centerX, centerY);
    console.log('[DeckMesh] First pool point:', poolPoints[0]);
    
    const copingHole = new THREE.Path();
    poolPoints.forEach((p, i) => {
      const x = p.x - centerX;
      const z = p.y - centerY;
      
      // Calculate radial offset: move 1 foot outward from pool center
      const distance = Math.sqrt(x * x + z * z);
      const offsetX = distance > 0 ? x * (distance + 1) / distance : x;
      const offsetZ = distance > 0 ? z * (distance + 1) / distance : z;
      
      if (i === 0) {
        copingHole.moveTo(offsetX, offsetZ);
        console.log('[DeckMesh] First hole point:', offsetX, offsetZ);
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
  }, [hardscapePoints, poolPoints, deckHeight]);

  if (!deckGeometry) return null;

  const isSelected = selectedCategory === 'deck';
  const redTint = isSelected ? Math.sin(pulseIntensity * Math.PI) : 0;

  return (
    <mesh geometry={deckGeometry} position={[0, 0, 0]} receiveShadow castShadow>
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

// Grass Terrain Component with Precise Pool Cutout
const GrassTerrain: React.FC<{ poolPoints: Point[] }> = ({ poolPoints }) => {
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
    
    // Create pool cutout hole - INSIDE THE POOL (at pool boundary, not expanded)
    const poolHole = new THREE.Path();
    
    // Use pool points directly for the hole (cuts INSIDE the pool)
    poolPoints.forEach((point, i) => {
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
  }, [poolPoints, texture]);
  
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
  paverTextureScale = 1,
  copingTextureScale = 1,
  waterlineTextureScale = 1,
  linerTextureScale = 1,
  paverTextureOffset = [0, 0],
  copingTextureOffset = [0, 0],
  waterlineTextureOffset = [0, 0],
  linerTextureOffset = [0, 0],
  poolPosition = [0, 0, 0],
  copingHeight = 2 / 12,
  deckHeight = 2 / 12
}) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[30, 25, 30]} fov={50} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-20, 20, -10]} intensity={0.6} />
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffffff" />
      <hemisphereLight intensity={0.5} color="#87CEEB" groundColor="#8B7355" />

      <group position={poolPosition}>

      {/* Grass Terrain Base - 10000ft x 10000ft with pool cutout */}
      <GrassTerrain poolPoints={points} />

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

      </group>

      <axesHelper args={[5]} />
    </>
  );
};
