// Utilities to convert different data formats to Scene3D

import { Scene3D, TextureConfig, Point, DepthPoint, HardscapePoint } from './types';
import { generateCurvedPoolPoints } from '@/utils/curveUtils';

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
  console.log('🎨 getFinishTextureUrl called with:', { finishName, type: typeof finishName });
  
  if (!finishName || finishName === 'None' || finishName === '' || finishName === 'undefined') {
    console.log('   → Returning fallback (invalid input)');
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
  
  const result = finishMap[finishName] || '/textures/finishes/sapphire-blue-g3.jpg';
  console.log('   → Returning:', result);
  return result;
};

// Map paver names to texture URLs
export const getPaverTextureUrl = (paverName?: string, paverTypes?: any[]): string => {
  console.log('🧱 getPaverTextureUrl called with:', { 
    paverName, 
    type: typeof paverName, 
    paverTypesLength: paverTypes?.length 
  });
  
  if (!paverName || paverName === 'None' || paverName === 'No Pavers' || paverName === '' || paverName === 'undefined') {
    console.log('   → Returning fallback (invalid input)');
    return '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
  }
  
  const paver = paverTypes?.find(p => p.name === paverName);
  const result = paver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
  console.log('   → Found paver:', paver?.name, '→ Returning:', result);
  return result;
};

// Convert product configurator data to Scene3D
export function productToScene(
  product: any, 
  selectedExtras: any, 
  paverTypes: any[], 
  finishOptions: any[]
): Scene3D {
  console.log('🔄 SceneConverter: productToScene called', {
    product,
    selectedExtras,
    paverTypesCount: paverTypes.length,
    finishOptionsCount: finishOptions.length
  });
  
  console.log('🔄 SceneConverter: productToScene called', {
    product: product?.model || product?.name,
    extras: selectedExtras,
    paverTypesCount: paverTypes?.length || 0,
    finishOptionsCount: finishOptions?.length || 0
  });

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
  
  console.log('🔍 SceneConverter: DETAILED Texture Resolution', {
    inputs: {
      finish: selectedExtras.finish,
      finishType: typeof selectedExtras.finish,
      linerOption: selectedExtras.linerOption,
      linerOptionType: typeof selectedExtras.linerOption,
      paverOption: selectedExtras.paverOption,
      paverOptionType: typeof selectedExtras.paverOption,
      copingPaverOption: selectedExtras.copingPaverOption,
      copingPaverOptionType: typeof selectedExtras.copingPaverOption,
      paverTypesArray: paverTypes,
      paverTypesLength: paverTypes?.length
    },
    outputs: {
      linerTextureUrl,
      linerIsValid: linerTextureUrl && linerTextureUrl !== '' && linerTextureUrl !== 'undefined',
      paverTextureUrl,
      paverIsValid: paverTextureUrl && paverTextureUrl !== '' && paverTextureUrl !== 'undefined',
      copingTextureUrl,
      copingIsValid: copingTextureUrl && copingTextureUrl !== '' && copingTextureUrl !== 'undefined'
    }
  });

  console.log('🔍 SceneConverter: Texture URL resolution', {
    selectedExtras: {
      finish: selectedExtras.finish,
      paverOption: selectedExtras.paverOption,
      copingPaverOption: selectedExtras.copingPaverOption
    },
    resolvedUrls: {
      liner: linerTextureUrl,
      paver: paverTextureUrl,
      coping: copingTextureUrl
    },
    issues: {
      linerInvalid: !linerTextureUrl || linerTextureUrl === '' || linerTextureUrl === 'undefined',
      paverInvalid: !paverTextureUrl || paverTextureUrl === '' || paverTextureUrl === 'undefined',
      copingInvalid: !copingTextureUrl || copingTextureUrl === '' || copingTextureUrl === 'undefined'
    }
  });

  // Create pool shape points - use custom shape if provided, otherwise default rectangle
  let poolPoints: Point[];
  
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
    
    console.log('🎨 Using custom pool shape from 2D editor:', {
      originalPoints: selectedExtras.customPoolShape.length,
      convertedPoints: poolPoints.length,
      scale: scale,
      pixelsToFeet: pixelsToFeet,
      sampleConversion: {
        firstPoint: selectedExtras.customPoolShape[0],
        convertedPoint: poolPoints[0]
      }
    });
  } else {
    // Create basic pool shape points (rectangle)
    poolPoints = [
      { x: 0, y: 0, id: 'p1' },
      { x: width, y: 0, id: 'p2' },
      { x: width, y: length, id: 'p3' },
      { x: 0, y: length, id: 'p4' },
    ];
  }

  // Parse shallow end depth from product depth string OR use depthProfile from selectedExtras
  let depthPoints: DepthPoint[];
  
  if (selectedExtras.depthProfile && Array.isArray(selectedExtras.depthProfile) && selectedExtras.depthProfile.length > 0) {
    // Use depth profile from 2D designer
    depthPoints = selectedExtras.depthProfile;
    console.log('🎨 Using custom depth profile from 2D designer:', depthPoints);
  } else {
    // Use parsed shallow and deep depths from product specification
    const shallowDepth = shallowEndDepth;
    const deepDepth = deepEndDepth;
    
    console.log('🎨 Using product depth range:', { shallowDepth, deepDepth, productDepth: product.depth });
    
    depthPoints = [
      { position: 0, depth: shallowDepth, id: 'd1' },                    // Shallow end
      { position: 0.25, depth: shallowDepth + (deepDepth - shallowDepth) * 0.25, id: 'd2' },
      { position: 0.5, depth: shallowDepth + (deepDepth - shallowDepth) * 0.5, id: 'd3' },
      { position: 0.75, depth: shallowDepth + (deepDepth - shallowDepth) * 0.75, id: 'd4' },
      { position: 1, depth: deepDepth, id: 'd5' },                        // Deep end
    ];
  }

  // Create deck points - 3ft wide deck as requested
  const deckWidth = 3;
  const copingWidth = 1; // 1ft coping
  
  // Step 1: Generate smooth curved pool boundary
  // ONLY curves very gentle bends (< 20°), keeps 90° corners and all sharp angles linear
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
  
  // Step 3: Apply smooth spline curve to the deck outline (just like pool walls)
  const smoothDeckPoints = rawDeckPoints.length > 3
    ? generateCurvedPoolPoints(
        rawDeckPoints,
        30,  // same high resolution
        0.3  // same natural curve tension
      )
    : rawDeckPoints;
  
  // Step 4: Convert to HardscapePoint format with IDs
  const deckPoints: HardscapePoint[] = smoothDeckPoints.map((pt, i) => ({
    x: pt.x,
    y: pt.y,
    id: `h${i + 1}`
  }));

  // Calculate pool depth from product (use deepEndDepth which was parsed earlier)
  const poolDepth = deepEndDepth || 6.6;
  
  // Create perimeter depth points to initialize pool bottom with correct depth
  const perimeterDepthPoints = poolPoints.map((pt, i) => ({
    x: pt.x - width / 2,  // Center the coordinates
    z: pt.y - length / 2,
    depth: poolDepth,  // Use the parsed pool depth
    id: `perimeter-depth-${i}`,
    type: 'smooth' as const
  }));
  
  console.log('🔵 SceneConverter: Creating perimeterDepthPoints with depth:', poolDepth, {
    pointCount: perimeterDepthPoints.length,
    productDepthString: product.depth,
    parsedDepth: deepEndDepth
  });

  const scene: Scene3D = {
    pool: {
      points: poolPoints,
      depthPoints: depthPoints,
      perimeterDepthPoints: perimeterDepthPoints,  // Initialize with correct depth
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
      dimensions: { length, width, depth: poolDepth }
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
        url: '/lovable-uploads/37536046-70f5-46b8-8422-84097ccdec08.png', // Ballad glass tile as default
        name: 'Ballad',
        roughness: 0.1,
        metalness: 0.3,
        scale: 1.8,
        offset: [0, 0]
      }
    },
    features: [],
    stairs: [],
    annotations: [],
    camera: {
      position: [length * 0.8, length * 0.6, width * 0.8],
      target: [width / 2, 0, length / 2]
    }
  };
  
  console.log('✅ SceneConverter: Scene created with textures:', {
    poolFinishUrl: scene.pool.finish.url,
    deckPaverUrl: scene.deck.paver.url,
    copingUrl: scene.deck.coping.url,
    waterlineUrl: scene.deck.waterline.url,
    allValid: [
      scene.pool.finish.url,
      scene.deck.paver.url,
      scene.deck.coping.url,
      scene.deck.waterline.url
    ].every(url => url && url !== '' && url !== 'undefined')
  });
  
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
