/**
 * GLOBAL DESIGN BOARD — one project, every trade.
 *
 * The global board does not invent a new data model. It reads and writes the
 * same shared board state (`flipBoardStore`) the FLIP spreads and the individual
 * drawing boards use, under the single discipline id `global-design`, and it
 * prices each trade with that trade's own production pricing model:
 *
 *   site / studio       computeSiteEstimate       ($280 sq ft shell, $10 deck …)
 *   screen enclosure    estimateEnclosure         (Florida wind-load configurator)
 *   fencing / gates     estimateFence             (height × style × gates)
 *   artificial turf     computeGrassEstimate      (product, base, seams, loading)
 *   planting            measureLandscapeLayout    (catalog plants + beds)
 *   solar               private                   (proposal written after survey)
 *
 * One click then loads the project into blueprint mode: the site geometry, the
 * measured existing areas and a scope of work assembled from every priced trade
 * are written into the Blueprint Builder's own cache key, so the builder opens
 * already filled in.
 */

import { cacheFlush, cacheWrite } from "@/lib/uiCache";
import { measureSitePlan, DEFAULT_PX_PER_FT, type SitePlanData } from "@/components/blueprint/SiteDrawingBoard";
import { computeSiteEstimate, formatMoney } from "@/lib/siteEstimate";
import type { FlipBoardState } from "@/components/flip/flipBoardStore";
import { measureLandscapeLayout } from "@/lib/landscape/landscapeEstimate";
import { measureGrassLayout } from "@/components/grass/GrassDrawingBoard";
import { getGrassPricePerSqFt } from "@/data/artificialGrassData";
import {
  DEFAULT_GRASS_CONFIG,
  GRASS_DEFAULT_LOADING,
  computeGrassEstimate,
} from "@/data/artificialGrassConfigurator";
import { DEFAULT_ENCLOSURE_CONFIG, ENCLOSURE_DOORS, estimateEnclosure } from "@/data/screenEnclosureConfigurator";
import { DEFAULT_FENCE_CONFIG, FENCE_GATES, estimateFence } from "@/data/fenceConfigurator";

/** The one discipline id the global board shares with every FLIP spread. */
export const GLOBAL_BOARD_ID = "global-design";

export type TradeId = "site" | "enclosure" | "fence" | "grass" | "landscape" | "solar";

export interface GlobalProjectMeta {
  title: string;
  clientName: string;
  address: string;
  cityStateZip: string;
  jobNumber: string;
  notes: string;
  /** Trades switched on for this property */
  trades: TradeId[];
}

export const DEFAULT_GLOBAL_META: GlobalProjectMeta = {
  title: "WONDERLANDS MASTER PLAN",
  clientName: "",
  address: "",
  cityStateZip: "",
  jobNumber: "00001",
  notes: "",
  trades: ["site", "enclosure", "fence", "grass", "landscape"],
};

export interface TradeEstimate {
  id: TradeId;
  label: string;
  lines: { label: string; detail: string; amount: number }[];
  total: number;
  /** One-line take-off summary printed on the trade card */
  readout: string;
  /** Pricing withheld from the customer-facing sheet (solar proposals) */
  priv?: boolean;
}

const polyLength = (pts: { x: number; y: number }[], closed: boolean, px: number) => {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  if (closed && pts.length > 2) d += Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
  return d / px;
};

const polyArea = (pts: { x: number; y: number }[], px: number) => {
  if (pts.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum / 2) / (px * px);
};

