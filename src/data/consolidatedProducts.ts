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

// Pool Finishes
export const poolFinishes: Product[] = [
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
  }
];

// Pool Liners
export const poolLiners: Product[] = [
  {
    id: "paradise-glass",
    name: "Paradise",
    category: "liner",
    subcategory: "Glass",
    price: 4500,
    image: "/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.png",
    description: "Vibrant blue glass tiles with flowing striped patterns for a tropical paradise feel",
    warranty: "25-Year Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "water-lilies-glass",
    name: "Water Lilies",
    category: "liner",
    subcategory: "Glass",
    price: 4500,
    image: "/lovable-uploads/7f1b802e-1c58-4807-b6d6-41aab2eed1ca.png",
    description: "Serene blue and white striped glass tiles reminiscent of peaceful water gardens",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "sail-boat-glass",
    name: "Sail Boat",
    category: "liner",
    subcategory: "Glass",
    price: 4500,
    image: "/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.png",
    description: "Nautical-inspired mixed blue and brown striped glass tiles for coastal elegance",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "tikal-porcelain",
    name: "Tikal",
    category: "liner",
    subcategory: "Porcelain",
    price: 4500,
    image: "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png",
    description: "Marbled blue porcelain with premium durability and 25-year warranty",
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "san-marino-stone",
    name: "San Marino",
    category: "liner",
    subcategory: "Italian Stone",
    price: 4500,
    image: "/lovable-uploads/7f823d88-d9f2-4ecf-bcd1-a9d25d8519a8.png",
    description: "Dark granite Italian stone with luxury durability and 30-year warranty",
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