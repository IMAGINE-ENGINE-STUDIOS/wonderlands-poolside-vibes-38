import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award, Palette, Camera, Layers, Plus, Minus, Download, Printer, ShoppingCart, Search, ChevronDown, Settings, Armchair, Flame, ChefHat, Utensils, Home, Music, Package, Cpu } from "lucide-react";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { DragDropEditor } from "@/components/DragDropEditor";
import { useShoppingCart } from "@/components/ShoppingCart";
import { spas, pools } from "@/components/PoolCatalog";
import { tanningLedges, poolLiners, poolTiles } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { poolFinishes as poolFinishesData } from '@/components/PoolFinishesSection';
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

// Helper function to get discounted price for deluxe pools
const getPoolPrice = (pool: Pool) => {
  if (pool.category === 'premium') {
    return Math.round(pool.price * 0.70); // 30% discount
  }
  return pool.price;
};
interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact' | 'classic';
  image?: string;
  dimensions?: string;
  depth?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  saltSystem?: boolean;
  carbonFiber?: boolean;
}
interface PoolExtras {
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
  spa: boolean;
  spaModel: string;
  tanningLedge: boolean;
  tanningLedgeModel: string;
  heaterModel: string;
  pavers: boolean;
  paverOption: string;
  copingPaverOption: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: string;
  concreteConstruction: boolean;
}

// Pool heater options
const poolHeaters = [{
  name: 'Heat Pump - Eco Series',
  price: 4500,
  image: azureBlueFinish,
  description: 'Energy-efficient heat pump, ideal for mild climates'
}, {
  name: 'Heat Pump - Pro Series',
  price: 5500,
  image: oceanBlueFinish,
  description: 'Professional grade heat pump with advanced controls'
}, {
  name: 'Gas Heater - Standard',
  price: 3200,
  image: sapphireBlueFinish,
  description: 'Traditional gas heater for quick heating'
}, {
  name: 'Gas Heater - High Efficiency',
  price: 4200,
  image: nightSkyFinish,
  description: 'High-efficiency gas heater with digital controls'
}, {
  name: 'Solar Heater - Basic',
  price: 2800,
  image: lagoonBlueFinish,
  description: 'Eco-friendly solar heating system'
}, {
  name: 'Solar Heater - Premium',
  price: 3800,
  image: coastalBronzeFinish,
  description: 'Advanced solar system with backup heating'
}];

// Convert pool finishes data to finish options format
const finishOptions = poolFinishesData.map(finish => ({
  name: finish.name,
  color: '#4169E1',
  image: finish.image,
  price: finish.price,
  collection: finish.collection,
  category: finish.category,
  description: finish.description
}));

// Convert pool liners to liner options format
const linerOptions = [{
  name: 'Standard Blue',
  color: '#4169E1',
  price: 0,
  image: azureBlueFinish,
  type: 'Standard',
  description: undefined
}, ...poolLiners.map(liner => ({
  name: liner.name,
  color: '#4169E1',
  price: liner.price,
  image: liner.image,
  type: liner.type,
  description: liner.description
}))];

// Cover options with color and engine variants
const coverOptions = [{
  name: 'Eclipse Automatic Cover',
  color: '#2F4F4F',
  price: 16000,
  image: nightSkyFinish,
  category: 'cover',
  description: 'Premium automatic pool cover with solar heating',
  colors: ['Charcoal', 'Navy Blue', 'Forest Green', 'Brown'],
  engines: ['Standard Motor', 'Quiet Motor', 'Smart Motor']
}, {
  name: 'CS3000 Safety Cover',
  color: '#2F4F4F',
  price: 24000,
  image: shaleGrayFinish,
  category: 'cover',
  description: 'Heavy-duty safety cover with anchoring system',
  colors: ['Black', 'Green', 'Blue', 'Tan'],
  engines: ['Manual', 'Semi-Auto', 'Full Auto']
}, {
  name: 'Infinity 4000 Smart Cover',
  color: '#2F4F4F',
  price: 32000,
  image: coastalBronzeFinish,
  category: 'cover',
  description: 'Smart automated cover with app control',
  colors: ['Slate Gray', 'Ocean Blue', 'Midnight Black'],
  engines: ['AI Smart Motor', 'Wi-Fi Motor', 'Premium Quiet Motor']
}, {
  name: 'Atom Loop-Loc Cover',
  color: '#2F4F4F',
  price: 19000,
  image: aquamarineFinish,
  category: 'cover',
  description: 'Mesh safety cover for all seasons',
  colors: ['Green', 'Blue', 'Black', 'Tan', 'Gray'],
  engines: ['Spring System', 'Lever System', 'Ratchet System']
}];

// Convert pool tiles to tile options format
const tileOptions = [{
  name: 'Standard Waterline',
  color: '#4682B4',
  price: 0,
  image: azureBlueFinish,
  description: undefined
}, ...poolTiles.map(tile => ({
  name: tile.name,
  color: '#4682B4',
  price: tile.price,
  image: tile.image,
  description: tile.description
}))];

// Paver options - using exact same collections as PaversSection
const paverOptions = [{
  name: 'No Pavers',
  color: '#808080',
  price: 0,
  image: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png',
  description: 'No additional pavers'
}, ...paverTypes.map(paver => ({
  name: paver.name,
  color: '#D3D3D3',
  price: 0, // Base price is 0, actual cost calculated by surface area × $15/sq ft
  image: paver.image,
  description: paver.description,
  collection: paver.id.includes('appian') ? 'appian' : paver.id.includes('catalina') ? 'catalina' : 'standard'
}))];

