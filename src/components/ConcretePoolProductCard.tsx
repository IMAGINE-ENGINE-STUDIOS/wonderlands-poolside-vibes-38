import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Waves, Calculator, ShoppingCart } from "lucide-react";
import { spas } from "./PoolCatalog";
import { tanningLedges } from "@/data/poolData";

interface ConcretePoolConfig {
  length: number;
  width: number;
  shape: 'rectangular' | 'free-form' | 'kidney';
  spa: string;
  tanningLedge: string;
}

interface ConcretePoolProductCardProps {
  onRequestQuote?: (poolData: any) => void;
}

const CONCRETE_PRICE_PER_SQF = 155;

const ConcretePoolProductCard = ({ onRequestQuote }: ConcretePoolProductCardProps) => {
  const [config, setConfig] = useState<ConcretePoolConfig>({
    length: 16,
    width: 32,
    shape: 'rectangular',
    spa: '',
    tanningLedge: ''
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
    if (!config.spa) return 0;
    const selectedSpa = spas.find(spa => spa.model === config.spa);
    return selectedSpa ? selectedSpa.price : 0;
  };

  const getTanningLedgePrice = () => {
    if (!config.tanningLedge) return 0;
    const selectedLedge = tanningLedges.find(ledge => ledge.name === config.tanningLedge);
    return selectedLedge ? selectedLedge.price : 0;
  };

  const getTotalPrice = () => {
    return calculatePoolPrice() + getSpaPrice() + getTanningLedgePrice();
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
        extrasTotal: getSpaPrice() + getTanningLedgePrice(),
        extrasBreakdown: [
          ...(config.spa ? [{
            name: `${config.spa} Spa`,
            price: getSpaPrice()
          }] : []),
          ...(config.tanningLedge ? [{
            name: `${config.tanningLedge} Tanning Ledge`,
            price: getTanningLedgePrice()
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

      <CardContent className="p-6 space-y-6">
        {/* Pool Dimensions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Pool Dimensions</h3>
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
        </div>

        {/* Pool Shape */}
        <div className="space-y-4">
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
            <span className="font-semibold text-primary">Pool Area Calculation</span>
          </div>
          <div className="space-y-1 text-sm">
            <p>Dimensions: {config.length}′ × {config.width}′</p>
            <p>Shape: {config.shape}</p>
            <p>Area: {calculateArea()} sq ft</p>
            <p>Rate: ${CONCRETE_PRICE_PER_SQF} per sq ft</p>
          </div>
        </div>

        <Separator />

        {/* Add-ons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Add-ons</h3>
          
          {/* Spa Selection */}
          <div>
            <Label>Add Spa (Optional)</Label>
            <Select value={config.spa} onValueChange={(value) => setConfig({ ...config, spa: value })}>
              <SelectTrigger className="focus:border-primary">
                <SelectValue placeholder="Select spa model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Spa</SelectItem>
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
            <Label>Add Tanning Ledge (Optional)</Label>
            <Select value={config.tanningLedge} onValueChange={(value) => setConfig({ ...config, tanningLedge: value })}>
              <SelectTrigger className="focus:border-primary">
                <SelectValue placeholder="Select tanning ledge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Tanning Ledge</SelectItem>
                {tanningLedges.map((ledge) => (
                  <SelectItem key={ledge.name} value={ledge.name}>
                    {ledge.name} - ${ledge.price.toLocaleString()} ({ledge.dimensions})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {config.spa && (
              <div className="flex justify-between text-teal-600">
                <span>{config.spa} Spa</span>
                <span className="font-semibold">+${getSpaPrice().toLocaleString()}</span>
              </div>
            )}
            {config.tanningLedge && (
              <div className="flex justify-between text-coral-600">
                <span>{config.tanningLedge} Tanning Ledge</span>
                <span className="font-semibold">+${getTanningLedgePrice().toLocaleString()}</span>
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
        <div className="mt-6 p-4 bg-teal/5 rounded-lg">
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
      </CardContent>
    </Card>
  );
};

export default ConcretePoolProductCard;