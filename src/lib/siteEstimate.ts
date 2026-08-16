import {
  measureSitePlan,
  SITE_LAYERS,
  type SitePlanData,
  type SiteLayerId,
  type SiteShape,
} from "@/components/blueprint/SiteDrawingBoard";

/**
 * Pricing and dimensions taken straight off the drawn site plan.
 * Rates match the Wonderlands studio: $280/sq ft pool shell, $10/sq ft deck and
 * concrete, $50/linear ft pool-code aluminium barrier. Everything is turnkey —
 * delivery and installation at the home address are included in the figure.
 */

export const SITE_RATES: Partial<Record<SiteLayerId, number>> = {
  pool: 280,
  deck: 10,
  patio: 10,
  driveway: 10,
  equipment: 10,
};
/** Aluminium pool barrier, per linear foot */
export const FENCE_RATE_PER_FT = 50;

export type SiteEstimateLine = { label: string; detail: string; amount: number };

export type SiteEstimate = {
  lines: SiteEstimateLine[];
  total: number;
  poolSqFt: number;
  deckSqFt: number;
  fenceLinearFt: number;
  /** Bounding dimensions of the drawn pool, in feet */
  poolDims: { widthFt: number; lengthFt: number } | null;
};

const bboxFt = (shape: SiteShape, pxPerFt: number) => {
  const xs = shape.points.map((p) => p.x);
  const ys = shape.points.map((p) => p.y);
  if (!xs.length) return null;
  const w = (Math.max(...xs) - Math.min(...xs)) / (pxPerFt || 1);
  const h = (Math.max(...ys) - Math.min(...ys)) / (pxPerFt || 1);
  return { widthFt: Math.round(Math.min(w, h)), lengthFt: Math.round(Math.max(w, h)) };
};

export function computeSiteEstimate(data: SitePlanData): SiteEstimate {
  const areas = measureSitePlan(data);
  const lines: SiteEstimateLine[] = [];

  // Surfaces that need nothing underneath them are cut out of the paved layers.
  const exclusionPolygons = data.shapes
    .filter((s) => isNonPaverSurface(s.layer) || isNonPaverSurface(layerLabel(s.layer)))
    .map((s) => siteShapeOutline(s).map((p) => ({ x: p.x, y: p.y })));

  const netPaved = (layer: SiteLayerId) =>
    computeNetPaverArea({
      deckPolygons: data.shapes
        .filter((s) => s.layer === layer)
        .map((s) => siteShapeOutline(s).map((p) => ({ x: p.x, y: p.y }))),
      exclusionPolygons,
      pxPerFt: data.pxPerFt || 1,
    });

  const pavedLayers: SiteLayerId[] = ['deck', 'patio', 'driveway'];
  const netByLayer = new Map<SiteLayerId, number>(
    pavedLayers.map((l) => [l, netPaved(l)])
  );

  SITE_LAYERS.forEach((l) => {
    const rate = SITE_RATES[l.id];
    const sqFt = Math.round(netByLayer.get(l.id) ?? areas.byLayer[l.id] ?? 0);
    if (!rate || sqFt <= 0) return;
    lines.push({
      label: l.label,
      detail: `${sqFt.toLocaleString()} sq ft × $${rate}/sq ft`,
      amount: sqFt * rate,
    });
  });


  if (areas.fenceLinearFt > 0) {
    lines.push({
      label: "Pool barrier",
      detail: `${areas.fenceLinearFt.toLocaleString()} lf × $${FENCE_RATE_PER_FT}/lf`,
      amount: areas.fenceLinearFt * FENCE_RATE_PER_FT,
    });
  }

  const poolShape = data.shapes
    .filter((s) => s.layer === "pool")
    .sort((a, b) => b.points.length - a.points.length)[0];

  return {
    lines,
    total: lines.reduce((sum, l) => sum + l.amount, 0),
    poolSqFt: Math.round(areas.byLayer.pool ?? 0),
    deckSqFt: Math.round(areas.byLayer.deck ?? 0),
    fenceLinearFt: areas.fenceLinearFt,
    poolDims: poolShape ? bboxFt(poolShape, data.pxPerFt) : null,
  };
}

export const formatMoney = (n: number) =>
  n > 0 ? `$${Math.round(n).toLocaleString()}` : "—";
