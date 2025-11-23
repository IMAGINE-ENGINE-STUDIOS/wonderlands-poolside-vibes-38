// Utilities to convert different data formats to Scene3D

import { Scene3D, TextureConfig, Point, DepthPoint, HardscapePoint } from './types';

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
export const parseDepth = (depthStr?: string): number => {
  if (!depthStr) return 6;
  
  // Handle formats like "3'9\" - 8'6\"" or "4' - 6'"
  const rangeMatches = depthStr.match(/(\d+)[''](\d+)?[""]?\s*[-–]\s*(\d+)[''](\d+)?[""]?/);
  if (rangeMatches) {
    // Extract deep end: feet and inches
    const deepFeet = parseInt(rangeMatches[3]);
    const deepInches = rangeMatches[4] ? parseInt(rangeMatches[4]) : 0;
    return deepFeet + (deepInches / 12); // Convert to decimal feet
  }
  
  // Handle simple range like "4-6"
  const simpleRange = depthStr.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (simpleRange) {
    return parseInt(simpleRange[2]); // Use deeper end
  }
  
  // Handle single value
  const singleMatch = depthStr.match(/(\d+)['']?(\d+)?/);
  if (singleMatch) {
    const feet = parseInt(singleMatch[1]);
    const inches = singleMatch[2] ? parseInt(singleMatch[2]) : 0;
    return feet + (inches / 12);
  }
  
  return 6;
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
  
  // Parse depth from product data (e.g., "3'9\" - 8'6\"")
  const deepEndDepth = parseDepth(product.depth);

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
    // Scale from pixels to feet (assuming 800px canvas = ~40 feet width)
    const canvasToFeet = 40 / 800;
    
    poolPoints = selectedExtras.customPoolShape.map((pt: any, idx: number) => ({
      x: pt.x * canvasToFeet,
      y: pt.y * canvasToFeet,
      id: `p${idx + 1}`
    }));
    
    console.log('🎨 Using custom pool shape from 2D editor:', {
      originalPoints: selectedExtras.customPoolShape.length,
      convertedPoints: poolPoints.length,
      scale: canvasToFeet
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

  // Parse shallow end depth from product depth string
  // Extract shallow end from depth range like "3'9\" - 8'6\""
  let shallowDepth = 3.75; // Default 3'9"
  if (product.depth) {
    const shallowMatches = product.depth.match(/(\d+)[''](\d+)?[""]?\s*[-–]/);
    if (shallowMatches) {
      const shallowFeet = parseInt(shallowMatches[1]);
      const shallowInches = shallowMatches[2] ? parseInt(shallowMatches[2]) : 0;
      shallowDepth = shallowFeet + (shallowInches / 12);
    }
  }
  
  const deepDepth = deepEndDepth || 6.6;  // Use parsed product depth or fallback
  
  const depthPoints: DepthPoint[] = [
    { position: 0, depth: shallowDepth, id: 'd1' },                    // Shallow end
    { position: 0.25, depth: shallowDepth + (deepDepth - shallowDepth) * 0.25, id: 'd2' },
    { position: 0.5, depth: shallowDepth + (deepDepth - shallowDepth) * 0.5, id: 'd3' },
    { position: 0.75, depth: shallowDepth + (deepDepth - shallowDepth) * 0.75, id: 'd4' },
    { position: 1, depth: deepDepth, id: 'd5' },                        // Deep end
  ];

  // Create deck points (5 feet wider on all sides) - adapt to custom shape
  const deckWidth = 5;
  
  // Calculate bounds of pool shape
  const poolXs = poolPoints.map(p => p.x);
  const poolYs = poolPoints.map(p => p.y);
  const minPoolX = Math.min(...poolXs);
  const maxPoolX = Math.max(...poolXs);
  const minPoolY = Math.min(...poolYs);
  const maxPoolY = Math.max(...poolYs);
  
  const deckPoints: HardscapePoint[] = [
    { x: minPoolX - deckWidth, y: minPoolY - deckWidth, id: 'h1' },
    { x: maxPoolX + deckWidth, y: minPoolY - deckWidth, id: 'h2' },
    { x: maxPoolX + deckWidth, y: maxPoolY + deckWidth, id: 'h3' },
    { x: minPoolX - deckWidth, y: maxPoolY + deckWidth, id: 'h4' },
  ];

  const scene: Scene3D = {
    pool: {
      points: poolPoints,
      depthPoints: depthPoints,
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
      copingWidth: 1.1,
      waterline: {
        url: linerTextureUrl,
        name: `${selectedExtras.finish || selectedExtras.linerOption || 'Default'} (Waterline)`,
        roughness: 0.3,
        metalness: 0.2,
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
