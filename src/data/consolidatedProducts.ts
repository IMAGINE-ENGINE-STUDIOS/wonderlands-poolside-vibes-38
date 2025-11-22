// Consolidated Products Database
// All products in the application - pools, finishes, liners, tiles, ledges, etc.

export interface Product {
  id: string;
  name: string;
  category: 'pool' | 'finish' | 'liner' | 'tile' | 'ledge' | 'spa' | 'cover' | 'heater' | 'addon';
  subcategory?: string;
  collection?: string;
  price: number;
  originalPrice?: number; // For discount calculations
  image: string;
  description: string;
  features?: string[];
  dimensions?: string;
  depth?: string;
  warranty?: string;
  type?: string;
  isActive: boolean;
  isPopular?: boolean;
  stripeProductId?: string; // For Stripe integration
  stripePriceId?: string; // For Stripe integration
}

// Pool Finishes - Mini Pebble Natural Stone Collection
export const poolFinishes: Product[] = [
  {
    id: "marina-blue-pebble",
    name: "Marina Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/marina-blue.webp",
    description: "Vibrant blue mini pebbles creating a stunning Mediterranean pool aesthetic with natural stone beauty",
    features: ["Natural Stone", "Mini Pebble", "UV Resistant", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "kingfisher-pebble",
    name: "Kingfisher",
    category: "finish",
    subcategory: "Rich & Vibrant",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/kingfisher.webp",
    description: "Multi-colored pebble blend with blue, gray, and golden tones for a natural river rock appearance",
    features: ["Natural Multi-Color", "River Rock Look", "Textured Finish", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "tropics-blue-pebble",
    name: "Tropics Blue",
    category: "finish",
    subcategory: "Rich & Vibrant",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/tropics-blue.webp",
    description: "Tropical blue pebble blend with natural stone variations creating an exotic paradise feel",
    features: ["Tropical Aesthetic", "Natural Variation", "Mini Pebble", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "midnight-blue-pebble",
    name: "Midnight Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/midnight-blue.webp",
    description: "Deep blue and gray pebble mix creating dramatic depth and sophisticated natural elegance",
    features: ["Deep Color", "Natural Elegance", "Dramatic Look", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "yosemite-pebble",
    name: "Yosemite",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/yosemite.webp",
    description: "Rich blue and silver pebble blend inspired by mountain lakes with brilliant natural sparkle",
    features: ["Mountain Lake Aesthetic", "Natural Sparkle", "Premium Blend", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "aqua-white-pebble",
    name: "Aqua White",
    category: "finish",
    subcategory: "Light & Tranquil",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/aqua-white.webp",
    description: "Light aqua and white pebble mix for a bright, refreshing coastal lagoon appearance",
    features: ["Light & Bright", "Coastal Feel", "Natural White Tones", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "twizel-pebble",
    name: "Twizel",
    category: "finish",
    subcategory: "Light & Tranquil",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/twizel.webp",
    description: "Soft blue and cream pebble blend creating a serene, natural stone sanctuary",
    features: ["Serene Tones", "Natural Cream Accents", "Tranquil Look", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "tahoe-blue-pebble",
    name: "Tahoe Blue",
    category: "finish",
    subcategory: "Rich & Vibrant",
    collection: "Mini Pebble Natural Stone",
    price: 3500,
    image: "/src/assets/finishes/tahoe-blue.webp",
    description: "Natural pebble mix with gray and blue tones reminiscent of Lake Tahoe's pristine waters",
    features: ["Lake-Inspired", "Natural Gray & Blue", "Premium Stone", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  }
];

// Pool Liners - ALL 17 LINERS ($20/sqft installed, $15/sheet material only)
export const poolLiners: Product[] = [
  // Glass Tile Collection
  {
    id: "paradise-glass",
    name: "Paradise",
    category: "liner",
    subcategory: "Glass",
    price: 20, // Per sqft installed
    originalPrice: 15, // Per sheet material only
    image: "/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.png",
    description: "Vibrant blue glass tiles with flowing striped patterns for a tropical paradise feel. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "water-lilies-glass",
    name: "Water Lilies",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/7f1b802e-1c58-4807-b6d6-41aab2eed1ca.png",
    description: "Serene blue and white striped glass tiles reminiscent of peaceful water gardens. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "sail-boat-glass",
    name: "Sail Boat",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.png",
    description: "Nautical-inspired mixed blue and brown striped glass tiles for coastal elegance. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "stormy-glass",
    name: "Stormy",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/ee0c59a8-87bb-4b74-b6e9-9eeba3633e9f.png",
    description: "Dramatic neutral and brown striped glass tiles with stormy weather appeal. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "ballad-glass",
    name: "Ballad",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/37536046-70f5-46b8-8422-84097ccdec08.png",
    description: "Mixed blue mosaic glass tiles with artistic patterns and flowing design. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "galant-glass",
    name: "Galant",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/723a9c27-b7d5-4139-bda7-4eed2d0b23e8.png",
    description: "Elegant blue mosaic glass tiles with iridescent effects and sophisticated style. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "melody-glass",
    name: "Melody",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/c8e3cc34-9fbe-4ece-af71-05b7e4f94332.png",
    description: "Harmonious iridescent glass tiles with rainbow shimmer and artistic flair. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "soul-glass",
    name: "Soul",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/7dc956df-af5c-4c6b-b2af-6bc9d6fbf179.png",
    description: "Sophisticated gray and white mosaic glass tiles with deep, soulful character. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "glacier-glass",
    name: "Glacier",
    category: "liner",
    subcategory: "Glass",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/96f46291-85e7-4b48-9465-623400a8e835.png",
    description: "Cool glacier-inspired glass tiles with decorative borders and flowing patterns. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  // Porcelain Collection
  {
    id: "tikal-porcelain",
    name: "Tikal",
    category: "liner",
    subcategory: "Porcelain",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png",
    description: "Marbled blue porcelain with premium durability and 25-year warranty. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "port-royal-porcelain",
    name: "Port Royal",
    category: "liner",
    subcategory: "Porcelain",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/56fd62de-130b-4b90-98a0-596007f5dadb.png",
    description: "Deep ocean blue porcelain with premium durability and 25-year warranty. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "alexandria-porcelain",
    name: "Alexandria",
    category: "liner",
    subcategory: "Porcelain",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png",
    description: "Golden marble porcelain with premium durability and 25-year warranty. $20/sqft installed or $15/sheet material only.",
    warranty: "25-Year Warranty",
    isActive: true
  },
  // Italian Stone Collection
  {
    id: "san-marino-stone",
    name: "San Marino",
    category: "liner",
    subcategory: "Italian Stone",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/7f823d88-d9f2-4ecf-bcd1-a9d25d8519a8.png",
    description: "Dark granite Italian stone with luxury durability and 30-year warranty. $20/sqft installed or $15/sheet material only.",
    warranty: "30-Year Warranty",
    isActive: true
  },
  {
    id: "firenze-stone",
    name: "Firenze",
    category: "liner",
    subcategory: "Italian Stone",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png",
    description: "Blue grey marble Italian stone with luxury durability and 30-year warranty. $20/sqft installed or $15/sheet material only.",
    warranty: "30-Year Warranty",
    isActive: true
  },
  {
    id: "naples-stone",
    name: "Naples",
    category: "liner",
    subcategory: "Italian Stone",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/a378df22-0a67-4626-ac93-c6cf8fe37602.png",
    description: "Warm beige stone Italian stone with luxury durability and 30-year warranty. $20/sqft installed or $15/sheet material only.",
    warranty: "30-Year Warranty",
    isActive: true
  },
  {
    id: "milan-stone",
    name: "Milan",
    category: "liner",
    subcategory: "Italian Stone",
    price: 20,
    originalPrice: 15,
    image: "/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png",
    description: "Charcoal stone Italian stone with luxury durability and 30-year warranty. $20/sqft installed or $15/sheet material only.",
    warranty: "30-Year Warranty",
    isActive: true
  }
];

// Pool Tiles
export const poolTiles: Product[] = [
  {
    id: "mountain-tile",
    name: "Mountain",
    category: "tile",
    subcategory: "Premium Border",
    price: 15000,
    image: "/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.png",
    description: "Natural stone-look mosaic border with decorative diamond pattern",
    warranty: "Lifetime Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "carnegie-tile",
    name: "Carnegie",
    category: "tile",
    subcategory: "Premium Border",
    price: 15000,
    image: "/lovable-uploads/5a4a4746-8777-4adb-84c6-c153dbdae3ad.png",
    description: "Elegant diamond mosaic border with rich blue tones",
    warranty: "Lifetime Warranty",
    isActive: true
  },
  {
    id: "panama-tile",
    name: "Panama",
    category: "tile",
    subcategory: "Premium Border",
    price: 15000,
    image: "/lovable-uploads/b6d63246-ec6b-4137-9b83-6fe99f232ba3.png",
    description: "Geometric stone mosaic border with golden accents",
    warranty: "Lifetime Warranty",
    isActive: true
  }
];

// Tanning Ledges
export const tanningLedges: Product[] = [
  {
    id: "genesis-ledge",
    name: "Genesis",
    category: "ledge",
    subcategory: "Curved",
    price: 22000,
    image: "/lovable-uploads/2af253b1-b9be-487f-a998-476d396772c4.png",
    description: "Curved elegance with flowing lines for ultimate relaxation",
    dimensions: "8′ × 12′",
    depth: "6″ to 12″",
    features: ["Curved Design", "Built-in Seating", "Non-slip Surface", "Perfect for Lounging"],
    warranty: "Lifetime Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "hermosa-ledge",
    name: "Hermosa",
    category: "ledge",
    subcategory: "Curved",
    price: 24000,
    image: "/lovable-uploads/8228c334-6fd7-4b29-afae-98628493480d.png",
    description: "Sophisticated curved ledge with premium comfort features",
    dimensions: "6′ × 10′",
    depth: "6″ to 10″",
    features: ["Ergonomic Curve", "Heat Retention", "Easy Entry", "Stylish Profile"],
    warranty: "Lifetime Warranty",
    isActive: true
  },
  {
    id: "rectangle-ledge",
    name: "Rectangle",
    category: "ledge",
    subcategory: "Modern",
    price: 25000,
    image: "/lovable-uploads/c6bebb1e-d2ed-4591-b81d-0af558ed3e52.png",
    description: "Clean modern lines with maximum lounging space",
    dimensions: "8′ × 14′",
    depth: "8″ to 12″",
    features: ["Modern Design", "Spacious Layout", "Even Depth", "Contemporary Style"],
    warranty: "Lifetime Warranty",
    isActive: true
  }
];

// Consolidated Products Export
export const allProducts: Product[] = [
  ...poolFinishes,
  ...poolLiners,
  ...poolTiles,
  ...tanningLedges
];

// Helper functions for product management
export const getProductsByCategory = (category: Product['category']): Product[] => {
  return allProducts.filter(product => product.category === category && product.isActive);
};

export const getProductById = (id: string): Product | undefined => {
  return allProducts.find(product => product.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return allProducts.filter(product => 
    product.isActive && (
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.subcategory?.toLowerCase().includes(lowercaseQuery) ||
      product.collection?.toLowerCase().includes(lowercaseQuery)
    )
  );
};

export const getProductsBySubcategory = (category: Product['category'], subcategory: string): Product[] => {
  return allProducts.filter(product => 
    product.category === category && 
    product.subcategory === subcategory && 
    product.isActive
  );
};

// For backwards compatibility
export { poolFinishes as poolFinishesData };
export { poolLiners as poolLinersData };
export { poolTiles as poolTilesData };
export { tanningLedges as tanningLedgesData };