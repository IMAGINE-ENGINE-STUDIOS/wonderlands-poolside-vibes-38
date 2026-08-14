import * as React from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
import finishImg from "@/assets/finishes/sapphire-blue-g3.webp";
import linerImg from "@/assets/finishes/ocean-blue-g3.webp";

const ITEMS: { label: string; tagline: string; image: string }[] = [
  { label: "Pools", tagline: "Signature Waters", image: lathamGilmerBanner },
  { label: "Saunas", tagline: "Quiet Heat", image: saunaBanner },
  { label: "Spas", tagline: "Private Repose", image: spaBanner },
  { label: "Tanning Ledges", tagline: "Sun Shelves", image: tanningLedgeBanner },
  { label: "Screen Enclosures", tagline: "Open Air, Refined", image: screenEnclosureBanner },
  { label: "Patio Fencing", tagline: "Defined Edges", image: patioFencingBanner },
  { label: "Lanai", tagline: "Covered Living", image: lanaiBanner },
  { label: "Pavers", tagline: "Underfoot Detail", image: paversBanner },
  { label: "Artificial Grass", tagline: "Effortless Green", image: grassBanner },
  { label: "Landscaping", tagline: "Botanical Compositions", image: landscapingBanner },
  { label: "Covers", tagline: "Quiet Protection", image: coversBanner },
  { label: "Driveway Gates", tagline: "Arrival Statement", image: drivewayGateBanner },
  { label: "Finishes", tagline: "Surface & Light", image: finishImg },
  { label: "Liners", tagline: "Inner Hue", image: linerImg },
];

const scrollToBrowse = () => {
  document.getElementById("browse-categories")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const CategoryLeaf: React.FC<{ item: (typeof ITEMS)[number]; index: number }> = ({ item, index }) => (
  <button
    onClick={scrollToBrowse}
    className="group relative flex h-full w-full flex-col bg-background px-7 py-7 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
  >
    <div className="relative mb-5 aspect-[4/5] w-full overflow-hidden">
      <img
        src={item.image}
        alt={item.label}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
    </div>
    <p className="mb-2 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
      {String(index + 1).padStart(2, "0")} — {item.tagline}
    </p>
    <h3 className="font-serif text-2xl font-light leading-tight text-foreground">{item.label}</h3>
    <div className="mt-3 h-px w-6 bg-foreground/30 transition-all duration-500 group-hover:w-14" />
    <span className="mt-auto pt-5 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
      Wonderlands World
    </span>
  </button>
);

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
    <h3 className="font-serif text-4xl font-light leading-tight">The Index</h3>
    <div className="h-px w-12 bg-current opacity-40" />
    <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">Fourteen Disciplines</p>
  </div>
);

const BackFace: React.FC = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-10 text-center">
    <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">Volume I</p>
    <p className="font-serif text-2xl font-light leading-snug">
      One outdoor world — water, stone, shelter, verdure.
    </p>
    <div className="h-px w-12 bg-current opacity-40" />
  </div>
);

const HeroCategoryMarquee: React.FC = () => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 400, h: 560 });

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const isPortrait = vw < 900;
      setPortrait(isPortrait);
      const available = Math.min(vw - 48, 1120);
      const w = isPortrait
        ? Math.min(available, 420)
        : Math.min(Math.floor(available / 2), 460);
      setDims({ w, h: Math.round(w * 1.4) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  const totalPages = ITEMS.length + 2;

  return (
    <section aria-label="Product categories" className="relative border-y border-border/60 bg-background">
      <div className="flex items-baseline justify-between px-6 py-5 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          The Index — Fourteen Disciplines
        </p>
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

      <div className="border-t border-border/50 px-4 py-10 md:px-10">
        <div
          className="mx-auto flex justify-center"
          style={{ perspective: "2400px", minHeight: dims.h }}
        >
          <HTMLFlipBook
            ref={bookRef}
            width={dims.w}
            height={dims.h}
            size="fixed"
            minWidth={240}
            maxWidth={520}
            minHeight={340}
            maxHeight={760}
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
            disableFlipByClick={false}
            style={{}}
            className="shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)]"
            onFlip={(e: any) => setCurrentPage(e.data)}
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
          Drag a corner or use the arrows to turn the page
        </p>
      </div>
    </section>
  );
};

export default HeroCategoryMarquee;
