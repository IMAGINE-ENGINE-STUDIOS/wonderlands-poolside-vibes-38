/**
 * County-level solar jurisdiction layer — rates, taxes, programs, penalties.
 *
 * Solar Genius prices a roof; this file tells it WHERE that roof is, because in
 * Florida the same array pays back very differently depending on which meter it
 * is behind. Three things change by county:
 *
 *   1. The utility. Investor-owned (FPL, Duke, TECO, FPU) sit under the Public
 *      Service Commission's 1:1 net-metering rule (Rule 25-6.065, authorised by
 *      §366.91 F.S.). Municipal utilities and co-ops are NOT bound by it and
 *      several credit exports at avoided cost — a real penalty that changes the
 *      economics of oversizing.
 *   2. The retail rate and the fixed customer charge. The rate sets the value of
 *      every self-consumed kWh; the fixed charge is what solar can never offset.
 *   3. Local programs — municipal rebates, co-op loans, PACE districts — plus
 *      permit fees and interconnection requirements.
 *
 * Statewide benefits (sales-tax exemption, property-tax exclusion, the federal
 * credit) are held once in FLORIDA_STATE_BENEFITS so a rate change never
 * silently rewrites tax law.
 *
 * FIGURES ARE REFERENCE FIGURES, tariff-schedule order of magnitude, held
 * offline so the workstation opens with no API and no key. Every record carries
 * `verified` (the month the tariff was last read) and the fields are editable in
 * the Solar Genius jurisdiction leaf, so a dealer can key the customer's actual
 * bill rate and everything downstream re-prices.
 */

export type UtilityKind = "investor" | "municipal" | "cooperative";

/** How exported kWh are credited — the single biggest local variable. */
export type ExportRule =
  | "net-metering-retail" // 1:1 kWh credit at retail (PSC Rule 25-6.065)
  | "net-billing-avoided" // exports bought at avoided cost / fuel rate
  | "net-metering-capped"; // retail credit, but capped or annually trued-up low

export interface SolarProgram {
  id: string;
  label: string;
  /** Who runs it */
  administrator: string;
  kind: "rebate" | "loan" | "pace" | "grant" | "bill-credit";
  /** Plain-language description printed to the customer */
  detail: string;
  /** Cash value if it is a rebate, in dollars; 0 for financing programs */
  valueUsd?: number;
  /** Dollars per watt, when the rebate is sized by array */
  perWatt?: number;
  /** Cap on the cash value */
  capUsd?: number;
}

export interface SolarJurisdiction {
  id: string;
  county: string;
  /** Largest served cities, used by the address resolver */
  cities: string[];
  utility: string;
  utilityKind: UtilityKind;
  /** Residential all-in energy rate, $/kWh (energy + fuel + riders) */
  rateUsdPerKwh: number;
  /** Monthly fixed customer charge, $ — solar cannot offset this */
  fixedMonthlyUsd: number;
  exportRule: ExportRule;
  /** Typical residential PV building + electrical permit fee, $ */
  permitFeeUsd: number;
  /** Interconnection / application fee, $ */
  interconnectFeeUsd: number;
  /** Liability-insurance requirement printed on the interconnection sheet */
  insuranceNote: string;
  /** Local programs, incentives and penalties */
  programs: SolarProgram[];
  /** Local cautions — anything that reduces value */
  penalties: string[];
  /** Month the tariff was last read */
  verified: string;
}

/* ------------------------------------------------------------------ *
 * Statewide benefits — Florida statute, and the federal credit.
 * ------------------------------------------------------------------ */

export interface StateBenefit {
  id: string;
  label: string;
  authority: string;
  /** Plain-language effect */
  detail: string;
  /** Fraction of installed cost, when it is a credit or exemption on price */
  rateOfCost?: number;
}

