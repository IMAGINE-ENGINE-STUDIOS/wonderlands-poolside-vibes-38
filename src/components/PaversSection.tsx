import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { paverTypes } from "@/data/paverData";
import { useShoppingCart } from "./ShoppingCartProvider";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";
import InstallationNote from "@/components/InstallationNote";

/**
 * PaversSection — every paver collection in `src/data/paverData.ts`, rendered
 * from one declarative list so new collections appear automatically instead of
 * needing another hard-coded card (previously only Appian + Catalina showed,
 * hiding Travertine, Coralina and Gloca Mirage).
 *
 * Prices come from each paver's `basePrice` ($/sq ft) — the collection "from"
 * figure is the minimum basePrice in that collection, so the card can never
 * drift from the data.
 */

interface CollectionDef {
  key: string;
  name: string;
  badge: string;
  description: string;
  /** Matcher against the paver catalogue */
  match: (paver: (typeof paverTypes)[number]) => boolean;
  features: string[];
}

const COLLECTIONS: CollectionDef[] = [
  {
    key: "appian",
    name: "Appian Collection Pavers",
    badge: "Premium Collection",
    description:
      "Premium concrete pavers with multiple style options. Perfect for pool decks, patios and walkways.",
    match: (p) => p.id.startsWith("appian"),
    features: [
      "Multiple style options",
      "Slip-resistant surface texture",
      "Freeze-thaw resistant",
      "Easy maintenance and cleaning",
      "Professional installation included",
    ],
  },
  {
    key: "catalina-grana",
    name: "Catalina Grana Collection",
    badge: "Grana Collection",
    description:
      "Contemporary Grana collection with refined textures and sophisticated styling. Ideal for modern pool environments.",
    match: (p) => p.name.startsWith("Catalina Grana"),
    features: [
      "Contemporary Grana texture patterns",
      "Superior slip resistance",
      "Weather-resistant finish",
      "Low maintenance surface",
      "Expert installation service",
    ],
  },
  {
    key: "catalina",
    name: "Catalina Collection",
    badge: "Classic Collection",
    description:
      "Classic Catalina pavers in versatile formats — a timeless deck surface for any architecture.",
    match: (p) => p.name.startsWith("Catalina ") && !p.name.startsWith("Catalina Grana"),
    features: [
      "Classic design patterns",
      "Versatile styling options",
      "Durable construction",
      "Weather-resistant finish",
      "Professional installation",
    ],
  },
  {
    key: "travertine",
    name: "Travertine Collection",
    badge: "Natural Stone",
    description:
      "Natural travertine in light, dark, honed and tumbled finishes — cool underfoot and quietly luxurious.",
    match: (p) => p.id.startsWith("travertine"),
    features: [
      "Natural quarried stone",
      "Stays cool underfoot",
      "Honed, tumbled and classic finishes",
      "Premium pool coping match available",
      "Professional installation included",
    ],
  },
  {
    key: "coralina",
    name: "Coralina Collection",
    badge: "Porcelain",
    description:
      "Coralina porcelain — a distinct fossil-stone look with the durability and low porosity of porcelain.",
    match: (p) => p.id.startsWith("coralina"),
    features: [
      "Porcelain durability, stone appearance",
      "Very low water absorption",
      "Stain and fade resistant",
      "Large-format calibrated pieces",
      "Professional installation included",
    ],
  },
  {
    key: "gloca-mirage",
    name: "Gloca Mirage Collection",
    badge: "Large Format",
    description:
      "Gloca Mirage large-format porcelain in 24x48 and 48x48 — Ideal, Concrete and Chairmues surfaces.",
    match: (p) => p.id.startsWith("gloca-mirage"),
    features: [
      "48x48 and 24x48 large formats",
      "Ideal, Concrete and Chairmues finishes",
      "Rectified edges for tight joints",
      "High slip resistance rating",
      "Professional installation included",
    ],
  },
];

