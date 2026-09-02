import * as React from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Fence,
  Flower2,
  Grid2x2,
  Layers,
  Ruler,
  Sun,
  Trees,
  Eraser,
  Waves,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import usePersistentState from "@/hooks/usePersistentState";
import FlipToolWidget from "@/components/flip/FlipToolWidget";
import FlipBoardDossier from "@/components/flip/FlipBoardDossier";
import { useBoardEstimate } from "@/components/flip/FlipBoardPanels";
import { useFlipBoard, resetFlipBoard } from "@/components/flip/flipBoardStore";
import {
  DEFAULT_GLOBAL_META,
  computeGlobalEstimate,
  loadIntoBlueprint,
  type GlobalProjectMeta,
  type TradeId,
} from "@/lib/design/globalDesignProject";
import { cn } from "@/lib/utils";

/**
 * GLOBAL DESIGN BOARD
 *
 * One property, every trade, one price — built on the Blueprint Builder shell
 * and the production drawing boards, not on copies of them. Each trade mounts
 * its own real board (its pencils, splines, layers, options and additional
 * features) plus that trade's own pricing model, all persisted under one
 * project. When the design is settled, a single click loads it into blueprint
 * mode, which opens already drawn, measured and scoped.
 *
 * Board ids are `"<discipline>__global-design"`, so the shared board store, the
 * FLIP dossiers, the calculators and the Editor Board all resolve the correct
 * discipline and read the exact same geometry as the global project.
 */

type Trade = {
  id: TradeId;
  /** Discipline id understood by boardForCategory */
  boardId: string;
  label: string;
  note: string;
  Icon: typeof Waves;
};

const TRADES: Trade[] = [
  {
    id: "site",
    boardId: "pools__global-design",
    label: "Site & pool studio",
    note: "Property, residence, shell, deck and hardscape on a scaled grid.",
    Icon: Waves,
  },
  {
    id: "enclosure",
    boardId: "screen-enclosures__global-design",
    label: "Screen enclosure & lanai",
    note: "Mansard or gable cage, doors and kick plates to Florida wind load.",
    Icon: Grid2x2,
  },
  {
    id: "fence",
    boardId: "patio-fencing__global-design",
    label: "Fencing & gates",
    note: "Runs, heights, styles and self-latching pool doors to code.",
    Icon: Fence,
  },
  {
    id: "grass",
    boardId: "artificial-grass__global-design",
    label: "Artificial turf",
    note: "Lawn areas, product, base, seams and infill.",
    Icon: Layers,
  },
  {
    id: "landscape",
    boardId: "landscaping__global-design",
    label: "Planting & beds",
    note: "Beds, drifts and hedges — real plants drawn at mature canopy, in flower.",
    Icon: Flower2,
  },
  {
    id: "solar",
    boardId: "solar__global-design",
    label: "Solar & storage",
    note: "Aerial roof study, array layout, production and storage.",
    Icon: Sun,
  },
];

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Live total for one trade, read straight off its board. */
const useTradeTotal = (boardId: string) => useBoardEstimate(boardId).total;

/**
 * Every trade total in one place. Hook order is fixed by TRADES, so this reads
 * all six boards in a single render without violating hook rules.
 */
function useAllTradeTotals(): Record<TradeId, number> {
  const site = useTradeTotal(TRADES[0].boardId);
  const enclosure = useTradeTotal(TRADES[1].boardId);
  const fence = useTradeTotal(TRADES[2].boardId);
  const grass = useTradeTotal(TRADES[3].boardId);
  const landscape = useTradeTotal(TRADES[4].boardId);
  const solar = useTradeTotal(TRADES[5].boardId);
  return { site, enclosure, fence, grass, landscape, solar };
}

