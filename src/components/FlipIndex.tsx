import * as React from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import lathamGilmerBanner from "@/assets/latham-gilmer-banner.webp";
import saunaBanner from "@/assets/banners/sauna-banner.webp";
import spaBanner from "@/assets/banners/spa-banner.webp";
import screenEnclosureBanner from "@/assets/banners/screen-enclosure-banner.webp";
import paversBanner from "@/assets/banners/pavers-banner.webp";
import coversBanner from "@/assets/banners/covers-banner.webp";
import drivewayGateBanner from "@/assets/banners/driveway-gate-banner.webp";
import tanningLedgeBanner from "@/assets/banners/tanning-ledge-banner.webp";
import patioFencingBanner from "@/assets/banners/patio-fencing-banner.webp";
import lanaiBanner from "@/assets/banners/lanai-banner.webp";
import landscapingBanner from "@/assets/banners/landscaping-banner.webp";
import grassBanner from "@/assets/grass-natural-green.avif";
import sapphireFinish from "@/assets/finishes/sapphire-blue-g3.webp";
import oceanLiner from "@/assets/finishes/ocean-blue-g3.webp";
import aquamarineFinish from "@/assets/finishes/aquamarine-g3.webp";
import nightSkyFinish from "@/assets/finishes/night-sky-g3.webp";
import shaleFinish from "@/assets/finishes/shale-gray-g3.webp";
import lagoonFinish from "@/assets/finishes/lagoon-blue-g2.webp";

type Layout = "full" | "duo" | "editorial";

type Item = {
  id: string;
  label: string;
  tagline: string;
  layout: Layout;
  images: string[];
  description: string;
  notes: string[];
};

