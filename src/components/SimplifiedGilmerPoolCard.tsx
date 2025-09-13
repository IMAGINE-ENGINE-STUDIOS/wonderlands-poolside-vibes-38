import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Droplets, 
  Thermometer, 
  Shield, 
  Waves, 
  Palette, 
  Home,
  Zap,
  ShoppingCart,
  Clock,
  Award
} from "lucide-react";
import { useShoppingCart } from "@/components/ShoppingCart";
import { useToast } from "@/hooks/use-toast";

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
  spaJets: boolean;
  jetQuantity: number;
  poolCover: boolean;
  coverOption: string;
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
    spaJets: false,
    jetQuantity: 6,
    poolCover: false,
    coverOption: 'ProMesh 2000',
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

  // Pool cover options
  const coverOptions = [
    { name: 'ProMesh 2000', price: 16000 },
    { name: 'CS3000 Safety Cover', price: 24000 },
    { name: 'Infinity 4000 Smart Cover', price: 32000 },
    { name: 'Atom Loop-Loc Cover', price: 19000 }
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
    
    if (options.spaJets) {
      total += options.jetQuantity * 300;
    }
    
    if (options.poolCover) {
      const coverPrice = coverOptions.find(c => c.name === options.coverOption)?.price || 0;
      total += coverPrice;
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

  const handleAddToCart = () => {
    const extrasTotal = calculateTotal();
    const totalPrice = pool.price + extrasTotal;
    
    const extrasArray = [];
    extrasArray.push({ name: `Color: ${options.colorFinish}`, price: 0 });
    if (options.pavers) extrasArray.push({ name: `Pavers: ${options.paverOption}`, price: paverOptions.find(p => p.name === options.paverOption)?.price || 0 });
    if (options.screenEnclosure) extrasArray.push({ name: `Screen Enclosure: ${options.screenEnclosureQuality}`, price: (screenEnclosureQualities.find(q => q.name === options.screenEnclosureQuality)?.price || 0) * (options.screenEnclosureArea / 1000) });
    if (options.poolHeater) extrasArray.push({ name: `Heater: ${options.heaterModel}`, price: heaterOptions.find(h => h.name === options.heaterModel)?.price || 0 });
    if (options.spaJets) extrasArray.push({ name: `Spa Jets (${options.jetQuantity})`, price: options.jetQuantity * 300 });
    if (options.poolCover) extrasArray.push({ name: `Cover: ${options.coverOption}`, price: coverOptions.find(c => c.name === options.coverOption)?.price || 0 });
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Waves className="h-6 w-6 text-primary" />
              {pool.brand} {pool.model}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {pool.dimensions}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                Depth: {pool.depth}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {pool.warranty}
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                {pool.type}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Installation: {getInstallationTime()}+ weeks
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              ${(pool.price + calculateTotal()).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Base: ${pool.price.toLocaleString()}
              {calculateTotal() > 0 && (
                <span> + ${calculateTotal().toLocaleString()} extras</span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pool Image */}
        <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
          <img 
            src={pool.image} 
            alt={`${pool.brand} ${pool.model}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Gelcoat Color (Included)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {colorOptions.map((color) => (
              <label
                key={color.name}
                className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border transition-all ${
                  options.colorFinish === color.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color.color }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">{color.name}</span>
                </div>
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
          <Label className="text-base font-semibold">Optional Features</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pavers */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={options.pavers} 
                  onCheckedChange={() => toggleOption('pavers')} 
                />
                <div className="flex items-center space-x-1">
                  <Home size={16} className="text-orange-500" />
                  <span className="font-medium">Premium Pavers</span>
                </div>
              </label>
              {options.pavers && (
                <Select value={options.paverOption} onValueChange={(value) => updateOption('paverOption', value)}>
                  <SelectTrigger className="mt-1">
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
                  <span className="font-medium">Screen Enclosure</span>
                </div>
              </label>
              {options.screenEnclosure && (
                <div className="space-y-2">
                  <Select value={options.screenEnclosureQuality} onValueChange={(value) => updateOption('screenEnclosureQuality', value)}>
                    <SelectTrigger>
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
                    <Label className="text-xs">Area (sq ft):</Label>
                    <Input
                      type="number"
                      value={options.screenEnclosureArea}
                      onChange={(e) => updateOption('screenEnclosureArea', parseInt(e.target.value) || 1000)}
                      className="w-20 h-8"
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
                  <span className="font-medium">Pool Heater</span>
                </div>
              </label>
              {options.poolHeater && (
                <Select value={options.heaterModel} onValueChange={(value) => updateOption('heaterModel', value)}>
                  <SelectTrigger>
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

            {/* Spa Jets */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={options.spaJets} 
                  onCheckedChange={() => toggleOption('spaJets')} 
                />
                <div className="flex items-center space-x-1">
                  <Zap size={16} className="text-blue-500" />
                  <span className="font-medium">Spa Jets</span>
                </div>
              </label>
              {options.spaJets && (
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Quantity:</Label>
                  <Input
                    type="number"
                    value={options.jetQuantity}
                    onChange={(e) => updateOption('jetQuantity', parseInt(e.target.value) || 6)}
                    className="w-16 h-8"
                    min="4"
                    max="12"
                  />
                  <span className="text-xs text-muted-foreground">($300 each)</span>
                </div>
              )}
            </div>

            {/* Pool Cover */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={options.poolCover} 
                  onCheckedChange={() => toggleOption('poolCover')} 
                />
                <div className="flex items-center space-x-1">
                  <Shield size={16} className="text-gray-500" />
                  <span className="font-medium">Pool Cover</span>
                </div>
              </label>
              {options.poolCover && (
                <Select value={options.coverOption} onValueChange={(value) => updateOption('coverOption', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coverOptions.map((cover) => (
                      <SelectItem key={cover.name} value={cover.name}>
                        {cover.name} (+${cover.price.toLocaleString()})
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
                  <Home size={16} className="text-gray-600" />
                  <span className="font-medium">Concrete Construction (+$15,000) - {pool.concreteInstallationWeeks || 18}+ weeks</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Add to Cart Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleAddToCart}
            size="lg"
            className="w-full md:w-auto flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart - ${(pool.price + calculateTotal()).toLocaleString()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedGilmerPoolCard;