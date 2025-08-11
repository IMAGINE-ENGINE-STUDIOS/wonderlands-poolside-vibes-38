import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Waves, DollarSign, Star, Clock, Award, Flame, Zap, Palette, ShoppingCart } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { poolLiners, poolTiles } from "@/data/poolData";

interface Spa {
  model: string;
  price: number;
  category: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  spilloverFeature?: boolean;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  image?: string;
}

interface SpaProductCardProps {
  spa: Spa;
  onViewDetails: (spa: Spa) => void;
  onRequestQuote: (spa: Spa, extras?: SpaExtras) => void;
}

interface SpaExtras {
  finish: string;
  liner: string;
  tiles: string;
  heater: boolean;
  jets: boolean;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-amber-500 to-orange-500';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getExtraPrice = (extra: string) => {
  switch (extra) {
    case 'heater': return 3500;
    case 'jets': return 2500;
    default: return 0;
  }
};

// Pool finishes data
const poolFinishes = [
  { name: 'Ocean Blue' }, 
  { name: 'Sapphire Blue' }, 
  { name: 'Aquamarine' }, 
  { name: 'Night Sky' },
  { name: 'Athens Pearl White' },
  { name: 'Coastal Bronze' }
];

const SpaProductCard = ({ spa, onViewDetails, onRequestQuote }: SpaProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [extras, setExtras] = useState<SpaExtras>({
    finish: poolFinishes[0]?.name || '',
    liner: poolLiners[0]?.name || '',
    tiles: poolTiles[0]?.name || '',
    heater: false,
    jets: false,
  });
  
  const { addToCart } = useShoppingCart();

  const handleImageClick = () => {
    setShowDetails(!showDetails);
  };

  const toggleExtra = (extra: keyof SpaExtras) => {
    setExtras(prev => ({
      ...prev,
      [extra]: typeof prev[extra] === 'boolean' ? !prev[extra] : prev[extra]
    }));
  };

  const setExtra = (extra: keyof SpaExtras, value: any) => {
    setExtras(prev => ({
      ...prev,
      [extra]: value
    }));
  };

  const calculateTotalPrice = () => {
    let total = spa.price;
    if (extras.heater) total += getExtraPrice('heater');
    if (extras.jets) total += getExtraPrice('jets');
    return total;
  };

  const hasExtras = extras.heater || extras.jets;

  const handleAddToCart = () => {
    const cartExtras = [];
    
    if (extras.finish) cartExtras.push({ name: `Finish: ${extras.finish}`, price: 0 });
    if (extras.liner) cartExtras.push({ name: `Liner: ${extras.liner}`, price: 0 });
    if (extras.tiles) cartExtras.push({ name: `Tiles: ${extras.tiles}`, price: 0 });
    if (extras.heater) cartExtras.push({ name: 'Spa Heater', price: getExtraPrice('heater') });
    if (extras.jets) cartExtras.push({ name: 'Premium Spa Jets', price: getExtraPrice('jets') });

    addToCart({
      id: `spa_${spa.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: `${spa.model} Spa`,
      price: spa.price,
      category: spa.category,
      image: spa.image,
      extras: cartExtras
    });
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Edge-to-edge Spa Image at top */}
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image"
        onClick={handleImageClick}
      >
        {spa.image ? (
          <img 
            src={spa.image} 
            alt={spa.model}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
            <Waves size={48} className="text-primary/60" />
          </div>
        )}
        
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(spa.category)} text-white capitalize font-medium px-3 py-1`}>
            <span className="flex items-center gap-1">
              <Waves size={16} />
              {spa.category}
            </span>
          </Badge>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            Click for Details
          </div>
        </div>
      </div>
      
      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        
        {/* Spa Name */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {spa.model}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
          ))}
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            ${calculateTotalPrice().toLocaleString()}
          </span>
          {hasExtras && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              ${spa.price.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {spa.dimensions && <p>Size: {spa.dimensions}</p>}
          {spa.depth && <p>Depth: {spa.depth}</p>}
          {spa.installationTimeWeeks && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Installation: {spa.installationTimeWeeks} weeks</span>
            </div>
          )}
          {spa.warrantyYears && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span className="font-bold text-primary">
                Warranty: {spa.warrantyYears === "Lifetime" || spa.warrantyYears === "Life" ? "LIFETIME WARRANTY" : `${spa.warrantyYears} years`}
              </span>
            </div>
          )}
        </div>

        {/* Key Features */}
        {spa.features && spa.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Features:</h4>
            <ul className="space-y-1">
              {spa.features.slice(0, 2).map((feature, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in-up">
            <Separator />
            
            {/* Finishes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Palette size={16} />
                Spa Finishes
              </h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {poolFinishes.map((finish) => (
                    <CarouselItem key={finish.name} className="pl-1 basis-1/2 sm:basis-1/3">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                          extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => setExtra('finish', finish.name)}
                      >
                        <div className="w-full h-12 rounded-md mb-2 bg-gradient-to-br from-primary/20 to-teal/20 flex items-center justify-center">
                          <Palette size={20} className="text-primary/60" />
                        </div>
                        <p className="text-xs font-medium text-center">{finish.name}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            {/* Tiles */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Spa Tiles</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {poolTiles.slice(0, 6).map((tile) => (
                    <CarouselItem key={tile.name} className="pl-1 basis-1/2 sm:basis-1/3">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                          extras.tiles === tile.name ? 'border-teal bg-teal/10' : 'border-border'
                        }`}
                        onClick={() => setExtra('tiles', tile.name)}
                      >
                        <div className="w-full h-12 rounded-md mb-2 overflow-hidden">
                          {tile.image ? (
                            <img 
                              src={tile.image} 
                              alt={tile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal/20 to-primary/20 flex items-center justify-center">
                              <div className="w-3 h-3 bg-teal rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-center">{tile.name}</p>
                        {tile.price > 0 && (
                          <p className="text-xs text-teal font-semibold text-center">+${tile.price.toLocaleString()}</p>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            {/* Liners */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Spa Liners</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {poolLiners.slice(0, 6).map((liner) => (
                    <CarouselItem key={liner.name} className="pl-1 basis-1/2 sm:basis-1/3">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                          extras.liner === liner.name ? 'border-secondary bg-secondary/10' : 'border-border'
                        }`}
                        onClick={() => setExtra('liner', liner.name)}
                      >
                        <div className="w-full h-12 rounded-md mb-2 overflow-hidden">
                          {liner.image ? (
                            <img 
                              src={liner.image} 
                              alt={liner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                              <div className="w-3 h-3 bg-secondary rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-center">{liner.name}</p>
                        {liner.price > 0 && (
                          <p className="text-xs text-secondary font-semibold text-center">+${liner.price.toLocaleString()}</p>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            {/* Add-ons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Premium Add-ons</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                  <Checkbox 
                    checked={extras.heater}
                    onCheckedChange={() => toggleExtra('heater')}
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <Flame size={20} className="text-red-500" />
                    <span className="text-sm font-medium">Premium Spa Heater</span>
                    <span className="text-sm text-muted-foreground ml-auto">(+${getExtraPrice('heater').toLocaleString()})</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                  <Checkbox 
                    checked={extras.jets}
                    onCheckedChange={() => toggleExtra('jets')}
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <Zap size={20} className="text-orange" />
                    <span className="text-sm font-medium">Therapeutic Spa Jets</span>
                    <span className="text-sm text-muted-foreground ml-auto">(+${getExtraPrice('jets').toLocaleString()})</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={() => onViewDetails(spa)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Full Details
                </Button>
                <Button 
                  onClick={() => onRequestQuote(spa, extras)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Get Quote
                </Button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                variant="gradient"
                className="w-full hover:scale-105 transition-all duration-300"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart - ${calculateTotalPrice().toLocaleString()}
              </Button>
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
    </Card>
  );
};

export default SpaProductCard;