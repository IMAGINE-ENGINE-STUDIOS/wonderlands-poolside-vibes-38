import * as React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import FlipPageTabs from "./FlipPageTabs";
// NOTE: FlipCornerHint removed per user request — the page-curl hint in the corner was not looking good.
import PageFlipTransMotion, { usePageFlipTransMotion } from "./PageFlipTransMotion";
import { useFlipLocked } from "./flipBoardStore";
import { ChevronLeft, ChevronRight, LayoutList, Sparkles, Ruler, Images, Calculator, Plus, Check, BookOpen, PenTool, X, Headphones, ArrowUpRight } from "lucide-react";
import { ITEMS } from "@/components/FlipIndex";
import { loadCategoryEntries, getCachedCategoryEntries, formatEntryPrice, type ConsoleEntry } from "./flipConsoleData";
import { preloadImages, prefetchEditions } from "@/lib/flipPreload";
import FlipSearch from "@/components/flip/FlipSearch";
import FlipNarratorConsole from "@/components/flip/FlipNarratorConsole";
import usePersistentState from "@/hooks/usePersistentState";
import { setNarratorContext } from "@/lib/narratorStore";
import { setFlipManifest, setFlipControls } from "@/lib/flipPageRegistry";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";
import FlipCart from "./FlipCart";
import { useProductBookPages } from "./FlipProductBook";
import { pushSpread } from "./FlipSpread";
import FlipIndexV6 from "./FlipIndexV6";


/** Placeholder so the dossier page hook can run unconditionally. */
const EMPTY_DOSSIER_ENTRY = { id: "none", name: "", image: "", price: null } as any;
import FlipEditorBoard, { boardForCategory } from "./FlipEditorBoard";
import { mergeStudioGroups } from "@/lib/flipStudioFeatures";
import heroCover from "@/assets/hero/hero-carousel-1.webp";
import HeroVideo from "@/components/HeroVideo";
import wonderlandsLogo from "@/assets/brand/wonderlands-logo.webp";

/**
 * FLIP — Magazine edition.
 * Opens on a main edition page (company products + every category), then travels
 * one category per page. Selecting a category opens its own magazine: every
 * model gets a spread and every option group becomes a chapter page.
 */

type OptionGroup = { title: string; note: string; options: string[] };

const POOL_OPTION_GROUPS: OptionGroup[] = [
  { title: "Interior Finish", note: "How the water carries light", options: ["Pebble Tec — Tahoe Blue", "Pebble Tec — Midnight Blue", "PebbleSheen — Blue Granite", "PebbleFina — Bella Blue", "PebbleBrilliance — Crystal Harbor"] },
  { title: "Waterline & Coping", note: "The edge detail", options: ["Glass mosaic waterline", "Porcelain waterline", "Travertine coping — squared edge or bullnose", "Porcelain coping", "Coralina coping"] },
  { title: "Shape & Depth", note: "Drawn without a mould", options: ["Infinity edge", "Zero-entry beach shallows", "Lagoon floor", "Integrated spillover spa", "Tanning ledge with bubblers"] },
  { title: "Water & Comfort", note: "Systems set on delivery day", options: ["Heat pump heater", "Gas heater", "Hydrotherapy jets", "Bubblers", "Rocky waterfall"] },
  { title: "Light & Control", note: "Evening character", options: ["Color LED spectrum lighting", "Automation & app control", "Salt system — included", "Variable speed pump", "Automatic cover"] },
];

