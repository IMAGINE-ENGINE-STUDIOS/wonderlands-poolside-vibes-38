import { poolLiners, poolTiles, tanningLedges } from '@/data/poolData';
import { paverTypes } from '@/data/paverData';
import { getProductsByCategory } from '@/data/consolidatedProducts';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.webp';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.webp';
import noCoverBlack from '@/assets/covers/no-cover-black.webp';
import { getSaunaOptionRetail } from '@/lib/saunaPricing';

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
  image?: string;
  options?: FeatureOption[];
  basePrice?: number;
  pricePerUnit?: number; // For area-based features
  subFeatures?: FeatureConfig[];
  pricingModifier?: (basePrice: number, extras: any) => number;
  /**
   * Selection features whose option prices are $ per square foot of another
   * area feature (e.g. paver base material priced off the paved deck area).
   */
  pricedByArea?: boolean;
  /** Feature id holding the square footage used by `pricedByArea`. */
  areaSourceId?: string;
}

/**
 * Paver base-material rates.
 * Crushed stone is bought by the ton, so the paved square footage is converted
 * to tonnage: 4" compacted depth => 0.0333 cu yd/sq ft × ~1.4 ton/cu yd.
 */
export const STONE_PRICE_PER_TON = 65;
export const STONE_TONS_PER_SQFT = 0.0173;
export const CONCRETE_BASE_PER_SQFT = 10;

// Shared option data
const spas: FeatureOption[] = [
  {
    model: "Mystic",
    name: "Mystic",
    price: 24000,
    category: 'premium',
    image: "/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.webp",
    dimensions: "7' x 7' x 34\"",
    features: ["LED Lighting", "Jets", "Heater"]
  },
  {
    model: "Serenity",
    name: "Serenity",
    price: 22000,
    category: 'deluxe',
    image: "/wonderlands-branding/1412e1fb-72ec-4219-a98f-4fcffbd15095.webp",
    dimensions: "6' x 6' x 32\"",
    features: ["LED Lighting", "Jets", "Heater"]
  },
  {
    model: "Tranquility",
    name: "Tranquility",
    price: 20000,
    category: 'standard',
    image: "/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.webp",
    dimensions: "5' x 5' x 30\"",
    features: ["Basic Lighting", "Jets"]
  }
];

