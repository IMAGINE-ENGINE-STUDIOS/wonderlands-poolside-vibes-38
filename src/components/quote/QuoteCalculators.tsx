import * as React from "react";
import { X, PenTool } from "lucide-react";
import { FlipBoardCalculators, FlipBoardCost } from "@/components/flip/FlipBoardPanels";
import { boardForCategory } from "@/components/flip/FlipEditorBoard";

const FlipToolWidget = React.lazy(() => import("@/components/flip/FlipToolWidget"));

/**
 * The FLIP V7 calculators, printed in the Quote Atelier. Each discipline reads
 * its figures off the same shared drawing as the flipbook, and its design board
 * opens in an overlay above the calculator.
 */

const DISCIPLINES: { id: string; index: string; title: string; note: string }[] = [
  { id: "pools", index: "III.i", title: "Pool & site plan", note: "Shell, deck and property priced as drawn" },
  { id: "screen-enclosures", index: "III.ii", title: "Screen enclosure", note: "Mansard or gable, Florida wind load" },
  { id: "patio-fencing", index: "III.iii", title: "Aluminium fencing", note: "Runs, gates and self-latching doors" },
  { id: "artificial-grass", index: "III.iv", title: "Artificial turf", note: "Lawn area, seams and base" },
  { id: "pavers", index: "III.v", title: "Hardscape & pavers", note: "Net field area, measured by square foot" },
];

const QuoteCalculators: React.FC = () => {
  const [openBoard, setOpenBoard] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!openBoard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenBoard(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openBoard]);

  const board = openBoard ? boardForCategory(openBoard) : null;

  return (
    <div className="space-y-6">
      <div className="border-y border-foreground/15 py-5 text-center">
        <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Chapter III</p>
        <h2 className="mt-2 font-serif text-3xl font-light text-foreground">The Calculators</h2>
      </div>

      {DISCIPLINES.map((d) => (
        <section key={d.id} className="border border-foreground/15 bg-background/70 backdrop-blur-xl">
          <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/60 px-5 py-4">
            <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">{d.index}</span>
            <h3 className="font-serif text-xl font-light text-foreground md:text-2xl">{d.title}</h3>
            <p className="w-full text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{d.note}</p>
            <button
              onClick={() => setOpenBoard(d.id)}
              className="ml-auto inline-flex items-center gap-2 border border-border/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
            >
              <PenTool className="h-3 w-3" /> Design board
            </button>
          </header>
          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-b border-border/60 md:border-b-0 md:border-r">
              <FlipBoardCalculators categoryId={d.id} />
            </div>
            <FlipBoardCost categoryId={d.id} />
          </div>
        </section>
      ))}

      <p className="text-center text-[8px] uppercase tracking-[0.35em] text-muted-foreground">
        All prices include delivery, installation and the product as described
      </p>

      {openBoard && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-background/95 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Design board</p>
              <h3 className="font-serif text-xl font-light">{board?.name}</h3>
            </div>
            <button
              onClick={() => setOpenBoard(null)}
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
              <FlipToolWidget categoryId={openBoard} part="board" />
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteCalculators;
