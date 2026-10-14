/**
 * Genius knowledge — one digest of everything Genius may quote: every catalog
 * product (pools, spas, saunas, ledges, covers, gates) with real prices and
 * sizes, trade rates, and the warranties from quoteDisciplines.
 *
 * Built once per session (memoised) from the live data files — no invented
 * figures. Used by the local flip brain (superlatives: cheapest, most
 * expensive, under $X) and sent to the Groq `genius` function as CATALOG.
 */
import { getAllProducts, type PoolProductInfo } from '@/data/poolProductLookup';
import { gilmerSpas } from '@/data/gilmerSpas';
import { saunas } from '@/data/saunaData';
import { DISCIPLINES } from '@/lib/quoteDisciplines';

export interface KnowledgeItem { name: string; category: string; brand?: string; price: number; dimensions?: string; depth?: string; note?: string }

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
  getAllProducts().forEach((p: PoolProductInfo) =>
    push({ name: p.name, category: p.category, brand: p.brand, price: p.price, dimensions: p.dimensions, depth: p.depth }),
  );
  gilmerSpas.forEach((s) =>
    push({ name: s.model, category: 'Spa', brand: s.brand, price: s.price, dimensions: s.dimensions, depth: s.depth, note: s.warranty }),
  );
  saunas.forEach((s: any) => push({ name: s.model ?? s.name, category: 'Sauna', brand: 'Almost Heaven', price: s.price }));
  cache = out;
  return out;
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
  const concrete = /concrete/.test(t);
  const fiberglass = /fiberglass/.test(t);
  let list = getKnowledgeItems().filter((i) => i.category === category);
  if (concrete) list = list.filter((i) => i.brand === 'Wonderlands');
  if (fiberglass) list = list.filter((i) => i.brand !== 'Wonderlands');
  if (!list.length) return null;
  const sorted = [...list].sort((a, b) => a.price - b.price);
  const label = `${concrete ? 'concrete ' : fiberglass ? 'fiberglass ' : ''}${category.toLowerCase()}`;
  const desc = (i: KnowledgeItem) => `${i.name}${i.brand ? ` by ${i.brand}` : ''} at ${money(i.price)}${i.dimensions ? `, ${i.dimensions}` : ''}`;
  if (under) {
    const cap = Number(under[1]) * (under[2] ? 1000 : 1);
    const hits = sorted.filter((i) => i.price <= cap).slice(0, 4);
    if (!hits.length) return `Nothing in our ${label} range sits under ${money(cap)} — the most accessible is the ${desc(sorted[0])}.`;
    return `Under ${money(cap)}: ${hits.map(desc).join('; ')}. Delivery and installation included.`;
  }
  const pick = cheap ? sorted.slice(0, 3) : sorted.slice(-3).reverse();
  return `The ${cheap ? 'most accessible' : 'most premium'} ${label} is the ${desc(pick[0])}, delivery and installation included.${pick.length > 1 ? ` Close behind: ${pick.slice(1).map(desc).join('; ')}.` : ''}`;
}
