import { poolLiners, poolTiles, tanningLedges } from '@/data/poolData';
import { paverTypes } from '@/data/paverData';
import { getProductsByCategory } from '@/data/consolidatedProducts';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.jpg';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.jpg';

// Product type definitions
export type ProductType = 'pool' | 'spa' | 'sauna' | 'tanning-ledge';

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
  { name: 'Heat Pump - Eco Series', price: 4500, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Heat Pump - Pro Series', price: 5500, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Heat/Cool Pump 127K BTU 230V Pentair Ultratemp', price: 8000, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Gas Heater - Standard', price: 3200, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Gas Heater - High Efficiency', price: 4200, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Solar Heater - Basic', price: 2800, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Solar Heater - Premium', price: 3800, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" }
];

const spaHeaters: FeatureOption[] = [
  { name: 'Spa Heat Pump - Compact', price: 3500, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Spa Heat Pump - Premium', price: 4500, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Spa Gas Heater', price: 2800, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" },
  { name: 'Solar Spa Heater', price: 2200, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png" }
];

const ledgeHeaters: FeatureOption[] = [
  { name: 'Compact Heat Pump', price: 2800, image: azureBlueFinish },
  { name: 'Solar Heater', price: 2200, image: azureBlueFinish },
  { name: 'Electric Heater', price: 1800, image: azureBlueFinish }
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
  { name: 'NO COVER', price: 0, image: shaleGrayFinish },
  { name: 'Eclipse Automatic Cover', price: 16000, image: '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png' },
  { name: 'CS3000 Safety Cover', price: 24000, image: '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png' },
  { name: 'Infinity 4000 Smart Cover', price: 32000, image: '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png' },
  { name: 'Atom Loop-Loc Cover', price: 19000, image: '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.png' }
];

const paverOptions: FeatureOption[] = [
  { name: 'No Pavers', price: 0, image: azureBlueFinish },
  ...paverTypes.map(paver => ({
    name: paver.name,
    price: 0,
    image: paver.image || azureBlueFinish,
    description: paver.description,
    collection: paver.id.includes('appian') ? 'appian' : paver.id.includes('catalina') ? 'catalina' : 'standard'
  }))
];

const tanningLedgeOptions: FeatureOption[] = tanningLedges.map(ledge => ({
  name: ledge.name,
  price: ledge.price,
  image: ledge.image,
  dimensions: ledge.dimensions
}));

// Centralized product features configuration
export const PRODUCT_FEATURES: Record<ProductType, FeatureConfig[]> = {
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
      pricePerUnit: 15,
      options: paverOptions
    },
    {
      id: 'screenEnclosure',
      label: 'Screen Enclosure',
      type: 'area',
      icon: 'Home',
      pricePerUnit: 15, // Base rate, modified by quality
      options: [
        { name: 'standard', price: 15 },
        { name: 'deluxe', price: 22 },
        { name: 'premium', price: 28 }
      ]
    },
    {
      id: 'concreteConstruction',
      label: 'Concrete Construction',
      type: 'boolean',
      icon: 'Building',
      pricingModifier: (basePrice) => basePrice * 1.2
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
      pricePerUnit: 15,
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
      pricePerUnit: 15,
      options: paverOptions
    },
    {
      id: 'screenEnclosure',
      label: 'Screen Enclosure',
      type: 'area',
      icon: 'Home',
      pricePerUnit: 15,
      options: [
        { name: 'standard', price: 15 },
        { name: 'deluxe', price: 22 },
        { name: 'premium', price: 28 }
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
      pricePerUnit: 15,
      options: paverOptions
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
    case 'area':
      const area = parseFloat(value) || 0;
      const selectedOption = feature.options?.find(opt => opt.name === extras[`${feature.id}Option`]);
      const pricePerUnit = selectedOption?.price || feature.pricePerUnit || 0;
      price = area * pricePerUnit;
      break;
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
        defaults[feature.id] = false;
        defaults[`${feature.id}Option`] = feature.options?.[0]?.name || '';
        break;
      case 'quantity':
        defaults[feature.id] = false;
        defaults[`${feature.id}Quantity`] = 1;
        break;
      case 'area':
        defaults[feature.id] = false;
        defaults[`${feature.id}Area`] = 0;
        defaults[`${feature.id}Option`] = feature.options?.[0]?.name || '';
        break;
      case 'nested':
        defaults[feature.id] = false;
        defaults[`${feature.id}Model`] = feature.options?.[0]?.name || feature.options?.[0]?.model || '';
        feature.subFeatures?.forEach(subFeature => {
          defaults[subFeature.id] = false;
          defaults[`${subFeature.id}Model`] = subFeature.options?.[0]?.name || '';
        });
        break;
    }
  });

  return defaults;
};
