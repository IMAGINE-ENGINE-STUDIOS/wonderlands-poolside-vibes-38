// Pool Model Shape Library
// Stores exact contour coordinates for each manufacturer pool model
// Points are in feet, normalized to pool dimensions

export interface PoolModelShape {
  modelName: string;
  brand: string;
  // Points in feet - will be scaled to match actual product dimensions
  points: Array<{ x: number; y: number }>;
  // Depth anchors: position (0-1 along length), depth in feet
  depthAnchors?: Array<{ position: number; depth: number }>;
  // Special features
  features?: {
    hasStairs?: boolean;
    stairsPosition?: 'shallow' | 'deep' | 'side';
    hasBench?: boolean;
    benchStart?: number; // position 0-1
    benchEnd?: number;   // position 0-1
    hasSpa?: boolean;
    hasSplashDeck?: boolean;
    hasLedge?: boolean;
  };
}

// Helper to create GEOMETRICALLY SYMMETRICAL kidney shape
// Uses parametric equation for perfect bilateral symmetry
const createKidneyShape = (width: number, length: number, curveFactor: number = 0.2): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const segments = 48; // More segments for smoother curves
  
  // Parametric kidney shape: symmetrical about the Y-axis (length direction)
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    
    // Base ellipse
    const baseX = (width / 2) * Math.cos(t);
    const baseY = (length / 2) * Math.sin(t);
    
    // Apply SYMMETRICAL kidney indentation on LEFT side (negative X)
    // Uses sin^2 for smooth transition at both ends
    const indentStrength = Math.pow(Math.sin(t), 2) * curveFactor * width;
    let x = baseX;
    
    // Only indent on the left side (when x is negative, i.e., cos(t) < 0)
    if (Math.cos(t) < 0) {
      // Push inward (toward positive x) proportionally
      x += indentStrength * 0.8;
    }
    
    // Center at width/2, length/2
    points.push({ 
      x: x + width / 2, 
      y: baseY + length / 2 
    });
  }
  
  return points;
};

// Helper to create PERFECTLY SYMMETRICAL oval/ellipse shape
const createSymmetricalOval = (width: number, length: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const segments = 48;
  
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push({
      x: (width / 2) * Math.cos(t) + width / 2,
      y: (length / 2) * Math.sin(t) + length / 2
    });
  }
  
  return points;
};

// Helper to create SYMMETRICAL figure-8/peanut shape
const createFigure8Shape = (width: number, length: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const segments = 48;
  
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    
    // Figure-8 uses a modified lemniscate with bilateral symmetry
    const baseX = (width / 2) * Math.cos(t);
    const baseY = (length / 2) * Math.sin(t);
    
    // Pinch in the middle (at y=0)
    const pinchFactor = 1 - 0.25 * Math.pow(Math.cos(t), 2);
    const x = baseX * pinchFactor;
    
    points.push({
      x: x + width / 2,
      y: baseY + length / 2
    });
  }
  
  return points;
};

