import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDown, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useReveal from "@/hooks/useReveal";

import logo from "@/assets/wonderlands-logo.webp";
import heroPool from "@/assets/hero-pool-optimized.webp";
import maximaPool from "@/assets/maxima-pool.webp";
import poolHeater from "@/assets/pool-heater.webp";

/* Light widgets — loaded with the page */
import AdvancedSearch from "@/components/AdvancedSearch";
import StudioCartWidget from "@/components/StudioCartWidget";
import MiniCart from "@/components/MiniCart";
import { PoolCalculator } from "@/components/PoolCalculator";
import HeaterSizeCalculator from "@/components/HeaterSizeCalculator";
import FinancingOptions from "@/components/FinancingOptions";
import ProductMediaGallery from "@/components/ProductMediaGallery";
import { DynamicFeatureRenderer } from "@/components/DynamicFeatureRenderer";
import { InlineCalculator } from "@/components/search/InlineCalculator";

import type { FenceLayout } from "@/components/fence/FenceDrawingBoard";
import type { EnclosureLayout } from "@/components/enclosure/EnclosureDrawingBoard";
import type { GrassLayout } from "@/components/grass/GrassDrawingBoard";
import type { SitePlanData } from "@/components/blueprint/SiteDrawingBoard";

/* Heavy widgets — code-split, mounted on demand */
const FenceDrawingBoard = React.lazy(() => import("@/components/fence/FenceDrawingBoard"));
const FenceConfigurator = React.lazy(() => import("@/components/fence/FenceConfigurator"));
const EnclosureDrawingBoard = React.lazy(() => import("@/components/enclosure/EnclosureDrawingBoard"));
const EnclosureConfigurator = React.lazy(() => import("@/components/enclosure/EnclosureConfigurator"));
const GrassDrawingBoard = React.lazy(() => import("@/components/grass/GrassDrawingBoard"));
const GrassConfigurator = React.lazy(() => import("@/components/grass/GrassConfigurator"));
const SiteDrawingBoard = React.lazy(() => import("@/components/blueprint/SiteDrawingBoard"));
const SurveyQuoteTool = React.lazy(() => import("@/components/SurveyQuoteTool"));
const SaunaSalesPricingDialog = React.lazy(() => import("@/components/sauna/SaunaSalesPricingDialog"));
const LandscapingSection = React.lazy(() => import("@/components/LandscapingSection"));
const PoolCatalog = React.lazy(() => import("@/components/PoolCatalog"));
const SaunaSection = React.lazy(() => import("@/components/SaunaSection"));

/* Full tools — page-scale surfaces, mounted only when launched */
const DesignStudioTool = React.lazy(() => import("@/pages/DesignStudio"));
const BlueprintBuilderTool = React.lazy(() => import("@/pages/BlueprintBuilder"));
const WonderlandsStudioTool = React.lazy(() => import("@/pages/WonderlandsStudio"));

const EMPTY_SITE_PLAN: SitePlanData = {
  shapes: [],
  pxPerFt: 14.4,
  underlay: null,
};

/* --------------------------------- chrome --------------------------------- */

const Loading = ({ label = "Loading widget" }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-14 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {label}
  </div>
);

const LiveSurface = ({
  route,
  label,
  children,
  contain,
}: {
  route: string;
  label: string;
  children: React.ReactNode;
  /** clip page-scale tools into a scrollable viewport */
  contain?: boolean;
}) => (
  <div className="border border-foreground/12 bg-card shadow-[0_40px_90px_-60px_hsl(var(--foreground)/0.45)]">
    <div className="flex items-center gap-3 border-b border-foreground/10 bg-muted/60 px-3 py-2.5 sm:px-4">
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      </div>
      <div className="min-w-0 flex-1 truncate border border-foreground/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px]">
        {label}
      </div>
      <Link
        to={route}
        className="hidden shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground sm:flex"
      >
        <span className="tl-blink h-1.5 w-1.5 rounded-full bg-primary" />
        live
      </Link>
    </div>
    <div
      className={
        contain
          ? "tl-noscroll relative max-h-[80vh] overflow-auto bg-background"
          : "relative bg-background p-4 sm:p-6"
      }
    >
      {children}
    </div>
  </div>
);

