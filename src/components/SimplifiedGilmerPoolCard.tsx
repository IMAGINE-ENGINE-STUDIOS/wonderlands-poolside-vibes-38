import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { poolTiles } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { gilmerSpas } from "@/data/gilmerSpas";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useShoppingCart } from "./ShoppingCartProvider";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "./OptimizedImage";
import SurveyQuoteTool from "./SurveyQuoteTool";
import StripeCheckoutButton from "./StripeCheckoutButton";
import { DollarSign, Clock, Shield, Waves, Star, Award, ShoppingCart, Thermometer, Home, Zap, Palette, Calculator, CreditCard, Cpu, Droplets } from 'lucide-react';
import screenEnclosureDeluxe from "@/assets/screen-enclosure-deluxe.jpeg";
import screenEnclosurePremium from "@/assets/screen-enclosure-premium.jpeg";
import concreteDeckTexture from "@/assets/textures/concrete-deck.avif";
import FinancingOptions from "./FinancingOptions";

interface SimplifiedGilmerPoolCardProps {
  pool: {
    model: string;
    dimensions: string;
    depth: string;
    price: number;
    image: string;
    warranty: string;
    brand: string;
    type: string;
    installationTimeWeeks?: number;
    concreteInstallationWeeks?: number;
    websiteUrl?: string;
  };
}

import sunsetGroveImage from "@/assets/sunset-grove-kit-pool.jpg";
import maldivesImage from "@/assets/maldiveskit-castlerock.jpg";
import serenityImage from "@/assets/serenitykit.jpg";

interface GilmerOptions {
  colorFinish: string;
  pavers: boolean;
  paverOption: string;
  paverSurfaceArea: string;
  tiles: boolean;
  tileOption: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: string;
  poolHeater: boolean;
  heaterModel: string;
  addSpa: boolean;
  spaOption: string;
  concreteConstruction: boolean;
  rockyWaterfalls: boolean;
  rockyWaterfallsType: string;
  rockyWaterfallsColor: string;
}

const SimplifiedGilmerPoolCard = ({ pool }: SimplifiedGilmerPoolCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  
  const [showFinancing, setShowFinancing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const [options, setOptions] = useState<GilmerOptions>({
    colorFinish: 'Ocean Blue',
    pavers: false,
    paverOption: 'Appian Adobe',
    paverSurfaceArea: '',
    tiles: false,
    tileOption: 'Mountain',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: 'standard',
    poolHeater: false,
    heaterModel: 'Pentair MasterTemp 125 (125K BTU)',
    addSpa: false,
    spaOption: '',
    concreteConstruction: false,
    rockyWaterfalls: false,
    rockyWaterfallsType: 'Sunset Grove',
    rockyWaterfallsColor: 'Castle Rock'
  });

  // Rocky Waterfalls types with their prices and color options
  const rockyWaterfallsTypes = [
    { 
      name: 'Sunset Grove', 
      price: 17500, 
      image: sunsetGroveImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
    { 
      name: 'Maldives', 
      price: 5600, 
      image: maldivesImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
    { 
      name: 'Serenity', 
      price: 9500, 
      image: serenityImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
  ];

  // Gilmer Glass color options
  const colorOptions = [
    { name: 'Ocean Blue', color: '#1E40AF', price: 0 },
    { name: 'Sapphire Blue', color: '#2563EB', price: 0 },
    { name: 'Coastal Bronze', color: '#A16207', price: 0 },
    { name: 'Snow White', color: '#FFFFFF', price: 0 },
    { name: 'Steel Grey', color: '#6B7280', price: 0 },
    { name: 'Arctic White', color: '#F8FAFC', price: 0 },
    { name: 'Glacier Blue', color: '#0EA5E9', price: 0 }
  ];

  // Paver options from paverData with $20/sq ft pricing
  const paverOptions = [{
    name: 'Concrete Deck',
    price: 0,
    image: concreteDeckTexture,
    description: 'Standard concrete deck',
    pricePerSqFt: 20
  }, ...paverTypes
    .filter(paver => paver.category === 'paver')
    .map(paver => ({
      name: paver.name,
      price: 0,
      image: paver.image,
      description: paver.description,
      pricePerSqFt: paver.basePrice
    }))];

  // Pool tile options
  const tileOptions = [
    { name: 'Standard Waterline', price: 0, image: '/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.png' },
    ...poolTiles.map(tile => ({ name: tile.name, price: tile.price, image: tile.image }))
  ];

  // Screen enclosure options with proper quality names and pricing
  const screenEnclosureQualities = [
    { key: 'standard', name: 'Wonder Cage', price: 20 },
    { key: 'deluxe', name: 'Deluxe', price: 27 },
    { key: 'premium', name: '2 stories', price: 33 }
  ];

  // Pool heater options
  const heaterOptions = [
    { name: 'Pentair MasterTemp 125 (125K BTU)', price: 2300 },
    { name: 'Pentair MasterTemp 250 (250K BTU)', price: 3680 },
    { name: 'Pentair MasterTemp 400 (400K BTU)', price: 4830 },
    { name: 'Pentair UltraTemp 90 Heat Pump', price: 5175 },
    { name: 'Pentair UltraTemp 110 Heat Pump', price: 6325 },
    { name: 'Pentair UltraTemp 140 Heat Pump', price: 7475 }
  ];

  // Gilmer Spa add-on options (real data)
  const gilmerSpaOptions = gilmerSpas.map((spa) => ({
    name: spa.model,
    price: spa.price,
    image: spa.image,
  }));

  const toggleOption = (option: keyof GilmerOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const updateOption = (option: keyof GilmerOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    
    if (options.pavers) {
      // Calculate paver surface area cost using selected paver's basePrice
      if (options.paverSurfaceArea && !isNaN(parseFloat(options.paverSurfaceArea))) {
        const selectedPaver = paverOptions.find(p => p.name === options.paverOption);
        const pricePerSqFt = selectedPaver?.pricePerSqFt || 20;
        total += parseFloat(options.paverSurfaceArea) * pricePerSqFt;
      }
    }
    
    if (options.tiles) {
      const tilePrice = tileOptions.find(t => t.name === options.tileOption)?.price || 0;
      total += tilePrice;
    }
    
    if (options.screenEnclosure) {
      let pricePerSqFt = 20;
      if (options.screenEnclosureQuality === 'deluxe') pricePerSqFt = 27;
      if (options.screenEnclosureQuality === 'premium') pricePerSqFt = 33;
      total += options.screenEnclosureArea * pricePerSqFt;
    }
    
    if (options.poolHeater) {
      const heaterPrice = heaterOptions.find(h => h.name === options.heaterModel)?.price || 0;
      total += heaterPrice;
    }

    if (options.addSpa) {
      const spaPrice = gilmerSpaOptions.find(s => s.name === options.spaOption)?.price || 0;
      total += spaPrice;
    }
    
    if (options.concreteConstruction) {
      total += 15000;
    }
    
    if (options.rockyWaterfalls) {
      const waterfallType = rockyWaterfallsTypes.find(t => t.name === options.rockyWaterfallsType);
      total += waterfallType?.price || 17500;
    }
    
    return total;
  };

  const getInstallationTime = () => {
    if (options.concreteConstruction) {
      return pool.concreteInstallationWeeks || 18;
    }
    return pool.installationTimeWeeks || 8;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium':
        return 'bg-gradient-to-r from-coral to-orange';
      case 'deluxe':
        return 'bg-gradient-to-r from-primary to-teal';
      case 'standard':
        return 'bg-gradient-to-r from-[hsl(var(--golden))] to-[hsl(var(--golden-light))]';
      case 'compact':
        return 'bg-gradient-to-r from-teal to-primary';
      default:
        return 'bg-gradient-to-r from-primary to-teal';
    }
  };

  const handleAddToCart = () => {
    const extrasTotal = calculateTotal();
    const totalPrice = pool.price + extrasTotal;
    
    const extrasArray = [];
    extrasArray.push({ name: `Color: ${options.colorFinish}`, price: 0 });
    if (options.pavers && options.paverSurfaceArea && !isNaN(parseFloat(options.paverSurfaceArea))) {
      const selectedPaver = paverOptions.find(p => p.name === options.paverOption);
      const pricePerSqFt = selectedPaver?.pricePerSqFt || 20;
      extrasArray.push({ name: `Paver Surface Area (${options.paverSurfaceArea} sq ft)`, price: parseFloat(options.paverSurfaceArea) * pricePerSqFt });
    }
    if (options.tiles) extrasArray.push({ name: `Tiles: ${options.tileOption}`, price: tileOptions.find(t => t.name === options.tileOption)?.price || 0 });
    if (options.screenEnclosure && options.screenEnclosureArea > 0) {
      let pricePerSqFt = 20;
      if (options.screenEnclosureQuality === 'deluxe') pricePerSqFt = 27;
      if (options.screenEnclosureQuality === 'premium') pricePerSqFt = 33;
      extrasArray.push({ name: `Screen Enclosure: ${screenEnclosureQualities.find(q => q.key === options.screenEnclosureQuality)?.name} (${options.screenEnclosureArea} sq ft)`, price: options.screenEnclosureArea * pricePerSqFt });
    }
    if (options.poolHeater) extrasArray.push({ name: `Heater: ${options.heaterModel}`, price: heaterOptions.find(h => h.name === options.heaterModel)?.price || 0 });
    if (options.addSpa) extrasArray.push({ name: `Spa: ${options.spaOption || 'Gilmer Spa'}`, price: gilmerSpaOptions.find(s => s.name === options.spaOption)?.price || 0 });
    if (options.concreteConstruction) extrasArray.push({ name: 'Concrete Construction', price: 15000 });
    if (options.rockyWaterfalls) {
      const waterfallType = rockyWaterfallsTypes.find(t => t.name === options.rockyWaterfallsType);
      extrasArray.push({ name: `Rocky Waterfalls - ${options.rockyWaterfallsType}: ${options.rockyWaterfallsColor}`, price: waterfallType?.price || 17500 });
    }
    
    const productData = {
      id: `gilmer-${pool.model.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${pool.brand} ${pool.model}`,
      price: totalPrice,
      image: pool.image,
      category: 'Gilmer Glass Pool',
      extras: extrasArray,
      installationTimeWeeks: getInstallationTime(),
      constructionType: options.concreteConstruction ? 'Concrete' : 'Fiber'
    };
    
    addToCart(productData);
    
    toast({
      title: "Added to Cart",
      description: `${pool.brand} ${pool.model} has been added to your cart.`,
      duration: 3000,
    });
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Wide Pool Image at top - edge to edge with click to Wonderlands Studio */}
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 overflow-hidden group/image cursor-pointer"
        onClick={() => {
          navigate(`/wonderlands-studio?model=${encodeURIComponent(pool.model)}&price=${pool.price}&category=premium&image=${encodeURIComponent(pool.image)}`);
        }}
      >
        <OptimizedImage
          src={pool.image}
          alt={pool.model}
          className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-105"
          loading="lazy"
        />
        
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor('premium')} text-white border-0 px-3 py-1 text-xs font-semibold shadow-md`}>
            {pool.brand}
          </Badge>
        </div>

        {/* Hover overlay with text */}
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            Open in Studio
          </div>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Pool Title under image */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">{pool.model}</h3>
          <p className="text-sm text-muted-foreground font-medium">{pool.dimensions}</p>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                ${(pool.price + calculateTotal()).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {pool.dimensions && <p>Dimensions: {pool.dimensions}</p>}
          {pool.depth && <p>Depth: {pool.depth}</p>}
        <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs font-semibold text-primary mb-1">✓ Included with Pool:</p>
            <ul className="text-xs space-y-0.5">
              <li>• Salt system</li>
              <li>• Pentair pool equipment</li>
              <li>• LED light</li>
            </ul>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Installation: {getInstallationTime()} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span className="font-bold text-primary">
              Warranty: {pool.warranty}
            </span>
          </div>
        </div>
        
        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in">
            <Separator className="my-4" />

            {/* Gelcoat Color Selection */}
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
                  {colorOptions.map((color, idx) => (
                    <CarouselItem
                      key={`gelcoat-${color.name}-${idx}`}
                      className="pl-1 basis-1/2"
                    >
                      <div
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${options.colorFinish === color.name ? "border-primary bg-primary/10" : "border-border"}`}
                        onClick={() => updateOption('colorFinish', color.name)}
                      >
                        <div 
                          className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: color.color }}
                        />
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{color.name}</p>
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

            <Separator />

            {/* Pavers Options - matching Latham format */}
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
                  {paverOptions.map((paver, idx) => (
                    <CarouselItem key={`paver-${paver.name}-${idx}`} className="pl-1 basis-1/2">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                          options.paverOption === paver.name ? 'border-primary bg-primary/10' : 'border-border'
                        }`} 
                        onClick={() => updateOption('paverOption', paver.name)}
                      >
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                          <OptimizedImage 
                            src={paver.image} 
                            alt={paver.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{paver.name}</p>
                          {paver.pricePerSqFt > 0 && (
                            <p className="text-xs text-primary font-semibold text-center mt-1">
                              ${paver.pricePerSqFt}/sq ft
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
              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Paver Surface Area (sq ft)
                </label>
                <Input 
                  type="number" 
                  placeholder="Enter surface area for pavers" 
                  value={options.paverSurfaceArea} 
                  onChange={(e) => {
                    updateOption('paverSurfaceArea', e.target.value);
                    if (e.target.value && !isNaN(parseFloat(e.target.value)) && parseFloat(e.target.value) > 0) {
                      updateOption('pavers', true);
                    }
                  }} 
                  className="mb-2" 
                />
                {options.paverSurfaceArea && !isNaN(parseFloat(options.paverSurfaceArea)) && (
                  <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${(parseFloat(options.paverSurfaceArea) * (paverOptions.find(p => p.name === options.paverOption)?.pricePerSqFt || 20)).toLocaleString()} ({options.paverSurfaceArea} sq ft × ${paverOptions.find(p => p.name === options.paverOption)?.pricePerSqFt || 20}/sq ft)
                  </div>
                )}
              </div>
            </div>

            {/* Screen Enclosure Options - matching Latham format */}
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
                    { key: "standard", name: "Wonder Cage", price: 20, image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png" },
                    { key: "deluxe", name: "Deluxe", price: 27, image: screenEnclosureDeluxe },
                    { key: "premium", name: "2 Stories", price: 33, image: screenEnclosurePremium },
                  ].map((quality) => (
                    <CarouselItem key={quality.key} className="pl-1 basis-1/2">
                      <div
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                          options.screenEnclosureQuality === quality.key ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => updateOption('screenEnclosureQuality', quality.key)}
                      >
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                          <img 
                            src={quality.image} 
                            alt={quality.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{quality.name}</p>
                          <p className="text-xs text-primary font-semibold text-center mt-1">
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
                  placeholder="Enter surface area for screen enclosure"
                  value={options.screenEnclosureArea || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    updateOption('screenEnclosureArea', value);
                    if (value > 0) {
                      updateOption('screenEnclosure', true);
                    }
                  }}
                  className="mb-2"
                />
                {options.screenEnclosureArea > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${(() => {
                      let pricePerSqFt = 20;
                      if (options.screenEnclosureQuality === 'deluxe') pricePerSqFt = 27;
                      if (options.screenEnclosureQuality === 'premium') pricePerSqFt = 33;
                      return (options.screenEnclosureArea * pricePerSqFt).toLocaleString();
                    })()} ({options.screenEnclosureArea} sq ft × ${(() => {
                      if (options.screenEnclosureQuality === 'deluxe') return '27';
                      if (options.screenEnclosureQuality === 'premium') return '33';
                      return '20';
                    })()}/sq ft)
                  </div>
                )}
              </div>
            </div>

            {/* Additional Features - matching Latham format */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Additional Features</h4>

              <div className="grid grid-cols-1 gap-3">
                {/* Pool Tiles */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={options.tiles} 
                    onCheckedChange={() => toggleOption('tiles')} 
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex items-center space-x-1">
                    <Cpu size={16} className="text-primary" />
                    <span className="text-sm">Add Pool Tiles (+${options.tiles ? (tileOptions.find(t => t.name === options.tileOption)?.price || 0).toLocaleString() : '0'})</span>
                  </div>
                </label>
                {options.tiles && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Tile Option:</label>
                    <Carousel className="w-full">
                      <CarouselContent className="-ml-1">
                        {tileOptions.map((tile) => (
                          <CarouselItem key={tile.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                            <div 
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                options.tileOption === tile.name ? 'border-primary bg-primary/10' : 'border-border'
                              }`} 
                              onClick={() => updateOption('tileOption', tile.name)}
                            >
                              <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <OptimizedImage 
                                  src={tile.image} 
                                  alt={tile.name} 
                                  className="w-full h-full object-cover" 
                                  loading="lazy"
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

                {/* Pool Heater */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={options.poolHeater} 
                    onCheckedChange={() => toggleOption('poolHeater')} 
                    className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                  />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-coral" />
                    <span className="text-sm">Add Pool Heater (+${options.poolHeater ? (heaterOptions.find(h => h.name === options.heaterModel)?.price || 0).toLocaleString() : '0'})</span>
                  </div>
                </label>
                {options.poolHeater && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Heater Model:</label>
                    <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                      <CarouselContent className="-ml-1">
                        {heaterOptions.map((heater) => (
                          <CarouselItem key={heater.name} className="pl-1 basis-1/2">
                            <div
                              onClick={() => updateOption('heaterModel', heater.name)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                options.heaterModel === heater.name 
                                  ? 'border-coral bg-coral/10' 
                                  : 'border-border'
                              }`}
                            >
                              <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
                                <Thermometer className="h-8 w-8 text-coral" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between min-h-0">
                                <p className="text-xs font-medium text-center line-clamp-2">{heater.name}</p>
                                <p className="text-xs text-coral font-semibold text-center mt-1">${heater.price.toLocaleString()}</p>
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

                {/* Rocky Waterfalls */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={options.rockyWaterfalls}
                    onCheckedChange={() => toggleOption('rockyWaterfalls')}
                    className="data-[state=checked]:bg-stone-600 data-[state=checked]:border-stone-600"
                  />
                  <div className="flex items-center space-x-1">
                    <Waves size={16} className="text-stone-600" />
                    <span className="text-sm">
                      Rocky Waterfalls (+${options.rockyWaterfalls ? (rockyWaterfallsTypes.find(t => t.name === options.rockyWaterfallsType)?.price || 17500).toLocaleString() : '0'})
                    </span>
                  </div>
                </label>

                {options.rockyWaterfalls && (
                  <div className="ml-6 space-y-4">
                    <label className="text-xs font-medium text-muted-foreground">Select Waterfall Type:</label>
                    <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                      <CarouselContent className="-ml-1">
                        {rockyWaterfallsTypes.map((waterfall) => (
                          <CarouselItem key={waterfall.name} className="pl-1 basis-1/3">
                            <div
                              onClick={() => {
                                updateOption('rockyWaterfallsType', waterfall.name);
                                updateOption('rockyWaterfallsColor', waterfall.colors[0]);
                              }}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                options.rockyWaterfallsType === waterfall.name
                                  ? 'border-stone-600 bg-stone-600/10'
                                  : 'border-border'
                              }`}
                            >
                              <div className="w-full h-20 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <OptimizedImage
                                  src={waterfall.image}
                                  alt={waterfall.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between min-h-0">
                                <p className="text-xs font-medium text-center line-clamp-2">{waterfall.name}</p>
                                <p className="text-xs text-stone-600 font-semibold text-center mt-1">${waterfall.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0 animate-pulse" />
                      <CarouselNext className="right-0 animate-pulse" />
                    </Carousel>

                    <label className="text-xs font-medium text-muted-foreground">Select Color:</label>
                    <div className="flex gap-2">
                      {(rockyWaterfallsTypes.find(t => t.name === options.rockyWaterfallsType)?.colors || ['Castle Rock', 'Gray', 'Brown']).map((color) => (
                        <button
                          key={color}
                          onClick={() => updateOption('rockyWaterfallsColor', color)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            options.rockyWaterfallsColor === color
                              ? 'border-stone-600 bg-stone-600/10 text-stone-700'
                              : 'border-border hover:border-stone-600/50'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Spa */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={options.addSpa}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setOptions((prev) => ({
                        ...prev,
                        addSpa: isChecked,
                        spaOption: isChecked ? (prev.spaOption || gilmerSpaOptions[0]?.name || '') : ''
                      }));
                    }}
                    className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                  />
                  <div className="flex items-center space-x-1">
                    <Droplets size={16} className="text-coral" />
                    <span className="text-sm">
                      Add Gilmer Spa (+$
                      {options.addSpa
                        ? (gilmerSpaOptions.find((s) => s.name === options.spaOption)?.price || 0).toLocaleString()
                        : '0'}
                      )
                    </span>
                  </div>
                </label>

                {options.addSpa && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Spa Model:</label>
                    <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                      <CarouselContent className="-ml-1">
                        {gilmerSpaOptions.map((spa) => (
                          <CarouselItem key={spa.name} className="pl-1 basis-1/2">
                            <div
                              onClick={() => updateOption('spaOption', spa.name)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                options.spaOption === spa.name
                                  ? 'border-coral bg-coral/10'
                                  : 'border-border'
                              }`}
                            >
                              <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <OptimizedImage
                                  src={spa.image}
                                  alt={spa.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between min-h-0">
                                <p className="text-xs font-medium text-center line-clamp-2">{spa.name}</p>
                                <p className="text-xs text-coral font-semibold text-center mt-1">${spa.price.toLocaleString()}</p>
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

                {/* Concrete Construction */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={options.concreteConstruction} 
                    onCheckedChange={() => toggleOption('concreteConstruction')} 
                    className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                  />
                  <div className="flex items-center space-x-1">
                    <Shield size={16} className="text-coral" />
                    <span className="text-sm">Make it on Concrete (+$15,000)</span>
                  </div>
                </label>
                {options.concreteConstruction && (
                  <p className="text-xs text-muted-foreground ml-6 mt-1">Premium concrete construction for enhanced durability and longevity.</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/5 to-teal/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Pool Base Price</span>
                  <span className="text-lg font-bold text-foreground">${pool.price.toLocaleString()}</span>
                </div>
                
                {calculateTotal() > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Selected Options</span>
                      <span className="text-lg font-bold text-foreground">+${calculateTotal().toLocaleString()}</span>
                    </div>
                    <Separator className="my-2" />
                  </>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-base font-semibold text-foreground">Total Price</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    ${(pool.price + calculateTotal()).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setShowQuoteModal(true);
                  }}
                  className="flex-1 instant-quote-btn transition-all duration-300"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Instant Quote
                </Button>
                
                <Button 
                  onClick={handleAddToCart}
                  variant="outline" 
                  size="icon"
                  className="w-10 h-10"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>

              <StripeCheckoutButton 
                productId={`gilmer_${pool.model.toLowerCase().replace(/\s+/g, '_')}`}
                productName={`${pool.brand} ${pool.model}`}
                price={pool.price + calculateTotal()}
                variant="gradient"
                className="w-full hover:scale-105 transition-all duration-300"
                showFinancingOptions={false}
              />
              
              {/* Financing Options */}
              <FinancingOptions 
                totalPrice={pool.price + calculateTotal()}
                productName={`${pool.brand} ${pool.model}`}
              />
            </div>
          </div>
        )}
        
        {/* Color Carousel - Always Visible when collapsed */}
        {!showDetails && (
          <div className="space-y-3">
            <div 
              className="space-y-2"
              onMouseEnter={() => setShowDetails(true)}
              onTouchStart={() => setShowDetails(true)}
            >
              <h4 className="font-semibold text-foreground text-sm">Color Options</h4>
              <Carousel 
                className="w-full"
                opts={{
                  align: "start",
                  loop: false,
                  duration: 25,
                }}
              >
                <CarouselContent className="-ml-1">
                  {colorOptions.map((color, idx) => (
                    <CarouselItem
                      key={`gilmer-preview-${color.name}-${idx}`}
                      className="pl-1 basis-1/2"
                    >
                      <div
                        className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${options.colorFinish === color.name ? "border-primary bg-primary/10" : "border-border"}`}
                        onClick={() => {
                          updateOption('colorFinish', color.name);
                          setShowDetails(true);
                        }}
                      >
                        <div 
                          className="w-full h-12 rounded-md mb-1 overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: color.color }}
                        />
                        <p className="text-[10px] font-medium text-center line-clamp-1">{color.name}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 h-6 w-6" />
                <CarouselNext className="right-0 h-6 w-6" />
              </Carousel>
            </div>
            
            {/* Expand Arrow */}
            <div 
              className="flex flex-col items-center cursor-pointer py-2 hover:bg-muted/50 rounded-lg transition-all group"
              onClick={() => setShowDetails(true)}
              onMouseEnter={() => setShowDetails(true)}
            >
              <span className="text-xs text-muted-foreground mb-1">View all options</span>
              <svg 
                className="w-5 h-5 text-primary animate-bounce group-hover:text-primary/80 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Survey Quote Tool Modal */}
      <SurveyQuoteTool 
        pool={{
          model: pool.model,
          price: pool.price,
          category: 'premium' as const,
          dimensions: pool.dimensions,
          depth: pool.depth,
          image: pool.image
        }}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        extras={{
          // Pool Details
          poolModel: pool.model,
          poolBrand: pool.brand,
          poolDimensions: pool.dimensions,
          poolDepth: pool.depth,
          poolWarranty: pool.warranty,
          poolType: pool.type,
          basePrice: pool.price,
          
          // Configuration Options
          colorFinish: options.colorFinish,
          pavers: options.pavers,
          paverOption: options.paverOption,
          paverSurfaceArea: options.paverSurfaceArea,
          tiles: options.tiles,
          tileOption: options.tileOption,
          screenEnclosure: options.screenEnclosure,
          screenEnclosureArea: options.screenEnclosureArea,
          screenEnclosureQuality: options.screenEnclosureQuality,
          poolHeater: options.poolHeater,
          heaterModel: options.heaterModel,
          addSpa: options.addSpa,
          spaOption: options.spaOption,
          concreteConstruction: options.concreteConstruction,
          
          // Installation Details
          installationTime: getInstallationTime(),
          constructionType: options.concreteConstruction ? 'Concrete' : 'Fiber',
          
          // Complete Breakdown with All Details
          extrasBreakdown: [
            { 
              name: `Gelcoat Color: ${options.colorFinish}`, 
              price: 0, 
              description: 'Included gelcoat finish color',
              category: 'finish'
            },
            ...(options.pavers && options.paverSurfaceArea && !isNaN(parseFloat(options.paverSurfaceArea)) ? [{
              name: `Paver Installation: ${options.paverOption}`, 
              price: parseFloat(options.paverSurfaceArea) * (paverOptions.find(p => p.name === options.paverOption)?.pricePerSqFt || 20),
              description: `${options.paverSurfaceArea} sq ft at $${paverOptions.find(p => p.name === options.paverOption)?.pricePerSqFt || 20} per sq ft`,
              category: 'pavers',
              image: paverOptions.find(p => p.name === options.paverOption)?.image || '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png'
            }] : []),
            ...(options.tiles ? [{ 
              name: `Pool Tiles: ${options.tileOption}`, 
              price: tileOptions.find(t => t.name === options.tileOption)?.price || 0,
              description: `Premium waterline tile installation`,
              category: 'tiles'
            }] : []),
            ...(options.screenEnclosure && options.screenEnclosureArea > 0 ? [{ 
              name: `Screen Enclosure: ${screenEnclosureQualities.find(q => q.key === options.screenEnclosureQuality)?.name}`, 
              price: (() => {
                let pricePerSqFt = 20;
                if (options.screenEnclosureQuality === 'deluxe') pricePerSqFt = 27;
                if (options.screenEnclosureQuality === 'premium') pricePerSqFt = 33;
                return options.screenEnclosureArea * pricePerSqFt;
              })(),
              description: `${options.screenEnclosureArea} sq ft at $${(() => {
                if (options.screenEnclosureQuality === 'deluxe') return '27';
                if (options.screenEnclosureQuality === 'premium') return '33';
                return '20';
              })()} per sq ft`,
              category: 'enclosure'
            }] : []),
            ...(options.poolHeater ? [{ 
              name: `Pool Heater: ${options.heaterModel}`, 
              price: heaterOptions.find(h => h.name === options.heaterModel)?.price || 0,
              description: 'Professional heater installation included',
              category: 'heating'
            }] : []),
            ...(options.addSpa ? [{
              name: `Spa: ${options.spaOption || 'Gilmer Spa'}`,
              price: gilmerSpaOptions.find(s => s.name === options.spaOption)?.price || 0,
              image: gilmerSpaOptions.find(s => s.name === options.spaOption)?.image,
              description: 'Gilmer Glass spa add-on (installed with pool)',
              category: 'spa'
            }] : []),
            ...(options.concreteConstruction ? [{ 
              name: 'Premium Concrete Construction', 
              price: 15000,
              description: 'Enhanced concrete construction for superior durability and longevity',
              category: 'construction'
            }] : []),
            ...(options.rockyWaterfalls ? [{
              name: `Rocky Waterfalls - ${options.rockyWaterfallsType}: ${options.rockyWaterfallsColor}`,
              price: rockyWaterfallsTypes.find(t => t.name === options.rockyWaterfallsType)?.price || 17500,
              image: rockyWaterfallsTypes.find(t => t.name === options.rockyWaterfallsType)?.image,
              description: 'Premium rocky waterfall feature',
              category: 'waterfall'
            }] : [])
          ],
          extrasTotal: calculateTotal(),
          totalPrice: pool.price + calculateTotal(),
          deliveryTime: getInstallationTime() + ' weeks',
          
          // Quote Metadata
          quoteDate: new Date().toLocaleDateString(),
          quoteValid: '30 days',
          paymentTerms: 'Standard payment terms apply',
          warrantyInfo: pool.warranty,
          includedServices: [
            'Professional installation',
            'Site preparation',
            'Permits and inspections',
            'Equipment startup',
            'Customer training',
            'Warranty coverage'
          ]
        }}
      />
    </Card>
  );
};

export default SimplifiedGilmerPoolCard;