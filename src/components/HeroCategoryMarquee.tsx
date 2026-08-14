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

// react-pageflip depends on CSS perspective transforms + DOM measurements that
// frequently render blank in Safari, Firefox and mobile browsers. Detect
// desktop Chromium and fall back to a horizontal strip everywhere else.
const useFlipbookSupported = () => {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg|EdgiOS|OPR|SamsungBrowser/.test(ua);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua);
    setSupported(isChromium && !isMobile);
  }, []);
  return supported;
};

const CategoryLeaf: React.FC<{ item: (typeof ITEMS)[number]; index: number }> = ({ item, index }) => (
  <button
    onClick={scrollToBrowse}
    className="group relative flex h-full w-full flex-col bg-background px-6 py-6 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
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

const BookPage = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div ref={ref} className="h-full w-full overflow-hidden border-l border-border/50 bg-background">
    {children}
  </div>
));
BookPage.displayName = "BookPage";

const HeroCategoryMarquee: React.FC = () => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const flipbookSupported = useFlipbookSupported();

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  return (
    <section aria-label="Product categories" className="relative border-y border-border/60 bg-background">
      <div className="flex items-baseline justify-between px-6 py-5 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          The Index — Fourteen Disciplines
        </p>
        <div className="flex items-center gap-4">
          <p className="hidden text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:block">
            {flipbookSupported
              ? `${String(currentPage + 1).padStart(2, "0")} / ${String(ITEMS.length).padStart(2, "0")}`
              : "Wonderlands World"}
          </p>
          {flipbookSupported && (
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
          )}
        </div>
      </div>

      <div className="border-t border-border/50 px-4 py-8 md:px-10">
        {flipbookSupported ? (
          <HTMLFlipBook
            ref={bookRef}
            width={340}
            height={520}
            size="stretch"
            minWidth={260}
            maxWidth={440}
            minHeight={420}
            maxHeight={620}
            showCover={false}
            mobileScrollSupport
            drawShadow
            flippingTime={700}
            maxShadowOpacity={0.4}
            usePortrait={false}
            startPage={0}
            startZIndex={0}
            autoSize
            clickEventForward
            useMouseEvents
            swipeDistance={80}
            showPageCorners
            disableFlipByClick={false}
            style={{}}
            className="mx-auto shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            onFlip={(e: any) => setCurrentPage(e.data)}
          >
            {ITEMS.map((item, idx) => (
              <BookPage key={item.label}>
                <CategoryLeaf item={item} index={idx} />
              </BookPage>
            ))}
          </HTMLFlipBook>
        ) : (
          <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto scrollbar-hide">
            {ITEMS.map((item, idx) => (
              <div
                key={item.label}
                className="w-[240px] shrink-0 snap-start border-l border-border/50 first:border-l-0"
              >
                <CategoryLeaf item={item} index={idx} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroCategoryMarquee;
