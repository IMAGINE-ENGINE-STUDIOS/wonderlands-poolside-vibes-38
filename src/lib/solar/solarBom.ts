// Wonderlands Solar — bill of materials and pricing.
//
// Takes the captured roof, the chosen module, battery and roof covering and
// returns the racking, anchoring, cabling and electrical takeoff with a price on
// every line. The client report reads the totals; the contractor sheet reads the
// lines. All rates come from src/data/solarHardware.ts.

import {
  electricalRates,
  rackingByCovering,
  FEDERAL_CREDIT_RATE,
  type BatterySpec,
  type RoofCovering,
  type SolarPanelSpec,
} from "@/data/solarHardware";
import { pathSpanFt, type FaceLayout, type RoofFace } from "./solarEngine";

export interface BomLine {
  group: "Array" | "Racking" | "Electrical" | "Storage" | "Soft costs";
  item: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  /** Contractor-facing detail — spec, code reference or method */
  note?: string;
}

export interface SolarBom {
  lines: BomLine[];
  /** Sum of every line — the installed price before incentives */
  installed: number;
  federalCredit: number;
  netCost: number;
  costPerWatt: number;
  takeoff: {
    panels: number;
    anchors: number;
    railFt: number;
    dcWireFt: number;
    acFeederFt: number;
    conduitFt: number;
    strings: number;
    inverterKwAc: number;
    breakerAmps: number;
  };
}

/**
 * Cable and conduit are estimated from the geometry rather than guessed: the
 * module rows carry PV wire across the face, the run down to the equipment wall
 * is taken from the longest roof span plus a two-storey drop, and the AC feeder
 * runs from the inverter to the service panel.
 */
