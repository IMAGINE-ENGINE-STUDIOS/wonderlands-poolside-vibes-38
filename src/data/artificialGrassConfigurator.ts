/**
 * Artificial turf project cost model (Florida market, general-contractor view).
 *
 * Customer sees a turnkey investment number only. The contractor/developer view
 * (passcode protected) exposes material + labor cost, overhead, contingency and
 * the developer profit applied over the whole project.
 */

export const GRASS_CONTRACTOR_PASSCODE = 'WONDERMAGIC';

export type GrassUnit = 'sqft' | 'lf' | 'flat';

export interface GrassAddOn {
  id: string;
  name: string;
  description: string;
  unit: GrassUnit;
  /** Direct cost to the contractor */
  cost: number;
  /** Retail rate charged to the customer */
  retail: number;
}

/** Base system under the turf — drainage / comfort layer */
export const GRASS_BASE_SYSTEMS: GrassAddOn[] = [
  {
    id: 'standard-base',
    name: 'Standard Compacted Base',
    description: '3" excavation, crushed concrete base, plate-compacted to 90%',
    unit: 'sqft',
    cost: 3.25,
    retail: 4.75,
  },
  {
    id: 'pet-base',
    name: 'Pet Drainage Base',
    description: 'Open-graded stone with permeable panel — flushes and dries fast',
    unit: 'sqft',
    cost: 4.35,
    retail: 6.4,
  },
  {
    id: 'shock-pad',
    name: 'Play / Shock Pad Base',
    description: '10 mm foam pad over compacted base — fall-height rated for play areas',
    unit: 'sqft',
    cost: 5.6,
    retail: 8.25,
  },
];

/** Infill selection */
export const GRASS_INFILLS: GrassAddOn[] = [
  {
    id: 'silica',
    name: 'Silica Sand Infill',
    description: 'Rounded silica — ballast and blade support for landscape areas',
    unit: 'sqft',
    cost: 0.35,
    retail: 0.65,
  },
  {
    id: 'zeolite',
    name: 'Zeolite Antimicrobial Infill',
    description: 'Ammonia-neutralizing infill — recommended for pets',
    unit: 'sqft',
    cost: 0.75,
    retail: 1.3,
  },
  {
    id: 'coated',
    name: 'Acrylic-Coated Cool Infill',
    description: 'Reflective coated infill — lowers surface temperature',
    unit: 'sqft',
    cost: 0.95,
    retail: 1.65,
  },
];

/** Perimeter edge restraint */
export const GRASS_EDGINGS: GrassAddOn[] = [
  {
    id: 'bender',
    name: 'Composite Bender Board',
    description: 'Flexible edge board staked every 24" — follows curves cleanly',
    unit: 'lf',
    cost: 2.6,
    retail: 4.5,
  },
  {
    id: 'aluminum',
    name: 'Aluminum Edge Restraint',
    description: 'Rigid anodized edge — crisp architectural lines',
    unit: 'lf',
    cost: 4.1,
    retail: 6.9,
  },
  {
    id: 'paver-border',
    name: 'Paver Border Transition',
    description: 'Turf tucked into an existing paver or concrete edge',
    unit: 'lf',
    cost: 1.2,
    retail: 2.4,
  },
];

/** Optional project extras */
export const GRASS_EXTRAS: GrassAddOn[] = [
  {
    id: 'sod-removal',
    name: 'Sod & Debris Removal',
    description: 'Cut, load and haul off existing turf with dumpster',
    unit: 'sqft',
    cost: 0.85,
    retail: 1.5,
  },
  {
    id: 'french-drain',
    name: 'French Drain Tie-In',
    description: 'Perforated drain line routed to daylight or existing drainage',
    unit: 'lf',
    cost: 9.5,
    retail: 16,
  },
  {
    id: 'weed-barrier',
    name: 'Commercial Weed Barrier',
    description: '5 oz woven geotextile under the base course',
    unit: 'sqft',
    cost: 0.35,
    retail: 0.7,
  },
  {
    id: 'putting-cup',
    name: 'Putting Cup & Fringe',
    description: 'Regulation cup, flag sleeve and nylon fringe collar',
    unit: 'flat',
    cost: 420,
    retail: 850,
  },
  {
    id: 'perimeter-lighting',
    name: 'Perimeter LED Grazing Lights',
    description: 'Low-voltage edge lighting with transformer and timer',
    unit: 'flat',
    cost: 1250,
    retail: 2400,
  },
  {
    id: 'irrigation-cap',
    name: 'Irrigation Cap & Reroute',
    description: 'Cap heads inside the turf field, reroute zone piping',
    unit: 'flat',
    cost: 380,
    retail: 720,
  },
];

/** Installation labor and consumables that always apply */
export const GRASS_LABOR = {
  /** Turf install labor per sq ft */
  installPerSqFt: { cost: 3.2, retail: 5.4 },
  /** Seaming tape, glue, nails, staples per sq ft */
  consumablesPerSqFt: { cost: 0.55, retail: 1.0 },
  /** Mobilization / equipment per project */
  mobilization: { cost: 650, retail: 1150 },
};

/** Contractor cost loading — editable in the contractor panel */
export const GRASS_DEFAULT_LOADING = {
  overheadPct: 0.12,
  contingencyPct: 0.05,
  /** Developer profit applied over the entire loaded project cost */
  developerProfitPct: 0.22,
};

export interface GrassAreaInput {
  id: string;
  grassName: string;
  grassRatePerSqFt: number;
  areaSqFt: number;
  perimeterFt: number;
}

export interface GrassProjectConfig {
  baseSystemId: string;
  infillId: string;
  edgingId: string;
  extraIds: string[];
  /** Linear feet of drainage line when the French drain extra is selected */
  drainLf: number;
}

export interface GrassLine {
  label: string;
  detail: string;
  retail: number;
  cost: number;
}

export interface GrassEstimate {
  areaSqFt: number;
  perimeterFt: number;
  lines: GrassLine[];
  /** Turnkey price shown to the customer */
  customerTotal: number;
  /** Direct cost before loading */
  directCost: number;
  overhead: number;
  contingency: number;
  loadedCost: number;
  developerProfit: number;
  /** Gross margin of the quoted price */
  marginDollars: number;
  marginPct: number;
  pricePerSqFt: number;
}

const byId = (list: GrassAddOn[], id: string) => list.find(o => o.id === id) || list[0];

const qtyFor = (unit: GrassUnit, areaSqFt: number, perimeterFt: number, drainLf: number, id: string) => {
  if (unit === 'flat') return 1;
  if (unit === 'lf') return id === 'french-drain' ? drainLf : perimeterFt;
  return areaSqFt;
};

export const DEFAULT_GRASS_CONFIG: GrassProjectConfig = {
  baseSystemId: 'standard-base',
  infillId: 'silica',
  edgingId: 'bender',
  extraIds: ['sod-removal', 'weed-barrier'],
  drainLf: 0,
};

/**
 * Build the full estimate for a set of drawn turf areas.
 * `developerProfitPct` lets the contractor panel model different profit targets.
 */
