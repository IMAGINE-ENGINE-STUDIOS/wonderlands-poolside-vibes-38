import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Square, Palette, Shield, Star, DollarSign, ShoppingCart, Calculator } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { supabase } from "@/integrations/supabase/client";

interface Paver {
  id: string;
  name: string;
  collection: string;
  description?: string;
  base_price: number;
  image_url?: string;
  category: string;
  colors: Array<{
    name: string;
    hex: string;
    priceModifier: number;
  }>;
}

interface PaversSectionProps {
  onPaverSelect?: (paver: Paver) => void;
  selectedPaver?: string;
  allowSelection?: boolean;
}

const getCollectionColor = (collection: string) => {
  switch (collection.toLowerCase()) {
    case 'appian collection': return 'bg-gradient-to-r from-coral to-orange';
    case 'travertine collection': return 'bg-gradient-to-r from-primary to-teal';
    case 'natural stone collection': return 'bg-gradient-to-r from-secondary to-accent';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getCollectionIcon = (collection: string) => {
  switch (collection.toLowerCase()) {
    case 'appian collection': return <Square size={16} />;
    case 'travertine collection': return <Shield size={16} />;
    case 'natural stone collection': return <Star size={16} />;
    default: return <Palette size={16} />;
  }
};

const PaversSection = ({ onPaverSelect, selectedPaver: selectedPaverProp, allowSelection }: PaversSectionProps = {}) => {
  const [pavers, setPavers] = useState<Paver[]>([]);
  const [selectedPaver, setSelectedPaver] = useState<Paver | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useShoppingCart();

  useEffect(() => {
    fetchPavers();
  }, []);

  const fetchPavers = async () => {
    try {
      const { data, error } = await supabase
        .from('pavers')
        .select('*')
        .eq('is_active', true)
        .order('collection', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      const typedPavers = (data || []).map(paver => ({
        ...paver,
        colors: Array.isArray(paver.colors) ? paver.colors as Array<{name: string; hex: string; priceModifier: number}> : []
      }));
      setPavers(typedPavers);
    } catch (error) {
      console.error('Error fetching pavers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaverClick = (paver: Paver) => {
    setSelectedPaver(paver);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (paver: Paver) => {
    setSelectedPaver(paver);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const handleAddToCart = (paver: Paver) => {
    addToCart({
      id: `paver_${paver.name.replace(/\s+/g, '_')}_${Date.now()}`,
      name: paver.name,
      price: paver.base_price * 15, // $15 per sq ft pricing
      category: 'paver',
      image: paver.image_url,
      extras: []
    });
  };

  if (loading) {
    return (
      <div className="py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pavers...</p>
        </div>
      </div>
    );
  }

  const groupedPavers = pavers.reduce((acc, paver) => {
    if (!acc[paver.collection]) {
      acc[paver.collection] = [];
    }
    acc[paver.collection].push(paver);
    return acc;
  }, {} as Record<string, Paver[]>);

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Pool Pavers
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Complete your pool design with our premium paver collections. Priced at $15 per square foot installed.
            </p>
            <div className="mt-4 p-4 bg-primary/10 rounded-lg inline-block">
              <p className="text-sm text-primary font-semibold">
                All pools include 3 perimeter pavers around the pool area
              </p>
            </div>
          </div>

          {Object.entries(groupedPavers).map(([collection, collectionPavers]) => (
            <div key={collection} className="mb-16">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{collection}</h3>
                <Separator className="w-24 h-1 bg-gradient-to-r from-primary to-teal" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collectionPavers.map((paver) => (
                  <Card 
                    key={paver.id} 
                    className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden cursor-pointer"
                    onClick={() => handlePaverClick(paver)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${getCollectionColor(paver.collection)} text-white capitalize font-medium px-3 py-1`}>
                          <span className="flex items-center gap-1">
                            {getCollectionIcon(paver.collection)}
                            Premium
                          </span>
                        </Badge>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {paver.name}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Paver Preview */}
                      <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-muted">
                        <img 
                          src={paver.image_url} 
                          alt={paver.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-teal" />
                        <span className="text-2xl font-bold text-foreground">
                          $15<span className="text-sm font-normal">/sq ft</span>
                        </span>
                      </div>
                      
                      {/* Collection Badge */}
                      <Badge variant="secondary" className="text-xs">
                        {paver.collection}
                      </Badge>
                      
                      {/* Description */}
                      {paver.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {paver.description}
                        </p>
                      )}

                      {/* Color Options Preview */}
                      {paver.colors && paver.colors.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold">Available Colors:</p>
                          <div className="flex gap-1 flex-wrap">
                            {paver.colors.slice(0, 3).map((color) => (
                              <div 
                                key={color.name}
                                className="w-6 h-6 rounded border-2 border-white shadow-sm"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                            {paver.colors.length > 3 && (
                              <div className="w-6 h-6 rounded border-2 border-border bg-muted flex items-center justify-center">
                                <span className="text-xs">+{paver.colors.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Separator />
                      
                      {/* Action Button */}
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestQuote(paver);
                        }}
                        variant="gradient"
                        className="w-full hover:scale-105 transition-all duration-300"
                        size="sm"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Get Quote
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Paver Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedPaver && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPaver.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedPaver.image_url} 
                    alt={selectedPaver.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <Badge className={`${getCollectionColor(selectedPaver.collection)} text-white`}>
                    {selectedPaver.collection}
                  </Badge>
                  {selectedPaver.description && (
                    <p className="text-foreground/80">{selectedPaver.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      $15<span className="text-sm font-normal">/sq ft installed</span>
                    </span>
                  </div>

                  {/* Color Options */}
                  {selectedPaver.colors && selectedPaver.colors.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Available Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedPaver.colors.map((color) => (
                          <div key={color.name} className="flex items-center gap-3 p-2 border rounded">
                            <div 
                              className="w-8 h-8 rounded border-2 border-white shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div>
                              <p className="text-sm font-medium">{color.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {color.priceModifier !== 1 ? `${(color.priceModifier * 100).toFixed(0)}% of base price` : 'Standard pricing'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    {allowSelection && !selectedPaverProp && selectedPaver && (
                      <Button 
                        onClick={() => {
                          onPaverSelect?.(selectedPaver!);
                          setShowDetailModal(false);
                        }}
                        variant="default"
                        className="flex-1"
                      >
                        Select Paver
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleAddToCart(selectedPaver)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={() => handleRequestQuote(selectedPaver)}
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
        customProduct={selectedPaver ? {
          name: selectedPaver.name,
          price: selectedPaver.base_price * 15,
          type: 'paver'
        } : undefined}
      />
    </>
  );
};

export default PaversSection;