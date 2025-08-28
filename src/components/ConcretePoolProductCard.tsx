import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Waves, Calculator, ShoppingCart, Thermometer, Grid3X3, Zap, Droplets, Sun } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { spas, pools } from "./PoolCatalog";
import { tanningLedges, poolLiners } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import StripeCheckoutButton from "./StripeCheckoutButton";

interface ConcretePoolExtras {
  heater: boolean;
  heaterModel: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: 'standard' | 'deluxe' | 'premium';
  jets: boolean;
  jetQuantity: number;
  liner: boolean;
  linerOption: string;
  spa: boolean;
  spaModel: string;
  tanningLedge: boolean;
  tanningLedgeModel: string;
  pavers: boolean;
  paverOption: string;
  paverArea: number;
  extrasBreakdown?: Array<{ name: string; price: number }>;
  extrasTotal?: number;
}

interface ConcretePoolConfig {
  length: number;
  width: number;
  shape: 'rectangular' | 'free-form' | 'kidney' | string;
  selectedModel: string;
}

interface ConcretePoolProductCardProps {
  onRequestQuote?: (poolData: any) => void;
}

const CONCRETE_PRICE_PER_SQF = 155;

const poolHeaters = [
  { name: 'Gas Heater 400K BTU', price: 5000, image: '/lovable-uploads/heater-gas.jpg', description: 'Fast heating for all weather' },
  { name: 'Heat Pump - Eco Series', price: 4500, image: '/lovable-uploads/heater-heat-pump.jpg', description: 'Energy efficient heating' },
  { name: 'Electric Heater', price: 3500, image: '/lovable-uploads/heater-electric.jpg', description: 'Reliable electric heating' }
];

