
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Droplets, Palette, Shield, Star, DollarSign, ShoppingCart } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { poolLiners } from "@/data/poolData";

interface Liner {
  name: string;
  price: number;
  type: string;
  image?: string;
  description: string;
}

interface LinersSectionProps {
  onLinerSelect?: (liner: Liner) => void;
  selectedLiner?: string;
  allowSelection?: boolean;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'tile': return 'bg-gradient-to-r from-coral to-orange';
    case 'fiberglass': return 'bg-gradient-to-r from-primary to-teal';
    case 'vinyl': return 'bg-gradient-to-r from-secondary to-accent';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'tile': return <Star size={16} />;
    case 'fiberglass': return <Shield size={16} />;
    case 'vinyl': return <Droplets size={16} />;
    default: return <Palette size={16} />;
  }
};

const LinersSection = ({ onLinerSelect, selectedLiner: selectedLinerProp, allowSelection }: LinersSectionProps = {}) => {
  const [selectedLiner, setSelectedLiner] = useState<Liner | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToCart } = useShoppingCart();

  const handleLinerClick = (liner: Liner) => {
    setSelectedLiner(liner);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (liner: Liner) => {
    setSelectedLiner(liner);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const handleAddToCart = (liner: Liner) => {
    addToCart({
      id: `liner_${liner.name.replace(/\s+/g, '_')}_${Date.now()}`,
      name: liner.name,
      price: liner.price,
      category: 'liner',
      image: liner.image,
      extras: []
    });
  };

  return (
    <>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {poolLiners.map((liner, index) => (
              <Card 
                key={liner.name} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden cursor-pointer"
                onClick={() => handleLinerClick(liner)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getTypeColor(liner.type)} text-white capitalize font-medium px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(liner.type)}
                        {liner.type}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {liner.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Liner Preview */}
                  <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-muted">
                    <img 
                      src={liner.image} 
                      alt={liner.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      ${liner.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {liner.description}
                  </p>
                  
                  <Separator />
                  
                  {/* Action Button */}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestQuote(liner);
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
      
      {/* Liner Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedLiner && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedLiner.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedLiner.image} 
                    alt={selectedLiner.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <Badge className={`${getTypeColor(selectedLiner.type)} text-white`}>
                    {selectedLiner.type}
                  </Badge>
                  <p className="text-foreground/80">{selectedLiner.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      ${selectedLiner.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    {allowSelection && !selectedLinerProp && selectedLiner && (
                      <Button 
                        onClick={() => {
                          onLinerSelect?.(selectedLiner!);
                          setShowDetailModal(false);
                        }}
                        variant="default"
                        className="flex-1"
                      >
                        Select Liner
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleAddToCart(selectedLiner)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={() => handleRequestQuote(selectedLiner)}
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
        customProduct={selectedLiner ? {
          name: selectedLiner.name,
          price: selectedLiner.price,
          type: 'liner'
        } : undefined}
      />
    </>
  );
};

export default LinersSection;
