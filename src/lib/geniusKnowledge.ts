/**
 * Genius knowledge — one digest of everything Genius may quote: every catalog
 * product (pools, spas, saunas, ledges, covers, gates) with real prices and
 * sizes, trade rates, and the warranties from quoteDisciplines.
 *
 * Built once per session (memoised) from the live data files — no invented
 * figures. Used by the local flip brain (superlatives: cheapest, most
 * expensive, under $X) and sent to the `genius` function as CATALOG
 * (Meta models via OpenRouter — see knowledge/model-routing.md).
 */
import { getAllProducts, type PoolProductInfo } from '@/data/poolProductLookup';
import { gilmerSpas } from '@/data/gilmerSpas';
import { saunas } from '@/data/saunaData';
import { DISCIPLINES } from '@/lib/quoteDisciplines';
import { paverTypes } from '@/data/paverData';

export interface KnowledgeItem { name: string; category: string; brand?: string; price: number; dimensions?: string; depth?: string; note?: string; image?: string }

/** Trade rates already used by the app's estimators. */
const TRADE_RATES = [
  'Pool shell (custom drawn): $250 per sq ft of water',
  'Concrete deck: from $10 per sq ft',
  'Coralina porcelain pavers: $25 per sq ft',
  'Landscaping Full Yard Makeover: $15 per sq ft; Luxury Landscaping: $20+ per sq ft; Themed Patio: priced by a designer',
  'Pools and spas include delivery, installation and the product as described',
  'Financing available; consultations at calendly.com/wonderlandsworlds/30min',
];

let cache: KnowledgeItem[] | null = null;

export function getKnowledgeItems(): KnowledgeItem[] {
  if (cache) return cache;
  const seen = new Set<string>();
  const out: KnowledgeItem[] = [];
  const push = (i: KnowledgeItem) => {
    const k = `${i.category}|${i.name}`.toLowerCase();
    if (seen.has(k) || !(i.price > 0)) return;
    seen.add(k);
    out.push(i);
  };
  /* Same live catalog files the main page renders — new products appear automatically. */
  getAllProducts().forEach((p: PoolProductInfo) =>
    push({ name: p.name, category: p.category, brand: p.brand, price: p.price, dimensions: p.dimensions, depth: p.depth, image: p.image }),
  );
  gilmerSpas.forEach((s: any) =>
    push({ name: s.model, category: 'Spa', brand: s.brand, price: s.price, dimensions: s.dimensions, depth: s.depth, note: s.warranty, image: s.image ?? s.images?.[0] }),
  );
  saunas.forEach((s: any) => push({ name: s.model ?? s.name, category: 'Sauna', brand: 'Almost Heaven', price: s.price, dimensions: s.dimensions, image: s.image }));
  /* Pavers are priced per square foot (main-page paver catalog). */
  paverTypes.forEach((p) => push({ name: p.name, category: 'Paver', price: p.basePrice, note: p.description, image: p.image }));
  cache = out;
  return out;
}

/**
 * Structured product picks for a search query — sorted by price or size when
 * asked, so the search shows real product cards, not just text.
 * © Imagine Engine Studios Corp.
 */
