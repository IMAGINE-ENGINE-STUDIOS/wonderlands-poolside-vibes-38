// Paver and coping data with different types and color options

export interface PaverType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: 'paver' | 'coping';
  colors?: PaverColor[]; // Only for coping types
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
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png'
  },
  {
    id: 'appian-amaretto',
    name: 'Appian Amaretto',
    description: 'Rich Amaretto tones from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/5e630c2e-3a3f-49bf-b5d5-425a69959416.png'
  },
  {
    id: 'appian-harvest-blend',
    name: 'Appian Harvest Blend',
    description: 'Multi-toned Harvest Blend from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/a5fa0931-4c93-4c42-81b9-e8ad3f61e659.png'
  },
  {
    id: 'appian-knightsbridge',
    name: 'Appian Knightsbridge',
    description: 'Elegant Knightsbridge style from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png'
  },
  {
    id: 'appian-napoli',
    name: 'Appian Napoli',
    description: 'Mediterranean Napoli style from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/1a896779-5d8f-4f85-b26b-ab797c2afac4.png'
  },
  {
    id: 'appian-rio',
    name: 'Appian Rio',
    description: 'Warm Rio tones from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/b7d9216e-3489-4a50-827d-974a5b6481be.png'
  },
  {
    id: 'appian-slate',
    name: 'Appian Slate',
    description: 'Modern Slate finish from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/fcc4d668-4682-47d8-89c4-5cba819f80ed.png'
  },
  {
    id: 'appian-titanium',
    name: 'Appian Titanium',
    description: 'Contemporary Titanium finish from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
  {
    id: 'appian-charco',
    name: 'Appian Charco',
    description: 'Deep Charco tones from the Appian Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/6d98de42-0baa-42af-a04c-3b16e3dcb6a6.png'
  },
  
  // Catalina Grana Collection
  {
    id: 'catalina-amaretto',
    name: 'Catalina Grana Amaretto',
    description: 'Warm Amaretto tones from the Catalina Grana Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png'
  },
  {
    id: 'catalina-napoli',
    name: 'Catalina Grana Napoli',
    description: 'Mediterranean Napoli style from the Catalina Grana Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/c16269fd-9db6-4791-8cef-9aaf0f5e972a.png'
  },
  {
    id: 'catalina-rio',
    name: 'Catalina Grana Rio',
    description: 'Warm Rio tones from the Catalina Grana Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/d8bded3c-41a9-4591-b0bc-3e20a9977602.png'
  },
  {
    id: 'catalina-scandina-gray',
    name: 'Catalina Grana Scandina Gray',
    description: 'Modern Scandina Gray from the Catalina Grana Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/638972ac-6a43-41e7-ae3c-bce58ab9417b.png'
  },
  {
    id: 'catalina-slate',
    name: 'Catalina Grana Slate',
    description: 'Contemporary Slate finish from the Catalina Grana Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/d85c2bf0-0a66-4aa0-9f64-5e76b511b428.png'
  },
  {
    id: 'catalina-titanium',
    name: 'Catalina Grana Titanium',
    description: 'Premium Titanium finish from the Catalina Grana Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/6aefa246-2c01-43a1-8a58-e195ec3355dc.png'
  },
  
  // Catalina Collection
  {
    id: 'catalina-napoli-standard',
    name: 'Catalina Napoli',
    description: 'Classic Napoli style from the Catalina Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/d07719a5-6046-4bbc-94f7-d0390932f6c7.png'
  },
  {
    id: 'catalina-slate-standard',
    name: 'Catalina Slate',
    description: 'Modern Slate finish from the Catalina Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/3f98fbbb-b09a-4dbc-82f5-5d811564b9f4.png'
  },
  {
    id: 'catalina-titanium-standard',
    name: 'Catalina Titanium',
    description: 'Contemporary Titanium finish from the Catalina Collection',
    basePrice: 20,
    category: 'paver',
    image: '/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png'
  },
  
  // Premium Porcelain
  {
    id: 'coralina-blanco',
    name: 'Coralina',
    description: 'Premium Coralina Blanco 24x24 matte porcelain pavers',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/coralina-blanco.jpg'
  },
  
  // Priceline Deck Collection - Premium deck options at $25/sqft
  {
    id: 'priceline-light',
    name: 'Priceline Light',
    description: 'Premium Priceline Light travertine-style deck finish',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/deck-light.png'
  },
  {
    id: 'priceline-dark',
    name: 'Priceline Dark',
    description: 'Premium Priceline Dark travertine-style deck finish',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/deck-dark.png'
  },
  {
    id: 'priceline-misty',
    name: 'Priceline Misty',
    description: 'Premium Priceline Misty travertine-style deck finish',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/deck-misty.png'
  },
  {
    id: 'priceline-steel',
    name: 'Priceline Steel',
    description: 'Premium Priceline Steel stone-style deck finish',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/deck-steel.png'
  },
  {
    id: 'priceline-pearly',
    name: 'Priceline Pearly',
    description: 'Premium Priceline Pearly stone-style deck finish',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/deck-pearly.png'
  },
  {
    id: 'priceline-silver',
    name: 'Priceline Silver',
    description: 'Premium Priceline Silver stone-style deck finish',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/deck-silver.png'
  },
  {
    id: 'priceline-rustic',
    name: 'Priceline Rustic',
    description: 'Premium Priceline Rustic stone-style deck finish',
    basePrice: 25,
    category: 'paver',
    image: '/lovable-uploads/deck-rustic.png'
  },
  
  // Premium Travertine Collection - $50/sqft
  {
    id: 'travertine-classic',
    name: 'Travertine Classic',
    description: 'Premium natural travertine pavers with classic finish',
    basePrice: 50,
    category: 'paver',
    image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png'
  },
  {
    id: 'travertine-tumbled',
    name: 'Travertine Tumbled',
    description: 'Premium tumbled travertine pavers with antique finish',
    basePrice: 50,
    category: 'paver',
    image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png'
  },
  {
    id: 'travertine-honed',
    name: 'Travertine Honed',
    description: 'Premium honed travertine pavers with smooth finish',
    basePrice: 50,
    category: 'paver',
    image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png'
  }
];

