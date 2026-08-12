import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Box, PenTool, Calculator, FileText, Layers, Sparkles } from "lucide-react";
import useReveal from "@/hooks/useReveal";

import heroPool from "@/assets/hero-pool-optimized.webp";
import maximaPool from "@/assets/maxima-pool.webp";
import poolBanner from "@/assets/pool-banner-2.webp";
import enclosureImg from "@/assets/screen-enclosure-premium.webp";
import fenceImg from "@/assets/aluminum-fencing.webp";
import lanaiImg from "@/assets/lanai-premium.webp";
import landscapingBanner from "@/assets/banners/landscaping-banner.webp";
import paversBanner from "@/assets/banners/pavers-banner.webp";
import saunaBanner from "@/assets/banners/sauna-banner.webp";
import spaBanner from "@/assets/banners/spa-banner.webp";
import coversBanner from "@/assets/banners/covers-banner.webp";
import gateBanner from "@/assets/banners/driveway-gate-banner.webp";
import lathamBanner from "@/assets/latham-gilmer-banner.webp";
import wonderlandsHero from "@/assets/wonderlands-hero.webp";
import logo from "@/assets/wonderlands-logo.webp";

type Family = "3D" | "2D" | "Configurator" | "Documents" | "Commerce" | "Catalog";

/** Each tool gets its own presentation treatment, Apple-keynote style. */
type Stage = "cinema" | "split" | "dark" | "duo" | "poster" | "band";

interface ToolSample {
  id: string;
  index: string;
  name: string;
  family: Family;
  image: string;
  eyebrow: string;
  headline: string;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  to: string;
  cta: string;
  stage: Stage;
}

const FAMILY_ICON: Record<Family, React.ComponentType<{ className?: string }>> = {
  "3D": Box,
  "2D": PenTool,
  Configurator: Layers,
  Documents: FileText,
  Commerce: Calculator,
  Catalog: Sparkles,
};

