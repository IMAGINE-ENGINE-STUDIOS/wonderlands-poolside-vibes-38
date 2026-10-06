// Solar quote — suggested line items for the sales rep.
// Suggestions come only from the rates in src/data/solarHardware.ts (the same
// numbers the Solar Board uses). The rep can change every line afterwards.

import {
  solarPanels, solarBatteries, rackingByCovering, electricalRates, FEDERAL_CREDIT_RATE,
  panelFullName, type RoofCovering,
} from "@/data/solarHardware";

export interface SolarQuoteLine { id: string; group: string; item: string; qty: number; unitPrice: number; note?: string }

export interface SolarQuoteInputs {
  kwDc: number;
  panelId: string;
  covering: RoofCovering;
  batteryId: string;
  /** Feet from equipment wall to the service panel */
  serviceRunFt: number;
}

export const DEFAULT_SOLAR_INPUTS: SolarQuoteInputs = {
  kwDc: 9, panelId: solarPanels[0].id, covering: "shingle", batteryId: "battery-none", serviceRunFt: 40,
};

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export const lineTotal = (l: SolarQuoteLine) => Math.round((Number(l.qty) || 0) * (Number(l.unitPrice) || 0));
export const linesTotal = (ls: SolarQuoteLine[]) => ls.reduce((s, l) => s + lineTotal(l), 0);
export const federalCredit = (installed: number) => Math.round(installed * FEDERAL_CREDIT_RATE);

/** Suggested bill of materials for a system of the given size. */
export const suggestSolarLines = (inp: SolarQuoteInputs): SolarQuoteLine[] => {
  const panel = solarPanels.find((p) => p.id === inp.panelId) ?? solarPanels[0];
  const battery = solarBatteries.find((b) => b.id === inp.batteryId) ?? solarBatteries[0];
  const rack = rackingByCovering[inp.covering];
  const panels = Math.max(1, Math.ceil((inp.kwDc * 1000) / panel.watts));
  const kwDc = (panels * panel.watts) / 1000;
  const kwAc = Math.max(3.8, Math.round(kwDc * 0.87 * 10) / 10);
  const railFt = Math.round(panels * panel.widthFt * 2);
  const dcWireFt = Math.round(panels * 12 + 60);
  const e = electricalRates;
  const lines: SolarQuoteLine[] = [
    { id: uid(), group: "Array", item: `${panelFullName(panel)} modules`, qty: panels, unitPrice: Math.round(panel.watts * panel.pricePerWatt), note: `${kwDc.toFixed(2)} kW DC · ${panel.warrantyYears}-yr manufacturer warranty` },
    { id: uid(), group: "Racking", item: `${rack.label} — ${rack.anchor}`, qty: panels * rack.anchorsPerPanel, unitPrice: rack.costPerAnchor, note: rack.windNote },
    { id: uid(), group: "Racking", item: "Mounting rail", qty: railFt, unitPrice: rack.railCostPerFt },
  ];
  if (rack.tiltKitPerPanel) lines.push({ id: uid(), group: "Racking", item: "Tilt kit / ballast", qty: panels, unitPrice: rack.tiltKitPerPanel });
  lines.push(
    { id: uid(), group: "Electrical", item: `String inverter (${kwAc} kW AC)`, qty: kwAc, unitPrice: e.inverterPerKwAc },
    { id: uid(), group: "Electrical", item: "Rapid-shutdown devices (NEC 690.12)", qty: panels, unitPrice: e.rapidShutdownPerPanel },
    { id: uid(), group: "Electrical", item: "PV wire", qty: dcWireFt, unitPrice: e.dcWirePerFt },
    { id: uid(), group: "Electrical", item: "AC feeder to service panel", qty: inp.serviceRunFt, unitPrice: e.acFeederPerFt },
    { id: uid(), group: "Electrical", item: "Conduit, installed", qty: inp.serviceRunFt + 30, unitPrice: e.conduitPerFt },
    { id: uid(), group: "Electrical", item: "Combiner, DC & AC disconnects", qty: 1, unitPrice: e.combinerBox + e.dcDisconnect + e.acDisconnect },
    { id: uid(), group: "Electrical", item: "Production meter socket & backfed breaker", qty: 1, unitPrice: e.productionMeter + e.backfedBreaker },
    { id: uid(), group: "Electrical", item: "Grounding, labels & connectors", qty: panels, unitPrice: e.balancePerPanel },
  );
  if (battery.price > 0) {
    lines.push(
      { id: uid(), group: "Storage", item: `${battery.name} (${battery.usableKwh} kWh)`, qty: 1, unitPrice: battery.price, note: battery.note },
      { id: uid(), group: "Storage", item: "Critical-load subpanel", qty: 1, unitPrice: e.criticalLoadPanel },
    );
  }
  lines.push(
    { id: uid(), group: "Soft costs", item: "Monitoring gateway & commissioning", qty: 1, unitPrice: e.monitoringGateway },
    { id: uid(), group: "Soft costs", item: "Engineering, permit & interconnection", qty: 1, unitPrice: e.permitPackage },
  );
  return lines;
};

export const newSolarLine = (): SolarQuoteLine => ({ id: uid(), group: "Other", item: "New line", qty: 1, unitPrice: 0 });
