
// Pool data shared across components
// Liners: $20/sqft installed, $15/sheet material only

// Import GlimmerGlass tanning ledge images
import glimmerglassParadise from '@/assets/tanning-ledges/glimmerglass-paradise.png';
import glimmerglassLeeward from '@/assets/tanning-ledges/glimmerglass-leeward.png';
import glimmerglassLeisure from '@/assets/tanning-ledges/glimmerglass-leisure.png';

export const poolLiners = [
  // Glass Tile Collection
  {
    name: "Paradise",
    type: "Glass",
    price: 20, // Per sqft installed
    pricePerSheet: 15, // Per sheet material only
    image: "/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.webp",
    description: "Vibrant blue glass tiles with flowing striped patterns for a tropical paradise feel"
  },
  {
    name: "Water Lilies",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/7f1b802e-1c58-4807-b6d6-41aab2eed1ca.webp",
    description: "Serene blue and white striped glass tiles reminiscent of peaceful water gardens"
  },
  {
    name: "Sail Boat",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.webp",
    description: "Nautical-inspired mixed blue and brown striped glass tiles for coastal elegance"
  },
  {
    name: "Stormy",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/ee0c59a8-87bb-4b74-b6e9-9eeba3633e9f.webp",
    description: "Dramatic neutral and brown striped glass tiles with stormy weather appeal"
  },
  {
    name: "Ballad",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/37536046-70f5-46b8-8422-84097ccdec08.webp",
    description: "Mixed blue mosaic glass tiles with artistic patterns and flowing design"
  },
  {
    name: "Galant",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/723a9c27-b7d5-4139-bda7-4eed2d0b23e8.webp",
    description: "Elegant blue mosaic glass tiles with iridescent effects and sophisticated style"
  },
  {
    name: "Melody",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/c8e3cc34-9fbe-4ece-af71-05b7e4f94332.webp",
    description: "Harmonious iridescent glass tiles with rainbow shimmer and artistic flair"
  },
  {
    name: "Soul",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/7dc956df-af5c-4c6b-b2af-6bc9d6fbf179.webp",
    description: "Sophisticated gray and white mosaic glass tiles with deep, soulful character"
  },
  {
    name: "Glacier",
    type: "Glass",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/96f46291-85e7-4b48-9465-623400a8e835.webp",
    description: "Cool glacier-inspired glass tiles with decorative borders and flowing patterns"
  },
  // Porcelain & Stone Collection
  {
    name: "Tikal",
    type: "Porcelain",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.webp",
    description: "Marbled blue porcelain with premium durability and 25-year warranty"
  },
  {
    name: "Port Royal",
    type: "Porcelain",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/56fd62de-130b-4b90-98a0-596007f5dadb.webp",
    description: "Deep ocean blue porcelain with premium durability and 25-year warranty"
  },
  {
    name: "Alexandria",
    type: "Porcelain",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.webp",
    description: "Golden marble porcelain with premium durability and 25-year warranty"
  },
  {
    name: "San Marino",
    type: "Italian Stone",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/7f823d88-d9f2-4ecf-bcd1-a9d25d8519a8.webp",
    description: "Dark granite Italian stone with luxury durability and 30-year warranty"
  },
  {
    name: "Firenze",
    type: "Italian Stone",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.webp",
    description: "Blue grey marble Italian stone with luxury durability and 30-year warranty"
  },
  {
    name: "Naples",
    type: "Italian Stone",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/a378df22-0a67-4626-ac93-c6cf8fe37602.webp",
    description: "Warm beige stone Italian stone with luxury durability and 30-year warranty"
  },
  {
    name: "Milan",
    type: "Italian Stone",
    price: 20,
    pricePerSheet: 15,
    image: "/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.webp",
    description: "Charcoal stone Italian stone with luxury durability and 30-year warranty"
  }
];

