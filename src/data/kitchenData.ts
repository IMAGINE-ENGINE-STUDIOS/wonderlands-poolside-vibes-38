/**
 * Outdoor kitchen catalogue — every kitchen product Wonderlands sells,
 * entered for the quote tool with its held cost and the selling price the
 * pricing model computes from it (src/lib/kitchenPricing.ts).
 *
 * Cost sources, all held on record (PRICING-COST-STUDY.md and the quote
 * build files in the outdoor kitchens workspace):
 *  - Appliances and fronts: the real purchase prices we hold (BBQGuys,
 *    The BBQ Depot, Lowe's, Home Depot, Kraus USA, VEVOR), read live on
 *    the dates named in each costBasis. GAP S-1 stands: no dealer cost
 *    list has landed for these pieces, so the held retail purchase price
 *    is the cost carried, and it is labelled as such.
 *  - Cabinets: the American Outdoor Cabinets Dealer Price List,
 *    February 2026 (dealer price is our cost; the printed MSRP is the
 *    competitive ceiling).
 *  - Stone: granite at the carried fabricator basis of $80 per sq ft
 *    with the held installed band top of $100 per sq ft as its ceiling;
 *    Weston Stone block at $6.21 a piece, the middle of the Unique
 *    Supply band, by the founder's ruling of 2026-11-24.
 *  - Services: the study's full scope chains and the founder's own
 *    first party figures (permits $1,450 expedited; delivery about
 *    $500; installation $2,000 and masonry handwork $2,500 as settled
 *    on the sample build).
 *  - The 36 Belgard kitchen sets carry NO cost: no Belgard dealer price
 *    list is held anywhere (GAP A4-1). They are entered with the gap
 *    named and no price, never a guessed one.
 *
 * Customers only ever see `price`. unitCost, costBasis and costGap are
 * internal data for the sales view.
 */
import {
  getKitchenPriceBreakdown,
  type KitchenCostKind,
} from "@/lib/kitchenPricing";
import outdoorKitchenDeck from "@/assets/deck/outdoor-kitchen.webp";

const IMG = {
  island:
    "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/87e16906-bcf2-4f86-ac45-e4b9518b403a__email-kitchen-island.jpg",
  detail:
    "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/46f54c54-7f3a-41fe-8f84-53f3fb5aa1cd__email-kitchen-detail.jpg",
  gray: "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/88407cd9-cca0-468a-accb-c29ec9b0b32d__kitchen-real-gray.jpg",
  concrete:
    "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/2ee352f4-5b28-4640-90ac-876d9d2844c0__kitchen-real-concrete.jpg",
  indigo:
    "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/4ffd7677-24f0-4233-b12f-e1faeae5b34b__kitchen-real-indigo.jpg",
  sarasota:
    "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/7fb4ca98-8792-4448-8d7f-d6d81fc7a882__kitchen-real-sarasota.jpg",
  cabana:
    "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/ab00f60d-af08-4ac1-8e3d-bce4ba701605__kitchen-real-black-cabana.jpg",
  milan:
    "https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/ce7191fd-66b2-4912-b845-b168600f46bf__milan-outdoor-kitchen.jpg",
};

const SET_IMAGES = [
  IMG.island,
  IMG.gray,
  IMG.concrete,
  IMG.indigo,
  IMG.sarasota,
  IMG.cabana,
  IMG.milan,
  outdoorKitchenDeck,
];

export interface KitchenProduct {
  id: string;
  name: string;
  brand?: string;
  /** Console and suite grouping label. */
  group: string;
  kind: KitchenCostKind;
  unit: "each" | "sqft" | "piece";
  image: string;
  meta?: string;
  description?: string;
  features?: string[];
  /** Held cost; null means no cost is on record (see costGap). */
  unitCost: number | null;
  /** Where the held cost comes from (internal). */
  costBasis: string;
  /** Named gap when the cost is missing or partial (internal). */
  costGap?: string;
  /** Held competitive ceiling: MSRP or band top (internal basis in ceilingBasis). */
  competitiveCeiling?: number;
  ceilingBasis?: string;
  /** Manufacturer printed retail where held (cabinets). */
  msrp?: number;
}

const APPLIANCE_GAP =
  "GAP S-1: no dealer cost list has landed for this piece; the cost carried is the real retail purchase price we hold.";

