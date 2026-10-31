import { getProductFeatures, type FeatureConfig, type FeatureOption, type ProductType } from "@/config/productFeatures";

export type StudioOption = {
  /** Display label, e.g. "Azure Blue G2" */
  label: string;
  /** Formatted price line, e.g. "$4,200" or "$15 / sq ft" */
  priceLabel: string;
  /** Raw price used when the reader adds the option to the order */
  price: number;
  /** Studio image for the option — shown on hover/tap */
  image?: string;
  /** Flat colour swatch when there is no photograph (gelcoat) */
  color?: string;
  /** Collection / sub-feature note */
  note?: string;
  /**
   * Pricing unit, mirrored from the Wonderlands Studio feature type:
   *  - "sqft"  — `price` is a rate per square foot (studio `area` feature)
   *  - "each"  — `price` is a rate per unit (studio `quantity` feature)
   *  - undefined — `price` is the exact one-off price (studio `selection`/`boolean`)
   */
  unit?: "sqft" | "each";
  /**
   * True when no priced studio item matched this editorial label: the option
   * exists, but its price is set in the studio — it must never be presented
   * as free ("Included") or added to a cart at $0.
   */
  unpriced?: boolean;
};

export type StudioGroup = {
  title: string;
  note: string;
  /** Legacy string list (kept for existing editorial chapters) */
  options: string[];
  items: StudioOption[];
  /**
   * The reader chooses exactly one option of this chapter — true for every
   * catalogue chapter (finishes, liners, tiles…), false for the turn-key
   * inclusions list which is informational only.
   */
  choice?: boolean;
};


/** Who the model belongs to — drives which finishes are actually offered. */
export type StudioContext = { modelName?: string; brand?: string };

/** FLIP category id -> Wonderlands Studio product type */
const CATEGORY_TO_PRODUCT: Record<string, ProductType> = {
  pools: "pool",
  "concrete-pools": "pool",
  spas: "spa",
  saunas: "sauna",
  "tanning-ledges": "tanning-ledge",
  covers: "cover",
  pavers: "paver",
  heaters: "heater",
  "screen-enclosures": "screen-enclosure",
  lanai: "screen-enclosure",
  "driveway-gates": "driveway-gate",
  finishes: "pool",
  liners: "pool",
};

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/* ------------------------------------------------------------------ *
 * Brand rules — mirrored from Wonderlands Studio so the magazine never
 * shows a finish the model cannot actually be ordered in.
 * ------------------------------------------------------------------ */

const WONDERLANDS_MODELS = ["Madre Perla", "Pacific Ridge", "Winderview", "Maxima", "Cape Coral"];
const LATHAM_MODELS = [
  "Astoria", "Milan", "Jamaica", "Aruba", "St. Croix", "Rio", "Apollo", "Enchantment",
  "Cancún Deluxe", "Cancun Deluxe", "Genesis", "Claremont", "Axiom", "Bay Isle", "Laguna",
  "Vista Isle", "Olympia", "Corinthian", "Key West", "Valencia", "Bermuda", "Java",
  "Pleasant Cove", "St. Lucia", "Delray", "Cape Cod", "Tuscan", "Synergy", "Coronado",
];

const isGlimmerGlass = (ctx: StudioContext) => (ctx.brand ?? "").toLowerCase().includes("glimmer");

/** SpaCatalog's spas — the card offers every catalog finish at full price. */
const SPA_CATALOG_MODELS = ["Mystic", "Serenity", "Tranquil", "Oasis"];
/** Latham tanning ledges — the card offers every catalog finish (the
 *  ledge feature config already halves the prices). */
const LATHAM_LEDGE_MODELS = ["Hermosa", "Rectangle"];

