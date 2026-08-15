import * as React from "react";
import { Suspense, lazy, useState } from "react";
import { Loader2, PenTool } from "lucide-react";
import { DEFAULT_PX_PER_FT, type SitePlanData } from "@/components/blueprint/SiteDrawingBoard";
import type { EnclosureLayout } from "@/components/enclosure/EnclosureDrawingBoard";
import type { FenceLayout } from "@/components/fence/FenceDrawingBoard";
import type { GrassLayout } from "@/components/grass/GrassDrawingBoard";

/**
 * Every Wonderlands widget that can be printed onto a FLIP page — the real
 * production module, self-contained, so a builder page can carry a live board,
 * configurator, calculator or search surface.
 */

const SiteDrawingBoard = lazy(() => import("@/components/blueprint/SiteDrawingBoard"));
const FenceDrawingBoard = lazy(() => import("@/components/fence/FenceDrawingBoard"));
const EnclosureDrawingBoard = lazy(() => import("@/components/enclosure/EnclosureDrawingBoard"));
const GrassDrawingBoard = lazy(() => import("@/components/grass/GrassDrawingBoard"));
const FenceConfigurator = lazy(() => import("@/components/fence/FenceConfigurator"));
const EnclosureConfigurator = lazy(() => import("@/components/enclosure/EnclosureConfigurator"));
const GrassConfigurator = lazy(() => import("@/components/grass/GrassConfigurator"));
const HeaterSizeCalculator = lazy(() => import("@/components/HeaterSizeCalculator"));
const AdvancedSearch = lazy(() => import("@/components/AdvancedSearch"));
const FlipToolWidget = lazy(() => import("./FlipToolWidget"));
const PoolCalculatorLazy = lazy(() =>
  import("@/components/PoolCalculator").then((m) => ({ default: m.PoolCalculator })),
);
const InlineCalculatorLazy = lazy(() =>
  import("@/components/search/InlineCalculator").then((m) => ({ default: m.InlineCalculator })),
);
const DynamicFeatureRendererLazy = lazy(() =>
  import("@/components/DynamicFeatureRenderer").then((m) => ({ default: m.DynamicFeatureRenderer })),
);
const SignaturePadLazy = lazy(() =>
  import("@/components/blueprint/SignaturePad").then((m) => ({ default: m.SignaturePad })),
);

const Loading = () => (
  <div className="flex h-full w-full items-center justify-center gap-3 bg-muted/40">
    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Loading widget</span>
  </div>
);

/* --------------------------------------------------------------- wrappers */

const SiteBoard: React.FC = () => {
  const [plan, setPlan] = useState<SitePlanData>({ shapes: [], pxPerFt: DEFAULT_PX_PER_FT });
  return <SiteDrawingBoard data={plan} onChange={setPlan} />;
};

const EnclosureBoard: React.FC = () => {
  const [layout, setLayout] = useState<EnclosureLayout>({ points: [], closed: false, features: {} });
  return <EnclosureDrawingBoard layout={layout} onChange={setLayout} />;
};

const FenceBoard: React.FC = () => {
  const [layout, setLayout] = useState<FenceLayout>({ points: [], closed: false, gateSegments: [] });
  return <FenceDrawingBoard layout={layout} onChange={setLayout} />;
};

const GrassBoard: React.FC = () => {
  const [layout, setLayout] = useState<GrassLayout>({ areas: [] });
  const [active, setActive] = useState("");
  return (
    <GrassDrawingBoard layout={layout} onChange={setLayout} activeGrassId={active} onActiveGrassChange={setActive} />
  );
};

const HeaterCalc: React.FC = () => {
  const [heater, setHeater] = useState("");
  return <HeaterSizeCalculator currentSelection={heater} onSelectHeater={setHeater} />;
};

const Inline: React.FC<{ type: "screen" | "fence" }> = ({ type }) => {
  const [result, setResult] = useState("");
  return (
    <div className="space-y-3">
      <InlineCalculatorLazy type={type} onResult={setResult} />
      {result && <p className="text-[11px] text-muted-foreground">{result}</p>}
    </div>
  );
};

const Features: React.FC<{ productType: "pool" | "sauna" }> = ({ productType }) => {
  const [extras, setExtras] = useState<Record<string, unknown>>({});
  return <DynamicFeatureRendererLazy productType={productType} selectedExtras={extras} onExtrasChange={setExtras} />;
};

