import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, Award, Eye, ShoppingCart } from "lucide-react";
import { useShoppingCart } from "./ShoppingCartProvider";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { getProductsByCategory, getProductsBySubcategory, Product } from "@/data/consolidatedProducts";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";
import PebbleTecConcreteFinishes from "./PebbleTecConcreteFinishes";

const PoolFinishesSection = () => {
  const [selectedFinish, setSelectedFinish] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { addToCart } = useShoppingCart();

  const poolFinishes = getProductsByCategory('finish');

  const handleAddToCart = (finish: Product) => {
    addToCart({
      id: `finish_${finish.id}_${Date.now()}`,
      name: finish.name,
      price: finish.price,
      category: 'finish',
      image: finish.image,
      extras: []
    });
  };

  const handleRequestQuote = (finish: Product) => {
    setSelectedFinish(finish);
    setShowQuoteModal(true);
  };

  // Listen for search events to open specific finishes
  React.useEffect(() => {
    const handleOpenProduct = (event: CustomEvent) => {
      const { type, id, name } = event.detail;
      if (type === 'finish' || type === 'finishes') {
        const finish = poolFinishes.find(f => 
          f.id === id || 
          f.name.toLowerCase() === name?.toLowerCase() ||
          f.name.toLowerCase().includes(name?.toLowerCase())
        );
        if (finish) {
          setSelectedFinish(finish);
        }
      }
    };

    window.addEventListener('open-product', handleOpenProduct as EventListener);
    return () => window.removeEventListener('open-product', handleOpenProduct as EventListener);
  }, [poolFinishes]);

  const filteredFinishes = activeCategory === "all" 
    ? poolFinishes 
    : getProductsBySubcategory('finish', activeCategory);

  const categories = [
    { value: "all", label: "All Finishes", icon: Palette },
    { value: "Deep & Dramatic", label: "Deep & Dramatic", icon: Eye },
    { value: "Rich & Vibrant", label: "Rich & Vibrant", icon: Sparkles },
    { value: "Light & Tranquil", label: "Light & Tranquil", icon: Award }
  ];

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto">
        <EditorialSectionHeader
          eyebrow="Volume IV — Surface"
          title="Premium Pool Finishes"
          description="Latham Crystite finishes — colours and advanced materials engineered for beauty, durability and easy maintenance."
        />

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-12">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeCategory}>
            <ProductScrollRow className="mb-8">
              {filteredFinishes.map((finish, index) => (
                <Card 
                  key={finish.id} 
                  className="rounded-none border border-border/70 overflow-hidden group transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer h-full"
                  onClick={() => setSelectedFinish(finish)}
                >
                  <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden group/image">
                    <img loading="lazy" decoding="async" 
                      src={finish.image} 
                      alt={finish.name}
                      className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover/image:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    {finish.isPopular && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                          Popular
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <p className="text-[9px] uppercase tracking-[0.4em] text-white/80">{finish.collection}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5">
                    <div>
                      <p className="mb-2 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                        {finish.subcategory}
                      </p>
                      <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                        {finish.name}
                      </h3>
                      <p className="mt-3 text-sm text-foreground/70 line-clamp-2">
                        {finish.description}
                      </p>
                      <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Upgrade</p>
                          <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                            +${finish.price.toLocaleString()}
                          </p>
                        </div>
                        <Button className="rounded-none text-[10px] uppercase tracking-[0.3em]" variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ProductScrollRow>
          </TabsContent>
        </Tabs>

        {/* Pebble Tec® — concrete (gunite) shells only */}
        <PebbleTecConcreteFinishes />


        {/* Enhanced Detail Modal */}
        {selectedFinish && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedFinish(null)}>
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <img loading="lazy" decoding="async" 
                    src={selectedFinish.image} 
                    alt={selectedFinish.name}
                    className="w-full h-64 object-cover rounded-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="secondary">{selectedFinish.collection}</Badge>
                    <Badge variant="outline">{selectedFinish.subcategory}</Badge>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedFinish.name}</h3>
                    <p className="text-foreground/80">{selectedFinish.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {selectedFinish.features?.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-none"></div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">
                        +${selectedFinish.price.toLocaleString()}
                      </span>
                      <Badge variant="secondary">Premium Finish</Badge>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleAddToCart(selectedFinish)}
                        variant="outline"
                        className="flex-1 rounded-none"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button 
                        onClick={() => handleRequestQuote(selectedFinish)}
                        variant="gradient"
                        className="flex-1 rounded-none"
                      >
                        Get Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Pool Finish Technology Section - Compact */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-none bg-gradient-to-br from-primary/5 to-coral/5 border border-primary/10">
            <div className="w-10 h-10 bg-primary/20 rounded-none flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Crystite Technology</h3>
              <p className="text-xs text-muted-foreground">
                Crystal-infused finishes for superior durability
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-none bg-gradient-to-br from-coral/5 to-teal/5 border border-coral/10">
            <div className="w-10 h-10 bg-coral/20 rounded-none flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-coral" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">25-Year Warranty</h3>
              <p className="text-xs text-muted-foreground">
                Industry-leading coverage for peace of mind
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-none bg-gradient-to-br from-teal/5 to-primary/5 border border-teal/10">
            <div className="w-10 h-10 bg-teal/20 rounded-none flex items-center justify-center flex-shrink-0">
              <Eye className="h-5 w-5 text-teal" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Color Preview</h3>
              <p className="text-xs text-muted-foreground">
                Advanced color visualization technology
              </p>
            </div>
          </div>
        </div>
      </div>

      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedFinish ? {
          name: selectedFinish.name,
          price: selectedFinish.price,
          type: 'finish'
        } : undefined}
      />
    </section>
  );
};

export default PoolFinishesSection;