/** Only the collections the given model is offered in. */
const finishAllowed = (option: FeatureOption, ctx: StudioContext) => {
  const collection = (option as any).collection as string | undefined;
  const model = ctx.modelName ?? "";
  if (WONDERLANDS_MODELS.includes(model)) return collection === "Mini Pebbles";
  /* GlimmerGlass is finished in its own gelcoat only — no Latham finish ranges */
  if (isGlimmerGlass(ctx)) return false;
  if (SPA_CATALOG_MODELS.includes(model)) return true;
  if (LATHAM_LEDGE_MODELS.some((b) => model.startsWith(b))) return true;
  if (LATHAM_MODELS.some((b) => model.startsWith(b))) return collection === "Crystite Crystal";
  return collection !== "Crystite Crystal" && collection !== "Mini Pebbles";
};

const GELCOAT: StudioOption[] = [
  { label: "Ocean Blue", color: "#1E40AF", price: 0, priceLabel: "Included" },
  { label: "Sapphire Blue", color: "#2563EB", price: 0, priceLabel: "Included" },
  { label: "Coastal Bronze", color: "#A16207", price: 0, priceLabel: "Included" },
  { label: "Snow White", color: "#FFFFFF", price: 0, priceLabel: "Included" },
  { label: "Steel Grey", color: "#6B7280", price: 0, priceLabel: "Included" },
  { label: "Arctic White", color: "#F8FAFC", price: 0, priceLabel: "Included" },
  { label: "Glacier Blue", color: "#0EA5E9", price: 0, priceLabel: "Included" },
];

/**
 * Studio features that are quoted per square foot even though their config type
 * is a plain selection (liners are $/sq ft of interior surface in the studio;
 * screen-enclosure quality tiers are $/sq ft of screen area).
 */
const SQFT_FEATURE_IDS = new Set(["liner", "quality", "baseMaterial"]);

// `pricedByArea` selections (paver base material) are also $/sq ft.
const isSqFt = (f: FeatureConfig) =>
  f.type === "area" || (f as any).pricedByArea === true || SQFT_FEATURE_IDS.has(f.id);

const unitFor = (f: FeatureConfig) =>
  isSqFt(f) ? " / sq ft" : f.type === "quantity" ? " each" : "";

/** Studio feature type -> pricing unit, so the magazine multiplies exactly as the studio does. */
const unitKindFor = (f: FeatureConfig): StudioOption["unit"] =>
  isSqFt(f) ? "sqft" : f.type === "quantity" ? "each" : undefined;


const buildItems = (f: FeatureConfig, ctx: StudioContext, prefix = ""): StudioOption[] => {
  const out: StudioOption[] = [];
  const unit = unitFor(f);
  const unitKind = unitKindFor(f);

  if (f.options?.length) {
    f.options.forEach((o) => {
      const name = ((o.name ?? (o as any).model ?? "") as string).trim();
      if (!name || name.toLowerCase() === "none") return;
      if (f.id === "finish" && !finishAllowed(o, ctx)) return;
      const price = Number(o.price) || 0;
      out.push({
        label: prefix ? `${prefix}: ${name}` : name,
        price,
        priceLabel: price > 0 ? `${money(price)}${unit}` : "Included",
        unit: unitKind,
        image: o.image,
        color: o.color,
        note: ((o as any).collection ?? o.description) as string | undefined,
      });
    });
  }

  if (!out.length && !f.subFeatures?.length && !f.options?.length) {
    const base = Number(f.basePrice) || Number(f.pricePerUnit) || 0;
    out.push({
      label: prefix ? `${prefix}: ${f.label}` : f.label,
      price: base,
      priceLabel: base > 0 ? `${money(base)}${unit}` : "Included",
      unit: unitKind,
      image: f.image,
      note: f.description,
    });
  }

  f.subFeatures?.forEach((sf) => {
    buildItems(sf, ctx, sf.label).forEach((i) => out.push(i));
  });

  return out;
};

/**
 * Every additional feature configurable in Wonderlands Studio for a FLIP
 * model, shaped as editorial option chapters. Memoised per category + model.
 */
const cache = new Map<string, StudioGroup[]>();

