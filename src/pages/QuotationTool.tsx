import * as React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlipConsole from "@/components/flip/FlipConsole";
import { ITEMS } from "@/components/FlipIndex";
import type { ConsoleEntry } from "@/components/flip/flipConsoleData";
import StudioCartWidget from "@/components/StudioCartWidget";
import SurveyQuoteTool from "@/components/SurveyQuoteTool";
import QuoteStudioConfigurator, {
  type ConfiguredProduct,
} from "@/components/quote/QuoteStudioConfigurator";
import QuoteCalculators from "@/components/quote/QuoteCalculators";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import { usePersistentState } from "@/hooks/usePersistentState";
import { toast } from "@/hooks/use-toast";

import { useNavigate } from "react-router-dom";
import { Calendar, Search, PenTool, X, Loader2 } from "lucide-react";

const FlipSearch = React.lazy(() => import("@/components/flip/FlipSearch"));
const StudioSitePlanner = React.lazy(() =>
  import("@/components/studio/StudioSitePlanner").then((m) => ({ default: m.StudioSitePlanner })),
);

/**
 * Wonderlands Quote Atelier — /quote
 *
 * A merge of the Wonderlands Studio (category console, clickable products,
 * live feature configuration, studio shopping list) with the quote engine,
 * composed in the FLIP V7 editorial language.
 */

const CONSOLE_CATEGORIES = ITEMS.map((i) => ({ id: i.id, label: i.label, tagline: i.tagline }));


