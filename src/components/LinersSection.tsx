import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Droplets, Palette, Shield, Star, DollarSign, ShoppingCart } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { getProductsByCategory, Product } from "@/data/consolidatedProducts";
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
  const {
    addToCart
  } = useShoppingCart();
  const handleLinerClick = (liner: Product) => {
    setSelectedLiner(liner);
    setShowDetailModal(true);
  };
  const handleRequestQuote = (liner: Product) => {
    setSelectedLiner(liner);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };
  const handleAddToCart = (liner: any) => {
    addToCart({
      id: `liner_${liner.name.replace(/\s+/g, '_')}_${Date.now()}`,
      name: liner.name,
      price: liner.price,
      category: 'liner',
      image: liner.image,
      extras: []
    });
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
      <section id="liners" className="py-20 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Pool Liners
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Transform your pool with our premium liner collection. Each liner is designed for durability, beauty, and long-lasting performance.
            </p>
          </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {getProductsByCategory('liner').slice(0, 3).map((liner, index) => <CarouselItem key={liner.name} className="pl-1 basis-1/3 md:basis-1/2 lg:basis-1/3">
                      <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden cursor-pointer h-full" onClick={() => handleLinerClick(liner)}>
                        {/* Full Background Image */}
                        <div className="relative h-64 overflow-hidden">
                          <img src={liner.image} alt={liner.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                            <div className="absolute top-4 left-4">
                              <Badge className={`${getTypeColor(liner.subcategory || 'Glass')} text-white capitalize font-medium px-3 py-1`}>
                                <span className="flex items-center gap-1">
                                  {getTypeIcon(liner.subcategory || 'Glass')}
                                  {liner.subcategory}
                                </span>
                              </Badge>
                            </div>
                            <div className="absolute bottom-4 left-4 text-white">
                              <CardTitle className="text-lg font-semibold mb-2">
                                {liner.name}
                              </CardTitle>
                              <div className="space-y-1 mb-2">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-teal" />
                                  <span className="text-lg font-bold">
                                    ${liner.price}/sqft installed
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-teal" />
                                  <span className="text-sm font-medium text-white/90">
                                    ${liner.originalPrice}/sheet material only
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-white/80 line-clamp-2">
                                {liner.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="space-y-4 pt-4">
                          {/* Action Button */}
                          <Button onClick={e => {
                      e.stopPropagation();
                      handleLinerClick(liner);
                    }} variant="default" className="w-full hover:scale-105 transition-all duration-300" size="sm">
                            View Detail
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>
        </div>
      </section>
      
      {/* Liner Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedLiner && <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedLiner.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img src={selectedLiner.image} alt={selectedLiner.name} className="w-full h-64 object-cover rounded-lg" />
                </div>
                <div className="space-y-4">
                  <Badge className={`${getTypeColor(selectedLiner.subcategory || 'Glass')} text-white`}>
                    {selectedLiner.subcategory}
                  </Badge>
                  <p className="text-foreground/80">{selectedLiner.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-teal" />
                      <span className="text-2xl font-bold text-foreground">
                        ${selectedLiner.price}/sqft installed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-teal" />
                      <span className="text-lg font-semibold text-foreground/80">
                        ${selectedLiner.originalPrice}/sheet material only
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {allowSelection && !selectedLinerProp && selectedLiner && <Button onClick={() => {
                  onLinerSelect?.(selectedLiner as Liner);
                  setShowDetailModal(false);
                }} variant="default" className="flex-1">
                        Select Liner
                      </Button>}
                    <Button onClick={() => handleRequestQuote(selectedLiner)} variant="gradient" className="flex-1">
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