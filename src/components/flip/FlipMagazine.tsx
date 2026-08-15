import * as React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ITEMS } from "@/components/FlipIndex";
import { loadCategoryEntries, formatEntryPrice, type ConsoleEntry } from "./flipConsoleData";

/**
 * FLIP — Magazine edition.
 * Categories do not open a panel: they open their own magazine. Every product is
 * a spread, and every option group of that product becomes its own page.
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

const FlipMagazine: React.FC = () => {
  const bookRef = useRef<any>(null);
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 420, h: 560 });
  const [categoryId, setCategoryId] = useState<string>(ITEMS[0].id);
  const [entries, setEntries] = useState<ConsoleEntry[] | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isPortrait = vw < 900;
      setPortrait(isPortrait);
      const ratio = isPortrait ? 1.38 : vw >= 1800 ? 1.02 : vw >= 1440 ? 1.1 : 1.24;
      const maxH = Math.max(420, Math.floor(vh * (isPortrait ? 0.76 : 0.86)));
      const availableW = Math.min(vw - (isPortrait ? 32 : 80), 2400);
      const wByWidth = isPortrait ? availableW : Math.floor(availableW / 2);
      const w = Math.max(260, Math.min(wByWidth, Math.floor(maxH / ratio)));
      setDims({ w, h: Math.round(w * ratio) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let alive = true;
    setEntries(null);
    setPage(0);
    loadCategoryEntries(categoryId)
      .then((list) => alive && setEntries(list))
      .catch(() => alive && setEntries([]));
    return () => {
      alive = false;
    };
  }, [categoryId]);

  const category = ITEMS.find((i) => i.id === categoryId)!;
  const groups = OPTION_GROUPS[categoryId] ?? fallbackGroups;
  const products = useMemo(() => (entries ?? []).slice(0, 8), [entries]);

  const pages = useMemo<Page[]>(() => {
    const list: Page[] = [];

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
          <ul className="mt-6 min-h-0 flex-1 overflow-hidden">
            {products.map((p, i) => (
              <li
                key={p.id}
                className="flex items-baseline justify-between gap-4 border-t border-border/50 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                <span className="truncate text-foreground">
                  {String(i + 1).padStart(2, "0")} — {p.name}
                </span>
                <span className="shrink-0">{formatEntryPrice(p)}</span>
              </li>
            ))}
            {!products.length && <li className="pt-6 text-[11px] text-muted-foreground">Composing pages…</li>}
          </ul>
          <p className="mt-6 border-t border-border/50 pt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Each model is followed by its option chapters
          </p>
        </div>
      ),
    });

    products.forEach((p, idx) => {
      const number = String(idx + 1).padStart(2, "0");

      list.push({
        key: `${p.id}-hero`,
        render: () => (
          <div className="relative h-full w-full">
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
            <div className="relative flex h-full flex-col justify-end p-8 text-white sm:p-10">
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-80">
                {number} — {p.brand ?? category.label}
              </p>
              <h3 className="mt-2 font-serif text-3xl font-light leading-tight sm:text-5xl">{p.name}</h3>
              {p.meta && <p className="mt-3 max-w-sm text-[11px] leading-relaxed opacity-80">{p.meta}</p>}
            </div>
          </div>
        ),
      });

      list.push({
        key: `${p.id}-spec`,
        render: () => (
          <div className="flex h-full w-full flex-col p-8 sm:p-10">
            <Eyebrow>
              {number} — Specification
            </Eyebrow>
            <h3 className="mt-2 font-serif text-3xl font-light leading-tight">{p.name}</h3>
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
            <ul className="mt-6 space-y-1.5">
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
            <p className="mt-auto border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
              Price includes installation at your home address. The following pages carry each option chapter for this
              model.
            </p>
          </div>
        ),
      });

      groups.forEach((g, gi) => {
        list.push({
          key: `${p.id}-opt-${gi}`,
          render: () => (
            <div className="flex h-full w-full flex-col p-8 sm:p-10">
              <div className="flex items-baseline justify-between gap-3">
                <Eyebrow>
                  {number}.{gi + 1} — Option
                </Eyebrow>
                <Eyebrow className="hidden sm:block">{p.name}</Eyebrow>
              </div>
              <h3 className="mt-2 font-serif text-3xl font-light leading-tight sm:text-4xl">{g.title}</h3>
              <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{g.note}</p>
              <ul className="mt-6 min-h-0 flex-1">
                {g.options.map((o, oi) => (
                  <li
                    key={o}
                    className="flex items-baseline justify-between gap-4 border-t border-border/50 py-2.5 text-[12px] text-foreground"
                  >
                    <span>{o}</span>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                      {String(oi + 1).padStart(2, "0")}
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

    list.push({
      key: "back",
      tone: "cover",
      render: () => (
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-10 text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">End of edition</p>
          <p className="font-serif text-3xl font-light leading-snug">{category.label}</p>
          <div className="h-px w-12 bg-current opacity-40" />
          <p className="max-w-xs text-[11px] leading-relaxed opacity-70">
            Turn back for another discipline, or open the full collection to configure yours.
          </p>
        </div>
      ),
    });

    // react-pageflip needs an even leaf count for clean spreads
    if (list.length % 2 !== 0) {
      list.splice(list.length - 1, 0, {
        key: "colophon",
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
  }, [category, products, groups]);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

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

  return (
    <section aria-label="FLIP Magazine edition" className="relative bg-background">
      <div className="flex flex-wrap items-baseline justify-between gap-3 px-6 py-5 md:px-10">
        <div className="flex items-baseline gap-3">
          <p className="font-serif text-xl font-light leading-none tracking-tight text-foreground">FLIP</p>
          <span className="hidden h-px w-8 bg-foreground/30 sm:block" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Magazine Edition</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:block">
            {String(Math.min(page + 1, pages.length)).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={flipPrev}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={flipNext}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <nav
        aria-label="Magazine editions"
        className="flex gap-x-5 gap-y-2 overflow-x-auto border-y border-border/50 px-6 py-3 md:flex-wrap md:justify-center md:overflow-visible md:px-10"
      >
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCategoryId(item.id)}
            className={`shrink-0 whitespace-nowrap border-b pb-0.5 text-[9px] uppercase tracking-[0.28em] transition-colors ${
              categoryId === item.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-2 py-8 md:px-6 md:py-12">
        <div className="mx-auto flex justify-center" style={{ perspective: "3000px", minHeight: dims.h }}>
          {!entries ? (
            <div
              className="flex items-center justify-center border border-border/60"
              style={{ width: portrait ? dims.w : dims.w * 2, height: dims.h }}
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Composing the edition…</p>
            </div>
          ) : (
            <HTMLFlipBook
              key={`${categoryId}-${pages.length}-${dims.w}`}
              ref={bookRef}
              width={dims.w}
              height={dims.h}
              size="fixed"
              minWidth={240}
              maxWidth={1400}
              minHeight={340}
              maxHeight={1400}
              showCover
              usePortrait={portrait}
              mobileScrollSupport
              drawShadow
              flippingTime={880}
              maxShadowOpacity={0.5}
              startPage={0}
              startZIndex={0}
              autoSize={false}
              clickEventForward={false}
              useMouseEvents
              swipeDistance={30}
              showPageCorners
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
        <p className="mt-8 text-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
          Every model is a spread — every option chapter its own page
        </p>
      </div>
    </section>
  );
};

export default FlipMagazine;
