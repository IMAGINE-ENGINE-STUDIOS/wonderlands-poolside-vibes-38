import * as React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, Search, Box, PenTool, Calculator, FileText, Layers, Sparkles } from "lucide-react";
import usePersistentState from "@/hooks/usePersistentState";

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

interface ToolSample {
  id: string;
  index: string;
  name: string;
  family: Family;
  image: string;
  headline: string;
  description: string;
  highlights: string[];
  to: string;
  cta: string;
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
    headline: "Walk the water before it exists.",
    description:
      "Real-time three-dimensional pool studio with depth anchors, coping, waterline tile, deck elevation and interactive lights. Every change in the 3D scene syncs straight back to the 2D plan.",
    highlights: ["Live 3D scene", "Depth anchors", "Interactive lights"],
    to: "/design-studio",
    cta: "Open the 3D Designer",
  },
  {
    id: "designer-2d",
    index: "02",
    name: "2D Drawing Board",
    family: "2D",
    image: maximaPool,
    headline: "One continuous line, drawn to scale.",
    description:
      "Precision plan-view studio on a true one-foot grid. Draw the shell, cut terrain, place stairs, seating and lights, then push the drawing into three dimensions in a single click.",
    highlights: ["1 ft grid", "Spline editing", "Auto-save"],
    to: "/design-studio",
    cta: "Open the 2D Board",
  },
  {
    id: "blueprint",
    index: "03",
    name: "Blueprint Builder",
    family: "Documents",
    image: poolBanner,
    headline: "Permit-ready plan sets.",
    description:
      "Full permit plan generator with editable information blocks, jurisdiction data, site plan calibration and Florida statutory electronic signature. Import PDF, DXF or vector surveys and keep editing every spline.",
    highlights: ["PDF / DXF import", "Signature block", "Survey autofill"],
    to: "/blueprint-builder",
    cta: "Open Blueprint Builder",
  },
  {
    id: "enclosure",
    index: "04",
    name: "Screen Enclosure Studio",
    family: "2D",
    image: enclosureImg,
    headline: "Draw the footprint, price the structure.",
    description:
      "Two-dimensional enclosure board with fixed-size doors, house-attached walls and Florida code logic, paired with a configurator for fabric, frame gauge and turnkey pricing.",
    highlights: ["Code compliant", "Self-hatching doors", "Turnkey pricing"],
    to: "/wonderlands-studio",
    cta: "Configure an Enclosure",
  },
  {
    id: "fence",
    index: "05",
    name: "Aluminum Fence Studio",
    family: "2D",
    image: fenceImg,
    headline: "Every run, every gate, measured.",
    description:
      "Draw the fence line on a scaled grid, flag gate segments, then price height, style, posts and installation — built around Florida barrier requirements.",
    highlights: ["Gate flags", "Linear-foot pricing", "Barrier rules"],
    to: "/wonderlands-studio",
    cta: "Design a Fence",
  },
  {
    id: "grass",
    index: "06",
    name: "Artificial Grass Board",
    family: "2D",
    image: landscapingBanner,
    headline: "Any patio, any silhouette.",
    description:
      "Polygon and spline drawing for turf areas of any size, with automatic square-foot takeoff, product selection and a passcode-gated contractor cost view.",
    highlights: ["Polygon & spline", "Instant takeoff", "Contractor view"],
    to: "/wonderlands-studio",
    cta: "Open the Grass Board",
  },
  {
    id: "studio",
    index: "07",
    name: "Wonderlands Studio",
    family: "Configurator",
    image: wonderlandsHero,
    headline: "The whole outdoor world, configured.",
    description:
      "The master configurator: every category, every option, one running total. Add heaters, jets, waterline, pavers and enclosures, then carry the entire build into a quote.",
    highlights: ["All categories", "Live totals", "Cart-linked"],
    to: "/studio",
    cta: "Enter the Studio",
  },
  {
    id: "showroom",
    index: "08",
    name: "Widget Showroom",
    family: "Configurator",
    image: paversBanner,
    headline: "Each component, on its own stage.",
    description:
      "Living index of every Wonderlands widget — search, cart, configurators, calculators and drawing boards — rendered fully functional so you can test behaviour in isolation.",
    highlights: ["Every widget", "Fully live", "Isolated testing"],
    to: "/studio-showroom",
    cta: "Browse the Showroom",
  },
  {
    id: "quote",
    index: "09",
    name: "Quote & Survey Tool",
    family: "Documents",
    image: lathamBanner,
    headline: "From intake to printed proposal.",
    description:
      "Guided site survey that becomes an itemized, printable proposal — every configured feature, override and image included, archived in a per-customer quote gallery.",
    highlights: ["Itemized", "Print ready", "Quote gallery"],
    to: "/quote",
    cta: "Build a Quote",
  },
  {
    id: "calculator",
    index: "10",
    name: "Pool Calculator",
    family: "Commerce",
    image: spaBanner,
    headline: "Volume, heat and chemistry.",
    description:
      "Shape-aware volume calculation with depth profiles, heater sizing by target temperature rise and chemical dosing — numbers that feed directly into configurations.",
    highlights: ["Volume by shape", "Heater sizing", "Dosing"],
    to: "/pool-calculator",
    cta: "Run the Numbers",
  },
  {
    id: "checkout",
    index: "11",
    name: "Checkout & Financing",
    family: "Commerce",
    image: coversBanner,
    headline: "Terms, plainly presented.",
    description:
      "Complete checkout surface with itemized cart, deposit schedule and monthly financing scenarios by term and rate, ready for secure payment.",
    highlights: ["Deposit schedule", "Monthly terms", "Secure pay"],
    to: "/checkout",
    cta: "View Checkout",
  },
  {
    id: "files",
    index: "12",
    name: "File Gallery",
    family: "Documents",
    image: saunaBanner,
    headline: "Every document, one repository.",
    description:
      "Project file repository with webp thumbnails, soft delete, sharing links and a high-DPI PDF workstation for reviewing and signing plan sets.",
    highlights: ["PDF workstation", "Share links", "Thumbnails"],
    to: "/files",
    cta: "Open the Gallery",
  },
  {
    id: "landscaping",
    index: "13",
    name: "Landscaping Designer",
    family: "Catalog",
    image: lanaiImg,
    headline: "Verdure, specified.",
    description:
      "Full planting catalog with palms, shrubs and groundcover, sized and priced by area, ready to attach to any pool or patio design.",
    highlights: ["Plant catalog", "Area pricing", "Design-linked"],
    to: "/landscaping",
    cta: "Design the Grounds",
  },
  {
    id: "proposals",
    index: "14",
    name: "Design Proposals",
    family: "Catalog",
    image: gateBanner,
    headline: "Five directions, one signature.",
    description:
      "Curated presentation of complete design directions — palette, typography and layout — for clients choosing the character of their outdoor world.",
    highlights: ["Five directions", "Full UX", "Client-facing"],
    to: "/design",
    cta: "See the Proposals",
  },
];

