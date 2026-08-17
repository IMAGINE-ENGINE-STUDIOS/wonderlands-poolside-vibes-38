import * as React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { boardForCategory } from "./FlipEditorBoard";
import { useFlipBoard, resetFlipBoard, type FlipBoardState } from "./flipBoardStore";
import { computeSiteEstimate, formatMoney, SITE_RATES, FENCE_RATE_PER_FT } from "@/lib/siteEstimate";
import { measureGrassLayout } from "@/components/grass/GrassDrawingBoard";
import {
  DEFAULT_ENCLOSURE_CONFIG,
  ENCLOSURE_DOORS,
  ENCLOSURE_ROOFS,
  ENCLOSURE_SCREENS,
  ENCLOSURE_TYPES,
  estimateEnclosure,
} from "@/data/screenEnclosureConfigurator";
import {
  DEFAULT_FENCE_CONFIG,
  FENCE_GATES,
  FENCE_HEIGHTS,
  FENCE_STYLES,
  estimateFence,
} from "@/data/fenceConfigurator";
import {
  DEFAULT_GRASS_CONFIG,
  GRASS_DEFAULT_LOADING,
  computeGrassEstimate,
} from "@/data/artificialGrassConfigurator";
import { getGrassPricePerSqFt } from "@/data/artificialGrassData";

/**
 * The facing leaves of a FLIP design spread: the board's tools, the live cost of
 * the drawing and the calculators / options for the discipline. Every figure is
 * read off the shared drawing in real time, so the estimate on the right-hand
 * page updates as the reader draws on the left.
 */

const PX = 10;

type Kind = ReturnType<typeof boardForCategory>["kind"];

type Takeoff = { areaSqFt: number; perimeterFt: number; linearFt: number; gates: number; doors: number };

const polyArea = (pts: { x: number; y: number }[]) => {
  if (pts.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum / 2) / (PX * PX);
};

const polyLength = (pts: { x: number; y: number }[], closed: boolean) => {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  if (closed && pts.length > 2) d += Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
  return d / PX;
};

export function measureBoard(kind: Kind, state: FlipBoardState): Takeoff {
  if (kind === "enclosure") {
    const pts = state.enclosure.points;
    const doors = Object.values(state.enclosure.features ?? {}).reduce(
      (s, list) => s + (Array.isArray(list) ? list.filter((f) => f.kind === "door").length : 0),
      0,
    );
    return {
      areaSqFt: polyArea(pts),
      perimeterFt: polyLength(pts, state.enclosure.closed),
      linearFt: polyLength(pts, state.enclosure.closed),
      gates: 0,
      doors,
    };
  }
  if (kind === "fence") {
    const pts = state.fence.points;
    return {
      areaSqFt: polyArea(pts),
      perimeterFt: polyLength(pts, state.fence.closed),
      linearFt: polyLength(pts, state.fence.closed),
      gates: state.fence.gateSegments?.length ?? 0,
      doors: 0,
    };
  }
  if (kind === "grass") {
    const t = measureGrassLayout(state.grass);
    return { areaSqFt: t.areaSqFt, perimeterFt: t.perimeterFt, linearFt: t.perimeterFt, gates: 0, doors: 0 };
  }
  const est = computeSiteEstimate(state.site);
  return {
    areaSqFt: est.poolSqFt + est.deckSqFt,
    perimeterFt: 0,
    linearFt: est.fenceLinearFt,
    gates: 0,
    doors: 0,
  };
}

type Line = { label: string; detail: string; amount: number };

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">{children}</p>
);

/* ------------------------------------------------------------------ *
 * Live estimate for whichever board the discipline uses
 * ------------------------------------------------------------------ */

type OptionState = {
  typeId: string;
  roofId: string;
  screenId: string;
  doorId: string;
  doorQty: number;
  heightId: string;
  styleId: string;
  gateId: string;
  gateQty: number;
  /** Manual override of the measured area / run, in feet */
  areaOverride: number;
  runOverride: number;
  /** Average water depth, used for volume, heating and turnover figures */
  avgDepthFt: number;
  /** Desired water temperature, °F */
  targetTempF: number;
};

const defaultOptions: OptionState = {
  typeId: DEFAULT_ENCLOSURE_CONFIG.typeId,
  roofId: DEFAULT_ENCLOSURE_CONFIG.roofId,
  screenId: DEFAULT_ENCLOSURE_CONFIG.screenId,
  doorId: ENCLOSURE_DOORS[0]?.id ?? "single-36-sl",
  doorQty: 1,
  heightId: DEFAULT_FENCE_CONFIG.heightId,
  styleId: DEFAULT_FENCE_CONFIG.styleId,
  gateId: FENCE_GATES[0]?.id ?? "",
  gateQty: 0,
  areaOverride: 0,
  runOverride: 0,
  avgDepthFt: 4.5,
  targetTempF: 86,
};

