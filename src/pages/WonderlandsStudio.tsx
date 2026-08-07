import * as React from "react";
const { useState, useEffect, useRef } = React;
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award, Palette, Camera, Layers, Plus, Minus, Download, Printer, ShoppingCart, Search, ChevronDown, Settings, Package, ChevronRight, ChevronLeft, Send, Loader2, Pencil } from "lucide-react";
import { parseDimensions, parseDepth } from "@/components/scene3d/SceneConverter";
import { Label } from "@/components/ui/label";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import FinancingOptions from "@/components/FinancingOptions";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import StudioCartWidget from "@/components/StudioCartWidget";
import { spas, pools } from "@/components/PoolCatalog";
import { gilmerPools } from "@/data/gilmerPools";
import { gilmerSpas } from "@/data/gilmerSpas";
import { tanningLedges, poolLiners, poolTiles } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { getPaverPricePerSqFt, calculatePaverCost, SCREEN_ENCLOSURE_PRICING } from "@/utils/paverPricing";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import { saunas } from "@/data/saunaData";
import { poolFinishes as poolFinishesData, poolLiners as poolLinersData, poolTiles as poolTilesData, tanningLedges as tanningLedgesData } from "@/data/consolidatedProducts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SurveyQuoteTool from "@/components/SurveyQuoteTool";
import ProjectTypeToggle from "@/components/ProjectTypeToggle";
import { DynamicFeatureRenderer } from "@/components/DynamicFeatureRenderer";
import { PoolBuilder } from "@/components/PoolBuilder";
import HeaterSizeCalculator from "@/components/HeaterSizeCalculator";
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import oceanBlueFinish from '@/assets/finishes/ocean-blue-g3.jpg';
import sapphireBlueFinish from '@/assets/finishes/sapphire-blue-g3.jpg';
import nightSkyFinish from '@/assets/finishes/night-sky-g3.jpg';
import athensPearlFinish from '@/assets/finishes/athens-pearl-white-g3.jpg';
import lagoonBlueFinish from '@/assets/finishes/lagoon-blue-g2.jpg';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.jpg';
import coastalBronzeFinish from '@/assets/finishes/coastal-bronze-g3.jpg';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.jpg';
import noCoverBlack from '@/assets/no-cover-black.png';
import ProductMediaGallery, { MediaItem } from '@/components/ProductMediaGallery';
import { getProductFeatures, getDefaultExtras, calculateFeaturePrice, type ProductType } from '@/config/productFeatures';
import { UnifiedPoolVisualizer } from "@/components/UnifiedPoolVisualizer";
import { productToScene } from "@/components/scene3d/SceneConverter";
import { Box } from 'lucide-react';
import AdvancedSearch from '@/components/AdvancedSearch';
import { studioScreenEnclosures, studioFencing, studioLanai, studioCovers } from '@/data/studioCategoryProducts';
import FenceConfigurator from '@/components/fence/FenceConfigurator';
import EnclosureConfigurator from '@/components/enclosure/EnclosureConfigurator';


import { artificialGrassOptions, PRICE_PER_SQFT as GRASS_PRICE_PER_SQFT, getGrassPricePerSqFt, calculateGrassCost } from '@/data/artificialGrassData';
import { landscapingPlants } from '@/data/landscapingData';
import { drivewayGates } from '@/data/drivewayGates';

// Rocky Waterfalls data
import sunsetGroveImage from '@/assets/sunset-grove-kit-pool.jpg';
import maldivesImage from '@/assets/maldiveskit-castlerock.jpg';
import serenityImage from '@/assets/serenitykit.jpg';

const rockyWaterfallTiers = [
  { name: 'Sunset Grove', price: 17500, image: sunsetGroveImage },
  { name: 'Maldives', price: 5600, image: maldivesImage },
  { name: 'Serenity', price: 9500, image: serenityImage },
];
const rockyWaterfallColors = ['Castle Rock', 'Gray', 'Brown'];

type StudioTab = 'pools' | 'spas' | 'tanning-ledges' | 'saunas' | 'screen-enclosures' | 'patio-fencing' | 'lanai' | 'pavers' | 'artificial-grass' | 'landscaping' | 'covers' | 'driveway-gates' | 'finishes' | 'liners' | 'build-a-pool';

interface StudioCategory {
  value: StudioTab;
  label: string;
  icon: React.ElementType;
  activeClass: string;
}

const STUDIO_CATEGORIES: StudioCategory[] = [
  { value: 'pools', label: 'Pools', icon: Waves, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'spas', label: 'Spas', icon: Droplets, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'tanning-ledges', label: 'Tanning Ledges', icon: Sun, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'saunas', label: 'Saunas', icon: Thermometer, activeClass: 'bg-amber-600 text-white' },
  { value: 'screen-enclosures', label: 'Screen Enclosures', icon: Shield, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'patio-fencing', label: 'Patio Fencing', icon: Layers, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'lanai', label: 'Lanai', icon: Sun, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'pavers', label: 'Pavers', icon: Package, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'artificial-grass', label: 'Artificial Grass', icon: Layers, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'landscaping', label: 'Landscaping', icon: Palette, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'covers', label: 'Covers', icon: Shield, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'driveway-gates', label: 'Driveway Gates', icon: Settings, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'finishes', label: 'Finishes', icon: Palette, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'liners', label: 'Liners', icon: Layers, activeClass: 'bg-primary text-primary-foreground' },
  { value: 'build-a-pool', label: 'Build a Pool', icon: Waves, activeClass: 'bg-teal text-white' },
];

// Studio search uses the same AdvancedSearch component as the main page


interface Product {
  model?: string;
  name?: string;
  price: number;
  category: string;
  image?: string;
  gallery?: string[]; // Support for pool image gallery (string array)
  media?: MediaItem[]; // New: support for multiple images/videos
  dimensions?: string;
  depth?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  type?: 'pool' | 'spa' | 'tanning-ledge' | 'sauna' | 'scene' | 'cover' | 'paver' | 'heater' | 'screen-enclosure' | 'driveway-gate' | 'fencing' | 'lanai' | 'landscaping' | 'finish' | 'liner';
  unit?: 'sqft' | 'linear-ft';
  id?: string;
  description?: string;
  brand?: string; // Pool brand (Glimmerglass, Latham, etc.)
}
interface ProductExtras {
  liner: boolean;
  heater: boolean;
  cover: boolean;
  jets: boolean;
  jetQuantity: number;
  finish: string;
  linerOption: string;
  coverOption: string;
  meshColor: string;
  tiles: boolean;
  tileOption: string;
  heaterModel: string;
  pavers: boolean;
  paverOption: string;
  copingPaverOption: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: string;
  concreteConstruction: boolean;
  // Belgard Studio options
  concreteSlabs: boolean;
  permeablePavers: boolean;
  porcelainPavers: boolean;
  wallSystems: boolean;
  capsEdgers: boolean;
  outdoorKitchens: boolean;
  fireplaces: boolean;
  firePitKits: boolean;
  pergolas: boolean;
  // Sauna-specific options
  spa: boolean;
  selectedSpaModel: string;
  // Quote data
  extrasBreakdown?: Array<{
    name: string;
    price: number;
    image: string;
  }>;
  extrasTotal?: number;
}

/**
 * Universal Product Features System
 * 
 * This system uses centralized feature configuration from src/config/productFeatures.ts
 * to ensure consistency across all product types and prevent feature mismatches.
 * 
 * Product Type Features:
 * - POOLS: Finish, Liner, Tiles, Heater, Cover, Jets, Spa, Tanning Ledge, Pavers, Screen Enclosure, Concrete Construction
 * - SPAS: Finish, Waterline, Tiles, Heater, Jets, Pavers
 * - SAUNAS: Add a Spa (with Spa Heater + Waterline sub-options), Deck Pavers, Screen Enclosure
 * - TANNING LEDGES: Finish, Heater, Jets, Pavers
 * - COVERS: Installation, Extended Warranty
 * - PAVERS: Installation Area, Professional Installation, Base Material
 * - HEATERS/CHILLERS: Professional Installation ($2000), Extended Warranty, Annual Maintenance Plan
 * - SCREEN ENCLOSURES: Enclosure Area, Quality Level, Door Type, Roof Style
 * - DRIVEWAY GATES: Automatic Gate Opener ($2000), Professional Installation, Access Control System, Intercom System
 * 
 * IMPORTANT: When adding new categories, update src/config/productFeatures.ts
 * The centralized config ensures type safety and prevents mismatched features.
 */

// Helper function to get product price (no discount applied)
const getProductPrice = (product: Product) => {
  return product.price;
};

// Finish options with images - using consolidated data
const finishOptions = poolFinishesData.map(finish => ({
  name: finish.name,
  price: finish.price,
  image: finish.image,
  collection: finish.collection || 'Standard',
  description: finish.description
}));

// Pool heaters with models - Pentair only (prices match main page catalog)
const poolHeaters = [{
  name: 'Pentair MasterTemp 125 (125K BTU)',
  price: 3450,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png'
}, {
  name: 'Pentair MasterTemp 250 (250K BTU)',
  price: 5520,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png'
}, {
  name: 'Pentair MasterTemp 400 (400K BTU)',
  price: 7245,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png'
}, {
  name: 'Pentair UltraTemp 90 Heat Pump',
  price: 7762,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png'
}, {
  name: 'Pentair UltraTemp 110 Heat Pump',
  price: 9488,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png'
}, {
  name: 'Pentair UltraTemp 140 Heat Pump',
  price: 11212,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png'
}];

// Liner options - using consolidated data (no Standard Blue - default is selected finish)
const linerOptions = poolLinersData.map(liner => ({
  name: liner.name,
  price: liner.price,
  image: liner.image,
  type: liner.type || 'Premium'
}));

// Cover options - NO COVER removed, checkbox handles opt-out
const coverOptions = [{
  name: 'Eclipse',
  color: '#2F4F4F',
  price: 27000, // Updated price
  image: "/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png",
  category: 'cover'
}, {
  name: 'CS3000',
  color: '#2F4F4F',
  price: 30000, // Updated price
  image: "/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png",
  category: 'cover'
}, {
  name: 'Infinity 4000',
  color: '#2F4F4F',
  price: 32000,
  image: "/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png",
  category: 'cover'
}, {
  name: 'Atom',
  color: '#2F4F4F',
  price: 25000, // Updated price
  image: "/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.png",
  category: 'cover'
}];

const meshColorOptions = [
  { name: 'Green', color: '#2F5D32', hex: '#2F5D32' },
  { name: 'Blue', color: '#1E3A8A', hex: '#1E3A8A' },
  { name: 'Tan', color: '#D2B48C', hex: '#D2B48C' },
  { name: 'Black', color: '#1F2937', hex: '#1F2937' },
  { name: 'Gray', color: '#6B7280', hex: '#6B7280' }
];

// Tile options - using consolidated data (price calculated per sqft based on pool dimensions)
const tileOptions = poolTilesData.map(tile => ({
  name: tile.name,
  color: '#4682B4',
  price: tile.price, // catalog price shown on main page Tiles section
  image: tile.image
}));

import concreteDeckTexture from "@/assets/textures/concrete-deck.avif";
import screenEnclosureDeluxe from "@/assets/screen-enclosure-deluxe.jpeg";
import screenEnclosurePremium from "@/assets/screen-enclosure-premium.jpeg";

// Paver options - using consolidated data + existing paverTypes
const paverOptions = [{
  name: 'Concrete Deck',
  color: '#808080',
  price: 0,
  image: concreteDeckTexture,
  collection: 'concrete'
}, ...paverTypes.map(paver => ({
  name: paver.name,
  color: '#D3D3D3',
  price: 0,
  image: paver.image,
  collection: paver.id.includes('appian') ? 'appian' : paver.id.includes('catalina-grana') ? 'catalina-grana' : paver.id.includes('catalina') ? 'catalina' : 'standard'
}))];

// Paver categories for dropdown
const paverCategories = [{
  value: 'all',
  label: 'All Collections'
}, {
  value: 'appian',
  label: 'Appian Collection'
}, {
  value: 'catalina',
  label: 'Catalina Collection'
}, {
  value: 'catalina-grana',
  label: 'Catalina Grana Collection'
}, {
  value: 'standard',
  label: 'Standard Collection'
}];
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium':
      return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe':
      return 'bg-gradient-to-r from-primary to-teal';
    case 'classic':
      return 'bg-gradient-to-r from-secondary to-accent';
    case 'compact':
      return 'bg-gradient-to-r from-teal to-primary';
    default:
      return 'bg-gradient-to-r from-primary to-teal';
  }
};
const getExtraPrice = (extra: string) => {
  switch (extra) {
    case 'jets':
      return 1800;
    default:
      return 0;
  }
};

// Helper function to parse a single dimension value like "11'" or "8'6\""
const parseSingleDimension = (dimStr: string): number => {
  // Match formats: "11'" or "11'6\"" or "11'6"" or "8'6\""
  const feetInchMatch = dimStr.match(/(\d+)[''](?:(\d+)[""]?)?/);
  if (feetInchMatch) {
    const feet = parseInt(feetInchMatch[1]) || 0;
    const inches = feetInchMatch[2] ? parseInt(feetInchMatch[2]) : 0;
    return feet + (inches / 12);
  }
  // Fallback: just parse as number
  const num = parseFloat(dimStr);
  return isNaN(num) ? 0 : num;
};

// Helper function to parse pool dimensions to get length and width
// Handles formats like "11' x 20'", "8'6\" x 14'", "15'6\" x 38'"
const parsePoolDimensions = (dimensions: string | undefined): { length: number; width: number } => {
  if (!dimensions) return { length: 30, width: 15 }; // Default dimensions
  
  // Split by x or × to get width and length parts
  const parts = dimensions.split(/\s*[×x]\s*/i);
  if (parts.length === 2) {
    const width = parseSingleDimension(parts[0].trim());
    const length = parseSingleDimension(parts[1].trim());
    if (width > 0 && length > 0) {
      return { width, length };
    }
  }
  return { length: 30, width: 15 }; // Default
};

// Helper function to calculate pool perimeter from dimensions
const calculatePoolPerimeter = (dimensions: string | undefined): number => {
  const { length, width } = parsePoolDimensions(dimensions);
  return 2 * (length + width);
};

// Helper function to calculate pool area from dimensions
const calculatePoolArea = (dimensions: string | undefined): number => {
  const { length, width } = parsePoolDimensions(dimensions);
  return length * width;
};

// Tile cost uses the catalog price shown on the main page Tiles section
const getTileCost = (tileName: string | undefined): number =>
  poolTilesData.find(tile => tile.name === tileName)?.price ?? 0;

