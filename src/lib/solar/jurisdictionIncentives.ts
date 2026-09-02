// Jurisdiction economics — what the county actually does to a solar proposal.
//
// Pure maths, no React, so the Solar Genius leaf, the FLIP spread, the analysis
// deck and the blueprint sheet all read the same numbers.
//
// The chain is short and auditable:
//
//   1. Split production into the share consumed behind the meter and the share
//      exported, using the household's own annual consumption.
//   2. Value self-consumption at the retail rate, and value exports at the
//      retail rate multiplied by the county's export-credit factor. A net-billing
//      municipal utility therefore prices an oversized array honestly instead of
//      pretending 1:1 credit exists everywhere.
//   3. Fold the fixed monthly charge back in — solar cannot offset it, so the
//      bill has a floor.
//   4. Stack the incentives: the federal credit, the Florida sales-tax exemption,
//      the property-tax exclusion (reported, not monetised as cash), and any
//      county rebate.
//
// The result is an "effective rate" — the blended value of one produced kWh in
// this county — which is the single number the finance model needs.

import { FEDERAL_CREDIT_RATE } from "@/data/solarHardware";
import {
  EXPORT_CREDIT_FACTOR,
  EXPORT_RULE_LABEL,
  FLORIDA_STATE_BENEFITS,
  type SolarJurisdiction,
} from "@/data/floridaSolarJurisdictions";

export interface JurisdictionEconomicsInput {
  jurisdiction: SolarJurisdiction;
  /** Year-one delivered production, kWh */
  yearOneKwh: number;
  /** Household annual consumption, kWh */
  householdKwh: number;
  /** Installed price before incentives */
  installed: number;
  /** Optional rate override keyed from the customer's own bill */
  rateOverride?: number | null;
}

export interface IncentiveLine {
  id: string;
  label: string;
  authority: string;
  /** Cash value in dollars; 0 when the benefit is not a cash amount */
  amount: number;
  detail: string;
  kind: "credit" | "exemption" | "rebate" | "financing" | "penalty";
}

export interface JurisdictionEconomics {
  jurisdiction: SolarJurisdiction;
  /** Retail rate used, after any override */
  rate: number;
  /** Share of production consumed on site, 0–1 */
  selfConsumedShare: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  /** What one produced kWh is worth here, blended */
  effectiveRate: number;
  /** Year-one bill saving after the fixed charge floor */
  yearOneSaving: number;
  /** Fixed charges that survive any array, per year */
  fixedFloorPerYear: number;
  /** Bill offset achieved, 0–1 */
  offset: number;
  /** Soft costs the county adds */
  jurisdictionCosts: number;
  incentives: IncentiveLine[];
  /** Total cash value of incentives in year one */
  incentiveCash: number;
  /** Net cost after cash incentives and county fees */
  netCost: number;
  /** Simple payback in years, using the effective rate */
  paybackYears: number;
  exportRuleLabel: string;
  cautions: string[];
}

/**
 * Self-consumption share. A residential array without storage typically delivers
 * 30–45% of its output straight to the house; the rest crosses the meter. The
 * share rises when the array is small relative to the load and falls when it is
 * oversized, which is exactly the behaviour a net-billing county punishes.
 */
export function selfConsumptionShare(yearOneKwh: number, householdKwh: number): number {
  if (yearOneKwh <= 0) return 0;
  const ratio = householdKwh > 0 ? yearOneKwh / householdKwh : 2;
  /* Sized well under the load: most production is used on site. Sized far above
     it: the surplus can only be exported. */
  const share = 0.62 - 0.22 * Math.min(2, ratio);
  return Math.max(0.2, Math.min(0.85, share));
}

