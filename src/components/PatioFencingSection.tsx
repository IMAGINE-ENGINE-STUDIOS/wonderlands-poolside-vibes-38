import { useState } from "react";
import aluminumFencing from "@/assets/fencing/aluminum-fencing.webp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DollarSign, ShoppingCart, Calculator } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import { useShoppingCart } from "./ShoppingCartProvider";
import EditorialSectionHeader from "./EditorialSectionHeader";
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
      <section className="py-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <EditorialSectionHeader
          eyebrow="Volume VIII — Boundary"
          title="Patio Fencing"
          description="Premium aluminium fencing with pool-code compliant gates — safety drawn with restraint."
        />

          <ProductScrollRow className="mb-8">
            {fencingOptions.map(fencing => <Card key={fencing.height} className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer" onClick={() => handleFencingClick(fencing)}>
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img loading="lazy" decoding="async" alt={fencing.name} className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]" src="/lovable-uploads/96e12412-10ac-45a5-b879-6ed8fc8e8046.webp" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                      {fencing.height}" Height
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                    {fencing.name}
                  </h3>

                  <div className="flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Rate</p>
                      <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">${fencing.pricePerLinearFt}<span className="text-sm text-muted-foreground">/linear ft</span></p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {fencing.description}
                  </p>

                  <div className="space-y-1 border-t border-border/60 pt-3">
                    {fencing.features.slice(0, 2).map((feature, idx) => <p key={idx} className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                        {feature}
                      </p>)}
                  </div>

                  <Button onClick={e => {
                e.stopPropagation();
                handleFencingClick(fencing);
              }} variant="default" className="w-full rounded-none bg-foreground text-background text-[10px] uppercase tracking-[0.3em] hover:bg-foreground/90" size="sm">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Price
                  </Button>
                </CardContent>
              </Card>)}
          </ProductScrollRow>

          {/* Information Section — editorial afterword plate */}
          <div className="mt-20 border border-border/60 bg-card/40">
            <div className="border-b border-border/60 px-6 py-4 md:px-10 md:py-5">
              <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
                Volume VIII — Boundary
              </p>
            </div>
            <div className="border-b border-border/60 px-6 py-10 md:px-10 md:py-14 text-center">
              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
                Pool Safety & Stylish Design
              </h3>
            </div>
            <div className="grid grid-cols-1 divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                {
                  num: "01",
                  title: "Pool Code Compliant",
                  text: "All fencing options meet pool safety codes with self-closing, self-latching gates."
                },
                {
                  num: "02",
                  title: "Color Options",
                  text: "Choose from Basic Black, Bronze, or White powder-coated finishes."
                },
                {
                  num: "03",
                  title: "Full Assembly",
                  text: "Professional installation included with standard spacing for a clean, uniform look."
                }
              ].map((item) => (
                <div
                  key={item.num}
                  className="p-6 md:p-10 text-center transition-colors duration-300 hover:bg-muted/20"
                >
                  <span className="inline-block mb-5 border border-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                    {item.num}
                  </span>
                  <h3 className="mb-3 font-serif text-2xl font-light tracking-tight text-foreground md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              ))}
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
                  <img loading="lazy" decoding="async" src={aluminumFencing} alt={selectedFencing.name} className="w-full h-64 object-cover rounded-none mb-4" />

                  <div className="space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    {selectedFencing.features.map((feature, idx) => <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-none"></div>
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
                            <div className="w-4 h-4 rounded-none border border-border" style={{
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

                    <div className="bg-muted/50 p-4 rounded-none">
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
                    <Button onClick={() => handleAddToCart(selectedFencing, linearFeet)} disabled={!linearFeet || linearFeet <= 0} variant="default" className="flex-1 rounded-none">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button onClick={() => handleRequestQuote(selectedFencing)} variant="outline" className="flex-1 rounded-none">
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