const core: KitchenProduct[] = [
  {
    id: "lynx-l30tr-lp",
    name: "Lynx Professional 30 in Built In Grill",
    brand: "Lynx",
    group: "Appliances",
    kind: "appliance",
    unit: "each",
    image: IMG.island,
    meta: "30 in · Trident infrared sear burner · Rotisserie",
    description:
      "A 30 inch built in grill with one Trident infrared burner and one ceramic burner, a rotisserie backburner and 840 square inches of cooking surface. It seats in a 30 inch grill base.",
    features: [
      "Trident infrared sear burner, 23,000 BTU",
      "Ceramic burner, 25,000 BTU",
      "Rotisserie backburner, 14,000 BTU",
      "Lifetime warranty on the body, the burners and the cooking grates",
    ],
    unitCost: 5729,
    costBasis:
      "BBQGuys product page read live 2026-11-23: $5,729 (list $6,139), free shipping. The BBQ Depot, Hollywood FL, carries it at the same $5,729.",
    costGap: APPLIANCE_GAP,
  },
  {
    id: "alfresco-alxe-30",
    name: "Alfresco 30 in Built In Grill",
    brand: "Alfresco",
    group: "Appliances",
    kind: "appliance",
    unit: "each",
    image: IMG.detail,
    meta: "30 in · Sear Zone model at the same held price",
    description:
      "A 30 inch built in grill from Alfresco. The Sear Zone model, ALXE-30SZ, is held at the same price as the plain ALXE-30, so the line carries the stronger grill for the same money.",
    features: ["30 inch built in grill", "Sear Zone model held at the same price"],
    unitCost: 5169,
    costBasis:
      "The BBQ Depot, Hollywood FL, and BBQGuys held price, 2026-11-23: $5,169.",
    costGap: APPLIANCE_GAP,
  },
  {
    id: "newair-ab-850",
    name: "NewAir AB-850 Drinks Fridge",
    brand: "NewAir",
    group: "Appliances",
    kind: "appliance",
    unit: "each",
    image: IMG.indigo,
    meta: "Glass front · Outdoor rated · Freestanding in its covered bay",
    description:
      "A compact outdoor beverage center with a glass front, freestanding in its covered bay under the counter. 17 inches wide, 25.5 high, 18.75 deep.",
    features: ["Glass front", "Outdoor rated", "Freestanding fit"],
    unitCost: 404.77,
    costBasis: "Lowe's held price; the founder's pick of 2026-11-24.",
    costGap: APPLIANCE_GAP,
  },
  {
    id: "kraus-kwt310-30",
    name: "Kraus Kore Workstation 30 in Sink",
    brand: "Kraus",
    group: "Appliances",
    kind: "appliance",
    unit: "each",
    image: IMG.detail,
    meta: "30 in · Workstation ledge · 16 gauge T-304 stainless",
    description:
      "One large modern workstation sink with an integrated ledge. A bamboo cutting board and a roll up rack slide over the bowl, so washing boards and preparing food happens right over the sink. The kit includes the bottom grid, the cutting board, the roll up rack, the drain assembly and the strainer.",
    features: [
      "Single bowl 28 by 16 by 9 in inside, 30 by 22 in outside",
      "Bamboo cutting board and roll up rack included",
      "Lifetime limited warranty",
      "cUPC certified",
    ],
    unitCost: 499.95,
    costBasis:
      "Kraus USA, the manufacturer, product page read 2026-11-23: $499.95. Home Depot lists the same model at $539.95; the manufacturer's own price is the one carried.",
    costGap: APPLIANCE_GAP,
  },
  {
    id: "zline-8kbh-30",
    name: "ZLINE 30 in Hand Hammered Copper Hood",
    brand: "ZLINE",
    group: "Appliances",
    kind: "appliance",
    unit: "each",
    image: IMG.sarasota,
    meta: "30 in · 400 CFM four speed motor · Outdoor approved",
    description:
      "A 30 inch hand hammered copper vent hood with a four speed motor at 400 CFM, baffle filters and two LED lights. 46.5 inches tall in total with its chimney, which is cut to size on site.",
    features: [
      "Hand hammered copper canopy",
      "400 CFM, four speed motor",
      "Baffle filters and LED lights",
      "Outdoor approved",
    ],
    unitCost: 962.99,
    costBasis: "Home Depot held price, verified 2026-11-24.",
    costGap:
      APPLIANCE_GAP +
      " Named on the record: 400 CFM sits under the 480 CFM rule of thumb floor for a 48,000 BTU grill; the founder's pick stands.",
  },
  {
    id: "vevor-vented-double-door-30",
    name: "VEVOR Vented Double Door, 30 in",
    brand: "VEVOR",
    group: "Stainless fronts",
    kind: "front",
    unit: "each",
    image: IMG.indigo,
    meta: "30 by 21 in · Cutout 27 by 18 in · Brushed stainless",
    description:
      "A vented double door in brushed stainless, 30 by 21 inches. In the sample build one sits below the grill and one below the sink.",
    features: ["Vented double door", "Brushed stainless front"],
    unitCost: 66.2,
    costBasis: "Lowe's held price, VEVOR Set A, 2026-11-24.",
    costGap: APPLIANCE_GAP,
  },
  {
    id: "vevor-double-drawer-295",
    name: "VEVOR Double Drawer, 29.5 in",
    brand: "VEVOR",
    group: "Stainless fronts",
    kind: "front",
    unit: "each",
    image: IMG.indigo,
    meta: "29.5 by 10 in · Cutout 27.1 by 7.5 in · Brushed stainless",
    description:
      "A wide horizontal double drawer in brushed stainless, 29.5 by 10 inches, seated beside the sink in the sample build.",
    features: ["Double drawer", "Brushed stainless front"],
    unitCost: 149.9,
    costBasis:
      "VEVOR's own listing, corroborated at Best Buy and Target on 2026-11-24: $149.90.",
    costGap: APPLIANCE_GAP,
  },
  {
    id: "vevor-door-drawer-combo-325",
    name: "VEVOR Door and Drawer Combo, 32.5 in",
    brand: "VEVOR",
    group: "Stainless fronts",
    kind: "front",
    unit: "each",
    image: IMG.indigo,
    meta: "32.5 in · Two stacked drawers, one door, paper towel rack",
    description:
      "A door and drawer combo in brushed stainless, 32.5 inches: two stacked drawers, one door and a paper towel rack, on a 30.7 by 20 inch cutout.",
    features: ["Two stacked drawers and one door", "Paper towel rack", "Brushed stainless front"],
    unitCost: 311.9,
    costBasis: "Lowe's held price, VEVOR Set C, 2026-11-24.",
    costGap: APPLIANCE_GAP,
  },
  {
    id: "granite-countertop-backsplash",
    name: "Granite Countertop and Backsplash",
    brand: "Wonderlands",
    group: "Stone and body",
    kind: "materials",
    unit: "sqft",
    image: IMG.sarasota,
    meta: "Countertop and backsplash in the same stone, priced per square foot",
    description:
      "A beautiful granite top with the backsplash in the same stone, priced together as one line per square foot. The price carried is the top of the held installed granite band; at that ceiling this line earns below the 30 percent floor, and the difference is made up on the project as a whole, exactly as the founder settled it on the sample build.",
    features: ["Countertop and backsplash in one stone", "Cut for the grill, the sink and every element"],
    unitCost: 80,
    costBasis:
      "Carried fabricator basis of $80 per sq ft (the sample build's settled figure, 2026-11-24) inside the held installed granite band of $40 to $100 per sq ft.",
    competitiveCeiling: 100,
    ceilingBasis: "Top of the held installed granite band, $100 per sq ft.",
  },
  {
    id: "weston-stone-block",
    name: "Weston Stone Block, per piece laid",
    brand: "Belgard",
    group: "Stone and body",
    kind: "materials",
    unit: "piece",
    image: IMG.concrete,
    meta: "Retaining wall block for the kitchen body, priced per piece",
    description:
      "The Weston Stone block the kitchen bodies are built from, priced per piece laid. A body is counted from the project's own take off: the sample build laid 567 pieces.",
    features: ["Counted from the project's own take off", "Corners are cut from the same pieces"],
    unitCost: 6.21,
    costBasis:
      "Unique Supply lists the Belgard Weston Stone retaining wall at $5.19 to $7.23 a piece; the middle of the band, $6.21, is carried by the founder's ruling of 2026-11-24.",
  },
  {
    id: "plumbing-and-fittings",
    name: "Plumbing and fittings",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.cabana,
    meta: "Licensed plumber · Supply and drain lines, hookup, permit and inspections",
    description:
      "The full sink water chain by a licensed plumber: the supply and drain lines, the fittings, the hookup, the permit and the inspections.",
    unitCost: 1650,
    costBasis:
      "Study section A2.2 water chain (model range $1,125 to $2,650 for one sink), carried at $1,650 as settled on the sample build by the founder's reduction of 2026-11-24.",
  },
  {
    id: "electrical-connection",
    name: "Electrical connection from existing outlets",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.cabana,
    meta: "From the existing wall outlets to the fridge, the hood and the grill lights",
    description:
      "A simple electrical connection from the power already on the wall to the plug in pieces: the fridge, the hood and the grill lights and rotisserie.",
    unitCost: 350,
    costBasis:
      "Sample build carry, 2026-11-24: $350, the top of the held outlet band, for a kitchen with power already on its wall.",
  },
  {
    id: "electrical-feature-point",
    name: "Electrical chain, one feature point",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.cabana,
    meta: "Dedicated circuit, outlets, licensed electrician, permits",
    description:
      "The whole electrical chain for one feature point where the wall has no power yet: the wiring, the sockets, the breaker, the licensed electric contractor and the permits. Priced per project from the held chain range until a subcontractor reply settles a single figure.",
    unitCost: null,
    costBasis: "Study section A2.1 chain, held as a range only.",
    costGap:
      "The chain is held as a range, $520 to $1,130 per feature point with the panel ready (plus $400 to $1,000 for a subpanel or $1,320 to $2,020 for a 200A upgrade when capacity is short). No single point figure is carried until a Track B electrician reply settles it (GAP A4-10).",
  },
  {
    id: "gas-line-chain",
    name: "Gas line, one run",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.cabana,
    meta: "One line extension with one appliance connection, licensed gas contractor",
    description:
      "The whole gas chain for one run: the pipe, the components, the trenching, the licensed gas contractor, the permit and the pressure test. Priced per project from the held chain range until a subcontractor reply settles a single figure.",
    unitCost: null,
    costBasis: "Study section A2.3 chain, held as a range only.",
    costGap:
      "The chain is held as a range, $830 to $2,200 for a 40 ft run with one outlet. No single point figure is carried until a Track B reply settles it (GAP A4-10).",
  },
  {
    id: "expedited-permits",
    name: "Expedited permits",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.cabana,
    meta: "Our own permitting cost, expedited",
    description:
      "The permits the kitchen needs, run expedited. This is our own first party cost: $800 plus $650.",
    unitCost: 1450,
    costBasis: "First party (ours): $800 + $650 = $1,450 minimum, expedited (founder, 2026-11-22).",
  },
  {
    id: "kitchen-installation",
    name: "Installation, setting the cabinets and pieces",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.cabana,
    meta: "The crew that sets the cabinets, the fronts and the appliances",
    description:
      "The installation work of a kitchen build: setting the cabinets and pieces in place. On a finished quote this cost sits inside the item lines, and every price states that delivery and installation are included.",
    unitCost: 2000,
    costBasis:
      "Founder settled figure on the sample build, 2026-11-24: $2,000 (cut from $3,000 on her ruling).",
  },
  {
    id: "kitchen-delivery",
    name: "Delivery",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.cabana,
    meta: "Delivery of the body materials and pieces to the property",
    description: "Delivery of the kitchen's materials and pieces to the property.",
    unitCost: 500,
    costBasis: "The founder's own figure, 2026-11-24: delivery is about $500.",
  },
  {
    id: "masonry-handwork",
    name: "Weston Stone masonry handwork",
    brand: "Wonderlands",
    group: "Services",
    kind: "service",
    unit: "each",
    image: IMG.concrete,
    meta: "The masonry build of the stone body",
    description:
      "The masonry handwork that builds the Weston Stone body, including every cut the take off numbers. The figure carried is the founder's for the sample body; larger bodies are counted from their own take off.",
    unitCost: 2500,
    costBasis: "The founder's figure, 2026-11-24: $2,500 of masonry handwork on the sample build.",
  },
];

