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
import { getProductsByCategory } from '@/data/consolidatedProducts';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SurveyQuoteTool from "@/components/SurveyQuoteTool";
import { Belgard3DVisualizer } from '@/components/Belgard3DVisualizer';
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

interface BelgardProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  collection?: string;
  description?: string;
  image_url?: string;
  material?: string;
  pattern?: string;
  benefits?: string[];
  installation_time?: string;
  warranty_years_text?: string;
}

interface BelgardExtras {
  selectedProducts: { [productId: string]: boolean };
  quantities: { [productId: string]: number };
  dimensions: { [productId: string]: { length: number; width: number; area: number } };
  notes: string;
}

interface MarketplaceProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
  brand?: string;
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
const finishOptions = getProductsByCategory('finish').map(finish => ({
  name: finish.name,
  color: '#4169E1',
  image: finish.image,
  price: finish.price,
  collection: finish.collection,
  category: finish.subcategory || 'General',
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
  colors: [{
    name: 'Light Blue',
    value: '#87CEEB',
    hex: '#87CEEB'
  }, {
    name: 'Royal Blue',
    value: '#4169E1',
    hex: '#4169E1'
  }, {
    name: 'Navy Blue',
    value: '#000080',
    hex: '#000080'
  }, {
    name: 'Forest Green',
    value: '#228B22',
    hex: '#228B22'
  }, {
    name: 'Light Gray',
    value: '#D3D3D3',
    hex: '#D3D3D3'
  }, {
    name: 'Charcoal Gray',
    value: '#36454F',
    hex: '#36454F'
  }, {
    name: 'Brown',
    value: '#964B00',
    hex: '#964B00'
  }, {
    name: 'Beige',
    value: '#F5F5DC',
    hex: '#F5F5DC'
  }],
  engines: ['Standard Motor', 'Quiet Motor', 'Smart Motor']
}, {
  name: 'CS3000 Safety Cover',
  color: '#2F4F4F',
  price: 24000,
  image: shaleGrayFinish,
  category: 'cover',
  description: 'Heavy-duty safety cover with anchoring system',
  colors: [{
    name: 'Light Blue',
    value: '#87CEEB',
    hex: '#87CEEB'
  }, {
    name: 'Royal Blue',
    value: '#4169E1',
    hex: '#4169E1'
  }, {
    name: 'Navy Blue',
    value: '#000080',
    hex: '#000080'
  }, {
    name: 'Forest Green',
    value: '#228B22',
    hex: '#228B22'
  }, {
    name: 'Light Gray',
    value: '#D3D3D3',
    hex: '#D3D3D3'
  }, {
    name: 'Charcoal Gray',
    value: '#36454F',
    hex: '#36454F'
  }, {
    name: 'Brown',
    value: '#964B00',
    hex: '#964B00'
  }, {
    name: 'Beige',
    value: '#F5F5DC',
    hex: '#F5F5DC'
  }],
  engines: ['Manual', 'Semi-Auto', 'Full Auto']
}, {
  name: 'Infinity 4000 Smart Cover',
  color: '#2F4F4F',
  price: 32000,
  image: coastalBronzeFinish,
  category: 'cover',
  description: 'Smart automated cover with app control',
  colors: [{
    name: 'Light Blue',
    value: '#87CEEB',
    hex: '#87CEEB'
  }, {
    name: 'Royal Blue',
    value: '#4169E1',
    hex: '#4169E1'
  }, {
    name: 'Navy Blue',
    value: '#000080',
    hex: '#000080'
  }, {
    name: 'Forest Green',
    value: '#228B22',
    hex: '#228B22'
  }, {
    name: 'Light Gray',
    value: '#D3D3D3',
    hex: '#D3D3D3'
  }, {
    name: 'Charcoal Gray',
    value: '#36454F',
    hex: '#36454F'
  }, {
    name: 'Brown',
    value: '#964B00',
    hex: '#964B00'
  }, {
    name: 'Beige',
    value: '#F5F5DC',
    hex: '#F5F5DC'
  }],
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
  price: 0,
  // Base price is 0, actual cost calculated by surface area × $15/sq ft
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

const WonderlandsStudio = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();

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

  // Studio type selection
  const [studioType, setStudioType] = useState<'pools' | 'belgard'>('pools');
  const [selectedCategory, setSelectedCategory] = useState<string>('scene');
  
  // Pool configuration state
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([]);
  const [searchResults, setSearchResults] = useState<MarketplaceProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<MarketplaceProduct[]>([]);
  const [paverArea, setPaverArea] = useState<number>(100);
  const [copingLength, setCopingLength] = useState<number>(50);
  const [paverQuantity, setPaverQuantity] = useState<number>(50);
  const [copingQuantity, setCopingQuantity] = useState<number>(25);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [coverColor, setCoverColor] = useState<string>('Light Blue');
  const [coverEngine, setCoverEngine] = useState<string>('');
  const [editorActive, setEditorActive] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);
  const [paverSurfaceArea, setPaverSurfaceArea] = useState<string>('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<any>(null);

  // Belgard configuration state
  const [belgardProducts, setBelgardProducts] = useState<BelgardProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BelgardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Cache key for user selections
  const cacheKey = `wonderlands_studio_${pool.model}_selections`;
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

  const [belgardExtras, setBelgardExtras] = useState<BelgardExtras>({
    selectedProducts: {},
    quantities: {},
    dimensions: {},
    notes: ''
  });

  const categories = [
    { id: 'scene', name: 'Scene', icon: Cpu },
    { id: 'concrete-pavers', name: 'Concrete Pavers & Slabs', icon: Package },
    { id: 'permeable-pavers', name: 'Permeable Pavers', icon: Droplets },
    { id: 'porcelain-pavers', name: 'Porcelain Pavers', icon: Layers },
    { id: 'wall-systems', name: 'Wall Systems', icon: Shield },
    { id: 'caps-edgers', name: 'Caps & Edgers', icon: Settings },
    { id: 'outdoor-kitchens', name: 'Outdoor Kitchens', icon: ChefHat },
    { id: 'fireplaces', name: 'Fireplaces', icon: Flame },
    { id: 'fire-pits', name: 'Fire Pit Kits', icon: Flame },
    { id: 'pergolas', name: 'Pergolas & Panels', icon: Home },
    { id: 'accessories', name: 'Accessories', icon: Plus }
  ];

  // Load cached selections and marketplace products on mount
  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        if (cachedData.pools) setExtras(cachedData.pools);
        if (cachedData.belgard) setBelgardExtras(cachedData.belgard);
        if (cachedData.studioType) setStudioType(cachedData.studioType);
      } catch (e) {
        console.error('Error loading cached selections:', e);
      }
    }

    // Load marketplace products
    loadMarketplaceProducts();
    loadBelgardProducts();
  }, [cacheKey]);

  const loadMarketplaceProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, description, category, brand')
        .eq('is_active', true)
        .gt('stock_quantity', 0);
      
      if (error) throw error;
      setMarketplaceProducts(products || []);
    } catch (error) {
      console.error('Error loading marketplace products:', error);
    }
  };

  // Load Belgard products from database
  const loadBelgardProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .in('category', [
          'concrete-pavers', 'permeable-pavers', 'porcelain-pavers', 
          'wall-systems', 'caps-edgers', 'outdoor-kitchens', 
          'fireplaces', 'fire-pits', 'pergolas', 'accessories'
        ]);

      if (error) {
        console.error('Error loading Belgard products:', error);
        toast({
          title: "Error",
          description: "Failed to load Belgard products",
          variant: "destructive"
        });
        return;
      }

      setBelgardProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load Belgard products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter Belgard products by category and search
  useEffect(() => {
    if (selectedCategory === 'scene') {
      setFilteredProducts([]);
      return;
    }

    let filtered = belgardProducts.filter(product => 
      product.category === selectedCategory
    );

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.collection?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [belgardProducts, selectedCategory, searchQuery]);

  // Save selections to cache whenever extras change
  useEffect(() => {
    const cacheData = {
      pools: extras,
      belgard: belgardExtras,
      studioType
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }, [extras, belgardExtras, studioType, cacheKey]);

  const toggleExtra = (extra: keyof PoolExtras) => {
    setExtras(prev => ({
      ...prev,
      [extra]: !prev[extra]
    }));
  };

  const calculatePoolTotalPrice = () => {
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

  // Calculate Belgard total price
  const calculateBelgardTotalPrice = () => {
    return Object.entries(belgardExtras.selectedProducts)
      .filter(([_, selected]) => selected)
      .reduce((total, [productId]) => {
        const product = belgardProducts.find(p => p.id === productId);
        if (!product) return total;
        
        const quantity = belgardExtras.quantities[productId] || 1;
        const dimensions = belgardExtras.dimensions[productId];
        const area = dimensions?.area || 1;
        
        return total + (product.price * quantity * area);
      }, 0);
  };

  // Handle Belgard product selection
  const toggleBelgardProduct = (productId: string) => {
    setBelgardExtras(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [productId]: !prev.selectedProducts[productId]
      },
      quantities: {
        ...prev.quantities,
        [productId]: prev.quantities[productId] || 1
      },
      dimensions: {
        ...prev.dimensions,
        [productId]: prev.dimensions[productId] || { length: 10, width: 10, area: 100 }
      }
    }));
  };

  // Handle Belgard quantity change
  const updateBelgardQuantity = (productId: string, quantity: number) => {
    setBelgardExtras(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [productId]: Math.max(1, quantity)
      }
    }));
  };

  // Handle Belgard dimensions change
  const updateBelgardDimensions = (productId: string, field: 'length' | 'width', value: number) => {
    setBelgardExtras(prev => {
      const currentDimensions = prev.dimensions[productId] || { length: 10, width: 10, area: 100 };
      const newDimensions = {
        ...currentDimensions,
        [field]: Math.max(1, value)
      };
      newDimensions.area = newDimensions.length * newDimensions.width;

      return {
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [productId]: newDimensions
        }
      };
    });
  };

  const calculateTotalPrice = () => {
    return calculatePoolTotalPrice() + calculateBelgardTotalPrice();
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

  // Generate comprehensive quote for both pools and Belgard
  const generateQuote = () => {
    const poolItems = [];
    const belgardItems = [];

    // Pool items
    if (studioType === 'pools' || Object.values(extras).some(v => v === true)) {
      if (extras.heater) {
        const selectedHeater = poolHeaters.find(h => h.name === extras.heaterModel);
        if (selectedHeater) poolItems.push({
          name: selectedHeater.name,
          price: selectedHeater.price,
          image: selectedHeater.image,
          category: 'Pool Heater'
        });
      }

      if (extras.jets) {
        poolItems.push({
          name: `Spa Jets (${extras.jetQuantity}x)`,
          price: getExtraPrice('jets') * extras.jetQuantity,
          image: pool.image,
          category: 'Pool Jets'
        });
      }

      if (extras.cover) {
        const cover = coverOptions.find(c => c.name === extras.coverOption);
        if (cover) poolItems.push({
          name: cover.name,
          price: cover.price,
          image: cover.image,
          category: 'Pool Cover'
        });
      }

      if (extras.spa) {
        const spa = spas.find((s: any) => s.model === extras.spaModel);
        if (spa) poolItems.push({
          name: spa.model,
          price: spa.price,
          image: spa.image,
          category: 'Spa'
        });
      }

      if (extras.tanningLedge) {
        const ledge = tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel);
        if (ledge) poolItems.push({
          name: ledge.name,
          price: ledge.price,
          image: ledge.image,
          category: 'Tanning Ledge'
        });
      }
    }

    // Belgard items
    Object.entries(belgardExtras.selectedProducts)
      .filter(([_, selected]) => selected)
      .forEach(([productId]) => {
        const product = belgardProducts.find(p => p.id === productId);
        if (!product) return;

        const quantity = belgardExtras.quantities[productId] || 1;
        const dimensions = belgardExtras.dimensions[productId];
        
        belgardItems.push({
          name: product.name,
          category: product.category,
          collection: product.collection,
          price: product.price,
          quantity,
          dimensions,
          totalPrice: product.price * quantity * (dimensions?.area || 1),
          description: product.description
        });
      });

    const quote = {
      type: 'wonderlands-complete',
      timestamp: new Date().toISOString(),
      quoteId: `WONDERLANDS-${Date.now()}`,
      pool: pool,
      poolExtras: extras,
      poolItems,
      belgardItems,
      totalPrice: calculateTotalPrice(),
      notes: belgardExtras.notes,
      estimatedInstallation: '3-6 weeks',
      warranty: 'Varies by product'
    };

    localStorage.setItem('wonderlands-quote', JSON.stringify(quote));
    
    // Generate comprehensive quote window
    const quoteWindow = window.open('', '_blank');
    if (quoteWindow) {
      quoteWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Wonderlands Complete Quote - ${quote.quoteId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 40px; }
            .item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
            .total { font-size: 20px; font-weight: bold; margin-top: 30px; }
            h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Wonderlands Studio Complete Quote</h1>
            <p>Quote ID: ${quote.quoteId}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${poolItems.length > 0 ? `
            <div class="section">
              <h2>Pool Configuration</h2>
              <div class="item">
                <h3>${pool.model}</h3>
                <p><strong>Base Price:</strong> $${pool.price.toFixed(2)}</p>
                <p><strong>Category:</strong> ${pool.category}</p>
                ${pool.dimensions ? `<p><strong>Dimensions:</strong> ${pool.dimensions}</p>` : ''}
              </div>
              ${poolItems.map(item => `
                <div class="item">
                  <h3>${item.name}</h3>
                  <p><strong>Category:</strong> ${item.category}</p>
                  <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
                </div>
              `).join('')}
              <p><strong>Pool Total:</strong> $${calculatePoolTotalPrice().toFixed(2)}</p>
            </div>
          ` : ''}
          
          ${belgardItems.length > 0 ? `
            <div class="section">
              <h2>Belgard Hardscape Products</h2>
              ${belgardItems.map(item => `
                <div class="item">
                  <h3>${item.name}</h3>
                  <p><strong>Category:</strong> ${item.category}</p>
                  ${item.collection ? `<p><strong>Collection:</strong> ${item.collection}</p>` : ''}
                  <p><strong>Unit Price:</strong> $${item.price.toFixed(2)}</p>
                  <p><strong>Quantity:</strong> ${item.quantity}</p>
                  ${item.dimensions ? `<p><strong>Dimensions:</strong> ${item.dimensions.length}' × ${item.dimensions.width}' (${item.dimensions.area} sq ft)</p>` : ''}
                  <p><strong>Total:</strong> $${item.totalPrice.toFixed(2)}</p>
                  ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
                </div>
              `).join('')}
              <p><strong>Belgard Total:</strong> $${calculateBelgardTotalPrice().toFixed(2)}</p>
            </div>
          ` : ''}
          
          <div class="total">
            Grand Total: $${quote.totalPrice.toFixed(2)}
          </div>
          ${quote.notes ? `<p><strong>Notes:</strong> ${quote.notes}</p>` : ''}
          <p><strong>Estimated Installation:</strong> ${quote.estimatedInstallation}</p>
          <p><strong>Warranty:</strong> ${quote.warranty}</p>
        </body>
        </html>
      `);
      quoteWindow.document.close();
    }

    toast({
      title: "Quote Generated",
      description: "Your comprehensive Wonderlands quote has been generated and opened in a new window.",
    });
  };

  // Add to cart function
  const handleAddToCart = () => {
    const cartItems = [];

    // Add pool configuration if selected
    if (studioType === 'pools' || Object.values(extras).some(v => v === true)) {
      const poolExtras = [];
      
      if (extras.heater) {
        const heater = poolHeaters.find(h => h.name === extras.heaterModel);
        if (heater) poolExtras.push({
          name: heater.name,
          price: heater.price
        });
      }

      if (extras.jets) {
        poolExtras.push({
          name: `Spa Jets (${extras.jetQuantity}x)`,
          price: getExtraPrice('jets') * extras.jetQuantity
        });
      }

      if (extras.cover) {
        const cover = coverOptions.find(c => c.name === extras.coverOption);
        if (cover) poolExtras.push({
          name: cover.name,
          price: cover.price
        });
      }

      if (extras.spa) {
        const spa = spas.find((s: any) => s.model === extras.spaModel);
        if (spa) poolExtras.push({
          name: spa.model,
          price: spa.price
        });
      }

      if (extras.tanningLedge) {
        const ledge = tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel);
        if (ledge) poolExtras.push({
          name: ledge.name,
          price: ledge.price
        });
      }

      cartItems.push({
        id: `${pool.model}_${Date.now()}`,
        name: pool.model,
        price: pool.price,
        category: pool.category,
        image: pool.image,
        extras: poolExtras
      });
    }

    // Add Belgard products
    const selectedBelgardItems = Object.entries(belgardExtras.selectedProducts)
      .filter(([_, selected]) => selected)
      .map(([productId]) => {
        const product = belgardProducts.find(p => p.id === productId);
        if (!product) return null;

        const quantity = belgardExtras.quantities[productId] || 1;
        const dimensions = belgardExtras.dimensions[productId];
        const totalPrice = product.price * quantity * (dimensions?.area || 1);

        return {
          id: product.id,
          name: `${product.name}${dimensions ? ` (${dimensions.length}'×${dimensions.width}')` : ''}`,
          price: totalPrice,
          category: product.category,
          image: product.image_url,
          quantity: 1,
          extras: [{
            name: 'Configuration',
            price: 0
          }]
        };
      })
      .filter(Boolean);

    cartItems.push(...selectedBelgardItems);

    if (cartItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please configure at least one pool or Belgard product to add to cart.",
        variant: "destructive"
      });
      return;
    }

    cartItems.forEach(item => {
      if (item) addToCart(item);
    });

    toast({
      title: "Added to Cart",
      description: `${cartItems.length} item(s) added to your cart`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Wonderlands Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-sm"
              >
                ← Back to Home
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-coral to-teal bg-clip-text text-transparent">
                Wonderlands Studio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-primary">
                  ${calculateTotalPrice().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Studio Type Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Studio Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={studioType === 'pools' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setStudioType('pools')}
                >
                  <Waves className="h-4 w-4 mr-3" />
                  Pool Configuration
                </Button>
                <Button
                  variant={studioType === 'belgard' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setStudioType('belgard')}
                >
                  <Package className="h-4 w-4 mr-3" />
                  Belgard Hardscape
                </Button>
              </CardContent>
            </Card>

            {studioType === 'belgard' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="text-sm">{category.name}</span>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Configuration Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {studioType === 'pools' && (
                    <>
                      <div className="flex justify-between">
                        <span>Pool Model:</span>
                        <span>{pool.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pool Price:</span>
                        <span>${calculatePoolTotalPrice().toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {studioType === 'belgard' && (
                    <>
                      <div className="flex justify-between">
                        <span>Selected Products:</span>
                        <span>{Object.values(belgardExtras.selectedProducts).filter(Boolean).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Area:</span>
                        <span>
                          {Object.entries(belgardExtras.selectedProducts)
                            .filter(([_, selected]) => selected)
                            .reduce((total, [productId]) => {
                              const dimensions = belgardExtras.dimensions[productId];
                              return total + (dimensions?.area || 0);
                            }, 0)} sq ft
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Belgard Total:</span>
                        <span>${calculateBelgardTotalPrice().toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Grand Total:</span>
                    <span>${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    onClick={generateQuote}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Quote
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    className="w-full"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {studioType === 'pools' ? (
              <div className="space-y-6">
                {/* Pool Configuration Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <img 
                        src={getCurrentImage() || pool.image} 
                        alt={pool.model}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-2xl font-bold">{pool.model}</h3>
                        <Badge className={getCategoryColor(pool.category)}>
                          {pool.category.charAt(0).toUpperCase() + pool.category.slice(1)}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Pool Extras Configuration */}
                      <div className="space-y-3">
                        {/* Heater */}
                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox 
                            checked={extras.heater} 
                            onCheckedChange={() => toggleExtra('heater')} 
                          />
                          <div className="flex items-center space-x-1">
                            <Thermometer size={16} className="text-orange" />
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
                                  onClick={() => setExtras(prev => ({
                                    ...prev,
                                    heaterModel: heater.name
                                  }))}
                                  className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                    extras.heaterModel === heater.name ? 
                                    'border-primary bg-primary/10 text-primary' : 
                                    'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <img src={heater.image} alt={heater.name} className="w-8 h-8 rounded object-cover" />
                                  <div className="flex-1 text-left">
                                    <div>{heater.name}</div>
                                    <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cover */}
                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox 
                            checked={extras.cover} 
                            onCheckedChange={() => toggleExtra('cover')} 
                          />
                          <div className="flex items-center space-x-1">
                            <Shield size={16} className="text-primary" />
                            <span className="text-sm">Add Pool Cover (+{extras.cover ? (() => {
                              const selectedCover = coverOptions.find(cover => cover.name === extras.coverOption);
                              return selectedCover ? `$${selectedCover.price.toLocaleString()}` : '$0';
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
                                  onClick={() => setExtras(prev => ({
                                    ...prev,
                                    coverOption: cover.name
                                  }))}
                                  className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                    extras.coverOption === cover.name ? 
                                    'border-primary bg-primary/10 text-primary' : 
                                    'border-border hover:border-primary/50'
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
                                  onClick={() => setExtras(prev => ({
                                    ...prev,
                                    spaModel: spa.model
                                  }))}
                                  className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                    extras.spaModel === spa.model ? 
                                    'border-primary bg-primary/10 text-primary' : 
                                    'border-border hover:border-primary/50'
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
                                  onClick={() => setExtras(prev => ({
                                    ...prev,
                                    tanningLedgeModel: ledge.name
                                  }))}
                                  className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                    extras.tanningLedgeModel === ledge.name ? 
                                    'border-coral bg-coral/10 text-coral' : 
                                    'border-border hover:border-coral/50'
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

                        {/* Spa Jets */}
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                          <label className="flex items-center space-x-2 cursor-pointer flex-1">
                            <Checkbox 
                              checked={extras.jets} 
                              onCheckedChange={() => toggleExtra('jets')} 
                            />
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
                                onClick={() => setExtras(prev => ({
                                  ...prev,
                                  jetQuantity: Math.max(1, prev.jetQuantity - 1)
                                }))}
                                className="h-8 w-8 p-0"
                              >
                                -
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{extras.jetQuantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExtras(prev => ({
                                  ...prev,
                                  jetQuantity: prev.jetQuantity + 1
                                }))}
                                className="h-8 w-8 p-0"
                              >
                                +
                              </Button>
                            </div>
                          )}
                        </div>

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
                                      onClick={() => setExtras(prev => ({
                                        ...prev,
                                        tileOption: tile.name
                                      }))}
                                    >
                                      <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                        <img 
                                          src={tile.image} 
                                          alt={tile.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      </div>
                                      <div className="flex-1 flex flex-col justify-between min-h-0">
                                        <p className="text-xs font-medium text-center line-clamp-2">{tile.name}</p>
                                        {tile.price > 0 && (
                                          <p className="text-xs text-primary font-semibold text-center mt-1">
                                            +${tile.price.toLocaleString()}
                                          </p>
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
                        )}

                        {/* Make it on Concrete */}
                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox 
                            checked={extras.concreteConstruction} 
                            onCheckedChange={() => toggleExtra('concreteConstruction')} 
                            className="data-[state=checked]:bg-coral data-[state=checked]:border-coral" 
                          />
                          <div className="flex items-center space-x-1">
                            <Shield size={16} className="text-coral" />
                            <span className="text-sm">Make it on Concrete (+${Math.round(pool.price * 0.2).toLocaleString()})</span>
                          </div>
                        </label>
                        {extras.concreteConstruction && (
                          <p className="text-xs text-muted-foreground ml-6 mt-1">
                            Premium concrete construction for enhanced durability and longevity.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Configuration Price */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg border border-primary/30">
                      <div className="text-center">
                        <h5 className="text-sm font-medium text-muted-foreground">Pool Configuration Total</h5>
                        <div className="text-2xl font-bold text-foreground">${calculatePoolTotalPrice().toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Belgard Content
              <>
                {selectedCategory === 'scene' ? (
                  <Belgard3DVisualizer />
                ) : (
                  <>
                    {/* Search */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={`Search ${categories.find(c => c.id === selectedCategory)?.name || 'products'}...`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="aspect-video bg-muted relative">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Package className="h-12 w-12" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Checkbox
                                checked={belgardExtras.selectedProducts[product.id] || false}
                                onCheckedChange={() => toggleBelgardProduct(product.id)}
                                className="bg-background/80 backdrop-blur-sm"
                              />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                                {product.collection && (
                                  <p className="text-sm text-muted-foreground">{product.collection}</p>
                                )}
                                <p className="text-lg font-bold text-primary">
                                  ${product.price.toFixed(2)}
                                </p>
                              </div>

                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.description}
                                </p>
                              )}

                              {belgardExtras.selectedProducts[product.id] && (
                                <div className="space-y-2 pt-2 border-t">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs text-muted-foreground">Length (ft)</label>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={belgardExtras.dimensions[product.id]?.length || 10}
                                        onChange={(e) => updateBelgardDimensions(product.id, 'length', parseInt(e.target.value) || 1)}
                                        className="h-8"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Width (ft)</label>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={belgardExtras.dimensions[product.id]?.width || 10}
                                        onChange={(e) => updateBelgardDimensions(product.id, 'width', parseInt(e.target.value) || 1)}
                                        className="h-8"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Quantity</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={belgardExtras.quantities[product.id] || 1}
                                      onChange={(e) => updateBelgardQuantity(product.id, parseInt(e.target.value) || 1)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="text-sm font-semibold text-right">
                                    Area: {belgardExtras.dimensions[product.id]?.area || 100} sq ft
                                  </div>
                                  <div className="text-sm font-semibold text-right text-primary">
                                    Total: ${(
                                      product.price * 
                                      (belgardExtras.quantities[product.id] || 1) * 
                                      (belgardExtras.dimensions[product.id]?.area || 100)
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
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

export default WonderlandsStudio;