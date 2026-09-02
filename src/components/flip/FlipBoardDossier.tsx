/**
 * FLIP Board Dossier — one consolidated panel for a drawing spread.
 *
 * It replaces the three overlapping leaves (Board tools / Priced as drawn /
 * Calculators & options), which all printed the same price and the same
 * take-off three times. The dossier prints the number ONCE in a headline bar,
 * puts the board actions in that same bar, and files the reading matter under
 * four tabs: Estimate, Take-off & options, Specifications, Process.
 */

import * as React from "react";
import { Maximize2, Upload, PenTool, RotateCcw, ChevronRight } from "lucide-react";
import {
  useBoardEstimate,
  useProjectSpecs,
  FlipBoardCalculators,
} from "./FlipBoardPanels";
import { resetFlipBoard } from "@/lib/flip/flipBoardStore";
import { getProjectPipeline } from "@/data/projectPipeline";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

type TabId = "estimate" | "takeoff" | "specs" | "process";

const TABS: { id: TabId; label: string }[] = [
  { id: "estimate", label: "Estimate" },
  { id: "takeoff", label: "Take-off & options" },
  { id: "specs", label: "Specifications" },
  { id: "process", label: "Process" },
];

export const FlipBoardDossier: React.FC<{
  categoryId: string;
  title?: string;
  onEnlarge?: () => void;
  onUpload?: () => void;
  onExpand?: () => void;
}> = ({ categoryId, title, onEnlarge, onUpload, onExpand }) => {
  const { board, lines, total, perSqFt, areaSqFt, runFt, takeoff } = useBoardEstimate(categoryId);
  const { specs, schedule } = useProjectSpecs(categoryId);
  const pipeline = React.useMemo(() => getProjectPipeline(categoryId), [categoryId]);
  const [tab, setTab] = React.useState<TabId>("estimate");

  /* Solar figures stay private — proposals follow the survey. */
  const priceHidden = board.kind === "solar";

  const action =
    "group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[8.5px] uppercase tracking-[0.26em] text-muted-foreground backdrop-blur-md transition-colors hover:border-foreground hover:bg-foreground hover:text-background";

  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6">
      {/* ── headline: the drawing, the number, the actions — printed once ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-foreground/[0.06] to-transparent p-4 backdrop-blur-xl shadow-[0_22px_60px_-40px_rgba(8,12,24,0.7)] sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(110% 90% at 8% 0%, hsl(var(--primary) / 0.14), transparent 62%), radial-gradient(80% 70% at 100% 100%, hsl(var(--primary) / 0.08), transparent 65%)",
          }}
        />
        <div className="relative">
          <p className="text-[8.5px] uppercase tracking-[0.38em] text-muted-foreground">
            {title ?? board.name ?? "Drawing board"} · live take-off
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <p className="font-serif text-4xl font-light leading-none sm:text-5xl">
              {priceHidden ? "On request" : total > 0 ? money(total) : "—"}
            </p>
            <p className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
              {priceHidden
                ? "Proposal follows the survey"
                : areaSqFt > 0
                  ? `${areaSqFt.toLocaleString()} sq ft${runFt > 0 ? ` · ${runFt.toLocaleString()} lf` : ""}${
                      perSqFt > 0 ? ` · ${money(perSqFt)}/sq ft installed` : ""
                    }`
                  : "Draw the plan above — each square is one foot"}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {onEnlarge && (
              <button onClick={onEnlarge} className={action}>
                <Maximize2 className="h-3 w-3" /> Enlarge
              </button>
            )}
            {onUpload && (
              <button onClick={onUpload} className={action}>
                <Upload className="h-3 w-3" /> Upload a plan
              </button>
            )}
            {onExpand && (
              <button onClick={onExpand} className={action}>
                <PenTool className="h-3 w-3" /> Editor board
              </button>
            )}
            <button onClick={() => resetFlipBoard(categoryId)} className={action}>
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── tabs ── */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-b border-border/50 pb-2">
        {TABS.filter((t) => (t.id === "specs" ? specs.length > 0 : true))
          .filter((t) => (t.id === "process" ? !!pipeline : true))
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
            <ul className="space-y-1.5">
              {lines.map((l, i) => (
                <li
                  key={`${l.label}-${i}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-border/40 bg-background/40 px-3 py-2 backdrop-blur-md"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.22em]">{l.label}</span>
                    <span className="block truncate text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {l.detail}
                    </span>
                  </span>
                  <span className="shrink-0 font-serif text-base font-light">{money(l.amount)}</span>
                </li>
              ))}
              {!lines.length && (
                <li className="rounded-xl border border-dashed border-border/60 px-3 py-4 text-[10px] leading-relaxed text-muted-foreground">
                  Draw the plan on the board above — the estimate builds itself line by line.
                </li>
              )}
            </ul>

            {total > 0 && !priceHidden && (
              <div>
                <p className="text-[8.5px] uppercase tracking-[0.32em] text-muted-foreground">
                  Payment schedule
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

            {!priceHidden && (
              <p className="text-[9px] leading-relaxed text-muted-foreground">
                All prices include delivery, installation and the product as described. Final figures
                are confirmed on the survey visit.
                {takeoff.doors > 0 ? ` ${takeoff.doors} self-latching door(s) taken off the drawing.` : ""}
              </p>
            )}
          </div>
        )}

        {tab === "takeoff" && (
          /* the existing option controls, without their own heading or a second
             running total — the headline bar above already carries the number */
          <FlipBoardCalculators categoryId={categoryId} bare />
        )}

        {tab === "specs" && (
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {specs.map((s) => (
              <li
                key={s.label}
                className="rounded-xl border border-border/40 bg-background/40 px-3 py-2.5 backdrop-blur-md"
              >
                <p className="text-[8.5px] uppercase tracking-[0.24em] text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 font-serif text-sm font-light leading-snug">{s.value}</p>
                <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{s.why}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === "process" && pipeline && (
          <div>
            <p className="text-[9px] leading-relaxed text-muted-foreground">{pipeline.note}</p>
            <ol className="mt-3 space-y-1.5">
              {pipeline.steps.map((s) => (
                <li
                  key={s.step}
                  className="flex gap-3 rounded-xl border border-border/40 bg-background/40 px-3 py-2"
                >
                  <span className="font-serif text-sm font-light text-muted-foreground">
                    {String(s.step).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9.5px] uppercase tracking-[0.22em]">{s.title}</span>
                    <span className="mt-0.5 block text-[9px] leading-relaxed text-muted-foreground">
                      {s.detail} — {s.duration}, {s.owner}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.28em] text-muted-foreground">
              Turn-key, one contract <ChevronRight className="h-3 w-3" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlipBoardDossier;