/** Mount-on-demand wrapper for page-scale tools so /tools2 stays fast. */
const Launcher = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) => {
  const [on, setOn] = React.useState(false);
  if (!on) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{note}</p>
        <Button
          onClick={() => setOn(true)}
          className="rounded-none px-7 py-6 text-[10px] uppercase tracking-[0.28em]"
        >
          <Play className="mr-2 h-3.5 w-3.5" /> Load {title}
        </Button>
      </div>
    );
  }
  return <React.Suspense fallback={<Loading label={`Loading ${title}`} />}>{children}</React.Suspense>;
};

interface SectionMeta {
  id: string;
  index: string;
  name: string;
  tag: string;
  eyebrow: string;
  headline: string;
  description: string;
  route: string;
  cta: string;
}

const Cta = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="group/cta relative inline-flex items-center justify-between gap-6 overflow-hidden border border-foreground/80 px-6 py-3.5 text-[10px] uppercase tracking-[0.26em] text-foreground transition-colors duration-500 hover:text-background sm:px-7 sm:py-4 sm:text-[11px]"
  >
    <span className="absolute inset-0 -translate-x-full bg-foreground transition-transform duration-500 ease-out group-hover/cta:translate-x-0" />
    <span className="relative z-10">{label}</span>
    <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
  </Link>
);

const Stage = ({
  meta,
  dark,
  children,
  contain,
}: {
  meta: SectionMeta;
  dark?: boolean;
  children: React.ReactNode;
  contain?: boolean;
}) => {
  const { ref, shown } = useReveal<HTMLElement>(0.08);
  return (
    <section
      ref={ref}
      id={meta.id}
      className={`relative scroll-mt-24 border-t border-border/60 ${
        dark ? "bg-secondary/40" : "bg-background"
      } ${shown ? "tl-shown" : ""}`}
    >
      <div className="mx-auto max-w-[1500px] px-4 py-16 sm:px-8 md:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="tl-in flex flex-wrap items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground sm:text-[11px]">
                  {meta.index}
                </span>
                <span className="border border-foreground/25 px-2.5 py-1 text-[9px] uppercase tracking-[0.28em] text-foreground/70 sm:text-[10px]">
                  {meta.tag}
                </span>
              </div>
              <p className="tl-in tl-d1 mt-5 text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-[11px]">
                {meta.eyebrow}
              </p>
              <h2 className="tl-in tl-d1 mt-4 font-serif text-[clamp(1.6rem,3.6vw,2.7rem)] font-light leading-[1.05] tracking-tight">
                {meta.headline}
              </h2>
              <p className="tl-in tl-d2 mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                {meta.description}
              </p>
              <div className="tl-in tl-d3 mt-8">
                <Cta to={meta.route} label={meta.cta} />
              </div>
            </div>
          </div>

          <div className="tl-in tl-d2 min-w-0 lg:col-span-8">
            <LiveSurface route={meta.route} label={`${meta.name} — live widget`} contain={contain}>
              {children}
            </LiveSurface>
          </div>
        </div>
      </div>
    </section>
  );
};

