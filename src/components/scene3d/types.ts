// Types for the unified 3D scene system

export interface Point {
  x: number;
  y: number;
  id: string;
}

export interface DepthPoint {
  position: number;
  depth: number;
  id: string;
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

export interface Scene3D {
  pool: {
    points: Point[];
    depthPoints: DepthPoint[];
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
  };
  features: PoolFeature[];
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
