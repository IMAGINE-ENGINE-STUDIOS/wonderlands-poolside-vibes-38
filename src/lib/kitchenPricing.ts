/**
 * Internal Wonderlands outdoor kitchen pricing model.
 *
 * Built from PRICING-COST-STUDY.md (the pricing model for both kitchen
 * worlds) and the founder's earnings ruling of 2026-11-23 17:50 ET:
 *
 *  - Earnings are 30 percent ON THE COST (earnings = 30% x cost, added on
 *    top), never 30 percent as a share of the final price. Thirty percent
 *    on cost is the MINIMUM any line may carry.
 *  - On body and materials lines, 2x the cost is a FLOOR, never the
 *    formula and never a cap (study rule A5.1).
 *  - Competitiveness is the binding test (study rule A5.1 and section A1):
 *    where a competitive ceiling is on record (a manufacturer's own MSRP,
 *    or the top of a held installed price band), the selling price never
 *    goes above it. When the ceiling holds a line below the 30 percent
 *    floor, the shortfall is flagged on the breakdown, never hidden.
 *  - No feature is priced without its chain (study rule A5.2): the
 *    utility chains and project services are quotable lines of their own
 *    in the kitchen section, each carrying the same earnings basis.
 *  - Costs are never invented. A product whose cost is not on record
 *    carries unitCost null and a named gap; it has no selling price.
 *
 * Customers only ever see `price`. Costs, earnings and gaps are internal
 * data for the sales view, exactly as in the sauna pricing model.
 */

export const KITCHEN_PRICING_MODEL = {
  /** Earnings floor: 30 percent ON cost (founder ruling 2026-11-23). */
  earningsRate: 0.3,
  /** Floor multiple on body and materials lines (study rule A5.1). */
  materialsMultiple: 2,
} as const;

export type KitchenCostKind =
  | "appliance"
  | "cabinet"
  | "front"
  | "materials"
  | "service"
  | "set";

export interface KitchenPriceBreakdown {
  /** Held cost the price is computed from; null when no cost is on record. */
  unitCost: number | null;
  totalCost: number | null;
  /** Price at the 30 percent earnings floor on cost. */
  floorPrice: number | null;
  /** Price at the 2x floor; only applies to body and materials lines. */
  materialsFloorPrice: number | null;
  /** Held competitive ceiling (MSRP or band top), when one is on record. */
  competitiveCeiling: number | null;
  /** The selling price the model publishes. */
  price: number | null;
  earnings: number | null;
  /** Earnings as a percentage ON cost. */
  earningsPct: number | null;
  /** True when a competitive ceiling holds the price below the 30% floor. */
  belowFloor: boolean;
  /** Named cost gap, when the cost is missing or partial. */
  costGap?: string;
}

export interface KitchenPricedInput {
  unitCost: number | null;
  kind: KitchenCostKind;
  competitiveCeiling?: number;
  costGap?: string;
}

export function getKitchenPriceBreakdown(
  input: KitchenPricedInput,
): KitchenPriceBreakdown {
  const ceiling = input.competitiveCeiling ?? null;
  if (input.unitCost == null) {
    return {
      unitCost: null,
      totalCost: null,
      floorPrice: null,
      materialsFloorPrice: null,
      competitiveCeiling: ceiling,
      price: null,
      earnings: null,
      earningsPct: null,
      belowFloor: false,
      costGap: input.costGap,
    };
  }
  const totalCost = input.unitCost;
  const floorPrice = totalCost * (1 + KITCHEN_PRICING_MODEL.earningsRate);
  const materialsFloorPrice =
    input.kind === "materials"
      ? totalCost * KITCHEN_PRICING_MODEL.materialsMultiple
      : null;
  const rawPrice = Math.max(floorPrice, materialsFloorPrice ?? 0);
  const price = ceiling != null ? Math.min(rawPrice, ceiling) : rawPrice;
  const earnings = price - totalCost;
  return {
    unitCost: input.unitCost,
    totalCost,
    floorPrice,
    materialsFloorPrice,
    competitiveCeiling: ceiling,
    price,
    earnings,
    earningsPct: totalCost > 0 ? (earnings / totalCost) * 100 : null,
    belowFloor: price < floorPrice - 0.005,
    costGap: input.costGap,
  };
}

/** The selling price the model publishes for one kitchen product. */
export const getKitchenSellingPrice = (input: KitchenPricedInput) =>
  getKitchenPriceBreakdown(input).price;
