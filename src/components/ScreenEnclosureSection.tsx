import { useState } from "react";
import screenEnclosurePremium from "@/assets/screen-enclosure-premium.webp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, ShoppingCart, Calculator, Home, Zap, Star } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import { useShoppingCart } from "./ShoppingCartProvider";
interface ScreenEnclosureOption {
  name: string;
  type: 'standard' | 'premium';
  pricePerSqFt: number;
  image: string;
  description: string;
  features: string[];
}
const screenEnclosureOptions: ScreenEnclosureOption[] = [{
  name: "Standard Screen Enclosure",
  type: "standard",
  pricePerSqFt: 22,
  image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.webp",
  description: "Basic aluminum frame screen enclosure with standard mesh screening",
  features: ["Aluminum Frame", "Standard Screen Mesh", "Basic Hardware", "5-Year Warranty"]
}, {
  name: "Deluxe Screen Enclosure",
  type: "standard",
  pricePerSqFt: 24,
  image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.webp",
  description: "Enhanced aluminum frame with upgraded mesh and hardware",
  features: ["Enhanced Aluminum Frame", "Premium Screen Mesh", "Upgraded Hardware", "10-Year Warranty"]
}, {
  name: "Premium Screen Enclosure",
  type: "premium",
  pricePerSqFt: 26,
  image: screenEnclosurePremium,
  description: "Top-tier aluminum construction with impact-resistant screening and premium finishes",
  features: ["Heavy-Duty Aluminum Frame", "Impact-Resistant Screen", "Premium Hardware", "Custom Color Options", "Lifetime Warranty"]
}];
const ScreenEnclosureSection = () => {
  const [selectedEnclosure, setSelectedEnclosure] = useState<ScreenEnclosureOption | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [squareFootage, setSquareFootage] = useState<number>(0);
  const {
    addToCart
  } = useShoppingCart();
  const handleEnclosureClick = (enclosure: ScreenEnclosureOption) => {
    setSelectedEnclosure(enclosure);
    setShowDetailModal(true);
  };
  const handleRequestQuote = (enclosure: ScreenEnclosureOption) => {
    setSelectedEnclosure(enclosure);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };
  const handleAddToCart = (enclosure: ScreenEnclosureOption, sqFt: number) => {
    if (sqFt <= 0) return;
    const totalPrice = sqFt * enclosure.pricePerSqFt;
    addToCart({
      id: `screen_enclosure_${enclosure.type}_${Date.now()}`,
      name: `${enclosure.name} (${sqFt} sq ft)`,
      price: totalPrice,
      category: 'screen-enclosure',
      image: enclosure.image,
      extras: []
    });
  };
  const calculatePrice = (enclosure: ScreenEnclosureOption, sqFt: number) => {
    return sqFt * enclosure.pricePerSqFt;
  };
  return <>
      <section className="py-12 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Screen Enclosures
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Transform your pool area into a comfortable, protected oasis with our premium screen enclosure systems.
            </p>
          </div>

          <ProductScrollRow className="mb-8">
            {screenEnclosureOptions.map((enclosure) => <Card key={enclosure.name} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden cursor-pointer h-full" onClick={() => handleEnclosureClick(enclosure)}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${enclosure.type === 'premium' ? 'bg-gradient-to-r from-coral to-orange' : 'bg-gradient-to-r from-secondary to-accent'} text-white capitalize font-medium px-3 py-1`}>
                      {enclosure.type}
                    </Badge>
                    
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {enclosure.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Enclosure Preview */}
                  <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-muted">
                    <img loading="lazy" decoding="async" src={enclosure.image} alt={enclosure.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      ${enclosure.pricePerSqFt}/sq ft
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {enclosure.description}
                  </p>
                  
                  <Separator />
                  
                  {/* Features */}
                  <div className="space-y-1">
                    {enclosure.features.slice(0, 2).map((feature, idx) => <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </div>)}
                  </div>
                  
                  {/* Action Button */}
                  <Button onClick={e => {
                e.stopPropagation();
                handleEnclosureClick(enclosure);
              }} variant="default" className="w-full hover:scale-105 transition-all duration-300" size="sm">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Price
                  </Button>
                </CardContent>
              </Card>)}
          </ProductScrollRow>
          
          {/* Information Section - Moved below products */}
          <div className="bg-gradient-to-r from-primary/10 to-teal/10 rounded-2xl p-8 mt-16">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Complete Pool Protection & Comfort
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <Home className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Year-Round Enjoyment</h4>
                    <p className="text-sm text-muted-foreground">
                      Extend your swimming season with protection from rain, wind, and debris while maintaining an open-air feel.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-teal mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Energy Efficient</h4>
                    <p className="text-sm text-muted-foreground">
                      Reduce heating costs and chemical usage while keeping your pool cleaner with less maintenance required.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Star className="h-6 w-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Premium Materials</h4>
                    <p className="text-sm text-muted-foreground">
                      Engineered aluminum frames with impact-resistant screening designed to withstand Florida weather conditions.
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
          {selectedEnclosure && <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEnclosure.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img loading="lazy" decoding="async" src={selectedEnclosure.image} alt={selectedEnclosure.name} className="w-full h-64 object-cover rounded-lg mb-4" />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    {selectedEnclosure.features.map((feature, idx) => <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {feature}
                      </div>)}
                  </div>
                </div>
                <div className="space-y-4">
                  <Badge className={`${selectedEnclosure.type === 'premium' ? 'bg-gradient-to-r from-coral to-orange' : 'bg-gradient-to-r from-secondary to-accent'} text-white`}>
                    {selectedEnclosure.type}
                  </Badge>
                  
                  <p className="text-foreground/80">{selectedEnclosure.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Square Footage</label>
                      <Input type="number" min={0} step={1} value={squareFootage || ''} onChange={e => setSquareFootage(parseFloat(e.target.value) || 0)} placeholder="Enter area in sq ft" />
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                        <span>Rate: ${selectedEnclosure.pricePerSqFt}/sq ft</span>
                        <span>Area: {squareFootage} sq ft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-teal" />
                        <span className="text-2xl font-bold text-foreground">
                          ${calculatePrice(selectedEnclosure, squareFootage).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={() => handleAddToCart(selectedEnclosure, squareFootage)} disabled={!squareFootage || squareFootage <= 0} variant="default" className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button onClick={() => handleRequestQuote(selectedEnclosure)} variant="outline" className="flex-1">
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            </>}
        </DialogContent>
      </Dialog>

      <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} customProduct={selectedEnclosure ? {
      name: selectedEnclosure.name,
      price: 0,
      // price will be derived from extras (sq ft * rate)
      type: 'screen-enclosure'
    } : undefined} extras={selectedEnclosure && squareFootage > 0 ? {
      extrasBreakdown: [{
        name: `Screen Enclosure - ${selectedEnclosure.type.charAt(0).toUpperCase() + selectedEnclosure.type.slice(1)} (${squareFootage} sq ft)`,
        price: squareFootage * selectedEnclosure.pricePerSqFt,
        image: selectedEnclosure.image
      }],
      extrasTotal: squareFootage * selectedEnclosure.pricePerSqFt
    } : undefined} />
    </>;
};
export default ScreenEnclosureSection;