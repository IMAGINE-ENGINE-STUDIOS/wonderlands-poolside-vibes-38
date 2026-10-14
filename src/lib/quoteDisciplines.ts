// One registry for every quoted discipline: the quote title, the "What's
// included" list and the warranty lines that belong to THAT product only.
// SurveyQuoteTool reads this instead of hard-coding pool copy, so saunas,
// fences, covers, enclosures, pavers, turf, gates and solar each print their
// own inclusions and warranties. Every text stays editable in the quote's
// passcode edit mode.

export type Discipline =
  | "pool" | "lanai" | "solar" | "sauna" | "enclosure" | "fencing" | "gate"
  | "cover" | "paver" | "turf" | "liner" | "finish" | "landscaping" | "general";

export interface WarrantyLine { label: string; term: string; note?: string }

export interface DisciplineConfig {
  title: string;
  subtitle: string;
  includesTitle: string;
  includes: string[];
  warranties: WarrantyLine[];
  disclaimer: string;
}

interface Ctx {
  pool?: unknown;
  customProduct?: { type?: string; name?: string } | null;
  extras?: { productType?: string; enclosure?: unknown } | null;
}

export const resolveDiscipline = ({ pool, customProduct, extras }: Ctx): Discipline => {
  const pt = String(extras?.productType || "").toLowerCase();
  const t = String(customProduct?.type || "").toLowerCase();
  const n = String(customProduct?.name || "").toLowerCase();
  if (pt === "lanai") return "lanai";
  if (pt === "solar" || t === "solar" || t.startsWith("solar")) return "solar";
  if (pt === "sauna" || t === "sauna") return "sauna";
  if (pool || ["pool", "spa", "tanning ledge"].includes(t)) return "pool";
  if (extras?.enclosure || t.includes("enclosure")) return "enclosure";
  if (t.includes("gate")) return "gate";
  if (t.includes("fenc")) return "fencing";
  if (t.includes("cover")) return "cover";
  if (t.includes("paver") || t.includes("travertine")) return "paver";
  if (t.includes("grass") || t.includes("turf")) return "turf";
  if (t.includes("landscap") || t.includes("plant")) return "landscaping";
  if (t.includes("liner")) return "liner";
  if (t.includes("finish") || t.includes("tile")) return "finish";
  if (/solar|wonderwall|inverter/.test(n)) return "solar";
  return "general";
};

const STD = "Design, permitting and installation are included unless the project scope is modified.";

export const DISCIPLINES: Record<Exclude<Discipline, "pool" | "lanai">, DisciplineConfig> = {
  solar: {
    title: "SOLAR ENERGY QUOTATION",
    subtitle: "Engineered, Permitted & Interconnected in Florida",
    includesTitle: "EVERY SOLAR SYSTEM INCLUDES",
    includes: [
      "Shade study and roof layout",
      "PE-sealed structural and electrical plans",
      "County permit and utility interconnection (net metering)",
      "Rapid-shutdown equipment per NEC 690.12",
      "Disconnects, conduit, wiring and service-panel tie-in",
      "Monitoring gateway, app setup and commissioning",
      "Final inspection and permission-to-operate support",
    ],
    warranties: [
      { label: "Panel performance", term: "Per manufacturer (25–40 years)", note: "Linear power-output guarantee from the module maker." },
      { label: "Panel product", term: "Per manufacturer (25 years typical)", note: "Defects in cells, frame and junction box." },
      { label: "Inverter & electronics", term: "10 years", note: "Manufacturer coverage; extendable where offered." },
      { label: "Battery storage", term: "10 years", note: "Applies only when a battery is on this quote." },
      { label: "Roof penetrations & workmanship", term: "10 years", note: "Flashed, sealed attachments installed by Wonderlands." },
    ],
    disclaimer: "Incentive figures are estimates; the federal credit depends on your tax situation. Final price is confirmed after the site survey.",
  },
  sauna: {
    title: "SAUNA QUOTATION",
    subtitle: "Handcrafted Wellness, Delivered & Installed",
    includesTitle: "EVERY SAUNA INCLUDES",
    includes: [
      "Kiln-dried wood construction & stainless hardware",
      "Heater, sauna stones & control unit",
      "Interior lighting and ergonomic benches",
      "Ventilation system",
      "Electrical connection and first-fire test",
      "Delivery, permits & professional installation",
    ],
    warranties: [
      { label: "Sauna room", term: "Per manufacturer (limited lifetime on Almost Heaven rooms)", note: "Wood structure against manufacturing defects." },
      { label: "Heater & controls", term: "Per manufacturer (typically 5 years)", note: "Heating elements and control unit." },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  enclosure: {
    title: "SCREEN ENCLOSURE QUOTATION",
    subtitle: "Engineered, Permitted & Installed in Florida",
    includesTitle: "EVERY ENCLOSURE INCLUDES",
    includes: [
      "Engineering and sealed drawings to the Florida Building Code",
      "Permit processing",
      "Extruded aluminum frame, screen and stainless fasteners",
      "Gutters and downspouts where specified",
      "Self-closing, self-latching doors where a pool barrier is required",
      "Delivery and professional installation",
    ],
    warranties: [
      { label: "Aluminum structure", term: "10 years", note: "Frame and connections against structural defects." },
      { label: "Screen mesh", term: "Per manufacturer (typically 3–5 years)" },
      { label: "Installation workmanship", term: "2 years" },
    ],
    disclaimer: STD,
  },
  fencing: {
    title: "FENCING QUOTATION",
    subtitle: "Aluminum Fencing, Measured & Installed",
    includesTitle: "EVERY FENCE INCLUDES",
    includes: [
      "Site measurement and layout",
      "Powder-coated aluminum panels, posts and hardware",
      "Concrete-set or core-drilled posts",
      "Self-closing, self-latching gates where a pool barrier is required",
      "Permit (where required) and professional installation",
    ],
    warranties: [
      { label: "Powder-coat finish & aluminum", term: "Per manufacturer (limited lifetime typical)", note: "Against cracking, peeling and corrosion." },
      { label: "Gate hardware", term: "Per manufacturer" },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  gate: {
    title: "DRIVEWAY GATE QUOTATION",
    subtitle: "Gates, Operators & Access Control",
    includesTitle: "EVERY GATE INCLUDES",
    includes: [
      "Site measurement and gate layout",
      "Gate panels, posts and hardware",
      "Operator, safety sensors and controls where selected",
      "Electrical connection where selected",
      "Professional installation and setup",
    ],
    warranties: [
      { label: "Gate structure & finish", term: "Per manufacturer" },
      { label: "Operator & electronics", term: "Per manufacturer (typically 2–5 years)", note: "Applies only when an operator is on this quote." },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  cover: {
    title: "AUTOMATIC POOL COVER QUOTATION",
    subtitle: "Safety, Heat Retention & Cleaner Water",
    includesTitle: "EVERY COVER INCLUDES",
    includes: [
      "Pool measurement and track layout",
      "Cover fabric, tracks and drive mechanism",
      "Keyed operating switch",
      "Lid or housing as specified",
      "Professional installation and owner walk-through",
    ],
    warranties: [
      { label: "Drive mechanism", term: "Per manufacturer (typically 5 years)" },
      { label: "Cover fabric", term: "Per manufacturer (typically 3–5 years, pro-rated)" },
      { label: "Safety standard", term: "ASTM F1346-91", note: "When installed to the manufacturer's safety specification." },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  paver: {
    title: "PAVER DECK QUOTATION",
    subtitle: "Pavers, Coping & Hardscape",
    includesTitle: "EVERY PAVER DECK INCLUDES",
    includes: [
      "Excavation and compacted base",
      "Edge restraint",
      "Pavers in the selected style and colour",
      "Joint sand and plate compaction",
      "Clean-up and haul-away",
    ],
    warranties: [
      { label: "Pavers", term: "Per manufacturer (lifetime structural on Belgard pavers)" },
      { label: "Installation workmanship", term: "2 years", note: "Settlement and edge-restraint failure." },
    ],
    disclaimer: STD,
  },
  turf: {
    title: "ARTIFICIAL TURF QUOTATION",
    subtitle: "Year-Round Green, No Mowing",
    includesTitle: "EVERY TURF INSTALL INCLUDES",
    includes: [
      "Removal of existing grass",
      "Compacted base and weed barrier",
      "Turf in the selected style",
      "Seaming, nailing and infill",
      "Professional installation and clean-up",
    ],
    warranties: [
      { label: "Turf (UV & fibre)", term: "Per manufacturer (typically 8–15 years)" },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  liner: {
    title: "POOL LINER QUOTATION",
    subtitle: "Vinyl Liner Replacement",
    includesTitle: "EVERY LINER INCLUDES",
    includes: [
      "Pool drain-down and old liner removal",
      "Measurement and custom-fit liner",
      "Floor and wall preparation",
      "New gaskets and faceplates",
      "Installation and refill start-up",
    ],
    warranties: [
      { label: "Liner", term: "Per manufacturer (pro-rated)" },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  finish: {
    title: "POOL FINISH QUOTATION",
    subtitle: "Interior Finish & Tile",
    includesTitle: "EVERY FINISH INCLUDES",
    includes: [
      "Drain-down and surface preparation",
      "Finish or tile in the selected colour",
      "Start-up and water balancing",
      "Clean-up",
    ],
    warranties: [
      { label: "Finish material", term: "Per manufacturer" },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  landscaping: {
    title: "LANDSCAPING QUOTATION",
    subtitle: "Planting Plan, Beds & Irrigation",
    includesTitle: "EVERY LANDSCAPING INSTALL INCLUDES",
    includes: [
      "Scaled planting plan with real mature canopy sizes",
      "Bed preparation, soil amendment and haul-off",
      "Plants in the selected container sizes, set at recommended spacing",
      "Bed surface (mulch, shell, rock or sod) and edging as drawn",
      "Drip / bubbler irrigation extension when selected",
      "Clean-up and watering-in",
    ],
    warranties: [
      { label: "Plant establishment", term: "90 days", note: "Replacement of plants that fail with proper watering." },
      { label: "Irrigation workmanship", term: "1 year" },
      { label: "Installation workmanship", term: "1 year" },
    ],
    disclaimer: STD,
  },
  general: {
    title: "QUOTATION",
    subtitle: "Prepared by Wonderlands World",
    includesTitle: "THIS QUOTE INCLUDES",
    includes: ["Delivery", "Professional installation", "Clean-up"],
    warranties: [{ label: "Products", term: "Per manufacturer" }, { label: "Installation workmanship", term: "1 year" }],
    disclaimer: STD,
  },
};

export const getDisciplineConfig = (d: Discipline): DisciplineConfig | null =>
  d === "pool" || d === "lanai" ? null : DISCIPLINES[d];
