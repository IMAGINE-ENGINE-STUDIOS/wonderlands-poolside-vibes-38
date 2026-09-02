// Solar finance model — cash, loan and PPA, on one comparable footing.
//
// Pure maths, no React and no side effects, so a dealer's numbers can be checked
// line by line and the same functions can be reused by the report, the sensitivity
// grid and the offset ladder without drifting.
//
// Conventions used throughout:
//   • Year 1 is the first full production year.
//   • Production degrades at the module warranty rate each year.
//   • The utility rate escalates each year.
//   • Export is credited at retail (Florida net metering is 1:1).
//   • The federal credit lands in year 1 as a cash inflow.
//   • LCOE discounts both cost and energy at the same rate, as NREL does.

import {
  FEDERAL_CREDIT_RATE,
  PANEL_DEGRADATION,
  UTILITY_ESCALATION,
  FL_UTILITY_RATE,
} from "@/data/solarHardware";

export type FinanceMode = "cash" | "loan" | "ppa";

export interface FinanceInputs {
  mode: FinanceMode;
  /** Installed price before incentives */
  installed: number;
  /** Annual DC→AC delivered energy in year 1 */
  yearOneKwh: number;
  /** Household annual consumption, for the offset */
  householdKwh: number;
  /** Retail utility rate, $/kWh */
  utilityRate: number;
  /** Utility escalation per year, e.g. 0.031 */
  escalation: number;
  /** Module degradation per year, e.g. 0.005 */
  degradation: number;
  /** Federal investment tax credit rate — 0 to opt out */
  itcRate: number;
  /** Loan only — annual percentage rate */
  apr: number;
  /** Loan only — term in years */
  termYears: number;
  /** Loan only — cash down */
  down: number;
  /** PPA only — price per kWh in year 1 */
  ppaRate: number;
  /** PPA only — annual price escalator */
  ppaEscalator: number;
  /** Study horizon, years */
  horizon: number;
  /** Annual operations and maintenance, year-1 dollars */
  annualOandM: number;
  /** Discount rate used for NPV and LCOE */
  discountRate: number;
}

export const DEFAULT_FINANCE: FinanceInputs = {
  mode: "cash",
  installed: 37000,
  yearOneKwh: 18000,
  householdKwh: 23000,
  utilityRate: FL_UTILITY_RATE,
  escalation: UTILITY_ESCALATION,
  degradation: PANEL_DEGRADATION,
  itcRate: FEDERAL_CREDIT_RATE,
  apr: 0.0699,
  termYears: 25,
  down: 0,
  ppaRate: 0.115,
  ppaEscalator: 0.029,
  horizon: 25,
  annualOandM: 140,
  discountRate: 0.05,
};

export interface CashFlowYear {
  year: number;
  kwh: number;
  utilityRate: number;
  /** Value of the energy the array delivers this year */
  billOffset: number;
  /** What the homeowner pays this year for the system (loan or PPA) */
  systemCost: number;
  /** Incentives received this year */
  incentives: number;
  /** billOffset − systemCost − O&M + incentives */
  net: number;
  cumulative: number;
}

export interface FinanceRead {
  mode: FinanceMode;
  installed: number;
  itc: number;
  netCost: number;
  costPerWattNote: string;
  /** Level payment for a loan, per month */
  monthlyPayment: number;
  years: CashFlowYear[];
  /** First year the cumulative position turns positive */
  paybackYears: number | null;
  /** Sum of net cash flow over the horizon */
  netBenefit: number;
  /** Discounted net benefit */
  npv: number;
  /** Internal rate of return on the net cash flow, or null when undefined */
  irr: number | null;
  /** Levelised cost of the energy delivered, $/kWh */
  lcoe: number;
  /** Year-1 utility rate for comparison against LCOE */
  utilityRateYearOne: number;
  offsetPercent: number;
  /** Total energy delivered across the horizon */
  lifetimeKwh: number;
  /** Total value of the energy across the horizon */
  lifetimeValue: number;
}

const level = (principal: number, apr: number, years: number): number => {
  if (principal <= 0 || years <= 0) return 0;
  const r = apr / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - (1 + r) ** -n);
};

const npvOf = (flows: number[], rate: number): number =>
  flows.reduce((sum, f, i) => sum + f / (1 + rate) ** (i + 1), 0);