const GlobalDesignBoard: React.FC = () => {
  const navigate = useNavigate();
  const [meta, setMeta] = usePersistentState<GlobalProjectMeta>("global_design_meta_v1", DEFAULT_GLOBAL_META);
  const [activeTrade, setActiveTrade] = usePersistentState<TradeId>("global_design_active_trade", "site");

  const totals = useAllTradeTotals();
  /* the site board holds the drawing blueprint mode is built from */
  const siteState = useFlipBoard(TRADES[0].boardId);
  const enclosureState = useFlipBoard(TRADES[1].boardId);
  const fenceState = useFlipBoard(TRADES[2].boardId);
  const grassState = useFlipBoard(TRADES[3].boardId);
  const landscapeState = useFlipBoard(TRADES[4].boardId);

  const active = TRADES.find((t) => t.id === activeTrade) ?? TRADES[0];

  const enabled = meta.trades;
  const projectTotal = TRADES.filter((t) => t.id !== "solar" && enabled.includes(t.id)).reduce(
    (s, t) => s + (totals[t.id] || 0),
    0,
  );

  const toggleTrade = (id: TradeId) =>
    setMeta((prev) => ({
      ...prev,
      trades: prev.trades.includes(id) ? prev.trades.filter((t) => t !== id) : [...prev.trades, id],
    }));

  /** Erase every trade board and the project sheet, then start clean. */
  const resetProject = () => {
    if (!window.confirm("Erase every drawing and reset this project? This cannot be undone.")) return;
    TRADES.forEach((t) => resetFlipBoard(t.boardId));
    setMeta({ ...DEFAULT_GLOBAL_META });
  };

  const openBlueprint = () => {
    /* every trade is priced from its own board, then summarised as scope */
    const merged = {
      ...siteState,
      enclosure: enclosureState.enclosure,
      fence: fenceState.fence,
      grass: grassState.grass,
      grassId: grassState.grassId,
      landscape: landscapeState.landscape,
      plantKey: landscapeState.plantKey,
    };
    const trades = computeGlobalEstimate(merged).map((t) => ({ ...t, total: totals[t.id] ?? t.total }));
    navigate(loadIntoBlueprint(merged, meta, trades));
  };

  const field = (label: string, key: keyof GlobalProjectMeta, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</Label>
      <Input
        value={String(meta[key] ?? "")}
        placeholder={placeholder}
        onChange={(e) => setMeta((prev) => ({ ...prev, [key]: e.target.value }))}
        className="h-8 text-sm"
      />
    </div>
  );

  /* one control language everywhere: the trade gateway, at two densities */
  const tradeCard = (t: Trade, i: number, compact = false) => {
    const on = enabled.includes(t.id);
    const isActive = t.id === activeTrade;
    return (
      <div
        key={t.id}
        className={cn(
          "group relative overflow-hidden rounded-sm border p-3 backdrop-blur-xl transition-all duration-500",
          compact && "w-[240px] shrink-0 snap-start",
          isActive
            ? "border-foreground bg-foreground/[0.07] shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.5)]"
            : "border-border/50 bg-card/40 hover:border-foreground/70 hover:bg-card/60",
        )}
      >
        <button type="button" onClick={() => setActiveTrade(t.id)} className="block w-full text-left">
          <span className="flex items-baseline justify-between gap-3">
            <span className="flex items-center gap-2 font-serif text-base font-light leading-tight sm:text-lg">
              <t.Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {t.label}
            </span>
            <span className="font-serif text-[11px] text-muted-foreground">0{i + 1}</span>
          </span>
          <span className="mt-2 block text-[11px] leading-snug text-muted-foreground">{t.note}</span>
          <span className="mt-2 flex items-center justify-between gap-3 text-[8.5px] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="truncate">
              {t.id === "solar"
                ? "Proposal after survey"
                : totals[t.id]
                  ? `${money(totals[t.id])} as drawn`
                  : "Nothing drawn yet"}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-500 group-hover:translate-x-1.5" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => toggleTrade(t.id)}
          aria-pressed={on}
          aria-label={`${on ? "Remove" : "Include"} ${t.label}`}
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[8.5px] uppercase tracking-[0.28em] transition-colors duration-500",
            on
              ? "border-foreground bg-foreground text-background"
              : "border-border/50 text-muted-foreground hover:border-foreground/70 hover:text-foreground",
          )}
        >
          {on ? "In scope" : "Add to project"}
        </button>
        {!isActive && (
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-px w-0 bg-foreground transition-all duration-700 group-hover:w-full"
          />
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Helmet>
        <title>Global Design Board | Wonderlands World</title>
        <meta
          name="description"
          content="Design the whole property on one board — pool and hardscape, screen enclosure, fencing, turf, planting and solar — priced live and loaded into permit blueprints in one click."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/global-design-board" />
      </Helmet>

      {/* atmosphere the glass reads against */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 60% at 12% -10%, hsl(var(--primary) / 0.10), transparent 60%), radial-gradient(70% 55% at 100% 0%, hsl(var(--accent) / 0.10), transparent 62%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted) / 0.5))",
        }}
      />

      {/* ── header ── */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/92 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:px-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-light leading-none tracking-tight sm:text-2xl">
              Global Design Board
            </h1>
            <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              One property, every trade — drawn, priced, permit-ready
            </p>
          </div>
          {/* gateway controls — same control language as the boards below */}
          <div className="board-console ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              {enabled.length} trade{enabled.length === 1 ? "" : "s"} in scope
            </span>
            <span className="text-[9px] uppercase tracking-[0.28em] text-foreground">
              {money(projectTotal)} installed
            </span>
            <button type="button" onClick={() => navigate("/blueprint-builder")}>
              <Ruler className="mr-1.5 inline h-3.5 w-3.5" /> Blueprint builder
            </button>
            <button type="button" onClick={openBlueprint} className="bg-primary">
              Load into blueprint mode <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* the trade rail becomes a swipeable strip on small screens */}
      <div className="border-b border-border/50 bg-background/55 backdrop-blur-2xl xl:hidden">
        <div className="mx-auto max-w-[1800px] px-3 py-3 sm:px-5">
          <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Trades</p>
          <div className="flex snap-x gap-2 overflow-x-auto pb-1">
            {TRADES.map((t, i) => tradeCard(t, i, true))}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1800px] gap-4 px-3 py-4 sm:px-5 sm:py-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* ── project + trade rail ── */}
        <aside className="space-y-4">
          <section className="glass-panel rounded-2xl p-4">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Project</p>
            <div className="mt-3 space-y-3">
              {field("Title", "title")}
              {field("Client", "clientName", "Homeowner name")}
              {field("Address", "address", "Street address")}
              {field("City / State / Zip", "cityStateZip")}
              {field("Job number", "jobNumber")}
              <div className="space-y-1">
                <Label className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                  Notes carried to the plan set
                </Label>
                <Textarea
                  value={meta.notes}
                  onChange={(e) => setMeta((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="bg-background/60 text-sm backdrop-blur-md"
                />
              </div>
            </div>

            {/* The drawn element's own additional features live here, in the
                project column, instead of under the board — every catalogued
                option, priced exactly as the studio and the FLIP book price it. */}
            <div id="wl-board-options" className="mt-4 space-y-3 border-t border-border/50 pt-4 empty:mt-0 empty:border-0 empty:pt-0" />
          </section>


          {/* Trade gateways — the same glass gateway button as the FLIP edition */}
          <section className="glass-panel hidden rounded-2xl p-2 xl:block">
            <p className="px-2 pt-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Trades</p>
            <div className="mt-2 space-y-1.5">{TRADES.map((t, i) => tradeCard(t, i))}</div>
          </section>

          <section className="glass-panel rounded-2xl p-4 xl:sticky xl:top-24">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Project total</p>
            <p className="mt-1 font-serif text-4xl font-light tracking-tight">{money(projectTotal)}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Turn-key, installed at the address. Solar is quoted separately after the roof survey.
            </p>
            <div className="mt-3 space-y-1">
              {TRADES.filter((t) => enabled.includes(t.id) && t.id !== "solar").map((t) => (
                <div key={t.id} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">{t.label}</span>
                  <span className="tabular-nums">{money(totals[t.id] || 0)}</span>
                </div>
              ))}
            </div>
            <div className="board-console mt-4 space-y-1.5">
              <button type="button" className="w-full bg-primary" onClick={openBlueprint}>
                Load into blueprint mode
              </button>
              <button type="button" className="w-full" onClick={resetProject}>
                <Eraser className="mr-1.5 inline h-3.5 w-3.5" /> Erase &amp; reset project
              </button>
            </div>
          </section>
        </aside>

        {/* ── the live board for the selected trade ── */}
        <section className="min-w-0 space-y-4">
          <div className="glass-panel rounded-3xl p-2.5 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Trees className="h-4 w-4 text-muted-foreground" />
              <p className="font-serif text-lg font-light leading-none">{active.label}</p>
              <span className="hidden h-px w-8 bg-foreground/25 sm:block" />
              <span className="text-[11px] text-muted-foreground">{active.note}</span>
              {!enabled.includes(active.id) && (
                <span className="board-console ml-auto">
                  <button type="button" onClick={() => toggleTrade(active.id)}>
                    Add to project
                  </button>
                </span>
              )}
            </div>
            {/* the discipline's real board: its pencils, splines, layers and tools */}
            <FlipToolWidget key={active.boardId} categoryId={active.boardId} part="board" />
          </div>

          {/* the discipline's own estimate, take-off, options, specs and process */}
          <div className="glass-panel overflow-hidden rounded-3xl">
            <FlipBoardDossier key={`${active.boardId}-dossier`} categoryId={active.boardId} title={active.label} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default GlobalDesignBoard;
