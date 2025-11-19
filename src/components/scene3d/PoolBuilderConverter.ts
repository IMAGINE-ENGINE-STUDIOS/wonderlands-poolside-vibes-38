import { Scene3D, TextureLibrary, TextureConfig, PoolFeature as Scene3DPoolFeature } from './types';

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
  const xCoords = points.map(p => p.x * scale);
  const yCoords = points.map(p => p.y * scale);
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
          feature.x * scale,
          0,
          feature.y * scale
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
        url: '/src/assets/pool-texture-sapphire.jpg',
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
        url: paverTypes[0]?.image || '/src/assets/finishes/shale-gray-g3.jpg',
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
        url: paverTypes[0]?.image || '/src/assets/finishes/shale-gray-g3.jpg',
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
        url: '/src/assets/finishes/sapphire-blue-g3.jpg',
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
 * Builds texture library from PoolBuilder's available textures
 */
export function buildTextureLibrary(
  customTextures: CustomTexture[],
  paverTypes: any[],
  finishOptions: any[] = []
): TextureLibrary {
  // Extract finishes (premium pool liners for both pool and waterline)
  const finishes: TextureConfig[] = [
    ...customTextures
      .filter(t => t.target === 'pool' || t.target === 'water')
      .map(t => ({
        url: t.url,
        name: t.name || 'Custom Finish',
        repeat: t.repeatX && t.repeatY 
          ? [t.repeatX, t.repeatY] as [number, number]
          : undefined,
        roughness: 0.2,
        metalness: 0.1
      })),
    ...finishOptions.map(f => ({
      url: f.image || f.url,
      name: f.name,
      roughness: 0.2,
      metalness: 0.1
    }))
  ];

  // Premium liners for pool finish and waterline
  const premiumLiners = [
    { url: '/src/assets/finishes/sapphire-blue-g3.jpg', name: 'Sapphire Blue G3' },
    { url: '/src/assets/finishes/aquamarine-g3.jpg', name: 'Aquamarine G3' },
    { url: '/src/assets/finishes/ocean-blue-g3.jpg', name: 'Ocean Blue G3' },
    { url: '/src/assets/finishes/coastal-bronze-g3.jpg', name: 'Coastal Bronze G3' },
    { url: '/src/assets/finishes/athens-pearl-white-g3.jpg', name: 'Athens Pearl White G3' },
    { url: '/src/assets/finishes/night-sky-g3.jpg', name: 'Night Sky G3' },
    { url: '/src/assets/finishes/shale-gray-g3.jpg', name: 'Shale Gray G3' },
    { url: '/src/assets/finishes/azure-blue-g2.jpg', name: 'Azure Blue G2' },
    { url: '/src/assets/finishes/lagoon-blue-g2.jpg', name: 'Lagoon Blue G2' }
  ];

  // Pool tiles for waterline borders (Mountain, Carnegie, Panama from poolTilesData)
  const poolTiles = [
    { url: '/lovable-uploads/c16269fd-9db6-4791-8cef-9aaf0f5e972a.png', name: 'Mountain Tile' },
    { url: '/lovable-uploads/5bfe3308-05a6-4d01-9f62-014d86ea281c.png', name: 'Carnegie Tile' },
    { url: '/lovable-uploads/c6bebb1e-d2ed-4591-b81d-0af558ed3e52.png', name: 'Panama Tile' }
  ];
  
  // Combine all finishes: premium liners + pool tiles for waterline options
  finishes.push(...premiumLiners.map(liner => ({
    url: liner.url,
    name: liner.name,
    roughness: 0.2,
    metalness: 0.1
  })));
  
  finishes.push(...poolTiles.map(tile => ({
    url: tile.url,
    name: tile.name,
    roughness: 0.1,
    metalness: 0.3
  })));

  // Extract pavers
  const pavers: TextureConfig[] = [
    ...customTextures
      .filter(t => t.target === 'deck')
      .map(t => ({
        url: t.url,
        name: t.name || 'Custom Paver',
        repeat: t.repeatX && t.repeatY 
          ? [t.repeatX, t.repeatY] as [number, number]
          : undefined,
        roughness: 0.8,
        metalness: 0.0
      })),
    ...paverTypes.map(p => ({
      url: p.image,
      name: p.name,
      roughness: 0.8,
      metalness: 0.0
    }))
  ];

  // Extract coping
  const coping: TextureConfig[] = [
    ...customTextures
      .filter(t => t.target === 'coping')
      .map(t => ({
        url: t.url,
        name: t.name || 'Custom Coping',
        repeat: t.repeatX && t.repeatY 
          ? [t.repeatX, t.repeatY] as [number, number]
          : undefined,
        roughness: 0.6,
        metalness: 0.0
      })),
    ...paverTypes.map(p => ({
      url: p.image,
      name: p.name,
      roughness: 0.6,
      metalness: 0.0
    }))
  ];

  return {
    finishes,
    pavers,
    coping
  };
}
