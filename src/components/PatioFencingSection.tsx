import { useState } from "react";
import aluminumFencing from "@/assets/aluminum-fencing.jpg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DollarSign, ShoppingCart, Calculator, Fence, Palette, Ruler } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCartProvider";
interface FencingOption {
  name: string;
  height: string;
  pricePerLinearFt: number;
  description: string;
  features: string[];
}
const fencingOptions: FencingOption[] = [{
  name: "36\" Aluminum Fence",
  height: "36",
  pricePerLinearFt: 40,
  description: "Pool code compliant 36-inch aluminum fencing with standard spacing",
  features: ["Pool Code Door", "Standard Spacing", "Full Assembly", "Powder Coated Finish"]
}, {
  name: "46\" Aluminum Fence",
  height: "46",
  pricePerLinearFt: 50,
  description: "Pool code compliant 46-inch aluminum fencing with standard spacing",
  features: ["Pool Code Door", "Standard Spacing", "Full Assembly", "Powder Coated Finish"]
}, {
  name: "56\" Aluminum Fence",
  height: "56",
  pricePerLinearFt: 60,
  description: "Premium 56-inch aluminum fencing with enhanced security and standard spacing",
  features: ["Pool Code Door", "Standard Spacing", "Full Assembly", "Powder Coated Finish", "Enhanced Security"]
}];
const colorOptions = [{
  id: "basic",
  name: "Basic Black",
  hex: "#1a1a1a"
}, {
  id: "bronze",
  name: "Bronze",
  hex: "#614e3e"
}, {
  id: "white",
  name: "White",
  hex: "#f5f5f5"
}];
const PatioFencingSection = () => {
  const [selectedFencing, setSelectedFencing] = useState<FencingOption | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [linearFeet, setLinearFeet] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>("basic");
  const {
    addToCart
  } = useShoppingCart();
  const handleFencingClick = (fencing: FencingOption) => {
    setSelectedFencing(fencing);
    setShowDetailModal(true);
  };
  const handleRequestQuote = (fencing: FencingOption) => {
    setSelectedFencing(fencing);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };
  const handleAddToCart = (fencing: FencingOption, linFt: number) => {
    if (linFt <= 0) return;
    const totalPrice = linFt * fencing.pricePerLinearFt;
    const colorName = colorOptions.find(c => c.id === selectedColor)?.name || "Basic Black";
    addToCart({
      id: `patio_fencing_${fencing.height}_${selectedColor}_${Date.now()}`,
      name: `${fencing.name} - ${colorName} (${linFt} linear ft)`,
      price: totalPrice,
      category: 'patio-fencing',
      image: aluminumFencing,
      extras: []
    });
  };
  const calculatePrice = (fencing: FencingOption, linFt: number) => {
    return linFt * fencing.pricePerLinearFt;
  };
  const getColorName = () => colorOptions.find(c => c.id === selectedColor)?.name || "Basic Black";
  return <>
      <section id="patio-fencing" className="py-12 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Patio Fencing
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Premium aluminum fencing with pool code compliant doors for safety and style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fencingOptions.map(fencing => <Card key={fencing.height} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden cursor-pointer" onClick={() => handleFencingClick(fencing)}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${fencing.height === '56' ? 'bg-gradient-to-r from-coral to-orange' : 'bg-gradient-to-r from-primary to-teal'} text-white font-medium px-3 py-1`}>
                      {fencing.height}" Height
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {fencing.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-muted">
                    <img alt={fencing.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" src="/lovable-uploads/96e12412-10ac-45a5-b879-6ed8fc8e8046.jpg" />
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      ${fencing.pricePerLinearFt}/linear ft
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {fencing.description}
                  </p>

                  <Separator />

                  <div className="space-y-1">
                    {fencing.features.slice(0, 2).map((feature, idx) => <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </div>)}
                  </div>

                  <Button onClick={e => {
                e.stopPropagation();
                handleFencingClick(fencing);
              }} variant="default" className="w-full hover:scale-105 transition-all duration-300" size="sm">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Price
                  </Button>
                </CardContent>
              </Card>)}
          </div>

          {/* Information Section */}
          <div className="bg-gradient-to-r from-primary/10 to-teal/10 rounded-2xl p-8 mt-16">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Pool Safety & Stylish Design
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <Fence className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Pool Code Compliant</h4>
                    <p className="text-sm text-muted-foreground">
                      All fencing options meet pool safety codes with self-closing, self-latching gates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Palette className="h-6 w-6 text-teal mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Color Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose from Basic Black, Bronze, or White powder-coated finishes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ruler className="h-6 w-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Full Assembly</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional installation included with standard spacing for a clean, uniform look.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedFencing && <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedFencing.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img src={aluminumFencing} alt={selectedFencing.name} className="w-full h-64 object-cover rounded-lg mb-4" />

                  <div className="space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    {selectedFencing.features.map((feature, idx) => <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {feature}
                      </div>)}
                  </div>
                </div>
                <div className="space-y-4">
                  <Badge className={`${selectedFencing.height === '56' ? 'bg-gradient-to-r from-coral to-orange' : 'bg-gradient-to-r from-primary to-teal'} text-white`}>
                    {selectedFencing.height}" Height
                  </Badge>

                  <p className="text-foreground/80">{selectedFencing.description}</p>

                  {/* Color Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Color</label>
                    <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex gap-4">
                      {colorOptions.map(color => <div key={color.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={color.id} id={color.id} />
                          <Label htmlFor={color.id} className="flex items-center gap-2 cursor-pointer">
                            <div className="w-4 h-4 rounded-full border border-border" style={{
                        backgroundColor: color.hex
                      }} />
                            {color.name}
                          </Label>
                        </div>)}
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Linear Feet</label>
                      <Input type="number" min={0} step={1} value={linearFeet || ''} onChange={e => setLinearFeet(parseFloat(e.target.value) || 0)} placeholder="Enter length in linear ft" />
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                        <span>Rate: ${selectedFencing.pricePerLinearFt}/linear ft</span>
                        <span>Length: {linearFeet} linear ft</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Color: {getColorName()}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-teal" />
                        <span className="text-2xl font-bold text-foreground">
                          ${calculatePrice(selectedFencing, linearFeet).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleAddToCart(selectedFencing, linearFeet)} disabled={!linearFeet || linearFeet <= 0} variant="default" className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button onClick={() => handleRequestQuote(selectedFencing)} variant="outline" className="flex-1">
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            </>}
        </DialogContent>
      </Dialog>

      <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} customProduct={selectedFencing ? {
      name: selectedFencing.name,
      price: 0,
      type: 'patio-fencing'
    } : undefined} extras={selectedFencing && linearFeet > 0 ? {
      extrasBreakdown: [{
        name: `${selectedFencing.name} - ${getColorName()} (${linearFeet} linear ft)`,
        price: linearFeet * selectedFencing.pricePerLinearFt,
        image: aluminumFencing
      }],
      extrasTotal: linearFeet * selectedFencing.pricePerLinearFt
    } : undefined} />
    </>;
};
export default PatioFencingSection;