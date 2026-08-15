import { getProductFeatures, type FeatureConfig, type ProductType } from "@/config/productFeatures";

export type StudioGroup = { title: string; note: string; options: string[] };

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
};

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const optionLabels = (f: FeatureConfig): string[] => {
  const out: string[] = [];

  if (f.options?.length) {
    f.options.forEach((o) => {
      const name = (o.name ?? o.model ?? "").toString().trim();
      if (!name || name.toLowerCase() === "none") return;
      const price = Number(o.price) || 0;
      const unit = f.type === "area" ? " / sq ft" : "";
      out.push(price > 0 ? `${name} — ${money(price)}${unit}` : name);
    });
  }

  if (!out.length) {
    const base = Number(f.basePrice) || 0;
    const unit = f.type === "quantity" ? " each" : f.type === "area" ? " / sq ft" : "";
    out.push(base > 0 ? `${f.label} — ${money(base)}${unit}` : f.label);
  }

  f.subFeatures?.forEach((sf) => {
    optionLabels(sf).forEach((l) => out.push(`${sf.label}: ${l}`));
  });

  return out;
};

/**
 * Every additional feature configurable in Wonderlands Studio for a FLIP
 * category, shaped as editorial option chapters. Memoised per category.
 */
const cache = new Map<string, StudioGroup[]>();

export const getStudioFeatureGroups = (categoryId: string): StudioGroup[] => {
  const cached = cache.get(categoryId);
  if (cached) return cached;

  const productType = CATEGORY_TO_PRODUCT[categoryId];
  const groups: StudioGroup[] = productType
    ? getProductFeatures(productType).map((f) => ({
        title: f.label,
        note: f.description || `${f.label} — configured in Wonderlands Studio`,
        options: optionLabels(f),
      }))
    : [];

  const clean = groups.filter((g) => g.options.length > 0);
  cache.set(categoryId, clean);
  return clean;
};

/** Editorial chapters first, then every remaining studio feature. */
export const mergeStudioGroups = (categoryId: string, editorial: StudioGroup[]): StudioGroup[] => {
  const seen = new Set(editorial.map((g) => g.title.toLowerCase()));
  const extra = getStudioFeatureGroups(categoryId).filter((g) => !seen.has(g.title.toLowerCase()));
  return [...editorial, ...extra];
};
