import * as React from "react";
import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import { getDefaultExtras, getProductFeatures, type ProductType } from "@/config/productFeatures";
import StudioCartWidget from "@/components/StudioCartWidget";
import EditorialFeatureConfigurator, {
  featureExtrasBreakdown,
  sumFeatureExtras,
} from "./EditorialFeatureConfigurator";
import SurveyQuoteTool from "@/components/SurveyQuoteTool";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Product Suite (shared shell)
 * -----------------------------------------------------------------------------
 * WHAT: one editorial page per product category (saunas, spas, tanning ledges)
 * carrying the full configuration experience: a model carousel + dropdown, the
 * accordion/carousel additional-features mechanism taken from the fiberglass
 * pool cards, live pricing, cart sync, quote generation and the category's own
 * drawing board.
 *
 * WHY: each of these categories previously lived only as a scroll row of cards
 * with its own bespoke option UI. The suites give every category the same depth
 * of editing that pools already had, in a single dedicated page.
 *
 * HOW: models are passed in from the existing catalogue data files (no data is
 * duplicated here), options come from `src/config/productFeatures.ts` and the
 * board is the shared `FlipEditorBoard`, which already maps each discipline to
 * the correct drafting surface.
 */

/** Board is heavy (canvas + lazy configurators) — only fetched when opened. */
const FlipEditorBoard = lazy(() => import("@/components/flip/FlipEditorBoard"));

export interface SuiteModel {
  id: string;
  name: string;
  price: number;
  image?: string;
  brand?: string;
  dimensions?: string;
  depth?: string;
  description?: string;
  features?: string[];
  /** Small line under the name, e.g. "2 persons · 6.0kW" */
  meta?: string;
}

export interface ProductSuiteProps {
  /** Discipline id used by the board + cache keys, e.g. "saunas" */
  categoryId: string;
  categoryLabel: string;
  /** Which additional-feature catalogue this suite prints */
  productType: ProductType;
  eyebrow: string;
  title: string;
  blurb: string;
  models: SuiteModel[];
  /** Optional grouping label resolver for the carousel, e.g. brand */
  groupBy?: (model: SuiteModel) => string;
  /**
   * Rendered inside the masthead, under the standfirst. Suites that carry
   * several disciplines (enclosures / lanai / fencing) print their discipline
   * switcher here so the reader never leaves the page to change trade.
   */
  mastheadSlot?: React.ReactNode;
  /**
   * Extra drawing boards this suite can open besides its own discipline board.
   * Each id is a `FlipEditorBoard` discipline id.
   */
  boards?: Array<{ id: string; label: string }>;
  /** Printed after every figure for rate-based trades, e.g. "/sq ft". */
  unitSuffix?: string;
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const ProductSuite: React.FC<ProductSuiteProps> = ({
  categoryId,
  categoryLabel,
  productType,
  eyebrow,
  title,
  blurb,
  models,
  groupBy,
  mastheadSlot,
  boards,
  unitSuffix = "",
}) => {

  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, cartItems, syncItemConfig } = useShoppingCart();
  const { priceMultiplier } = useProjectType();

  /* Selection and options survive a reload (global UI cache convention) */
  const [modelId, setModelId] = usePersistentState<string>(
    `suite_${categoryId}_model`,
    models[0]?.id ?? "",
  );
  const [extras, setExtras] = usePersistentState<Record<string, any>>(
    `suite_${categoryId}_extras`,
    getDefaultExtras(productType),
  );
  const [boardOpen, setBoardOpen] = React.useState(false);
  const [quoteOpen, setQuoteOpen] = React.useState(false);

  const model = React.useMemo(
    () => models.find((m) => m.id === modelId) ?? models[0],
    [models, modelId],
  );

  const base = React.useMemo(() => (model?.price ?? 0) * priceMultiplier, [model, priceMultiplier]);
  const extrasTotal = React.useMemo(
    () => sumFeatureExtras(productType, extras, priceMultiplier),
    [productType, extras, priceMultiplier],
  );
  const breakdown = React.useMemo(
    () => featureExtrasBreakdown(productType, extras, priceMultiplier),
    [productType, extras, priceMultiplier],
  );
  const total = base + extrasTotal;

  const cartId = model ? `${categoryId}-${model.id}` : "";
  const modelName = model ? `${model.brand ? `${model.brand} ` : ""}${model.name}` : "";
  const inCart = React.useMemo(() => cartItems.some((i) => i.id === cartId), [cartItems, cartId]);

  const handleAddToCart = React.useCallback(() => {
    if (!model) return;
    addToCart({
      id: cartId,
      name: modelName,
      price: base,
      image: model.image,
      category: categoryLabel,
      extras: breakdown,
    } as any);
    toast({
      title: "Added to cart",
      description: `${model.name} — ${money(total)} delivered and installed.`,
      duration: 3000,
    });
  }, [model, cartId, modelName, base, categoryLabel, breakdown, total, addToCart, toast]);

  /**
   * A feature is never bought alone: the moment the reader configures ANY
   * additional feature, the product it belongs to enters the shopping list with
   * that feature attached. Once on the list the line mirrors the configurator
   * live, so the widget total can never diverge from the page.
   */
  const breakdownKey = JSON.stringify(breakdown);
  React.useEffect(() => {
    if (!model) return;
    if (!inCart) {
      if (breakdown.length) handleAddToCart();
      return;
    }
    syncItemConfig(cartId, { price: base, extras: breakdown as any });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCart, cartId, base, breakdownKey]);

