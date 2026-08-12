import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Thermometer, Shield, Zap, ShoppingCart, Sun } from "lucide-react";
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
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground mb-3">Volume IV — Water</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light tracking-tight text-foreground mb-6">
              Premium Spas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Indulge in the luxury and therapeutic benefits of our premium spas. Designed for relaxation and rejuvenation, our spas offer the ultimate hydrotherapy experience.
            </p>
          </div>

          <ProductScrollRow className="mb-8">
            {spas.map((spa, index) => (
              <div
                key={spa.model}
                className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer"
                onClick={() => handleSpaClick(spa)}
              >
                <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                  <img loading="lazy" decoding="async"
                    src={spa.image}
                    alt={spa.model}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                      {spa.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <h3 className="font-serif text-2xl font-light leading-[1.05] tracking-tight text-foreground">
                    {spa.model}
                  </h3>

                  <div className="flex items-end justify-between gap-4 border-t border-border/60 pt-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
                      <p className="font-serif text-2xl font-light text-foreground">
                        ${spa.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {spa.description}
                  </p>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(spa);
                    }}
                    className="w-full rounded-none bg-foreground text-background text-[10px] uppercase tracking-[0.3em] hover:bg-foreground/90"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
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
                    className="w-full h-64 object-cover rounded-none"
                  />
                </div>
                <div className="space-y-4">
                  <span className="inline-block bg-background/85 border border-border/70 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground">
                    {selectedSpa.category}
                  </span>
                  <p className="text-foreground/80">{selectedSpa.description}</p>
                  
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
                    <span className="font-serif text-2xl font-light text-foreground">
                      ${selectedSpa.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span>Heater Included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Carbon Fiber Shell</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedSpa.jets} Jets</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <span>Salt Water System</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {allowSelection && !selectedSpaProp && selectedSpa && (
                      <Button 
                        onClick={() => {
                          onSpaSelect?.(selectedSpa!);
                          setShowDetailModal(false);
                        }}
                        variant="default"
                        className="flex-1 rounded-none"
                      >
                        Select Spa
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleAddToCart(selectedSpa)}
                      variant="outline"
                      className="flex-1 rounded-none"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={() => handleRequestQuote(selectedSpa)}
                      variant="gradient"
                      className="flex-1 rounded-none"
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
