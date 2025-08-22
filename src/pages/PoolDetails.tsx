import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award, Palette, Camera, Layers, Plus, Minus, Download, Printer, ShoppingCart as CartIcon, Search } from "lucide-react";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { useShoppingCart } from "@/components/ShoppingCart";
import { spas } from "@/components/PoolCatalog";
import { tanningLedges, poolLiners, poolTiles } from "@/data/poolData";
import { poolFinishes as poolFinishesData } from '@/components/PoolFinishesSection';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import oceanBlueFinish from '@/assets/finishes/ocean-blue-g3.jpg';
import sapphireBlueFinish from '@/assets/finishes/sapphire-blue-g3.jpg';
import nightSkyFinish from '@/assets/finishes/night-sky-g3.jpg';
import athensPearlFinish from '@/assets/finishes/athens-pearl-white-g3.jpg';
import lagoonBlueFinish from '@/assets/finishes/lagoon-blue-g2.jpg';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.jpg';
import coastalBronzeFinish from '@/assets/finishes/coastal-bronze-g3.jpg';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.jpg';

interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
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
  paverOption: string;
  copingPaverOption: string;
}

// Pool heater options
const poolHeaters = [
  { name: 'Heat Pump - Eco Series', price: 4500, image: azureBlueFinish, description: 'Energy-efficient heat pump, ideal for mild climates' },
  { name: 'Heat Pump - Pro Series', price: 5500, image: oceanBlueFinish, description: 'Professional grade heat pump with advanced controls' },
  { name: 'Gas Heater - Standard', price: 3200, image: sapphireBlueFinish, description: 'Traditional gas heater for quick heating' },
  { name: 'Gas Heater - High Efficiency', price: 4200, image: nightSkyFinish, description: 'High-efficiency gas heater with digital controls' },
  { name: 'Solar Heater - Basic', price: 2800, image: lagoonBlueFinish, description: 'Eco-friendly solar heating system' },
  { name: 'Solar Heater - Premium', price: 3800, image: coastalBronzeFinish, description: 'Advanced solar system with backup heating' }
];

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
const linerOptions = [
  { name: 'Standard Blue', color: '#4169E1', price: 0, image: azureBlueFinish, type: 'Standard', description: undefined },
  ...poolLiners.map(liner => ({
    name: liner.name,
    color: '#4169E1',
    price: liner.price,
    image: liner.image,
    type: liner.type,
    description: liner.description
  }))
];

// Cover options
const coverOptions = [
  { name: 'Eclipse Automatic Cover', color: '#2F4F4F', price: 16000, image: nightSkyFinish, category: 'cover', description: 'Premium automatic pool cover with solar heating' },
  { name: 'CS3000 Safety Cover', color: '#2F4F4F', price: 24000, image: shaleGrayFinish, category: 'cover', description: 'Heavy-duty safety cover with anchoring system' },
  { name: 'Infinity 4000 Smart Cover', color: '#2F4F4F', price: 32000, image: coastalBronzeFinish, category: 'cover', description: 'Smart automated cover with app control' },
  { name: 'Atom Loop-Loc Cover', color: '#2F4F4F', price: 19000, image: aquamarineFinish, category: 'cover', description: 'Mesh safety cover for all seasons' }
];

// Convert pool tiles to tile options format
const tileOptions = [
  { name: 'Standard Waterline', color: '#4682B4', price: 0, image: azureBlueFinish, description: undefined },
  ...poolTiles.map(tile => ({
    name: tile.name,
    color: '#4682B4',
    price: tile.price,
    image: tile.image,
    description: tile.description
  }))
];

// Paver options
const paverOptions = [
  { name: 'Standard Concrete', color: '#D3D3D3', price: 0, image: azureBlueFinish, description: 'Basic concrete pavers around pool perimeter' },
  { name: 'Natural Stone', color: '#8B7355', price: 2500, image: shaleGrayFinish, description: 'Premium natural stone pavers' },
  { name: 'Travertine', color: '#F5DEB3', price: 3200, image: athensPearlFinish, description: 'Elegant travertine paving stones' },
  { name: 'Brick Pavers', color: '#B22222', price: 2800, image: coastalBronzeFinish, description: 'Classic brick paver design' }
];

