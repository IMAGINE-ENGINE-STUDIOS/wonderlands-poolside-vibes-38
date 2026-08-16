import { Scene3D, TextureLibrary, TextureConfig, PoolFeature as Scene3DPoolFeature } from './types';
import { buildCatalogTextureLibrary } from '@/data/textureLibrary';

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

interface PoolBuilderFeature {
  type: 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home' | 'shrub' | 'umbrella' | 'fence' | 'pathway';
  x: number;
  y: number;
  id: string;
  angle?: number;
  steps?: number;
  wallSegment?: number;
  wallPosition?: number;
  width?: number;
  height?: number;
  treeType?: 'palm' | 'oak' | 'pine' | 'willow' | 'maple' | 'cypress';
  shrubType?: 'round' | 'flowering' | 'hedge';
  pathwayType?: 'straight' | 'curved' | 'circular';
  radius?: number;
  roofPoints?: any[];
  color?: string;
}

interface CustomTexture {
  id: string;
  name: string;
  url: string;
  target: 'pool' | 'deck' | 'fence' | 'coping' | 'water';
  preview?: string;
  repeatX?: number;
  repeatY?: number;
}

interface PoolBuilderData {
  points: Point[];
  depthPoints: DepthPoint[];
  hardscapePoints: HardscapePoint[];
  fencePoints?: FencePoint[];
  features: PoolBuilderFeature[];
  customTextures: CustomTexture[];
  poolShape: 'rectangle' | 'kidney' | 'freeform' | 'custom';
  scale: number;
  selectedPaverId?: string;
  selectedCopingId?: string;
  paverTypes?: any[];
}

/**
 * Converts PoolBuilder state into Scene3D format for UnifiedPoolVisualizer
 */
export function poolBuilderToScene(data: PoolBuilderData): Scene3D {
  const {
    points,
    depthPoints,
    hardscapePoints,
    fencePoints = [],
    features,
    customTextures,
    poolShape,
    scale,
    paverTypes = []
  } = data;

  // Calculate pool dimensions from points
  // CRITICAL: 2D designer points are in pixels, need to convert to feet by dividing by scale
  const xCoords = points.map(p => p.x / scale);
  const yCoords = points.map(p => p.y / scale);
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  
  const poolLength = maxX - minX;
  const poolWidth = maxY - minY;
  const poolDepth = depthPoints.length > 0 
    ? Math.max(...depthPoints.map(dp => dp.depth)) 
    : 6;

  // Get textures from customTextures or defaults
  const poolTexture = customTextures.find(t => t.target === 'pool' || t.target === 'water');
  const deckTexture = customTextures.find(t => t.target === 'deck');
  const copingTexture = customTextures.find(t => t.target === 'coping');

  // Convert PoolBuilder features to Scene3D features
  const scene3DFeatures: Scene3DPoolFeature[] = features
    .filter(f => ['stairs', 'light', 'jet', 'fountain', 'tree', 'shrub', 'umbrella'].includes(f.type))
    .map(feature => {
      // Map PoolBuilder feature types to Scene3D feature types
      let featureType: Scene3DPoolFeature['type'];
      
      switch (feature.type) {
        case 'stairs':
        case 'light':
        case 'jet':
        case 'fountain':
        case 'tree':
        case 'shrub':
        case 'umbrella':
          featureType = feature.type;
          break;
        default:
          featureType = 'custom';
      }

      return {
        id: feature.id,
        type: featureType,
        position: [
          feature.x / scale,  // Convert pixels to feet by dividing by scale
          0,
          feature.y / scale   // Convert pixels to feet by dividing by scale
        ] as [number, number, number],
        rotation: feature.angle ? [0, feature.angle, 0] as [number, number, number] : undefined,
        scale: [1, 1, 1] as [number, number, number],
        metadata: {
          name: feature.type,
          confirmed: false
        }
      };
    });

  // Create the Scene3D object
  const scene: Scene3D = {
    pool: {
      points: points,
      depthPoints: depthPoints,
      shape: poolShape === 'custom' ? 'freeform' : poolShape,
      finish: poolTexture ? {
        url: poolTexture.url,
        name: poolTexture.name || 'Custom Finish',
        repeat: poolTexture.repeatX && poolTexture.repeatY 
          ? [poolTexture.repeatX, poolTexture.repeatY] as [number, number]
          : undefined,
        roughness: 0.2,
        metalness: 0.1,
        color: '#0088cc'
      } : {
        url: '/textures/finishes/sapphire-blue-g3.webp',
        name: 'Sapphire Blue',
        roughness: 0.2,
        metalness: 0.1,
        color: '#0088cc'
      },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      dimensions: {
        length: poolLength,
        width: poolWidth,
        depth: poolDepth
      }
    },
    deck: {
      points: hardscapePoints,
      paver: deckTexture ? {
        url: deckTexture.url,
        name: deckTexture.name || 'Custom Paver',
        repeat: deckTexture.repeatX && deckTexture.repeatY 
          ? [deckTexture.repeatX, deckTexture.repeatY] as [number, number]
          : undefined,
        roughness: 0.8,
        metalness: 0.0
      } : {
        url: paverTypes[0]?.image || '/lovable-uploads/6f65c8d2-ad09-4fef-b01f-cb3c2e96cf11.png',
        name: 'Default Paver',
        roughness: 0.8,
        metalness: 0.0
      },
      coping: copingTexture ? {
        url: copingTexture.url,
        name: copingTexture.name || 'Custom Coping',
        repeat: copingTexture.repeatX && copingTexture.repeatY 
          ? [copingTexture.repeatX, copingTexture.repeatY] as [number, number]
          : undefined,
        roughness: 0.6,
        metalness: 0.0
      } : {
        url: paverTypes[0]?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.webp',
        name: 'Default Coping',
        roughness: 0.6,
        metalness: 0.0
      },
      waterline: poolTexture ? {
        url: poolTexture.url,
        name: poolTexture.name || 'Custom Waterline',
        roughness: 0.3,
        metalness: 0.2
      } : {
        url: '/textures/finishes/sapphire-blue-g3.webp',
        name: 'Sapphire Blue',
        roughness: 0.3,
        metalness: 0.2
      }
    },
    features: scene3DFeatures,
    stairs: [],
    annotations: [],
    camera: {
      position: [20, 15, 20],
      target: [0, 0, 0]
    }
  };

  return scene;
}

/**
 * Builds the texture library from the shared Wonderlands catalog, merged with
 * any custom textures the user uploaded inside PoolBuilder. The catalog is the
 * single source of truth — no hardcoded swatch lists here.
 */
export function buildTextureLibrary(
  customTextures: CustomTexture[],
  _paverTypes: any[],
  _finishOptions: any[] = []
): TextureLibrary {
  const toCustom = (
    targets: string[],
    label: string,
    roughness: number,
    metalness: number
  ) =>
    customTextures
      .filter((t) => targets.includes(t.target))
      .map((t) => ({
        url: t.url,
        name: t.name || label,
        repeat:
          t.repeatX && t.repeatY ? ([t.repeatX, t.repeatY] as [number, number]) : undefined,
        roughness,
        metalness,
      }));

  return buildCatalogTextureLibrary({
    finishes: toCustom(['pool', 'water'], 'Custom Finish', 0.2, 0.1),
    pavers: toCustom(['deck'], 'Custom Paver', 0.8, 0),
    coping: toCustom(['coping'], 'Custom Coping', 0.6, 0),
    waterlines: toCustom(['waterline'], 'Custom Waterline', 0.1, 0.3),
  });
}

