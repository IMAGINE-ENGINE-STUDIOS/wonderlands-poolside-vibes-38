import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Calculator } from "lucide-react";
import { paverTypes } from "@/data/paverData";
import SurveyQuoteTool from "./SurveyQuoteTool";

const AppianPaversSection = () => {
  const [selectedPaver, setSelectedPaver] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const appianPavers = paverTypes.filter(paver => paver.id.includes('appian'));

  const handlePaverClick = (paver: any) => {
    setSelectedPaver(paver);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (paver: any) => {
    setSelectedPaver(paver);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
            Appian Collection Pavers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Premium paver collection featuring authentic textures and rich colors. 
            Priced at $20 per square foot for custom installations.
          </p>
        </div>

        {/* Pavers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appianPavers.map((paver) => (
            <Card 
              key={paver.id} 
              className="rounded-none border border-border/70 overflow-hidden group transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer"
              onClick={() => handlePaverClick(paver)}
            >
              <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden group/image">
                <img loading="lazy" decoding="async"
                  src={paver.image}
                  alt={paver.name}
                  className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover/image:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                    Premium
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5">
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                    Appian Collection
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                    {paver.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {paver.description}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Base Price</p>
                      <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">${paver.basePrice}/sq ft</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Available Colors</p>
                  <div className="flex gap-1 flex-wrap">
                    {paver.colors.slice(0, 3).map((color) => (
                      <div 
                        key={color.name}
                        className="w-6 h-6 border border-border"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                    {paver.colors.length > 3 && (
                      <div className="w-6 h-6 border border-border bg-muted flex items-center justify-center">
                        <span className="text-[9px]">+{paver.colors.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRequestQuote(paver);
                  }}
                  className="w-full rounded-none text-[10px] uppercase tracking-[0.3em] bg-foreground text-background hover:bg-foreground/90"
                  size="sm"
                >
                  Get Quote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPaver?.name}
                <Badge className="bg-primary text-white">Appian Collection</Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedPaver?.description}
              </DialogDescription>
            </DialogHeader>

            {selectedPaver && (
              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img loading="lazy" decoding="async"
                    src={selectedPaver.image}
                    alt={selectedPaver.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Pricing</h4>
                    <p className="text-sm text-muted-foreground mb-1">Base Price: ${selectedPaver.basePrice}/sq ft</p>
                    <p className="text-sm text-muted-foreground">Custom pricing: $20/sq ft installed</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <Badge variant="outline" className="capitalize">{selectedPaver.category}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Available Colors</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPaver.colors.map((color: any) => (
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

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleRequestQuote(selectedPaver)}
                    className="flex-1 bg-gradient-to-r from-primary to-teal hover:from-primary/90 hover:to-teal/90 rounded-none"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Get Custom Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 rounded-none"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quote Tool */}
        {showQuoteModal && selectedPaver && (
          <SurveyQuoteTool 
            isOpen={showQuoteModal}
            onClose={() => setShowQuoteModal(false)}
            pool={{
              model: selectedPaver.name,
              price: selectedPaver.basePrice * 20, // Using $20/sq ft pricing
              category: 'premium' as const
            }}
          />
        )}
      </div>
    </section>
  );
};

export default AppianPaversSection;