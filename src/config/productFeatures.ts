import { poolLiners, poolTiles, tanningLedges } from '@/data/poolData';
import { paverTypes } from '@/data/paverData';
import { getProductsByCategory } from '@/data/consolidatedProducts';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.jpg';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.jpg';
import noCoverBlack from '@/assets/no-cover-black.png';

// Product type definitions
export type ProductType = 'pool' | 'spa' | 'sauna' | 'tanning-ledge' | 'cover' | 'paver' | 'heater' | 'screen-enclosure' | 'driveway-gate' | 'scene';

// Feature type definitions
export type FeatureType = 'boolean' | 'selection' | 'quantity' | 'nested' | 'area';

export interface FeatureOption {
  name: string;
  price: number;
  image?: string;
  description?: string;
  color?: string;
  [key: string]: any;
}

export interface FeatureConfig {
  id: string;
  label: string;
  description?: string;
  type: FeatureType;
  icon?: string;
  options?: FeatureOption[];
  basePrice?: number;
  pricePerUnit?: number; // For area-based features
  subFeatures?: FeatureConfig[];
  pricingModifier?: (basePrice: number, extras: any) => number;
}

// Shared option data
const spas: FeatureOption[] = [
  {
    model: "Mystic",
    name: "Mystic",
    price: 24000,
    category: 'premium',
    image: "/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.png",
    dimensions: "7' x 7' x 34\"",
    features: ["LED Lighting", "Jets", "Heater"]
  },
  {
    model: "Serenity",
    name: "Serenity",
    price: 22000,
    category: 'deluxe',
    image: "/lovable-uploads/1412e1fb-72ec-4219-a98f-4fcffbd15095.png",
    dimensions: "6' x 6' x 32\"",
    features: ["LED Lighting", "Jets", "Heater"]
  },
  {
    model: "Tranquility",
    name: "Tranquility",
    price: 20000,
    category: 'standard',
    image: "/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.png",
    dimensions: "5' x 5' x 30\"",
    features: ["Basic Lighting", "Jets"]
  }
];