export const FLORIDA_STATE_BENEFITS: StateBenefit[] = [
  {
    id: "fl-sales-tax",
    label: "Solar sales-tax exemption",
    authority: "§212.08(7)(hh), Florida Statutes",
    detail:
      "Solar modules, inverters, racking and the labour to install them are exempt from Florida sales tax. On a residential system this is the 6% state rate plus the county surtax, removed at purchase rather than refunded later.",
    rateOfCost: 0.06,
  },
  {
    id: "fl-property-tax",
    label: "Property-tax exclusion",
    authority: "§193.624, Florida Statutes",
    detail:
      "A residential renewable-energy source device is excluded from the assessed value of the home. The array raises the market value of the house without raising the tax bill.",
  },
  {
    id: "fl-net-metering",
    label: "Net metering, 1:1",
    authority: "§366.91 F.S. / PSC Rule 25-6.065",
    detail:
      "Investor-owned utilities must credit exported kWh one-for-one against consumed kWh, up to a 2 MW system. Credits roll month to month; any surplus left at the annual true-up is bought at avoided cost. Municipal utilities and co-ops set their own rules.",
  },
  {
    id: "federal-itc",
    label: "Federal residential clean-energy credit",
    authority: "26 U.S.C. §25D",
    detail:
      "A credit against federal income tax equal to 30% of the installed cost, including battery storage of 3 kWh or more. It is non-refundable but carries forward, so it needs tax liability to land.",
    rateOfCost: 0.3,
  },
];

/* ------------------------------------------------------------------ *
 * Common program templates, shared by several counties.
 * ------------------------------------------------------------------ */

const PACE: SolarProgram = {
  id: "fl-pace",
  label: "PACE assessment financing",
  administrator: "Florida PACE districts (§163.08 F.S.)",
  kind: "pace",
  detail:
    "Solar and hurricane-hardening financed as a voluntary non-ad-valorem assessment on the property-tax bill, 5 to 30 years, tied to the property rather than the owner. No down payment; the lien transfers on sale, which some mortgage lenders will require paid at closing.",
};

const COOP_LOAN: SolarProgram = {
  id: "coop-loan",
  label: "Co-op member energy loan",
  administrator: "Member cooperative",
  kind: "loan",
  detail:
    "On-bill or direct member loan for efficiency and solar work, usually at a below-market fixed rate with the payment collected on the electric bill.",
};

/* ------------------------------------------------------------------ *
 * The county records.
 * ------------------------------------------------------------------ */

