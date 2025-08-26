
// Pool models data with actual image paths
export const poolModels = [
  // Premium Pools
  {
    id: "tuscan-1120",
    model: "Tuscan 11'2\" x 20'",
    price: 89500,
    category: 'premium' as const,
    image: "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png",
    dimensions: "11'2\" x 20' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Built-in Spa with LED Lighting",
      "Tanning Ledge with Premium Finish",
      "Swim-up Seating Area",
      "Premium Water Features",
      "Advanced Salt Water System",
      "Variable Speed Energy-Efficient Pump"
    ],
    installationTimeWeeks: 8,
    warrantyYears: "Lifetime Structural, 10 Year Equipment"
  },
  {
    id: "tuscan-1324",
    model: "Tuscan 13'2\" x 24'",
    price: 95000,
    category: 'premium' as const,
    image: "/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png",
    dimensions: "13'2\" x 24' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Spacious Built-in Spa",
      "Extended Tanning Ledge",
      "Multiple Seating Areas",
      "Cascading Water Features",
      "Premium LED Lighting Package",
      "Advanced Filtration System"
    ],
    installationTimeWeeks: 10,
    warrantyYears: "Lifetime Structural, 10 Year Equipment"
  },
  {
    id: "tuscan-1427",
    model: "Tuscan 14'2\" x 27'",
    price: 105000,
    category: 'premium' as const,
    image: "/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png",
    dimensions: "14'2\" x 27' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Large Integrated Spa",
      "Expansive Tanning Ledge",
      "Premium Entertainment Area",
      "Multiple Water Features",
      "Full LED Lighting System",
      "Professional Grade Equipment"
    ],
    installationTimeWeeks: 12,
    warrantyYears: "Lifetime Structural, 10 Year Equipment"
  },
  {
    id: "corinthian",
    model: "Corinthian",
    price: 98000,
    category: 'premium' as const,
    image: "/lovable-uploads/8228c334-6fd7-4b29-afae-98628493480d.png",
    dimensions: "16' x 32' x 3'6\" - 8'",
    depth: "3'6\" shallow, 8' deep end",
    features: [
      "Geometric Luxury Design",
      "Built-in Spa with Spillover",
      "Tanning Ledge with Bubblers",
      "Premium Water Features",
      "Advanced Automation System",
      "Energy Efficient Equipment"
    ],
    installationTimeWeeks: 10,
    warrantyYears: "Lifetime Structural, 10 Year Equipment"
  },

  // Deluxe Pools
  {
    id: "laguna-bay",
    model: "Laguna Bay",
    price: 78000,
    category: 'deluxe' as const,
    image: "/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png",
    dimensions: "14' x 28' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Tanning Ledge with LED Lighting",
      "Beach Entry Design",
      "Cascading Water Features",
      "Integrated Bench Seating",
      "Salt Water System",
      "Variable Speed Pump"
    ],
    installationTimeWeeks: 6,
    warrantyYears: "25 Year Structural, 5 Year Equipment"
  },
  {
    id: "bay-isle",
    model: "Bay Isle",
    price: 82000,
    category: 'deluxe' as const,
    image: "/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png",
    dimensions: "15' x 30' x 3'6\" - 7'",
    depth: "3'6\" shallow, 7' deep end",
    features: [
      "Freeform Beach Entry",
      "Integrated Tanning Ledge",
      "Natural Stone Coping",
      "Multi-Level Seating",
      "Premium Filtration",
      "LED Lighting Package"
    ],
    installationTimeWeeks: 7,
    warrantyYears: "25 Year Structural, 5 Year Equipment"
  },
  {
    id: "st-lucia",
    model: "St. Lucia",
    price: 75000,
    category: 'deluxe' as const,
    image: "/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.png",
    dimensions: "13' x 26' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Kidney Shape Design",
      "Built-in Steps",
      "Corner Spa Ready",
      "Tanning Ledge",
      "Energy Efficient System",
      "Premium Finish Options"
    ],
    installationTimeWeeks: 6,
    warrantyYears: "25 Year Structural, 5 Year Equipment"
  },
  {
    id: "jamaica",
    model: "Jamaica",
    price: 79000,
    category: 'deluxe' as const,
    image: "/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png",
    dimensions: "14' x 28' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Freeform Design",
      "Beach Entry",
      "Natural Rock Features",
      "Integrated Seating",
      "Waterfall Feature",
      "Advanced Controls"
    ],
    installationTimeWeeks: 7,
    warrantyYears: "25 Year Structural, 5 Year Equipment"
  },

  // Standard Pools
  {
    id: "valencia",
    model: "Valencia",
    price: 65000,
    category: 'standard' as const,
    image: "/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png",
    dimensions: "12' x 24' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Classic Rectangle Design",
      "Built-in Steps",
      "Standard Lighting",
      "Efficient Filtration",
      "Quality Construction",
      "Warranty Included"
    ],
    installationTimeWeeks: 4,
    warrantyYears: "15 Year Structural, 3 Year Equipment"
  },
  {
    id: "genesis",
    model: "Genesis",
    price: 68000,
    category: 'standard' as const,
    image: "/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png",
    dimensions: "13' x 26' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Modern Rectangular Design",
      "Corner Steps",
      "LED Lighting Ready",
      "Standard Equipment",
      "Durable Construction",
      "Professional Installation"
    ],
    installationTimeWeeks: 4,
    warrantyYears: "15 Year Structural, 3 Year Equipment"
  },
  {
    id: "cape-cod",
    model: "Cape Cod",
    price: 62000,
    category: 'standard' as const,
    image: "/lovable-uploads/311a7002-2a40-4c59-a143-9f0236ece5d4.png",
    dimensions: "11' x 22' x 3'6\" - 5'6\"",
    depth: "3'6\" shallow, 5'6\" deep end",
    features: [
      "Traditional Design",
      "Roman End Steps",
      "Basic Lighting",
      "Standard Pump System",
      "Quality Finish",
      "Full Warranty"
    ],
    installationTimeWeeks: 3,
    warrantyYears: "15 Year Structural, 3 Year Equipment"
  },
  {
    id: "astoria",
    model: "Astoria",
    price: 69500,
    category: 'standard' as const,
    image: "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png",
    dimensions: "12' x 25' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Elegant Rectangle",
      "Wide Entry Steps",
      "Bench Seating",
      "Standard Features",
      "Reliable Equipment",
      "Professional Support"
    ],
    installationTimeWeeks: 4,
    warrantyYears: "15 Year Structural, 3 Year Equipment"
  },

  // Compact Pools
  {
    id: "enchantment-917",
    model: "Enchantment 9'1\" x 17'",
    price: 52000,
    category: 'compact' as const,
    image: "/lovable-uploads/57670513-84aa-4ae5-86ee-6a95737004b5.png",
    dimensions: "9'1\" x 17' x 3'6\" - 5'6\"",
    depth: "3'6\" shallow, 5'6\" deep end",
    features: [
      "Compact LED Design",
      "Space-Saving Layout",
      "Perfect for Small Yards",
      "Easy Maintenance",
      "Energy Efficient",
      "Quick Installation"
    ],
    installationTimeWeeks: 2,
    warrantyYears: "10 Year Structural, 2 Year Equipment"
  },
  {
    id: "enchantment-921",
    model: "Enchantment 9'2\" x 21'",
    price: 55000,
    category: 'compact' as const,
    image: "/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png",
    dimensions: "9'2\" x 21' x 3'6\" - 5'6\"",
    depth: "3'6\" shallow, 5'6\" deep end",
    features: [
      "Extended Compact Design",
      "Efficient Use of Space",
      "Built-in Steps",
      "Low Maintenance",
      "Energy Efficient Pump",
      "Professional Installation"
    ],
    installationTimeWeeks: 3,
    warrantyYears: "10 Year Structural, 2 Year Equipment"
  },
  {
    id: "enchantment-924",
    model: "Enchantment 9'2\" x 24'",
    price: 58000,
    category: 'compact' as const,
    image: "/lovable-uploads/58cf10b7-a125-4e4f-be0b-6a0deb095bac.png",
    dimensions: "9'2\" x 24' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Longer Compact Design",
      "Maximum Small Space Use",
      "Corner Entry Steps",
      "Simple Maintenance",
      "Efficient Systems",
      "Full Support Package"
    ],
    installationTimeWeeks: 3,
    warrantyYears: "10 Year Structural, 2 Year Equipment"
  },

  // Specialty Pools
  {
    id: "apollo-14",
    model: "Apollo 14'",
    price: 72000,
    category: 'deluxe' as const,
    image: "/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png",
    dimensions: "14' x 28' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Freeform Design",
      "Natural Stone Look",
      "Built-in Features",
      "Premium Equipment",
      "Advanced Filtration",
      "LED Lighting System"
    ],
    installationTimeWeeks: 6,
    warrantyYears: "25 Year Structural, 5 Year Equipment"
  },
  {
    id: "ariel-16",
    model: "Ariel 16'",
    price: 85000,
    category: 'premium' as const,
    image: "/lovable-uploads/2af253b1-b9be-487f-a998-476d396772c4.png",
    dimensions: "16' x 32' x 3'6\" - 7'",
    depth: "3'6\" shallow, 7' deep end",
    features: [
      "Large Freeform Design",
      "Multiple Seating Areas",
      "Water Feature Ready",
      "Spa Compatible",
      "Premium Finish Options",
      "Full Automation System"
    ],
    installationTimeWeeks: 10,
    warrantyYears: "Lifetime Structural, 10 Year Equipment"
  },
  {
    id: "coral-16",
    model: "Coral 16'",
    price: 88000,
    category: 'premium' as const,
    image: "/lovable-uploads/96f46291-85e7-4b48-9465-623400a8e835.png",
    dimensions: "16' x 34' x 3'6\" - 7'6\"",
    depth: "3'6\" shallow, 7'6\" deep end",
    features: [
      "Expansive Freeform",
      "Multiple Entertainment Areas",
      "Built-in Spa Option",
      "Tanning Ledge",
      "Premium Features",
      "Professional Grade Equipment"
    ],
    installationTimeWeeks: 12,
    warrantyYears: "Lifetime Structural, 10 Year Equipment"
  }
];