export function computeJurisdictionEconomics(input: JurisdictionEconomicsInput): JurisdictionEconomics {
  const { jurisdiction: j, yearOneKwh, householdKwh, installed } = input;
  const rate = input.rateOverride && input.rateOverride > 0 ? input.rateOverride : j.rateUsdPerKwh;

  const share = selfConsumptionShare(yearOneKwh, householdKwh);
  const selfConsumedKwh = Math.round(yearOneKwh * share);
  const exportedKwh = Math.max(0, Math.round(yearOneKwh - selfConsumedKwh));
  const exportFactor = EXPORT_CREDIT_FACTOR[j.exportRule];

  const effectiveRate = yearOneKwh > 0 ? (selfConsumedKwh * rate + exportedKwh * rate * exportFactor) / yearOneKwh : rate;

  const fixedFloorPerYear = j.fixedMonthlyUsd * 12;
  const grossSaving = selfConsumedKwh * rate + exportedKwh * rate * exportFactor;
  const billBefore = householdKwh * rate + fixedFloorPerYear;
  const yearOneSaving = Math.max(0, Math.min(grossSaving, billBefore - fixedFloorPerYear));
  const offset = billBefore > 0 ? yearOneSaving / billBefore : 0;

  const jurisdictionCosts = j.permitFeeUsd + j.interconnectFeeUsd;

  /* ---------------------------- incentive stack ---------------------------- */
  const incentives: IncentiveLine[] = [];

  const itc = FLORIDA_STATE_BENEFITS.find((b) => b.id === "federal-itc");
  incentives.push({
    id: "federal-itc",
    label: itc?.label ?? "Federal clean-energy credit",
    authority: itc?.authority ?? "26 U.S.C. §25D",
    amount: Math.round(installed * FEDERAL_CREDIT_RATE),
    detail: itc?.detail ?? "",
    kind: "credit",
  });

  const sales = FLORIDA_STATE_BENEFITS.find((b) => b.id === "fl-sales-tax");
  incentives.push({
    id: "fl-sales-tax",
    label: sales?.label ?? "Solar sales-tax exemption",
    authority: sales?.authority ?? "§212.08(7)(hh) F.S.",
    /* The exemption is applied at purchase, so it is a cost avoided rather than
       a cheque: reported at the equivalent 6% of the equipment portion. */
    amount: Math.round(installed * 0.6 * 0.06),
    detail: sales?.detail ?? "",
    kind: "exemption",
  });

  const property = FLORIDA_STATE_BENEFITS.find((b) => b.id === "fl-property-tax");
  incentives.push({
    id: "fl-property-tax",
    label: property?.label ?? "Property-tax exclusion",
    authority: property?.authority ?? "§193.624 F.S.",
    amount: 0,
    detail: property?.detail ?? "",
    kind: "exemption",
  });

  for (const p of j.programs) {
    const cash = p.perWatt && p.perWatt > 0 ? 0 : p.valueUsd ?? 0;
    incentives.push({
      id: p.id,
      label: p.label,
      authority: p.administrator,
      amount: Math.min(cash, p.capUsd ?? cash),
      detail: p.detail,
      kind: p.kind === "rebate" ? "rebate" : p.kind === "bill-credit" ? "credit" : "financing",
    });
  }

  for (const caution of j.penalties) {
    incentives.push({
      id: `penalty-${caution.slice(0, 18)}`,
      label: "County caution",
      authority: j.utility,
      amount: 0,
      detail: caution,
      kind: "penalty",
    });
  }

  const incentiveCash = incentives
    .filter((i) => i.kind === "credit" || i.kind === "rebate")
    .reduce((s, i) => s + i.amount, 0);

  const netCost = Math.max(0, installed + jurisdictionCosts - incentiveCash);
  const paybackYears = yearOneSaving > 0 ? netCost / yearOneSaving : 0;

  const cautions = [...j.penalties];
  if (j.exportRule !== "net-metering-retail") {
    cautions.unshift(
      `${j.utility} credits exports at ${Math.round(exportFactor * 100)}% of retail — this array exports ${exportedKwh.toLocaleString()} kWh a year, so storage or load-shifting is worth pricing.`,
    );
  }

  return {
    jurisdiction: j,
    rate,
    selfConsumedShare: share,
    selfConsumedKwh,
    exportedKwh,
    effectiveRate,
    yearOneSaving: Math.round(yearOneSaving),
    fixedFloorPerYear: Math.round(fixedFloorPerYear),
    offset,
    jurisdictionCosts,
    incentives,
    incentiveCash,
    netCost: Math.round(netCost),
    paybackYears,
    exportRuleLabel: EXPORT_RULE_LABEL[j.exportRule],
    cautions,
  };
}

/** Printable lines for the blueprint sheet and the FLIP take-off. */
export function jurisdictionSheetLines(e: JurisdictionEconomics): string[] {
  const j = e.jurisdiction;
  return [
    `UTILITY: ${j.utility.toUpperCase()} (${j.utilityKind.toUpperCase()}) — ${j.county.toUpperCase()} COUNTY`,
    `RETAIL RATE: $${e.rate.toFixed(3)}/KWH · FIXED CHARGE $${j.fixedMonthlyUsd.toFixed(2)}/MO`,
    `EXPORT RULE: ${e.exportRuleLabel.toUpperCase()}`,
    `EFFECTIVE VALUE OF PRODUCTION: $${e.effectiveRate.toFixed(3)}/KWH BLENDED`,
    `PERMIT + INTERCONNECTION FEES: $${e.jurisdictionCosts.toLocaleString()}`,
    `INCENTIVE CASH APPLIED: $${e.incentiveCash.toLocaleString()} (FEDERAL CREDIT + LOCAL)`,
    `SALES TAX: EXEMPT PER §212.08(7)(hh) F.S. · ASSESSED VALUE EXCLUDED PER §193.624 F.S.`,
    `INTERCONNECTION INSURANCE: ${j.insuranceNote.toUpperCase()}`,
  ];
}
