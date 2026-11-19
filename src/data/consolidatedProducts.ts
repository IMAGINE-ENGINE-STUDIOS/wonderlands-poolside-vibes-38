// Consolidated Products Database
// All products in the application - pools, finishes, liners, tiles, ledges, etc.

// Complete list of Latham pool models for compatibility mapping
const LATHAM_POOLS = [
  // Tuscan Collection
  "Tuscan 11.20", "Tuscan 13.24", "Tuscan 14.27", "Tuscan 14.30", "Tuscan 14.40", "Tuscan",
  // Classic Collection
  "Astoria", "Milan", "Jamaica", "Aruba", "St. Croix", "Rio",
  // Apollo Collection
  "Apollo 12", "Apollo 14", "Apollo",
  // Enchantment Collection
  "Enchantment 9.17", "Enchantment 9.21", "Enchantment 9.24", "Enchantment",
  // Resort Collection
  "Cancún Deluxe", "Cancun Deluxe", "Pleasant Cove", "St. Lucia", "Delray",
  // Island Collection
  "Java", "Bermuda", "Key West", "Valencia",
  // Vista Collection
  "Vista Isle", "Bay Isle", "Laguna",
  // Corinthian Collection
  "Corinthian 12", "Corinthian 12 BME", "Corinthian 14", "Corinthian 14 BME", "Corinthian",
  // Olympia Collection
  "Olympia 12", "Olympia 14", "Olympia 16", "Olympia",
  // Axiom Collection
  "Axiom 12 Deluxe", "Axiom 14", "Axiom 14 Deluxe", "Axiom 16", "Axiom",
  // Other Models
  "Claremont", "Genesis", "Cape Cod", "Coronado", "Synergy", "Laguna Deluxe"
];