const OPTION_GROUPS: Record<string, OptionGroup[]> = {
  "concrete-pools": POOL_OPTION_GROUPS,
  pools: [
    { title: "Interior Finish", note: "How the water carries light", options: ["Sapphire Blue G3", "Aquamarine G3", "Ocean Blue G3", "Night Sky G3", "Shale Gray G3", "Lagoon Blue G2"] },
    { title: "Waterline & Coping", note: "The edge detail", options: ["Glass mosaic waterline", "Porcelain waterline", "Travertine coping — squared edge or bullnose", "Porcelain coping", "Coralina coping"] },
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
    { title: "Edge & Coping", note: "The defined perimeter", options: ["Squared edge coping — standard", "Bullnose coping — Belgard & coping specified as bullnose", "Soldier course border", "Contrast banding"] },
    { title: "Joint & Drainage Detail", note: "Finished for Florida rain", options: ["Polymeric sand joints", "Drainage channel", "Threshold slope check", "Sealer application"] },
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

const CATEGORY_INCLUDED_LINES: Record<string, [string, string][]> = {
  "concrete-pools": [
    ["Survey & drawings", "Shell, depth profile, structure and permit set drawn from the site plan"],
    ["Engineering", "Florida pool-code structural details and hydraulic coordination"],
    ["Construction", "Excavation, steel, shotcrete, plumbing, electrical and inspections"],
    ["Finish", "Pebble Tec interior, coping and deck interface installed as selected"],
    ["Handover", "Water balance, walkthrough, warranty registration and care schedule"],
  ],
  pools: [
    ["Survey & drawings", "Property measured, shell positioned and permit set submitted"],
    ["Engineering", "Florida pool-code compliant shell, base, plumbing and bonding details"],
    ["Installation", "Excavation, base work, shell set, backfill, plumbing and electrical"],
    ["Systems", "Pump, filtration, start-up, balance and selected equipment integration"],
    ["Handover", "Walkthrough, warranty registration and care schedule"],
  ],
  spas: [
    ["Site plan", "Spa position, access, pad or shell interface confirmed before ordering"],
    ["Mechanical", "Dedicated heater, jet, plumbing and electrical scope coordinated"],
    ["Installation", "Set, level, connect, finish and inspect the vessel"],
    ["Start-up", "Fill, heat, jet test, balance and client walkthrough"],
    ["Warranty", "Equipment and shell documents organized for handover"],
  ],
  "tanning-ledges": [
    ["Design", "Shelf footprint, depth, bubblers and umbrella sleeve drawn to scale"],
    ["Engineering", "Structure and hydraulics coordinated with the pool it belongs to"],
    ["Installation", "Shell or formed ledge, plumbing, finish and edge detail completed"],
    ["Start-up", "Fill, balance, bubbler trim and walkthrough"],
    ["Warranty", "Installed scope documented with the pool package"],
  ],
  pavers: [
    ["Measured area", "Deck square footage calculated from the drawing board minus every non-paved zone"],
    ["Installation", "Included in the paver square-foot price shown in the store"],
    ["Base", "Concrete priced by square foot or crushed stone converted from square feet to tons"],
    ["Drainage", "Falls, thresholds and water paths checked before units are laid"],
    ["Finish", "Pattern, border, joints and edge restraints installed as selected"],
  ],
  "artificial-grass": [
    ["Measured area", "Turf square footage calculated from the drawn lawn zones"],
    ["Base", "Free-draining compacted base prepared for Florida rain"],
    ["Seams", "Nap direction, glue seams, infill and brushing coordinated"],
    ["Edges", "Perimeters tucked, nailed or bordered against adjacent hardscape"],
    ["Handover", "Care guidance for brushing, rinsing and cooling the surface"],
  ],
  finishes: [
    ["Selection", "Interior surface chosen by water colour, texture and collection"],
    ["Coordination", "Reviewed against coping, waterline and lighting before ordering"],
    ["Installation", "Applied as the selected vessel surface, not a separate pool package"],
    ["Care", "Maintenance notes matched to the finish material"],
    ["Documentation", "Colour and collection recorded for future service"],
  ],
  liners: [
    ["Selection", "Print, border and waterline character chosen for the shell"],
    ["Measurement", "Liner scope matched to the vessel geometry"],
    ["Installation", "Set as an interior surface choice, not a separate construction package"],
    ["Care", "Chemistry and surface-care guidance provided"],
    ["Documentation", "Pattern and border recorded for future replacement"],
  ],
};

const includedLinesForCategory = (id: string): [string, string][] =>
  CATEGORY_INCLUDED_LINES[id] ?? [
    ["Measurement", "Site conditions and dimensions confirmed before ordering"],
    ["Specification", "Product, options and installation scope documented as selected"],
    ["Installation", "Crew, access and material handling coordinated by Wonderlands World"],
    ["Completion", "Installed work reviewed and warranty documents organized"],
    ["Handover", "Care notes and next steps explained at completion"],
  ];

const MAX_MODELS = 24;

const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[9px] uppercase tracking-[0.35em] text-muted-foreground ${className}`}>{children}</p>
);

/** Human page name derived from the page key — used for the edge tags. */
const pageTagLabel = (key: string): string => {
  const k = key.toLowerCase();
  if (k.startsWith("home-cat-")) return "Discipline";
  if (k.startsWith("home")) return "Index";
  if (k === "cover" || k === "back") return "Edition";
  if (k.startsWith("contents")) return "Contents";
  if (k.startsWith("letter")) return "Letter";
  if (k.startsWith("statement")) return "Statement";
  if (k.startsWith("index-")) return "Collection";
  if (k.startsWith("gallery")) return "Portfolio";
  if (k.startsWith("price-sheet")) return "Price Sheet";
  if (k.startsWith("opt-")) return "Options";
  if (k.startsWith("estimate")) return "Estimate";
  if (k.includes("memoir")) return "Our Promise";
  if (k.endsWith("-hero")) return "Plate";
  if (k.endsWith("-spec")) return "Specification";
  if (k.includes("board") || k.includes("tool")) return "Drawing Board";
  if (k.includes("story")) return "Story";
  if (k.includes("order")) return "Order";
  if (k.includes("dimension")) return "Dimensions";
  if (k.includes("brand")) return "Brand";
  return "Edition";
};

/** Full readable page title used by the page file and by Genius. */
const pageTitleFor = (key: string, categoryLabel: string, productName?: string): string => {
  const label = pageTagLabel(key);
  const k = key.toLowerCase();
  if (k.startsWith("home-cat-")) return `${label} — ${key.replace("home-cat-", "").replace(/-/g, " ")}`;
  if (k.startsWith("home")) return `The Outdoor Annual — ${label}`;
  if (productName) return `${productName} — ${label}`;
  return `${categoryLabel} — ${label}`;
};

/**
 * The Service Memoir — the house's word to its clients. Replaces the old
 * "colophon" leaf with something worth reading: how a Wonderlands project is
 * carried from first drawing to first swim.
 */
const ServiceMemoir: React.FC<{ discipline?: string }> = ({ discipline }) => (
  <div className="relative flex h-full w-full flex-col overflow-hidden px-8 py-8 sm:px-10">
    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    <div className="flex items-center justify-between gap-4">
      <img
        src={wonderlandsLogo}
        alt="Wonderlands World"
        loading="eager"
        decoding="async"
        className="h-9 w-auto sm:h-11"
      />
      <p className="text-[8px] uppercase tracking-[0.4em] text-muted-foreground">
        {discipline ? `${discipline} — Our Promise` : "Our Promise"}
      </p>
    </div>

    <h3 className="mt-6 font-serif text-3xl font-light leading-[1.05] sm:text-4xl">
      We do not sell products.
      <br />
      We deliver a finished world.
    </h3>
    <div className="mt-4 h-px w-16 bg-foreground/30" />

    <p className="mt-5 max-w-md text-[11.5px] leading-[1.85] text-muted-foreground">
      Every Wonderlands project begins the same way: someone stands in their own backyard and imagines
      something better. Our work is to make that picture real — drawn to the inch, priced to the dollar,
      and built by our own crews. One contract, one accountable house, no chain of strangers.
    </p>
    <p className="mt-3 max-w-md text-[11.5px] leading-[1.85] text-muted-foreground">
      {discipline
        ? `Your ${discipline.toLowerCase()} is engineered for Florida — permits filed, inspections met, warranties in writing.`
        : "Water, stone, shelter and verdure are engineered together — permits filed, inspections met, warranties in writing."}{" "}
      You watch it happen from a live plan, and the number you approved is the number you pay.
    </p>

    <ul className="mt-6 grid gap-px overflow-hidden border-t border-border/60">
      {[
        ["Drawn first", "You see the plan, the dimensions and the price before a shovel moves."],
        ["Built by us", "Our own crews and named brands — Latham, Belgard, Pentair, Harvia."],
        ["Turnkey", "Delivery, installation and cleanup included in every quoted figure."],
        ["Kept for life", "Written warranties, real service, one phone number after handover."],
      ].map(([t, d]) => (
        <li key={t} className="flex gap-4 border-b border-border/60 py-2.5">
          <span className="w-24 shrink-0 text-[9px] uppercase tracking-[0.28em] text-foreground">{t}</span>
          <span className="min-w-0 flex-1 text-[10.5px] leading-relaxed text-muted-foreground">{d}</span>
        </li>
      ))}
    </ul>

    <div className="mt-auto pt-5">
      <p className="font-serif text-lg font-light italic">Wonderlands World</p>
      <p className="mt-1 text-[8px] uppercase tracking-[0.35em] text-muted-foreground">
        Designed, engineered and installed in Florida
      </p>
    </div>
  </div>
);

const PageTag: React.FC<{ label: string; side: "left" | "right"; tone: "paper" | "cover" }> = ({
  label,
  side,
  tone,
}) => (
  <span
    aria-hidden
    className={`pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 whitespace-nowrap text-[8px] uppercase tracking-[0.32em] ${
      tone === "cover" ? "text-background/60" : "text-muted-foreground/70"
    } ${side === "left" ? "left-0" : "right-0"}`}
    style={{
      writingMode: "vertical-rl",
      transform: side === "left" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
      transformOrigin: "center",
      padding: "0 3px",
    }}
  >
    {label}
  </span>
);

const Leaf = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    tone?: "paper" | "cover";
    tag?: string;
    side?: "left" | "right";
    /** Fine print set in the foot margin of the leaf, out of the composition's way. */
    footnote?: string;
  }
>(({ children, tone = "paper", tag, side = "right", footnote }, ref) => (
  // NOTE: never add `relative` here. page-flip positions every leaf itself via
  // `.stf__item { position: absolute }`; a Tailwind `relative` utility wins on
  // load order and knocks the leaf back into normal flow — the leaf underneath a
  // dragged page then paints below the book instead of under the peel.
  // The library-applied absolute position still anchors our absolute children.
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
    {footnote && (
      <p className="pointer-events-none absolute inset-x-6 bottom-1.5 text-center text-[6px] uppercase tracking-[0.22em] text-muted-foreground/60">
        {footnote}
      </p>
    )}
    {tag && <PageTag label={tag} side={side} tone={tone} />}
  </div>
));
Leaf.displayName = "Leaf";


type Page = { key: string; render: () => React.ReactNode; tone?: "paper" | "cover" };

/** Set small in the foot margin of any leaf that quotes a figure. */
const PRICE_NOTE = "All prices include delivery, installation and the product as described.";
const PRICED_LEAF = /price|product|option|feature|estimate|board|dossier|model/i;

type Anchors = { index: number; features: number; code: number; gallery: number; estimate: number };

const FlipMagazine: React.FC<{ variant?: "v4" | "v5" | "v6" | "v7"; hideHeader?: boolean }> = ({
  variant = "v4",
  hideHeader = false,
}) => {
  const isV5 = variant === "v5" || variant === "v6" || variant === "v7";
  const isV6 = variant === "v6" || variant === "v7";
  /* V7 — The Narrated Edition: the corner narrator reads whichever leaf is open */
  const isV7 = variant === "v7";

  const bookRef = useRef<any>(null);
  /* Shared page-flip transition motion — played on every category / product open */
  const flipMotion = usePageFlipTransMotion();
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 420, h: 560 });
  const [mode, setMode] = usePersistentState<"home" | "category">("flip.mag.mode", "home");
  const [categoryId, setCategoryId] = usePersistentState<string>("flip.mag.category.v2", ITEMS[0].id);
  /* Page position persists as the reader navigates, but load always starts at the Index. */
  const [, setSavedPage] = usePersistentState<number>("flip.mag.page", 0);
  const [entries, setEntries] = useState<ConsoleEntry[] | null>(null);
  /* The narrator console pops inside the search desk from the rail Genius button. */
  const [narratorOpen, setNarratorOpen] = usePersistentState<boolean>("flip.mag.narrator", false);
  /* Default open: always land on the Index spread (page 0). The page number is
     still persisted as the reader navigates, but a fresh load starts at the Index. */
  const [page, setPage] = useState(0);
  /* Gentle wave the Open Book medallion after 3 seconds without a page turn,
     then stop as soon as the reader flips again. */
  const [idleWave, setIdleWave] = useState(false);
  useEffect(() => {
    setIdleWave(false);
    const t = window.setTimeout(() => setIdleWave(true), 3000);
    return () => window.clearTimeout(t);
  }, [page]);
  /* held while the reader draws on a board spread, so the book never turns under them */

  const flipLocked = useFlipLocked();
  const startPageRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isPortrait = vw < 900;
      setPortrait(isPortrait);
      const ratio = isPortrait ? 1.38 : vw >= 1800 ? 1.02 : vw >= 1440 ? 1.1 : 1.24;
      const maxH = Math.max(420, Math.floor(vh * (isPortrait ? 0.76 : 0.86)));
      // V5 hangs chapter tabs off the outer border — reserve that gutter.
      const chrome = isPortrait ? 32 : 120 + (isV5 ? 190 : 0);
      const availableW = Math.min(vw - chrome, 2400);
      const wByWidth = isPortrait ? availableW : Math.floor(availableW / 2);
      const w = Math.max(260, Math.min(wByWidth, Math.floor(maxH / ratio)));
      setDims({ w, h: Math.round(w * ratio) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isV5]);

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
    // Swap only after the fade-out has fully completed, so the reader never
    // catches the edition changing mid-dissolve.
    swapTimer.current = window.setTimeout(() => {
      startPageRef.current = 0;
      setPage(0);
      apply();
    }, 420);
  }, []);

  useEffect(() => () => { if (swapTimer.current) window.clearTimeout(swapTimer.current); }, []);

  /* In-book navigation from any contents / index title: instead of snapping to
     the leaf, run the same page-flip trans motion used when an edition or a
     product book opens — pages riffle past, then the book lands on the target. */
  const jumpTimer = useRef<number | null>(null);
  const turnToPageWithMotion = useCallback(
    (target: number, label: string, images: string[] = [], captions: string[] = []) => {
      const plates = images.filter(Boolean) as string[];
      flipMotion.play({
        label,
        images: plates,
        captions: captions.length ? captions : plates.map(() => label),
        destination: plates[0],
      });
      if (jumpTimer.current) window.clearTimeout(jumpTimer.current);
      // Turn under the riffle so the reader lands on the page as it clears.
      jumpTimer.current = window.setTimeout(() => {
        bookRef.current?.pageFlip()?.turnToPage(target);
      }, 420);
    },
    [flipMotion],
  );
  useEffect(() => () => { if (jumpTimer.current) window.clearTimeout(jumpTimer.current); }, []);


  const openCategory = useCallback(
    (id: string) => {
      const target = ITEMS.find((i) => i.id === id);
      const images = (target?.images ?? []).filter(Boolean) as string[];
      flipMotion.play({
        label: `Turning to ${target?.label ?? "the edition"}`,
        images,
        captions: images.map(() => target?.label ?? ""),
        destination: images[0],
      });
      swap(() => {
        setDossier(null);
        setCategoryId(id);
        setMode("category");
      });
    },
    [swap, setCategoryId, setMode, flipMotion],
  );

  const openProduct = useCallback(
    (id: string, entry: ConsoleEntry) => {
      const target = ITEMS.find((i) => i.id === id);
      const images = [entry.image, ...(target?.images ?? [])].filter(Boolean) as string[];
      flipMotion.play({
        label: `Turning to ${entry.name}`,
        images,
        captions: images.map((_, i) => (i === 0 ? entry.name : target?.label ?? "")),
        destination: entry.image,
      });
      swap(() => {
        setCategoryId(id);
        setMode("category");
        setDossier(entry);
      });
    },
    [swap, setCategoryId, setMode, flipMotion],
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

  /* V7: publish what the reader is looking at so the narrator can read it aloud */
  useEffect(() => {
    if (!isV7) return;
    if (dossier) {
      setNarratorContext({
        scope: "product",
        key: `flip:product:${dossier.id}:p${page + 1}`,
        title: dossier.name,
        category: category.label,
        product: dossier.name,
        price: dossier.price,
        features: (entries ?? []).slice(0, 8).map((e) => e.name),
        route: "/flip",
      });
      return;
    }
    if (mode === "category") {
      setNarratorContext({
        scope: "category",
        key: `flip:category:${category.id}:p${page + 1}`,
        title: category.label,
        category: category.label,
        features: (entries ?? []).slice(0, 10).map((e) => e.name),
        route: "/flip",
      });
      return;
    }
    setNarratorContext({
      scope: "index",
      key: `flip:index:p${page + 1}`,
      title: "Wonderlands — The Outdoor Annual",
      features: ITEMS.map((i) => i.label),
      route: "/flip",
    });
  }, [isV7, dossier, mode, category, entries, page]);

  useEffect(() => () => setNarratorContext(null), []);

  /**
   * Real plates used by the riffle so the turning leaves are never blank: the
   * models of the current discipline, then the category's own imagery.
   */
  const rifflePlates = useMemo(() => {
    const list = (entries ?? []).filter((e) => e.image);
    const images = [
      ...list.map((e) => e.image),
      ...(category.images ?? []),
    ].filter(Boolean) as string[];
    const captions = [
      ...list.map((e) => e.name),
      ...(category.images ?? []).map(() => category.label),
    ];
    return { images, captions };
  }, [entries, category]);

  /** Opens a model's book inside the same flip, with the page-flip trans motion. */
  const openDossier = useCallback(
    (p: ConsoleEntry) => {
      flipMotion.play({
        label: `Turning to ${p.name}`,
        images: [p.image, ...rifflePlates.images].filter(Boolean) as string[],
        captions: [p.name, ...rifflePlates.captions],
        destination: p.image,
      });
      swap(() => setDossier(p));
    },
    [swap, flipMotion, rifflePlates],
  );
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

  /**
   * Centred medallion over a product plate — the single, unmistakable invitation
   * to open that model's book. Used once per product, on the image page only.
   * When the reader has not turned a page for 3 s the whole medallion gently
   * waves so the invitation is impossible to miss.
   */
  const OpenBookMedallion: React.FC<{ entry: ConsoleEntry }> = ({ entry }) => (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div
        className={`pointer-events-none flex items-center justify-center transition-transform duration-700 ${
          idleWave ? "animate-medallion-idle-wave" : ""
        }`}
      >
        <button
          onClick={() => openDossier(entry)}
          title={`Open the ${entry.name} book`}
          aria-label={`Open the ${entry.name} book`}
          className="group pointer-events-auto relative flex h-28 w-28 flex-col items-center justify-center rounded-full border border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground backdrop-blur-md transition-all duration-500 ease-out hover:h-32 hover:w-32 hover:border-primary-foreground/80 hover:bg-primary-foreground hover:text-primary sm:h-32 sm:w-32 sm:hover:h-36 sm:hover:w-36 animate-medallion-float"
          style={{ boxShadow: "0 18px 50px -18px rgba(0,0,0,0.65)" }}
        >
          {/* Expanding wave rings — announce this is clickable */}
          <span className="absolute inset-0 rounded-full border-2 border-primary-foreground/40 animate-medallion-wave opacity-60" />
          <span className="absolute inset-0 rounded-full border border-primary-foreground/30 animate-medallion-wave opacity-40 [animation-delay:0.8s]" />
          <span className="absolute inset-0 rounded-full border border-primary-foreground/20 animate-medallion-wave opacity-30 [animation-delay:1.6s]" />

          {/* Glowing pulse that lights up and down */}
          <span className="absolute inset-0 rounded-full animate-medallion-glow" />

          {/* Shimmer sweep across the surface */}
          <span
            className="absolute inset-0 rounded-full animate-medallion-shimmer opacity-30"
            style={{
              background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
          />

          <span className="absolute inset-[7px] rounded-full border border-primary-foreground/20 transition-colors group-hover:border-primary/25" />
          <BookOpen className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
          <span className="mt-2 text-[8px] uppercase tracking-[0.32em]">Open</span>
          <span className="text-[8px] uppercase tracking-[0.32em] opacity-70">the book</span>
        </button>
      </div>
    </div>
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
    const list: Page[] = [];

    list.push({
      key: "home-left",
      render: () => (
        <div className="relative h-full w-full overflow-hidden">
          {/* Cover film — shared with the site header via HeroVideo (still fallback built in) */}
          <HeroVideo poster={heroCover} alt="Wonderlands outdoor living editorial cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/85" />
          <div className="relative flex h-full flex-col justify-between p-8 text-white sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={wonderlandsLogo}
                  alt="Wonderlands World"
                  loading="eager"
                  decoding="async"
                  className="h-10 w-auto drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)] sm:h-14"
                />
                <span className="hidden h-8 w-px bg-white/30 sm:block" />
                <p className="hidden text-[9px] uppercase leading-[1.6] tracking-[0.4em] opacity-80 sm:block">
                  Wonderlands
                  <br />
                  World
                </p>
              </div>
              <p className="text-[9px] uppercase tracking-[0.45em] opacity-60">Edition No. 01</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-70">The Outdoor Annual</p>
              <img
                src={wonderlandsLogo}
                alt="Wonderlands"
                loading="eager"
                decoding="async"
                className="mt-4 h-16 w-auto drop-shadow-[0_10px_36px_rgba(0,0,0,0.6)] sm:h-24"
              />
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

    /**
     * The Contents. V6 gets the Expedition navigator (cinematic main menu);
     * earlier editions keep the editorial mosaic.
     */
    list.push({
      key: "home-index",
      tone: isV6 ? "cover" : undefined,
      render: () =>
        isV6 ? (
          <FlipIndexV6 items={ITEMS} onOpen={openCategory} />
        ) : (
          <div className="flex h-full w-full flex-col px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex items-baseline justify-between gap-3">
              <Eyebrow>The Collection</Eyebrow>
              <Eyebrow className="hidden sm:block">01 — {String(ITEMS.length).padStart(2, "0")}</Eyebrow>
            </div>
            <div className="mt-1 flex items-end justify-between gap-4">
              <h3 className="font-serif text-3xl font-light leading-[0.9] sm:text-5xl">Contents</h3>
            </div>
            <div className="mt-4 grid min-h-0 flex-1 grid-cols-4 grid-rows-5 gap-1.5">
              {ITEMS.map((it, idx) => (
                <button
                  key={it.id}
                  onClick={() => openCategory(it.id)}
                  title={`Open the ${it.label} edition`}
                  className={`group relative min-h-0 overflow-hidden bg-muted text-left ring-1 ring-border/40 transition-transform duration-500 hover:z-10 hover:-translate-y-0.5 ${
                    idx < 2 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <img
                    src={it.images[0]}
                    alt={it.label}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                  <span className="absolute left-2 top-1.5 font-serif text-[10px] tabular-nums text-white/70">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute inset-x-2 bottom-1.5 block truncate font-serif font-light leading-tight text-white">
                    {it.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 border-t border-border/50 pt-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              Select a plate — or turn the page to travel the disciplines
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
                loading="eager"
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
        key: "home-memoir",
        render: () => <ServiceMemoir />,
      });
    }
    return list;
  }, [openCategory, isV6]);

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
            loading="eager"
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
                  onClick={() =>
                    turnToPageWithMotion(at.products + i * 2, p.name, [p.image, ...(category.images ?? [])])
                  }
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
              loading="eager"
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
      /* ink tone: the photograph drops back so the contents rows stay legible and
         the spread no longer reads as a repeat of the statement opener */
      tone: "ink",
      eyebrow: "The Collection",
      title: "Index",
      titleItalic: category.label,
      body: "Every model in this edition, priced with delivery and installation at your address.",
      lockup: "Wonderlands World — FLIP",
      rightHeading: "Contents",
      rightHint: "Tap to open",
      right: () => (
        <ul className="h-full overflow-y-auto">
          {products.slice(0, 14).map((p, i) => (
            <li key={p.id}>
              <button
                onClick={() =>
                  turnToPageWithMotion(at.products + i * 2, p.name, [p.image, ...(category.images ?? [])])
                }
                aria-label={`Open the ${p.name} page`}
                className="group flex w-full cursor-pointer items-center gap-3 border-b border-white/15 px-2 py-[7px] text-left transition-colors hover:bg-white/12 focus-visible:bg-white/12 focus-visible:outline-none"
              >
                <span className="w-6 shrink-0 font-serif text-[11px] text-white/55 group-hover:text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-6 w-8 shrink-0 object-cover opacity-80 transition-opacity group-hover:opacity-100"
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-[10.5px] uppercase tracking-[0.16em] text-white group-hover:underline group-hover:decoration-white/50 group-hover:underline-offset-4">
                  {p.name}
                </span>
                <span className="shrink-0 font-serif text-[11px] text-white/80">{formatEntryPrice(p)}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/45 transition-transform group-hover:translate-x-[2px] group-hover:text-white" />
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
                  loading="eager"
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
            {includedLinesForCategory(category.id).map(([k, v]) => (
              <li key={k} className="border-t border-border/50 py-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">{k}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{v}</p>
              </li>
            ))}
          </ul>
          <p className="border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
            Every figure in this edition includes delivery, installation and the product as described.
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
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
            <OpenBookMedallion entry={p} />
            <div className="relative flex h-full flex-col justify-end p-8 text-white sm:p-10">
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-80">
                {number} — {p.brand ?? category.label}
              </p>
              <ProductTitle entry={p} className="mt-2 font-serif text-3xl font-light leading-tight sm:text-5xl" />
              {p.meta && <p className="mt-3 max-w-sm text-[11px] leading-relaxed opacity-80">{p.meta}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/25 pt-4">
                <p className="font-serif text-2xl font-light">{formatEntryPrice(p) || "On request"}</p>
                <AddButton entry={p} tone="dark" />
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
                loading="eager"
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
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                All prices include delivery, installation and the product as described.
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
        key: "memoir",
        render: () => <ServiceMemoir discipline={category.label} />,
      });
    }

    return {
      pages: list,
      anchors: { index: 1, gallery: galleryAt, code: galleryAt + 1, features: featuresAt, estimate: estimateAt },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, products, groups, openHome, cartItems, addEntry, inCart, cart, turnToPageWithMotion]);

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

  /* V5: chapter tabs that hang off the outer border of the book */
  const tabItems = useMemo(
    () => pages.map((p, i) => ({ label: pageTagLabel(p.key), page: i })),
    [pages],
  );

  /* Publish the open book so Genius and the page file can read and turn it. */
  useEffect(() => {
    setFlipManifest({
      scope: dossier ? "product" : mode === "home" ? "home" : "category",
      categoryId,
      categoryLabel: category.label,
      productId: dossier?.id ? String(dossier.id) : undefined,
      productName: dossier?.name,
      current: page,
      pages: pages.map((p, i) => ({
        number: i + 1,
        index: i,
        key: p.key,
        label: pageTagLabel(p.key),
        title: pageTitleFor(p.key, category.label, dossier?.name),
      })),
    });
  }, [pages, page, mode, categoryId, category.label, dossier]);

  useEffect(() => () => setFlipManifest(null), []);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const goTo = useCallback((n: number) => bookRef.current?.pageFlip()?.turnToPage(n), []);

  useEffect(() => {
    setFlipControls({
      goTo,
      next: flipNext,
      prev: flipPrev,
      openHome,
      openCategory,
      openProduct: (catId, productId) => {
        const list = getCachedCategoryEntries(catId);
        const entry = list?.find((e) => String(e.id) === String(productId));
        if (entry) openProduct(catId, entry);
        else openCategory(catId);
      },
      /* The search bar is always live in the desk, so this is a no-op kept for the
         page-registry contract; the narrator console is what pops on demand. */
      openSearch: () => {},
    });
    return () => setFlipControls(null);
  }, [goTo, flipNext, flipPrev, openHome, openCategory, openProduct]);

  /* Deep links from the page file: /flip?cat=pools&product=milan&page=7 */
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current) return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    const productId = params.get("product");
    const target = Number.parseInt(params.get("page") ?? "", 10);
    if (!cat && !productId && !Number.isFinite(target)) {
      deepLinked.current = true;
      return;
    }
    if (cat) {
      setCategoryId(cat);
      setMode("category");
    }
    if (productId && cat) {
      const list = getCachedCategoryEntries(cat);
      const entry = list?.find((e) => String(e.id) === String(productId));
      if (!entry) return; // wait for the edition to load
      setDossier(entry);
    }
    deepLinked.current = true;
    if (Number.isFinite(target) && target > 0) {
      window.setTimeout(() => goTo(target - 1), 500);
    }
  }, [entries, goTo, setCategoryId, setMode]);

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
  // Fade the new edition back in once its pages are composed — a beat of
  // stillness first so the dissolve reads as one continuous breath.
  useEffect(() => {
    if (loading || !fading || boardOpen) return;
    const t = window.setTimeout(() => setFading(false), 160);
    return () => window.clearTimeout(t);
  }, [loading, fading, boardOpen, mode, categoryId, pages.length]);



  return (
    <section aria-label="FLIP Magazine edition" className="relative bg-background">
      <div className={`flex flex-wrap items-baseline justify-between gap-3 px-6 py-5 md:px-10 ${hideHeader ? "hidden" : ""}`}>
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
            {/* Genius rail button — pops the narrator console inside the search desk.
                The old search toggle was removed: the search bar below is always open. */}
            <button
              onClick={() => setNarratorOpen((v) => !v)}
              title="Genius — narrator for this spread"
              aria-label="Genius narrator"
              aria-pressed={narratorOpen}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                narratorOpen
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-primary/15 blur-[6px]"
              />
              <Headphones className="relative h-[15px] w-[15px]" />
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
          className="mx-auto flex justify-center will-change-[opacity,transform]"
          style={{
            perspective: "3000px",
            minHeight: dims.h,
            opacity: fading || loading ? 0 : 1,
            transform: fading || loading ? "scale(0.985) translateY(6px)" : "scale(1) translateY(0)",
            filter: fading || loading ? "blur(6px)" : "blur(0px)",
            transition:
              fading || loading
                ? "opacity 400ms cubic-bezier(0.4,0,1,1), transform 400ms cubic-bezier(0.4,0,1,1), filter 400ms ease-in"
                : "opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1), filter 700ms ease-out",
          }}
        >

          {loading ? (
            <div
              className="flex items-center justify-center border border-border/60"
              style={{ width: portrait ? dims.w : dims.w * 2, height: dims.h }}
            />
          ) : (

            <div
              className="relative"
              style={{ width: portrait ? dims.w : dims.w * 2, height: dims.h }}
            >
              {/* Side arrows — left/right of the book */}
              <button
                onClick={flipPrev}
                aria-label="Previous page"
                className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={flipNext}
                aria-label="Next page"
                className="absolute right-0 top-1/2 z-20 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

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
              onFlip={(e: any) => {
                setPage(e.data as number);
              }}
            >
              {pages.map((p, i) => (
                <Leaf
                  key={p.key}
                  tone={p.tone}
                  tag={isV5 ? undefined : pageTagLabel(p.key)}
                  side={portrait ? "right" : i % 2 === 0 ? "left" : "right"}
                  footnote={PRICED_LEAF.test(p.key) ? PRICE_NOTE : undefined}
                >
                  {p.render()}
                </Leaf>
              ))}
            </HTMLFlipBook>
              {isV5 && (
                <>
                  <FlipPageTabs
                    items={tabItems}
                    activePage={page}
                    onGo={goTo}
                    height={dims.h}
                    storageKey={`flip.v5.tabs.${dossier ? "dossier" : mode}`}
                  />
                  <FlipPageTabs
                    items={tabItems}
                    activePage={page}
                    onGo={goTo}
                    height={dims.h}
                    side="left"
                    variant="trail"
                    storageKey={`flip.v5.tabs.${dossier ? "dossier" : mode}`}
                  />
                </>
              )}
              {/* Shared page-flip trans motion — every category and product open */}
              {flipMotion.active && (
                <PageFlipTransMotion
                  width={portrait ? dims.w : dims.w * 2}
                  height={dims.h}
                  label={flipMotion.payload.label ?? `Turning to ${category.label}`}
                  images={
                    flipMotion.payload.images?.length
                      ? flipMotion.payload.images
                      : rifflePlates.images
                  }
                  captions={
                    flipMotion.payload.captions?.length
                      ? flipMotion.payload.captions
                      : rifflePlates.captions
                  }
                  destination={flipMotion.payload.destination}
                />
              )}
            </div>
          )}
        </div>
        {/* Wide search desk — spans the book from corner to corner.
            The collapsible "FLIP Search Engine" header was removed: the bar is
            always live, and the rail Genius button pops the narrator console here. */}
        <div className="mx-auto mt-6 w-full px-1 md:px-0" style={{ maxWidth: portrait ? dims.w : dims.w * 2 }}>
          <div className="border border-border/60 bg-background/70 backdrop-blur-xl">
            {narratorOpen && (
              <div className="border-b border-border/60 px-3 pb-4 pt-3 md:px-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                    Genius — Narrator
                  </span>
                  <button
                    onClick={() => setNarratorOpen(false)}
                    aria-label="Close the narrator"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <FlipNarratorConsole />
              </div>
            )}
            <div className="px-3 py-3 md:px-5">
              <FlipSearch onOpenCategory={openCategory} onOpenProduct={openProduct} />
            </div>
          </div>
        </div>

        {(
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {String(Math.min(page + 1, pages.length)).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
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
