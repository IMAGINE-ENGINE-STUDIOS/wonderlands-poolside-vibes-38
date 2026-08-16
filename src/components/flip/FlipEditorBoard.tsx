import * as React from "react";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { X, PenTool } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  DEFAULT_PX_PER_FT,
  type SitePlanData,
} from "@/components/blueprint/SiteDrawingBoard";

/**
 * FLIP → Editor Board.
 * The design board for the reader's current category or product, opened in the
 * same page. A wireframe is traced from all four corners while the magazine
 * fades away, then the board rises into a full-screen drafting surface.
 */

const SiteDrawingBoard = lazy(() => import("@/components/blueprint/SiteDrawingBoard"));
const FenceConfigurator = lazy(() => import("@/components/fence/FenceConfigurator"));
const EnclosureConfigurator = lazy(() => import("@/components/enclosure/EnclosureConfigurator"));
const GrassConfigurator = lazy(() => import("@/components/grass/GrassConfigurator"));

export type EditorBoardKind = "site" | "fence" | "enclosure" | "grass";

/** Which board serves each discipline. */
const BOARDS: Record<string, { kind: EditorBoardKind; name: string; note: string }> = {
  pools: { kind: "site", name: "Pool Plan Board", note: "Trace the shell, deck and property on a scaled grid." },
  "concrete-pools": { kind: "site", name: "Custom Concrete Plan Board", note: "Draw the shell freely — concrete follows the line you trace." },
  spas: { kind: "site", name: "Spa Plan Board", note: "Set the spa against the pool and read the deck area." },
  "tanning-ledges": { kind: "site", name: "Sun Shelf Board", note: "Place the ledge on plan and measure its surface." },
  saunas: { kind: "site", name: "Sauna Pad Board", note: "Lay out the pad, clearances and the walk to the cabin." },
  pavers: { kind: "site", name: "Hardscape Board", note: "Draw the field and border, measured by square foot." },
  "artificial-grass": { kind: "grass", name: "Turf Drawing Board", note: "Trace the lawn and read seams, base and cost." },
  landscaping: { kind: "site", name: "Landscape Board", note: "Beds, canopy and irrigation drawn to the property." },
  "screen-enclosures": { kind: "enclosure", name: "Enclosure Drawing Board", note: "Mansard or gable, engineered to Florida wind load." },
  "patio-fencing": { kind: "fence", name: "Fence Board", note: "Runs, gates and self-latching pool doors to code." },
  lanai: { kind: "site", name: "Lanai Board", note: "Projection, columns and the covered footprint." },
  "driveway-gates": { kind: "fence", name: "Gate Board", note: "Runs, openings and automation to the drive." },
  covers: { kind: "site", name: "Cover Board", note: "Track lines sized to the shell on plan." },
  finishes: { kind: "site", name: "Finish Board", note: "Water surface laid out against deck and coping." },
  liners: { kind: "site", name: "Liner Board", note: "Shell footprint and waterline border on plan." },
};

const FALLBACK = { kind: "site" as EditorBoardKind, name: "Design Board", note: "Draw the area on a scaled grid." };

/** Board ids may be model-scoped ("pools__milan") — the discipline is the stem. */
export const boardForCategory = (categoryId: string) =>
  BOARDS[categoryId] ?? BOARDS[categoryId.split("__")[0]] ?? FALLBACK;

type Props = {
  categoryId: string;
  categoryLabel: string;
  productName?: string;
  /** Rate carried into the enclosure board when a model is open. */
  productPrice?: number;
  onClose: () => void;
};

const emptyPlan: SitePlanData = { shapes: [], pxPerFt: DEFAULT_PX_PER_FT };

const FlipEditorBoard: React.FC<Props> = ({ categoryId, categoryLabel, productName, productPrice, onClose }) => {
  const board = boardForCategory(categoryId);
  const [traced, setTraced] = useState(false);
  const [total, setTotal] = useState(0);
  const [plan, setPlan] = usePersistentState<SitePlanData>(
    `flip_editor_board_site_${categoryId}`,
    emptyPlan,
  );
  const boardHeight = useRef<number>(0);

  /* the wireframe traces itself, then the board rises in */
  useEffect(() => {
    const t = window.setTimeout(() => setTraced(true), 780);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const height = useMemo(() => {
    if (typeof window === "undefined") return 640;
    boardHeight.current = Math.max(460, Math.round(window.innerHeight - 210));
    return boardHeight.current;
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-background">
      {/* traced wireframe — drawn from all four corners */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{ opacity: traced ? 0 : 1, transition: "opacity 700ms ease-out" }}
      >
        <g
          className="eb-trace"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
          style={{ ["--eb-len" as string]: "3600" }}
        >
          <path d="M0 0 H1000 V1000 H0 Z" />
          <path d="M40 40 H960 V960 H40 Z" />
          <path d="M0 0 L1000 1000" opacity="0.25" />
          <path d="M1000 0 L0 1000" opacity="0.25" />
          <path d="M40 500 H960" opacity="0.35" />
          <path d="M500 40 V960" opacity="0.35" />
        </g>
      </svg>

      <div
        className={`relative flex h-full flex-col ${traced ? "eb-rise" : "opacity-0"}`}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 md:px-8">
          <div className="flex items-baseline gap-3">
            <PenTool className="h-4 w-4 text-primary" />
            <p className="font-serif text-lg font-light leading-none tracking-tight text-foreground">
              {board.name}
            </p>
            <span className="hidden h-px w-8 bg-foreground/30 sm:block" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {productName ? `${categoryLabel} · ${productName}` : categoryLabel}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {total > 0 && (
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                Board estimate ${Math.round(total).toLocaleString()}
              </p>
            )}
            <button
              onClick={onClose}
              aria-label="Close the editor board"
              className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Close board <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <p className="px-5 pt-3 text-[9px] uppercase tracking-[0.35em] text-muted-foreground md:px-8">
          {board.note}
        </p>

        <div className="flex-1 overflow-auto px-3 py-4 md:px-8 md:py-6">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Preparing the board…
              </div>
            }
          >
            {board.kind === "grass" ? (
              <GrassConfigurator initialGrassName={productName} onTotalChange={setTotal} />
            ) : board.kind === "fence" ? (
              <FenceConfigurator onTotalChange={setTotal} />
            ) : board.kind === "enclosure" ? (
              <EnclosureConfigurator baseRatePerSqFt={productPrice} onTotalChange={setTotal} />
            ) : (
              <SiteDrawingBoard data={plan} onChange={setPlan} height={height} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default FlipEditorBoard;
