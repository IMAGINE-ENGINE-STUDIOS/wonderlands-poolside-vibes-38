// Solar → Blueprint Builder bridge.
//
// The Blueprint Builder already accepts one hand-off payload from the Global
// Design Board (site geometry, existing areas, scope of work). Solar Genius
// writes into the SAME payload rather than inventing a second channel, so a
// project can arrive at the builder with the pool, the deck AND the electrical
// story intact: array size, the county tariff, the export rule, the incentive
// stack with statutory authority, the permit and interconnection fees, and the
// insurance requirement the utility will ask for at interconnection.
//
// Anything already queued by the global board is preserved — the solar block is
// merged in, never substituted for it.

import { cacheRead, cacheWrite, cacheFlush } from "@/lib/uiCache";
import { BLUEPRINT_HANDOFF_KEY, type BlueprintHandoff } from "@/lib/design/globalDesignProject";
import { DEFAULT_PX_PER_FT } from "@/components/blueprint/SiteDrawingBoard";
import { jurisdictionSheetLines, type JurisdictionEconomics } from "./jurisdictionIncentives";

export interface SolarBlueprintInput {
  address: string;
  economics: JurisdictionEconomics;
  kwDc: number;
  kwAc: number;
  panels: number;
  panelWatts: number;
  yearOneKwh: number;
  installed: number;
  batteryLabel?: string;
  covering?: string;
  serviceRunFt?: number;
}

/** The electrical scope lines printed on the blueprint's scope of work. */
export function solarScopeLines(i: SolarBlueprintInput): string[] {
  const e = i.economics;
  return [
    `PHOTOVOLTAIC ARRAY — ${i.panels} × ${i.panelWatts} W MODULES, ${i.kwDc.toFixed(2)} KW DC / ${i.kwAc.toFixed(2)} KW AC${
      i.covering ? `, ${i.covering.toUpperCase()} ROOF MOUNT` : ""
    }`,
    `MODELLED YIELD — ${Math.round(i.yearOneKwh).toLocaleString()} KWH YEAR ONE${
      i.batteryLabel && i.batteryLabel.toLowerCase() !== "no battery" ? ` · STORAGE ${i.batteryLabel.toUpperCase()}` : ""
    }`,
    i.serviceRunFt ? `DC/AC RUN TO SERVICE PANEL — ${Math.round(i.serviceRunFt)} FT` : "",
    ...jurisdictionSheetLines(e),
  ].filter(Boolean);
}

/** The sheet note block — printed on the electrical sheet of the set. */
export function solarSheetNote(i: SolarBlueprintInput): string {
  const e = i.economics;
  const j = e.jurisdiction;
  return [
    `SOLAR / UTILITY DATA — ${j.county.toUpperCase()} COUNTY`,
    `1. SERVING UTILITY: ${j.utility.toUpperCase()} (${j.utilityKind.toUpperCase()}).`,
    `2. RETAIL ENERGY RATE USED: $${e.rate.toFixed(3)}/KWH. FIXED CUSTOMER CHARGE $${j.fixedMonthlyUsd.toFixed(2)}/MONTH.`,
    `3. EXPORT CREDIT: ${e.exportRuleLabel.toUpperCase()}. BLENDED VALUE OF PRODUCTION $${e.effectiveRate.toFixed(3)}/KWH.`,
    `4. FEDERAL CREDIT AND LOCAL INCENTIVES APPLIED: $${e.incentiveCash.toLocaleString()}. NET INSTALLED $${e.netCost.toLocaleString()}.`,
    `5. FLORIDA SALES TAX EXEMPT PER §212.08(7)(hh) F.S. ASSESSED VALUE EXCLUDED PER §193.624 F.S.`,
    `6. PERMIT FEE $${j.permitFeeUsd.toLocaleString()} · INTERCONNECTION FEE $${j.interconnectFeeUsd.toLocaleString()}.`,
    `7. INTERCONNECTION INSURANCE: ${j.insuranceNote.toUpperCase()}`,
    ...j.penalties.map((p, n) => `${8 + n}. JURISDICTION CAUTION: ${p.toUpperCase()}`),
  ].join("\n");
}

/**
 * Queue the solar study for the Blueprint Builder and return the route to open.
 * Merges into any hand-off already waiting.
 */
export function loadSolarIntoBlueprint(input: SolarBlueprintInput): string {
  const existing = cacheRead<BlueprintHandoff | null>(BLUEPRINT_HANDOFF_KEY, null);
  const scope = solarScopeLines(input);
  const note = solarSheetNote(input);

  const payload: BlueprintHandoff = existing
    ? {
        ...existing,
        stamp: Date.now(),
        scopeOfWork: [...existing.scopeOfWork, ...scope],
        solarNote: note,
      }
    : {
        stamp: Date.now(),
        site: { shapes: [], pxPerFt: DEFAULT_PX_PER_FT },
        existingAreas: { building: 0, driveway: 0, patio: 0 },
        project: {
          title: "WONDERLANDS SOLAR — ELECTRICAL SET",
          clientName: "",
          address: input.address,
          cityStateZip: `${input.economics.jurisdiction.county} County, FL`,
          jobNumber: "00001",
        },
        scopeOfWork: scope,
        solarNote: note,
      };

  cacheWrite(BLUEPRINT_HANDOFF_KEY, payload);
  cacheFlush();
  return "/blueprint-builder";
}
