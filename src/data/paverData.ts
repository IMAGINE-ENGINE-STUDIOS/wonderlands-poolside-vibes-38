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
  // Appian Collection
  {
    id: 'appian-adobe',
    name: 'Appian Adobe',
    description: 'Premium Appian Collection Adobe pavers with authentic earthen tones',
    basePrice: 28,
    category: 'paver',
    image: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png',
    colors: [
      { name: 'Adobe Clay', hex: '#B8956B', priceModifier: 1.0 },
      { name: 'Desert Sand', hex: '#D2B48C', priceModifier: 1.05 },
      { name: 'Terracotta', hex: '#C65D07', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-amaretto',
    name: 'Appian Amaretto',
    description: 'Rich Amaretto tones from the Appian Collection',
    basePrice: 30,
    category: 'paver',
    image: '/lovable-uploads/5e630c2e-3a3f-49bf-b5d5-425a69959416.png',
    colors: [
      { name: 'Amaretto', hex: '#C4A484', priceModifier: 1.0 },
      { name: 'Warm Beige', hex: '#D4B896', priceModifier: 1.05 },
      { name: 'Golden Brown', hex: '#B8956B', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-harvest-blend',
    name: 'Appian Harvest Blend',
    description: 'Multi-toned Harvest Blend from the Appian Collection',
    basePrice: 32,
    category: 'paver',
    image: '/lovable-uploads/a5fa0931-4c93-4c42-81b9-e8ad3f61e659.png',
    colors: [
      { name: 'Harvest Mix', hex: '#B8956B', priceModifier: 1.0 },
      { name: 'Autumn Blend', hex: '#C4A484', priceModifier: 1.05 },
      { name: 'Golden Harvest', hex: '#D2B48C', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-knightsbridge',
    name: 'Appian Knightsbridge',
    description: 'Elegant Knightsbridge style from the Appian Collection',
    basePrice: 35,
    category: 'paver',
    image: '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png',
    colors: [
      { name: 'Knightsbridge Gray', hex: '#8B7765', priceModifier: 1.0 },
      { name: 'English Stone', hex: '#9C8A7A', priceModifier: 1.05 },
      { name: 'London Fog', hex: '#A69B8E', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-napoli',
    name: 'Appian Napoli',
    description: 'Mediterranean Napoli style from the Appian Collection',
    basePrice: 33,
    category: 'paver',
    image: '/lovable-uploads/1a896779-5d8f-4f85-b26b-ab797c2afac4.png',
    colors: [
      { name: 'Napoli Stone', hex: '#A69B8E', priceModifier: 1.0 },
      { name: 'Mediterranean', hex: '#B8A897', priceModifier: 1.05 },
      { name: 'Tuscan Blend', hex: '#C4B5A6', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-rio',
    name: 'Appian Rio',
    description: 'Warm Rio tones from the Appian Collection',
    basePrice: 29,
    category: 'paver',
    image: '/lovable-uploads/b7d9216e-3489-4a50-827d-974a5b6481be.png',
    colors: [
      { name: 'Rio Sand', hex: '#D2B48C', priceModifier: 1.0 },
      { name: 'Copacabana', hex: '#DEB887', priceModifier: 1.05 },
      { name: 'Brazilian Tan', hex: '#CD853F', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-slate',
    name: 'Appian Slate',
    description: 'Modern Slate finish from the Appian Collection',
    basePrice: 34,
    category: 'paver',
    image: '/lovable-uploads/fcc4d668-4682-47d8-89c4-5cba819f80ed.png',
    colors: [
      { name: 'Slate Gray', hex: '#708090', priceModifier: 1.0 },
      { name: 'Charcoal Slate', hex: '#36454F', priceModifier: 1.05 },
      { name: 'Storm Gray', hex: '#696969', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-titanium',
    name: 'Appian Titanium',
    description: 'Contemporary Titanium finish from the Appian Collection',
    basePrice: 36,
    category: 'paver',
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png',
    colors: [
      { name: 'Titanium', hex: '#5F6A6B', priceModifier: 1.0 },
      { name: 'Platinum', hex: '#71797E', priceModifier: 1.05 },
      { name: 'Steel Gray', hex: '#6C7B7F', priceModifier: 1.1 }
    ]
  },
  {
    id: 'appian-charco',
    name: 'Appian Charco',
    description: 'Deep Charco tones from the Appian Collection',
    basePrice: 31,
    category: 'paver',
    image: '/lovable-uploads/6d98de42-0baa-42af-a04c-3b16e3dcb6a6.png',
    colors: [
      { name: 'Charco', hex: '#36454F', priceModifier: 1.0 },
      { name: 'Dark Slate', hex: '#2F4F4F', priceModifier: 1.05 },
      { name: 'Midnight Gray', hex: '#2C3539', priceModifier: 1.1 }
    ]
  },
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