const QuotationTool = () => {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();

  const [activeCategory, setActiveCategory] = usePersistentState<string>(
    "quote.console.category",
    CONSOLE_CATEGORIES[0].id,
  );
  const [entry, setEntry] = React.useState<ConsoleEntry | null>(null);
  const [entryCategory, setEntryCategory] = React.useState<string>(CONSOLE_CATEGORIES[0].id);
  const [product, setProduct] = React.useState<ConfiguredProduct | null>(null);
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = usePersistentState<boolean>("quote.search.open", false);
  const [boardOpen, setBoardOpen] = usePersistentState<boolean>("quote.board.open", false);


  const [dims, setDims] = React.useState({ w: 900, h: 620 });
  React.useEffect(() => {
    const measure = () => {
      const w = Math.max(300, Math.min(window.innerWidth - 48, 1180));
      setDims({ w, h: Math.round(Math.min(w * 0.62, Math.max(480, window.innerHeight * 0.74))) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const categoryLabel =
    CONSOLE_CATEGORIES.find((c) => c.id === entryCategory)?.label ?? "Wonderlands";

  const configuratorRef = React.useRef<HTMLDivElement | null>(null);

  const handleSelectEntry = (selected: ConsoleEntry, categoryId: string) => {
    setEntry(selected);
    setEntryCategory(categoryId);
    requestAnimationFrame(() =>
      configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const toCartItem = (p: ConfiguredProduct) => ({
    id: p.id,
    name: p.name,
    price: p.basePrice,
    image: p.image,
    category: p.category,
    extras: p.extras.map(({ name, price, key, quantity, selectedOption, options }) => ({
      name,
      price,
      key,
      quantity,
      selectedOption,
      options,
    })),
  });

  /* The shopping list adds the piece by itself 10 seconds after it is
     selected — unless the reader leaves the page or moves to another piece. */
  const AUTO_ADD_SECONDS = 10;
  const [autoIn, setAutoIn] = React.useState<number | null>(null);
  const addedRef = React.useRef<string | null>(null);
  const productRef = React.useRef<ConfiguredProduct | null>(null);
  productRef.current = product;

  const handleAdd = React.useCallback(
    (p: ConfiguredProduct) => {
      addedRef.current = p.id;
      setAutoIn(null);
      addToCart(toCartItem(p));
    },
    [addToCart],
  );

  React.useEffect(() => {
    if (!entry || addedRef.current === entry.id) {
      setAutoIn(null);
      return;
    }
    setAutoIn(AUTO_ADD_SECONDS);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = AUTO_ADD_SECONDS - Math.round((Date.now() - started) / 1000);
      if (left > 0) {
        setAutoIn(left);
        return;
      }
      window.clearInterval(tick);
      setAutoIn(null);
      const current = productRef.current;
      if (current && addedRef.current !== current.id) {
        addedRef.current = current.id;
        addToCart(toCartItem(current));
        toast({
          title: "Added to your shopping list",
          description: `${current.name} — as configured.`,
        });
      }
    }, 250);
    return () => window.clearInterval(tick);
  }, [entry?.id, addToCart]);


  const handleQuote = (p: ConfiguredProduct) => {
    setProduct(p);
    setQuoteOpen(true);
  };

  const quoteExtras = React.useMemo(() => {
    if (!product) return undefined;
    return {
      extrasBreakdown: product.extras.map((e) => ({
        name: e.name,
        price: e.price,
        image: e.image ?? "",
      })),
      extrasTotal: product.extras.reduce((sum, e) => sum + e.price, 0),
    };
  }, [product]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* FLIP navigation console — search engine and design board */}
      <div className="pointer-events-none fixed left-2 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div className="pointer-events-auto flex flex-col gap-1 rounded-full border border-border/50 bg-background/50 p-2 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            title="FLIP Search Engine"
            aria-label="FLIP Search Engine"
            aria-pressed={searchOpen}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              searchOpen
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            <Search className="h-[15px] w-[15px]" />
          </button>
          <span className="mx-auto my-1 h-px w-4 bg-border" />
          <button
            onClick={() => setBoardOpen((v) => !v)}
            title="Design board"
            aria-label="Design board"
            aria-pressed={boardOpen}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              boardOpen
                ? "bg-primary text-primary-foreground"
                : "text-primary hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            <PenTool className="h-[15px] w-[15px]" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-4 py-10 md:py-14">

        {/* Masthead — FLIP V7 */}
        <div className="border-y border-foreground/15 py-8 text-center">
          <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">
            Wonderlands World — Edition No. 07
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light leading-none text-foreground md:text-6xl">
            The Quote Atelier
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Browse the collections, configure the piece, compose the quotation
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-8">
            {/* Category console */}
            <div className="flex justify-center">
              <FlipConsole
                categories={CONSOLE_CATEGORIES}
                activeId={activeCategory}
                width={dims.w}
                height={dims.h}
                onSelect={setActiveCategory}
                onClose={() => undefined}
                hideClose
                onSelectEntry={handleSelectEntry}
                activeEntryId={entry?.id}
                footerLabel="Open in Wonderlands Studio"
                onOpenSection={(id) => navigate(`/wonderlands-studio?category=${id}`)}
              />
            </div>

            {/* Configurator */}
            <div ref={configuratorRef}>
              {entry ? (
                <QuoteStudioConfigurator
                  key={entry.id}
                  entry={entry}
                  categoryId={entryCategory}
                  categoryLabel={categoryLabel}
                  onChange={setProduct}
                  onAdd={handleAdd}
                  onQuote={handleQuote}
                />
              ) : (
                <div className="border border-dashed border-foreground/20 bg-background/60 px-6 py-14 text-center backdrop-blur-xl">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                    Chapter II
                  </p>
                  <p className="mx-auto mt-3 max-w-md font-serif text-2xl font-light text-foreground">
                    Select a piece from the console above to configure it and price it here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shopping list + quote actions */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <StudioCartWidget
              currentPrice={product?.total ?? 0}
              currentName={product?.name}
              currentCategory={product?.category}
              currentExtras={product?.extras}
              onAddCurrent={product ? () => handleAdd(product) : undefined}
              onQuote={product ? () => handleQuote(product) : () => setQuoteOpen(true)}
            />

            {autoIn !== null && product && (
              <div className="flex items-center justify-between border border-foreground/15 bg-background/60 px-4 py-3 backdrop-blur-xl">
                <p className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                  Adding to your list in {autoIn}s
                </p>
                <button
                  onClick={() => {
                    addedRef.current = product.id;
                    setAutoIn(null);
                  }}
                  className="text-[9px] uppercase tracking-[0.28em] text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Not now
                </button>
              </div>
            )}


            <button
              onClick={() =>
                window.open("https://calendly.com/wonderlandsworlds/30min", "_blank", "noopener")
              }
              className="flex w-full items-center justify-center gap-2 border border-border/60 bg-background/60 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-foreground backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
            >
              <Calendar className="h-3.5 w-3.5" /> Book a designer
            </button>

            <div className="border border-foreground/15 bg-background/60 px-5 py-4 backdrop-blur-xl">
              <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
                The house standard
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "Turnkey — permits, engineering, land work, logistics",
                  "Florida licensed and insured",
                  "Delivery and installation included",
                  "Complimentary design consultation",
                ].map((line) => (
                  <li
                    key={line}
                    className="border-t border-border/50 pt-2 text-[11px] leading-relaxed text-foreground/80"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Chapter III — the calculators, as in the showroom */}
        <div className="mt-14">
          <QuoteCalculators />
        </div>

        <p className="mt-10 text-center text-[8px] uppercase tracking-[0.35em] text-muted-foreground">
          All prices include delivery, installation and the product as described.
        </p>
      </main>

      {/* FLIP Search Engine — results open the piece in the configurator */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/70 px-4 py-10 backdrop-blur-xl">
          <div className="w-full max-w-2xl border border-foreground/15 bg-background/90 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
                FLIP Search Engine
              </p>
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="flex h-7 w-7 items-center justify-center border border-border/60 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-4">
              <React.Suspense fallback={<Loader2 className="mx-auto my-8 h-4 w-4 animate-spin" />}>
                <FlipSearch
                  autoFocus
                  onOpenCategory={(id) => {
                    setActiveCategory(id);
                    setSearchOpen(false);
                  }}
                  onOpenProduct={(categoryId, found) => {
                    setActiveCategory(categoryId);
                    handleSelectEntry(found, categoryId);
                    setSearchOpen(false);
                  }}
                />
              </React.Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Design board — the 2D site studio, as in the FLIP */}
      {boardOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-2 py-6 backdrop-blur-xl md:px-6">
          <div className="w-full max-w-[1240px] border border-foreground/15 bg-background/95">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
                Design board — {entry?.name ?? "Wonderlands"}
              </p>
              <button
                onClick={() => setBoardOpen(false)}
                aria-label="Close design board"
                className="flex h-7 w-7 items-center justify-center border border-border/60 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="max-h-[82vh] overflow-y-auto p-3 md:p-5">
              <React.Suspense fallback={<Loader2 className="mx-auto my-10 h-4 w-4 animate-spin" />}>
                <StudioSitePlanner
                  modelName={entry?.name}
                  meta={entry?.meta}
                  categoryId={entryCategory}
                />
              </React.Suspense>
            </div>
          </div>
        </div>
      )}

      <SurveyQuoteTool
        pool={null}
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        extras={quoteExtras}
        customProduct={
          product
            ? {
                name: product.name,
                price: product.basePrice,
                type: product.category,
                image: product.image,
              }
            : undefined
        }
      />


      <Footer />
    </div>
  );
};

export default QuotationTool;
