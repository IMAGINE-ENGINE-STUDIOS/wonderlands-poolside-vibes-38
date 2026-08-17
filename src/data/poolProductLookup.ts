// Pool product lookup with dimensions and images for AI search display
// This provides a unified lookup for product cards to show tech specs
// Updated with ALL products from catalog - 3.5x/4x dealer multipliers applied

// Import Wonderlands pool images
import madrePerlaImage from '@/assets/pools/madre-perla.webp';
import capeCod12Image from '@/assets/pools/cape-cod.webp';
import maximaImage from '@/assets/pools/concrete/maxima-pool.webp';
import pacificRidgeImage from '@/assets/pools/pacific-ridge-new.webp';
import cancunDeluxeImage from '@/assets/pools/cancun-deluxe.webp';
import wonderPalaceImage from '@/assets/pools/wonderpalace.webp';

// Import Latham/Axiom pool images
import axiom14DeluxeMain from '@/assets/pools/axiom-14-deluxe-main.webp';
import axiom16Main from '@/assets/pools/axiom-16-main.webp';
import enchantment917LookupImage from '@/assets/pools/enchantment-917.webp';

// Import GlimmerGlass pool images
import gilmerAloha from '@/assets/pools/glimmerglass/gilmer-aloha.webp';
import gilmerAtlantis from '@/assets/pools/glimmerglass/gilmer-atlantis.webp';
import gilmerBeachcomber from '@/assets/pools/glimmerglass/gilmer-beachcomber.webp';
import gilmerBallagio from '@/assets/pools/glimmerglass/gilmer-ballagio.webp';
import gilmerCapri from '@/assets/pools/glimmerglass/gilmer-capri.webp';
import gilmerCaribbean from '@/assets/pools/glimmerglass/gilmer-caribbean.webp';
import gilmerCoralCove from '@/assets/pools/glimmerglass/gilmer-coral-cove.webp';
import gilmerCostaBrava from '@/assets/pools/glimmerglass/gilmer-costa-brava.webp';
import gilmerEmerald from '@/assets/pools/glimmerglass/gilmer-emerald.webp';
import gilmerGoldCoast from '@/assets/pools/glimmerglass/gilmer-gold-coast.webp';
import gilmerGrandCayman from '@/assets/pools/glimmerglass/gilmer-grand-cayman.webp';
import gilmerIslander from '@/assets/pools/glimmerglass/gilmer-islander.webp';
import gilmerMajestic from '@/assets/pools/glimmerglass/gilmer-majestic.webp';
import gilmerMystic from '@/assets/pools/glimmerglass/gilmer-mystic.webp';
import gilmerNeptune from '@/assets/pools/glimmerglass/gilmer-neptune.webp';
import gilmerNewport from '@/assets/pools/glimmerglass/gilmer-newport.webp';
import gilmerPonceXL from '@/assets/pools/glimmerglass/gilmer-ponce-xl.webp';
import gilmerRegalPlunge from '@/assets/pools/glimmerglass/gilmer-regal-plunge.webp';
import gilmerRetreat from '@/assets/pools/glimmerglass/gilmer-retreat.webp';
import gilmerRoman from '@/assets/pools/glimmerglass/gilmer-roman.webp';
import gilmerSerafina from '@/assets/pools/glimmerglass/gilmer-serafina.webp';
import gilmerSerenade from '@/assets/pools/glimmerglass/gilmer-serenade.webp';
import gilmerSilverShore from '@/assets/pools/glimmerglass/gilmer-silver-shore.webp';
import gilmerRegal from '@/assets/pools/glimmerglass/gilmer-regal.webp';
import gilmerSuperior from '@/assets/pools/glimmerglass/gilmer-superior.webp';
import gilmerTortola from '@/assets/pools/glimmerglass/gilmer-tortola.webp';
import gilmerVision from '@/assets/pools/glimmerglass/gilmer-vision.webp';

// Import tanning ledge images
import glimmerglassParadise from '@/assets/tanning-ledges/glimmerglass-paradise.webp';
import glimmerglassLeeward from '@/assets/tanning-ledges/glimmerglass-leeward.webp';
import glimmerglassLeisure from '@/assets/tanning-ledges/glimmerglass-leisure.webp';

