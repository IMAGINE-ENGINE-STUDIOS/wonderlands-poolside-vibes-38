import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useShoppingCart } from "./ShoppingCart";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "./OptimizedImage";
import { DollarSign, Clock, Shield, Waves, Star, Award, ShoppingCart, Thermometer, Home, Zap, Palette } from 'lucide-react';

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
  };
}

interface GilmerOptions {
  colorFinish: string;
  pavers: boolean;
  paverOption: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: string;
  poolHeater: boolean;
  heaterModel: string;
  concreteConstruction: boolean;
}

const SimplifiedGilmerPoolCard = ({ pool }: SimplifiedGilmerPoolCardProps) => {
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  
  const [options, setOptions] = useState<GilmerOptions>({
    colorFinish: 'Ocean Blue',
    pavers: false,
    paverOption: 'Catalina Grana Blend',
    screenEnclosure: false,
    screenEnclosureArea: 1000,
    screenEnclosureQuality: 'Premium',
    poolHeater: false,
    heaterModel: 'Hayward H400FDN Natural Gas',
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

  // Paver options
  const paverOptions = [
    { name: 'Catalina Grana Blend', price: 12000 },
    { name: 'Appian Cobble', price: 14000 },
    { name: 'Catalina Classic', price: 11000 },
    { name: 'Travertine Look', price: 15000 }
  ];

  // Screen enclosure options
  const screenEnclosureQualities = [
    { name: 'Standard', price: 15000 },
    { name: 'Premium', price: 22000 },
    { name: 'Ultra Premium', price: 35000 }
  ];

  // Pool heater options
  const heaterOptions = [
    { name: 'Hayward H400FDN Natural Gas', price: 4500 },
    { name: 'Pentair MasterTemp 400', price: 4200 },
    { name: 'Raypak 406A Natural Gas', price: 3800 },
    { name: 'Heat/Cool Pump 127K BTU', price: 8000 }
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
      const paverPrice = paverOptions.find(p => p.name === options.paverOption)?.price || 0;
      total += paverPrice;
    }
    
    if (options.screenEnclosure) {
      const enclosurePrice = screenEnclosureQualities.find(q => q.name === options.screenEnclosureQuality)?.price || 0;
      const areaMultiplier = options.screenEnclosureArea / 1000;
      total += enclosurePrice * areaMultiplier;
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
    if (options.pavers) extrasArray.push({ name: `Pavers: ${options.paverOption}`, price: paverOptions.find(p => p.name === options.paverOption)?.price || 0 });
    if (options.screenEnclosure) extrasArray.push({ name: `Screen Enclosure: ${options.screenEnclosureQuality}`, price: (screenEnclosureQualities.find(q => q.name === options.screenEnclosureQuality)?.price || 0) * (options.screenEnclosureArea / 1000) });
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
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground leading-tight">{pool.model}</h3>
            <p className="text-sm text-muted-foreground font-medium">{pool.dimensions}</p>
          </div>
          <Badge className={`${getCategoryColor('premium')} text-white border-0 px-3 py-1 text-xs font-semibold shadow-md`}>
            {pool.brand}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 px-6 pb-6">
        {/* Pool Image */}
        <div className="relative group">
          <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-teal/5 ring-1 ring-border/50">
            <OptimizedImage
              src={pool.image}
              alt={pool.model}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>

        {/* Pool Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-2">
              <Waves className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Depth: {pool.depth}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-2">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{pool.warranty}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-2">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{getInstallationTime()} weeks installation</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-2">
            <Award className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{pool.type}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Color Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Gelcoat Color (Included)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {colorOptions.map((color) => (
              <label
                key={color.name}
                className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg border transition-all text-xs ${
                  options.colorFinish === color.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.color }}
                />
                <span className="font-medium truncate">{color.name}</span>
                <input
                  type="radio"
                  name="colorFinish"
                  value={color.name}
                  checked={options.colorFinish === color.name}
                  onChange={(e) => updateOption('colorFinish', e.target.value)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Optional Features */}
        <div className="space-y-4">
          <span className="text-sm font-semibold">Optional Features</span>
          
          <div className="space-y-3">
            {/* Pavers */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={options.pavers} 
                  onCheckedChange={() => toggleOption('pavers')} 
                />
                <div className="flex items-center space-x-1">
                  <Home size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">Premium Pavers</span>
                </div>
              </label>
              {options.pavers && (
                <Select value={options.paverOption} onValueChange={(value) => updateOption('paverOption', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paverOptions.map((paver) => (
                      <SelectItem key={paver.name} value={paver.name}>
                        {paver.name} (+${paver.price.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Screen Enclosure */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={options.screenEnclosure} 
                  onCheckedChange={() => toggleOption('screenEnclosure')} 
                />
                <div className="flex items-center space-x-1">
                  <Shield size={16} className="text-green-500" />
                  <span className="text-sm font-medium">Screen Enclosure</span>
                </div>
              </label>
              {options.screenEnclosure && (
                <div className="space-y-2">
                  <Select value={options.screenEnclosureQuality} onValueChange={(value) => updateOption('screenEnclosureQuality', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {screenEnclosureQualities.map((quality) => (
                        <SelectItem key={quality.name} value={quality.name}>
                          {quality.name} (${quality.price.toLocaleString()}/1000 sq ft)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Area (sq ft):</span>
                    <Input
                      type="number"
                      value={options.screenEnclosureArea}
                      onChange={(e) => updateOption('screenEnclosureArea', parseInt(e.target.value) || 1000)}
                      className="w-20 h-6 text-xs"
                      min="500"
                      step="100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pool Heater */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={options.poolHeater} 
                  onCheckedChange={() => toggleOption('poolHeater')} 
                />
                <div className="flex items-center space-x-1">
                  <Thermometer size={16} className="text-red-500" />
                  <span className="text-sm font-medium">Pool Heater</span>
                </div>
              </label>
              {options.poolHeater && (
                <Select value={options.heaterModel} onValueChange={(value) => updateOption('heaterModel', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {heaterOptions.map((heater) => (
                      <SelectItem key={heater.name} value={heater.name}>
                        {heater.name} (+${heater.price.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Concrete Construction */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={options.concreteConstruction} 
                  onCheckedChange={() => toggleOption('concreteConstruction')} 
                />
                <div className="flex items-center space-x-1">
                  <Shield size={16} className="text-gray-600" />
                  <span className="text-sm font-medium">Concrete Construction (+$15,000)</span>
                </div>
              </label>
            </div>
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

          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-primary to-teal hover:from-primary/90 hover:to-teal/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
          >
            <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedGilmerPoolCard;