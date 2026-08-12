import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Droplets, Palette, Shield, Star, DollarSign, ShoppingCart } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import { useShoppingCart } from "./ShoppingCartProvider";
import { toast } from "@/components/ui/use-toast";
import { getProductsByCategory, Product } from "@/data/consolidatedProducts";
import EditorialSectionHeader from "./EditorialSectionHeader";
interface Liner extends Product {
  type?: string; // For backwards compatibility
}
interface LinersSectionProps {
  onLinerSelect?: (liner: Liner) => void;
  selectedLiner?: string;
  allowSelection?: boolean;
}
const getTypeColor = (type: string) => {
  switch (type) {
    case 'tile':
      return 'bg-gradient-to-r from-coral to-orange';
    case 'fiberglass':
      return 'bg-gradient-to-r from-primary to-teal';
    case 'vinyl':
      return 'bg-gradient-to-r from-secondary to-accent';
    default:
      return 'bg-gradient-to-r from-primary to-teal';
  }
};
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'tile':
      return <Star size={16} />;
    case 'fiberglass':
      return <Shield size={16} />;
    case 'vinyl':
      return <Droplets size={16} />;
    default:
      return <Palette size={16} />;
  }
};
const LinersSection = ({
  onLinerSelect,
  selectedLiner: selectedLinerProp,
  allowSelection
}: LinersSectionProps = {}) => {
  const [selectedLiner, setSelectedLiner] = useState<Product | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [unitType, setUnitType] = useState<'sqft' | 'sheet'>('sqft');
  const [quantity, setQuantity] = useState(1);
  const {
    addToCart
  } = useShoppingCart();
  const handleLinerClick = (liner: Product) => {
    setSelectedLiner(liner);
    setUnitType('sqft');
    setQuantity(1);
    setShowDetailModal(true);
  };
  const handleRequestQuote = (liner: Product) => {
    setSelectedLiner(liner);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };
  const handleAddToCart = () => {
    if (!selectedLiner) return;
    
    const pricePerUnit = unitType === 'sqft' ? selectedLiner.price : (selectedLiner.originalPrice || selectedLiner.price);
    const unitLabel = unitType === 'sqft' ? 'sqft (installed)' : 'sheet (material only)';
    
    addToCart({
      id: `liner_${selectedLiner.name.replace(/\s+/g, '_')}_${unitType}_${Date.now()}`,
      name: `${selectedLiner.name} - ${quantity} ${unitLabel}`,
      price: pricePerUnit * quantity,
      category: 'liner',
      image: selectedLiner.image,
      extras: [{
        name: `${quantity} ${unitLabel}`,
        price: 0
      }]
    });
    
    toast({
      title: "Added to Cart",
      description: `${selectedLiner.name} (${quantity} ${unitLabel}) has been added to your cart.`
    });
    
    setShowDetailModal(false);
  };

  // Listen for search events to open specific liners
  React.useEffect(() => {
    const handleOpenProduct = (event: CustomEvent) => {
      const { type, id, name } = event.detail;
      if (type === 'liner' || type === 'liners') {
        const liner = getProductsByCategory('liner').find(l => 
          l.name.toLowerCase() === name?.toLowerCase() ||
          l.name.toLowerCase().includes(name?.toLowerCase())
        );
        if (liner) {
          setSelectedLiner(liner);
          setShowDetailModal(true);
        }
      }
    };

    window.addEventListener('open-product', handleOpenProduct as EventListener);
    return () => window.removeEventListener('open-product', handleOpenProduct as EventListener);
  }, []);
  return <>
      <section className="py-12 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <EditorialSectionHeader
          eyebrow="Volume V — Lining"
          title="Premium Pool Liners"
          description="A liner collection drawn for durability, depth of colour and long-lasting performance."
        />

            <ProductScrollRow className="mb-8">
              {getProductsByCategory('liner').map((liner, index) => <Card key={liner.name} className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer h-full" onClick={() => handleLinerClick(liner)}>
                        {/* Edge-to-edge image */}
                        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                          <img loading="lazy" decoding="async" src={liner.image} alt={liner.name} className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                              {liner.subcategory}
                            </span>
                          </div>
                        </div>

                        <CardContent className="p-4 sm:p-5 lg:p-7 space-y-4">
                          <div>
                            <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground line-clamp-1">
                              {liner.name}
                            </h3>
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {liner.description}
                            </p>
                          </div>

                          <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
                            <div className="flex items-baseline justify-between gap-4 py-2.5">
                              <dt className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Installed</dt>
                              <dd className="font-serif text-lg font-light text-foreground">${liner.price}/sqft</dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4 py-2.5">
                              <dt className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Material</dt>
                              <dd className="font-serif text-lg font-light text-foreground">${liner.originalPrice}/sheet</dd>
                            </div>
                          </dl>

                          <Button onClick={e => {
                      e.stopPropagation();
                      handleLinerClick(liner);
                    }} variant="default" className="w-full rounded-none text-[10px] uppercase tracking-[0.3em]" size="sm">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>)}
            </ProductScrollRow>
        </div>
      </section>
      
      {/* Liner Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLiner && <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl pr-8">{selectedLiner.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <img loading="lazy" decoding="async" src={selectedLiner.image} alt={selectedLiner.name} className="w-full h-48 sm:h-64 object-cover rounded-lg" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <Badge className={`${getTypeColor(selectedLiner.subcategory || 'Glass')} text-white text-xs sm:text-sm`}>
                    {selectedLiner.subcategory}
                  </Badge>
                  <p className="text-sm sm:text-base text-foreground/80">{selectedLiner.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal flex-shrink-0" />
                      <span className="text-lg sm:text-2xl font-bold text-foreground">
                        ${selectedLiner.price}/sqft installed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal flex-shrink-0" />
                      <span className="text-base sm:text-lg font-semibold text-foreground/80">
                        ${selectedLiner.originalPrice}/sheet material
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label className="text-xs sm:text-sm font-medium mb-2 block">Purchase Type</Label>
                      <RadioGroup value={unitType} onValueChange={(value: 'sqft' | 'sheet') => setUnitType(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sqft" id="sqft" />
                          <Label htmlFor="sqft" className="cursor-pointer text-xs sm:text-sm">
                            Per sqft (installed) - ${selectedLiner.price}/sqft
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sheet" id="sheet" />
                          <Label htmlFor="sheet" className="cursor-pointer text-xs sm:text-sm">
                            Per sheet (material) - ${selectedLiner.originalPrice}/sheet
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="quantity" className="text-xs sm:text-sm font-medium mb-2 block">
                        Quantity ({unitType === 'sqft' ? 'square feet' : 'sheets'})
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-sm sm:text-base"
                      />
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium">Total:</span>
                        <span className="text-lg sm:text-xl font-bold text-primary">
                          ${((unitType === 'sqft' ? selectedLiner.price : selectedLiner.originalPrice) * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {allowSelection && !selectedLinerProp && selectedLiner && <Button onClick={() => {
                  onLinerSelect?.(selectedLiner as Liner);
                  setShowDetailModal(false);
                }} variant="default" className="w-full sm:flex-1 text-sm rounded-none">
                        Select Liner
                      </Button>}
                    <Button onClick={handleAddToCart} variant="default" className="w-full sm:flex-1 text-sm rounded-none">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button onClick={() => handleRequestQuote(selectedLiner)} variant="gradient" className="w-full sm:flex-1 text-sm rounded-none">
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            </>}
        </DialogContent>
      </Dialog>

      <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} customProduct={selectedLiner ? {
      name: selectedLiner.name,
      price: selectedLiner.price,
      type: 'liner'
    } : undefined} />
    </>;
};
export default LinersSection;