import * as React from "react";
const { useState, useMemo } = React;
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingCart as CartIcon, Plus, Minus, FileText, Sparkles, Trash2, Printer, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  landscapingPlants,
  landscapingCategories,
  landscapingCategoryImages,
  type LandscapingPlant,
  type LandscapingCategory,
  type PlantSizeOption,
  type PlantVariant,
} from "@/data/landscapingData";
import { useShoppingCart } from "./ShoppingCartProvider";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";

const formatPrice = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PlantImage = ({
  src: initialSrc,
  alt,
  fallback,
  className,
}: {
  src: string;
  alt: string;
  fallback: string;
  className: string;
}) => {
  const [src, setSrc] = useState(initialSrc);

  React.useEffect(() => {
    setSrc(initialSrc);
  }, [initialSrc]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      width={400}
      height={400}
      referrerPolicy="no-referrer"
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
};

const LandscapingSection = () => {
  const { toast } = useToast();
  const [activeCat, setActiveCat] = useState<LandscapingCategory | "All">("All");
  const [selected, setSelected] = useState<LandscapingPlant | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const { addToCart } = useShoppingCart();

  // ── Quote tool state ───────────────────────────────────────────────
  type QuoteTier = "basic" | "full" | "luxury";
  const TIERS: { id: QuoteTier; emoji: string; title: string; price: number; description: string }[] = [
    { id: "basic", emoji: "🌿", title: "Basic Refresh", price: 5, description: "Mulch, plants, cleanup" },
    { id: "full", emoji: "🌿🌿", title: "Full Yard Makeover", price: 15, description: "Design + planting + irrigation" },
    { id: "luxury", emoji: "🌿🏡", title: "Luxury Outdoor Space", price: 20, description: "Patios, stonework, premium features" },
  ];
  const [quoteTier, setQuoteTier] = useState<QuoteTier>("basic");
  const [quoteSqft, setQuoteSqft] = useState<string>("");
  // Customer info (mirrors main /quote tool)
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custNotes, setCustNotes] = useState("");
  // Admin override state (passcode WONDERMAGIC)
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [overrideTotal, setOverrideTotal] = useState<string>("");
  const [overrideRate, setOverrideRate] = useState<string>("");
  // key: `${variantId}-${size}` -> { variant, plant, opt, qty }
  const [quoteItems, setQuoteItems] = useState<
    Record<string, { plantName: string; variantLabel: string; sizeLabel: string; price: number; qty: number; image: string }>
  >({});

  const filtered = useMemo(() => {
    return landscapingPlants.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      return true;
    });
  }, [activeCat]);

  const openPlant = (plant: LandscapingPlant) => {
    setSelected(plant);
    setActiveVariantId(plant.variants[0]?.id ?? null);
  };

  const handleAdd = (plant: LandscapingPlant, variant: PlantVariant, opt: PlantSizeOption) => {
    const key = `${variant.id}-${opt.size}`;
    const quantity = Math.max(1, qty[key] || 1);
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${variant.id}-${opt.size.replace(/\s+/g, "")}`,
        name: `${variant.fullName} (${opt.size})`,
        price: opt.finalPrice,
        image: variant.image,
        category: "Landscaping",
      });
    }
  };

  const adjustQty = (key: string, delta: number) => {
    setQty((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] || 1) + delta) }));
  };

  return (
    <>
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <EditorialSectionHeader
            eyebrow="Volume XIII — Planting"
            title="Landscaping"
            description="Premium plants, palms, trees and grasses — bringing the drawing to life."
          />

          {/* Category filter */}
          <div className="max-w-5xl mx-auto mb-8">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Browse the catalog and add plants to your quote
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge
                variant={activeCat === "All" ? "default" : "outline"}
                onClick={() => setActiveCat("All")}
                className="cursor-pointer px-4 py-1.5 text-sm"
              >
                All ({landscapingPlants.length})
              </Badge>
              {landscapingCategories.map((cat) => {
                const count = landscapingPlants.filter((p) => p.category === cat).length;
                if (count === 0) return null;
                return (
                  <Badge
                    key={cat}
                    variant={activeCat === cat ? "default" : "outline"}
                    onClick={() => setActiveCat(cat)}
                    className="cursor-pointer px-4 py-1.5 text-sm"
                  >
                    {cat} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <ProductScrollRow className="mb-8">
            {filtered.map((plant) => {
              const variantCount = plant.variants.length;
              return (
                <Card
                  key={plant.id}
                  className="rounded-none border border-border/70 overflow-hidden group transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer flex flex-col"
                  onClick={() => openPlant(plant)}
                >
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-muted">
                    <PlantImage
                      src={plant.image}
                      alt={plant.name}
                      fallback={landscapingCategoryImages[plant.category]}
                      className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                        {plant.category}
                      </span>
                    </div>
                    {variantCount > 1 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                          {variantCount} options
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 sm:p-5 flex-1 flex flex-col space-y-4">
                    <h3 className="font-serif text-xl sm:text-2xl font-light leading-[1.05] tracking-tight text-foreground line-clamp-2 min-h-[2.5rem]">
                      {plant.name}
                    </h3>
                    <div className="mt-auto border-t border-border/60 pt-4">
                      <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Starting at</p>
                      <p className="font-serif text-2xl font-light text-foreground">
                        {formatPrice(plant.minPrice)}
                      </p>
                      <Button size="sm" variant="outline" className="w-full mt-3 rounded-none text-[10px] uppercase tracking-[0.3em]">
                        {variantCount > 1 ? "View Options" : "View Sizes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ProductScrollRow>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No plants found. Try a different search.
            </div>
          )}
        </div>
      </section>

      {/* Variants / sizes / Add to cart modal */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setActiveVariantId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.category}
              {selected && selected.variants.length > 1
                ? " — choose an option, then a size."
                : " — choose a size below."}
            </DialogDescription>
          </DialogHeader>
          {selected && (() => {
            const activeVariant =
              selected.variants.find((v) => v.id === activeVariantId) ?? selected.variants[0];
            return (
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-none bg-muted">
                  <PlantImage
                    src={activeVariant.image}
                    alt={activeVariant.fullName}
                    fallback={landscapingCategoryImages[selected.category]}
                    className="w-full h-full object-cover"
                  />
                </div>

                {selected.variants.length > 1 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Options
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.variants.map((v) => (
                        <Badge
                          key={v.id}
                          variant={v.id === activeVariant.id ? "default" : "outline"}
                          onClick={() => setActiveVariantId(v.id)}
                          className={`cursor-pointer px-3 py-1.5 text-xs ${
                            v.id === activeVariant.id ? "bg-emerald-700 hover:bg-emerald-800" : ""
                          }`}
                        >
                          {v.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {activeVariant.sizes.map((opt) => {
                    const key = `${activeVariant.id}-${opt.size}`;
                    const quantity = qty[key] || 1;
                    return (
                      <div
                        key={opt.size}
                        className="flex items-center justify-between gap-3 p-3 border rounded-none"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{opt.size}</p>
                          <p className="text-lg font-bold text-emerald-700">
                            {formatPrice(opt.finalPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 border rounded-none">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => adjustQty(key, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => adjustQty(key, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              const quantity = Math.max(1, qty[key] || 1);
                              const qKey = `${activeVariant.id}-${opt.size}`;
                              setQuoteItems((prev) => {
                                const existing = prev[qKey];
                                return {
                                  ...prev,
                                  [qKey]: {
                                    plantName: selected.name,
                                    variantLabel: activeVariant.label,
                                    sizeLabel: opt.size,
                                    price: opt.finalPrice,
                                    image: activeVariant.image,
                                    qty: (existing?.qty ?? 0) + quantity,
                                  },
                                };
                              });
                            }}
                            className="bg-emerald-700 hover:bg-emerald-800 h-8"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Quote
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdd(selected, activeVariant, opt)}
                            className="h-7 text-xs"
                          >
                            <CartIcon className="h-3 w-3 mr-1" />
                            Cart
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LandscapingSection;
