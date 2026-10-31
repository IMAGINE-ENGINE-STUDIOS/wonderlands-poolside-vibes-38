/**
 * Big Showcase — per-product finishes & options.
 *
 * Founder rule (2026-10-30): the showcase presents, for each product, the
 * options that product's own main-page product card carries — real options,
 * correct prices, actual imagery. No shared list sprayed across products,
 * no mixing brands, nothing invented, and no feature shown without imagery
 * unless it inherently has none (jets, services, build methods, colours).
 *
 * Every entry below is traced to the same data the main-page cards render:
 * PoolProductCard / GilmerPoolProductCard (pools), SpaProductCard /
 * GilmerSpaCard (spas), TanningLedgeProductCard (ledges), SaunaProductCard
 * via config/productFeatures (saunas), the cover feature config (covers)
 * and drivewayGates (gates). Full audit: SHOWCASE-AUDIT.md in the appbuild
 * root. Credits: Imagine Engine Studios Corp.
 */
import { getProductsByCategory, getProductsByCompatiblePool } from "@/data/consolidatedProducts";
import { poolLiners, poolTiles, tanningLedges } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { poolProductLookup, type PoolProductInfo } from "@/data/poolProductLookup";
import { getProductFeatures } from "@/config/productFeatures";
import { drivewayGates } from "@/data/drivewayGates";
import { LIVE_POOL_OPTIONS } from "@/components/PoolCustomizationOptions";

import sunsetGroveImage from "@/assets/water-features/waterfalls/sunset-grove-kit-pool.webp";
import maldivesImage from "@/assets/water-features/waterfalls/maldiveskit-castlerock.webp";
import serenityImage from "@/assets/water-features/waterfalls/serenitykit.webp";
import grassLightGreenImage from "@/assets/turf/grass-light-green.avif";
import grassDarkGreenImage from "@/assets/turf/grass-dark-green.avif";
import grassNaturalGreenImage from "@/assets/turf/grass-natural-green.avif";
import grassEmeraldImage from "@/assets/turf/grass-emerald.avif";
import grassOliveImage from "@/assets/turf/grass-olive.avif";

/** The heater photo every pool/spa/ledge card uses for its heater options. */
const HEATER_IMAGE = "/media/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp";
/** The screen-enclosure photo the platform carries for enclosure options. */
const SCREEN_IMAGE = "/media/c86467c2-f57b-407c-a9f8-9ad2143552c2.webp";

export interface ShowcaseFinish {
  name: string;
  price: number;
  image?: string;
  /** Gel-coat colour choices have no photo — the cards render a swatch. */
  color?: string;
}

export interface ShowcaseOption {
  id: string;
  name: string;
  description?: string;
  /** Flat price in USD, or the per-square-foot rate when unit is "sqft". */
  price: number;
  unit: "flat" | "sqft";
  image?: string;
  /** No photo exists by nature (equipment / service / build method). */
  exemptNoImage?: boolean;
}

export interface ShowcaseOptionGroup {
  key: string;
  label: string;
  options: ShowcaseOption[];
}

type ProductLike = PoolProductInfo;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isGlimmer = (p: ProductLike) => (p.brand ?? "").toLowerCase().includes("glimmer");

/** Gel-coat colours — the finish family on every Glimmerglass card
 *  (GilmerPoolProductCard colour options, gilmerSpas colorOptions,
 *  TanningLedgeProductCard gelcoat list). Included in the price ($0). */
const GELCOAT_FINISHES: ShowcaseFinish[] = [
  { name: "Ocean Blue", price: 0, color: "#1E40AF" },
  { name: "Sapphire Blue", price: 0, color: "#2563EB" },
  { name: "Coastal Bronze", price: 0, color: "#A16207" },
  { name: "Snow White", price: 0, color: "#FFFFFF" },
  { name: "Steel Grey", price: 0, color: "#6B7280" },
  { name: "Arctic White", price: 0, color: "#F8FAFC" },
  { name: "Glacier Blue", price: 0, color: "#0EA5E9" },
];

const catalogFinishes = (priceScale = 1): ShowcaseFinish[] =>
  getProductsByCategory("finish").map((f) => ({
    name: f.name,
    price: Math.round(f.price * priceScale),
    image: f.image,
  }));

/**
 * The finishes THIS product's card offers:
 * - Glimmerglass pools/spas/ledges → their gel-coat colours ($0, swatches).
 * - Latham / Wonderlands pools → the compatible catalog finishes, scoped
 *   exactly as PoolProductCard scopes them (getProductsByCompatiblePool).
 * - Latham spas → every catalog finish (SpaProductCard does not filter).
 * - Latham ledges → every catalog finish at half price (ledge card).
 */
