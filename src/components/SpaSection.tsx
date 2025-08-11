import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, DollarSign, Ruler, Star, Award, Clock, ShoppingCart } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import SpaProductCard from "./SpaProductCard";
import { spas } from "./PoolCatalog";
import { useShoppingCart } from "./ShoppingCart";

interface Spa {
  model: string;
  price: number;
  image?: string;
  category: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  spilloverFeature?: boolean;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
}

interface SpaExtras {
  finish: string;
  liner: string;
  tiles: string;
  heater: boolean;
  jets: boolean;
}

const SpaSection = () => {
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToCart } = useShoppingCart();

  const handleViewDetails = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (spa: Spa, extras?: SpaExtras) => {
    setSelectedSpa(spa);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
      case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
      default: return 'bg-gradient-to-r from-primary to-teal';
    }
  };

  const handleAddToCart = (spa: Spa) => {
    addToCart({
      id: `spa_${spa.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: `${spa.model} Spa`,
      price: spa.price,
      category: 'spa',
      image: spa.image,
      extras: []
    });
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal to-blue-500">
              Luxury Spa Collection
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Complete your pool experience with our premium spa collection. Designed for ultimate relaxation and therapeutic benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spas.map((spa) => (
              <SpaProductCard
                key={spa.model}
                spa={spa}
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Spa Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedSpa && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedSpa.model} Spa</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {selectedSpa.image ? (
                    <img 
                      src={selectedSpa.image} 
                      alt={selectedSpa.model}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-teal/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Waves size={48} className="text-primary/60 mx-auto mb-2" />
                        <p className="text-lg text-muted-foreground">{selectedSpa.model}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <Badge className={`${getCategoryColor(selectedSpa.category)} text-white capitalize`}>
                    {selectedSpa.category} Spa
                  </Badge>
                  
                  {selectedSpa.dimensions && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-primary" />
                        <span className="font-medium">Dimensions: {selectedSpa.dimensions}</span>
                      </div>
                      {selectedSpa.depth && (
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4 text-primary" />
                          <span className="font-medium">Depth: {selectedSpa.depth}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSpa.installationTimeWeeks && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Installation: {selectedSpa.installationTimeWeeks} weeks</span>
                    </div>
                  )}

                  {selectedSpa.warrantyYears && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">
                        Warranty: {selectedSpa.warrantyYears === "Lifetime" || selectedSpa.warrantyYears === "Life" ? "LIFETIME WARRANTY" : `${selectedSpa.warrantyYears} years`}
                      </span>
                    </div>
                  )}
                  
                  {selectedSpa.features && selectedSpa.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Features:</h4>
                      <ul className="space-y-1">
                        {selectedSpa.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedSpa.spilloverFeature && (
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        ✨ Includes spillover feature for seamless pool integration
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      ${selectedSpa.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleAddToCart(selectedSpa)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={() => handleRequestQuote(selectedSpa)}
                      variant="gradient"
                      className="flex-1"
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
        customProduct={selectedSpa ? {
          name: `${selectedSpa.model} Spa`,
          price: selectedSpa.price,
          type: 'spa'
        } : undefined}
      />
    </>
  );
};

export default SpaSection;