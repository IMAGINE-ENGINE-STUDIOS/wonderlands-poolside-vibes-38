import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Waves, Calculator, ShoppingCart, Thermometer, Grid3X3, Zap, Droplets } from "lucide-react";
import { spas } from "./PoolCatalog";
import { tanningLedges, poolLiners } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";

interface ConcretePoolConfig {
  length: number;
  width: number;
  shape: 'rectangular' | 'free-form' | 'kidney';
  spa: string;
  tanningLedge: string;
  heater: boolean;
  heaterModel: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: 'standard' | 'deluxe' | 'premium';
  spaJets: boolean;
  jetQuantity: number;
  liner: boolean;
  linerOption: string;
  pavers: boolean;
  paverOption: string;
  paverArea: number;
}

interface ConcretePoolProductCardProps {
  onRequestQuote?: (poolData: any) => void;
}

const CONCRETE_PRICE_PER_SQF = 155;

const ConcretePoolProductCard = ({ onRequestQuote }: ConcretePoolProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [config, setConfig] = useState<ConcretePoolConfig>({
    length: 16,
    width: 32,
    shape: 'rectangular',
    spa: 'none',
    tanningLedge: 'none',
    heater: false,
    heaterModel: 'Gas Heater 400K BTU',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: 'standard',
    spaJets: false,
    jetQuantity: 4,
    liner: false,
    linerOption: 'none',
    pavers: false,
    paverOption: 'none',
    paverArea: 0
  });

  const calculateArea = () => {
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

  const getSpaPrice = () => {
    if (!config.spa || config.spa === 'none') return 0;
    const selectedSpa = spas.find(spa => spa.model === config.spa);
    return selectedSpa ? selectedSpa.price : 0;
  };

  const getTanningLedgePrice = () => {
    if (!config.tanningLedge || config.tanningLedge === 'none') return 0;
    const selectedLedge = tanningLedges.find(ledge => ledge.name === config.tanningLedge);
    return selectedLedge ? selectedLedge.price : 0;
  };

  const getHeaterPrice = () => {
    if (!config.heater) return 0;
    return 5000; // Standard heater price
  };

  const getScreenEnclosurePrice = () => {
    if (!config.screenEnclosure) return 0;
    const pricePerSqFt = {
      standard: 15,
      deluxe: 22,
      premium: 28
    };
    return config.screenEnclosureArea * pricePerSqFt[config.screenEnclosureQuality];
  };

  const getSpaJetsPrice = () => {
    if (!config.spaJets) return 0;
    return config.jetQuantity * 1800; // $1800 per jet
  };

  const getLinerPrice = () => {
    if (!config.liner || config.linerOption === 'none') return 0;
    const selectedLiner = poolLiners.find(liner => liner.name === config.linerOption);
    return selectedLiner ? selectedLiner.price : 0;
  };

  const getPaverPrice = () => {
    if (!config.pavers || config.paverOption === 'none') return 0;
    const selectedPaver = paverTypes.find(paver => paver.name === config.paverOption);
    return selectedPaver && config.paverArea > 0 ? selectedPaver.basePrice * config.paverArea : 0;
  };

  const getTotalPrice = () => {
    return calculatePoolPrice() + 
           getSpaPrice() + 
           getTanningLedgePrice() + 
           getHeaterPrice() + 
           getScreenEnclosurePrice() + 
           getSpaJetsPrice() + 
           getLinerPrice() + 
           getPaverPrice();
  };

  const handleRequestQuote = () => {
    const poolData = {
      model: `Custom Concrete Pool - ${config.shape}`,
      price: getTotalPrice(),
      category: 'premium' as const,
      dimensions: `${config.length}′ × ${config.width}′`,
      type: 'concrete',
      configuration: {
        ...config,
        area: calculateArea(),
        poolPrice: calculatePoolPrice(),
        spaPrice: getSpaPrice(),
        tanningLedgePrice: getTanningLedgePrice()
      },
      extras: {
        extrasTotal: getSpaPrice() + getTanningLedgePrice() + getHeaterPrice() + getScreenEnclosurePrice() + getSpaJetsPrice() + getLinerPrice() + getPaverPrice(),
        extrasBreakdown: [
          ...(config.spa && config.spa !== 'none' ? [{
            name: `${config.spa} Spa`,
            price: getSpaPrice()
          }] : []),
          ...(config.tanningLedge && config.tanningLedge !== 'none' ? [{
            name: `${config.tanningLedge} Tanning Ledge`,
            price: getTanningLedgePrice()
          }] : []),
          ...(config.heater ? [{
            name: `${config.heaterModel}`,
            price: getHeaterPrice()
          }] : []),
          ...(config.screenEnclosure ? [{
            name: `Screen Enclosure (${config.screenEnclosureQuality}, ${config.screenEnclosureArea} sq ft)`,
            price: getScreenEnclosurePrice()
          }] : []),
          ...(config.spaJets ? [{
            name: `Spa Jets (${config.jetQuantity} jets)`,
            price: getSpaJetsPrice()
          }] : []),
          ...(config.liner && config.linerOption !== 'none' ? [{
            name: `${config.linerOption} Liner`,
            price: getLinerPrice()
          }] : []),
          ...(config.pavers && config.paverOption !== 'none' && config.paverArea > 0 ? [{
            name: `${config.paverOption} Pavers (${config.paverArea} sq ft)`,
            price: getPaverPrice()
          }] : [])
        ]
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
        {/* Basic Pool Info */}
        <div className="space-y-4">
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

          <div>
            <Label>Pool Shape</Label>
            <Select value={config.shape} onValueChange={(value: 'rectangular' | 'free-form' | 'kidney') => setConfig({ ...config, shape: value })}>
              <SelectTrigger className="focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangular">Rectangular</SelectItem>
                <SelectItem value="free-form">Free Form</SelectItem>
                <SelectItem value="kidney">Kidney Shape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Area Calculation Display */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Pool Area: {calculateArea()} sq ft</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {config.length}′ × {config.width}′ {config.shape} @ ${CONCRETE_PRICE_PER_SQF}/sq ft
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in">
            <Separator />
            
            {/* Add-ons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Add-ons & Options</h3>
              
              {/* Spa Selection */}
              <div>
                <Label>Add Spa</Label>
                <Select value={config.spa} onValueChange={(value) => setConfig({ ...config, spa: value })}>
                  <SelectTrigger className="focus:border-primary">
                    <SelectValue placeholder="Select spa model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Spa</SelectItem>
                    {spas.map((spa) => (
                      <SelectItem key={spa.model} value={spa.model}>
                        {spa.model} - ${spa.price.toLocaleString()} ({spa.dimensions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tanning Ledge Selection */}
              <div>
                <Label>Add Tanning Ledge</Label>
                <Select value={config.tanningLedge} onValueChange={(value) => setConfig({ ...config, tanningLedge: value })}>
                  <SelectTrigger className="focus:border-primary">
                    <SelectValue placeholder="Select tanning ledge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Tanning Ledge</SelectItem>
                    {tanningLedges.map((ledge) => (
                      <SelectItem key={ledge.name} value={ledge.name}>
                        {ledge.name} - ${ledge.price.toLocaleString()} ({ledge.dimensions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Heater Option */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={config.heater} 
                    onCheckedChange={(checked) => setConfig({ ...config, heater: checked as boolean })}
                  />
                  <Thermometer className="h-4 w-4 text-primary" />
                  <span>Pool Heater - ${getHeaterPrice().toLocaleString()}</span>
                </label>
              </div>

              {/* Screen Enclosure Option */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={config.screenEnclosure} 
                    onCheckedChange={(checked) => setConfig({ ...config, screenEnclosure: checked as boolean })}
                  />
                  <Grid3X3 className="h-4 w-4 text-primary" />
                  <span>Screen Enclosure</span>
                </label>

                {config.screenEnclosure && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <div>
                      <Label>Area (sq ft)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={config.screenEnclosureArea || ''}
                        onChange={(e) => setConfig({ ...config, screenEnclosureArea: Number(e.target.value) || 0 })}
                        placeholder="Enter sq ft"
                      />
                    </div>
                    <div>
                      <Label>Quality</Label>
                      <Select 
                        value={config.screenEnclosureQuality} 
                        onValueChange={(value: 'standard' | 'deluxe' | 'premium') => setConfig({ ...config, screenEnclosureQuality: value })}
                      >
                        <SelectTrigger>
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
              </div>

              {/* Spa Jets Option */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={config.spaJets} 
                    onCheckedChange={(checked) => setConfig({ ...config, spaJets: checked as boolean })}
                  />
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Spa Jets</span>
                </label>

                {config.spaJets && (
                  <div className="pl-6">
                    <Label>Number of Jets</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={config.jetQuantity}
                      onChange={(e) => setConfig({ ...config, jetQuantity: Number(e.target.value) || 1 })}
                      className="w-24"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      ${getSpaJetsPrice().toLocaleString()} (${1800}/jet)
                    </div>
                  </div>
                )}
              </div>

              {/* Liner Option */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={config.liner} 
                    onCheckedChange={(checked) => setConfig({ ...config, liner: checked as boolean })}
                  />
                  <Droplets className="h-4 w-4 text-primary" />
                  <span>Pool Liner</span>
                </label>

                {config.liner && (
                  <div className="pl-6">
                    <Label>Select Liner</Label>
                    <Select value={config.linerOption} onValueChange={(value) => setConfig({ ...config, linerOption: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose liner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Liner</SelectItem>
                        {poolLiners.map((liner) => (
                          <SelectItem key={liner.name} value={liner.name}>
                            {liner.name} - ${liner.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Pavers Option */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={config.pavers} 
                    onCheckedChange={(checked) => setConfig({ ...config, pavers: checked as boolean })}
                  />
                  <span>Pavers Around Pool</span>
                </label>

                {config.pavers && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <div>
                      <Label>Select Paver Type</Label>
                      <Select value={config.paverOption} onValueChange={(value) => setConfig({ ...config, paverOption: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose paver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Pavers</SelectItem>
                          {paverTypes.slice(0, 5).map((paver) => (
                            <SelectItem key={paver.name} value={paver.name}>
                              {paver.name} - ${paver.basePrice}/sq ft
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Area (sq ft)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={config.paverArea || ''}
                        onChange={(e) => setConfig({ ...config, paverArea: Number(e.target.value) || 0 })}
                        placeholder="Enter sq ft"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Concrete Pool ({calculateArea()} sq ft)</span>
                  <span className="font-semibold">${calculatePoolPrice().toLocaleString()}</span>
                </div>
                {config.spa && config.spa !== 'none' && (
                  <div className="flex justify-between text-teal-600">
                    <span>{config.spa} Spa</span>
                    <span className="font-semibold">+${getSpaPrice().toLocaleString()}</span>
                  </div>
                )}
                {config.tanningLedge && config.tanningLedge !== 'none' && (
                  <div className="flex justify-between text-coral-600">
                    <span>{config.tanningLedge} Tanning Ledge</span>
                    <span className="font-semibold">+${getTanningLedgePrice().toLocaleString()}</span>
                  </div>
                )}
                {config.heater && (
                  <div className="flex justify-between text-primary">
                    <span>Pool Heater</span>
                    <span className="font-semibold">+${getHeaterPrice().toLocaleString()}</span>
                  </div>
                )}
                {config.screenEnclosure && config.screenEnclosureArea > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Screen Enclosure ({config.screenEnclosureArea} sq ft)</span>
                    <span className="font-semibold">+${getScreenEnclosurePrice().toLocaleString()}</span>
                  </div>
                )}
                {config.spaJets && (
                  <div className="flex justify-between text-primary">
                    <span>Spa Jets ({config.jetQuantity} jets)</span>
                    <span className="font-semibold">+${getSpaJetsPrice().toLocaleString()}</span>
                  </div>
                )}
                {config.liner && config.linerOption !== 'none' && (
                  <div className="flex justify-between text-primary">
                    <span>{config.linerOption} Liner</span>
                    <span className="font-semibold">+${getLinerPrice().toLocaleString()}</span>
                  </div>
                )}
                {config.pavers && config.paverOption !== 'none' && config.paverArea > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>{config.paverOption} Pavers ({config.paverArea} sq ft)</span>
                    <span className="font-semibold">+${getPaverPrice().toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-primary">Total Price:</span>
                <span className="text-primary flex items-center gap-1">
                  <DollarSign className="h-6 w-6" />
                  {getTotalPrice().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleRequestQuote}
              className="w-full bg-gradient-to-r from-primary to-teal hover:from-primary-dark hover:to-teal-dark text-white font-semibold py-3"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Get Custom Quote
            </Button>

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
                ${getTotalPrice().toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Starting price for {calculateArea()} sq ft concrete pool
              </div>
            </div>
            <Button 
              onClick={() => setShowDetails(true)} 
              variant="outline" 
              className="w-full hover:scale-105 transition-all duration-300" 
              size="sm"
            >
              View Details & Options
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConcretePoolProductCard;