import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award, Palette, Camera, Layers, Plus, Minus } from "lucide-react";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { useShoppingCart } from "@/components/ShoppingCart";
import { spas } from "@/components/PoolCatalog";
import { tanningLedges, poolLiners, poolTiles } from "@/data/poolData";
import { poolFinishes as poolFinishesData } from '@/components/PoolFinishesSection';

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

type ActivePanel = 'finishes' | 'liners' | 'pavers' | 'coping' | 'covers' | 'heaters' | 'spas' | 'tanning' | 'jets' | null;

const PoolDetails = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useShoppingCart();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

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

  const renderPanel = () => {
    if (!activePanel) return null;

    const panelClass = "absolute inset-0 bg-background/95 backdrop-blur-sm z-30 p-6 overflow-auto";

    switch (activePanel) {
      case 'finishes':
        return (
          <div className={panelClass}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Pool Finishes</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {finishOptions.map((finish) => (
                <div 
                  key={finish.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setExtras(prev => ({ ...prev, finish: finish.name }))}
                >
                  <div className="w-full h-24 rounded-md mb-3 overflow-hidden">
                    <img src={finish.image} alt={finish.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-medium text-center">{finish.name}</p>
                  <p className="text-xs text-primary text-center mt-1">{finish.collection}</p>
                  {finish.price && (
                    <p className="text-xs text-foreground font-semibold text-center">+${finish.price.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'liners':
        return (
          <div className={panelClass}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Pool Liners</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {linerOptions.map((liner) => (
                <div 
                  key={liner.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setExtras(prev => ({ ...prev, linerOption: liner.name }))}
                >
                  <div className="w-full h-24 rounded-md mb-3 overflow-hidden">
                    <img src={liner.image} alt={liner.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-medium text-center">{liner.name}</p>
                  {liner.type && liner.type !== 'Standard' && (
                    <p className="text-xs text-primary text-center">{liner.type}</p>
                  )}
                  {liner.price > 0 && (
                    <p className="text-xs text-foreground font-semibold text-center">+${liner.price.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'pavers':
        return (
          <div className={panelClass}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Pavers</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {paverOptions.map((paver) => (
                <div 
                  key={paver.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    extras.paverOption === paver.name ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setExtras(prev => ({ ...prev, paverOption: paver.name }))}
                >
                  <div className="w-full h-24 rounded-md mb-3 overflow-hidden">
                    <img src={paver.image} alt={paver.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-medium text-center">{paver.name}</p>
                  {paver.price > 0 && (
                    <p className="text-xs text-primary font-semibold text-center">+${paver.price.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'coping':
        return (
          <div className={panelClass}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Coping Pavers</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {copingPaverOptions.map((coping) => (
                <div 
                  key={coping.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    extras.copingPaverOption === coping.name ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setExtras(prev => ({ ...prev, copingPaverOption: coping.name }))}
                >
                  <div className="w-full h-24 rounded-md mb-3 overflow-hidden">
                    <img src={coping.image} alt={coping.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-medium text-center">{coping.name}</p>
                  {coping.price > 0 && (
                    <p className="text-xs text-primary font-semibold text-center">+${coping.price.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'covers':
        return (
          <div className={panelClass}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Pool Covers</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4">
              <Button
                variant={extras.cover ? "default" : "outline"}
                onClick={() => setExtras(prev => ({ ...prev, cover: !prev.cover }))}
                className="mb-4"
              >
                {extras.cover ? 'Remove Cover' : 'Add Cover'}
              </Button>
            </div>
            {extras.cover && (
              <div className="grid grid-cols-2 gap-4">
                {coverOptions.map((cover) => (
                  <div 
                    key={cover.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      extras.coverOption === cover.name ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setExtras(prev => ({ ...prev, coverOption: cover.name }))}
                  >
                    <div className="w-full h-24 rounded-md mb-3 overflow-hidden">
                      <img src={cover.image} alt={cover.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium text-center">{cover.name}</p>
                    <p className="text-xs text-primary font-semibold text-center">+${cover.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'jets':
        return (
          <div className={panelClass}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Spa Jets</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Button
                variant={extras.jets ? "default" : "outline"}
                onClick={() => setExtras(prev => ({ ...prev, jets: !prev.jets }))}
                className="mb-4"
              >
                {extras.jets ? 'Remove Spa Jets' : 'Add Spa Jets'}
              </Button>
              {extras.jets && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExtras(prev => ({ ...prev, jetQuantity: Math.max(1, prev.jetQuantity - 1) }))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold">{extras.jetQuantity} Jets</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExtras(prev => ({ ...prev, jetQuantity: prev.jetQuantity + 1 }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {extras.jets && (
                <p className="text-center text-sm text-muted-foreground">
                  Total: +${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted overflow-hidden relative">
      {/* Close Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.close()}
        className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Main Layout - Fixed Grid */}
      <div className="h-full grid grid-cols-12">
        
        {/* Left - Fixed Image */}
        <div className="col-span-7 p-6 flex flex-col">
          <div className="flex-1 relative bg-gradient-to-br from-primary/10 to-teal/10 rounded-2xl overflow-hidden">
            <img 
              src={getCurrentImage()} 
              alt={pool.model}
              className="w-full h-full object-cover transition-all duration-300"
            />
            
            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <Badge className={`${getCategoryColor(pool.category)} text-white capitalize font-medium px-4 py-2 text-lg`}>
                {pool.category}
              </Badge>
            </div>

            {/* Pool Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h1 className="text-2xl font-bold text-white mb-2">{pool.model}</h1>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-teal-400" />
                <span className="text-2xl font-bold text-white">
                  ${calculateTotalPrice().toLocaleString()}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-white/80">
                {pool.dimensions && <span>{pool.dimensions}</span>}
                {pool.depth && <span>{pool.depth}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-5 relative bg-background/50 backdrop-blur-sm">
          
          {/* Current Selection Display */}
          <div className="p-6 border-b bg-background/80">
            <h2 className="text-lg font-semibold mb-4">Current Selection</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Finish:</span>
                <span className="font-medium">{extras.finish}</span>
              </div>
              <div className="flex justify-between">
                <span>Liner:</span>
                <span className="font-medium">{extras.linerOption}</span>
              </div>
              <div className="flex justify-between">
                <span>Pavers:</span>
                <span className="font-medium">{extras.paverOption}</span>
              </div>
              <div className="flex justify-between">
                <span>Coping:</span>
                <span className="font-medium">{extras.copingPaverOption}</span>
              </div>
              {extras.cover && (
                <div className="flex justify-between">
                  <span>Cover:</span>
                  <span className="font-medium">{extras.coverOption}</span>
                </div>
              )}
              {extras.jets && (
                <div className="flex justify-between">
                  <span>Jets:</span>
                  <span className="font-medium">{extras.jetQuantity}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 space-y-4">
            <StripeCheckoutButton
              productId={`pool_${pool.model.replace(/\s+/g, '_')}`}
              productName={pool.model}
              price={calculateTotalPrice()}
              variant="gradient"
              className="w-full"
              size="lg"
              showFinancingOptions={false}
            />
            
            <Button
              onClick={() => addToCart({
                id: `pool_${pool.model.replace(/\s+/g, '_')}_${Date.now()}`,
                name: pool.model,
                price: pool.price,
                category: pool.category,
                image: pool.image,
                extras: []
              })}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Add to Cart
            </Button>
          </div>

          {/* Panel Overlay */}
          {renderPanel()}
        </div>
      </div>

      {/* Bottom Toolbar - Fixed */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t p-4">
        <div className="flex justify-center gap-2">
          <Button
            variant={activePanel === 'finishes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'finishes' ? null : 'finishes')}
          >
            <Palette className="h-4 w-4 mr-2" />
            Finishes
          </Button>
          <Button
            variant={activePanel === 'liners' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'liners' ? null : 'liners')}
          >
            <Layers className="h-4 w-4 mr-2" />
            Liners
          </Button>
          <Button
            variant={activePanel === 'pavers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'pavers' ? null : 'pavers')}
          >
            <Camera className="h-4 w-4 mr-2" />
            Pavers
          </Button>
          <Button
            variant={activePanel === 'coping' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'coping' ? null : 'coping')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Coping
          </Button>
          <Button
            variant={activePanel === 'covers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'covers' ? null : 'covers')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Cover
          </Button>
          <Button
            variant={activePanel === 'jets' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'jets' ? null : 'jets')}
          >
            <Zap className="h-4 w-4 mr-2" />
            Jets
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PoolDetails;