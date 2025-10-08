import { Suspense } from 'react';
import { Pool3DViewer } from './Pool3DViewer';
import { Loader2 } from 'lucide-react';

interface ProductViewer3DProps {
  product: {
    model?: string;
    name?: string;
    dimensions?: string;
    depth?: string;
    type?: string;
  };
  selectedExtras: {
    finish?: string;
    paverOption?: string;
    copingPaverOption?: string;
    linerOption?: string;
  };
  paverTypes: any[];
  finishOptions: any[];
  linerOptions: any[];
}

// Helper to extract dimensions from string like "14' x 28'" or "16 feet x 32 feet"
const parseDimensions = (dimensionsStr?: string): { length: number; width: number } => {
  if (!dimensionsStr) return { length: 30, width: 15 }; // Default dimensions
  
  const matches = dimensionsStr.match(/(\d+)\s*(?:'|ft|feet)?\s*x\s*(\d+)/i);
  if (matches) {
    return {
      length: parseInt(matches[2]), // Length is typically the second number
      width: parseInt(matches[1])   // Width is typically the first number
    };
  }
  
  return { length: 30, width: 15 }; // Default if parsing fails
};

// Helper to extract depth from string like "4' - 6'" or "4-6 feet"
const parseDepth = (depthStr?: string): number => {
  if (!depthStr) return 6; // Default depth
  
  const matches = depthStr.match(/(\d+)\s*(?:'|ft|feet)?.*?(\d+)/);
  if (matches) {
    // Use the deeper end (second number)
    return parseInt(matches[2]);
  }
  
  const singleMatch = depthStr.match(/(\d+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1]);
  }
  
  return 6; // Default if parsing fails
};

// Map finish names to texture URLs
const getFinishTextureUrl = (finishName?: string): string => {
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

// Map paver names to texture URLs from paverTypes data
const getPaverTextureUrl = (paverName?: string, paverTypes?: any[]): string => {
  if (!paverName || paverName === 'None' || paverName === 'No Pavers') {
    return '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
  }
  
  const paver = paverTypes?.find(p => p.name === paverName);
  return paver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
};

export const ProductViewer3D: React.FC<ProductViewer3DProps> = ({
  product,
  selectedExtras,
  paverTypes,
  finishOptions,
  linerOptions
}) => {
  // Only render 3D viewer for pool-type products
  if (product.type !== 'pool' && product.type !== 'spa' && product.type !== 'tanning-ledge') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">3D view not available for this product type</p>
      </div>
    );
  }

  // Parse product dimensions and depth
  const { length, width } = parseDimensions(product.dimensions);
  const depth = parseDepth(product.depth);

  // Get texture URLs from selected extras
  const linerTextureUrl = getFinishTextureUrl(selectedExtras.finish || selectedExtras.linerOption);
  const paverTextureUrl = getPaverTextureUrl(selectedExtras.paverOption, paverTypes);
  const copingTextureUrl = getPaverTextureUrl(selectedExtras.copingPaverOption, paverTypes);

  // Create basic pool shape points (rectangle)
  const poolPoints = [
    { x: 0, y: 0, id: 'p1' },
    { x: width, y: 0, id: 'p2' },
    { x: width, y: length, id: 'p3' },
    { x: 0, y: length, id: 'p4' },
  ];

  // Create depth points (flat bottom for now) - DepthPoint uses position instead of x,y
  const depthPoints = [
    { position: 0, depth: depth, id: 'd1' },
    { position: 0.25, depth: depth, id: 'd2' },
    { position: 0.5, depth: depth, id: 'd3' },
    { position: 0.75, depth: depth, id: 'd4' },
    { position: 1, depth: depth, id: 'd5' },
  ];

  // Create deck points (5 feet wider on all sides)
  const deckWidth = 5;
  const deckPoints = [
    { x: -deckWidth, y: -deckWidth, id: 'h1' },
    { x: width + deckWidth, y: -deckWidth, id: 'h2' },
    { x: width + deckWidth, y: length + deckWidth, id: 'h3' },
    { x: -deckWidth, y: length + deckWidth, id: 'h4' },
  ];

  return (
    <div className="w-full h-full relative">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <Pool3DViewer
          points={poolPoints}
          depthPoints={depthPoints}
          hardscapePoints={deckPoints}
          linerTextureUrl={linerTextureUrl}
          paverTextureUrl={paverTextureUrl}
          copingTextureUrl={copingTextureUrl}
          fenceTextureUrl="/src/assets/fence-texture.png"
          features={[]}
          fencePoints={[]}
          scale={1}
          poolShape="rectangle"
        />
      </Suspense>
    </div>
  );
};
