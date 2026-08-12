import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDown, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useReveal from "@/hooks/useReveal";

import logo from "@/assets/wonderlands-logo.webp";

/* Light widgets — loaded with the page */
import AdvancedSearch from "@/components/AdvancedSearch";
import { PoolCalculator } from "@/components/PoolCalculator";
import HeaterSizeCalculator from "@/components/HeaterSizeCalculator";
import { DynamicFeatureRenderer } from "@/components/DynamicFeatureRenderer";
import { InlineCalculator } from "@/components/search/InlineCalculator";
import { SignaturePad } from "@/components/blueprint/SignaturePad";

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
const BlueprintImportDialog = React.lazy(() =>
  import("@/components/blueprint/BlueprintImportDialog").then((m) => ({ default: m.BlueprintImportDialog }))
);

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
  /** What the module actually does, in reviewable bullets. */
  capabilities: string[];
  /** Licensing metadata shown on every module. */
  license: { module: string; tier: string; delivery: string };
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

              <ul className="tl-in tl-d2 mt-6 max-w-md space-y-2 border-t border-foreground/12 pt-5">
                {meta.capabilities.map((c) => (
                  <li key={c} className="flex gap-3 text-[12px] leading-relaxed text-foreground/75">
                    <span className="mt-[7px] h-1 w-1 shrink-0 bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>

              <dl className="tl-in tl-d3 mt-6 max-w-md border-t border-foreground/12 pt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                <div className="flex justify-between gap-3 py-1">
                  <dt>Module</dt>
                  <dd className="text-foreground/80">{meta.license.module}</dd>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <dt>License tier</dt>
                  <dd className="text-foreground/80">{meta.license.tier}</dd>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <dt>Delivery</dt>
                  <dd className="text-foreground/80">{meta.license.delivery}</dd>
                </div>
              </dl>

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
    name: "Pool Designer — 3D / 2D",
    tag: "CAD engine",
    eyebrow: "Real-time WebGL. True scale.",
    headline: "Walk the water before it exists.",
    description:
      "A dual-view design engine: a real-time 3D scene and a plan-view board bound to the same geometry at 10 px per foot. Draw or edit the shell outline and the depth profile rebuilds from linear anchors — shallow end, transition, deep end — with coping, waterline tile, deck elevation and retaining walls generated automatically. Stairs, benches, seating contours and interactive pool lights snap to the shell and re-price as they move.",
    capabilities: [
      "Bidirectional 2D ↔ 3D geometry sync",
      "Linear depth anchors with auto wall generation",
      "Coping, waterline and deck at 1 ft UV texture scale",
      "Snap-to-wall lighting with gradient presets",
      "Live cost model per shell, deck and feature",
    ],
    license: { module: "WL-DESIGN-3D", tier: "Enterprise", delivery: "Embedded React module" },
    route: "/design-studio",
    cta: "Open the Designer",
  },
  {
    id: "site-board",
    index: "02",
    name: "Site Drawing Board",
    tag: "CAD engine",
    eyebrow: "Plan view. Survey accurate.",
    headline: "One continuous line, drawn to scale.",
    description:
      "The architectural site board used for permit drawings. Draw property boundaries, residence footprint, hardscape, pool and easements as layered polygons on a 14.4 px/ft grid, with perpendicular dimension labels, vertex dragging and snap-to-line closing. Every polygon reports its own area and feeds the impervious-surface table used by plan reviewers.",
    capabilities: [
      "Layered site polygons with per-layer styling",
      "Vertex-level editing and dimension callouts",
      "Automatic area and impervious-coverage totals",
      "Calibratable underlay for tracing surveys",
      "Exports geometry to the plan set and the designer",
    ],
    license: { module: "WL-SITE-2D", tier: "Enterprise", delivery: "Embedded React module" },
    route: "/blueprint-builder",
    cta: "Open the Board",
  },
  {
    id: "blueprint",
    index: "03",
    name: "Blueprint Builder",
    tag: "Document engine",
    eyebrow: "Permit ready. Print ready.",
    headline: "The whole plan set, editable in place.",
    description:
      "A complete permit plan set generator. Title block, engineer data, jurisdiction requirements, scope of work, equipment schedule, structural and electrical details, code references and note libraries are all editable inline on the sheet itself. Sheets render to print at true scale, so what appears on screen is what the building department receives.",
    capabilities: [
      "Inline editing of every information block",
      "Jurisdiction presets and reference-code libraries",
      "Equipment schedule, legend and scope tables",
      "Multi-sheet templates with true-scale print output",
      "Site geometry pulled straight from the drawing board",
    ],
    license: { module: "WL-PLANSET", tier: "Enterprise", delivery: "Embedded React module" },
    route: "/blueprint-builder",
    cta: "Open Blueprint Builder",
  },
  {
    id: "import",
    index: "04",
    name: "Survey & CAD Import",
    tag: "Data pipeline",
    eyebrow: "Any survey. Fully editable.",
    headline: "Bring an existing plan in, keep editing it.",
    description:
      "The ingestion engine behind the builder. PDF, JPG and PNG sheets land as a calibratable underlay to trace over at a known scale; DXF (AutoCAD) and SVG geometry lands as real, vertex-editable site polygons with CAD layers mapped onto our site layers. Nothing arrives as a flat picture — everything imported stays drawable.",
    capabilities: [
      "PDF / JPG / PNG underlay with two-point scale calibration",
      "DXF and SVG vector import with layer mapping",
      "Imported geometry remains vertex-editable",
      "Survey metadata autofill into the plan set",
      "Runs client-side — no document leaves the session",
    ],
    license: { module: "WL-IMPORT", tier: "Enterprise add-on", delivery: "Embedded React module" },
    route: "/blueprint-builder",
    cta: "Open the Importer",
  },
  {
    id: "signature",
    index: "05",
    name: "Electronic Signature",
    tag: "Compliance",
    eyebrow: "Florida statutory signature.",
    headline: "Signed, sealed, and verifiable.",
    description:
      "A signature module built for Florida statutory electronic signatures on construction documents. Signers draw, type in one of several script faces, or upload an image; every output is normalised to a transparent PNG for document embedding. The signature is bound to a canonical payload of the drawings, title block and notes via a SHA-256 authentication code, so any later edit invalidates it.",
    capabilities: [
      "Draw, type or upload — one normalised output",
      "Transparent PNG suitable for sheet embedding",
      "SHA-256 authentication code over the document payload",
      "Separate engineer, contractor and owner signature blocks",
      "Statutory seal statement rendered with the signature",
    ],
    license: { module: "WL-ESIGN", tier: "Enterprise add-on", delivery: "Embedded React module" },
    route: "/blueprint-builder",
    cta: "Open the Signature Tool",
  },
  {
    id: "enclosure",
    index: "06",
    name: "Screen Enclosure Studio",
    tag: "Configurator",
    eyebrow: "Structure, priced as you draw.",
    headline: "Draw the footprint, price the structure.",
    description:
      "A code-aware screen enclosure tool. Draw the footprint on a scaled grid with house-attached walls and fixed-width self-closing doors placed as discrete bays, then configure screen fabric, frame gauge, roof style and wind-load requirements. The configurator returns a turnkey number and a contractor cost view of the same structure.",
    capabilities: [
      "Vertex drawing with house-attached wall segments",
      "Fixed-size door bays, not painted spline runs",
      "Centred presets for common enclosure shapes",
      "Fabric, gauge, roof style and wind-load options",
      "Customer turnkey price and contractor cost view",
    ],
    license: { module: "WL-ENCLOSURE", tier: "Professional", delivery: "Embedded React module" },
    route: "/studio-showroom#enclosure",
    cta: "Configure an Enclosure",
  },
  {
    id: "fence",
    index: "07",
    name: "Aluminum Fence Studio",
    tag: "Configurator",
    eyebrow: "Barrier logic, built in.",
    headline: "Every run, every gate, measured.",
    description:
      "Draw the fence line on a 1 ft grid, flag individual segments as gates, and the tool derives linear footage, post count, panel breaks and gate hardware. Pricing follows Florida pool-barrier rules by height and style, including self-latching gate requirements, and returns installation as a separate line.",
    capabilities: [
      "Segment-level gate flagging with hardware rules",
      "Automatic linear footage, panel and post takeoff",
      "Height and style pricing by barrier compliance",
      "Separate material and installation lines",
      "Layout persists across sessions",
    ],
    license: { module: "WL-FENCE", tier: "Professional", delivery: "Embedded React module" },
    route: "/studio-showroom#fence",
    cta: "Design a Fence",
  },
  {
    id: "grass",
    index: "08",
    name: "Artificial Grass Board",
    tag: "Configurator",
    eyebrow: "Any silhouette. Any size.",
    headline: "Turf, drawn free-hand.",
    description:
      "Polygon and spline turf drawing for patios and full yards of any size, with automatic square-foot takeoff per area and a product selector that re-prices every region as the specification changes. A passcode-gated contractor view exposes the Florida general-contractor cost model behind the retail figure.",
    capabilities: [
      "Polygon and spline areas with per-area takeoff",
      "Multi-region drawing with independent products",
      "Live retail pricing per square foot",
      "Passcode-gated contractor cost model",
      "Infill, base and labour broken out",
    ],
    license: { module: "WL-TURF", tier: "Professional", delivery: "Embedded React module" },
    route: "/wonderlands-studio",
    cta: "Open the Grass Board",
  },
  {
    id: "studio",
    index: "09",
    name: "Configuration Studio",
    tag: "Platform",
    eyebrow: "The master instrument.",
    headline: "Every category, one running total.",
    description:
      "The full configuration platform that hosts the other modules: category navigation, product catalogue, option engine, unit-priced trades and a single running total across the whole build. Work autosaves in real time to local storage, so a reload returns the configuration and viewport exactly as they were left.",
    capabilities: [
      "Fourteen product categories in one surface",
      "Unit-priced trades alongside catalogue products",
      "Real-time autosave and viewport restoration",
      "Single running total across the whole build",
      "Handoff into the quote and document engines",
    ],
    license: { module: "WL-STUDIO", tier: "Platform", delivery: "Full application" },
    route: "/studio",
    cta: "Enter the Studio",
  },
  {
    id: "search",
    index: "10",
    name: "Catalog Search Engine",
    tag: "Search",
    eyebrow: "The whole catalog, one field.",
    headline: "Find it by name, or by number.",
    description:
      "A catalogue-wide search index over products, categories, multipliers and specifications, with filter chips, category routing and inline results. Two variants ship from the same engine: the full field used on the main surface and a slim field used inside the studio chrome.",
    capabilities: [
      "Single index across products, trades and specifications",
      "Filter chips with category-scoped routing",
      "Inline results with direct deep links",
      "Full and slim presentation variants",
      "Query state cached between sessions",
    ],
    license: { module: "WL-SEARCH", tier: "Professional", delivery: "Embedded React module" },
    route: "/",
    cta: "Search the Catalog",
  },
  {
    id: "features",
    index: "11",
    name: "Option Engine",
    tag: "Configurator",
    eyebrow: "Category-aware options.",
    headline: "Pools and saunas ask different questions.",
    description:
      "A declarative option engine: each product type carries a feature configuration, and the renderer builds the correct carousels, toggles and counters from it — no per-product UI code. Business rules live in the configuration, so restrictions such as finish exclusivity or minimum deck pricing are enforced everywhere the engine is mounted.",
    capabilities: [
      "Declarative feature configs per product type",
      "Carousels, toggles and counters generated automatically",
      "Business rules and restrictions enforced centrally",
      "Selections priced into the running total",
      "Two product types shown side by side below",
    ],
    license: { module: "WL-OPTIONS", tier: "Professional", delivery: "Embedded React module" },
    route: "/wonderlands-studio",
    cta: "Configure a Product",
  },
  {
    id: "calculators",
    index: "12",
    name: "Engineering Calculators",
    tag: "Calculator",
    eyebrow: "Volume. Heat. Area.",
    headline: "The numbers behind the water.",
    description:
      "The calculation suite: water volume by shape and depth profile, heater capacity sized from surface area and target temperature rise, and the inline square-foot and linear-foot estimators used for screen, fence, paver and lanai takeoffs. Every result can be pushed back into a configuration rather than copied by hand.",
    capabilities: [
      "Volume and turnover by shape and depth profile",
      "Heater sizing by temperature rise and surface area",
      "Inline square-foot and linear-foot estimators",
      "Results write back into the active configuration",
      "Unit handling and rounding rules built in",
    ],
    license: { module: "WL-CALC", tier: "Standard", delivery: "Embedded React module" },
    route: "/pool-calculator",
    cta: "Run the Numbers",
  },
  {
    id: "quote",
    index: "13",
    name: "Survey & Proposal Engine",
    tag: "Document engine",
    eyebrow: "Intake to signed proposal.",
    headline: "One survey becomes the document.",
    description:
      "A guided site survey that compiles into an itemised, print-ready proposal: every configured component and feature is summed, empty sections are suppressed, and authorised users can override wording or pricing behind a passcode. Saving opens the print dialog directly, and each customer keeps a gallery of previous proposals.",
    capabilities: [
      "Guided intake with required contact capture",
      "Itemised component and feature summation",
      "Passcode-gated text and price overrides",
      "Direct print output plus PDF and invoice handoff",
      "Per-customer proposal gallery and history",
    ],
    license: { module: "WL-PROPOSAL", tier: "Enterprise", delivery: "Embedded React module" },
    route: "/quote",
    cta: "Build a Proposal",
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
  const [importOpen, setImportOpen] = React.useState(false);
  const [signatureOpen, setSignatureOpen] = React.useState(false);
  const [signature, setSignature] = React.useState("");

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
              Software — Licensing edition
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
            Thirteen licensable modules
          </p>
          <h1 className="mt-5 max-w-5xl font-serif text-[clamp(2.3rem,8vw,6.5rem)] font-light leading-[0.95] tracking-tight">
            Not screenshots.
            <span className="block italic text-primary">The software itself.</span>
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Design, drafting, permitting and proposal software for the outdoor construction trade — CAD engines,
            code-aware configurators, calculators and document generators. Every module below is the production
            build, running live: draw on the boards, import a survey, sign a sheet, price a structure.
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

      {/* 04 — survey & CAD import */}
      <Stage meta={meta("import")}>
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Import a survey or plan set into the site geometry loaded above. PDF, JPG and PNG arrive as a
            calibratable underlay; DXF and SVG arrive as editable polygons.
          </p>
          <Button
            className="rounded-none px-7 py-6 text-[10px] uppercase tracking-[0.28em]"
            onClick={() => setImportOpen(true)}
          >
            Import a survey
          </Button>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Current site geometry — {sitePlan.shapes.length} shape{sitePlan.shapes.length === 1 ? "" : "s"} ·
            underlay {sitePlan.underlay ? "loaded" : "none"}
          </p>
        </div>
        <React.Suspense fallback={null}>
          {importOpen && (
            <BlueprintImportDialog
              open={importOpen}
              onOpenChange={setImportOpen}
              site={sitePlan}
              onApply={setSitePlan}
            />
          )}
        </React.Suspense>
      </Stage>

      {/* 05 — electronic signature */}
      <Stage meta={meta("signature")} dark>
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Draw, type or upload a signature. The module returns a transparent PNG ready to embed in a sheet.
          </p>
          <Button
            className="rounded-none px-7 py-6 text-[10px] uppercase tracking-[0.28em]"
            onClick={() => setSignatureOpen(true)}
          >
            Sign a document
          </Button>
          <div className="border border-foreground/12 bg-muted/30 p-6">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
              Applied signature
            </p>
            {signature ? (
              <img src={signature} alt="Applied electronic signature" className="h-24 w-auto" />
            ) : (
              <p className="text-sm text-muted-foreground">No signature applied yet.</p>
            )}
          </div>
        </div>
        <SignaturePad
          open={signatureOpen}
          onOpenChange={setSignatureOpen}
          title="Electronic signature — demonstration"
          onApply={setSignature}
        />
      </Stage>

      {/* 06 — enclosure */}
      <Stage meta={meta("enclosure")} dark>
        <React.Suspense fallback={<Loading label="Loading enclosure studio" />}>
          <div className="space-y-8">
            <EnclosureDrawingBoard layout={enclosureLayout} onChange={setEnclosureLayout} />
            <Separator />
            <EnclosureConfigurator />
          </div>
        </React.Suspense>
      </Stage>

      {/* 07 — fence */}
      <Stage meta={meta("fence")}>
        <React.Suspense fallback={<Loading label="Loading fence studio" />}>
          <div className="space-y-8">
            <FenceDrawingBoard layout={fenceLayout} onChange={setFenceLayout} />
            <Separator />
            <FenceConfigurator />
          </div>
        </React.Suspense>
      </Stage>

      {/* 08 — grass */}
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

      {/* 09 — studio */}
      <Stage meta={meta("studio")} contain>
        <Launcher
          title="Wonderlands Studio"
          note="The studio carries every category, option and running total. Load it to configure a complete build inside this page."
        >
          <WonderlandsStudioTool />
        </Launcher>
      </Stage>

      {/* 10 — search */}
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

      {/* 11 — option engine */}
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

      {/* 12 — calculators */}
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

      {/* 13 — proposal engine */}
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


      <footer className="relative overflow-hidden border-t border-border/60 bg-secondary/40 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 tl-grid opacity-50" />
        <div className="relative z-10 px-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-[11px]">
            Licensing — Wonderlands Software
          </p>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-[clamp(1.5rem,4vw,2.5rem)] font-light">
            Thirteen modules, licensed individually or as one platform.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every module above is the production build, embeddable as a React module or deployed as a full
            application. Standard, Professional, Enterprise and Platform tiers are available per module.
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
