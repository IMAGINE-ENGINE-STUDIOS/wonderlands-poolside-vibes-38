import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Star, Clock, Award, Cpu } from "lucide-react";

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
  saltSystem: boolean;
  finish: string;
  linerOption: string;
  coverOption: string;
  tiles: boolean;
  tileOption: string;
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
    case 'liner': return 2500;
    case 'heater': return 4500;
    case 'cover': return 3200;
    case 'jets': return 1800;
    case 'saltSystem': return 7000;
    case 'tiles': return 3500;
    default: return 0;
  }
};

const finishOptions = [
  { name: 'Aquamarine', color: '#7FFFD4', image: aquamarineFinish },
  { name: 'Ocean Blue', color: '#006994', image: oceanBlueFinish },
  { name: 'Sapphire Blue', color: '#0F52BA', image: sapphireBlueFinish },
  { name: 'Night Sky', color: '#191970', image: nightSkyFinish },
  { name: 'Athens Pearl White', color: '#F5F5DC', image: athensPearlFinish }
];

const linerOptions = [
  { name: 'Standard Blue', color: '#4169E1', price: 0, image: azureBlueFinish },
  { name: 'Lagoon Blue', color: '#20B2AA', price: 500, image: lagoonBlueFinish },
  { name: 'Azure Blue', color: '#007FFF', price: 750, image: azureBlueFinish },
  { name: 'Coastal Bronze', color: '#CD7F32', price: 1000, image: coastalBronzeFinish },
  { name: 'Shale Gray', color: '#778899', price: 1200, image: shaleGrayFinish }
];

const coverOptions = [
  { name: 'Standard Safety Cover', color: '#708090', price: 0 },
  { name: 'Automatic Cover', color: '#2F4F4F', price: 5000 },
  { name: 'Solar Cover', color: '#4169E1', price: 800 },
  { name: 'Winter Cover', color: '#000080', price: 400 }
];

const tileOptions = [
  { name: 'Standard Waterline', color: '#4682B4', price: 0 },
  { name: 'Premium Glass Mosaic', color: '#20B2AA', price: 2500 },
  { name: 'Natural Stone', color: '#8B7355', price: 3200 },
  { name: 'Ceramic Decorative', color: '#4169E1', price: 1800 },
  { name: 'Iridescent Glass', color: '#9370DB', price: 4000 }
];

const PoolProductCard = ({ pool, onViewDetails, onRequestQuote }: PoolProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [extras, setExtras] = useState<PoolExtras>({
    liner: false,
    heater: false,
    cover: false,
    jets: false,
    saltSystem: false,
    finish: 'standard',
    linerOption: 'standard',
    coverOption: 'standard',
    tiles: false,
    tileOption: 'Standard Waterline'
  });

  const handleImageClick = () => {
    setShowDetails(!showDetails);
  };

  const toggleExtra = (extra: keyof PoolExtras) => {
    setExtras(prev => ({
      ...prev,
      [extra]: !prev[extra]
    }));
  };

  const calculateTotalPrice = () => {
    let total = pool.price;
    
    // Add base extras
    if (extras.liner) total += getExtraPrice('liner');
    if (extras.heater) total += getExtraPrice('heater');
    if (extras.cover) total += getExtraPrice('cover');
    if (extras.jets) total += getExtraPrice('jets');
    if (extras.saltSystem) total += getExtraPrice('saltSystem');
    if (extras.tiles) total += getExtraPrice('tiles');
    
    // Add option prices
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) total += linerOption.price;
    
    const coverOption = coverOptions.find(option => option.name === extras.coverOption);
    if (coverOption && extras.cover) total += coverOption.price;
    
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) total += tileOption.price;
    
    return total;
  };

  const hasExtras = Object.values(extras).some(value => value);

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Edge-to-edge Pool Image at top */}
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image"
        onClick={handleImageClick}
      >
        {pool.image ? (
          <img 
            src={pool.image} 
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
          {pool.heater && (
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-coral" />
              <span className="font-medium">Heater Ready</span>
            </div>
          )}
          {pool.saltSystem && (
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-teal" />
              <span className="font-medium">+7,000 Salt System Compatible</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tileOptions.map((tile) => (
                  <div 
                    key={tile.name}
                    className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      extras.tileOption === tile.name ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => setExtras(prev => ({ ...prev, tileOption: tile.name }))}
                  >
                    <div 
                      className="w-full h-12 rounded-md mb-2"
                      style={{ backgroundColor: tile.color }}
                    />
                    <p className="text-xs font-medium text-center">{tile.name}</p>
                    {tile.price > 0 && (
                      <p className="text-xs text-muted-foreground text-center">+${tile.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pool Finishing Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Pool Finishes</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {finishOptions.map((finish) => (
                  <div 
                    key={finish.name}
                    className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => setExtras(prev => ({ ...prev, finish: finish.name }))}
                  >
                   <div className="w-full h-12 rounded-md mb-2 overflow-hidden">
                      <img 
                        src={finish.image} 
                        alt={finish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to color if image fails to load
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = finish.color;
                            target.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-center">{finish.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Liner Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Liner Options</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {linerOptions.map((liner) => (
                  <div 
                    key={liner.name}
                    className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => setExtras(prev => ({ ...prev, linerOption: liner.name }))}
                  >
                    <div className="w-full h-12 rounded-md mb-2 overflow-hidden">
                      <img 
                        src={liner.image} 
                        alt={liner.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to color if image fails to load
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = liner.color;
                            target.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-center">{liner.name}</p>
                    {liner.price > 0 && (
                      <p className="text-xs text-muted-foreground text-center">+${liner.price}</p>
                    )}
                  </div>
                ))}
              </div>
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
                  />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-coral" />
                    <span className="text-sm">Pool Heater (+${getExtraPrice('heater').toLocaleString()})</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.saltSystem}
                    onCheckedChange={() => toggleExtra('saltSystem')}
                  />
                  <div className="flex items-center space-x-1">
                    <Droplets size={16} className="text-teal" />
                    <span className="text-sm">Salt System (+${getExtraPrice('saltSystem').toLocaleString()})</span>
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
                    checked={extras.tiles}
                    onCheckedChange={() => toggleExtra('tiles')}
                  />
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-primary" />
                    <span className="text-sm">Premium Tiles (+${getExtraPrice('tiles').toLocaleString()})</span>
                  </div>
                </label>
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
            <div className="flex gap-2">
              <Button 
                onClick={() => onViewDetails(pool)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Full Details
              </Button>
              <Button 
                onClick={() => onRequestQuote(pool, extras)}
                variant="gradient"
                className="flex-1 hover:scale-105 transition-all duration-300"
                size="sm"
              >
                Get Quote
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

export default PoolProductCard;