export interface Product {
  id: string;
  name: string;
  category: 'pool' | 'finish' | 'liner' | 'tile' | 'ledge' | 'spa' | 'cover' | 'heater' | 'addon';
  subcategory?: string;
  collection?: string;
  poolType?: 'fiberglass' | 'concrete' | 'both'; // Which pool type this product is compatible with
  compatiblePools?: string[]; // Specific pool models/brands this finish is compatible with
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
  // Crystite Crystal Collection - LATHAM POOLS ONLY (Fiberglass)
  {
    id: "sapphire-blue-crystal",
    name: "Sapphire Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Crystite Crystal",
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 3500,
    image: "/media/390cf824-aed3-4f60-9fc3-f3910c0ffe44.webp",
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
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 3500,
    image: "/media/2103693f-cf54-423d-99c7-68d6f3951388.webp",
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
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 3500,
    image: "/media/90fe0136-31f1-4fa3-b816-56a7a74484fa.webp",
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
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 3500,
    image: "/media/15032ed4-f745-4152-ae9b-c26fdb52f68c.webp",
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
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 3500,
    image: "/media/b1abd5c3-af2e-46fa-82be-5db27d20a388.webp",
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
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 3500,
    image: "/media/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.webp",
    description: "Elegant white with pearl-like crystal finish for timeless sophistication",
    features: ["Pearl Luster", "Crystal Clarity", "Timeless Elegance", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },


  // Crystite Classic Collection - LATHAM POOLS ONLY (Fiberglass, standard gel coat G2)
  {
    id: "sapphire-blue-classic",
    name: "Sapphire Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Crystite Classic",
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 0,
    image: "/media/390cf824-aed3-4f60-9fc3-f3910c0ffe44.webp",
    description: "A vivid sky-blue standard gel coat for a clear, classic finish",
    features: ["Classic Gel Coat", "Sky Blue Color", "UV Resistant", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "ocean-blue-classic",
    name: "Ocean Blue",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Crystite Classic",
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 0,
    image: "/media/2103693f-cf54-423d-99c7-68d6f3951388.webp",
    description: "Deep oceanic blue standard gel coat for a classic tropical look",
    features: ["Classic Gel Coat", "Ocean Depth", "UV Protection", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "night-sky-classic",
    name: "Night Sky",
    category: "finish",
    subcategory: "Deep & Dramatic",
    collection: "Crystite Classic",
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 0,
    image: "/media/90fe0136-31f1-4fa3-b816-56a7a74484fa.webp",
    description: "Deep, dramatic dark blue standard gel coat reminiscent of a starry night",
    features: ["Classic Gel Coat", "Dark Dramatic Look", "Smooth Finish", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "shale-gray-classic",
    name: "Shale Gray",
    category: "finish",
    subcategory: "Light & Tranquil",
    collection: "Crystite Classic",
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 0,
    image: "/media/15032ed4-f745-4152-ae9b-c26fdb52f68c.webp",
    description: "Silver and grey hues in a standard gel coat for a modern, refined appearance",
    features: ["Classic Gel Coat", "Modern Gray", "Contemporary Look", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "coastal-bronze-classic",
    name: "Coastal Bronze",
    category: "finish",
    subcategory: "Rich & Vibrant",
    collection: "Crystite Classic",
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 0,
    image: "/media/b1abd5c3-af2e-46fa-82be-5db27d20a388.webp",
    description: "Warm copper and bronze tones in a standard gel coat with classic coastal appeal",
    features: ["Classic Gel Coat", "Bronze Warmth", "Coastal Appeal", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },
  {
    id: "whisper-white-classic",
    name: "Whisper White",
    category: "finish",
    subcategory: "Light & Tranquil",
    collection: "Crystite Classic",
    poolType: "fiberglass",
    compatiblePools: [...LATHAM_POOLS],
    price: 0,
    image: "/media/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.webp",
    description: "Soft white standard gel coat with hues pulled from where the ocean meets white Caribbean sand",
    features: ["Classic Gel Coat", "Soft White", "Timeless Elegance", "25-Year Warranty"],
    warranty: "25-Year Warranty",
    isActive: true
  },

  // Wonderlands World Collection - WONDERLANDS WORLD POOLS ONLY (Pebble Tec - Concrete)
  {
    id: "pt-pebbletec-black-marble",
    name: "Black Marble",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-black-marble.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-black-pearl",
    name: "Black Pearl",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-black-pearl.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true,
    isPopular: true
  },
  {
    id: "pt-pebbletec-midnight-blue",
    name: "Midnight Blue",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-midnight-blue.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-emerald-bay",
    name: "Emerald Bay",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-emerald-bay.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-tropical-breeze",
    name: "Tropical Breeze",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-tropical-breeze.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-tahoe-blue",
    name: "Tahoe Blue",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-tahoe-blue.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-caribbean-blue",
    name: "Caribbean Blue",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-caribbean-blue.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-blue-wave",
    name: "Blue Wave",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-blue-wave.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-blue-lagoon",
    name: "Blue Lagoon",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-blue-lagoon.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-sandy-beach",
    name: "Sandy Beach",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-sandy-beach.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-creme-de-menthe",
    name: "Creme De Menthe",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-creme-de-menthe.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-moonlight-grey",
    name: "Moonlight Grey",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-moonlight-grey.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-white-pearl",
    name: "White Pearl",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-white-pearl.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-soft-white",
    name: "Soft White",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-soft-white.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebbletec-sky-blue",
    name: "Sky Blue",
    category: "finish",
    subcategory: "Pebble Tec",
    collection: "Pebble Tec",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebbletec-sky-blue.webp",
    description: "The original exposed pebble surface — durable, richly textured",
    features: ["The original exposed pebble surface — durable, richly textured", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-black-eclipse",
    name: "Black Eclipse",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-black-eclipse.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-black-onyx",
    name: "Black Onyx",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-black-onyx.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-ocean-blue",
    name: "Ocean Blue",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-ocean-blue.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-turtle-bay",
    name: "Turtle Bay",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-turtle-bay.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-prism-blue",
    name: "Prism Blue",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-prism-blue.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-blue-granite",
    name: "Blue Granite",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-blue-granite.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-blue-surf",
    name: "Blue Surf",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-blue-surf.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-slate-blue",
    name: "Slate Blue",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-slate-blue.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-aqua-blue",
    name: "Aqua Blue",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-aqua-blue.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-bordeaux",
    name: "Bordeaux",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-bordeaux.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-desert-gold",
    name: "Desert Gold",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-desert-gold.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-irish-mist",
    name: "Irish Mist",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-irish-mist.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-french-grey",
    name: "French Grey",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-french-grey.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-white-diamonds",
    name: "White Diamonds",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-white-diamonds.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-cool-blue",
    name: "Cool Blue",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-cool-blue.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblesheen-arctic-white",
    name: "Arctic White",
    category: "finish",
    subcategory: "PebbleSheen",
    collection: "PebbleSheen",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblesheen-arctic-white.webp",
    description: "Smaller pebble, polished smooth underfoot",
    features: ["Smaller pebble, polished smooth underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-steel-grey",
    name: "Steel Grey",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-steel-grey.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-grigio",
    name: "Grigio",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-grigio.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-acquos",
    name: "Acquos",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-acquos.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-egyptian-sands",
    name: "Egyptian Sands",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-egyptian-sands.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-fresca-verde",
    name: "Fresca Verde",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-fresca-verde.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-bella-blue",
    name: "Bella Blue",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-bella-blue.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-cielo-blue",
    name: "Cielo Blue",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-cielo-blue.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblefina-classico",
    name: "Classico",
    category: "finish",
    subcategory: "PebbleFina",
    collection: "PebbleFina",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblefina-classico.webp",
    description: "The finest aggregate — silk underfoot",
    features: ["The finest aggregate — silk underfoot", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-tropicana",
    name: "Tropicana",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-tropicana.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-majestic-sound",
    name: "Majestic Sound",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-majestic-sound.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-deep-cove",
    name: "Deep Cove",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-deep-cove.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-clearwater",
    name: "Clearwater",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-clearwater.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-shoreline",
    name: "Shoreline",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-shoreline.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-oasis",
    name: "Oasis",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-oasis.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-sparkling-water",
    name: "Sparkling Water",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-sparkling-water.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-crystal-harbor",
    name: "Crystal Harbor",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-crystal-harbor.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-aqua-falls",
    name: "Aqua Falls",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-aqua-falls.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-vivid-shores",
    name: "Vivid Shores",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-vivid-shores.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebrilliance-glacier-bay",
    name: "Glacier Bay",
    category: "finish",
    subcategory: "PebbleBrilliance",
    collection: "PebbleBrilliance",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebrilliance-glacier-bay.webp",
    description: "Aggregate set with glass beads for light-catching sparkle",
    features: ["Aggregate set with glass beads for light-catching sparkle", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblequartz-white-classic",
    name: "White Classic",
    category: "finish",
    subcategory: "PebbleQuartz",
    collection: "PebbleQuartz",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblequartz-white-classic.webp",
    description: "Quartz aggregate — bright, colour-true water",
    features: ["Quartz aggregate — bright, colour-true water", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblequartz-aquarius",
    name: "Aquarius",
    category: "finish",
    subcategory: "PebbleQuartz",
    collection: "PebbleQuartz",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblequartz-aquarius.webp",
    description: "Quartz aggregate — bright, colour-true water",
    features: ["Quartz aggregate — bright, colour-true water", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblequartz-baja-blue",
    name: "Baja Blue",
    category: "finish",
    subcategory: "PebbleQuartz",
    collection: "PebbleQuartz",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblequartz-baja-blue.webp",
    description: "Quartz aggregate — bright, colour-true water",
    features: ["Quartz aggregate — bright, colour-true water", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblequartz-coastal-grey",
    name: "Coastal Grey",
    category: "finish",
    subcategory: "PebbleQuartz",
    collection: "PebbleQuartz",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblequartz-coastal-grey.webp",
    description: "Quartz aggregate — bright, colour-true water",
    features: ["Quartz aggregate — bright, colour-true water", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebreeze-silver-sea",
    name: "Silver Sea",
    category: "finish",
    subcategory: "PebbleBreeze",
    collection: "PebbleBreeze",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebreeze-silver-sea.webp",
    description: "Light, airy aggregate blend for shallow, luminous water",
    features: ["Light, airy aggregate blend for shallow, luminous water", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebreeze-fresh-water",
    name: "Fresh Water",
    category: "finish",
    subcategory: "PebbleBreeze",
    collection: "PebbleBreeze",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebreeze-fresh-water.webp",
    description: "Light, airy aggregate blend for shallow, luminous water",
    features: ["Light, airy aggregate blend for shallow, luminous water", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
    isActive: true
  },
  {
    id: "pt-pebblebreeze-gulf-shores",
    name: "Gulf Shores",
    category: "finish",
    subcategory: "PebbleBreeze",
    collection: "PebbleBreeze",
    poolType: "concrete",
    compatiblePools: ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral", "Royal Lake", "Royal Lake 8.10", "Royal Lake 10.16"], // Wonderlands World concrete pools only (Pebble Tec finishes)
    price: 4200,
    image: "/images/finishes/pebbletec/pebblebreeze-gulf-shores.webp",
    description: "Light, airy aggregate blend for shallow, luminous water",
    features: ["Light, airy aggregate blend for shallow, luminous water", "Pebble Tec Finish"],
    warranty: "Pebble Tec Limited Warranty",
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
    image: "/media/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.webp",
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
    image: "/media/7f1b802e-1c58-4807-b6d6-41aab2eed1ca.webp",
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
    image: "/media/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.webp",
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
    image: "/media/ee0c59a8-87bb-4b74-b6e9-9eeba3633e9f.webp",
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
    image: "/media/37536046-70f5-46b8-8422-84097ccdec08.webp",
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
    image: "/media/723a9c27-b7d5-4139-bda7-4eed2d0b23e8.webp",
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
    image: "/media/c8e3cc34-9fbe-4ece-af71-05b7e4f94332.webp",
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
    image: "/media/7dc956df-af5c-4c6b-b2af-6bc9d6fbf179.webp",
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
    image: "/media/96f46291-85e7-4b48-9465-623400a8e835.webp",
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
    image: "/media/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.webp",
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
    image: "/media/56fd62de-130b-4b90-98a0-596007f5dadb.webp",
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
    image: "/media/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.webp",
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
    image: "/media/7f823d88-d9f2-4ecf-bcd1-a9d25d8519a8.webp",
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
    image: "/media/797bcadb-19bc-4859-8319-ceb12ea23d10.webp",
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
    image: "/media/a378df22-0a67-4626-ac93-c6cf8fe37602.webp",
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
    image: "/media/b871f521-8e15-4ed4-ad20-1a3774f535cd.webp",
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
    image: "/media/c5cd2f96-d31a-446b-943b-6dd1620f6521.webp",
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
    image: "/media/5a4a4746-8777-4adb-84c6-c153dbdae3ad.webp",
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
    image: "/media/b6d63246-ec6b-4137-9b83-6fe99f232ba3.webp",
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
    image: "/media/2af253b1-b9be-487f-a998-476d396772c4.webp",
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
    image: "/media/8228c334-6fd7-4b29-afae-98628493480d.webp",
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
    image: "/media/c6bebb1e-d2ed-4591-b81d-0af558ed3e52.webp",
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

export const getProductsByPoolType = (category: Product['category'], poolType: 'fiberglass' | 'concrete'): Product[] => {
  return allProducts.filter(product => 
    product.category === category && 
    (product.poolType === poolType || product.poolType === 'both') &&
    product.isActive
  );
};

export const getProductsByCompatiblePool = (category: Product['category'], poolModel: string): Product[] => {
  return allProducts.filter(product => {
    if (product.category !== category || !product.isActive) return false;
    if (!product.compatiblePools) return true;
    // Support both exact match and prefix match (e.g., "Astoria 12" matches "Astoria")
    return product.compatiblePools.some(compatible => 
      compatible === poolModel || poolModel.startsWith(compatible)
    );
  });
};

// For backwards compatibility
export { poolFinishes as poolFinishesData };
export { poolLiners as poolLinersData };
export { poolTiles as poolTilesData };
export { tanningLedges as tanningLedgesData };