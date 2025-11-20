import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, Award, Eye, ShoppingCart } from "lucide-react";
import { useShoppingCart } from "./ShoppingCartProvider";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { getProductsByCategory, getProductsBySubcategory, Product } from "@/data/consolidatedProducts";

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
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Premium Pool Finishes
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Transform your pool with Latham's premium Crystite finishes. Choose from stunning colors and advanced materials designed for beauty, durability, and easy maintenance.
          </p>
        </div>

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
            <div className="flex gap-4 overflow-x-auto pb-4">
              {filteredFinishes.map((finish, index) => (
                <Card 
                  key={finish.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur-sm border border-border/50 flex-shrink-0 w-72"
                  onClick={() => setSelectedFinish(finish)}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={finish.image} 
                      alt={finish.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {finish.isPopular && (
                      <Badge className="absolute top-2 right-2 bg-coral text-white">
                        Popular
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">{finish.collection}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{finish.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {finish.subcategory}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                      {finish.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        +${finish.price.toLocaleString()}
                      </span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Detail Modal */}
        {selectedFinish && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedFinish(null)}>
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <img 
                    src={selectedFinish.image} 
                    alt={selectedFinish.name}
                    className="w-full h-64 object-cover rounded-lg"
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
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
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
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button 
                        onClick={() => handleRequestQuote(selectedFinish)}
                        variant="gradient"
                        className="flex-1"
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
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-coral/5 border border-primary/10">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Crystite Technology</h3>
              <p className="text-xs text-muted-foreground">
                Crystal-infused finishes for superior durability
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-coral/5 to-teal/5 border border-coral/10">
            <div className="w-10 h-10 bg-coral/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-coral" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">25-Year Warranty</h3>
              <p className="text-xs text-muted-foreground">
                Industry-leading coverage for peace of mind
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-teal/5 to-primary/5 border border-teal/10">
            <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
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