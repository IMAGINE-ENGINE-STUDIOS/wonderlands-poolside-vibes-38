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
import { Search, ShoppingCart as CartIcon, Plus, Minus } from "lucide-react";
import {
  landscapingPlants,
  landscapingCategories,
  type LandscapingPlant,
  type LandscapingCategory,
  type PlantSizeOption,
} from "@/data/landscapingData";
import { useShoppingCart } from "./ShoppingCartProvider";

const formatPrice = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const LandscapingSection = () => {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<LandscapingCategory | "All">("All");
  const [selected, setSelected] = useState<LandscapingPlant | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const { addToCart } = useShoppingCart();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return landscapingPlants.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, activeCat]);

  const handleAdd = (plant: LandscapingPlant, opt: PlantSizeOption) => {
    const key = `${plant.id}-${opt.size}`;
    const quantity = Math.max(1, qty[key] || 1);
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${plant.id}-${opt.size.replace(/\s+/g, "")}`,
        name: `${plant.name} (${opt.size})`,
        price: opt.finalPrice,
        image: plant.image,
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
            {filtered.map((plant) => (
              <Card
                key={plant.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col"
                onClick={() => setSelected(plant)}
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width={400}
                    height={400}
                  />
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
                      View Sizes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No plants found. Try a different search.
            </div>
          )}
        </div>
      </section>

      {/* Sizes / Add to cart modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.category} — choose a size below.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                {selected.sizes.map((opt) => {
                  const key = `${selected.id}-${opt.size}`;
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
                        <span className="w-8 text-center text-sm font-medium">
                          {quantity}
                        </span>
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
                        onClick={() => handleAdd(selected, opt)}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LandscapingSection;