export function intentProducts(raw: string, limit = 6): KnowledgeItem[] {
  const t = toEnglishIntent(raw).toLowerCase();
  const catHit = CAT_WORDS.find(([re]) => re.test(t))?.[1];
  let list = getKnowledgeItems();
  if (catHit) list = list.filter((i) => i.category === catHit);
  if (/concrete/.test(t)) list = list.filter((i) => i.brand === 'Wonderlands');
  if (/fiberglass/.test(t)) list = list.filter((i) => i.brand !== 'Wonderlands');
  const brand = ['latham', 'glimmerglass', 'wonderlands', 'gilmer', 'almost heaven'].find((b) => t.includes(b));
  if (brand) list = list.filter((i) => (i.brand ?? '').toLowerCase().includes(brand));
  const words = t.split(/\W+/).filter((w) => w.length > 3);
  const named = list.filter((i) => words.some((w) => i.name.toLowerCase().includes(w)));
  const under = t.match(/\b(?:under|below|less than)\s*\$?\s*(\d+(?:\.\d+)?)\s*(k)?/);
  const over = t.match(/\b(?:over|above|more than)\s*\$?\s*(\d+(?:\.\d+)?)\s*(k)?/);
  if (under) list = list.filter((i) => i.price <= Number(under[1]) * (under[2] ? 1000 : 1));
  if (over) list = list.filter((i) => i.price >= Number(over[1]) * (over[2] ? 1000 : 1));
  const cheap = /\b(cheapest|least expensive|lowest|affordable|budget|cheap)\b/.test(t) || !!under;
  const dear = /\b(most expensive|priciest|highest|premium|luxury)\b/.test(t);
  const small = /\b(small|compact|tiny|little|smallest)\b/.test(t);
  const large = /\b(large|big|biggest|largest|huge)\b/.test(t);
  if (!catHit && !brand && !named.length && !cheap && !dear && !small && !large && !over) return [];
  if (named.length && !cheap && !dear && !small && !large) list = named;
  const sorted = [...list];
  if (small || large) sorted.sort((a, b) => (areaOf(a.dimensions) - areaOf(b.dimensions)) * (large ? -1 : 1));
  else sorted.sort((a, b) => (a.price - b.price) * (dear ? -1 : 1));
  return sorted.slice(0, limit);
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

let digest: string | null = null;
/** Compact text digest for the Genius support function. */
export function buildKnowledgeDigest(): string {
  if (digest) return digest;
  const items = getKnowledgeItems();
  const lines = items.map(
    (i) => `${i.name} — ${i.category}${i.brand ? ` (${i.brand})` : ''} — ${money(i.price)}${i.dimensions ? ` — ${i.dimensions}` : ''}${i.depth ? ` — depth ${i.depth}` : ''}`,
  );
  const warranties = Object.entries(DISCIPLINES).map(
    ([k, d]) => `${k}: ${d.warranties.map((w) => `${w.label} ${w.term}`).join('; ')}`,
  );
  digest = ['PRODUCTS:', ...lines, '', 'RATES:', ...TRADE_RATES, '', 'WARRANTIES:', ...warranties].join('\n');
  return digest;
}

const CAT_WORDS: Array<[RegExp, string]> = [
  [/\bpavers?\b|\bporcelain\b|\btravertine\b|\bdeck(ing)?\b|\bgloca\b|\bappian\b|\bcoralina\b|\bcatalina\b/, 'Paver'],
  [/\bspa|hot ?tub/, 'Spa'],
  [/\bsauna/, 'Sauna'],
  [/tanning|ledge/, 'Tanning Ledge'],
  [/\bcover/, 'Cover'],
  [/\bgate/, 'Driveway Gate'],
  [/\bpool/, 'Pool'],
];

/** Local answer for "cheapest pool", "most expensive spa", "pools under $90k". */
export function answerPriceQuestion(text: string): string | null {
  const t = text.toLowerCase();
  const cheap = /\b(cheapest|least expensive|lowest price|most affordable|budget|lowest)\b/.test(t);
  const dear = /\b(most expensive|priciest|highest price|top of the line|biggest budget)\b/.test(t);
  const under = t.match(/\b(?:under|below|less than)\s*\$?\s*(\d+(?:\.\d+)?)\s*(k)?/);
  if (!cheap && !dear && !under) return null;
  const category = CAT_WORDS.find(([re]) => re.test(t))?.[1] ?? 'Pool';
  const concrete = /concrete/.test(t) && category === 'Pool';
  const fiberglass = /fiberglass/.test(t);
  let list = getKnowledgeItems().filter((i) => i.category === category);
  if (concrete) list = list.filter((i) => i.brand === 'Wonderlands');
  if (fiberglass) list = list.filter((i) => i.brand !== 'Wonderlands');
  if (!list.length) return null;
  const sorted = [...list].sort((a, b) => a.price - b.price);
  const perSqft = category === 'Paver';
  const label = `${concrete ? 'concrete ' : fiberglass ? 'fiberglass ' : ''}${category.toLowerCase()}`;
  const desc = (i: KnowledgeItem) => `${i.name}${i.brand ? ` by ${i.brand}` : ''} at ${money(i.price)}${perSqft ? '/sqft' : ''}${i.dimensions ? `, ${i.dimensions}` : ''}`;
  if (under) {
    const cap = Number(under[1]) * (under[2] ? 1000 : 1);
    const hits = sorted.filter((i) => i.price <= cap).slice(0, 4);
    if (!hits.length) return `Nothing in our ${label} range sits under ${money(cap)} — the most accessible is the ${desc(sorted[0])}.`;
    return `Under ${money(cap)}: ${hits.map(desc).join('; ')}. Delivery and installation included.`;
  }
  const pick = cheap ? sorted.slice(0, 3) : sorted.slice(-3).reverse();
  return `The ${cheap ? 'most accessible' : 'most premium'} ${label} is the ${desc(pick[0])}, delivery and installation included.${pick.length > 1 ? ` Close behind: ${pick.slice(1).map(desc).join('; ')}.` : ''}`;
}

/* ---------------- Intent inference (search bar + Genius) — © Imagine Engine Studios Corp. ------------- */

/** Map common non-English shopping words to English so one parser serves every tongue. */
const WORD_MAP: Array<[RegExp, string]> = [
  [/\b(piscinas?|piscine|schwimmbad)\b/gi, 'pool'],
  [/\b(jacuzzi|whirlpool|banheira)\b/gi, 'spa'],
  [/\b(m[aá]s barat[oa]|barat[oa]|économique|moins cher|g[üu]nstigste?|economic[oa]|pi[uù] economic[oa])\b/gi, 'cheapest'],
  [/\b(m[aá]s car[oa]|plus cher|teuerste?|pi[uù] costos[oa])\b/gi, 'most expensive'],
  [/\b(peque[ñn][oa]|pequena|petite?|klein(e|er|es)?|piccol[ao])\b/gi, 'small'],
  [/\b(grande|gro(ß|ss)(e|er|es)?)\b/gi, 'large'],
  [/\b(menos de|moins de|unter|sotto|abaixo de)\b/gi, 'under'],
];
export function toEnglishIntent(text: string): string {
  return WORD_MAP.reduce((s, [re, en]) => s.replace(re, en), text);
}

const areaOf = (dims?: string) => {
  const nums = (dims ?? '').match(/\d+(?:\.\d+)?(?:'\s*\d+(?!\s*'))?/g)?.slice(0, 2).map((d) => {
    const [ft, inch] = d.split(/'\s*/);
    return Number(ft) + (Number(inch) || 0) / 12;
  });
  return nums && nums.length === 2 ? nums[0] * nums[1] : 0;
};

/**
 * One local answer for conversational searches: price questions, "small pool",
 * "large spa", "what do you have?". Returns null when Genius should be asked instead.
 */
export function answerIntent(raw: string): string | null {
  const text = toEnglishIntent(raw);
  const price = answerPriceQuestion(text);
  if (price) return price;
  const t = text.toLowerCase();
  if (/\b(what (do )?you (have|sell|offer)|what('s| is) available|show me everything|catalog|options)\b/.test(t)) {
    const items = getKnowledgeItems();
    const count = (c: string) => items.filter((i) => i.category === c).length;
    const from = (c: string) => {
      const p = items.filter((i) => i.category === c).map((i) => i.price).filter((n) => n > 0);
      return p.length ? ` from ${money(Math.min(...p))}` : '';
    };
    return `We offer ${count('Pool')} pools${from('Pool')} (Wonderlands concrete, Latham and GlimmerGlass fiberglass), ${count('Spa')} spas${from('Spa')}, ${count('Sauna')} saunas${from('Sauna')}, plus solar, pavers, screen enclosures, fencing, turf and landscaping — and design tools like the 3D Studio, the Global Design Board and Solar Genius.`;
  }
  const small = /\b(small|compact|tiny|little|smallest)\b/.test(t);
  const large = /\b(large|big|biggest|largest|huge)\b/.test(t);
  if (small || large) {
    const category = CAT_WORDS.find(([re]) => re.test(t))?.[1] ?? 'Pool';
    const list = getKnowledgeItems().filter((i) => i.category === category && areaOf(i.dimensions) > 0);
    if (!list.length) return null;
    const sorted = [...list].sort((a, b) => areaOf(a.dimensions) - areaOf(b.dimensions));
    const pick = (small ? sorted : sorted.reverse()).slice(0, 3);
    const desc = (i: KnowledgeItem) => `${i.name}${i.brand ? ` by ${i.brand}` : ''} (${i.dimensions}, ${money(i.price)})`;
    return `Our ${small ? 'most compact' : 'largest'} ${category.toLowerCase()}s: ${pick.map(desc).join('; ')}. Delivery and installation included.`;
  }
  return null;
}
