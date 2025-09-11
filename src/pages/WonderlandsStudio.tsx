import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award, Palette, Camera, Layers, Plus, Minus, Download, Printer, ShoppingCart, Search, ChevronDown, Settings, Package, ChevronRight, ChevronLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { useShoppingCart } from "@/components/ShoppingCart";
import { spas, pools } from "@/components/PoolCatalog";
import { tanningLedges, poolLiners, poolTiles } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { 
  poolFinishes as poolFinishesData, 
  poolLiners as poolLinersData, 
  poolTiles as poolTilesData,
  tanningLedges as tanningLedgesData 
} from "@/data/consolidatedProducts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SurveyQuoteTool from "@/components/SurveyQuoteTool";
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import oceanBlueFinish from '@/assets/finishes/ocean-blue-g3.jpg';
import sapphireBlueFinish from '@/assets/finishes/sapphire-blue-g3.jpg';
import nightSkyFinish from '@/assets/finishes/night-sky-g3.jpg';
import athensPearlFinish from '@/assets/finishes/athens-pearl-white-g3.jpg';
import lagoonBlueFinish from '@/assets/finishes/lagoon-blue-g2.jpg';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.jpg';
import coastalBronzeFinish from '@/assets/finishes/coastal-bronze-g3.jpg';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.jpg';

interface Product {
  model?: string;
  name?: string;
  price: number;
  category: string;
  image?: string;
  dimensions?: string;
  depth?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  type?: 'pool' | 'spa' | 'tanning-ledge' | 'scene';
  id?: string;
  description?: string;
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
  // Quote data
  extrasBreakdown?: Array<{ name: string; price: number; image: string; }>;
  extrasTotal?: number;
}

// Helper function to get discounted price for deluxe pools
const getProductPrice = (product: Product) => {
  if (product.category === 'premium') {
    return Math.round(product.price * 0.70); // 30% discount
  }
  // Apply 15% discount to all pools
  if (product.type === 'pool') {
    return Math.round(product.price * 0.85); // 15% discount for pools
  }
  return product.price;
};

// Finish options with images - using consolidated data
const finishOptions = poolFinishesData.map(finish => ({
  name: finish.name,
  price: finish.price,
  image: finish.image
}));

