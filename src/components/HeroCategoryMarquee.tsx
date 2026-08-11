import * as React from "react";

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

const Track: React.FC<{ ariaHidden?: boolean }> = ({ ariaHidden }) => (
  <div className="flex shrink-0 items-stretch" aria-hidden={ariaHidden}>
    {ITEMS.map((item, idx) => (
      <button
        key={`${item.label}-${idx}`}
        onClick={scrollToBrowse}
        tabIndex={ariaHidden ? -1 : 0}
        className="group relative flex w-[220px] shrink-0 flex-col border-l border-border/50 px-5 py-5 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
      >
        <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden">
          <img
            src={item.image}
            alt={item.label}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <p className="mb-2 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
          {String((idx % ITEMS.length) + 1).padStart(2, "0")} — {item.tagline}
        </p>
        <h3 className="font-serif text-lg font-light leading-tight text-foreground">
          {item.label}
        </h3>
        <div className="mt-3 h-px w-6 bg-foreground/30 transition-all duration-500 group-hover:w-14" />
      </button>
    ))}
  </div>
);

const HeroCategoryMarquee: React.FC = () => {
  return (
    <section aria-label="Product categories" className="relative border-y border-border/60 bg-background">
      <div className="flex items-baseline justify-between px-6 py-5 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          The Index — Fourteen Disciplines
        </p>
        <p className="hidden text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:block">
          Wonderlands World
        </p>
      </div>

      <div className="group/marquee relative overflow-hidden border-t border-border/50">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-28" />

        <div className="flex w-max animate-[hero-marquee_60s_linear_infinite] group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
          <Track />
          <Track ariaHidden />
        </div>
      </div>
    </section>
  );
};

export default HeroCategoryMarquee;
