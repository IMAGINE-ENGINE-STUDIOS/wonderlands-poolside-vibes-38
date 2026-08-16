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

/** Only the collections the given model is offered in. */
const finishAllowed = (option: FeatureOption, ctx: StudioContext) => {
  const collection = (option as any).collection as string | undefined;
  const model = ctx.modelName ?? "";
  if (WONDERLANDS_MODELS.includes(model)) return collection === "Mini Pebbles";
  if (!isGlimmerGlass(ctx) && LATHAM_MODELS.some((b) => model.startsWith(b))) {
    return collection === "Crystite Crystal";
  }
  /* GlimmerGlass and everything else: neither Latham nor concrete-only palettes */
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
const SQFT_FEATURE_IDS = new Set(["liner", "quality"]);

const isSqFt = (f: FeatureConfig) => f.type === "area" || SQFT_FEATURE_IDS.has(f.id);

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

  if (!out.length && !f.subFeatures?.length) {
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
import { pebbleTecFinishes as PEBBLE_TEC, PEBBLE_TEC_PRICE_LABEL } from "@/data/pebbleTecFinishes";

const POOL_LIKE = new Set(["pools", "concrete-pools", "spas", "tanning-ledges", "finishes", "liners"]);

export const getStudioFeatureGroups = (categoryId: string, ctx: StudioContext = {}): StudioGroup[] => {
  const key = `${categoryId}|${ctx.modelName ?? ""}|${ctx.brand ?? ""}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const productType = CATEGORY_TO_PRODUCT[categoryId];
  const groups: StudioGroup[] = [];

  if (POOL_LIKE.has(categoryId)) {
    groups.push({
      title: "Included as standard",
      note: "Permits, engineering, land work, equipment, logistics and project management to turn-key — never charged as additional features",
      items: STANDARD_INCLUSIONS,
      options: STANDARD_INCLUSIONS.map((i) => i.label),
    });
  }

  /* Concrete shells are finished in Pebble Tec — never in a moulded gelcoat */
  if (categoryId === "concrete-pools") {
    const finishes: StudioOption[] = PEBBLE_TEC.map((f) => ({
      label: `${f.name} — ${f.collection}`,
      price: 0,
      priceLabel: PEBBLE_TEC_PRICE_LABEL,
      note: f.note,
    }));
    groups.push({
      title: "Pebble Tec interior finish",
      note: "The surface of every Wonderlands concrete shell — priced per shell surface area",
      items: finishes,
      options: finishes.map((f) => f.label),
    });
  }

  if (isGlimmerGlass(ctx) && (categoryId === "pools" || categoryId === "spas" || categoryId === "finishes")) {
    groups.push({
      title: "Gelcoat colour",
      note: "Included with every GlimmerGlass shell — the only line finished in gelcoat",
      items: GELCOAT,
      options: GELCOAT.map((g) => g.label),
    });
  }

  if (productType) {
    getProductFeatures(productType).forEach((f) => {
      const items = buildItems(f, ctx).filter(
        (i) => !(POOL_LIKE.has(categoryId) && /salt/i.test(i.label)),
      );
      if (!items.length) return;
      groups.push({
        title: f.label,
        note: f.description || `${f.label} — configured in Wonderlands Studio`,
        items,
        options: items.map((i) => (i.price > 0 ? `${i.label} — ${i.priceLabel}` : i.label)),
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
    .map((g) => ({
      ...g,
      items: g.options.map((label) => {
        if (POOL_LIKE.has(categoryId) && /salt/i.test(label)) {
          return { label, price: 0, priceLabel: "Included" } as StudioOption;
        }
        const hit = match(label);
        return hit
          ? { ...hit, label, image: hit.image, note: hit.note }
          : ({ label, price: 0, priceLabel: "Included" } as StudioOption);
      }),
    }));
  return [...studio, ...extra];
};
