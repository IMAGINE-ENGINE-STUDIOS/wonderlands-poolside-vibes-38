import * as React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, LayoutList, Sparkles, Ruler, Images, Calculator, Plus, Check, BookOpen, PenTool, Search, X } from "lucide-react";
import { ITEMS } from "@/components/FlipIndex";
import { loadCategoryEntries, getCachedCategoryEntries, formatEntryPrice, type ConsoleEntry } from "./flipConsoleData";
import { preloadImages, prefetchEditions } from "@/lib/flipPreload";
import FlipSearch from "@/components/flip/FlipSearch";
import usePersistentState from "@/hooks/usePersistentState";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";
import FlipCart from "./FlipCart";
import { useProductBookPages } from "./FlipProductBook";
import { pushSpread } from "./FlipSpread";

/** Placeholder so the dossier page hook can run unconditionally. */
const EMPTY_DOSSIER_ENTRY = { id: "none", name: "", image: "", price: null } as any;
import FlipEditorBoard, { boardForCategory } from "./FlipEditorBoard";
import { mergeStudioGroups } from "@/lib/flipStudioFeatures";
import heroVideo from "@/assets/hero-beach.mp4.asset.json";

/**
 * FLIP — Magazine edition.
 * Opens on a main edition page (company products + every category), then travels
 * one category per page. Selecting a category opens its own magazine: every
 * model gets a spread and every option group becomes a chapter page.
 */

type OptionGroup = { title: string; note: string; options: string[] };

const OPTION_GROUPS: Record<string, OptionGroup[]> = {
  pools: [
    { title: "Interior Finish", note: "How the water carries light", options: ["Sapphire Blue G3", "Aquamarine G3", "Ocean Blue G3", "Night Sky G3", "Shale Gray G3", "Lagoon Blue G2"] },
    { title: "Waterline & Coping", note: "The edge detail", options: ["Glass mosaic waterline", "Porcelain waterline", "Travertine bullnose coping", "Porcelain coping", "Coralina coping"] },
    { title: "Deck & Surround", note: "The frame of the picture", options: ["Travertine pavers", "Porcelain pavers", "Coralina pavers — $25/sq ft", "Concrete deck — from $10/sq ft", "Artificial turf border"] },
    { title: "Water & Comfort", note: "Systems set on delivery day", options: ["Heat pump heater", "Gas heater", "Hydrotherapy jets", "Bubblers", "Spillover spa", "Rocky waterfall"] },
    { title: "Light & Control", note: "Evening character", options: ["Color LED spectrum lighting", "Automation & app control", "Salt system", "Variable speed pump", "Automatic cover"] },
    { title: "Enclosure", note: "Open air, refined", options: ["Mansard screen enclosure", "Gable screen enclosure", "4ft aluminum pool fence", "5ft aluminum pool fence", "Self-latching pool door"] },
  ],
  spas: [
    { title: "Configuration", note: "How it meets the pool", options: ["Spillover to pool", "Standalone vessel", "Raised bond beam", "Flush with deck"] },
    { title: "Hydrotherapy", note: "Programmable comfort", options: ["Six-jet package", "Ten-jet package", "Neck jets", "Air blower"] },
    { title: "Finish & Light", note: "Surface and spectrum", options: ["Lagoon Blue G2", "Sapphire Blue G3", "Night Sky G3", "Color LED spectrum"] },
    { title: "Heating", note: "Warm room at the water's edge", options: ["Dedicated heat pump", "Gas heater", "Automation & app control", "Insulated spa cover"] },
  ],
  saunas: [
    { title: "Heater", note: "Quiet heat", options: ["Harvia electric heater", "Wood-burning heater", "Harvia Cilindro", "Sauna stones package"] },
    { title: "Interior", note: "Cedar and spruce", options: ["Cedar benching", "Thermally treated spruce", "Backrests", "LED under-bench lighting"] },
    { title: "Glass & Door", note: "Light in the cabin", options: ["Bronze glass door", "Clear glass door", "Panoramic rear window", "Front porch window"] },
    { title: "Site & Delivery", note: "Set and wired on arrival", options: ["Paver pad", "Concrete pad", "Electrical run", "Roof shingle upgrade"] },
  ],
  pavers: [
    { title: "Field Pattern", note: "Laid on compacted base", options: ["Ashlar", "French pattern", "Running bond", "Herringbone", "Modular mix"] },
    { title: "Edge & Coping", note: "The defined perimeter", options: ["Bullnose coping", "Square edge coping", "Soldier course border", "Contrast banding"] },
    { title: "Base System", note: "Underfoot for decades", options: ["Compacted limerock base", "Polymeric sand joints", "Drainage channel", "Sealer application"] },
  ],
  "artificial-grass": [
    { title: "Turf Density", note: "Permanently green", options: ["Standard density", "High density", "Pet-grade", "Putting green"] },
    { title: "Base & Drainage", note: "Under the green", options: ["Compacted base", "Shock pad", "Drainage grid", "Weed barrier"] },
    { title: "Edging", note: "Hidden seams", options: ["Paver edge", "Bender board", "Nail-down perimeter", "Turf-to-paver transition"] },
  ],
  landscaping: [
    { title: "Canopy", note: "Height and shadow", options: ["Specimen palms", "Shade trees", "Ornamental trees", "Hedging screen"] },
    { title: "Beds", note: "Mass and season", options: ["Ornamental grasses", "Flowering shrubs", "Ground cover", "Mulch or shell"] },
    { title: "Systems", note: "Kept alive quietly", options: ["Drip irrigation", "Spray zones", "Landscape lighting", "Smart controller"] },
  ],
  "screen-enclosures": [
    { title: "Profile", note: "Engineered to Florida wind load", options: ["Mansard", "Gable", "Hip", "Flat pan"] },
    { title: "Screen", note: "Air and shade", options: ["18/14 standard mesh", "20/20 no-see-um", "Florida Glass privacy", "Pet-resistant mesh"] },
    { title: "Access", note: "Code compliant", options: ["Self-latching pool door", "Double door", "Kickplate upgrade", "Super gutter"] },
  ],
  "patio-fencing": [
    { title: "Height", note: "Pool-code compliant", options: ["4ft aluminum", "5ft aluminum", "6ft privacy", "Custom raked panels"] },
    { title: "Finish", note: "Corrosion resistant", options: ["Black powder coat", "Bronze powder coat", "White powder coat", "Textured matte"] },
    { title: "Gates", note: "Quiet against a garden", options: ["Self-closing pedestrian gate", "Double gate", "Keyed latch", "Magnetic latch"] },
  ],
  lanai: [
    { title: "Roof", note: "Covered living", options: ["Insulated panel roof", "Screen panel roof", "Shingle match to home", "Skylight panels"] },
    { title: "Comfort", note: "Shade companion", options: ["Ceiling fans", "Recessed lighting", "Outdoor speakers", "Retractable shades"] },
    { title: "Span", note: "Drawn to the house", options: ["12ft projection", "16ft projection", "20ft projection", "Custom span"] },
  ],
  "driveway-gates": [
    { title: "Operation", note: "Arrival statement", options: ["Swing — single", "Swing — double", "Slide", "Cantilever slide"] },
    { title: "Automation", note: "First line of the drawing", options: ["Keypad entry", "Intercom", "Loop detector", "Solar operator"] },
    { title: "Infill", note: "Pattern and privacy", options: ["Vertical picket", "Horizontal slat", "Privacy panel", "Custom laser-cut"] },
  ],
  covers: [
    { title: "System", note: "One key turn", options: ["Recessed track", "Top track", "Under-bench housing", "Deck lid"] },
    { title: "Fabric", note: "Safety rated", options: ["Vinyl solid", "Mesh", "Solar heat retention", "Custom color"] },
  ],
  "tanning-ledges": [
    { title: "Depth & Shelf", note: "Threshold between deck and depth", options: ["9in shelf", "6in–10in graded", "In-water seating", "Step entry"] },
    { title: "Detail", note: "Sun shelf character", options: ["Bubblers", "Umbrella sleeve", "Matched shell finish", "Mosaic accent band"] },
  ],
  finishes: [
    { title: "Grade", note: "Surface and light", options: ["G2 finish", "G3 finish", "Gelcoat — GlimmerGlass only", "Sample-matched palette"] },
    { title: "Accent", note: "Where the eye lands", options: ["Waterline mosaic", "Step marker tile", "Spa band", "Bench inlay"] },
  ],
  liners: [
    { title: "Print", note: "Inner hue", options: ["Glass mosaic print", "Porcelain print", "Italian stone print", "Solid tone"] },
    { title: "Border", note: "Waterline character", options: ["Waterline border", "Mosaic band", "Borderless", "Contrast step band"] },
  ],
};