// Pool heaters with models
const poolHeaters = [
  { name: 'Hayward H400FDN Natural Gas', price: 4500, image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png' },
  { name: 'Pentair MasterTemp 400', price: 4200, image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png' },
  { name: 'Raypak 406A Natural Gas', price: 3800, image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png' },
  { name: 'Jandy JXi 400N', price: 5200, image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png' }
];

// Liner options - using consolidated data
const linerOptions = [
  { name: 'Standard Blue', price: 0, image: azureBlueFinish },
  ...poolLinersData.map(liner => ({
    name: liner.name,
    price: liner.price,
    image: liner.image
  }))
];

// Cover options
const coverOptions = [
  { name: 'NO COVER', color: '#808080', price: 0, image: shaleGrayFinish, category: 'none' },
  { name: 'ProMesh 2000', color: '#2F4F4F', price: 16000, image: nightSkyFinish, category: 'cover' },
  { name: 'CS3000 Safety Cover', color: '#2F4F4F', price: 24000, image: shaleGrayFinish, category: 'cover' },
  { name: 'Infinity 4000 Smart Cover', color: '#2F4F4F', price: 32000, image: coastalBronzeFinish, category: 'cover' },
  { name: 'Atom Loop-Loc Cover', color: '#2F4F4F', price: 19000, image: aquamarineFinish, category: 'cover' }
];

// Tile options - using consolidated data
const tileOptions = [
  { name: 'Standard Waterline', color: '#4682B4', price: 0, image: azureBlueFinish },
  ...poolTilesData.map(tile => ({
    name: tile.name,
    color: '#4682B4',
    price: tile.price,
    image: tile.image
  }))
];

// Paver options - using consolidated data + existing paverTypes
const paverOptions = [
  { name: 'No Pavers', color: '#808080', price: 0, image: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png', collection: 'none' },
  ...paverTypes.map(paver => ({
    name: paver.name,
    color: '#D3D3D3',
    price: 0,
    image: paver.image,
    collection: paver.id.includes('appian') ? 'appian' : paver.id.includes('catalina-grana') ? 'catalina-grana' : paver.id.includes('catalina') ? 'catalina' : 'standard'
  }))
];

// Paver categories for dropdown
const paverCategories = [
  { value: 'all', label: 'All Collections' },
  { value: 'appian', label: 'Appian Collection' },
  { value: 'catalina', label: 'Catalina Collection' },
  { value: 'catalina-grana', label: 'Catalina Grana Collection' },
  { value: 'standard', label: 'Standard Collection' }
];

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

const WonderlandsStudio = () => {
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pools' | 'spas' | 'tanning-ledges' | 'scenes'>('pools');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<ProductExtras>({
    liner: false,
    heater: false,
    cover: false,
    jets: false,
    jetQuantity: 4,
    finish: 'Aquamarine',
    linerOption: 'Standard Blue',
    coverOption: 'NO COVER',
    tiles: false,
    tileOption: 'Standard Waterline',
    heaterModel: 'Hayward H400FDN Natural Gas',
    pavers: false,
    paverOption: 'No Pavers',
    copingPaverOption: 'No Coping',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: 'standard',
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
    pergolas: false
  });
  const [paverSurfaceArea, setPaverSurfaceArea] = useState('');
  const [paverCategory, setPaverCategory] = useState('all');
  const [showExtrasDropdown, setShowExtrasDropdown] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [activeFeatureCarousel, setActiveFeatureCarousel] = useState<string | null>(null);
  
  // Handle URL parameters for product search integration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get('model');
    const price = urlParams.get('price');
    const category = urlParams.get('category');
    const image = urlParams.get('image');
    const dimensions = urlParams.get('dimensions');
    
    if (model && price) {
      const productFromUrl: Product = {
        model: model,
        price: parseInt(price),
        category: category || 'standard',
        image: image ? decodeURIComponent(image) : undefined,
        dimensions: dimensions ? decodeURIComponent(dimensions) : undefined,
        type: 'pool'
      };
      setSelectedProduct(productFromUrl);
      setLeftSidebarCollapsed(true);
    }
  }, []);
  
  // Scene rooms from Belgard Studio
  const sceneRooms = [
    {
      id: 'sandbox',
      name: 'Sandbox - Build Your Own',
      category: 'scene',
      price: 0,
      image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png', // Astoria pool image
      description: 'Build your own custom outdoor space with all available options'
    },
    {
      id: 'mediterranean-villa',
      name: 'Mediterranean Villa',
      category: 'scene',
      price: 0,
      image: 'https://rooms.belgard.com/wp-content/uploads/2024/07/KR_12_A_2.jpg?optimize=low&auto=webp',
      description: 'Elegant Mediterranean-inspired outdoor living space with natural stone elements'
    },
    {
      id: 'modern-courtyard',
      name: 'Modern Courtyard',
      category: 'scene', 
      price: 0,
      image: 'https://rooms.belgard.com/wp-content/uploads/KR_HNA_23_5.jpg?optimize=low&auto=webp',
      description: 'Contemporary courtyard design with clean lines and geometric patterns'
    },
    {
      id: 'coastal-retreat',
      name: 'Coastal Retreat',
      category: 'scene',
      price: 0,
      image: 'https://rooms.belgard.com/wp-content/uploads/KR_24_FL_1_5.jpg?optimize=low&auto=webp',
      description: 'Relaxing coastal-inspired space perfect for entertaining'
    },
    {
      id: 'rustic-lodge',
      name: 'Rustic Lodge',
      category: 'scene',
      price: 0,
      image: 'https://rooms.belgard.com/wp-content/uploads/cR_7_a_4-Photo.jpg?optimize=low&auto=webp',
      description: 'Warm rustic design with natural materials and cozy atmosphere'
    }
  ];

  // Belgard Studio additional features for scenes
  const belgardStudioOptions = {
    concreteSlabs: [
      { name: 'Concrete Paver Slab - Sample', price: 12, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    permeablePavers: [
      { name: 'Permeable Paver - Sample', price: 18, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    porcelainPavers: [
      { name: 'Porcelain Paver - Sample', price: 25, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    wallSystems: [
      { name: 'Retaining Wall System - Sample', price: 35, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    capsEdgers: [
      { name: 'Cap & Edger Set - Sample', price: 8, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    outdoorKitchens: [
      { name: 'Outdoor Kitchen Island - Sample', price: 8500, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    fireplaces: [
      { name: 'Outdoor Fireplace - Sample', price: 4500, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    firePitKits: [
      { name: 'Fire Pit Kit - Sample', price: 1200, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ],
    pergolas: [
      { name: 'Pergola & Panel System - Sample', price: 3500, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', category: 'sample' }
    ]
  };

  // Get filtered products based on active tab
  const getFilteredProducts = () => {
    let products: Product[] = [];
    
    switch (activeTab) {
      case 'pools':
        products = pools.map(pool => ({ ...pool, type: 'pool' as const }));
        break;
      case 'spas':
        products = spas.map(spa => ({ ...spa, type: 'spa' as const, name: spa.model }));
        break;
      case 'tanning-ledges':
        products = tanningLedges.map(ledge => ({ ...ledge, type: 'tanning-ledge' as const, model: ledge.name, category: 'premium' }));
        break;
      case 'scenes':
        products = sceneRooms.map(scene => ({ ...scene, type: 'scene' as const, model: scene.name }));
        break;
    }

    if (searchQuery) {
      products = products.filter(product => 
        (product.model || product.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return products;
  };

  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0;

    let total = getProductPrice(selectedProduct);

    // Add finish cost
    const selectedFinish = finishOptions.find(finish => finish.name === selectedExtras.finish);
    if (selectedFinish) total += selectedFinish.price;

    // Add heater cost
    if (selectedExtras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === selectedExtras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }

    // Add cover cost
    const coverOption = coverOptions.find(option => option.name === selectedExtras.coverOption);
    if (coverOption && selectedExtras.cover && coverOption.name !== 'NO COVER') {
      total += coverOption.price;
    }

    // Add jets cost
    if (selectedExtras.jets) {
      total += getExtraPrice('jets') * selectedExtras.jetQuantity;
    }

    // Add tiles cost
    const tileOption = tileOptions.find(option => option.name === selectedExtras.tileOption);
    if (tileOption && selectedExtras.tiles) {
      total += tileOption.price;
    }

    // Add liner cost
    const linerOption = linerOptions.find(option => option.name === selectedExtras.linerOption);
    if (linerOption && selectedExtras.linerOption !== 'Standard Blue') {
      total += linerOption.price;
    }

    // Add paver surface area cost
    if (selectedExtras.pavers && paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      total += parseFloat(paverSurfaceArea) * 15;
    }

    // Add screen enclosure cost
    if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureArea > 0) {
      let pricePerSqFt = 15;
      if (selectedExtras.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
      if (selectedExtras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
      total += selectedExtras.screenEnclosureArea * pricePerSqFt;
    }

    // Add concrete construction cost
    if (selectedExtras.concreteConstruction) {
      total += Math.round(getProductPrice(selectedProduct) * 0.2);
    }

    return total;
  };

  const getSelectedExtrasCount = () => {
    let count = 0;
    if (selectedExtras.finish !== 'Aquamarine') count++;
    if (selectedExtras.heater) count++;
    if (selectedExtras.cover && selectedExtras.coverOption !== 'NO COVER') count++;
    if (selectedExtras.jets) count++;
    if (selectedExtras.tiles) count++;
    if (selectedExtras.linerOption !== 'Standard Blue') count++;
    if (selectedExtras.pavers && selectedExtras.paverOption !== 'No Pavers') count++;
    if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureArea > 0) count++;
    if (selectedExtras.concreteConstruction) count++;
    return count;
  };

  const removeExtra = (extraType: string) => {
    const newExtras = { ...selectedExtras };
    switch (extraType) {
      case 'finish':
        newExtras.finish = 'Aquamarine';
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
        break;
      case 'tiles':
        newExtras.tiles = false;
        break;
      case 'liner':
        newExtras.linerOption = 'Standard Blue';
        break;
      case 'pavers':
        newExtras.pavers = false;
        newExtras.paverOption = 'No Pavers';
        setPaverSurfaceArea('');
        break;
      case 'screen':
        newExtras.screenEnclosure = false;
        newExtras.screenEnclosureArea = 0;
        break;
      case 'concrete':
        newExtras.concreteConstruction = false;
        break;
    }
    setSelectedExtras(newExtras);
  };

  const handleQuoteRequest = () => {
    if (!selectedProduct) return;

    // Create detailed extras breakdown for quote tool
    const extrasBreakdown = [];

    // Add finish if not default
    const selectedFinish = finishOptions.find(finish => finish.name === selectedExtras.finish);
    if (selectedFinish && selectedFinish.price > 0) {
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
    if (selectedExtras.jets) {
      extrasBreakdown.push({
        name: `Spa Jets (${selectedExtras.jetQuantity})`,
        price: getExtraPrice('jets') * selectedExtras.jetQuantity,
        image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
      });
    }

    // Add tiles if selected
    const tileOption = tileOptions.find(option => option.name === selectedExtras.tileOption);
    if (tileOption && selectedExtras.tiles) {
      extrasBreakdown.push({
        name: tileOption.name,
        price: tileOption.price,
        image: tileOption.image
      });
    }

    // Add liner if selected
    if (selectedExtras.linerOption !== 'Standard Blue') {
      const linerOption = linerOptions.find(option => option.name === selectedExtras.linerOption);
      if (linerOption) {
        extrasBreakdown.push({
          name: `${linerOption.name} Liner`,
          price: linerOption.price || 4500,
          image: linerOption.image
        });
      }
    }

    // Add paver surface area cost
    if (selectedExtras.pavers && paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      extrasBreakdown.push({
        name: `${selectedExtras.paverOption} (${paverSurfaceArea} sq ft)`,
        price: parseFloat(paverSurfaceArea) * 15,
        image: paverOptions.find(p => p.name === selectedExtras.paverOption)?.image || '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png'
      });
    }

    // Add screen enclosure if area provided
    if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureArea > 0) {
      let pricePerSqFt = 15;
      if (selectedExtras.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
      if (selectedExtras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
      const enclosurePrice = selectedExtras.screenEnclosureArea * pricePerSqFt;
      extrasBreakdown.push({
        name: `Screen Enclosure - ${selectedExtras.screenEnclosureQuality === 'standard' ? 'Wonder Cage' : selectedExtras.screenEnclosureQuality === 'deluxe' ? 'Deluxe' : 'Premium'} (${selectedExtras.screenEnclosureArea} sq ft)`,
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

    const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
    
    // Store the breakdown for the quote modal
    setSelectedExtras(prev => ({ ...prev, extrasBreakdown, extrasTotal }));
    setShowQuoteModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Convert selectedExtras to the format expected by CartItem
    const extrasArray = [];
    
    // Add finish if not default
    const selectedFinish = finishOptions.find(finish => finish.name === selectedExtras.finish);
    if (selectedFinish && selectedFinish.price > 0) {
      extrasArray.push({
        name: `${selectedFinish.name} Finish`,
        price: selectedFinish.price
      });
    }

    // Add heater if selected
    if (selectedExtras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === selectedExtras.heaterModel);
      if (selectedHeater) {
        extrasArray.push({
          name: selectedHeater.name,
          price: selectedHeater.price
        });
      }
    }

    // Add cover if selected
    const coverOption = coverOptions.find(option => option.name === selectedExtras.coverOption);
    if (coverOption && selectedExtras.cover && coverOption.name !== 'NO COVER') {
      extrasArray.push({
        name: coverOption.name,
        price: coverOption.price
      });
    }

    // Add jets if selected
    if (selectedExtras.jets) {
      extrasArray.push({
        name: `Spa Jets (${selectedExtras.jetQuantity})`,
        price: getExtraPrice('jets') * selectedExtras.jetQuantity
      });
    }

    // Add tiles if selected
    const tileOption = tileOptions.find(option => option.name === selectedExtras.tileOption);
    if (tileOption && selectedExtras.tiles) {
      extrasArray.push({
        name: tileOption.name,
        price: tileOption.price
      });
    }

    // Add liner if selected
    if (selectedExtras.linerOption !== 'Standard Blue') {
      extrasArray.push({
        name: `${selectedExtras.linerOption} Liner`,
        price: 4500
      });
    }

    // Add paver surface area cost
    if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      extrasArray.push({
        name: `${selectedExtras.paverOption} (${paverSurfaceArea} sq ft)`,
        price: parseFloat(paverSurfaceArea) * 15
      });
    }

    // Add screen enclosure if area provided
    if (selectedExtras.screenEnclosureArea > 0) {
      let pricePerSqFt = 15;
      if (selectedExtras.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
      if (selectedExtras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
      const enclosurePrice = selectedExtras.screenEnclosureArea * pricePerSqFt;
      extrasArray.push({
        name: `Screen Enclosure - ${selectedExtras.screenEnclosureQuality === 'standard' ? 'Wonder Cage' : selectedExtras.screenEnclosureQuality === 'deluxe' ? 'Deluxe' : 'Premium'} (${selectedExtras.screenEnclosureArea} sq ft)`,
        price: enclosurePrice
      });
    }

    // Add concrete construction if selected
    if (selectedExtras.concreteConstruction) {
      const concreteMarkup = Math.round(getProductPrice(selectedProduct) * 0.2);
      extrasArray.push({
        name: 'Concrete Construction',
        price: concreteMarkup
      });
    }

    const cartItem = {
      id: `${selectedProduct.type}_${selectedProduct.model || selectedProduct.name}`,
      name: selectedProduct.model || selectedProduct.name || 'Product',
      price: calculateTotalPrice(),
      quantity: 1,
      image: selectedProduct.image,
      category: selectedProduct.category,
      extras: extrasArray
    };

    addToCart(cartItem);
    toast({
      title: "Added to Cart",
      description: `${cartItem.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Compact Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-teal to-coral bg-clip-text text-transparent">
              Wonderlands Studio
            </h1>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 md:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar - Product Selection (Collapsible) */}
          <div className={`transition-all duration-300 ${leftSidebarCollapsed ? 'w-full lg:w-12' : 'w-full lg:w-80'} flex-shrink-0`}>
            {leftSidebarCollapsed ? (
              <div className="sticky top-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeftSidebarCollapsed(false)}
                  className="w-10 h-10 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Card className="sticky top-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Product Categories</CardTitle>
                    {selectedProduct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLeftSidebarCollapsed(true)}
                        className="w-8 h-8 p-0 hidden lg:flex"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 gap-2 h-auto bg-transparent p-0">
                      <TabsTrigger value="pools" className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Waves className="h-4 w-4 mr-2" />
                        Pools
                      </TabsTrigger>
                      <TabsTrigger value="spas" className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Droplets className="h-4 w-4 mr-2" />
                        Spas
                      </TabsTrigger>
                      <TabsTrigger value="tanning-ledges" className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Sun className="h-4 w-4 mr-2" />
                        Tanning Ledges
                      </TabsTrigger>
                      <TabsTrigger value="scenes" className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Camera className="h-4 w-4 mr-2" />
                        <span className="ml-1">Scenes</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                      {getFilteredProducts().map((product, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedProduct?.model === product.model || selectedProduct?.name === product.name
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setSelectedProduct(product);
                            setLeftSidebarCollapsed(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.model || product.name || 'Product'} 
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Product Details & Configuration */}
          <div className="flex-1">
            {selectedProduct ? (
              <div className="space-y-6">
                {/* Large Product Image */}
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                      {selectedProduct.image ? (
                        <img 
                          src={selectedProduct.image} 
                          alt={selectedProduct.model || selectedProduct.name || 'Product'} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-2xl font-bold">
                            {selectedProduct.model || selectedProduct.name}
                          </h1>
                          <p className="text-3xl font-bold text-primary mt-2">
                            ${getProductPrice(selectedProduct).toLocaleString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getCategoryColor(selectedProduct.category)}>
                              {selectedProduct.category}
                            </Badge>
                            {selectedProduct.dimensions && (
                              <Badge variant="outline">{selectedProduct.dimensions}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedProduct.type === 'scene' ? 'Belgard Studio Options' : 'Additional Features'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedProduct.type === 'scene' ? (
                      // Belgard Studio Options for Scenes
                      <>
                        {/* Concrete Pavers & Slabs */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Concrete Pavers & Slabs</Label>
                              <p className="text-xs text-muted-foreground">Durable concrete solutions</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedExtras.concreteSlabs}
                                onCheckedChange={(checked) => {
                                  const newExtras = { ...selectedExtras, concreteSlabs: !!checked };
                                  setSelectedExtras(newExtras);
                                  if (checked) {
                                    setActiveFeatureCarousel('concreteSlabs');
                                  } else {
                                    setActiveFeatureCarousel(null);
                                  }
                                }}
                              />
                              {selectedExtras.concreteSlabs && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newCarousel = activeFeatureCarousel === 'concreteSlabs' ? null : 'concreteSlabs';
                                    setActiveFeatureCarousel(newCarousel);
                                  }}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'concreteSlabs' ? 'rotate-180' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </div>
                          {selectedExtras.concreteSlabs && activeFeatureCarousel === 'concreteSlabs' && (
                            <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.concreteSlabs.map((option) => (
                                    <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price}/sq ft
                                        </p>
                                        {option.category === 'sample' && (
                                          <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>
                                        )}
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>
                          )}
                        </div>

                        {/* Outdoor Kitchens */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Outdoor Kitchens</Label>
                              <p className="text-xs text-muted-foreground">Complete cooking solutions</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedExtras.outdoorKitchens}
                                onCheckedChange={(checked) => {
                                  const newExtras = { ...selectedExtras, outdoorKitchens: !!checked };
                                  setSelectedExtras(newExtras);
                                  if (checked) {
                                    setActiveFeatureCarousel('outdoorKitchens');
                                  } else {
                                    setActiveFeatureCarousel(null);
                                  }
                                }}
                              />
                              {selectedExtras.outdoorKitchens && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newCarousel = activeFeatureCarousel === 'outdoorKitchens' ? null : 'outdoorKitchens';
                                    setActiveFeatureCarousel(newCarousel);
                                  }}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'outdoorKitchens' ? 'rotate-180' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </div>
                          {selectedExtras.outdoorKitchens && activeFeatureCarousel === 'outdoorKitchens' && (
                            <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.outdoorKitchens.map((option) => (
                                    <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && (
                                          <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>
                                        )}
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>
                          )}
                        </div>

                        {/* Fireplaces */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Fireplaces</Label>
                              <p className="text-xs text-muted-foreground">Outdoor warmth and ambiance</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedExtras.fireplaces}
                                onCheckedChange={(checked) => {
                                  const newExtras = { ...selectedExtras, fireplaces: !!checked };
                                  setSelectedExtras(newExtras);
                                  if (checked) {
                                    setActiveFeatureCarousel('fireplaces');
                                  } else {
                                    setActiveFeatureCarousel(null);
                                  }
                                }}
                              />
                              {selectedExtras.fireplaces && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newCarousel = activeFeatureCarousel === 'fireplaces' ? null : 'fireplaces';
                                    setActiveFeatureCarousel(newCarousel);
                                  }}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'fireplaces' ? 'rotate-180' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </div>
                          {selectedExtras.fireplaces && activeFeatureCarousel === 'fireplaces' && (
                            <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.fireplaces.map((option) => (
                                    <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && (
                                          <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>
                                        )}
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>
                          )}
                        </div>

                        {/* Fire Pit Kits */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Fire Pit Kits</Label>
                              <p className="text-xs text-muted-foreground">Cozy gathering spaces</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedExtras.firePitKits}
                                onCheckedChange={(checked) => {
                                  const newExtras = { ...selectedExtras, firePitKits: !!checked };
                                  setSelectedExtras(newExtras);
                                  if (checked) {
                                    setActiveFeatureCarousel('firePitKits');
                                  } else {
                                    setActiveFeatureCarousel(null);
                                  }
                                }}
                              />
                              {selectedExtras.firePitKits && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newCarousel = activeFeatureCarousel === 'firePitKits' ? null : 'firePitKits';
                                    setActiveFeatureCarousel(newCarousel);
                                  }}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'firePitKits' ? 'rotate-180' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </div>
                          {selectedExtras.firePitKits && activeFeatureCarousel === 'firePitKits' && (
                            <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.firePitKits.map((option) => (
                                    <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && (
                                          <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>
                                        )}
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>
                          )}
                        </div>

                        {/* Pergolas & Panels */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium">Pergolas & Panels</Label>
                              <p className="text-xs text-muted-foreground">Shade and privacy solutions</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedExtras.pergolas}
                                onCheckedChange={(checked) => {
                                  const newExtras = { ...selectedExtras, pergolas: !!checked };
                                  setSelectedExtras(newExtras);
                                  if (checked) {
                                    setActiveFeatureCarousel('pergolas');
                                  } else {
                                    setActiveFeatureCarousel(null);
                                  }
                                }}
                              />
                              {selectedExtras.pergolas && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newCarousel = activeFeatureCarousel === 'pergolas' ? null : 'pergolas';
                                    setActiveFeatureCarousel(newCarousel);
                                  }}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'pergolas' ? 'rotate-180' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </div>
                          {selectedExtras.pergolas && activeFeatureCarousel === 'pergolas' && (
                            <div className="h-24">
                              <Carousel className="w-full h-full">
                                <CarouselContent className="-ml-1 h-full">
                                  {belgardStudioOptions.pergolas.map((option) => (
                                    <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                      <div className="cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full border-border hover:border-primary/50">
                                        <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                                        <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          ${option.price.toLocaleString()}
                                        </p>
                                        {option.category === 'sample' && (
                                          <Badge variant="secondary" className="text-xs mt-1">Sample</Badge>
                                        )}
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // Regular pool/spa features
                      <>
                    {/* Pool Finish */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Pool Finish</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newCarousel = activeFeatureCarousel === 'finish' ? null : 'finish';
                            setActiveFeatureCarousel(newCarousel);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {selectedExtras.finish}
                          <ChevronDown className={`h-3 w-3 ml-2 transition-transform ${activeFeatureCarousel === 'finish' ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                      {activeFeatureCarousel === 'finish' && (
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-1">
                            {finishOptions.map((finish) => (
                              <CarouselItem key={finish.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                <div
                                  className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                    selectedExtras.finish === finish.name
                                      ? 'border-primary shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => {
                                    setSelectedExtras({ ...selectedExtras, finish: finish.name });
                                    setActiveFeatureCarousel(null);
                                  }}
                                >
                                  <img src={finish.image} alt={finish.name} className="w-full h-16 object-cover rounded" />
                                  <p className="text-xs font-medium mt-1 truncate">{finish.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {finish.price > 0 ? `+$${finish.price.toLocaleString()}` : 'Included'}
                                  </p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      )}
                    </div>

                    {/* Heater */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Pool Heater</Label>
                          <p className="text-xs text-muted-foreground">Extend your swimming season</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.heater}
                            onCheckedChange={(checked) => {
                              const newExtras = { ...selectedExtras, heater: !!checked };
                              setSelectedExtras(newExtras);
                              if (checked) {
                                setActiveFeatureCarousel('heater');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                          {selectedExtras.heater && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCarousel = activeFeatureCarousel === 'heater' ? null : 'heater';
                                setActiveFeatureCarousel(newCarousel);
                              }}
                            >
                              <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'heater' ? 'rotate-180' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedExtras.heater && activeFeatureCarousel === 'heater' && (
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-1">
                            {poolHeaters.map((heater) => (
                              <CarouselItem key={heater.name} className="pl-1 basis-1/2">
                                <div
                                  className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                    selectedExtras.heaterModel === heater.name
                                      ? 'border-primary shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => {
                                    setSelectedExtras({ ...selectedExtras, heaterModel: heater.name });
                                    setActiveFeatureCarousel(null);
                                  }}
                                >
                                  <img src={heater.image} alt={heater.name} className="w-full h-16 object-cover rounded" />
                                  <p className="text-xs font-medium mt-1 truncate">{heater.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    ${heater.price.toLocaleString()}
                                  </p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      )}
                    </div>

                    {/* Cover */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Safety Cover</Label>
                          <p className="text-xs text-muted-foreground">Protect your investment</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.cover}
                            onCheckedChange={(checked) => {
                              const newExtras = { ...selectedExtras, cover: !!checked };
                              setSelectedExtras(newExtras);
                              if (checked) {
                                setActiveFeatureCarousel('cover');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                          {selectedExtras.cover && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCarousel = activeFeatureCarousel === 'cover' ? null : 'cover';
                                setActiveFeatureCarousel(newCarousel);
                              }}
                            >
                              <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'cover' ? 'rotate-180' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedExtras.cover && activeFeatureCarousel === 'cover' && (
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-1">
                            {coverOptions.filter(cover => cover.name !== 'NO COVER').map((cover) => (
                              <CarouselItem key={cover.name} className="pl-1 basis-1/2">
                                <div
                                  className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                    selectedExtras.coverOption === cover.name
                                      ? 'border-primary shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => {
                                    setSelectedExtras({ ...selectedExtras, coverOption: cover.name });
                                    setActiveFeatureCarousel(null);
                                  }}
                                >
                                  <img src={cover.image} alt={cover.name} className="w-full h-16 object-cover rounded" />
                                  <p className="text-xs font-medium mt-1 truncate">{cover.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    ${cover.price.toLocaleString()}
                                  </p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      )}
                    </div>

                    {/* Jets */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Spa Jets</Label>
                        <p className="text-xs text-muted-foreground">Therapeutic water features</p>
                      </div>
                      <Checkbox
                        checked={selectedExtras.jets}
                        onCheckedChange={(checked) => setSelectedExtras({ ...selectedExtras, jets: !!checked })}
                      />
                    </div>

                    {selectedExtras.jets && (
                      <div>
                        <Label className="text-sm font-medium">Number of Jets</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedExtras({ 
                              ...selectedExtras, 
                              jetQuantity: Math.max(2, selectedExtras.jetQuantity - 1) 
                            })}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 min-w-[2rem] text-center">{selectedExtras.jetQuantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedExtras({ 
                              ...selectedExtras, 
                              jetQuantity: Math.min(12, selectedExtras.jetQuantity + 1) 
                            })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tiles */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Premium Tiles</Label>
                          <p className="text-xs text-muted-foreground">Upgrade waterline aesthetics</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.tiles}
                            onCheckedChange={(checked) => {
                              const newExtras = { ...selectedExtras, tiles: !!checked };
                              setSelectedExtras(newExtras);
                              if (checked) {
                                setActiveFeatureCarousel('tiles');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                          {selectedExtras.tiles && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCarousel = activeFeatureCarousel === 'tiles' ? null : 'tiles';
                                setActiveFeatureCarousel(newCarousel);
                              }}
                            >
                              <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'tiles' ? 'rotate-180' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedExtras.tiles && activeFeatureCarousel === 'tiles' && (
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-1">
                            {tileOptions.filter(tile => tile.name !== 'Standard Waterline').map((tile) => (
                              <CarouselItem key={tile.name} className="pl-1 basis-1/3">
                                <div
                                  className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                    selectedExtras.tileOption === tile.name
                                      ? 'border-primary shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => {
                                    setSelectedExtras({ ...selectedExtras, tileOption: tile.name });
                                    setActiveFeatureCarousel(null);
                                  }}
                                >
                                  <img src={tile.image} alt={tile.name} className="w-full h-16 object-cover rounded" />
                                  <p className="text-xs font-medium mt-1 truncate">{tile.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {tile.price > 0 ? `$${tile.price.toLocaleString()}` : 'Included'}
                                  </p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      )}
                    </div>

                    {/* Pavers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Deck Pavers</Label>
                          <p className="text-xs text-muted-foreground">Beautiful hardscape surfaces</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.pavers}
                            onCheckedChange={(checked) => {
                              const newExtras = { ...selectedExtras, pavers: !!checked };
                              setSelectedExtras(newExtras);
                              if (checked) {
                                setActiveFeatureCarousel('pavers');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                          {selectedExtras.pavers && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCarousel = activeFeatureCarousel === 'pavers' ? null : 'pavers';
                                setActiveFeatureCarousel(newCarousel);
                              }}
                            >
                              <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'pavers' ? 'rotate-180' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedExtras.pavers && activeFeatureCarousel === 'pavers' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                            <h4 className="font-semibold text-sm">Transform Your Pool Area</h4>
                            <p className="text-xs text-muted-foreground">
                              Create beautiful hardscape surfaces around your pool with our premium paver collections. 
                              Choose from Appian, Catalina, or Catalina Grana collections - all featuring multiple styles 
                              and finishes for the perfect pool deck, patio, or walkway.
                            </p>
                            <div className="space-y-2">
                              <div className="text-xs font-medium">Quick Features:</div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Multiple premium collections available</li>
                                <li>• Slip-resistant surface texture</li>
                                <li>• Professional installation included</li>
                                <li>• Uniform pricing: $15/sq ft all styles</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Surface Area (sq ft)</Label>
                            <Input
                              type="number"
                              value={paverSurfaceArea}
                              onChange={(e) => setPaverSurfaceArea(e.target.value)}
                              placeholder="Enter area in square feet"
                              className="mt-1"
                            />
                            {paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) && (
                              <div className="text-xs text-green-600 font-medium mt-1">
                                Estimated Cost: ${(parseFloat(paverSurfaceArea) * 15).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Paver Collection</Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between text-sm">
                                  {paverCategories.find(cat => cat.value === paverCategory)?.label}
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-full bg-background border border-border">
                                {paverCategories.map((category) => (
                                  <div
                                    key={category.value}
                                    className="px-2 py-1 text-sm cursor-pointer hover:bg-muted"
                                    onClick={() => setPaverCategory(category.value)}
                                  >
                                    {category.label}
                                  </div>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                              {paverOptions
                                .filter(paver => paver.name !== 'No Pavers' && (paverCategory === 'all' || paver.collection === paverCategory))
                                .map((paver) => (
                                  <CarouselItem key={paver.name} className="pl-1 basis-1/3">
                                    <div
                                      className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                        selectedExtras.paverOption === paver.name
                                          ? 'border-primary shadow-md'
                                          : 'border-border hover:border-primary/50'
                                      }`}
                                      onClick={() => {
                                        setSelectedExtras({ ...selectedExtras, paverOption: paver.name });
                                        setActiveFeatureCarousel(null);
                                      }}
                                    >
                                      <img src={paver.image} alt={paver.name} className="w-full h-16 object-cover rounded" />
                                      <p className="text-xs font-medium mt-1 truncate">{paver.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        $15/sq ft
                                      </p>
                                    </div>
                                  </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        </div>
                      )}
                    </div>

                    {/* Liners */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Premium Liners</Label>
                          <p className="text-xs text-muted-foreground">Upgrade pool aesthetics</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.liner}
                            onCheckedChange={(checked) => {
                              const newExtras = { ...selectedExtras, liner: !!checked };
                              setSelectedExtras(newExtras);
                              if (checked) {
                                setActiveFeatureCarousel('liners');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                          {selectedExtras.liner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCarousel = activeFeatureCarousel === 'liners' ? null : 'liners';
                                setActiveFeatureCarousel(newCarousel);
                              }}
                            >
                              <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === 'liners' ? 'rotate-180' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedExtras.liner && activeFeatureCarousel === 'liners' && (
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-1">
                            {linerOptions.filter(liner => liner.name !== 'Standard Blue').map((liner) => (
                              <CarouselItem key={liner.name} className="pl-1 basis-1/3">
                                <div
                                  className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                    selectedExtras.linerOption === liner.name
                                      ? 'border-primary shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => {
                                    setSelectedExtras({ ...selectedExtras, linerOption: liner.name });
                                    setActiveFeatureCarousel(null);
                                  }}
                                >
                                  <img src={liner.image} alt={liner.name} className="w-full h-16 object-cover rounded" />
                                  <p className="text-xs font-medium mt-1 truncate">{liner.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {liner.price > 0 ? `$${liner.price.toLocaleString()}` : 'Premium'}
                                  </p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      )}
                    </div>

                    {/* Screen Enclosure */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Screen Enclosure</Label>
                        <p className="text-xs text-muted-foreground">Year-round protection</p>
                      </div>
                      <Checkbox
                        checked={selectedExtras.screenEnclosure}
                        onCheckedChange={(checked) => setSelectedExtras({ ...selectedExtras, screenEnclosure: !!checked })}
                      />
                    </div>

                    {selectedExtras.screenEnclosure && (
                      <div>
                        <Label className="text-sm font-medium">Enclosure Area (sq ft)</Label>
                        <Input
                          type="number"
                          value={selectedExtras.screenEnclosureArea}
                          onChange={(e) => setSelectedExtras({ 
                            ...selectedExtras, 
                            screenEnclosureArea: parseInt(e.target.value) || 0 
                          })}
                          placeholder="Enter area in square feet"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {/* Concrete Construction */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Concrete Construction</Label>
                        <p className="text-xs text-muted-foreground">Premium installation method</p>
                      </div>
                      <Checkbox
                        checked={selectedExtras.concreteConstruction}
                        onCheckedChange={(checked) => setSelectedExtras({ ...selectedExtras, concreteConstruction: !!checked })}
                      />
                    </div>

                     <Separator />

                     {/* Action Buttons */}
                     <div className="flex gap-3">
                       <Button onClick={handleQuoteRequest} variant="outline" className="flex-1">
                         <Download className="h-4 w-4 mr-2" />
                         Generate Quote
                       </Button>
                       <Button onClick={handleAddToCart} variant="outline" className="flex-1">
                         <ShoppingCart className="h-4 w-4 mr-2" />
                         Add to Cart
                       </Button>
                       <StripeCheckoutButton 
                         productId={`${selectedProduct.type}_${selectedProduct.model?.replace(/\s+/g, '_') || selectedProduct.name?.replace(/\s+/g, '_')}`} 
                         productName={selectedProduct.model || selectedProduct.name || 'Product'} 
                         price={calculateTotalPrice()} 
                         variant="default" 
                         className="flex-1"
                       />
                     </div>
                      </>
                    )}
                   </CardContent>
                 </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a product to start configuring</p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Price Summary */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Total Price</CardTitle>
                  {getSelectedExtrasCount() > 0 && (
                    <DropdownMenu open={showExtrasDropdown} onOpenChange={setShowExtrasDropdown}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Badge variant="secondary" className="mr-2">
                            {getSelectedExtrasCount()}
                          </Badge>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium mb-2">Selected Features:</p>
                          {selectedExtras.finish !== 'Aquamarine' && (
                            <div className="flex items-center justify-between text-xs">
                              <span>{selectedExtras.finish} Finish</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${finishOptions.find(f => f.name === selectedExtras.finish)?.price || 0}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('finish')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedExtras.heater && (
                            <div className="flex items-center justify-between text-xs">
                              <span>Pool Heater</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${poolHeaters.find(h => h.name === selectedExtras.heaterModel)?.price || 0}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('heater')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedExtras.cover && selectedExtras.coverOption !== 'NO COVER' && (
                            <div className="flex items-center justify-between text-xs">
                              <span>Safety Cover</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${coverOptions.find(c => c.name === selectedExtras.coverOption)?.price || 0}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('cover')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedExtras.jets && (
                            <div className="flex items-center justify-between text-xs">
                              <span>Spa Jets ({selectedExtras.jetQuantity})</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${(getExtraPrice('jets') * selectedExtras.jetQuantity).toLocaleString()}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('jets')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedExtras.tiles && (
                            <div className="flex items-center justify-between text-xs">
                              <span>Premium Tiles</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${tileOptions.find(t => t.name === selectedExtras.tileOption)?.price || 0}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('tiles')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedExtras.linerOption !== 'Standard Blue' && (
                            <div className="flex items-center justify-between text-xs">
                              <span>Premium Liner</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${linerOptions.find(l => l.name === selectedExtras.linerOption)?.price || 4500}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('liner')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedExtras.pavers && selectedExtras.paverOption !== 'No Pavers' && (
                            <div className="flex items-center justify-between text-xs">
                              <span>Deck Pavers</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) ? (parseFloat(paverSurfaceArea) * 15).toLocaleString() : '0'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('pavers')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedExtras.screenEnclosure && (
                            <div className="flex items-center justify-between text-xs">
                              <span>Screen Enclosure</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  +${selectedExtras.screenEnclosureArea > 0 ? 
                                    (selectedExtras.screenEnclosureArea * 
                                    (selectedExtras.screenEnclosureQuality === 'premium' ? 28 : 
                                     selectedExtras.screenEnclosureQuality === 'deluxe' ? 22 : 15)).toLocaleString() : '0'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('screen')}
                                  className="h-6 w-6 p-0"
                                >
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtra('concrete')}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProduct ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Price</span>
                          <span>${getProductPrice(selectedProduct).toLocaleString()}</span>
                        </div>
                        <Separator />
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          ${calculateTotalPrice().toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total Configuration Price
                        </p>
                      </div>

                      {/* Financing Options */}
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs font-medium mb-2">Financing Options:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-background rounded">
                            <div className="font-semibold">36 months</div>
                            <div className="text-primary">${(calculateTotalPrice() / 36).toLocaleString()}/mo</div>
                          </div>
                          <div className="text-center p-2 bg-background rounded">
                            <div className="font-semibold">72 months</div>
                            <div className="text-primary">${(calculateTotalPrice() / 72).toLocaleString()}/mo</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <DollarSign className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Select a product to see pricing</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      <SurveyQuoteTool
        pool={selectedProduct ? {
          model: selectedProduct.model || selectedProduct.name || 'Product',
          price: selectedProduct.price,
          category: selectedProduct.category as any,
          image: selectedProduct.image,
          dimensions: selectedProduct.dimensions,
          depth: selectedProduct.depth,
          warrantyYears: selectedProduct.warrantyYears
        } : null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        extras={{
          ...selectedExtras,
          extrasBreakdown: selectedExtras.extrasBreakdown || [],
          extrasTotal: selectedExtras.extrasTotal || 0,
          deliveryTime: selectedExtras.concreteConstruction ? '8-12 weeks+' : '6 weeks'
        }}
      />
    </div>
  );
};

export default WonderlandsStudio;