import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Box, PenTool, Calculator, FileText, Layers, Sparkles, ArrowDown } from "lucide-react";
import useReveal from "@/hooks/useReveal";
import useParallax from "@/hooks/useParallax";
import ToolFrame from "@/components/tools/ToolFrame";

import logo from "@/assets/wonderlands-logo.webp";
import shotDesigner3d from "@/assets/tools/designer-3d-ui.webp";
import shotDesigner2d from "@/assets/tools/designer-2d-ui.webp";
import shotBlueprint from "@/assets/tools/blueprint-ui.webp";
import shotEnclosure from "@/assets/tools/enclosure-ui.webp";
import shotFence from "@/assets/tools/fence-ui.webp";
import shotGrass from "@/assets/tools/grass-ui.webp";
import shotStudio from "@/assets/tools/studio-ui.webp";
import shotShowroom from "@/assets/tools/showroom-ui.webp";
import shotQuote from "@/assets/tools/quote-ui.webp";
import shotCalculator from "@/assets/tools/calculator-ui.webp";
import shotCheckout from "@/assets/tools/checkout-ui.webp";
import shotFiles from "@/assets/tools/files-ui.webp";
import shotLandscaping from "@/assets/tools/landscaping-ui.webp";
import shotProposals from "@/assets/tools/proposals-ui.webp";

