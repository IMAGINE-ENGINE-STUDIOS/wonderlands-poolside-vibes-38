import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { artificialGrassOptions, PRICE_PER_SQFT, type ArtificialGrassOption } from "@/data/artificialGrassData";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";

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
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <EditorialSectionHeader
          eyebrow="Volume XI — Verdure"
          title="Artificial Grass"
          description="Premium turf — low maintenance, year-round green, installed to a single flawless plane."
        />

          <ProductScrollRow className="mb-8">
            {artificialGrassOptions.map((grass) => (
              <Card
                key={grass.id}
                className="rounded-none border border-border/70 overflow-hidden group transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]"
              >
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-muted">
                  <img
                    src={grass.image}
                    alt={`${grass.name} artificial grass`}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                      Turf
                    </span>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                    {grass.name}
                  </h3>
                  <div className="flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Rate</p>
                      <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">${PRICE_PER_SQFT}<span className="text-sm text-muted-foreground">/sq ft</span></p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleOpenInstantQuote(grass)}
                    className="instant-quote-btn w-full rounded-none bg-foreground text-background text-[10px] uppercase tracking-[0.3em] hover:bg-foreground/90"
                    size="sm"
                  >
                    Instant Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductScrollRow>
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
                <Button className="rounded-none" onClick={handleRequestFullQuote} disabled={sqft <= 0}>
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
