// Pool product lookup with dimensions and images for AI search display
// This provides a unified lookup for product cards to show tech specs

export interface PoolProductInfo {
  name: string;
  dimensions: string;
  depth: string;
  price: number;
  image: string;
  category: string;
}

// Consolidated product lookup map - key is lowercase name for matching
export const poolProductLookup: Record<string, PoolProductInfo> = {
  // COMPACT POOLS
  "st. lucia": { name: "St. Lucia", dimensions: "12' × 24'", depth: "3'6\" - 5'", price: 59640, image: "/lovable-uploads/03b6750e-bed3-41df-abcb-6657d36cfa62.png", category: "Pool" },
  "enchantment 9.17": { name: "Enchantment 9.17", dimensions: "9'5\" × 16'10\"", depth: "3'6\" - 4'6\"", price: 57970, image: "/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png", category: "Pool" },
  "palladium 12": { name: "Palladium 12", dimensions: "12' × 24'", depth: "3'6\" - 5'", price: 63470, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png", category: "Pool" },
  "palladium 14": { name: "Palladium 14", dimensions: "14' × 28'", depth: "3'6\" - 5'6\"", price: 81950, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png", category: "Pool" },
  "i30": { name: "I30", dimensions: "12'3\" × 31'6\"", depth: "3'6\" - 5'", price: 60060, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png", category: "Pool" },

  // STANDARD POOLS
  "picasso": { name: "Picasso", dimensions: "15'9\" × 35'", depth: "3'6\" - 5'6\"", price: 73610, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png", category: "Pool" },
  "monaco": { name: "Monaco", dimensions: "12' × 27'", depth: "3'6\" - 5'6\"", price: 67870, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png", category: "Pool" },
  "d36": { name: "D36", dimensions: "14' × 36'", depth: "3'6\" - 6'", price: 81840, image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png", category: "Pool" },

  // DELUXE POOLS
  "tuscan 14.27": { name: "Tuscan 14.27", dimensions: "13'9\" × 26'10\"", depth: "3'7\" - 6'2\"", price: 98340, image: "/lovable-uploads/de3068d3-0f04-4a3c-a2ed-f52141f36b3e.png", category: "Pool" },
  "valencia": { name: "Valencia", dimensions: "14'6\" × 28'", depth: "3'7\" - 5'10\"", price: 85653, image: "/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png", category: "Pool" },
  "vista isle": { name: "Vista Isle", dimensions: "12' × 28'6\"", depth: "3'6\" - 5'10\"", price: 87000, image: "/lovable-uploads/6a41df5e-d6f6-4e49-aa1a-b457ac1902a0.png", category: "Pool" },

  // PREMIUM POOLS
  "corinthian 12": { name: "Corinthian 12", dimensions: "12' × 25'", depth: "3'6\" - 5'5\"", price: 92940, image: "/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.png", category: "Pool" },
  "corinthian 12 bme": { name: "Corinthian 12 BME", dimensions: "12' × 25'", depth: "3'6\" - 5'5\"", price: 97340, image: "/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.png", category: "Pool" },
  "corinthian 14": { name: "Corinthian 14", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 113950, image: "/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png", category: "Pool" },
  "corinthian 14 bme": { name: "Corinthian 14 BME", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 118350, image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png", category: "Pool" },
  "olympia 12": { name: "Olympia 12", dimensions: "12' × 26'", depth: "3'6\" - 5'6\"", price: 93930, image: "/lovable-uploads/0aa90de6-b1eb-43a4-91ec-10c05388c900.png", category: "Pool" },
  "olympia 14": { name: "Olympia 14", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 116040, image: "/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png", category: "Pool" },
  "bay isle": { name: "Bay Isle", dimensions: "14'6\" × 30'", depth: "3' - 6'6\"", price: 98440, image: "/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.png", category: "Pool" },
  "laguna": { name: "Laguna", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 100860, image: "/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.png", category: "Pool" },
  "laguna deluxe": { name: "Laguna Deluxe", dimensions: "14' × 30'", depth: "4' - 6'", price: 114830, image: "/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png", category: "Pool" },
  "claremont": { name: "Claremont", dimensions: "14' × 33'", depth: "3'6\" - 5'4\"", price: 101740, image: "/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png", category: "Pool" },
  "axiom 14": { name: "Axiom 14", dimensions: "14' × 30'", depth: "4'6\" - 6'", price: 106250, image: "/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png", category: "Pool" },
  "providence 14": { name: "Providence 14", dimensions: "14' × 30'", depth: "3'6\" - 6'1\"", price: 115160, image: "/lovable-uploads/3929943c-2e46-426f-b155-3d79c96d7eb4.png", category: "Pool" },
  "genesis": { name: "Genesis", dimensions: "16' × 40'2\"", depth: "3'9\" - 8'6\"", price: 133860, image: "/lovable-uploads/2a611c90-6445-41af-aa15-7d223e357e64.png", category: "Pool" },
  "tuscan 14.40": { name: "Tuscan 14.40", dimensions: "13'9\" × 39'11\"", depth: "3'7\" - 6'2\"", price: 133320, image: "/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png", category: "Pool" },

  // GLIMMERGLASS POOLS
  "serafina": { name: "Serafina", dimensions: "8'6\" × 14'", depth: "3'6\" - 4'", price: 55034, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "coral cove": { name: "Coral Cove", dimensions: "9'6\" × 16'", depth: "3'6\" - 4'", price: 58400, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "retreat": { name: "Retreat", dimensions: "10'3\" × 18'5\"", depth: "3'6\" - 4'4\"", price: 57630, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "regal plunge": { name: "Regal Plunge", dimensions: "10' × 16'", depth: "4' - 5'5\"", price: 63350, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "regal": { name: "Regal", dimensions: "10' × 20'", depth: "3'6\" - 5'4\"", price: 71600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "caribbean": { name: "Caribbean", dimensions: "11' × 20'", depth: "3'6\" - 5'", price: 70566, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "neptune": { name: "Neptune", dimensions: "11' × 23'", depth: "3'6\" - 5'6\"", price: 74706, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "islander": { name: "Islander", dimensions: "12' × 24'", depth: "3'6\" - 5'6\"", price: 71600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "emerald": { name: "Emerald", dimensions: "12' × 25'", depth: "3'6\" - 5'7\"", price: 74706, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "roman": { name: "Roman", dimensions: "11' × 27'", depth: "3'6\" - 6'2\"", price: 82600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "superior": { name: "Superior", dimensions: "12' × 25'8\"", depth: "3'6\" - 5'6\"", price: 82600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "capri": { name: "Capri", dimensions: "12' × 28'", depth: "3'6\" - 4'6\"", price: 79881, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "costa brava": { name: "Costa Brava", dimensions: "12' × 29'", depth: "3'6\" - 6'", price: 79881, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "majestic": { name: "Majestic", dimensions: "13' × 25'6\"", depth: "3'6\" - 6'", price: 78530, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "gold coast": { name: "Gold Coast", dimensions: "14' × 28'", depth: "3'6\" - 5'8\"", price: 104600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "atlantis": { name: "Atlantis", dimensions: "14' × 32'", depth: "3'6\" - 6'", price: 104600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "extreme 27": { name: "Extreme 27", dimensions: "12'6\" × 27'", depth: "3'6\" - 5'11\"", price: 93600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "tortola": { name: "Tortola", dimensions: "14' × 30'", depth: "3'6\" - 6'", price: 95800, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "silver shore": { name: "Silver Shore", dimensions: "15' × 28'", depth: "3'6\" - 6'", price: 82050, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "mystic": { name: "Mystic", dimensions: "15' × 32'", depth: "3'6\" - 6'", price: 106800, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "aloha": { name: "Aloha", dimensions: "15' × 34'", depth: "3'6\" - 6'", price: 106800, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "bellagio": { name: "Bellagio", dimensions: "15' × 34'", depth: "3'6\" - 6'6\"", price: 106800, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "extreme 38": { name: "Extreme 38", dimensions: "15'6\" × 38'", depth: "3'6\" - 7'", price: 126600, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "ponce xl": { name: "Ponce XL", dimensions: "15'6\" × 32'", depth: "3'6\" - 6'", price: 113400, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "newport": { name: "Newport", dimensions: "16' × 35'", depth: "3'6\" - 6'", price: 106800, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "serenade": { name: "Serenade", dimensions: "16' × 38'", depth: "6'", price: 136306, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "beachcomber": { name: "Beachcomber", dimensions: "16' × 40'", depth: "8'", price: 136306, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "vision": { name: "Vision", dimensions: "16' × 41'", depth: "6'6\"", price: 136306, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },
  "grand cayman": { name: "Grand Cayman", dimensions: "16' × 42'", depth: "8'", price: 136306, image: "/lovable-uploads/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.png", category: "Pool" },

  // SPAS
  "moonlight spillover spa": { name: "Moonlight Spillover Spa", dimensions: "8' × 8'", depth: "3'6\"", price: 20000, image: "/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.png", category: "Spa" },
  "tranquility spa": { name: "Tranquility Spa", dimensions: "7' × 7'", depth: "3'", price: 20000, image: "/lovable-uploads/e3bbb69b-9699-4d9e-aca9-8c98b50f2c78.png", category: "Spa" },
  "pacifica spa": { name: "Pacifica Spa", dimensions: "6' × 6'", depth: "3'", price: 18000, image: "/lovable-uploads/7edc4a89-7438-4f88-81f4-8beea8152f07.png", category: "Spa" },
  "pearl spillover spa": { name: "Pearl Spillover Spa", dimensions: "7' × 7'", depth: "3'", price: 18000, image: "/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.png", category: "Spa" },

  // SAUNAS
  "barrel sauna 4-person": { name: "Barrel Sauna 4-Person", dimensions: "6' × 6'", depth: "N/A", price: 15000, image: "/lovable-uploads/d8bded3c-41a9-4591-b0bc-3e20a9977602.png", category: "Sauna" },
  "barrel sauna 6-person": { name: "Barrel Sauna 6-Person", dimensions: "8' × 6'", depth: "N/A", price: 18000, image: "/lovable-uploads/155c5b3a-8bd3-4060-8141-7cf76cb9f153.png", category: "Sauna" },
};

// Helper function to find product info by name
export function findProductInfo(name: string): PoolProductInfo | undefined {
  const normalizedName = name.toLowerCase().trim();
  
  // Direct match
  if (poolProductLookup[normalizedName]) {
    return poolProductLookup[normalizedName];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(poolProductLookup)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  return undefined;
}
