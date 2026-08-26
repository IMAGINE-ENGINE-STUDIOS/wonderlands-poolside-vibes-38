import * as React from "react";

import lathamGilmerBanner from "@/assets/banners/latham-gilmer-banner.webp";
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
import grassBanner from "@/assets/turf/grass-natural-green.avif";
import finishImg from "@/assets/finishes/sapphire-blue-g3.webp";
import linerImg from "@/assets/finishes/ocean-blue-g3.webp";

interface BrowseCategoriesEditorialProps {
  activeId: string;
  onSelect: (id: string) => void;
}

const CATEGORIES: { id: string; label: string; image: string; tagline: string }[] = [
  { id: "pools", label: "Pools", image: lathamGilmerBanner, tagline: "Signature Waters" },
  { id: "saunas", label: "Saunas", image: saunaBanner, tagline: "Quiet Heat" },
  { id: "spas", label: "Spas", image: spaBanner, tagline: "Private Repose" },
  { id: "tanning-ledges", label: "Tanning Ledges", image: tanningLedgeBanner, tagline: "Sun Shelves" },
  { id: "screen-enclosures", label: "Screen Enclosures", image: screenEnclosureBanner, tagline: "Open Air, Refined" },
  { id: "patio-fencing", label: "Patio Fencing", image: patioFencingBanner, tagline: "Defined Edges" },
  { id: "lanai", label: "Lanai", image: lanaiBanner, tagline: "Covered Living" },
  { id: "pavers", label: "Pavers", image: paversBanner, tagline: "Underfoot Detail" },
  { id: "artificial-grass", label: "Artificial Grass", image: grassBanner, tagline: "Effortless Green" },
  { id: "landscaping", label: "Landscaping", image: landscapingBanner, tagline: "Botanical Compositions" },
  { id: "solar", label: "Wonderlands Solar", image: solarRoofArray, tagline: "Sunlight, Stored" },
  { id: "covers", label: "Covers", image: coversBanner, tagline: "Quiet Protection" },
  { id: "driveway-gates", label: "Driveway Gates", image: drivewayGateBanner, tagline: "Arrival Statement" },
  { id: "finishes", label: "Finishes", image: finishImg, tagline: "Surface & Light" },
  { id: "liners", label: "Liners", image: linerImg, tagline: "Inner Hue" },
];

const BrowseCategoriesEditorial: React.FC<BrowseCategoriesEditorialProps> = ({ activeId, onSelect }) => {
  const handleClick = (id: string) => {
    onSelect(id);
    requestAnimationFrame(() => {
      const main = document.querySelector("main");
      main?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section
      id="browse-categories"
      aria-label="Browse Categories"
      className="bg-background py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Editorial header */}
        <div className="mb-14 md:mb-20">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-6">
            Collections — Index
          </p>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight text-foreground max-w-4xl">
            Browse the Wonderlands Atelier
          </h2>
          <div className="mt-8 h-px w-24 bg-foreground/30" />
          <p className="mt-6 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Fourteen disciplines composing one outdoor world — from water and stone
            to shelter, surface and verdure.
          </p>
        </div>

        {/* Editorial grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/40">
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeId === cat.id;
            const num = String(idx + 1).padStart(2, "0");
            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat.id)}
                className={`group relative block w-full overflow-hidden bg-background text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground transition-all`}
                aria-label={`Open ${cat.label} section`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/85" />

                  {/* Active accent ring */}
                  {isActive && (
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/70" />
                  )}

                  {/* Top-right index numeral */}
                  <div className="absolute top-4 right-4 text-[10px] tracking-[0.3em] text-white/70 font-light">
                    {num} / 14
                  </div>

                  {/* Bottom meta block */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-white/70 mb-3">
                      {cat.tagline}
                    </p>
                    <div className="h-px w-8 bg-white/60 mb-3 transition-all duration-500 group-hover:w-16" />
                    <h3 className="font-serif text-xl md:text-2xl font-light leading-tight transition-transform duration-500 group-hover:-translate-y-0.5">
                      {cat.label}
                    </h3>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer caption */}
        <div className="mt-14 md:mt-20 flex flex-col items-center text-center">
          <div className="h-px w-16 bg-foreground/30 mb-6" />
          <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground">
            Fourteen Categories — One World
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrowseCategoriesEditorial;
