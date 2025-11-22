import * as React from "react";
const { useState } = React;
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
  Sun, 
  Home,
  Zap,
  ShoppingCart,
  Clock,
  Award,
  FileText
} from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import { useToast } from "@/hooks/use-toast";

// Helper function to get pool price with 10% discount applied
const getPoolPrice = (pool: { price: number }) => {
  return Math.round(pool.price * 0.90); // 10% discount for all pools
};

interface GilmerPoolCardProps {
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

interface GilmerExtras {
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
  addSpa: boolean;
  spaOption: string;
  addTanningLedge: boolean;
  tanningLedgeOption: string;
}

const GilmerPoolProductCard = ({ pool }: GilmerPoolCardProps) => {
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  
  const [extras, setExtras] = useState<GilmerExtras>({
    colorFinish: '',
    pavers: false,
    paverOption: '',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: '',
    poolHeater: false,
    heaterModel: '',
    spaJets: false,
    jetQuantity: 0,
    poolCover: false,
    coverOption: '',
    concreteConstruction: false,
    addSpa: false,
    spaOption: '',
    addTanningLedge: false,
    tanningLedgeOption: ''
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

  // Paver options (same as other pool cards)
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
    { name: 'Pentair MasterTemp 125 (125K BTU)', price: 2000 },
    { name: 'Pentair MasterTemp 250 (250K BTU)', price: 3200 },
    { name: 'Pentair MasterTemp 400 (400K BTU)', price: 4200 },
    { name: 'Pentair UltraTemp 90 Heat Pump', price: 4500 },
    { name: 'Pentair UltraTemp 110 Heat Pump', price: 5500 },
    { name: 'Pentair UltraTemp 140 Heat Pump', price: 6500 }
  ];

  // Pool cover options
  const coverOptions = [
    { name: 'ProMesh 2000', price: 16000 },
    { name: 'CS3000 Safety Cover', price: 24000 },
    { name: 'Infinity 4000 Smart Cover', price: 32000 },
    { name: 'Atom Loop-Loc Cover', price: 19000 }
  ];

  // Gilmer Glass Spa options (different from Latham)
  const gilmerSpaOptions = [
    { name: 'Harmony Linear', price: 25000 },
    { name: 'Harmony', price: 22000 },
    { name: 'Leisure', price: 20000 },
    { name: 'Leisure Spill Over', price: 28000 }
  ];

  // Gilmer Glass Tanning Ledge options (different from Latham)
  const gilmerTanningLedgeOptions = [
    { name: 'Leisure', price: 18000 },
    { name: 'Leeward', price: 20000 }
  ];

  const toggleExtra = (extra: keyof GilmerExtras) => {
    setExtras(prev => ({
      ...prev,
      [extra]: !prev[extra]
    }));
  };

  const updateExtra = (extra: keyof GilmerExtras, value: any) => {
    setExtras(prev => ({
      ...prev,
      [extra]: value
    }));
  };

  const calculateExtrasTotal = () => {
    let total = 0;
    
    if (extras.pavers) {
      const paverPrice = paverOptions.find(p => p.name === extras.paverOption)?.price || 0;
      total += paverPrice;
    }
    
    if (extras.screenEnclosure) {
      const enclosurePrice = screenEnclosureQualities.find(q => q.name === extras.screenEnclosureQuality)?.price || 0;
      const areaMultiplier = extras.screenEnclosureArea / 1000;
      total += enclosurePrice * areaMultiplier;
    }
    
    if (extras.poolHeater) {
      const heaterPrice = heaterOptions.find(h => h.name === extras.heaterModel)?.price || 0;
      total += heaterPrice;
    }
    
    if (extras.spaJets) {
      total += extras.jetQuantity * 300; // $300 per jet
    }
    
    if (extras.poolCover) {
      const coverPrice = coverOptions.find(c => c.name === extras.coverOption)?.price || 0;
      total += coverPrice;
    }
    
    if (extras.concreteConstruction) {
      total += 15000; // Concrete upgrade
    }
    
    if (extras.addSpa) {
      const spaPrice = gilmerSpaOptions.find(s => s.name === extras.spaOption)?.price || 0;
      total += spaPrice;
    }
    
    if (extras.addTanningLedge) {
      const ledgePrice = gilmerTanningLedgeOptions.find(l => l.name === extras.tanningLedgeOption)?.price || 0;
      total += ledgePrice;
    }
    
    return total;
  };

  const getInstallationTime = () => {
    if (extras.concreteConstruction) {
      return pool.concreteInstallationWeeks || 18;
    }
    return pool.installationTimeWeeks || 8;
  };

  const handleAddToCart = () => {
    const extrasTotal = calculateExtrasTotal();
    const totalPrice = pool.price + extrasTotal;
    
    // Convert extras to array format for cart compatibility
    const extrasArray = [];
    extrasArray.push({ name: `Color: ${extras.colorFinish}`, price: 0 });
    if (extras.pavers) extrasArray.push({ name: `Pavers: ${extras.paverOption}`, price: paverOptions.find(p => p.name === extras.paverOption)?.price || 0 });
    if (extras.screenEnclosure) extrasArray.push({ name: `Screen Enclosure: ${extras.screenEnclosureQuality}`, price: (screenEnclosureQualities.find(q => q.name === extras.screenEnclosureQuality)?.price || 0) * (extras.screenEnclosureArea / 1000) });
    if (extras.poolHeater) extrasArray.push({ name: `Heater: ${extras.heaterModel}`, price: heaterOptions.find(h => h.name === extras.heaterModel)?.price || 0 });
    if (extras.spaJets) extrasArray.push({ name: `Spa Jets (${extras.jetQuantity})`, price: extras.jetQuantity * 300 });
    if (extras.poolCover) extrasArray.push({ name: `Cover: ${extras.coverOption}`, price: coverOptions.find(c => c.name === extras.coverOption)?.price || 0 });
    if (extras.concreteConstruction) extrasArray.push({ name: 'Concrete Construction', price: 15000 });
    if (extras.addSpa) extrasArray.push({ name: `Spa: ${extras.spaOption}`, price: gilmerSpaOptions.find(s => s.name === extras.spaOption)?.price || 0 });
    if (extras.addTanningLedge) extrasArray.push({ name: `Tanning Ledge: ${extras.tanningLedgeOption}`, price: gilmerTanningLedgeOptions.find(l => l.name === extras.tanningLedgeOption)?.price || 0 });
    
    const productData = {
      id: `gilmer-${pool.model.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${pool.brand} ${pool.model}`,
      price: totalPrice,
      image: pool.image,
      category: 'Gilmer Glass Pool',
      extras: extrasArray,
      installationTimeWeeks: getInstallationTime(),
      constructionType: extras.concreteConstruction ? 'Concrete' : 'Fiber'
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
                Installation: {getInstallationTime()} weeks
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              ${(getPoolPrice(pool) + calculateExtrasTotal()).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="line-through">${pool.price.toLocaleString()}</span> 
              <span className="text-green-600 font-medium ml-2">
                ${getPoolPrice(pool).toLocaleString()} (10% OFF)
              </span>
              {calculateExtrasTotal() > 0 && (
                <span> + ${calculateExtrasTotal().toLocaleString()} extras</span>
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
                  extras.colorFinish === color.name
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
                  checked={extras.colorFinish === color.name}
                  onChange={(e) => updateExtra('colorFinish', e.target.value)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Pool Features & Add-ons */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Optional Features & Add-ons</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pavers */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={extras.pavers} 
                  onCheckedChange={() => toggleExtra('pavers')} 
                />
                <div className="flex items-center space-x-1">
                  <Home size={16} className="text-orange-500" />
                  <span className="font-medium">Premium Pavers</span>
                </div>
              </label>
              {extras.pavers && (
                <Select value={extras.paverOption} onValueChange={(value) => updateExtra('paverOption', value)}>
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
                  checked={extras.screenEnclosure} 
                  onCheckedChange={() => toggleExtra('screenEnclosure')} 
                />
                <div className="flex items-center space-x-1">
                  <Shield size={16} className="text-green-500" />
                  <span className="font-medium">Screen Enclosure</span>
                </div>
              </label>
              {extras.screenEnclosure && (
                <div className="space-y-2">
                  <Select value={extras.screenEnclosureQuality} onValueChange={(value) => updateExtra('screenEnclosureQuality', value)}>
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
                      value={extras.screenEnclosureArea}
                      onChange={(e) => updateExtra('screenEnclosureArea', parseInt(e.target.value) || 1000)}
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
                  checked={extras.poolHeater} 
                  onCheckedChange={() => toggleExtra('poolHeater')} 
                />
                <div className="flex items-center space-x-1">
                  <Thermometer size={16} className="text-red-500" />
                  <span className="font-medium">Pool Heater</span>
                </div>
              </label>
              {extras.poolHeater && (
                <Select value={extras.heaterModel} onValueChange={(value) => updateExtra('heaterModel', value)}>
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
                  checked={extras.spaJets} 
                  onCheckedChange={() => toggleExtra('spaJets')} 
                />
                <div className="flex items-center space-x-1">
                  <Zap size={16} className="text-blue-500" />
                  <span className="font-medium">Spa Jets</span>
                </div>
              </label>
              {extras.spaJets && (
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Quantity:</Label>
                  <Input
                    type="number"
                    value={extras.jetQuantity}
                    onChange={(e) => updateExtra('jetQuantity', parseInt(e.target.value) || 6)}
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
                  checked={extras.poolCover} 
                  onCheckedChange={() => toggleExtra('poolCover')} 
                />
                <div className="flex items-center space-x-1">
                  <Shield size={16} className="text-gray-500" />
                  <span className="font-medium">Pool Cover</span>
                </div>
              </label>
              {extras.poolCover && (
                <Select value={extras.coverOption} onValueChange={(value) => updateExtra('coverOption', value)}>
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

            {/* Concrete Construction - Hide for Winderview (already concrete) */}
            {pool.model !== "Winderview" && (
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox 
                    checked={extras.concreteConstruction} 
                    onCheckedChange={() => toggleExtra('concreteConstruction')} 
                  />
                  <div className="flex items-center space-x-1">
                    <Home size={16} className="text-gray-600" />
                    <span className="font-medium">Concrete Construction (+$15,000) - {pool.concreteInstallationWeeks || 18} weeks</span>
                  </div>
                </label>
              </div>
            )}

            {/* Add Spa */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={extras.addSpa} 
                  onCheckedChange={() => toggleExtra('addSpa')} 
                />
                <div className="flex items-center space-x-1">
                  <Droplets size={16} className="text-blue-600" />
                  <span className="font-medium">Add Spa</span>
                </div>
              </label>
              {extras.addSpa && (
                <Select value={extras.spaOption} onValueChange={(value) => updateExtra('spaOption', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gilmerSpaOptions.map((spa) => (
                      <SelectItem key={spa.name} value={spa.name}>
                        {spa.name} (+${spa.price.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Add Tanning Ledge */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={extras.addTanningLedge} 
                  onCheckedChange={() => toggleExtra('addTanningLedge')} 
                />
                <div className="flex items-center space-x-1">
                  <Sun size={16} className="text-yellow-500" />
                  <span className="font-medium">Add Tanning Ledge</span>
                </div>
              </label>
              {extras.addTanningLedge && (
                <Select value={extras.tanningLedgeOption} onValueChange={(value) => updateExtra('tanningLedgeOption', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gilmerTanningLedgeOptions.map((ledge) => (
                      <SelectItem key={ledge.name} value={ledge.name}>
                        {ledge.name} (+${ledge.price.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Add to Cart Button */}
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleAddToCart}
            size="lg"
            className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart - ${(pool.price + calculateExtrasTotal()).toLocaleString()}
          </Button>
          
          <Button 
            onClick={() => setShowQuoteTool(true)} 
            variant="secondary" 
            size="lg"
            className="w-full gap-2"
          >
            <FileText className="h-4 w-4" />
            Create Instant Quote
          </Button>
        </div>
      </CardContent>
      
      <SurveyQuoteTool
        pool={{
          model: pool.model,
          price: pool.price,
          category: 'premium',
          dimensions: pool.dimensions,
          depth: pool.depth,
          image: pool.image
        }}
        isOpen={showQuoteTool}
        onClose={() => setShowQuoteTool(false)}
      />
    </Card>
  );
};

export default GilmerPoolProductCard;