import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Star, Clock, Award, Cpu, Edit, ShoppingCart, Sun } from "lucide-react";
import StripeCheckoutButton from "./StripeCheckoutButton";
import ImageEditor from "./ImageEditor";
import { useShoppingCart } from "./ShoppingCart";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { spas } from "./PoolCatalog";
import { tanningLedges } from "@/data/poolData";

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

interface PoolProductCardProps {
  pool: Pool;
  onViewDetails: (pool: Pool) => void;
  onRequestQuote: (pool: Pool, extras?: PoolExtras) => void;
}

interface PoolExtras {
  liner: boolean;
  heater: boolean;
  cover: boolean;
  jets: boolean;
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
}

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
    case 'liner': return 0; // Base cost covered by liner option price
    case 'heater': return 5000; // Pool Heater is exactly $5,000
    case 'cover': return 3200;
    case 'jets': return 1800;
    case 'tiles': return 0; // Base cost covered by tile option price
    default: return 0;
  }
};

// Import pool finishes from PoolFinishesSection
import { poolFinishes as poolFinishesData } from '@/components/PoolFinishesSection';

// Convert pool finishes data to finish options format
const finishOptions = poolFinishesData.map(finish => ({
  name: finish.name,
  color: '#4169E1', // fallback color
  image: finish.image,
  price: finish.price,
  collection: finish.collection,
  category: finish.category,
  description: finish.description
}));

// Import pool liners from PoolCatalog
import { poolLiners, poolTiles } from '@/data/poolData';

// Pool heater options
const poolHeaters = [
  { name: 'Heat Pump - Eco Series', price: 4500, image: azureBlueFinish, description: 'Energy-efficient heat pump, ideal for mild climates' },
  { name: 'Heat Pump - Pro Series', price: 5500, image: oceanBlueFinish, description: 'Professional grade heat pump with advanced controls' },
  { name: 'Gas Heater - Standard', price: 3200, image: sapphireBlueFinish, description: 'Traditional gas heater for quick heating' },
  { name: 'Gas Heater - High Efficiency', price: 4200, image: nightSkyFinish, description: 'High-efficiency gas heater with digital controls' },
  { name: 'Solar Heater - Basic', price: 2800, image: lagoonBlueFinish, description: 'Eco-friendly solar heating system' },
  { name: 'Solar Heater - Premium', price: 3800, image: coastalBronzeFinish, description: 'Advanced solar system with backup heating' }
];

// Convert pool liners to liner options format
const linerOptions = [
  { name: 'Standard Blue', color: '#4169E1', price: 0, image: azureBlueFinish, type: 'Standard', description: undefined },
  ...poolLiners.map(liner => ({
    name: liner.name,
    color: '#4169E1', // fallback color
    price: liner.price,
    image: liner.image,
    type: liner.type,
    description: liner.description
  }))
];

const coverOptions = [
  { name: 'Eclipse', color: '#2F4F4F', price: 16000 },
  { name: 'CS3000', color: '#2F4F4F', price: 24000 },
  { name: 'Infinity 4000', color: '#2F4F4F', price: 32000 },
  { name: 'Atom', color: '#2F4F4F', price: 19000 }
];

// Convert pool tiles to tile options format
const tileOptions = [
  { name: 'Standard Waterline', color: '#4682B4', price: 0, image: azureBlueFinish, description: undefined },
  ...poolTiles.map(tile => ({
    name: tile.name,
    color: '#4682B4', // fallback color
    price: tile.price,
    image: tile.image,
    description: tile.description
  }))
];