const fallbackGroups: OptionGroup[] = [
  { title: "Specification", note: "Drawn to the property", options: ["Site measurement", "Permit drawings", "Turnkey installation", "Warranty registration"] },
];

const MAX_MODELS = 24;

const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[9px] uppercase tracking-[0.35em] text-muted-foreground ${className}`}>{children}</p>
);

const Leaf = forwardRef<HTMLDivElement, { children: React.ReactNode; tone?: "paper" | "cover" }>(
  ({ children, tone = "paper" }, ref) => (
    <div
      ref={ref}
      className={
        tone === "cover"
          ? "h-full w-full overflow-hidden bg-foreground text-background"
          : "h-full w-full overflow-hidden bg-background text-foreground"
      }
      style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.06)" }}
    >
      {children}
    </div>
  ),
);
Leaf.displayName = "Leaf";

type Page = { key: string; render: () => React.ReactNode; tone?: "paper" | "cover" };

type Anchors = { index: number; features: number; code: number; gallery: number; estimate: number };

const FlipMagazine: React.FC = () => {
  const bookRef = useRef<any>(null);
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 420, h: 560 });
  const [mode, setMode] = usePersistentState<"home" | "category">("flip.mag.mode", "home");
  const [categoryId, setCategoryId] = usePersistentState<string>("flip.mag.category", ITEMS[0].id);
  const [savedPage, setSavedPage] = usePersistentState<number>("flip.mag.page", 0);
  const [entries, setEntries] = useState<ConsoleEntry[] | null>(null);
  const [searchOpen, setSearchOpen] = usePersistentState<boolean>("flip.mag.search", false);
  const [page, setPage] = useState(savedPage);
  const startPageRef = useRef(savedPage);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isPortrait = vw < 900;
      setPortrait(isPortrait);
      const ratio = isPortrait ? 1.38 : vw >= 1800 ? 1.02 : vw >= 1440 ? 1.1 : 1.24;
      const maxH = Math.max(420, Math.floor(vh * (isPortrait ? 0.76 : 0.86)));
      const availableW = Math.min(vw - (isPortrait ? 32 : 120), 2400);
      const wByWidth = isPortrait ? availableW : Math.floor(availableW / 2);
      const w = Math.max(260, Math.min(wByWidth, Math.floor(maxH / ratio)));
      setDims({ w, h: Math.round(w * ratio) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Load the selected category edition — served instantly from cache when warm.
  useEffect(() => {
    if (mode !== "category") return;
    let alive = true;
    const cached = getCachedCategoryEntries(categoryId);
    setEntries(cached ?? null);
    if (cached) return;
    loadCategoryEntries(categoryId)
      .then((list) => alive && setEntries(list))
      .catch(() => alive && setEntries([]));
    return () => {
      alive = false;
    };
  }, [categoryId, mode]);

  // Warm every edition and its cover art in the background, current one first.
  useEffect(() => {
    preloadImages(ITEMS.flatMap((i) => i.images ?? []).slice(0, 24));
    prefetchEditions(ITEMS.map((i) => i.id), categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSavedPage(page);
  }, [page, setSavedPage]);

  const category = ITEMS.find((i) => i.id === categoryId) ?? ITEMS[0];
  const groups = useMemo(
    () => mergeStudioGroups(categoryId, OPTION_GROUPS[categoryId] ?? fallbackGroups),
    [categoryId],
  );
  const products = useMemo(() => (entries ?? []).slice(0, MAX_MODELS), [entries]);

  // Pages ahead of the reader: decode their plates before the flip happens.
  useEffect(() => {
    if (!products.length) return;
    preloadImages(products.slice(0, 6).map((p) => p.image), true);
    preloadImages(products.slice(6).map((p) => p.image));
    preloadImages(groups.flatMap((g: any) => (g.items ?? []).map((o: any) => o?.image)));
  }, [products, groups]);

  // Cross-fade the book while an edition is swapped in — the page never changes,
  // only the content inside the flip.
  const [fading, setFading] = useState(false);
  const swapTimer = useRef<number | null>(null);
  const swap = useCallback((apply: () => void) => {
    setFading(true);
    if (swapTimer.current) window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      startPageRef.current = 0;
      setPage(0);
      apply();
    }, 220);
  }, []);
  useEffect(() => () => { if (swapTimer.current) window.clearTimeout(swapTimer.current); }, []);

  const openCategory = useCallback(
    (id: string) => {
      swap(() => {
        setDossier(null);
        setCategoryId(id);
        setMode("category");
      });
    },
    [swap, setCategoryId, setMode],
  );

  const openProduct = useCallback(
    (id: string, entry: ConsoleEntry) => {
      swap(() => {
        setCategoryId(id);
        setMode("category");
        setDossier(entry);
      });
    },
    [swap, setCategoryId, setMode],
  );

  const openHome = useCallback(() => {
    swap(() => {
      setDossier(null);
      setMode("home");
    });
  }, [swap, setMode]);


  /* ------------------------------- ORDER DESK ------------------------------- */
  const cart = useOptionalShoppingCart();
  const cartItems = cart?.cartItems ?? [];
  const inCart = useCallback(
    (p: ConsoleEntry) => cartItems.some((c) => c.id === `flip-${categoryId}-${p.id}`),
    [cartItems, categoryId],
  );
  const addEntry = useCallback(
    (p: ConsoleEntry) => {
      if (!cart) return;
      cart.addToCart({
        id: `flip-${categoryId}-${p.id}`,
        name: p.name,
        price: p.price ?? 0,
        image: p.image,
        category: category.label,
      });
      cart.setIsCartOpen?.(false);
    },
    [cart, categoryId, category.label],
  );

  /** Editorial add-to-order control used across the magazine pages. */
  const AddButton: React.FC<{ entry: ConsoleEntry; tone?: "light" | "dark" }> = ({ entry, tone = "light" }) => {
    const added = inCart(entry);
    return (
      <button
        onClick={() => addEntry(entry)}
        className={`inline-flex items-center justify-between gap-3 border px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] transition-colors ${
          tone === "dark"
            ? "border-white/70 text-white hover:bg-white hover:text-black"
            : added
              ? "border-foreground bg-foreground text-background"
              : "border-foreground text-foreground hover:bg-foreground hover:text-background"
        }`}
      >
        {added ? "In your order" : "Add to the order"}
        {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      </button>
    );
  };

  /* -------------------------------- DOSSIER --------------------------------- */
  const [dossier, setDossier] = useState<ConsoleEntry | null>(null);

  /** Opens a model's book inside the same flip, with the editorial cross-fade. */
  const openDossier = useCallback((p: ConsoleEntry) => swap(() => setDossier(p)), [swap]);
  const closeDossier = useCallback(() => swap(() => setDossier(null)), [swap]);

  /* ------------------------------ EDITOR BOARD ------------------------------ */
  // The design board takes over the page: the flip fades out while a wireframe
  // is traced from the corners, then the board rises in its place.
  const [boardOpen, setBoardOpen] = useState(false);
  const boardTimer = useRef<number | null>(null);
  const openBoard = useCallback(() => {
    setFading(true);
    if (boardTimer.current) window.clearTimeout(boardTimer.current);
    boardTimer.current = window.setTimeout(() => setBoardOpen(true), 320);
  }, []);
  const closeBoard = useCallback(() => {
    if (boardTimer.current) window.clearTimeout(boardTimer.current);
    setBoardOpen(false);
    setFading(false);
  }, []);
  useEffect(() => () => { if (boardTimer.current) window.clearTimeout(boardTimer.current); }, []);
  const boardMeta = boardForCategory(categoryId);

  /** Opens the product's own small book. */
  const MoreButton: React.FC<{ entry: ConsoleEntry; tone?: "light" | "dark" }> = ({ entry, tone = "light" }) => (
    <button
      onClick={() => openDossier(entry)}
      className={`inline-flex items-center justify-between gap-3 border px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] transition-colors ${
        tone === "dark"
          ? "border-white/50 text-white hover:bg-white hover:text-black"
          : "border-border/60 text-foreground hover:bg-foreground hover:text-background"
      }`}
    >
      More
      <BookOpen className="h-3.5 w-3.5" />
    </button>
  );

  /** Product title that opens the model's own book in place — no screen change. */
  const ProductTitle: React.FC<{ entry: ConsoleEntry; className?: string }> = ({ entry, className = "" }) => (
    <button
      onClick={() => openDossier(entry)}
      title={`Open the ${entry.name} book`}
      className={`block w-full text-left ${className}`}
    >
      <span className="border-b border-current/30 pb-0.5 transition-colors hover:border-current">{entry.name}</span>
    </button>
  );



  /* ---------------------------------- HOME ---------------------------------- */
  const homePages = useMemo<Page[]>(() => {
    const hero = ITEMS.slice(0, 6);
    const list: Page[] = [];

    list.push({
      key: "home-left",
      render: () => (
        <div className="relative h-full w-full overflow-hidden">
          <video
            src={heroVideo.url}
            poster={ITEMS[0].images[0]}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/85" />
          <div className="relative flex h-full flex-col justify-between p-8 text-white sm:p-10">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[9px] uppercase tracking-[0.45em] opacity-80">Wonderlands World</p>
              <p className="text-[9px] uppercase tracking-[0.45em] opacity-60">Edition No. 01</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-70">The Outdoor Annual</p>
              <h2 className="mt-4 font-serif text-5xl font-light leading-[0.95] sm:text-7xl">FLIP</h2>
              <div className="mt-6 h-px w-20 bg-current opacity-50" />
              <p className="mt-6 max-w-sm text-[12px] leading-relaxed opacity-85">
                Water, stone, shelter and verdure — one house, one composition. Every discipline drawn, priced and
                installed turnkey at your address.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-white/25 pt-4">
              {[
                ["14", "Disciplines"],
                ["Turnkey", "Installation"],
                ["Florida", "Engineered"],
              ].map(([a, b]) => (
                <div key={b}>
                  <p className="font-serif text-2xl font-light leading-none">{a}</p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.3em] opacity-70">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    });

    list.push({
      key: "home-right",
      render: () => (
        <div className="flex h-full w-full flex-col p-8 sm:p-10">
          <div className="flex items-baseline justify-between gap-3">
            <Eyebrow>The Collection</Eyebrow>
            <Eyebrow className="hidden sm:block">Index</Eyebrow>
          </div>
          <h3 className="mt-2 font-serif text-3xl font-light leading-tight sm:text-4xl">All Categories</h3>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {hero.map((it) => (
              <button
                key={it.id}
                onClick={() => openCategory(it.id)}
                className="group relative aspect-[4/5] overflow-hidden"
              >
                <img
                  src={it.images[0]}
                  alt={it.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <span className="absolute inset-x-2 bottom-2 text-left text-[8px] uppercase tracking-[0.25em] text-white">
                  {it.label}
                </span>
              </button>
            ))}
          </div>

          <ul className="mt-5 min-h-0 flex-1 overflow-hidden">
            {ITEMS.map((it, i) => (
              <li key={it.id}>
                <button
                  onClick={() => openCategory(it.id)}
                  className="flex w-full items-baseline justify-between gap-4 border-t border-border/50 py-[7px] text-left transition-colors hover:text-foreground"
                >
                  <span className="truncate text-[11px] uppercase tracking-[0.2em] text-foreground">
                    {String(i + 1).padStart(2, "0")} — {it.label}
                  </span>
                  <span className="shrink-0 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                    {it.tagline}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border/50 pt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Turn the page to travel the disciplines
          </p>
        </div>
      ),
    });

    ITEMS.forEach((it, i) => {
      list.push({
        key: `home-cat-${it.id}`,
        render: () => (
          <div className="flex h-full w-full flex-col p-7 sm:p-9">
            <div className="flex items-baseline justify-between gap-3">
              <Eyebrow>
                {String(i + 1).padStart(2, "0")} — {it.tagline}
              </Eyebrow>
              <Eyebrow className="hidden sm:block">Wonderlands World</Eyebrow>
            </div>
            <div className="relative mt-3 min-h-0 flex-1 overflow-hidden">
              <img
                src={it.images[0]}
                alt={it.label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            </div>
            <button
              onClick={() => openCategory(it.id)}
              title={`Open the ${it.label} edition`}
              className="mt-4 block text-left font-serif text-3xl font-light leading-tight sm:text-4xl"
            >
              <span className="border-b border-border/60 pb-0.5 transition-colors hover:border-foreground">
                {it.label}
              </span>
            </button>

            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{it.description}</p>
            <ul className="mt-3 space-y-1.5">
              {it.notes.map((n) => (
                <li
                  key={n}
                  className="flex items-start gap-2 border-t border-border/50 pt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  <span className="mt-[5px] h-px w-3 shrink-0 bg-foreground/40" />
                  {n}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openCategory(it.id)}
              className="mt-4 inline-flex w-full items-center justify-between border border-foreground bg-foreground px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Open the {it.label} edition
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      });
    });

    if (list.length % 2 !== 0) {
      list.push({
        key: "home-colophon",
        render: () => (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-10 text-center">
            <Eyebrow>Colophon</Eyebrow>
            <p className="font-serif text-2xl font-light">Wonderlands World</p>
            <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
              One outdoor world — water, stone, shelter, verdure. Delivered turnkey.
            </p>
          </div>
        ),
      });
    }
    return list;
  }, [openCategory]);

  /* -------------------------------- CATEGORY -------------------------------- */
  const { pages: categoryPages, anchors } = useMemo<{ pages: Page[]; anchors: Anchors }>(() => {
    const list: Page[] = [];
    const at = { products: 0 };
    const shots = [...category.images, ...products.slice(0, 8).map((p) => p.image)].filter(Boolean) as string[];


    list.push({
      key: "cover",
      tone: "cover",
      render: () => (
        <div className="relative h-full w-full">
          <img
            src={category.images[0]}
            alt={category.label}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
          <div className="relative flex h-full flex-col justify-between p-8 sm:p-10">
            <p className="text-[9px] uppercase tracking-[0.45em] opacity-80">Wonderlands World — FLIP Magazine</p>
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-70">{category.tagline}</p>
              <h2 className="mt-3 font-serif text-4xl font-light leading-none sm:text-6xl">{category.label}</h2>
              <div className="mt-5 h-px w-16 bg-current opacity-50" />
              <p className="mt-5 max-w-md text-[12px] leading-relaxed opacity-80">{category.description}</p>
            </div>
            <p className="text-[9px] uppercase tracking-[0.4em] opacity-70">
              {products.length ? `${products.length} models · ${groups.length} option chapters` : "Loading edition"}
            </p>
          </div>
        </div>
      ),
    });

    list.push({
      key: "contents",
      render: () => (
        <div className="flex h-full w-full flex-col p-8 sm:p-10">
          <Eyebrow>Contents</Eyebrow>
          <h3 className="mt-2 font-serif text-3xl font-light leading-tight">{category.label}</h3>
          <ul className="mt-5 min-h-0 flex-1 overflow-hidden">
            {products.map((p, i) => (
              <li key={p.id}>
                <button
                  onClick={() => bookRef.current?.pageFlip()?.turnToPage(at.products + i * 2)}
                  className="flex w-full items-baseline justify-between gap-4 border-t border-border/50 py-[7px] text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  <span className="truncate text-foreground">
                    {String(i + 1).padStart(2, "0")} — {p.name}
                  </span>
                  <span className="shrink-0">{formatEntryPrice(p)}</span>
                </button>
              </li>
            ))}
            {!products.length && <li className="pt-6 text-[11px] text-muted-foreground">Composing pages…</li>}
          </ul>
          <p className="mt-4 border-t border-border/50 pt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            {products.length} models · option chapters follow the collection
          </p>
        </div>
      ),
    });

    /* ----------------------------- EDITOR'S LETTER ---------------------------- */
    list.push({
      key: "letter",
      render: () => (
        <div className="flex h-full w-full flex-col p-8 sm:p-10">
          <Eyebrow>From the studio</Eyebrow>
          <h3 className="mt-2 font-serif text-3xl font-light leading-tight sm:text-4xl">
            On {category.label.toLowerCase()}
          </h3>
          <div className="mt-3 h-px w-16 origin-left bg-foreground/40 animate-rule-draw" />
          <p className="mt-5 text-[13px] leading-relaxed text-foreground/90 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.8]">
            {category.description}
          </p>
          <div className="relative mt-5 min-h-0 flex-1 overflow-hidden">
            <img
              src={shots[1] ?? category.images[0]}
              alt={`${category.label} detail`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
            />
          </div>
          <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            {category.tagline} — photographed on site in Florida
          </p>
        </div>
      ),
    });

    /* statement spread — the edition opener, image across both pages */
    pushSpread(list, {
      key: `statement-${category.id}`,
      image: shots[2] ?? category.images[0],
      eyebrow: `Wonderlands World's`,
      title: category.label,
      titleItalic: category.tagline,
      body: category.description,
      stats: [
        { value: String(products.length || "—"), label: "Models in this edition" },
        { value: (products[0] ? formatEntryPrice(products[0]) : "") || "On request", label: "From" },
        { value: "Turnkey", label: "Delivered & installed" },
      ],
      lockup: "Wonderlands World — FLIP",
      caption: `${category.label} — Florida engineered`,
    });

    /* index spread — contents set over full imagery */
    pushSpread(list, {
      key: `index-${category.id}`,
      image: shots[3] ?? shots[0] ?? category.images[0],
      eyebrow: "The Collection",
      title: "Index",
      titleItalic: category.label,
      body: "Every model in this edition, priced with delivery and installation at your address.",
      lockup: "Wonderlands World — FLIP",
      right: () => (
        <ul className="h-full overflow-hidden">
          {products.slice(0, 14).map((p, i) => (
            <li key={p.id}>
              <button
                onClick={() => bookRef.current?.pageFlip()?.turnToPage(at.products + i * 2)}
                className="flex w-full items-baseline justify-between gap-4 border-t border-white/25 py-[6px] text-left text-[10px] uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white"
              >
                <span className="truncate">{String(i + 1).padStart(2, "0")} — {p.name}</span>
                <span className="shrink-0 text-white/60">{formatEntryPrice(p)}</span>
              </button>
            </li>
          ))}
        </ul>
      ),
    });

    /* -------------------------------- GALLERY --------------------------------- */
    const galleryAt = list.length;

    list.push({
      key: "gallery-a",
      render: () => (
        <div className="flex h-full w-full flex-col p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-3">
            <Eyebrow>Portfolio</Eyebrow>
            <Eyebrow className="hidden sm:block">Plate I</Eyebrow>
          </div>
          <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-1.5">
            {shots.slice(0, 6).map((src, i) => (
              <div key={`${src}-${i}`} className={`relative overflow-hidden ${i === 0 ? "col-span-2" : ""}`}>
                <img
                  src={src}
                  alt={`${category.label} plate ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] hover:scale-105"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            {category.label} — completed compositions
          </p>
        </div>
      ),
    });

    list.push({
      key: "gallery-b",
      render: () => (
        <div className="flex h-full w-full flex-col justify-between p-8 sm:p-10">
          <div>
            <Eyebrow>What is included</Eyebrow>
            <h3 className="mt-2 font-serif text-3xl font-light leading-tight">Turnkey, to the last joint</h3>
          </div>
          <ul className="mt-5 grid gap-0">
            {[
              ["Survey & drawings", "Property measured, permit set drawn and submitted"],
              ["Engineering", "Florida wind-load and pool-code compliant details"],
              ["Installation", "Crews, cranes, base work and finish carpentry"],
              ["Systems", "Plumbing, electric, automation, start-up and balance"],
              ["Handover", "Walkthrough, warranty registration, care schedule"],
            ].map(([k, v]) => (
              <li key={k} className="border-t border-border/50 py-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">{k}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{v}</p>
              </li>
            ))}
          </ul>
          <p className="border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
            Every figure in this edition includes installation at your home address.
          </p>
        </div>
      ),
    });

    /* ------------------------------- COLLECTION ------------------------------- */
    at.products = list.length;

    products.forEach((p, idx) => {
      const number = String(idx + 1).padStart(2, "0");

      list.push({
        key: `${p.id}-hero`,
        render: () => (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
            <div className="relative flex h-full flex-col justify-end p-8 text-white sm:p-10">
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-80">
                {number} — {p.brand ?? category.label}
              </p>
              <ProductTitle entry={p} className="mt-2 font-serif text-3xl font-light leading-tight sm:text-5xl" />
              {p.meta && <p className="mt-3 max-w-sm text-[11px] leading-relaxed opacity-80">{p.meta}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/25 pt-4">
                <p className="font-serif text-2xl font-light">{formatEntryPrice(p) || "On request"}</p>
                <AddButton entry={p} tone="dark" />
                <MoreButton entry={p} tone="dark" />
              </div>
            </div>
          </div>
        ),
      });

      list.push({
        key: `${p.id}-spec`,
        render: () => (
          <div className="flex h-full w-full flex-col p-8 sm:p-10">
            <Eyebrow>{number} — Specification</Eyebrow>
            <ProductTitle entry={p} className="mt-2 font-serif text-3xl font-light leading-tight" />
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <Eyebrow>Investment</Eyebrow>
                <p className="mt-1 font-serif text-2xl font-light">{formatEntryPrice(p) || "On request"}</p>
              </div>
              <div>
                <Eyebrow>Discipline</Eyebrow>
                <p className="mt-1 font-serif text-2xl font-light">{category.label}</p>
              </div>
            </div>

            <div className="relative mt-5 h-[34%] overflow-hidden">
              <img
                src={p.image}
                alt={`${p.name} detail`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
              />
            </div>

            <ul className="mt-4 space-y-1.5">
              {category.notes.map((n) => (
                <li
                  key={n}
                  className="flex items-start gap-2 border-t border-border/50 pt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  <span className="mt-[5px] h-px w-3 shrink-0 bg-foreground/40" />
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-auto border-t border-border/50 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <AddButton entry={p} />
                <MoreButton entry={p} />
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                Price includes installation at your home address.
              </p>
            </div>
          </div>
        ),
      });
    });

    /* ------------------------------- PRICE SHEET ------------------------------ */
    if (products.length) {
      const PER_PRICE_PAGE = 12;
      const priceChunks: typeof products[] = [];
      for (let c = 0; c < products.length; c += PER_PRICE_PAGE) priceChunks.push(products.slice(c, c + PER_PRICE_PAGE));
      priceChunks.forEach((chunk, ci) => {
        if (!chunk.length) return;
        list.push({
          key: `price-sheet-${ci}`,
          render: () => (
            <div className="flex h-full w-full flex-col overflow-hidden p-8 sm:p-10">
              <div className="flex items-baseline justify-between gap-3">
                <Eyebrow>Price sheet</Eyebrow>
                <Eyebrow className="hidden sm:block">
                  {ci + 1} / {priceChunks.length} — {category.label}
                </Eyebrow>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-light leading-tight">The collection, at a glance</h3>
              <ul className="mt-4 min-h-0 flex-1 overflow-hidden">
                {chunk.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 border-t border-border/50 py-2"
                  >
                    <button
                      onClick={() => setDossier(p)}
                      title={`Open the ${p.name} book`}
                      className="min-w-0 flex-1 truncate text-left text-[11px] uppercase tracking-[0.18em] text-foreground underline decoration-border/70 underline-offset-4 transition-colors hover:decoration-foreground"
                    >
                      {String(ci * PER_PRICE_PAGE + i + 1).padStart(2, "0")} — {p.name}
                    </button>

                    <span className="shrink-0 font-serif text-base font-light">
                      {formatEntryPrice(p) || "On request"}
                    </span>
                    <button
                      onClick={() => addEntry(p)}
                      aria-label={`Add ${p.name} to the order`}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center border transition-colors ${
                        inCart(p)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border/60 hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {inCart(p) ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border/50 pt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                Installed figures — no financing shown
              </p>
            </div>
          ),
        });
      });
    }



    const featuresAt = list.length;

    /* options — chunked so a list can never run past the page margin */
    const PER_OPT_PAGE = 10;
    groups.forEach((g, gi) => {
      const chunks: string[][] = [];
      for (let c = 0; c < g.options.length; c += PER_OPT_PAGE) chunks.push(g.options.slice(c, c + PER_OPT_PAGE));
      chunks.forEach((chunk, ci) => {
        list.push({
          key: `opt-${gi}-${ci}`,
          render: () => (
            <div className="flex h-full w-full flex-col overflow-hidden p-8 sm:p-10">
              <div className="flex items-baseline justify-between gap-3">
                <Eyebrow>
                  Chapter {String(gi + 1).padStart(2, "0")} — Options
                  {chunks.length > 1 ? ` (${ci + 1}/${chunks.length})` : ""}
                </Eyebrow>
                <Eyebrow className="hidden sm:block">{category.label}</Eyebrow>
              </div>
              <h3 className="mt-2 font-serif text-3xl font-light leading-tight sm:text-4xl">{g.title}</h3>
              <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{g.note}</p>
              <ul className="mt-6 min-h-0 flex-1 overflow-hidden">
                {chunk.map((o, oi) => (
                  <li
                    key={o}
                    className="flex items-baseline justify-between gap-4 border-t border-border/50 py-2.5 text-[12px] text-foreground"
                  >
                    <span className="min-w-0 flex-1 truncate">{o}</span>
                    <span className="shrink-0 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                      {String(ci * PER_OPT_PAGE + oi + 1).padStart(2, "0")}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-border/50 pt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                Selected in the studio — configured, priced, installed
              </p>
            </div>
          ),
        });
      });
    });


    const estimateAt = list.length;

    list.push({
      key: "estimate",
      render: () => (
        <div className="flex h-full w-full flex-col p-8 sm:p-10">
          <Eyebrow>Estimate</Eyebrow>
          <h3 className="mt-2 font-serif text-3xl font-light leading-tight sm:text-4xl">
            Your {category.label} figure
          </h3>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            Draw the property, choose the model and the option chapters, and the studio returns a complete turnkey
            figure — permit drawings, installation and warranty included.
          </p>
          <div className="mt-6 grid gap-2">
            {[
              ["From", products.length ? formatEntryPrice(products[0]) || "On request" : "On request"],
              ["Models in edition", String(products.length)],
              ["Option chapters", String(groups.length)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-t border-border/50 pt-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{k}</span>
                <span className="font-serif text-xl font-light">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border/50 pt-3">
            <Eyebrow>Your order</Eyebrow>
            {cartItems.length ? (
              <>
                <ul className="mt-2 max-h-40 overflow-hidden">
                  {cartItems.slice(0, 5).map((c) => (
                    <li
                      key={c.id}
                      className="flex items-baseline justify-between gap-3 border-t border-border/40 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      <span className="truncate text-foreground">{c.name}</span>
                      <span className="shrink-0">
                        {(c.price * c.quantity).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-baseline justify-between border-t border-foreground/30 pt-2">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Order total</span>
                  <span className="font-serif text-2xl font-light">
                    {(cart?.getCartTotal() ?? 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </>
            ) : (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Add models from the collection pages — they collect here and in the order desk.
              </p>
            )}
          </div>
          <div className="mt-auto grid gap-2">
            <a
              href="/studio"
              className="inline-flex items-center justify-between border border-foreground bg-foreground px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Open the studio
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://calendly.com/wonderlandsworlds/30min"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-between border border-border px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Book a consultation
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ),
    });

    list.push({
      key: "back",
      tone: "cover",
      render: () => (
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-10 text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">End of edition</p>
          <p className="font-serif text-3xl font-light leading-snug">{category.label}</p>
          <div className="h-px w-12 bg-current opacity-40" />
          <p className="max-w-xs text-[11px] leading-relaxed opacity-70">
            Return to the index for another discipline, or open the studio to configure yours.
          </p>
          <button
            onClick={openHome}
            className="mt-2 border border-current px-4 py-2 text-[9px] uppercase tracking-[0.3em]"
          >
            Back to the index
          </button>
        </div>
      ),
    });

    if (list.length % 2 !== 0) {
      list.splice(list.length - 1, 0, {
        key: "colophon",
        render: () => (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-10 text-center">
            <Eyebrow>Colophon</Eyebrow>
            <p className="font-serif text-2xl font-light">Wonderlands World</p>
            <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
              {category.tagline} — drawn, priced and installed turnkey.
            </p>
          </div>
        ),
      });
    }

    return {
      pages: list,
      anchors: { index: 1, gallery: galleryAt, code: galleryAt + 1, features: featuresAt, estimate: estimateAt },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, products, groups, openHome, cartItems, addEntry, inCart, cart]);

  /* Dossier pages are composed here and rendered in this same flipbook —
     opening "More" never spawns a second book. */
  const dossierCategory = useMemo(
    () => ({
      id: category.id,
      label: category.label,
      tagline: category.tagline,
      description: category.description,
      notes: category.notes,
      /* product photography only — the model plates of this discipline, so the
         dossier's editorial pages never fall back to finish swatches */
      images: (category.images ?? []).filter(Boolean) as string[],
      siblings: (products ?? []).map((p) => ({ name: p.name, brand: p.brand, image: p.image })),
    }),
    [category, products],
  );
  const dossierPages = useProductBookPages({
    entry: dossier ?? EMPTY_DOSSIER_ENTRY,
    category: dossierCategory,
    groups,
    portrait,
    onOpenBoard: openBoard,
  });

  const pages: { key: string; render: () => React.ReactNode; tone?: "cover" | "paper" }[] = dossier
    ? dossierPages
    : mode === "home"
      ? homePages
      : categoryPages;

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const goTo = useCallback((n: number) => bookRef.current?.pageFlip()?.turnToPage(n), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") flipPrev();
      if (e.key === "ArrowRight") flipNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipPrev, flipNext]);

  const rail: { id: keyof Anchors | "home"; label: string; icon: React.ElementType }[] = [
    { id: "index", label: "Index", icon: LayoutList },
    { id: "features", label: "Features", icon: Sparkles },
    { id: "code", label: "Code", icon: Ruler },
    { id: "gallery", label: "Gallery", icon: Images },
    { id: "estimate", label: "Estimate", icon: Calculator },
  ];

  const loading = mode === "category" && !entries;

  // Fade the new edition back in once its pages are composed.
  useEffect(() => {
    if (loading || !fading || boardOpen) return;
    const t = window.setTimeout(() => setFading(false), 40);
    return () => window.clearTimeout(t);
  }, [loading, fading, boardOpen, mode, categoryId, pages.length]);


  return (
    <section aria-label="FLIP Magazine edition" className="relative bg-background">
      <div className="flex flex-wrap items-baseline justify-between gap-3 px-6 py-5 md:px-10">
        <nav aria-label="Where you are" className="flex flex-wrap items-baseline gap-3">
          <button
            onClick={openHome}
            className="font-serif text-xl font-light leading-none tracking-tight text-foreground"
          >
            FLIP
          </button>
          <span className="hidden h-px w-8 bg-foreground/30 sm:block" />
          {mode === "home" ? (
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">The Outdoor Annual</p>
          ) : (
            <button
              onClick={() => (dossier ? closeDossier() : undefined)}
              className={`text-[10px] uppercase tracking-[0.4em] transition-colors ${
                dossier ? "text-muted-foreground hover:text-foreground" : "text-foreground"
              }`}
            >
              {category.label}
            </button>
          )}
          {dossier && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-foreground">{dossier.name}</p>
            </>
          )}
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={openBoard}
            title={`Editor Board — ${boardMeta.name}`}
            className="inline-flex items-center gap-2 border border-primary/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <PenTool className="h-3.5 w-3.5" /> Editor Board
          </button>
          {dossier && (
            <button
              onClick={closeDossier}
              className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to {category.label}
            </button>
          )}
        </div>
      </div>


      <nav
        aria-label="Magazine editions"
        className="flex gap-x-5 gap-y-2 overflow-x-auto border-y border-border/50 px-6 py-3 md:flex-wrap md:justify-center md:overflow-visible md:px-10"
      >
        <button
          onClick={openHome}
          className={`shrink-0 whitespace-nowrap border-b pb-0.5 text-[9px] uppercase tracking-[0.28em] transition-colors ${
            mode === "home"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          }`}
        >
          Index
        </button>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => openCategory(item.id)}
            className={`shrink-0 whitespace-nowrap border-b pb-0.5 text-[9px] uppercase tracking-[0.28em] transition-colors ${
              mode === "category" && categoryId === item.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="relative px-2 pb-28 pt-8 md:px-6 md:py-12">
        <div className="pointer-events-none absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 md:block">
          <div className="pointer-events-auto flex flex-col gap-1 rounded-full border border-border/50 bg-background/50 p-2 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
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
            {mode === "category" && !dossier &&
              rail.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => goTo(anchors[id as keyof Anchors])}
                  title={label}
                  aria-label={label}
                  className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <Icon className="h-[15px] w-[15px]" />
                </button>
              ))}
            {mode === "category" && (
              <button
                onClick={openBoard}
                title={`Editor Board — ${boardMeta.name}`}
                aria-label="Open the editor board"
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <PenTool className="h-[15px] w-[15px]" />
              </button>
            )}
            {mode === "category" && (
              <>
                <span className="mx-auto my-1 h-px w-4 bg-border" />
                <button
                  onClick={openHome}
                  title="Back to the index"
                  aria-label="Back to the index"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <ChevronLeft className="h-[15px] w-[15px]" />
                </button>
              </>
            )}
          </div>
        </div>


        <div
          className={`mx-auto flex justify-center transition-opacity duration-300 ease-out ${
            fading || loading ? "opacity-0" : "opacity-100"
          }`}
          style={{ perspective: "3000px", minHeight: dims.h }}
        >
          {loading ? (
            <div
              className="flex items-center justify-center border border-border/60"
              style={{ width: portrait ? dims.w : dims.w * 2, height: dims.h }}
            />
          ) : (

            <HTMLFlipBook
              key={`${mode}-${categoryId}-${dossier?.id ?? "edition"}-${pages.length}-${dims.w}`}
              ref={bookRef}
              width={dims.w}
              height={dims.h}
              size="fixed"
              minWidth={240}
              maxWidth={1400}
              minHeight={340}
              maxHeight={1400}
              showCover={false}
              usePortrait={portrait}
              mobileScrollSupport
              drawShadow
              flippingTime={880}
              maxShadowOpacity={0.5}
              startPage={Math.min(startPageRef.current, Math.max(pages.length - 1, 0))}
              startZIndex={0}
              autoSize={false}
              clickEventForward={false}
              useMouseEvents={!flipLocked}
              swipeDistance={30}
              showPageCorners={!flipLocked}
              disableFlipByClick
              style={{}}
              className="shadow-[0_50px_110px_-30px_rgba(0,0,0,0.55)]"
              onFlip={(e: any) => setPage(e.data as number)}
            >
              {pages.map((p) => (
                <Leaf key={p.key} tone={p.tone}>
                  {p.render()}
                </Leaf>
              ))}
            </HTMLFlipBook>
          )}
        </div>
        {/* Wide search desk — spans the book from corner to corner. */}
        <div className="mx-auto mt-6 w-full px-1 md:px-0" style={{ maxWidth: portrait ? dims.w : dims.w * 2 }}>
          <div className="border border-border/60 bg-background/70 backdrop-blur-xl">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              aria-expanded={searchOpen}
            >
              <span className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                FLIP Search Engine
              </span>
              {searchOpen ? (
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <span className="hidden text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
                  Pools · Saunas · Enclosures · Turf
                </span>
              )}
            </button>
            {searchOpen && (
              <div className="border-t border-border/60 px-3 pb-4 pt-3 md:px-5">
                <FlipSearch autoFocus onOpenCategory={openCategory} onOpenProduct={openProduct} />
              </div>
            )}
          </div>
        </div>

        {(
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={flipPrev}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={flipNext}
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {String(Math.min(page + 1, pages.length)).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
            </p>
            <p className="max-w-md text-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              All prices include delivery, installation and the product as described.
            </p>
          </div>
        )}
      </div>

      <FlipCart />

      {boardOpen && (
        <FlipEditorBoard
          categoryId={categoryId}
          categoryLabel={category.label}
          productName={dossier?.name}
          productPrice={dossier?.price ?? undefined}
          onClose={closeBoard}
        />
      )}
    </section>
  );
};

export default FlipMagazine;