const Signature: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col items-start gap-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-foreground px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        <PenTool className="h-3.5 w-3.5" /> Sign this sheet
      </button>
      {value && <img src={value} alt="Applied signature" className="h-16 w-auto" />}
      <SignaturePadLazy
        open={open}
        onOpenChange={setOpen}
        title="Electronic signature"
        onApply={setValue}
      />
    </div>
  );
};

/** A production page mounted in a frame — for full applications. */
const RouteFrame: React.FC<{ route: string; label: string }> = ({ route, label }) => (
  <iframe
    src={route}
    title={label}
    loading="lazy"
    className="h-full w-full border-0 bg-background"
  />
);

/* --------------------------------------------------------------- registry */

export type FlipWidgetId =
  | "site-board"
  | "site-board-pool"
  | "enclosure-board"
  | "fence-board"
  | "grass-board"
  | "enclosure-config"
  | "fence-config"
  | "grass-config"
  | "pool-calculator"
  | "heater-calculator"
  | "inline-screen"
  | "inline-fence"
  | "search"
  | "search-slim"
  | "features-pool"
  | "features-sauna"
  | "signature"
  | "tool-pools"
  | "tool-lanai"
  | "tool-landscaping"
  | "tool-pavers"
  | "app-studio"
  | "app-blueprint"
  | "app-designer"
  | "app-checkout"
  | "app-showroom";

export type FlipWidgetMeta = {
  id: FlipWidgetId;
  label: string;
  group: "Boards" | "Configurators" | "Calculators" | "Options & search" | "Documents" | "Applications";
  note: string;
  /** widgets that need their own scroll area rather than a fixed frame */
  scroll?: boolean;
  render: () => React.ReactNode;
};

