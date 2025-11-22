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

// Pool Finishes - Organized by Collection
export const poolFinishes: Product[] = [
  // Crystite Crystal Collection
  {
    id: "sapphire-blue-crystal",
    name: "Sapphire Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Crystite Crystal",
    price: 3500,
    image: "/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png",
    description: "A stunning deep blue with crystalline sparkle that creates a luxurious Caribbean feel",
    features: ["Crystal Sparkle", "Deep Blue Color", "UV Resistant", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "ocean-blue-crystal",
    name: "Ocean Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Crystite Crystal",
    price: 3500,
    image: "/lovable-uploads/2103693f-cf54-423d-99c7-68d6f3951388.png",
    description: "Deep ocean blue with crystal aggregates for a premium tropical look",
    features: ["Ocean Depth", "Crystal Finish", "UV Protection", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "night-sky-crystal",
    name: "Night Sky",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Crystite Crystal",
    price: 3500,
    image: "/lovable-uploads/90fe0136-31f1-4fa3-b816-56a7a74484fa.png",
    description: "Dark blue with brilliant crystal flecks that shimmer like stars in the night sky",
    features: ["Starlike Sparkle", "Dark Dramatic Look", "Crystal Aggregates", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "shale-gray-crystal",
    name: "Shale Gray",
    category: "finish",
    subcategory: "Light & Tranquil",
    collection: "Crystite Crystal",
    price: 3500,
    image: "/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png",
    description: "Sophisticated gray with crystal accents for a modern, refined appearance",
    features: ["Modern Gray", "Crystal Accents", "Contemporary Look", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "coastal-bronze-crystal",
    name: "Coastal Bronze",
    category: "finish",
    subcategory: "Rich & Vibrant",
    collection: "Crystite Crystal",
    price: 3500,
    image: "/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png",
    description: "Warm bronze tones with crystal sparkle reminiscent of coastal sunsets",
    features: ["Bronze Warmth", "Crystal Sparkle", "Coastal Appeal", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "pearl-white-crystal",
    name: "Pearl White",
    category: "finish",
    subcategory: "Light & Tranquil",
    collection: "Crystite Crystal",
    price: 3500,
    image: "/lovable-uploads/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.png",
    description: "Elegant white with pearl-like crystal finish for timeless sophistication",
    features: ["Pearl Luster", "Crystal Clarity", "Timeless Elegance", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },

  // Wonderlands World Collection - Exclusive Premium Finishes
  {
    id: "tahoe-blue-wonderlands",
    name: "Tahoe Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Wonderlands World",
    price: 4200,
    image: "/images/finishes/wonderlands-tahoe-blue.webp",
    description: "Rich blend of blue, beige, and black aggregates inspired by Lake Tahoe's pristine waters",
    features: ["Multi-Color Aggregate", "Premium Sparkle", "UV Resistant", "30-Year Warranty"],
    warranty: "30-Year Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "tropics-blue-wonderlands",
    name: "Tropics Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Wonderlands World",
    price: 4200,
    image: "/images/finishes/wonderlands-tropics-blue.webp",
    description: "Vibrant tropical blue with white and navy aggregates for an exotic paradise feel",
    features: ["Tropical Blue", "Deep Color Depth", "Premium Finish", "30-Year Warranty"],
    warranty: "30-Year Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "yosemite-wonderlands",
    name: "Yosemite",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Wonderlands World",
    price: 4200,
    image: "/images/finishes/wonderlands-yosemite.webp",
    description: "Bold blue with dramatic navy and white accents inspired by Yosemite's granite formations",
    features: ["Granite-Inspired", "Deep Blue", "High Contrast", "30-Year Warranty"],
    warranty: "30-Year Warranty",
    isActive: true
  },
  {
    id: "aqua-white-wonderlands",
    name: "Aqua White",
    category: "finish",
    subcategory: "Light & Tranquil",
    collection: "Wonderlands World",
    price: 4200,
    image: "/images/finishes/wonderlands-aqua-white.webp",
    description: "Serene aqua blue with white aggregates creating a tranquil, spa-like atmosphere",
    features: ["Spa-Like", "Soft Aqua", "White Accents", "30-Year Warranty"],
    warranty: "30-Year Warranty",
    isActive: true
  },
  {
    id: "marina-blue-wonderlands",
    name: "Marina Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Wonderlands World",
    price: 4200,
    image: "/images/finishes/wonderlands-marina-blue.webp",
    description: "Brilliant azure blue with crystalline white aggregates reminiscent of luxurious marinas",
    features: ["Azure Blue", "Crystal White", "Premium Luster", "30-Year Warranty"],
    warranty: "30-Year Warranty",
    isActive: true
  },
  {
    id: "midnight-blue-wonderlands",
    name: "Midnight Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Wonderlands World",
    price: 4200,
    image: "/images/finishes/wonderlands-midnight-blue.webp",
    description: "Sophisticated blend of blue, beige, and black creating a mysterious midnight water effect",
    features: ["Midnight Effect", "Multi-Tone", "Sophisticated", "30-Year Warranty"],
    warranty: "30-Year Warranty",
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