// Pool tile options (premium upgrade)
export const poolTiles = [
  {
    name: "Mountain",
    price: 15000,
    image: "/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.webp",
    description: "Natural stone-look mosaic border with decorative diamond pattern"
  },
  {
    name: "Carnegie", 
    price: 15000,
    image: "/lovable-uploads/5a4a4746-8777-4adb-84c6-c153dbdae3ad.webp",
    description: "Elegant diamond mosaic border with rich blue tones"
  },
  {
    name: "Panama",
    price: 15000,
    image: "/lovable-uploads/b6d63246-ec6b-4137-9b83-6fe99f232ba3.webp",
    description: "Geometric stone mosaic border with golden accents"
  },
  {
    name: "Corolla",
    price: 15000,
    image: "/lovable-uploads/4f27a800-295b-476c-924c-1790ab191a5c.webp",
    description: "Contemporary wave pattern border in deep blue"
  },
  {
    name: "Summerwave",
    price: 15000,
    image: "/lovable-uploads/cd46eae1-1354-4459-84fe-890ad56d16d7.webp",
    description: "Flowing wave mosaic pattern with ocean-inspired design"
  },
  {
    name: "Legends",
    price: 15000,
    image: "/lovable-uploads/23b627a0-fda7-408d-bb6e-d41308f8ea6a.webp",
    description: "Ornate decorative border with flowing artistic elements"
  },
  {
    name: "Z terrazzo",
    price: 15000,
    image: "/lovable-uploads/107aebee-8f2d-4c04-a51f-f2acf731860e.webp",
    description: "Classic terrazzo-style mosaic with fan pattern detail"
  },
  {
    name: "Tullism",
    price: 15000,
    image: "/lovable-uploads/eb055418-8b18-40d1-af88-613c4c275b20.webp",
    description: "Luxury glass tile interior with sophisticated pattern"
  },
  {
    name: "Courtstone Gray",
    price: 15000,
    image: "/lovable-uploads/86d04882-f51e-4b4b-9c89-34031c370138.webp",
    description: "Contemporary gray stone tile border with modern appeal"
  },
  {
    name: "Courtstone Blue",
    price: 15000,
    image: "/lovable-uploads/e3edd8ff-9c8e-4b4a-b540-1f735f98548f.webp",
    description: "Sophisticated blue stone tile border for elegant pools"
  },
  {
    name: "Nantuke",
    price: 15000,
    image: "/lovable-uploads/0cd49ce9-1874-458c-9a9f-a9828d1879a5.webp",
    description: "Elegant wave-pattern mosaic border with flowing blue and white tones"
  },
  {
    name: "Esagoni",
    price: 15000,
    image: "/lovable-uploads/e7e9e75d-bd96-4d35-b0fa-7b4dd20c67a8.webp",
    description: "Contemporary hexagonal mosaic tile border in deep ocean blues"
  },
  {
    name: "Whitehaven",
    price: 15000,
    image: "/lovable-uploads/805c3cea-4684-4e5b-acae-3405dc854aac.webp",
    description: "Sophisticated diamond pattern border with intricate mosaic detail"
  },
  {
    name: "Island Wave",
    price: 15000,
    image: "/lovable-uploads/a985de5c-c9d0-4a3d-8584-b54f877870b9.webp",
    description: "Tropical wave-inspired border with flowing aqua and blue design"
  },
  {
    name: "Durango Gray",
    price: 15000,
    image: "/lovable-uploads/58cf10b7-a125-4e4f-be0b-6a0deb095bac.webp",
    description: "Modern gray-toned decorative border with artistic arch pattern"
  },
  {
    name: "Vintage Blue",
    price: 15000,
    image: "/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.webp",
    description: "Classic blue mosaic tile border with timeless decorative elements"
  },
  {
    name: "Royal Blue",
    price: 15000,
    image: "/lovable-uploads/d1c1d059-1d8d-4481-9f17-d2a5e2f89ebd.webp",
    description: "Regal blue and gold decorative border with ornate tile pattern"
  },
  {
    name: "Gulf Coast",
    price: 15000,
    image: "/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.webp",
    description: "Coastal-inspired mosaic border with flowing rope-like pattern"
  },
  {
    name: "Hamper",
    price: 15000,
    image: "/lovable-uploads/85d596d1-7479-4926-9732-a76fdac75eee.webp",
    description: "Elegant paisley-inspired decorative border with sophisticated blue tones"
  }
];

// Tanning ledge options - prices use 4x dealer multiplier
// Latham Tanning Ledges
export const lathamTanningLedges = [
  {
    name: "Hermosa Tanning Ledge",
    price: 14680, // dealer price ~3670 × 4
    image: "/lovable-uploads/8228c334-6fd7-4b29-afae-98628493480d.webp",
    description: "Sophisticated curved ledge with premium comfort features",
    dimensions: "6′ × 10′",
    depth: "6″ to 10″",
    brand: "Latham",
    features: ["Ergonomic Curve", "Heat Retention", "Easy Entry", "Stylish Profile"]
  },
  {
    name: "Rectangle Tanning Ledge",
    price: 21771, // dealer price ~5443 × 4
    image: "/lovable-uploads/c6bebb1e-d2ed-4591-b81d-0af558ed3e52.webp",
    description: "Clean modern lines with maximum lounging space",
    dimensions: "8′ × 14′",
    depth: "8″ to 12″",
    brand: "Latham",
    features: ["Modern Design", "Spacious Layout", "Even Depth", "Contemporary Style"]
  }
];

// GlimmerGlass Tanning Ledges
export const glimmerglassTanningLedges = [
  {
    name: "Paradise",
    price: 18000, // 4500 × 4
    image: glimmerglassParadise,
    description: "Premium GlimmerGlass tanning ledge with paradise comfort and rectangular design",
    dimensions: "9′ × 19′",
    depth: "6″ to 10″",
    brand: "GlimmerGlass",
    features: ["Premium Comfort", "Beach Entry", "UV Resistant", "Easy Maintenance"]
  },
  {
    name: "Leeward",
    price: 14116, // 3529 × 4
    image: glimmerglassLeeward,
    description: "Organic freeform GlimmerGlass tanning ledge with natural curves",
    dimensions: "8′1″ × 11′6″",
    depth: "6″ to 8″",
    brand: "GlimmerGlass",
    features: ["Freeform Shape", "Ergonomic Design", "UV Resistant", "Easy Entry"]
  },
  {
    name: "Leisure",
    price: 16000, // 4000 × 4
    image: glimmerglassLeisure,
    description: "Semi-circular GlimmerGlass tanning ledge for elegant relaxation",
    dimensions: "8′ × 12′",
    depth: "6″ to 10″",
    brand: "GlimmerGlass",
    features: ["Semi-Circular Design", "Premium Finish", "UV Resistant", "Maximum Comfort"]
  }
];

// Combined tanning ledges for backward compatibility
export const tanningLedges = [...lathamTanningLedges, ...glimmerglassTanningLedges];
