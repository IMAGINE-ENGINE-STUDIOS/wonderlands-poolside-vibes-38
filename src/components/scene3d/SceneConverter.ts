// Utilities to convert different data formats to Scene3D

import { Scene3D, TextureConfig, Point, DepthPoint, HardscapePoint, AdditionalPool, PoolFeature, PoolStair, FeatureType, StairShape } from './types';
import { generateCurvedPoolPoints } from '@/utils/curveUtils';
import { poolModelShapes, getPoolModelShape } from '@/data/poolModelShapes';

// Parse dimensions from string like "14' x 28'" or "16 feet x 32 feet" or "16' × 40'"
export const parseDimensions = (dimensionsStr?: string): { length: number; width: number } => {
  if (!dimensionsStr) return { length: 30, width: 15 };
  
  // Handle various formats: "14' x 28'", "15.5' × 31'", "16 feet x 32 feet"
  const matches = dimensionsStr.match(/(\d+\.?\d*)\s*(?:'|ft|feet)?\s*[x×]\s*(\d+\.?\d*)/i);
  if (matches) {
    return {
      width: parseFloat(matches[1]),
      length: parseFloat(matches[2])
    };
  }
  
  return { length: 30, width: 15 };
};

// Parse depth from string like "4' - 6'" or "3'9\" - 8'6\"" or "4-6 feet"
// Returns { min: shallow depth, max: deep depth }
export const parseDepthRange = (depthStr?: string): { min: number; max: number } => {
  if (!depthStr) return { min: 3.75, max: 6 };
  
  // Handle formats like "3'9\" - 8'6\"" or "4' - 6'"
  const rangeMatches = depthStr.match(/(\d+)[''](\d+)?[""]?\s*[-–]\s*(\d+)[''](\d+)?[""]?/);
  if (rangeMatches) {
    // Extract shallow end: feet and inches
    const shallowFeet = parseInt(rangeMatches[1]);
    const shallowInches = rangeMatches[2] ? parseInt(rangeMatches[2]) : 0;
    const shallowDepth = shallowFeet + (shallowInches / 12);
    
    // Extract deep end: feet and inches
    const deepFeet = parseInt(rangeMatches[3]);
    const deepInches = rangeMatches[4] ? parseInt(rangeMatches[4]) : 0;
    const deepDepth = deepFeet + (deepInches / 12);
    
    return { min: shallowDepth, max: deepDepth };
  }
  
  // Handle simple range like "4-6"
  const simpleRange = depthStr.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (simpleRange) {
    return { 
      min: parseInt(simpleRange[1]), 
      max: parseInt(simpleRange[2]) 
    };
  }
  
  // Handle single value
  const singleMatch = depthStr.match(/(\d+)['']?(\d+)?/);
  if (singleMatch) {
    const feet = parseInt(singleMatch[1]);
    const inches = singleMatch[2] ? parseInt(singleMatch[2]) : 0;
    const depth = feet + (inches / 12);
    return { min: depth, max: depth };
  }
  
  return { min: 3.75, max: 6 };
};

// Parse depth from string - returns max depth for backward compatibility
export const parseDepth = (depthStr?: string): number => {
  return parseDepthRange(depthStr).max;
};

// Map finish names to texture URLs
export const getFinishTextureUrl = (finishName?: string): string => {
  if (!finishName || finishName === 'None' || finishName === '' || finishName === 'undefined') {
    return '/textures/finishes/sapphire-blue-g3.jpg';
  }
  
  const finishMap: Record<string, string> = {
    'Aquamarine': '/textures/finishes/aquamarine-g3.jpg',
    'Ocean Blue': '/textures/finishes/ocean-blue-g3.jpg',
    'Sapphire Blue': '/textures/finishes/sapphire-blue-g3.jpg',
    'Night Sky': '/textures/finishes/night-sky-g3.jpg',
    'Athens Pearl White': '/textures/finishes/athens-pearl-white-g3.jpg',
    'Lagoon Blue': '/textures/finishes/lagoon-blue-g2.jpg',
    'Azure Blue': '/textures/finishes/azure-blue-g2.jpg',
    'Coastal Bronze': '/textures/finishes/coastal-bronze-g3.jpg',
    'Shale Gray': '/textures/finishes/shale-gray-g3.jpg',
  };
  
  return finishMap[finishName] || '/textures/finishes/sapphire-blue-g3.jpg';
};

// Map paver names to texture URLs
export const getPaverTextureUrl = (paverName?: string, paverTypes?: any[]): string => {
  if (!paverName || paverName === 'None' || paverName === 'Concrete Patio' || paverName === '' || paverName === 'undefined') {
    return '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.webp';
  }
  
  const paver = paverTypes?.find(p => p.name === paverName);
  return paver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.webp';
};

// Convert product configurator data to Scene3D
export function productToScene(
  product: any, 
  selectedExtras: any, 
  paverTypes: any[], 
  finishOptions: any[]
): Scene3D {
  // Parse dimensions from product data (e.g., "16' × 40'")
  const { length, width } = parseDimensions(product.dimensions);
  
  // Parse depth range from product data (e.g., "3'9\" - 8'6\"") - get both min and max
  const { min: shallowEndDepth, max: deepEndDepth } = parseDepthRange(product.depth);

  // Get texture URLs
  const linerTextureUrl = selectedExtras.finish 
    ? getFinishTextureUrl(selectedExtras.finish)
    : selectedExtras.linerOption 
      ? getFinishTextureUrl(selectedExtras.linerOption)
      : '/textures/finishes/sapphire-blue-g3.jpg';
      
  const paverTextureUrl = getPaverTextureUrl(selectedExtras.paverOption, paverTypes);
  const copingTextureUrl = getPaverTextureUrl(selectedExtras.copingPaverOption, paverTypes);

  // Create pool shape points - priority order:
  // 1. Custom shape from 2D editor
  // 2. Predefined model shape from library
  // 3. Fallback to rectangle
  let poolPoints: Point[];
  let modelShape: ReturnType<typeof getPoolModelShape> | undefined;
  
  if (selectedExtras.customPoolShape && Array.isArray(selectedExtras.customPoolShape) && selectedExtras.customPoolShape.length >= 3) {
    // Convert 2D editor points to 3D pool points
    // CRITICAL FIX: Use the actual scale from PoolBuilder (10 pixels per foot)
    // Or extract from poolBuilderData if available
    const scale = selectedExtras.poolBuilderData?.scale || 10; // PoolBuilder uses 10 pixels per foot
    const pixelsToFeet = 1 / scale; // Convert pixels to feet
    
    poolPoints = selectedExtras.customPoolShape.map((pt: any, idx: number) => ({
      x: pt.x * pixelsToFeet,
      y: pt.y * pixelsToFeet,
      id: `p${idx + 1}`
    }));
    
  } else {
    // Check for predefined model shape in library
    const modelName = product?.model || product?.name;
    modelShape = modelName ? getPoolModelShape(modelName) : undefined;
    
    if (modelShape) {
      // Use predefined shape from library, scaled to actual dimensions
      // The shape library stores points in their natural dimensions
      // We scale them to match the product's actual dimensions
      const shapeWidth = Math.max(...modelShape.points.map(p => p.x));
      const shapeLength = Math.max(...modelShape.points.map(p => p.y));
      
      const scaleX = width / shapeWidth;
      const scaleY = length / shapeLength;
      
      poolPoints = modelShape.points.map((pt, idx) => ({
        x: pt.x * scaleX,
        y: pt.y * scaleY,
        id: `p${idx + 1}`
      }));
      
    } else {
      // Fallback: Create basic pool shape points (rectangle)
      poolPoints = [
        { x: 0, y: 0, id: 'p1' },
        { x: width, y: 0, id: 'p2' },
        { x: width, y: length, id: 'p3' },
        { x: 0, y: length, id: 'p4' },
      ];
      
    }
  }

  // Parse shallow end depth from product depth string OR use depthProfile from selectedExtras
  let depthPoints: DepthPoint[];
  
  if (selectedExtras.depthProfile && Array.isArray(selectedExtras.depthProfile) && selectedExtras.depthProfile.length > 0) {
    // Use depth profile from 2D designer
    depthPoints = selectedExtras.depthProfile;
  } else if (modelShape?.depthAnchors && modelShape.depthAnchors.length >= 2) {
    // Use model-specific depth anchors scaled to product depth range
    const modelAnchors = modelShape.depthAnchors;
    const modelMinDepth = Math.min(...modelAnchors.map(a => a.depth));
    const modelMaxDepth = Math.max(...modelAnchors.map(a => a.depth));
    const modelDepthRange = modelMaxDepth - modelMinDepth || 1;
    
    depthPoints = modelAnchors.map((anchor, idx) => {
      const normalizedDepth = (anchor.depth - modelMinDepth) / modelDepthRange;
      const scaledDepth = shallowEndDepth + normalizedDepth * (deepEndDepth - shallowEndDepth);
      
      return {
        position: anchor.position,
        depth: scaledDepth,
        id: `d${idx + 1}`
      };
    });
    
  } else {
    depthPoints = [
      { position: 0, depth: shallowEndDepth, id: 'd1' },
      { position: 0.25, depth: shallowEndDepth + (deepEndDepth - shallowEndDepth) * 0.25, id: 'd2' },
      { position: 0.5, depth: shallowEndDepth + (deepEndDepth - shallowEndDepth) * 0.5, id: 'd3' },
      { position: 0.75, depth: shallowEndDepth + (deepEndDepth - shallowEndDepth) * 0.75, id: 'd4' },
      { position: 1, depth: deepEndDepth, id: 'd5' },
    ];
  }

  // Create deck points - use from 2D designer if available, otherwise calculate
  const deckWidth = 3;
  const copingWidth = 1; // 1ft coping
  
  let deckPoints: HardscapePoint[];
  
  // CRITICAL: Use hardscape points from 2D designer if available
  if (selectedExtras.poolBuilderData?.hardscapePoints && 
      Array.isArray(selectedExtras.poolBuilderData.hardscapePoints) && 
      selectedExtras.poolBuilderData.hardscapePoints.length >= 3) {
    
    // Convert 2D editor hardscape points to 3D deck points
    const scale = selectedExtras.poolBuilderData?.scale || 10;
    const pixelsToFeet = 1 / scale;
    
    deckPoints = selectedExtras.poolBuilderData.hardscapePoints.map((pt: any, idx: number) => ({
      x: pt.x * pixelsToFeet,
      y: pt.y * pixelsToFeet,
      id: pt.id || `h${idx + 1}`
    }));
    
  } else {
    // Generate deck points automatically from pool shape
    // Step 1: Generate smooth curved pool boundary
    const smoothPoolPoints = poolPoints.length > 3 
      ? generateCurvedPoolPoints(
          poolPoints.map(p => ({ x: p.x, y: p.y })),
          30,  // high resolution for smooth curves
          0.3  // natural curve tension
        )
      : poolPoints.map(p => ({ x: p.x, y: p.y }));
    
    // Step 2: Create offset deck outline by calculating outward normals
    const rawDeckPoints = smoothPoolPoints.map((pt, i) => {
      const prevPt = smoothPoolPoints[(i - 1 + smoothPoolPoints.length) % smoothPoolPoints.length];
      const nextPt = smoothPoolPoints[(i + 1) % smoothPoolPoints.length];
      
      // Calculate edge vectors
      const v1x = pt.x - prevPt.x;
      const v1y = pt.y - prevPt.y;
      const v2x = nextPt.x - pt.x;
      const v2y = nextPt.y - pt.y;
      
      // Calculate normals (perpendicular to edges, pointing outward)
      const n1x = -v1y;
      const n1y = v1x;
      const n2x = -v2y;
      const n2y = v2x;
      
      // Normalize the normals
      const len1 = Math.sqrt(n1x * n1x + n1y * n1y);
      const len2 = Math.sqrt(n2x * n2x + n2y * n2y);
      
      const norm1x = len1 > 0 ? n1x / len1 : 0;
      const norm1y = len1 > 0 ? n1y / len1 : 0;
      const norm2x = len2 > 0 ? n2x / len2 : 0;
      const norm2y = len2 > 0 ? n2y / len2 : 0;
      
      // Average the two normals to get the offset direction
      const avgNx = (norm1x + norm2x) / 2;
      const avgNy = (norm1y + norm2y) / 2;
      const avgLen = Math.sqrt(avgNx * avgNx + avgNy * avgNy);
      
      const finalNx = avgLen > 0 ? avgNx / avgLen : 0;
      const finalNy = avgLen > 0 ? avgNy / avgLen : 0;
      
      // Offset the point by deckWidth in the outward normal direction
      return {
        x: pt.x + finalNx * deckWidth,
        y: pt.y + finalNy * deckWidth
      };
    });
    
    // Step 3: Apply smooth spline curve to the deck outline
    const smoothDeckPoints = rawDeckPoints.length > 3
      ? generateCurvedPoolPoints(
          rawDeckPoints,
          30,
          0.3
        )
      : rawDeckPoints;
    
    // Step 4: Convert to HardscapePoint format with IDs
    deckPoints = smoothDeckPoints.map((pt, i) => ({
      x: pt.x,
      y: pt.y,
      id: `h${i + 1}`
    }));
    
  }

  // Calculate pool depths from product (shallow and deep end)
  const shallowDepth = shallowEndDepth || 3.75;
  const deepDepth = deepEndDepth || 6.6;
  
  // Determine depth direction: along LONGEST side (length axis)
  // Pool goes shallow -> deep along the length (longest dimension)
  const isLengthLonger = length > width;
  
  // Create perimeter depth points with gradient along LONGEST side
  const perimeterDepthPoints = poolPoints.map((pt, i, arr) => {
    // Calculate depth based on position along shortest axis
    let depthRatio: number;
    
    if (isLengthLonger) {
      // Depth gradient along Y axis (length - the longer side)
      depthRatio = pt.y / length;
    } else {
      // Depth gradient along X axis (width - the longer side)
      depthRatio = pt.x / width;
    }
    
    // Clamp ratio and calculate depth linearly from shallow to deep
    depthRatio = Math.max(0, Math.min(1, depthRatio));
    const depth = shallowDepth + (deepDepth - shallowDepth) * depthRatio;
    
    return {
      x: pt.x - width / 2,  // Center the coordinates
      z: pt.y - length / 2,
      depth: depth,
      id: `perimeter-depth-${i}`,
      type: 'smooth' as const
    };
  });
  

  // Create linear depth anchors - use model-specific anchors if available
  let linearDepthAnchors: Array<{ id: string; position: number; depth: number }>;
  
  if (modelShape?.depthAnchors && modelShape.depthAnchors.length >= 2) {
    // Use model-specific depth anchors, scaled to product's actual depth range
    const modelAnchors = modelShape.depthAnchors;
    const modelMinDepth = Math.min(...modelAnchors.map(a => a.depth));
    const modelMaxDepth = Math.max(...modelAnchors.map(a => a.depth));
    const modelDepthRange = modelMaxDepth - modelMinDepth || 1;
    
    linearDepthAnchors = modelAnchors.map((anchor, idx) => {
      // Normalize the model depth to 0-1 range, then scale to actual product depth
      const normalizedDepth = (anchor.depth - modelMinDepth) / modelDepthRange;
      const scaledDepth = shallowDepth + normalizedDepth * (deepDepth - shallowDepth);
      
      return {
        id: `anchor-${idx}`,
        position: anchor.position,
        depth: scaledDepth
      };
    });
    
  } else {
    // Fallback: simple linear shallow-to-deep profile
    linearDepthAnchors = [
      { id: 'anchor-0', position: 0, depth: shallowDepth },
      { id: 'anchor-33', position: 0.33, depth: shallowDepth + (deepDepth - shallowDepth) * 0.33 },
      { id: 'anchor-67', position: 0.67, depth: shallowDepth + (deepDepth - shallowDepth) * 0.67 },
      { id: 'anchor-100', position: 1, depth: deepDepth },
    ];
  }

  // Convert additionalPools from 2D to 3D format
  let additionalPools3D: AdditionalPool[] = [];
  if (selectedExtras.additionalPools && Array.isArray(selectedExtras.additionalPools)) {
    const scale = selectedExtras.poolBuilderData?.scale || 10;
    const pixelsToFeet = 1 / scale;
    
    additionalPools3D = selectedExtras.additionalPools.map((pool: any) => ({
      id: pool.id,
      type: pool.type,
      points: pool.points.map((pt: any, idx: number) => ({
        x: pt.x * pixelsToFeet,
        y: pt.y * pixelsToFeet,
        id: `${pool.id}-p${idx + 1}`
      })),
      shape: pool.shape || 'freeform',
      featureType: pool.featureType,
      isMerged: pool.isMerged ?? (pool.featureType === 'spillover-spa' || pool.featureType === 'tanning-ledge'),
      spilloverEdges: pool.spilloverEdges || [],
      depth: pool.featureType === 'tanning-ledge' ? 1 : (pool.featureType === 'spillover-spa' ? 3.5 : deepEndDepth),
      finish: {
        url: linerTextureUrl,
        name: selectedExtras.finish || 'Default',
        roughness: 0.2,
        metalness: 0.1
      }
    }));
  }

  // Convert 2D PoolBuilder features (jets, lights, stairs, landscape) to 3D format
  let features3D: PoolFeature[] = [];
  let stairs3D: PoolStair[] = [];
  
  const poolBuilderFeatures = selectedExtras.poolBuilderData?.features || [];
  
  if (Array.isArray(poolBuilderFeatures) && poolBuilderFeatures.length > 0) {
    const scale = selectedExtras.poolBuilderData?.scale || 10;
    const pixelsToFeet = 1 / scale;
    
    poolBuilderFeatures.forEach((f: any) => {
      const xFeet = f.x * pixelsToFeet;
      const yFeet = f.y * pixelsToFeet;
      
      if (f.type === 'stairs') {
        stairs3D.push({
          id: f.id,
          position: [xFeet, 0, yFeet],
          rotation: f.angle || 0,
          shape: 'rectangle' as StairShape,
          width: (f.width || 4 * scale) * pixelsToFeet,
          numSteps: f.steps || 3,
          stepHeight: 0.35,
          stepDepth: 0.9,
        });
      } else if (['light', 'jet', 'fountain', 'heater'].includes(f.type)) {
        features3D.push({
          id: f.id,
          type: f.type as FeatureType,
          position: [xFeet, 0, yFeet],
          rotation: [0, f.angle || 0, 0],
          scale: [1, 1, 1],
          metadata: { name: f.type, confirmed: true }
        });
      } else if (['tree', 'shrub', 'umbrella'].includes(f.type)) {
        features3D.push({
          id: f.id,
          type: f.type as FeatureType,
          position: [xFeet, 0, yFeet],
          rotation: [0, f.angle || 0, 0],
          scale: [1, 1, 1],
          metadata: { name: f.type }
        });
      }
    });
  }

  const scene: Scene3D = {
    pool: {
      points: poolPoints,
      depthPoints: depthPoints,
      perimeterDepthPoints: perimeterDepthPoints,  // Keep for backwards compatibility
      linearDepthAnchors: linearDepthAnchors,      // New linear depth profile
      shape: 'rectangle',
      finish: {
        url: linerTextureUrl,
        name: selectedExtras.finish || selectedExtras.linerOption || 'Default',
        scale: 1.8,
        offset: [0, 0],
        roughness: 0.2,
        metalness: 0.1
      },
      position: [-10, 0, 20], // Pool hole at S25 grid position
      rotation: [0, 0, 0],
      dimensions: { length, width, depth: deepDepth }
    },
    deck: {
      points: deckPoints,
      paver: {
        url: paverTextureUrl,
        name: selectedExtras.paverOption || 'Default Paver',
        roughness: 0.8,
        metalness: 0.0,
        scale: 1.8,
        offset: [0, 0]
      },
      coping: {
        url: copingTextureUrl,
        name: selectedExtras.copingPaverOption || 'Default Coping',
        roughness: 0.6,
        metalness: 0.0,
        scale: 1.8,
        offset: [-0.21, 0]
      },
      copingWidth: copingWidth,
      waterline: {
        url: '/lovable-uploads/37536046-70f5-46b8-8422-84097ccdec08.webp', // Ballad glass tile as default
        name: 'Ballad',
        roughness: 0.1,
        metalness: 0.3,
        scale: 1.8,
        offset: [0, 0]
      }
    },
    additionalPools: additionalPools3D,
    features: features3D,
    stairs: stairs3D,
    annotations: [],
    camera: {
      position: [length * 0.8, length * 0.6, width * 0.8],
      target: [width / 2, 0, length / 2]
    }
  };
  

  return scene;
}

// Export scene to JSON
export function exportScene(scene: Scene3D): string {
  return JSON.stringify(scene, null, 2);
}

// Import scene from JSON
export function importScene(json: string): Scene3D | null {
  try {
    return JSON.parse(json) as Scene3D;
  } catch (error) {
    console.error('Failed to import scene:', error);
    return null;
  }
}

/**
 * Reverse converter: Scene3D → PoolBuilder data format
 * Converts 3D feet-based coordinates back to 2D pixel coordinates
 */
export function scene3DToPoolBuilder(
  scene: Scene3D,
  scale: number = 10, // pixels per foot (PoolBuilder default)
  canvasCenter: { x: number; y: number } = { x: 2000, y: 2000 }
): {
  points: Array<{ x: number; y: number; id: string }>;
  depthPoints: Array<{ position: number; depth: number; id: string }>;
  hardscapePoints: Array<{ x: number; y: number; id: string }>;
  features: Array<{ type: string; x: number; y: number; id: string; angle?: number; steps?: number; width?: number }>;
  additionalPools: any[];
} {
  // Convert pool points from feet to pixels
  // Scene3D points are in feet; PoolBuilder stores absolute pixel positions
  const points = scene.pool.points.map((pt, idx) => ({
    x: pt.x * scale,
    y: pt.y * scale,
    id: pt.id || `p${idx + 1}`
  }));

  // Depth points are format-compatible (position 0-1, depth in feet)
  const depthPoints = scene.pool.depthPoints.map((dp, idx) => ({
    position: dp.position,
    depth: dp.depth,
    id: dp.id || `d${idx + 1}`
  }));

  // Convert deck/hardscape points from feet to pixels
  const hardscapePoints = (scene.deck.points || []).map((hp, idx) => ({
    x: hp.x * scale,
    y: hp.y * scale,
    id: hp.id || `h${idx + 1}`
  }));

  // Convert features from 3D position format to 2D format
  const features = scene.features.map(f => ({
    type: f.type as string,
    x: f.position[0] * scale,
    y: f.position[2] * scale, // 3D z → 2D y
    id: f.id,
    angle: f.rotation?.[1],
    steps: f.metadata?.name ? undefined : undefined,
    width: f.scale?.[0]
  }));

  // Convert additional pools
  const additionalPools = (scene.additionalPools || []).map(pool => ({
    id: pool.id,
    type: pool.type,
    points: pool.points.map((pt, idx) => ({
      x: pt.x * scale,
      y: pt.y * scale,
      id: pt.id || `${pool.id}-p${idx + 1}`
    })),
    shape: pool.shape,
    featureType: pool.featureType,
    isMerged: pool.isMerged,
    spilloverEdges: pool.spilloverEdges
  }));

  return { points, depthPoints, hardscapePoints, features, additionalPools };
}
