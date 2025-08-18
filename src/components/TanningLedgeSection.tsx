import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sun, DollarSign, ShoppingCart, Ruler, Waves } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { tanningLedges } from "@/data/poolData";

interface TanningLedge {
  name: string;
  price: number;
  image: string;
  description: string;
  dimensions: string;
  depth: string;
  features: string[];
}

const TanningLedgeSection = () => {
  const [selectedLedge, setSelectedLedge] = useState<TanningLedge | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToCart } = useShoppingCart();

  // Listen for external modal open events
  React.useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      const { ledge } = event.detail;
      setSelectedLedge(ledge);
      setShowDetailModal(true);
    };

    window.addEventListener('openTanningLedgeModal', handleOpenModal as EventListener);
    return () => {
      window.removeEventListener('openTanningLedgeModal', handleOpenModal as EventListener);
    };
  }, []);

  const handleLedgeClick = (ledge: TanningLedge) => {
    setSelectedLedge(ledge);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (ledge: TanningLedge) => {
    setSelectedLedge(ledge);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const handleAddToCart = (ledge: TanningLedge) => {
    addToCart({
      id: `tanning_ledge_${ledge.name.replace(/\s+/g, '_')}_${Date.now()}`,
      name: `${ledge.name} Tanning Ledge`,
      price: ledge.price,
      category: 'tanning_ledge',
      image: ledge.image,
      extras: []
    });
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-coral/5" data-tanning-ledge-section>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-coral via-orange to-amber-500">
              Tanning Ledges
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Add the perfect relaxation spot to your pool. Our tanning ledges provide the ideal shallow area for lounging and soaking up the sun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tanningLedges.map((ledge, index) => (
              <Card 
                key={ledge.name} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-coral/30 overflow-hidden cursor-pointer"
                onClick={() => handleLedgeClick(ledge)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-gradient-to-r from-coral to-orange text-white font-medium px-3 py-1">
                      <span className="flex items-center gap-1">
                        <Sun size={16} />
                        Luxury
                      </span>
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-coral transition-colors">
                    {ledge.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Ledge Preview */}
                  <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-muted">
                    <img 
                      src={ledge.image} 
                      alt={ledge.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-coral" />
                    <span className="text-2xl font-bold text-foreground">
                      ${ledge.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Specifications */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">{ledge.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depth:</span>
                      <span className="font-medium">{ledge.depth}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ledge.description}
                  </p>
                  
                  {/* Action Button */}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestQuote(ledge);
                    }}
                    variant="gradient"
                    className="w-full hover:scale-105 transition-all duration-300 bg-gradient-to-r from-coral to-orange"
                    size="sm"
                  >
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Ledge Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedLedge && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedLedge.name} Tanning Ledge</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedLedge.image} 
                    alt={selectedLedge.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <Badge className="bg-gradient-to-r from-coral to-orange text-white">
                    Tanning Ledge
                  </Badge>
                  <p className="text-foreground/80">{selectedLedge.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-coral" />
                      <span className="font-medium">Dimensions: {selectedLedge.dimensions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Waves className="h-4 w-4 text-coral" />
                      <span className="font-medium">Depth: {selectedLedge.depth}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Features:</h4>
                    <ul className="space-y-1">
                      {selectedLedge.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-coral" />
                    <span className="text-2xl font-bold text-foreground">
                      ${selectedLedge.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleAddToCart(selectedLedge)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={() => handleRequestQuote(selectedLedge)}
                      variant="gradient"
                      className="flex-1 bg-gradient-to-r from-coral to-orange"
                    >
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedLedge ? {
          name: `${selectedLedge.name} Tanning Ledge`,
          price: selectedLedge.price,
          type: 'tanning_ledge'
        } : undefined}
      />
    </>
  );
};

export default TanningLedgeSection;