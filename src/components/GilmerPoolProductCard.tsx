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
import { gilmerSpas } from "@/data/gilmerSpas";
import { paverTypes } from "@/data/paverData";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import sunsetGroveImage from "@/assets/sunset-grove-kit-pool.jpg";
import maldivesImage from "@/assets/maldiveskit-castlerock.jpg";
import serenityImage from "@/assets/serenitykit.jpg";
import grassLightGreenImage from "@/assets/grass-light-green.avif";
import grassDarkGreenImage from "@/assets/grass-dark-green.avif";

// Helper function to get pool price (no discount applied)
const getPoolPrice = (pool: { price: number }) => {
  return pool.price;
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
  paverSurfaceArea: string;
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
  rockyWaterfalls: boolean;
  rockyWaterfallsType: string;
  rockyWaterfallsColor: string;
  artificialGrass: boolean;
  artificialGrassColor: string;
  artificialGrassArea: string;
}

const GilmerPoolProductCard = ({ pool }: GilmerPoolCardProps) => {
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  const { priceMultiplier, projectType } = useProjectType();
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  
  const [extras, setExtras] = useState<GilmerExtras>({
    colorFinish: '',
    pavers: false,
    paverOption: '',
    paverSurfaceArea: '',
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
    tanningLedgeOption: '',
    rockyWaterfalls: false,
    rockyWaterfallsType: 'Sunset Grove',
    rockyWaterfallsColor: 'Castle Rock',
    artificialGrass: false,
    artificialGrassColor: 'Light Green',
    artificialGrassArea: '',
  });

  const ARTIFICIAL_GRASS_PRICE_PER_SQFT = 15;
  const artificialGrassOptions = [
    { name: 'Light Green', image: grassLightGreenImage },
    { name: 'Dark Green', image: grassDarkGreenImage },
  ];

  // Rocky Waterfalls types with their prices and color options
  const rockyWaterfallsTypes = [
    { 
      name: 'Sunset Grove', 
      price: 17500, 
      image: sunsetGroveImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
    { 
      name: 'Maldives', 
      price: 5600, 
      image: maldivesImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
    { 
      name: 'Serenity', 
      price: 9500, 
      image: serenityImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
  ];

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

  // Paver options from paverData with dynamic per-sq-ft pricing
  const paverOptions = paverTypes
    .filter(paver => paver.category === 'paver')
    .map(paver => ({
      name: paver.name,
      pricePerSqFt: paver.basePrice,
      image: paver.image,
      description: paver.description
    }));

  // Screen enclosure options
  const screenEnclosureQualities = [
    { name: 'Standard', price: 15000 },
    { name: 'Premium', price: 22000 },
    { name: 'Ultra Premium', price: 35000 }
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

  // Pool cover options
  const coverOptions = [
    { name: 'Eclipse', price: 27000 },
    { name: 'CS3000 Safety Cover', price: 30000 },
    { name: 'Infinity 4000 Smart Cover', price: 32000 },
    { name: 'Atom Loop-Loc Cover', price: 25000 }
  ];

  // Use real Gilmer Glass Spa data
  const gilmerSpaOptions = gilmerSpas.map(spa => ({
    name: spa.model,
    price: spa.price,
    image: spa.image
  }));

  // Gilmer Glass Tanning Ledge options (different from Latham)
  const gilmerTanningLedgeOptions = [
    { name: 'Paradise', price: 15750 },
    { name: 'Leeward', price: 12352 }
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
    
    if (extras.pavers && extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea))) {
      const selectedPaver = paverOptions.find(p => p.name === extras.paverOption);
      const pricePerSqFt = selectedPaver?.pricePerSqFt || 20;
      total += parseFloat(extras.paverSurfaceArea) * pricePerSqFt;
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
    
    if (extras.rockyWaterfalls) {
      const waterfallType = rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType);
      total += waterfallType?.price || 17500;
    }

    if (extras.artificialGrass && extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea))) {
      total += parseFloat(extras.artificialGrassArea) * ARTIFICIAL_GRASS_PRICE_PER_SQFT;
    }
    
    // Apply project type multiplier (3x for commercial)
    return total * priceMultiplier;
  };

  const getTotalPoolPrice = () => {
    return (pool.price + calculateExtrasTotal() / priceMultiplier) * priceMultiplier;
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
    if (extras.pavers && extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea))) {
      const selectedPaver = paverOptions.find(p => p.name === extras.paverOption);
      const pricePerSqFt = selectedPaver?.pricePerSqFt || 20;
      extrasArray.push({ name: `Pavers: ${extras.paverOption} (${extras.paverSurfaceArea} sq ft)`, price: parseFloat(extras.paverSurfaceArea) * pricePerSqFt });
    }
    if (extras.screenEnclosure) extrasArray.push({ name: `Screen Enclosure: ${extras.screenEnclosureQuality}`, price: (screenEnclosureQualities.find(q => q.name === extras.screenEnclosureQuality)?.price || 0) * (extras.screenEnclosureArea / 1000) });
    if (extras.poolHeater) extrasArray.push({ name: `Heater: ${extras.heaterModel}`, price: heaterOptions.find(h => h.name === extras.heaterModel)?.price || 0 });
    if (extras.spaJets) extrasArray.push({ name: `Spa Jets (${extras.jetQuantity})`, price: extras.jetQuantity * 300 });
    if (extras.poolCover) extrasArray.push({ name: `Cover: ${extras.coverOption}`, price: coverOptions.find(c => c.name === extras.coverOption)?.price || 0 });
    if (extras.concreteConstruction) extrasArray.push({ name: 'Concrete Construction', price: 15000 });
    if (extras.addSpa) extrasArray.push({ name: `Spa: ${extras.spaOption}`, price: gilmerSpaOptions.find(s => s.name === extras.spaOption)?.price || 0 });
    if (extras.addTanningLedge) extrasArray.push({ name: `Tanning Ledge: ${extras.tanningLedgeOption}`, price: gilmerTanningLedgeOptions.find(l => l.name === extras.tanningLedgeOption)?.price || 0 });
    if (extras.rockyWaterfalls) {
      const waterfallType = rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType);
      extrasArray.push({ name: `Rocky Waterfalls - ${extras.rockyWaterfallsType}: ${extras.rockyWaterfallsColor}`, price: waterfallType?.price || 17500 });
    }
    if (extras.artificialGrass && extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea))) {
      const grassArea = parseFloat(extras.artificialGrassArea);
      extrasArray.push({ name: `Artificial Grass - ${extras.artificialGrassColor} (${grassArea} sq ft)`, price: grassArea * ARTIFICIAL_GRASS_PRICE_PER_SQFT });
    }
    
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
              ${getTotalPoolPrice().toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {calculateExtrasTotal() > 0 && (
                <span>+ ${calculateExtrasTotal().toLocaleString()} extras</span>
              )}
            </div>
            {projectType === 'commercial' && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 mt-1">Commercial Rate</Badge>
            )}
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
                <div className="space-y-2">
                  <Select value={extras.paverOption} onValueChange={(value) => updateExtra('paverOption', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select paver type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paverOptions.map((paver) => (
                        <SelectItem key={paver.name} value={paver.name}>
                          {paver.name} (${paver.pricePerSqFt}/sq ft)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Surface Area (sq ft):</Label>
                    <Input
                      type="number"
                      value={extras.paverSurfaceArea}
                      onChange={(e) => updateExtra('paverSurfaceArea', e.target.value)}
                      className="w-24 h-8"
                      placeholder="Enter sq ft"
                    />
                  </div>
                  {extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea)) && (
                    <div className="text-xs text-green-600 font-medium">
                      Total: ${(parseFloat(extras.paverSurfaceArea) * (paverOptions.find(p => p.name === extras.paverOption)?.pricePerSqFt || 20)).toLocaleString()}
                    </div>
                  )}
                </div>
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

            {/* Concrete Construction - Hide for concrete pools (already concrete) */}
            {pool.model !== "Winderview" && pool.model !== "Cape Coral" && (
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

            {/* Rocky Waterfalls */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={extras.rockyWaterfalls} 
                  onCheckedChange={() => toggleExtra('rockyWaterfalls')} 
                />
                <div className="flex items-center space-x-1">
                  <Waves size={16} className="text-stone-600" />
                  <span className="font-medium">Rocky Waterfalls (+${extras.rockyWaterfalls ? (rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType)?.price || 17500).toLocaleString() : '0'})</span>
                </div>
              </label>
              {extras.rockyWaterfalls && (
                <div className="space-y-3 ml-6">
                  <Select value={extras.rockyWaterfallsType} onValueChange={(value) => {
                    updateExtra('rockyWaterfallsType', value);
                    const type = rockyWaterfallsTypes.find(t => t.name === value);
                    if (type) updateExtra('rockyWaterfallsColor', type.colors[0]);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select waterfall type" />
                    </SelectTrigger>
                    <SelectContent>
                      {rockyWaterfallsTypes.map((waterfall) => (
                        <SelectItem key={waterfall.name} value={waterfall.name}>
                          {waterfall.name} (+${waterfall.price.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    {(rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType)?.colors || ['Castle Rock', 'Gray', 'Brown']).map((color) => (
                      <button
                        key={color}
                        onClick={() => updateExtra('rockyWaterfallsColor', color)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          extras.rockyWaterfallsColor === color 
                            ? 'border-stone-600 bg-stone-600/10' 
                            : 'border-border hover:border-stone-600/50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                    <SelectValue placeholder="Select a Gilmer Spa..." />
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
                    <SelectValue placeholder="Select a tanning ledge..." />
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

            {/* Artificial Grass */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={extras.artificialGrass}
                  onCheckedChange={() => toggleExtra('artificialGrass')}
                />
                <div className="flex items-center space-x-1">
                  <Home size={16} className="text-green-600" />
                  <span className="font-medium">Artificial Grass</span>
                </div>
              </label>
              {extras.artificialGrass && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {artificialGrassOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => updateExtra('artificialGrassColor', opt.name)}
                        className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md flex flex-col items-center ${
                          extras.artificialGrassColor === opt.name
                            ? 'border-green-600 bg-green-600/10'
                            : 'border-border'
                        }`}
                      >
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden">
                          <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <span className="text-xs font-medium">{opt.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Surface Area (sq ft):</Label>
                    <Input
                      type="number"
                      value={extras.artificialGrassArea}
                      onChange={(e) => updateExtra('artificialGrassArea', e.target.value)}
                      className="w-24 h-8"
                      placeholder="sq ft"
                    />
                    <span className="text-xs text-muted-foreground">${ARTIFICIAL_GRASS_PRICE_PER_SQFT}/sq ft</span>
                  </div>
                  {extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea)) && parseFloat(extras.artificialGrassArea) > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      Total: ${(parseFloat(extras.artificialGrassArea) * ARTIFICIAL_GRASS_PRICE_PER_SQFT).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Add to Cart Button */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowQuoteTool(true)} 
            className="flex-1 instant-quote-btn transition-all duration-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Instant Quote
          </Button>
          
          <Button 
            onClick={handleAddToCart}
            variant="outline"
            size="icon"
            className="w-10 h-10"
          >
            <ShoppingCart className="h-5 w-5" />
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
        extras={{
          extrasBreakdown: (() => {
            const breakdown: Array<{name: string; price: number; image?: string}> = [];
            
            if (extras.pavers && extras.paverOption && extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea))) {
              const paver = paverOptions.find(p => p.name === extras.paverOption);
              const pricePerSqFt = paver?.pricePerSqFt || 20;
              breakdown.push({ 
                name: `Pavers: ${extras.paverOption} (${extras.paverSurfaceArea} sq ft)`, 
                price: parseFloat(extras.paverSurfaceArea) * pricePerSqFt,
                image: paver?.image
              });
            }
            
            if (extras.screenEnclosure && extras.screenEnclosureQuality) {
              const enclosure = screenEnclosureQualities.find(q => q.name === extras.screenEnclosureQuality);
              if (enclosure) {
                const areaMultiplier = extras.screenEnclosureArea / 1000;
                breakdown.push({ name: `Screen Enclosure: ${extras.screenEnclosureQuality} (${extras.screenEnclosureArea} sq ft)`, price: enclosure.price * areaMultiplier });
              }
            }
            
            if (extras.poolHeater && extras.heaterModel) {
              const heater = heaterOptions.find(h => h.name === extras.heaterModel);
              if (heater) breakdown.push({ name: `Heater: ${extras.heaterModel}`, price: heater.price });
            }
            
            if (extras.spaJets && extras.jetQuantity > 0) {
              breakdown.push({ name: `Pool Jets (${extras.jetQuantity})`, price: extras.jetQuantity * 300 });
            }
            
            if (extras.poolCover && extras.coverOption) {
              const cover = coverOptions.find(c => c.name === extras.coverOption);
              if (cover) breakdown.push({ name: `Pool Cover: ${extras.coverOption}`, price: cover.price });
            }
            
            if (extras.concreteConstruction) {
              breakdown.push({ name: 'Concrete Construction Upgrade', price: 15000 });
            }
            
            if (extras.addSpa && extras.spaOption) {
              const spa = gilmerSpaOptions.find(s => s.name === extras.spaOption);
              if (spa) breakdown.push({ name: `Gilmer Spa: ${extras.spaOption}`, price: spa.price, image: spa.image });
            }
            
            if (extras.addTanningLedge && extras.tanningLedgeOption) {
              const ledge = gilmerTanningLedgeOptions.find(l => l.name === extras.tanningLedgeOption);
              if (ledge) breakdown.push({ name: `Tanning Ledge: ${extras.tanningLedgeOption}`, price: ledge.price });
            }
            
            if (extras.rockyWaterfalls) {
              const waterfallType = rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType);
              breakdown.push({ 
                name: `Rocky Waterfalls - ${extras.rockyWaterfallsType}: ${extras.rockyWaterfallsColor}`, 
                price: waterfallType?.price || 17500,
                image: waterfallType?.image
              });
            }

            if (extras.artificialGrass && extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea))) {
              const grassArea = parseFloat(extras.artificialGrassArea);
              const grassImg = artificialGrassOptions.find(o => o.name === extras.artificialGrassColor)?.image;
              breakdown.push({
                name: `Artificial Grass - ${extras.artificialGrassColor} (${grassArea} sq ft)`,
                price: grassArea * ARTIFICIAL_GRASS_PRICE_PER_SQFT,
                image: grassImg,
              });
            }
            
            return breakdown;
          })(),
          extrasTotal: calculateExtrasTotal()
        }}
      />
    </Card>
  );
};

export default GilmerPoolProductCard;