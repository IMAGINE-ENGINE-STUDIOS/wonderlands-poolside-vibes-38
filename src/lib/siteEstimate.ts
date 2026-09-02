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
  tradeBaseReplaced,
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

export type SiteEstimateLine = {
  label: string;
  detail: string;
  amount: number;
  /** Option photograph, so the estimate can print the same tile as the board */
  image?: string;
  /** Drawn element this line belongs to — an X on the line erases it */
  shapeId?: string;
  /** Selected option this line prices — an X on the line takes the option off */
  featureId?: string;
  /** Layer whose base rate this line prices */
  layer?: SiteLayerId;
};

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

  /* Surfaces that need nothing underneath them are cut out of the paved layers.
     Pool, spa and tanning-ledge shells are always deducted (by layer, not just
     by keyword) so the paver deck is billed on its net area. */
  const CUT_LAYERS: SiteLayerId[] = ['pool', 'spa', 'ledge', 'turf', 'gravel'];
  const exclusionPolygons = data.shapes
    .filter(
      (s) =>
        CUT_LAYERS.includes(s.layer) ||
        isNonPaverSurface(s.layer) ||
        isNonPaverSurface(layerLabel(s.layer)),
    )
    .map((s) => siteShapeOutline(s).map((p) => ({ x: p.x, y: p.y })));


  const netOf = (polys: { x: number; y: number }[][]) =>
    computeNetPaverArea({
      deckPolygons: polys,
      exclusionPolygons,
      pxPerFt: data.pxPerFt || 1,
    });

  const netPaved = (layer: SiteLayerId) =>
    netOf(
      data.shapes
        .filter((s) => s.layer === layer)
        .map((s) => siteShapeOutline(s).map((p) => ({ x: p.x, y: p.y }))),
    );

  const pavedLayers: SiteLayerId[] = ['deck', 'patio', 'driveway'];
  const netByLayer = new Map<SiteLayerId, number>(
    pavedLayers.map((l) => [l, netPaved(l)])
  );

  /* Net area of each individual paved element — a deck priced at its selected
     paver rate needs its own square footage, not the layer total. */
  const netByShape = new Map<string, number>();
  data.shapes
    .filter((s) => pavedLayers.includes(s.layer))
    .forEach((s) =>
      netByShape.set(s.id, netOf([siteShapeOutline(s).map((p) => ({ x: p.x, y: p.y }))])),
    );

  /* Elements whose selected surface already includes the installed rate (a paver
     on a deck) are taken out of the layer's base line — their surface is billed
     once, at its published rate, on its own line below. */
  const surfacedSqFt = new Map<SiteLayerId, number>();
  data.shapes.forEach((s) => {
    if (!tradeBaseReplaced(s.layer, s.features)) return;
    surfacedSqFt.set(
      s.layer,
      (surfacedSqFt.get(s.layer) ?? 0) + (netByShape.get(s.id) ?? 0),
    );
  });

  SITE_LAYERS.forEach((l) => {
    const rate = SITE_RATES[l.id];
    const gross = netByLayer.get(l.id) ?? areas.byLayer[l.id] ?? 0;
    const sqFt = Math.round(Math.max(0, gross - (surfacedSqFt.get(l.id) ?? 0)));
    if (!rate || sqFt <= 0) return;
    lines.push({
      label: l.label,
      detail: `${sqFt.toLocaleString()} sq ft × $${rate}/sq ft`,
      amount: sqFt * rate,
      layer: l.id,
    });
  });



  if (areas.fenceLinearFt > 0) {
    lines.push({
      label: "Pool barrier",
      detail: `${areas.fenceLinearFt.toLocaleString()} lf × $${FENCE_RATE_PER_FT}/lf`,
      amount: areas.fenceLinearFt * FENCE_RATE_PER_FT,
      layer: "fence",
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
      layer: "solar",
    });
  }

  /* Additional features selected on each drawn element (cage roofs and screens,
     turf infill, spa jets, pool heaters, solar batteries...).
     Each option gets its OWN priced line, tagged with the element and the option
     it came from, so the estimate reads like a spec sheet and a single option can
     be taken back off without touching the drawing. */
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
    /* Paved elements are priced on their NET area, so a paver deck is never
       billed under the pool, the spa or the tanning ledge. */
    const sqFt = netByShape.get(shape.id) ?? Math.abs(a / 2) / sq;
    const linearFt = lf / (data.pxPerFt || 1);
    tradeFeatureLines(shape.layer, shape.features, sqFt, linearFt).forEach((f) => {
      if (f.amount <= 0) return;
      lines.push({
        label: `${layerLabel(shape.layer)} — ${f.label}`,
        detail: f.replacesBase ? `${f.detail} · installed surface` : f.detail,
        amount: f.amount,
        image: f.image,
        shapeId: shape.id,
        featureId: f.id,
        layer: shape.layer,
      });
    });
  });



  const poolShape = data.shapes
    .filter((s) => s.layer === "pool")
    .sort((a, b) => b.points.length - a.points.length)[0];

  return {
    lines,
    total: lines.reduce((sum, l) => sum + l.amount, 0),
    poolSqFt: Math.round(areas.byLayer.pool ?? 0),
    /* Deck square footage is always the NET paved figure: the pool shell, the
       spa and the tanning ledge (plus turf, gravel and planting) are cut out of
       the deck, so take-offs, $/sq ft and specs never bill paver under water. */
    deckSqFt: Math.round(netByLayer.get('deck') ?? areas.byLayer.deck ?? 0),
    fenceLinearFt: areas.fenceLinearFt,
    poolDims: poolShape ? bboxFt(poolShape, data.pxPerFt) : null,
  };

}

export const formatMoney = (n: number) =>
  n > 0 ? `$${Math.round(n).toLocaleString()}` : "—";