/** The turn-key scope carried on every pool, spa and tanning ledge — never an extra. */
const STANDARD_INCLUSIONS: StudioOption[] = TURNKEY_SCOPE.map((i) => ({
  label: i.label,
  price: 0,
  priceLabel: "Included",
  note: i.note,
}));

import { TURNKEY_SCOPE } from "@/data/turnkeyScope";
import sunsetGroveImage from "@/assets/water-features/waterfalls/sunset-grove-kit-pool.webp";
import maldivesImage from "@/assets/water-features/waterfalls/maldiveskit-castlerock.webp";
import serenityWaterfallImage from "@/assets/water-features/waterfalls/serenitykit.webp";
import grassLightGreenImage from "@/assets/turf/grass-light-green.avif";
import grassDarkGreenImage from "@/assets/turf/grass-dark-green.avif";
import grassNaturalGreenImage from "@/assets/turf/grass-natural-green.avif";
import grassEmeraldImage from "@/assets/turf/grass-emerald.avif";
import grassOliveImage from "@/assets/turf/grass-olive.avif";

/** Rocky waterfall kits — the pool cards' own waterfall options. */
const WATERFALL_OPTIONS: StudioOption[] = [
  { label: "Sunset Grove Rocky Waterfall", price: 17500, priceLabel: "$17,500", image: sunsetGroveImage, note: "Rock waterfall kit — Castle Rock, Gray or Brown" },
  { label: "Maldives Rocky Waterfall", price: 5600, priceLabel: "$5,600", image: maldivesImage, note: "Rock waterfall kit — Castle Rock, Gray or Brown" },
  { label: "Serenity Rocky Waterfall", price: 9500, priceLabel: "$9,500", image: serenityWaterfallImage, note: "Rock waterfall kit — Castle Rock, Gray or Brown" },
];

/** Artificial grass — the turf range, priced per square foot. */
const GRASS_OPTIONS: StudioOption[] = [
  { label: "Artificial Grass — Light Green", price: 25, priceLabel: "$25 / sq ft", unit: "sqft", image: grassLightGreenImage },
  { label: "Artificial Grass — Dark Green", price: 25, priceLabel: "$25 / sq ft", unit: "sqft", image: grassDarkGreenImage },
  { label: "Artificial Grass — Natural Green", price: 25, priceLabel: "$25 / sq ft", unit: "sqft", image: grassNaturalGreenImage },
  { label: "Artificial Grass — Emerald", price: 25, priceLabel: "$25 / sq ft", unit: "sqft", image: grassEmeraldImage },
  { label: "Artificial Grass — Olive", price: 25, priceLabel: "$25 / sq ft", unit: "sqft", image: grassOliveImage },
];

/** The heater photo every pool/spa card uses. */
const HEATER_IMAGE = "/media/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp";

/** Spa heaters, brand-split exactly as the two spa cards split them. */
const spaHeaterItems = (glimmer: boolean): StudioOption[] =>
  (glimmer
    ? [
        ["Spa Heat Pump - Compact", 5250],
        ["Spa Heat Pump - Premium", 6750],
        ["Pentair MasterTemp 125 (125K BTU)", 3450],
        ["Pentair UltraTemp 90 Heat Pump", 7762],
      ]
    : [
        ["Spa Heat Pump - Compact", 5250],
        ["Spa Heat Pump - Premium", 6750],
        ["Spa Gas Heater", 4200],
        ["Solar Spa Heater", 3300],
      ]
  ).map(([label, price]) => ({
    label: label as string,
    price: price as number,
    priceLabel: money(price as number),
    image: HEATER_IMAGE,
  }));

const POOL_LIKE = new Set(["pools", "concrete-pools", "spas", "tanning-ledges", "finishes", "liners"]);

/**
 * Categories that are actually a built vessel, i.e. the only books where the
 * turn-key scope (permits, engineering, land work, project management) applies.
 * Surface catalogues such as "finishes" and "liners" are a *choice inside* a
 * vessel — they must never carry the construction scope of a whole pool.
 */
