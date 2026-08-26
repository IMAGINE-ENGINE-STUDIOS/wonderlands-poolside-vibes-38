/**
 * Canonical product categories for the whole store.
 *
 * Real categories are product families (Pools, Spas, Saunas, ...).
 * Words like "premium", "deluxe", "standard" are PRICING TIERS, never categories,
 * so they are never surfaced as a category label anywhere in the UI.
 */

export const CATEGORY_LABELS: Record<string, string> = {
  pool: 'Pools',
  pools: 'Pools',
  'fiberglass-pool': 'Pools',
  'concrete-pool': 'Pools',
  'build-a-pool': 'Pools',
  spa: 'Spas',
  spas: 'Spas',
  'hot-tub': 'Spas',
  sauna: 'Saunas',
  saunas: 'Saunas',
  'tanning-ledge': 'Tanning Ledges',
  'tanning-ledges': 'Tanning Ledges',
  'screen-enclosure': 'Screen Enclosures',
  'screen-enclosures': 'Screen Enclosures',
  enclosure: 'Screen Enclosures',
  'patio-fencing': 'Patio Fencing',
  fencing: 'Patio Fencing',
  fence: 'Patio Fencing',
  lanai: 'Lanai',
  paver: 'Pavers',
  pavers: 'Pavers',
  'artificial-grass': 'Artificial Grass',
  grass: 'Artificial Grass',
  solar: 'Wonderlands Solar',
  landscaping: 'Landscaping',
  plant: 'Landscaping',
  cover: 'Pool Covers',
  covers: 'Pool Covers',
  'automatic cover': 'Pool Covers',
  'driveway-gate': 'Driveway Gates',
  'driveway-gates': 'Driveway Gates',
  gate: 'Driveway Gates',
  finish: 'Pool Finishes',
  finishes: 'Pool Finishes',
  liner: 'Liners',
  liners: 'Liners',
  tile: 'Pool Tiles',
  tiles: 'Pool Tiles',
  heater: 'Heaters',
  heaters: 'Heaters',
  waterfall: 'Water Features',
  'water-feature': 'Water Features',
  scene: 'Scenes',
  scenes: 'Scenes',
};

/** Pricing tiers / marketing words that must never be shown as a category. */
const TIER_WORDS = new Set([
  'premium',
  'deluxe',
  'standard',
  'compact',
  'luxury',
  'basic',
  'entry',
  'mid',
  'sample',
  'featured',
  'best-seller',
  'best seller',
  'per sq ft',
  'per linear ft',
  'other',
]);

const normalize = (value?: string) => String(value || '').trim().toLowerCase();

/** Looks a value up in the canonical map (returns '' when unknown or a tier word). */
const lookup = (value?: string): string => {
  const key = normalize(value);
  if (!key || TIER_WORDS.has(key)) return '';
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  // Slug/label variants: "Screen Enclosure", "pool_kit", ...
  const slug = key.replace(/[\s_]+/g, '-');
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  const singular = slug.replace(/s$/, '');
  if (CATEGORY_LABELS[singular]) return CATEGORY_LABELS[singular];
  return '';
};

/** Scans free text (id, name) for a known category keyword. */
const scan = (text?: string): string => {
  const value = normalize(text).replace(/[\s_]+/g, '-');
  if (!value) return '';
  const match = Object.keys(CATEGORY_LABELS)
    .filter(key => key.length > 3)
    .sort((a, b) => b.length - a.length)
    .find(key => value.includes(key));
  return match ? CATEGORY_LABELS[match] : '';
};

/**
 * Resolves the real category label for a product.
 * @param raw the product's declared category (may be a pricing tier — ignored then)
 * @param hints other clues, in priority order: type, id, name, active tab
 */
export const resolveCategoryLabel = (raw?: string, ...hints: (string | undefined)[]): string => {
  for (const hint of hints) {
    const fromHint = lookup(hint);
    if (fromHint) return fromHint;
  }
  const direct = lookup(raw);
  if (direct) return direct;
  for (const hint of hints) {
    const scanned = scan(hint);
    if (scanned) return scanned;
  }
  return scan(raw) || '';
};

/** Convenience wrapper for product-shaped objects. */
export const getCategoryLabelForProduct = (product: any, activeTab?: string): string => {
  if (!product) return lookup(activeTab);
  return resolveCategoryLabel(
    product.category,
    product.type,
    product.id,
    product.model || product.name,
    activeTab
  );
};