/* ------------------------------------------------------------------ *
 * American Outdoor Cabinets — the full dealer list, February 2026.
 * Rows are [SKU, width or size label, dealer price, MSRP] exactly as
 * printed. Dealer price is our cost; the printed MSRP is the model's
 * competitive ceiling. The 3 Drawer Base section of the list repeats
 * the 2 Drawer Base DB SKUs and prices exactly (as printed), so the
 * drawer bases are entered once. Back panels print as price ranges by
 * length; the low end is entered and the range is named in the gap.
 * ------------------------------------------------------------------ */
type AocRow = [string, string, number, number];
const aoc = (
  group: string,
  label: string,
  rows: AocRow[],
  image: string,
): KitchenProduct[] =>
  rows.map(([sku, size, dealer, msrp]) => ({
    id: `aoc-${sku.toLowerCase()}`,
    name: `${label} ${size} (${sku})`,
    brand: "American Outdoor Cabinets",
    group,
    kind: "cabinet" as const,
    unit: "each" as const,
    image,
    meta: "Marine grade HDPE · Full depth 24 in · Lifetime warranty",
    description:
      "A marine grade HDPE outdoor cabinet from American Outdoor Cabinets, Bradenton, Florida. Fourteen standard colors at list price, ten door styles with matching drawers.",
    unitCost: dealer,
    costBasis:
      "American Outdoor Cabinets Dealer Price List, February 2026, as printed (dealer / MSRP).",
    costGap:
      "The dealer list carries no freight: the maker charges actual shipping, settled on the project rather than per cabinet.",
    competitiveCeiling: msrp,
    ceilingBasis: "The maker's printed MSRP on the February 2026 dealer list.",
    msrp,
  }));

