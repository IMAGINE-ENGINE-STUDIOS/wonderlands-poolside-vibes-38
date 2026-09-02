// Rooftop PV technical-potential reference layer.
//
// Two public sources are folded in as static, offline reference data — no API,
// no key, no latency, and every figure carries its source so the page can be
// cited in front of a customer:
//
//   1. NREL, "Rooftop Solar Photovoltaic Technical Potential in the United
//      States: A Detailed Assessment" (2016) and its published data submission
//      (data.nrel.gov submission 121 — workbook plus small/medium/large building
//      shapefiles). Gagnon, Margolis, Melius, Phillips, Elmore. The submission
//      also underlies Environ. Res. Lett. 13 024027 (2018).
//   2. U.S. Department of Energy, Clean Energy Manufacturing — "Solar Rooftop
//      Potential" (energy.gov/cmei/systems/solar-rooftop-potential).
//
// IMPORTANT FRAMING, taken verbatim in spirit from DOE: technical potential is
// the UPPER LIMIT of what could physically be installed. It is not economic
// potential and not market potential — it ignores cost and availability. Solar
// Genius prints that distinction so a benchmark is never mistaken for a quote.

export interface ReferenceSource {
  id: string;
  label: string;
  organisation: string;
  year: number;
  url: string;
}

export const REFERENCE_SOURCES: Record<"nrel" | "nrelData" | "doe" | "erl", ReferenceSource> = {
  nrel: {
    id: "nrel-2016",
    label: "Rooftop Solar PV Technical Potential in the United States: A Detailed Assessment",
    organisation: "National Renewable Energy Laboratory",
    year: 2016,
    url: "https://www.osti.gov/biblio/1236153",
  },
  nrelData: {
    id: "nrel-data-121",
    label: "Rooftop Photovoltaic Technical Potential in the United States (data submission 121)",
    organisation: "NREL Data Catalog",
    year: 2019,
    url: "https://data.nrel.gov/submissions/121",
  },
  doe: {
    id: "doe-cmei",
    label: "Solar Rooftop Potential",
    organisation: "U.S. Department of Energy",
    year: 2024,
    url: "https://www.energy.gov/cmei/systems/solar-rooftop-potential",
  },
  erl: {
    id: "erl-2018",
    label: "Estimating rooftop solar technical potential across the US using GIS, lidar and statistical modelling",
    organisation: "Environmental Research Letters 13 024027",
    year: 2018,
    url: "https://iopscience.iop.org/article/10.1088/1748-9326/aaa554/meta",
  },
};

/* ── NREL suitability screen ──────────────────────────────────────────── */

/**
 * The published criteria NREL used to decide whether roof area can host PV.
 * Solar Genius runs these same four tests against every captured face so the
 * verdict on a real roof is defensible against the national study.
 */
export const NREL_SUITABILITY = {
  /** A face must produce at least this share of an identical unshaded system. */
  minShadedProductionRatio: 0.7,
  /** Tilt above this is not counted as suitable. */
  maxTiltDeg: 60,
  /** Faces pointing within this many degrees of due north are excluded. */
  northExclusionHalfWidthDeg: 45,
  /** A contiguous patch smaller than this is not developable. */
  minContiguousAreaM2: 10,
  /** The same threshold in square feet, for board geometry. */
  minContiguousAreaSqFt: 107.6,
  source: REFERENCE_SOURCES.nrel,
} as const;

/* ── building classes ─────────────────────────────────────────────────── */

export type BuildingClass = "small" | "medium" | "large";

export interface BuildingClassSpec {
  id: BuildingClass;
  label: string;
  /** Footprint range in square feet, per the NREL classification. */
  minSqFt: number;
  maxSqFt: number | null;
  blurb: string;
}

export const BUILDING_CLASSES: BuildingClassSpec[] = [
  {
    id: "small",
    label: "Small building",
    minSqFt: 0,
    maxSqFt: 5000,
    blurb: "Houses and small commercial. The largest share of national rooftop potential.",
  },
  {
    id: "medium",
    label: "Medium building",
    minSqFt: 5000,
    maxSqFt: 25000,
    blurb: "Strip retail, small warehouses, schools and mid-size commercial roofs.",
  },
  {
    id: "large",
    label: "Large building",
    minSqFt: 25000,
    maxSqFt: null,
    blurb: "Distribution, big-box and institutional roofs — few buildings, vast area.",
  },
];

export const classifyBuilding = (footprintSqFt: number): BuildingClassSpec =>
  footprintSqFt < 5000 ? BUILDING_CLASSES[0] : footprintSqFt <= 25000 ? BUILDING_CLASSES[1] : BUILDING_CLASSES[2];

/* ── published findings ───────────────────────────────────────────────── */

export interface PublishedFinding {
  id: string;
  /** The number as it should be printed. */
  value: string;
  label: string;
  detail: string;
  source: ReferenceSource;
}

/** The lidar-city findings for small buildings — the homeowner's yardstick. */
export const SMALL_BUILDING_FINDINGS: PublishedFinding[] = [
  {
    id: "suitable-buildings",
    value: "83%",
    label: "of small buildings have a suitable location",
    detail:
      "Across the 128 cities covered by lidar — about 23% of all U.S. buildings — 83% of small buildings had at least one roof location that passed the suitability screen.",
    source: REFERENCE_SOURCES.nrel,
  },
  {
    id: "usable-area",
    value: "26%",
    label: "of small-building roof area is developable",
    detail:
      "Only about a quarter of the total rooftop area on small buildings survives shading, tilt, azimuth and contiguous-area screening. This is the figure your own roof is measured against.",
    source: REFERENCE_SOURCES.nrel,
  },
  {
    id: "small-capacity",
    value: "731 GW",
    label: "capacity small roofs could host",
    detail:
      "Small-building rooftops alone could accommodate 731 GW of PV — the greatest technical potential of any class, purely because there are so many of them.",
    source: REFERENCE_SOURCES.nrel,
  },
  {
    id: "small-energy",
    value: "926 TWh/yr",
    label: "energy small roofs could generate",
    detail:
      "About 65% of the total technical potential of rooftop PV in the continental United States.",
    source: REFERENCE_SOURCES.nrel,
  },
];

/** The national framing from DOE. */
export const NATIONAL_FINDINGS: PublishedFinding[] = [
  {
    id: "national-area",
    value: "8 billion m²",
    label: "of rooftop suitable for PV",
    detail: "The suitable rooftop area across the United States identified by the NREL analysis.",
    source: REFERENCE_SOURCES.doe,
  },
  {
    id: "national-capacity",
    value: "1 TW+",
    label: "of potential solar capacity",
    detail:
      "The upper limit of rooftop deployment nationwide. Higher module efficiency since 2016 makes the real figure larger.",
    source: REFERENCE_SOURCES.doe,
  },
  {
    id: "small-share",
    value: "65%",
    label: "of that potential is small roofs",
    detail: "Residential and other small rooftops carry about two thirds of the national rooftop potential.",
    source: REFERENCE_SOURCES.doe,
  },
  {
    id: "lmi-share",
    value: "42%",
    label: "of residential roofs are low-to-moderate income households",
    detail:
      "Rooftop potential is not concentrated in high-income housing — nearly half of it sits on LMI households.",
    source: REFERENCE_SOURCES.doe,
  },
];

/** DOE's caution, printed wherever a benchmark appears. */
export const POTENTIAL_CAVEAT =
  "Technical potential is the upper limit of what a roof could physically host — it is not economic or market potential, and it does not account for cost or availability. Your quote comes from the measured roof below, not from this benchmark.";

/* ── derived national averages ────────────────────────────────────────── */

/**
 * Specific yield implied by the published small-building totals:
 * 926 TWh/yr ÷ 731 GW = about 1,267 kWh per installed kW per year, as a national
 * average across every climate zone. Florida sits well above it, which is
 * exactly what the comparison on the page is meant to show.
 */
export const NATIONAL_SMALL_SPECIFIC_YIELD = Math.round((926e9 / 731e6) * 1) / 1; // kWh per kW-yr

/** Watts of module per square metre of DEVELOPABLE roof, at 2016 efficiency. */
export const NATIONAL_CAPACITY_DENSITY_W_PER_M2 = Math.round(1e12 / 8e9); // ~125 W/m²

export const M2_PER_SQFT = 0.092903;