export function computeGrassEstimate(
  areas: GrassAreaInput[],
  config: GrassProjectConfig,
  loading = GRASS_DEFAULT_LOADING
): GrassEstimate {
  const areaSqFt = areas.reduce((s, a) => s + a.areaSqFt, 0);
  const perimeterFt = areas.reduce((s, a) => s + a.perimeterFt, 0);
  const lines: GrassLine[] = [];

  // Turf material per drawn area (each area can carry its own product)
  areas.forEach(a => {
    if (a.areaSqFt <= 0) return;
    lines.push({
      label: `${a.grassName} Turf`,
      detail: `${Math.round(a.areaSqFt).toLocaleString()} sq ft @ $${a.grassRatePerSqFt}/sq ft`,
      retail: a.areaSqFt * a.grassRatePerSqFt,
      // Turf goods typically land near 38% of the retail turf rate delivered
      cost: a.areaSqFt * a.grassRatePerSqFt * 0.38,
    });
  });

  if (areaSqFt > 0) {
    const base = byId(GRASS_BASE_SYSTEMS, config.baseSystemId);
    const infill = byId(GRASS_INFILLS, config.infillId);
    const edging = byId(GRASS_EDGINGS, config.edgingId);

    lines.push({
      label: base.name,
      detail: `${Math.round(areaSqFt).toLocaleString()} sq ft @ $${base.retail}/sq ft`,
      retail: areaSqFt * base.retail,
      cost: areaSqFt * base.cost,
    });
    lines.push({
      label: infill.name,
      detail: `${Math.round(areaSqFt).toLocaleString()} sq ft @ $${infill.retail}/sq ft`,
      retail: areaSqFt * infill.retail,
      cost: areaSqFt * infill.cost,
    });
    lines.push({
      label: edging.name,
      detail: `${Math.round(perimeterFt).toLocaleString()} lf @ $${edging.retail}/lf`,
      retail: perimeterFt * edging.retail,
      cost: perimeterFt * edging.cost,
    });
    lines.push({
      label: 'Installation Labor',
      detail: `${Math.round(areaSqFt).toLocaleString()} sq ft @ $${GRASS_LABOR.installPerSqFt.retail}/sq ft`,
      retail: areaSqFt * GRASS_LABOR.installPerSqFt.retail,
      cost: areaSqFt * GRASS_LABOR.installPerSqFt.cost,
    });
    lines.push({
      label: 'Seaming, Nails & Consumables',
      detail: `${Math.round(areaSqFt).toLocaleString()} sq ft @ $${GRASS_LABOR.consumablesPerSqFt.retail}/sq ft`,
      retail: areaSqFt * GRASS_LABOR.consumablesPerSqFt.retail,
      cost: areaSqFt * GRASS_LABOR.consumablesPerSqFt.cost,
    });
    lines.push({
      label: 'Mobilization & Equipment',
      detail: 'Crew mobilization, compaction equipment, site protection',
      retail: GRASS_LABOR.mobilization.retail,
      cost: GRASS_LABOR.mobilization.cost,
    });

    config.extraIds.forEach(id => {
      const extra = GRASS_EXTRAS.find(e => e.id === id);
      if (!extra) return;
      const qty = qtyFor(extra.unit, areaSqFt, perimeterFt, config.drainLf, extra.id);
      if (qty <= 0) return;
      const unitLabel = extra.unit === 'sqft' ? 'sq ft' : extra.unit === 'lf' ? 'lf' : 'project';
      lines.push({
        label: extra.name,
        detail:
          extra.unit === 'flat'
            ? extra.description
            : `${Math.round(qty).toLocaleString()} ${unitLabel} @ $${extra.retail}/${unitLabel}`,
        retail: qty * extra.retail,
        cost: qty * extra.cost,
      });
    });
  }

  const customerTotal = Math.round(lines.reduce((s, l) => s + l.retail, 0));
  const directCost = lines.reduce((s, l) => s + l.cost, 0);
  const overhead = directCost * loading.overheadPct;
  const contingency = directCost * loading.contingencyPct;
  const loadedCost = directCost + overhead + contingency;
  const developerProfit = loadedCost * loading.developerProfitPct;
  const marginDollars = customerTotal - loadedCost;

  return {
    areaSqFt,
    perimeterFt,
    lines,
    customerTotal,
    directCost,
    overhead,
    contingency,
    loadedCost,
    developerProfit,
    marginDollars,
    marginPct: customerTotal > 0 ? (marginDollars / customerTotal) * 100 : 0,
    pricePerSqFt: areaSqFt > 0 ? customerTotal / areaSqFt : 0,
  };
}

/** Price the developer-profit target expects the project to sell for */
export function targetSellPrice(estimate: GrassEstimate, profitPct: number): number {
  return Math.round(estimate.loadedCost * (1 + profitPct));
}