// Pool liners data
export const poolLiners = [
  { 
    id: 'liner-1', 
    name: 'Marble', 
    price: 1800, 
    image: '/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png',
    type: 'Vinyl Liner',
    description: 'Elegant marble-inspired vinyl liner with subtle veining for a premium look.'
  },
  { 
    id: 'liner-2', 
    name: 'Granite', 
    price: 2200, 
    image: '/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png',
    type: 'Vinyl Liner',
    description: 'Durable granite pattern liner that hides wear and looks great in all lighting.'
  },
  { 
    id: 'liner-3', 
    name: 'Onyx', 
    price: 2500, 
    image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png',
    type: 'Vinyl Liner',
    description: 'Deep onyx tone liner for dramatic water color and modern aesthetics.'
  },
];

// Pool tiles data
export const poolTiles = [
  { 
    id: 'tile-1', 
    name: 'Ceramic', 
    price: 800, 
    image: '/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.png',
    description: 'Classic ceramic waterline tile with a clean, timeless finish.'
  },
  { 
    id: 'tile-2', 
    name: 'Porcelain', 
    price: 1200, 
    image: '/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.png',
    description: 'Premium porcelain tile offering excellent durability and color consistency.'
  },
  { 
    id: 'tile-3', 
    name: 'Glass', 
    price: 1500, 
    image: '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png',
    description: 'Vibrant glass mosaic tiles that add sparkle and depth to your pool.'
  },
];