const poolHeaters: FeatureOption[] = [
  { name: 'Pentair MasterTemp 125 (125K BTU)', price: 2300, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Pentair MasterTemp 250 (250K BTU)', price: 3680, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Pentair MasterTemp 400 (400K BTU)', price: 4830, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Pentair UltraTemp 90 Heat Pump', price: 5175, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Pentair UltraTemp 110 Heat Pump', price: 6325, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Pentair UltraTemp 140 Heat Pump', price: 7475, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" }
];

const spaHeaters: FeatureOption[] = [
  { name: 'Pentair MasterTemp 125 (125K BTU)', price: 2300, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Pentair UltraTemp 90 Heat Pump', price: 5175, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" }
];

const ledgeHeaters: FeatureOption[] = [
  { name: 'Pentair MasterTemp 125 (125K BTU)', price: 2300, image: azureBlueFinish },
  { name: 'Pentair UltraTemp 90 Heat Pump', price: 5175, image: azureBlueFinish }
];

const finishOptions: FeatureOption[] = getProductsByCategory('finish').map(finish => ({
  name: finish.name,
  color: '#4169E1',
  image: finish.image,
  price: finish.price,
  collection: finish.collection,
  category: finish.category,
  description: finish.description
}));

const linerOptions: FeatureOption[] = [
  { name: 'Standard Blue', color: '#4169E1', price: 0, image: azureBlueFinish, type: 'Standard' },
  ...poolLiners.map(liner => ({
    name: liner.name,
    color: '#4169E1',
    price: liner.price,
    image: liner.image,
    type: liner.type,
    description: liner.description
  }))
];

const tileOptions: FeatureOption[] = [
  { name: 'Standard Waterline', color: '#4682B4', price: 0, image: azureBlueFinish },
  ...poolTiles.map(tile => ({
    name: tile.name,
    color: '#4682B4',
    price: tile.price,
    image: tile.image,
    description: tile.description
  }))
];

const coverOptions: FeatureOption[] = [
  { name: 'NO COVER', price: 0, image: noCoverBlack },
  { name: 'Eclipse Automatic Cover', price: 27000, image: '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png' },
  { name: 'CS3000 Safety Cover', price: 30000, image: '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png' },
  { name: 'Infinity 4000 Smart Cover', price: 32000, image: '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png' },
  { name: 'Atom Loop-Loc Cover', price: 25000, image: '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.png' }
];

const paverOptions: FeatureOption[] = [
  { name: 'Concrete Patio', price: 0, image: '/images/concrete-patio-texture.avif', collection: 'none' },
  
  // Appian Collection - $20/sq ft
  { name: 'Appian Adobe', price: 20, image: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png', collection: 'Appian Collection' },
  { name: 'Appian Amaretto', price: 20, image: '/lovable-uploads/5e630c2e-3a3f-49bf-b5d5-425a69959416.png', collection: 'Appian Collection' },
  { name: 'Appian Harvest Blend', price: 20, image: '/lovable-uploads/a5fa0931-4c93-4c42-81b9-e8ad3f61e659.png', collection: 'Appian Collection' },
  { name: 'Appian Knightsbridge', price: 20, image: '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png', collection: 'Appian Collection' },
  { name: 'Appian Napoli', price: 20, image: '/lovable-uploads/1a896779-5d8f-4f85-b26b-ab797c2afac4.png', collection: 'Appian Collection' },
  { name: 'Appian Rio', price: 20, image: '/lovable-uploads/b7d9216e-3489-4a50-827d-974a5b6481be.png', collection: 'Appian Collection' },
  { name: 'Appian Slate', price: 20, image: '/lovable-uploads/fcc4d668-4682-47d8-89c4-5cba819f80ed.png', collection: 'Appian Collection' },
  { name: 'Appian Titanium', price: 20, image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png', collection: 'Appian Collection' },
  { name: 'Appian Charco', price: 20, image: '/lovable-uploads/6d98de42-0baa-42af-a04c-3b16e3dcb6a6.png', collection: 'Appian Collection' },
  
  // Catalina Grana Collection - $27/sq ft
  { name: 'Catalina Grana Amaretto', price: 27, image: '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png', collection: 'Catalina Grana Collection' },
  { name: 'Catalina Grana Napoli', price: 27, image: '/lovable-uploads/c16269fd-9db6-4791-8cef-9aaf0f5e972a.png', collection: 'Catalina Grana Collection' },
  { name: 'Catalina Grana Rio', price: 27, image: '/lovable-uploads/d8bded3c-41a9-4591-b0bc-3e20a9977602.png', collection: 'Catalina Grana Collection' },
  { name: 'Catalina Grana Scandina Gray', price: 27, image: '/lovable-uploads/638972ac-6a43-41e7-ae3c-bce58ab9417b.png', collection: 'Catalina Grana Collection' },
  { name: 'Catalina Grana Slate', price: 27, image: '/lovable-uploads/d85c2bf0-0a66-4aa0-9f64-5e76b511b428.png', collection: 'Catalina Grana Collection' },
  { name: 'Catalina Grana Titanium', price: 27, image: '/lovable-uploads/6aefa246-2c01-43a1-8a58-e195ec3355dc.png', collection: 'Catalina Grana Collection' },
  
  // Catalina Collection - $20/sq ft
  { name: 'Catalina Napoli', price: 20, image: '/lovable-uploads/d07719a5-6046-4bbc-94f7-d0390932f6c7.png', collection: 'Catalina Collection' },
  { name: 'Catalina Slate', price: 20, image: '/lovable-uploads/3f98fbbb-b09a-4dbc-82f5-5d811564b9f4.png', collection: 'Catalina Collection' },
  { name: 'Catalina Titanium', price: 20, image: '/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png', collection: 'Catalina Collection' }
];

const tanningLedgeOptions: FeatureOption[] = tanningLedges.map(ledge => ({
  name: ledge.name,
  price: ledge.price,
  image: ledge.image,
  dimensions: ledge.dimensions
}));

// Centralized product features configuration
export const PRODUCT_FEATURES: Record<ProductType, FeatureConfig[]> = {
  'scene': [], // Scene products use hardcoded Belgard Studio UI
  'pool': [
    {
      id: 'finish',
      label: 'Pool Finish',
      type: 'selection',
      icon: 'Waves',
      options: finishOptions
    },
    {
      id: 'liner',
      label: 'Pool Liner',
      type: 'selection',
      icon: 'Droplets',
      options: linerOptions
    },
    {
      id: 'tiles',
      label: 'Pool Tiles',
      type: 'selection',
      icon: 'Grid3x3',
      options: tileOptions
    },
    {
      id: 'heater',
      label: 'Pool Heater',
      type: 'selection',
      icon: 'Thermometer',
      options: poolHeaters
    },
    {
      id: 'cover',
      label: 'Automatic Cover',
      type: 'selection',
      icon: 'ShieldCheck',
      options: coverOptions
    },
    {
      id: 'jets',
      label: 'Jets',
      type: 'quantity',
      icon: 'Zap',
      basePrice: 1800
    },
    {
      id: 'spa',
      label: 'Add a Spa',
      type: 'selection',
      icon: 'Droplet',
      options: spas
    },
    {
      id: 'tanningLedge',
      label: 'Tanning Ledge',
      type: 'selection',
      icon: 'Sun',
      options: tanningLedgeOptions
    },
    {
      id: 'pavers',
      label: 'Deck Pavers',
      type: 'area',
      icon: 'Grid3x3',
      pricePerUnit: 20,
      options: paverOptions
    },
    {
      id: 'screenEnclosure',
      label: 'Screen Enclosure',
      type: 'area',
      icon: 'Home',
      pricePerUnit: 22, // Base rate (Wonder Cage) - Updated from $27 to $22
      options: [
        { name: 'standard', price: 22 },
        { name: 'deluxe', price: 22 },
        { name: 'premium', price: 22 }
      ]
    },
    {
      id: 'concreteConstruction',
      label: 'Concrete Construction',
      type: 'boolean',
      icon: 'Building',
      basePrice: 15000
    }
  ],
  'spa': [
    {
      id: 'finish',
      label: 'Spa Finish',
      type: 'selection',
      icon: 'Waves',
      options: finishOptions
    },
    {
      id: 'liner',
      label: 'Waterline',
      type: 'selection',
      icon: 'Droplets',
      options: linerOptions.map(l => ({ ...l, price: l.price / 2 }))
    },
    {
      id: 'tiles',
      label: 'Spa Tiles',
      type: 'selection',
      icon: 'Grid3x3',
      options: tileOptions.map(t => ({ ...t, price: t.price / 2 }))
    },
    {
      id: 'heater',
      label: 'Spa Heater',
      type: 'selection',
      icon: 'Thermometer',
      options: spaHeaters
    },
    {
      id: 'jets',
      label: 'Jets',
      type: 'quantity',
      icon: 'Zap',
      basePrice: 1800
    },
    {
      id: 'pavers',
      label: 'Deck Pavers',
      type: 'area',
      icon: 'Grid3x3',
      pricePerUnit: 20,
      options: paverOptions
    }
  ],
  'sauna': [
    {
      id: 'spa',
      label: 'Add a Spa',
      type: 'nested',
      icon: 'Droplet',
      options: spas,
      subFeatures: [
        {
          id: 'heater',
          label: 'Spa Heater',
          type: 'selection',
          icon: 'Zap',
          options: poolHeaters
        },
        {
          id: 'waterline',
          label: 'Waterline',
          type: 'selection',
          icon: 'Droplet',
          options: linerOptions
        }
      ]
    },
    {
      id: 'deckPavers',
      label: 'Deck Pavers',
      type: 'area',
      icon: 'Grid3x3',
      pricePerUnit: 20,
      options: paverOptions
    },
    {
      id: 'screenEnclosure',
      label: 'Screen Enclosure',
      type: 'area',
      icon: 'Home',
      pricePerUnit: 22,
      options: [
        { name: 'standard', price: 22 },
        { name: 'deluxe', price: 22 },
        { name: 'premium', price: 22 }
      ]
    }
  ],
  'tanning-ledge': [
    {
      id: 'finish',
      label: 'Finish',
      type: 'selection',
      icon: 'Waves',
      options: finishOptions.map(f => ({ ...f, price: f.price / 2 }))
    },
    {
      id: 'heater',
      label: 'Heater',
      type: 'selection',
      icon: 'Thermometer',
      options: ledgeHeaters
    },
    {
      id: 'jets',
      label: 'Jets',
      type: 'quantity',
      icon: 'Zap',
      basePrice: 1200
    },
    {
      id: 'pavers',
      label: 'Pavers',
      type: 'area',
      icon: 'Grid3x3',
      pricePerUnit: 20,
      options: paverOptions
    }
  ],
  'cover': [
    {
      id: 'installation',
      label: 'Professional Installation',
      type: 'boolean',
      icon: 'Wrench',
      basePrice: 2000
    },
    {
      id: 'benchEnclosure',
      label: 'Bench Enclosure',
      type: 'selection',
      icon: 'Box',
      options: [
        { name: 'None', price: 0 },
        { name: 'Wood Bench Enclosure', price: 3000 },
        { name: 'Concrete Bench Enclosure', price: 5500 }
      ]
    }
  ],
  'paver': [
    {
      id: 'area',
      label: 'Installation Area',
      description: 'Total square footage to be paved',
      type: 'area',
      icon: 'Grid3x3',
      pricePerUnit: 20
    },
    {
      id: 'installation',
      label: 'Professional Installation',
      type: 'boolean',
      icon: 'Wrench',
      basePrice: 3000
    },
    {
      id: 'baseMaterial',
      label: 'Base Material',
      type: 'selection',
      icon: 'Layers',
      options: [
        { name: 'Standard Gravel', price: 0 },
        { name: 'Premium Crushed Stone', price: 1500 },
        { name: 'Concrete Base', price: 3000 }
      ]
    }
  ],
  'heater': [
    {
      id: 'installation',
      label: 'Professional Installation',
      description: 'Includes electrical/gas hookup and testing',
      type: 'boolean',
      icon: 'Wrench',
      basePrice: 2000
    },
    {
      id: 'warranty',
      label: 'Extended Warranty',
      type: 'selection',
      icon: 'ShieldCheck',
      options: [
        { name: 'Standard (Included)', price: 0 },
        { name: '3-Year Extended', price: 800 },
        { name: '5-Year Extended', price: 1500 }
      ]
    },
    {
      id: 'maintenancePlan',
      label: 'Annual Maintenance Plan',
      type: 'boolean',
      icon: 'CalendarCheck',
      basePrice: 500
    }
  ],
  'screen-enclosure': [
    {
      id: 'area',
      label: 'Enclosure Area',
      description: 'Total square footage to be enclosed',
      type: 'area',
      icon: 'Home',
      pricePerUnit: 22
    },
    {
      id: 'quality',
      label: 'Quality Level',
      type: 'selection',
      icon: 'Star',
      options: [
        { name: 'Standard ($22/sq ft)', price: 22 },
        { name: 'Deluxe ($22/sq ft)', price: 22 },
        { name: 'Premium ($22/sq ft)', price: 22 }
      ]
    },
    {
      id: 'doorType',
      label: 'Door Type',
      type: 'selection',
      icon: 'DoorOpen',
      options: [
        { name: 'Single Sliding Door', price: 0 },
        { name: 'Double Sliding Door', price: 800 },
        { name: 'French Doors', price: 1500 }
      ]
    },
    {
      id: 'roofStyle',
      label: 'Roof Style',
      type: 'selection',
      icon: 'Triangle',
      options: [
        { name: 'Flat Roof', price: 0 },
        { name: 'Gable Roof', price: 2000 },
        { name: 'Hip Roof', price: 3000 }
      ]
    }
  ],
  'driveway-gate': [
    {
      id: 'automation',
      label: 'Automatic Gate Opener',
      description: 'Automated gate opening system for convenient access',
      type: 'boolean',
      icon: 'Zap',
      basePrice: 2000
    },
    {
      id: 'installation',
      label: 'Professional Installation',
      type: 'boolean',
      icon: 'Wrench',
      basePrice: 1500
    },
    {
      id: 'accessControl',
      label: 'Access Control System',
      type: 'selection',
      icon: 'Smartphone',
      options: [
        { name: 'None', price: 0 },
        { name: 'Keypad Entry', price: 500 },
        { name: 'Remote Control (2 remotes)', price: 300 },
        { name: 'Smart Phone App Control', price: 800 },
        { name: 'Full System (Keypad + App + 4 remotes)', price: 1500 }
      ]
    },
    {
      id: 'intercom',
      label: 'Intercom System',
      type: 'selection',
      icon: 'Phone',
      options: [
        { name: 'None', price: 0 },
        { name: 'Audio Intercom', price: 600 },
        { name: 'Video Intercom', price: 1200 }
      ]
    }
  ]
};

// Helper function to get features for a product type
export const getProductFeatures = (productType: ProductType): FeatureConfig[] => {
  return PRODUCT_FEATURES[productType] || [];
};

// Helper function to calculate total price with features
export const calculateFeaturePrice = (
  feature: FeatureConfig,
  value: any,
  extras: any
): number => {
  let price = 0;

  switch (feature.type) {
    case 'boolean':
      if (value && feature.pricingModifier) {
        return feature.basePrice || 0;
      }
      break;
    case 'selection':
      if (feature.options) {
        const selected = feature.options.find(opt => 
          opt.name === value || opt.model === value
        );
        price = selected?.price || 0;
      }
      break;
    case 'quantity':
      price = (feature.basePrice || 0) * (value || 0);
      break;
    case 'area': {
      const area = parseFloat(value) || 0;

      // Some screens store the "option" value under different keys.
      // Support the legacy keys so area-based pricing uses the correct rate.
      const optionKey = `${feature.id}Option`;
      const optionName =
        extras?.[optionKey] ??
        (feature.id === 'pavers' ? extras?.paverOption : undefined) ??
        (feature.id === 'screenEnclosure' ? extras?.screenEnclosureQuality : undefined);

      const selectedOption = feature.options?.find((opt) => opt.name === optionName);
      const pricePerUnit = selectedOption?.price ?? feature.pricePerUnit ?? 0;
      price = area * pricePerUnit;
      break;
    }
    case 'nested':
      // For nested features, calculate main feature price
      if (value && feature.options) {
        const selected = feature.options.find(opt => 
          opt.name === value || opt.model === value
        );
        price = selected?.price || 0;
      }
      // Add sub-feature prices
      if (feature.subFeatures) {
        feature.subFeatures.forEach(subFeature => {
          const subValue = extras[subFeature.id];
          if (subValue) {
            price += calculateFeaturePrice(subFeature, subValue, extras);
          }
        });
      }
      break;
  }

  return price;
};

// Helper to get default extras for a product type
export const getDefaultExtras = (productType: ProductType): any => {
  const features = getProductFeatures(productType);
  const defaults: any = {};

  features.forEach(feature => {
    switch (feature.type) {
      case 'boolean':
        defaults[feature.id] = false;
        break;
      case 'selection':
        defaults[feature.id] = 'None';
        break;
      case 'quantity':
        defaults[feature.id] = 0;
        break;
      case 'area':
        defaults[feature.id] = 0;
        break;
      case 'nested':
        defaults[feature.id] = false;
        // Set sub-features to unselected by default
        feature.subFeatures?.forEach(subFeature => {
          if (subFeature.type === 'selection') {
            defaults[subFeature.id] = 'None';
          } else if (subFeature.type === 'quantity') {
            defaults[subFeature.id] = 0;
          } else if (subFeature.type === 'area') {
            defaults[subFeature.id] = 0;
          } else {
            defaults[subFeature.id] = false;
          }
        });
        break;
    }
  });

  return defaults;
};
