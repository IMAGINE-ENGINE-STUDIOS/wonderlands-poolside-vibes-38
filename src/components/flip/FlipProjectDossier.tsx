/**
 * FLIP Project Dossier — the whole property in one live take-off.
 *
 * The per-trade dossier (`FlipBoardDossier`) prints one discipline. On the
 * Global Design Board a customer is buying a *project*, so this dossier reads
 * every trade board at once and prints:
 *
 *   Estimate            every trade's lines, its subtotal, and the project
 *                       payment schedule taken on the project total
 *   Take-off & options  the real options panel of any trade, switched by chip
 *                       (the same catalogue, images and prices as the studio)
 *   Specifications      every trade's engineering specs, grouped by trade
 *   Process             every trade's build pipeline, grouped by trade
 *
 * Hook safety: `trades` must be a module-level constant (it is — `TRADES` on the
 * Global Design Board), so the hooks below run in the same order every render.
 */

import * as React from "react";
import { RotateCcw, X } from "lucide-react";
import { useBoardEstimate, useProjectSpecs, FlipBoardCalculators } from "./FlipBoardPanels";
import { resetFlipBoard } from "./flipBoardStore";
import { getProjectPipeline } from "@/data/projectPipeline";
import { isRemovableLine, removeEstimateLine, removeLineHint } from "@/lib/design/estimateEdit";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export type DossierTrade = {
  id: string;
  /** Discipline board id, e.g. `pools__global-design` */
  boardId: string;
  label: string;
  /** Solar is quoted after the roof survey, so its figure stays private. */
  priceHidden?: boolean;
};

type TabId = "estimate" | "takeoff" | "specs" | "process";

const TABS: { id: TabId; label: string }[] = [
  { id: "estimate", label: "Estimate" },
  { id: "takeoff", label: "Take-off & options" },
  { id: "specs", label: "Specifications" },
  { id: "process", label: "Process" },
];

/** Wonderlands standard schedule, taken on the whole project. */
const SCHEDULE = [
  { label: "On contract", pct: 20 },
  { label: "At excavation", pct: 35 },
  { label: "At shell & equipment", pct: 40 },
  { label: "At handover", pct: 10 },
];