const cabinets: KitchenProduct[] = [
  ...aoc("Cabinets", "Full Height Cabinet, 1 Door,", [
    ["BFH9", "9 in", 521.9, 719.8],
    ["BFH12", "12 in", 592.9, 817.7],
    ["BFH15", "15 in", 658.1, 907.7],
    ["BFH18", "18 in", 722.7, 996.7],
    ["BFH21", "21 in", 773.2, 1066.4],
  ], IMG.gray),
  ...aoc("Cabinets", "Full Height Cabinet, 2 Door,", [
    ["BFH24", "24 in", 882.6, 1217.2],
    ["BFH27", "27 in", 945.3, 1303.7],
    ["BFH30", "30 in", 1007.8, 1390.1],
    ["BFH33", "33 in", 1070.5, 1476.6],
    ["BFH36", "36 in", 1135.1, 1565.6],
  ], IMG.gray),
  ...aoc("Cabinets", "Base Cabinet, 1 Door,", [
    ["B12", "12 in", 686.9, 947.3],
    ["B15", "15 in", 745.0, 1027.5],
    ["B18", "18 in", 807.7, 1114.1],
    ["B21", "21 in", 871.7, 1202.3],
  ], IMG.gray),
  ...aoc("Cabinets", "Base Cabinet, 2 Door,", [
    ["B24", "24 in", 981.1, 1353.0],
    ["B27", "27 in", 1043.6, 1439.4],
    ["B30", "30 in", 1106.3, 1525.9],
  ], IMG.gray),
  ...aoc("Cabinets", "Drawer Base Cabinet,", [
    ["DB12", "12 in", 872.3, 1203.1],
    ["DB15", "15 in", 945.3, 1303.7],
    ["DB18", "18 in", 1018.1, 1404.2],
    ["DB21", "21 in", 1091.0, 1504.8],
    ["DB24", "24 in", 1163.9, 1605.3],
    ["DB27", "27 in", 1236.8, 1705.9],
    ["DB30", "30 in", 1309.7, 1806.5],
  ], IMG.gray),
  ...aoc("Cabinets", "Grill Base Cabinet, 2 Door,", [
    ["GB27", "27 in", 922.1, 1272.0],
    ["GB30", "30 in", 973.3, 1342.4],
    ["GB33", "33 in", 1023.8, 1412.0],
    ["GB36", "36 in", 1075.0, 1482.4],
    ["GB39", "39 in", 1125.5, 1552.0],
    ["GB42", "42 in", 1176.0, 1622.4],
  ], IMG.concrete),
  ...aoc("Cabinets", "Grill Base Cabinet, 4 Door,", [
    ["GB45", "45 in", 1227.2, 1692.8],
    ["GB48", "48 in", 1477.2, 2037.6],
    ["GB51", "51 in", 1532.2, 2113.6],
    ["GB54", "54 in", 1586.5, 2188.0],
    ["GB57", "57 in", 1641.5, 2264.0],
    ["GB60", "60 in", 1696.5, 2340.0],
  ], IMG.concrete),
  ...aoc("Cabinets", "Side Burner Base Cabinet, 1 Door,", [
    ["BSB15", "15 in", 655.5, 904.0],
    ["BSB18", "18 in", 705.4, 972.8],
    ["BSB21", "21 in", 754.6, 1040.8],
  ], IMG.concrete),
  ...aoc("Cabinets", "Side Burner Base Cabinet, 2 Door,", [
    ["BSB24", "24 in", 849.3, 1171.4],
    ["BSB27", "27 in", 922.2, 1271.9],
    ["BSB30", "30 in", 972.5, 1342.5],
  ], IMG.concrete),
  ...aoc("Cabinets", "Kamado Base Cabinet,", [
    ["KGB24", "24 in", 849.3, 1171.4],
    ["KGB33", "33 in", 1023.8, 1412.0],
    ["KGB36", "36 in", 1075.0, 1482.4],
  ], IMG.concrete),
  ...aoc("Cabinets", "Blind Corner Cabinet,", [
    ["BBC36", "36 in", 994.4, 1371.5],
    ["BBC39", "39 in", 1027.7, 1417.1],
    ["BBC42", "42 in", 1200.2, 1600.1],
  ], IMG.gray),
  ...aoc("Cabinets", "Sink Base Cabinet,", [
    ["SB18", "18 in", 601.1, 828.8],
    ["SB21", "21 in", 645.3, 889.6],
    ["SB24", "24 in", 736.1, 1015.2],
    ["SB27", "27 in", 780.2, 1076.0],
    ["SB30", "30 in", 824.9, 1138.4],
    ["SB33", "33 in", 869.7, 1199.2],
    ["SB36", "36 in", 914.5, 1261.6],
  ], IMG.gray),
  ...aoc("Cabinets", "Diagonal Corner Cabinet,", [
    ["BCC36", "36 in", 1457.4, 2010.4],
  ], IMG.gray),
  ...aoc("Cabinets", "Open Base Cabinet,", [
    ["BO12", "12 in", 487.3, 672.0],
    ["BO15", "15 in", 539.1, 743.2],
    ["BO18", "18 in", 590.9, 815.2],
    ["BO21", "21 in", 628.0, 866.4],
    ["BO24", "24 in", 677.2, 934.4],
    ["BO27", "27 in", 727.1, 1003.2],
    ["BO30", "30 in", 776.3, 1071.2],
  ], IMG.gray),
  ...aoc("Cabinets", "Wall Cabinet, 1 Door,", [
    ["W12", "12 in", 265.4, 366.4],
    ["W15", "15 in", 297.4, 409.6],
    ["W18", "18 in", 328.7, 453.6],
    ["W21", "21 in", 360.7, 497.6],
  ], IMG.indigo),
  ...aoc("Cabinets", "Wall Cabinet, 2 Door,", [
    ["W24", "24 in", 392.0, 540.8],
    ["W27", "27 in", 424.0, 584.8],
    ["W30", "30 in", 455.3, 628.0],
  ], IMG.indigo),
  ...aoc("Cabinets", "End Panel,", [
    ["BFEP24", "24 in deep", 143.4, 197.7],
    ["BFEP27", "27 in deep", 156.1, 215.3],
  ], IMG.indigo),
  ...aoc("Cabinets", "Refrigerator Column,", [
    ["BREP24", "24 in", 321.0, 442.8],
    ["BREP27", "27 in", 337.7, 465.8],
  ], IMG.indigo),
  ...aoc("Cabinets", "Trash Pull Out Cabinet,", [
    ["TPO15", "15 in", 890.2, 1228.0],
    ["TPO18", "18 in", 951.6, 1312.0],
    ["TPO21", "21 in, double", 1013.0, 1397.2],
  ], IMG.gray),
  ...aoc("Cabinets", "Toe Kick,", [
    ["TK", "95 by 6 in", 101.8, 140.3],
  ], IMG.indigo),
  ...aoc("Cabinets", "Base Filler,", [
    ["BF3", "3 in", 37.2, 51.3],
    ["BF6", "6 in", 74.4, 102.6],
  ], IMG.indigo),
  ...aoc("Cabinets", "Filler With Cleat,", [
    ["FWC3", "3 in", 130.1, 185.9],
    ["FWC6", "6 in", 174.2, 248.9],
  ], IMG.indigo),
  ...aoc("Cabinets", "Back Panel,", [
    ["FBP", "36 to 95 in", 214.3, 296.0],
  ], IMG.indigo),
  ...aoc("Cabinets", "Raised Back Panel,", [
    ["RFBP", "36 to 95 in", 250.7, 345.8],
  ], IMG.indigo),
  ...aoc("Cabinet accessories", "Cabinet Pull Out,", [
    ["ACCPO", "each", 175.0, 250.0],
  ], IMG.indigo),
  ...aoc("Cabinet accessories", "Cabinet Drawer Add On,", [
    ["ACCDR", "each", 210.0, 300.0],
  ], IMG.indigo),
  ...aoc("Cabinet accessories", "LP Tank Pull Out,", [
    ["ACCLP", "each", 175.0, 250.0],
  ], IMG.indigo),
  ...aoc("Cabinet accessories", "316 Stainless Handle, 7 in,", [
    ["ACCHD", "each", 20.0, 35.0],
  ], IMG.indigo),
];

