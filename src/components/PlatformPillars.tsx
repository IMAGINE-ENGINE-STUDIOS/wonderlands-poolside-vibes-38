import * as React from "react";
import { Link } from "react-router-dom";

import outdoorImage from "@/assets/banners/latham-gilmer-banner.webp";
import solarImage from "@/assets/solar/solar-roof-array.jpg";
import homeImage from "@/assets/banners/lanai-banner.webp";

/**
 * PlatformPillars — the three pillars of the platform on the homepage:
 * Home Transformation, Outdoor Living, Solar & Energy.
 *
 * Presentation only; each pillar links to the relevant on-page section so the
 * catalog below reads as product inventory of the platform, not the identity.
 */

type Pillar = {
  eyebrow: string;
  title: string;
  copy: string;
  items: string[];
  image: string;
  alt: string;
  cta: { label: string; to: string };
};

const PILLARS: Pillar[] = [
  {
    eyebrow: "Home Transformation",
    title: "Improve the whole property, not one project at a time.",
    copy:
      "Patios, enclosures, lanais, hardscape, lighting, boundaries and greenery — planned together so every improvement fits the next one.",
    items: [
      "Patios & Pavers",
      "Lanais & Pergolas",
      "Screen Enclosures",
      "Fencing & Gates",
      "Driveway Gates",
      "Landscaping & Turf",
    ],
    image: homeImage,
    alt: "Covered lanai and patio transformation",
    cta: { label: "Explore Home Transformation", to: "/#lanai" },
  },
  {
    eyebrow: "Outdoor Living",
    title: "Turn your outdoor space into your favorite place.",
    copy:
      "A complete outdoor environment designed around the way you live — with pools and spas as the flagship centerpiece.",
    items: [
      "Pools & Spas",
      "Saunas & Cold Plunges",
      "Tanning Ledges",
      "Water Features",
      "Finishes & Liners",
      "Outdoor Lighting",
    ],
    image: outdoorImage,
    alt: "Resort-style pool and outdoor living space",
    cta: { label: "Explore Outdoor Living", to: "/#pools" },
  },
  {
    eyebrow: "Solar & Energy",
    title: "Power your home. Protect your future.",
    copy:
      "Integrated solar and energy solutions, considered as part of the entire property transformation rather than a separate job.",
    items: [
      "Solar Panels",
      "Battery Storage",
      "EV Charging",
      "Roof & Anchoring Systems",
      "Energy Solutions",
    ],
    image: solarImage,
    alt: "Rooftop solar array on a Florida home",
    cta: { label: "Explore Solar & Energy", to: "/#solar" },
  },
];

const PlatformPillars: React.FC = () => {
  return (
    <section
      id="pillars"
      aria-label="Wonderlands pillars"
      className="bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
          Three Pillars — One Platform
        </p>
        <h2 className="mt-6 max-w-3xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-5xl">
          One platform. Endless possibilities.
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Start with a patio. Add a pool. Add landscaping. Add lighting. Add solar,
          battery storage and an EV charger. Build the home you actually want — all
          through one connected experience.
        </p>
        <div className="mt-10 h-px w-24 bg-foreground/30" />

        <div className="mt-12 space-y-px bg-border/40">
          {PILLARS.map((pillar, index) => (
            <article
              key={pillar.eyebrow}
              className="grid grid-cols-1 gap-px bg-border/40 lg:grid-cols-12"
            >
              <div
                className={`relative overflow-hidden bg-background lg:col-span-6 ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <div className="relative aspect-[16/10]">
                  <img
                    src={pillar.image}
                    alt={pillar.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </div>

              <div className="flex flex-col justify-between bg-background p-7 md:p-10 lg:col-span-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                    {pillar.eyebrow}
                  </p>
                  <h3 className="mt-5 font-serif text-2xl font-light leading-tight text-foreground md:text-4xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {pillar.copy}
                  </p>
                  <ul className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2 border-t border-border/60 pt-6 text-sm text-muted-foreground">
                    {pillar.items.map((item) => (
                      <li key={item} className="border-b border-border/40 pb-2">{item}</li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={pillar.cta.to}
                  className="mt-9 inline-flex w-fit items-center gap-2 border-b border-foreground/40 pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground transition hover:border-foreground"
                >
                  {pillar.cta.label}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformPillars;
