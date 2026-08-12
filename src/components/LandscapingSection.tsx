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

          {/* Quote tool */}
          {(() => {
            const sqft = Math.max(0, parseFloat(quoteSqft) || 0);
            const tier = TIERS.find((t) => t.id === quoteTier)!;
            const effectiveRate =
              isAdmin && overrideRate !== "" && !isNaN(parseFloat(overrideRate))
                ? parseFloat(overrideRate)
                : tier.price;
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
              <Card className="max-w-5xl mx-auto mb-8 border-emerald-200 shadow-sm">
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-700" />
                    <h3 className="text-lg font-bold text-emerald-800">Build Your Landscaping Quote</h3>
                  </div>

                  {/* Tier picker */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TIERS.map((t) => {
                      const isActive = t.id === quoteTier;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setQuoteTier(t.id)}
                          className={`text-left p-4 rounded-lg border-2 transition-all ${
                            isActive
                              ? "border-emerald-600 bg-emerald-50 shadow"
                              : "border-border hover:border-emerald-300"
                          }`}
                        >
                          <div className="text-xl mb-1">{t.emoji}</div>
                          <div className="font-semibold text-sm">{t.title}</div>
                          <div className="text-emerald-700 font-bold text-lg">
                            ${t.price}
                            {t.id === "luxury" ? "+" : ""}
                            <span className="text-xs font-normal text-muted-foreground">/sq ft</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sqft + summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Square Footage
                      </label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 500"
                        value={quoteSqft}
                        onChange={(e) => setQuoteSqft(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Base ({sqft || 0} sq ft × ${tier.price})</div>
                      <div className="font-semibold text-emerald-800">{fmt(baseCost)}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Selected Plants</div>
                      <div className="font-semibold text-emerald-800">{fmt(plantsCost)}</div>
                    </div>
                  </div>

                  {/* Selected plants list */}
                  {Object.keys(quoteItems).length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Plants in Quote ({Object.keys(quoteItems).length})
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => setQuoteItems({})}
                        >
                          Clear all
                        </Button>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-auto pr-1">
                        {Object.entries(quoteItems).map(([key, it]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 p-2 bg-muted/40 rounded-md text-sm"
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
                            <div className="flex items-center gap-1 border rounded-md bg-background">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
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
                                className="h-7 w-7"
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
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Your Information
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Full name *"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="Email *"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                      />
                      <Input
                        type="tel"
                        placeholder="Phone"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                      />
                      <Input
                        placeholder="Property address"
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Notes or special requests (optional)"
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Admin unlock & overrides */}
                  <div className="border-t pt-4">
                    {!isAdmin ? (
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <Input
                          type="password"
                          placeholder="Admin passcode"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="sm:max-w-xs"
                        />
                        <Button
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
                      <div className="space-y-3 bg-amber-50 border border-amber-200 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                            Admin Overrides Active
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
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
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                              Override $/sq ft (optional)
                            </label>
                            <Input
                              type="number"
                              min={0}
                              placeholder={`Default $${tier.price}`}
                              value={overrideRate}
                              onChange={(e) => setOverrideRate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                              Override Total (optional)
                            </label>
                            <Input
                              type="number"
                              min={0}
                              placeholder={`Computed ${fmt(computedTotal)}`}
                              value={overrideTotal}
                              onChange={(e) => setOverrideTotal(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total + actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                        Estimated Total
                      </p>
                      <p className="text-3xl font-bold text-emerald-700">{fmt(total)}</p>
                      {isAdmin && overrideTotal !== "" && (
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Computed {fmt(computedTotal)} · overridden
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="lg"
                        variant="outline"
                        disabled={total <= 0}
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
                                  <p>Rate: $${effectiveRate}/sq ft${isAdmin && overrideRate !== "" ? " (adj.)" : ""}</p>
                                  <p>Area: ${sqft} sq ft</p>
                                </div>
                              </div>

                              <h2 class="section">Service Summary</h2>
                              <table>
                                <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
                                <tbody>
                                  <tr>
                                    <td><strong>${tier.title}</strong> — ${tier.description}</td>
                                    <td style="text-align:center">${sqft} sq ft</td>
                                    <td style="text-align:right">${fmt(effectiveRate)}</td>
                                    <td style="text-align:right;font-weight:600">${fmt(baseCost)}</td>
                                  </tr>
                                  ${plantRows}
                                </tbody>
                              </table>

                              <div class="totals">
                                <div class="row"><span>Service Base</span><span>${fmt(baseCost)}</span></div>
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
                        className="bg-emerald-700 hover:bg-emerald-800"
                        disabled={total <= 0}
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
                              name: `Landscaping — ${tier.title} (${sqft} sq ft @ $${tier.price}/sq ft)`,
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
                </CardContent>
              </Card>
            );
          })()}

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