export function useBoardEstimate(categoryId: string) {
  const board = boardForCategory(categoryId);
  const state = useFlipBoard(categoryId);
  const [options, setOptions] = usePersistentState<OptionState>(`flip_board_options_${categoryId}`, defaultOptions);
  const takeoff = React.useMemo(() => measureBoard(board.kind, state), [board.kind, state]);

  const areaSqFt = Math.round(options.areaOverride > 0 ? options.areaOverride : takeoff.areaSqFt);
  const runFt = Math.round(options.runOverride > 0 ? options.runOverride : takeoff.linearFt);

  const result = React.useMemo<{ lines: Line[]; total: number; perSqFt: number }>(() => {
    if (board.kind === "enclosure") {
      const est = estimateEnclosure({
        ...DEFAULT_ENCLOSURE_CONFIG,
        typeId: options.typeId,
        roofId: options.roofId,
        screenId: options.screenId,
        doors: { [options.doorId]: Math.max(0, options.doorQty) },
        areaSqFt,
        perimeterFt: Math.round(takeoff.perimeterFt),
        screenWallFt: Math.round(takeoff.perimeterFt * 0.8),
        longestSpanFt: Math.round(Math.sqrt(Math.max(areaSqFt, 0))),
      });
      return { lines: est.lines as Line[], total: est.total, perSqFt: est.pricePerSqFt };
    }
    if (board.kind === "fence") {
      const est = estimateFence({
        ...DEFAULT_FENCE_CONFIG,
        heightId: options.heightId,
        styleId: options.styleId,
        gates: options.gateId ? { [options.gateId]: Math.max(0, options.gateQty || takeoff.gates) } : {},
        linearFt: runFt,
      });
      return { lines: est.lines as Line[], total: est.total, perSqFt: runFt > 0 ? est.total / runFt : 0 };
    }
    if (board.kind === "grass") {
      const areas = state.grass.areas.length
        ? measureGrassLayout(state.grass).areas.map((a) => ({
            id: a.id,
            grassName: a.grassName,
            grassRatePerSqFt: getGrassPricePerSqFt(a.grassName),
            areaSqFt: a.areaSqFt,
            perimeterFt: a.perimeterFt,
          }))
        : [];
      const est = computeGrassEstimate(areas, DEFAULT_GRASS_CONFIG, GRASS_DEFAULT_LOADING);
      return {
        lines: est.lines.map((l) => ({ label: l.label, detail: l.detail, amount: Math.round(l.retail) })),
        total: est.customerTotal,
        perSqFt: est.pricePerSqFt,
      };
    }
    const est = computeSiteEstimate(state.site);
    return {
      lines: est.lines,
      total: est.total,
      perSqFt: est.poolSqFt > 0 ? est.total / (est.poolSqFt + est.deckSqFt) : 0,
    };
  }, [board.kind, options, areaSqFt, runFt, takeoff.perimeterFt, takeoff.gates, state.grass, state.site]);

  const poolSqFt = React.useMemo(
    () => (board.kind === "site" ? Math.round(computeSiteEstimate(state.site).poolSqFt) : 0),
    [board.kind, state.site],
  );

  return { board, state, takeoff, areaSqFt, runFt, poolSqFt, options, setOptions, ...result };
}

/* ------------------------------------------------------------------ *
 * Tools leaf — every button for the board, printed on the facing page
 * ------------------------------------------------------------------ */

