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
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-teal/5 ring-1 ring-border/50">
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
          <h4 className="font-semibold text-foreground">Additional Features</h4>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Pavers */}
            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox 
                checked={options.pavers} 
                onCheckedChange={() => toggleOption('pavers')} 
                className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
              />
              <div className="flex items-center space-x-1">
                <Home size={16} className="text-coral" />
                <span className="text-sm">Premium Pavers (+${options.pavers ? (paverOptions.find(p => p.name === options.paverOption)?.price || 0).toLocaleString() : '0'})</span>
              </div>
            </label>
            {options.pavers && (
              <div className="ml-6 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Select Paver Option:</label>
                <div className="grid grid-cols-1 gap-2">
                  {paverOptions.map((paver) => (
                    <button
                      key={paver.name}
                      onClick={() => updateOption('paverOption', paver.name)}
                      className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                        options.paverOption === paver.name 
                          ? 'border-coral bg-coral/10 text-coral' 
                          : 'border-border hover:border-coral/50'
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <div>{paver.name}</div>
                        <div className="text-xs text-muted-foreground">${paver.price.toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Screen Enclosure */}
            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox 
                checked={options.screenEnclosure} 
                onCheckedChange={() => toggleOption('screenEnclosure')} 
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="flex items-center space-x-1">
                <Shield size={16} className="text-primary" />
                <span className="text-sm">Screen Enclosure (+${options.screenEnclosure ? ((screenEnclosureQualities.find(q => q.name === options.screenEnclosureQuality)?.price || 0) * (options.screenEnclosureArea / 1000)).toLocaleString() : '0'})</span>
              </div>
            </label>
            {options.screenEnclosure && (
              <div className="ml-6 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Select Quality & Area:</label>
                <div className="grid grid-cols-1 gap-2">
                  {screenEnclosureQualities.map((quality) => (
                    <button
                      key={quality.name}
                      onClick={() => updateOption('screenEnclosureQuality', quality.name)}
                      className={`p-2 text-xs rounded-md border transition-all ${
                        options.screenEnclosureQuality === quality.name 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-left">
                        <div>{quality.name}</div>
                        <div className="text-xs text-muted-foreground">${quality.price.toLocaleString()}/1000 sq ft</div>
                      </div>
                    </button>
                  ))}
                </div>
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