/** Bisection IRR — robust and dependency-free over the sign range we care about. */
const irrOf = (flows: number[]): number | null => {
  const f = (r: number) => npvOf(flows, r);
  let lo = -0.9;
  let hi = 1.5;
  if (f(lo) * f(hi) > 0) return null;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return Math.round(((lo + hi) / 2) * 1000) / 1000;
};

export const runFinance = (input: FinanceInputs): FinanceRead => {
  const i = { ...DEFAULT_FINANCE, ...input };
  const horizon = Math.max(1, Math.round(i.horizon));

  const itc = i.mode === "ppa" ? 0 : Math.round(i.installed * i.itcRate);
  const financed = i.mode === "loan" ? Math.max(0, i.installed - i.down) : 0;
  const monthlyPayment = i.mode === "loan" ? level(financed, i.apr, i.termYears) : 0;

  const years: CashFlowYear[] = [];
  let cumulative = i.mode === "cash" ? -i.installed : i.mode === "loan" ? -i.down : 0;
  const opening = cumulative;

  let lifetimeKwh = 0;
  let lifetimeValue = 0;
  const costFlows: number[] = [];
  const energyFlows: number[] = [];
  const netFlows: number[] = [];

  for (let y = 1; y <= horizon; y++) {
    const kwh = i.yearOneKwh * (1 - i.degradation) ** (y - 1);
    const rate = i.utilityRate * (1 + i.escalation) ** (y - 1);
    const billOffset = kwh * rate;

    let systemCost = 0;
    if (i.mode === "loan" && y <= i.termYears) systemCost = monthlyPayment * 12;
    if (i.mode === "ppa") systemCost = kwh * i.ppaRate * (1 + i.ppaEscalator) ** (y - 1);

    const oAndM = i.mode === "ppa" ? 0 : i.annualOandM * (1 + 0.02) ** (y - 1);
    const incentives = y === 1 ? itc : 0;

    const net = billOffset - systemCost - oAndM + incentives;
    cumulative += net;

    lifetimeKwh += kwh;
    lifetimeValue += billOffset;
    costFlows.push(systemCost + oAndM);
    energyFlows.push(kwh);
    netFlows.push(net);

    years.push({
      year: y,
      kwh: Math.round(kwh),
      utilityRate: Math.round(rate * 10000) / 10000,
      billOffset: Math.round(billOffset),
      systemCost: Math.round(systemCost),
      incentives,
      net: Math.round(net),
      cumulative: Math.round(cumulative),
    });
  }

  const crossing = years.find((r) => r.cumulative >= 0);
  let paybackYears: number | null = null;
  if (crossing) {
    const prev = years[crossing.year - 2];
    const before = prev ? prev.cumulative : opening;
    const gain = crossing.cumulative - before;
    paybackYears = gain > 0 ? Math.round((crossing.year - 1 + -before / gain) * 10) / 10 : crossing.year;
  }

  /* LCOE — discounted lifecycle cost over discounted energy, the NREL form. */
  const upfront = i.mode === "cash" ? i.installed - itc : i.mode === "loan" ? i.down - itc : 0;
  const discountedCost = upfront + npvOf(costFlows, i.discountRate);
  const discountedEnergy = npvOf(energyFlows, i.discountRate);
  const lcoe = discountedEnergy > 0 ? discountedCost / discountedEnergy : 0;

  const irrFlows = [...netFlows];
  const irr = i.mode === "cash" || i.mode === "loan" ? irrOf([opening + irrFlows[0], ...irrFlows.slice(1)]) : null;

  const netCost = i.mode === "ppa" ? 0 : i.installed - itc;

  return {
    mode: i.mode,
    installed: Math.round(i.installed),
    itc,
    netCost: Math.round(netCost),
    costPerWattNote: "installed price ÷ DC watts",
    monthlyPayment: Math.round(monthlyPayment),
    years,
    paybackYears,
    netBenefit: Math.round(cumulative),
    npv: Math.round(opening + npvOf(netFlows, i.discountRate)),
    irr,
    lcoe: Math.round(lcoe * 10000) / 10000,
    utilityRateYearOne: i.utilityRate,
    offsetPercent: i.householdKwh > 0 ? Math.round((i.yearOneKwh / i.householdKwh) * 100) : 0,
    lifetimeKwh: Math.round(lifetimeKwh),
    lifetimeValue: Math.round(lifetimeValue),
  };
};

/* ── sensitivity ──────────────────────────────────────────────────────── */

export interface SensitivityRow {
  id: string;
  label: string;
  /** The swing applied, printed */
  swing: string;
  lowPayback: number | null;
  highPayback: number | null;
  lowNet: number;
  highNet: number;
}

/**
 * One-at-a-time sensitivity. Each driver is pushed down and up by a realistic
 * amount and the payback and lifetime net position are re-solved, so the reader
 * sees which assumption actually moves the deal.
 */
export const runSensitivity = (base: FinanceInputs): SensitivityRow[] => {
  const drivers: Array<{ id: string; label: string; swing: string; low: Partial<FinanceInputs>; high: Partial<FinanceInputs> }> = [
    {
      id: "production",
      label: "Annual production",
      swing: "±10%",
      low: { yearOneKwh: base.yearOneKwh * 0.9 },
      high: { yearOneKwh: base.yearOneKwh * 1.1 },
    },
    {
      id: "price",
      label: "Installed price",
      swing: "±10%",
      low: { installed: base.installed * 1.1 },
      high: { installed: base.installed * 0.9 },
    },
    {
      id: "rate",
      label: "Utility rate",
      swing: "±2¢/kWh",
      low: { utilityRate: Math.max(0.04, base.utilityRate - 0.02) },
      high: { utilityRate: base.utilityRate + 0.02 },
    },
    {
      id: "escalation",
      label: "Rate escalation",
      swing: "1% ↔ 5%",
      low: { escalation: 0.01 },
      high: { escalation: 0.05 },
    },
    {
      id: "itc",
      label: "Federal credit",
      swing: "0% ↔ 30%",
      low: { itcRate: 0 },
      high: { itcRate: 0.3 },
    },
    {
      id: "degradation",
      label: "Module degradation",
      swing: "0.25% ↔ 0.8%",
      low: { degradation: 0.008 },
      high: { degradation: 0.0025 },
    },
  ];

  return drivers.map((d) => {
    const low = runFinance({ ...base, ...d.low });
    const high = runFinance({ ...base, ...d.high });
    return {
      id: d.id,
      label: d.label,
      swing: d.swing,
      lowPayback: low.paybackYears,
      highPayback: high.paybackYears,
      lowNet: low.netBenefit,
      highNet: high.netBenefit,
    };
  });
};

/* ── offset ladder ────────────────────────────────────────────────────── */

export interface OffsetRung {
  /** Target share of household consumption */
  target: number;
  kwh: number;
  kwDc: number;
  panels: number;
  /** True when the roof cannot physically reach this rung */
  beyondRoof: boolean;
  installed: number;
  netCost: number;
  paybackYears: number | null;
  netBenefit: number;
}

/**
 * The 50 / 80 / 100 / 120% conversation, priced. Sizing is scaled linearly from
 * the measured array — the specific yield and the cost per watt of the real
 * design are held constant, which is how a dealer actually re-sizes a proposal.
 */
export const buildOffsetLadder = (opts: {
  base: FinanceInputs;
  /** Panels the roof can actually hold */
  maxPanels: number;
  panelWatts: number;
  /** kWh per installed kW per year, from the measured design */
  specificYield: number;
  /** Installed $ per watt from the real BOM */
  pricePerWatt: number;
  targets?: number[];
}): OffsetRung[] => {
  const { base, maxPanels, panelWatts, specificYield, pricePerWatt } = opts;
  const targets = opts.targets ?? [0.5, 0.8, 1, 1.2];

  return targets.map((target) => {
    const wantKwh = base.householdKwh * target;
    const wantKw = specificYield > 0 ? wantKwh / specificYield : 0;
    const wantPanels = panelWatts > 0 ? Math.ceil((wantKw * 1000) / panelWatts) : 0;
    const beyondRoof = wantPanels > maxPanels;
    const panels = Math.min(wantPanels, maxPanels);
    const kwDc = (panels * panelWatts) / 1000;
    const kwh = Math.round(kwDc * specificYield);
    const installed = Math.round(kwDc * 1000 * pricePerWatt);
    const read = runFinance({ ...base, installed, yearOneKwh: kwh });
    return {
      target,
      kwh,
      kwDc: Math.round(kwDc * 100) / 100,
      panels,
      beyondRoof,
      installed,
      netCost: read.netCost,
      paybackYears: read.paybackYears,
      netBenefit: read.netBenefit,
    };
  });
};

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const cents = (n: number) => `${(n * 100).toFixed(1)}¢`;
