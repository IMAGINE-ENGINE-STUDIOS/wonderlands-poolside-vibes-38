import * as React from "react";
const { useState, useMemo } = React;
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingCart as CartIcon, Plus, Minus, FileText, Sparkles, Trash2 } from "lucide-react";
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
  const [activeCat, setActiveCat] = useState<LandscapingCategory | "All">("All");
  const [selected, setSelected] = useState<LandscapingPlant | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const { addToCart } = useShoppingCart();

  // ── Quote tool state ───────────────────────────────────────────────
  type QuoteTier = "basic" | "full" | "luxury";
  const TIERS: { id: QuoteTier; emoji: string; title: string; price: number; description: string }[] = [
    { id: "basic", emoji: "🌿", title: "Basic Refresh", price: 5, description: "Mulch, plants, cleanup" },
    { id: "full", emoji: "🌿🌿", title: "Full Yard Makeover", price: 10, description: "Design + planting + irrigation" },
    { id: "luxury", emoji: "🌿🏡", title: "Luxury Outdoor Space", price: 15, description: "Patios, stonework, premium features" },
  ];
  const [quoteTier, setQuoteTier] = useState<QuoteTier>("basic");
  const [quoteSqft, setQuoteSqft] = useState<string>("");
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
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      // also match against variant labels / full names
      return p.variants.some(
        (v) =>
          v.label.toLowerCase().includes(q) || v.fullName.toLowerCase().includes(q),
      );
    });
  }, [search, activeCat]);

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
      <section className="py-12 bg-gradient-to-br from-emerald-50/40 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 bg-clip-text text-transparent">
              Landscaping
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Premium plants, palms, trees, and grasses to bring your landscape to life.
            </p>
          </div>

          {/* Search + filter */}
          <div className="max-w-5xl mx-auto mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plants, palms, trees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((plant) => {
              const variantCount = plant.variants.length;
              return (
                <Card
                  key={plant.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col"
                  onClick={() => openPlant(plant)}
                >
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    <PlantImage
                      src={plant.image}
                      alt={plant.name}
                      fallback={landscapingCategoryImages[plant.category]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {variantCount > 1 && (
                      <Badge className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] px-1.5 py-0">
                        {variantCount} options
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <Badge variant="outline" className="self-start mb-2 text-[10px] px-1.5 py-0">
                      {plant.category}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
                      {plant.name}
                    </h3>
                    <div className="mt-auto">
                      <p className="text-xs text-muted-foreground">Starting at</p>
                      <p className="text-lg font-bold text-emerald-700">
                        {formatPrice(plant.minPrice)}
                      </p>
                      <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                        {variantCount > 1 ? "View Options" : "View Sizes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
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
                        className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{opt.size}</p>
                          <p className="text-lg font-bold text-emerald-700">
                            {formatPrice(opt.finalPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 border rounded-md">
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
                        <Button
                          size="sm"
                          onClick={() => handleAdd(selected, activeVariant, opt)}
                          className="bg-emerald-700 hover:bg-emerald-800"
                        >
                          <CartIcon className="h-4 w-4 mr-1" />
                          Add
                        </Button>
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