const SECTIONS: SectionMeta[] = [
  {
    id: "designer",
    index: "01",
    name: "3D & 2D Pool Designer",
    tag: "3D",
    eyebrow: "Three dimensions. Real time.",
    headline: "Walk the water before it exists.",
    description:
      "The complete design studio: real-time 3D scene, plan-view board, depth anchors, coping, waterline, deck elevation and interactive lights — running here, not pictured.",
    route: "/design-studio",
    cta: "Open the Designer",
  },
  {
    id: "site-board",
    index: "02",
    name: "2D Site Drawing Board",
    tag: "2D",
    eyebrow: "Plan view. True scale.",
    headline: "One continuous line, drawn to scale.",
    description:
      "Architect-style site board on a 14.4 px/ft grid. Draw the property boundary, residence, hardscape and pool; every polygon feeds the impervious-area table.",
    route: "/blueprint-builder",
    cta: "Open the Board",
  },
  {
    id: "blueprint",
    index: "03",
    name: "Blueprint Builder",
    tag: "Documents",
    eyebrow: "Permit ready. Signature ready.",
    headline: "The whole plan set, editable.",
    description:
      "Editable information blocks, jurisdiction data, survey import for PDF, DXF and vector, and Florida statutory electronic signature — the real builder, embedded.",
    route: "/blueprint-builder",
    cta: "Open Blueprint Builder",
  },
  {
    id: "enclosure",
    index: "04",
    name: "Screen Enclosure Studio",
    tag: "Configurator",
    eyebrow: "Structure. Priced as you draw.",
    headline: "Draw the footprint, price the structure.",
    description:
      "Enclosure board with fixed-size doors and house-attached walls, paired with the live configurator for fabric, frame gauge and turnkey pricing.",
    route: "/studio-showroom#enclosure",
    cta: "Configure an Enclosure",
  },
  {
    id: "fence",
    index: "05",
    name: "Aluminum Fence Studio",
    tag: "Configurator",
    eyebrow: "Barrier logic, built in.",
    headline: "Every run, every gate, measured.",
    description:
      "Draw the fence line on a scaled grid, flag gate segments, then price height, style, posts and installation under Florida pool-barrier rules.",
    route: "/studio-showroom#fence",
    cta: "Design a Fence",
  },
  {
    id: "grass",
    index: "06",
    name: "Artificial Grass Board",
    tag: "Configurator",
    eyebrow: "Any silhouette. Any size.",
    headline: "Turf, drawn free-hand.",
    description:
      "Polygon and spline turf drawing with automatic square-foot takeoff, product selection and the contractor cost model behind a passcode.",
    route: "/wonderlands-studio",
    cta: "Open the Grass Board",
  },
  {
    id: "studio",
    index: "07",
    name: "Wonderlands Studio",
    tag: "Configurator",
    eyebrow: "The master instrument.",
    headline: "The whole outdoor world, configured.",
    description:
      "Every category, every option, one running total — the full studio surface mounted inside this page.",
    route: "/studio",
    cta: "Enter the Studio",
  },
  {
    id: "search",
    index: "08",
    name: "Advanced Search",
    tag: "Navigation",
    eyebrow: "The whole catalog, one field.",
    headline: "Find it by name, or by number.",
    description:
      "Catalog-wide search with filters, category routing and inline results. Both the full and slim variants are live below — type into either.",
    route: "/",
    cta: "Search the Catalog",
  },
  {
    id: "cart",
    index: "09",
    name: "Configuration & Cart",
    tag: "Commerce",
    eyebrow: "Everything, summed.",
    headline: "One running total, always visible.",
    description:
      "The studio price widget with editable shopping list and feature-level removal, plus the compact mini cart used in headers.",
    route: "/checkout",
    cta: "View Checkout",
  },
  {
    id: "features",
    index: "10",
    name: "Dynamic Feature Engine",
    tag: "Configurator",
    eyebrow: "Category-aware options.",
    headline: "Pools and saunas ask different questions.",
    description:
      "The option engine renders carousels, toggles and counters from each product's feature config. Pool options and sauna options are shown side by side, both live.",
    route: "/studio",
    cta: "Configure a Product",
  },
  {
    id: "calculators",
    index: "11",
    name: "Calculators",
    tag: "Calculator",
    eyebrow: "Volume. Heat. Chemistry.",
    headline: "The numbers behind the water.",
    description:
      "Volume by shape and depth profile, heater sizing by target temperature rise, and the inline square-foot and linear-foot estimators used inside search.",
    route: "/pool-calculator",
    cta: "Run the Numbers",
  },
  {
    id: "financing",
    index: "12",
    name: "Financing & Checkout",
    tag: "Commerce",
    eyebrow: "Terms, plainly presented.",
    headline: "From cart to signature.",
    description:
      "Monthly payment scenarios by term and rate on a live demonstration total, exactly as they appear at checkout.",
    route: "/checkout",
    cta: "View Checkout",
  },
  {
    id: "quote",
    index: "13",
    name: "Quote & Survey Tool",
    tag: "Documents",
    eyebrow: "Intake to proposal.",
    headline: "One survey becomes the document.",
    description:
      "Guided site survey that becomes an itemized, printable proposal with overrides and a per-customer quote gallery. Open it here with a demonstration product.",
    route: "/quote",
    cta: "Build a Quote",
  },
  {
    id: "media",
    index: "14",
    name: "Product Media Gallery",
    tag: "Presentation",
    eyebrow: "Consistent framing.",
    headline: "Every product, shown the same way.",
    description:
      "The image and video gallery used on every product surface, with keyboard-friendly navigation and a fixed media frame.",
    route: "/",
    cta: "Browse Products",
  },
  {
    id: "sauna",
    index: "15",
    name: "Sauna Catalog & Sales Pricing",
    tag: "Catalog",
    eyebrow: "Retail and internal.",
    headline: "Two views of the same cabin.",
    description:
      "The live sauna catalog with turnkey retail pricing, plus the passcode-protected internal cost breakdown built for the sales team.",
    route: "/studio",
    cta: "Browse Saunas",
  },
  {
    id: "landscaping",
    index: "16",
    name: "Landscaping Designer",
    tag: "Catalog",
    eyebrow: "Verdure, specified.",
    headline: "Planting, priced by area.",
    description:
      "The full planting catalog — palms, shrubs and groundcover — sized and priced by area, ready to attach to any design.",
    route: "/landscaping",
    cta: "Design the Grounds",
  },
  {
    id: "pools",
    index: "17",
    name: "Pool Catalog",
    tag: "Catalog",
    eyebrow: "The collection.",
    headline: "Fourteen disciplines, one water line.",
    description:
      "The live Wonderlands pool collection with configurable cards, running totals and direct handoff into the quote tool.",
    route: "/",
    cta: "See the Collection",
  },
];