// Coping paver options - simplified for now, can be expanded later  
const copingPaverOptions = [{
  name: 'No Coping',
  color: '#808080',
  price: 0,
  image: '/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png',
  description: 'No additional coping'
}, {
  name: 'Bullnose Coping',
  color: '#FFFFFF',
  price: 18,
  image: '/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png',
  description: 'Rounded edge bullnose coping for pool edges'
}, {
  name: 'Cantilever Coping',
  color: '#A9A9A9', 
  price: 22,
  image: '/lovable-uploads/d6ea993e-6b84-4fd9-b0f5-0ae906e45b0b.png',
  description: 'Modern cantilever edge design for contemporary pools'
}, {
  name: 'Natural Stone Coping',
  color: '#4682B4',
  price: 28,
  image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png', 
  description: 'Premium natural stone pool edge coping'
}, {
  name: 'Tile Coping',
  color: '#4169E1',
  price: 16,
  image: '/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png',
  description: 'Ceramic or porcelain tile coping for pool edges'
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
type ActivePanel = 'finishes' | 'liners' | 'pavers' | 'coping' | 'covers' | 'heaters' | 'spas' | 'tanning' | 'jets' | 'tiles' | 'engines' | 'furniture' | 'fireplace' | 'outdoor-kitchens' | 'bbq' | 'pergolas' | 'sound-system' | null;
interface MarketplaceProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
  brand?: string;
}
const PoolDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    addToCart
  } = useShoppingCart();
  const {
    toast
  } = useToast();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([]);
  const [searchResults, setSearchResults] = useState<MarketplaceProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<MarketplaceProduct[]>([]);
  const [paverArea, setPaverArea] = useState<number>(100); // square feet
  const [copingLength, setCopingLength] = useState<number>(50); // linear feet
  const [paverQuantity, setPaverQuantity] = useState<number>(50); // quantity of pavers
  const [copingQuantity, setCopingQuantity] = useState<number>(25); // quantity of coping pieces
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [coverColor, setCoverColor] = useState<string>('');
  const [coverEngine, setCoverEngine] = useState<string>('');
  const [editorActive, setEditorActive] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);
  const [paverSurfaceArea, setPaverSurfaceArea] = useState<string>('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<any>(null);

  // Remove config item function
  const removeConfigItem = (item: any) => {
    if (item.category === 'Pool Cover') setExtras(prev => ({
      ...prev,
      cover: false
    }));
    if (item.category === 'Pool Heater') setExtras(prev => ({
      ...prev,
      heater: false
    }));
    if (item.category === 'Spa') setExtras(prev => ({
      ...prev,
      spa: false
    }));
    if (item.category === 'Tanning Ledge') setExtras(prev => ({
      ...prev,
      tanningLedge: false
    }));
    if (item.category === 'Pool Tiles') setExtras(prev => ({
      ...prev,
      tiles: false
    }));
    if (item.category === 'Pool Jets') setExtras(prev => ({
      ...prev,
      jets: false
    }));
    if (item.category === 'Pool Liner') setExtras(prev => ({
      ...prev,
      linerOption: 'Standard Blue'
    }));
    if (item.category === 'Pavers') {
      setExtras(prev => ({
        ...prev,
        paverOption: 'No Pavers'
      }));
      setPaverSurfaceArea('');
    }
    if (item.category === 'Coping') setExtras(prev => ({
      ...prev,
      copingPaverOption: 'No Coping'
    }));
    if (item.category === 'Screen Enclosure') {
      setExtras(prev => ({
        ...prev,
        screenEnclosureArea: 0,
        screenEnclosureQuality: 'standard'
      }));
    }
    toast({
      title: "Item Removed",
      description: `${item.name} removed from configuration!`
    });
  };

  // Parse pool data from URL params or find from pools array
  const paramModel = searchParams.get('model');
  const foundPool = paramModel ? pools.find(p => p.model === paramModel || p.model.toLowerCase().replace(/\s+/g, '-') === paramModel) : null;
  
  const pool: Pool = foundPool || {
    model: searchParams.get('model') || 'Pool Model',
    price: parseInt(searchParams.get('price') || '0'),
    category: searchParams.get('category') as Pool['category'] || 'standard',
    image: searchParams.get('image') || undefined,
    dimensions: searchParams.get('dimensions') || undefined,
    depth: searchParams.get('depth') || undefined,
    installationTimeWeeks: searchParams.get('installationTimeWeeks') ? parseInt(searchParams.get('installationTimeWeeks')!) : undefined,
    warrantyYears: searchParams.get('warrantyYears') || undefined,
    saltSystem: searchParams.get('saltSystem') === 'true',
    carbonFiber: searchParams.get('carbonFiber') === 'true'
  };

  // Cache key for user selections
  const cacheKey = `pool_studio_${pool.model}_selections`;
  const [extras, setExtras] = useState<PoolExtras>({
    liner: true,
    heater: false,
    cover: false,
    jets: false,
    jetQuantity: 1,
    finish: 'Nantuke',
    linerOption: 'Classic Blue',
    coverOption: 'Eclipse Automatic Cover',
    tiles: false,
    tileOption: 'Classic Waterline',
    spa: false,
    spaModel: 'Mystic',
    tanningLedge: false,
    tanningLedgeModel: tanningLedges[0]?.name || 'Genesis',
    heaterModel: poolHeaters[0]?.name || 'Heat Pump - Eco Series',
    pavers: false,
    paverOption: 'No Pavers',
    copingPaverOption: 'No Coping',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: 'Standard',
    concreteConstruction: false
  });

  // Load cached selections and marketplace products on mount
  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setExtras(JSON.parse(cached));
      } catch (e) {
        console.error('Error loading cached selections:', e);
      }
    }

    // Load marketplace products
    loadMarketplaceProducts();
  }, [cacheKey]);
  const loadMarketplaceProducts = async () => {
    try {
      const {
        data: products,
        error
      } = await supabase.from('products').select('id, name, price, image_url, description, category, brand').eq('is_active', true).gt('stock_quantity', 0);
      if (error) throw error;
      setMarketplaceProducts(products || []);
    } catch (error) {
      console.error('Error loading marketplace products:', error);
    }
  };

  // Save selections to cache whenever extras change
  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(extras));
  }, [extras, cacheKey]);
  const calculateTotalPrice = () => {
    let total = pool.price;
    
    // Add concrete construction markup if selected
    if (extras.concreteConstruction) {
      total = total * 1.2;
    }

    // Add finish price if not default
    const selectedFinish = finishOptions.find(finish => finish.name === extras.finish);
    if (selectedFinish && selectedFinish.price) {
      total += selectedFinish.price;
    }

    // Add heater price if selected (dynamic price based on model)
    if (extras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }
    
    // Add spa jets if selected
    if (extras.jets) total += getExtraPrice('jets') * extras.jetQuantity;
    
    // Add liner price when liner is selected and not "Standard Blue"
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.linerOption !== 'Standard Blue' && linerOption.price > 0) {
      total += linerOption.price;
    }
    
    // Add tile price when tiles are selected
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles && tileOption.price > 0) total += tileOption.price;
    
    // Add cover price only when cover is enabled
    const coverOption = coverOptions.find(option => option.name === extras.coverOption);
    if (coverOption && extras.cover) total += coverOption.price;
    
    // Add paver surface area cost (using paverSurfaceArea string state)
    if (paverSurfaceArea && paverSurfaceArea.trim() !== '' && !isNaN(parseFloat(paverSurfaceArea))) {
      total += parseFloat(paverSurfaceArea) * 15; // $15 per sq ft
    }

    // Add spa price if selected
    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) total += selectedSpa.price;
    }
    
    // Add tanning ledge price if selected
    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) total += selectedLedge.price;
    }

    // Add screen enclosure price if area is provided and valid
    if (extras.screenEnclosureArea && extras.screenEnclosureArea > 0) {
      let pricePerSqFt = 15; // standard
      if (extras.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
      if (extras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
      total += extras.screenEnclosureArea * pricePerSqFt;
    }

    // Add selected marketplace products
    selectedProducts.forEach(product => {
      total += product.price || 0;
    });
    
    return total;
  };
  const getCurrentImage = () => {
    if (activePanel === 'finishes') {
      const selectedFinish = finishOptions.find(f => f.name === extras.finish);
      return selectedFinish?.image || pool.image;
    }
    if (activePanel === 'liners') {
      const selectedLiner = linerOptions.find(l => l.name === extras.linerOption);
      return selectedLiner?.image || pool.image;
    }
    if (activePanel === 'pavers') {
      const selectedPaver = paverOptions.find(p => p.name === extras.paverOption);
      return selectedPaver?.image || pool.image;
    }
    if (activePanel === 'coping') {
      const selectedCoping = copingPaverOptions.find(c => c.name === extras.copingPaverOption);
      return selectedCoping?.image || pool.image;
    }
    if (activePanel === 'covers' && extras.cover) {
      const selectedCover = coverOptions.find(c => c.name === extras.coverOption);
      return selectedCover?.image || pool.image;
    }
    if (activePanel === 'heaters' && extras.heater) {
      const selectedHeater = poolHeaters.find(h => h.name === extras.heaterModel);
      return selectedHeater?.image || pool.image;
    }
    if (activePanel === 'spas' && extras.spa) {
      const selectedSpa = spas.find((s: any) => s.model === extras.spaModel);
      return selectedSpa?.image || pool.image;
    }
    if (activePanel === 'tanning' && extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel);
      return selectedLedge?.image || pool.image;
    }
    return pool.image;
  };
  const getConfigurationItems = () => {
    const items: {
      name: string;
      price: number;
      image?: string;
      category?: string;
    }[] = [];
    
    // Heater
    if (extras.heater) {
      const selectedHeater = poolHeaters.find(h => h.name === extras.heaterModel);
      if (selectedHeater) items.push({
        name: selectedHeater.name,
        price: selectedHeater.price,
        image: selectedHeater.image,
        category: 'Pool Heater'
      });
    }
    
    // Jets
    if (extras.jets) {
      items.push({
        name: `Spa Jets (${extras.jetQuantity}x)`,
        price: getExtraPrice('jets') * extras.jetQuantity,
        image: pool.image,
        category: 'Pool Jets'
      });
    }
    
    // Liner
    const liner = linerOptions.find(l => l.name === extras.linerOption);
    if (liner && extras.linerOption !== 'Standard Blue' && liner.price > 0) {
      items.push({
        name: liner.name,
        price: liner.price,
        image: liner.image,
        category: 'Pool Liner'
      });
    }
    
    // Tiles
    if (extras.tiles) {
      const tile = tileOptions.find(t => t.name === extras.tileOption);
      if (tile && tile.price > 0) items.push({
        name: tile.name,
        price: tile.price,
        image: tile.image,
        category: 'Pool Tiles'
      });
    }
    
    // Cover
    if (extras.cover) {
      const cover = coverOptions.find(c => c.name === extras.coverOption);
      if (cover) items.push({
        name: cover.name,
        price: cover.price,
        image: cover.image,
        category: 'Pool Cover'
      });
    }
    
    // Pavers (using paverSurfaceArea instead of paverArea)
    if (paverSurfaceArea && paverSurfaceArea.trim() !== '' && !isNaN(parseFloat(paverSurfaceArea))) {
      const paver = paverOptions.find(p => p.name === extras.paverOption);
      const paverSqFt = parseFloat(paverSurfaceArea);
      if (paver && paverSqFt > 0) {
        items.push({
          name: `${paver.name} (${paverSqFt} sq ft)`,
          price: 15 * paverSqFt,
          image: paver.image,
          category: 'Pavers'
        });
      }
    }
    
    // Coping
    const coping = copingPaverOptions.find(c => c.name === extras.copingPaverOption);
    if (coping && coping.price > 0) items.push({
      name: `${coping.name} (${copingLength} linear ft)`,
      price: coping.price * copingLength,
      image: coping.image,
      category: 'Coping'
    });
    
    // Screen Enclosure
    if (extras.screenEnclosureArea && extras.screenEnclosureArea > 0) {
      let pricePerSqFt = 15; // standard
      if (extras.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
      if (extras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
      
      const qualityName = extras.screenEnclosureQuality === 'standard' ? 'Wonder Cage' : 
                          extras.screenEnclosureQuality === 'deluxe' ? 'Deluxe' : '2 Stories';
      
      items.push({
        name: `Screen Enclosure - ${qualityName} (${extras.screenEnclosureArea} sq ft)`,
        price: extras.screenEnclosureArea * pricePerSqFt,
        image: pool.image,
        category: 'Screen Enclosure'
      });
    }
    
    // Spa
    if (extras.spa) {
      const spa = spas.find((s: any) => s.model === extras.spaModel);
      if (spa) items.push({
        name: spa.model,
        price: spa.price,
        image: spa.image,
        category: 'Spa'
      });
    }
    
    // Tanning Ledge
    if (extras.tanningLedge) {
      const ledge = tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel);
      if (ledge) items.push({
        name: ledge.name,
        price: ledge.price,
        image: ledge.image,
        category: 'Tanning Ledge'
      });
    }
    
    // Marketplace products
    selectedProducts.forEach(product => {
      items.push({
        name: product.name,
        price: product.price || 0,
        image: product.image_url,
        category: product.category
      });
    });
    
    return items;
  };
  const handleAddToCart = () => {
    const selectedExtras = [];
    if (extras.heater) {
      const heater = poolHeaters.find(h => h.name === extras.heaterModel);
      if (heater) selectedExtras.push({
        name: heater.name,
        price: heater.price
      });
    }
    if (extras.jets) {
      selectedExtras.push({
        name: `Spa Jets (${extras.jetQuantity}x)`,
        price: getExtraPrice('jets') * extras.jetQuantity
      });
    }
    if (extras.cover) {
      const cover = coverOptions.find(c => c.name === extras.coverOption);
      if (cover) selectedExtras.push({
        name: cover.name,
        price: cover.price
      });
    }
    if (extras.spa) {
      const spa = spas.find((s: any) => s.model === extras.spaModel);
      if (spa) selectedExtras.push({
        name: spa.model,
        price: spa.price
      });
    }
    if (extras.tanningLedge) {
      const ledge = tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel);
      if (ledge) selectedExtras.push({
        name: ledge.name,
        price: ledge.price
      });
    }

    // Add mandatory selections
    const liner = linerOptions.find(l => l.name === extras.linerOption);
    if (liner && liner.price > 0) selectedExtras.push({
      name: liner.name,
      price: liner.price
    });
    const paver = paverOptions.find(p => p.name === extras.paverOption);
    if (paver) {
      const poolDimensions = pool.dimensions?.split('x').map(d => parseInt(d.trim().replace(/['"]/g, ''))) || [16, 32];
      const poolWidth = poolDimensions[0];
      const poolLength = poolDimensions[1];
      const paverAreaWithBuffer = (poolWidth + 6) * (poolLength + 6);
      const totalPaverArea = paverAreaWithBuffer + paverArea;
      selectedExtras.push({
        name: `${paver.name} (${totalPaverArea} sq ft incl. installation)`,
        price: 15 * totalPaverArea
      });
    }
    const coping = copingPaverOptions.find(c => c.name === extras.copingPaverOption);
    if (coping && coping.price > 0) selectedExtras.push({
      name: `${coping.name} (${copingLength} linear ft)`,
      price: coping.price * copingLength
    });
    if (extras.tiles) {
      const tile = tileOptions.find(t => t.name === extras.tileOption);
      if (tile && tile.price > 0) selectedExtras.push({
        name: tile.name,
        price: tile.price
      });
    }
    addToCart({
      id: `${pool.model}_${Date.now()}`,
      name: pool.model,
      price: pool.price,
      category: pool.category,
      image: pool.image,
      extras: selectedExtras
    });
  };
  const generateQuote = () => {
    const quoteData = {
      pool,
      extras,
      totalPrice: calculateTotalPrice(),
      timestamp: new Date().toISOString(),
      quoteId: `QUOTE-${Date.now()}`
    };

    // Save quote to localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('pool_quotes') || '[]');
    savedQuotes.push(quoteData);
    localStorage.setItem('pool_quotes', JSON.stringify(savedQuotes));

    // Open printable quote in new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintableQuote(quoteData));
      printWindow.document.close();
    }
    toast({
      title: "Quote Generated",
      description: "Your quote has been generated and saved!"
    });
  };
  const generatePrintableQuote = (quoteData: any) => {
    const {
      pool,
      extras,
      totalPrice,
      quoteId,
      timestamp
    } = quoteData;

    // Get selected items with images
    const selectedItems = [];
    if (extras.liner && extras.linerOption !== 'Standard Blue') {
      const liner = linerOptions.find(l => l.name === extras.linerOption);
      if (liner) selectedItems.push({
        ...liner,
        category: 'Liner'
      });
    }
    if (extras.paverOption !== 'Standard Concrete') {
      const paver = paverOptions.find(p => p.name === extras.paverOption);
      if (paver) selectedItems.push({
        ...paver,
        category: 'Pavers'
      });
    }
    if (extras.cover) {
      const cover = coverOptions.find(c => c.name === extras.coverOption);
      if (cover) selectedItems.push({
        ...cover,
        category: 'Cover'
      });
    }
    if (extras.heater) {
      const heater = poolHeaters.find(h => h.name === extras.heaterModel);
      if (heater) selectedItems.push({
        ...heater,
        category: 'Heater'
      });
    }
    if (extras.spa) {
      const spa = spas.find((s: any) => s.model === extras.spaModel);
      if (spa) selectedItems.push({
        ...spa,
        name: spa.model,
        category: 'Spa'
      });
    }

    // Add selected marketplace products
    selectedProducts.forEach(product => {
      selectedItems.push({
        name: product.name,
        price: product.price,
        image: product.image_url,
        description: product.description,
        category: product.category || 'Product'
      });
    });
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pool Configuration Quote - ${quoteId}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; line-height: 1.6; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .quote-container { background: white; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.15); overflow: hidden; max-width: 1000px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 50px 40px; text-align: center; position: relative; }
            .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('/lovable-uploads/96a7bfbb-d930-451c-a0cd-1d8297bb7512.png') center/cover; opacity: 0.1; }
            .header-content { position: relative; z-index: 2; }
            .logo { font-family: 'Poppins', sans-serif; font-size: 48px; font-weight: 800; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: -1px; }
            .header-title { font-family: 'Poppins', sans-serif; font-size: 42px; font-weight: 700; margin: 20px 0 15px 0; letter-spacing: -0.5px; }
            .quote-id { color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0; font-weight: 500; }
            .content { padding: 50px; }
            .pool-details { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; margin: 0 -50px 40px -50px; border-radius: 0; }
            .pool-details h2 { font-family: 'Poppins', sans-serif; margin: 0 0 20px 0; font-size: 44px; font-weight: 800; letter-spacing: -0.5px; }
            .pool-specs { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 25px; }
            .spec-item { background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px); }
            .spec-label { font-weight: 600; font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
            .spec-value { font-size: 18px; font-weight: 700; }
            .pricing-section { background: #f8fafc; padding: 40px; margin: 0 -50px; border-radius: 0; }
            .pricing-title { font-family: 'Poppins', sans-serif; font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 30px; text-align: center; letter-spacing: -0.5px; }
            .pricing-breakdown { display: grid; gap: 20px; margin-bottom: 30px; }
            .pricing-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .pricing-item-main { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; }
            .item-name { font-weight: 600; font-size: 16px; }
            .item-category { font-size: 12px; color: #64748b; margin-top: 2px; }
            .item-price { font-weight: 700; font-size: 18px; color: #0f172a; }
            .item-price-main { color: white; }
            .extras-list { margin: 40px 0; }
            .extras-list h3 { font-family: 'Playfair Display', serif; color: #1e293b; font-size: 28px; margin-bottom: 25px; text-align: center; }
            .extra-item { padding: 25px 0; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
            .item-info { display: flex; align-items: center; gap: 25px; flex: 1; }
            .item-image { width: 100px; height: 100px; object-fit: cover; border-radius: 15px; border: 3px solid #f1f5f9; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
            .item-details h4 { margin: 0 0 8px 0; font-size: 20px; color: #1e293b; font-weight: 600; }
            .item-details p { margin: 0; font-size: 15px; color: #64748b; line-height: 1.5; }
            .item-details .features { font-size: 13px; color: #4facfe; margin-top: 8px; font-weight: 500; }
            .item-price-large { font-weight: 700; font-size: 22px; color: #f5576c; background: rgba(245,87,108,0.1); padding: 12px 20px; border-radius: 30px; }
            .total-section { margin-top: 50px; }
            .total { font-family: 'Poppins', sans-serif; font-size: 56px; font-weight: 900; text-align: center; padding: 40px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 20px; margin: 0 -20px; letter-spacing: -1px; }
            .total-subtitle { font-family: 'Inter', sans-serif; font-size: 18px; margin-top: 15px; opacity: 0.95; font-weight: 400; }
            .investment-breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
            .breakdown-item { text-align: center; padding: 20px; background: rgba(255,255,255,0.15); border-radius: 15px; }
            .breakdown-label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
            .breakdown-value { font-size: 24px; font-weight: 700; }
            .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 15px; background: #f8fafc; padding: 40px; margin: 50px -50px -50px -50px; border-top: 1px solid #e2e8f0; }
            .footer-title { font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
            .footer p { margin: 10px 0; }
            .footer-highlight { color: #4facfe; font-weight: 600; font-size: 16px; margin-top: 20px; }
            .image-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 25px; margin: 40px 0; }
            .gallery-item { text-align: center; }
            .gallery-image { width: 100%; height: 180px; object-fit: cover; border-radius: 15px; border: 3px solid #f1f5f9; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
            .gallery-caption { font-size: 13px; margin-top: 12px; color: #64748b; font-weight: 500; }
            @media print { 
              body { background: white; } 
              .quote-container { box-shadow: none; }
              .header, .pool-details, .total { background: #4facfe !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
              .pricing-section { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="quote-container">
            <div class="header">
              <div class="header-content">
                <div class="logo">🏊‍♂️ Wonderlands Pools</div>
                <h1 class="header-title">Premium Pool Configuration</h1>
                <div style="background: rgba(255,255,255,0.2); padding: 15px 30px; border-radius: 50px; display: inline-block; margin-top: 15px;">
                  <p class="quote-id">Quote ID: ${quoteId}</p>
                  <p class="quote-id">Generated: ${new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
                </div>
              </div>
            </div>

            <div class="content">
              <div class="pool-details">
                <h2>${pool.model}</h2>
                <div class="pool-specs">
                  <div class="spec-item">
                    <div class="spec-label">Category</div>
                    <div class="spec-value">${pool.category.charAt(0).toUpperCase() + pool.category.slice(1)}</div>
                  </div>
                  <div class="spec-item">
                    <div class="spec-label">Base Investment</div>
                    <div class="spec-value">$${getPoolPrice(pool).toLocaleString()}</div>
                  </div>
                  ${pool.dimensions ? `
                    <div class="spec-item">
                      <div class="spec-label">Dimensions</div>
                      <div class="spec-value">${pool.dimensions}</div>
                    </div>
                  ` : ''}
                  ${pool.depth ? `
                    <div class="spec-item">
                      <div class="spec-label">Depth</div>
                      <div class="spec-value">${pool.depth}</div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <div class="pricing-section">
                <h2 class="pricing-title">Professional Investment Analysis</h2>
                <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: rgba(79, 172, 254, 0.1); border-radius: 15px;">
                  <h3 style="font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 10px 0;">Complete Pool Configuration Package</h3>
                  <p style="font-size: 14px; color: #64748b; margin: 0;">Premium materials, professional installation, and comprehensive warranty included</p>
                </div>
                
                <div class="pricing-breakdown">
                  <div class="pricing-item pricing-item-main">
                    <div>
                      <div class="item-name">${pool.model} Pool</div>
                      <div class="item-category">Base Pool Package</div>
                    </div>
                    <div class="item-price item-price-main">$${getPoolPrice(pool).toLocaleString()}</div>
                  </div>

                  ${selectedItems.map(item => `
                    <div class="pricing-item">
                      <div>
                        <div class="item-name">${item.name}</div>
                        <div class="item-category">${item.category}</div>
                      </div>
                      <div class="item-price">$${item.price.toLocaleString()}</div>
                    </div>
                  `).join('')}
                  
                  ${extras.jets ? `
                    <div class="pricing-item">
                      <div>
                        <div class="item-name">Premium Spa Jets (${extras.jetQuantity}x)</div>
                        <div class="item-category">Hydrotherapy Enhancement</div>
                      </div>
                      <div class="item-price">$${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()}</div>
                    </div>
                  ` : ''}
                </div>
              </div>

              ${selectedItems.length > 0 ? `
              <div class="extras-list">
                <h3>Premium Features & Upgrades</h3>
                ${selectedItems.map(item => `
                  <div class="extra-item">
                    <div class="item-info">
                      <img src="${item.image || '/lovable-uploads/96a7bfbb-d930-451c-a0cd-1d8297bb7512.png'}" alt="${item.name}" class="item-image" onerror="this.src='/lovable-uploads/96a7bfbb-d930-451c-a0cd-1d8297bb7512.png'" />
                      <div class="item-details">
                        <h4>${item.name}</h4>
                        ${item.description ? `<p>${item.description}</p>` : ''}
                        ${item.brand ? `<p class="features">Premium Brand: ${item.brand}</p>` : ''}
                        <p class="features">${item.category} • Professional Installation Included</p>
                      </div>
                    </div>
                    <div class="item-price-large">$${item.price.toLocaleString()}</div>
                  </div>
                `).join('')}
                
                ${extras.jets ? `
                  <div class="extra-item">
                    <div class="item-info">
                      <img src="/lovable-uploads/57670513-84aa-4ae5-86ee-6a95737004b5.png" alt="Spa Jets" class="item-image" />
                      <div class="item-details">
                        <h4>Premium Spa Jets (${extras.jetQuantity} Units)</h4>
                        <p>High-performance hydrotherapy jets with adjustable pressure settings for ultimate relaxation and therapeutic benefits</p>
                        <p class="features">Stainless Steel Construction • Variable Flow Control • Lifetime Warranty</p>
                      </div>
                    </div>
                    <div class="item-price-large">$${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()}</div>
                  </div>` : ''}
              </div>
              ` : ''}

              <div class="total-section">
                <div class="total">
                  <div>Total Investment</div>
                  <div style="font-size: 72px; margin: 10px 0; font-weight: 900;">$${totalPrice.toLocaleString()}</div>
                  <div class="total-subtitle">Complete Backyard Transformation Package</div>
                  <div style="font-size: 16px; margin-top: 15px; opacity: 0.9; font-weight: 500;">
                    Professional Design • Premium Materials • Expert Installation • Full Warranty
                  </div>
                  <div style="font-size: 14px; margin-top: 10px; opacity: 0.8; background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 25px; display: inline-block;">
                    Financing Available • Monthly Payments from $${Math.round(totalPrice * 0.008).toLocaleString()}
                  </div>
                  
                  <div class="investment-breakdown">
                    <div class="breakdown-item">
                      <div class="breakdown-label">Pool Package</div>
                      <div class="breakdown-value">$${getPoolPrice(pool).toLocaleString()}</div>
                    </div>
                    <div class="breakdown-item">
                      <div class="breakdown-label">Premium Upgrades</div>
                      <div class="breakdown-value">$${(totalPrice - getPoolPrice(pool)).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="footer-title">🏊‍♂️ Wonderlands Pools - Your Dream Pool Specialists</div>
              <p><strong>This comprehensive quote is valid for 30 days</strong> from the generation date and includes:</p>
              <p>• Professional design consultation • Premium materials & equipment • Expert installation • Comprehensive warranty</p>
              <p>• Ongoing maintenance support • Financing options available</p>
              <p class="footer-highlight">📞 Contact us today to schedule your pool consultation and bring your backyard dreams to life!</p>
            </div>
          </div>

          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            });
          </script>
        </body>
      </html>
    `;
  };
  const downloadQuote = () => {
    const quoteData = {
      pool,
      extras,
      totalPrice: calculateTotalPrice(),
      timestamp: new Date().toISOString(),
      quoteId: `QUOTE-${Date.now()}`
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quoteData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pool-quote-${quoteData.quoteId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({
      title: "Quote Downloaded",
      description: "Your quote has been downloaded as a JSON file!"
    });
  };

  const handleGenerateQuote = () => {
    const quoteData = {
      pool,
      extras,
      totalPrice: calculateTotalPrice(),
      timestamp: new Date().toISOString(),
      quoteId: `QUOTE-${Date.now()}`
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quoteData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pool-quote-${quoteData.quoteId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({
      title: "Quote Generated & Downloaded!",
      description: "Your detailed pool configuration quote has been downloaded!"
    });
  };

  const toggleExtra = (extra: keyof PoolExtras, value?: any) => {
    setExtras(prev => ({
      ...prev,
      [extra]: value !== undefined ? value : !prev[extra]
    }));
  };

  // Enhanced search functionality - exclude pools
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = marketplaceProducts.filter(product => {
        // Exclude pools from search results
        if (product.category?.toLowerCase().includes('pool') && !product.category?.toLowerCase().includes('equipment')) {
          return false;
        }
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);
        const matchesCategory = product.category?.toLowerCase().includes(query);
        const matchesBrand = product.brand?.toLowerCase().includes(query);

        // Category-specific matching
        const categoryMatches = {
          'pavers': ['paver', 'stone', 'concrete', 'brick', 'travertine'],
          'liners': ['liner', 'vinyl', 'mesh', 'safety'],
          'spas': ['spa', 'hot tub', 'jacuzzi'],
          'heaters': ['heater', 'heat pump', 'gas heater', 'solar'],
          'covers': ['cover', 'automatic', 'safety cover'],
          'engines': ['pump', 'motor', 'filtration', 'circulation'],
          'furniture': ['chair', 'table', 'lounge', 'furniture', 'seating'],
          'fireplace': ['fireplace', 'fire pit', 'fire bowl', 'outdoor fire'],
          'outdoor-kitchens': ['kitchen', 'grill', 'outdoor cooking', 'appliance'],
          'bbq': ['bbq', 'barbecue', 'grill', 'smoker'],
          'pergolas': ['pergola', 'gazebo', 'shade', 'canopy', 'arbor'],
          'sound-system': ['speaker', 'audio', 'sound', 'music', 'bluetooth']
        };
        const matchesKeywords = Object.values(categoryMatches).flat().some(keyword => product.name.toLowerCase().includes(keyword) && query.includes(keyword));
        return matchesName || matchesDescription || matchesCategory || matchesBrand || matchesKeywords;
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, marketplaceProducts]);
  const filteredOptions = (options: any[], query: string) => {
    if (!query) return options;
    return options.filter(option => option.name.toLowerCase().includes(query.toLowerCase()) || option.description && option.description.toLowerCase().includes(query.toLowerCase()));
  };
  const getSelectedFeatureIcons = () => {
    const features = [];
    if (extras.heater) features.push({
      icon: Thermometer,
      label: 'Heater'
    });
    if (extras.cover) features.push({
      icon: Shield,
      label: 'Cover'
    });
    if (extras.spa) features.push({
      icon: Waves,
      label: 'Spa'
    });
    if (extras.tanningLedge) features.push({
      icon: Sun,
      label: 'Tanning Ledge'
    });
    if (extras.jets) features.push({
      icon: Zap,
      label: 'Jets'
    });
    if (extras.tiles) features.push({
      icon: Layers,
      label: 'Tiles'
    });
    return features;
  };
  const getSelectedConfigItems = () => {
    const items = [];

    // Liner (always selected)
    const liner = linerOptions.find(l => l.name === extras.linerOption);
    if (liner && liner.price > 0) {
      items.push({
        ...liner,
        category: 'Pool Liner'
      });
    }

    // Pavers
    const paver = paverOptions.find(p => p.name === extras.paverOption);
    if (paver && paver.price > 0) {
      items.push({
        ...paver,
        category: 'Pavers'
      });
    }

    // Coping
    const coping = copingPaverOptions.find(c => c.name === extras.copingPaverOption);
    if (coping && coping.price > 0) {
      items.push({
        ...coping,
        category: 'Coping'
      });
    }

    // Cover
    if (extras.cover) {
      const cover = coverOptions.find(c => c.name === extras.coverOption);
      if (cover) items.push({
        ...cover,
        category: 'Pool Cover'
      });
    }

    // Heater
    if (extras.heater) {
      const heater = poolHeaters.find(h => h.name === extras.heaterModel);
      if (heater) items.push({
        ...heater,
        category: 'Pool Heater'
      });
    }

    // Spa
    if (extras.spa) {
      const spa = spas.find((s: any) => s.model === extras.spaModel);
      if (spa) items.push({
        ...spa,
        name: spa.model,
        category: 'Spa'
      });
    }

    // Tanning Ledge
    if (extras.tanningLedge) {
      const ledge = tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel);
      if (ledge) items.push({
        ...ledge,
        category: 'Tanning Ledge'
      });
    }

    // Tiles
    if (extras.tiles) {
      const tile = tileOptions.find(t => t.name === extras.tileOption);
      if (tile && tile.price > 0) items.push({
        ...tile,
        category: 'Pool Tiles'
      });
    }

    // Jets
    if (extras.jets) {
      items.push({
        name: `Spa Jets (${extras.jetQuantity}x)`,
        price: getExtraPrice('jets') * extras.jetQuantity,
        image: azureBlueFinish,
        // Default image
        category: 'Pool Jets'
      });
    }
    return items;
  };
  const renderCategoryContent = () => {
    switch (activePanel) {
      case 'finishes':
        return finishOptions.map((finish, index) => <div key={`details-${finish.name}-${finish.collection || index}`} className={`p-2 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
          ...prev,
          finish: finish.name
        }))}>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                <img src={finish.image} alt={finish.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{finish.name}</p>
                <p className="text-xs text-primary">{finish.collection}</p>
                {finish.price && <p className="text-xs font-semibold">+${finish.price.toLocaleString()}</p>}
              </div>
            </div>
          </div>);
      case 'liners':
        return linerOptions.map(liner => <div key={liner.name} className={`p-2 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
          ...prev,
          linerOption: liner.name
        }))}>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                <img src={liner.image} alt={liner.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{liner.name}</p>
                {liner.type && liner.type !== 'Standard' && <p className="text-xs text-primary">{liner.type}</p>}
                {liner.price > 0 && <p className="text-xs font-semibold">+${liner.price.toLocaleString()}</p>}
              </div>
            </div>
          </div>);
      case 'jets':
        return <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex-1">
                <p className="text-xs font-medium">Spa Jets</p>
                <p className="text-xs text-muted-foreground">Premium spa jets for relaxation</p>
                <p className="text-xs font-semibold">${getExtraPrice('jets').toLocaleString()} each</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setExtras(prev => ({
                ...prev,
                jetQuantity: Math.max(1, prev.jetQuantity - 1)
              }))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs px-1 py-1 bg-muted rounded min-w-[24px] text-center">{extras.jetQuantity}</span>
                <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setExtras(prev => ({
                ...prev,
                jetQuantity: prev.jetQuantity + 1
              }))}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button className="w-full h-7 text-xs" variant={extras.jets ? "default" : "outline"} onClick={() => toggleExtra('jets')}>
              {extras.jets ? 'Remove Jets' : 'Add Jets'}
            </Button>
          </div>;
      default:
        // For marketplace categories and other standard options
        const categoryMap = {
          'pavers': paverOptions,
          'coping': copingPaverOptions,
          'covers': coverOptions,
          'heaters': poolHeaters,
          'spas': spas,
          'tanning': tanningLedges,
          'tiles': tileOptions
        };
        const options = categoryMap[activePanel as keyof typeof categoryMap];
        if (options) {
          return options.map((option: any) => <div key={option.name || option.model} className="p-2 border rounded-md cursor-pointer transition-all hover:bg-muted/50" onClick={() => handleOptionSelect(activePanel!, option)}>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                  <img src={option.image} alt={option.name || option.model} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{option.name || option.model}</p>
                  <p className="text-xs font-semibold">+${option.price.toLocaleString()}</p>
                  {option.description && <p className="text-xs text-muted-foreground truncate">{option.description}</p>}
                </div>
              </div>
            </div>);
        }

        // Special handling for pavers with area/quantity input
        if (activePanel === 'pavers') {
          return <div className="space-y-3">
              <div className="border rounded-md p-3 bg-muted/30">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Area (sq ft):</label>
                    <input type="number" value={paverArea} onChange={e => setPaverArea(Number(e.target.value))} className="w-full p-2 border rounded text-xs" min="1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Quantity:</label>
                    <input type="number" value={paverQuantity} onChange={e => setPaverQuantity(Number(e.target.value))} className="w-full p-2 border rounded text-xs" min="1" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Choose calculation method and adjust values above</p>
              </div>
              {paverOptions.map(option => <div key={option.name} className={`p-3 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.paverOption === option.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => handleOptionSelect('pavers', option)}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{option.name}</p>
                      <p className="text-xs font-semibold">$15/sq ft (incl. installation)</p>
                      <p className="text-xs text-primary">Total: ${(15 * (() => {
                      const poolDimensions = pool.dimensions?.split('x').map(d => parseInt(d.trim().replace(/['"]/g, ''))) || [16, 32];
                      const poolWidth = poolDimensions[0];
                      const poolLength = poolDimensions[1];
                      const paverAreaWithBuffer = (poolWidth + 6) * (poolLength + 6);
                      return paverAreaWithBuffer + paverArea;
                    })()).toLocaleString()}</p>
                      {option.description && <p className="text-xs text-muted-foreground mt-1">{option.description}</p>}
                    </div>
                  </div>
                </div>)}
            </div>;
        }

        // Special handling for coping with length/quantity input
        if (activePanel === 'coping') {
          return <div className="space-y-3">
              <div className="border rounded-md p-3 bg-muted/30">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Length (linear ft):</label>
                    <input type="number" value={copingLength} onChange={e => setCopingLength(Number(e.target.value))} className="w-full p-2 border rounded text-xs" min="1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Quantity:</label>
                    <input type="number" value={copingQuantity} onChange={e => setCopingQuantity(Number(e.target.value))} className="w-full p-2 border rounded text-xs" min="1" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Choose calculation method and adjust values above</p>
              </div>
              {copingPaverOptions.map(option => <div key={option.name} className={`p-3 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.copingPaverOption === option.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => handleOptionSelect('coping', option)}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{option.name}</p>
                      <p className="text-xs font-semibold">${option.price}/linear ft</p>
                      <p className="text-xs text-primary">Total: ${(option.price * copingLength).toLocaleString()}</p>
                      {option.description && <p className="text-xs text-muted-foreground mt-1">{option.description}</p>}
                    </div>
                  </div>
                </div>)}
            </div>;
        }

        // Enhanced covers section with color and engine options
        if (activePanel === 'covers') {
          return <div className="space-y-3">
              {coverOptions.map(option => <div key={option.name} className={`p-3 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.coverOption === option.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => handleOptionSelect('covers', option)}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{option.name}</p>
                      <p className="text-xs font-semibold">${option.price.toLocaleString()}</p>
                      {option.description && <p className="text-xs text-muted-foreground mt-1">{option.description}</p>}
                      
                      {/* Color Options */}
                      {option.colors && extras.coverOption === option.name && <div className="mt-2">
                          <label className="text-xs font-medium block mb-1">Color:</label>
                          <select value={coverColor} onChange={e => setCoverColor(e.target.value)} className="w-full p-1 border rounded text-xs" onClick={e => e.stopPropagation()}>
                            <option value="">Select Color</option>
                            {option.colors.map(color => <option key={color} value={color}>{color}</option>)}
                          </select>
                        </div>}
                      
                      {/* Engine Options */}
                      {option.engines && extras.coverOption === option.name && <div className="mt-2">
                          <label className="text-xs font-medium block mb-1">Engine:</label>
                          <select value={coverEngine} onChange={e => setCoverEngine(e.target.value)} className="w-full p-1 border rounded text-xs" onClick={e => e.stopPropagation()}>
                            <option value="">Select Engine</option>
                            {option.engines.map(engine => <option key={engine} value={engine}>{engine}</option>)}
                          </select>
                        </div>}
                    </div>
                  </div>
                </div>)}
            </div>;
        }

        // For marketplace product categories - now adds to configuration instead of cart
        return marketplaceProducts.filter(product => {
          const categoryKeywords = {
            'engines': ['pump', 'motor', 'filtration', 'circulation'],
            'furniture': ['chair', 'table', 'lounge', 'furniture', 'seating'],
            'fireplace': ['fireplace', 'fire pit', 'fire bowl'],
            'outdoor-kitchens': ['kitchen', 'outdoor cooking', 'appliance'],
            'bbq': ['bbq', 'barbecue', 'grill', 'smoker'],
            'pergolas': ['pergola', 'gazebo', 'shade', 'canopy'],
            'sound-system': ['speaker', 'audio', 'sound', 'music']
          };
          const keywords = categoryKeywords[activePanel as keyof typeof categoryKeywords] || [];
          return keywords.some(keyword => product.name.toLowerCase().includes(keyword) || product.category?.toLowerCase().includes(keyword));
        }).map(product => <div key={product.id} className={`p-2 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${selectedProducts.some(p => p.id === product.id) ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => {
          setSelectedProducts(prev => {
            const isAlreadySelected = prev.some(p => p.id === product.id);
            if (isAlreadySelected) {
              toast({
                title: "Removed from Configuration",
                description: `${product.name} removed from pool configuration!`
              });
              return prev.filter(p => p.id !== product.id);
            } else {
              toast({
                title: "Added to Configuration",
                description: `${product.name} added to pool configuration!`
              });
              return [...prev, product];
            }
          });
        }}>
            <div className="flex gap-2">
              {product.image_url && <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{product.name}</p>
                {product.brand && <p className="text-xs text-primary">{product.brand}</p>}
                <p className="text-xs font-semibold">${product.price.toLocaleString()}</p>
              </div>
            </div>
          </div>);
    }
  };
  const handleOptionSelect = (category: string, option: any) => {
    switch (category) {
      case 'pavers':
        setExtras(prev => ({
          ...prev,
          paverOption: option.name
        }));
        break;
      case 'coping':
        setExtras(prev => ({
          ...prev,
          copingPaverOption: option.name
        }));
        break;
      case 'covers':
        // Only allow one cover
        setExtras(prev => ({
          ...prev,
          coverOption: option.name,
          cover: true
        }));
        break;
      case 'heaters':
        // Only allow one heater
        setExtras(prev => ({
          ...prev,
          heaterModel: option.name,
          heater: true
        }));
        break;
      case 'spas':
        // Only allow one spa
        setExtras(prev => ({
          ...prev,
          spaModel: option.model,
          spa: true
        }));
        break;
      case 'tanning':
        // Only allow one tanning ledge
        setExtras(prev => ({
          ...prev,
          tanningLedgeModel: option.name,
          tanningLedge: true
        }));
        break;
      case 'tiles':
        // Only allow one tile option
        setExtras(prev => ({
          ...prev,
          tileOption: option.name,
          tiles: true
        }));
        break;
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Responsive for all devices */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" size="sm">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            {/* Price Dropdown - Higher z-index to appear above everything */}
            <div className="relative">
              <Button variant="outline" onClick={() => setShowPriceDropdown(!showPriceDropdown)} className="flex items-center gap-1 sm:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm px-2 sm:px-4" size="sm">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">${calculateTotalPrice().toLocaleString()}</span>
                <span className="xs:hidden">${(calculateTotalPrice() / 1000).toFixed(0)}k</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              {showPriceDropdown && <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-popover border border-border rounded-lg shadow-lg z-[70] max-h-80 sm:max-h-96 overflow-y-auto">
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">Configuration Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span>Base Pool ({pool.model})</span>
                        <span>${getPoolPrice(pool).toLocaleString()}</span>
                      </div>
                      
                      {getConfigurationItems().map((item, index) => <div key={index} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="truncate">{item.name}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeConfigItem(item)} className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground shrink-0">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="shrink-0 ml-2">${item.price.toLocaleString()}</span>
                        </div>)}
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-semibold text-sm">
                          <span>Total</span>
                          <span>${calculateTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-6">
          {/* Left Panel - Pool Visualization - Responsive */}
          <div className="xl:col-span-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                {/* Selected Products Snapshots - Responsive */}
                {getConfigurationItems().length > 0 && <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1 max-w-[150px] sm:max-w-[200px]">
                    {getConfigurationItems().slice(0, 4).map((item, index) => <div key={index} className="w-6 h-6 sm:w-8 sm:h-8 rounded border bg-background/90 overflow-hidden">
                        <img src={item.image || pool.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>)}
                    {getConfigurationItems().length > 4 && <div className="w-6 h-6 sm:w-8 sm:h-8 rounded border bg-background/90 flex items-center justify-center text-[10px] sm:text-xs">
                        +{getConfigurationItems().length - 4}
                      </div>}
                  </div>}
                
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={getCurrentImage()} alt={pool.model} className="w-full h-full object-cover transition-all duration-500" />
                </div>
                
                {/* Pool Info Overlay - Responsive */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-sm sm:text-xl font-bold">{pool.model}</h1>
                      <Badge className={getCategoryColor(pool.category) + " text-xs"}>
                        {pool.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold">${getPoolPrice(pool).toLocaleString()}</div>
                      <div className="text-xs sm:text-sm opacity-90">Base Price</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Pool Studio - Complete Configuration */}
          <div className="xl:col-span-4">
            <Card>
              <CardContent className="p-3 sm:p-4 space-y-4">
                {/* Header with Pool Browser */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-primary via-teal to-coral bg-clip-text text-transparent">
                      Pool Configuration Studio
                    </h2>
                  </div>
                  
                  {/* Pool Browser */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Browse Other Pool Models
                    </label>
                    <select 
                      value={pool.model} 
                      onChange={(e) => {
                        const selectedPool = pools.find(p => p.model === e.target.value);
                        if (selectedPool) {
                          const params = new URLSearchParams({
                            model: selectedPool.model,
                            price: selectedPool.price.toString(),
                            category: selectedPool.category,
                            ...(selectedPool.image && { image: selectedPool.image }),
                            ...(selectedPool.dimensions && { dimensions: selectedPool.dimensions }),
                            ...(selectedPool.depth && { depth: selectedPool.depth }),
                            ...(selectedPool.installationTimeWeeks && { installationTimeWeeks: selectedPool.installationTimeWeeks.toString() }),
                            ...(selectedPool.warrantyYears && { warrantyYears: selectedPool.warrantyYears.toString() }),
                            ...(selectedPool.saltSystem !== undefined && { saltSystem: selectedPool.saltSystem.toString() }),
                            ...(selectedPool.carbonFiber !== undefined && { carbonFiber: selectedPool.carbonFiber.toString() })
                          });
                          window.location.href = `/pool/${selectedPool.model.toLowerCase().replace(/\s+/g, '-')}?${params.toString()}`;
                        }
                      }}
                      className="w-full p-2 text-sm border rounded-md bg-background"
                    >
                      {pools.map(poolOption => (
                        <option key={poolOption.model} value={poolOption.model}>
                          {poolOption.model} - ${poolOption.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Separator />

                {/* Pool Finishing Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Pool Finishes</h4>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {finishOptions.map((finish, idx) => (
                        <CarouselItem key={`pool-${finish.name}-${idx}`} className="pl-1 basis-1/2 sm:basis-1/3">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                              extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'
                            }`} 
                            onClick={() => setExtras(prev => ({ ...prev, finish: finish.name }))}
                          >
                            <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                              <img 
                                src={finish.image} 
                                alt={finish.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = finish.color;
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                              <p className="text-xs font-medium text-center line-clamp-2">{finish.name}</p>
                              <div className="mt-1 space-y-1">
                                <p className="text-xs text-primary text-center font-semibold">{finish.collection}</p>
                                {finish.price && <p className="text-xs text-foreground font-semibold text-center">+${finish.price.toLocaleString()}</p>}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>

                {/* Pool Liner Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Premium Pool Liners</h4>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {linerOptions.map(liner => (
                        <CarouselItem key={liner.name} className="pl-1 basis-1/2 sm:basis-1/3">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                              extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'
                            }`} 
                            onClick={() => setExtras(prev => ({ ...prev, linerOption: liner.name }))}
                          >
                            <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                              <img 
                                src={liner.image} 
                                alt={liner.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = liner.color;
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                              <p className="text-xs font-medium text-center line-clamp-2">{liner.name}</p>
                              <div className="mt-1 space-y-1">
                                {liner.type && liner.type !== 'Standard' && (
                                  <p className="text-xs text-primary text-center font-semibold">{liner.type}</p>
                                )}
                                {liner.price > 0 && (
                                  <p className="text-xs text-foreground font-semibold text-center">+${liner.price.toLocaleString()}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>

                {/* Pavers Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Pavers & Surface Area Calculator</h4>
                  <div className="mb-3">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Paver Surface Area (sq ft)
                    </label>
                    <Input 
                      type="number" 
                      placeholder="Enter surface area for pavers" 
                      value={paverSurfaceArea} 
                      onChange={e => setPaverSurfaceArea(e.target.value)} 
                      className="mb-2" 
                    />
                    {paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) && (
                      <div className="text-xs text-green-600 font-medium">
                        Calculated Cost: ${(parseFloat(paverSurfaceArea) * 15).toLocaleString()} (${paverSurfaceArea} sq ft × $15/sq ft)
                      </div>
                    )}
                  </div>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {paverOptions.map(paver => (
                        <CarouselItem key={paver.name} className="pl-1 basis-1/2 sm:basis-1/3">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                              extras.paverOption === paver.name ? 'border-primary bg-primary/10' : 'border-border'
                            }`} 
                            onClick={() => setExtras(prev => ({ ...prev, paverOption: paver.name }))}
                          >
                            <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                              <img 
                                src={paver.image} 
                                alt={paver.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = paver.color;
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                              <p className="text-xs font-medium text-center line-clamp-2">{paver.name}</p>
                              {paver.price > 0 && (
                                <p className="text-xs text-primary font-semibold text-center mt-1">+${paver.price.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>

                {/* Screen Enclosure Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Screen Enclosure & Surface Area Calculator</h4>
                  <div className="mb-3">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Screen Enclosure Area (sq ft)
                    </label>
                    <Input 
                      type="number" 
                      placeholder="Enter surface area for screen enclosure" 
                      value={extras.screenEnclosureArea || ''} 
                      onChange={e => setExtras(prev => ({ ...prev, screenEnclosureArea: parseFloat(e.target.value) || 0 }))} 
                      className="mb-2" 
                    />
                    {extras.screenEnclosureArea > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Calculated Cost: ${(() => {
                          let pricePerSqFt = 15;
                          if (extras.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
                          if (extras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
                          return (extras.screenEnclosureArea * pricePerSqFt).toLocaleString();
                        })()} (${extras.screenEnclosureArea} sq ft × ${(() => {
                          if (extras.screenEnclosureQuality === 'deluxe') return '$22';
                          if (extras.screenEnclosureQuality === 'premium') return '$28';
                          return '$15';
                        })()}/sq ft)
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'standard', name: 'Wonder Cage' },
                      { key: 'deluxe', name: 'Deluxe' },
                      { key: 'premium', name: '2 stories' }
                    ].map(quality => (
                      <div 
                        key={quality.key} 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md text-center ${
                          extras.screenEnclosureQuality === quality.key ? 'border-primary bg-primary/10' : 'border-border'
                        }`} 
                        onClick={() => setExtras(prev => ({ ...prev, screenEnclosureQuality: quality.key as 'standard' | 'deluxe' | 'premium' }))}
                      >
                        <p className="text-sm font-medium">{quality.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${quality.key === 'standard' ? '15' : quality.key === 'deluxe' ? '22' : '28'}/sq ft
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Additional Features</h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* Pool Heater */}
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.heater} 
                        onCheckedChange={() => toggleExtra('heater')} 
                        className="data-[state=checked]:bg-coral data-[state=checked]:border-coral" 
                      />
                      <div className="flex items-center space-x-1">
                        <Thermometer size={16} className="text-coral" />
                       <span className="text-sm">Add Pool Heater (+{extras.heater ? (() => {
                          const selectedHeater = poolHeaters.find(heater => heater.name === extras.heaterModel);
                          return selectedHeater ? `$${selectedHeater.price.toLocaleString()}` : '$0';
                        })() : '$0'})</span>
                      </div>
                    </label>

                    {extras.heater && (
                      <div className="ml-6 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Heater Model:</label>
                        <div className="grid grid-cols-1 gap-2">
                          {poolHeaters.map(heater => (
                            <button 
                              key={heater.name} 
                              onClick={() => setExtras(prev => ({ ...prev, heaterModel: heater.name }))} 
                              className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                extras.heaterModel === heater.name ? 'border-coral bg-coral/10 text-coral' : 'border-border hover:border-coral/50'
                              }`}
                            >
                              <img src={heater.image} alt={heater.name} className="w-8 h-8 rounded object-cover" />
                              <div className="flex-1 text-left">
                                <div>{heater.name}</div>
                                <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                                {heater.description && <div className="text-xs text-muted-foreground">{heater.description}</div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pool Covers */}
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.cover} 
                        onCheckedChange={() => toggleExtra('cover')} 
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                      />
                      <div className="flex items-center space-x-1">
                        <Shield size={16} className="text-primary" />
                         <span className="text-sm">Add Pool Cover (+{extras.cover ? (() => {
                          const selectedCover = coverOptions.find(cover => cover.name === extras.coverOption);
                          return selectedCover && selectedCover.name !== 'NO COVER' ? `$${selectedCover.price.toLocaleString()}` : '$0';
                        })() : '$0'})</span>
                      </div>
                    </label>

                    {extras.cover && (
                      <div className="ml-6 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Cover Type:</label>
                        <div className="grid grid-cols-1 gap-2">
                          {coverOptions.map(cover => (
                            <button 
                              key={cover.name} 
                              onClick={() => setExtras(prev => ({ ...prev, coverOption: cover.name }))} 
                              className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                extras.coverOption === cover.name ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <img src={cover.image} alt={cover.name} className="w-8 h-8 rounded object-cover" />
                              <div className="flex-1 text-left">
                                <div>{cover.name}</div>
                                <div className="text-xs text-muted-foreground">{cover.price > 0 ? `$${cover.price.toLocaleString()}` : 'No Cost'}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spa */}
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.spa} 
                        onCheckedChange={() => toggleExtra('spa')} 
                      />
                      <div className="flex items-center space-x-1">
                        <Waves size={16} className="text-primary" />
                         <span className="text-sm">Add Spa (+{extras.spa ? (() => {
                          const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
                          return selectedSpa ? `$${selectedSpa.price.toLocaleString()}` : '$0';
                        })() : '$0'})</span>
                      </div>
                    </label>

                    {extras.spa && (
                      <div className="ml-6 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Spa Model:</label>
                        <div className="grid grid-cols-1 gap-2">
                          {spas.map((spa: any) => (
                            <button 
                              key={spa.model} 
                              onClick={() => setExtras(prev => ({ ...prev, spaModel: spa.model }))} 
                              className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                extras.spaModel === spa.model ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {spa.image && <img src={spa.image} alt={spa.model} className="w-8 h-8 rounded object-cover" />}
                              <div className="flex-1 text-left">
                                <div>{spa.model}</div>
                                <div className="text-xs text-muted-foreground">${spa.price.toLocaleString()}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tanning Ledge */}
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.tanningLedge} 
                        onCheckedChange={() => toggleExtra('tanningLedge')} 
                      />
                      <div className="flex items-center space-x-1">
                        <Sun size={16} className="text-coral" />
                         <span className="text-sm">Add Tanning Ledge (+{extras.tanningLedge ? (() => {
                          const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
                          return selectedLedge ? `$${selectedLedge.price.toLocaleString()}` : '$0';
                        })() : '$0'})</span>
                      </div>
                    </label>

                    {extras.tanningLedge && (
                      <div className="ml-6 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Tanning Ledge Model:</label>
                        <div className="grid grid-cols-1 gap-2">
                          {tanningLedges.map((ledge: any) => (
                            <button 
                              key={ledge.name} 
                              onClick={() => setExtras(prev => ({ ...prev, tanningLedgeModel: ledge.name }))} 
                              className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                extras.tanningLedgeModel === ledge.name ? 'border-coral bg-coral/10 text-coral' : 'border-border hover:border-coral/50'
                              }`}
                            >
                              <img src={ledge.image} alt={ledge.name} className="w-8 h-8 rounded object-cover" />
                              <div className="flex-1 text-left">
                                <div>{ledge.name}</div>
                                <div className="text-xs text-muted-foreground">${ledge.price.toLocaleString()}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pool Tiles */}
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.tiles} 
                        onCheckedChange={() => toggleExtra('tiles')} 
                      />
                      <div className="flex items-center space-x-1">
                        <Cpu size={16} className="text-primary" />
                         <span className="text-sm">Add Pool Tiles (+{extras.tiles ? (() => {
                          const selectedTile = tileOptions.find(tile => tile.name === extras.tileOption);
                          return selectedTile && selectedTile.price > 0 ? `$${selectedTile.price.toLocaleString()}` : '$0';
                        })() : '$0'})</span>
                      </div>
                    </label>

                    {extras.tiles && (
                      <div className="ml-6 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Tile Option:</label>
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-1">
                            {tileOptions.map(tile => (
                              <CarouselItem key={tile.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                                <div 
                                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                    extras.tileOption === tile.name ? 'border-primary bg-primary/10' : 'border-border'
                                  }`} 
                                  onClick={() => setExtras(prev => ({ ...prev, tileOption: tile.name }))}
                                >
                                  <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                    <img 
                                      src={tile.image} 
                                      alt={tile.name} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.style.backgroundColor = tile.color || '#4682B4';
                                          target.style.display = 'none';
                                        }
                                      }} 
                                    />
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between min-h-0">
                                    <p className="text-xs font-medium text-center line-clamp-2">{tile.name}</p>
                                    {tile.price > 0 && <p className="text-xs text-primary font-semibold text-center mt-1">+${tile.price.toLocaleString()}</p>}
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-0" />
                          <CarouselNext className="right-0" />
                        </Carousel>
                      </div>
                    )}

                    {/* Spa Jets */}
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Checkbox checked={extras.jets} onCheckedChange={() => toggleExtra('jets')} />
                        <div className="flex items-center space-x-1">
                          <Zap size={16} className="text-orange" />
                           <span className="text-sm">Spa Jets (+${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()})</span>
                        </div>
                      </label>
                      {extras.jets && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setExtras(prev => ({ ...prev, jetQuantity: Math.max(1, prev.jetQuantity - 1) }))} 
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{extras.jetQuantity}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setExtras(prev => ({ ...prev, jetQuantity: prev.jetQuantity + 1 }))} 
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <Separator />

                {/* Total Configuration Price */}
                <div className="p-3 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg border border-primary/30">
                  <div className="text-center">
                    <h5 className="text-sm font-medium text-muted-foreground">Total Configuration Price</h5>
                    <div className="text-2xl font-bold text-foreground">${calculateTotalPrice().toLocaleString()}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      // Create detailed extras breakdown for quote tool
                      const extrasBreakdown = [];

                      // Add finish if not default
                      if (extras.finish && extras.finish !== 'Athens Pearl White') {
                        const finishOption = finishOptions.find(f => f.name === extras.finish);
                        if (finishOption) {
                          extrasBreakdown.push({
                            name: `${finishOption.name} Finish`,
                            price: finishOption.price,
                            image: finishOption.image
                          });
                        }
                      }

                      // Add heater if selected
                      if (extras.heater && extras.heaterModel) {
                        const heaterOption = poolHeaters.find(h => h.name === extras.heaterModel);
                        if (heaterOption) {
                          extrasBreakdown.push({
                            name: heaterOption.name,
                            price: heaterOption.price,
                            image: heaterOption.image
                          });
                        }
                      }

                      // Add cover if selected
                      if (extras.cover && extras.coverOption) {
                        const coverOption = coverOptions.find(c => c.name === extras.coverOption);
                        if (coverOption) {
                          extrasBreakdown.push({
                            name: coverOption.name,
                            price: coverOption.price,
                            image: coverOption.image
                          });
                        }
                      }

                      // Add spa if selected
                      if (extras.spa && extras.spaModel) {
                        const spaOption = spas.find(s => s.model === extras.spaModel);
                        if (spaOption) {
                          extrasBreakdown.push({
                            name: `${spaOption.model} Spa`,
                            price: spaOption.price,
                            image: spaOption.image
                          });
                        }
                      }

                      // Add tanning ledge if selected  
                      if (extras.tanningLedge && extras.tanningLedgeModel) {
                        const ledgeOption = tanningLedges.find(t => t.name === extras.tanningLedgeModel);
                        if (ledgeOption) {
                          extrasBreakdown.push({
                            name: `${ledgeOption.name} Tanning Ledge`,
                            price: ledgeOption.price,
                            image: ledgeOption.image
                          });
                        }
                      }

                      // Add tiles if selected
                      if (extras.tiles && extras.tileOption) {
                        const tileOption = tileOptions.find(t => t.name === extras.tileOption);
                        if (tileOption) {
                          extrasBreakdown.push({
                            name: tileOption.name,
                            price: tileOption.price,
                            image: tileOption.image
                          });
                        }
                      }

                      // Add pavers if selected
                      if (extras.pavers && extras.paverOption && paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
                        const paverOption = paverOptions.find(p => p.name === extras.paverOption);
                        if (paverOption) {
                          extrasBreakdown.push({
                            name: `${paverOption.name} (${paverSurfaceArea} sq ft)`,
                            price: parseFloat(paverSurfaceArea) * 15,
                            image: paverOption.image
                          });
                        }
                      }

                      // Add screen enclosure if selected
                      if (extras.screenEnclosure && extras.screenEnclosureArea && !isNaN(parseFloat(extras.screenEnclosureArea.toString()))) {
                        let pricePerSqFt = 15;
                        if (extras.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
                        if (extras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
                        const enclosurePrice = parseFloat(extras.screenEnclosureArea.toString()) * pricePerSqFt;
                        extrasBreakdown.push({
                          name: `Screen Enclosure - ${extras.screenEnclosureQuality === 'standard' ? 'Wonder Cage' : extras.screenEnclosureQuality} (${extras.screenEnclosureArea} sq ft)`,
                          price: enclosurePrice,
                          image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png'
                        });
                      }

                      const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
                      
                      setSelectedExtras({
                        ...extras,
                        paverSurfaceArea: parseFloat(paverSurfaceArea || '0'),
                        extrasBreakdown,
                        extrasTotal,
                        deliveryTime: '6 weeks'
                      });
                      setShowQuoteModal(true);
                    }}
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                  >
                    Instant Quote
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleAddToCart} variant="outline" size="sm" className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                    </Button>
                    <StripeCheckoutButton 
                      productId={`pool_${pool.model.replace(/\s+/g, '_')}`} 
                      productName={pool.model} 
                      price={calculateTotalPrice()} 
                      variant="gradient" 
                      className="flex-1 hover:scale-105 transition-all duration-300" 
                      size="sm" 
                      showFinancingOptions={false} 
                    />
                  </div>
                </div>

                {/* Financing Section */}
                <div className="mt-4 p-4 bg-gradient-to-r from-teal/5 to-primary/5 rounded-lg border border-teal/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm text-foreground">Finance This Purchase</h5>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowFinancing(!showFinancing)} 
                        className="text-xs"
                      >
                        {showFinancing ? 'Hide' : 'Show'} Options
                      </Button>
                    </div>
                    
                    {showFinancing && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="text-center p-2 bg-white/50 rounded">
                            <div className="font-semibold">3 Years</div>
                            <div className="text-teal-600">${(calculateTotalPrice() / 36).toLocaleString()}/mo</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 rounded">
                            <div className="font-semibold">6 Years</div>
                            <div className="text-teal-600">${(calculateTotalPrice() / 72).toLocaleString()}/mo</div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm" 
                          onClick={() => {
                            const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?amount=${calculateTotalPrice()}&product=${encodeURIComponent(pool.model)}&description=${encodeURIComponent(`Complete pool configuration including ${pool.model}`)}&monthly_payment=${Math.round(calculateTotalPrice() * 0.008)}&loan_term=60&project_type=Pool%20Installation`;
                            window.open(lyonFinancialUrl, '_blank');
                          }}
                        >
                          Apply with Lyon Financial
                        </Button>
                        
                        <div className="text-xs text-muted-foreground text-center">
                          *Financing subject to credit approval. APR varies.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <DragDropEditor isActive={editorActive} onToggle={() => setEditorActive(!editorActive)} showEnableButton={false} />
      
      <SurveyQuoteTool 
        pool={pool as any}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        extras={selectedExtras}
      />
    </div>
  );
};

export default PoolDetails;