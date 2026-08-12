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
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => handlePaverClick(paver)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img loading="lazy" decoding="async"
                  src={paver.image}
                  alt={paver.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-primary text-white">
                  Premium
                </Badge>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill="#fbbf24" className="text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {paver.name}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-3">
                  {paver.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-primary font-bold">
                    ${paver.basePrice}/sq ft base
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Appian Collection
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
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
                
                <Button className="rounded-none" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRequestQuote(paver);
                  }}
                  className="w-full bg-gradient-to-r from-primary to-teal hover:from-primary/90 hover:to-teal/90"
                  size="sm"
                >
                  <Calculator className="h-4 w-4 mr-2" />
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
                  <Button className="rounded-none" 
                    onClick={() => handleRequestQuote(selectedPaver)}
                    className="flex-1 bg-gradient-to-r from-primary to-teal hover:from-primary/90 hover:to-teal/90"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Get Custom Quote
                  </Button>
                  <Button className="rounded-none" 
                    variant="outline" 
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1"
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