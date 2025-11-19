// Utilities to convert different data formats to Scene3D

import { Scene3D, TextureConfig, Point, DepthPoint, HardscapePoint } from './types';

// Parse dimensions from string like "14' x 28'" or "16 feet x 32 feet" or "16' × 40'"
export const parseDimensions = (dimensionsStr?: string): { length: number; width: number } => {
  if (!dimensionsStr) return { length: 30, width: 15 };
  
  // Handle various formats: "14' x 28'", "16' × 40'", "16 feet x 32 feet"
  const matches = dimensionsStr.match(/(\d+)\s*(?:'|ft|feet)?\s*[x×]\s*(\d+)/i);
  if (matches) {
    return {
      width: parseInt(matches[1]),
      length: parseInt(matches[2])
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
  if (!finishName || finishName === 'None') {
    return '/src/assets/finishes/sapphire-blue-g3.jpg';
  }
  
  const finishMap: Record<string, string> = {
    'Aquamarine': '/src/assets/finishes/aquamarine-g3.jpg',
    'Ocean Blue': '/src/assets/finishes/ocean-blue-g3.jpg',
    'Sapphire Blue': '/src/assets/finishes/sapphire-blue-g3.jpg',
    'Night Sky': '/src/assets/finishes/night-sky-g3.jpg',
    'Athens Pearl White': '/src/assets/finishes/athens-pearl-white-g3.jpg',
    'Lagoon Blue': '/src/assets/finishes/lagoon-blue-g2.jpg',
    'Azure Blue': '/src/assets/finishes/azure-blue-g2.jpg',
    'Coastal Bronze': '/src/assets/finishes/coastal-bronze-g3.jpg',
    'Shale Gray': '/src/assets/finishes/shale-gray-g3.jpg',
  };
  
  return finishMap[finishName] || '/src/assets/finishes/sapphire-blue-g3.jpg';
};

// Map paver names to texture URLs
export const getPaverTextureUrl = (paverName?: string, paverTypes?: any[]): string => {
  if (!paverName || paverName === 'None' || paverName === 'No Pavers') {
    return '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
  }
  
  const paver = paverTypes?.find(p => p.name === paverName);
  return paver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
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
  
  // Parse depth from product data (e.g., "3'9\" - 8'6\"")
  const deepEndDepth = parseDepth(product.depth);

  // Get texture URLs
  const linerTextureUrl = selectedExtras.finish 
    ? getFinishTextureUrl(selectedExtras.finish)
    : selectedExtras.linerOption 
      ? getFinishTextureUrl(selectedExtras.linerOption)
      : '/src/assets/finishes/sapphire-blue-g3.jpg';
      
  const paverTextureUrl = getPaverTextureUrl(selectedExtras.paverOption, paverTypes);
  const copingTextureUrl = getPaverTextureUrl(selectedExtras.copingPaverOption, paverTypes);

  // Create basic pool shape points (rectangle)
  const poolPoints: Point[] = [
    { x: 0, y: 0, id: 'p1' },
    { x: width, y: 0, id: 'p2' },
    { x: width, y: length, id: 'p3' },
    { x: 0, y: length, id: 'p4' },
  ];

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

  // Create deck points (5 feet wider on all sides)
  const deckWidth = 5;
  const deckPoints: HardscapePoint[] = [
    { x: -deckWidth, y: -deckWidth, id: 'h1' },
    { x: width + deckWidth, y: -deckWidth, id: 'h2' },
    { x: width + deckWidth, y: length + deckWidth, id: 'h3' },
    { x: -deckWidth, y: length + deckWidth, id: 'h4' },
  ];

  return {
    pool: {
      points: poolPoints,
      depthPoints: depthPoints,
      shape: 'rectangle',
      finish: {
        url: linerTextureUrl,
        name: selectedExtras.finish || selectedExtras.linerOption || 'Default',
        scale: 1,
        offset: [0, 0],
        roughness: 0.2,
        metalness: 0.1
      },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      dimensions: { length, width, depth: deepDepth }
    },
    deck: {
      points: deckPoints,
      paver: {
        url: paverTextureUrl,
        name: selectedExtras.paverOption || 'Default Paver',
        roughness: 0.8,
        metalness: 0.0
      },
      coping: {
        url: copingTextureUrl,
        name: selectedExtras.copingPaverOption || 'Default Coping',
        roughness: 0.6,
        metalness: 0.0,
        offset: [-0.21, 0]
      },
      copingWidth: 1.1, // Default coping width in feet (minimum)
      waterline: {
        url: linerTextureUrl,
        name: `${selectedExtras.finish || selectedExtras.linerOption || 'Default'} (Waterline)`,
        roughness: 0.3,
        metalness: 0.2
      }
    },
    features: [],
    annotations: [],
    camera: {
      position: [length * 0.8, length * 0.6, width * 0.8],
      target: [width / 2, 0, length / 2]
    }
  };
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