const SHELL_LIKE = new Set(["pools", "concrete-pools", "spas", "tanning-ledges"]);

/**
 * Per-category allow-list of Wonderlands Studio feature ids.
 * Without this, catalogue categories inherit the *entire* pool feature set
 * (heaters, jets, covers, screen enclosures, "add a spa"…), which does not
 * educate a reader who opened the surface-finish or liner book.
 * Categories absent from this map keep every feature of their product type.
 */
const CATEGORY_FEATURE_ALLOW: Record<string, Set<string>> = {
  /* Spas can show spa finishes, waterline, heater, jets, cover and their immediate surround — never tanning ledges */
  spas: new Set(["finish", "liner", "tiles", "heater", "jets", "pavers", "screenEnclosure"]),
  /* Tanning ledges are shallow-water shelves; they do not inherit add-a-spa, enclosure or concrete-pool construction chapters */
  "tanning-ledges": new Set(["finish", "heater", "jets", "pavers"]),
  /* Pavers are a hardscape surface: the paver material itself, the measured deck area and the base */
  pavers: new Set(["material", "area", "baseMaterial"]),
  /* Covers need their fabric colour and housing/install choices; never pool heaters/jets/finishes */
  covers: new Set(["coverColor", "installation", "benchEnclosure"]),
  /* Enclosures and lanais share the screen-enclosure configurator, but stay in enclosure scope */
  "screen-enclosures": new Set(["area", "quality", "doorType", "roofStyle"]),
  lanai: new Set(["area", "quality", "doorType", "roofStyle"]),
  /* Driveway gates keep only access, operator and install choices */
  "driveway-gates": new Set(["automation"]),
  /* Interior surfaces: the finish itself plus the tile/waterline detail read against it */
  finishes: new Set(["finish", "tiles"]),
  /* Vinyl liner prints: the liner field and its waterline border only */
  liners: new Set(["liner", "tiles"]),
};

