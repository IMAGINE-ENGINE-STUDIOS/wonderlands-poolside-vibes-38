// Extended feature type definitions for Design Studio

export type DesignCategory = 'pool' | 'landscape' | 'water-features' | 'terrain' | 'utilities';

// Extended pool feature types - these map to the PoolBuilder feature system
export type PoolFeatureType = 
  // Existing pool features
  | 'stairs' | 'light' | 'jet' | 'fountain' | 'tree' | 'shrub' | 'umbrella' | 'heater' | 'custom'
  // New Pool Features
  | 'pool-seat' | 'pool-wall' | 'diving-board' | 'slide' | 'pool-cover' | 'pool-accessory'
  // Landscape Features  
  | 'rock' | 'boulder' | 'hedge-row' | 'plant-row' | 'landscape-light' | 'edging' | 'grass-region' | 'pathway'
  // Water Features
  | 'pond' | 'stream' | 'waterfall' | 'jumping-jet' | 'sprinkler' | 'water-curtain'
  // Utilities
  | 'dimension-line' | 'text-label' | 'lot-boundary' | 'area-measurement';

export interface ToolDefinition {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  featureType?: PoolFeatureType;
  description?: string;
  category: DesignCategory;
  isNew?: boolean; // Mark new tools
}

// Swimming Pool Tools - organized by workflow
export const poolTools: ToolDefinition[] = [
  // Pool structure - these activate panels, not add features
  { id: 'pool-shape', name: 'Shape', icon: 'Shapes', category: 'pool', description: 'Edit pool shape' },
  { id: 'pool-deck', name: 'Deck', icon: 'Grid3X3', category: 'pool', description: 'Edit deck area' },
  { id: 'pool-depth', name: 'Depth', icon: 'Layers', category: 'pool', description: 'Edit depth profile' },
  { id: 'pool-materials', name: 'Materials', icon: 'Palette', category: 'pool', description: 'Choose finishes & pavers' },
  // Separator - these add features
  { id: 'pool-stairs', name: 'Stairs', icon: 'ArrowDownToLine', featureType: 'stairs', category: 'pool', description: 'Add pool stairs' },
  { id: 'pool-seat', name: 'Seat', icon: 'Sofa', featureType: 'pool-seat', category: 'pool', description: 'Add bench seating', isNew: true },
  { id: 'pool-wall', name: 'Wall', icon: 'RectangleVertical', featureType: 'pool-wall', category: 'pool', description: 'Add raised wall', isNew: true },
  { id: 'pool-light', name: 'Light', icon: 'Lightbulb', featureType: 'light', category: 'pool', description: 'Add underwater light' },
  { id: 'pool-jet', name: 'Jet', icon: 'Droplets', featureType: 'jet', category: 'pool', description: 'Add water jet' },
  { id: 'diving-board', name: 'Diving', icon: 'ArrowUpFromLine', featureType: 'diving-board', category: 'pool', description: 'Add diving board', isNew: true },
];

// Landscape Tools - organized by element type
export const landscapeTools: ToolDefinition[] = [
  // Ground cover
  { id: 'grass-region', name: 'Grass Region', icon: 'Leaf', featureType: 'grass-region', category: 'landscape', description: 'Draw grass area' },
  { id: 'pathway', name: 'Pathway', icon: 'Route', featureType: 'pathway', category: 'landscape', description: 'Draw pathway' },
  { id: 'edging', name: 'Edging', icon: 'Minus', featureType: 'edging', category: 'landscape', description: 'Add border edging', isNew: true },
  // Plants
  { id: 'tree', name: 'Tree', icon: 'TreeDeciduous', featureType: 'tree', category: 'landscape', description: 'Add tree' },
  { id: 'shrub', name: 'Shrub', icon: 'Flower2', featureType: 'shrub', category: 'landscape', description: 'Add shrub' },
  { id: 'hedge-row', name: 'Hedge Row', icon: 'AlignHorizontalDistributeCenter', featureType: 'hedge-row', category: 'landscape', description: 'Add linear hedge', isNew: true },
  { id: 'plant-row', name: 'Plant Row', icon: 'LayoutList', featureType: 'plant-row', category: 'landscape', description: 'Add plant row', isNew: true },
  // Hardscape
  { id: 'rock', name: 'Rock', icon: 'Hexagon', featureType: 'rock', category: 'landscape', description: 'Add decorative rock', isNew: true },
  { id: 'boulder', name: 'Boulder', icon: 'Circle', featureType: 'boulder', category: 'landscape', description: 'Add large boulder', isNew: true },
  // Lighting
  { id: 'landscape-light', name: 'Path Light', icon: 'Lamp', featureType: 'landscape-light', category: 'landscape', description: 'Add landscape lighting', isNew: true },
];

// Water Features Tools
export const waterFeaturesTools: ToolDefinition[] = [
  { id: 'fountain', name: 'Fountain', icon: 'Droplet', featureType: 'fountain', category: 'water-features', description: 'Add fountain' },
  { id: 'pond', name: 'Pond', icon: 'Waves', featureType: 'pond', category: 'water-features', description: 'Draw pond' },
  { id: 'stream', name: 'Stream', icon: 'GitBranch', featureType: 'stream', category: 'water-features', description: 'Draw stream' },
  { id: 'waterfall', name: 'Waterfall', icon: 'ArrowDownWideNarrow', featureType: 'waterfall', category: 'water-features', description: 'Add waterfall' },
  { id: 'jumping-jet', name: 'Deck Jet', icon: 'Sparkles', featureType: 'jumping-jet', category: 'water-features', description: 'Add deck jet' },
  { id: 'sprinkler', name: 'Sprinkler', icon: 'Fan', featureType: 'sprinkler', category: 'water-features', description: 'Add sprinkler' },
  { id: 'water-curtain', name: 'Water Curtain', icon: 'AlignVerticalSpaceAround', featureType: 'water-curtain', category: 'water-features', description: 'Add water curtain' },
];

// Utilities Tools
export const utilitiesTools: ToolDefinition[] = [
  { id: 'dimension-line', name: 'Dimension', icon: 'Ruler', featureType: 'dimension-line', category: 'utilities', description: 'Add dimension line' },
  { id: 'text-label', name: 'Text Label', icon: 'Type', featureType: 'text-label', category: 'utilities', description: 'Add text annotation' },
  { id: 'area-measurement', name: 'Area', icon: 'SquareDashed', featureType: 'area-measurement', category: 'utilities', description: 'Measure area' },
  { id: 'lot-boundary', name: 'Lot Boundary', icon: 'BoxSelect', featureType: 'lot-boundary', category: 'utilities', description: 'Draw property line' },
];

// All tools grouped
export const allTools = {
  pool: poolTools,
  landscape: landscapeTools,
  'water-features': waterFeaturesTools,
  utilities: utilitiesTools,
};
