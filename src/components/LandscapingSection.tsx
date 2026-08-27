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
import { ShoppingCart as CartIcon, Plus, Minus, FileText, Trash2, Printer, Send } from "lucide-react";
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
  type QuoteTier = "themed" | "full" | "luxury";
  const TIERS: { id: QuoteTier; emoji: string; title: string; price: number | null; description: string; callForQuote?: boolean }[] = [
    { id: "themed", emoji: "", title: "Themed Patio", price: null, callForQuote: true, description: "Green walls, luxury landscaping design, matured trees & vegetation" },
    { id: "full", emoji: "🌿🌿", title: "Full Yard Makeover", price: 15, description: "Design + planting + irrigation" },
    { id: "luxury", emoji: "🌿🏡", title: "Luxury Outdoor Space", price: 20, description: "Patios, stonework, premium features" },
  ];
  const [quoteTier, setQuoteTier] = useState<QuoteTier>("themed");
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

          {/* Quote tool — editorial ledger, below the catalog */}
          {(() => {
            const sqft = Math.max(0, parseFloat(quoteSqft) || 0);
            const tier = TIERS.find((t) => t.id === quoteTier)!;
            const isCallForQuote = tier.callForQuote === true;
            const effectiveRate =
              isAdmin && overrideRate !== "" && !isNaN(parseFloat(overrideRate))
                ? parseFloat(overrideRate)
                : (tier.price ?? 0);
            const baseCost = sqft * effectiveRate;
            const plantsCost = Object.values(quoteItems).reduce(
              (sum, it) => sum + it.price * it.qty,
              0,
            );
            const computedTotal = baseCost + plantsCost;
            const total =
              isAdmin && overrideTotal !== "" && !isNaN(parseFloat(overrideTotal))
                ? parseFloat(overrideTotal)
                : computedTotal;
            const fmt = (n: number) =>
              `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            return (
              <div className="max-w-5xl mx-auto mt-16 border border-border/60 bg-card/40">
                <div className="p-6 sm:p-10 space-y-8">
                  {/* Editorial header */}
                  <div className="border-b border-border/60 pb-6">
                    <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
                      The Estimate — Volume XIII
                    </p>
                    <h3 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mt-3">
                      Compose your landscaping quote
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
                      Choose a service tier, measure your ground, add plants from the catalog —
                      the ledger keeps count.
                    </p>
                  </div>

                  {/* Tier picker */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TIERS.map((t, i) => {
                      const isActive = t.id === quoteTier;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setQuoteTier(t.id)}
                          className={`text-left p-5 border transition-all duration-300 ${
                            isActive
                              ? "border-foreground bg-foreground/5"
                              : "border-border/60 hover:border-foreground/50"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                              Tier {String(i + 1).padStart(2, "0")}
                            </span>
                            {isActive && (
                              <span className="text-[9px] uppercase tracking-[0.35em] text-foreground">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="font-serif text-xl font-light text-foreground mt-2">{t.title}</div>
                          <div className="font-serif text-2xl font-light text-foreground mt-1">
                            {t.callForQuote ? (
                              <span className="text-lg">Call one of our agents</span>
                            ) : (
                              <>
                                ${t.price}
                                {t.id === "luxury" ? "+" : ""}
                                <span className="text-xs text-muted-foreground"> /sq ft</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sqft + summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                        Square Footage
                      </label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 500"
                        value={quoteSqft}
                        onChange={(e) => setQuoteSqft(e.target.value)}
                        className="mt-2 rounded-none"
                      />
                    </div>
                    <div className="text-sm border-l border-border/60 pl-4">
                      <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                        {isCallForQuote ? "Base service" : `Base (${sqft || 0} sq ft × $${effectiveRate})`}
                      </div>
                      <div className="font-serif text-xl font-light text-foreground mt-1">
                        {isCallForQuote ? "Quoted by an agent" : fmt(baseCost)}
                      </div>
                    </div>
                    <div className="text-sm border-l border-border/60 pl-4">
                      <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                        Selected Plants
                      </div>
                      <div className="font-serif text-xl font-light text-foreground mt-1">{fmt(plantsCost)}</div>
                    </div>
                  </div>

                  {/* Selected plants list */}
                  {Object.keys(quoteItems).length > 0 && (
                    <div className="border-t border-border/60 pt-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                          Plants in Quote ({Object.keys(quoteItems).length})
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground rounded-none"
                          onClick={() => setQuoteItems({})}
                        >
                          Clear all
                        </Button>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-auto pr-1">
                        {Object.entries(quoteItems).map(([key, it]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 p-2 bg-muted/40 rounded-none text-sm"
                          >
                            <img
                              src={it.image}
                              alt={it.plantName}
                              className="w-9 h-9 rounded object-cover bg-background flex-shrink-0"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{it.plantName}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {it.variantLabel !== "Standard" ? `${it.variantLabel} · ` : ""}
                                {it.sizeLabel} · {fmt(it.price)} ea
                              </div>
                            </div>
                            <div className="flex items-center gap-1 border rounded-none bg-background">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-none"
                                onClick={() =>
                                  setQuoteItems((prev) => {
                                    const next = { ...prev };
                                    const cur = next[key];
                                    if (!cur) return prev;
                                    if (cur.qty <= 1) delete next[key];
                                    else next[key] = { ...cur, qty: cur.qty - 1 };
                                    return next;
                                  })
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-xs font-semibold">{it.qty}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-none"
                                onClick={() =>
                                  setQuoteItems((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], qty: prev[key].qty + 1 },
                                  }))
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-none"
                              onClick={() =>
                                setQuoteItems((prev) => {
                                  const next = { ...prev };
                                  delete next[key];
                                  return next;
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer info */}
                  <div className="border-t border-border/60 pt-6 space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                      Your Information
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Full name *"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="rounded-none"
                      />
                      <Input
                        type="email"
                        placeholder="Email *"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="rounded-none"
                      />
                      <Input
                        type="tel"
                        placeholder="Phone"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="rounded-none"
                      />
                      <Input
                        placeholder="Property address"
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        className="rounded-none"
                      />
                    </div>
                    <Textarea
                      placeholder="Notes or special requests (optional)"
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      rows={2}
                      className="rounded-none"
                    />
                  </div>

                  {/* Admin unlock & overrides */}
                  <div className="border-t border-border/60 pt-6">
                    {!isAdmin ? (
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <Input
                          type="password"
                          placeholder="Admin passcode"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="sm:max-w-xs rounded-none"
                        />
                        <Button className="rounded-none"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (passcode === "WONDERMAGIC") {
                              setIsAdmin(true);
                              setPasscode("");
                              toast({
                                title: "Admin Unlocked",
                                description: "Override controls are now available.",
                              });
                            } else {
                              toast({
                                title: "Invalid Passcode",
                                description: "Please enter the correct passcode.",
                              });
                            }
                          }}
                        >
                          Unlock Admin
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-muted/40 border border-border/60 rounded-none p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                            Admin Overrides Active
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs rounded-none"
                            onClick={() => {
                              setIsAdmin(false);
                              setOverrideRate("");
                              setOverrideTotal("");
                            }}
                          >
                            Lock
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                              Override $/sq ft (optional)
                            </label>
                            <Input
                              type="number"
                              min={0}
                              placeholder={tier.price != null ? `Default $${tier.price}` : "Set $/sq ft rate"}
                              value={overrideRate}
                              onChange={(e) => setOverrideRate(e.target.value)}
                              className="rounded-none mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                              Override Total (optional)
                            </label>
                            <Input
                              type="number"
                              min={0}
                              placeholder={`Computed ${fmt(computedTotal)}`}
                              value={overrideTotal}
                              onChange={(e) => setOverrideTotal(e.target.value)}
                              className="rounded-none mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total + actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border/60">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
                        Estimated Total
                      </p>
                      <p className="font-serif text-4xl sm:text-5xl font-light text-foreground mt-1">
                        {fmt(total)}
                      </p>
                      {isCallForQuote && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Themed Patio base service is priced by one of our agents — total shown covers plants & materials.
                        </p>
                      )}
                      {isAdmin && overrideTotal !== "" && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Computed {fmt(computedTotal)} · overridden
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-none"
                        size="lg"
                        variant="outline"
                        disabled={total <= 0 && !isCallForQuote}
                        onClick={() => {
                          const today = new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });
                          const quoteNum = `WL-LS-${Date.now().toString().slice(-6)}`;
                          const plantRows = Object.values(quoteItems)
                            .map((it) => {
                              const lbl = it.variantLabel !== "Standard" ? ` — ${it.variantLabel}` : "";
                              return `<tr>
                                <td>${it.plantName}${lbl} <span style="color:#64748b">(${it.sizeLabel})</span></td>
                                <td style="text-align:center">${it.qty}</td>
                                <td style="text-align:right">${fmt(it.price)}</td>
                                <td style="text-align:right;font-weight:600">${fmt(it.price * it.qty)}</td>
                              </tr>`;
                            })
                            .join("");
                          const html = `<!doctype html><html><head><meta charset="utf-8"><title>Landscaping Quote ${quoteNum}</title>
                            <style>
                              *{box-sizing:border-box}
                              body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px;color:#0f172a;background:#fff;max-width:850px;margin:auto;}
                              .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #0891b2;padding-bottom:20px;margin-bottom:30px}
                              .brand h1{margin:0;font-size:28px;background:linear-gradient(90deg,#0891b2,#f97066);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800}
                              .brand p{margin:4px 0 0;color:#64748b;font-size:13px}
                              .meta{text-align:right;font-size:12px;color:#475569}
                              .meta strong{display:block;color:#0f172a;font-size:16px}
                              .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
                              .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px}
                              .box h3{margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#0891b2}
                              .box p{margin:2px 0;font-size:13px}
                              h2.section{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#0891b2;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px}
                              table{width:100%;border-collapse:collapse;font-size:13px}
                              th{text-align:left;padding:8px;background:#f1f5f9;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#475569}
                              td{padding:10px 8px;border-bottom:1px solid #e2e8f0}
                              .totals{margin-top:16px;margin-left:auto;width:320px;font-size:14px}
                              .totals .row{display:flex;justify-content:space-between;padding:6px 0}
                              .totals .total{border-top:2px solid #0f172a;margin-top:8px;padding-top:10px;font-size:20px;font-weight:800;color:#0891b2}
                              .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;line-height:1.6}
                              .notes{background:#fffbeb;border-left:3px solid #f59e0b;padding:12px;border-radius:4px;font-size:13px;margin-top:16px}
                              @media print{body{padding:20px}}
                            </style></head>
                            <body>
                              <div class="header">
                                <div class="brand">
                                  <h1>WONDERLANDS</h1>
                                  <p>Landscaping & Outdoor Living · Florida</p>
                                </div>
                                <div class="meta">
                                  <strong>Quote ${quoteNum}</strong>
                                  Date: ${today}<br/>
                                  Valid for 30 days
                                </div>
                              </div>

                              <div class="grid">
                                <div class="box">
                                  <h3>Bill To</h3>
                                  <p><strong>${custName || "—"}</strong></p>
                                  ${custEmail ? `<p>${custEmail}</p>` : ""}
                                  ${custPhone ? `<p>${custPhone}</p>` : ""}
                                  ${custAddress ? `<p>${custAddress}</p>` : ""}
                                </div>
                                <div class="box">
                                  <h3>Service</h3>
                                  <p><strong>${tier.title}</strong></p>
                                  <p>${tier.description}</p>
                                  ${isCallForQuote
                                    ? `<p>Price: quoted by one of our agents</p>`
                                    : `<p>Rate: $${effectiveRate}/sq ft${isAdmin && overrideRate !== "" ? " (adj.)" : ""}</p>
                                       <p>Area: ${sqft} sq ft</p>`}
                                </div>
                              </div>

                              <h2 class="section">Service Summary</h2>
                              <table>
                                <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
                                <tbody>
                                  <tr>
                                    <td><strong>${tier.title}</strong> — ${tier.description}</td>
                                    <td style="text-align:center">${isCallForQuote ? "—" : `${sqft} sq ft`}</td>
                                    <td style="text-align:right">${isCallForQuote ? "By agent" : fmt(effectiveRate)}</td>
                                    <td style="text-align:right;font-weight:600">${isCallForQuote ? "Quoted by agent" : fmt(baseCost)}</td>
                                  </tr>
                                  ${plantRows}
                                </tbody>
                              </table>

                              <div class="totals">
                                <div class="row"><span>Service Base</span><span>${isCallForQuote ? "Quoted by agent" : fmt(baseCost)}</span></div>
                                <div class="row"><span>Plants & Materials</span><span>${fmt(plantsCost)}</span></div>
                                <div class="row total"><span>TOTAL</span><span>${fmt(total)}</span></div>
                              </div>

                              ${custNotes ? `<div class="notes"><strong>Notes:</strong><br/>${custNotes.replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</div>` : ""}

                              <div class="footer">
                                Wonderlands World · sales@wonderlandsworld.com · (407) 760-4873<br/>
                                This estimate is valid for 30 days. Final pricing may vary based on site conditions.<br/>
                                Schedule a consultation: calendly.com/wonderlandsworlds/30min
                              </div>
                              <script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
                            </body></html>`;
                          const w = window.open("", "_blank");
                          if (w) {
                            w.document.open();
                            w.document.write(html);
                            w.document.close();
                          }
                        }}
                      >
                        <Printer className="h-4 w-4 mr-1.5" />
                        Print Quote
                      </Button>
                      <Button
                        size="lg"
                        className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                        disabled={total <= 0 && !isCallForQuote}
                        onClick={() => {
                          if (!custName || !custEmail) {
                            toast({
                              title: "Missing Information",
                              description: "Please add your name and email to submit the quote.",
                            });
                            return;
                          }
                          // Push everything into the cart so the existing checkout/quote flow takes over.
                          if (baseCost > 0) {
                            addToCart({
                              id: `landscaping-${tier.id}-${Date.now()}`,
                              name: `Landscaping — ${tier.title} (${sqft} sq ft @ $${effectiveRate}/sq ft)`,
                              price: baseCost,
                              image: "",
                              category: "Landscaping",
                            });
                          }
                          Object.entries(quoteItems).forEach(([key, it]) => {
                            for (let i = 0; i < it.qty; i++) {
                              addToCart({
                                id: `${key}-${i}-${Date.now()}`,
                                name: `${it.plantName}${
                                  it.variantLabel !== "Standard" ? ` — ${it.variantLabel}` : ""
                                } (${it.sizeLabel})`,
                                price: it.price,
                                image: it.image,
                                category: "Landscaping",
                              });
                            }
                          });
                          toast({
                            title: "Quote Submitted",
                            description: `Thanks ${custName}! Your landscaping quote totals ${fmt(total)}. We'll reach out at ${custEmail}.`,
                          });
                        }}
                      >
                        <Send className="h-4 w-4 mr-1.5" />
                        Submit Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
