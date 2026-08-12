import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Thermometer, Shield, Zap, DollarSign, ShoppingCart, Sun } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import { useShoppingCart } from "./ShoppingCartProvider";

interface Spa {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  jets?: number;
  description?: string;
  heater?: boolean;
  saltSystem?: boolean;
  carbonFiber?: boolean;
}

const spas = [
  {
    model: "Mystic",
    price: 24000,
    category: 'premium' as const,
    image: "/lovable-uploads/09999795-2565-4094-8391-0511c1590998.png",
    dimensions: "7' x 7' x 34\"",
    jets: 40,
    description: "Experience the ultimate relaxation with the Mystic spa. Designed for comfort and hydrotherapy, it's your personal oasis.",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  {
    model: "Serenity",
    price: 26000,
    category: 'deluxe' as const,
    image: "/lovable-uploads/41959951-1a93-4941-a5f9-53095e959961.png",
    dimensions: "8' x 8' x 36\"",
    jets: 55,
    description: "Indulge in the Serenity spa, where luxury meets tranquility. Advanced features and spacious design for the discerning spa enthusiast.",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  {
    model: "Tranquil",
    price: 26000,
    category: 'standard' as const,
    image: "/lovable-uploads/69999199-7999-4929-8999-9999c9c9c999.png",
    dimensions: "9' x 9' x 38\"",
    jets: 70,
    description: "Find your peace in the Tranquil spa, a sanctuary of relaxation. Robust construction and comprehensive features for lasting enjoyment.",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  {
    model: "Oasis",
    price: 28000,
    category: 'premium' as const,
    image: "/lovable-uploads/99999999-9999-4999-8999-99c9c9999999.png",
    dimensions: "10' x 10' x 40\"",
    jets: 85,
    description: "Transform your backyard into an Oasis with this top-of-the-line spa. Unparalleled luxury and advanced technology for the ultimate spa experience.",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  }
];

interface SpaSectionProps {
  onSpaSelect?: (spa: Spa) => void;
  selectedSpa?: string;
  allowSelection?: boolean;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
    case 'compact': return 'bg-gradient-to-r from-teal to-primary';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const SpaSection = ({ onSpaSelect, selectedSpa: selectedSpaProp, allowSelection }: SpaSectionProps = {}) => {
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
      name: spa.model,
      price: spa.price,
      category: 'spa',
      image: spa.image,
      extras: []
    });
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Spas
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Indulge in the luxury and therapeutic benefits of our premium spas. Designed for relaxation and rejuvenation, our spas offer the ultimate hydrotherapy experience.
            </p>
          </div>

          <ProductScrollRow className="mb-8">
            {spas.map((spa, index) => (
              <Card 
                key={spa.model} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden cursor-pointer"
                onClick={() => handleSpaClick(spa)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getCategoryColor(spa.category)} text-white capitalize font-medium px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        <Sparkles size={16} />
                        {spa.category}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Sparkles key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {spa.model}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Spa Preview */}
                  <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-muted">
                    <img loading="lazy" decoding="async" 
                      src={spa.image} 
                      alt={spa.model}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      ${spa.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {spa.description}
                  </p>
                  
                  <Separator />
                  
                  {/* Action Button */}
                  <Button className="rounded-none" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(spa);
                    }}
                    variant="default"
                    className="w-full hover:scale-105 transition-all duration-300"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductScrollRow>
        </div>
      </section>
      
      {/* Spa Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedSpa && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedSpa.model}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img loading="lazy" decoding="async" 
                    src={selectedSpa.image} 
                    alt={selectedSpa.model}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <Badge className={`${getCategoryColor(selectedSpa.category)} text-white`}>
                    {selectedSpa.category}
                  </Badge>
                  <p className="text-foreground/80">{selectedSpa.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      ${selectedSpa.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span>Heater Included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Carbon Fiber Shell</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{selectedSpa.jets} Jets</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span>Salt Water System</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {allowSelection && !selectedSpaProp && selectedSpa && (
                      <Button className="rounded-none" 
                        onClick={() => {
                          onSpaSelect?.(selectedSpa!);
                          setShowDetailModal(false);
                        }}
                        variant="default"
                        className="flex-1"
                      >
                        Select Spa
                      </Button>
                    )}
                    <Button className="rounded-none" 
                      onClick={() => handleAddToCart(selectedSpa)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button className="rounded-none" 
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
          name: selectedSpa.model,
          price: selectedSpa.price,
          type: 'spa'
        } : undefined}
      />
    </>
  );
};

export default SpaSection;
