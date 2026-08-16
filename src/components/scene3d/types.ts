// Types for the unified 3D scene system

export type PointType = 'linear' | 'curve' | 'smooth' | 'corner';

export interface Point {
  x: number;
  y: number;
  id: string;
  type?: PointType;
}

export interface DepthPoint {
  position: number;
  depth: number;
  id: string;
}

// Linear depth anchor for pool floor depth profile (shallow to deep)
export interface LinearDepthAnchor {
  id: string;
  position: number; // 0-1 along pool length (0 = shallow end, 1 = deep end)
  depth: number;    // Depth in feet at this position
}

/**
 * Direction the depth profile runs across the pool, in pool-plan feet
 * (same coordinate space as pool points). `start` is 0% (shallow) and
 * `end` is 100% (deep) — moving or rotating the axis re-shapes the bottom.
 */
export interface DepthAxis {
  start: { x: number; z: number };
  end: { x: number; z: number };
}

export interface PerimeterDepthPoint {
  x: number;
  z: number;
  depth: number;
  id: string;
  type?: 'linear' | 'smooth';
}

export interface HardscapePoint {
  x: number;
  y: number;
  id: string;
}

export interface TextureConfig {
  url: string;
  name: string;
  scale?: number;
  /** Texture rotation in degrees */
  rotation?: number;
  offset?: [number, number];
  repeat?: [number, number];
  roughness?: number;
  metalness?: number;
  color?: string;
}


export type FeatureType = 
  | 'stairs' 
  | 'light' 
  | 'jet' 
  | 'fountain' 
  | 'tree' 
  | 'shrub' 
  | 'umbrella'
  | 'heater'
  | 'custom';

export type StairShape = 'rectangle' | 'square' | 'rounded';

export interface PoolStair {
  id: string;
  position: [number, number, number];
  rotation: number;
  shape: StairShape;
  width: number;
  numSteps: number;
  stepHeight: number;
  stepDepth: number;
  texture?: TextureConfig;
}

export interface PoolFeature {
  id: string;
  type: FeatureType;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  texture?: TextureConfig;
  metadata?: {
    name?: string;
    price?: number;
    confirmed?: boolean;
  };
}

export interface Annotation {
  id: string;
  objectId: string;
  position: [number, number, number];
  text: string;
  color: string;
  price?: number;
  confirmed?: boolean;
}

// Pool light configuration for draggable wall-mounted lights
export type PoolLightColorMode = 'white' | 'gradient';

export interface PoolLightConfig {
  id: string;
  wallPosition: number;      // 0-1 position along pool perimeter
  depthFromSurface: number;  // How deep below water (default 1.5ft)
  color: string;             // '#ffffff' for white or current gradient color
  colorMode: PoolLightColorMode;
  intensity: number;         // Light intensity (0-5)
  isOn: boolean;
  angle?: number;            // Light direction angle in degrees (-45 to 45, 0 = straight)
}

// Additional pool/water body for spas, tanning ledges, separate pools
export interface AdditionalPool {
  id: string;
  type: 'pool' | 'spa';
  points: Point[];
  shape: 'rectangle' | 'kidney' | 'freeform';
  featureType?: 'regular' | 'spillover-spa' | 'tanning-ledge';
  isMerged?: boolean; // Whether water bodies are merged (no coping at intersection)
  spilloverEdges?: number[]; // Edge indices where water flows from spa to pool (no coping, water-fall effect)
  depth?: number;
  finish?: TextureConfig;
}

export interface Scene3D {
  pool: {
    points: Point[];
    depthPoints: DepthPoint[];
    perimeterDepthPoints?: PerimeterDepthPoint[];
    linearDepthAnchors?: LinearDepthAnchor[]; // Linear depth profile from shallow to deep
    depthAxis?: DepthAxis;                    // Direction the depth profile runs (movable / rotatable)
    shape: 'rectangle' | 'kidney' | 'freeform' | 'custom';
    finish: TextureConfig;
    position: [number, number, number];
    rotation: [number, number, number];
    dimensions?: {
      length: number;
      width: number;
      depth: number;
    };
  };
  deck: {
    points: HardscapePoint[];
    paver: TextureConfig;
    coping: TextureConfig;
    waterline?: TextureConfig;
    copingHeight?: number;
    deckHeight?: number;
    copingWidth?: number;
    /** Squared edge (standard) or bullnose where the product offers it. */
    copingEdgeProfile?: CopingEdgeProfileId;
    deckElevation?: number;
  };
  additionalPools?: AdditionalPool[]; // Additional water bodies (spas, tanning ledges, separate pools)
  poolLights?: PoolLightConfig[];
  features: PoolFeature[];
  stairs: PoolStair[];
  annotations: Annotation[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export interface TextureLibrary {
  finishes: TextureConfig[];
  pavers: TextureConfig[];
  coping: TextureConfig[];
  waterlines?: TextureConfig[]; // Dedicated waterline tile textures
}

export type TransformMode = 'translate' | 'rotate' | 'scale';

export type CameraPreset = 'top' | 'front' | 'side' | 'isometric';

export interface SceneObject {
  id: string;
  name: string;
  type: 'pool' | 'deck' | 'feature' | 'fence';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  texture?: TextureConfig;
}
