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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Global Design Board | Wonderlands World</title>
        <meta
          name="description"
          content="Design the whole property on one board — pool and hardscape, screen enclosure, fencing, turf, planting and solar — priced live and loaded into permit blueprints in one click."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/global-design-board" />
      </Helmet>

      {/* ── header ── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight">Global Design Board</h1>
            <p className="text-xs text-muted-foreground">
              One property, every trade — drawn, priced and permit-ready
            </p>
          </div>
          {/* gateway controls — same control language as the boards below */}
          <div className="board-console ml-auto flex flex-wrap items-center gap-2">
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

      <main className="mx-auto grid max-w-[1800px] gap-4 px-4 py-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* ── project + trade rail ── */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Project</p>
            <div className="mt-3 space-y-3">
              {field("Title", "title")}
              {field("Client", "clientName", "Homeowner name")}
              {field("Address", "address", "Street address")}
              {field("City / State / Zip", "cityStateZip")}
              {field("Job number", "jobNumber")}
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Notes carried to the plan set
                </Label>
                <Textarea
                  value={meta.notes}
                  onChange={(e) => setMeta((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </section>

          {/* Trade gateways — the same glass gateway button as the FLIP edition */}
          <section className="rounded-2xl border border-border/60 bg-card/60 p-2 backdrop-blur-xl">
            <p className="px-2 pt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Trades</p>
            <div className="mt-2 space-y-1.5">
              {TRADES.map((t, i) => {
                const on = enabled.includes(t.id);
                const isActive = t.id === activeTrade;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "group relative overflow-hidden rounded-sm border p-3 transition-all duration-500",
                      isActive
                        ? "border-foreground bg-foreground/[0.06]"
                        : "border-border/50 bg-foreground/[0.02] hover:border-foreground/70",
                    )}
                  >
                    <button type="button" onClick={() => setActiveTrade(t.id)} className="block w-full text-left">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="flex items-center gap-2 font-serif text-lg font-light leading-none">
                          <t.Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {t.label}
                        </span>
                        <span className="font-serif text-[11px] text-muted-foreground">0{i + 1}</span>
                      </span>
                      <span className="mt-2 block text-[11px] leading-snug text-muted-foreground">{t.note}</span>
                      <span className="mt-2 flex items-center justify-between gap-3 text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground">
                        <span>
                          {t.id === "solar"
                            ? "Proposal after survey"
                            : totals[t.id]
                              ? `${money(totals[t.id])} as drawn`
                              : "Nothing drawn yet"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
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
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Project total</p>
            <p className="mt-1 font-serif text-3xl font-light">{money(projectTotal)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Turn-key, installed at the address. Solar is quoted separately after the roof survey.
            </p>
            <div className="mt-3 space-y-1">
              {TRADES.filter((t) => enabled.includes(t.id) && t.id !== "solar").map((t) => (
                <div key={t.id} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">{t.label}</span>
                  <span>{money(totals[t.id] || 0)}</span>
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-4 w-full" onClick={openBlueprint}>
              Load into blueprint mode
            </Button>
            <Button size="sm" variant="ghost" className="mt-1.5 w-full text-destructive" onClick={resetProject}>
              <Eraser className="mr-1 h-4 w-4" /> Erase &amp; reset project
            </Button>
          </section>
        </aside>

        {/* ── the live board for the selected trade ── */}
        <section className="min-w-0 space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card/50 p-3 backdrop-blur-xl sm:p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Trees className="h-4 w-4 text-muted-foreground" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{active.label}</p>
              <span className="text-[11px] text-muted-foreground">{active.note}</span>
              {!enabled.includes(active.id) && (
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => toggleTrade(active.id)}>
                  Add to project
                </Button>
              )}
            </div>
            {/* the discipline's real board: its pencils, splines, layers and tools */}
            <FlipToolWidget key={active.boardId} categoryId={active.boardId} part="board" />
          </div>

          {/* the discipline's own estimate, take-off, options, specs and process */}
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl">
            <FlipBoardDossier key={`${active.boardId}-dossier`} categoryId={active.boardId} title={active.label} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default GlobalDesignBoard;
