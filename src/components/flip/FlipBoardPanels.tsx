import * as React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { boardForCategory } from "./FlipEditorBoard";
import { useFlipBoard, resetFlipBoard, type FlipBoardState } from "./flipBoardStore";
import { computeSiteEstimate, formatMoney, SITE_RATES, FENCE_RATE_PER_FT } from "@/lib/siteEstimate";
import { measureGrassLayout } from "@/components/grass/GrassDrawingBoard";
import { measureLandscapeLayout } from "@/lib/landscape/landscapeEstimate";
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
import { TURNKEY_SCOPE } from "@/data/turnkeyScope";
import { getProjectPipeline } from "@/data/projectPipeline";

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
  if (kind === "landscape") {
    const t = measureLandscapeLayout(state.landscape);
    /* doors/gates stay zero: a planting plan has none, and the footer note reads them */
    return { areaSqFt: t.bedSqFt, perimeterFt: t.edgeFt, linearFt: t.edgeFt, gates: 0, doors: 0 };
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
    // Solar pricing is private — the flip book never prints a solar figure;
    // proposals are written after the site survey.
    if (board.kind === "solar") return { lines: [], total: 0, perSqFt: 0 };
    if (board.kind === "landscape") {
      // the planting plan prices itself: every plant is a catalog line
      const t = measureLandscapeLayout(state.landscape);
      const lines: Line[] = [
        ...t.species.map((sp) => ({
          label: sp.name,
          detail: `${sp.qty} × ${sp.size}${sp.variant ? ` — ${sp.variant}` : ""}`,
          amount: Math.round(sp.amount),
        })),
        ...(t.bedTotal
          ? [{ label: "Beds, surface & prep", detail: `${t.bedSqFt.toLocaleString()} sq ft · ${t.mulchYards} cu yd`, amount: t.bedTotal }]
          : []),
        ...(t.irrigationTotal
          ? [{ label: "Irrigation", detail: `${t.plantCount} emitters`, amount: t.irrigationTotal }]
          : []),
      ];
      return { lines, total: t.total, perSqFt: t.bedSqFt ? t.total / t.bedSqFt : 0 };
    }
    if (board.kind === "enclosure") {
      if (!areaSqFt) return { lines: [], total: 0, perSqFt: 0 };
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
      if (!runFt) return { lines: [], total: 0, perSqFt: 0 };
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
      if (!state.grass.areas.length) return { lines: [], total: 0, perSqFt: 0 };
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
  }, [
    board.kind,
    options,
    areaSqFt,
    runFt,
    takeoff.perimeterFt,
    takeoff.gates,
    state.grass,
    state.site,
    state.landscape,
  ]);

  const poolSqFt = React.useMemo(
    () => (board.kind === "site" ? Math.round(computeSiteEstimate(state.site).poolSqFt) : 0),
    [board.kind, state.site],
  );

  return { board, state, takeoff, areaSqFt, runFt, poolSqFt, options, setOptions, ...result };
}

/* ------------------------------------------------------------------ *
 * Project specifications — the engineering figures behind the price
 * ------------------------------------------------------------------ *
 * Everything here is derived from the drawing so the reader can see WHAT the
 * money buys, not just the number: excavation and spoil volumes, structural
 * concrete and steel, plumbing runs, electrical loads, water volume, heating
 * and turnover. Nothing is invented — each figure is a standard Florida
 * residential take-off rule applied to the measured geometry.
 */

export type SpecLine = { label: string; value: string; why: string };