const TOOLS: ToolSample[] = [
  {
    id: "designer-3d",
    index: "01",
    name: "3D Pool Designer",
    family: "3D",
    image: heroPool,
    eyebrow: "Three dimensions. Real time.",
    headline: "Walk the water before it exists.",
    description:
      "Real-time three-dimensional pool studio with depth anchors, coping, waterline tile, deck elevation and interactive lights. Every change in the 3D scene syncs straight back to the 2D plan.",
    highlights: ["Live 3D scene", "Depth anchors", "Interactive lights"],
    specs: [
      { label: "Scale", value: "10 px / ft" },
      { label: "Sync", value: "Bidirectional" },
      { label: "Lighting", value: "Point lights" },
    ],
    to: "/design-studio",
    cta: "Open the 3D Designer",
    stage: "cinema",
  },
  {
    id: "designer-2d",
    index: "02",
    name: "2D Drawing Board",
    family: "2D",
    image: maximaPool,
    eyebrow: "Plan view. True scale.",
    headline: "One continuous line, drawn to scale.",
    description:
      "Precision plan-view studio on a true one-foot grid. Draw the shell, cut terrain, place stairs, seating and lights, then push the drawing into three dimensions in a single click.",
    highlights: ["1 ft grid", "Spline editing", "Auto-save"],
    specs: [
      { label: "Grid", value: "1 ft" },
      { label: "Editing", value: "Vertex level" },
      { label: "Saving", value: "Continuous" },
    ],
    to: "/design-studio",
    cta: "Open the 2D Board",
    stage: "split",
  },
  {
    id: "blueprint",
    index: "03",
    name: "Blueprint Builder",
    family: "Documents",
    image: poolBanner,
    eyebrow: "Permit ready. Signature ready.",
    headline: "The whole plan set, editable.",
    description:
      "Full permit plan generator with editable information blocks, jurisdiction data, site plan calibration and Florida statutory electronic signature. Import PDF, DXF or vector surveys and keep editing every spline.",
    highlights: ["PDF / DXF import", "Signature block", "Survey autofill"],
    specs: [
      { label: "Imports", value: "PDF · DXF · SVG" },
      { label: "Signature", value: "SHA-256" },
      { label: "Sheets", value: "Multi-page" },
    ],
    to: "/blueprint-builder",
    cta: "Open Blueprint Builder",
    stage: "dark",
  },
  {
    id: "enclosure",
    index: "04",
    name: "Screen Enclosure Studio",
    family: "2D",
    image: enclosureImg,
    eyebrow: "Structure. Priced as you draw.",
    headline: "Draw the footprint, price the structure.",
    description:
      "Two-dimensional enclosure board with fixed-size doors, house-attached walls and Florida code logic, paired with a configurator for fabric, frame gauge and turnkey pricing.",
    highlights: ["Code compliant", "Self-hatching doors", "Turnkey pricing"],
    specs: [
      { label: "Code", value: "Florida" },
      { label: "Doors", value: "Self-hatching" },
      { label: "Pricing", value: "Turnkey" },
    ],
    to: "/wonderlands-studio",
    cta: "Configure an Enclosure",
    stage: "duo",
  },
  {
    id: "fence",
    index: "05",
    name: "Aluminum Fence Studio",
    family: "2D",
    image: fenceImg,
    eyebrow: "Barrier logic, built in.",
    headline: "Every run, every gate, measured.",
    description:
      "Draw the fence line on a scaled grid, flag gate segments, then price height, style, posts and installation — built around Florida barrier requirements.",
    highlights: ["Gate flags", "Linear-foot pricing", "Barrier rules"],
    specs: [
      { label: "Takeoff", value: "Linear ft" },
      { label: "Heights", value: "4 · 5 · 6 ft" },
      { label: "Gates", value: "Self-closing" },
    ],
    to: "/wonderlands-studio",
    cta: "Design a Fence",
    stage: "poster",
  },
  {
    id: "grass",
    index: "06",
    name: "Artificial Grass Board",
    family: "2D",
    image: landscapingBanner,
    eyebrow: "Any silhouette. Any size.",
    headline: "Turf, drawn free-hand.",
    description:
      "Polygon and spline drawing for turf areas of any size, with automatic square-foot takeoff, product selection and a passcode-gated contractor cost view.",
    highlights: ["Polygon & spline", "Instant takeoff", "Contractor view"],
    specs: [
      { label: "Shapes", value: "Polygon · Spline" },
      { label: "Takeoff", value: "Auto sq ft" },
      { label: "Costing", value: "GC view" },
    ],
    to: "/wonderlands-studio",
    cta: "Open the Grass Board",
    stage: "band",
  },
  {
    id: "studio",
    index: "07",
    name: "Wonderlands Studio",
    family: "Configurator",
    image: wonderlandsHero,
    eyebrow: "The master instrument.",
    headline: "The whole outdoor world, configured.",
    description:
      "Every category, every option, one running total. Add heaters, jets, waterline, pavers and enclosures, then carry the entire build into a quote.",
    highlights: ["All categories", "Live totals", "Cart-linked"],
    specs: [
      { label: "Categories", value: "14" },
      { label: "Totals", value: "Live" },
      { label: "Handoff", value: "Quote · Cart" },
    ],
    to: "/studio",
    cta: "Enter the Studio",
    stage: "cinema",
  },
  {
    id: "showroom",
    index: "08",
    name: "Widget Showroom",
    family: "Configurator",
    image: paversBanner,
    eyebrow: "Every component, on stage.",
    headline: "Test the parts, not the promise.",
    description:
      "Living index of every Wonderlands widget — search, cart, configurators, calculators and drawing boards — rendered fully functional so behaviour can be tested in isolation.",
    highlights: ["Every widget", "Fully live", "Isolated testing"],
    specs: [
      { label: "Widgets", value: "Live" },
      { label: "State", value: "Cached" },
      { label: "Scope", value: "Isolated" },
    ],
    to: "/studio-showroom",
    cta: "Browse the Showroom",
    stage: "split",
  },
  {
    id: "quote",
    index: "09",
    name: "Quote & Survey Tool",
    family: "Documents",
    image: lathamBanner,
    eyebrow: "Intake to proposal.",
    headline: "One survey becomes the document.",
    description:
      "Guided site survey that becomes an itemized, printable proposal — every configured feature, override and image included, archived in a per-customer quote gallery.",
    highlights: ["Itemized", "Print ready", "Quote gallery"],
    specs: [
      { label: "Output", value: "Print · PDF" },
      { label: "Overrides", value: "Text · Price" },
      { label: "Archive", value: "Per customer" },
    ],
    to: "/quote",
    cta: "Build a Quote",
    stage: "dark",
  },
  {
    id: "calculator",
    index: "10",
    name: "Pool Calculator",
    family: "Commerce",
    image: spaBanner,
    eyebrow: "Volume. Heat. Chemistry.",
    headline: "The numbers behind the water.",
    description:
      "Shape-aware volume calculation with depth profiles, heater sizing by target temperature rise and chemical dosing — numbers that feed directly into configurations.",
    highlights: ["Volume by shape", "Heater sizing", "Dosing"],
    specs: [
      { label: "Volume", value: "By shape" },
      { label: "Heater", value: "BTU sizing" },
      { label: "Chemistry", value: "Dosing" },
    ],
    to: "/pool-calculator",
    cta: "Run the Numbers",
    stage: "duo",
  },
  {
    id: "checkout",
    index: "11",
    name: "Checkout & Financing",
    family: "Commerce",
    image: coversBanner,
    eyebrow: "Terms, plainly presented.",
    headline: "From cart to signature.",
    description:
      "Complete checkout surface with itemized cart, deposit schedule and monthly financing scenarios by term and rate, ready for secure payment.",
    highlights: ["Deposit schedule", "Monthly terms", "Secure pay"],
    specs: [
      { label: "Schedule", value: "20 / 35 / 40 / 10" },
      { label: "Terms", value: "Monthly" },
      { label: "Payment", value: "Secure" },
    ],
    to: "/checkout",
    cta: "View Checkout",
    stage: "band",
  },
  {
    id: "files",
    index: "12",
    name: "File Gallery",
    family: "Documents",
    image: saunaBanner,
    eyebrow: "One repository.",
    headline: "Every document, in reach.",
    description:
      "Project file repository with webp thumbnails, soft delete, sharing links and a high-DPI PDF workstation for reviewing and signing plan sets.",
    highlights: ["PDF workstation", "Share links", "Thumbnails"],
    specs: [
      { label: "Preview", value: "High-DPI" },
      { label: "Sharing", value: "Links" },
      { label: "Recovery", value: "Soft delete" },
    ],
    to: "/files",
    cta: "Open the Gallery",
    stage: "poster",
  },
  {
    id: "landscaping",
    index: "13",
    name: "Landscaping Designer",
    family: "Catalog",
    image: lanaiImg,
    eyebrow: "Verdure, specified.",
    headline: "Planting, priced by area.",
    description:
      "Full planting catalog with palms, shrubs and groundcover, sized and priced by area, ready to attach to any pool or patio design.",
    highlights: ["Plant catalog", "Area pricing", "Design-linked"],
    specs: [
      { label: "Catalog", value: "Palms · Shrubs" },
      { label: "Pricing", value: "By area" },
      { label: "Linking", value: "Any design" },
    ],
    to: "/landscaping",
    cta: "Design the Grounds",
    stage: "split",
  },
  {
    id: "proposals",
    index: "14",
    name: "Design Proposals",
    family: "Catalog",
    image: gateBanner,
    eyebrow: "Five directions.",
    headline: "Choose the character of the world.",
    description:
      "Curated presentation of complete design directions — palette, typography and layout — for clients choosing the character of their outdoor world.",
    highlights: ["Five directions", "Full UX", "Client-facing"],
    specs: [
      { label: "Directions", value: "5" },
      { label: "Depth", value: "Full UX" },
      { label: "Audience", value: "Client" },
    ],
    to: "/design",
    cta: "See the Proposals",
    stage: "duo",
  },
];

