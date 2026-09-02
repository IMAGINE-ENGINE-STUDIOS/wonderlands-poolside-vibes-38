import * as React from "react";
import { Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";
import { Maximize2, Upload, X, Loader2 } from "lucide-react";
import { boardForCategory } from "./FlipEditorBoard";
import { useFlipBoard, setFlipBoardValue, useFlipLock } from "./flipBoardStore";
import { FlipBoardTools, FlipBoardCost, FlipBoardCalculators, useBoardEstimate } from "./FlipBoardPanels";
import {
  DEFAULT_PX_PER_FT,
  type SiteLayerId,
  type SitePlanData,
} from "@/components/blueprint/SiteDrawingBoard";
import { computeSiteEstimate, formatMoney } from "@/lib/siteEstimate";
import { registerGeniusDesignAgent, resizeSitePlanPool } from "@/lib/geniusDesignBus";
import { buildProductSitePlan } from "@/lib/productSitePlan";
import {
  fitShapesToBox,
  guessSiteLayer,
  importBlueprintFile,
} from "@/lib/blueprintImport";
import type { EnclosureLayout, EnclosureTakeoff } from "@/components/enclosure/EnclosureDrawingBoard";
import type { FenceLayout } from "@/components/fence/FenceDrawingBoard";
import type { GrassLayout, GrassTakeoff } from "@/components/grass/GrassDrawingBoard";

/**
 * The live design widget printed on a dossier page — the real drawing board for
 * the discipline (enclosure, fence, turf or site plan), not a picture of one.
 * Drawings persist per category, price and dimensions are read off the drawing
 * as it is made, and the board can be enlarged full screen with plan upload.
 */

const SiteDrawingBoard = lazy(() => import("@/components/blueprint/SiteDrawingBoard"));
const FenceDrawingBoard = lazy(() => import("@/components/fence/FenceDrawingBoard"));
const EnclosureDrawingBoard = lazy(() => import("@/components/enclosure/EnclosureDrawingBoard"));
const GrassDrawingBoard = lazy(() => import("@/components/grass/GrassDrawingBoard"));
const SolarCalculatorBoard = lazy(() => import("@/components/solar/SolarCalculatorBoard"));
/** The facing leaf of the solar spread — the whole panel/storage/racking collection. */
const SolarOptionsLeaf = lazy(() => import("@/components/solar/SolarOptionsLeaf"));

const emptySite: SitePlanData = { shapes: [], pxPerFt: DEFAULT_PX_PER_FT };
const emptyEnclosure: EnclosureLayout = { points: [], closed: false, features: {} };
const emptyFence: FenceLayout = { points: [], closed: false, gateSegments: [] };
const emptyGrass: GrassLayout = { areas: [] };

/** The layer armed first, per discipline — a pool dossier starts on the pool. */
const DEFAULT_LAYER: Record<string, SiteLayerId> = {
  pools: "pool",
  spas: "pool",
  "tanning-ledges": "pool",
  finishes: "pool",
  liners: "pool",
  pavers: "deck",
  lanai: "patio",
  covers: "pool",
  "driveway-gates": "driveway",
  landscaping: "gravel",
};

type Props = {
  categoryId: string;
  /** Expand into the full-screen Editor Board */
  onExpand?: () => void;
  /**
   * Which leaf of the design spread this is:
   *  - "board" (default) — the live drawing board
   *  - "tools" — every button and tool for the board
   *  - "cost" — the live cost of the drawing
   *  - "options" — calculators and options
   */
  part?: "board" | "board-left" | "board-right" | "tools" | "cost" | "options";
  /** The model the dossier is about — its board opens drawn to its dimensions */
  modelName?: string;
  /** The model's meta line, read for published dimensions ("14' x 30'") */
  modelMeta?: string;
};

const FlipToolWidget: React.FC<Props> = ({ categoryId, onExpand, part = "board", modelName, modelMeta }) => {
  const board = boardForCategory(categoryId);
  const [readout, setReadout] = useState<string>("");
  const [full, setFull] = useState(false);
  const [importing, setImporting] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* one shared drawing per model (or per discipline when no model is named), so
     the board, cost sheet and calculators of that dossier all agree */
  const boardId = modelName ? `${categoryId}__${modelName.toLowerCase().replace(/\s+/g, "-")}` : categoryId;
  const shared = useFlipBoard(boardId);
  const site = shared.site;
  const enclosure = shared.enclosure;
  const fence = shared.fence;
  const grass = shared.grass;
  const grassId = shared.grassId;

  /* the board is never blank: the product is drawn to its published dimensions
     on the 2D studio grid the first time the dossier is opened */
  React.useEffect(() => {
    if (board.kind !== "site" || site.shapes.length) return;
    const seeded = buildProductSitePlan({ categoryId, modelName, meta: modelMeta });
    if (seeded) setFlipBoardValue(boardId, { site: seeded });
  }, [board.kind, site.shapes.length, categoryId, modelName, modelMeta, boardId]);

  const setSite = useCallback(
    (next: SitePlanData) => setFlipBoardValue(boardId, { site: next }),
    [boardId],
  );
  const setEnclosure = useCallback(
    (next: EnclosureLayout) => setFlipBoardValue(boardId, { enclosure: next }),
    [boardId],
  );
  const setFence = useCallback(
    (next: FenceLayout) => setFlipBoardValue(boardId, { fence: next }),
    [boardId],
  );
  const setGrass = useCallback(
    (next: GrassLayout) => setFlipBoardValue(boardId, { grass: next }),
    [boardId],
  );
  const setGrassId = useCallback(
    (next: string) => setFlipBoardValue(boardId, { grassId: next }),
    [boardId],
  );

  const onEnclosureMeasure = useCallback((t: EnclosureTakeoff) => {
    setReadout(
      t.areaSqFt > 0
        ? `${Math.round(t.areaSqFt).toLocaleString()} sq ft footprint · ${Math.round(t.perimeterFt)} lf perimeter`
        : "",
    );
  }, []);
  const onFenceMeasure = useCallback((linearFt: number, gates: number) => {
    setReadout(linearFt > 0 ? `${Math.round(linearFt).toLocaleString()} linear ft · ${gates} gate${gates === 1 ? "" : "s"}` : "");
  }, []);
  const onGrassMeasure = useCallback((t: GrassTakeoff) => {
    setReadout(t.areaSqFt > 0 ? `${Math.round(t.areaSqFt).toLocaleString()} sq ft of turf` : "");
  }, []);

  /* ---------------- pricing & dimensions, read off the site plan ---------------- */
  const estimate = useMemo(() => computeSiteEstimate(site), [site]);
  const siteReadout = useMemo(() => {
    const bits: string[] = [];
    if (estimate.poolDims) bits.push(`${estimate.poolDims.widthFt}′ × ${estimate.poolDims.lengthFt}′ pool`);
    if (estimate.poolSqFt) bits.push(`${estimate.poolSqFt.toLocaleString()} sq ft water`);
    if (estimate.deckSqFt) bits.push(`${estimate.deckSqFt.toLocaleString()} sq ft deck`);
    if (estimate.fenceLinearFt) bits.push(`${estimate.fenceLinearFt.toLocaleString()} lf barrier`);
    return bits.join(" · ");
  }, [estimate]);

  const isSite = board.kind === "site";

  /* ---------------- Genius may design this board out loud ---------------- */
  const siteRef = React.useRef(site);
  siteRef.current = site;
  const estimateRef = React.useRef(estimate);
  estimateRef.current = estimate;
  const readoutRef = React.useRef(siteReadout);
  readoutRef.current = siteReadout;

  React.useEffect(() => {
    if (part !== "board" && part !== "board-left") return;
    return registerGeniusDesignAgent({
      id: boardId,
      label: modelName ? `${modelName} plan` : `${categoryId} board`,
      kind: board.kind as "site" | "enclosure" | "fence" | "grass",
      describe: () => {
        const total = estimateRef.current.total;
        const dims = readoutRef.current;
        if (!dims) return "The board is still blank — tell me a size, or draw the shape and I will price it.";
        return `${dims}${total ? ` — ${formatMoney(total)} installed` : ""}.`;
      },
      resize: (widthFt, lengthFt) => {
        if (board.kind !== "site") return null;
        const next = resizeSitePlanPool(siteRef.current, widthFt, lengthFt);
        if (!next) return "There is no pool shape on this board yet — say redraw it and I will start from the model.";
        setFlipBoardValue(boardId, { site: next });
        return `Drawn at ${widthFt}′ × ${lengthFt}′. The cost sheet on the facing leaf follows the drawing.`;
      },
      clear: () => {
        if (board.kind !== "site") return null;
        setFlipBoardValue(boardId, { site: { shapes: [], pxPerFt: siteRef.current.pxPerFt } });
        return "Board cleared. Give me a size and I will draw it again.";
      },
      reset: () => {
        if (board.kind !== "site") return null;
        const seeded = buildProductSitePlan({ categoryId, modelName, meta: modelMeta });
        if (!seeded) return "There is no published drawing for this one — draw it and I will price it.";
        setFlipBoardValue(boardId, { site: seeded });
        return `${modelName ?? "The plan"} is back at its published dimensions.`;
      },
    });
  }, [board.kind, boardId, categoryId, modelName, modelMeta, part]);


  /* ------------------------------- plan upload ------------------------------- */
  const handleUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setImporting("Reading the plan…");
      try {
        const drawing = await importBlueprintFile(file);
        const page = drawing.rasterPages[0];
        let next: SitePlanData = { ...site };

        if (page) {
          next = {
            ...next,
            underlay: {
              dataUrl: page.dataUrl,
              x: 0,
              y: 0,
              scale: Math.min(1180 / page.widthPx, 720 / page.heightPx),
              opacity: 0.7,
              visible: true,
              locked: false,
              label: page.label || drawing.fileName,
              naturalWidth: page.widthPx,
              naturalHeight: page.heightPx,
            },
          };
        }

        if (drawing.vectorShapes.length) {
          const fitted = fitShapesToBox(drawing.vectorShapes, { width: 1180, height: 720, padding: 40 });
          next = {
            ...next,
            shapes: [
              ...next.shapes,
              ...fitted.shapes.map((s, i) => ({
                id: `imp-${Date.now()}-${i}`,
                layer: guessSiteLayer(s.sourceLayer) as SiteLayerId,
                points: s.points,
                closed: s.closed,
                importedFrom: drawing.fileName,
              })),
            ],
          };
        }

        setSite(next);
        setImporting(
          drawing.vectorShapes.length
            ? `${drawing.vectorShapes.length} shapes imported — every vertex is editable.`
            : "Sheet placed behind the grid — trace over it, then calibrate the scale.",
        );
      } catch (err) {
        setImporting(err instanceof Error ? err.message : "That file could not be read.");
      }
    },
    [site, setSite],
  );

  /* the live price of the drawing — the same figure the cost leaf prints */
  const { total: boardTotal } = useBoardEstimate(boardId);
  const livePrice = isSite ? estimate.total : boardTotal;


  const headerBlock = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          {(isSite ? siteReadout : readout) || "Draw on the grid — 1 ft squares"}
        </p>
        {livePrice > 0 && (
          <p className="mt-1 font-serif text-lg font-light leading-none">
            {formatMoney(livePrice)}
            <span className="ml-2 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              as drawn — installed
            </span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFull(true)}
          className="inline-flex items-center gap-2 border border-border/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
        >
          Enlarge <Maximize2 className="h-3 w-3" />
        </button>
        {onExpand && (
          <button
            onClick={onExpand}
            className="inline-flex items-center gap-2 border border-border/60 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
          >
            Editor board
          </button>
        )}
      </div>
    </div>
  );

  const renderBoard = useCallback(
    (header: React.ReactNode, fullScreen?: boolean, mapOnly?: boolean) => {
      if (board.kind === "solar")
        return (
          <div className="space-y-3">
            {header}
            <SolarCalculatorBoard height={fullScreen ? 560 : 380} mapOnly={mapOnly} />
          </div>
        );
      if (board.kind === "enclosure")
        return (

          <EnclosureDrawingBoard
            layout={enclosure}
            onChange={setEnclosure}
            onMeasure={onEnclosureMeasure}
            header={header}
          />
        );
      if (board.kind === "fence")
        return <FenceDrawingBoard layout={fence} onChange={setFence} onMeasure={onFenceMeasure} header={header} />;
      if (board.kind === "grass")
        return (
          <GrassDrawingBoard
            layout={grass}
            onChange={setGrass}
            onMeasure={onGrassMeasure}
            activeGrassId={grassId}
            onActiveGrassChange={setGrassId}
            header={header}
          />
        );
      return (
        <SiteDrawingBoard
          data={site}
          onChange={setSite}
          header={header}
          defaultLayer={DEFAULT_LAYER[categoryId] ?? "pool"}
          menuSide={!fullScreen}
          onRequestImport={fullScreen ? () => fileRef.current?.click() : undefined}
        />
      );
    },
    [
      board.kind,
      enclosure,
      setEnclosure,
      onEnclosureMeasure,
      fence,
      setFence,
      onFenceMeasure,
      grass,
      setGrass,
      onGrassMeasure,
      grassId,
      setGrassId,
      site,
      setSite,
      categoryId,
    ],
  );

  const fallback = (
    <div className="flex h-40 items-center justify-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
      Preparing the board…
    </div>
  );

  /* the facing leaves of the spread — tools, live cost, calculators */
  const panel =
    part === "tools" ? (
      <FlipBoardTools
        categoryId={boardId}
        onEnlarge={() => setFull(true)}
        onUpload={() => fileRef.current?.click()}
        onExpand={onExpand}
      />
    ) : part === "cost" ? (
      <FlipBoardCost categoryId={boardId} />
    ) : part === "options" ? (
      <FlipBoardCalculators categoryId={boardId} />
    ) : null;

  /* every design leaf is interactive, so the flipbook must never receive the
     pointer: page turning is held and drags/clicks stop at the leaf */
  const { lock, unlock } = useFlipLock();

  /**
   * The Total Solar Calculator owns the whole leaf: it holds a live map that
   * consumes drag, scroll and arrow keys. So the moment the reader arrives the
   * book is locked and it stays locked while the tool is on screen — page turns
   * happen only through the arrow buttons. Turning away unmounts the widget,
   * which releases the lock, and coming back locks it again.
   */
  const holdsBookStill = board.kind === "solar";
  React.useEffect(() => {
    if (holdsBookStill) lock();
  }, [holdsBookStill, lock]);

  const lockHandlers = {
    onPointerEnter: lock,
    onPointerLeave: holdsBookStill ? undefined : unlock,
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onMouseUp: (e: React.MouseEvent) => e.stopPropagation(),
    onMouseMove: (e: React.MouseEvent) => e.stopPropagation(),
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
    onTouchMove: (e: React.TouchEvent) => e.stopPropagation(),
    onTouchEnd: (e: React.TouchEvent) => e.stopPropagation(),
  };

  /**
   * A drawing spread mounts the live board only once, on the right leaf. The left
   * leaf is a static plate (title, readout, live price, enlarge button). Two
   * copies of the same interactive board were fighting each other — duplicating
   * maps, address bars, tile fetchers and stores — so now one board instance
   * serves the whole spread.
   */
  const half = part === "board-left" ? "left" : part === "board-right" ? "right" : null;

  /* The live leaf: the drawing board, mounted once per spread. Every design
     spread now follows the solar division — the live board (plus its header and
     tools) takes the LEFT leaf, and the facing leaf carries the reading matter:
     board tools, the live cost sheet and the calculators. */
  const boardLeaf = (mapOnly?: boolean) => (
    <div className="absolute inset-0 overflow-auto" {...lockHandlers}>
      <div className="flex h-full w-full flex-col p-3 sm:p-4">
        <Suspense fallback={fallback}>{renderBoard(headerBlock, false, mapOnly)}</Suspense>
      </div>
    </div>
  );

  const solarOptionsLeaf = (
    <div className="absolute inset-0" {...lockHandlers}>
      <div className="flex h-full w-full flex-col p-3 sm:p-4">
        <Suspense fallback={fallback}>
          <SolarOptionsLeaf />
        </Suspense>
      </div>
    </div>
  );

  /**
   * The facing leaf of a drawing spread: everything about the drawing that is
   * read rather than drawn. It replaces the old near-empty static plate, which
   * left half the spread looking broken.
   */
  const facingLeaf = (
    <div className="absolute inset-0 overflow-hidden" {...lockHandlers}>
      <FlipBoardDossier
        categoryId={boardId}
        title={modelName}
        onEnlarge={() => setFull(true)}
        onUpload={() => fileRef.current?.click()}
        onExpand={onExpand}
      />
    </div>
  );

  const isSolar = board.kind === "solar";

  const halfBody =
    half === "left" ? (
      <>{boardLeaf(isSolar)}</>
    ) : (
      <>
        {isSolar ? solarOptionsLeaf : facingLeaf}

        {/* Flip margin: the outer edge of the leaf stays a page, not a canvas, so
            the reader can still grab the corner and turn instead of only using the
            arrows. Entering it releases the drawing lock. */}
        {!holdsBookStill && (
          <div
            onPointerEnter={unlock}
            title="Drag here to turn the page"
            className="absolute inset-y-0 right-0 z-20 w-9 cursor-pointer"
          />
        )}
      </>
    );

  return (
    <div className={half ? "relative h-full w-full overflow-hidden" : "flex min-h-0 flex-1 flex-col"}>
      {half ? (
        halfBody
      ) : (
        <div className="min-h-0 flex-1 overflow-auto" {...lockHandlers}>
          {panel ?? <Suspense fallback={fallback}>{renderBoard(headerBlock)}</Suspense>}
        </div>
      )}





      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.dxf,.svg,image/*"
        className="hidden"
        onChange={(e) => {
          void handleUpload(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {full && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-background animate-fade-in">
          <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-3">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Wonderlands World — Design board
              </p>
              <p className="mt-1 truncate font-serif text-xl font-light leading-none">
                {(isSite ? siteReadout : readout) || "Draw the plan — 1 ft grid"}
                {isSite && estimate.total > 0 ? ` — ${formatMoney(estimate.total)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
              >
                {importing === "Reading the plan…" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Upload plan
              </button>
              {onExpand && (
                <button
                  onClick={() => {
                    setFull(false);
                    onExpand();
                  }}
                  className="border border-border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
                >
                  Editor board
                </button>
              )}
              <button
                onClick={() => setFull(false)}
                aria-label="Close the board"
                className="border border-border p-2 transition-colors hover:bg-foreground hover:text-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4 lg:flex-row">
            <div className="min-h-0 flex-1">
              <Suspense fallback={fallback}>{renderBoard(null, true)}</Suspense>
              {importing && (
                <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{importing}</p>
              )}
            </div>

            {isSite && (
              <aside className="w-full shrink-0 border-t border-border/60 pt-3 lg:w-80 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Priced as drawn</p>
                <h4 className="mt-2 font-serif text-2xl font-light leading-none">{formatMoney(estimate.total)}</h4>
                {estimate.poolDims && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {estimate.poolDims.widthFt}′ × {estimate.poolDims.lengthFt}′ · {estimate.poolSqFt.toLocaleString()} sq ft
                  </p>
                )}
                <ul className="mt-4">
                  {estimate.lines.map((l) => (
                    <li key={l.label} className="flex items-baseline justify-between gap-3 border-t border-border/50 py-2">
                      <span className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.22em]">{l.label}</span>
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                          {l.detail}
                        </span>
                      </span>
                      <span className="shrink-0 font-serif text-base font-light">{formatMoney(l.amount)}</span>
                    </li>
                  ))}
                  {!estimate.lines.length && (
                    <li className="border-t border-border/50 py-3 text-[10px] leading-relaxed text-muted-foreground">
                      Draw the pool, deck and barrier — the estimate builds itself as you go.
                    </li>
                  )}
                </ul>
                <p className="mt-4 border-t border-border/50 pt-3 text-[9px] leading-relaxed text-muted-foreground">
                  All prices include delivery, installation and the product as described. Final figures are confirmed on
                  the survey visit.
                </p>
              </aside>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipToolWidget;