  /* The shopping list edits features at their source — the suite's own state */
  const features = React.useMemo(() => getProductFeatures(productType), [productType]);
  const resetValueFor = (id: string) => {
    const feature = features.find((f) => f.id === id);
    if (!feature) return undefined;
    switch (feature.type) {
      case "quantity":
        return 0;
      case "area":
        return 0;
      case "boolean":
        return false;
      default:
        return "None";
    }
  };
  const handleRemoveExtra = (key?: string) => {
    if (!key) return;
    setExtras({ ...extras, [key]: resetValueFor(key) });
  };
  const handleExtraQuantity = (key: string | undefined, quantity: number) => {
    if (!key) return;
    setExtras({ ...extras, [key]: quantity });
  };
  const handleExtraOption = (key: string | undefined, optionName: string) => {
    if (!key) return;
    setExtras({ ...extras, [key]: optionName });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Editorial masthead ─────────────────────────────────────────── */}
      <header className="border-b border-border/60 px-6 pb-10 pt-28 md:px-12">
        <div className="mx-auto max-w-[1600px]">
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{blurb}</p>
        </div>
      </header>

      {/* ── Model selection: dropdown + carousel ───────────────────────── */}
      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Select the model
            </h2>
            <Select value={model?.id} onValueChange={setModelId}>
              <SelectTrigger className="h-11 w-full max-w-xs rounded-none border-border/70 text-sm">
                <SelectValue placeholder="Choose a model" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {groupBy ? `${groupBy(m)} · ` : ""}
                    {m.name} — {money(m.price * priceMultiplier)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Carousel className="mt-6" opts={{ align: "start", loop: false, duration: 25 }}>
            <CarouselContent className="-ml-2">
              {models.map((m) => {
                const active = m.id === model?.id;
                return (
                  <CarouselItem key={m.id} className="basis-2/3 pl-2 sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
                    <button
                      type="button"
                      onClick={() => setModelId(m.id)}
                      className={`flex h-full w-full flex-col border text-left transition-all hover:shadow-lg ${
                        active ? "border-foreground" : "border-border/70"
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-muted/40">
                        {m.image && (
                          <img
                            src={m.image}
                            alt={m.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        {groupBy && (
                          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{groupBy(m)}</p>
                        )}
                        <p className="mt-1 text-sm font-medium leading-tight">{m.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {/* Never repeat the group label already printed above */}
                          {(groupBy && groupBy(m) === m.meta ? m.dimensions : m.meta ?? m.dimensions) ?? ""}
                        </p>
                        <p className="mt-3 text-sm">{money(m.price * priceMultiplier)}</p>
                      </div>
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* ── The selected model + its configurator ──────────────────────── */}
      <section className="border-t border-border/60 px-6 py-12 md:px-12">
        <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* Plate — min-w-0 keeps the carousel/accordion column from squeezing it */}
          <div className="min-w-0">
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted/40">
              {model?.image && (
                <img
                  src={model.image}
                  alt={model.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="mt-6">
              {model?.brand && (
                <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{model.brand}</p>
              )}
              <h3 className="mt-2 text-2xl font-light tracking-tight md:text-3xl">{model?.name}</h3>
              {model?.description && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{model.description}</p>
              )}
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 text-sm">
                {model?.dimensions && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Dimensions</dt>
                    <dd className="mt-1">{model.dimensions}</dd>
                  </div>
                )}
                {model?.depth && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Depth</dt>
                    <dd className="mt-1">{model.depth}</dd>
                  </div>
                )}
                {model?.meta && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Specification</dt>
                    <dd className="mt-1">{model.meta}</dd>
                  </div>
                )}
              </dl>
              {!!model?.features?.length && (
                <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {model.features.map((f) => (
                    <li key={f} className="border-l border-border pl-3">{f}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Options + summary */}
          <div className="min-w-0">
            <h3 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Additional features
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Open a line to browse its options. Every figure below includes delivery, installation and the
              product as described.
            </p>

            <div className="mt-6">
              <EditorialFeatureConfigurator
                productType={productType}
                extras={extras}
                onExtrasChange={setExtras}
                priceMultiplier={priceMultiplier}
              />
            </div>

            {/* Live shopping list — the SAME widget the Quote Atelier and the
                Studio use, so every category shows one cart, one total. */}
            <div className="mt-8">
              <StudioCartWidget
                currentPrice={total}
                currentName={modelName}
                currentCategory={categoryLabel}
                currentExtras={breakdown}
                onRemoveCurrentExtra={handleRemoveExtra}
                onCurrentExtraQuantity={handleExtraQuantity}
                onCurrentExtraOption={handleExtraOption}
                onAddCurrent={handleAddToCart}
                onQuote={() => setQuoteOpen(true)}
              />

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button variant="outline" className="rounded-none" onClick={() => setBoardOpen(true)}>
                  Open the design board
                </Button>
                <Button variant="ghost" className="rounded-none" onClick={() => navigate("/wonderlands-studio")}>
                  Wonderlands Studio
                </Button>
              </div>
              <p className="mt-4 text-[9px] leading-relaxed text-muted-foreground">
                All prices include delivery, installation and the product as described.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />

      {/* ── The category's own drawing board, full screen ───────────────── */}
      {boardOpen && (
        <Suspense fallback={null}>
          <FlipEditorBoard
            categoryId={categoryId}
            categoryLabel={categoryLabel}
            productName={model?.name}
            productPrice={base}
            onClose={() => setBoardOpen(false)}
          />
        </Suspense>
      )}

      <SurveyQuoteTool
        pool={null}
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        extras={extras}
        customProduct={
          model
            ? { name: model.name, price: base, type: productType, image: model.image }
            : undefined
        }
      />
    </div>
  );
};

export default ProductSuite;