const ITEMS: Item[] = [
  {
    id: "pools",
    label: "Pools",
    tagline: "Signature Waters",
    layout: "editorial",
    images: [lathamGilmerBanner, sapphireFinish],
    description:
      "Engineered fiberglass shells and custom concrete geometries, delivered turnkey. Every vessel is drawn around the house it belongs to — sightlines, sun path, and the way water holds the sky.",
    notes: ["Latham & Glimmerglass shells", "Turnkey installation included", "3.5x design multiplier"],
  },
  {
    id: "saunas",
    label: "Saunas",
    tagline: "Quiet Heat",
    layout: "duo",
    images: [saunaBanner, lanaiBanner],
    description:
      "Nordic cedar and thermally treated spruce cabins from Almost Heaven and Harvia. Barrel, cabin, and panoramic models — wired, set, and heated on delivery day.",
    notes: ["Cedar & spruce cabins", "Electric or wood heaters", "Indoor and outdoor models"],
  },
  {
    id: "spas",
    label: "Spas",
    tagline: "Private Repose",
    layout: "editorial",
    images: [spaBanner, lagoonFinish],
    description:
      "Integrated spillover spas and standalone vessels with programmable jets, LED spectrum, and dedicated heating — a warm room at the edge of the water.",
    notes: ["Spillover or standalone", "Programmable hydrotherapy", "4x design multiplier"],
  },
  {
    id: "tanning-ledges",
    label: "Tanning Ledges",
    tagline: "Sun Shelves",
    layout: "full",
    images: [tanningLedgeBanner],
    description:
      "Shallow sun shelves at nine inches — a threshold between deck and depth, detailed with bubblers and in-water seating.",
    notes: ["9in shelf depth", "Bubblers & umbrella sleeves", "Matched finish to shell"],
  },
  {
    id: "screen-enclosures",
    label: "Screen Enclosures",
    tagline: "Open Air, Refined",
    layout: "duo",
    images: [screenEnclosureBanner, patioFencingBanner],
    description:
      "Aluminum superstructures engineered to Florida wind load, with self-latching doors and mansard or gable profiles. Drawn to code, priced to the panel.",
    notes: ["Florida wind-load engineered", "Self-latching pool doors", "Mansard & gable profiles"],
  },
  {
    id: "patio-fencing",
    label: "Patio Fencing",
    tagline: "Defined Edges",
    layout: "editorial",
    images: [patioFencingBanner, screenEnclosureBanner],
    description:
      "Powder-coated aluminum fencing in 4ft and 5ft heights — pool-code compliant, corrosion resistant, and quiet against a garden.",
    notes: ["4ft & 5ft heights", "Pool-code compliant", "Self-closing gates"],
  },
  {
    id: "lanai",
    label: "Lanai",
    tagline: "Covered Living",
    layout: "full",
    images: [lanaiBanner],
    description:
      "Roofed outdoor rooms with insulated panels, fans, and lighting — the shaded companion to the pool deck.",
    notes: ["Insulated roof panels", "Integrated lighting & fans", "Custom spans"],
  },
  {
    id: "pavers",
    label: "Pavers",
    tagline: "Underfoot Detail",
    layout: "duo",
    images: [paversBanner, grassBanner],
    description:
      "Travertine, porcelain, and Coralina fields laid on compacted base with a defined coping edge. The deck is the frame of the picture.",
    notes: ["Travertine & porcelain", "Coralina at $25/sqft", "Coping edge detailing"],
  },
  {
    id: "artificial-grass",
    label: "Artificial Grass",
    tagline: "Effortless Green",
    layout: "editorial",
    images: [grassBanner, landscapingBanner],
    description:
      "High-density turf with drainage base and hidden seams — permanently green, drawn to any patio geometry in the studio.",
    notes: ["$25/sqft installed", "Drainage base system", "Drawing board layout"],
  },
  {
    id: "landscaping",
    label: "Landscaping",
    tagline: "Botanical Compositions",
    layout: "duo",
    images: [landscapingBanner, grassBanner],
    description:
      "Palms, specimen trees, ornamental grasses and beds composed as a planting plan — mass, height, and shadow scheduled by season.",
    notes: ["Specimen palms & trees", "Ornamental grasses", "Planting plans"],
  },
  {
    id: "covers",
    label: "Covers",
    tagline: "Quiet Protection",
    layout: "full",
    images: [coversBanner],
    description:
      "Automatic covers recessed into the deck — safety, heat retention, and evaporation control on a single key turn.",
    notes: ["Recessed track systems", "Safety rated", "Heat retention"],
  },
  {
    id: "driveway-gates",
    label: "Driveway Gates",
    tagline: "Arrival Statement",
    layout: "editorial",
    images: [drivewayGateBanner, patioFencingBanner],
    description:
      "Swing and slide gates in aluminum or steel with automation, keypads, and intercom — the first line of the property's drawing.",
    notes: ["Swing & slide", "Automation and keypads", "Custom infill patterns"],
  },
  {
    id: "finishes",
    label: "Finishes",
    tagline: "Surface & Light",
    layout: "duo",
    images: [sapphireFinish, aquamarineFinish],
    description:
      "Interior finishes chosen for how they carry light — from pale pearl to deep night sky. The same water reads differently on every surface.",
    notes: ["G2 & G3 finish grades", "Gelcoat for Glimmerglass", "Sample-matched palettes"],
  },
  {
    id: "liners",
    label: "Liners",
    tagline: "Inner Hue",
    layout: "duo",
    images: [oceanLiner, nightSkyFinish, shaleFinish],
    description:
      "Printed liners with waterline borders and mosaic bands — a complete change of tone without touching the shell.",
    notes: ["Waterline borders", "Mosaic band options", "Shell-safe installation"],
  },
];

const goToSection = (id: string) => {
  if (window.location.hash.replace("#", "") === id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.location.hash = id;
  }
  window.setTimeout(() => {
    document.querySelector("main")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 120);
};

const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[9px] uppercase tracking-[0.35em] text-muted-foreground ${className}`}>{children}</p>
);

const Notes: React.FC<{ notes: string[] }> = ({ notes }) => (
  <ul className="mt-4 space-y-1.5">
    {notes.map((n) => (
      <li key={n} className="flex items-start gap-2 border-t border-border/50 pt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="mt-[5px] h-px w-3 shrink-0 bg-foreground/40" />
        {n}
      </li>
    ))}
  </ul>
);

const ExploreButton: React.FC<{ item: Item }> = ({ item }) => (
  <a
    href={`/#${item.id}`}
    onClick={(e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("flip:open-console", { detail: item.id }));
    }}
    className="group/btn mt-auto inline-flex w-full items-center justify-between border border-foreground bg-foreground px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-background hover:text-foreground"
  >
    Open {item.label}
    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
  </a>
);



const Frame: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = "" }) => (
  <div className={`group relative overflow-hidden ${className}`}>
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
  </div>
);

