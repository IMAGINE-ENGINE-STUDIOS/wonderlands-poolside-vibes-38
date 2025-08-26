
// Pool models data with actual image paths
export const poolModels = [
  // Premium Pools
  {
    id: "tuscan-1120",
    model: "Tuscan 11'2\" x 20'",
    price: 89500,
    category: 'premium' as const,
    image: "/src/assets/pools/tuscan-1120.jpg",
    dimensions: "11'2\" x 20' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Built-in Spa with LED Lighting",
      "Tanning Ledge with Premium Finish",
      "Swim-up Seating Area",
      "Premium Water Features",
      "Advanced Salt Water System",
      "Variable Speed Energy-Efficient Pump"
    ]
  },
  {
    id: "tuscan-1324",
    model: "Tuscan 13'2\" x 24'",
    price: 95000,
    category: 'premium' as const,
    image: "/src/assets/pools/tuscan-1324.jpg",
    dimensions: "13'2\" x 24' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Spacious Built-in Spa",
      "Extended Tanning Ledge",
      "Multiple Seating Areas",
      "Cascading Water Features",
      "Premium LED Lighting Package",
      "Advanced Filtration System"
    ]
  },
  {
    id: "tuscan-1427",
    model: "Tuscan 14'2\" x 27'",
    price: 105000,
    category: 'premium' as const,
    image: "/src/assets/pools/tuscan-1427.jpg",
    dimensions: "14'2\" x 27' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Large Integrated Spa",
      "Expansive Tanning Ledge",
      "Premium Entertainment Area",
      "Multiple Water Features",
      "Full LED Lighting System",
      "Professional Grade Equipment"
    ]
  },
  {
    id: "corinthian",
    model: "Corinthian",
    price: 98000,
    category: 'premium' as const,
    image: "/src/assets/pools/geometric-luxury.jpg",
    dimensions: "16' x 32' x 3'6\" - 8'",
    depth: "3'6\" shallow, 8' deep end",
    features: [
      "Geometric Luxury Design",
      "Built-in Spa with Spillover",
      "Tanning Ledge with Bubblers",
      "Premium Water Features",
      "Advanced Automation System",
      "Energy Efficient Equipment"
    ]
  },

  // Deluxe Pools
  {
    id: "laguna-bay",
    model: "Laguna Bay",
    price: 78000,
    category: 'deluxe' as const,
    image: "/src/assets/pools/fiji.jpg",
    dimensions: "14' x 28' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Tanning Ledge with LED Lighting",
      "Beach Entry Design",
      "Cascading Water Features",
      "Integrated Bench Seating",
      "Salt Water System",
      "Variable Speed Pump"
    ]
  },
  {
    id: "bay-isle",
    model: "Bay Isle",
    price: 82000,
    category: 'deluxe' as const,
    image: "/src/assets/pools/bermuda.jpg",
    dimensions: "15' x 30' x 3'6\" - 7'",
    depth: "3'6\" shallow, 7' deep end",
    features: [
      "Freeform Beach Entry",
      "Integrated Tanning Ledge",
      "Natural Stone Coping",
      "Multi-Level Seating",
      "Premium Filtration",
      "LED Lighting Package"
    ]
  },
  {
    id: "st-lucia",
    model: "St. Lucia",
    price: 75000,
    category: 'deluxe' as const,
    image: "/src/assets/pools/st-lucia.jpg",
    dimensions: "13' x 26' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Kidney Shape Design",
      "Built-in Steps",
      "Corner Spa Ready",
      "Tanning Ledge",
      "Energy Efficient System",
      "Premium Finish Options"
    ]
  },
  {
    id: "jamaica",
    model: "Jamaica",
    price: 79000,
    category: 'deluxe' as const,
    image: "/src/assets/pools/jamaica.jpg",
    dimensions: "14' x 28' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Freeform Design",
      "Beach Entry",
      "Natural Rock Features",
      "Integrated Seating",
      "Waterfall Feature",
      "Advanced Controls"
    ]
  },

  // Standard Pools
  {
    id: "valencia",
    model: "Valencia",
    price: 65000,
    category: 'standard' as const,
    image: "/src/assets/pools/valencia.jpg",
    dimensions: "12' x 24' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Classic Rectangle Design",
      "Built-in Steps",
      "Standard Lighting",
      "Efficient Filtration",
      "Quality Construction",
      "Warranty Included"
    ]
  },
  {
    id: "genesis",
    model: "Genesis",
    price: 68000,
    category: 'standard' as const,
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "13' x 26' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Modern Rectangular Design",
      "Corner Steps",
      "LED Lighting Ready",
      "Standard Equipment",
      "Durable Construction",
      "Professional Installation"
    ]
  },
  {
    id: "cape-cod",
    model: "Cape Cod",
    price: 62000,
    category: 'standard' as const,
    image: "/src/assets/pools/cape-cod.jpg",
    dimensions: "11' x 22' x 3'6\" - 5'6\"",
    depth: "3'6\" shallow, 5'6\" deep end",
    features: [
      "Traditional Design",
      "Roman End Steps",
      "Basic Lighting",
      "Standard Pump System",
      "Quality Finish",
      "Full Warranty"
    ]
  },
  {
    id: "astoria",
    model: "Astoria",
    price: 69500,
    category: 'standard' as const,
    image: "/src/assets/pools/astoria-12.jpg",
    dimensions: "12' x 25' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Elegant Rectangle",
      "Wide Entry Steps",
      "Bench Seating",
      "Standard Features",
      "Reliable Equipment",
      "Professional Support"
    ]
  },

  // Compact Pools
  {
    id: "enchantment-917",
    model: "Enchantment 9'1\" x 17'",
    price: 52000,
    category: 'compact' as const,
    image: "/src/assets/pools/enchantment-917.jpg",
    dimensions: "9'1\" x 17' x 3'6\" - 5'6\"",
    depth: "3'6\" shallow, 5'6\" deep end",
    features: [
      "Compact LED Design",
      "Space-Saving Layout",
      "Perfect for Small Yards",
      "Easy Maintenance",
      "Energy Efficient",
      "Quick Installation"
    ]
  },
  {
    id: "enchantment-921",
    model: "Enchantment 9'2\" x 21'",
    price: 55000,
    category: 'compact' as const,
    image: "/src/assets/pools/enchantment-921.jpg",
    dimensions: "9'2\" x 21' x 3'6\" - 5'6\"",
    depth: "3'6\" shallow, 5'6\" deep end",
    features: [
      "Extended Compact Design",
      "Efficient Use of Space",
      "Built-in Steps",
      "Low Maintenance",
      "Energy Efficient Pump",
      "Professional Installation"
    ]
  },
  {
    id: "enchantment-924",
    model: "Enchantment 9'2\" x 24'",
    price: 58000,
    category: 'compact' as const,
    image: "/src/assets/pools/enchantment-924.jpg",
    dimensions: "9'2\" x 24' x 3'6\" - 6'",
    depth: "3'6\" shallow, 6' deep end",
    features: [
      "Longer Compact Design",
      "Maximum Small Space Use",
      "Corner Entry Steps",
      "Simple Maintenance",
      "Efficient Systems",
      "Full Support Package"
    ]
  },

  // Specialty Pools
  {
    id: "apollo-14",
    model: "Apollo 14'",
    price: 72000,
    category: 'deluxe' as const,
    image: "/src/assets/pools/apollo-14.jpg",
    dimensions: "14' x 28' x 3'6\" - 6'6\"",
    depth: "3'6\" shallow, 6'6\" deep end",
    features: [
      "Freeform Design",
      "Natural Stone Look",
      "Built-in Features",
      "Premium Equipment",
      "Advanced Filtration",
      "LED Lighting System"
    ]
  },
  {
    id: "ariel-16",
    model: "Ariel 16'",
    price: 85000,
    category: 'premium' as const,
    image: "/src/assets/pools/ariel-16.jpg",
    dimensions: "16' x 32' x 3'6\" - 7'",
    depth: "3'6\" shallow, 7' deep end",
    features: [
      "Large Freeform Design",
      "Multiple Seating Areas",
      "Water Feature Ready",
      "Spa Compatible",
      "Premium Finish Options",
      "Full Automation System"
    ]
  },
  {
    id: "coral-16",
    model: "Coral 16'",
    price: 88000,
    category: 'premium' as const,
    image: "/src/assets/pools/coral-16.jpg",
    dimensions: "16' x 34' x 3'6\" - 7'6\"",
    depth: "3'6\" shallow, 7'6\" deep end",
    features: [
      "Expansive Freeform",
      "Multiple Entertainment Areas",
      "Built-in Spa Option",
      "Tanning Ledge",
      "Premium Features",
      "Professional Grade Equipment"
    ]
  }
];

export default poolModels;
