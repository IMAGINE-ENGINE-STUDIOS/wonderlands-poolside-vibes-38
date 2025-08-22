import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
  features?: string[];
  galaPoints?: number;
  galaCategory?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  heater?: boolean;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
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

const PoolDetails = () => {
  const { poolId } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useShoppingCart();

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
    liner: false,
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

  const toggleExtra = (extra: string) => {
    setExtras(prev => {
      if (extra === 'tiles' && !prev.tiles) {
        return { ...prev, tiles: true, liner: false };
      } else if (extra === 'liner' && !prev.liner) {
        return { ...prev, liner: true, tiles: false };
      } else if (extra === 'tiles') {
        return { ...prev, tiles: !prev.tiles };
      } else if (extra === 'liner') {
        return { ...prev, liner: !prev.liner };
      } else if (extra === 'cover') {
        const enabling = !prev.cover;
        return enabling
          ? { ...prev, cover: true, coverOption: coverOptions.find(o => o.name === prev.coverOption) ? prev.coverOption : 'Eclipse Automatic Cover' }
          : { ...prev, cover: false };
      } else if (extra === 'heater') {
        return { ...prev, heater: !prev.heater };
      } else if (extra === 'spa') {
        return { ...prev, spa: !prev.spa };
      } else if (extra === 'tanningLedge') {
        return { ...prev, tanningLedge: !prev.tanningLedge };
      } else if (extra === 'jets') {
        return { ...prev, jets: !prev.jets };
      }
      return prev;
    });
  };

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

  const handleAddToCart = () => {
    const cartExtras = [];
    
    if (extras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) {
        cartExtras.push({ name: `${selectedHeater.name}`, price: selectedHeater.price });
      }
    }
    if (extras.jets) cartExtras.push({ name: `Spa Jets (${extras.jetQuantity})`, price: getExtraPrice('jets') * extras.jetQuantity });
    
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) {
      cartExtras.push({ name: `${linerOption.name} Liner`, price: linerOption.price });
    }
    
    const coverOption = coverOptions.find(option => option.name === extras.coverOption);
    if (coverOption && extras.cover) {
      cartExtras.push({ name: coverOption.name, price: coverOption.price });
    }
    
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) {
      cartExtras.push({ name: tileOption.name, price: tileOption.price });
    }

    const paverOption = paverOptions.find(option => option.name === extras.paverOption);
    if (paverOption && paverOption.price > 0) {
      cartExtras.push({ name: paverOption.name, price: paverOption.price });
    }

    const copingPaverOption = copingPaverOptions.find(option => option.name === extras.copingPaverOption);
    if (copingPaverOption && copingPaverOption.price > 0) {
      cartExtras.push({ name: copingPaverOption.name, price: copingPaverOption.price });
    }

    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) {
        cartExtras.push({ name: `${selectedSpa.model} Spa`, price: selectedSpa.price });
      }
    }

    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) {
        cartExtras.push({ name: `${selectedLedge.name} Tanning Ledge`, price: selectedLedge.price });
      }
    }

    addToCart({
      id: `pool_${pool.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: pool.model,
      price: pool.price,
      category: pool.category,
      image: pool.image,
      extras: cartExtras
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.close()}
          className="bg-background/80 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Pool Image Section */}
          <div className="space-y-6">
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/10 to-teal/10 rounded-2xl overflow-hidden">
              {pool.image ? (
                <img 
                  src={pool.image} 
                  alt={pool.model}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Waves size={64} className="text-primary/60" />
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-6 left-6">
                <Badge className={`${getCategoryColor(pool.category)} text-white capitalize font-medium px-4 py-2 text-lg`}>
                  {pool.category}
                </Badge>
              </div>
            </div>

            {/* Pool Info */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">{pool.model}</h1>
                
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="h-6 w-6 text-teal" />
                  <span className="text-3xl font-bold text-foreground">
                    ${calculateTotalPrice().toLocaleString()}
                  </span>
                </div>

                <div className="space-y-4 text-muted-foreground">
                  {pool.dimensions && <p className="flex items-center gap-2"><span className="font-medium">Dimensions:</span> {pool.dimensions}</p>}
                  {pool.depth && <p className="flex items-center gap-2"><span className="font-medium">Depth:</span> {pool.depth}</p>}
                  <p className="flex items-center gap-2"><span className="font-medium">Includes:</span> 3 ft perimeter pavers around pool area</p>
                  {pool.installationTimeWeeks && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Installation: {pool.installationTimeWeeks} weeks</span>
                    </div>
                  )}
                  {pool.warrantyYears && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span className="font-bold text-primary">
                        Warranty: {pool.warrantyYears === "Lifetime" || pool.warrantyYears === "Life" ? "LIFETIME WARRANTY" : `${pool.warrantyYears} years`}
                      </span>
                    </div>
                  )}
                </div>

                {pool.saltSystem && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-teal/10 rounded-lg">
                    <Droplets className="h-5 w-5 text-teal" />
                    <span className="font-medium">Salt system included in final price</span>
                  </div>
                )}

                {pool.carbonFiber && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Carbon Fiber Technology</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Configuration Section */}
          <div className="space-y-6">
            
            {/* Pool Finishes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Pool Finishes</h3>
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2">
                    {finishOptions.map((finish) => (
                      <CarouselItem key={finish.name} className="pl-2 basis-1/2 sm:basis-1/3">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                            extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          onClick={() => setExtras(prev => ({ ...prev, finish: finish.name }))}
                        >
                          <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                            <img 
                              src={finish.image} 
                              alt={finish.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium text-center line-clamp-2">{finish.name}</p>
                          <p className="text-xs text-primary text-center font-semibold mt-1">{finish.collection}</p>
                          {finish.price && (
                            <p className="text-xs text-foreground font-semibold text-center">+${finish.price.toLocaleString()}</p>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            {/* Pool Liners */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Pool Liners</h3>
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2">
                    {linerOptions.map((liner) => (
                      <CarouselItem key={liner.name} className="pl-2 basis-1/2 sm:basis-1/3">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                            extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          onClick={() => setExtras(prev => ({ ...prev, linerOption: liner.name }))}
                        >
                          <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                            <img 
                              src={liner.image} 
                              alt={liner.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium text-center line-clamp-2">{liner.name}</p>
                          {liner.type && liner.type !== 'Standard' && (
                            <p className="text-xs text-primary text-center font-semibold">{liner.type}</p>
                          )}
                          {liner.price > 0 && (
                            <p className="text-xs text-foreground font-semibold text-center">+${liner.price.toLocaleString()}</p>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            {/* Pavers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Pavers</h3>
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2">
                    {paverOptions.map((paver) => (
                      <CarouselItem key={paver.name} className="pl-2 basis-1/2 sm:basis-1/3">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                            extras.paverOption === paver.name ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          onClick={() => setExtras(prev => ({ ...prev, paverOption: paver.name }))}
                        >
                          <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                            <img 
                              src={paver.image} 
                              alt={paver.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium text-center line-clamp-2">{paver.name}</p>
                          {paver.price > 0 && (
                            <p className="text-xs text-primary font-semibold text-center">+${paver.price.toLocaleString()}</p>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            {/* Coping Pavers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Coping Pavers</h3>
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2">
                    {copingPaverOptions.map((coping) => (
                      <CarouselItem key={coping.name} className="pl-2 basis-1/2 sm:basis-1/3">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                            extras.copingPaverOption === coping.name ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          onClick={() => setExtras(prev => ({ ...prev, copingPaverOption: coping.name }))}
                        >
                          <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                            <img 
                              src={coping.image} 
                              alt={coping.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium text-center line-clamp-2">{coping.name}</p>
                          {coping.price > 0 && (
                            <p className="text-xs text-primary font-semibold text-center">+${coping.price.toLocaleString()}</p>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            {/* Additional Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Additional Features</h3>
                <div className="space-y-4">
                  
                  {/* Pool Heater */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.heater}
                        onCheckedChange={() => toggleExtra('heater')}
                        className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                      />
                      <div className="flex items-center space-x-1">
                        <Thermometer size={16} className="text-coral" />
                        <span>Pool Heater (+${extras.heater ? (() => {
                          const selectedHeater = poolHeaters.find((heater) => heater.name === extras.heaterModel);
                          return selectedHeater ? selectedHeater.price.toLocaleString() : '0';
                        })() : '0'})</span>
                      </div>
                    </label>
                    {extras.heater && (
                      <div className="ml-6">
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-2">
                            {poolHeaters.map((heater) => (
                              <CarouselItem key={heater.name} className="pl-2 basis-full">
                                <div
                                  onClick={() => setExtras(prev => ({ ...prev, heaterModel: heater.name }))}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                                    extras.heaterModel === heater.name 
                                      ? 'border-coral bg-coral/10' 
                                      : 'border-border hover:border-coral/50'
                                  }`}
                                >
                                  <img src={heater.image} alt={heater.name} className="w-12 h-12 rounded object-cover" />
                                  <div className="flex-1">
                                    <div className="font-medium">{heater.name}</div>
                                    <div className="text-sm text-muted-foreground">${heater.price.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">{heater.description}</div>
                                  </div>
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

                  {/* Spa Jets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Checkbox 
                          checked={extras.jets}
                          onCheckedChange={() => toggleExtra('jets')}
                        />
                        <div className="flex items-center space-x-1">
                          <Zap size={16} className="text-orange" />
                          <span>Spa Jets (+${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()})</span>
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
                          <span className="font-medium w-8 text-center">{extras.jetQuantity}</span>
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

                  {/* Pool Cover */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.cover}
                        onCheckedChange={() => toggleExtra('cover')}
                      />
                      <div className="flex items-center space-x-1">
                        <Shield size={16} className="text-primary" />
                        <span>Pool Cover (+${extras.cover ? (() => {
                          const selectedCover = coverOptions.find((cover) => cover.name === extras.coverOption);
                          return selectedCover ? selectedCover.price.toLocaleString() : '0';
                        })() : '0'})</span>
                      </div>
                    </label>
                    {extras.cover && (
                      <div className="ml-6">
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-2">
                            {coverOptions.map((cover) => (
                              <CarouselItem key={cover.name} className="pl-2 basis-1/2">
                                <div
                                  onClick={() => setExtras(prev => ({ ...prev, coverOption: cover.name }))}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all h-full flex flex-col ${
                                    extras.coverOption === cover.name 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                                    <img src={cover.image} alt={cover.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{cover.name}</div>
                                    <div className="text-xs text-primary font-semibold">${cover.price.toLocaleString()}</div>
                                  </div>
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

                  {/* Spa */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.spa}
                        onCheckedChange={() => toggleExtra('spa')}
                      />
                      <div className="flex items-center space-x-1">
                        <Waves size={16} className="text-primary" />
                        <span>Add Spa (+${extras.spa ? (() => {
                          const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
                          return selectedSpa ? selectedSpa.price.toLocaleString() : '0';
                        })() : '0'})</span>
                      </div>
                    </label>
                    {extras.spa && (
                      <div className="ml-6">
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-2">
                            {spas.map((spa: any) => (
                              <CarouselItem key={spa.model} className="pl-2 basis-1/2">
                                <div
                                  onClick={() => setExtras(prev => ({ ...prev, spaModel: spa.model }))}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all h-full flex flex-col ${
                                    extras.spaModel === spa.model 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  {spa.image && (
                                    <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                                      <img src={spa.image} alt={spa.model} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{spa.model}</div>
                                    <div className="text-xs text-primary font-semibold">${spa.price.toLocaleString()}</div>
                                  </div>
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

                  {/* Tanning Ledge */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.tanningLedge}
                        onCheckedChange={() => toggleExtra('tanningLedge')}
                      />
                      <div className="flex items-center space-x-1">
                        <Sun size={16} className="text-coral" />
                        <span>Tanning Ledge (+${extras.tanningLedge ? (() => {
                          const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
                          return selectedLedge ? selectedLedge.price.toLocaleString() : '0';
                        })() : '0'})</span>
                      </div>
                    </label>
                    {extras.tanningLedge && (
                      <div className="ml-6">
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-2">
                            {tanningLedges.map((ledge: any) => (
                              <CarouselItem key={ledge.name} className="pl-2 basis-1/2">
                                <div
                                  onClick={() => setExtras(prev => ({ ...prev, tanningLedgeModel: ledge.name }))}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all h-full flex flex-col ${
                                    extras.tanningLedgeModel === ledge.name 
                                      ? 'border-coral bg-coral/10' 
                                      : 'border-border hover:border-coral/50'
                                  }`}
                                >
                                  <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                                    <img src={ledge.image} alt={ledge.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{ledge.name}</div>
                                    <div className="text-xs text-coral font-semibold">${ledge.price.toLocaleString()}</div>
                                  </div>
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

                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Add to Cart
              </Button>
              
              <StripeCheckoutButton
                productId={`pool_${pool.model.replace(/\s+/g, '_')}`}
                productName={pool.model}
                price={calculateTotalPrice()}
                variant="gradient"
                className="w-full"
                size="lg"
                showFinancingOptions={false}
              />
              
              <StripeCheckoutButton
                productId={`pool_${pool.model.replace(/\s+/g, '_')}`}
                productName={pool.model}
                price={calculateTotalPrice()}
                variant="outline"
                className="w-full"
                size="lg"
                showFinancingOptions={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDetails;