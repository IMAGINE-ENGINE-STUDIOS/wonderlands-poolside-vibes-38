import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { poolTiles } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
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
import { DollarSign, Clock, Shield, Waves, Star, Award, ShoppingCart, Thermometer, Home, Zap, Palette, Calculator, CreditCard, Cpu } from 'lucide-react';

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
  concreteConstruction: boolean;
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
    screenEnclosureArea: 1000,
    screenEnclosureQuality: 'standard',
    poolHeater: false,
    heaterModel: 'Pentair MasterTemp 125 (125K BTU)',
    concreteConstruction: false
  });

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
  const paverOptions = paverTypes
    .filter(paver => paver.category === 'paver')
    .map(paver => ({
      name: paver.name,
      price: 0, // Base price for selection, actual cost calculated per sq ft
      image: paver.image,
      description: paver.description,
      pricePerSqFt: paver.basePrice // $20 per sq ft
    }));

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
      // Only calculate paver surface area cost, no base price
      if (options.paverSurfaceArea && !isNaN(parseFloat(options.paverSurfaceArea))) {
        total += parseFloat(options.paverSurfaceArea) * 20;
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
    
    if (options.concreteConstruction) {
      total += 15000;
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
      extrasArray.push({ name: `Paver Surface Area (${options.paverSurfaceArea} sq ft)`, price: parseFloat(options.paverSurfaceArea) * 20 });
    }
    if (options.tiles) extrasArray.push({ name: `Tiles: ${options.tileOption}`, price: tileOptions.find(t => t.name === options.tileOption)?.price || 0 });
    if (options.screenEnclosure && options.screenEnclosureArea > 0) {
      let pricePerSqFt = 20;
      if (options.screenEnclosureQuality === 'deluxe') pricePerSqFt = 27;
      if (options.screenEnclosureQuality === 'premium') pricePerSqFt = 33;
      extrasArray.push({ name: `Screen Enclosure: ${screenEnclosureQualities.find(q => q.key === options.screenEnclosureQuality)?.name} (${options.screenEnclosureArea} sq ft)`, price: options.screenEnclosureArea * pricePerSqFt });
    }
    if (options.poolHeater) extrasArray.push({ name: `Heater: ${options.heaterModel}`, price: heaterOptions.find(h => h.name === options.heaterModel)?.price || 0 });
    if (options.concreteConstruction) extrasArray.push({ name: 'Concrete Construction', price: 15000 });
    
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
              <h4 className="font-semibold text-foreground">Pavers Surface Area - Calculator</h4>
              <div className="mb-3">
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
                    Calculated Cost: ${(parseFloat(options.paverSurfaceArea) * 20).toLocaleString()} (${options.paverSurfaceArea} sq ft × $20/sq ft)
                  </div>
                )}
              </div>
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
            </div>

            {/* Screen Enclosure Options - matching Latham format */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Screen Enclosure Surface Area - Calculator</h4>
              <div className="mb-3">
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
                      let pricePerSqFt = 15;
                      if (options.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
                      if (options.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
                      return (options.screenEnclosureArea * pricePerSqFt).toLocaleString();
                    })()} (${options.screenEnclosureArea} sq ft × ${(() => {
                      if (options.screenEnclosureQuality === 'deluxe') return '$22';
                      if (options.screenEnclosureQuality === 'premium') return '$28';
                      return '$15';
                    })()}/sq ft)
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {screenEnclosureQualities.map((quality) => (
                  <div
                    key={quality.key}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      options.screenEnclosureQuality === quality.key ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => updateOption('screenEnclosureQuality', quality.key)}
                  >
                    <p className="text-sm font-medium">{quality.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${quality.price}/sq ft
                    </p>
                  </div>
                ))}
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
                    <div className="grid grid-cols-1 gap-2">
                      {heaterOptions.map((heater) => (
                        <button
                          key={heater.name}
                          onClick={() => updateOption('heaterModel', heater.name)}
                          className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                            options.heaterModel === heater.name 
                              ? 'border-coral bg-coral/10 text-coral' 
                              : 'border-border hover:border-coral/50'
                          }`}
                        >
                          <div className="flex-1 text-left">
                            <div>{heater.name}</div>
                            <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
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
                  variant="outline" 
                  className="flex-1"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Instant Quote
                </Button>
                
                <Button 
                  onClick={handleAddToCart}
                  variant="outline" 
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
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
                      <CreditCard className="w-3 h-3 mr-1" />
                      {showFinancing ? 'Hide' : 'Show'} Options
                    </Button>
                  </div>
                  
                  {showFinancing && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="font-semibold">3 Years</div>
                          <div className="text-teal-600">${Math.round((pool.price + calculateTotal()) / 36).toLocaleString()}/mo</div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="font-semibold">6 Years</div>
                          <div className="text-teal-600">${Math.round((pool.price + calculateTotal()) / 72).toLocaleString()}/mo</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="sm" 
                        onClick={() => {
                          const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?amount=${pool.price + calculateTotal()}&product=${encodeURIComponent(pool.model)}&description=${encodeURIComponent(`Complete pool configuration including ${pool.model}`)}&monthly_payment=${Math.round((pool.price + calculateTotal()) * 0.008)}&loan_term=60&project_type=Pool%20Installation`;
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
            </div>
          </div>
        )}
        
        {/* Default Action Buttons */}
        {!showDetails && (
          <div className="space-y-2">
            <Button 
              onClick={() => {
                setShowQuoteModal(true);
              }}
              variant="outline" 
              className="w-full" 
              size="sm"
            >
              Instant Quote
            </Button>
            <Button 
              onClick={() => setShowDetails(true)} 
              variant="gradient" 
              className="w-full hover:scale-105 transition-all duration-300" 
              size="sm"
            >
              View Details
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Survey Quote Tool Modal */}
      <SurveyQuoteTool 
        pool={{
          model: pool.model,
          price: pool.price + calculateTotal(),
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
              name: `Paver Installation Area: ${options.paverSurfaceArea} sq ft`, 
              price: parseFloat(options.paverSurfaceArea) * 15,
              description: `Professional paver installation at $15 per sq ft`,
              category: 'pavers'
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
                let pricePerSqFt = 15;
                if (options.screenEnclosureQuality === 'deluxe') pricePerSqFt = 22;
                if (options.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
                return options.screenEnclosureArea * pricePerSqFt;
              })(),
              description: `${options.screenEnclosureArea} sq ft at $${(() => {
                if (options.screenEnclosureQuality === 'deluxe') return '22';
                if (options.screenEnclosureQuality === 'premium') return '28';
                return '15';
              })()} per sq ft`,
              category: 'enclosure'
            }] : []),
            ...(options.poolHeater ? [{ 
              name: `Pool Heater: ${options.heaterModel}`, 
              price: heaterOptions.find(h => h.name === options.heaterModel)?.price || 0,
              description: 'Professional heater installation included',
              category: 'heating'
            }] : []),
            ...(options.concreteConstruction ? [{ 
              name: 'Premium Concrete Construction', 
              price: 15000,
              description: 'Enhanced concrete construction for superior durability and longevity',
              category: 'construction'
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