export const getStudioFeatureGroups = (categoryId: string, ctx: StudioContext = {}): StudioGroup[] => {
  const key = `${categoryId}|${ctx.modelName ?? ""}|${ctx.brand ?? ""}`;
  const cached = cache.get(key);
  if (cached) return cached;

  /* The concrete edition is the Wonderlands collection; without a model in
     context its finishes still resolve to the Mini Pebbles range. */
  if (categoryId === "concrete-pools" && !ctx.modelName) {
    ctx = { ...ctx, modelName: WONDERLANDS_MODELS[0] };
  }

  const productType = CATEGORY_TO_PRODUCT[categoryId];
  const allow = CATEGORY_FEATURE_ALLOW[categoryId];
  const groups: StudioGroup[] = [];

  if (SHELL_LIKE.has(categoryId)) {
    groups.push({
      title: "Included as standard",
      note: "Permits, engineering, land work, equipment, logistics and project management to turn-key — never charged as additional features",
      items: STANDARD_INCLUSIONS,
      options: STANDARD_INCLUSIONS.map((i) => i.label),
      choice: false,
    });
  }

  if (isGlimmerGlass(ctx) && (categoryId === "pools" || categoryId === "spas" || categoryId === "finishes" || categoryId === "tanning-ledges")) {
    groups.push({
      title: "Gelcoat colour",
      note: "Included with every GlimmerGlass shell — the only line finished in gelcoat",
      items: GELCOAT,
      options: GELCOAT.map((g) => g.label),
      choice: true,
    });
  }

  /* Spas carry their own insulated cover as a priced item — never the
     pool automatic-cover chapter. */
  if (categoryId === "spas") {
    const spaCover: StudioOption = { label: "Spa Cover", price: 3200, priceLabel: "$3,200" };
    groups.push({
      title: "Spa Cover",
      note: "Insulated spa cover, sized to the vessel",
      items: [spaCover],
      options: ["Spa Cover — $3,200"],
      choice: true,
    });
  }

  /* Pools gain the waterfall and turf chapters their cards carry. */
  if (categoryId === "pools" || categoryId === "concrete-pools") {
    groups.push({
      title: "Rocky Waterfalls",
      note: "Rock waterfall kits — Castle Rock, Gray or Brown",
      items: WATERFALL_OPTIONS,
      options: WATERFALL_OPTIONS.map((i) => `${i.label} — ${i.priceLabel}`),
      choice: true,
    });
    groups.push({
      title: "Artificial Grass",
      note: "Premium low-maintenance turf, priced per sq ft",
      items: GRASS_OPTIONS,
      options: GRASS_OPTIONS.map((i) => `${i.label} — ${i.priceLabel}`),
      choice: true,
    });
  }

  if (productType) {
    getProductFeatures(productType).forEach((f) => {
      /* Keep only the features that educate a reader of *this* book */
      if (allow && !allow.has(f.id)) return;
      /* Wonderlands pools ARE concrete — no Concrete Construction chapter */
      if (
        f.id === "concreteConstruction" &&
        (categoryId === "concrete-pools" || WONDERLANDS_MODELS.includes(ctx.modelName ?? ""))
      )
        return;
      const items = (
        categoryId === "spas" && f.id === "heater"
          ? spaHeaterItems(isGlimmerGlass(ctx))
          : buildItems(f, ctx)
      ).filter((i) => !(POOL_LIKE.has(categoryId) && /salt/i.test(i.label)));

      if (!items.length) return;
      groups.push({
        title: f.label,
        note: f.description || `${f.label} — configured in Wonderlands Studio`,
        items,
        options: items.map((i) => (i.price > 0 ? `${i.label} — ${i.priceLabel}` : i.label)),
        choice: true,
      });
    });
  }


  cache.set(key, groups);
  return groups;
};

const norm = (s: string) =>
  s.toLowerCase().replace(/—.*$/, "").replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Editorial chapters first, then every remaining studio feature. */
export const mergeStudioGroups = (
  categoryId: string,
  editorial: { title: string; note: string; options: string[] }[],
  ctx: StudioContext = {},
): StudioGroup[] => {
  const studio = getStudioFeatureGroups(categoryId, ctx);
  const seen = new Set(studio.map((g) => g.title.toLowerCase()));

  /** Every priced studio option, so editorial lists quote the same numbers. */
  const priced = new Map<string, StudioOption>();
  studio.forEach((g) =>
    g.items.forEach((i) => {
      const k = norm(i.label);
      if (k && !priced.has(k)) priced.set(k, i);
    }),
  );
  const match = (label: string) => {
    const k = norm(label);
    if (!k) return undefined;
    const exact = priced.get(k);
    if (exact) return exact;
    for (const [pk, item] of priced) {
      if (pk.length > 3 && (k.includes(pk) || pk.includes(k))) return item;
    }
    return undefined;
  };

  const extra: StudioGroup[] = editorial
    .filter((g) => !seen.has(g.title.toLowerCase()))
    .map((g) => {
      const items = g.options
        .map((label) => {
          if (POOL_LIKE.has(categoryId) && /salt/i.test(label)) {
            return { label, price: 0, priceLabel: "Included" } as StudioOption;
          }
          const hit = match(label);
          return hit
            ? { ...hit, label, image: hit.image, note: hit.note }
            : ({ label, price: 0, priceLabel: "Configured in the studio", unpriced: true } as StudioOption);
        })
        /* FLIP never prints an unpriced "Configured in the studio" line —
           an editorial option with no priced studio match is dropped, and
           a chapter with nothing priced left in it is dropped whole. */
        .filter((i) => !i.unpriced);
      return { ...g, items, options: items.map((i) => i.label) };
    })
    .filter((g) => g.items.length > 0);
  return [...studio, ...extra];
};