export const FlipBoardTools: React.FC<{
  categoryId: string;
  title?: string;
  onEnlarge?: () => void;
  onUpload?: () => void;
  onExpand?: () => void;
}> = ({ categoryId, title, onEnlarge, onUpload, onExpand }) => {
  const { board, takeoff, total } = useBoardEstimate(categoryId);
  const btn =
    "inline-flex items-center justify-between gap-2 border border-border/60 px-3 py-2.5 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-6 sm:p-8">
      <Eyebrow>Board tools</Eyebrow>
      <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{title ?? board.name ?? "Drawing board"}</h3>
      <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {takeoff.areaSqFt > 0
          ? `${Math.round(takeoff.areaSqFt).toLocaleString()} sq ft · ${Math.round(takeoff.linearFt).toLocaleString()} lf drawn`
          : "Draw on the facing page — each square is one foot"}
      </p>
      {total > 0 && (
        <p className="mt-1 font-serif text-3xl font-light leading-none">
          {formatMoney(total)}
          <span className="ml-2 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">as drawn</span>
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 border-t border-border/50 pt-5">
        {onEnlarge && (
          <button onClick={onEnlarge} className={btn}>
            Enlarge the board
          </button>
        )}
        {onUpload && (
          <button onClick={onUpload} className={btn}>
            Upload a plan (PDF, DXF, SVG)
          </button>
        )}
        {onExpand && (
          <button onClick={onExpand} className={btn}>
            Open the editor board
          </button>
        )}
        <button onClick={() => resetFlipBoard(categoryId)} className={btn}>
          Clear the drawing <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      <ul className="mt-auto space-y-2 border-t border-border/50 pt-4 text-[10px] leading-relaxed text-muted-foreground">
        <li>Click to set corners; double-click to close the shape.</li>
        <li>Drag any vertex to reshape — measurements follow instantly.</li>
        <li>Page turning is held while you draw, so the spread stays still.</li>
      </ul>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Cost leaf — the live cost of the drawing
 * ------------------------------------------------------------------ */

export const FlipBoardCost: React.FC<{ categoryId: string }> = ({ categoryId }) => {
  const { lines, total, perSqFt, takeoff, areaSqFt, runFt } = useBoardEstimate(categoryId);
  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-6 sm:p-8">
      <Eyebrow>Priced as drawn</Eyebrow>
      <h3 className="mt-2 font-serif text-3xl font-light leading-none">{formatMoney(total)}</h3>
      <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {areaSqFt > 0 ? `${areaSqFt.toLocaleString()} sq ft` : "No area drawn"}
        {runFt > 0 ? ` · ${runFt.toLocaleString()} lf` : ""}
        {perSqFt > 0 ? ` · $${perSqFt.toFixed(2)}/sq ft installed` : ""}
      </p>

      <ul className="mt-4 min-h-0 flex-1 overflow-hidden">
        {lines.slice(0, 9).map((l, i) => (
          <li key={`${l.label}-${i}`} className="flex items-baseline justify-between gap-3 border-t border-border/50 py-2">
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.22em]">{l.label}</span>
              <span className="block truncate text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {l.detail}
              </span>
            </span>
            <span className="shrink-0 font-serif text-base font-light">{formatMoney(l.amount)}</span>
          </li>
        ))}
        {!lines.length && (
          <li className="border-t border-border/50 py-3 text-[10px] leading-relaxed text-muted-foreground">
            Draw the plan on the facing page — the estimate builds itself line by line as you go.
          </li>
        )}
      </ul>

      <p className="mt-3 border-t border-border/50 pt-3 text-[9px] leading-relaxed text-muted-foreground">
        All prices include delivery, installation and the product as described. Final figures are confirmed on the
        survey visit.
        {takeoff.doors > 0 ? ` ${takeoff.doors} self-latching door(s) taken off the drawing.` : ""}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Calculators leaf — options and manual take-off entry
 * ------------------------------------------------------------------ */

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="border-t border-border/50 py-2">
    <p className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
    <div className="mt-1">{children}</div>
  </div>
);

const select =
  "w-full border border-border/60 bg-transparent px-2 py-1.5 text-[10px] uppercase tracking-[0.2em] focus:outline-none";

export const FlipBoardCalculators: React.FC<{ categoryId: string }> = ({ categoryId }) => {
  const { board, options, setOptions, takeoff, total, perSqFt, areaSqFt, runFt, poolSqFt } =
    useBoardEstimate(categoryId);
  const set = (patch: Partial<OptionState>) => setOptions((p) => ({ ...p, ...patch }));

  /* water volume, heater capacity and turnover, read off the drawn shell */
  const water = React.useMemo(() => {
    const sqFt = poolSqFt || (board.kind === "site" ? areaSqFt : 0);
    const depth = Math.max(0, options.avgDepthFt);
    const gallons = Math.round(sqFt * depth * 7.48);
    const rise = Math.max(0, options.targetTempF - 72);
    return {
      gallons,
      btu: gallons ? Math.round((sqFt * Math.max(rise, 10) * 12) / 1000) * 1000 : 0,
      gpm: gallons ? Math.round(gallons / 8 / 60) : 0,
    };
  }, [poolSqFt, areaSqFt, board.kind, options.avgDepthFt, options.targetTempF]);
  const stepBtn = "border border-border/60 p-1 transition-colors hover:bg-foreground hover:text-background";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-6 sm:p-8">
      <Eyebrow>Calculators & options</Eyebrow>
      <h3 className="mt-2 font-serif text-2xl font-light leading-tight">Tune the estimate</h3>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        <Row label="Measured take-off">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Area sq ft</span>
              <input
                type="number"
                min={0}
                value={options.areaOverride || Math.round(takeoff.areaSqFt) || ""}
                onChange={(e) => set({ areaOverride: Number(e.target.value) || 0 })}
                className={select}
              />
            </label>
            <label className="block">
              <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Run linear ft</span>
              <input
                type="number"
                min={0}
                value={options.runOverride || Math.round(takeoff.linearFt) || ""}
                onChange={(e) => set({ runOverride: Number(e.target.value) || 0 })}
                className={select}
              />
            </label>
          </div>
        </Row>

        {board.kind === "enclosure" && (
          <>
            <Row label="Structure">
              <select value={options.typeId} onChange={(e) => set({ typeId: e.target.value })} className={select}>
                {ENCLOSURE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Roof">
              <select value={options.roofId} onChange={(e) => set({ roofId: e.target.value })} className={select}>
                {ENCLOSURE_ROOFS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Screen">
              <select value={options.screenId} onChange={(e) => set({ screenId: e.target.value })} className={select}>
                {ENCLOSURE_SCREENS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Doors">
              <div className="flex items-center gap-2">
                <select value={options.doorId} onChange={(e) => set({ doorId: e.target.value })} className={select}>
                  {ENCLOSURE_DOORS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <button className={stepBtn} onClick={() => set({ doorQty: Math.max(0, options.doorQty - 1) })}>
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center font-serif text-base">{options.doorQty}</span>
                <button className={stepBtn} onClick={() => set({ doorQty: options.doorQty + 1 })}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </Row>
          </>
        )}

        {board.kind === "fence" && (
          <>
            <Row label="Height">
              <select value={options.heightId} onChange={(e) => set({ heightId: e.target.value })} className={select}>
                {FENCE_HEIGHTS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label} — ${h.pricePerFt}/ft
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Style">
              <select value={options.styleId} onChange={(e) => set({ styleId: e.target.value })} className={select}>
                {FENCE_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Gates">
              <div className="flex items-center gap-2">
                <select value={options.gateId} onChange={(e) => set({ gateId: e.target.value })} className={select}>
                  {FENCE_GATES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <button className={stepBtn} onClick={() => set({ gateQty: Math.max(0, options.gateQty - 1) })}>
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center font-serif text-base">{options.gateQty || takeoff.gates}</span>
                <button className={stepBtn} onClick={() => set({ gateQty: (options.gateQty || takeoff.gates) + 1 })}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </Row>
          </>
        )}

        {board.kind === "site" && (
          <>
            <Row label="Water & heating">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    Avg depth ft
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={options.avgDepthFt}
                    onChange={(e) => set({ avgDepthFt: Number(e.target.value) || 0 })}
                    className={select}
                  />
                </label>
                <label className="block">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    Target °F
                  </span>
                  <input
                    type="number"
                    min={70}
                    max={104}
                    value={options.targetTempF}
                    onChange={(e) => set({ targetTempF: Number(e.target.value) || 0 })}
                    className={select}
                  />
                </label>
              </div>
              <ul className="mt-2 space-y-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <li>{water.gallons ? `${water.gallons.toLocaleString()} gallons of water` : "Draw the shell for a volume"}</li>
                <li>{water.btu ? `Heater — ${water.btu.toLocaleString()} BTU recommended` : "Heater sized once drawn"}</li>
                <li>{water.gpm ? `Pump — ${water.gpm} gpm for an 8 hr turnover` : "Turnover sized once drawn"}</li>
              </ul>
            </Row>
            <Row label="Rate card">
              <ul className="space-y-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <li>Pool shell — ${SITE_RATES.pool}/sq ft</li>
                <li>Deck, patio, driveway — ${SITE_RATES.deck}/sq ft</li>
                <li>Pool barrier — ${FENCE_RATE_PER_FT}/linear ft</li>
              </ul>
            </Row>
          </>
        )}

        {board.kind === "grass" && (
          <Row label="Rate card">
            <ul className="space-y-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <li>Turf, base and install — from $25/sq ft</li>
              <li>Edging, drainage and infill priced from the drawn perimeter</li>
            </ul>
          </Row>
        )}

        <Row label="Running total">
          <p className="font-serif text-2xl font-light leading-none">{formatMoney(total)}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
            {areaSqFt > 0 ? `${areaSqFt.toLocaleString()} sq ft` : "Draw or enter an area"}
            {runFt > 0 ? ` · ${runFt.toLocaleString()} lf` : ""}
            {perSqFt > 0 ? ` · $${perSqFt.toFixed(2)}/sq ft` : ""}
          </p>
        </Row>
      </div>

      <p className="mt-3 border-t border-border/50 pt-3 text-[9px] leading-relaxed text-muted-foreground">
        Figures update live with the drawing. All prices include delivery, installation and the product as described.
      </p>
    </div>
  );
};
