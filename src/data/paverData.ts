// Paver and coping data with different types and color options

export interface PaverType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  colors: PaverColor[];
  image: string;
  category: 'paver' | 'coping';
}

export interface PaverColor {
  name: string;
  hex: string;
  image?: string;
  priceModifier: number; // multiplier for base price
}

export const paverTypes: PaverType[] = [
  {
    id: 'concrete',
    name: 'Concrete Pavers',
    description: 'Durable and versatile concrete pavers for pool decking',
    basePrice: 15,
    category: 'paver',
    image: '/lovable-uploads/a1b42616-0c25-4010-96e3-3fbeba18aae8.png',
    colors: [
      { name: 'Light Gray', hex: '#D3D3D3', priceModifier: 1.0 },
      { name: 'Charcoal', hex: '#36454F', priceModifier: 1.1 },
      { name: 'Sandstone', hex: '#F4A460', priceModifier: 1.05 },
      { name: 'Terracotta', hex: '#E2725B', priceModifier: 1.15 }
    ]
  },
  {
    id: 'travertine',
    name: 'Travertine Pavers',
    description: 'Premium natural travertine stone pavers',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png',
    colors: [
      { name: 'Ivory', hex: '#FDF5E6', priceModifier: 1.0 },
      { name: 'Noce', hex: '#D2B48C', priceModifier: 1.1 },
      { name: 'Gold', hex: '#DAA520', priceModifier: 1.2 },
      { name: 'Silver', hex: '#C0C0C0', priceModifier: 1.15 }
    ]
  },
  {
    id: 'natural-stone',
    name: 'Natural Stone Pavers',
    description: 'High-end natural stone pavers for luxury pools',
    basePrice: 35,
    category: 'paver',
    image: '/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png',
    colors: [
      { name: 'Bluestone', hex: '#4682B4', priceModifier: 1.0 },
      { name: 'Limestone', hex: '#E5E4E2', priceModifier: 1.05 },
      { name: 'Sandstone', hex: '#F4A460', priceModifier: 1.1 },
      { name: 'Granite', hex: '#2F4F4F', priceModifier: 1.3 }
    ]
  },
  {
    id: 'brick',
    name: 'Brick Pavers',
    description: 'Classic clay brick pavers for traditional pool designs',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png',
    colors: [
      { name: 'Red Clay', hex: '#B22222', priceModifier: 1.0 },
      { name: 'Brown', hex: '#8B4513', priceModifier: 1.05 },
      { name: 'Antique', hex: '#CD853F', priceModifier: 1.1 },
      { name: 'Charcoal', hex: '#36454F', priceModifier: 1.15 }
    ]
  }
];

export const copingTypes: PaverType[] = [
  {
    id: 'bullnose-coping',
    name: 'Bullnose Coping',
    description: 'Rounded edge bullnose coping for pool edges',
    basePrice: 18,
    category: 'coping',
    image: '/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png',
    colors: [
      { name: 'White', hex: '#FFFFFF', priceModifier: 1.0 },
      { name: 'Cream', hex: '#F5F5DC', priceModifier: 1.05 },
      { name: 'Gray', hex: '#808080', priceModifier: 1.1 },
      { name: 'Charcoal', hex: '#36454F', priceModifier: 1.2 }
    ]
  },
  {
    id: 'cantilever-coping',
    name: 'Cantilever Coping',
    description: 'Modern cantilever edge design for contemporary pools',
    basePrice: 22,
    category: 'coping',
    image: '/lovable-uploads/d6ea993e-6b84-4fd9-b0f5-0ae906e45b0b.png',
    colors: [
      { name: 'Concrete Gray', hex: '#A9A9A9', priceModifier: 1.0 },
      { name: 'Sandstone', hex: '#F4A460', priceModifier: 1.1 },
      { name: 'Charcoal', hex: '#36454F', priceModifier: 1.15 },
      { name: 'White', hex: '#FFFFFF', priceModifier: 1.2 }
    ]
  },
  {
    id: 'natural-stone-coping',
    name: 'Natural Stone Coping',
    description: 'Premium natural stone pool edge coping',
    basePrice: 28,
    category: 'coping',
    image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png',
    colors: [
      { name: 'Bluestone', hex: '#4682B4', priceModifier: 1.0 },
      { name: 'Limestone', hex: '#E5E4E2', priceModifier: 1.05 },
      { name: 'Travertine', hex: '#F5DEB3', priceModifier: 1.1 },
      { name: 'Granite', hex: '#2F4F4F', priceModifier: 1.3 }
    ]
  },
  {
    id: 'tile-coping',
    name: 'Tile Coping',
    description: 'Ceramic or porcelain tile coping for pool edges',
    basePrice: 16,
    category: 'coping',
    image: '/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png',
    colors: [
      { name: 'Ocean Blue', hex: '#4169E1', priceModifier: 1.0 },
      { name: 'Pearl White', hex: '#F8F8FF', priceModifier: 1.05 },
      { name: 'Sandy Beige', hex: '#F5F5DC', priceModifier: 1.1 },
      { name: 'Slate Gray', hex: '#708090', priceModifier: 1.15 }
    ]
  }
];

// Helper function to calculate price
export const calculatePaverPrice = (type: PaverType, color: PaverColor, surfaceArea: number): number => {
  return type.basePrice * color.priceModifier * surfaceArea;
};