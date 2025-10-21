import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Clock, Award } from "lucide-react";
import { GilmerSpa } from "@/data/gilmerSpas";

interface GilmerSpaCardProps {
  spa: GilmerSpa;
  onRequestQuote?: (spa: GilmerSpa, extras: any) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'deluxe':
      return 'bg-gradient-to-r from-primary to-teal';
    case 'standard':
      return 'bg-gradient-to-r from-secondary to-accent';
    case 'spillover':
      return 'bg-gradient-to-r from-coral to-orange';
    default:
      return 'bg-gradient-to-r from-primary to-teal';
  }
};

const GilmerSpaCard = ({ spa, onRequestQuote }: GilmerSpaCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedColor, setSelectedColor] = useState(spa.colorOptions[0]);
  const [extras, setExtras] = useState({
    heater: false,
    jets: false,
    color: spa.colorOptions[0]
  });

  const colorSwatches: Record<string, string> = {
    "Azure Blue": "bg-blue-500",
    "Caribbean Teal": "bg-teal-500",
    "Pearl White": "bg-gray-100 border-2 border-gray-300",
    "Graphite Gray": "bg-gray-700"
  };

  const toggleExtra = (extra: string) => {
    setExtras(prev => ({
      ...prev,
      [extra]: !prev[extra as keyof typeof prev]
    }));
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setExtras(prev => ({
      ...prev,
      color
    }));
  };

  const handleImageClick = () => {
    setShowDetails(!showDetails);
  };

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote(spa, {
        ...extras,
        selectedColor
      });
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Spa Image */}
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image" 
        onClick={handleImageClick}
      >
        <img 
          src={spa.image} 
          alt={spa.model} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" 
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(spa.category)} text-white capitalize font-medium px-3 py-1`}>
            <span className="flex items-center gap-1">
              <Waves size={16} />
              {spa.spillover ? 'Spillover' : spa.category}
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
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {spa.model}
          </h3>
          <p className="text-xs text-muted-foreground">{spa.brand} • {spa.type}</p>
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
          {spa.price > 0 ? (
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              ${spa.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-lg sm:text-xl font-semibold text-muted-foreground">
              Contact for Pricing
            </span>
          )}
        </div>
        
        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {spa.dimensions && spa.dimensions !== "TBD" && <p>Size: {spa.dimensions}</p>}
          {spa.depth && spa.depth !== "TBD" && <p>Depth: {spa.depth}</p>}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Installation: {spa.installationTimeWeeks} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span className="font-bold text-primary">{spa.warranty}</span>
          </div>
        </div>

        {/* Key Features */}
        {spa.features && spa.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Features:</h4>
            <ul className="space-y-1">
              {spa.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="text-xs">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Feature Checkboxes */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox 
              checked={extras.jets} 
              onCheckedChange={() => toggleExtra('jets')} 
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
            />
            <span className="flex items-center gap-1">
              <Zap size={14} className="text-primary" />
              Jets
            </span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox 
              checked={extras.heater} 
              onCheckedChange={() => toggleExtra('heater')} 
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
            />
            <span className="flex items-center gap-1">
              <Thermometer size={14} className="text-teal" />
              Heater
            </span>
          </label>
        </div>
        
        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in-up">
            <Separator />
            
            {/* Color Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Droplets size={16} />
                Spa Color Options
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {spa.colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded-full ${colorSwatches[color]}`}
                      />
                      <span className="text-xs font-medium">{color}</span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-primary font-medium">
                  Selected: {selectedColor}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-teal hover:shadow-lg transition-all"
            onClick={handleRequestQuote}
          >
            Request Quote
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleImageClick}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GilmerSpaCard;
