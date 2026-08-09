import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { artificialGrassOptions, PRICE_PER_SQFT, type ArtificialGrassOption } from "@/data/artificialGrassData";
import SurveyQuoteTool from "./SurveyQuoteTool";

const ArtificialGrassSection = () => {
  const [selectedGrass, setSelectedGrass] = useState<ArtificialGrassOption | null>(null);
  const [sqft, setSqft] = useState<number>(100);
  const [showInstantQuote, setShowInstantQuote] = useState(false);
  const [showFullQuote, setShowFullQuote] = useState(false);

  const handleOpenInstantQuote = (grass: ArtificialGrassOption) => {
    setSelectedGrass(grass);
    setSqft(100);
    setShowInstantQuote(true);
  };

  const handleRequestFullQuote = () => {
    setShowInstantQuote(false);
    setShowFullQuote(true);
  };

  const total = sqft * PRICE_PER_SQFT;

  return (
    <>
      <section className="py-12 bg-gradient-to-br from-green-50/30 via-emerald-50/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Artificial Grass
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Premium artificial grass options for your backyard — low maintenance, year-round green at ${PRICE_PER_SQFT}/sq ft
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {artificialGrassOptions.map((grass) => (
              <Card key={grass.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={grass.image}
                    alt={`${grass.name} artificial grass`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-1">{grass.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">${PRICE_PER_SQFT}/sq ft</p>
                  <Button
                    onClick={() => handleOpenInstantQuote(grass)}
                    className="w-full"
                    size="sm"
                  >
                    Instant Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instant Quote Modal */}
      <Dialog open={showInstantQuote} onOpenChange={setShowInstantQuote}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Instant Quote — {selectedGrass?.name}</DialogTitle>
          </DialogHeader>
          {selectedGrass && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img loading="lazy" decoding="async"
                  src={selectedGrass.image}
                  alt={selectedGrass.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sqft">Square Footage</Label>
                <Input
                  id="sqft"
                  type="number"
                  min={1}
                  value={sqft}
                  onChange={(e) => setSqft(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-900">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {sqft} sq ft × ${PRICE_PER_SQFT}
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ${total.toLocaleString()}
                  </p>
                </div>
                <Button onClick={handleRequestFullQuote} disabled={sqft <= 0}>
                  Request Full Quote
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Quote Tool */}
      <SurveyQuoteTool
        pool={null}
        isOpen={showFullQuote}
        onClose={() => setShowFullQuote(false)}
        customProduct={selectedGrass ? {
          name: `Artificial Grass - ${selectedGrass.name} (${sqft} sq ft)`,
          price: sqft * PRICE_PER_SQFT,
          type: 'grass',
          image: selectedGrass.image,
        } : undefined}
      />
    </>
  );
};

export default ArtificialGrassSection;