// Tanning ledges data
export const tanningLedges = [
  { 
    id: 'ledge-1', 
    name: 'Standard', 
    price: 4000, 
    image: '/lovable-uploads/56fd62de-130b-4b90-98a0-596007f5dadb.png',
    description: 'Entry-level tanning ledge ideal for compact pools and relaxed lounging.',
    dimensions: "7' x 8'",
    depth: "9\" water depth",
    features: [
      'Slip-resistant surface',
      'Perfect for baja shelf loungers',
      'Integrated entry step'
    ]
  },
  { 
    id: 'ledge-2', 
    name: 'Premium', 
    price: 6000, 
    image: '/lovable-uploads/7dc956df-af5c-4c6b-b2af-6bc9d6fbf179.png',
    description: 'Expanded ledge with more room for seating and play, designed for comfort.',
    dimensions: "8' x 10'",
    depth: "10\" water depth",
    features: [
      'Wider lounging area',
      'Optional bubbler compatibility',
      'Reinforced structure'
    ]
  },
  { 
    id: 'ledge-3', 
    name: 'Luxury', 
    price: 8000, 
    image: '/lovable-uploads/9e491420-80df-4bb3-9db1-3933d96846ac.png',
    description: 'Top-tier tanning ledge with maximum space and premium feel.',
    dimensions: "9' x 12'",
    depth: "10\"–12\" adjustable water depth",
    features: [
      'Space for two loungers + table',
      'Bubbler and LED accent ready',
      'Premium gelcoat finish'
    ]
  },
];

export default poolModels;
