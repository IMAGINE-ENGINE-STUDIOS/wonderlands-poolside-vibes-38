import * as React from "react";
import { X, PenTool, Maximize2 } from "lucide-react";
import { FlipBoardCalculators, FlipBoardCost, FlipBoardTools } from "@/components/flip/FlipBoardPanels";
import { boardForCategory } from "@/components/flip/FlipEditorBoard";

import CustomerProjectSummary from "@/components/quote/CustomerProjectSummary";
import type { ConfiguredProduct } from "@/components/quote/QuoteStudioConfigurator";

const FlipToolWidget = React.lazy(() => import("@/components/flip/FlipToolWidget"));

/**
 * The FLIP V7 calculators. Every figure is read off the same shared drawing as
 * the flipbook, and each discipline can add its design board as a section on the
 * page or open it full screen above the calculator.
 */

export type CalculatorDiscipline = {
  id: string;
  index: string;
  title: string;
  note: string;
};

export const CALCULATOR_DISCIPLINES: CalculatorDiscipline[] = [
  /* Renamed from "Pool & site plan": the leaf now opens with the narrated
     customer project summary, fed by the configurator, the shopping list and
     the drawn take-off. */
  { id: "pools", index: "III.i", title: "Customer project summary", note: "Your project, priced and explained as drawn" },
  { id: "screen-enclosures", index: "III.ii", title: "Screen enclosure", note: "Mansard or gable, Florida wind load" },
  { id: "patio-fencing", index: "III.iii", title: "Aluminium fencing", note: "Runs, gates and self-latching doors" },
  { id: "artificial-grass", index: "III.iv", title: "Artificial turf", note: "Lawn area, seams, base and infill" },
  { id: "pavers", index: "III.v", title: "Hardscape & pavers", note: "Net field area, measured by square foot" },
];

/** Which calculator belongs to a console category. */
export const disciplineForCategory = (categoryId?: string): CalculatorDiscipline => {
  const stem = (categoryId ?? "pools").split("__")[0];
  const exact = CALCULATOR_DISCIPLINES.find((d) => d.id === stem);
  if (exact) return exact;
  const kind = boardForCategory(stem).kind;
  const byKind =
    kind === "enclosure"
      ? "screen-enclosures"
      : kind === "fence"
        ? "patio-fencing"
        : kind === "grass"
          ? "artificial-grass"
          : "pools";
  const found = CALCULATOR_DISCIPLINES.find((d) => d.id === byKind)!;
  return { ...found, id: stem };
};

const Section: React.FC<{
  discipline: CalculatorDiscipline;
  onFullScreen: (id: string) => void;
  /** The piece open in the configurator — feeds the narrated summary. */
  product?: ConfiguredProduct | null;
  /** Print the narrated customer project summary at the head of the leaf. */
  withSummary?: boolean;
}> = ({ discipline: d, onFullScreen, product, withSummary }) => {
  const [boardSection, setBoardSection] = React.useState(false);
  const board = boardForCategory(d.id);


  return (
    <section className="border border-foreground/15 bg-background/70 backdrop-blur-xl">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-border/60 px-5 py-4">
        <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">{d.index}</span>
        <h3 className="font-serif text-xl font-light text-foreground md:text-2xl">{d.title}</h3>
        <p className="w-full text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{d.note}</p>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={() => setBoardSection((v) => !v)}
            className="inline-flex items-center gap-2 border border-border/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
          >
            <PenTool className="h-3 w-3" />
            {boardSection ? "Hide design board" : "Add design board"}
          </button>
          <button
            onClick={() => onFullScreen(d.id)}
            className="inline-flex items-center gap-2 border border-border/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
          >
            <Maximize2 className="h-3 w-3" /> Full screen
          </button>
        </div>
      </header>

      {boardSection && (
        <div className="grid gap-0 border-b border-border/60 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-h-[420px] border-b border-border/60 lg:border-b-0 lg:border-r">
            <React.Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                  Preparing {board.name}…
                </div>
              }
            >
              <FlipToolWidget categoryId={d.id} part="board" />
            </React.Suspense>
          </div>
          <FlipBoardTools categoryId={d.id} onEnlarge={() => onFullScreen(d.id)} />
        </div>
      )}

      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-border/60 md:border-b-0 md:border-r">
          <FlipBoardCalculators categoryId={d.id} />
        </div>
        <FlipBoardCost categoryId={d.id} />
      </div>
    </section>
  );
};

type Props = {
  /** Show one discipline only — the one the selected product belongs to. */
  only?: CalculatorDiscipline;
  /** Chapter heading, printed in the showroom and on the full set. */
  heading?: string;
  eyebrow?: string;
};

const QuoteCalculators: React.FC<Props> = ({ only, heading = "The Calculators", eyebrow = "Chapter III" }) => {
  const [full, setFull] = React.useState<string | null>(null);
  const disciplines = only ? [only] : CALCULATOR_DISCIPLINES;

  React.useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [full]);

  return (
    <div className="space-y-6">
      <div className="border-y border-foreground/15 py-5 text-center">
        <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-light text-foreground">{heading}</h2>
      </div>

      {disciplines.map((d) => (
        <Section key={d.id} discipline={d} onFullScreen={setFull} />
      ))}

      <p className="text-center text-[8px] uppercase tracking-[0.35em] text-muted-foreground">
        All prices include delivery, installation and the product as described
      </p>

      {full && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-background/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 md:px-5">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Design board</p>
              <h3 className="truncate font-serif text-xl font-light">{boardForCategory(full).name}</h3>
            </div>
            <button
              onClick={() => setFull(null)}
              className="inline-flex items-center gap-2 border border-border/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
            >
              Close <X className="h-3 w-3" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <React.Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                  Preparing the board…
                </div>
              }
            >
              <FlipToolWidget categoryId={full} part="board" />
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteCalculators;