const ConcretePoolProductCard = ({ onRequestQuote }: ConcretePoolProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);
  const [config, setConfig] = useState<ConcretePoolConfig>({
    length: 16,
    width: 32,
    shape: 'rectangular',
    selectedModel: 'custom'
  });
  
  const [extras, setExtras] = useState<ConcretePoolExtras>({
    heater: false,
    heaterModel: 'Gas Heater 400K BTU',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: 'standard',
    jets: false,
    jetQuantity: 4,
    liner: false,
    linerOption: 'Standard Blue',
    spa: false,
    spaModel: 'Mystic',
    tanningLedge: false,
    tanningLedgeModel: tanningLedges[0]?.name || 'Genesis',
    pavers: false,
    paverOption: 'Appian Adobe',
    paverArea: 0
  });

  const [paverSurfaceArea, setPaverSurfaceArea] = useState('');

  // Function to extract dimensions from pool model and calculate area
  const extractDimensionsFromModel = (model: any) => {
    if (!model || !model.dimensions) return null;
    
    const dimensions = model.dimensions;
    // Extract numbers from dimensions like "14′ × 30′" or "9′ 1″ × 17′ 5″"
    const matches = dimensions.match(/(\d+)(?:′\s*(\d+)″?)?\s*×\s*(\d+)(?:′\s*(\d+)″?)?/);
    
    if (matches) {
      const length1 = parseInt(matches[1]);
      const inches1 = matches[2] ? parseInt(matches[2]) : 0;
      const length2 = parseInt(matches[3]);
      const inches2 = matches[4] ? parseInt(matches[4]) : 0;
      
      const totalLength1 = length1 + (inches1 / 12);
      const totalLength2 = length2 + (inches2 / 12);
      
      return {
        length: Math.max(totalLength1, totalLength2),
        width: Math.min(totalLength1, totalLength2),
        area: Math.round(totalLength1 * totalLength2)
      };
    }
    
    return null;
  };

  const calculateArea = () => {
    if (config.selectedModel !== 'custom') {
      // Use selected pool model dimensions
      const selectedPool = pools.find(pool => pool.model === config.selectedModel);
      if (selectedPool) {
        const modelDimensions = extractDimensionsFromModel(selectedPool);
        if (modelDimensions) {
          return modelDimensions.area;
        }
      }
    }
    
    // Use custom dimensions
    const { length, width, shape } = config;
    let area = length * width;
    
    // Adjust area based on shape
    switch (shape) {
      case 'free-form':
        area = area * 0.75; // Free form is typically 75% of rectangle
        break;
      case 'kidney':
        area = area * 0.8; // Kidney is typically 80% of rectangle
        break;
      case 'rectangular':
      default:
        // No adjustment needed
        break;
    }
    
    return Math.round(area);
  };

  const calculatePoolPrice = () => {
    return calculateArea() * CONCRETE_PRICE_PER_SQF;
  };

  const toggleExtra = (extra: string) => {
    setExtras(prev => {
      if (extra === 'heater') {
        return { ...prev, heater: !prev.heater };
      } else if (extra === 'screenEnclosure') {
        return { ...prev, screenEnclosure: !prev.screenEnclosure };
      } else if (extra === 'jets') {
        return { ...prev, jets: !prev.jets };
      } else if (extra === 'liner') {
        return { ...prev, liner: !prev.liner };
      } else if (extra === 'spa') {
        return { ...prev, spa: !prev.spa };
      } else if (extra === 'tanningLedge') {
        return { ...prev, tanningLedge: !prev.tanningLedge };
      } else if (extra === 'pavers') {
        return { ...prev, pavers: !prev.pavers };
      }
      return prev;
    });
  };

  const getExtraPrice = (extra: string) => {
    switch (extra) {
      case 'heater':
        if (!extras.heater) return 0;
        const selectedHeater = poolHeaters.find(heater => heater.name === extras.heaterModel);
        return selectedHeater ? selectedHeater.price : 5000;
      case 'screenEnclosure':
        if (!extras.screenEnclosure) return 0;
        const pricePerSqFt = {
          standard: 15,
          deluxe: 22,
          premium: 28
        };
        return extras.screenEnclosureArea * pricePerSqFt[extras.screenEnclosureQuality];
      case 'jets':
        return extras.jets ? 1800 : 0;
      case 'liner':
        if (!extras.liner) return 0;
        const selectedLiner = poolLiners.find(liner => liner.name === extras.linerOption);
        return selectedLiner ? selectedLiner.price : 0;
      case 'spa':
        if (!extras.spa) return 0;
        const selectedSpa = spas.find(spa => spa.model === extras.spaModel);
        return selectedSpa ? selectedSpa.price : 0;
      case 'tanningLedge':
        if (!extras.tanningLedge) return 0;
        const selectedLedge = tanningLedges.find(ledge => ledge.name === extras.tanningLedgeModel);
        return selectedLedge ? selectedLedge.price : 0;
      case 'pavers':
        if (!extras.pavers || !paverSurfaceArea || isNaN(parseFloat(paverSurfaceArea))) return 0;
        const selectedPaver = paverTypes.find(paver => paver.name === extras.paverOption);
        return selectedPaver ? selectedPaver.basePrice * parseFloat(paverSurfaceArea) : 0;
      default:
        return 0;
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = calculatePoolPrice();
    const extrasPrice = 
      getExtraPrice('heater') +
      getExtraPrice('screenEnclosure') +
      (getExtraPrice('jets') * extras.jetQuantity) +
      getExtraPrice('liner') +
      getExtraPrice('spa') +
      getExtraPrice('tanningLedge') +
      getExtraPrice('pavers');
    
    return basePrice + extrasPrice;
  };

  const handleRequestQuote = () => {
    // Create extras breakdown
    const extrasBreakdown = [];
    
    if (extras.heater) {
      extrasBreakdown.push({
        name: `${extras.heaterModel}`,
        price: getExtraPrice('heater')
      });
    }
    
    if (extras.screenEnclosure && extras.screenEnclosureArea > 0) {
      extrasBreakdown.push({
        name: `Screen Enclosure - ${extras.screenEnclosureQuality === 'standard' ? 'Wonder Cage' : extras.screenEnclosureQuality === 'deluxe' ? 'Deluxe' : '2 stories'} (${extras.screenEnclosureArea} sq ft)`,
        price: getExtraPrice('screenEnclosure')
      });
    }
    
    if (extras.jets) {
      extrasBreakdown.push({
        name: `Spa Jets (${extras.jetQuantity} jets)`,
        price: getExtraPrice('jets') * extras.jetQuantity
      });
    }
    
    if (extras.liner) {
      extrasBreakdown.push({
        name: `${extras.linerOption} Liner`,
        price: getExtraPrice('liner')
      });
    }
    
    if (extras.spa) {
      extrasBreakdown.push({
        name: `${extras.spaModel} Spa`,
        price: getExtraPrice('spa')
      });
    }
    
    if (extras.tanningLedge) {
      extrasBreakdown.push({
        name: `${extras.tanningLedgeModel} Tanning Ledge`,
        price: getExtraPrice('tanningLedge')
      });
    }
    
    if (extras.pavers && paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      extrasBreakdown.push({
        name: `${extras.paverOption} Pavers (${paverSurfaceArea} sq ft)`,
        price: getExtraPrice('pavers')
      });
    }
    
    const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
    
    const selectedPool = config.selectedModel !== 'custom' && config.selectedModel !== 'rectangular' && config.selectedModel !== 'free-form' && config.selectedModel !== 'kidney' ? 
      pools.find(pool => pool.model === config.selectedModel) : null;
    
    const poolData = {
      model: selectedPool ? `Concrete ${selectedPool.model}` : `Custom Concrete Pool - ${config.shape}`,
      price: calculateTotalPrice(),
      category: 'premium' as const,
      dimensions: selectedPool ? selectedPool.dimensions : `${config.length}′ × ${config.width}′`,
      type: 'concrete',
      configuration: {
        ...config,
        area: calculateArea(),
        poolPrice: calculatePoolPrice(),
        modelDetails: selectedPool || null
      },
      extras: {
        ...extras,
        extrasBreakdown,
        extrasTotal
      }
    };
    
    onRequestQuote?.(poolData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-teal/10">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <Waves className="h-8 w-8" />
          Custom Concrete Pool
        </CardTitle>
        <Badge className="bg-gradient-to-r from-primary to-teal text-white font-semibold px-4 py-1">
          Premium Concrete Construction
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Pool Model Selection */}
        <div>
          <Label>Pool Model</Label>
          <Select value={config.selectedModel} onValueChange={(value: string) => setConfig({ ...config, selectedModel: value, shape: value === 'custom' ? 'rectangular' : value })}>
            <SelectTrigger className="focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="custom">Custom Dimensions</SelectItem>
              <SelectItem value="rectangular">Custom Rectangular</SelectItem>
              <SelectItem value="free-form">Custom Free Form</SelectItem>
              <SelectItem value="kidney">Custom Kidney Shape</SelectItem>
              {pools.map((pool) => (
                <SelectItem key={pool.model} value={pool.model}>
                  {pool.model} ({pool.dimensions})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Dimensions (only show if custom is selected) */}
        {(config.selectedModel === 'custom' || config.selectedModel === 'rectangular' || config.selectedModel === 'free-form' || config.selectedModel === 'kidney') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Length (feet)</Label>
              <Input
                id="length"
                type="number"
                min="8"
                max="50"
                value={config.length}
                onChange={(e) => setConfig({ ...config, length: Number(e.target.value) })}
                className="focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="width">Width (feet)</Label>
              <Input
                id="width"
                type="number"
                min="8"
                max="50"
                value={config.width}
                onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
                className="focus:border-primary"
              />
            </div>
          </div>
        )}

        <div>
          <Label>Pool Model</Label>
          <Select value={config.selectedModel} onValueChange={(value: string) => setConfig({ ...config, selectedModel: value, shape: value === 'custom' ? 'rectangular' : value })}>
            <SelectTrigger className="focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="custom">Custom Dimensions</SelectItem>
              <SelectItem value="rectangular">Custom Rectangular</SelectItem>
              <SelectItem value="free-form">Custom Free Form</SelectItem>
              <SelectItem value="kidney">Custom Kidney Shape</SelectItem>
              {pools.map((pool) => (
                <SelectItem key={pool.model} value={pool.model}>
                  {pool.model} ({pool.dimensions})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pool Area Display */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Pool Area: {calculateArea()} sq ft</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {config.selectedModel !== 'custom' && config.selectedModel !== 'rectangular' && config.selectedModel !== 'free-form' && config.selectedModel !== 'kidney' ? (
              <>Model: {config.selectedModel} @ ${CONCRETE_PRICE_PER_SQF}/sq ft</>
            ) : (
              <>{config.length}′ × {config.width}′ {config.shape} @ ${CONCRETE_PRICE_PER_SQF}/sq ft</>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in">
            <Separator />
            
            {/* Pool Liner Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Premium Pool Liners</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {poolLiners.map(liner => (
                    <CarouselItem key={liner.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                          extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => setExtras(prev => ({ ...prev, linerOption: liner.name }))}
                      >
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                          <img 
                            src={liner.image} 
                            alt={liner.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{liner.name}</p>
                          <div className="mt-1 space-y-1">
                            {liner.type && liner.type !== 'Standard' && (
                              <p className="text-xs text-primary text-center font-semibold">{liner.type}</p>
                            )}
                            {liner.price > 0 && (
                              <p className="text-xs text-foreground font-semibold text-center">+${liner.price.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            {/* Pavers Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Pavers & Surface Area Calculator</h4>
              <div className="mb-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Paver Surface Area (sq ft)
                </label>
                <Input 
                  type="number" 
                  placeholder="Enter surface area for pavers" 
                  value={paverSurfaceArea} 
                  onChange={e => setPaverSurfaceArea(e.target.value)} 
                  className="mb-2" 
                />
                {paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) && (
                  <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${(parseFloat(paverSurfaceArea) * 15).toLocaleString()} (${paverSurfaceArea} sq ft × $15/sq ft)
                  </div>
                )}
              </div>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {paverTypes.slice(0, 8).map(paver => (
                    <CarouselItem key={paver.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                          extras.paverOption === paver.name ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => setExtras(prev => ({ ...prev, paverOption: paver.name }))}
                      >
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                          <img 
                            src={paver.image} 
                            alt={paver.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{paver.name}</p>
                          <div className="mt-1">
                            <p className="text-xs text-foreground font-semibold text-center">${paver.basePrice}/sq ft</p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            {/* Additional Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Additional Features</h4>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Heater Option */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.heater} 
                    onCheckedChange={() => toggleExtra('heater')} 
                    className="data-[state=checked]:bg-coral data-[state=checked]:border-coral" 
                  />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-coral" />
                    <span className="text-sm">Add Pool Heater (+${extras.heater ? getExtraPrice('heater').toLocaleString() : '0'})</span>
                  </div>
                </label>

                {extras.heater && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Heater Model:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {poolHeaters.map(heater => (
                        <button 
                          key={heater.name}
                          onClick={() => setExtras(prev => ({ ...prev, heaterModel: heater.name }))}
                          className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                            extras.heaterModel === heater.name 
                              ? 'border-coral bg-coral/10 text-coral' 
                              : 'border-border hover:border-coral/50'
                          }`}
                        >
                          <div className="flex-1 text-left">
                            <div>{heater.name}</div>
                            <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                            {heater.description && (
                              <div className="text-xs text-muted-foreground">{heater.description}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screen Enclosure */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.screenEnclosure} 
                    onCheckedChange={() => toggleExtra('screenEnclosure')} 
                  />
                  <div className="flex items-center space-x-1">
                    <Grid3X3 size={16} className="text-primary" />
                    <span className="text-sm">Screen Enclosure (+${extras.screenEnclosure ? getExtraPrice('screenEnclosure').toLocaleString() : '0'})</span>
                  </div>
                </label>

                {extras.screenEnclosure && (
                  <div className="ml-6 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Area (sq ft)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={extras.screenEnclosureArea || ''}
                        onChange={(e) => setExtras(prev => ({ ...prev, screenEnclosureArea: Number(e.target.value) || 0 }))}
                        placeholder="Enter sq ft"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quality</Label>
                      <Select 
                        value={extras.screenEnclosureQuality} 
                        onValueChange={(value: 'standard' | 'deluxe' | 'premium') => setExtras(prev => ({ ...prev, screenEnclosureQuality: value }))}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard ($15/sq ft)</SelectItem>
                          <SelectItem value="deluxe">Deluxe ($22/sq ft)</SelectItem>
                          <SelectItem value="premium">Premium ($28/sq ft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Spa Jets */}
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer flex-1">
                    <Checkbox 
                      checked={extras.jets} 
                      onCheckedChange={() => toggleExtra('jets')} 
                    />
                    <div className="flex items-center space-x-1">
                      <Zap size={16} className="text-orange" />
                      <span className="text-sm">Spa Jets (+${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()})</span>
                    </div>
                  </label>
                  {extras.jets && (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setExtras(prev => ({ ...prev, jetQuantity: Math.max(1, prev.jetQuantity - 1) }))}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{extras.jetQuantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setExtras(prev => ({ ...prev, jetQuantity: prev.jetQuantity + 1 }))}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>

                {/* Liner */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.liner} 
                    onCheckedChange={() => toggleExtra('liner')} 
                  />
                  <div className="flex items-center space-x-1">
                    <Droplets size={16} className="text-primary" />
                    <span className="text-sm">Pool Liner (+${extras.liner ? getExtraPrice('liner').toLocaleString() : '0'})</span>
                  </div>
                </label>

                {/* Spa */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.spa} 
                    onCheckedChange={() => toggleExtra('spa')} 
                  />
                  <div className="flex items-center space-x-1">
                    <Waves size={16} className="text-primary" />
                    <span className="text-sm">Add Spa (+${extras.spa ? getExtraPrice('spa').toLocaleString() : '0'})</span>
                  </div>
                </label>

                {extras.spa && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Spa Model:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {spas.map((spa: any) => (
                        <button 
                          key={spa.model}
                          onClick={() => setExtras(prev => ({ ...prev, spaModel: spa.model }))}
                          className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                            extras.spaModel === spa.model 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {spa.image && <img src={spa.image} alt={spa.model} className="w-8 h-8 rounded object-cover" />}
                          <div className="flex-1 text-left">
                            <div>{spa.model}</div>
                            <div className="text-xs text-muted-foreground">${spa.price.toLocaleString()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tanning Ledge */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.tanningLedge} 
                    onCheckedChange={() => toggleExtra('tanningLedge')} 
                  />
                  <div className="flex items-center space-x-1">
                    <Sun size={16} className="text-coral" />
                    <span className="text-sm">Add Tanning Ledge (+${extras.tanningLedge ? getExtraPrice('tanningLedge').toLocaleString() : '0'})</span>
                  </div>
                </label>

                {extras.tanningLedge && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Tanning Ledge Model:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {tanningLedges.map((ledge: any) => (
                        <button 
                          key={ledge.name}
                          onClick={() => setExtras(prev => ({ ...prev, tanningLedgeModel: ledge.name }))}
                          className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                            extras.tanningLedgeModel === ledge.name 
                              ? 'border-coral bg-coral/10 text-coral' 
                              : 'border-border hover:border-coral/50'
                          }`}
                        >
                          <div className="flex-1 text-left">
                            <div>{ledge.name}</div>
                            <div className="text-xs text-muted-foreground">${ledge.price.toLocaleString()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pavers */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={extras.pavers} 
                    onCheckedChange={() => toggleExtra('pavers')} 
                  />
                  <span className="text-sm">Pavers Around Pool (+${extras.pavers ? getExtraPrice('pavers').toLocaleString() : '0'})</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={handleRequestQuote}
                  variant="outline" 
                  className="flex-1" 
                  size="sm"
                >
                  Instant Quote
                </Button>
              </div>
              
              <div className="flex gap-2">
                <StripeCheckoutButton 
                  productId={`concrete_pool_${config.shape}`}
                  productName={`Custom Concrete Pool - ${config.shape}`}
                  price={calculateTotalPrice()}
                  variant="gradient" 
                  className="flex-1 hover:scale-105 transition-all duration-300" 
                  size="sm" 
                  showFinancingOptions={false}
                />
              </div>
            </div>

            {/* Final Price Display */}
            <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg border border-primary/30">
              <div className="text-center">
                <h5 className="text-sm font-medium text-muted-foreground">Total Configuration Price</h5>
                <div className="text-2xl font-bold text-foreground">${calculateTotalPrice().toLocaleString()}</div>
              </div>
            </div>

            {/* Bottom Dashboard - Integrated Financing */}
            <div className="mt-4 p-4 bg-gradient-to-r from-teal/5 to-primary/5 rounded-lg border border-teal/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-sm text-foreground">Finance This Purchase</h5>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFinancing(!showFinancing)} 
                    className="text-xs"
                  >
                    {showFinancing ? 'Hide' : 'Show'} Options
                  </Button>
                </div>
                
                {showFinancing && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="font-semibold">3 Years</div>
                        <div className="text-teal-600">${(calculateTotalPrice() / 36).toLocaleString()}/mo</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="font-semibold">6 Years</div>
                        <div className="text-teal-600">${(calculateTotalPrice() / 72).toLocaleString()}/mo</div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm" 
                      onClick={() => {
                        const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?` +
                          `amount=${calculateTotalPrice()}&` +
                          `product=${encodeURIComponent(`Custom Concrete Pool - ${config.shape}`)}&` +
                          `description=${encodeURIComponent(`Complete concrete pool configuration including ${config.shape} pool`)}&` +
                          `monthly_payment=${Math.round(calculateTotalPrice() * 0.008)}&` +
                          `loan_term=60&` +
                          `project_type=Pool%20Installation`;
                        window.open(lyonFinancialUrl, '_blank');
                      }}
                    >
                      Apply with Lyon Financial
                    </Button>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      *Financing subject to credit approval. APR varies.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features List */}
            <div className="p-4 bg-teal/5 rounded-lg">
              <h4 className="font-semibold text-teal-600 mb-2">Concrete Pool Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Fully customizable shape and size</li>
                <li>• Durable concrete construction</li>
                <li>• Professional installation included</li>
                <li>• LED lighting system</li>
                <li>• Standard filtration system</li>
                <li>• 10-year structural warranty</li>
              </ul>
            </div>
          </div>
        )}

        {/* Default Action Buttons */}
        {!showDetails && (
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${calculateTotalPrice().toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Starting price for {calculateArea()} sq ft concrete pool
              </div>
            </div>
            <Button 
              onClick={() => setShowDetails(true)} 
              variant="gradient" 
              className="w-full hover:scale-105 transition-all duration-300" 
              size="sm"
            >
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConcretePoolProductCard;