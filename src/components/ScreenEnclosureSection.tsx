import { useState } from "react";
import screenEnclosurePremium from "@/assets/enclosures/screen-enclosure-premium.webp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, ShoppingCart, Calculator } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import { useShoppingCart } from "./ShoppingCartProvider";
import EditorialSectionHeader from "./EditorialSectionHeader";
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

          <EditorialSectionHeader
          eyebrow="Volume VII — Enclosure"
          title="Screen Enclosures"
          description="Premium screen systems that turn the pool deck into a protected, year-round room."
        />

          <ProductScrollRow className="mb-8">
            {screenEnclosureOptions.map((enclosure) => <Card key={enclosure.name} className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer h-full" onClick={() => handleEnclosureClick(enclosure)}>
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img loading="lazy" decoding="async" src={enclosure.image} alt={enclosure.name} className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm capitalize">
                      {enclosure.type}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-5 lg:p-7 space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                      {enclosure.name}
                    </h3>
                    <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Rate</p>
                        <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                          ${enclosure.pricePerSqFt}<span className="text-sm">/sq ft</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {enclosure.description}
                  </p>

                  {/* Features */}
                  <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
                    {enclosure.features.slice(0, 2).map((feature, idx) => <div key={idx} className="flex items-baseline justify-between gap-4 py-2.5">
                        <dd className="text-muted-foreground">{feature}</dd>
                      </div>)}
                  </dl>

                  {/* Action Button */}
                  <Button onClick={e => {
                e.stopPropagation();
                handleEnclosureClick(enclosure);
              }} variant="default" className="w-full rounded-none text-[10px] uppercase tracking-[0.3em]" size="sm">
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
                Volume VII — Afterword
              </p>
            </div>
            <div className="grid grid-cols-1 divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                {
                  num: "01",
                  title: "Year-Round Enjoyment",
                  text: "Extend your swimming season with protection from rain, wind, and debris while maintaining an open-air feel."
                },
                {
                  num: "02",
                  title: "Energy Efficient",
                  text: "Reduce heating costs and chemical usage while keeping your pool cleaner with less maintenance required."
                },
                {
                  num: "03",
                  title: "Premium Materials",
                  text: "Engineered aluminum frames with impact-resistant screening designed to withstand Florida weather conditions."
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
          {selectedEnclosure && <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEnclosure.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img loading="lazy" decoding="async" src={selectedEnclosure.image} alt={selectedEnclosure.name} className="w-full h-64 object-cover rounded-none mb-4" />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    {selectedEnclosure.features.map((feature, idx) => <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-none"></div>
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
                    
                    <div className="bg-muted/50 p-4 rounded-none">
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
                    <Button onClick={() => handleAddToCart(selectedEnclosure, squareFootage)} disabled={!squareFootage || squareFootage <= 0} variant="default" className="flex-1 rounded-none">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button onClick={() => handleRequestQuote(selectedEnclosure)} variant="outline" className="flex-1 rounded-none">
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