export const FlipProjectDossier: React.FC<{
  trades: DossierTrade[];
  /** Trades the customer has put in scope — others are read but not billed. */
  enabled: string[];
  /** The trade whose board is open above; its options open first. */
  activeId: string;
  onActiveChange?: (id: string) => void;
  title?: string;
}> = ({ trades, enabled, activeId, onActiveChange, title = "This project" }) => {
  /* one hook pair per trade, in the fixed order of `trades` */
  const estimates = trades.map((t) => useBoardEstimate(t.boardId));
  const specSets = trades.map((t) => useProjectSpecs(t.boardId));
  const pipelines = React.useMemo(() => trades.map((t) => getProjectPipeline(t.boardId)), [trades]);

  const [tab, setTab] = React.useState<TabId>("estimate");
  const [optionTrade, setOptionTrade] = React.useState(activeId);

  /* the board above always drives which trade's options are on screen */
  React.useEffect(() => setOptionTrade(activeId), [activeId]);

  /* picking an element on any board opens that trade's options straight away */
  React.useEffect(() => {
    const onSelect = () => setTab("takeoff");
    window.addEventListener("wl:board-element-selected", onSelect as EventListener);
    return () => window.removeEventListener("wl:board-element-selected", onSelect as EventListener);
  }, []);

  const rows = trades.map((t, i) => ({
    trade: t,
    est: estimates[i],
    specs: specSets[i].specs,
    pipeline: pipelines[i],
    inScope: enabled.includes(t.id),
    billable: enabled.includes(t.id) && !t.priceHidden,
  }));

  const drawn = rows.filter((r) => r.est.lines.length > 0 || r.est.areaSqFt > 0 || r.est.runFt > 0);
  const projectTotal = rows.filter((r) => r.billable).reduce((s, r) => s + r.est.total, 0);
  const areaSqFt = rows.filter((r) => r.inScope).reduce((s, r) => s + (r.est.areaSqFt || 0), 0);
  const runFt = rows.filter((r) => r.inScope).reduce((s, r) => s + (r.est.runFt || 0), 0);
  const schedule = SCHEDULE.map((s) => ({ ...s, amount: Math.round((projectTotal * s.pct) / 100) }));

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-[8.5px] uppercase tracking-[0.26em] transition-colors ${
      on
        ? "border-foreground bg-foreground text-background"
        : "border-border/60 bg-background/60 text-muted-foreground hover:border-foreground hover:text-foreground"
    }`;

  const action =
    "group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[8.5px] uppercase tracking-[0.26em] text-muted-foreground backdrop-blur-md transition-colors hover:border-foreground hover:bg-foreground hover:text-background";

  const selected = rows.find((r) => r.trade.id === optionTrade) ?? rows[0];
  const specRows = rows.filter((r) => r.specs.length);
  const processRows = rows.filter((r) => r.pipeline && (r.inScope || r.est.total > 0));

  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6">
      {/* ── headline: the project, priced once ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-foreground/[0.06] to-transparent p-4 shadow-[0_22px_60px_-40px_rgba(8,12,24,0.7)] backdrop-blur-xl sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(110% 90% at 8% 0%, hsl(var(--primary) / 0.14), transparent 62%), radial-gradient(80% 70% at 100% 100%, hsl(var(--primary) / 0.08), transparent 65%)",
          }}
        />
        <div className="relative">
          <p className="text-[8.5px] uppercase tracking-[0.38em] text-muted-foreground">{title} · live take-off</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <p className="font-serif text-4xl font-light leading-none sm:text-5xl">
              {projectTotal > 0 ? money(projectTotal) : "—"}
            </p>
            <p className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
              {projectTotal > 0
                ? `${drawn.length} trade${drawn.length === 1 ? "" : "s"} drawn${
                    areaSqFt > 0 ? ` · ${Math.round(areaSqFt).toLocaleString()} sq ft` : ""
                  }${runFt > 0 ? ` · ${Math.round(runFt).toLocaleString()} lf` : ""}`
                : "Draw on any board above — each square is one foot"}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {drawn.map((r) => (
              <button key={r.trade.id} onClick={() => resetFlipBoard(r.trade.boardId)} className={action}>
                <RotateCcw className="h-3 w-3" /> Clear {r.trade.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── tabs ── */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-b border-border/50 pb-2">
        {TABS.filter((t) => (t.id === "specs" ? specRows.length > 0 : true))
          .filter((t) => (t.id === "process" ? processRows.length > 0 : true))
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b pb-0.5 text-[8.5px] uppercase tracking-[0.28em] transition-colors ${
                tab === t.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {tab === "estimate" && (
          <div className="space-y-4">
            {drawn.map((r) => {
              const base = r.est.lines.filter((l) => !l.featureId);
              const options = r.est.lines.filter((l) => l.featureId);
              const optionTotal = options.reduce((s, l) => s + l.amount, 0);

              const row = (l: (typeof r.est.lines)[number], i: number) => (
                <li
                  key={`${l.label}-${i}`}
                  className="group/line relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/45 bg-background/55 px-3 py-2.5 shadow-[0_16px_44px_-38px_rgba(8,12,24,0.7)] backdrop-blur-xl transition-colors hover:border-foreground/45"
                >
                  {l.image ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={l.image}
                      alt={l.label}
                      className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-border/50"
                    />
                  ) : (
                    <span className="h-11 w-11 shrink-0 rounded-xl bg-foreground/[0.05] ring-1 ring-border/40" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10.5px] uppercase tracking-[0.2em]">{l.label}</span>
                    <span className="block truncate text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {l.detail}
                    </span>
                  </span>
                  <span className="shrink-0 font-serif text-base font-light tabular-nums">
                    {r.trade.priceHidden ? "—" : money(l.amount)}
                  </span>
                  {isRemovableLine(l) ? (
                    <button
                      type="button"
                      title={removeLineHint(l)}
                      aria-label={removeLineHint(l)}
                      onClick={() => removeEstimateLine(r.trade.boardId, l)}
                      className="ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="ml-1 h-7 w-7 shrink-0" />
                  )}
                </li>
              );

              return (
                <section
                  key={r.trade.id}
                  className="rounded-3xl border border-border/50 bg-gradient-to-b from-foreground/[0.045] to-transparent p-3 backdrop-blur-xl sm:p-4"
                >
                  <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                    <button
                      type="button"
                      onClick={() => onActiveChange?.(r.trade.id)}
                      className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {r.trade.label}
                    </button>
                    <span className="font-serif text-xl font-light tabular-nums">
                      {r.trade.priceHidden ? "On request" : r.inScope ? money(r.est.total) : "Not in scope"}
                    </span>
                  </div>

                  {base.length > 0 && (
                    <>
                      <p className="mt-3 text-[8.5px] uppercase tracking-[0.32em] text-muted-foreground/80">
                        Built as drawn
                      </p>
                      <ul className="mt-1.5 space-y-1.5">{base.map(row)}</ul>
                    </>
                  )}

                  {options.length > 0 && (
                    <>
                      <div className="mt-3 flex items-baseline justify-between gap-3">
                        <p className="text-[8.5px] uppercase tracking-[0.32em] text-muted-foreground/80">
                          Selected options — {options.length}
                        </p>
                        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground tabular-nums">
                          {r.trade.priceHidden ? "—" : `+${money(optionTotal)}`}
                        </p>
                      </div>
                      <ul className="mt-1.5 space-y-1.5">{options.map(row)}</ul>
                    </>
                  )}

                  {!r.est.lines.length && (
                    <p className="mt-3 rounded-2xl border border-dashed border-border/60 px-3 py-2.5 text-[10px] text-muted-foreground">
                      Drawn, priced after the survey.
                    </p>
                  )}
                </section>
              );
            })}


            {!drawn.length && (
              <p className="rounded-xl border border-dashed border-border/60 px-3 py-4 text-[10px] leading-relaxed text-muted-foreground">
                Nothing drawn yet. Open a trade above and draw — pool and patio, cage, fencing, turf, planting or
                solar — and every line lands here automatically.
              </p>
            )}

            {projectTotal > 0 && (
              <div>
                <p className="text-[8.5px] uppercase tracking-[0.32em] text-muted-foreground">
                  Project payment schedule
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {schedule.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-baseline justify-between gap-3 rounded-xl border border-border/40 bg-background/40 px-3 py-2"
                    >
                      <span className="text-[9px] uppercase tracking-[0.22em]">
                        {s.label} <span className="text-muted-foreground">{s.pct}%</span>
                      </span>
                      <span className="shrink-0 font-serif text-sm font-light">{money(s.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {projectTotal > 0 && (
              <p className="text-[9px] leading-relaxed text-muted-foreground">
                All prices include delivery, installation and the product as described, turn-key at the address.
                Solar is proposed separately after the roof survey. Final figures are confirmed on the survey visit.
              </p>
            )}
          </div>
        )}

        {tab === "takeoff" && selected && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {rows.map((r) => (
                <button
                  key={r.trade.id}
                  type="button"
                  onClick={() => {
                    setOptionTrade(r.trade.id);
                    onActiveChange?.(r.trade.id);
                  }}
                  className={chip(r.trade.id === optionTrade)}
                >
                  {r.trade.label}
                </button>
              ))}
            </div>
            {/* the trade's real options panel — same catalogue, images and prices
                as Wonderlands Studio and the FLIP book */}
            <FlipBoardCalculators key={selected.trade.boardId} categoryId={selected.trade.boardId} bare />
          </div>
        )}

        {tab === "specs" && (
          <div className="space-y-5">
            {specRows.map((r) => (
              <section key={r.trade.id}>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{r.trade.label}</p>
                <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                  {r.specs.map((s) => (
                    <li
                      key={`${r.trade.id}-${s.label}`}
                      className="rounded-xl border border-border/40 bg-background/40 px-3 py-2.5 backdrop-blur-md"
                    >
                      <p className="text-[8.5px] uppercase tracking-[0.24em] text-muted-foreground">{s.label}</p>
                      <p className="mt-0.5 font-serif text-sm font-light leading-snug">{s.value}</p>
                      <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{s.why}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {tab === "process" && (
          <div className="space-y-3">
            {processRows.map((r) => (
              <details key={r.trade.id} open={r.trade.id === activeId} className="rounded-xl border border-border/40 bg-background/40 px-3 py-2">
                <summary className="cursor-pointer list-none text-[9px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground">
                  {r.trade.label}
                </summary>
                <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">{r.pipeline!.note}</p>
                <ol className="mt-2 space-y-1.5">
                  {r.pipeline!.steps.map((s) => (
                    <li key={s.step} className="flex gap-3 rounded-lg border border-border/40 px-3 py-2">
                      <span className="font-serif text-sm font-light text-muted-foreground">
                        {String(s.step).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.22em]">{s.title}</span>
                        <span className="mt-0.5 block text-[9px] leading-relaxed text-muted-foreground">
                          {s.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlipProjectDossier;