const FAMILIES: (Family | "All")[] = ["All", "3D", "2D", "Configurator", "Documents", "Commerce", "Catalog"];

const ToolCard = ({ tool }: { tool: ToolSample }) => {
  const Icon = FAMILY_ICON[tool.family];

  return (
    <article className="group relative flex flex-col border border-border/70 bg-card transition-shadow duration-500 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={tool.image}
          alt={`${tool.name} — Wonderlands tool preview`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

        <span className="absolute left-4 top-4 font-mono text-[11px] tracking-[0.35em] text-foreground/70">
          {tool.index}
        </span>
        <Badge
          variant="outline"
          className="absolute right-4 top-4 rounded-none border-foreground/30 bg-background/70 text-[10px] uppercase tracking-[0.25em] backdrop-blur"
        >
          <Icon className="mr-1.5 h-3 w-3" />
          {tool.family}
        </Badge>

        <h3 className="absolute bottom-4 left-4 right-4 font-serif text-2xl font-light leading-tight tracking-tight text-foreground">
          {tool.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="font-serif text-base italic text-muted-foreground">{tool.headline}</p>
        <div className="my-4 h-px w-full bg-border/70" />
        <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          {tool.highlights.map((h) => (
            <li
              key={h}
              className="text-[10px] uppercase tracking-[0.22em] text-foreground/70 before:mr-2 before:text-primary before:content-['—']"
            >
              {h}
            </li>
          ))}
        </ul>

        <Link
          to={tool.to}
          className="group/cta relative mt-7 inline-flex w-full items-center justify-between overflow-hidden rounded-none border border-foreground/80 px-5 py-3.5 text-[11px] uppercase tracking-[0.28em] text-foreground transition-colors duration-500 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="absolute inset-0 -translate-x-full bg-foreground transition-transform duration-500 ease-out group-hover/cta:translate-x-0" />
          <span className="relative z-10">{tool.cta}</span>
          <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
        </Link>
      </div>
    </article>
  );
};

const ToolsGallery = () => {
  const [family, setFamily] = usePersistentState<Family | "All">("tools-gallery-family", "All");
  const [query, setQuery] = usePersistentState<string>("tools-gallery-query", "");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const familyMatch = family === "All" || t.family === family;
      if (!familyMatch) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.highlights.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [family, query]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Wonderlands World" className="h-9 w-auto" loading="eager" decoding="async" />
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              Tools — Index
            </span>
          </div>

          <h1 className="mt-8 max-w-3xl font-serif text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
            The Wonderlands instrument set
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Every design, drawing and documentation tool we build — presented as working samples. Two-dimensional boards,
            three-dimensional studios, configurators, calculators and permit documents, each one a direct door into the
            live experience.
          </p>

          <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {FAMILIES.map((f) => {
                const active = f === family;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFamily(f)}
                    className={`relative pb-1 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                    <span
                      className={`absolute bottom-0 left-0 h-px w-full origin-left bg-foreground transition-transform duration-500 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools"
                aria-label="Search tools"
                className="rounded-none border-border/70 pl-9 text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No tools match that search. Try another term or clear the filter.
          </p>
        )}
      </section>
    </main>
  );
};

export default ToolsGallery;
