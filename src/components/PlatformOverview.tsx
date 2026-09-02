import * as React from "react";
import { Link } from "react-router-dom";

import outdoorImage from "@/assets/banners/latham-gilmer-banner.webp";
import solarImage from "@/assets/solar/solar-roof-array.jpg";
import homeImage from "@/assets/banners/lanai-banner.webp";

/**
 * PlatformOverview — single homepage plate that replaces the three older
 * platform sections (PlatformPositioning, PlatformPillars, PlatformJourney).
 *
 * Those three repeated the same message ("one platform", "one team",
 * "endless possibilities") across ~370 lines. This consolidates the story into
 * one editorial statement, three image-led solution plates, and a compact
 * three-step process with the primary calls to action.
 *
 * Presentation only — no pricing or business logic lives here.
 */

type Solution = {
  eyebrow: string;
  title: string;
  copy: string;
  items: string[];
  image: string;
  alt: string;
  to: string;
  /** Secondary link into the configuration suite for this solution */
  suite?: { to: string; label: string };
};

const SOLUTIONS: Solution[] = [
  {
    eyebrow: "01 — Outdoor Living",
    title: "Pools, spas and the spaces around them",
    copy:
      "Pools, spas, saunas, cold plunges, tanning ledges, water features and lighting — designed as one outdoor environment.",
    items: ["Pools & Spas", "Saunas & Cold Plunges", "Water Features", "Finishes & Liners"],
    image: outdoorImage,
    alt: "Resort-style pool with sun deck and water feature",
    to: "/#pools",
    suite: { to: "/suites/spas", label: "Spa & Sauna Suites" },
  },
  {
    eyebrow: "02 — Home Transformation",
    title: "Patios, enclosures and everything in between",
    copy:
      "Hardscape, lanais, screen enclosures, fencing, gates and landscaping — planned together so each improvement fits the next.",
    items: ["Patios & Pavers", "Lanais & Pergolas", "Screen Enclosures", "Landscaping & Turf"],
    image: homeImage,
    alt: "Covered lanai with pavers and landscaping",
    to: "/#lanai",
    suite: { to: "/suites/enclosures", label: "Enclosure, Lanai & Fencing Suite" },
  },
  {
    eyebrow: "03 — Solar & Energy",
    title: "Power the home you just transformed",
    copy:
      "Solar arrays, battery storage, EV charging and anchoring systems, engineered from your actual roof, not a brochure.",
    items: ["Solar Panels", "Battery Storage", "EV Charging", "Roof & Anchoring"],
    image: solarImage,
    alt: "Rooftop solar array on a Florida home",
    to: "/#solar",
    suite: { to: "/solar-board", label: "Total Solar Calculator" },
  },
];

const STEPS: Array<{ num: string; title: string; copy: string }> = [
  { num: "01", title: "Imagine", copy: "Tell us what you want to create." },
  { num: "02", title: "Design & price", copy: "Visualize, configure and price the whole project in Wonderlands Studio." },
  { num: "03", title: "Build", copy: "Our team and specialists deliver it — one project, one point of contact." },
];

const PlatformOverview: React.FC = () => {
  return (
    <section
      id="platform"
      aria-label="The Wonderlands platform"
      className="bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Statement */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
              Wonderlands — Home Transformation Platform
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Everything your home needs. One platform.
            </h2>
            <div className="mt-9 h-px w-24 bg-foreground/30" />
          </div>
          <div className="lg:col-span-5 lg:pt-16">
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Design, build, power and transform your property through one
              technology-powered experience — outdoor living, home improvement, solar
              and energy, with the design tools, products and specialists in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* "Start My Project" intentionally hidden — consultation is the primary CTA */}
              <Link
                to="/consultation"
                className="inline-flex items-center justify-center rounded-full border border-foreground/25 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.25em] text-foreground transition hover:-translate-y-0.5 hover:border-foreground/50"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Image-led solutions */}
        <div className="mt-16 grid grid-cols-1 gap-px bg-border/40 md:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <article key={s.eyebrow} className="flex flex-col bg-background">
              <Link to={s.to} className="group relative block overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <img
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-7 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  {s.eyebrow}
                </p>
                <h3 className="mt-5 font-serif text-2xl font-light leading-tight text-foreground">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
                <ul className="mt-6 space-y-2 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                  {s.items.map((item) => (
                    <li key={item} className="border-b border-border/40 pb-2">
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-col items-start gap-3">
                  <Link
                    to={s.to}
                    className="inline-flex w-fit items-center gap-2 border-b border-foreground/40 pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground transition hover:border-foreground"
                  >
                    Explore
                    <span aria-hidden>→</span>
                  </Link>
                  {s.suite && (
                    <Link
                      to={s.suite.to}
                      className="inline-flex w-fit items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition hover:text-foreground"
                    >
                      {s.suite.label}
                      <span aria-hidden>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Process — three steps, no repetition of the statement above */}
        <ol className="mt-16 grid grid-cols-1 gap-px border-t border-border/60 bg-border/40 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.num} className="bg-background p-7 md:p-9">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                {step.num} — {step.title}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default PlatformOverview;