// Coping paver options
const copingPaverOptions = [
  { name: 'Standard Pool Coping', color: '#A9A9A9', price: 0, image: azureBlueFinish, description: 'Basic pool edge coping' },
  { name: 'Bullnose Coping', color: '#696969', price: 1500, image: nightSkyFinish, description: 'Rounded edge bullnose coping' },
  { name: 'Natural Stone Coping', color: '#708090', price: 2200, image: shaleGrayFinish, description: 'Premium natural stone pool edge' },
  { name: 'Cantilever Coping', color: '#2F4F4F', price: 1800, image: sapphireBlueFinish, description: 'Modern cantilever edge design' }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
    case 'compact': return 'bg-gradient-to-r from-teal to-primary';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getExtraPrice = (extra: string) => {
  switch (extra) {
    case 'jets': return 1800;
    default: return 0;
  }
};

type ActivePanel = 'finishes' | 'liners' | 'pavers' | 'coping' | 'covers' | 'heaters' | 'spas' | 'tanning' | 'jets' | 'tiles' | null;

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
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([]);
  const [searchResults, setSearchResults] = useState<MarketplaceProduct[]>([]);

  // Parse pool data from URL params
  const pool: Pool = {
    model: searchParams.get('model') || 'Pool Model',
    price: parseInt(searchParams.get('price') || '0'),
    category: (searchParams.get('category') as Pool['category']) || 'standard',
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
    linerOption: 'Standard Blue',
    coverOption: 'Eclipse Automatic Cover',
    tiles: false,
    tileOption: 'Standard Waterline',
    spa: false,
    spaModel: 'Mystic',
    tanningLedge: false,
    tanningLedgeModel: tanningLedges[0]?.name || 'Genesis',
    heaterModel: poolHeaters[0]?.name || 'Heat Pump - Eco Series',
    paverOption: 'Standard Concrete',
    copingPaverOption: 'Standard Pool Coping'
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

  // Save selections to cache whenever extras change
  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(extras));
  }, [extras, cacheKey]);

  const calculateTotalPrice = () => {
    let total = pool.price;
    
    if (extras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }
    if (extras.jets) total += getExtraPrice('jets') * extras.jetQuantity;
    
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) total += linerOption.price;
    
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) total += tileOption.price;
    
    const coverOption = coverOptions.find(option => option.name === extras.coverOption);
    if (coverOption && extras.cover) total += coverOption.price;

    const paverOption = paverOptions.find(option => option.name === extras.paverOption);
    if (paverOption) total += paverOption.price;

    const copingPaverOption = copingPaverOptions.find(option => option.name === extras.copingPaverOption);
    if (copingPaverOption) total += copingPaverOption.price;
    
    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) total += selectedSpa.price;
    }

    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) total += selectedLedge.price;
    }
    
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

  const handleAddToCart = () => {
    const selectedExtras = [];

    if (extras.heater) {
      const heater = poolHeaters.find(h => h.name === extras.heaterModel);
      if (heater) selectedExtras.push({ name: heater.name, price: heater.price });
    }

    if (extras.jets) {
      selectedExtras.push({ name: `Spa Jets (${extras.jetQuantity}x)`, price: getExtraPrice('jets') * extras.jetQuantity });
    }

    if (extras.cover) {
      const cover = coverOptions.find(c => c.name === extras.coverOption);
      if (cover) selectedExtras.push({ name: cover.name, price: cover.price });
    }

    if (extras.spa) {
      const spa = spas.find((s: any) => s.model === extras.spaModel);
      if (spa) selectedExtras.push({ name: spa.model, price: spa.price });
    }

    if (extras.tanningLedge) {
      const ledge = tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel);
      if (ledge) selectedExtras.push({ name: ledge.name, price: ledge.price });
    }

    // Add mandatory selections
    const liner = linerOptions.find(l => l.name === extras.linerOption);
    if (liner && liner.price > 0) selectedExtras.push({ name: liner.name, price: liner.price });

    const paver = paverOptions.find(p => p.name === extras.paverOption);
    if (paver && paver.price > 0) selectedExtras.push({ name: paver.name, price: paver.price });

    const coping = copingPaverOptions.find(c => c.name === extras.copingPaverOption);
    if (coping && coping.price > 0) selectedExtras.push({ name: coping.name, price: coping.price });

    if (extras.tiles) {
      const tile = tileOptions.find(t => t.name === extras.tileOption);
      if (tile && tile.price > 0) selectedExtras.push({ name: tile.name, price: tile.price });
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
    const { pool, extras, totalPrice, quoteId, timestamp } = quoteData;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pool Quote - ${quoteId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .quote-id { color: #666; font-size: 14px; }
            .pool-details { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .extras-list { margin: 20px 0; }
            .extra-item { padding: 10px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; }
            .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pool Configuration Quote</h1>
            <p class="quote-id">Quote ID: ${quoteId}</p>
            <p class="quote-id">Generated: ${new Date(timestamp).toLocaleString()}</p>
          </div>

          <div class="pool-details">
            <h2>${pool.model}</h2>
            <p><strong>Category:</strong> ${pool.category}</p>
            <p><strong>Base Price:</strong> $${pool.price.toLocaleString()}</p>
            ${pool.dimensions ? `<p><strong>Dimensions:</strong> ${pool.dimensions}</p>` : ''}
            ${pool.depth ? `<p><strong>Depth:</strong> ${pool.depth}</p>` : ''}
          </div>

          <div class="extras-list">
            <h3>Selected Options & Add-ons:</h3>
            <div class="extra-item">
              <span>Liner: ${extras.linerOption}</span>
              <span>$${linerOptions.find(l => l.name === extras.linerOption)?.price.toLocaleString() || '0'}</span>
            </div>
            <div class="extra-item">
              <span>Pavers: ${extras.paverOption}</span>
              <span>$${paverOptions.find(p => p.name === extras.paverOption)?.price.toLocaleString() || '0'}</span>
            </div>
            <div class="extra-item">
              <span>Coping: ${extras.copingPaverOption}</span>
              <span>$${copingPaverOptions.find(c => c.name === extras.copingPaverOption)?.price.toLocaleString() || '0'}</span>
            </div>
            ${extras.heater ? `
              <div class="extra-item">
                <span>Heater: ${extras.heaterModel}</span>
                <span>$${poolHeaters.find(h => h.name === extras.heaterModel)?.price.toLocaleString() || '0'}</span>
              </div>` : ''}
            ${extras.cover ? `
              <div class="extra-item">
                <span>Cover: ${extras.coverOption}</span>
                <span>$${coverOptions.find(c => c.name === extras.coverOption)?.price.toLocaleString() || '0'}</span>
              </div>` : ''}
            ${extras.jets ? `
              <div class="extra-item">
                <span>Spa Jets (${extras.jetQuantity}x)</span>
                <span>$${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()}</span>
              </div>` : ''}
            ${extras.spa ? `
              <div class="extra-item">
                <span>Spa: ${extras.spaModel}</span>
                <span>$${spas.find((s: any) => s.model === extras.spaModel)?.price.toLocaleString() || '0'}</span>
              </div>` : ''}
            ${extras.tanningLedge ? `
              <div class="extra-item">
                <span>Tanning Ledge: ${extras.tanningLedgeModel}</span>
                <span>$${tanningLedges.find((l: any) => l.name === extras.tanningLedgeModel)?.price.toLocaleString() || '0'}</span>
              </div>` : ''}
            ${extras.tiles ? `
              <div class="extra-item">
                <span>Tiles: ${extras.tileOption}</span>
                <span>$${tileOptions.find(t => t.name === extras.tileOption)?.price.toLocaleString() || '0'}</span>
              </div>` : ''}
          </div>

          <div class="total">
            <p>Total Quote: $${totalPrice.toLocaleString()}</p>
          </div>

          <div class="footer">
            <p>This quote is valid for 30 days from the generation date.</p>
            <p>Contact us for financing options and installation scheduling.</p>
          </div>

          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
              }, 500);
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

  const toggleExtra = (extra: keyof PoolExtras, value?: any) => {
    setExtras(prev => ({
      ...prev,
      [extra]: value !== undefined ? value : !prev[extra]
    }));
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = marketplaceProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, marketplaceProducts]);

  const filteredOptions = (options: any[], query: string) => {
    if (!query) return options;
    return options.filter(option => 
      option.name.toLowerCase().includes(query.toLowerCase()) ||
      (option.description && option.description.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const getSelectedFeatureIcons = () => {
    const features = [];
    if (extras.heater) features.push({ icon: Thermometer, label: 'Heater' });
    if (extras.cover) features.push({ icon: Shield, label: 'Cover' });
    if (extras.spa) features.push({ icon: Waves, label: 'Spa' });
    if (extras.tanningLedge) features.push({ icon: Sun, label: 'Tanning Ledge' });
    if (extras.jets) features.push({ icon: Zap, label: 'Jets' });
    if (extras.tiles) features.push({ icon: Layers, label: 'Tiles' });
    return features;
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
      {/* Top Header with Price */}
      <div className="h-20 border-b flex items-center justify-between px-6 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <X className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Editor Studio</h1>
            <p className="text-sm text-muted-foreground">{pool.model}</p>
          </div>
          <Badge className={getCategoryColor(pool.category)}>{pool.category}</Badge>
        </div>
        
        {/* Always Visible Price */}
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            ${calculateTotalPrice().toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Base: ${pool.price.toLocaleString()} + ${(calculateTotalPrice() - pool.price).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-8rem)]">
        {/* Fixed Pool Image */}
        <div className="flex-1 flex items-center justify-center bg-muted p-8">
          <div className="w-[600px] h-[400px] relative">
            <img
              src={getCurrentImage()}
              alt={pool.model}
              className="w-full h-full object-cover rounded-lg border shadow-lg"
            />
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md">
              <p className="text-sm font-medium">{pool.model}</p>
              <p className="text-xs text-muted-foreground">{pool.dimensions || 'Custom Pool'}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Right Sidebar - All Categories & Search */}
        <div className="w-96 border-l bg-background flex flex-col">
          {/* Search Engine */}
          <div className="p-4 border-b">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search marketplace products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant={activePanel === 'finishes' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'finishes' ? null : 'finishes')}
              >
                <Palette className="h-3 w-3 mr-1" />
                Finishes
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'liners' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'liners' ? null : 'liners')}
              >
                <Layers className="h-3 w-3 mr-1" />
                Liners
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'pavers' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'pavers' ? null : 'pavers')}
              >
                <Shield className="h-3 w-3 mr-1" />
                Pavers
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'coping' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'coping' ? null : 'coping')}
              >
                <Award className="h-3 w-3 mr-1" />
                Coping
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'covers' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'covers' ? null : 'covers')}
              >
                <Shield className="h-3 w-3 mr-1" />
                Covers
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'heaters' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'heaters' ? null : 'heaters')}
              >
                <Thermometer className="h-3 w-3 mr-1" />
                Heaters
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'spas' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'spas' ? null : 'spas')}
              >
                <Waves className="h-3 w-3 mr-1" />
                Spas
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'tanning' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'tanning' ? null : 'tanning')}
              >
                <Sun className="h-3 w-3 mr-1" />
                Tanning
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'jets' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'jets' ? null : 'jets')}
              >
                <Zap className="h-3 w-3 mr-1" />
                Jets
              </Button>
              <Button 
                size="sm" 
                variant={activePanel === 'tiles' ? 'default' : 'outline'} 
                onClick={() => setActivePanel(activePanel === 'tiles' ? null : 'tiles')}
              >
                <Layers className="h-3 w-3 mr-1" />
                Tiles
              </Button>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-auto">
            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {searchResults.map((product) => (
                    <div 
                      key={product.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          category: product.category || 'marketplace',
                          image: product.image_url,
                          extras: []
                        });
                        toast({ title: "Added to Cart", description: `${product.name} has been added to your cart!` });
                      }}
                    >
                      <div className="flex gap-3">
                        {product.image_url && (
                          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          {product.brand && <p className="text-xs text-primary">{product.brand}</p>}
                          <p className="text-xs font-semibold">${product.price.toLocaleString()}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Options */}
            {activePanel && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {activePanel === 'finishes' && 'Pool Finishes'}
                    {activePanel === 'liners' && 'Pool Liners'}
                    {activePanel === 'pavers' && 'Pavers'}
                    {activePanel === 'coping' && 'Coping Pavers'}
                    {activePanel === 'covers' && 'Pool Covers'}
                    {activePanel === 'heaters' && 'Pool Heaters'}
                    {activePanel === 'spas' && 'Spa Options'}
                    {activePanel === 'tanning' && 'Tanning Ledges'}
                    {activePanel === 'jets' && 'Spa Jets'}
                    {activePanel === 'tiles' && 'Pool Tiles'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Finishes */}
                  {activePanel === 'finishes' && filteredOptions(finishOptions, searchQuery).map((finish) => (
                    <div 
                      key={finish.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setExtras(prev => ({ ...prev, finish: finish.name }))}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={finish.image} alt={finish.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{finish.name}</p>
                          <p className="text-xs text-primary">{finish.collection}</p>
                          {finish.price && (
                            <p className="text-xs font-semibold">+${finish.price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Liners */}
                  {activePanel === 'liners' && filteredOptions(linerOptions, searchQuery).map((liner) => (
                    <div 
                      key={liner.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setExtras(prev => ({ ...prev, linerOption: liner.name }))}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={liner.image} alt={liner.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{liner.name}</p>
                          {liner.type && liner.type !== 'Standard' && (
                            <p className="text-xs text-primary">{liner.type}</p>
                          )}
                          {liner.price > 0 && (
                            <p className="text-xs font-semibold">+${liner.price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pavers */}
                  {activePanel === 'pavers' && filteredOptions(paverOptions, searchQuery).map((paver) => (
                    <div 
                      key={paver.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.paverOption === paver.name ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setExtras(prev => ({ ...prev, paverOption: paver.name }))}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={paver.image} alt={paver.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{paver.name}</p>
                          {paver.price > 0 && (
                            <p className="text-xs font-semibold">+${paver.price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Coping */}
                  {activePanel === 'coping' && filteredOptions(copingPaverOptions, searchQuery).map((coping) => (
                    <div 
                      key={coping.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.copingPaverOption === coping.name ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setExtras(prev => ({ ...prev, copingPaverOption: coping.name }))}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={coping.image} alt={coping.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{coping.name}</p>
                          {coping.price > 0 && (
                            <p className="text-xs font-semibold">+${coping.price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Covers */}
                  {activePanel === 'covers' && filteredOptions(coverOptions, searchQuery).map((cover) => (
                    <div 
                      key={cover.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.coverOption === cover.name && extras.cover ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => {
                        setExtras(prev => ({ ...prev, coverOption: cover.name, cover: true }));
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={cover.image} alt={cover.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cover.name}</p>
                          <p className="text-xs font-semibold">+${cover.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground truncate">{cover.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Heaters */}
                  {activePanel === 'heaters' && filteredOptions(poolHeaters, searchQuery).map((heater) => (
                    <div 
                      key={heater.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.heaterModel === heater.name && extras.heater ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => {
                        setExtras(prev => ({ ...prev, heaterModel: heater.name, heater: true }));
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={heater.image} alt={heater.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{heater.name}</p>
                          <p className="text-xs font-semibold">+${heater.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground truncate">{heater.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Spas */}
                  {activePanel === 'spas' && filteredOptions(spas, searchQuery).map((spa: any) => (
                    <div 
                      key={spa.model}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.spaModel === spa.model && extras.spa ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => {
                        setExtras(prev => ({ ...prev, spaModel: spa.model, spa: true }));
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={spa.image} alt={spa.model} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{spa.model}</p>
                          <p className="text-xs font-semibold">+${spa.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground truncate">{spa.features}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tanning Ledges */}
                  {activePanel === 'tanning' && filteredOptions(tanningLedges, searchQuery).map((ledge: any) => (
                    <div 
                      key={ledge.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.tanningLedgeModel === ledge.name && extras.tanningLedge ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => {
                        setExtras(prev => ({ ...prev, tanningLedgeModel: ledge.name, tanningLedge: true }));
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={ledge.image} alt={ledge.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ledge.name}</p>
                          <p className="text-xs font-semibold">+${ledge.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground truncate">{ledge.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tiles */}
                  {activePanel === 'tiles' && filteredOptions(tileOptions, searchQuery).map((tile) => (
                    <div 
                      key={tile.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        extras.tileOption === tile.name && extras.tiles ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => {
                        setExtras(prev => ({ ...prev, tileOption: tile.name, tiles: true }));
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={tile.image} alt={tile.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tile.name}</p>
                          {tile.price > 0 && (
                            <p className="text-xs font-semibold">+${tile.price.toLocaleString()}</p>
                          )}
                          {tile.description && (
                            <p className="text-xs text-muted-foreground truncate">{tile.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Jets - Special handling for quantity */}
                  {activePanel === 'jets' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Spa Jets</p>
                          <p className="text-xs text-muted-foreground">Premium spa jets for relaxation</p>
                          <p className="text-xs font-semibold">${getExtraPrice('jets').toLocaleString()} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setExtras(prev => ({ ...prev, jetQuantity: Math.max(1, prev.jetQuantity - 1) }))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm px-2 py-1 bg-muted rounded">{extras.jetQuantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setExtras(prev => ({ ...prev, jetQuantity: prev.jetQuantity + 1 }))}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        variant={extras.jets ? "default" : "outline"}
                        onClick={() => toggleExtra('jets')}
                      >
                        {extras.jets ? 'Remove Jets' : 'Add Jets'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!activePanel && !searchQuery && (
              <div className="p-4">
                <h3 className="font-semibold mb-4">Current Configuration</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pool Model:</span>
                    <span className="font-medium">{pool.model}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Base Price:</span>
                    <span className="font-medium">${pool.price.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Liner:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{extras.linerOption}</span>
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('liners')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Pavers:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{extras.paverOption}</span>
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('pavers')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Coping:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{extras.copingPaverOption}</span>
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('coping')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  <h4 className="font-medium">Optional Add-ons</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant={extras.heater ? "default" : "outline"}
                        onClick={() => toggleExtra('heater')}
                      >
                        <Thermometer className="h-3 w-3 mr-1" />
                        Heater
                      </Button>
                      {extras.heater && (
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('heaters')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant={extras.cover ? "default" : "outline"}
                        onClick={() => toggleExtra('cover')}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Cover
                      </Button>
                      {extras.cover && (
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('covers')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant={extras.spa ? "default" : "outline"}
                        onClick={() => toggleExtra('spa')}
                      >
                        <Waves className="h-3 w-3 mr-1" />
                        Spa
                      </Button>
                      {extras.spa && (
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('spas')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant={extras.tanningLedge ? "default" : "outline"}
                        onClick={() => toggleExtra('tanningLedge')}
                      >
                        <Sun className="h-3 w-3 mr-1" />
                        Tanning Ledge
                      </Button>
                      {extras.tanningLedge && (
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('tanning')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant={extras.jets ? "default" : "outline"}
                        onClick={() => toggleExtra('jets')}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Jets
                      </Button>
                      {extras.jets && (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => setExtras(prev => ({ ...prev, jetQuantity: Math.max(1, prev.jetQuantity - 1) }))}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs px-2">{extras.jetQuantity}</span>
                          <Button size="sm" variant="outline" onClick={() => setExtras(prev => ({ ...prev, jetQuantity: prev.jetQuantity + 1 }))}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant={extras.tiles ? "default" : "outline"}
                        onClick={() => toggleExtra('tiles')}
                      >
                        <Layers className="h-3 w-3 mr-1" />
                        Tiles
                      </Button>
                      {extras.tiles && (
                        <Button size="sm" variant="ghost" onClick={() => setActivePanel('tiles')}>
                          <Camera className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Dashboard */}
      <div className="h-20 border-t bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Circular Feature Snapshots */}
          <div className="flex items-center gap-2">
            {getSelectedFeatureIcons().map((feature, index) => (
              <div key={index} className="relative group">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-background border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {feature.label}
                </div>
              </div>
            ))}
          </div>
          
          {/* Finance This Purchase Button */}
          <Button variant="outline" className="bg-gradient-to-r from-primary to-secondary text-white border-0">
            <DollarSign className="h-4 w-4 mr-2" />
            Finance This Purchase
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={downloadQuote}>
            <Download className="h-4 w-4 mr-2" />
            Download Quote
          </Button>
          
          <Button variant="outline" onClick={generateQuote}>
            <Printer className="h-4 w-4 mr-2" />
            Print Quote
          </Button>

          <Button variant="outline" onClick={handleAddToCart}>
            <CartIcon className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>

          <StripeCheckoutButton
            productId={pool.model}
            productName={pool.model}
            price={calculateTotalPrice()}
            variant="default"
            showFinancingOptions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PoolDetails;