// Screen Enclosure data for pool areas
export const screenEnclosures = [
  {
    id: "se1",
    name: "Standard Pool Screen Enclosure",
    basePrice: 15, // Per square foot
    premiumPrice: 28, // Per square foot for two-story
    image: "/lovable-uploads/36c2b687-a63a-49b9-9c1c-8d65d3ce9abf.png",
    description: "Premium aluminum screen enclosure for pool areas",
    features: [
      "Durable aluminum frame",
      "Corrosion-resistant materials", 
      "Professional installation",
      "Weather protection"
    ],
    category: "standard"
  },
  {
    id: "se2", 
    name: "Premium Pool Screen Enclosure",
    basePrice: 18, // Per square foot
    premiumPrice: 28, // Per square foot for two-story
    image: "/lovable-uploads/36c2b687-a63a-49b9-9c1c-8d65d3ce9abf.png",
    description: "Enhanced aluminum screen enclosure with premium features",
    features: [
      "Heavy-duty aluminum frame",
      "Enhanced screen material",
      "Professional installation", 
      "Extended warranty"
    ],
    category: "premium"
  },
  {
    id: "se3",
    name: "Deluxe Pool Screen Enclosure", 
    basePrice: 22, // Per square foot
    premiumPrice: 28, // Per square foot for two-story
    image: "/lovable-uploads/36c2b687-a63a-49b9-9c1c-8d65d3ce9abf.png",
    description: "Top-tier aluminum screen enclosure with luxury features",
    features: [
      "Premium aluminum construction",
      "Superior screen materials",
      "Expert installation",
      "Lifetime warranty"
    ],
    category: "deluxe"
  }
];

export interface ScreenEnclosure {
  id: string;
  name: string; 
  basePrice: number;
  premiumPrice: number;
  image: string;
  description: string;
  features: string[];
  category: 'standard' | 'premium' | 'deluxe';
}