export function showcaseFinishesFor(product: ProductLike): ShowcaseFinish[] {
  if (product.category === "Pool") {
    if (isGlimmer(product)) return GELCOAT_FINISHES;
    return getProductsByCompatiblePool("finish", product.name).map((f) => ({
      name: f.name,
      price: f.price,
      image: f.image,
    }));
  }
  if (product.category === "Spa") {
    if (isGlimmer(product)) return GELCOAT_FINISHES;
    return catalogFinishes(1);
  }
  if (product.category === "Tanning Ledge") {
    if (isGlimmer(product)) return GELCOAT_FINISHES;
    return catalogFinishes(0.5);
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Shared option builders — each traces to a card's own list           */
/* ------------------------------------------------------------------ */

const linerOptions = (priceScale = 1): ShowcaseOption[] =>
  poolLiners.map((l) => ({
    id: `liner-${slug(l.name)}`,
    name: l.name,
    description: `${l.type} waterline liner — priced per sq ft installed`,
    price: Math.round(l.price * priceScale),
    unit: "sqft" as const,
    image: l.image,
  }));

const tileOptions = (priceScale = 1): ShowcaseOption[] =>
  poolTiles.map((t) => ({
    id: `tile-${slug(t.name)}`,
    name: t.name,
    description: t.description,
    price: Math.round(t.price * priceScale),
    unit: "flat" as const,
    image: t.image,
  }));

const POOL_HEATERS: Array<[string, number, string]> = [
  ["Pentair MasterTemp 125 (125K BTU)", 3450, "Compact high-efficiency gas heater for pools up to 15,000 gallons"],
  ["Pentair MasterTemp 250 (250K BTU)", 5520, "Mid-size high-performance gas heater for medium pools"],
  ["Pentair MasterTemp 400 (400K BTU)", 7245, "High-capacity gas heater for large pools and quick heating"],
  ["Pentair UltraTemp 90 Heat Pump", 7762, "Energy-efficient heat pump for pools up to 20,000 gallons"],
  ["Pentair UltraTemp 110 Heat Pump", 9488, "High-efficiency heat pump for medium to large pools"],
  ["Pentair UltraTemp 140 Heat Pump", 11212, "Premium heat pump for large pools with maximum efficiency"],
];

const heaterOptions = (list: Array<[string, number, string]>): ShowcaseOption[] =>
  list.map(([name, price, description]) => ({
    id: `heater-${slug(name)}`,
    name,
    description,
    price,
    unit: "flat" as const,
    image: HEATER_IMAGE,
  }));

/** Spa heaters, brand-split exactly as the two spa cards split them. */
const spaHeaterOptions = (product: ProductLike): ShowcaseOption[] =>
  heaterOptions(
    isGlimmer(product)
      ? [
          ["Spa Heat Pump - Compact", 5250, "Compact heat pump designed for spas"],
          ["Spa Heat Pump - Premium", 6750, "Premium spa heat pump with digital controls"],
          ["Pentair MasterTemp 125 (125K BTU)", 3450, "Compact high-efficiency gas heater"],
          ["Pentair UltraTemp 90 Heat Pump", 7762, "Energy-efficient heat pump for spas"],
        ]
      : [
          ["Spa Heat Pump - Compact", 5250, "Compact heat pump designed for spas"],
          ["Spa Heat Pump - Premium", 6750, "Premium spa heat pump with digital controls"],
          ["Spa Gas Heater", 4200, "Efficient gas heater for quick spa heating"],
          ["Solar Spa Heater", 3300, "Eco-friendly solar heating for spas"],
        ],
  );

/** The automatic covers — the catalog's own cover products, so the option
 *  price and photo always match the standalone cover product. */
const coverOptions = (): ShowcaseOption[] => {
  const seen = new Set<string>();
  const out: ShowcaseOption[] = [];
  for (const p of Object.values(poolProductLookup)) {
    if (p.category !== "Cover" || seen.has(p.name)) continue;
    seen.add(p.name);
    out.push({
      id: `cover-${slug(p.name)}`,
      name: p.name,
      description: "Automatic safety cover — priced as the standalone product",
      price: p.price,
      unit: "flat" as const,
      image: p.image,
    });
  }
  return out;
};

/** Jet packages — kept from the quote tool's own list (the prices the live
 *  quote path charges). Jets are mechanical equipment: no photo exists on
 *  any card — exempt by nature (founder's example). */
const jetOptions = (): ShowcaseOption[] =>
  LIVE_POOL_OPTIONS.filter((o) => o.category === "jets").map((o) => ({
    id: o.id,
    name: o.name,
    description: o.description,
    price: o.price,
    unit: "flat" as const,
    exemptNoImage: true,
  }));

const waterfallOptions = (): ShowcaseOption[] =>
  [
    { name: "Sunset Grove", price: 17500, image: sunsetGroveImage },
    { name: "Maldives", price: 5600, image: maldivesImage },
    { name: "Serenity", price: 9500, image: serenityImage },
  ].map((w) => ({
    id: `waterfall-${slug(w.name)}`,
    name: `${w.name} Rocky Waterfall`,
    description: "Rock waterfall kit — Castle Rock, Gray or Brown",
    price: w.price,
    unit: "flat" as const,
    image: w.image,
  }));

/** Add-a-spa — the catalog's own spa products (PoolCatalog spas +
 *  gilmerSpas, which are exactly the spa products this showcase presents). */
const addSpaOptions = (): ShowcaseOption[] => {
  const seen = new Set<string>();
  const out: ShowcaseOption[] = [];
  for (const p of Object.values(poolProductLookup)) {
    if (p.category !== "Spa" || seen.has(p.name)) continue;
    seen.add(p.name);
    out.push({
      id: `addspa-${slug(p.name)}`,
      name: p.name,
      description: `${p.dimensions} · Depth ${p.depth}`,
      price: p.price,
      unit: "flat" as const,
      image: p.image,
    });
  }
  return out;
};

/** Add-a-tanning-ledge. Glimmerglass pools get their card's two ledges at
 *  the Gilmer card's prices; other pools get the full poolData ledge list
 *  PoolProductCard offers. (Price conflict flagged in SHOWCASE-AUDIT.md.) */
const addLedgeOptions = (product: ProductLike): ShowcaseOption[] => {
  if (isGlimmer(product)) {
    const byName = new Map(tanningLedges.map((l) => [l.name, l]));
    return [
      { name: "Paradise", price: 15750 },
      { name: "Leeward", price: 12352 },
    ].map((g) => ({
      id: `addledge-${slug(g.name)}`,
      name: `${g.name} Tanning Ledge`,
      description: byName.get(g.name)?.description,
      price: g.price,
      unit: "flat" as const,
      image: byName.get(g.name)?.image as string,
    }));
  }
  return tanningLedges.map((l) => ({
    id: `addledge-${slug(l.name)}`,
    name: l.name,
    description: l.description,
    price: l.price,
    unit: "flat" as const,
    image: l.image as string,
  }));
};

const paverOptions = (): ShowcaseOption[] =>
  paverTypes
    .filter((p) => p.category === "paver")
    .map((p) => ({
      id: `paver-${p.id}`,
      name: p.name,
      description: p.description,
      price: p.basePrice,
      unit: "sqft" as const,
      image: p.image,
    }));

/** Screen enclosure qualities — SCREEN_ENCLOSURE_PRICING ($22/$24/$26 per
 *  sq ft), the three qualities every card offers. */
const screenOptions = (): ShowcaseOption[] =>
  [
    { id: "screen-standard", name: "Standard Screen Enclosure", price: 22 },
    { id: "screen-deluxe", name: "Deluxe Screen Enclosure", price: 24 },
    { id: "screen-premium", name: "Premium Screen Enclosure", price: 26 },
  ].map((s) => ({
    ...s,
    description: "Aluminum frame screen enclosure, priced per sq ft",
    unit: "sqft" as const,
    image: SCREEN_IMAGE,
  }));

const grassOptions = (): ShowcaseOption[] =>
  [
    { name: "Light Green", image: grassLightGreenImage },
    { name: "Dark Green", image: grassDarkGreenImage },
    { name: "Natural Green", image: grassNaturalGreenImage },
    { name: "Emerald", image: grassEmeraldImage },
    { name: "Olive", image: grassOliveImage },
  ].map((g) => ({
    id: `grass-${slug(g.name)}`,
    name: `Artificial Grass — ${g.name}`,
    description: "Premium low-maintenance turf, priced per sq ft",
    price: 25,
    unit: "sqft" as const,
    image: g.image,
  }));

/** Concrete construction — flat $15,000 in the canonical feature config
 *  and on the Gilmer card. A build method: no photo exists (exempt). */
const concreteOption = (): ShowcaseOption => ({
  id: "concrete-construction",
  name: "Concrete Construction",
  description: "Reinforced concrete shell instead of fiberglass",
  price: 15000,
  unit: "flat",
  exemptNoImage: true,
});

const group = (key: string, label: string, options: ShowcaseOption[]): ShowcaseOptionGroup[] =>
  options.length > 0 ? [{ key, label, options }] : [];

/* ------------------------------------------------------------------ */
/* Per-category option sets — mirroring each product's own card        */
/* ------------------------------------------------------------------ */

function poolGroups(product: ProductLike): ShowcaseOptionGroup[] {
  const groups: ShowcaseOptionGroup[] = [
    ...group("waterline", "Waterline Liners", linerOptions(1)),
    ...group("tiles", "Waterline Tiles", tileOptions(1)),
    ...group("heating", "Pool Heating", heaterOptions(POOL_HEATERS)),
    ...group("covers", "Automatic Covers", coverOptions()),
    ...group("jets", "Water Jets & Hydrotherapy", jetOptions()),
    ...group("waterfalls", "Rocky Waterfalls", waterfallOptions()),
    ...group("addspa", "Add a Spa", addSpaOptions()),
    ...group("addledge", "Add a Tanning Ledge", addLedgeOptions(product)),
    ...group("pavers", "Deck Pavers", paverOptions()),
    ...group("screen", "Screen Enclosure", screenOptions()),
    ...group("grass", "Artificial Grass", grassOptions()),
  ];
  // Wonderlands pools are already concrete — the construction upgrade is
  // a fiberglass-pool option (both pool cards + feature config).
  if ((product.brand ?? "").toLowerCase() !== "wonderlands") {
    groups.push(...group("construction", "Construction", [concreteOption()]));
  }
  return groups;
}

function spaGroups(product: ProductLike): ShowcaseOptionGroup[] {
  return [
    ...group("waterline", "Waterline Liners", linerOptions(0.5)),
    ...group("tiles", "Spa Tiles", tileOptions(0.5)),
    ...group("heating", "Spa Heating", spaHeaterOptions(product)),
    ...group("jets", "Water Jets & Hydrotherapy", jetOptions()),
    ...group("pavers", "Deck Pavers", paverOptions()),
    ...group("screen", "Screen Enclosure", screenOptions()),
    ...group("construction", "Construction", [concreteOption()]),
  ];
}

function ledgeGroups(): ShowcaseOptionGroup[] {
  return [
    ...group(
      "heating",
      "Ledge Heating",
      heaterOptions([
        ["Pentair MasterTemp 125 (125K BTU)", 3450, "Compact high-efficiency gas heater"],
        ["Pentair UltraTemp 90 Heat Pump", 7762, "Energy-efficient heat pump for tanning ledges"],
      ]),
    ),
    ...group("pavers", "Deck Pavers", paverOptions()),
  ];
}

/** Saunas — the feature config SaunaProductCard renders, at the retail
 *  prices the config itself computes. $0 "None / Included" entries are
 *  defaults, not add-ons, so only priced options are presented. */
function saunaGroups(): ShowcaseOptionGroup[] {
  const groups: ShowcaseOptionGroup[] = [];
  for (const feature of getProductFeatures("sauna")) {
    const options: ShowcaseOption[] = [];
    if (feature.type === "selection" && feature.options) {
      for (const o of feature.options) {
        if (o.price <= 0) continue;
        options.push({
          id: `sauna-${feature.id}-${slug(o.name)}`,
          name: o.name,
          price: o.price,
          unit: "flat",
          image: o.image,
        });
      }
    } else if (feature.type === "boolean" && (feature.basePrice ?? 0) > 0) {
      options.push({
        id: `sauna-${feature.id}`,
        name: feature.label,
        price: feature.basePrice as number,
        unit: "flat",
        image: feature.image,
      });
    }
    if (options.length > 0) groups.push({ key: `sauna-${feature.id}`, label: feature.label, options });
  }
  return groups;
}

/** Covers — the cover feature config: professional installation (a
 *  service, exempt by nature). Bench enclosures carry no photo anywhere
 *  in the catalog and are excluded per the founder's rule (see audit). */
function coverGroups(): ShowcaseOptionGroup[] {
  const install = getProductFeatures("cover").find((f) => f.id === "installation");
  if (!install?.basePrice) return [];
  return group("services", "Services", [
    {
      id: "cover-installation",
      name: install.label,
      price: install.basePrice,
      unit: "flat",
      exemptNoImage: true,
    },
  ]);
}

/** Driveway gates — the gate card's only add-on (drivewayGates data).
 *  A gate opener is mechanical equipment; the card shows no photo. */
function gateGroups(): ShowcaseOptionGroup[] {
  const addon = drivewayGates[0]?.addons?.[0];
  if (!addon) return [];
  return group("automation", "Automation", [
    {
      id: "gate-opener",
      name: addon.name,
      description: addon.description,
      price: addon.price,
      unit: "flat",
      exemptNoImage: true,
    },
  ]);
}

export function showcaseOptionGroupsFor(product: ProductLike): ShowcaseOptionGroup[] {
  switch (product.category) {
    case "Pool":
      return poolGroups(product);
    case "Spa":
      return spaGroups(product);
    case "Tanning Ledge":
      return ledgeGroups();
    case "Sauna":
      return saunaGroups();
    case "Cover":
      return coverGroups();
    case "Driveway Gate":
      return gateGroups();
    default:
      return [];
  }
}
