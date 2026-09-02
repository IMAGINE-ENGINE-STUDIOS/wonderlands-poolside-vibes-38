import {
  measureSitePlan,
  siteShapeOutline,
  SITE_LAYERS,
  type SitePlanData,
  type SiteLayerId,
  type SiteShape,
} from "@/components/blueprint/SiteDrawingBoard";
import { computeNetPaverArea, isNonPaverSurface } from "@/utils/paverAreaLogic";
import {
  TRADE_LAYERS,
  tradeFeaturePrice,
  solarAreaPrice,
  solarPanelsForArea,
} from "@/lib/design/siteTradeLayers";

const layerLabel = (id: SiteLayerId) =>
  SITE_LAYERS.find((l) => l.id === id)?.label ?? id;


/**
 * Pricing and dimensions taken straight off the drawn site plan.
 * Rates match the Wonderlands studio: $280/sq ft pool shell, $10/sq ft deck and
 * concrete, $50/linear ft pool-code aluminium barrier. Everything is turnkey —
 * delivery and installation at the home address are included in the figure.
 */

export const SITE_RATES: Partial<Record<SiteLayerId, number>> = {
  pool: TRADE_LAYERS.pool.rate ?? 280,
  spa: TRADE_LAYERS.spa.rate ?? 320,
  ledge: TRADE_LAYERS.ledge.rate ?? 320,
  deck: 10,
  patio: 10,
  driveway: 10,
  equipment: 10,
  enclosure: TRADE_LAYERS.enclosure.rate ?? 34,
  turf: TRADE_LAYERS.turf.rate ?? 12,
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

  /* Solar arrays are priced by the panels that actually pack inside the drawn
     roof plane (66% fill), not by raw square footage. */
  const solarSqFt = Math.round(areas.byLayer.solar ?? 0);
  if (solarSqFt > 0) {
    const panels = solarPanelsForArea(solarSqFt);
    lines.push({
      label: "Solar array",
      detail: `${panels} panels packed in ${solarSqFt.toLocaleString()} sq ft of roof plane`,
      amount: solarAreaPrice(solarSqFt),
    });
  }

  /* Additional features selected on each drawn element (cage roofs and screens,
     turf infill, spa jets, pool heaters, solar batteries...). */
  const sq = (data.pxPerFt || 1) ** 2;
  data.shapes.forEach((shape) => {
    if (!shape.features?.length) return;
    const outline = siteShapeOutline(shape).map((p) => ({ x: p.x, y: p.y }));
    let a = 0;
    let lf = 0;
    for (let i = 0; i < outline.length; i++) {
      const p = outline[i];
      const q = outline[(i + 1) % outline.length];
      a += p.x * q.y - q.x * p.y;
      if (shape.closed || i < outline.length - 1) lf += Math.hypot(q.x - p.x, q.y - p.y);
    }
    const sqFt = Math.abs(a / 2) / sq;
    const linearFt = lf / (data.pxPerFt || 1);
    const amount = tradeFeaturePrice(shape.layer, shape.features, sqFt, linearFt);
    if (amount <= 0) return;
    const spec = TRADE_LAYERS[shape.layer];
    const names = shape.features
      .map((id) => spec?.features.find((f) => f.id === id)?.label)
      .filter(Boolean)
      .join(", ");
    lines.push({
      label: `${layerLabel(shape.layer)} — options`,
      detail: names,
      amount,
    });
  });

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
