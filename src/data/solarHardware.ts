// Wonderlands Solar — hardware catalogue for the Total Solar Calculator.
//
// Every rate the calculator uses lives here so nothing is invented at render
// time: panels, batteries, racking and anchoring by roof covering, and the
// electrical bill of materials. Prices are installed Florida prices unless the
// line is marked as material only.

export type RoofCovering = "shingle" | "tile" | "metal-standing-seam" | "metal-5v" | "flat-concrete" | "flat-membrane";

export interface SolarPanelSpec {
  id: string;
  name: string;
  /** Nameplate DC watts */
  watts: number;
  /** Module size in feet */
  widthFt: number;
  heightFt: number;
  efficiency: number;
  /** Installed turnkey price per watt, everything in (module, labour, permit) */
  pricePerWatt: number;
  warrantyYears: number;
  note: string;
}

/** The three modules Wonderlands installs, cheapest per watt first. */
export const solarPanels: SolarPanelSpec[] = [
  {
    id: "panel-400",
    name: "Wonderlands 400 W All-Black",
    watts: 400,
    widthFt: 3.42,
    heightFt: 5.63,
    efficiency: 0.206,
    pricePerWatt: 3.1,
    warrantyYears: 25,
    note: "The house standard — all-black monocrystalline, flush mounted.",
  },
  {
    id: "panel-450",
    name: "Wonderlands 450 W Signature",
    watts: 450,
    widthFt: 3.48,
    heightFt: 6.2,
    efficiency: 0.219,
    pricePerWatt: 3.35,
    warrantyYears: 25,
    note: "More watts per square foot — for roofs where space is the limit.",
  },
  {
    id: "panel-500",
    name: "Wonderlands 500 W Estate",
    watts: 500,
    widthFt: 3.72,
    heightFt: 7.55,
    efficiency: 0.228,
    pricePerWatt: 3.55,
    warrantyYears: 30,
    note: "Estate-scale module with a thirty-year performance warranty.",
  },
];

export interface BatterySpec {
  id: string;
  name: string;
  usableKwh: number;
  continuousKw: number;
  price: number;
  note: string;
}

export const solarBatteries: BatterySpec[] = [
  { id: "battery-none", name: "No battery", usableKwh: 0, continuousKw: 0, price: 0, note: "Grid-tied with 1:1 net metering." },
  { id: "battery-single", name: "WonderWall Battery", usableKwh: 13.5, continuousKw: 5, price: 12900, note: "Pool, refrigeration and lighting through an outage." },
  { id: "battery-duo", name: "WonderWall Battery · Duo", usableKwh: 27, continuousKw: 10, price: 24500, note: "Whole-home backup including air conditioning." },
];

export interface RackingSpec {
  label: string;
  /** How the array is anchored into this covering */
  anchor: string;
  /** Anchors per panel — tile and 5V metal need more penetrations */
  anchorsPerPanel: number;
  /** Installed cost per anchor (flashing, sealant, labour) */
  costPerAnchor: number;
  /** Installed cost per foot of rail */
  railCostPerFt: number;
  /** Ballast or tilt-leg surcharge per panel on flat roofs */
  tiltKitPerPanel: number;
  /** Florida wind-load note printed on the contractor sheet */
  windNote: string;
}

/** Racking and anchoring per roof covering — this is what the roof type drives. */
export const rackingByCovering: Record<RoofCovering, RackingSpec> = {
  shingle: {
    label: "Asphalt shingle",
    anchor: "Lag-bolt flashed mount into rafter",
    anchorsPerPanel: 2,
    costPerAnchor: 46,
    railCostPerFt: 9.5,
    tiltKitPerPanel: 0,
    windNote: "Flashed penetrations at every rafter, 16 in on centre, sealed to FBC 7th ed.",
  },
  tile: {
    label: "Concrete or clay tile",
    anchor: "Tile hook with replacement pan and re-bedded tile",
    anchorsPerPanel: 3,
    costPerAnchor: 78,
    railCostPerFt: 11,
    tiltKitPerPanel: 0,
    windNote: "Tile hooks with lifted and re-bedded tile; broken tile replacement allowance included.",
  },
  "metal-standing-seam": {
    label: "Standing-seam metal",
    anchor: "Non-penetrating seam clamp",
    anchorsPerPanel: 2,
    costPerAnchor: 52,
    railCostPerFt: 9,
    tiltKitPerPanel: 0,
    windNote: "Seam clamps — no penetrations, roof warranty preserved.",
  },
  "metal-5v": {
    label: "5V crimp / corrugated metal",
    anchor: "Butyl-sealed rib mount through purlin",
    anchorsPerPanel: 3,
    costPerAnchor: 58,
    railCostPerFt: 9,
    tiltKitPerPanel: 0,
    windNote: "Rib-crown mounts into purlins with butyl isolation, stainless fasteners.",
  },
  "flat-concrete": {
    label: "Flat concrete deck",
    anchor: "Anchored tilt leg on flashed stanchion",
    anchorsPerPanel: 2,
    costPerAnchor: 84,
    railCostPerFt: 12,
    tiltKitPerPanel: 96,
    windNote: "10° tilt legs on anchored stanchions, engineered uplift calc per FBC.",
  },
  "flat-membrane": {
    label: "Flat TPO / modified bitumen",
    anchor: "Ballasted tray with membrane pad",
    anchorsPerPanel: 1,
    costPerAnchor: 68,
    railCostPerFt: 11,
    tiltKitPerPanel: 110,
    windNote: "Ballasted trays with slip pads; roofer-certified patches at every penetration.",
  },
};

export const roofCoverings = Object.keys(rackingByCovering) as RoofCovering[];

/** Balance-of-system line items — material and labour, priced per unit. */
export const electricalRates = {
  /** PV wire between modules and the inverter */
  dcWirePerFt: 1.35,
  /** AC feeder from inverter to the service panel */
  acFeederPerFt: 4.2,
  /** EMT conduit run, installed */
  conduitPerFt: 6.8,
  /** Rooftop rapid-shutdown optimiser per module (NEC 690.12) */
  rapidShutdownPerPanel: 78,
  /** String inverter, per kW AC */
  inverterPerKwAc: 320,
  /** Combiner box with fused strings */
  combinerBox: 460,
  /** Exterior DC and AC disconnects */
  dcDisconnect: 240,
  acDisconnect: 265,
  /** Utility-facing production meter socket */
  productionMeter: 310,
  /** Backfed breaker in the main panel */
  backfedBreaker: 145,
  /** Battery transfer / critical-load subpanel */
  criticalLoadPanel: 1250,
  /** Grounding, labels, MC4s, misc consumables per panel */
  balancePerPanel: 34,
  /** Monitoring gateway and commissioning */
  monitoringGateway: 420,
  /** Engineering, permit and interconnection package */
  permitPackage: 1850,
} as const;

/** Federal residential clean-energy credit applied to the client report. */
export const FEDERAL_CREDIT_RATE = 0.3;

/** Florida blended residential utility rate, $/kWh — used for savings. */
export const FL_UTILITY_RATE = 0.166;

/** Annual utility escalation used on the 25-year ledger. */
export const UTILITY_ESCALATION = 0.031;

/** Annual module degradation. */
export const PANEL_DEGRADATION = 0.005;