const CategoryLeaf: React.FC<{ item: Item; index: number }> = ({ item, index }) => {
  const number = String(index + 1).padStart(2, "0");
  return (
    <div className="flex h-full w-full flex-col bg-background px-6 py-6 text-left sm:px-8 sm:py-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <Eyebrow>
          {number} — {item.tagline}
        </Eyebrow>
        <Eyebrow className="hidden sm:block">Wonderlands World</Eyebrow>
      </div>

      {item.layout === "full" && (
        <>
          <Frame src={item.images[0]} alt={item.label} className="mb-5 min-h-0 flex-1" />
          <h3 className="font-serif text-3xl font-light leading-tight text-foreground sm:text-4xl">{item.label}</h3>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">{item.description}</p>
          <Notes notes={item.notes} />
        </>
      )}

      {item.layout === "duo" && (
        <>
          <div className="mb-4 grid min-h-0 flex-1 grid-cols-2 gap-2">
            <Frame src={item.images[0]} alt={item.label} className="h-full" />
            <div className="grid h-full grid-rows-2 gap-2">
              <Frame src={item.images[1] ?? item.images[0]} alt={item.label} className="h-full" />
              {item.images[2] ? (
                <Frame src={item.images[2]} alt={item.label} className="h-full" />
              ) : (
                <div className="flex h-full flex-col justify-end border border-border/60 p-3">
                  <Eyebrow>Volume</Eyebrow>
                  <p className="font-serif text-4xl font-light leading-none text-foreground">{number}</p>
                </div>
              )}
            </div>
          </div>
          <h3 className="font-serif text-3xl font-light leading-tight text-foreground sm:text-4xl">{item.label}</h3>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">{item.description}</p>
          <Notes notes={item.notes} />
        </>
      )}

      {item.layout === "editorial" && (
        <>
          <Frame src={item.images[0]} alt={item.label} className="mb-4 min-h-0 flex-[1.4]" />
          <h3 className="font-serif text-3xl font-light leading-tight text-foreground sm:text-4xl">{item.label}</h3>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
            <p className="text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">{item.description}</p>
            <div className="relative h-20 w-20 shrink-0 overflow-hidden sm:h-24 sm:w-24">
              <img
                src={item.images[1] ?? item.images[0]}
                alt={`${item.label} detail`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
          <Notes notes={item.notes} />
        </>
      )}

      <div className="mt-5 flex flex-col">
        <ExploreButton item={item} />
      </div>
    </div>
  );
};

const BookPage = forwardRef<HTMLDivElement, { children: React.ReactNode; tone?: "paper" | "cover" }>(
  ({ children, tone = "paper" }, ref) => (
    <div
      ref={ref}
      className={
        tone === "cover"
          ? "h-full w-full overflow-hidden bg-foreground text-background"
          : "h-full w-full overflow-hidden bg-background"
      }
      style={{
        boxShadow:
          tone === "cover"
            ? "inset 0 0 60px rgba(0,0,0,0.35)"
            : "inset 12px 0 24px -18px rgba(0,0,0,0.35), inset -12px 0 24px -18px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  ),
);
BookPage.displayName = "BookPage";

const CoverFace: React.FC = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-10 text-center">
    <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">Wonderlands World</p>
    <h3 className="font-serif text-5xl font-light leading-tight md:text-6xl">The Index</h3>
    <div className="h-px w-12 bg-current opacity-40" />
    <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">Fourteen Disciplines</p>
    <p className="mt-4 max-w-xs text-[11px] leading-relaxed opacity-60">
      A complete catalogue of the Wonderlands outdoor world — water, stone, shelter, surface and verdure, drawn as one
      continuous project.
    </p>
  </div>
);

const BackFace: React.FC = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-10 text-center">
    <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">Volume I</p>
    <p className="font-serif text-3xl font-light leading-snug">
      One outdoor world — water, stone, shelter, verdure.
    </p>
    <div className="h-px w-12 bg-current opacity-40" />
    <p className="max-w-xs text-[11px] leading-relaxed opacity-60">
      Every discipline in this index is delivered turnkey, with installation at your home address included.
    </p>
  </div>
);

const setActiveSection = (id: string) => {
  if (window.location.hash.replace("#", "") === id) return;
  window.history.replaceState(null, "", `#${id}`);
  window.dispatchEvent(new Event("hashchange"));
};

const FlipIndex: React.FC = () => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 420, h: 588 });
  const [consoleId, setConsoleId] = useState<string | null>(null);
  const syncingRef = useRef(false);


  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isPortrait = vw < 900;
      setPortrait(isPortrait);

      // Page aspect ratio: tall book on small screens, wide magazine spread on desktop/ultrawide
      const ratio = isPortrait ? 1.38 : vw >= 1800 ? 1.0 : vw >= 1440 ? 1.08 : vw >= 1100 ? 1.2 : 1.32;
      const maxH = Math.max(420, Math.floor(vh * (isPortrait ? 0.78 : 0.94)));
      const availableW = Math.min(vw - (isPortrait ? 32 : 80), 2400);
      const wByWidth = isPortrait ? availableW : Math.floor(availableW / 2);
      const wByHeight = Math.floor(maxH / ratio);
      const w = Math.max(260, Math.min(wByWidth, wByHeight));
      setDims({ w, h: Math.round(w * ratio) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  const turnTo = useCallback((idx: number) => {
    const flip = bookRef.current?.pageFlip();
    if (!flip) return;
    syncingRef.current = true;
    flip.turnToPage(idx + 1);
    window.setTimeout(() => {
      syncingRef.current = false;
    }, 60);
  }, []);

  // Section hash → FLIP page (open the book on whichever category is active)
  useEffect(() => {
    const sync = () => {
      if (syncingRef.current) return;
      const id = window.location.hash.replace("#", "");
      const idx = ITEMS.findIndex((i) => i.id === id);
      if (idx >= 0) turnTo(idx);
    };
    const t = window.setTimeout(sync, 300);
    window.addEventListener("hashchange", sync);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", sync);
    };
  }, [turnTo]);

  // Explore buttons inside the book open the in-place console
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!id) return;
      setConsoleId(id);
      setActiveSection(id);
    };
    window.addEventListener("flip:open-console", onOpen as EventListener);
    return () => window.removeEventListener("flip:open-console", onOpen as EventListener);
  }, []);

  // Keyboard navigation (book only — console handles its own keys)
  useEffect(() => {
    if (consoleId) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") flipPrev();
      if (e.key === "ArrowRight") flipNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipPrev, flipNext, consoleId]);

  const openConsole = useCallback((id: string) => {
    setConsoleId(id);
    setActiveSection(id);
  }, []);

  const closeConsole = useCallback(() => {
    setConsoleId(null);
    const idx = ITEMS.findIndex((i) => i.id === consoleId);
    if (idx >= 0) window.setTimeout(() => turnTo(idx), 30);
  }, [consoleId, turnTo]);

  const totalPages = ITEMS.length + 2;
  const activeIdx = consoleId
    ? ITEMS.findIndex((i) => i.id === consoleId)
    : currentPage >= 1 && currentPage <= ITEMS.length
      ? currentPage - 1
      : -1;


  return (
    <section id="flip" aria-label="FLIP — category index" className="relative border-y border-border/60 bg-background">
      <div className="flex flex-wrap items-baseline justify-between gap-3 px-6 py-5 md:px-10">
        <div className="flex items-baseline gap-3">
          <p className="font-serif text-xl font-light leading-none tracking-tight text-foreground">FLIP</p>
          <span className="hidden h-px w-8 bg-foreground/30 sm:block" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            The Index — Fourteen Disciplines
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:block">
            {`${String(Math.min(currentPage + 1, totalPages)).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`}
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

      {/* Category rail — every category reachable as a real link */}
      <nav
        aria-label="Category index"
        className="flex gap-x-5 gap-y-2 overflow-x-auto border-t border-border/50 px-6 py-3 md:flex-wrap md:justify-center md:overflow-visible md:px-10"
      >
        {ITEMS.map((item, idx) => (
          <a
            key={item.id}
            href={`/#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              turnTo(idx);
              setActiveSection(item.id);
            }}
            className={`shrink-0 whitespace-nowrap border-b pb-0.5 text-[9px] uppercase tracking-[0.28em] transition-colors ${
              activeIdx === idx
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="border-t border-border/50 px-2 py-8 md:px-6 md:py-12">
        <div
          className="mx-auto flex justify-center"
          style={{ perspective: "3000px", minHeight: dims.h }}
        >
          <HTMLFlipBook
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
            flippingTime={900}
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
            onFlip={(e: any) => {
              const page = e.data as number;
              setCurrentPage(page);
              const item = ITEMS[page - 1];
              if (item) {
                syncingRef.current = true;
                setActiveSection(item.id);
                window.setTimeout(() => {
                  syncingRef.current = false;
                }, 60);
              }
            }}
          >
            <BookPage tone="cover">
              <CoverFace />
            </BookPage>
            {ITEMS.map((item, idx) => (
              <BookPage key={item.label}>
                <CategoryLeaf item={item} index={idx} />
              </BookPage>
            ))}
            <BookPage tone="cover">
              <BackFace />
            </BookPage>
          </HTMLFlipBook>
        </div>
        <p className="mt-8 text-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
          Turn the page — every spread opens its collection below
        </p>
      </div>
    </section>
  );
};

export default FlipIndex;