export const copingTypes: PaverType[] = [
  {
    id: 'bullnose-coping',
    name: 'Bullnose Coping',
    description: 'Rounded edge bullnose coping for pool edges',
    basePrice: 20.7,
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
    basePrice: 25.3,
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
    basePrice: 32.2,
    category: 'coping',
    image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png',
    colors: [
      { name: 'Bluestone', hex: '#4682B4', priceModifier: 1.0 },
      { name: 'Limestone', hex: '#E5E4E2', priceModifier: 1.05 },
      { name: 'Travertine', hex: '#F5DEB3', priceModifier: 1.55 },
      { name: 'Granite', hex: '#2F4F4F', priceModifier: 1.3 }
    ]
  },
  {
    id: 'tile-coping',
    name: 'Tile Coping',
    description: 'Ceramic or porcelain tile coping for pool edges',
    basePrice: 18.4,
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

// Helper function to calculate paver area for a pool deck
export const calculatePaverArea = (poolLength: number, poolWidth: number, deckWidth: number): number => {
  const totalLength = poolLength + (2 * deckWidth);
  const totalWidth = poolWidth + (2 * deckWidth);
  const totalArea = totalLength * totalWidth;
  const poolArea = poolLength * poolWidth;
  const deckArea = totalArea - poolArea;
  
  return deckArea;
};

// Helper function to calculate price for pavers based on pool dimensions and deck width
export const calculatePaverPrice = (poolLength: number, poolWidth: number, deckWidth: number): number => {
  const paverArea = calculatePaverArea(poolLength, poolWidth, deckWidth);
  const pricePerSqFt = 20; // Standard paver price per square foot
  return paverArea * pricePerSqFt;
};

// Original helper function for paver types
export const calculatePaverTypePrice = (type: PaverType, surfaceArea: number): number => {
  return type.basePrice * surfaceArea;
};

// Helper function to calculate price for coping (with colors)
export const calculateCopingPrice = (type: PaverType, color: PaverColor, surfaceArea: number): number => {
  return type.basePrice * color.priceModifier * surfaceArea;
};