const meta = (id: string) => SECTIONS.find((s) => s.id === id)!;

/* ---------------------------------- page ---------------------------------- */

const ToolsGallery2 = () => {
  const [active, setActive] = React.useState(SECTIONS[0].id);
  const barRef = React.useRef<HTMLDivElement | null>(null);

  const [extrasPool, setExtrasPool] = React.useState<Record<string, unknown>>({});
  const [extrasSauna, setExtrasSauna] = React.useState<Record<string, unknown>>({});
  const [fenceLayout, setFenceLayout] = React.useState<FenceLayout>({ points: [], closed: false, gateSegments: [] });
  const [enclosureLayout, setEnclosureLayout] = React.useState<EnclosureLayout>({ points: [], closed: false, features: {} });
  const [grassLayout, setGrassLayout] = React.useState<GrassLayout>({ areas: [] });
  const [grassProduct, setGrassProduct] = React.useState("");
  const [sitePlan, setSitePlan] = React.useState<SitePlanData>(EMPTY_SITE_PLAN);
  const [heater, setHeater] = React.useState("");
  const [inlineResult, setInlineResult] = React.useState("");
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [saunaPricingOpen, setSaunaPricingOpen] = React.useState(false);

  const media = React.useMemo(
    () => [
      { type: "image" as const, url: heroPool, alt: "Wonderlands pool with sun deck" },
      { type: "image" as const, url: maximaPool, alt: "Maxima fiberglass pool" },
      { type: "image" as const, url: poolHeater, alt: "Pool heater unit" },
    ],
    []
  );

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
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top?.target.id) setActive(top.target.id);
      },
      { threshold: [0.1, 0.4], rootMargin: "-12% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-x-0 top-0 z-50 h-[3px]">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-primary" />
      </div>

      {/* index rail */}
      <nav aria-label="Widget index" className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
        <ul className="space-y-2.5">
          {SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <button type="button" onClick={() => scrollTo(s.id)} className="group flex items-center gap-3">
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
                    {s.index} {s.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* hero */}
      <header className="relative flex min-h-[78svh] flex-col justify-between overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 tl-grid opacity-80" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-5 py-8 sm:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={logo} alt="Wonderlands World" className="h-8 w-auto sm:h-9" loading="eager" decoding="async" />
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground sm:text-[11px]">
              Tools — Live widgets
            </span>
          </div>
          <Link
            to="/tools"
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground sm:text-[10px]"
          >
            Presentation edition →
          </Link>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8">
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground sm:text-[11px]">
            Seventeen instruments
          </p>
          <h1 className="mt-5 max-w-5xl font-serif text-[clamp(2.3rem,8vw,6.5rem)] font-light leading-[0.95] tracking-tight">
            Not screenshots.
            <span className="block italic text-primary">The tools themselves.</span>
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Every panel on this page is the real, running widget — draw on the boards, configure a pool, size a heater,
            price a fence. Page-scale tools load on demand so the set stays fast.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4 sm:gap-6">
            <Cta to="/studio" label="Enter the Studio" />
            <button
              type="button"
              onClick={() => scrollTo(SECTIONS[0].id)}
              className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground sm:text-[11px]"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-foreground/25 transition-colors group-hover:border-foreground/70">
                <ArrowDown className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
              </span>
              Begin the set
            </button>
          </div>
        </div>

        <div className="relative z-10 overflow-hidden border-t border-border/60 py-4">
          <div className="tl-marquee flex w-max items-center gap-10 whitespace-nowrap pr-10">
            {[...SECTIONS, ...SECTIONS].map((s, i) => (
              <button
                key={`${s.id}-${i}`}
                type="button"
                onClick={() => scrollTo(s.id)}
                className="group inline-flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="font-mono text-foreground/35">{s.index}</span>
                {s.name}
                <span className="h-1 w-1 rounded-full bg-primary/50" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* mobile index */}
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md xl:hidden">
        <div className="tl-noscroll flex gap-x-6 overflow-x-auto px-5 py-3 sm:px-8">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`relative shrink-0 whitespace-nowrap pb-1.5 text-[9px] uppercase tracking-[0.24em] transition-colors sm:text-[10px] ${
                active === s.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="mr-2 font-mono text-foreground/40">{s.index}</span>
              {s.name}
              <span
                className={`absolute bottom-0 left-0 h-px w-full origin-left bg-primary transition-transform duration-500 ${
                  active === s.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 01 — designer */}
      <Stage meta={meta("designer")} contain>
        <Launcher
          title="the Designer"
          note="The 3D and 2D pool designer is a full WebGL surface. Load it here to draw, shape and light a pool without leaving the page."
        >
          <DesignStudioTool />
        </Launcher>
      </Stage>

      {/* 02 — site board */}
      <Stage meta={meta("site-board")} dark>
        <React.Suspense fallback={<Loading label="Loading site board" />}>
          <SiteDrawingBoard data={sitePlan} onChange={setSitePlan} height={560} />
        </React.Suspense>
      </Stage>

      {/* 03 — blueprint builder */}
      <Stage meta={meta("blueprint")} contain>
        <Launcher
          title="Blueprint Builder"
          note="The permit plan set includes sheet rendering, survey import and the signature block. Load the full builder to edit a live plan set."
        >
          <BlueprintBuilderTool />
        </Launcher>
      </Stage>

      {/* 04 — enclosure */}
      <Stage meta={meta("enclosure")} dark>
        <React.Suspense fallback={<Loading label="Loading enclosure studio" />}>
          <div className="space-y-8">
            <EnclosureDrawingBoard layout={enclosureLayout} onChange={setEnclosureLayout} />
            <Separator />
            <EnclosureConfigurator />
          </div>
        </React.Suspense>
      </Stage>

      {/* 05 — fence */}
      <Stage meta={meta("fence")}>
        <React.Suspense fallback={<Loading label="Loading fence studio" />}>
          <div className="space-y-8">
            <FenceDrawingBoard layout={fenceLayout} onChange={setFenceLayout} />
            <Separator />
            <FenceConfigurator />
          </div>
        </React.Suspense>
      </Stage>

      {/* 06 — grass */}
      <Stage meta={meta("grass")} dark>
        <React.Suspense fallback={<Loading label="Loading grass board" />}>
          <div className="space-y-8">
            <GrassDrawingBoard
              layout={grassLayout}
              onChange={setGrassLayout}
              activeGrassId={grassProduct}
              onActiveGrassChange={setGrassProduct}
            />
            <Separator />
            <GrassConfigurator />
          </div>
        </React.Suspense>
      </Stage>

      {/* 07 — studio */}
      <Stage meta={meta("studio")} contain>
        <Launcher
          title="Wonderlands Studio"
          note="The studio carries every category, option and running total. Load it to configure a complete build inside this page."
        >
          <WonderlandsStudioTool />
        </Launcher>
      </Stage>

      {/* 08 — search */}
      <Stage meta={meta("search")} dark>
        <div className="space-y-8">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Default variant</p>
            <AdvancedSearch />
          </div>
          <Separator />
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Slim variant (studio)</p>
            <AdvancedSearch variant="slim" />
          </div>
        </div>
      </Stage>

      {/* 09 — cart */}
      <Stage meta={meta("cart")}>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Studio cart widget</p>
            <StudioCartWidget
              currentPrice={68500}
              currentName="Wonderlands Aurora 14x28"
              currentCategory="Pool"
              currentExtras={[
                { name: "Salt system", price: 2400, key: "tools2-salt" },
                { name: "LED lighting", price: 1200, key: "tools2-led" },
              ]}
              onQuote={() => setQuoteOpen(true)}
            />
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Mini cart</p>
            <MiniCart onViewFullCart={() => undefined} />
          </div>
        </div>
      </Stage>

      {/* 10 — feature engine */}
      <Stage meta={meta("features")} dark>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Pool options</p>
            <DynamicFeatureRenderer productType="pool" selectedExtras={extrasPool} onExtrasChange={setExtrasPool} />
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Sauna options</p>
            <DynamicFeatureRenderer productType="sauna" selectedExtras={extrasSauna} onExtrasChange={setExtrasSauna} />
          </div>
        </div>
      </Stage>

      {/* 11 — calculators */}
      <Stage meta={meta("calculators")}>
        <div className="space-y-8">
          <PoolCalculator />
          <Separator />
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Heater sizing</p>
            <HeaterSizeCalculator currentSelection={heater} onSelectHeater={setHeater} />
            {heater && <p className="mt-3 text-sm text-muted-foreground">Selected heater: {heater}</p>}
          </div>
          <Separator />
          <div className="grid gap-6 md:grid-cols-2">
            <InlineCalculator type="screen" onResult={setInlineResult} />
            <InlineCalculator type="fence" onResult={setInlineResult} />
          </div>
          {inlineResult && <p className="text-sm text-muted-foreground">Last result: {inlineResult}</p>}
        </div>
      </Stage>

      {/* 12 — financing */}
      <Stage meta={meta("financing")} dark>
        <div className="max-w-xl">
          <FinancingOptions totalPrice={68500} productName="Wonderlands Aurora 14x28" productId="tools2-demo" />
        </div>
      </Stage>

      {/* 13 — quote tool */}
      <Stage meta={meta("quote")}>
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">
            Opens the real survey and quote flow with a demonstration product and everything currently in the cart.
          </p>
          <Button className="rounded-none px-7 py-6 text-[10px] uppercase tracking-[0.28em]" onClick={() => setQuoteOpen(true)}>
            Open the quote tool
          </Button>
        </div>
        <React.Suspense fallback={null}>
          {quoteOpen && (
            <SurveyQuoteTool
              pool={null}
              isOpen={quoteOpen}
              onClose={() => setQuoteOpen(false)}
              customProduct={{ name: "Wonderlands Aurora 14x28", price: 68500, type: "pool" }}
            />
          )}
        </React.Suspense>
      </Stage>

      {/* 14 — media */}
      <Stage meta={meta("media")} dark>
        <div className="max-w-2xl">
          <ProductMediaGallery media={media} productName="Wonderlands Aurora" />
        </div>
      </Stage>

      {/* 15 — sauna */}
      <Stage meta={meta("sauna")}>
        <div className="space-y-8">
          <Button
            variant="outline"
            className="rounded-none px-7 py-6 text-[10px] uppercase tracking-[0.28em]"
            onClick={() => setSaunaPricingOpen(true)}
          >
            Open sales pricing (passcode)
          </Button>
          <React.Suspense fallback={<Loading label="Loading sauna catalog" />}>
            <SaunaSection />
          </React.Suspense>
        </div>
        <React.Suspense fallback={null}>
          {saunaPricingOpen && (
            <SaunaSalesPricingDialog
              open={saunaPricingOpen}
              onOpenChange={setSaunaPricingOpen}
              name="Almost Heaven Grandview"
              unitCost={9995}
              capacity="4 person"
              optionsRetail={1800}
            />
          )}
        </React.Suspense>
      </Stage>

      {/* 16 — landscaping */}
      <Stage meta={meta("landscaping")} dark contain>
        <React.Suspense fallback={<Loading label="Loading landscaping" />}>
          <LandscapingSection />
        </React.Suspense>
      </Stage>

      {/* 17 — pool catalog */}
      <Stage meta={meta("pools")} contain>
        <React.Suspense fallback={<Loading label="Loading pool catalog" />}>
          <PoolCatalog />
        </React.Suspense>
      </Stage>

      <footer className="relative overflow-hidden border-t border-border/60 bg-secondary/40 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 tl-grid opacity-50" />
        <div className="relative z-10 px-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-[11px]">End of the set</p>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-[clamp(1.5rem,4vw,2.5rem)] font-light">
            Seventeen instruments, all of them live.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Cta to="/studio" label="Enter the Studio" />
            <Cta to="/tools" label="Presentation Edition" />
          </div>
        </div>
      </footer>
    </main>
  );
};

export default ToolsGallery2;