/* ---------------------------------- atoms --------------------------------- */

const FamilyTag = ({ family, tone = "light" }: { family: Family; tone?: "light" | "dark" }) => {
  const Icon = FAMILY_ICON[family];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] ${
        tone === "dark" ? "border-background/30 text-background/80" : "border-foreground/25 text-foreground/70"
      }`}
    >
      <Icon className="h-3 w-3" />
      {family}
    </span>
  );
};

const Cta = ({ to, label, tone = "light" }: { to: string; label: string; tone?: "light" | "dark" }) => (
  <Link
    to={to}
    className={`group/cta relative inline-flex items-center gap-6 overflow-hidden border px-7 py-4 text-[11px] uppercase tracking-[0.28em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      tone === "dark"
        ? "border-background/70 text-background hover:text-foreground"
        : "border-foreground/80 text-foreground hover:text-background"
    }`}
  >
    <span
      className={`absolute inset-0 -translate-x-full transition-transform duration-500 ease-out group-hover/cta:translate-x-0 ${
        tone === "dark" ? "bg-background" : "bg-foreground"
      }`}
    />
    <span className="relative z-10">{label}</span>
    <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
  </Link>
);

const Specs = ({ specs, tone = "light" }: { specs: ToolSample["specs"]; tone?: "light" | "dark" }) => (
  <dl
    className={`grid grid-cols-3 border-t ${
      tone === "dark" ? "border-background/20" : "border-foreground/15"
    }`}
  >
    {specs.map((s) => (
      <div key={s.label} className="py-4 pr-4">
        <dt
          className={`text-[9px] uppercase tracking-[0.3em] ${
            tone === "dark" ? "text-background/50" : "text-muted-foreground"
          }`}
        >
          {s.label}
        </dt>
        <dd
          className={`mt-1.5 font-serif text-lg font-light ${
            tone === "dark" ? "text-background" : "text-foreground"
          }`}
        >
          {s.value}
        </dd>
      </div>
    ))}
  </dl>
);

const Highlights = ({ items, tone = "light" }: { items: string[]; tone?: "light" | "dark" }) => (
  <ul className="flex flex-wrap gap-x-5 gap-y-2">
    {items.map((h) => (
      <li
        key={h}
        className={`text-[10px] uppercase tracking-[0.22em] before:mr-2 before:content-['—'] ${
          tone === "dark" ? "text-background/70 before:text-background/40" : "text-foreground/70 before:text-primary"
        }`}
      >
        {h}
      </li>
    ))}
  </ul>
);

/* --------------------------------- stages --------------------------------- */

const reveal = (shown: boolean, delay = 0) =>
  `transition-all duration-[900ms] ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${
    delay ? `[transition-delay:${delay}ms]` : ""
  }`;

const CinemaStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={tool.id} className="relative flex min-h-[92vh] items-end overflow-hidden bg-foreground">
      <img
        src={tool.image}
        alt={`${tool.name} preview`}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[2200ms] ease-out ${
          shown ? "scale-100" : "scale-110"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-foreground/10" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-40">
        <div className={reveal(shown)}>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-[0.4em] text-background/60">{tool.index}</span>
            <FamilyTag family={tool.family} tone="dark" />
          </div>
          <p className="mt-8 text-[11px] uppercase tracking-[0.4em] text-background/60">{tool.eyebrow}</p>
          <h2 className="mt-5 max-w-4xl font-serif text-4xl font-light leading-[1.02] tracking-tight text-background md:text-7xl">
            {tool.headline}
          </h2>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-background/70 md:text-base">{tool.description}</p>
          <div className="mt-9 max-w-lg">
            <Specs specs={tool.specs} tone="dark" />
          </div>
          <div className="mt-10">
            <Cta to={tool.to} label={tool.cta} tone="dark" />
          </div>
        </div>
      </div>
    </section>
  );
};

const SplitStage = ({ tool, flip }: { tool: ToolSample; flip?: boolean }) => {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={tool.id} className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-16 md:py-32">
        <div className={`${flip ? "md:order-2" : ""} ${reveal(shown)}`}>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-[0.4em] text-muted-foreground">{tool.index}</span>
            <FamilyTag family={tool.family} />
          </div>
          <p className="mt-7 text-[11px] uppercase tracking-[0.4em] text-muted-foreground">{tool.eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl font-light leading-[1.05] tracking-tight md:text-5xl">
            {tool.headline}
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
          <div className="mt-8">
            <Highlights items={tool.highlights} />
          </div>
          <div className="mt-8 max-w-md">
            <Specs specs={tool.specs} />
          </div>
          <div className="mt-9">
            <Cta to={tool.to} label={tool.cta} />
          </div>
        </div>

        <div className={`${flip ? "md:order-1" : ""} relative overflow-hidden`}>
          <div className={`aspect-[4/5] overflow-hidden bg-muted ${reveal(shown, 120)}`}>
            <img
              src={tool.image}
              alt={`${tool.name} preview`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out hover:scale-105"
            />
          </div>
          <span className="pointer-events-none absolute -left-2 bottom-4 font-serif text-[120px] font-light leading-none text-foreground/5 md:text-[180px]">
            {tool.index}
          </span>
        </div>
      </div>
    </section>
  );
};

const DarkStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={tool.id} className="bg-foreground">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
        <div className={reveal(shown)}>
          <div className="flex items-center justify-center gap-4">
            <span className="font-mono text-[11px] tracking-[0.4em] text-background/50">{tool.index}</span>
            <FamilyTag family={tool.family} tone="dark" />
          </div>
          <p className="mt-8 text-[11px] uppercase tracking-[0.4em] text-background/60">{tool.eyebrow}</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-3xl font-light leading-[1.05] tracking-tight text-background md:text-6xl">
            {tool.headline}
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-background/70 md:text-base">
            {tool.description}
          </p>
        </div>

        <div
          className={`mt-14 overflow-hidden border border-background/15 shadow-[0_60px_120px_-60px_hsl(var(--background)/0.5)] ${reveal(
            shown,
            140
          )}`}
        >
          <div className="flex items-center gap-1.5 border-b border-background/15 bg-background/5 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-background/30" />
            <span className="h-2 w-2 rounded-full bg-background/20" />
            <span className="h-2 w-2 rounded-full bg-background/20" />
            <span className="ml-4 font-mono text-[10px] uppercase tracking-[0.3em] text-background/40">
              {tool.name}
            </span>
          </div>
          <div className="aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={tool.image}
              alt={`${tool.name} interface preview`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1800ms] ease-out hover:scale-[1.04]"
            />
          </div>
        </div>

        <div className={`mt-12 flex flex-col items-center gap-9 ${reveal(shown, 200)}`}>
          <Highlights items={tool.highlights} tone="dark" />
          <Cta to={tool.to} label={tool.cta} tone="dark" />
        </div>
      </div>
    </section>
  );
};

const DuoStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={tool.id} className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className={`grid grid-cols-1 gap-10 md:grid-cols-12 ${reveal(shown)}`}>
          <div className="md:col-span-4">
            <span className="font-serif text-6xl font-light leading-none text-foreground/15 md:text-8xl">
              {tool.index}
            </span>
            <div className="mt-6">
              <FamilyTag family={tool.family} />
            </div>
            <p className="mt-7 text-[11px] uppercase tracking-[0.4em] text-muted-foreground">{tool.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-[1.06] tracking-tight md:text-4xl">
              {tool.headline}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <div className="mt-8">
              <Cta to={tool.to} label={tool.cta} />
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-3">
              <div className="relative col-span-1 aspect-[4/3] overflow-hidden bg-muted sm:col-span-2 sm:aspect-auto sm:min-h-[420px]">
                <img
                  src={tool.image}
                  alt={`${tool.name} preview`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-between bg-background p-7">
                <ul className="space-y-5">
                  {tool.highlights.map((h) => (
                    <li key={h}>
                      <span className="block h-px w-8 bg-primary" />
                      <span className="mt-3 block text-[10px] uppercase tracking-[0.24em] text-foreground/75">{h}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-8 space-y-4">
                  {tool.specs.map((s) => (
                    <div key={s.label} className="border-t border-border/70 pt-3">
                      <dt className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{s.label}</dt>
                      <dd className="mt-1 font-serif text-base font-light">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PosterStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={tool.id} className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="relative">
          <div className={`relative mx-auto max-w-3xl overflow-hidden bg-muted ${reveal(shown)}`}>
            <div className="aspect-[3/4] md:aspect-[16/10]">
              <img
                src={tool.image}
                alt={`${tool.name} preview`}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover transition-transform duration-[2000ms] ease-out ${
                  shown ? "scale-100" : "scale-105"
                }`}
              />
            </div>
          </div>

          <div
            className={`relative z-10 mx-auto -mt-16 max-w-2xl border border-border/70 bg-background p-8 md:-mt-24 md:p-12 ${reveal(
              shown,
              160
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.4em] text-muted-foreground">{tool.index}</span>
              <FamilyTag family={tool.family} />
            </div>
            <p className="mt-7 text-[11px] uppercase tracking-[0.4em] text-muted-foreground">{tool.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-[1.06] tracking-tight md:text-5xl">
              {tool.headline}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <div className="mt-8">
              <Specs specs={tool.specs} />
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Cta to={tool.to} label={tool.cta} />
              <Highlights items={tool.highlights} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BandStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={tool.id} className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div
          className={`group grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr_auto] md:gap-12 ${reveal(
            shown
          )}`}
        >
          <div className="aspect-[16/10] overflow-hidden bg-muted md:aspect-square">
            <img
              src={tool.image}
              alt={`${tool.name} preview`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
            />
          </div>

          <div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] tracking-[0.4em] text-muted-foreground">{tool.index}</span>
              <FamilyTag family={tool.family} />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-light leading-[1.1] tracking-tight md:text-4xl">
              {tool.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <div className="mt-6">
              <Highlights items={tool.highlights} />
            </div>
          </div>

          <div className="md:pl-6">
            <Cta to={tool.to} label={tool.cta} />
          </div>
        </div>
      </div>
    </section>
  );
};

const ToolStage = ({ tool, i }: { tool: ToolSample; i: number }) => {
  switch (tool.stage) {
    case "cinema":
      return <CinemaStage tool={tool} />;
    case "dark":
      return <DarkStage tool={tool} />;
    case "duo":
      return <DuoStage tool={tool} />;
    case "poster":
      return <PosterStage tool={tool} />;
    case "band":
      return <BandStage tool={tool} />;
    case "split":
    default:
      return <SplitStage tool={tool} flip={i % 2 === 1} />;
  }
};

/* ---------------------------------- page ---------------------------------- */

const ToolsGallery = () => {
  const [active, setActive] = React.useState(TOOLS[0].id);

  React.useEffect(() => {
    const sections = TOOLS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { threshold: [0.25, 0.5], rootMargin: "-20% 0px -40% 0px" }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Opening title card */}
      <header className="relative flex min-h-[88vh] flex-col justify-between overflow-hidden border-b border-border/60 px-6 py-14">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
          <img src={logo} alt="Wonderlands World" className="h-9 w-auto" loading="eager" decoding="async" />
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            Tools — Presentation
          </span>
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <p className="text-[11px] uppercase tracking-[0.45em] text-muted-foreground">Fourteen instruments</p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-light leading-[0.98] tracking-tight md:text-8xl">
            Designed to be
            <span className="block italic text-primary">used, not admired.</span>
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Each Wonderlands tool gets its own stage — three-dimensional studios, plan-view boards, configurators,
            calculators and permit documents. Scroll through the set, then step straight into any one of them.
          </p>
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <div className="flex snap-x snap-mandatory gap-x-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TOOLS.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={`relative shrink-0 snap-start pb-2 text-[10px] uppercase tracking-[0.26em] transition-colors ${
                  active === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-2 font-mono text-foreground/40">{t.index}</span>
                {t.name}
                <span
                  className={`absolute bottom-0 left-0 h-px w-full origin-left bg-foreground transition-transform duration-500 ${
                    active === t.id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            ))}
          </div>
        </div>
      </header>

      {TOOLS.map((tool, i) => (
        <ToolStage key={tool.id} tool={tool} i={i} />
      ))}

      <footer className="border-t border-border/60 bg-secondary/40 py-20 text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">End of the set</p>
        <p className="mx-auto mt-5 max-w-xl font-serif text-2xl font-light md:text-3xl">
          Fourteen instruments, one continuous drawing.
        </p>
        <div className="mt-9 flex justify-center">
          <Cta to="/studio" label="Enter the Studio" />
        </div>
      </footer>
    </main>
  );
};

export default ToolsGallery;