export interface PoolProductInfo {
  name: string;
  dimensions: string;
  depth: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
}

// Consolidated product lookup map - key is lowercase name for matching
export const poolProductLookup: Record<string, PoolProductInfo> = {
  // ============================================
  // WONDERLANDS CONCRETE POOLS
  // ============================================
  "cape coral": { name: "Cape Coral", dimensions: "14' × 28'", depth: "6'", price: 85000, image: wonderPalaceImage, category: "Pool", brand: "Wonderlands" },
  "madre perla": { name: "Madre Perla", dimensions: "20' × 40'", depth: "3'11\" - 9'", price: 168438, image: madrePerlaImage, category: "Pool", brand: "Wonderlands" },
  "maxima": { name: "Maxima", dimensions: "16' × 40'", depth: "3'9\" - 8'6\"", price: 144375, image: maximaImage, category: "Pool", brand: "Wonderlands" },
  "pacific ridge": { name: "Pacific Ridge", dimensions: "14' × 32'", depth: "3'6\" - 6'", price: 96250, image: pacificRidgeImage, category: "Pool", brand: "Wonderlands" },
  "winderview": { name: "Winderview", dimensions: "15.5' × 31'", depth: "3'6\" - 6'", price: 91875, image: "/lovable-uploads/winderview-pool.webp", category: "Pool", brand: "Wonderlands" },
  "cancún deluxe": { name: "Cancún Deluxe", dimensions: "16' × 35'", depth: "4'3\" - 6'6\"; Spa 3'", price: 112875, image: cancunDeluxeImage, category: "Pool", brand: "Latham" },
  "cancun deluxe": { name: "Cancún Deluxe", dimensions: "16' × 35'", depth: "4'3\" - 6'6\"; Spa 3'", price: 112875, image: cancunDeluxeImage, category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Astoria Series
  // ============================================
  "astoria 12": { name: "Astoria 12", dimensions: "12' × 25'", depth: "3'6\" - 6'", price: 81900, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp", category: "Pool", brand: "Latham" },
  "astoria 14": { name: "Astoria 14", dimensions: "14' × 35'", depth: "3'6\" - 6'6\"; Spa 3'", price: 97825, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp", category: "Pool", brand: "Latham" },
  "astoria 16": { name: "Astoria 16", dimensions: "16' × 40'", depth: "3'6\" - 8'", price: 110338, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Milan Series (Compact)
  // ============================================
  "milan 8.14": { name: "Milan 8.14", dimensions: "8' × 14'", depth: "4'", price: 31150, image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.webp", category: "Pool", brand: "Latham" },
  "milan 10.16": { name: "Milan 10.16", dimensions: "10' × 16'", depth: "4'", price: 41650, image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.webp", category: "Pool", brand: "Latham" },
  "milan 10.20": { name: "Milan 10.20", dimensions: "10' × 20'", depth: "4'", price: 51100, image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Jamaica Series
  // ============================================
  "jamaica 10": { name: "Jamaica 10", dimensions: "10' × 20'", depth: "3'2\" - 5'", price: 42350, image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.webp", category: "Pool", brand: "Latham" },
  "jamaica 12": { name: "Jamaica 12", dimensions: "12' × 24'", depth: "3'2\" - 5'", price: 52150, image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.webp", category: "Pool", brand: "Latham" },
  "jamaica 14": { name: "Jamaica 14", dimensions: "14' × 28'", depth: "3'2\" - 5'", price: 60200, image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Standard/Deluxe
  // ============================================
  "aruba": { name: "Aruba", dimensions: "11' × 22'", depth: "3'6\" - 5'", price: 47163, image: "/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.webp", category: "Pool", brand: "Latham" },
  "pleasant cove": { name: "Pleasant Cove", dimensions: "11' × 22'", depth: "3'6\" - 5'6\"", price: 47163, image: "/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.webp", category: "Pool", brand: "Latham" },
  "delray": { name: "Delray", dimensions: "12' × 24'", depth: "3'6\" - 5'6\"", price: 54513, image: "/lovable-uploads/f549e4e8-647d-4b21-8d48-441f83955c73.webp", category: "Pool", brand: "Latham" },
  "key west": { name: "Key West", dimensions: "13' × 26'", depth: "3'6\" - 5'6\"", price: 59150, image: "/lovable-uploads/4e43c832-af03-4cf4-9104-0117e5f3321c.webp", category: "Pool", brand: "Latham" },
  "cape cod 12": { name: "Cape Cod 12", dimensions: "12' × 24'", depth: "3'6\" - 5'6\"", price: 55125, image: capeCod12Image, category: "Pool", brand: "Latham" },
  "valencia": { name: "Valencia", dimensions: "12' × 28'", depth: "3'6\" - 5'6\"", price: 51144, image: "/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.webp", category: "Pool", brand: "Latham" },
  "vista isle": { name: "Vista Isle", dimensions: "13' × 27'", depth: "3'6\" - 5'6\"", price: 64313, image: "/lovable-uploads/6a41df5e-d6f6-4e49-aa1a-b457ac1902a0.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Bermuda Series
  // ============================================
  "bermuda 12": { name: "Bermuda 12", dimensions: "12' × 24'", depth: "3'6\" - 5'6\"", price: 56525, image: "/lovable-uploads/bermuda-pool.webp", category: "Pool", brand: "Latham" },
  "bermuda 12 deluxe": { name: "Bermuda 12 Deluxe", dimensions: "12' × 24'", depth: "3'6\" - 5'6\"", price: 70000, image: "/lovable-uploads/bermuda-pool.webp", category: "Pool", brand: "Latham" },
  "bermuda 14": { name: "Bermuda 14", dimensions: "14' × 28'", depth: "3'6\" - 5'6\"", price: 75950, image: "/lovable-uploads/bermuda-pool.webp", category: "Pool", brand: "Latham" },
  "bermuda 14 deluxe": { name: "Bermuda 14 Deluxe", dimensions: "14' × 28'", depth: "3'6\" - 5'6\"", price: 87588, image: "/lovable-uploads/bermuda-pool.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Enchantment Series
  // ============================================
  "enchantment 9.17": { name: "Enchantment 9.17", dimensions: "9'1\" × 17'5\"", depth: "~4'9\"", price: 44100, image: enchantment917LookupImage, category: "Pool", brand: "Latham" },
  "enchantment 9.21": { name: "Enchantment 9.21", dimensions: "9'1\" × 20'7\"", depth: "~4'9\"", price: 50050, image: "/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.webp", category: "Pool", brand: "Latham" },
  "enchantment 9.24": { name: "Enchantment 9.24", dimensions: "9'1\" × 24'", depth: "~4'9\"", price: 55913, image: "/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Tuscan Series
  // ============================================
  "tuscan 11.20": { name: "Tuscan 11.20", dimensions: "11' × 20'", depth: "3'6\" - 5'6\"", price: 51975, image: "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.webp", category: "Pool", brand: "Latham" },
  "tuscan 13.24": { name: "Tuscan 13.24", dimensions: "13' × 24'", depth: "3'6\" - 5'6\"", price: 63788, image: "/lovable-uploads/2677d17d-ba82-407b-896c-b4b3e238b8d5.webp", category: "Pool", brand: "Latham" },
  "tuscan 14.27": { name: "Tuscan 14.27", dimensions: "14' × 27'", depth: "3'6\" - 5'6\"", price: 73500, image: "/lovable-uploads/de3068d3-0f04-4a3c-a2ed-f52141f36b3e.webp", category: "Pool", brand: "Latham" },
  "tuscan 14.30": { name: "Tuscan 14.30", dimensions: "14' × 30'", depth: "3'6\" - 5'6\"", price: 81113, image: "/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.webp", category: "Pool", brand: "Latham" },
  "tuscan 14.40": { name: "Tuscan 14.40", dimensions: "14' × 40'", depth: "3'6\" - 6'", price: 102025, image: "/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Corinthian Series
  // ============================================
  "corinthian 12": { name: "Corinthian 12", dimensions: "12' × 25'", depth: "3'6\" - 6'", price: 69300, image: "/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.webp", category: "Pool", brand: "Latham" },
  "corinthian 12 bme": { name: "Corinthian 12 BME", dimensions: "12' × 25'", depth: "3'6\" - 6'", price: 72800, image: "/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.webp", category: "Pool", brand: "Latham" },
  "corinthian 14": { name: "Corinthian 14", dimensions: "14' × 32'", depth: "3'6\" - 6'6\"", price: 86888, image: "/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.webp", category: "Pool", brand: "Latham" },
  "corinthian 14 bme": { name: "Corinthian 14 BME", dimensions: "14' × 32'", depth: "3'6\" - 6'6\"", price: 90388, image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Olympia Series
  // ============================================
  "olympia 12": { name: "Olympia 12", dimensions: "12' × 25'", depth: "3'6\" - 6'", price: 70088, image: "/lovable-uploads/olympia-pool.webp", category: "Pool", brand: "Latham" },
  "olympia 14": { name: "Olympia 14", dimensions: "14' × 32'", depth: "3'6\" - 6'6\"", price: 88550, image: "/lovable-uploads/olympia-pool.webp", category: "Pool", brand: "Latham" },
  "olympia 16": { name: "Olympia 16", dimensions: "16' × 40'", depth: "3'6\" - 8'", price: 93363, image: "/lovable-uploads/olympia-pool.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Axiom Series
  // ============================================
  "axiom 12 deluxe": { name: "Axiom 12 Deluxe", dimensions: "12' × 28'", depth: "3'6\" - 6'", price: 69213, image: "/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.webp", category: "Pool", brand: "Latham" },
  "axiom 14": { name: "Axiom 14", dimensions: "14' × 32'", depth: "3'6\" - 6'", price: 80500, image: "/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.webp", category: "Pool", brand: "Latham" },
  "axiom 14 deluxe": { name: "Axiom 14 Deluxe", dimensions: "14' × 30'", depth: "4'6\" - 5'6\"; Spa 3'", price: 87413, image: axiom14DeluxeMain, category: "Pool", brand: "Latham" },
  "axiom 16": { name: "Axiom 16", dimensions: "16' × 35'", depth: "4'6\" - 6'6\"", price: 94500, image: axiom16Main, category: "Pool", brand: "Latham" },

  // ============================================
  // LATHAM FIBERGLASS POOLS - Premium/Deluxe
  // ============================================
  "bay isle": { name: "Bay Isle", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 73938, image: "/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.webp", category: "Pool", brand: "Latham" },
  "claremont": { name: "Claremont", dimensions: "14' × 32'", depth: "3'6\" - 6'", price: 76738, image: "/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.webp", category: "Pool", brand: "Latham" },
  "laguna": { name: "Laguna", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 64543, image: "/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.webp", category: "Pool", brand: "Latham" },
  "laguna deluxe": { name: "Laguna Deluxe", dimensions: "14' × 35'", depth: "3'6\" - 6'", price: 74419, image: "/lovable-uploads/laguna-deluxe-pool.webp", category: "Pool", brand: "Latham" },
  "coronado": { name: "Coronado", dimensions: "16' × 32'", depth: "3'6\" - 6'", price: 78750, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp", category: "Pool", brand: "Latham" },
  "synergy": { name: "Synergy", dimensions: "16' × 36'", depth: "3'6\" - 6'", price: 80763, image: "/lovable-uploads/1c6556f8-0571-434d-a877-e5152aee1726.webp", category: "Pool", brand: "Latham" },

  // ============================================
  // GLIMMERGLASS POOLS - Compact
  // ============================================
  "serafina": { name: "Serafina", dimensions: "8'6\" × 14'", depth: "3'6\" - 4'", price: 35823, image: gilmerSerafina, category: "Pool", brand: "Glimmerglass" },
  "coral cove": { name: "Coral Cove", dimensions: "9'6\" × 16'", depth: "3'6\" - 4'", price: 38500, image: gilmerCoralCove, category: "Pool", brand: "Glimmerglass" },
  "retreat": { name: "Retreat", dimensions: "10'3\" × 18'5\"", depth: "3'6\" - 4'4\"", price: 37888, image: gilmerRetreat, category: "Pool", brand: "Glimmerglass" },
  "regal plunge": { name: "Regal Plunge", dimensions: "10' × 16'", depth: "4' - 5'5\"", price: 42438, image: gilmerRegalPlunge, category: "Pool", brand: "Glimmerglass" },
  "regal spa": { name: "Regal Spa", dimensions: "10' × 20'", depth: "3'6\" - 5'4\"", price: 49000, image: gilmerRegal, category: "Pool", brand: "Glimmerglass" },
  "mini extreme": { name: "Mini Extreme", dimensions: "8'2\" × 20'", depth: "3'6\" - 5'", price: 57750, image: "/lovable-uploads/gilmer-extreme-27.webp", category: "Pool", brand: "Glimmerglass" },

  // ============================================
  // GLIMMERGLASS POOLS - Standard
  // ============================================
  "caribbean": { name: "Caribbean", dimensions: "11' × 20'", depth: "3'6\" - 5'", price: 48178, image: gilmerCaribbean, category: "Pool", brand: "Glimmerglass" },
  "neptune": { name: "Neptune", dimensions: "11' × 23'", depth: "3'6\" - 5'6\"", price: 51471, image: gilmerNeptune, category: "Pool", brand: "Glimmerglass" },
  "islander": { name: "Islander", dimensions: "12' × 24'", depth: "3'6\" - 5'6\"", price: 49000, image: gilmerIslander, category: "Pool", brand: "Glimmerglass" },
  "emerald": { name: "Emerald", dimensions: "12' × 25'", depth: "3'6\" - 5'7\"", price: 51471, image: gilmerEmerald, category: "Pool", brand: "Glimmerglass" },

  // ============================================
  // GLIMMERGLASS POOLS - Deluxe
  // ============================================
  "roman": { name: "Roman", dimensions: "11' × 27'", depth: "3'6\" - 6'2\"", price: 57750, image: gilmerRoman, category: "Pool", brand: "Glimmerglass" },
  "superior": { name: "Superior", dimensions: "12' × 25'8\"", depth: "3'6\" - 5'6\"", price: 57750, image: gilmerSuperior, category: "Pool", brand: "Glimmerglass" },
  "capri": { name: "Capri", dimensions: "12' × 28'", depth: "3'6\" - 4'6\"", price: 55587, image: gilmerCapri, category: "Pool", brand: "Glimmerglass" },
  "costa brava": { name: "Costa Brava", dimensions: "12' × 29'", depth: "3'6\" - 6'", price: 55587, image: gilmerCostaBrava, category: "Pool", brand: "Glimmerglass" },
  "majestic": { name: "Majestic", dimensions: "13' × 25'6\"", depth: "3'6\" - 6'", price: 54513, image: gilmerMajestic, category: "Pool", brand: "Glimmerglass" },

  // ============================================
  // GLIMMERGLASS POOLS - Premium
  // ============================================
  "gold coast w/ built-in spa": { name: "Gold Coast w/ Spa", dimensions: "14' × 28'", depth: "3'6\" - 5'8\"", price: 75250, image: gilmerGoldCoast, category: "Pool", brand: "Glimmerglass" },
  "gold coast": { name: "Gold Coast", dimensions: "14' × 28'", depth: "3'6\" - 5'8\"", price: 75250, image: gilmerGoldCoast, category: "Pool", brand: "Glimmerglass" },
  "atlantis": { name: "Atlantis", dimensions: "14' × 32'", depth: "3'6\" - 6'", price: 75250, image: gilmerAtlantis, category: "Pool", brand: "Glimmerglass" },
  "extreme 27": { name: "Extreme 27", dimensions: "12'6\" × 27'", depth: "3'6\" - 5'11\"", price: 66500, image: "/lovable-uploads/gilmer-extreme-27.webp", category: "Pool", brand: "Glimmerglass" },
  "extreme 27 w/ built-in spa & splash deck": { name: "Extreme 27 w/ Spa", dimensions: "12'6\" × 27'", depth: "3'6\" - 5'11\"", price: 66500, image: "/lovable-uploads/gilmer-extreme-27.webp", category: "Pool", brand: "Glimmerglass" },
  "tortola": { name: "Tortola", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 68250, image: gilmerTortola, category: "Pool", brand: "Glimmerglass" },
  "silver shore": { name: "Silver Shore", dimensions: "15' × 28'", depth: "3'6\" - 6'", price: 57313, image: gilmerSilverShore, category: "Pool", brand: "Glimmerglass" },
  "mystic spa": { name: "Mystic Spa", dimensions: "15' × 32'", depth: "3'6\" - 6'", price: 77000, image: gilmerMystic, category: "Pool", brand: "Glimmerglass" },
  "aloha": { name: "Aloha", dimensions: "15' × 34'", depth: "3'6\" - 6'", price: 77000, image: gilmerAloha, category: "Pool", brand: "Glimmerglass" },
  "bellagio": { name: "Bellagio", dimensions: "15' × 34'", depth: "3'6\" - 6'6\"", price: 77000, image: gilmerBallagio, category: "Pool", brand: "Glimmerglass" },
  "extreme 38": { name: "Extreme 38", dimensions: "15'6\" × 38'", depth: "3'6\" - 7'", price: 92750, image: "/lovable-uploads/gilmer-extreme-38.webp", category: "Pool", brand: "Glimmerglass" },
  "extreme 38 w/ built-in spa & splash deck": { name: "Extreme 38 w/ Spa", dimensions: "15'6\" × 38'", depth: "3'6\" - 7'", price: 92750, image: "/lovable-uploads/gilmer-extreme-38.webp", category: "Pool", brand: "Glimmerglass" },
  "ponce xl": { name: "Ponce XL", dimensions: "15'6\" × 32'", depth: "3'6\" - 6'", price: 82250, image: gilmerPonceXL, category: "Pool", brand: "Glimmerglass" },
  "newport": { name: "Newport", dimensions: "16' × 35'", depth: "3'6\" - 6'", price: 77000, image: gilmerNewport, category: "Pool", brand: "Glimmerglass" },
  "serenade w/ built-in spa": { name: "Serenade w/ Spa", dimensions: "16' × 38'", depth: "6'", price: 100471, image: gilmerSerenade, category: "Pool", brand: "Glimmerglass" },
  "serenade": { name: "Serenade", dimensions: "16' × 38'", depth: "6'", price: 100471, image: gilmerSerenade, category: "Pool", brand: "Glimmerglass" },
  "beachcomber": { name: "Beachcomber", dimensions: "16' × 40'", depth: "8'", price: 100471, image: gilmerBeachcomber, category: "Pool", brand: "Glimmerglass" },
  "vision": { name: "Vision", dimensions: "16' × 41'", depth: "6'6\"", price: 100471, image: gilmerVision, category: "Pool", brand: "Glimmerglass" },
  "grand cayman": { name: "Grand Cayman", dimensions: "16' × 42'", depth: "8'", price: 100471, image: gilmerGrandCayman, category: "Pool", brand: "Glimmerglass" },

  // ============================================
  // LATHAM TANNING LEDGES (4x multiplier)
  // ============================================
  "hermosa tanning ledge": { name: "Hermosa Tanning Ledge", dimensions: "6' × 10'", depth: "6\" - 10\"", price: 14680, image: "/lovable-uploads/8228c334-6fd7-4b29-afae-98628493480d.webp", category: "Tanning Ledge", brand: "Latham" },
  "rectangle tanning ledge": { name: "Rectangle Tanning Ledge", dimensions: "8' × 14'", depth: "8\" - 12\"", price: 21771, image: "/lovable-uploads/c6bebb1e-d2ed-4591-b81d-0af558ed3e52.webp", category: "Tanning Ledge", brand: "Latham" },

  // ============================================
  // GLIMMERGLASS TANNING LEDGES (4x multiplier)
  // ============================================
  "paradise": { name: "Paradise", dimensions: "9' × 19'", depth: "6\" - 10\"", price: 18000, image: glimmerglassParadise, category: "Tanning Ledge", brand: "GlimmerGlass" },
  "leeward": { name: "Leeward", dimensions: "8'1\" × 11'6\"", depth: "6\" - 8\"", price: 14116, image: glimmerglassLeeward, category: "Tanning Ledge", brand: "GlimmerGlass" },
  "leisure": { name: "Leisure", dimensions: "8' × 12'", depth: "6\" - 10\"", price: 16000, image: glimmerglassLeisure, category: "Tanning Ledge", brand: "GlimmerGlass" },

  // ============================================
  // GLIMMERGLASS SPAS (4x multiplier)
  // ============================================
  "moondance spillover": { name: "Moondance Spillover", dimensions: "8' × 8'", depth: "3'6\"", price: 20000, image: "/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.webp", category: "Spa", brand: "GlimmerGlass" },
  "moondance spillover spa": { name: "Moondance Spillover", dimensions: "8' × 8'", depth: "3'6\"", price: 20000, image: "/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.webp", category: "Spa", brand: "GlimmerGlass" },
  "tranquility": { name: "Tranquility", dimensions: "7' × 7'", depth: "3'", price: 20000, image: "/lovable-uploads/e3bbb69b-9699-4d9e-aca9-8c98b50f2c78.webp", category: "Spa", brand: "GlimmerGlass" },
  "tranquility spa": { name: "Tranquility", dimensions: "7' × 7'", depth: "3'", price: 20000, image: "/lovable-uploads/e3bbb69b-9699-4d9e-aca9-8c98b50f2c78.webp", category: "Spa", brand: "GlimmerGlass" },
  "pacifica": { name: "Pacifica", dimensions: "6' × 6'", depth: "3'", price: 18000, image: "/lovable-uploads/7edc4a89-7438-4f88-81f4-8beea8152f07.webp", category: "Spa", brand: "GlimmerGlass" },
  "pacifica spa": { name: "Pacifica", dimensions: "6' × 6'", depth: "3'", price: 18000, image: "/lovable-uploads/7edc4a89-7438-4f88-81f4-8beea8152f07.webp", category: "Spa", brand: "GlimmerGlass" },
  "pearl spillover": { name: "Pearl Spillover", dimensions: "7' × 7'", depth: "3'", price: 18000, image: "/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.webp", category: "Spa", brand: "GlimmerGlass" },
  "pearl spillover spa": { name: "Pearl Spillover", dimensions: "7' × 7'", depth: "3'", price: 18000, image: "/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.webp", category: "Spa", brand: "GlimmerGlass" },

  // ============================================
  // LATHAM SPAS (catalog prices)
  // ============================================
  "latham mystic": { name: "Mystic (Latham Spa)", dimensions: "8' × 8'", depth: "3'6\"", price: 17045, image: "/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.webp", category: "Spa", brand: "Latham" },
  "mystic spillover": { name: "Mystic Spillover", dimensions: "8' × 8'", depth: "3'6\"", price: 18638, image: "/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.webp", category: "Spa", brand: "Latham" },
  "latham regal": { name: "Regal (Latham Spa)", dimensions: "7' × 7'", depth: "3'2\"", price: 16363, image: "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.webp", category: "Spa", brand: "Latham" },
  "regal spillover": { name: "Regal Spillover", dimensions: "7' × 7'", depth: "3'2\"", price: 17850, image: "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.webp", category: "Spa", brand: "Latham" },
  "royal": { name: "Royal", dimensions: "6' × 8'", depth: "3'", price: 16363, image: "/lovable-uploads/62676335-6a09-4389-9a8a-cba74d583c53.webp", category: "Spa", brand: "Latham" },
  "royal spillover": { name: "Royal Spillover", dimensions: "6' × 8'", depth: "3'", price: 17850, image: "/lovable-uploads/62676335-6a09-4389-9a8a-cba74d583c53.webp", category: "Spa", brand: "Latham" },
  "shasta": { name: "Shasta", dimensions: "7' diameter", depth: "3'", price: 13213, image: "/lovable-uploads/1a143a47-5e78-46a8-8172-426b7644bea8.webp", category: "Spa", brand: "Latham" },
  "shasta spillover": { name: "Shasta Spillover", dimensions: "7' diameter", depth: "3'", price: 14788, image: "/lovable-uploads/1a143a47-5e78-46a8-8172-426b7644bea8.webp", category: "Spa", brand: "Latham" },


  // ============================================
  // SAUNAS
  // ============================================
  "barrel sauna 4-person": { name: "Barrel Sauna 4-Person", dimensions: "8'L × 6'Dia", depth: "N/A", price: 18000, image: "/lovable-uploads/barrel-sauna.webp", category: "Sauna" },
  "barrel sauna 6-person": { name: "Barrel Sauna 6-Person", dimensions: "10'L × 7'Dia", depth: "N/A", price: 21600, image: "/lovable-uploads/barrel-sauna.webp", category: "Sauna" },
  "traditional indoor sauna 4-person": { name: "Traditional Indoor Sauna 4-Person", dimensions: "7' × 6' × 7'H", depth: "N/A", price: 22800, image: "/lovable-uploads/barrel-sauna.webp", category: "Sauna" },
  "infrared sauna 2-person": { name: "Infrared Sauna 2-Person", dimensions: "5' × 4' × 6.5'H", depth: "N/A", price: 30000, image: "/lovable-uploads/barrel-sauna.webp", category: "Sauna" },

  // ============================================
  // DRIVEWAY GATES
  // ============================================
  "prague style driveway fence gate 12 ft. x 6 ft.": { name: "Prague Driveway Gate 12'×6'", dimensions: "12' × 6'", depth: "N/A", price: 7820, image: "/lovable-uploads/prague-driveway-gate.webp", category: "Driveway Gate" },
  "prague style driveway fence gate 14 ft. x 6 ft.": { name: "Prague Driveway Gate 14'×6'", dimensions: "14' × 6'", depth: "N/A", price: 6785, image: "/lovable-uploads/prague-driveway-gate.webp", category: "Driveway Gate" },
  "prague style driveway fence gate 16 ft. x 6 ft.": { name: "Prague Driveway Gate 16'×6'", dimensions: "16' × 6'", depth: "N/A", price: 8050, image: "/lovable-uploads/prague-driveway-gate.webp", category: "Driveway Gate" },
  "prague style driveway fence gate 18 ft. x 6 ft.": { name: "Prague Driveway Gate 18'×6'", dimensions: "18' × 6'", depth: "N/A", price: 8970, image: "/lovable-uploads/prague-driveway-gate.webp", category: "Driveway Gate" },

  // ============================================
  // POOL COVERS
  // ============================================
  "eclipse automatic cover": { name: "Eclipse Automatic Cover", dimensions: "Custom", depth: "N/A", price: 27000, image: "/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.webp", category: "Cover" },
  "cs3000 automatic cover": { name: "CS3000 Automatic Cover", dimensions: "Custom", depth: "N/A", price: 30000, image: "/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.webp", category: "Cover" },
  "infinity 4000 cover": { name: "Infinity 4000 Cover", dimensions: "Custom", depth: "N/A", price: 32000, image: "/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.webp", category: "Cover" },
  "atom automatic cover": { name: "Atom Automatic Cover", dimensions: "Custom", depth: "N/A", price: 25000, image: "/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.webp", category: "Cover" },
};

// Helper function to find product info by name
export function findProductInfo(name: string): PoolProductInfo | undefined {
  const normalizedName = name.toLowerCase().trim();
  
  // Direct match
  if (poolProductLookup[normalizedName]) {
    return poolProductLookup[normalizedName];
  }
  
  // Partial match - check if query is contained in key or key is contained in query
  for (const [key, value] of Object.entries(poolProductLookup)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Try matching without special characters
  const cleanedQuery = normalizedName.replace(/[^a-z0-9\s]/g, '');
  for (const [key, value] of Object.entries(poolProductLookup)) {
    const cleanedKey = key.replace(/[^a-z0-9\s]/g, '');
    if (cleanedQuery.includes(cleanedKey) || cleanedKey.includes(cleanedQuery)) {
      return value;
    }
  }
  
  return undefined;
}

// Get all products as array for search
export function getAllProducts(): PoolProductInfo[] {
  return Object.values(poolProductLookup);
}

// Search products by query
export function searchProducts(query: string): PoolProductInfo[] {
  const normalizedQuery = query.toLowerCase().trim();
  const results: PoolProductInfo[] = [];
  
  for (const [key, product] of Object.entries(poolProductLookup)) {
    if (
      key.includes(normalizedQuery) ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      (product.brand && product.brand.toLowerCase().includes(normalizedQuery)) ||
      product.dimensions.toLowerCase().includes(normalizedQuery)
    ) {
      results.push(product);
    }
  }
  
  return results;
}
