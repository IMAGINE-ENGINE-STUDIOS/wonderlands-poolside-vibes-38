import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Waves, DollarSign, ShoppingCart, Star, Ruler, Thermometer } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { spas } from "./PoolCatalog";

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

const SpaSection = () => {
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToCart } = useShoppingCart();

  const handleSpaClick = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowDetailModal(false);
    setShowQuoteModal(true);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
      case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
      default: return 'bg-gradient-to-r from-primary to-teal';
    }
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
            {spas.map((spa, index) => (
              <Card 
                key={spa.model} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden cursor-pointer"
                onClick={() => handleSpaClick(spa)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getCategoryColor(spa.category)} text-white font-medium px-3 py-1 capitalize`}>
                      <span className="flex items-center gap-1">
                        <Waves size={16} />
                        {spa.category}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {spa.model}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Spa Preview */}
                  <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-muted bg-gradient-to-br from-primary/20 to-teal/20">
                    {spa.image ? (
                      <img 
                        src={spa.image} 
                        alt={spa.model}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Waves size={32} className="text-primary/60 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">{spa.model}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      ${spa.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Specifications */}
                  {spa.dimensions && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{spa.dimensions}</span>
                      </div>
                      {spa.depth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Depth:</span>
                          <span className="font-medium">{spa.depth}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Key Features */}
                  {spa.features && spa.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Features:</h4>
                      <ul className="space-y-1">
                        {spa.features.slice(0, 2).map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestQuote(spa);
                    }}
                    variant="gradient"
                    className="w-full hover:scale-105 transition-all duration-300"
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