/* Back panels print as ranges by length on the dealer list; the low end
   is the entered row above and the range is named here on both rows. */
cabinets.forEach((p) => {
  if (p.id === "aoc-fbp") {
    p.costGap =
      "The list prices back panels as a range by length, $214.30 to $518.60 dealer ($296.00 to $716.00 MSRP); the low end is entered and the per length table is the named gap. Freight is charged at actual cost by the maker.";
  }
  if (p.id === "aoc-rfbp") {
    p.costGap =
      "The list prices raised back panels as a range by length, $250.70 to $606.80 dealer ($345.80 to $837.10 MSRP); the low end is entered and the per length table is the named gap. Freight is charged at actual cost by the maker.";
  }
});

/* ------------------------------------------------------------------ *
 * The 36 Belgard kitchen sets. Every set carries the grill island, the
 * working counter run and a patio floor (the composition law of the
 * set list). NO cost is on record for any set: no Belgard dealer price
 * list is held (GAP A4-1), so each set is entered with the gap named
 * and no price, and is priced from its own take off when quoted.
 * ------------------------------------------------------------------ */
const SET_NAMES = [
  "Alpine", "Artisan", "Avalon", "Axis", "Brentwood", "Briar Cliff",
  "Costa Brava", "Creekview", "Cressida", "Discovery", "Eden",
  "Falcon Ridge", "Harbor View", "Harmony", "Highland", "Lakepoint",
  "Legacy", "Mesa Vista", "Midtown", "Oak Hill", "Oasis", "Pinnacle",
  "Riverside", "Riviera", "Rosewood", "Serenity", "Sherwood", "Sienna",
  "Stargazer", "Stonecrest", "Sunset", "Township", "Tranquility",
  "Twilight", "Valley Grove", "Woodland",
];