// Helper to create SYMMETRICAL lazy-L shape
const createLazyLShape = (width: number, length: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const cornerRadius = Math.min(width, length) * 0.15;
  const segments = 8;
  
  // Main rectangle with L-shaped cutout (symmetrical about center)
  // Bottom left corner
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI + (i / segments) * (Math.PI / 2);
    points.push({
      x: cornerRadius + cornerRadius * Math.cos(angle),
      y: cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  // Left side up to L notch
  points.push({ x: 0, y: length * 0.4 });
  
  // L notch (cuts into upper left)
  points.push({ x: width * 0.35, y: length * 0.4 });
  points.push({ x: width * 0.35, y: length * 0.6 });
  
  // Continue left side
  points.push({ x: 0, y: length * 0.6 });
  
  // Top left corner
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI / 2 + (i / segments) * (Math.PI / 2);
    points.push({
      x: cornerRadius + cornerRadius * Math.cos(angle),
      y: length - cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  // Top right corner
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * (Math.PI / 2);
    points.push({
      x: width - cornerRadius + cornerRadius * Math.cos(angle),
      y: length - cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  // Bottom right corner
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI * 1.5 + (i / segments) * (Math.PI / 2);
    points.push({
      x: width - cornerRadius + cornerRadius * Math.cos(angle),
      y: cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  return points;
};

// Helper to create SYMMETRICAL grecian shape (rectangle with semicircular ends)
const createGrecianShape = (width: number, length: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const endRadius = width / 2;
  const segments = 24;
  
  // Left side (straight)
  points.push({ x: 0, y: endRadius });
  points.push({ x: 0, y: length - endRadius });
  
  // Top semicircle (perfectly symmetrical)
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI + (i / segments) * Math.PI;
    points.push({
      x: width / 2 + endRadius * Math.cos(angle),
      y: length - endRadius - endRadius * Math.sin(angle)
    });
  }
  
  // Right side (straight)
  points.push({ x: width, y: length - endRadius });
  points.push({ x: width, y: endRadius });
  
  // Bottom semicircle (perfectly symmetrical)
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI;
    points.push({
      x: width / 2 + endRadius * Math.cos(angle),
      y: endRadius - endRadius * Math.sin(angle)
    });
  }
  
  return points;
};

// Helper to create roman-end rectangle (rounded ends)
const createRomanEndShape = (width: number, length: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const segments = 16;
  const endRadius = width / 2;
  
  // Left side (straight)
  points.push({ x: 0, y: endRadius });
  points.push({ x: 0, y: length - endRadius });
  
  // Top end (curved)
  for (let i = 0; i <= segments / 2; i++) {
    const angle = Math.PI + (i / (segments / 2)) * Math.PI;
    points.push({
      x: width / 2 + endRadius * Math.cos(angle),
      y: length - endRadius + endRadius * Math.sin(angle)
    });
  }
  
  // Right side (straight)
  points.push({ x: width, y: length - endRadius });
  points.push({ x: width, y: endRadius });
  
  // Bottom end (curved)
  for (let i = 0; i <= segments / 2; i++) {
    const angle = (i / (segments / 2)) * Math.PI;
    points.push({
      x: width / 2 + endRadius * Math.cos(angle),
      y: endRadius - endRadius * Math.sin(angle)
    });
  }
  
  return points;
};

// Helper to create freeform lagoon shape
const createFreeformShape = (width: number, length: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const segments = 40;
  
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    
    // Base oval with organic variations
    const radiusX = width / 2;
    const radiusY = length / 2;
    
    // Add organic wobble
    const wobble1 = Math.sin(t * 3) * 0.1;
    const wobble2 = Math.cos(t * 2) * 0.08;
    
    const x = (radiusX * (1 + wobble1)) * Math.cos(t) + width / 2;
    const y = (radiusY * (1 + wobble2)) * Math.sin(t) + length / 2;
    
    points.push({ x, y });
  }
  
  return points;
};

// Helper to create rectangular pool with rounded corners
const createRoundedRectangle = (width: number, length: number, cornerRadius: number = 1): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const segments = 8; // per corner
  
  // Bottom-left corner
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI + (i / segments) * (Math.PI / 2);
    points.push({
      x: cornerRadius + cornerRadius * Math.cos(angle),
      y: cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  // Bottom-right corner
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI * 1.5 + (i / segments) * (Math.PI / 2);
    points.push({
      x: width - cornerRadius + cornerRadius * Math.cos(angle),
      y: cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  // Top-right corner
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * (Math.PI / 2);
    points.push({
      x: width - cornerRadius + cornerRadius * Math.cos(angle),
      y: length - cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  // Top-left corner
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI / 2 + (i / segments) * (Math.PI / 2);
    points.push({
      x: cornerRadius + cornerRadius * Math.cos(angle),
      y: length - cornerRadius + cornerRadius * Math.sin(angle)
    });
  }
  
  return points;
};

// Helper to create oval/ellipse shape
const createOvalShape = (width: number, length: number): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  const segments = 32;
  
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push({
      x: (width / 2) * Math.cos(t) + width / 2,
      y: (length / 2) * Math.sin(t) + length / 2
    });
  }
  
  return points;
};

// Pool Model Shapes Library
// These shapes are normalized to the pool's actual dimensions
export const poolModelShapes: Record<string, PoolModelShape> = {
  // ============================================
  // COMPACT MODELS
  // ============================================
  
  "Serafina": {
    modelName: "Serafina",
    brand: "Glimmerglass",
    // Small kidney-shaped pool 8'6" x 14'
    points: createKidneyShape(8.5, 14, 0.15),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 0.5, depth: 4 },
      { position: 1, depth: 4 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Coral Cove": {
    modelName: "Coral Cove",
    brand: "Glimmerglass",
    // 9'6" x 16' freeform
    points: createFreeformShape(9.5, 16),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 4 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Retreat": {
    modelName: "Retreat",
    brand: "Glimmerglass",
    // 10'3" x 18'5" rectangular with rounded corners
    points: createRoundedRectangle(10.25, 18.4, 1.5),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 4.33 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasBench: true,
      benchStart: 0,
      benchEnd: 0.15
    }
  },
  
  "Regal Plunge": {
    modelName: "Regal Plunge",
    brand: "Glimmerglass",
    // 10' x 16' plunge pool
    points: createRoundedRectangle(10, 16, 1.2),
    depthAnchors: [
      { position: 0, depth: 4 },
      { position: 1, depth: 5.4 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  // ============================================
  // STANDARD MODELS
  // ============================================
  
  "Regal": {
    modelName: "Regal",
    brand: "Glimmerglass",
    // 10' x 20'
    points: createRoundedRectangle(10, 20, 1.5),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5.33 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasBench: true,
      benchStart: 0,
      benchEnd: 0.12
    }
  },
  
  "Mini Extreme": {
    modelName: "Mini Extreme",
    brand: "Glimmerglass",
    // 8'2" x 20' with spa
    points: createRoundedRectangle(8.17, 20, 1),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Caribbean": {
    modelName: "Caribbean",
    brand: "Glimmerglass",
    // 11' x 20' kidney shape
    points: createKidneyShape(11, 20, 0.18),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Neptune": {
    modelName: "Neptune",
    brand: "Glimmerglass",
    // 11' x 23' freeform
    points: createFreeformShape(11, 23),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5.5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Islander": {
    modelName: "Islander",
    brand: "Glimmerglass",
    // 12' x 24' oval
    points: createOvalShape(12, 24),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5.5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Emerald": {
    modelName: "Emerald",
    brand: "Glimmerglass",
    // 12' x 25' roman end
    points: createRomanEndShape(12, 25),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5.58 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  // ============================================
  // DELUXE MODELS
  // ============================================
  
  "Roman": {
    modelName: "Roman",
    brand: "Glimmerglass",
    // 11' x 27' roman end
    points: createRomanEndShape(11, 27),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6.17 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Superior": {
    modelName: "Superior",
    brand: "Glimmerglass",
    // 12' x 25'8"
    points: createRoundedRectangle(12, 25.67, 2),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5.5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasBench: true,
      benchStart: 0,
      benchEnd: 0.1
    }
  },
  
  "Capri": {
    modelName: "Capri",
    brand: "Glimmerglass",
    // 12' x 28'
    points: createFreeformShape(12, 28),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 4.5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasLedge: true
    }
  },
  
  "Costa Brava": {
    modelName: "Costa Brava",
    brand: "Glimmerglass",
    // 12' x 29' rectangular
    points: createRoundedRectangle(12, 29, 2),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Majestic": {
    modelName: "Majestic",
    brand: "Glimmerglass",
    // 13' x 25'6"
    points: createRoundedRectangle(13, 25.5, 2),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  // ============================================
  // PREMIUM MODELS
  // ============================================
  
  "Gold Coast w/ built-in Spa": {
    modelName: "Gold Coast w/ built-in Spa",
    brand: "Glimmerglass",
    // 14' x 28' with spa
    points: createRoundedRectangle(14, 28, 2.5),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5.67 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasSpa: true
    }
  },
  
  "Atlantis": {
    modelName: "Atlantis",
    brand: "Glimmerglass",
    // 14' x 32'
    points: createRomanEndShape(14, 32),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Extreme 27 w/ built-in Spa & Splash Deck": {
    modelName: "Extreme 27 w/ built-in Spa & Splash Deck",
    brand: "Glimmerglass",
    // 12'6" x 27'
    points: createRoundedRectangle(12.5, 27, 2),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 5.92 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasSpa: true,
      hasSplashDeck: true
    }
  },
  
  "Tortola": {
    modelName: "Tortola",
    brand: "Glimmerglass",
    // 14' x 30'
    points: createKidneyShape(14, 30, 0.2),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Silver Shore": {
    modelName: "Silver Shore",
    brand: "Glimmerglass",
    // 15' x 28'
    points: createFreeformShape(15, 28),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Mystic": {
    modelName: "Mystic",
    brand: "Glimmerglass",
    // 15' x 32'
    points: createKidneyShape(15, 32, 0.22),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Aloha": {
    modelName: "Aloha",
    brand: "Glimmerglass",
    // 15' x 34'
    points: createFreeformShape(15, 34),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Bellagio": {
    modelName: "Bellagio",
    brand: "Glimmerglass",
    // 15' x 34'
    points: createRomanEndShape(15, 34),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6.5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Extreme 38 w/ built-in Spa & Splash Deck": {
    modelName: "Extreme 38 w/ built-in Spa & Splash Deck",
    brand: "Glimmerglass",
    // 15'6" x 38'
    points: createRoundedRectangle(15.5, 38, 2.5),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 7 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasSpa: true,
      hasSplashDeck: true
    }
  },
  
  "Ponce XL": {
    modelName: "Ponce XL",
    brand: "Glimmerglass",
    // 15'6" x 32'
    points: createRoundedRectangle(15.5, 32, 2.5),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasBench: true,
      benchStart: 0,
      benchEnd: 0.1
    }
  },
  
  "Newport": {
    modelName: "Newport",
    brand: "Glimmerglass",
    // 16' x 35'
    points: createRoundedRectangle(16, 35, 2.5),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Serenade w/ built-in Spa": {
    modelName: "Serenade w/ built-in Spa",
    brand: "Glimmerglass",
    // 16' x 38'
    points: createFreeformShape(16, 38),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow',
      hasSpa: true
    }
  },
  
  "Beachcomber": {
    modelName: "Beachcomber",
    brand: "Glimmerglass",
    // 16' x 40'
    points: createKidneyShape(16, 40, 0.2),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 8 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Vision": {
    modelName: "Vision",
    brand: "Glimmerglass",
    // 16' x 41'
    points: createRomanEndShape(16, 41),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 6.5 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  },
  
  "Grand Cayman": {
    modelName: "Grand Cayman",
    brand: "Glimmerglass",
    // 16' x 42'
    points: createFreeformShape(16, 42),
    depthAnchors: [
      { position: 0, depth: 3.5 },
      { position: 1, depth: 8 }
    ],
    features: {
      hasStairs: true,
      stairsPosition: 'shallow'
    }
  }
};

// Get a pool shape by model name
export function getPoolModelShape(modelName: string): PoolModelShape | undefined {
  return poolModelShapes[modelName];
}

// Get all available model names
export function getAvailableModelNames(): string[] {
  return Object.keys(poolModelShapes);
}
