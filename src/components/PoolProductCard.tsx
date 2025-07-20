import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Star, Clock, Award } from "lucide-react";
import Enhanced3DPoolViewer from "./Enhanced3DPoolViewer";

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
  warrantyYears?: number;
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
    default: return 0;
  }
};

const PoolProductCard = ({ pool, onViewDetails, onRequestQuote }: PoolProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [extras, setExtras] = useState<PoolExtras>({
    liner: false,
    heater: false,
    cover: false,
    jets: false
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
    Object.entries(extras).forEach(([key, value]) => {
      if (value) {
        total += getExtraPrice(key);
      }
    });
    return total;
  };

  const hasExtras = Object.values(extras).some(value => value);

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Edge-to-edge Pool Image at top */}
      <div 
        className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image"
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
        
        {/* GALA Points Badge */}
        {pool.galaPoints && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-amber-500/90 text-white flex items-center gap-1 px-2 py-1">
              <Star className="h-3 w-3" />
              {pool.galaPoints.toLocaleString()}
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            Click for Details
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        
        {/* Pool Name */}
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {pool.model}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-teal" />
          <span className="text-2xl font-bold text-foreground">
            {calculateTotalPrice().toLocaleString()}
          </span>
          {hasExtras && (
            <span className="text-sm text-muted-foreground line-through">
              ${pool.price.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* GALA Category & Points */}
        {pool.galaCategory && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600">{pool.galaCategory}</span>
            </div>
            <span className="text-sm text-amber-600 font-bold">+{pool.galaPoints?.toLocaleString()} GALA</span>
          </div>
        )}
        
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
              <span>Warranty: {pool.warrantyYears} years</span>
            </div>
          )}
        </div>
        
        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in-up">
            <Separator />
            
            {/* 3D Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">3D Preview</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShow3D(!show3D)}
              >
                {show3D ? 'Hide 3D' : 'Show 3D'}
              </Button>
            </div>
            
            {/* 3D Viewer */}
            {show3D && (
              <Enhanced3DPoolViewer poolModel={pool.model} dimensions={pool.dimensions} />
            )}
            
            {/* Add-ons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Add-ons</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.liner}
                    onCheckedChange={() => toggleExtra('liner')}
                  />
                  <div className="flex items-center space-x-1">
                    <Droplets size={16} className="text-primary" />
                    <span className="text-sm">Liner (+${getExtraPrice('liner').toLocaleString()})</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.heater}
                    onCheckedChange={() => toggleExtra('heater')}
                  />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-coral" />
                    <span className="text-sm">Heater (+${getExtraPrice('heater').toLocaleString()})</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.cover}
                    onCheckedChange={() => toggleExtra('cover')}
                  />
                  <div className="flex items-center space-x-1">
                    <Shield size={16} className="text-teal" />
                    <span className="text-sm">Cover (+${getExtraPrice('cover').toLocaleString()})</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.jets}
                    onCheckedChange={() => toggleExtra('jets')}
                  />
                  <div className="flex items-center space-x-1">
                    <Zap size={16} className="text-orange" />
                    <span className="text-sm">Jets (+${getExtraPrice('jets').toLocaleString()})</span>
                  </div>
                </label>
              </div>
            </div>
            
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