// Pool interior surface area (floor + walls) for liner pricing per sqft
const calculatePoolLinerArea = (dimensions: string | undefined): number => {
  const { length, width } = parsePoolDimensions(dimensions);
  const floor = length * width;
  const walls = 2 * (length + width) * 5; // avg 5ft depth
  return Math.round(floor + walls);
};
// Product types that use the full pool/spa feature set
const WATER_PRODUCT_TYPES = ['pool', 'spa', 'tanning-ledge', 'sauna'];
const isWaterProduct = (type?: string): boolean => WATER_PRODUCT_TYPES.includes(type || 'pool');

// Unit-priced categories (screen enclosures, fencing, lanai, pavers, grass, liners...)
const getProductUnit = (product: any): 'sqft' | 'linear-ft' | null => {
  if (!product) return null;
  if (product.unit === 'sqft' || product.unit === 'linear-ft') return product.unit;
  const cat = String(product.category || '').toLowerCase();
  if (cat.includes('linear')) return 'linear-ft';
  if (cat.includes('sq ft') || cat.includes('sqft')) return 'sqft';
  return null;
};
const unitLabel = (unit: 'sqft' | 'linear-ft') => (unit === 'sqft' ? 'sq ft' : 'linear ft');

const WonderlandsStudio = () => {
  const {
    addToCart
  } = useShoppingCart();
  const {
    toast
  } = useToast();
  const { priceMultiplier, projectType } = useProjectType();
  const [activeTab, setActiveTab] = useState<'pools' | 'spas' | 'tanning-ledges' | 'saunas' | 'scenes' | 'build-a-pool' | 'screen-enclosures' | 'patio-fencing' | 'lanai' | 'pavers' | 'artificial-grass' | 'landscaping' | 'covers' | 'driveway-gates' | 'finishes' | 'liners'>('pools');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sceneFromBuilder, setSceneFromBuilder] = useState<any>(null);
  const [textureLibFromBuilder, setTextureLibFromBuilder] = useState<any>(null);
  const [poolBuilderData, setPoolBuilderData] = useState<{
    points: any[];
    features: any[];
    perimeter: number;
    area: number;
    deckArea?: number;
    totalCost?: number;
    breakdown?: {
      poolCost: number;
      deckCost: number;
      copingCost: number;
      featuresCost: number;
      total: number;
    };
  } | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<any>({
    liner: false,
    heater: false,
    cover: false,
    jets: false,
    jetQuantity: 0,
    finish: '',
    linerOption: '',
    coverOption: '',
    meshColor: '',
    tiles: false,
    tileOption: '',
    heaterModel: '',
    pavers: false,
    paverOption: '',
    copingPaverOption: '',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: '',
    concreteConstruction: false,
    // Belgard Studio options
    concreteSlabs: false,
    permeablePavers: false,
    porcelainPavers: false,
    wallSystems: false,
    capsEdgers: false,
    outdoorKitchens: false,
    fireplaces: false,
    firePitKits: false,
    pergolas: false,
    // Sauna-specific options
    spa: false,
    selectedSpaModel: '',
    rockyWaterfall: false,
    rockyWaterfallTier: '',
    rockyWaterfallColor: '',
    artificialGrass: false,
    artificialGrassColor: 'Light Green',
    artificialGrassArea: '',
    // Standalone category configuration (screen enclosures, fencing, lanai, etc.)
    categoryQuantity: '',
  });
  const [paverSurfaceArea, setPaverSurfaceArea] = useState('');
  const [paverCategory, setPaverCategory] = useState('all');
  const [showExtrasDropdown, setShowExtrasDropdown] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [activeFeatureCarousel, setActiveFeatureCarousel] = useState<string | null>(null);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'product-image' | '2d-designer' | '3d-viewer'>('product-image');
  const [customPoolShape, setCustomPoolShape] = useState<any[] | null>(null);
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [aiSearchDocked, setAiSearchDocked] = useState(false);
  
  // Ref to store extras data synchronously for the quote modal (avoids race condition)
  const extrasDataRef = useRef<{ extrasBreakdown: Array<{ name: string; price: number; image: string }>; extrasTotal: number }>({
    extrasBreakdown: [],
    extrasTotal: 0
  });

  // ─── Real-time auto-save of studio state to localStorage ───
  const STUDIO_CACHE_KEY = 'wonderlands_studio_state_v1';
  const hydratedRef = useRef(false);

  // Load cached state on mount (only if no URL params override it)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('fromBuilder') === 'true' || urlParams.get('model')) return;
      const raw = localStorage.getItem(STUDIO_CACHE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.activeTab) setActiveTab(s.activeTab);
      if (s.selectedProduct) setSelectedProduct(s.selectedProduct);
      if (s.selectedExtras) setSelectedExtras((prev: any) => ({ ...prev, ...s.selectedExtras }));
      if (typeof s.paverSurfaceArea === 'string') setPaverSurfaceArea(s.paverSurfaceArea);
      if (s.paverCategory) setPaverCategory(s.paverCategory);
      if (s.viewMode) setViewMode(s.viewMode);
      if (s.customPoolShape) setCustomPoolShape(s.customPoolShape);
    } catch (e) {
      console.warn('Studio autosave restore failed:', e);
    }
  }, []);

  // Debounced auto-save on any tracked state change
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STUDIO_CACHE_KEY, JSON.stringify({
          activeTab,
          selectedProduct,
          selectedExtras,
          paverSurfaceArea,
          paverCategory,
          viewMode,
          customPoolShape,
          savedAt: new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Studio autosave failed:', e);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [activeTab, selectedProduct, selectedExtras, paverSurfaceArea, paverCategory, viewMode, customPoolShape]);

  // Handle URL parameters for product search integration
  useEffect(() => {

    // Scroll to top when component mounts to show product image
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for pool builder scene data
    const fromBuilder = urlParams.get('fromBuilder');
    const sceneDataParam = urlParams.get('sceneData');
    const textureLibParam = urlParams.get('textureLib');
    
      if (fromBuilder === 'true' && sceneDataParam && textureLibParam) {
      try {
        const sceneData = JSON.parse(decodeURIComponent(sceneDataParam));
        const textureLib = JSON.parse(decodeURIComponent(textureLibParam));
        setSceneFromBuilder(sceneData);
        setTextureLibFromBuilder(textureLib);
        setViewMode('3d-viewer');
        setActiveTab('build-a-pool');
        return;
      } catch (err) {
        console.error('Failed to parse scene data from URL:', err);
      }
    }
    
    const model = urlParams.get('model');
    const price = urlParams.get('price');
    const category = urlParams.get('category');
    const image = urlParams.get('image');
    const dimensions = urlParams.get('dimensions');
    const depth = urlParams.get('depth');
    if (model && price) {
      // First try to find the product in our existing data
      let foundProduct: Product | null = null;

      // Check in pools array
      const poolMatch = pools.find(p => p.model === model);
      if (poolMatch) {
        foundProduct = {
          ...poolMatch,
          type: 'pool' as const
        };
        setActiveTab('pools');
      }

      // Check in Gilmer pools
      const gilmerMatch = gilmerPools.find(p => p.model === model);
      if (gilmerMatch) {
        foundProduct = {
          ...gilmerMatch,
          type: 'pool' as const,
          name: gilmerMatch.model
        };
        setActiveTab('pools');
      }

      // Check in spas
      const spaMatch = spas.find(s => s.model === model);
      if (spaMatch) {
        foundProduct = {
          ...spaMatch,
          type: 'spa' as const,
          name: spaMatch.model
        };
        setActiveTab('spas');
      }

      // Check in tanning ledges - only if not already found as a pool (to avoid conflicts like "Genesis" pool vs "Genesis" ledge)
      if (!foundProduct) {
        const ledgeMatch = tanningLedges.find(l => l.name === model);
        if (ledgeMatch) {
          foundProduct = {
            ...ledgeMatch,
            type: 'tanning-ledge' as const,
            model: ledgeMatch.name,
            category: 'premium'
          };
          setActiveTab('tanning-ledges');
        }
      }

      // Check in saunas
      const saunaMatch = saunas.find(s => s.name === model || s.model === model);
      if (saunaMatch) {
        foundProduct = {
          ...saunaMatch,
          type: 'sauna' as const,
          model: saunaMatch.model || saunaMatch.name
        };
        setActiveTab('saunas');
      }

      // If not found in our data, create from URL params and use category to determine type
      if (!foundProduct) {
        // Determine product type from category parameter
        let productType: 'pool' | 'spa' | 'tanning-ledge' | 'sauna' | 'cover' | 'paver' | 'heater' | 'screen-enclosure' | 'driveway-gate' = 'pool';
        
        if (category) {
          const categoryLower = category.toLowerCase();
          if (categoryLower.includes('sauna') || categoryLower === 'sauna') {
            productType = 'sauna';
          } else if (categoryLower.includes('spa') || categoryLower === 'spa') {
            productType = 'spa';
          } else if (categoryLower.includes('tanning') || categoryLower.includes('ledge')) {
            productType = 'tanning-ledge';
          } else if (categoryLower.includes('cover') || categoryLower.includes('safety')) {
            productType = 'cover';
          } else if (categoryLower.includes('paver') || categoryLower.includes('deck')) {
            productType = 'paver';
          } else if (categoryLower.includes('heater') || categoryLower.includes('chiller')) {
            productType = 'heater';
          } else if (categoryLower.includes('screen') || categoryLower.includes('enclosure')) {
            productType = 'screen-enclosure';
          } else if (categoryLower.includes('gate') || categoryLower.includes('driveway')) {
            productType = 'driveway-gate';
          } else {
            productType = 'pool';
          }
        }
        
        foundProduct = {
          model: model,
          price: parseInt(price),
          category: category || 'standard',
          image: image ? decodeURIComponent(image) : undefined,
          dimensions: dimensions ? decodeURIComponent(dimensions) : undefined,
          depth: depth ? decodeURIComponent(depth) : undefined,
          type: productType
        };
        
        // Set the correct tab based on product type
        switch (productType) {
          case 'sauna':
            setActiveTab('saunas');
            break;
          case 'spa':
            setActiveTab('spas');
            break;
          case 'tanning-ledge':
            setActiveTab('tanning-ledges');
            break;
          default:
            setActiveTab('pools');
        }
      }
      
      // Reset all extras to unselected state when loading from search
      if (foundProduct?.type) {
        const defaultExtras = getDefaultExtras(foundProduct.type as ProductType);
        setSelectedExtras(defaultExtras);
      }
      
      setSelectedProduct(foundProduct);
      setLeftSidebarCollapsed(false);
    }
  }, []);

  // Scene rooms from Belgard Studio
  const sceneRooms = [{
    id: 'sandbox',
    name: 'Sandbox - Build Your Own',
    category: 'scene',
    price: 0,
    image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png',
    // Astoria pool image
    description: 'Build your own custom outdoor space with all available options'
  }, {
    id: 'mediterranean-villa',
    name: 'Mediterranean Villa',
    category: 'scene',
    price: 0,
    image: 'https://rooms.belgard.com/wp-content/uploads/2024/07/KR_12_A_2.jpg?optimize=low&auto=webp',
    description: 'Elegant Mediterranean-inspired outdoor living space with natural stone elements'
  }, {
    id: 'modern-courtyard',
    name: 'Modern Courtyard',
    category: 'scene',
    price: 0,
    image: 'https://rooms.belgard.com/wp-content/uploads/KR_HNA_23_5.jpg?optimize=low&auto=webp',
    description: 'Contemporary courtyard design with clean lines and geometric patterns'
  }, {
    id: 'coastal-retreat',
    name: 'Coastal Retreat',
    category: 'scene',
    price: 0,
    image: 'https://rooms.belgard.com/wp-content/uploads/KR_24_FL_1_5.jpg?optimize=low&auto=webp',
    description: 'Relaxing coastal-inspired space perfect for entertaining'
  }, {
    id: 'rustic-lodge',
    name: 'Rustic Lodge',
    category: 'scene',
    price: 0,
    image: 'https://rooms.belgard.com/wp-content/uploads/cR_7_a_4-Photo.jpg?optimize=low&auto=webp',
    description: 'Warm rustic design with natural materials and cozy atmosphere'
  }];

  // Belgard Studio additional features for scenes
  const belgardStudioOptions = {
    concreteSlabs: [{
      name: 'Concrete Paver Slab - Sample',
      price: 12,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    permeablePavers: [{
      name: 'Permeable Paver - Sample',
      price: 18,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    porcelainPavers: [{
      name: 'Porcelain Paver - Sample',
      price: 25,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    wallSystems: [{
      name: 'Retaining Wall System - Sample',
      price: 35,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    capsEdgers: [{
      name: 'Cap & Edger Set - Sample',
      price: 8,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    outdoorKitchens: [{
      name: 'Outdoor Kitchen Island - Sample',
      price: 8500,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    fireplaces: [{
      name: 'Outdoor Fireplace - Sample',
      price: 4500,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    firePitKits: [{
      name: 'Fire Pit Kit - Sample',
      price: 1200,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }],
    pergolas: [{
      name: 'Pergola & Panel System - Sample',
      price: 3500,
      image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png',
      category: 'sample'
    }]
  };

  // Get filtered products based on active tab
  const getFilteredProducts = () => {
    let products: Product[] = [];
    switch (activeTab) {
      case 'pools':
        products = [...pools.map(pool => ({
          ...pool,
          type: 'pool' as const
        })), ...gilmerPools.map(pool => ({
          ...pool,
          type: 'pool' as const,
          model: pool.model,
          name: pool.model
        }))];
        break;
      case 'spas':
        products = spas.map(spa => ({
          ...spa,
          type: 'spa' as const,
          name: spa.model
        }));
        break;
      case 'tanning-ledges':
        products = tanningLedges.map(ledge => ({
          ...ledge,
          type: 'tanning-ledge' as const,
          model: ledge.name,
          category: 'premium'
        }));
        break;
      case 'saunas':
        products = saunas.map(sauna => ({
          ...sauna,
          type: 'sauna' as const,
          model: sauna.model,
          name: sauna.name
        }));
        break;
      case 'scenes':
        products = sceneRooms.map(scene => ({
          ...scene,
          type: 'scene' as const,
          model: scene.name
        }));
        break;
      case 'screen-enclosures':
        products = studioScreenEnclosures.map(item => ({
          ...item,
          type: 'screen-enclosure' as const,
          model: item.name,
          category: 'per sq ft'
        }));
        break;
      case 'patio-fencing':
        products = studioFencing.map(item => ({
          ...item,
          type: 'fencing' as const,
          model: item.name,
          category: 'per linear ft'
        }));
        break;
      case 'lanai':
        products = studioLanai.map(item => ({
          ...item,
          type: 'lanai' as const,
          model: item.name,
          category: 'per sq ft'
        }));
        break;
      case 'pavers':
        products = paverTypes.map(paver => ({
          name: paver.name,
          model: paver.name,
          price: paver.basePrice,
          image: paver.image,
          description: paver.description,
          type: 'paver' as const,
          category: 'per sq ft'
        }));
        break;
      case 'artificial-grass':
        products = artificialGrassOptions.map(grass => ({
          name: grass.name,
          model: grass.name,
          price: getGrassPricePerSqFt(grass.name),
          image: grass.image,
          category: 'per sq ft'
        }));
        break;
      case 'landscaping':
        products = landscapingPlants.map(plant => ({
          name: plant.name,
          model: plant.name,
          price: plant.minPrice,
          image: plant.image,
          type: 'landscaping' as const,
          category: plant.category
        }));
        break;
      case 'covers':
        products = studioCovers.map(cover => ({
          ...cover,
          type: 'cover' as const,
          model: cover.name,
          category: 'automatic cover'
        }));
        break;
      case 'driveway-gates':
        products = drivewayGates.map(gate => ({
          name: `${gate.model} ${gate.baseDimensions}`,
          model: `${gate.model} ${gate.baseDimensions}`,
          price: gate.basePrice,
          image: gate.image,
          description: gate.description,
          dimensions: gate.baseDimensions,
          brand: gate.brand,
          type: 'driveway-gate' as const,
          category: 'driveway gate'
        }));
        break;
      case 'finishes':
        products = poolFinishesData.map(finish => ({
          name: finish.name,
          model: finish.name,
          price: finish.price,
          image: finish.image,
          description: finish.description,
          type: 'finish' as const,
          category: finish.collection || 'finish'
        }));
        break;
      case 'liners':
        products = poolLinersData.map(liner => ({
          name: liner.name,
          model: liner.name,
          price: liner.price,
          image: liner.image,
          description: liner.description,
          type: 'liner' as const,
          category: 'per sq ft'
        }));
        break;
      case 'build-a-pool':
        // Custom pool builder - no predefined products
        products = [];
        break;
    }
    if (searchQuery) {
      products = products.filter(product => (product.model || product.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return products;
  };
  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0;

    // Start with base product price (with pool discount if applicable)
    let total = getProductPrice(selectedProduct);

    // Get features for this product type
    const productType = selectedProduct.type || 'pool';
    const features = getProductFeatures(productType as ProductType);

    // Unit-priced standalone categories: base price is a rate, multiply by quantity
    const unit = getProductUnit(selectedProduct);
    if (!isWaterProduct(productType) && productType !== 'scene') {
      if (productType === 'fencing') {
        // Fence pricing comes from the advanced Florida-code configurator
        total = parseFloat(selectedExtras.fenceTotal) || 0;
      } else if (unit) {
        const qty = parseFloat(selectedExtras.categoryQuantity) || 0;
        total = getProductPrice(selectedProduct) * qty;
      }

      // Only the features configured for this exact product type apply
      features.forEach((feature) => {
        total += calculateFeaturePrice(feature, selectedExtras[feature.id], selectedExtras);
      });
      return total * priceMultiplier;
    }

    const usesCustomExtras = productType === 'pool' || productType === 'spa' || productType === 'tanning-ledge';

    // Calculate price for each feature (pavers + screen enclosure are handled separately)
    features.forEach((feature) => {
      if (usesCustomExtras && (feature.id === 'pavers' || feature.id === 'screenEnclosure')) {
        return;
      }
      const featurePrice = calculateFeaturePrice(feature, selectedExtras[feature.id], selectedExtras);
      total += featurePrice;
    });

    // Wonderlands Studio uses custom state shape for pavers + screen enclosure.
    // Add them explicitly so totals update correctly.
    if (usesCustomExtras) {
      const areaStr = selectedExtras.paverSurfaceArea || paverSurfaceArea;
      if (
        selectedExtras.pavers &&
        areaStr &&
        !isNaN(parseFloat(areaStr)) &&
        selectedExtras.paverOption &&
        selectedExtras.paverOption !== 'Concrete Deck'
      ) {
        total += calculatePaverCost(areaStr, selectedExtras.paverOption);
      }

      if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureArea > 0) {
        const quality = (selectedExtras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium') || 'standard';
        const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
        total += selectedExtras.screenEnclosureArea * pricePerSqFt;
      }

      // Add spa if selected with a valid model
      if (selectedExtras.spa && selectedExtras.spaModel) {
        const allSpas = [...spas, ...gilmerSpas];
        const selectedSpa = allSpas.find((s: any) => s.model === selectedExtras.spaModel);
        if (selectedSpa) {
          total += selectedSpa.price;
        }
      }

      // Add spa finish if selected (for Latham spas on Glimmerglass pools)
      if (selectedExtras.spaFinish && selectedExtras.spaFinishPrice) {
        total += selectedExtras.spaFinishPrice;
      }

      // Add tanning ledge if selected with a valid model
      if (selectedExtras.tanningLedge && selectedExtras.tanningLedgeModel) {
        const selectedLedge = tanningLedges.find((l: any) => l.name === selectedExtras.tanningLedgeModel);
        if (selectedLedge) {
          total += selectedLedge.price;
        }
      }

      // Add rocky waterfall if selected
      if (selectedExtras.rockyWaterfall && selectedExtras.rockyWaterfallTier) {
        const tier = rockyWaterfallTiers.find(t => t.name === selectedExtras.rockyWaterfallTier);
        if (tier) {
          total += tier.price;
        }
      }

      // Add artificial grass if selected
      if (selectedExtras.artificialGrass && !isNaN(parseFloat(selectedExtras.artificialGrassArea))) {
        total += calculateGrassCost(selectedExtras.artificialGrassArea, selectedExtras.artificialGrassColor);
      }
    }

    // Apply project type multiplier (3x for commercial)
    return total * priceMultiplier;
  };
  const getSelectedExtrasCount = () => {
    let count = 0;
    // Spa: must be checked AND have a model selected
    if (selectedExtras.spa && selectedExtras.spaModel && selectedExtras.spaModel !== '' && selectedExtras.spaModel !== 'None') count++;
    // Spa Finish: must have a finish selected with price
    if (selectedExtras.spaFinish && selectedExtras.spaFinishPrice && selectedExtras.spaFinishPrice > 0) count++;
    // Tanning Ledge: must be checked AND have a model selected
    if (selectedExtras.tanningLedge && selectedExtras.tanningLedgeModel && selectedExtras.tanningLedgeModel !== '' && selectedExtras.tanningLedgeModel !== 'None') count++;
    // Rocky Waterfall: must have a tier selected
    if (selectedExtras.rockyWaterfall && selectedExtras.rockyWaterfallTier) count++;
    // Finish: must have price > 0 (free finishes don't count)
    const selectedFinish = finishOptions.find(f => f.name === selectedExtras.finish);
    if (selectedExtras.finish && selectedExtras.finish !== 'None' && selectedExtras.finish !== '' && selectedFinish && selectedFinish.price > 0) count++;
    // Heater: must be checked AND have a model selected
    if (selectedExtras.heater && selectedExtras.heaterModel && selectedExtras.heaterModel !== '' && selectedExtras.heaterModel !== 'None') count++;
    // Cover: must be checked AND have a valid option (not NO COVER)
    if (selectedExtras.cover && selectedExtras.coverOption && selectedExtras.coverOption !== 'NO COVER' && selectedExtras.coverOption !== 'None' && selectedExtras.coverOption !== '') count++;
    // Jets: must be checked AND have quantity > 0
    if (selectedExtras.jets && selectedExtras.jetQuantity > 0) count++;
    // Tiles: must be checked AND have a valid option
    if (selectedExtras.tiles && selectedExtras.tileOption && selectedExtras.tileOption !== 'None' && selectedExtras.tileOption !== '') count++;
    // Liner: must be checked AND have a valid option (not Standard Blue which is free/default)
    if (selectedExtras.liner && selectedExtras.linerOption && selectedExtras.linerOption !== 'None' && selectedExtras.linerOption !== '' && selectedExtras.linerOption !== 'Standard Blue') count++;
    // Pavers: must be checked AND have valid option AND have area > 0
    const paverArea = parseFloat(selectedExtras.paverSurfaceArea || paverSurfaceArea);
    if (selectedExtras.pavers && selectedExtras.paverOption && selectedExtras.paverOption !== 'Concrete Deck' && selectedExtras.paverOption !== 'None' && selectedExtras.paverOption !== '' && !isNaN(paverArea) && paverArea > 0) count++;
    // Screen Enclosure: must have quality AND area > 0
    if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureQuality && selectedExtras.screenEnclosureArea > 0) count++;
    // Concrete Construction: simple boolean
    if (selectedExtras.concreteConstruction) count++;
    // Artificial Grass: must be checked AND have area > 0
    if (selectedExtras.artificialGrass && parseFloat(selectedExtras.artificialGrassArea) > 0) count++;
    return count;
  };
  const removeExtra = (extraType: string) => {
    const newExtras = {
      ...selectedExtras
    };
    switch (extraType) {
      case 'spa':
        newExtras.spa = false;
        newExtras.spaModel = '';
        newExtras.selectedSpaModel = '';
        newExtras.spaFinish = '';
        newExtras.spaFinishPrice = 0;
        break;
      case 'spaFinish':
        newExtras.spaFinish = '';
        newExtras.spaFinishPrice = 0;
        break;
      case 'tanningLedge':
        newExtras.tanningLedge = false;
        newExtras.tanningLedgeModel = '';
        break;
      case 'finish':
        newExtras.finish = 'None';
        break;
      case 'heater':
        newExtras.heater = false;
        break;
      case 'cover':
        newExtras.cover = false;
        newExtras.coverOption = 'NO COVER';
        break;
      case 'jets':
        newExtras.jets = false;
        newExtras.jetQuantity = 0;
        break;
      case 'tiles':
        newExtras.tiles = false;
        newExtras.tileOption = '';
        break;
      case 'liner':
        newExtras.liner = false;
        newExtras.linerOption = 'None';
        break;
      case 'pavers':
        newExtras.pavers = false;
        newExtras.paverOption = 'Concrete Deck';
        newExtras.paverSurfaceArea = '';
        setPaverSurfaceArea('');
        break;
      case 'screen':
        newExtras.screenEnclosure = false;
        newExtras.screenEnclosureArea = 0;
        newExtras.screenEnclosureQuality = '';
        break;
      case 'concrete':
        newExtras.concreteConstruction = false;
        break;
      case 'rockyWaterfall':
        newExtras.rockyWaterfall = false;
        newExtras.rockyWaterfallTier = '';
        newExtras.rockyWaterfallColor = '';
        break;
      case 'artificialGrass':
        newExtras.artificialGrass = false;
        newExtras.artificialGrassArea = '';
        break;
    }
    setSelectedExtras(newExtras);
  };
  const handleQuoteRequest = () => {
    if (!selectedProduct) return;

    // Create detailed extras breakdown for quote tool
    const extrasBreakdown = [];
    
    console.log('🏗️ BUILDING EXTRAS BREAKDOWN', {
      selectedExtras,
      selectedProduct,
      paverSurfaceArea
    });

    // Add finish if selected
    const selectedFinish = finishOptions.find(finish => finish.name === selectedExtras.finish);
    if (selectedFinish && selectedExtras.finish && selectedExtras.finish !== 'None' && selectedExtras.finish !== '' && selectedFinish.price > 0) {
      extrasBreakdown.push({
        name: `${selectedFinish.name} Finish`,
        price: selectedFinish.price,
        image: selectedFinish.image
      });
    }

    // Add heater if selected
    if (selectedExtras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === selectedExtras.heaterModel);
      if (selectedHeater) {
        extrasBreakdown.push({
          name: selectedHeater.name,
          price: selectedHeater.price,
          image: selectedHeater.image
        });
      }
    }

    // Add cover if selected
    const coverOption = coverOptions.find(option => option.name === selectedExtras.coverOption);
    if (coverOption && selectedExtras.cover && coverOption.name !== 'NO COVER') {
      extrasBreakdown.push({
        name: coverOption.name,
        price: coverOption.price,
        image: coverOption.image
      });
    }

    // Add jets if selected
    if (selectedExtras.jets && selectedExtras.jetQuantity > 0) {
      extrasBreakdown.push({
        name: `Spa Jets (${selectedExtras.jetQuantity})`,
        price: getExtraPrice('jets') * selectedExtras.jetQuantity,
        image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
      });
    }

    // Add tiles if selected (catalog price from main page Tiles section)
    const tileOption = tileOptions.find(option => option.name === selectedExtras.tileOption);
    if (tileOption && selectedExtras.tiles) {
      const tilePrice = getTileCost(tileOption.name);
      extrasBreakdown.push({
        name: tileOption.name,
        price: tilePrice,
        image: tileOption.image
      });
    }

    // Add liner if selected - must have a valid option selected (not empty, not 'None', not free option)
    if (selectedExtras.liner && selectedExtras.linerOption && selectedExtras.linerOption !== 'None' && selectedExtras.linerOption !== '' && selectedExtras.linerOption !== 'Standard Blue') {
      const linerOption = linerOptions.find(option => option.name === selectedExtras.linerOption);
      if (linerOption) {
        const sqft = calculatePoolLinerArea(selectedProduct.dimensions);
        const perSqFt = linerOption.price || 20;
        const linerTotal = sqft * perSqFt;
        extrasBreakdown.push({
          name: `${linerOption.name} Liner (${sqft} sqft @ $${perSqFt}/sqft)`,
          price: linerTotal,
          image: linerOption.image
        });
      }
    }

    // Add paver surface area cost (using centralized pricing utility)
    const paverAreaStr = selectedExtras.paverSurfaceArea || paverSurfaceArea;
    if (
      selectedExtras.pavers &&
      paverAreaStr &&
      !isNaN(parseFloat(paverAreaStr)) &&
      selectedExtras.paverOption &&
      selectedExtras.paverOption !== 'Concrete Deck'
    ) {
      const pricePerSqFt = getPaverPricePerSqFt(selectedExtras.paverOption);
      const selectedPaver = paverTypes.find((p) => p.name === selectedExtras.paverOption);
      extrasBreakdown.push({
        name: `${selectedExtras.paverOption} (${paverAreaStr} sq ft @ $${pricePerSqFt}/sqft)`,
        price: calculatePaverCost(paverAreaStr, selectedExtras.paverOption),
        image: selectedPaver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png',
      });
    }

    // Add screen enclosure if area provided (using centralized pricing)
    if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureArea > 0) {
      const quality = (selectedExtras.screenEnclosureQuality as 'standard' | 'premium') || 'standard';
      const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
      const enclosurePrice = selectedExtras.screenEnclosureArea * pricePerSqFt;
      extrasBreakdown.push({
        name: `Screen Enclosure - ${quality === 'standard' ? 'Wonder Cage' : 'Premium'} (${selectedExtras.screenEnclosureArea} sq ft)`,
        price: enclosurePrice,
        image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png'
      });
    }

    // Add concrete construction if selected
    if (selectedExtras.concreteConstruction) {
      const concreteMarkup = Math.round(getProductPrice(selectedProduct) * 0.2);
      extrasBreakdown.push({
        name: 'Concrete Construction',
        price: concreteMarkup,
        image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
      });
    }

    // Add spa if selected with a valid model
    if (selectedExtras.spa && selectedExtras.spaModel) {
      const allSpas = [...spas, ...gilmerSpas];
      const selectedSpa = allSpas.find((s: any) => s.model === selectedExtras.spaModel);
      if (selectedSpa) {
        extrasBreakdown.push({
          name: `${selectedSpa.model} Spa`,
          price: selectedSpa.price,
          image: selectedSpa.image || '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
        });
      }
    }

    // Add spa finish if selected (for Latham spas on Glimmerglass pools)
    if (selectedExtras.spaFinish && selectedExtras.spaFinishPrice) {
      extrasBreakdown.push({
        name: `${selectedExtras.spaFinish} Spa Finish`,
        price: selectedExtras.spaFinishPrice,
        image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png'
      });
    }

    // Add tanning ledge if selected with a valid model
    if (selectedExtras.tanningLedge && selectedExtras.tanningLedgeModel) {
      const selectedLedge = tanningLedges.find((l: any) => l.name === selectedExtras.tanningLedgeModel);
      if (selectedLedge) {
        extrasBreakdown.push({
          name: `${selectedLedge.name} Tanning Ledge`,
          price: selectedLedge.price,
          image: selectedLedge.image || '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
        });
      }
    }

    // Add rocky waterfall if selected
    if (selectedExtras.rockyWaterfall && selectedExtras.rockyWaterfallTier) {
      const tier = rockyWaterfallTiers.find(t => t.name === selectedExtras.rockyWaterfallTier);
      if (tier) {
        extrasBreakdown.push({
          name: `Rocky Waterfalls: ${tier.name}${selectedExtras.rockyWaterfallColor ? ` (${selectedExtras.rockyWaterfallColor})` : ''}`,
          price: tier.price,
          image: tier.image
        });
      }
    }

    // Add artificial grass if selected
    if (selectedExtras.artificialGrass && !isNaN(parseFloat(selectedExtras.artificialGrassArea)) && parseFloat(selectedExtras.artificialGrassArea) > 0) {
      const grassArea = parseFloat(selectedExtras.artificialGrassArea);
      const grassOption = artificialGrassOptions.find(g => g.name === selectedExtras.artificialGrassColor);
      extrasBreakdown.push({
        name: `Artificial Grass - ${selectedExtras.artificialGrassColor} (${grassArea} sq ft @ $${getGrassPricePerSqFt(selectedExtras.artificialGrassColor)}/sqft)`,
        price: calculateGrassCost(grassArea, selectedExtras.artificialGrassColor),
        image: grassOption?.image || ''
      });
    }
    const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);

    console.log('✅ EXTRAS BREAKDOWN COMPLETE:', extrasBreakdown);
    console.log('💰 TOTAL EXTRAS:', extrasTotal);

    // Store in ref SYNCHRONOUSLY before opening modal (fixes race condition)
    extrasDataRef.current = { extrasBreakdown, extrasTotal };
    
    // Also update state for consistency
    setSelectedExtras(prev => ({
      ...prev,
      extrasBreakdown,
      extrasTotal
    }));
    setShowQuoteModal(true);
  };
  const buildCurrentExtras = (): Array<{ name: string; price: number; key?: string }> => {
    if (!selectedProduct) return [];
    // Convert selectedExtras to the format expected by CartItem
    const extrasArray = [];

    // Add finish if selected
    const selectedFinish = finishOptions.find(finish => finish.name === selectedExtras.finish);
    if (selectedFinish && selectedExtras.finish && selectedExtras.finish !== 'None' && selectedExtras.finish !== '' && selectedFinish.price > 0) {
      extrasArray.push({
        name: `${selectedFinish.name} Finish`,
        key: 'finish',
        price: selectedFinish.price
      });
    }

    // Add heater if selected
    if (selectedExtras.heater && selectedExtras.heaterModel && selectedExtras.heaterModel !== 'None' && selectedExtras.heaterModel !== '') {
      const selectedHeater = poolHeaters.find(heater => heater.name === selectedExtras.heaterModel);
      if (selectedHeater) {
        extrasArray.push({
          name: selectedHeater.name,
          key: 'heater',
          price: selectedHeater.price
        });
      }
    }

    // Add cover if selected
    const coverOption = coverOptions.find(option => option.name === selectedExtras.coverOption);
    if (coverOption && selectedExtras.cover && selectedExtras.coverOption && coverOption.name !== 'NO COVER' && selectedExtras.coverOption !== 'None' && selectedExtras.coverOption !== '') {
      extrasArray.push({
        name: coverOption.name,
        key: 'cover',
        price: coverOption.price
      });
    }

    // Add jets if selected
    if (selectedExtras.jets && selectedExtras.jetQuantity > 0) {
      extrasArray.push({
        name: `Spa Jets (${selectedExtras.jetQuantity})`,
        key: 'jets',
        price: getExtraPrice('jets') * selectedExtras.jetQuantity
      });
    }

    // Add tiles if selected (catalog price from main page Tiles section)
    const tileOption = tileOptions.find(option => option.name === selectedExtras.tileOption);
    if (tileOption && selectedExtras.tiles && selectedExtras.tileOption && selectedExtras.tileOption !== 'None' && selectedExtras.tileOption !== '') {
      const tilePrice = getTileCost(tileOption.name);
      extrasArray.push({
        name: tileOption.name,
        key: 'tiles',
        price: tilePrice
      });
    }

    // Add liner if selected - must have a valid option selected (not empty, not 'None')
    if (selectedExtras.liner && selectedExtras.linerOption && selectedExtras.linerOption !== 'None' && selectedExtras.linerOption !== '' && selectedExtras.linerOption !== 'Standard Blue') {
      const linerOption = linerOptions.find(option => option.name === selectedExtras.linerOption);
      if (linerOption) {
        const sqft = calculatePoolLinerArea(selectedProduct.dimensions);
        const perSqFt = linerOption.price || 20;
        extrasArray.push({
          name: `${selectedExtras.linerOption} Liner (${sqft} sqft @ $${perSqFt}/sqft)`,
          key: 'liner',
          price: sqft * perSqFt
        });
      }
    }

    // Add paver surface area cost (using centralized pricing utility)
    const paverAreaStr = selectedExtras.paverSurfaceArea || paverSurfaceArea;
    if (
      selectedExtras.pavers &&
      paverAreaStr &&
      !isNaN(parseFloat(paverAreaStr)) &&
      selectedExtras.paverOption &&
      selectedExtras.paverOption !== 'Concrete Deck' &&
      selectedExtras.paverOption !== 'None' &&
      selectedExtras.paverOption !== ''
    ) {
      extrasArray.push({
        name: `${selectedExtras.paverOption} (${paverAreaStr} sq ft)`,
        key: 'pavers',
        price: calculatePaverCost(paverAreaStr, selectedExtras.paverOption),
      });
    }

    // Add screen enclosure if area provided (using centralized pricing)
    if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureArea > 0 && selectedExtras.screenEnclosureQuality && selectedExtras.screenEnclosureQuality !== 'None' && selectedExtras.screenEnclosureQuality !== '') {
      const quality = (selectedExtras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium') || 'standard';
      const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
      const enclosurePrice = selectedExtras.screenEnclosureArea * pricePerSqFt;
      extrasArray.push({
        name: `Screen Enclosure - ${quality === 'standard' ? 'Wonder Cage' : quality === 'deluxe' ? 'Deluxe' : 'Premium'} (${selectedExtras.screenEnclosureArea} sq ft)`,
        key: 'screenEnclosure',
        price: enclosurePrice
      });
    }

    // Add concrete construction if selected
    if (selectedExtras.concreteConstruction) {
      const concreteMarkup = Math.round(getProductPrice(selectedProduct) * 0.2);
      extrasArray.push({
        name: 'Concrete Construction',
        key: 'concreteConstruction',
        price: concreteMarkup
      });
    }

    // Add spa if selected with a valid model
    if (selectedExtras.spa && selectedExtras.spaModel) {
      const allSpas = [...spas, ...gilmerSpas];
      const selectedSpa = allSpas.find((s: any) => s.model === selectedExtras.spaModel);
      if (selectedSpa) {
        extrasArray.push({
          name: `${selectedSpa.model} Spa`,
          key: 'spa',
          price: selectedSpa.price
        });
      }
    }

    // Add spa finish if selected (for Latham spas on Glimmerglass pools)
    if (selectedExtras.spaFinish && selectedExtras.spaFinishPrice) {
      extrasArray.push({
        name: `${selectedExtras.spaFinish} Spa Finish`,
        key: 'spaFinish',
        price: selectedExtras.spaFinishPrice
      });
    }

    // Add tanning ledge if selected with a valid model
    if (selectedExtras.tanningLedge && selectedExtras.tanningLedgeModel) {
      const selectedLedge = tanningLedges.find((l: any) => l.name === selectedExtras.tanningLedgeModel);
      if (selectedLedge) {
        extrasArray.push({
          name: `${selectedLedge.name} Tanning Ledge`,
          key: 'tanningLedge',
          price: selectedLedge.price
        });
      }
    }

    // Add rocky waterfall if selected
    if (selectedExtras.rockyWaterfall && selectedExtras.rockyWaterfallTier) {
      const tier = rockyWaterfallTiers.find(t => t.name === selectedExtras.rockyWaterfallTier);
      if (tier) {
        extrasArray.push({
          name: `Rocky Waterfalls: ${tier.name}${selectedExtras.rockyWaterfallColor ? ` (${selectedExtras.rockyWaterfallColor})` : ''}`,
          key: 'rockyWaterfall',
          price: tier.price
        });
      }
    }

    // Add artificial grass if selected
    if (selectedExtras.artificialGrass && !isNaN(parseFloat(selectedExtras.artificialGrassArea)) && parseFloat(selectedExtras.artificialGrassArea) > 0) {
      const grassArea = parseFloat(selectedExtras.artificialGrassArea);
      extrasArray.push({
        name: `Artificial Grass - ${selectedExtras.artificialGrassColor} (${grassArea} sq ft)`,
        key: 'artificialGrass',
        price: calculateGrassCost(grassArea, selectedExtras.artificialGrassColor)
      });
    }
    return extrasArray;
  };

  const FEATURE_RESETS: Record<string, any> = {
    finish: { finish: 'None' },
    heater: { heater: false, heaterModel: '' },
    cover: { cover: false, coverOption: '' },
    jets: { jets: false, jetQuantity: 0 },
    tiles: { tiles: false, tileOption: '' },
    liner: { liner: false, linerOption: '' },
    pavers: { pavers: false, paverOption: '' },
    screenEnclosure: { screenEnclosure: false, screenEnclosureArea: 0 },
    concreteConstruction: { concreteConstruction: false },
    spa: { spa: false, spaModel: '' },
    spaFinish: { spaFinish: '', spaFinishPrice: 0 },
    tanningLedge: { tanningLedge: false, tanningLedgeModel: '' },
    rockyWaterfall: { rockyWaterfall: false, rockyWaterfallTier: '' },
    artificialGrass: { artificialGrass: false, artificialGrassArea: '' },
  };

  const handleRemoveCurrentFeature = (key?: string) => {
    if (!key || !FEATURE_RESETS[key]) return;
    setSelectedExtras((prev: any) => ({ ...prev, ...FEATURE_RESETS[key] }));
  };

  const handleCurrentFeatureQuantity = (key: string | undefined, quantity: number) => {
    if (key !== 'jets') return;
    if (quantity <= 0) {
      handleRemoveCurrentFeature('jets');
      return;
    }
    setSelectedExtras((prev: any) => ({ ...prev, jets: true, jetQuantity: quantity }));
  };

  const handleAddProductToCart = (product: any) => {
    addToCart({
      id: `${product.type}_${product.model || product.name}`,
      name: product.model || product.name || 'Product',
      price: getProductPrice(product),
      image: product.image,
      category: product.category,
      extras: [],
    } as any);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const extrasArray = buildCurrentExtras();
    const cartItem = {
      id: `${selectedProduct.type}_${selectedProduct.model || selectedProduct.name}`,
      name: selectedProduct.model || selectedProduct.name || 'Product',
      price: Math.max(
        0,
        calculateTotalPrice() - extrasArray.reduce((sum, e) => sum + (e.price || 0), 0)
      ),
      quantity: 1,
      image: selectedProduct.image,
      category: selectedProduct.category,
      extras: extrasArray
    };
    addToCart(cartItem);
    toast({
      title: "Added to Cart",
      description: `${cartItem.name} has been added to your cart.`
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Compact Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Home button + Title */}
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                title="Back to Home"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </a>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-teal to-coral bg-clip-text text-transparent">
                Wonderlands Studio
              </h1>
            </div>
            
            {/* Project Type Toggle - Hidden (commercial mode disabled) */}
            
            {/* AI Search - Same as main page */}
            <div className="w-48 md:w-96">
              <AdvancedSearch variant="slim" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex flex-col lg:flex-row-reverse gap-2 sm:gap-4">
          {/* Options Sidebar - Product Selection (Collapsible, right side on desktop) */}
          <div className={`transition-all duration-300 ${leftSidebarCollapsed ? 'w-full lg:w-12' : 'w-full lg:w-80'} flex-shrink-0`}>
            {leftSidebarCollapsed ? <div className="sticky top-4 flex lg:justify-end">
                <Button variant="outline" size="sm" onClick={() => setLeftSidebarCollapsed(false)} className="w-10 h-10 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div> : <Card className="sticky top-4">
                {/* Store shopping list + total — on top of categories */}
                <StudioCartWidget
                  currentPrice={selectedProduct ? (activeTab === 'build-a-pool' && poolBuilderData ? (poolBuilderData.breakdown?.total || 0) : calculateTotalPrice()) : 0}
                  currentName={selectedProduct ? (selectedProduct.model || selectedProduct.name || 'Product') : undefined}
                  currentCategory={selectedProduct?.category}
                  currentExtras={selectedProduct ? buildCurrentExtras().map(e => ({
                    ...e,
                    quantity: e.key === 'jets' ? selectedExtras.jetQuantity : undefined,
                  })) : []}
                  onRemoveCurrentExtra={handleRemoveCurrentFeature}
                  onCurrentExtraQuantity={handleCurrentFeatureQuantity}
                  onAddCurrent={selectedProduct ? handleAddToCart : undefined}
                  onQuote={handleQuoteRequest}
                  onListOpenChange={setShoppingListOpen}
                />


                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Product Categories</CardTitle>
                    {selectedProduct && <Button variant="ghost" size="sm" onClick={() => setLeftSidebarCollapsed(true)} className="w-8 h-8 p-0 hidden lg:flex">
                        <ChevronRight className="h-4 w-4" />
                      </Button>}

                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs value={activeTab} onValueChange={value => {
                    setActiveTab(value as any);
                    // Keep sidebar open so the category's products stay browsable
                    setLeftSidebarCollapsed(false);
                  }} className="w-full">
                    <div className="mb-4 space-y-2">
                      {(() => {
                        const activeCategory = STUDIO_CATEGORIES.find(c => c.value === activeTab) || STUDIO_CATEGORIES[0];
                        const otherCategories = STUDIO_CATEGORIES.filter(c => c.value !== activeTab);
                        const ActiveIcon = activeCategory.icon;
                        return (
                          <>
                            {/* Active category — full width row */}
                            <div className={cn("flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold shadow-sm", activeCategory.activeClass)}>
                              <ActiveIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{activeCategory.label}</span>
                            </div>

                            {/* Other categories — compact carousel that fits the panel */}
                            <div className="relative px-7">
                              <Carousel className="w-full" opts={{ align: 'start', dragFree: true, containScroll: 'trimSnaps' }}>
                                <CarouselContent className="-ml-1.5">
                                  {otherCategories.map((cat) => {
                                    const Icon = cat.icon;
                                    return (
                                      <CarouselItem key={cat.value} className="pl-1.5 basis-auto">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveTab(cat.value as any);
                                            setLeftSidebarCollapsed(false);
                                          }}
                                          className="flex items-center gap-1.5 h-8 max-w-[8.5rem] px-2.5 rounded-full border border-border bg-background/60 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/40 transition-colors"
                                        >
                                          <Icon className="h-3.5 w-3.5 shrink-0" />
                                          <span className="truncate">{cat.label}</span>
                                        </button>
                                      </CarouselItem>
                                    );
                                  })}
                                </CarouselContent>
                                <CarouselPrevious className="left-[-1.75rem] top-1/2 h-6 w-6 translate-y-[-50%]" />
                                <CarouselNext className="right-[-1.75rem] top-1/2 h-6 w-6 translate-y-[-50%]" />
                              </Carousel>
                            </div>
                          </>
                        );
                      })()}
                    </div>


                    {!shoppingListOpen && <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                      {getFilteredProducts().map((product, index) => <div key={index} className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${(product.model && selectedProduct?.model === product.model) || (product.name && selectedProduct?.name === product.name) ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:border-primary/50'}`} onClick={() => {
                    setSelectedProduct(product);
                    // Reset extras to default for this product type
                    if (product.type) {
                      const defaultExtras = getDefaultExtras(product.type as ProductType);
                      setSelectedExtras(defaultExtras);
                    }
                    setLeftSidebarCollapsed(false);

                  }}>
                          <div className="flex items-center gap-3">
                            {product.image && <img src={product.image} alt={product.model || product.name || 'Product'} className="w-12 h-12 object-cover rounded" />}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {product.model || product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                ${getProductPrice(product).toLocaleString()}
                              </p>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {product.category}
                              </Badge>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProductToCart(product);
                              }}
                              aria-label={`Add ${product.model || product.name} to cart`}
                              className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>)}
                    </div>}

                  </Tabs>
                </CardContent>
              </Card>}
          </div>

          {/* Main Content - Product Details & Configuration */}
          <div className="flex-1 min-w-0 relative">
            {/* Pool Builder Mode - Full Screen */}
            {activeTab === 'build-a-pool' && !sceneFromBuilder ? (
              <div className="fixed inset-0 z-50 bg-background">
                <PoolBuilder onPoolDataChange={(data) => {
                  setPoolBuilderData(data as any);
                }} />
              </div>
            ) : sceneFromBuilder && textureLibFromBuilder ? (
              /* Pool Builder 3D Visualizer - Full Screen */
              <div className="fixed inset-0 z-50 bg-background">
                <UnifiedPoolVisualizer
                  scene={sceneFromBuilder}
                  textureLibrary={textureLibFromBuilder}
                  onSceneChange={(updatedScene) => {
                    setSceneFromBuilder(updatedScene);
                  }}
                />
              </div>
            ) : selectedProduct ? <div className="space-y-4 sm:space-y-6">
                {/* Large Product Media Gallery */}
                <Card>
                  <CardContent className="p-3 sm:p-6">
                     {/* View Mode - Product Image only, Design Studio button for 2D/3D */}
                    {(selectedProduct.type === 'pool' || selectedProduct.type === 'spa' || selectedProduct.type === 'tanning-ledge') && (
                      <div className="flex justify-between items-center mb-4">
                        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50 gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            Product Image
                          </Button>
                          {/* Design Studio access hidden */}
                        </div>
                        
                        <Button
                          variant={showPricePanel ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setShowPricePanel(!showPricePanel)}
                          className="h-8 text-xs gap-1.5"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          {showPricePanel ? 'Hide' : 'Show'} Price
                        </Button>
                      </div>
                    )}
                    
                    <div className="relative rounded-lg sm:rounded-xl bg-background overflow-hidden w-full h-[38vh] sm:h-[46vh] max-h-[460px] flex items-center justify-center">
                      {(selectedProduct.media || selectedProduct.gallery || selectedProduct.image) ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <ProductMediaGallery 
                            media={
                              selectedProduct.media || 
                              (selectedProduct.gallery 
                                ? selectedProduct.gallery.map(url => ({ type: 'image' as const, url, alt: selectedProduct.model || selectedProduct.name || 'Product' }))
                                : selectedProduct.image || ''
                              )
                            } 
                            productName={selectedProduct.model || selectedProduct.name || 'Product'}
                            className="w-full h-full"
                          />
                        </div>

                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details - Directly below image with no gap */}
                    <div className="space-y-3 sm:space-y-4 -mt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h1 className="text-xl sm:text-2xl font-bold">
                              {selectedProduct.model || selectedProduct.name}
                            </h1>
                            <p className="text-2xl sm:text-3xl font-bold text-primary mt-1 sm:mt-2">
                              ${getProductPrice(selectedProduct).toLocaleString()}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge className={getCategoryColor(selectedProduct.category)}>
                                {selectedProduct.category}
                              </Badge>
                              {selectedProduct.dimensions && <Badge variant="outline">{selectedProduct.dimensions}</Badge>}
                              {selectedProduct.depth && <Badge variant="outline">Depth: {selectedProduct.depth}</Badge>}
                              {selectedProduct.warrantyYears && (
                                <Badge variant="secondary">
                                  {typeof selectedProduct.warrantyYears === 'string'
                                    ? selectedProduct.warrantyYears
                                    : `${selectedProduct.warrantyYears} Year${selectedProduct.warrantyYears === 1 ? '' : 's'} Warranty`}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddToCart}
                            aria-label={`Add ${selectedProduct.model || selectedProduct.name} to cart`}
                            className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Product Description */}
                        {selectedProduct.description && <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {selectedProduct.description}
                            </p>
                          </div>}


                      </div>
                    </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                    {selectedProduct.type === 'scene' ? (
                      // Belgard Studio Options for Scenes - keep existing hardcoded UI
                      <>
                        {/* Concrete Pavers & Slabs */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Concrete Pavers & Slabs</Label>
                              <p className="text-xs text-muted-foreground">Durable concrete solutions</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox checked={selectedExtras.concreteSlabs} onCheckedChange={checked => {
                          const newExtras = {
                            ...selectedExtras,
                            concreteSlabs: !!checked
                          };
                          setSelectedExtras(newExtras);
                          if (checked) {
                            setActiveFeatureCarousel('concreteSlabs');
                          } else {
                            setActiveFeatureCarousel(null);
                          }
                        }} />
                              {selectedExtras.concreteSlabs && <Button variant="ghost" size="sm" onClick={() => {
                          const newCarousel = activeFeatureCarousel === 'concreteSlabs' ? null : 'concreteSlabs';
                          setActiveFeatureCarousel(newCarousel);
                        }}>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'concreteSlabs' ? 'rotate-180' : ''}`} />
                                </Button>}
                            </div>
                          </div>
                          {selectedExtras.concreteSlabs && activeFeatureCarousel === 'concreteSlabs' && <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.concreteSlabs.map(option => <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price}/sq ft
                                        </p>
                                        {option.category === 'sample' && <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>}
                                      </div>
                                    </CarouselItem>)}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>}
                        </div>

                        {/* Outdoor Kitchens */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Outdoor Kitchens</Label>
                              <p className="text-xs text-muted-foreground">Complete cooking solutions</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox checked={selectedExtras.outdoorKitchens} onCheckedChange={checked => {
                          const newExtras = {
                            ...selectedExtras,
                            outdoorKitchens: !!checked
                          };
                          setSelectedExtras(newExtras);
                          if (checked) {
                            setActiveFeatureCarousel('outdoorKitchens');
                          } else {
                            setActiveFeatureCarousel(null);
                          }
                        }} />
                              {selectedExtras.outdoorKitchens && <Button variant="ghost" size="sm" onClick={() => {
                          const newCarousel = activeFeatureCarousel === 'outdoorKitchens' ? null : 'outdoorKitchens';
                          setActiveFeatureCarousel(newCarousel);
                        }}>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'outdoorKitchens' ? 'rotate-180' : ''}`} />
                                </Button>}
                            </div>
                          </div>
                          {selectedExtras.outdoorKitchens && activeFeatureCarousel === 'outdoorKitchens' && <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.outdoorKitchens.map(option => <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>}
                                      </div>
                                    </CarouselItem>)}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>}
                        </div>

                        {/* Fireplaces */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Fireplaces</Label>
                              <p className="text-xs text-muted-foreground">Outdoor warmth and ambiance</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox checked={selectedExtras.fireplaces} onCheckedChange={checked => {
                          const newExtras = {
                            ...selectedExtras,
                            fireplaces: !!checked
                          };
                          setSelectedExtras(newExtras);
                          if (checked) {
                            setActiveFeatureCarousel('fireplaces');
                          } else {
                            setActiveFeatureCarousel(null);
                          }
                        }} />
                              {selectedExtras.fireplaces && <Button variant="ghost" size="sm" onClick={() => {
                          const newCarousel = activeFeatureCarousel === 'fireplaces' ? null : 'fireplaces';
                          setActiveFeatureCarousel(newCarousel);
                        }}>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'fireplaces' ? 'rotate-180' : ''}`} />
                                </Button>}
                            </div>
                          </div>
                          {selectedExtras.fireplaces && activeFeatureCarousel === 'fireplaces' && <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.fireplaces.map(option => <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>}
                                      </div>
                                    </CarouselItem>)}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>}
                        </div>

                        {/* Fire Pit Kits */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Fire Pit Kits</Label>
                              <p className="text-xs text-muted-foreground">Cozy gathering spaces</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox checked={selectedExtras.firePitKits} onCheckedChange={checked => {
                          const newExtras = {
                            ...selectedExtras,
                            firePitKits: !!checked
                          };
                          setSelectedExtras(newExtras);
                          if (checked) {
                            setActiveFeatureCarousel('firePitKits');
                          } else {
                            setActiveFeatureCarousel(null);
                          }
                        }} />
                              {selectedExtras.firePitKits && <Button variant="ghost" size="sm" onClick={() => {
                          const newCarousel = activeFeatureCarousel === 'firePitKits' ? null : 'firePitKits';
                          setActiveFeatureCarousel(newCarousel);
                        }}>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'firePitKits' ? 'rotate-180' : ''}`} />
                                </Button>}
                            </div>
                          </div>
                          {selectedExtras.firePitKits && activeFeatureCarousel === 'firePitKits' && <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.firePitKits.map(option => <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>}
                                      </div>
                                    </CarouselItem>)}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>}
                        </div>

                        {/* Pergolas & Panels */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Pergolas & Panels</Label>
                              <p className="text-xs text-muted-foreground">Shade and privacy solutions</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox checked={selectedExtras.pergolas} onCheckedChange={checked => {
                          const newExtras = {
                            ...selectedExtras,
                            pergolas: !!checked
                          };
                          setSelectedExtras(newExtras);
                          if (checked) {
                            setActiveFeatureCarousel('pergolas');
                          } else {
                            setActiveFeatureCarousel(null);
                          }
                        }} />
                              {selectedExtras.pergolas && <Button variant="ghost" size="sm" onClick={() => {
                          const newCarousel = activeFeatureCarousel === 'pergolas' ? null : 'pergolas';
                          setActiveFeatureCarousel(newCarousel);
                        }}>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'pergolas' ? 'rotate-180' : ''}`} />
                                </Button>}
                            </div>
                          </div>
                          {selectedExtras.pergolas && activeFeatureCarousel === 'pergolas' && <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.pergolas.map(option => <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>}
                                      </div>
                                    </CarouselItem>)}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>}
                        </div>
                      </>
                    ) : !isWaterProduct(selectedProduct.type) ? (
                      // Standalone categories (screen enclosures, fencing, lanai, pavers,
                      // grass, landscaping, covers, driveway gates, finishes, liners):
                      // only their own relevant options — no pool features here.
                      <>
                        {selectedProduct.type === 'fencing' ? (
                          <FenceConfigurator
                            onTotalChange={(total, summary) =>
                              setSelectedExtras((prev: any) =>
                                prev.fenceTotal === total && prev.categoryQuantity === String(summary.linearFt)
                                  ? prev
                                  : { ...prev, fenceTotal: total, categoryQuantity: String(summary.linearFt) }
                              )
                            }
                          />
                        ) : selectedProduct.type === 'screen-enclosure' ? (
                          <EnclosureConfigurator
                            baseRatePerSqFt={getProductPrice(selectedProduct)}
                            onTotalChange={(total, summary) =>
                              setSelectedExtras((prev: any) =>
                                prev.enclosureTotal === total && prev.categoryQuantity === String(summary.areaSqFt)
                                  ? prev
                                  : { ...prev, enclosureTotal: total, categoryQuantity: String(summary.areaSqFt) }
                              )
                            }
                          />
                        ) : (() => {

                          const unit = getProductUnit(selectedProduct);
                          if (!unit) return null;
                          const qty = parseFloat(selectedExtras.categoryQuantity) || 0;
                          return (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                {unit === 'sqft' ? 'Surface Area' : 'Length'} ({unitLabel(unit)})
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder={`Enter ${unitLabel(unit)}`}
                                value={selectedExtras.categoryQuantity}
                                onChange={(e) => setSelectedExtras((prev: any) => ({ ...prev, categoryQuantity: e.target.value }))}
                                className="w-40"
                              />
                              <p className="text-xs text-muted-foreground">
                                {qty > 0
                                  ? `${qty.toLocaleString()} ${unitLabel(unit)} × $${getProductPrice(selectedProduct).toLocaleString()}/${unitLabel(unit)} = $${(qty * getProductPrice(selectedProduct)).toLocaleString()}`
                                  : `$${getProductPrice(selectedProduct).toLocaleString()} per ${unitLabel(unit)}`}
                              </p>
                            </div>
                          );
                        })()}


                        {getProductFeatures((selectedProduct.type || 'paver') as any).length > 0 && (
                          <DynamicFeatureRenderer
                            productType={(selectedProduct.type || 'paver') as any}
                            selectedExtras={selectedExtras}
                            onExtrasChange={(extras) => setSelectedExtras(extras)}
                          />
                        )}

                        {!getProductUnit(selectedProduct) && getProductFeatures((selectedProduct.type || 'paver') as any).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            This product is quoted as configured — no additional options required.
                          </p>
                        )}
                      </>
                    ) : (
                      // Pool configuration options using same format as PoolProductCard
                      <>
                        {/* Gelcoat Color for GlimmerGlass pools ONLY */}
                        {selectedProduct && (selectedProduct as any).brand === "Glimmerglass" && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground">Gelcoat Color (Included)</h4>
                            <Carousel 
                              className="w-full"
                              opts={{
                                align: "start",
                                loop: false,
                                duration: 25,
                              }}
                            >
                              <CarouselContent className="-ml-1">
                                {[
                                  { name: 'Ocean Blue', color: '#1E40AF' },
                                  { name: 'Sapphire Blue', color: '#2563EB' },
                                  { name: 'Coastal Bronze', color: '#A16207' },
                                  { name: 'Snow White', color: '#FFFFFF' },
                                  { name: 'Steel Grey', color: '#6B7280' },
                                  { name: 'Arctic White', color: '#F8FAFC' },
                                  { name: 'Glacier Blue', color: '#0EA5E9' }
                                ].map((gelcoat, idx) => (
                                  <CarouselItem
                                    key={`gelcoat-${gelcoat.name}-${idx}`}
                                    className="pl-1 basis-1/2"
                                  >
                                    <div
                                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.gelcoatColor === gelcoat.name ? "border-primary bg-primary/10" : "border-border"}`}
                                      onClick={() =>
                                        setSelectedExtras((prev: any) => ({
                                          ...prev,
                                          gelcoatColor: gelcoat.name,
                                        }))
                                      }
                                    >
                                      <div 
                                        className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0"
                                        style={{ backgroundColor: gelcoat.color }}
                                      />
                                      <div className="flex-1 flex flex-col justify-between min-h-0">
                                        <p className="text-xs font-medium text-center line-clamp-2">{gelcoat.name}</p>
                                        <p className="text-xs text-primary text-center font-semibold">Included</p>
                                      </div>
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious className="left-0 animate-pulse" />
                              <CarouselNext className="right-0 animate-pulse" />
                            </Carousel>
                          </div>
                        )}

                        {/* Pool Finishes */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">Pool Finish</h4>
                          <Carousel 
                            className="w-full"
                            opts={{
                              align: "start",
                              loop: false,
                              duration: 25,
                            }}
                          >
                            <CarouselContent className="-ml-1">
                              {finishOptions
                                .filter((finish) => {
                                  // Define pool type categories
                                  const wonderlandsWorldModels = ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral"];
                                  const lathamBaseNames = ["Astoria", "Milan", "Jamaica", "Aruba", "St. Croix", "Rio", "Apollo", "Enchantment", "Cancún Deluxe", "Cancun Deluxe", "Genesis", "Claremont", "Axiom", "Bay Isle", "Laguna", "Vista Isle", "Olympia", "Corinthian", "Key West", "Valencia", "Bermuda", "Java", "Pleasant Cove", "St. Lucia", "Delray", "Cape Cod", "Tuscan", "Synergy", "Coronado"];
                                  
                                  const modelName = selectedProduct?.model || "";
                                  const isWonderlandsWorld = wonderlandsWorldModels.includes(modelName);
                                  // Check if model starts with any Latham base name (handles "Astoria 12", "Milan 8.14", etc.)
                                  const isLathamPool = lathamBaseNames.some(base => modelName.startsWith(base));
                                  
                                  if (isWonderlandsWorld) {
                                    // Wonderlands World concrete pools: Only Mini Pebbles collection
                                    return finish.collection === "Mini Pebbles";
                                  } else if (isLathamPool) {
                                    // Latham fiberglass pools: Only Crystite Crystal collection
                                    return finish.collection === "Crystite Crystal";
                                  } else {
                                    // GlimmerGlass and other pools: Show all except Crystite Crystal and Mini Pebbles
                                    return finish.collection !== "Crystite Crystal" && finish.collection !== "Mini Pebbles";
                                  }
                                })
                                .map((finish, idx) => (
                                <CarouselItem
                                  key={`pool-${finish.name}-${idx}`}
                                  className="pl-1 basis-1/2 md:basis-1/4"
                                >
                                  <div
                                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.finish === finish.name ? "border-primary bg-primary/10" : "border-border"}`}
                                    onClick={() =>
                                      setSelectedExtras((prev: any) => ({
                                        ...prev,
                                        finish: finish.name,
                                      }))
                                    }
                                  >
                                    <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                      <img
                                        src={finish.image}
                                        alt={finish.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="text-xs font-medium text-center truncate">{finish.name}</p>
                                      <p className="text-[10px] text-primary text-center font-semibold truncate">{finish.collection}</p>
                                      {finish.price && (
                                        <p className="text-xs text-foreground font-semibold text-center">
                                          +${finish.price.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 animate-pulse" />
                            <CarouselNext className="right-0 animate-pulse" />
                          </Carousel>
                        </div>

                        {/* Pool Liners - Default shows selected finish texture */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Pool Liner</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {selectedExtras.liner ? 'Liner Selected' : 'Uses Pool Finish'}
                              </span>
                              <Checkbox
                                checked={selectedExtras.liner}
                                onCheckedChange={() =>
                                  setSelectedExtras((prev: any) => ({
                                    ...prev,
                                    liner: !prev.liner,
                                    linerOption: !prev.liner ? '' : prev.linerOption,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          
                          {/* Default thumbnail showing selected finish when no liner */}
                          {!selectedExtras.liner && (
                            <div className="p-3 border rounded-lg border-primary bg-primary/10">
                              <div className="w-full h-28 rounded-md mb-2 overflow-hidden">
                                <img
                                  src={finishOptions.find(f => f.name === selectedExtras.finish)?.image || aquamarineFinish}
                                  alt="Selected Finish"
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                              </div>
                              <p className="text-xs font-medium text-center truncate">
                                {selectedExtras.finish || 'Aquamarine'}
                              </p>
                              <p className="text-[10px] text-primary text-center font-semibold">Selected Pool Finish</p>
                            </div>
                          )}
                          
                          {selectedExtras.liner && (
                          <Carousel 
                            className="w-full"
                            opts={{
                              align: "start",
                              loop: false,
                              duration: 25,
                            }}
                          >
                            <CarouselContent className="-ml-1">
                              {linerOptions.map((liner) => (
                                <CarouselItem key={liner.name} className="pl-1 basis-1/2 md:basis-1/4">
                                  <div
                                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.linerOption === liner.name ? "border-primary bg-primary/10" : "border-border"}`}
                                    onClick={() =>
                                      setSelectedExtras((prev: any) => ({
                                        ...prev,
                                        linerOption: liner.name,
                                      }))
                                    }
                                  >
                                    <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                      <img
                                        src={liner.image}
                                        alt={liner.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="text-xs font-medium text-center truncate">{liner.name}</p>
                                      {liner.type && liner.type !== "Standard" && (
                                        <p className="text-[10px] text-primary text-center font-semibold">{liner.type}</p>
                                      )}
                                      <p className="text-xs text-foreground font-semibold text-center">
                                        +$4,500
                                      </p>
                                    </div>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 animate-pulse" />
                            <CarouselNext className="right-0 animate-pulse" />
                          </Carousel>
                          )}
                        </div>

                        {/* Pool Tiles */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Pool Tiles</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {selectedExtras.tiles ? 'Tiles Selected' : 'No Tiles'}
                              </span>
                              <Checkbox
                                checked={selectedExtras.tiles}
                                onCheckedChange={() =>
                                  setSelectedExtras((prev: any) => ({
                                    ...prev,
                                    tiles: !prev.tiles,
                                    tileOption: !prev.tiles ? '' : prev.tileOption,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          {selectedExtras.tiles && (
                          <Carousel 
                            className="w-full"
                            opts={{
                              align: "start",
                              loop: false,
                              duration: 25,
                            }}
                          >
                            <CarouselContent className="-ml-1">
                              {tileOptions.map((tile) => (
                                <CarouselItem key={tile.name} className="pl-1 basis-1/2">
                                  <div
                                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.tileOption === tile.name ? "border-primary bg-primary/10" : "border-border"}`}
                                    onClick={() =>
                                      setSelectedExtras((prev: any) => ({
                                        ...prev,
                                        tiles: true,
                                        tileOption: tile.name,
                                      }))
                                    }
                                  >
                                    <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                      <img
                                        src={tile.image}
                                        alt={tile.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="text-xs font-medium text-center truncate">{tile.name}</p>
                                      <p className="text-xs text-primary font-semibold text-center">
                                        +${tile.price.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 animate-pulse" />
                            <CarouselNext className="right-0 animate-pulse" />
                          </Carousel>
                          )}
                        </div>
                        

                        {/* Automatic Cover */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Automatic Cover</h4>
                            <Checkbox
                              checked={selectedExtras.cover}
                              onCheckedChange={() =>
                                setSelectedExtras((prev: any) => ({
                                  ...prev,
                                  cover: !prev.cover,
                                }))
                              }
                            />
                          </div>
                          {selectedExtras.cover && (
                            <Carousel 
                              className="w-full"
                              opts={{
                                align: "start",
                                loop: false,
                                duration: 25,
                              }}
                            >
                              <CarouselContent className="-ml-1">
                                {coverOptions.map((cover) => (
                                  <CarouselItem key={cover.name} className="pl-1 basis-1/2 md:basis-1/4">
                                    <div
                                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.coverOption === cover.name ? "border-primary bg-primary/10" : "border-border"}`}
                                      onClick={() =>
                                        setSelectedExtras((prev: any) => ({
                                          ...prev,
                                          coverOption: cover.name,
                                        }))
                                      }
                                    >
                                      <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                        <img
                                          src={cover.image}
                                          alt={cover.name}
                                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-medium text-center truncate">{cover.name}</p>
                                        <p className="text-xs text-primary font-semibold text-center">
                                          +${cover.price.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious className="left-0 animate-pulse" />
                              <CarouselNext className="right-0 animate-pulse" />
                            </Carousel>
                          )}
                        </div>

                        {/* Jets with Counter */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 border rounded-lg">
                            <label className="flex items-center space-x-2 cursor-pointer flex-1">
                              <Checkbox
                                checked={selectedExtras.jets}
                                onCheckedChange={() =>
                                  setSelectedExtras((prev: any) => ({
                                    ...prev,
                                    jets: !prev.jets,
                                    jetQuantity: !prev.jets ? Math.max(1, prev.jetQuantity || 1) : prev.jetQuantity,
                                  }))
                                }
                              />
                              <div className="flex items-center space-x-1">
                                <Zap size={16} className="text-orange-500" />
                                <span className="text-sm font-semibold">
                                  Spa Jets (+${(getExtraPrice('jets') * (selectedExtras.jetQuantity || 1)).toLocaleString()})
                                </span>
                              </div>
                            </label>
                            {selectedExtras.jets && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedExtras((prev: any) => ({
                                      ...prev,
                                      jetQuantity: Math.max(1, (prev.jetQuantity || 1) - 1),
                                    }))
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">{selectedExtras.jetQuantity || 1}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedExtras((prev: any) => ({
                                      ...prev,
                                      jetQuantity: (prev.jetQuantity || 1) + 1,
                                    }))
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Add a Spa */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Add a Spa</h4>
                            <Checkbox
                              checked={selectedExtras.spa}
                              onCheckedChange={() =>
                                setSelectedExtras((prev: any) => ({
                                  ...prev,
                                  spa: !prev.spa,
                                }))
                              }
                            />
                          </div>
                          {selectedExtras.spa && (() => {
                            // Check if selected product is a Glimmerglass pool
                            const productName = selectedProduct?.model || selectedProduct?.name || '';
                            const isGlimmerglassPool = gilmerPools.some(p => p.model === productName) || 
                              productName.toLowerCase().includes('glimmerglass') ||
                              productName.toLowerCase().includes('serafin');
                            
                            // Combine spas - Gilmer spas first for Glimmerglass pools
                            const combinedSpas = isGlimmerglassPool 
                              ? [...gilmerSpas.map(s => ({ ...s, brand: 'Glimmerglass' })), ...spas]
                              : [...spas, ...gilmerSpas.map(s => ({ ...s, brand: 'Glimmerglass' }))];
                            
                            return (
                              <Carousel 
                                className="w-full"
                                opts={{
                                  align: "start",
                                  loop: false,
                                  duration: 25,
                                }}
                              >
                                <CarouselContent className="-ml-1">
                                  {combinedSpas.map((spa: any) => (
                                    <CarouselItem key={spa.model} className="pl-1 basis-1/2 md:basis-1/4">
                                      <div
                                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.spaModel === spa.model ? "border-primary bg-primary/10" : "border-border"}`}
                                        onClick={() =>
                                          setSelectedExtras((prev: any) => ({
                                            ...prev,
                                            spaModel: spa.model,
                                          }))
                                        }
                                      >
                                        <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                          <img
                                            src={spa.image}
                                            alt={spa.model}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <p className="text-xs font-medium text-center truncate">{spa.model}</p>
                                          {spa.brand === 'Glimmerglass' && (
                                            <p className="text-[10px] text-muted-foreground text-center">Glimmerglass</p>
                                          )}
                                          <p className="text-xs text-primary font-semibold text-center">
                                            +${spa.price.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-0 animate-pulse" />
                                <CarouselNext className="right-0 animate-pulse" />
                              </Carousel>
                            );
                          })()}
                          
                          {/* Spa Finish Selection - Only for Latham spas on Glimmerglass pools */}
                          {selectedExtras.spa && selectedExtras.spaModel && (() => {
                            const lathamSpaModels = ["Mystic", "Regal", "Royal", "Shafta"];
                            const isLathamSpa = lathamSpaModels.some(model => 
                              selectedExtras.spaModel?.toLowerCase().includes(model.toLowerCase())
                            );
                            const productName = selectedProduct?.model || selectedProduct?.name || '';
                            const isGlimmerglassPool = gilmerPools.some(p => p.model === productName) || 
                              productName.toLowerCase().includes('glimmerglass') ||
                              productName.toLowerCase().includes('serafin');
                            
                            if (isGlimmerglassPool && isLathamSpa) {
                              const crystiteFinishes = [
                                { id: 'sapphire-blue', name: 'Sapphire Blue', price: 3500, image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png' },
                                { id: 'ocean-blue', name: 'Ocean Blue', price: 3500, image: '/lovable-uploads/2103693f-cf54-423d-99c7-68d6f3951388.png' },
                                { id: 'night-sky', name: 'Night Sky', price: 3500, image: '/lovable-uploads/90fe0136-31f1-4fa3-b816-56a7a74484fa.png' },
                                { id: 'shale-gray', name: 'Shale Gray', price: 3500, image: '/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png' },
                                { id: 'coastal-bronze', name: 'Coastal Bronze', price: 3500, image: '/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png' },
                                { id: 'pearl-white', name: 'Pearl White', price: 3500, image: '/lovable-uploads/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.png' },
                              ];
                              
                              return (
                                <div className="space-y-2 mt-4">
                                  <label className="text-xs font-medium text-muted-foreground">Select Spa Finish (Crystite Crystal):</label>
                                  <Carousel 
                                    className="w-full"
                                    opts={{
                                      align: "start",
                                      loop: false,
                                      duration: 25,
                                    }}
                                  >
                                    <CarouselContent className="-ml-1">
                                      {crystiteFinishes.map((finish) => (
                                        <CarouselItem key={finish.id} className="pl-1 basis-1/2 md:basis-1/4">
                                          <div
                                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.spaFinish === finish.name ? "border-primary bg-primary/10" : "border-border"}`}
                                            onClick={() =>
                                              setSelectedExtras((prev: any) => ({
                                                ...prev,
                                                spaFinish: finish.name,
                                                spaFinishPrice: finish.price,
                                              }))
                                            }
                                          >
                                            <div className="w-full h-20 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                              <img
                                                src={finish.image}
                                                alt={finish.name}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                              />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                              <p className="text-xs font-medium text-center truncate">{finish.name}</p>
                                              <p className="text-xs text-primary font-semibold text-center">
                                                +${finish.price.toLocaleString()}
                                              </p>
                                            </div>
                                          </div>
                                        </CarouselItem>
                                      ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-0 animate-pulse" />
                                    <CarouselNext className="right-0 animate-pulse" />
                                  </Carousel>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        {/* Tanning Ledge */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Tanning Ledge</h4>
                            <Checkbox
                              checked={selectedExtras.tanningLedge}
                              onCheckedChange={() =>
                                setSelectedExtras((prev: any) => ({
                                  ...prev,
                                  tanningLedge: !prev.tanningLedge,
                                }))
                              }
                            />
                          </div>
                          {selectedExtras.tanningLedge && (
                            <Carousel 
                              className="w-full"
                              opts={{
                                align: "start",
                                loop: false,
                                duration: 25,
                              }}
                            >
                              <CarouselContent className="-ml-1">
                                {tanningLedges.map((ledge: any) => (
                                  <CarouselItem key={ledge.name} className="pl-1 basis-1/2 md:basis-1/4">
                                    <div
                                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.tanningLedgeModel === ledge.name ? "border-primary bg-primary/10" : "border-border"}`}
                                      onClick={() =>
                                        setSelectedExtras((prev: any) => ({
                                          ...prev,
                                          tanningLedgeModel: ledge.name,
                                        }))
                                      }
                                    >
                                      <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                        <img
                                          src={ledge.image}
                                          alt={ledge.name}
                                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-medium text-center truncate">{ledge.name}</p>
                                        <p className="text-xs text-primary font-semibold text-center">
                                          +${ledge.price.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious className="left-0 animate-pulse" />
                              <CarouselNext className="right-0 animate-pulse" />
                            </Carousel>
                          )}
                        </div>

                        {/* Rocky Waterfalls */}
                        {(selectedProduct?.type === 'pool' || selectedProduct?.type === 'spa' || selectedProduct?.type === 'tanning-ledge') && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Rocky Waterfalls</h4>
                            {selectedExtras.rockyWaterfall && selectedExtras.rockyWaterfallTier && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => removeExtra('rockyWaterfall')}>
                                <X className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            )}
                          </div>
                          <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                            <CarouselContent className="-ml-1">
                              {rockyWaterfallTiers.map((tier) => (
                                <CarouselItem key={tier.name} className="pl-1 basis-1/2 md:basis-1/3">
                                  <div
                                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.rockyWaterfallTier === tier.name ? "border-primary bg-primary/10" : "border-border"}`}
                                    onClick={() =>
                                      setSelectedExtras((prev: any) => ({
                                        ...prev,
                                        rockyWaterfall: true,
                                        rockyWaterfallTier: tier.name,
                                      }))
                                    }
                                  >
                                    <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                      <img src={tier.image} alt={tier.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="text-xs font-medium text-center truncate">{tier.name}</p>
                                      <p className="text-xs text-primary font-semibold text-center">+${tier.price.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 animate-pulse" />
                            <CarouselNext className="right-0 animate-pulse" />
                          </Carousel>
                          {selectedExtras.rockyWaterfall && selectedExtras.rockyWaterfallTier && (
                            <div className="mt-2">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Color</label>
                              <div className="flex gap-2">
                                {rockyWaterfallColors.map((color) => (
                                  <Button
                                    key={color}
                                    size="sm"
                                    variant={selectedExtras.rockyWaterfallColor === color ? "default" : "outline"}
                                    className="text-xs"
                                    onClick={() => setSelectedExtras((prev: any) => ({ ...prev, rockyWaterfallColor: color }))}
                                  >
                                    {color}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        )}

                        {/* Artificial Grass */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 border rounded-lg">
                            <label className="flex items-center space-x-2 cursor-pointer flex-1">
                              <Checkbox
                                checked={selectedExtras.artificialGrass}
                                onCheckedChange={() =>
                                  setSelectedExtras((prev: any) => ({
                                    ...prev,
                                    artificialGrass: !prev.artificialGrass,
                                    artificialGrassColor: !prev.artificialGrass ? (prev.artificialGrassColor || 'Light Green') : prev.artificialGrassColor,
                                  }))
                                }
                              />
                              <span className="text-sm font-semibold">
                                Artificial Grass (+${(
                                  selectedExtras.artificialGrass
                                    ? calculateGrassCost(selectedExtras.artificialGrassArea, selectedExtras.artificialGrassColor)
                                    : 0
                                ).toLocaleString()})
                              </span>
                            </label>
                          </div>
                          {selectedExtras.artificialGrass && (
                            <div className="space-y-3">
                              <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                                <CarouselContent className="-ml-1">
                                  {artificialGrassOptions.map((grass) => (
                                    <CarouselItem key={grass.id} className="pl-1 basis-1/2 md:basis-1/4">
                                      <div
                                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.artificialGrassColor === grass.name ? "border-primary bg-primary/10" : "border-border"}`}
                                        onClick={() =>
                                          setSelectedExtras((prev: any) => ({
                                            ...prev,
                                            artificialGrass: true,
                                            artificialGrassColor: grass.name,
                                          }))
                                        }
                                      >
                                        <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                          <img src={grass.image} alt={grass.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <p className="text-xs font-medium text-center truncate">{grass.name}</p>
                                          <p className="text-xs text-primary font-semibold text-center">${getGrassPricePerSqFt(grass.name)}/sq ft</p>
                                        </div>
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-0 animate-pulse" />
                                <CarouselNext className="right-0 animate-pulse" />
                              </Carousel>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Grass Area (sq ft)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Enter square footage"
                                  value={selectedExtras.artificialGrassArea || ''}
                                  onChange={(e) =>
                                    setSelectedExtras((prev: any) => ({ ...prev, artificialGrassArea: e.target.value }))
                                  }
                                  className="h-9 mb-2"
                                />
                                {selectedExtras.artificialGrassArea &&
                                  !isNaN(parseFloat(selectedExtras.artificialGrassArea)) &&
                                  parseFloat(selectedExtras.artificialGrassArea) > 0 && (
                                    <div className="text-xs text-green-600 font-medium">
                                      Calculated Cost: ${calculateGrassCost(selectedExtras.artificialGrassArea, selectedExtras.artificialGrassColor).toLocaleString()} ({selectedExtras.artificialGrassArea} sq ft × ${getGrassPricePerSqFt(selectedExtras.artificialGrassColor)}/sq ft)
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>



                        {/* Deck Pavers */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">Deck Pavers</h4>
                          <Carousel
                            className="w-full"
                            opts={{
                              align: "start",
                              loop: false,
                              duration: 25,
                            }}
                          >
                            <CarouselContent className="-ml-1">
                              {paverOptions.map((paver) => (
                                <CarouselItem key={paver.name} className="pl-1 basis-1/2 md:basis-1/4">
                                  <div
                                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.paverOption === paver.name ? "border-primary bg-primary/10" : "border-border"}`}
                                    onClick={() => {
                                      const isConcrete = paver.name === "Concrete Deck";
                                      if (isConcrete) setPaverSurfaceArea("");

                                      setSelectedExtras((prev: any) => ({
                                        ...prev,
                                        pavers: !isConcrete,
                                        paverOption: paver.name,
                                        paverSurfaceArea: isConcrete ? "" : prev.paverSurfaceArea,
                                      }));
                                    }}
                                  >
                                    <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                      <img
                                        src={paver.image}
                                        alt={paver.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="text-xs font-medium text-center truncate">{paver.name}</p>
                                      <p className="text-xs text-primary font-semibold text-center">
                                        {paver.name === "Concrete Deck" ? "$10/sq ft" : `$${getPaverPricePerSqFt(paver.name)}/sq ft`}
                                      </p>
                                    </div>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 animate-pulse" />
                            <CarouselNext className="right-0 animate-pulse" />
                          </Carousel>
                          <div className="mt-3">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Paver Surface Area (sq ft)
                            </label>
                            <Input
                              type="number"
                              placeholder="Enter surface area"
                              value={selectedExtras.paverSurfaceArea || ""}
                              onChange={(e) => {
                                const nextArea = e.target.value;
                                setPaverSurfaceArea(nextArea);

                                setSelectedExtras((prev: any) => {
                                  const nextAreaNum = parseFloat(nextArea);
                                  const shouldEnablePavers =
                                    !!nextArea &&
                                    !isNaN(nextAreaNum) &&
                                    nextAreaNum > 0 &&
                                    !!prev.paverOption &&
                                    prev.paverOption !== "Concrete Deck";

                                  return {
                                    ...prev,
                                    pavers: shouldEnablePavers,
                                    paverSurfaceArea: nextArea,
                                  };
                                });
                              }}
                              className="mb-2"
                            />
                            {selectedExtras.paverSurfaceArea &&
                              !isNaN(parseFloat(selectedExtras.paverSurfaceArea)) &&
                              selectedExtras.paverOption &&
                              selectedExtras.paverOption !== "Concrete Deck" && (
                                <div className="text-xs text-green-600 font-medium">
                                  Calculated Cost: ${calculatePaverCost(selectedExtras.paverSurfaceArea, selectedExtras.paverOption).toLocaleString()} ({selectedExtras.paverSurfaceArea} sq ft × ${getPaverPricePerSqFt(selectedExtras.paverOption)}/sq ft)
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Screen Enclosure */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">Screen Enclosure</h4>
                          <Carousel 
                            className="w-full"
                            opts={{
                              align: "start",
                              loop: false,
                              duration: 25,
                            }}
                          >
                            <CarouselContent className="-ml-1">
                            {[
                                { key: "standard", name: "Wonder Cage", price: 22, image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png" },
                                { key: "deluxe", name: "Deluxe", price: 24, image: screenEnclosureDeluxe },
                                { key: "premium", name: "2 Stories", price: 26, image: screenEnclosurePremium },
                              ].map((quality) => (
                                <CarouselItem key={quality.key} className="pl-1 basis-1/2 md:basis-1/3">
                                  <div
                                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.screenEnclosureQuality === quality.key ? "border-primary bg-primary/10" : "border-border"}`}
                                    onClick={() =>
                                      setSelectedExtras((prev: any) => ({
                                        ...prev,
                                        screenEnclosure: true,
                                        screenEnclosureQuality: quality.key,
                                      }))
                                    }
                                  >
                                    <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                      <img
                                        src={quality.image}
                                        alt={quality.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="text-xs font-medium text-center truncate">{quality.name}</p>
                                      <p className="text-xs text-primary font-semibold text-center">
                                        ${quality.price}/sq ft
                                      </p>
                                    </div>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 animate-pulse" />
                            <CarouselNext className="right-0 animate-pulse" />
                          </Carousel>
                          <div className="mt-3">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Screen Enclosure Area (sq ft)
                            </label>
                            <Input
                              type="number"
                              placeholder="Enter surface area"
                              value={selectedExtras.screenEnclosureArea || ""}
                              onChange={(e) => {
                                const nextArea = parseFloat(e.target.value) || 0;
                                setSelectedExtras((prev: any) => ({
                                  ...prev,
                                  screenEnclosure: nextArea > 0 || !!prev.screenEnclosureQuality,
                                  screenEnclosureArea: nextArea,
                                }));
                              }}
                              className="mb-2"
                            />
                            {selectedExtras.screenEnclosureArea > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                Calculated Cost: ${(() => {
                                  const quality = selectedExtras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium' || 'standard';
                                  const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
                                  return (selectedExtras.screenEnclosureArea * pricePerSqFt).toLocaleString();
                                })()} ({selectedExtras.screenEnclosureArea} sq ft × ${(() => {
                                  const quality = selectedExtras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium' || 'standard';
                                  return SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
                                })()}/sq ft)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Concrete Construction - Hidden for Wonderlands World pools */}
                        {!["Madre Perla", "Pacific Ridge", "Winderview", "Maxima"].includes(selectedProduct?.model || "") && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 border rounded-lg">
                              <label className="flex items-center space-x-2 cursor-pointer flex-1">
                                <Checkbox
                                  checked={selectedExtras.concreteConstruction}
                                  onCheckedChange={() =>
                                    setSelectedExtras((prev: any) => ({
                                      ...prev,
                                      concreteConstruction: !prev.concreteConstruction,
                                    }))
                                  }
                                />
                                <span className="text-sm font-semibold">
                                  Concrete Construction (+${selectedProduct ? Math.round(getProductPrice(selectedProduct) * 0.2).toLocaleString() : '0'})
                                </span>
                              </label>
                            </div>
                            {selectedExtras.concreteConstruction && (
                              <p className="text-xs text-muted-foreground ml-2">
                                Premium concrete construction for enhanced durability and longevity. (+20% of pool price)
                              </p>
                            )}
                          </div>
                        )}

                      </>
                    )}

                    {/* Included Features (pools, spas, tanning ledges, saunas only) */}
                    {isWaterProduct(selectedProduct.type) && <div className="bg-green-50 dark:bg-green-950/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-300 mb-2 sm:mb-3">
                        ✓ Included at No Extra Cost
                      </h3>
                      <div className="grid grid-cols-1 gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-green-700 dark:text-green-400">
                        <div className="flex items-center gap-2">
                          <span>• Salt water system</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>• Smart Pentair pool pump & filter</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>• LED lighting system ({selectedProduct.dimensions && selectedProduct.dimensions.includes('16') || selectedProduct.dimensions && selectedProduct.dimensions.includes('20') ? '4 lights' : '2 lights'})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>• Engineering drawings & permits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>• Premium coping pavers</span>
                        </div>
                      </div>
                    </div>}
                    {isWaterProduct(selectedProduct.type) && (<>
                          {/* Pool Heater - At bottom with auto-filled dimensions */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-foreground">Pool Heater</h4>
                              <Checkbox
                                checked={selectedExtras.heater}
                                onCheckedChange={() =>
                                  setSelectedExtras((prev: any) => ({
                                    ...prev,
                                    heater: !prev.heater,
                                  }))
                                }
                              />
                            </div>
                            
                            {selectedExtras.heater && selectedProduct && (
                              <>
                                {/* Auto-filled pool info */}
                                <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pool Dimensions:</span>
                                    <span className="font-medium">{selectedProduct.dimensions || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Depth:</span>
                                    <span className="font-medium">{selectedProduct.depth || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Est. Volume:</span>
                                    <span className="font-medium">
                                      {(() => {
                                        const { length, width } = parsePoolDimensions(selectedProduct.dimensions);
                                        const avgDepth = 5; // Average depth estimate
                                        return Math.round(length * width * avgDepth * 7.48).toLocaleString();
                                      })()} gallons
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Heater Carousel */}
                                <Carousel 
                                  className="w-full"
                                  opts={{
                                    align: "start",
                                    loop: false,
                                    duration: 25,
                                  }}
                                >
                                  <CarouselContent className="-ml-1">
                                    {poolHeaters.map((heater) => (
                                      <CarouselItem key={heater.name} className="pl-1 basis-1/2 md:basis-1/4">
                                        <div
                                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${selectedExtras.heaterModel === heater.name ? "border-primary bg-primary/10" : "border-border"}`}
                                          onClick={() =>
                                            setSelectedExtras((prev: any) => ({
                                              ...prev,
                                              heaterModel: heater.name,
                                            }))
                                          }
                                        >
                                          <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                            <img
                                              src={heater.image}
                                              alt={heater.name}
                                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                            />
                                          </div>
                                          <div className="flex flex-col gap-0.5">
                                            <p className="text-xs font-medium text-center truncate">{heater.name}</p>
                                            <p className="text-xs text-primary font-semibold text-center">
                                              +${heater.price.toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                      </CarouselItem>
                                    ))}
                                  </CarouselContent>
                                  <CarouselPrevious className="left-0 animate-pulse" />
                                  <CarouselNext className="right-0 animate-pulse" />
                                </Carousel>
                              </>
                            )}
                          </div>
                    </>)}


                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button onClick={handleQuoteRequest} className="flex-1 instant-quote-btn text-xs sm:text-sm transition-all duration-300">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span className="truncate">Instant Quote</span>
                      </Button>
                      <Button onClick={handleAddToCart} variant="outline" size="icon" className="w-10 h-10">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <StripeCheckoutButton 
                        productId={`${selectedProduct.type}_${selectedProduct.model?.replace(/\s+/g, '_') || selectedProduct.name?.replace(/\s+/g, '_')}`} 
                        productName={selectedProduct.model || selectedProduct.name || 'Product'} 
                        price={calculateTotalPrice()} 
                        variant="default" 
                        className="flex-1 text-xs sm:text-sm" 
                      />
                    </div>
                   </CardContent>
                 </Card>
              </div> : <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a product to start configuring</p>
                </div>
              </Card>}
          </div>

          {/* Retractable Price Panel - Overlay on top of content */}
          {showPricePanel && selectedProduct && (
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l-2 shadow-2xl z-50 overflow-y-auto">
            <Card className="h-full border-0 shadow-none rounded-none">
              <CardHeader className="sticky top-0 bg-background z-10 border-b pb-3 sm:pb-4 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <CardTitle className="text-base sm:text-lg">Total Price</CardTitle>
                    {getSelectedExtrasCount() > 0 && <DropdownMenu open={showExtrasDropdown} onOpenChange={setShowExtrasDropdown}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                            <Badge variant="secondary" className="mr-1.5 sm:mr-2 text-[10px] sm:text-xs">
                              {getSelectedExtrasCount()}
                            </Badge>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 sm:w-64 p-2 bg-background z-50">
                          <div className="space-y-2">
                            <p className="text-sm font-medium mb-2">Selected Features:</p>
                            {/* Spa: check spaModel (used by the UI carousel) */}
                            {selectedExtras.spa && selectedExtras.spaModel && selectedExtras.spaModel !== '' && selectedExtras.spaModel !== 'None' && (() => {
                              const allSpas = [...spas, ...gilmerSpas];
                              const selectedSpa = allSpas.find((s: any) => s.model === selectedExtras.spaModel);
                              return (
                                <div className="flex items-center justify-between text-xs">
                                  <span>{selectedExtras.spaModel} Spa</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">
                                      +${(selectedSpa?.price || 0).toLocaleString()}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => removeExtra('spa')} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Spa Finish */}
                            {selectedExtras.spaFinish && selectedExtras.spaFinishPrice > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span>{selectedExtras.spaFinish} Spa Finish</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${selectedExtras.spaFinishPrice.toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('spaFinish')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {/* Tanning Ledge */}
                            {selectedExtras.tanningLedge && selectedExtras.tanningLedgeModel && selectedExtras.tanningLedgeModel !== '' && selectedExtras.tanningLedgeModel !== 'None' && (() => {
                              const selectedLedge = tanningLedges.find((l: any) => l.name === selectedExtras.tanningLedgeModel);
                              return (
                                <div className="flex items-center justify-between text-xs">
                                  <span>{selectedExtras.tanningLedgeModel} Tanning Ledge</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">
                                      +${(selectedLedge?.price || 0).toLocaleString()}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => removeExtra('tanningLedge')} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}
                            {(() => {
                              const selectedFinish = finishOptions.find(f => f.name === selectedExtras.finish);
                              return selectedExtras.finish && selectedExtras.finish !== 'None' && selectedExtras.finish !== '' && selectedFinish && selectedFinish.price > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span>{selectedExtras.finish} Finish</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">
                                      +${selectedFinish.price.toLocaleString()}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => removeExtra('finish')} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}
                            {selectedExtras.heater && selectedExtras.heaterModel && selectedExtras.heaterModel !== '' && selectedExtras.heaterModel !== 'None' && (
                              <div className="flex items-center justify-between text-xs">
                                <span>Pool Heater</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${(poolHeaters.find(h => h.name === selectedExtras.heaterModel)?.price || 0).toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('heater')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {selectedExtras.cover && selectedExtras.coverOption && selectedExtras.coverOption !== 'NO COVER' && selectedExtras.coverOption !== 'None' && selectedExtras.coverOption !== '' && (
                              <div className="flex items-center justify-between text-xs">
                                <span>{selectedExtras.coverOption}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${(coverOptions.find(c => c.name === selectedExtras.coverOption)?.price || 0).toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('cover')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {selectedExtras.jets && selectedExtras.jetQuantity > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span>Spa Jets ({selectedExtras.jetQuantity})</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${(getExtraPrice('jets') * selectedExtras.jetQuantity).toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('jets')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {selectedExtras.tiles && selectedExtras.tileOption && selectedExtras.tileOption !== 'None' && selectedExtras.tileOption !== '' && (
                              <div className="flex items-center justify-between text-xs">
                                <span>Premium Tiles ({selectedExtras.tileOption})</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${getTileCost(selectedExtras.tileOption).toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('tiles')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {selectedExtras.liner && selectedExtras.linerOption && selectedExtras.linerOption !== 'None' && selectedExtras.linerOption !== '' && selectedExtras.linerOption !== 'Standard Blue' && (
                              <div className="flex items-center justify-between text-xs">
                                <span>{selectedExtras.linerOption} Liner</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${(linerOptions.find(l => l.name === selectedExtras.linerOption)?.price || 4500).toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('liner')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {(() => {
                              const paverArea = parseFloat(selectedExtras.paverSurfaceArea || paverSurfaceArea);
                              return selectedExtras.pavers && selectedExtras.paverOption && selectedExtras.paverOption !== 'Concrete Deck' && selectedExtras.paverOption !== 'None' && selectedExtras.paverOption !== '' && !isNaN(paverArea) && paverArea > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span>{selectedExtras.paverOption} ({paverArea} sqft)</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">
                                      +${calculatePaverCost(paverArea, selectedExtras.paverOption).toLocaleString()}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => removeExtra('pavers')} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}
                            {selectedExtras.screenEnclosure && selectedExtras.screenEnclosureQuality && selectedExtras.screenEnclosureArea > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span>Screen Enclosure ({selectedExtras.screenEnclosureArea} sqft)</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${(selectedExtras.screenEnclosureArea * (SCREEN_ENCLOSURE_PRICING[(selectedExtras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium') || 'standard'] || SCREEN_ENCLOSURE_PRICING.standard)).toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('screen')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {selectedExtras.concreteConstruction && (
                              <div className="flex items-center justify-between text-xs">
                                <span>Concrete Construction</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    +${selectedProduct ? Math.round(getProductPrice(selectedProduct) * 0.2).toLocaleString() : '0'}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => removeExtra('concrete')} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPricePanel(false)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {activeTab === 'build-a-pool' && poolBuilderData ? <>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Pool ({poolBuilderData.area.toFixed(1)} sq ft)</span>
                          <span>${poolBuilderData.breakdown?.poolCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Deck Pavers ({poolBuilderData.deckArea?.toFixed(1)} sq ft)</span>
                          <span>${poolBuilderData.breakdown?.deckCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Coping ({poolBuilderData.perimeter.toFixed(1)} ft)</span>
                          <span>${poolBuilderData.breakdown?.copingCost.toLocaleString()}</span>
                        </div>
                        {poolBuilderData.features.length > 0 && (
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Features ({poolBuilderData.features.length})</span>
                            <span>${poolBuilderData.breakdown?.featuresCost.toLocaleString()}</span>
                          </div>
                        )}
                        <Separator />
                      </div>
                      
                      {/* Feature Breakdown */}
                      {poolBuilderData.features.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Added Features:</p>
                          {poolBuilderData.features.map((feature: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary" className="capitalize">{feature.type}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold">
                          <span className="text-primary">
                            ${Math.floor(poolBuilderData.breakdown?.total || 0).toLocaleString()}
                          </span>
                          <span className="text-black">
                            {((poolBuilderData.breakdown?.total || 0) % 1).toFixed(2).substring(1)}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          Total Configuration Price
                        </p>
                      </div>

                      {/* Financing Options */}
                      <FinancingOptions 
                        totalPrice={poolBuilderData.breakdown?.total || 0}
                        productName="Pool Configuration"
                        compact
                      />
                    </> : selectedProduct ? <>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Base Price</span>
                          <span>${selectedProduct.price.toLocaleString()}</span>
                        </div>
                        <Separator />
                      </div>
                      
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold">
                          <span className="text-primary">
                            ${Math.floor(calculateTotalPrice()).toLocaleString()}
                          </span>
                          <span className="text-black">
                            {(calculateTotalPrice() % 1).toFixed(2).substring(1)}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          Total Configuration Price
                        </p>
                      </div>

                      {/* Financing Options */}
                      <FinancingOptions 
                        totalPrice={calculateTotalPrice()}
                        productName={selectedProduct.model || selectedProduct.name || 'Product'}
                        compact
                      />
                    </> : <div className="text-center text-muted-foreground py-8">
                      <DollarSign className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Select a product to see pricing</p>
                    </div>}
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>

      {/* Quote Modal */}
      <SurveyQuoteTool pool={selectedProduct ? {
      model: selectedProduct.model || selectedProduct.name || 'Product',
      price: selectedProduct.price,
      category: selectedProduct.category as any,
      image: selectedProduct.image,
      dimensions: selectedProduct.dimensions,
      depth: selectedProduct.depth,
      warrantyYears: selectedProduct.warrantyYears
    } : null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} extras={{
      ...selectedExtras,
      // Use ref data which is set synchronously before modal opens
      extrasBreakdown: extrasDataRef.current.extrasBreakdown,
      extrasTotal: extrasDataRef.current.extrasTotal,
      deliveryTime: selectedExtras.concreteConstruction ? '8-12 weeks+' : '6 weeks'
    }} />
    
    {/* Floating AI Search - Hidden for now */}
    </div>;
};
export default WonderlandsStudio;