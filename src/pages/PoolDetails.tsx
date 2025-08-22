import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award, Palette, Camera, Layers, Plus, Minus, Download, Printer, ShoppingCart as CartIcon, Search, ChevronDown, Settings, Armchair, Flame, ChefHat, Utensils, Home, Music, Package } from "lucide-react";
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

// Cover options
const coverOptions = [{
  name: 'Eclipse Automatic Cover',
  color: '#2F4F4F',
  price: 16000,
  image: nightSkyFinish,
  category: 'cover',
  description: 'Premium automatic pool cover with solar heating'
}, {
  name: 'CS3000 Safety Cover',
  color: '#2F4F4F',
  price: 24000,
  image: shaleGrayFinish,
  category: 'cover',
  description: 'Heavy-duty safety cover with anchoring system'
}, {
  name: 'Infinity 4000 Smart Cover',
  color: '#2F4F4F',
  price: 32000,
  image: coastalBronzeFinish,
  category: 'cover',
  description: 'Smart automated cover with app control'
}, {
  name: 'Atom Loop-Loc Cover',
  color: '#2F4F4F',
  price: 19000,
  image: aquamarineFinish,
  category: 'cover',
  description: 'Mesh safety cover for all seasons'
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

// Paver options
const paverOptions = [{
  name: 'Standard Concrete',
  color: '#D3D3D3',
  price: 0,
  image: azureBlueFinish,
  description: 'Basic concrete pavers around pool perimeter'
}, {
  name: 'Natural Stone',
  color: '#8B7355',
  price: 2500,
  image: shaleGrayFinish,
  description: 'Premium natural stone pavers'
}, {
  name: 'Travertine',
  color: '#F5DEB3',
  price: 3200,
  image: athensPearlFinish,
  description: 'Elegant travertine paving stones'
}, {
  name: 'Brick Pavers',
  color: '#B22222',
  price: 2800,
  image: coastalBronzeFinish,
  description: 'Classic brick paver design'
}];

// Coping paver options
const copingPaverOptions = [{
  name: 'Standard Pool Coping',
  color: '#A9A9A9',
  price: 0,
  image: azureBlueFinish,
  description: 'Basic pool edge coping'
}, {
  name: 'Bullnose Coping',
  color: '#696969',
  price: 1500,
  image: nightSkyFinish,
  description: 'Rounded edge bullnose coping'
}, {
  name: 'Natural Stone Coping',
  color: '#708090',
  price: 2200,
  image: shaleGrayFinish,
  description: 'Premium natural stone pool edge'
}, {
  name: 'Cantilever Coping',
  color: '#2F4F4F',
  price: 1800,
  image: sapphireBlueFinish,
  description: 'Modern cantilever edge design'
}];
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium':
      return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe':
      return 'bg-gradient-to-r from-primary to-teal';
    case 'standard':
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

  // Parse pool data from URL params
  const pool: Pool = {
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
    if (paverOption) total += paverOption.price * paverArea; // price per sq ft * area

    const copingPaverOption = copingPaverOptions.find(option => option.name === extras.copingPaverOption);
    if (copingPaverOption) total += copingPaverOption.price * copingLength; // price per linear ft * length

    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) total += selectedSpa.price;
    }
    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) total += selectedLedge.price;
    }

    // Add selected marketplace products
    selectedProducts.forEach(product => {
      total += product.price;
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
    if (paver && paver.price > 0) selectedExtras.push({
      name: `${paver.name} (${paverArea} sq ft)`,
      price: paver.price * paverArea
    });
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
                    <div class="spec-value">$${pool.price.toLocaleString()}</div>
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
                    <div class="item-price item-price-main">$${pool.price.toLocaleString()}</div>
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
                      <div class="breakdown-value">$${pool.price.toLocaleString()}</div>
                    </div>
                    <div class="breakdown-item">
                      <div class="breakdown-label">Premium Upgrades</div>
                      <div class="breakdown-value">$${(totalPrice - pool.price).toLocaleString()}</div>
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
        return finishOptions.map(finish => <div key={finish.name} className={`p-2 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
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
                <Button size="sm" variant="outline" className="mt-1 h-6 text-xs" onClick={e => {
                e.stopPropagation();
                // Navigate to editor studio for this product
              }}>
                  <Settings className="h-3 w-3 mr-1" />
                  Editor Studio
                </Button>
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

        // Special handling for pavers with area input
        if (activePanel === 'pavers') {
          return <div className="space-y-2">
              <div className="border rounded-md p-2">
                <label className="text-xs font-medium">Area (sq ft):</label>
                <input type="number" value={paverArea} onChange={e => setPaverArea(Number(e.target.value))} className="w-full mt-1 p-1 border rounded text-xs" min="1" />
              </div>
              {paverOptions.map(option => <div key={option.name} className={`p-2 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.paverOption === option.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => handleOptionSelect('pavers', option)}>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{option.name}</p>
                      <p className="text-xs font-semibold">${option.price}/sq ft</p>
                      <p className="text-xs text-primary">Total: ${(option.price * paverArea).toLocaleString()}</p>
                    </div>
                  </div>
                </div>)}
            </div>;
        }

        // Special handling for coping with length input
        if (activePanel === 'coping') {
          return <div className="space-y-2">
              <div className="border rounded-md p-2">
                <label className="text-xs font-medium">Length (linear ft):</label>
                <input type="number" value={copingLength} onChange={e => setCopingLength(Number(e.target.value))} className="w-full mt-1 p-1 border rounded text-xs" min="1" />
              </div>
              {copingPaverOptions.map(option => <div key={option.name} className={`p-2 border rounded-md cursor-pointer transition-all hover:bg-muted/50 ${extras.copingPaverOption === option.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => handleOptionSelect('coping', option)}>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{option.name}</p>
                      <p className="text-xs font-semibold">${option.price}/linear ft</p>
                      <p className="text-xs text-primary">Total: ${(option.price * copingLength).toLocaleString()}</p>
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
  return <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
      {/* Top Header with Price and Main Search */}
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

        {/* Main Search Engine */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Main Search Engine - Find any product..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-background" />
          </div>
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
        {/* Enhanced Product Showcase */}
        <div className="flex-1 bg-muted p-6">
          <div className="h-full flex flex-col">
            {/* Large Main Pool Image */}
            <div className="relative flex-1 mb-4">
              <img src={getCurrentImage()} alt={pool.model} className="w-full h-full object-cover rounded-lg border shadow-lg" />
              

              {/* Pool Info Overlay - Bottom Left */}
              <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md">
                <p className="text-base font-semibold">{pool.model}</p>
                <p className="text-sm text-muted-foreground">{pool.dimensions || 'Custom Pool Design'}</p>
                <Badge className={`mt-2 ${getCategoryColor(pool.category)}`}>{pool.category}</Badge>
              </div>

              {/* Selected Products Indicators - Top Left */}
              {(getSelectedConfigItems().length > 0 || selectedProducts.length > 0) && <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-xs">
                  {getSelectedConfigItems().slice(0, 3).map((item, index) => <div key={index} className="relative group">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-sm bg-background">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <Button size="sm" variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                  // Handle removal based on category
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
                }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>)}
                  
                  {selectedProducts.slice(0, 2).map(product => <div key={product.id} className="relative group">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-sm bg-background">
                        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>}
                      </div>
                      <Button size="sm" variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                  setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
                  toast({
                    title: "Product Removed",
                    description: `${product.name} removed!`
                  });
                }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>)}
                  
                  {/* Show count if more products */}
                  {getSelectedConfigItems().length + selectedProducts.length > 5 && <div className="w-12 h-12 rounded-lg border-2 border-background shadow-sm bg-background/90 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        +{getSelectedConfigItems().length + selectedProducts.length - 5}
                      </span>
                    </div>}
                </div>}
            </div>

            {/* Product Description Area */}
            
          </div>
        </div>

        {/* Compact Right Sidebar - Browse Categories */}
        <div className="w-72 border-l bg-background flex flex-col">
          {/* Category Dropdown Only */}
          <div className="p-3 border-b">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Browse Categories</label>
            <select value={activePanel || ''} onChange={e => {
            const newPanel = e.target.value as ActivePanel || null;
            setActivePanel(newPanel);
            // Auto-close when switching categories
            if (newPanel) {
              setSearchQuery('');
            }
          }} className="w-full p-2 text-sm border rounded-md bg-background">
              <option value="">All Categories</option>
              <option value="finishes">Pool Finishes</option>
              <option value="liners">Pool Liners</option>
              <option value="pavers">Pavers & Decking</option>
              <option value="coping">Coping Options</option>
              <option value="covers">Pool Covers</option>
              <option value="heaters">Heating Systems</option>
              <option value="spas">Spa Options</option>
              <option value="tanning">Tanning Ledges</option>
              <option value="tiles">Pool Tiles</option>
              <option value="jets">Pool Jets</option>
              <option value="engines">Pool Equipment</option>
              <option value="furniture">Outdoor Furniture</option>
              <option value="fireplace">Fire Features</option>
              <option value="outdoor-kitchens">Outdoor Kitchens</option>
              <option value="bbq">BBQ & Grills</option>
              <option value="pergolas">Pergolas & Shade</option>
              <option value="sound-system">Sound Systems</option>
            </select>
          </div>

          {/* Compact Content Area */}
          <div className="flex-1 overflow-auto">
            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Search Results ({searchResults.length})</h4>
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {searchResults.map(product => <div key={product.id} className={`p-2 border rounded-md hover:bg-muted/50 cursor-pointer transition-all ${selectedProducts.some(p => p.id === product.id) ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => {
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
                          {product.brand && <p className="text-xs text-primary truncate">{product.brand}</p>}
                          <p className="text-xs font-semibold">${product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}

            {/* Category Products */}
            {activePanel && !searchQuery && <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">
                    {activePanel === 'finishes' && 'Pool Finishes'}
                    {activePanel === 'liners' && 'Pool Liners'}
                    {activePanel === 'pavers' && 'Pavers'}
                    {activePanel === 'coping' && 'Coping'}
                    {activePanel === 'covers' && 'Pool Covers'}
                    {activePanel === 'heaters' && 'Heaters'}
                    {activePanel === 'engines' && 'Equipment'}
                    {activePanel === 'spas' && 'Spas'}
                    {activePanel === 'tanning' && 'Tanning Ledges'}
                    {activePanel === 'tiles' && 'Tiles'}
                    {activePanel === 'jets' && 'Jets'}
                    {activePanel === 'furniture' && 'Furniture'}
                    {activePanel === 'fireplace' && 'Fire Features'}
                    {activePanel === 'outdoor-kitchens' && 'Kitchens'}
                    {activePanel === 'bbq' && 'BBQ & Grills'}
                    {activePanel === 'pergolas' && 'Pergolas'}
                    {activePanel === 'sound-system' && 'Sound'}
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {renderCategoryContent()}
                </div>
              </div>}

            {/* Default State */}
            {!activePanel && !searchQuery && <div className="p-6 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">Select Category</p>
                <p className="text-xs">Choose a category to browse products</p>
              </div>}
          </div>
        </div>
      </div>

      {/* Bottom Dashboard */}
      <div className="h-20 border-t bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Circular Feature Snapshots */}
          <div className="flex items-center gap-2">
            {getSelectedFeatureIcons().map((feature, index) => <div key={index} className="relative group">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-background border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {feature.label}
                </div>
              </div>)}
          </div>
          
          {/* Finance This Purchase Button */}
          <StripeCheckoutButton productId={`pool_${pool.model}`} productName={`${pool.model} Complete Configuration`} price={calculateTotalPrice()} variant="outline" showFinancingOptions={true} className="bg-gradient-to-r from-primary to-secondary text-white border-0" />
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

          <StripeCheckoutButton productId={pool.model} productName={pool.model} price={calculateTotalPrice()} variant="default" showFinancingOptions={false} />
        </div>
      </div>
    </div>;
};
export default PoolDetails;