/** Every trade on the board, priced with its own model. */
export function computeGlobalEstimate(state: FlipBoardState): TradeEstimate[] {
  const out: TradeEstimate[] = [];

  /* ---------------------------- site / studio ---------------------------- */
  const site = computeSiteEstimate(state.site);
  out.push({
    id: "site",
    label: "Site plan & pool studio",
    lines: site.lines,
    total: site.total,
    readout: [
      site.poolDims ? `${site.poolDims.widthFt}′ × ${site.poolDims.lengthFt}′ pool` : "",
      site.poolSqFt ? `${Math.round(site.poolSqFt).toLocaleString()} sq ft water` : "",
      site.deckSqFt ? `${Math.round(site.deckSqFt).toLocaleString()} sq ft deck` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  });

  /* --------------------------- screen enclosure --------------------------- */
  const encPts = state.enclosure.points;
  const encArea = polyArea(encPts, 10);
  const encPerim = polyLength(encPts, state.enclosure.closed, 10);
  const doors = Object.values(state.enclosure.features ?? {}).reduce(
    (s, list) => s + (Array.isArray(list) ? list.filter((f) => f.kind === "door").length : 0),
    0,
  );
  const enc = estimateEnclosure({
    ...DEFAULT_ENCLOSURE_CONFIG,
    doors: { [ENCLOSURE_DOORS[0]?.id ?? "single-36-sl"]: Math.max(doors, encArea ? 1 : 0) },
    areaSqFt: Math.round(encArea),
    perimeterFt: Math.round(encPerim),
    screenWallFt: Math.round(encPerim * 0.8),
    longestSpanFt: Math.round(Math.sqrt(Math.max(encArea, 0))),
  });
  out.push({
    id: "enclosure",
    label: "Screen enclosure & lanai",
    lines: enc.lines as TradeEstimate["lines"],
    total: encArea ? enc.total : 0,
    readout: encArea
      ? `${Math.round(encArea).toLocaleString()} sq ft under screen · ${Math.round(encPerim)} lf · ${doors} door${doors === 1 ? "" : "s"}`
      : "",
  });

  /* -------------------------------- fencing -------------------------------- */
  const fencePts = state.fence.points;
  const runFt = polyLength(fencePts, state.fence.closed, 10);
  const gates = state.fence.gateSegments?.length ?? 0;
  const fence = estimateFence({
    ...DEFAULT_FENCE_CONFIG,
    gates: gates ? { [FENCE_GATES[0]?.id ?? ""]: gates } : {},
    linearFt: Math.round(runFt),
  });
  out.push({
    id: "fence",
    label: "Fencing & gates",
    lines: fence.lines as TradeEstimate["lines"],
    total: runFt ? fence.total : 0,
    readout: runFt ? `${Math.round(runFt).toLocaleString()} lf · ${gates} self-latching gate${gates === 1 ? "" : "s"}` : "",
  });

  /* ------------------------------ turf ------------------------------ */
  const turf = measureGrassLayout(state.grass);
  const grassEst = computeGrassEstimate(
    turf.areas.map((a) => ({
      id: a.id,
      grassName: a.grassName,
      grassRatePerSqFt: getGrassPricePerSqFt(a.grassName),
      areaSqFt: a.areaSqFt,
      perimeterFt: a.perimeterFt,
    })),
    DEFAULT_GRASS_CONFIG,
    GRASS_DEFAULT_LOADING,
  );
  out.push({
    id: "grass",
    label: "Artificial turf",
    lines: grassEst.lines.map((l) => ({ label: l.label, detail: l.detail, amount: Math.round(l.retail) })),
    total: turf.areaSqFt ? grassEst.customerTotal : 0,
    readout: turf.areaSqFt ? `${Math.round(turf.areaSqFt).toLocaleString()} sq ft of turf` : "",
  });

  /* ------------------------------ planting ------------------------------ */
  const land = measureLandscapeLayout(state.landscape);
  out.push({
    id: "landscape",
    label: "Planting & beds",
    lines: [
      ...land.species.map((s) => ({
        label: s.name,
        detail: `${s.qty} × ${s.size}${s.variant ? ` — ${s.variant}` : ""}`,
        amount: Math.round(s.amount),
      })),
      ...(land.bedTotal
        ? [
            {
              label: "Beds, surface & prep",
              detail: `${land.bedSqFt.toLocaleString()} sq ft · ${land.mulchYards} cu yd mulch`,
              amount: land.bedTotal,
            },
          ]
        : []),
      ...(land.irrigationTotal
        ? [{ label: "Irrigation", detail: `${land.plantCount} emitters`, amount: land.irrigationTotal }]
        : []),
    ],
    total: land.total,
    readout: land.plantCount || land.bedSqFt ? `${land.plantCount} plants · ${land.bedSqFt.toLocaleString()} sq ft of beds` : "",
  });

  /* -------------------------------- solar -------------------------------- */
  out.push({
    id: "solar",
    label: "Solar & storage",
    lines: [],
    total: 0,
    readout: "Array traced on the aerial — proposal issued after the survey",
    priv: true,
  });

  return out;
}

export const globalTotal = (trades: TradeEstimate[], enabled: TradeId[]) =>
  trades.filter((t) => !t.priv && enabled.includes(t.id)).reduce((s, t) => s + t.total, 0);

/* ------------------------------------------------------------------ *
 * Blueprint hand-off — one click fills the Blueprint Builder
 * ------------------------------------------------------------------ */

/** Where the global board leaves a project for the Blueprint Builder to pick up. */
export const BLUEPRINT_HANDOFF_KEY = "global_design_handoff";

export interface BlueprintHandoff {
  stamp: number;
  site: SitePlanData;
  existingAreas: { building: number; driveway: number; patio: number };
  project: {
    title: string;
    clientName: string;
    address: string;
    cityStateZip: string;
    jobNumber: string;
  };
  scopeOfWork: string[];
}

/**
 * Package the global project for blueprint mode. The Blueprint Builder applies
 * this on mount over its own defaults, so it opens with the site plan drawn,
 * the existing areas measured and the scope written from every priced trade.
 */
export function loadIntoBlueprint(
  state: FlipBoardState,
  meta: GlobalProjectMeta,
  trades: TradeEstimate[],
): string {
  const site: SitePlanData = state.site.shapes.length
    ? state.site
    : { shapes: [], pxPerFt: state.site.pxPerFt || DEFAULT_PX_PER_FT };
  const areas = measureSitePlan(site);

  const scopeOfWork = [
    ...trades
      .filter((t) => meta.trades.includes(t.id) && (t.total > 0 || t.priv))
      .map((t) =>
        t.priv
          ? `${t.label.toUpperCase()} — ${t.readout}`
          : `${t.label.toUpperCase()} — ${t.readout || "as drawn"} (${formatMoney(t.total)} installed)`,
      ),
    meta.notes.trim(),
  ].filter(Boolean);

  const payload: BlueprintHandoff = {
    stamp: Date.now(),
    site,
    existingAreas: {
      building: Math.round(areas.byLayer.building || 0),
      driveway: Math.round(areas.byLayer.driveway || 0),
      patio: Math.round(areas.byLayer.patio || 0),
    },
    project: {
      title: meta.title || "WONDERLANDS MASTER PLAN",
      clientName: meta.clientName,
      address: meta.address,
      cityStateZip: meta.cityStateZip,
      jobNumber: meta.jobNumber,
    },
    scopeOfWork,
  };

  cacheWrite(BLUEPRINT_HANDOFF_KEY, payload);
  cacheFlush();
  return "/blueprint-builder";
}