type Family = "3D" | "2D" | "Configurator" | "Documents" | "Commerce" | "Catalog";
type Stage = "cinema" | "split" | "console" | "duo" | "poster" | "band";

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
    image: shotDesigner3d,
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
    image: shotDesigner2d,
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
    image: shotBlueprint,
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
    stage: "console",
  },
  {
    id: "enclosure",
    index: "04",
    name: "Screen Enclosure Studio",
    family: "2D",
    image: shotEnclosure,
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
    to: "/studio-showroom#enclosure",
    cta: "Configure an Enclosure",
    stage: "duo",
  },
  {
    id: "fence",
    index: "05",
    name: "Aluminum Fence Studio",
    family: "2D",
    image: shotFence,
    eyebrow: "Barrier logic, built in.",
    headline: "Every run, every gate, measured.",
    description:
      "Draw the fence line on a scaled grid, flag gate segments, then price height, style, posts and installation — built around Florida pool barrier requirements.",
    highlights: ["Gate flags", "Linear-foot pricing", "Barrier rules"],
    specs: [
      { label: "Takeoff", value: "Linear ft" },
      { label: "Heights", value: "4 · 5 · 6 ft" },
      { label: "Gates", value: "Self-closing" },
    ],
    to: "/studio-showroom#fence",
    cta: "Design a Fence",
    stage: "poster",
  },
  {
    id: "grass",
    index: "06",
    name: "Artificial Grass Board",
    family: "2D",
    image: shotGrass,
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
    image: shotStudio,
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
    image: shotShowroom,
    eyebrow: "Every component, on stage.",
    headline: "Test the parts, not the promise.",
    description:
      "Living index of every Wonderlands widget — search, cart, configurators, calculators and drawing boards — rendered fully functional so behaviour can be tested in isolation.",
    highlights: ["20 widgets", "Fully live", "Isolated testing"],
    specs: [
      { label: "Widgets", value: "20" },
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
    image: shotQuote,
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
    stage: "console",
  },
  {
    id: "calculator",
    index: "10",
    name: "Pool Calculator",
    family: "Commerce",
    image: shotCalculator,
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
    image: shotCheckout,
    eyebrow: "Terms, plainly presented.",
    headline: "From cart to signature.",
    description:
      "Complete checkout surface with itemized cart, deposit schedule and monthly financing scenarios by term and rate, ready for secure payment.",
    highlights: ["Deposit schedule", "Monthly terms", "Secure pay"],
    specs: [
      { label: "Schedule", value: "20/35/40/10" },
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
    name: "Media & File Gallery",
    family: "Documents",
    image: shotFiles,
    eyebrow: "One repository.",
    headline: "Every document, in reach.",
    description:
      "Project media and file repository with webp thumbnails, soft delete, sharing links and a high-DPI PDF workstation for reviewing and signing plan sets.",
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
    image: shotLandscaping,
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
    image: shotProposals,
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
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] uppercase tracking-[0.28em] sm:text-[10px] ${
        tone === "dark" ? "border-background/30 text-background/80" : "border-foreground/25 text-foreground/70"
      }`}
    >
      <Icon className="h-3 w-3" />
      {family}
    </span>
  );
};

const Cta = ({
  to,
  label,
  tone = "light",
  full,
}: {
  to: string;
  label: string;
  tone?: "light" | "dark";
  full?: boolean;
}) => (
  <Link
    to={to}
    className={`group/cta relative inline-flex items-center justify-between gap-6 overflow-hidden border px-6 py-3.5 text-[10px] uppercase tracking-[0.26em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-7 sm:py-4 sm:text-[11px] ${
      full ? "w-full" : ""
    } ${
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
  <dl className={`grid grid-cols-3 border-t ${tone === "dark" ? "border-background/20" : "border-foreground/15"}`}>
    {specs.map((s) => (
      <div key={s.label} className="py-3 pr-3 sm:py-4 sm:pr-4">
        <dt
          className={`text-[8px] uppercase tracking-[0.28em] sm:text-[9px] ${
            tone === "dark" ? "text-background/50" : "text-muted-foreground"
          }`}
        >
          {s.label}
        </dt>
        <dd
          className={`mt-1.5 font-serif text-base font-light sm:text-lg ${
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
        className={`text-[9px] uppercase tracking-[0.22em] before:mr-2 before:content-['—'] sm:text-[10px] ${
          tone === "dark" ? "text-background/70 before:text-background/40" : "text-foreground/70 before:text-primary"
        }`}
      >
        {h}
      </li>
    ))}
  </ul>
);

const Meta = ({ tool, tone = "light" }: { tool: ToolSample; tone?: "light" | "dark" }) => (
  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
    <span
      className={`font-mono text-[10px] tracking-[0.4em] sm:text-[11px] ${
        tone === "dark" ? "text-background/50" : "text-muted-foreground"
      }`}
    >
      {tool.index}
    </span>
    <FamilyTag family={tool.family} tone={tone} />
    <span
      className={`hidden font-mono text-[9px] uppercase tracking-[0.3em] sm:inline ${
        tone === "dark" ? "text-background/40" : "text-foreground/40"
      }`}
    >
      {tool.name}
    </span>
  </div>
);

/* --------------------------------- stages --------------------------------- */

const useStage = () => useReveal<HTMLElement>(0.12);

const CinemaStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useStage();
  const bg = useParallax<HTMLDivElement>(0.7);
  return (
    <section
      ref={ref}
      id={tool.id}
      className={`relative overflow-hidden bg-foreground ${shown ? "tl-shown" : ""}`}
    >
      <div ref={bg} className="pointer-events-none absolute inset-0 tl-grid-inv tl-par-soft opacity-70" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-[1600px] items-center gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14 lg:py-32">
        <div>
          <div className="tl-in">
            <Meta tool={tool} tone="dark" />
          </div>
          <p className="tl-in tl-d1 mt-6 text-[10px] uppercase tracking-[0.4em] text-background/60 sm:text-[11px]">
            {tool.eyebrow}
          </p>
          <h2 className="tl-in tl-d1 mt-4 font-serif text-[clamp(2rem,6vw,4.75rem)] font-light leading-[0.98] tracking-tight text-background">
            {tool.headline}
          </h2>
          <p className="tl-in tl-d2 mt-6 max-w-xl text-sm leading-relaxed text-background/70 md:text-base">
            {tool.description}
          </p>
          <div className="tl-in tl-d3 mt-8 max-w-md">
            <Specs specs={tool.specs} tone="dark" />
          </div>
          <div className="tl-in tl-d4 mt-9">
            <Cta to={tool.to} label={tool.cta} tone="dark" />
          </div>
        </div>

        <div className="tl-in tl-d2 lg:-mr-8 xl:-mr-16">
          <ToolFrame image={tool.image} name={tool.name} route={tool.to} tone="dark" scanline parallax="soft" />
        </div>
      </div>
    </section>
  );
};

const SplitStage = ({ tool, flip }: { tool: ToolSample; flip?: boolean }) => {
  const { ref, shown } = useStage();
  return (
    <section
      ref={ref}
      id={tool.id}
      className={`relative border-t border-border/60 bg-background ${shown ? "tl-shown" : ""}`}
    >
      <div className="mx-auto grid max-w-[1500px] items-center gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-2 lg:gap-16">
        <div className={flip ? "lg:order-2" : ""}>
          <div className="tl-in-x">
            <Meta tool={tool} />
          </div>
          <p className="tl-in-x tl-d1 mt-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-[11px]">
            {tool.eyebrow}
          </p>
          <h2 className="tl-in-x tl-d1 mt-4 font-serif text-[clamp(1.75rem,4.4vw,3.4rem)] font-light leading-[1.03] tracking-tight">
            {tool.headline}
          </h2>
          <p className="tl-in-x tl-d2 mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
          <div className="tl-in-x tl-d2 mt-7">
            <Highlights items={tool.highlights} />
          </div>
          <div className="tl-in-x tl-d3 mt-7 max-w-md">
            <Specs specs={tool.specs} />
          </div>
          <div className="tl-in-x tl-d4 mt-8">
            <Cta to={tool.to} label={tool.cta} />
          </div>
        </div>

        <div className={`relative tl-in tl-d1 ${flip ? "lg:order-1" : ""}`}>
          <span
            aria-hidden
            className="pointer-events-none absolute -top-10 left-0 select-none font-serif text-[clamp(5rem,14vw,12rem)] font-light leading-none text-foreground/[0.055]"
          >
            {tool.index}
          </span>
          <ToolFrame image={tool.image} name={tool.name} route={tool.to} className="relative" />
        </div>
      </div>
    </section>
  );
};

const ConsoleStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useStage();
  return (
    <section ref={ref} id={tool.id} className={`relative overflow-hidden bg-foreground ${shown ? "tl-shown" : ""}`}>
      <div className="pointer-events-none absolute inset-0 tl-grid-inv opacity-60" />
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 md:py-28">
        <div className="tl-in flex justify-center">
          <Meta tool={tool} tone="dark" />
        </div>
        <p className="tl-in tl-d1 mt-7 text-[10px] uppercase tracking-[0.4em] text-background/60 sm:text-[11px]">
          {tool.eyebrow}
        </p>
        <h2 className="tl-in tl-d1 mx-auto mt-4 max-w-3xl font-serif text-[clamp(1.9rem,5.4vw,4rem)] font-light leading-[1.02] tracking-tight text-background">
          {tool.headline}
        </h2>
        <p className="tl-in tl-d2 mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-background/70 md:text-base">
          {tool.description}
        </p>

        <div className="tl-in tl-d2 mt-12">
          <ToolFrame image={tool.image} name={tool.name} route={tool.to} tone="dark" ratio="16/10" scanline parallax="deep" />
        </div>

        <div className="tl-in tl-d3 mt-10 flex flex-col items-center gap-8">
          <Highlights items={tool.highlights} tone="dark" />
          <Cta to={tool.to} label={tool.cta} tone="dark" />
        </div>
      </div>
    </section>
  );
};

const DuoStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useStage();
  return (
    <section
      ref={ref}
      id={tool.id}
      className={`relative border-t border-border/60 bg-secondary/40 ${shown ? "tl-shown" : ""}`}
    >
      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 md:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <span
              aria-hidden
              className="tl-in block font-serif text-[clamp(3.5rem,9vw,7rem)] font-light leading-none text-foreground/15"
            >
              {tool.index}
            </span>
            <div className="tl-in tl-d1 mt-5">
              <FamilyTag family={tool.family} />
            </div>
            <p className="tl-in tl-d1 mt-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-[11px]">
              {tool.eyebrow}
            </p>
            <h2 className="tl-in tl-d2 mt-4 font-serif text-[clamp(1.7rem,3.8vw,2.8rem)] font-light leading-[1.05] tracking-tight">
              {tool.headline}
            </h2>
            <p className="tl-in tl-d2 mt-5 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <div className="tl-in tl-d3 mt-8">
              <Cta to={tool.to} label={tool.cta} />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-0 sm:bg-border/60 sm:gap-px">
              <div className="tl-in tl-d1 sm:col-span-2">
                <ToolFrame image={tool.image} name={tool.name} route={tool.to} chrome="plate" ratio="4/3" />
              </div>
              <div className="tl-in tl-d3 flex flex-col justify-between border border-border/60 bg-background p-6 sm:border-0 sm:p-7">
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
  const { ref, shown } = useStage();
  return (
    <section
      ref={ref}
      id={tool.id}
      className={`relative overflow-hidden border-t border-border/60 bg-background ${shown ? "tl-shown" : ""}`}
    >
      <div className="pointer-events-none absolute inset-0 tl-grid opacity-60" />
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 py-20 sm:px-8 md:py-28">
        <div className="tl-in mx-auto max-w-4xl">
          <ToolFrame image={tool.image} name={tool.name} route={tool.to} ratio="16/9" parallax="deep" />
        </div>

        <div className="tl-in tl-d2 relative z-10 mx-auto -mt-10 max-w-2xl border border-border/70 bg-background p-6 shadow-[0_40px_90px_-60px_hsl(var(--foreground)/0.5)] sm:-mt-16 sm:p-9 md:-mt-24 md:p-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground sm:text-[11px]">
              {tool.index}
            </span>
            <FamilyTag family={tool.family} />
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-[11px]">
            {tool.eyebrow}
          </p>
          <h2 className="mt-4 font-serif text-[clamp(1.7rem,4.4vw,3.2rem)] font-light leading-[1.04] tracking-tight">
            {tool.headline}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
          <div className="mt-7">
            <Specs specs={tool.specs} />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Cta to={tool.to} label={tool.cta} />
            <Highlights items={tool.highlights} />
          </div>
        </div>
      </div>
    </section>
  );
};

const BandStage = ({ tool }: { tool: ToolSample }) => {
  const { ref, shown } = useStage();
  return (
    <section
      ref={ref}
      id={tool.id}
      className={`border-t border-border/60 bg-background ${shown ? "tl-shown" : ""}`}
    >
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 md:py-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="tl-in-x order-2 lg:order-1">
            <Meta tool={tool} />
            <h2 className="mt-5 font-serif text-[clamp(1.6rem,4vw,2.9rem)] font-light leading-[1.06] tracking-tight">
              {tool.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <div className="mt-6">
              <Highlights items={tool.highlights} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Cta to={tool.to} label={tool.cta} />
              <div className="hidden max-w-[240px] flex-1 sm:block">
                <Specs specs={tool.specs} />
              </div>
            </div>
          </div>

          <div className="tl-in order-1 lg:order-2">
            <ToolFrame image={tool.image} name={tool.name} route={tool.to} ratio="16/10" />
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
    case "console":
      return <ConsoleStage tool={tool} />;
    case "duo":
      return <DuoStage tool={tool} />;
    case "poster":
      return <PosterStage tool={tool} />;
    case "band":
      return <BandStage tool={tool} />;
    case "split":
    default:
      return <SplitStage tool={tool} flip={i % 4 === 1} />;
  }
};

/* ---------------------------------- page ---------------------------------- */

const MARQUEE = [...TOOLS, ...TOOLS];

const ToolsGallery = () => {
  const [active, setActive] = React.useState(TOOLS[0].id);
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const heroImg = useParallax<HTMLDivElement>(1.2);

  // scroll progress bar — direct DOM write, no re-render per frame
  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

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
      { threshold: [0.2, 0.5], rootMargin: "-15% 0px -45% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* progress */}
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-primary" />
      </div>

      {/* desktop index rail */}
      <nav
        aria-label="Tool index"
        className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      >
        <ul className="space-y-2.5">
          {TOOLS.map((t) => {
            const on = active === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(t.id)}
                  className="group flex items-center gap-3 focus-visible:outline-none"
                  aria-current={on ? "true" : undefined}
                >
                  <span
                    className={`block h-px transition-all duration-500 ${
                      on ? "w-9 bg-primary" : "w-4 bg-foreground/25 group-hover:w-7 group-hover:bg-foreground/60"
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] uppercase tracking-[0.28em] transition-all duration-500 ${
                      on
                        ? "translate-x-0 text-foreground opacity-100"
                        : "-translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  >
                    {t.index} {t.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* hero */}
      <header className="relative flex min-h-[92svh] flex-col justify-between overflow-hidden border-b border-border/60">
        <div ref={heroImg} className="pointer-events-none absolute inset-0 tl-grid tl-par-soft opacity-80" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-primary/[0.07] blur-[130px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-5 py-8 sm:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={logo} alt="Wonderlands World" className="h-8 w-auto sm:h-9" loading="eager" decoding="async" />
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground sm:text-[11px]">
              Tools — Presentation
            </span>
          </div>
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex">
            <span className="tl-blink h-1.5 w-1.5 rounded-full bg-primary" />
            captured live
          </span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8">
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground sm:text-[11px]">
            Fourteen instruments
          </p>
          <h1 className="mt-5 max-w-5xl font-serif text-[clamp(2.5rem,9vw,7.5rem)] font-light leading-[0.94] tracking-tight">
            Designed to be
            <span className="block italic text-primary">used, not admired.</span>
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Every screen on this page is a real capture of the live product — 3D studios, plan-view boards,
            configurators, calculators and permit documents. Scroll the set, then step straight into any one of them.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4 sm:gap-6">
            <Cta to="/studio" label="Enter the Studio" />
            <button
              type="button"
              onClick={() => scrollTo(TOOLS[0].id)}
              className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground sm:text-[11px]"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-foreground/25 transition-colors group-hover:border-foreground/70">
                <ArrowDown className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
              </span>
              Begin the set
            </button>
          </div>
        </div>

        {/* infinite index marquee */}
        <div className="relative z-10 overflow-hidden border-t border-border/60 py-4">
          <div className="tl-marquee flex w-max items-center gap-10 whitespace-nowrap pr-10">
            {MARQUEE.map((t, i) => (
              <button
                key={`${t.id}-${i}`}
                type="button"
                onClick={() => scrollTo(t.id)}
                className="group inline-flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="font-mono text-foreground/35">{t.index}</span>
                {t.name}
                <span className="h-1 w-1 rounded-full bg-primary/50" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* mobile / tablet sticky chip index */}
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md xl:hidden">
        <div className="tl-noscroll flex gap-x-6 overflow-x-auto px-5 py-3 sm:px-8">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => scrollTo(t.id)}
              className={`relative shrink-0 whitespace-nowrap pb-1.5 text-[9px] uppercase tracking-[0.24em] transition-colors sm:text-[10px] ${
                active === t.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="mr-2 font-mono text-foreground/40">{t.index}</span>
              {t.name}
              <span
                className={`absolute bottom-0 left-0 h-px w-full origin-left bg-primary transition-transform duration-500 ${
                  active === t.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {TOOLS.map((tool, i) => (
        <ToolStage key={tool.id} tool={tool} i={i} />
      ))}

      <footer className="relative overflow-hidden border-t border-border/60 bg-secondary/40 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 tl-grid opacity-50" />
        <div className="relative z-10 px-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-[11px]">End of the set</p>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-[clamp(1.5rem,4vw,2.5rem)] font-light">
            Fourteen instruments, one continuous drawing.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Cta to="/studio" label="Enter the Studio" />
            <Cta to="/quote" label="Build a Quote" />
          </div>
        </div>
      </footer>
    </main>
  );
};

export default ToolsGallery;
