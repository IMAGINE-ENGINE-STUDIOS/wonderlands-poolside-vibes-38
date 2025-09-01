// Screen enclosure data

export interface ScreenEnclosureOption {
  name: string;
  type: 'standard' | 'deluxe' | 'premium';
  pricePerSqFt: number;
  image: string;
  description: string;
  features: string[];
}

export const screenEnclosureOptions: ScreenEnclosureOption[] = [
  {
    name: "Standard Screen Enclosure",
    type: "standard",
    pricePerSqFt: 15,
    image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png",
    description: "Basic aluminum frame screen enclosure with standard mesh screening",
    features: ["Aluminum Frame", "Standard Screen Mesh", "Basic Hardware", "5-Year Warranty"]
  },
  {
    name: "Deluxe Screen Enclosure",
    type: "deluxe",
    pricePerSqFt: 22,
    image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png",
    description: "Enhanced aluminum frame with premium mesh and improved durability",
    features: ["Premium Aluminum Frame", "Enhanced Screen Mesh", "Upgraded Hardware", "Pet Screen Option", "10-Year Warranty"]
  },
  {
    name: "Premium Screen Enclosure",
    type: "premium",
    pricePerSqFt: 28,
    image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png",
    description: "Top-tier aluminum construction with impact-resistant screening and premium finishes",
    features: ["Heavy-Duty Aluminum Frame", "Impact-Resistant Screen", "Premium Hardware", "Custom Color Options", "Lifetime Warranty"]
  }
];