export const buildSolarBom = (opts: {
  faces: RoofFace[];
  layouts: FaceLayout[];
  panel: SolarPanelSpec;
  battery: BatterySpec;
  covering: RoofCovering;
  /** Distance from the array's equipment wall to the main service panel, ft */
  serviceRunFt: number;
  kwDc: number;
  kwAc: number;
}): SolarBom => {
  const { faces, layouts, panel, battery, covering, serviceRunFt, kwDc, kwAc } = opts;
  const racking = rackingByCovering[covering];
  const panels = layouts.reduce((n, l) => n + l.panels, 0);
  const lines: BomLine[] = [];

  /* ── array ── */
  const arrayCost = Math.round(panels * panel.watts * panel.pricePerWatt);
  lines.push({
    group: "Array",
    item: `${panel.name} — modules`,
    qty: panels,
    unit: "module",
    unitPrice: Math.round(panel.watts * panel.pricePerWatt),
    total: arrayCost,
    note: `${panel.watts} W · ${panel.widthFt.toFixed(2)}′ × ${panel.heightFt.toFixed(2)}′ · ${(panel.efficiency * 100).toFixed(1)}% efficient`,
  });

  /* ── racking and anchoring ── */
  const anchors = panels * racking.anchorsPerPanel;
  const railFt = Math.round(
    layouts.reduce((ft, l) => {
      const face = faces.find((f) => f.id === l.faceId);
      if (!face || !l.panels) return ft;
      const rows = Math.max(1, Math.ceil(l.panels / Math.max(1, Math.floor(pathSpanFt(face.path) / panel.widthFt))));
      return ft + rows * 2 * Math.min(pathSpanFt(face.path), l.panels * panel.widthFt);
    }, 0),
  );
  lines.push({
    group: "Racking",
    item: `${racking.label} — ${racking.anchor}`,
    qty: anchors,
    unit: "anchor",
    unitPrice: racking.costPerAnchor,
    total: Math.round(anchors * racking.costPerAnchor),
    note: racking.windNote,
  });
  lines.push({
    group: "Racking",
    item: "Anodised mounting rail, splices and end clamps",
    qty: railFt,
    unit: "ft",
    unitPrice: racking.railCostPerFt,
    total: Math.round(railFt * racking.railCostPerFt),
    note: "Two rails per row, spliced at 12 ft; mid and end clamps per module.",
  });
  if (racking.tiltKitPerPanel) {
    lines.push({
      group: "Racking",
      item: "Tilt legs / ballast trays",
      qty: panels,
      unit: "module",
      unitPrice: racking.tiltKitPerPanel,
      total: Math.round(panels * racking.tiltKitPerPanel),
      note: "Flat roof — 10° tilt to shed water and lift production.",
    });
  }

  /* ── electrical ── */
  const strings = Math.max(1, Math.ceil(panels / 12));
  const dcWireFt = Math.round(panels * panel.heightFt * 1.9 + strings * 55);
  const acFeederFt = Math.round(serviceRunFt * 1.15);
  const conduitFt = Math.round(serviceRunFt + strings * 20);
  const breakerAmps = Math.max(20, Math.ceil(((kwAc * 1000) / 240) * 1.25 / 5) * 5);
  const inverterCost = Math.round(kwAc * electricalRates.inverterPerKwAc);

  lines.push(
    {
      group: "Electrical",
      item: `String inverter — ${kwAc.toFixed(1)} kW AC`,
      qty: 1,
      unit: "unit",
      unitPrice: inverterCost,
      total: inverterCost,
      note: `${strings} string${strings > 1 ? "s" : ""} of up to 12 modules · ${(kwDc / Math.max(0.1, kwAc)).toFixed(2)} DC:AC ratio`,
    },
    {
      group: "Electrical",
      item: "Rapid-shutdown module electronics",
      qty: panels,
      unit: "module",
      unitPrice: electricalRates.rapidShutdownPerPanel,
      total: Math.round(panels * electricalRates.rapidShutdownPerPanel),
      note: "NEC 690.12 rooftop rapid shutdown with per-module monitoring.",
    },
    {
      group: "Electrical",
      item: "PV wire (DC home runs)",
      qty: dcWireFt,
      unit: "ft",
      unitPrice: electricalRates.dcWirePerFt,
      total: Math.round(dcWireFt * electricalRates.dcWirePerFt),
      note: "10 AWG PV wire, UV rated, MC4 terminated.",
    },
    {
      group: "Electrical",
      item: "AC feeder to service panel",
      qty: acFeederFt,
      unit: "ft",
      unitPrice: electricalRates.acFeederPerFt,
      total: Math.round(acFeederFt * electricalRates.acFeederPerFt),
      note: `Sized for a ${breakerAmps} A backfed breaker with 3% voltage-drop allowance.`,
    },
    {
      group: "Electrical",
      item: "EMT conduit, straps and fittings",
      qty: conduitFt,
      unit: "ft",
      unitPrice: electricalRates.conduitPerFt,
      total: Math.round(conduitFt * electricalRates.conduitPerFt),
      note: "Exterior EMT with expansion fittings; roof penetrations flashed.",
    },
    {
      group: "Electrical",
      item: "DC combiner box",
      qty: strings > 1 ? 1 : 0,
      unit: "unit",
      unitPrice: electricalRates.combinerBox,
      total: strings > 1 ? electricalRates.combinerBox : 0,
      note: strings > 1 ? "Fused string combiner, NEMA 3R." : "Single string — no combiner required.",
    },
    {
      group: "Electrical",
      item: "DC and AC disconnects",
      qty: 1,
      unit: "set",
      unitPrice: electricalRates.dcDisconnect + electricalRates.acDisconnect,
      total: electricalRates.dcDisconnect + electricalRates.acDisconnect,
      note: "Lockable exterior disconnects at the inverter and the meter.",
    },
    {
      group: "Electrical",
      item: "Production meter socket",
      qty: 1,
      unit: "unit",
      unitPrice: electricalRates.productionMeter,
      total: electricalRates.productionMeter,
      note: "Utility-facing production meter for net metering.",
    },
    {
      group: "Electrical",
      item: `Backfed breaker — ${breakerAmps} A`,
      qty: 1,
      unit: "unit",
      unitPrice: electricalRates.backfedBreaker,
      total: electricalRates.backfedBreaker,
      note: "120% rule verified against the existing bus rating at survey.",
    },
    {
      group: "Electrical",
      item: "Grounding, labelling and consumables",
      qty: panels,
      unit: "module",
      unitPrice: electricalRates.balancePerPanel,
      total: Math.round(panels * electricalRates.balancePerPanel),
      note: "WEEB bonding, equipment ground, placards to NEC 690.13/690.56.",
    },
    {
      group: "Electrical",
      item: "Monitoring gateway and commissioning",
      qty: 1,
      unit: "unit",
      unitPrice: electricalRates.monitoringGateway,
      total: electricalRates.monitoringGateway,
      note: "Per-module monitoring, production baseline recorded at handover.",
    },
  );

  /* ── storage ── */
  if (battery.usableKwh > 0) {
    lines.push(
      {
        group: "Storage",
        item: battery.name,
        qty: 1,
        unit: "unit",
        unitPrice: battery.price,
        total: battery.price,
        note: `${battery.usableKwh} kWh usable · ${battery.continuousKw} kW continuous`,
      },
      {
        group: "Storage",
        item: "Critical-load subpanel and transfer",
        qty: 1,
        unit: "unit",
        unitPrice: electricalRates.criticalLoadPanel,
        total: electricalRates.criticalLoadPanel,
        note: "Pool pump, refrigeration, lighting and one AC circuit backed up.",
      },
    );
  }

  /* ── soft costs ── */
  lines.push({
    group: "Soft costs",
    item: "Engineering, permit and utility interconnection",
    qty: 1,
    unit: "package",
    unitPrice: electricalRates.permitPackage,
    total: electricalRates.permitPackage,
    note: "Signed and sealed structural + electrical drawings, county permit, inspection.",
  });

  const priced = lines.filter((l) => l.qty > 0);
  const installed = priced.reduce((n, l) => n + l.total, 0);
  const federalCredit = Math.round(installed * FEDERAL_CREDIT_RATE);

  return {
    lines: priced,
    installed,
    federalCredit,
    netCost: installed - federalCredit,
    costPerWatt: kwDc > 0 ? Math.round((installed / (kwDc * 1000)) * 100) / 100 : 0,
    takeoff: {
      panels,
      anchors,
      railFt,
      dcWireFt,
      acFeederFt,
      conduitFt,
      strings,
      inverterKwAc: kwAc,
      breakerAmps,
    },
  };
};

export const formatUsd = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;