export function useProjectSpecs(categoryId: string) {
  const { board, takeoff, areaSqFt, runFt, poolSqFt, options, total } = useBoardEstimate(categoryId);

  return React.useMemo(() => {
    const specs: SpecLine[] = [];
    const perimeter = Math.round(takeoff.perimeterFt || runFt);

    if (board.kind === "site") {
      const shell = poolSqFt || 0;
      const depth = Math.max(0, options.avgDepthFt);
      const deck = Math.max(0, areaSqFt - shell);
      const gallons = Math.round(shell * depth * 7.48);
      /* excavation goes 1 ft past the shell wall and 1 ft below the floor */
      const digCuYd = Math.round((shell * (depth + 1) * 1.15) / 27);
      const shellConcreteCuYd = Math.round(((shell + perimeter * depth) * 0.5) / 27);
      const rise = Math.max(0, options.targetTempF - 72);

      if (shell > 0) {
        specs.push({
          label: "Pool shell",
          value: `${shell.toLocaleString()} sq ft · ${depth} ft average depth`,
          why: "Shell area and depth set the shotcrete, steel and finish quantities",
        });
        specs.push({
          label: "Excavation",
          value: `${digCuYd.toLocaleString()} cu yd dug · ${Math.round(digCuYd * 1.25).toLocaleString()} cu yd spoil hauled`,
          why: "Dug 1 ft beyond the wall and 1 ft under the floor; soil swells ~25% once loose",
        });
        specs.push({
          label: "Structure",
          value: `${shellConcreteCuYd.toLocaleString()} cu yd concrete · #3 rebar at 12 in on centre`,
          why: "Engineer-sealed shell thickness for Florida residential pools",
        });
        specs.push({
          label: "Water",
          value: `${gallons.toLocaleString()} gallons · ${gallons ? Math.round(gallons / 8 / 60) : 0} gpm for an 8 hr turnover`,
          why: "Health-code turnover: the whole body of water filtered every 8 hours",
        });
        specs.push({
          label: "Heating",
          value: rise
            ? `${(Math.round((shell * Math.max(rise, 10) * 12) / 1000) * 1000).toLocaleString()} BTU to hold ${options.targetTempF}°F`
            : "No heat rise requested",
          why: "Sized on surface area and the rise above an average 72°F water temperature",
        });
        specs.push({
          label: "Plumbing & hydraulics",
          value: `${Math.max(2, Math.round(shell / 150))} returns · 2 skimmers · 2 in suction, 1.5 in return`,
          why: "Even circulation and low head loss keep the pump on its efficiency curve",
        });
        specs.push({
          label: "Electrical",
          value: "Dedicated 50 A sub-panel · GFCI · equipotential bond ring",
          why: "NEC 680 requirement for every pool, spa and wet deck in Florida",
        });
      }
      if (deck > 0) {
        specs.push({
          label: "Deck & drainage",
          value: `${deck.toLocaleString()} sq ft · 4 in compacted base · 1–2% fall away from the shell`,
          why: "Base depth and slope are what stop settlement and standing water later",
        });
      }
      if (runFt > 0) {
        specs.push({
          label: "Safety barrier",
          value: `${runFt.toLocaleString()} linear ft · 48 in minimum · self-closing, self-latching gates`,
          why: "Florida Residential Swimming Pool Safety Act (FS 515) compliance",
        });
      }
    }

    if (board.kind === "enclosure") {
      specs.push({
        label: "Enclosure footprint",
        value: `${areaSqFt.toLocaleString()} sq ft · ${perimeter.toLocaleString()} linear ft of wall`,
        why: "Drives aluminium extrusion, screen yardage and anchor count",
      });
      specs.push({
        label: "Wind load",
        value: "Engineered to 160+ mph, Risk Category II, exposure C",
        why: "Florida Building Code wind design for screened structures",
      });
      specs.push({
        label: "Anchoring",
        value: `${Math.max(4, Math.round(perimeter / 4)).toLocaleString()} anchors at 4 ft on centre into the deck beam`,
        why: "Uplift resistance is only as good as the anchor spacing and the beam it lands in",
      });
      specs.push({
        label: "Doors",
        value: `${Math.max(takeoff.doors, options.doorQty)} self-closing, self-latching door(s)`,
        why: "Required where the enclosure forms the pool barrier",
      });
    }

    if (board.kind === "fence") {
      specs.push({
        label: "Fence run",
        value: `${runFt.toLocaleString()} linear ft · posts at 6 ft on centre`,
        why: "Post spacing and footing depth carry the wind load on the panels",
      });
      specs.push({
        label: "Footings",
        value: `${Math.max(2, Math.round(runFt / 6) + 1)} concrete footings, 10 in dia × 24 in deep`,
        why: "Standard Florida footing for aluminium pool barrier posts",
      });
      specs.push({
        label: "Code",
        value: "48 in minimum height · 4 in maximum gap · no climbable rails",
        why: "Florida Residential Swimming Pool Safety Act (FS 515) compliance",
      });
    }

    if (board.kind === "grass") {
      specs.push({
        label: "Turf area",
        value: `${areaSqFt.toLocaleString()} sq ft · ${perimeter.toLocaleString()} linear ft of edge`,
        why: "Roll yardage, edging and seam count come off area and perimeter",
      });
      specs.push({
        label: "Base build-up",
        value: `3 in compacted crushed base · ${Math.round((areaSqFt * 0.25) / 27) || 1} cu yd`,
        why: "A compacted base is what keeps the turf flat and draining for years",
      });
      specs.push({
        label: "Infill & drainage",
        value: `${Math.round(areaSqFt * 1.5).toLocaleString()} lb infill · perforated drain at low points`,
        why: "Infill holds the blades upright; drainage stops odour and puddling",
      });
    }

    /* Wonderlands standard payment schedule */
    const schedule = [
      { label: "On contract", pct: 20 },
      { label: "At excavation", pct: 35 },
      { label: "At shell & equipment", pct: 40 },
      { label: "At handover", pct: 10 },
    ].map((s) => ({ ...s, amount: Math.round((total * s.pct) / 100) }));

    return { specs, schedule, total };
  }, [board.kind, takeoff, areaSqFt, runFt, poolSqFt, options, total]);
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
  const { board, lines, total, perSqFt, takeoff, areaSqFt, runFt } = useBoardEstimate(categoryId);
  const { specs, schedule } = useProjectSpecs(categoryId);
  // Solar figures are private — proposals are written after the site survey.
  const priceHidden = board.kind === "solar";
  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-6 sm:p-8">
      <Eyebrow>{priceHidden ? "Designed as drawn" : "Priced as drawn"}</Eyebrow>
      <h3 className="mt-2 font-serif text-3xl font-light leading-none">
        {priceHidden ? "On request" : formatMoney(total)}
      </h3>
      <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {priceHidden
          ? "A custom proposal follows the site survey and shade study"
          : `${areaSqFt > 0 ? `${areaSqFt.toLocaleString()} sq ft` : "No area drawn"}${runFt > 0 ? ` · ${runFt.toLocaleString()} lf` : ""}${perSqFt > 0 ? ` · $${perSqFt.toFixed(2)}/sq ft installed` : ""}`}
      </p>

      {/* Money, then the engineering that money buys, then how it is paid */}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <ul>
          {lines.map((l, i) => (
            <li
              key={`${l.label}-${i}`}
              className="flex items-baseline justify-between gap-3 border-t border-border/50 py-2"
            >
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

        {specs.length > 0 && (
          <div className="mt-5">
            <Eyebrow>Project specifications</Eyebrow>
            <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
              Taken off your drawing — this is the work and the material behind the number above.
            </p>
            <ul className="mt-2">
              {specs.map((s) => (
                <li key={s.label} className="border-t border-border/50 py-2">
                  <p className="text-[10px] uppercase tracking-[0.22em]">{s.label}</p>
                  <p className="font-serif text-sm font-light leading-snug">{s.value}</p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-muted-foreground">{s.why}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {total > 0 && (
          <div className="mt-5">
            <Eyebrow>Payment schedule</Eyebrow>
            <ul className="mt-2">
              {schedule.map((s) => (
                <li
                  key={s.label}
                  className="flex items-baseline justify-between gap-3 border-t border-border/50 py-1.5"
                >
                  <span className="text-[10px] uppercase tracking-[0.22em]">
                    {s.label} <span className="text-muted-foreground">{s.pct}%</span>
                  </span>
                  <span className="shrink-0 font-serif text-sm font-light">{formatMoney(s.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>


      {!priceHidden && (
        <p className="mt-3 border-t border-border/50 pt-3 text-[9px] leading-relaxed text-muted-foreground">
          All prices include delivery, installation and the product as described. Final figures are confirmed on the
          survey visit.
          {takeoff.doors > 0 ? ` ${takeoff.doors} self-latching door(s) taken off the drawing.` : ""}
        </p>
      )}
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

export const FlipBoardCalculators: React.FC<{ categoryId: string; bare?: boolean }> = ({
  categoryId,
  bare = false,
}) => {
  const { board, options, setOptions, takeoff, total, perSqFt, areaSqFt, runFt, poolSqFt } =
    useBoardEstimate(categoryId);
  const set = (patch: Partial<OptionState>) => setOptions((p) => ({ ...p, ...patch }));
  /* The managed pipeline for this discipline, when there is one */
  const pipeline = React.useMemo(() => getProjectPipeline(categoryId), [categoryId]);
  /**
   * Board ids can be model scoped ("pools__milan") — the discipline is the stem.
   * `holdsWater` marks the vessel disciplines: only they get water volume,
   * heater sizing, turnover and the pool rate card.
   */
  const stem = categoryId.split("__")[0];
  const holdsWater = /pool|spa|tanning|ledge|plunge/i.test(stem) && !/finish|liner/i.test(stem);



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
    <div className={bare ? "w-full" : "flex h-full w-full flex-col overflow-hidden p-6 sm:p-8"}>
      {!bare && (
        <>
          <Eyebrow>Calculators &amp; options</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">Tune the estimate</h3>
        </>
      )}

      <div className={bare ? "w-full" : "mt-3 min-h-0 flex-1 overflow-y-auto pr-1"}>
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

        {/* Water volume, heater sizing and turnover only educate a reader of a
            vessel book (pool, spa, sun shelf, cold plunge). A sauna pad, lanai,
            hardscape or landscape board must never print pool water figures. */}
        {board.kind === "site" && holdsWater && (
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
          </>
        )}

        {board.kind === "site" && (
          <Row label="Rate card">
            <ul className="space-y-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {/* Only quote the lines that belong to this discipline */}
              {holdsWater && <li>Pool shell — ${SITE_RATES.pool}/sq ft</li>}
              <li>{holdsWater ? "Deck, patio, driveway" : "Paved surface, patio, pad"} — ${SITE_RATES.deck}/sq ft</li>
              {holdsWater && <li>Pool barrier — ${FENCE_RATE_PER_FT}/linear ft</li>}
              {!holdsWater && <li>Perimeter fencing or edging — ${FENCE_RATE_PER_FT}/linear ft</li>}
            </ul>
          </Row>
        )}


        {board.kind === "grass" && (
          <Row label="Rate card">
            <ul className="space-y-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <li>Turf, base and install — from $25/sq ft</li>
              <li>Edging, drainage and infill priced from the drawn perimeter</li>
            </ul>
          </Row>
        )}

        {/* What the client actually receives. The pool turn-key scope (salt
            system, pump, shell inspections) is only truthful on a vessel; other
            disciplines get the scope that applies to their own installation. */}
        <Row label="Included turn-key, every project">
          <ul className="space-y-1">
            {(holdsWater
              ? TURNKEY_SCOPE
              : [
                  { label: "Permits & drawings", note: "Engineered drawings and county permitting" },
                  { label: "Site preparation", note: "Grading, base and clearances for the work" },
                  { label: "Delivery & installation", note: "Our own crews, one contract" },
                  { label: "Project management", note: "One point of contact to completion" },
                  { label: "Clean & handover", note: "Site cleared and the work walked with you" },
                ]
            ).map((s) => (
              <li key={s.label} className="text-[9px] leading-relaxed">
                <span className="uppercase tracking-[0.2em]">{s.label}</span>
                <span className="text-muted-foreground"> — {s.note}</span>
              </li>
            ))}
          </ul>
        </Row>


        {pipeline && (
          <Row label={`${pipeline.title} — what happens, and when`}>
            <p className="text-[9px] leading-relaxed text-muted-foreground">{pipeline.note}</p>
            <ol className="mt-1.5 space-y-1">
              {pipeline.steps.map((s) => (
                <li key={s.step} className="text-[9px] leading-relaxed">
                  <span className="uppercase tracking-[0.2em]">
                    {s.step}. {s.title}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {s.detail} ({s.duration}, {s.owner})
                  </span>
                </li>
              ))}
            </ol>
          </Row>
        )}

        {!bare && (
        <Row label={board.kind === "solar" ? "Proposal" : "Running total"}>

          {board.kind === "solar" ? (
            <>
              <p className="font-serif text-2xl font-light leading-none">On request</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                Written after the site survey and shade study
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-2xl font-light leading-none">{formatMoney(total)}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                {areaSqFt > 0 ? `${areaSqFt.toLocaleString()} sq ft` : "Draw or enter an area"}
                {runFt > 0 ? ` · ${runFt.toLocaleString()} lf` : ""}
                {perSqFt > 0 ? ` · $${perSqFt.toFixed(2)}/sq ft` : ""}
              </p>
            </>
          )}
        </Row>
        )}
      </div>

      {!bare && board.kind !== "solar" && (
        <p className="mt-3 border-t border-border/50 pt-3 text-[9px] leading-relaxed text-muted-foreground">
          Figures update live with the drawing. All prices include delivery, installation and the product as described.
        </p>
      )}
    </div>
  );
};
