/**
 * Internal Wonderlands sauna pricing model.
 *
 * Supplier (Almost Heaven) cost -> customer retail price, including freight,
 * professional installation, electrical hookup, company overhead and profit.
 *
 * Customers only ever see `retail`. The full breakdown is exposed exclusively
 * through the passcode-protected sales panel.
 */

export const SAUNA_PRICING_MODEL = {
  /** Freight from the manufacturer to the Central Florida warehouse */
  freightBase: 690,
  /** Additional freight per seat above 2 persons (larger crates) */
  freightPerSeat: 85,
  /** Local delivery, crane/dolly handling and debris removal */
  localDelivery: 420,
  /** Installation crew: base mobilization */
  installBase: 1150,
  /** Installation labor as a share of unit cost (assembly complexity) */
  installCostRate: 0.14,
  /** Licensed electrician: 240V dedicated circuit, disconnect and bonding */
  electrical: 1250,
  /** Pad / base prep (gravel or paver pad, leveling) */
  sitePrep: 650,
  /** Company overhead (office, insurance, warranty reserve, financing fees) */
  overheadRate: 0.11,
  /** Target gross profit on total delivered cost */
  profitRate: 0.40,
  /**
   * Markup applied to accessories and upgrade options. General-contractor
   * basis (founder ruling 2026-11-19): every option retails at no less than
   * 2x its supplier cost.
   */
  optionMarkup: 2.00,
} as const;

export interface SaunaPriceBreakdown {
  unitCost: number;
  freight: number;
  localDelivery: number;
  installation: number;
  electrical: number;
  sitePrep: number;
  overhead: number;
  totalCost: number;
  profit: number;
  retail: number;
  grossMarginPct: number;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/** Persons seated, parsed from catalog strings like "2-4 persons" (uses the max) */
export const parseSeats = (capacity?: string): number => {
  const matches = (capacity || '').match(/\d+/g);
  if (!matches?.length) return 2;
  return Math.max(...matches.map(Number));
};

export function getSaunaPriceBreakdown(
  unitCost: number,
  capacity?: string,
  /** Published factory freight for the model (Harvia dealer pricelist) */
  freightOverride?: number,
): SaunaPriceBreakdown {
  const m = SAUNA_PRICING_MODEL;
  const seats = parseSeats(capacity);

  const freight =
    freightOverride && freightOverride > 0
      ? freightOverride
      : m.freightBase + Math.max(0, seats - 2) * m.freightPerSeat;
  const localDelivery = m.localDelivery;
  const installation = roundTo(m.installBase + unitCost * m.installCostRate, 5);
  const electrical = m.electrical;
  const sitePrep = m.sitePrep;

  const directCost = unitCost + freight + localDelivery + installation + electrical + sitePrep;
  const overhead = roundTo(directCost * m.overheadRate, 5);
  const totalCost = directCost + overhead;

  const formulaRetail = roundTo(totalCost * (1 + m.profitRate), 25);
  // General-contractor basis floor (founder ruling 2026-11-19): the retail
  // price never falls below 2x (unit cost + installation cost), rounded up
  // to the nearest $25 so the floor always holds.
  const basisFloor = Math.ceil((2 * (unitCost + installation)) / 25) * 25;
  const retail = Math.max(formulaRetail, basisFloor);
  const profit = retail - totalCost;

  return {
    unitCost,
    freight,
    localDelivery,
    installation,
    electrical,
    sitePrep,
    overhead,
    totalCost,
    profit,
    retail,
    grossMarginPct: retail > 0 ? (profit / retail) * 100 : 0,
  };
}

/** Customer-facing turnkey price for a sauna model */
export const getSaunaRetailPrice = (unitCost: number, capacity?: string, freight?: number): number =>
  getSaunaPriceBreakdown(unitCost, capacity, freight).retail;

/** Customer-facing price for a sauna accessory / upgrade option.
 *  Rounded UP to the nearest $5 so the price never falls below the
 *  general-contractor basis of 2x supplier cost. */
export const getSaunaOptionRetail = (cost: number): number =>
  cost <= 0 ? 0 : Math.ceil((cost * SAUNA_PRICING_MODEL.optionMarkup) / 5) * 5;
