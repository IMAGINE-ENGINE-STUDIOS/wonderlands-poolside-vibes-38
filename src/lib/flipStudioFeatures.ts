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
};

export type StudioGroup = {
  title: string;
  note: string;
  /** Legacy string list (kept for existing editorial chapters) */
  options: string[];
  items: StudioOption[];
};

/** Who the model belongs to — drives which finishes are actually offered. */
export type StudioContext = { modelName?: string; brand?: string };

/** FLIP category id -> Wonderlands Studio product type */
const CATEGORY_TO_PRODUCT: Record<string, ProductType> = {
  pools: "pool",
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

const unitFor = (f: FeatureConfig) =>
  f.type === "area" ? " / sq ft" : f.type === "quantity" ? " each" : "";

const buildItems = (f: FeatureConfig, ctx: StudioContext, prefix = ""): StudioOption[] => {
  const out: StudioOption[] = [];
  const unit = unitFor(f);

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

export const getStudioFeatureGroups = (categoryId: string, ctx: StudioContext = {}): StudioGroup[] => {
  const key = `${categoryId}|${ctx.modelName ?? ""}|${ctx.brand ?? ""}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const productType = CATEGORY_TO_PRODUCT[categoryId];
  const groups: StudioGroup[] = [];

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
      const items = buildItems(f, ctx);
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

/** Editorial chapters first, then every remaining studio feature. */
export const mergeStudioGroups = (
  categoryId: string,
  editorial: { title: string; note: string; options: string[] }[],
  ctx: StudioContext = {},
): StudioGroup[] => {
  const studio = getStudioFeatureGroups(categoryId, ctx);
  const seen = new Set(studio.map((g) => g.title.toLowerCase()));
  const extra: StudioGroup[] = editorial
    .filter((g) => !seen.has(g.title.toLowerCase()))
    .map((g) => ({
      ...g,
      items: g.options.map((label) => ({ label, price: 0, priceLabel: "Specified on survey" })),
    }));
  return [...studio, ...extra];
};