const PoolProductCard = ({ pool, onViewDetails, onRequestQuote }: PoolProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [currentPoolImage, setCurrentPoolImage] = useState(pool.image);
  const [extras, setExtras] = useState<PoolExtras>({
    liner: false,
    heater: false,
    cover: false,
    jets: false,
    finish: 'Nantuke',
    linerOption: 'Standard Blue',
    coverOption: 'Eclipse',
    tiles: false,
    tileOption: 'Standard Waterline',
    spa: false,
    spaModel: 'Mystic',
    tanningLedge: false,
    tanningLedgeModel: tanningLedges[0]?.name || 'Genesis',
    heaterModel: poolHeaters[0]?.name || 'Heat Pump - Eco Series'
  });
  
  const { addToCart } = useShoppingCart();

  const handleImageClick = () => {
    setShowDetails(!showDetails);
  };

  const toggleExtra = (extra: string) => {
    setExtras(prev => {
      // Handle tile/liner mutual exclusivity
      if (extra === 'tiles' && !prev.tiles) {
        // Selecting tiles, disable liner and expand details
        setShowDetails(true);
        return { ...prev, tiles: true, liner: false };
      } else if (extra === 'liner' && !prev.liner) {
        // Selecting liner, disable tiles and expand details
        setShowDetails(true);
        return { ...prev, liner: true, tiles: false };
      } else if (extra === 'tiles') {
        // Deselecting tiles
        return { ...prev, tiles: !prev.tiles };
      } else if (extra === 'liner') {
        // Deselecting liner
        return { ...prev, liner: !prev.liner };
      } else if (extra === 'cover') {
        const enabling = !prev.cover;
        return enabling
          ? { ...prev, cover: true, coverOption: coverOptions.find(o => o.name === prev.coverOption) ? prev.coverOption : 'Eclipse' }
          : { ...prev, cover: false };
      } else if (extra === 'heater') {
        return { ...prev, heater: !prev.heater };
      } else if (extra === 'spa') {
        return { ...prev, spa: !prev.spa };
      } else if (extra === 'tanningLedge') {
        return { ...prev, tanningLedge: !prev.tanningLedge };
      }
      
      return prev;
    });
  };

  const calculateTotalPrice = () => {
    let total = pool.price;
    
    // Add heater price if selected (dynamic price based on model)
    if (extras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }
    if (extras.cover) total += getExtraPrice('cover');
    if (extras.jets) total += getExtraPrice('jets');
    
    // Add option prices (liner OR tile, never both)
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) total += linerOption.price;
    
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) total += tileOption.price;
    
    const coverOption = coverOptions.find(option => option.name === extras.coverOption);
    if (coverOption && extras.cover) total += coverOption.price;
    
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
    
    return total;
  };

  const hasExtras = Object.values(extras).some(value => value);

  const handleImageSave = (imageBlob: Blob) => {
    // Convert blob to data URL for display
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentPoolImage(reader.result as string);
    };
    reader.readAsDataURL(imageBlob);
  };

  const handleAddToCart = () => {
    const cartExtras = [];
    
    if (extras.heater) {
      const selectedHeater = poolHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) {
        cartExtras.push({ name: `${selectedHeater.name}`, price: selectedHeater.price });
      }
    }
    if (extras.jets) cartExtras.push({ name: 'Spa Jets', price: getExtraPrice('jets') });
    
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
      image: currentPoolImage,
      extras: cartExtras
    });
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Edge-to-edge Pool Image at top */}
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image"
        onClick={handleImageClick}
      >
        {currentPoolImage ? (
          <img 
            src={currentPoolImage} 
            alt={pool.model}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
            <Waves size={48} className="text-primary/60" />
          </div>
        )}
        
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(pool.category)} text-white capitalize font-medium px-3 py-1`}>
            {pool.category}
          </Badge>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            Click for Details
          </div>
        </div>
        
        {/* Image Edit Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setShowImageEditor(true);
          }}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
      
      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        
        {/* Pool Name */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {pool.model}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            ${calculateTotalPrice().toLocaleString()}
          </span>
          {hasExtras && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              ${pool.price.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Features & Tech */}
        <div className="space-y-2">
          {pool.saltSystem && (
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-teal" />
              <span className="font-medium">Salt system included in final price</span>
            </div>
          )}
          {pool.carbonFiber && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Carbon Fiber Technology</span>
            </div>
          )}
        </div>
        
        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {pool.dimensions && <p>Dimensions: {pool.dimensions}</p>}
          {pool.depth && <p>Depth: {pool.depth}</p>}
          <p>Includes: 3 ft perimeter pavers around pool area</p>
          {pool.installationTimeWeeks && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Installation: {pool.installationTimeWeeks} weeks</span>
            </div>
          )}
          {pool.warrantyYears && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span className="font-bold text-primary">
                Warranty: {pool.warrantyYears === "Lifetime" || pool.warrantyYears === "Life" ? "LIFETIME WARRANTY" : `${pool.warrantyYears} years`}
              </span>
            </div>
          )}
        </div>
        
        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in-up">
            <Separator />
            
            {/* Pool Tile Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Pool Tiles</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {tileOptions.map((tile) => (
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
                                parent.style.backgroundColor = tile.color;
                                target.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{tile.name}</p>
                          {tile.price > 0 && (
                            <p className="text-xs text-primary font-semibold text-center mt-1">+${tile.price.toLocaleString()}</p>
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

            {/* Pool Finishing Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Pool Finishes</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {finishOptions.map((finish) => (
                    <CarouselItem key={finish.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
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
                            {finish.price && (
                              <p className="text-xs text-foreground font-semibold text-center">+${finish.price.toLocaleString()}</p>
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

            {/* Pool Liner Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Premium Pool Liners</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {linerOptions.map((liner) => (
                    <CarouselItem key={liner.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
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

            {/* Cover Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Cover Options</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {coverOptions.map((cover) => (
                  <div 
                    key={cover.name}
                    className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      extras.coverOption === cover.name ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => setExtras(prev => ({ ...prev, coverOption: cover.name }))}
                  >
                    <div 
                      className="w-full h-12 rounded-md mb-2"
                      style={{ backgroundColor: cover.color }}
                    />
                    <p className="text-xs font-medium text-center">{cover.name}</p>
                    {cover.price > 0 && (
                      <p className="text-xs text-muted-foreground text-center">+${cover.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Additional Features</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.heater}
                    onCheckedChange={() => toggleExtra('heater')}
                    className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                  />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-coral" />
                    <span className="text-sm">Add Pool Heater (+${extras.heater ? (() => {
                      const selectedHeater = poolHeaters.find((heater) => heater.name === extras.heaterModel);
                      return selectedHeater ? selectedHeater.price.toLocaleString() : '0';
                    })() : '0'})</span>
                  </div>
                </label>

                {extras.heater && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Heater Model:</label>
                     <div className="grid grid-cols-1 gap-2">
                       {poolHeaters.map((heater) => (
                          <button
                            key={heater.name}
                            onClick={() => setExtras(prev => ({ ...prev, heaterModel: heater.name }))}
                            className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                              extras.heaterModel === heater.name 
                                ? 'border-coral bg-coral/10 text-coral' 
                                : 'border-border hover:border-coral/50'
                            }`}
                          >
                            <img src={heater.image} alt={heater.name} className="w-8 h-8 rounded object-cover" />
                            <div className="flex-1 text-left">
                              <div>{heater.name}</div>
                              <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                              {heater.description && (
                                <div className="text-xs text-muted-foreground">{heater.description}</div>
                              )}
                            </div>
                           </button>
                         ))}
                    </div>
                  </div>
                )}
                
                {/* Tile/Liner Exclusivity Helper Text */}
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 font-medium text-center">
                    Choose either tile or liner — not both.
                  </p>
                </div>
                
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.tiles}
                    onCheckedChange={() => toggleExtra('tiles')}
                    disabled={extras.liner}
                  />
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-primary" />
                    <span className="text-sm">Premium Tiles (select from tiles above)</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.liner}
                    onCheckedChange={() => toggleExtra('liner')}
                    disabled={extras.tiles}
                  />
                  <div className="flex items-center space-x-1">
                    <Waves size={16} className="text-teal" />
                    <span className="text-sm">Premium Liner (select from liners above)</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.jets}
                    onCheckedChange={() => toggleExtra('jets')}
                  />
                  <div className="flex items-center space-x-1">
                    <Zap size={16} className="text-orange" />
                    <span className="text-sm">Spa Jets (+${getExtraPrice('jets').toLocaleString()})</span>
                  </div>
                </label>
                
                 
                 <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      checked={extras.spa}
                      onCheckedChange={() => toggleExtra('spa')}
                    />
                    <div className="flex items-center space-x-1">
                      <Waves size={16} className="text-primary" />
                       <span className="text-sm">Add Spa (+${extras.spa ? (() => {
                         const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
                         return selectedSpa ? selectedSpa.price.toLocaleString() : '0';
                       })() : '0'})</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      checked={extras.tanningLedge}
                      onCheckedChange={() => toggleExtra('tanningLedge')}
                    />
                    <div className="flex items-center space-x-1">
                      <Sun size={16} className="text-coral" />
                       <span className="text-sm">Add Tanning Ledge (+${extras.tanningLedge ? (() => {
                         const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
                         return selectedLedge ? selectedLedge.price.toLocaleString() : '0';
                       })() : '0'})</span>
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
                                extras.spaModel === spa.model 
                                  ? 'border-primary bg-primary/10 text-primary' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {spa.image && (
                                <img src={spa.image} alt={spa.model} className="w-8 h-8 rounded object-cover" />
                              )}
                              <div className="flex-1 text-left">
                                <div>{spa.model}</div>
                                <div className="text-xs text-muted-foreground">${spa.price.toLocaleString()}</div>
                              </div>
                             </button>
                           ))}
                      </div>
                    </div>
                  )}

                  {extras.tanningLedge && (
                    <div className="ml-6 space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Select Tanning Ledge Model:</label>
                       <div className="grid grid-cols-1 gap-2">
                         {tanningLedges.map((ledge: any) => (
                            <button
                              key={ledge.name}
                              onClick={() => setExtras(prev => ({ ...prev, tanningLedgeModel: ledge.name }))}
                              className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                extras.tanningLedgeModel === ledge.name 
                                  ? 'border-coral bg-coral/10 text-coral' 
                                  : 'border-border hover:border-coral/50'
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
               </div>
             </div>

            {/* Carbon Fiber Technology Section */}
            {pool.carbonFiber && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-teal/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Carbon Fiber Technology
                </h4>
                <p className="text-sm text-muted-foreground">
                  Our advanced carbon fiber construction provides superior strength, durability, and 
                  longevity. This cutting-edge technology ensures your pool maintains its structural 
                  integrity for decades while offering unmatched resistance to cracking and fading.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 300% stronger than traditional fiberglass</li>
                  <li>• Superior thermal retention</li>
                  <li>• UV-resistant surface coating</li>
                  <li>• Lifetime structural warranty</li>
                </ul>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  onClick={() => onViewDetails(pool)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Details
                </Button>
                <Button 
                  onClick={() => onRequestQuote(pool, extras)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Quote
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
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
              
              {/* Financing Option */}
              <div className="mt-2">
                <StripeCheckoutButton
                  productId={`pool_${pool.model.replace(/\s+/g, '_')}`}
                  productName={pool.model}
                  price={calculateTotalPrice()}
                  variant="outline"
                  className="w-full"
                  size="sm"
                  showFinancingOptions={true}
                />
              </div>
            </div>
            </div>
        )}
        
        {/* Default Action Button */}
        {!showDetails && (
          <Button 
            onClick={handleImageClick}
            variant="gradient"
            className="w-full hover:scale-105 transition-all duration-300"
            size="sm"
          >
            View Details
          </Button>
        )}
      </CardContent>
      
      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onImageSave={handleImageSave}
        currentImage={currentPoolImage}
      />
    </Card>
  );
};

export default PoolProductCard;