export const FLORIDA_SOLAR_JURISDICTIONS: SolarJurisdiction[] = [
  {
    id: "orange",
    county: "Orange",
    cities: ["Orlando", "Winter Park", "Apopka", "Ocoee", "Lake Nona"],
    utility: "Orlando Utilities Commission / Duke Energy Florida",
    utilityKind: "municipal",
    rateUsdPerKwh: 0.142,
    fixedMonthlyUsd: 9.5,
    exportRule: "net-metering-capped",
    permitFeeUsd: 240,
    interconnectFeeUsd: 0,
    insuranceNote: "Homeowner liability coverage of $100,000 with the utility named; standard HO-3 usually satisfies it.",
    programs: [
      {
        id: "ouc-solar",
        label: "OUC efficiency & solar incentives",
        administrator: "Orlando Utilities Commission",
        kind: "rebate",
        detail:
          "OUC runs a rotating set of residential efficiency rebates and a community-solar subscription for roofs that cannot host an array. Rebates are budgeted annually and close when the funds are committed, so they are confirmed at application, not at signature.",
        perWatt: 0,
        valueUsd: 0,
      },
      PACE,
    ],
    penalties: [
      "OUC is a municipal utility and is not bound by PSC net metering; export credit is set by its own rider and can be revised.",
      "Tourist-corridor jurisdictions in the county add a separate electrical sub-permit for the AC disconnect.",
    ],
    verified: "2026-06",
  },
  {
    id: "miami-dade",
    county: "Miami-Dade",
    cities: ["Miami", "Hialeah", "Coral Gables", "Homestead", "Miami Beach"],
    utility: "Florida Power & Light",
    utilityKind: "investor",
    rateUsdPerKwh: 0.163,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 425,
    interconnectFeeUsd: 0,
    insuranceNote:
      "FPL requires $100,000 liability coverage for tier-1 systems (10 kW or less) and $1,000,000 for tier 2, evidenced at interconnection.",
    programs: [
      PACE,
      {
        id: "dade-pace",
        label: "Green Corridor PACE district",
        administrator: "Green Corridor Property Assessment Clean Energy District",
        kind: "pace",
        detail:
          "The original Florida PACE district. Covers solar, storage, impact windows and roof replacement in the same assessment, which matters when the array requires a re-roof first.",
      },
    ],
    penalties: [
      "High-velocity hurricane zone: racking must carry a Miami-Dade NOA and the structural calculation is required at permit, adding engineering cost per array.",
      "Roof-mounted arrays on tile need a NOA-listed flashed mount; the tile-roof adder is not optional here.",
    ],
    verified: "2026-06",
  },
  {
    id: "broward",
    county: "Broward",
    cities: ["Fort Lauderdale", "Hollywood", "Pembroke Pines", "Coral Springs"],
    utility: "Florida Power & Light",
    utilityKind: "investor",
    rateUsdPerKwh: 0.161,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 380,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000 / tier-2 $1,000,000 liability coverage.",
    programs: [PACE],
    penalties: [
      "High-velocity hurricane zone product approval applies; expect a structural review of the attachment schedule.",
    ],
    verified: "2026-06",
  },
  {
    id: "palm-beach",
    county: "Palm Beach",
    cities: ["West Palm Beach", "Boca Raton", "Jupiter", "Delray Beach"],
    utility: "Florida Power & Light",
    utilityKind: "investor",
    rateUsdPerKwh: 0.16,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 350,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000 / tier-2 $1,000,000 liability coverage.",
    programs: [PACE],
    penalties: ["Coastal wind zones raise the attachment count per module, which raises the racking line."],
    verified: "2026-06",
  },
  {
    id: "hillsborough",
    county: "Hillsborough",
    cities: ["Tampa", "Brandon", "Plant City", "Riverview"],
    utility: "Tampa Electric (TECO)",
    utilityKind: "investor",
    rateUsdPerKwh: 0.158,
    fixedMonthlyUsd: 19.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 265,
    interconnectFeeUsd: 0,
    insuranceNote: "TECO requires proof of liability coverage at interconnection; tier depends on system size.",
    programs: [PACE],
    penalties: [
      "TECO's fixed monthly customer charge is among the highest in the state, so a small array offsets a smaller share of the bill than the kWh maths alone suggests.",
    ],
    verified: "2026-06",
  },
  {
    id: "pinellas",
    county: "Pinellas",
    cities: ["St. Petersburg", "Clearwater", "Largo", "Dunedin"],
    utility: "Duke Energy Florida",
    utilityKind: "investor",
    rateUsdPerKwh: 0.171,
    fixedMonthlyUsd: 15.2,
    exportRule: "net-metering-retail",
    permitFeeUsd: 210,
    interconnectFeeUsd: 0,
    insuranceNote: "Duke requires $100,000 liability coverage for tier-1 residential interconnection.",
    programs: [PACE],
    penalties: ["Duke's residential rate carries a storm-restoration rider that moves annually."],
    verified: "2026-06",
  },
  {
    id: "pasco",
    county: "Pasco",
    cities: ["Port Richey", "New Port Richey", "Wesley Chapel", "Dade City"],
    utility: "Duke Energy Florida / Withlacoochee River Electric",
    utilityKind: "investor",
    rateUsdPerKwh: 0.169,
    fixedMonthlyUsd: 15.2,
    exportRule: "net-metering-retail",
    permitFeeUsd: 195,
    interconnectFeeUsd: 0,
    insuranceNote: "Duke tier-1 $100,000 liability coverage; Withlacoochee sets its own member requirement.",
    programs: [PACE, COOP_LOAN],
    penalties: [
      "Withlacoochee River Electric is a cooperative and is not bound by PSC net metering; confirm the export credit before sizing above the load.",
    ],
    verified: "2026-06",
  },
  {
    id: "duval",
    county: "Duval",
    cities: ["Jacksonville", "Jacksonville Beach", "Baldwin"],
    utility: "JEA",
    utilityKind: "municipal",
    rateUsdPerKwh: 0.132,
    fixedMonthlyUsd: 12.5,
    exportRule: "net-billing-avoided",
    permitFeeUsd: 175,
    interconnectFeeUsd: 75,
    insuranceNote: "JEA requires evidence of liability coverage and an external AC disconnect within sight of the meter.",
    programs: [
      {
        id: "jea-solar",
        label: "JEA residential solar interconnection",
        administrator: "JEA",
        kind: "bill-credit",
        detail:
          "JEA interconnects residential PV under its own rider rather than PSC net metering. Self-consumed kWh avoid retail; exported kWh are credited nearer to avoided cost, so the design should be sized to the daytime load rather than to the annual bill.",
      },
      PACE,
    ],
    penalties: [
      "Exports are NOT credited at retail. Oversizing an array here loses money; battery storage or load-shifting recovers it instead.",
      "A separate interconnection application fee applies.",
    ],
    verified: "2026-06",
  },
  {
    id: "leon",
    county: "Leon",
    cities: ["Tallahassee"],
    utility: "City of Tallahassee Utilities",
    utilityKind: "municipal",
    rateUsdPerKwh: 0.134,
    fixedMonthlyUsd: 12.0,
    exportRule: "net-billing-avoided",
    permitFeeUsd: 160,
    interconnectFeeUsd: 50,
    insuranceNote: "City requires liability coverage and an accessible lockable AC disconnect.",
    programs: [
      {
        id: "tally-loan",
        label: "City of Tallahassee solar loan",
        administrator: "City of Tallahassee Utilities",
        kind: "loan",
        detail:
          "Low-interest on-bill loan for residential solar and efficiency work, repaid on the utility bill, historically the cheapest capital available to a Tallahassee homeowner.",
      },
      PACE,
    ],
    penalties: [
      "Municipal export credit sits below retail; size to the daytime load.",
      "Highest latitude in the state — the winter culmination is lower, so tilt and shading matter more than in South Florida.",
    ],
    verified: "2026-06",
  },
  {
    id: "alachua",
    county: "Alachua",
    cities: ["Gainesville", "Alachua", "Newberry"],
    utility: "Gainesville Regional Utilities (GRU)",
    utilityKind: "municipal",
    rateUsdPerKwh: 0.146,
    fixedMonthlyUsd: 18.5,
    exportRule: "net-billing-avoided",
    permitFeeUsd: 165,
    interconnectFeeUsd: 50,
    insuranceNote: "GRU requires liability coverage and an inspection of the AC disconnect before the meter swap.",
    programs: [
      {
        id: "gru-solar",
        label: "GRU net-metering rider",
        administrator: "Gainesville Regional Utilities",
        kind: "bill-credit",
        detail:
          "GRU pioneered the feed-in tariff and now interconnects residential PV under a net-billing rider. Self-consumption carries the value; export credit is set annually.",
      },
      PACE,
    ],
    penalties: ["High fixed charge plus a below-retail export credit; self-consumption is where the payback lives."],
    verified: "2026-06",
  },
  {
    id: "polk",
    county: "Polk",
    cities: ["Lakeland", "Winter Haven", "Bartow", "Davenport"],
    utility: "Lakeland Electric / Duke Energy Florida",
    utilityKind: "municipal",
    rateUsdPerKwh: 0.148,
    fixedMonthlyUsd: 12.75,
    exportRule: "net-metering-capped",
    permitFeeUsd: 185,
    interconnectFeeUsd: 25,
    insuranceNote: "Lakeland Electric requires liability coverage and a utility-accessible disconnect.",
    programs: [
      {
        id: "lakeland-solar",
        label: "Lakeland Electric residential PV rider",
        administrator: "Lakeland Electric",
        kind: "bill-credit",
        detail:
          "Retail-rate credit within a capped programme allocation. Once the annual allocation fills, new systems interconnect on the standby rider instead, so timing affects value.",
      },
      PACE,
    ],
    penalties: ["Programme allocation is capped annually; confirm capacity is open before contract."],
    verified: "2026-06",
  },
  {
    id: "clay",
    county: "Clay",
    cities: ["Orange Park", "Green Cove Springs", "Fleming Island", "Middleburg"],
    utility: "Clay Electric Cooperative",
    utilityKind: "cooperative",
    rateUsdPerKwh: 0.139,
    fixedMonthlyUsd: 27.0,
    exportRule: "net-metering-capped",
    permitFeeUsd: 150,
    interconnectFeeUsd: 50,
    insuranceNote: "Cooperative requires member liability coverage and a visible lockable disconnect.",
    programs: [COOP_LOAN, PACE],
    penalties: [
      "Cooperative fixed charge is high; the bill has a floor solar cannot reach.",
      "Not bound by PSC net metering — the board sets the credit.",
    ],
    verified: "2026-06",
  },
  {
    id: "lee",
    county: "Lee",
    cities: ["Fort Myers", "Cape Coral", "Bonita Springs", "Estero"],
    utility: "Florida Power & Light / Lee County Electric Cooperative",
    utilityKind: "investor",
    rateUsdPerKwh: 0.159,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 245,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000; LCEC sets its own member requirement.",
    programs: [PACE, COOP_LOAN],
    penalties: [
      "Half the county is served by LCEC, a cooperative outside the PSC net-metering rule — confirm the meter before sizing.",
      "Post-Ian wind uplift review is strict on the attachment schedule.",
    ],
    verified: "2026-06",
  },
  {
    id: "collier",
    county: "Collier",
    cities: ["Naples", "Marco Island", "Immokalee", "Golden Gate"],
    utility: "Florida Power & Light",
    utilityKind: "investor",
    rateUsdPerKwh: 0.158,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 310,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000 / tier-2 $1,000,000.",
    programs: [PACE],
    penalties: [
      "Architectural review in gated communities frequently restricts street-visible modules; a rear-plane-only design loses production.",
    ],
    verified: "2026-06",
  },
  {
    id: "sarasota",
    county: "Sarasota",
    cities: ["Sarasota", "Venice", "North Port", "Osprey"],
    utility: "Florida Power & Light",
    utilityKind: "investor",
    rateUsdPerKwh: 0.157,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 225,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000 / tier-2 $1,000,000.",
    programs: [PACE],
    penalties: ["Coastal exposure raises the design wind pressure and the mount count."],
    verified: "2026-06",
  },
  {
    id: "seminole",
    county: "Seminole",
    cities: ["Sanford", "Altamonte Springs", "Oviedo", "Lake Mary"],
    utility: "Duke Energy Florida",
    utilityKind: "investor",
    rateUsdPerKwh: 0.17,
    fixedMonthlyUsd: 15.2,
    exportRule: "net-metering-retail",
    permitFeeUsd: 190,
    interconnectFeeUsd: 0,
    insuranceNote: "Duke tier-1 $100,000 liability coverage.",
    programs: [PACE],
    penalties: ["Duke's storm rider raises the rate faster than the state average, which helps solar and hurts the bill."],
    verified: "2026-06",
  },
  {
    id: "osceola",
    county: "Osceola",
    cities: ["Kissimmee", "St. Cloud", "Celebration", "Poinciana"],
    utility: "Kissimmee Utility Authority / Duke Energy Florida",
    utilityKind: "municipal",
    rateUsdPerKwh: 0.144,
    fixedMonthlyUsd: 11.5,
    exportRule: "net-metering-capped",
    permitFeeUsd: 200,
    interconnectFeeUsd: 25,
    insuranceNote: "KUA requires liability coverage and a lockable exterior disconnect.",
    programs: [
      {
        id: "kua-solar",
        label: "KUA residential PV rider",
        administrator: "Kissimmee Utility Authority",
        kind: "bill-credit",
        detail: "Municipal interconnection with a capped retail-credit allocation and an annual true-up at avoided cost.",
      },
      PACE,
    ],
    penalties: ["Two utilities serve the county on different rules; the meter, not the address, decides the credit."],
    verified: "2026-06",
  },
  {
    id: "volusia",
    county: "Volusia",
    cities: ["Daytona Beach", "Deltona", "DeLand", "New Smyrna Beach"],
    utility: "Florida Power & Light / New Smyrna Beach Utilities",
    utilityKind: "investor",
    rateUsdPerKwh: 0.156,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 180,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000; NSB Utilities sets its own.",
    programs: [PACE],
    penalties: ["Beachside salt exposure calls for marine-grade racking hardware."],
    verified: "2026-06",
  },
  {
    id: "brevard",
    county: "Brevard",
    cities: ["Melbourne", "Palm Bay", "Titusville", "Cocoa"],
    utility: "Florida Power & Light",
    utilityKind: "investor",
    rateUsdPerKwh: 0.157,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 185,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000 / tier-2 $1,000,000.",
    programs: [PACE],
    penalties: ["Barrier-island wind zone raises attachment density."],
    verified: "2026-06",
  },
  {
    id: "manatee",
    county: "Manatee",
    cities: ["Bradenton", "Palmetto", "Lakewood Ranch", "Anna Maria"],
    utility: "Florida Power & Light",
    utilityKind: "investor",
    rateUsdPerKwh: 0.157,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 215,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000 / tier-2 $1,000,000.",
    programs: [PACE],
    penalties: ["Deed-restricted communities often require rear-plane placement."],
    verified: "2026-06",
  },
  {
    id: "marion",
    county: "Marion",
    cities: ["Ocala", "Dunnellon", "Belleview"],
    utility: "Duke Energy Florida / SECO Energy",
    utilityKind: "investor",
    rateUsdPerKwh: 0.166,
    fixedMonthlyUsd: 15.2,
    exportRule: "net-metering-retail",
    permitFeeUsd: 165,
    interconnectFeeUsd: 0,
    insuranceNote: "Duke tier-1 $100,000; SECO sets its own member requirement.",
    programs: [PACE, COOP_LOAN],
    penalties: ["SECO Energy territory is cooperative and outside the PSC rule."],
    verified: "2026-06",
  },
  {
    id: "st-lucie",
    county: "St. Lucie",
    cities: ["Port St. Lucie", "Fort Pierce"],
    utility: "Florida Power & Light / Fort Pierce Utilities Authority",
    utilityKind: "investor",
    rateUsdPerKwh: 0.158,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 195,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL tier-1 $100,000; FPUA sets its own.",
    programs: [PACE],
    penalties: ["FPUA is municipal — the credit inside the city limits differs from the county."],
    verified: "2026-06",
  },
  {
    id: "escambia",
    county: "Escambia",
    cities: ["Pensacola", "Cantonment"],
    utility: "Florida Power & Light (Northwest)",
    utilityKind: "investor",
    rateUsdPerKwh: 0.152,
    fixedMonthlyUsd: 9.25,
    exportRule: "net-metering-retail",
    permitFeeUsd: 170,
    interconnectFeeUsd: 0,
    insuranceNote: "FPL Northwest tier-1 $100,000 liability coverage.",
    programs: [PACE],
    penalties: ["Highest wind-borne debris exposure in the panhandle; expect enhanced uplift calculations."],
    verified: "2026-06",
  },
  {
    id: "monroe",
    county: "Monroe",
    cities: ["Key West", "Marathon", "Key Largo", "Islamorada"],
    utility: "Keys Energy Services / Florida Keys Electric Cooperative",
    utilityKind: "municipal",
    rateUsdPerKwh: 0.149,
    fixedMonthlyUsd: 17.0,
    exportRule: "net-metering-capped",
    permitFeeUsd: 460,
    interconnectFeeUsd: 75,
    insuranceNote: "Utility requires liability coverage; the Keys also require a wind-rated attachment certification.",
    programs: [COOP_LOAN, PACE],
    penalties: [
      "180 mph design wind speed — the racking and structural package is the most expensive in Florida.",
      "Municipal and cooperative credit rules, both outside the PSC net-metering rule.",
    ],
    verified: "2026-06",
  },
];