const sets: KitchenProduct[] = SET_NAMES.map((name, i) => ({
  id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-kitchen-set`,
  name: `${name} Kitchen`,
  brand: "Belgard",
  group: "Kitchen sets",
  kind: "set" as const,
  unit: "each" as const,
  image: SET_IMAGES[i % SET_IMAGES.length],
  meta: "Complete kitchen set from the Belgard rooms collection",
  description:
    "A complete outdoor kitchen composed from the Belgard room of the same name: a grill island with a brand grill seated to its printed cutout, the working counter run and a patio floor cut around the elements. The set is priced from the project's own take off when it is quoted.",
  features: ["Grill island", "Working counter run", "Patio floor"],
  unitCost: null,
  costBasis: "No Belgard dealer price list is held anywhere in our records.",
  costGap:
    "GAP A4-1 / GAP S-1: no Belgard dealer price list and no installed Belgard package price is held, so no cost is carried for this set. It is priced from the project's own take off, line by line, when quoted.",
}));

/** The full kitchen catalogue, costs attached, before pricing. */
export const kitchenCatalog: KitchenProduct[] = [...core, ...cabinets, ...sets];

/**
 * Customer facing catalogue: each product with the selling price the
 * pricing model computes from its held cost. Products with no cost on
 * record carry price null and are shown without a price, never with an
 * invented one. `unitCost` and the breakdown stay available for the
 * internal sales view only.
 */
export const kitchens = kitchenCatalog.map((p) => {
  const breakdown = getKitchenPriceBreakdown({
    unitCost: p.unitCost,
    kind: p.kind,
    competitiveCeiling: p.competitiveCeiling,
    costGap: p.costGap,
  });
  return { ...p, price: breakdown.price, breakdown };
});

export type Kitchen = (typeof kitchens)[0];

/** Selling price of one kitchen product by id (quote tool features). */
export const kitchenPriceById = (id: string): number | null =>
  kitchens.find((k) => k.id === id)?.price ?? null;