const PaversSection = () => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPaverType, setSelectedPaverType] = useState<any>(null);
  const [surfaceArea, setSurfaceArea] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedCollectionKey, setSelectedCollectionKey] = useState<string>("appian");
  const { addToCart } = useShoppingCart();

  const pavers = paverTypes.filter((p) => p.category === "paver");

  const collections = COLLECTIONS.map((c) => {
    const items = pavers.filter(c.match);
    const fromPrice = items.length ? Math.min(...items.map((p) => p.basePrice)) : 0;
    return { ...c, items, fromPrice };
  }).filter((c) => c.items.length > 0);

  const activeCollection =
    collections.find((c) => c.key === selectedCollectionKey) ?? collections[0];

  const pricePerSqFt = selectedPaverType?.basePrice || activeCollection?.fromPrice || 0;

  const calculateTotalPrice = () => {
    const area = parseFloat(surfaceArea);
    if (!surfaceArea || isNaN(area)) return 0;
    return pricePerSqFt * area;
  };

  const handleAddToCart = () => {
    if (!selectedPaverType || !surfaceArea) {
      toast.error("Please select paver style and surface area");
      return;
    }
    addToCart({
      id: `${activeCollection.key}_pavers_${Date.now()}`,
      name: `${activeCollection.name} - ${selectedPaverType.name}`,
      price: calculateTotalPrice(),
      category: "paver",
      image: selectedPaverType.image,
      extras: [{ name: `Surface Area: ${surfaceArea} sq ft`, price: 0 }],
    });
    toast.success(`Added ${activeCollection.name} pavers to cart!`);
    setShowOptionsModal(false);
  };

  const handleRequestQuote = (collectionKey?: string) => {
    if (collectionKey) setSelectedCollectionKey(collectionKey);
    setShowQuoteModal(true);
    setShowOptionsModal(false);
  };

  const getQuoteExtras = () => {
    const area = parseFloat(surfaceArea);
    if (!selectedPaverType || !surfaceArea || isNaN(area)) return undefined;
    const totalPrice = pricePerSqFt * area;
    return {
      extrasBreakdown: [
        {
          name: `${selectedPaverType.name} (${area} sq ft @ $${pricePerSqFt}/sqft)`,
          price: totalPrice,
          image: selectedPaverType.image,
        },
      ],
      extrasTotal: totalPrice,
    };
  };

  const renderPaverCarousel = (items: typeof paverTypes, collectionKey: string, stripPrefixes: string[]) => (
    <Carousel className="w-full" opts={{ align: "start", loop: true }}>
      <CarouselContent className="-ml-2 md:-ml-4">
        {items.map((paver) => (
          <CarouselItem key={paver.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4">
            <div
              className="text-center cursor-pointer"
              onClick={() => {
                setSelectedCollectionKey(collectionKey);
                setSelectedPaverType(paver);
                setShowOptionsModal(true);
              }}
            >
              <div className="w-full h-20 rounded-none mb-2 overflow-hidden border-2 border-transparent hover:border-primary transition-colors">
                <img
                  loading="lazy"
                  decoding="async"
                  src={paver.image}
                  alt={paver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-medium truncate">
                {stripPrefixes.reduce((label, prefix) => label.replace(prefix, ""), paver.name)}
              </p>
              <p className="text-xs text-muted-foreground">${paver.basePrice}/sq ft</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0" />
      <CarouselNext className="right-0" />
    </Carousel>
  );

  return (
    <>
      <section className="py-12 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <EditorialSectionHeader
            eyebrow="Volume X — Stone"
            title="Premium Pool Pavers"
            description="Every paver collection we install — concrete, travertine and large-format porcelain — configured for a complete hardscape."
          />

          <ProductScrollRow className="mb-8">
            {collections.map((collection) => (
              <Card
                key={collection.key}
                className="rounded-none border border-border/70 overflow-hidden group transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]"
              >
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden group/image">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={collection.items[0]?.image}
                    alt={`${collection.name} pavers`}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover/image:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                      {collection.badge}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                      {collection.name}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">{collection.description}</p>
                    <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
                        <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                          ${collection.fromPrice}/sq ft
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                      Available Styles ({collection.items.length} options)
                    </p>
                    {renderPaverCarousel(collection.items, collection.key, [
                      "Appian ",
                      "Catalina Grana ",
                      "Catalina ",
                      "Travertine ",
                      "Gloca Mirage ",
                    ])}
                  </div>

                  <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
                    {collection.features.map((feature) => (
                      <div key={feature} className="py-2.5 text-foreground">
                        {feature}
                      </div>
                    ))}
                  </dl>

                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                      Quick Price Calculator
                    </p>
                    <Input
                      type="number"
                      placeholder="Enter surface area (sq ft)"
                      value={surfaceArea}
                      onChange={(e) => setSurfaceArea(e.target.value)}
                      className="rounded-none"
                    />
                    {surfaceArea && !isNaN(parseFloat(surfaceArea)) && (
                      <div className="text-sm">
                        <div className="font-medium text-foreground">
                          Total Cost: $
                          {(parseFloat(surfaceArea) * collection.fromPrice).toLocaleString()}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Based on {surfaceArea} sq ft × ${collection.fromPrice}/sq ft
                        </div>
                      </div>
                    )}
                  </div>

                  <InstallationNote className="mb-2" />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleRequestQuote(collection.key)}
                      className="flex-1 instant-quote-btn transition-all duration-300 rounded-none text-[10px] uppercase tracking-[0.3em] bg-foreground text-background hover:bg-foreground/90"
                      size="sm"
                    >
                      Instant Quote
                    </Button>
                    <Button
                      className="rounded-none text-[10px] uppercase tracking-[0.3em]"
                      onClick={() => {
                        setSelectedCollectionKey(collection.key);
                        setSelectedPaverType(collection.items[0]);
                        setShowOptionsModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      View All Options
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ProductScrollRow>
        </div>
      </section>

      {/* Style + area picker */}
      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light">
              {activeCollection?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {activeCollection?.items.map((paver) => (
                <button
                  key={paver.id}
                  type="button"
                  onClick={() => setSelectedPaverType(paver)}
                  className={`border p-2 text-left transition-colors ${
                    selectedPaverType?.id === paver.id
                      ? "border-foreground/60 bg-foreground/5"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="h-16 w-full overflow-hidden">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={paver.image}
                      alt={paver.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium">{paver.name}</p>
                  <p className="text-xs text-muted-foreground">${paver.basePrice}/sq ft</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Surface area
              </p>
              <Input
                type="number"
                placeholder="Enter surface area (sq ft)"
                value={surfaceArea}
                onChange={(e) => setSurfaceArea(e.target.value)}
                className="rounded-none"
              />
              {calculateTotalPrice() > 0 && (
                <p className="text-sm font-medium text-foreground">
                  Total: ${calculateTotalPrice().toLocaleString()} ({pricePerSqFt}/sq ft)
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 rounded-none text-[10px] uppercase tracking-[0.3em]"
              >
                Add to Cart
              </Button>
              <Button
                onClick={() => handleRequestQuote(activeCollection?.key)}
                className="flex-1 rounded-none bg-foreground text-background text-[10px] uppercase tracking-[0.3em] hover:bg-foreground/90"
              >
                Instant Quote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SurveyQuoteTool
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={{
          name: `${activeCollection?.name ?? "Pavers"}${selectedPaverType ? ` - ${selectedPaverType.name}` : ""}`,
          price: calculateTotalPrice(),
          type: "paver",
        }}
        extras={getQuoteExtras()}
      />
    </>
  );
};

export default PaversSection;
