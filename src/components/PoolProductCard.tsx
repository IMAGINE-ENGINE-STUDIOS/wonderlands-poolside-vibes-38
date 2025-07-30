import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Star, Clock, Award, Cpu, Edit, ShoppingCart } from "lucide-react";
import StripeCheckoutButton from "./StripeCheckoutButton";
import ImageEditor from "./ImageEditor";
import { useShoppingCart } from "./ShoppingCart";

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
  spa: boolean;
  spaModel: string;
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

// Import pool liners from PoolCatalog
import { poolLiners, poolTiles } from './PoolCatalog';

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
  { name: 'Standard Safety Cover', color: '#708090', price: 0 },
  { name: 'Automatic Cover', color: '#2F4F4F', price: 5000 },
  { name: 'Solar Cover', color: '#4169E1', price: 800 },
  { name: 'Winter Cover', color: '#000080', price: 400 }
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
    saltSystem: false,
    finish: 'Nantuke',
    linerOption: 'standard',
    coverOption: 'standard',
    tiles: false,
    tileOption: 'Standard Waterline',
    spa: false,
    spaModel: 'Genesis'
  });
  
  const { addToCart } = useShoppingCart();

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
    
    if (extras.heater) cartExtras.push({ name: 'Pool Heater', price: getExtraPrice('heater') });
    if (extras.saltSystem) cartExtras.push({ name: 'Salt System', price: getExtraPrice('saltSystem') });
    if (extras.jets) cartExtras.push({ name: 'Spa Jets', price: getExtraPrice('jets') });
    if (extras.tiles) cartExtras.push({ name: 'Premium Tiles', price: getExtraPrice('tiles') });
    
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
                    <div className="w-full h-12 rounded-md mb-2 overflow-hidden">
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
                    <p className="text-xs font-medium text-center">{tile.name}</p>
                    {tile.price > 0 && (
                      <p className="text-xs text-muted-foreground text-center">+${tile.price.toLocaleString()}</p>
                    )}
                    {tile.description && (
                      <p className="text-xs text-muted-foreground text-center mt-1 leading-tight">{tile.description}</p>
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

            {/* Pool Liner Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Premium Pool Liners</h4>
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
                    {liner.type && liner.type !== 'Standard' && (
                      <p className="text-xs text-primary text-center font-medium">{liner.type}</p>
                    )}
                    {liner.price > 0 && (
                      <p className="text-xs text-muted-foreground text-center">+${liner.price.toLocaleString()}</p>
                    )}
                    {liner.description && (
                      <p className="text-xs text-muted-foreground text-center mt-1 leading-tight">{liner.description}</p>
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
                 
                 <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                   <Checkbox 
                     checked={extras.spa}
                     onCheckedChange={() => toggleExtra('spa')}
                   />
                   <div className="flex items-center space-x-1">
                     <Waves size={16} className="text-primary" />
                     <span className="text-sm">Add Spa (+${extras.spa ? (() => {
                       const spaPrices = { 'Genesis': 28500, 'Hermosa': 22800, 'Rectangle': 19500, 'Simcircle': 18200 };
                       return (spaPrices[extras.spaModel as keyof typeof spaPrices] || 0).toLocaleString();
                     })() : '0'})</span>
                   </div>
                 </label>
                 
                 {extras.spa && (
                   <div className="ml-6 space-y-2">
                     <label className="text-xs font-medium text-muted-foreground">Select Spa Model:</label>
                     <div className="grid grid-cols-2 gap-2">
                       {['Genesis', 'Hermosa', 'Rectangle', 'Simcircle'].map((spaModel) => (
                         <button
                           key={spaModel}
                           onClick={() => setExtras(prev => ({ ...prev, spaModel }))}
                           className={`p-2 text-xs rounded-md border transition-all ${
                             extras.spaModel === spaModel 
                               ? 'border-primary bg-primary/10 text-primary' 
                               : 'border-border hover:border-primary/50'
                           }`}
                         >
                           {spaModel}
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