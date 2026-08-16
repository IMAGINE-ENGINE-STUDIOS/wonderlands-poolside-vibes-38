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

  const handleAdd = (p: ConfiguredProduct) => addToCart(toCartItem(p));

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

        <p className="mt-10 text-center text-[8px] uppercase tracking-[0.35em] text-muted-foreground">
          All prices include delivery, installation and the product as described.
        </p>
      </main>

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