const poolHeaters: FeatureOption[] = [
  { name: 'Pentair MasterTemp 125 (125K BTU)', price: 3450, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" },
  { name: 'Pentair MasterTemp 250 (250K BTU)', price: 5520, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" },
  { name: 'Pentair MasterTemp 400 (400K BTU)', price: 7245, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" },
  { name: 'Pentair UltraTemp 90 Heat Pump', price: 7762, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" },
  { name: 'Pentair UltraTemp 110 Heat Pump', price: 9488, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" },
  { name: 'Pentair UltraTemp 140 Heat Pump', price: 11212, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" }
];

const spaHeaters: FeatureOption[] = [
  { name: 'Pentair MasterTemp 125 (125K BTU)', price: 3450, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" },
  { name: 'Pentair UltraTemp 90 Heat Pump', price: 7762, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp" }
];

const ledgeHeaters: FeatureOption[] = [
  { name: 'Pentair MasterTemp 125 (125K BTU)', price: 3450, image: azureBlueFinish },
  { name: 'Pentair UltraTemp 90 Heat Pump', price: 7762, image: azureBlueFinish }
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

/**
 * Automatic cover fabrics.
 * Every automatic cover is ordered in a fabric colour, so the colour list is
 * carried on the option itself (used by the product cards) *and* exposed as a
 * `coverColor` sub-feature below, so the FLIP books and the studio both print
 * the colour choices under "Automatic Cover".
 */
export const COVER_COLOR_OPTIONS: FeatureOption[] = [
  { name: 'Light Blue', price: 0, color: '#87CEEB' },
  { name: 'Royal Blue', price: 0, color: '#4169E1' },
  { name: 'Navy Blue', price: 0, color: '#000080' },
  { name: 'Forest Green', price: 0, color: '#228B22' },
  { name: 'Light Gray', price: 0, color: '#D3D3D3' },
  { name: 'Charcoal Gray', price: 0, color: '#36454F' },
  { name: 'Brown', price: 0, color: '#964B00' },
  { name: 'Black', price: 0, color: '#000000' },
];

const coverOptions: FeatureOption[] = [
  { name: 'NO COVER', price: 0, image: noCoverBlack, colors: [] },
  { name: 'Eclipse Automatic Cover', price: 27000, image: '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.webp', colors: COVER_COLOR_OPTIONS },
  { name: 'CS3000 Safety Cover', price: 30000, image: '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.webp', colors: COVER_COLOR_OPTIONS },
  { name: 'Infinity 4000 Smart Cover', price: 32000, image: '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.webp', colors: COVER_COLOR_OPTIONS },
  { name: 'Atom Loop-Loc Cover', price: 25000, image: '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.webp', colors: COVER_COLOR_OPTIONS }
];

/** The colour choice printed with the cover — no upcharge, it is a fabric selection. */
const coverColorFeature: FeatureConfig = {
  id: 'coverColor',
  label: 'Cover Colour',
  description: 'Fabric colour of the selected automatic cover — no upcharge',
  type: 'selection',
  options: COVER_COLOR_OPTIONS,
};

/**
 * Every paver Wonderlands actually sells, read straight from `paverData` so the
 * premium collections (Coralina, Gloca Mirage, Travertine…) can never go missing
 * from a product card, the studio or a FLIP book. Rates are $ per square foot
 * and the list is ordered cheapest first.
 */
const paverOptions: FeatureOption[] = [
  { name: 'Concrete Patio', price: CONCRETE_BASE_PER_SQFT, image: '/images/concrete-patio-texture.avif', collection: 'none', description: 'Standard concrete deck' },
  ...paverTypes
    .filter(p => p.category === 'paver')
    .map(p => ({
      name: p.name,
      price: p.basePrice,
      image: p.image,
      description: p.description,
      collection: `${p.name.split(' ')[0]} Collection`,
    })),
].sort((a, b) => a.price - b.price);


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
        { name: 'deluxe', price: 24 },
        { name: 'premium', price: 26 }
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
    },
    {
      id: 'cover',
      label: 'Automatic Cover',
      type: 'selection',
      icon: 'ShieldCheck',
      options: coverOptions
    },
    {
      id: 'tanningLedge',
      label: 'Tanning Ledge',
      type: 'selection',
      icon: 'Sun',
      options: tanningLedgeOptions
    },
    {
      id: 'screenEnclosure',
      label: 'Screen Enclosure',
      type: 'area',
      icon: 'Home',
      pricePerUnit: 22,
      options: [
        { name: 'standard', price: 22 },
        { name: 'deluxe', price: 24 },
        { name: 'premium', price: 26 }
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
  // Saunas — options, pricing and imagery sourced from Almost Heaven Saunas
  'sauna': [
    {
      id: 'saunaHeater',
      label: 'Sauna Heater',
      description: 'Harvia / KIP heaters as offered by Almost Heaven Saunas',
      type: 'selection',
      icon: 'Flame',
      options: [
        { name: 'Included Heater (as configured)', price: 0 },
        { name: 'KIP Heater w/ Dials', price: 1214, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/KIP-B1x1.png' },
        { name: 'Cilindro Heater', price: 1722, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Cilindro_Heater_1.jpg' },
        { name: 'Cilindro Smart Heater Kit + Fenix', price: 2644, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Saunas_Cilindro_With_Fenix.jpg' },
        { name: 'KIP Digital Smart Heater Kit + Fenix', price: 2714, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Saunas_KIPW_With_Fenix.jpg' },
        { name: 'Spirit Smart Heater Kit + Fenix', price: 3291, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Saunas_Spirit_With_Fenix.jpg' },
        { name: 'Virta Smart Heater Kit + Fenix', price: 3371, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Saunas_Virta_With_Fenix.jpg' },
        { name: 'Club Smart Heater Kit + Fenix', price: 3760, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Saunas_Club_Heater_With_Fenix.jpg' },
        { name: 'Virta Combi Smart Heater Kit + Fenix', price: 4865, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Saunas_Virta_Combi_With_Fenix.jpg' },
        { name: 'M3 Wood-Burning Heater', price: 1093, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Harvia_Heater_M3.jpg' },
        { name: 'M3 Wood-Burning Heater Kit', price: 3939, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/M3_Chimney.png' },
        { name: 'Legend 150 Kit + Chimney', price: 5308, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_Legend_WK150LD_WL100_WHP1500_p1.png' }
      ]
    },
    {
      id: 'heaterControl',
      label: 'Smart Heater Control',
      type: 'selection',
      icon: 'Smartphone',
      options: [
        { name: 'None', price: 0 },
        { name: 'Xenio WiFi Remote Kit', price: 473, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_Xenio_control_panel_CX004WIFI_USA_p1.png' },
        { name: 'Harvia Fenix Smart Heater Control', price: 662, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_Fenix_WifiControlUnit_FX30-U1-U3-XC_FX45-U1-U3-XC_f6.jpg' }
      ]
    },
    {
      id: 'heaterGuard',
      label: 'Heater Guard',
      type: 'selection',
      icon: 'ShieldCheck',
      options: [
        { name: 'None', price: 0 },
        { name: 'KIP Heater Fence', price: 40, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/UwRYRMsg.jpg' },
        { name: 'Safety Rail - Cilindro', price: 266, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Untitleddesign-2022-03-08T095422.450.png' }
      ]
    },
    {
      id: 'saunaStones',
      label: 'Sauna Stones',
      type: 'selection',
      icon: 'Mountain',
      options: [
        { name: 'Included Stones', price: 0 },
        { name: 'Standard Sauna Stones 40 lbs', price: 135, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Stones_Decorative_Olivine_Diabase_Standard_Square.jpg' },
        { name: 'Vulcanite Sauna Stones 40 lbs', price: 163, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Stones_Decorative_Vulcanite_Square.jpg' },
        { name: 'Rounded Sauna Stones 33 lbs', price: 168, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Stones_Decorative_Olivine_Diabase_Rounded_Square.jpg' },
        { name: 'Blizzard Sauna Stones 22 lbs', price: 168, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Stones_Decorative_White_Blizzard_Square.jpg' }
      ]
    },
    {
      id: 'saunaDoor',
      label: 'Door Upgrade',
      type: 'selection',
      icon: 'PanelsTopLeft',
      options: [
        { name: 'Included Door', price: 0 },
        { name: 'Deluxe Glass Door', price: 930, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Bridgeport_Glass_Door.jpg' },
        { name: 'Half & Half Door', price: 1264, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Half_Window_Door.jpg' },
        { name: 'All-Wood Door', price: 1334, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Grayson_All_Wood_Door.jpg' }
      ]
    },
    {
      id: 'saunaWindow',
      label: 'Window Upgrade',
      type: 'selection',
      icon: 'PanelTop',
      options: [
        { name: 'None', price: 0 },
        { name: 'Port Window', price: 299, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/PW2.jpg' },
        { name: 'Vista Window', price: 299, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Pinnacle_Vista_Inside_WideAngle_smallcopy.jpg' }
      ]
    },
    {
      id: 'bucketLadle',
      label: 'Bucket & Ladle Kit',
      type: 'selection',
      icon: 'Droplet',
      options: [
        { name: 'None', price: 0 },
        { name: 'Harvia Legend Bucket & Ladle Kit', price: 99, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Harvia_Legend_pail_SASPO100_p1_1.png' },
        { name: 'Harvia Click Plastic Bucket & Ladle Kit', price: 118, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Harvia_Click_pail_ladle_SA009_p1.png' },
        { name: 'Harvia Bucket and Ladle Kit', price: 187, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_bucket-ladle-set_SAC10111.png' },
        { name: 'Harvia Onyx Bucket, Ladle & Thermometer Kit', price: 330, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Harvia_Onyx_BLT_Set_SA007_p1.png' }
      ]
    },
    {
      id: 'thermometer',
      label: 'Thermometer',
      type: 'selection',
      icon: 'Gauge',
      options: [
        { name: 'None', price: 0 },
        { name: 'Sauna Thermometer – 4" Chrome', price: 54, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Thermometer.jpg' },
        { name: 'Harvia Wooden Thermometer', price: 73, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Harvia_Thermometer.jpg' },
        { name: 'Harvia Legend Thermometer', price: 167, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_Legend_thermometer_SASPO104_p1.png' }
      ]
    },
    {
      id: 'coldPlunge',
      label: 'Cold Plunge',
      type: 'selection',
      icon: 'Snowflake',
      options: [
        { name: 'None', price: 0 },
        { name: 'Black Dip Plunge', price: 3018, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Black_Dip_Plunge_7.png' },
        { name: 'Glacier Cold Plunge + Chiller', price: 9994, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Renew_Cold_Plunge.jpg' },
        { name: 'Polar Cold Plunge + Chiller', price: 11201, image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Almost_Heaven_Polar_Plunge_White.jpg' }
      ]
    },
    {
      id: 'ledMoodLighting',
      label: 'LED Mood Lighting Bar',
      type: 'boolean',
      icon: 'Lightbulb',
      basePrice: 92,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/LED_Mood_Lighting.jpg',
      pricingModifier: base => base
    },
    {
      id: 'saunaSpeaker',
      label: 'Harvia Sauna Speaker',
      type: 'boolean',
      icon: 'Speaker',
      basePrice: 88,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/6.png',
      pricingModifier: base => base
    },
    {
      id: 'headLift',
      label: 'Cedar Sauna Head Lift (headrest)',
      type: 'boolean',
      icon: 'Armchair',
      basePrice: 113,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Head_Rest.jpg',
      pricingModifier: base => base
    },
    {
      id: 'sandTimer',
      label: 'Sauna Sand Timer',
      type: 'boolean',
      icon: 'Hourglass',
      basePrice: 77,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Accessories_Sand_Timer.jpg',
      pricingModifier: base => base
    },
    {
      id: 'careSet',
      label: 'Sauna Care Set',
      type: 'boolean',
      icon: 'Wrench',
      basePrice: 154,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_SaunaCareSet_SAC25070_f4.jpg',
      pricingModifier: base => base
    },
    {
      id: 'paraffinOil',
      label: 'Paraffin Oil',
      type: 'boolean',
      icon: 'Flower2',
      basePrice: 75,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_paraffinoil_SAC25060_p1_782d354b-b183-42fe-8926-24ed3eaa0f87.png',
      pricingModifier: base => base
    },
    {
      id: 'exteriorStain',
      label: 'Almost Heaven Exterior Sauna Stain',
      type: 'boolean',
      icon: 'Paintbrush',
      basePrice: 284,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Stain_Samples_CANS_display.png',
      pricingModifier: base => base
    },
    {
      id: 'rainJacket',
      label: 'Barrel Sauna Rain Jacket',
      type: 'boolean',
      icon: 'Umbrella',
      basePrice: 337,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Princeton_Rain_Jacket.png',
      pricingModifier: base => base
    },
    {
      id: 'showerFloorKit',
      label: 'Outdoor Shower Floor Kit',
      type: 'boolean',
      icon: 'ShowerHead',
      basePrice: 489,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/products/Ellipse_Floor.jpg',
      pricingModifier: base => base
    },
    {
      id: 'irHybridPanels',
      label: 'Retrofit IR Hybrid Panels',
      type: 'boolean',
      icon: 'Sparkles',
      basePrice: 1259,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Hybrid_IR_Panels_Snippet.png',
      pricingModifier: base => base
    },
    {
      id: 'firewoodBasket',
      label: 'Harvia Legend Firewood Basket',
      type: 'boolean',
      icon: 'TreePine',
      basePrice: 425,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_Legend_woodbasket_SASPO102_p1.png',
      pricingModifier: base => base
    },
    {
      id: 'chimneyWaterTank',
      label: 'Harvia Chimney Water Tank',
      type: 'boolean',
      icon: 'Droplet',
      basePrice: 635,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Harvia_waterheater_WP220ST_p1.png',
      pricingModifier: base => base
    },
    {
      id: 'waffleRobe',
      label: 'Sauna Waffle Robe',
      type: 'boolean',
      icon: 'Shirt',
      basePrice: 214,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/WaffleRobe_White__Model_800x800_2e0aabe3-638c-4d4e-9f1d-df3ff0d69271.png',
      pricingModifier: base => base
    },
    {
      id: 'velourTowel',
      label: 'Plush Velour Sauna Towel',
      type: 'boolean',
      icon: 'Layers',
      basePrice: 164,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/BeachTowel_Blue_Flat_800x800_cf825a8f-7a72-4e58-b4d6-62aae02f664c.png',
      pricingModifier: base => base
    },
    {
      id: 'saunaSlides',
      label: 'Sauna Slides',
      type: 'boolean',
      icon: 'Footprints',
      basePrice: 86,
      image: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Sandals_White_Overhead_800x800_61820090-74e8-4d32-bb1f-7f2009cf894a.png',
      pricingModifier: base => base
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
      label: 'Tiles',
      type: 'selection',
      icon: 'Grid3x3',
      options: tileOptions.map(t => ({ ...t, price: t.price / 2 }))
    },
    {
      id: 'cover',
      label: 'Automatic Cover',
      type: 'selection',
      icon: 'ShieldCheck',
      options: coverOptions
    },
    {
      id: 'spa',
      label: 'Add a Spa',
      type: 'selection',
      icon: 'Droplet',
      options: spas
    },
    {
      id: 'screenEnclosure',
      label: 'Screen Enclosure',
      type: 'area',
      icon: 'Home',
      pricePerUnit: 22,
      options: [
        { name: 'standard', price: 22 },
        { name: 'deluxe', price: 24 },
        { name: 'premium', price: 26 }
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
  /**
   * Pavers.
   * Installation is INCLUDED in the per-square-foot paver price — it is never a
   * separate line. The base underneath is derived from the same paved area:
   * concrete is quoted by the square foot, crushed stone by the ton (tonnage is
   * converted from the square footage at `STONE_TONS_PER_SQFT`).
   */
  'paver': [
    {
      id: 'area',
      label: 'Installation Area',
      description: 'Total square footage to be paved — supplied and installed, installation included',
      type: 'area',
      icon: 'Grid3x3',
      pricePerUnit: 20
    },
    {
      id: 'baseMaterial',
      label: 'Base Material',
      description: 'Priced from the paved area above — concrete by the square foot, crushed stone by the ton',
      type: 'selection',
      icon: 'Layers',
      /* Prices below are $ per square foot of the paved deck (see areaSourceId) */
      pricedByArea: true,
      areaSourceId: 'area',
      options: [
        { name: 'Standard Gravel', price: 0, description: 'Included with the installation' },
        {
          name: 'Premium Crushed Stone',
          /* $/sq ft = tons per sq ft × $ per ton */
          price: Number((STONE_TONS_PER_SQFT * STONE_PRICE_PER_TON).toFixed(2)),
          pricePerTon: STONE_PRICE_PER_TON,
          tonsPerSqFt: STONE_TONS_PER_SQFT,
          description: `${STONE_PRICE_PER_TON}/ton — ${STONE_TONS_PER_SQFT} ton per sq ft at a 4" compacted base`
        },
        {
          name: 'Concrete Base',
          price: CONCRETE_BASE_PER_SQFT,
          pricePerSqFt: CONCRETE_BASE_PER_SQFT,
          description: `${CONCRETE_BASE_PER_SQFT}/sq ft — 4" reinforced slab under the pavers`
        }
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
        { name: 'Deluxe ($24/sq ft)', price: 24 },
        { name: 'Premium 2 Story ($26/sq ft)', price: 26 }
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

/**
 * Sauna option prices in the catalog above are supplier costs. Apply the internal
 * Wonderlands markup (freight, labor, profit) once at module load so every surface
 * — studio, cart, quotes, checkout — shows the same customer-facing price.
 */
const applySaunaRetail = (features: FeatureConfig[]): FeatureConfig[] =>
  features.map(feature => ({
    ...feature,
    basePrice: feature.basePrice !== undefined ? getSaunaOptionRetail(feature.basePrice) : undefined,
    pricePerUnit:
      feature.pricePerUnit !== undefined ? getSaunaOptionRetail(feature.pricePerUnit) : undefined,
    options: feature.options?.map(option => ({ ...option, price: getSaunaOptionRetail(option.price) })),
    subFeatures: feature.subFeatures ? applySaunaRetail(feature.subFeatures) : undefined,
  }));

PRODUCT_FEATURES.sauna = applySaunaRetail(PRODUCT_FEATURES.sauna);



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
        // Area-derived selections (paver base material) quote per sq ft of the
        // paved deck; crushed stone's $/sq ft already folds in the ton conversion.
        if (feature.pricedByArea) {
          const area =
            parseFloat(extras?.[feature.areaSourceId ?? 'area']) ||
            parseFloat(extras?.paverSurfaceArea) ||
            parseFloat(extras?.area) ||
            0;
          price = price * area;
        }
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