export const FLIP_WIDGETS: FlipWidgetMeta[] = [
  {
    id: "site-board",
    label: "Site plan board",
    group: "Boards",
    note: "The full site plan CAD board — pool, deck, patio and hardscape layers with live takeoff.",
    render: () => <SiteBoard />,
  },
  {
    id: "site-board-pool",
    label: "Pool board (site plan)",
    group: "Boards",
    note: "The site plan board with the pool layer armed, priced and dimensioned as drawn.",
    render: () => <FlipToolWidget categoryId="pools" />,
  },
  {
    id: "enclosure-board",
    label: "Screen enclosure board",
    group: "Boards",
    note: "Draw the enclosure footprint; bays, doors and beams follow Florida code.",
    render: () => <EnclosureBoard />,
  },
  {
    id: "fence-board",
    label: "Aluminium fence board",
    group: "Boards",
    note: "Trace the run, place self-latching gates, read the linear footage live.",
    render: () => <FenceBoard />,
  },
  {
    id: "grass-board",
    label: "Artificial turf board",
    group: "Boards",
    note: "Lay turf areas of any shape with true 1x1 ft texture and square footage.",
    render: () => <GrassBoard />,
  },
  {
    id: "enclosure-config",
    label: "Enclosure configurator",
    group: "Configurators",
    note: "Code-aware enclosure specification: mesh, beams, kickplate, doors and pricing.",
    scroll: true,
    render: () => <EnclosureConfigurator />,
  },
  {
    id: "fence-config",
    label: "Fence configurator",
    group: "Configurators",
    note: "Height, style, gates and posts priced per linear foot.",
    scroll: true,
    render: () => <FenceConfigurator />,
  },
  {
    id: "grass-config",
    label: "Turf configurator",
    group: "Configurators",
    note: "Turf product, base preparation and infill, costed by area.",
    scroll: true,
    render: () => <GrassConfigurator />,
  },
  {
    id: "pool-calculator",
    label: "Pool calculator",
    group: "Calculators",
    note: "Volume, surface area and chemistry for any pool geometry.",
    scroll: true,
    render: () => <PoolCalculatorLazy />,
  },
  {
    id: "heater-calculator",
    label: "Heater sizing",
    group: "Calculators",
    note: "Sizes the heater to the water volume and the season.",
    scroll: true,
    render: () => <HeaterCalc />,
  },
  {
    id: "inline-screen",
    label: "Screen estimator",
    group: "Calculators",
    note: "Quick screen enclosure estimate from a footprint.",
    scroll: true,
    render: () => <Inline type="screen" />,
  },
  {
    id: "inline-fence",
    label: "Fence estimator",
    group: "Calculators",
    note: "Quick fence estimate from a perimeter.",
    scroll: true,
    render: () => <Inline type="fence" />,
  },
  {
    id: "search",
    label: "Catalogue search",
    group: "Options & search",
    note: "The main search surface across every category and model.",
    scroll: true,
    render: () => <AdvancedSearch />,
  },
  {
    id: "search-slim",
    label: "Catalogue search — slim",
    group: "Options & search",
    note: "The compact studio search bar.",
    scroll: true,
    render: () => <AdvancedSearch variant="slim" />,
  },
  {
    id: "features-pool",
    label: "Pool option engine",
    group: "Options & search",
    note: "Every pool feature, priced and selectable.",
    scroll: true,
    render: () => <Features productType="pool" />,
  },
  {
    id: "features-sauna",
    label: "Sauna option engine",
    group: "Options & search",
    note: "Every sauna feature and accessory, priced and selectable.",
    scroll: true,
    render: () => <Features productType="sauna" />,
  },
  {
    id: "signature",
    label: "Electronic signature",
    group: "Documents",
    note: "Draw, type or upload a signature — Florida statutory electronic signature.",
    scroll: true,
    render: () => <Signature />,
  },
  {
    id: "tool-pools",
    label: "Pool design widget",
    group: "Boards",
    note: "The pool discipline widget with live pricing and dimensions.",
    render: () => <FlipToolWidget categoryId="pools" />,
  },
  {
    id: "tool-lanai",
    label: "Lanai design widget",
    group: "Boards",
    note: "The lanai and patio widget, drawn on the patio layer.",
    render: () => <FlipToolWidget categoryId="lanai" />,
  },
  {
    id: "tool-landscaping",
    label: "Landscaping widget",
    group: "Boards",
    note: "Planting beds, gravel and verdure, drawn to scale.",
    render: () => <FlipToolWidget categoryId="landscaping" />,
  },
  {
    id: "tool-pavers",
    label: "Paver deck widget",
    group: "Boards",
    note: "Deck and paver areas measured off the plan.",
    render: () => <FlipToolWidget categoryId="pavers" />,
  },
  {
    id: "app-studio",
    label: "Wonderlands Studio",
    group: "Applications",
    note: "The whole studio — categories, options and a running total.",
    render: () => <RouteFrame route="/wonderlands-studio" label="Wonderlands Studio" />,
  },
  {
    id: "app-blueprint",
    label: "Blueprint Builder",
    group: "Applications",
    note: "The permit plan set generator with upload, calibration and signing.",
    render: () => <RouteFrame route="/blueprint-builder" label="Blueprint Builder" />,
  },
  {
    id: "app-designer",
    label: "Pool Designer 3D / 2D",
    group: "Applications",
    note: "The real-time design engine, in true scale.",
    render: () => <RouteFrame route="/design-studio" label="Pool Designer" />,
  },
  {
    id: "app-checkout",
    label: "Checkout & financing",
    group: "Applications",
    note: "The cart, deposit schedule and financing step.",
    render: () => <RouteFrame route="/checkout" label="Checkout" />,
  },
  {
    id: "app-showroom",
    label: "Studio showroom",
    group: "Applications",
    note: "Every widget in the showroom, on one surface.",
    render: () => <RouteFrame route="/studio-showroom" label="Studio showroom" />,
  },
];

export const widgetMeta = (id?: string) => FLIP_WIDGETS.find((w) => w.id === id);

/** Renders a widget inside a page block, scaled so a full board fits a leaf. */
export const FlipWidgetSurface: React.FC<{ id?: string; scale?: number; editing?: boolean }> = ({
  id,
  scale = 0.62,
  editing,
}) => {
  const meta = widgetMeta(id);
  if (!meta) {
    return (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-border/70 bg-muted/30">
        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Choose a widget</span>
      </div>
    );
  }
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div
        className={`absolute left-0 top-0 origin-top-left ${editing ? "pointer-events-none" : ""} ${
          meta.scroll ? "overflow-y-auto" : ""
        }`}
        style={{ width: `${100 / scale}%`, height: `${100 / scale}%`, transform: `scale(${scale})` }}
      >
        <Suspense fallback={<Loading />}>{meta.render()}</Suspense>
      </div>
    </div>
  );
};

export default FlipWidgetSurface;