/** Fallback when the county cannot be resolved — statewide investor-owned average. */
export const DEFAULT_JURISDICTION: SolarJurisdiction = {
  id: "fl-statewide",
  county: "Florida (statewide average)",
  cities: [],
  utility: "Investor-owned average (FPL / Duke / TECO)",
  utilityKind: "investor",
  rateUsdPerKwh: 0.16,
  fixedMonthlyUsd: 11.5,
  exportRule: "net-metering-retail",
  permitFeeUsd: 225,
  interconnectFeeUsd: 0,
  insuranceNote: "Tier-1 residential interconnection normally requires $100,000 liability coverage.",
  programs: [PACE],
  penalties: ["County not identified — key the customer's own rate from the bill before presenting a payback."],
  verified: "2026-06",
};

export const EXPORT_RULE_LABEL: Record<ExportRule, string> = {
  "net-metering-retail": "Net metering 1:1 (retail credit)",
  "net-billing-avoided": "Net billing (export at avoided cost)",
  "net-metering-capped": "Retail credit, capped allocation",
};

/**
 * How much of an exported kWh is actually paid for, by rule. Used to value the
 * share of production that leaves the meter.
 */
export const EXPORT_CREDIT_FACTOR: Record<ExportRule, number> = {
  "net-metering-retail": 1,
  "net-metering-capped": 0.85,
  "net-billing-avoided": 0.35,
};

/** Find a county record by id. */
export const findJurisdictionById = (id: string | null | undefined): SolarJurisdiction =>
  FLORIDA_SOLAR_JURISDICTIONS.find((j) => j.id === id) ?? DEFAULT_JURISDICTION;

/**
 * Resolve a jurisdiction from a free-text address. The geocoder returns strings
 * like "1234 Elm St, Winter Park, FL 32789, USA", so the county name is rarely
 * present — the city list carries the match instead.
 */
export function resolveJurisdiction(address: string | null | undefined): SolarJurisdiction {
  const q = (address ?? "").toLowerCase();
  if (!q.trim()) return DEFAULT_JURISDICTION;
  const byCounty = FLORIDA_SOLAR_JURISDICTIONS.find((j) => q.includes(`${j.county.toLowerCase()} county`));
  if (byCounty) return byCounty;
  const byCity = FLORIDA_SOLAR_JURISDICTIONS.find((j) => j.cities.some((c) => q.includes(c.toLowerCase())));
  return byCity ?? DEFAULT_JURISDICTION;
}
