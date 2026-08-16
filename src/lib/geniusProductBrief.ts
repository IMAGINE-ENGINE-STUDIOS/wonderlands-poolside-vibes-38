/**
 * Genius product brief — a full, spoken explanation of any catalog product,
 * composed locally from the product lookup, the turn-key scope and the managed
 * project pipeline. No paid text generation is involved.
 */

import { findProductInfo, getAllProducts, searchProducts, type PoolProductInfo } from '@/data/poolProductLookup';
import { TURNKEY_SCOPE } from '@/data/turnkeyScope';
import { getProjectPipeline } from '@/data/projectPipeline';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

export const money = (n?: number | null) =>
  typeof n === 'number' && n > 0 ? `$${Math.round(n).toLocaleString()}` : null;

/** Find the product a phrase points at, tolerant of extra words. */
export function matchCatalogProduct(text: string): PoolProductInfo | null {
  const t = norm(text);
  if (!t) return null;
  const direct = getAllProducts().find((p) => t.includes(norm(p.name)));
  if (direct) return direct;

  /* every significant word of the name appears somewhere in the phrase */
  const partial = getAllProducts().find((p) => {
    const words = norm(p.name).split(' ').filter((word) => word.length > 3);
    return words.length > 0 && words.every((word) => t.includes(word));
  });
  if (partial) return partial;

  /* a trailing model phrase such as "tell me about the maxima" */
  const tail = t.replace(/^(tell me about|explain|describe|what is|whats|how much is|price of|details on)\s+(the\s+)?/, '');
  if (tail && tail !== t) {
    const found = findProductInfo(tail);
    if (found) return found;
  }
  return null;
}

const categoryKey = (category?: string) => {
  const c = (category ?? '').toLowerCase();
  if (c.includes('spa')) return 'spas';
  if (c.includes('ledge')) return 'tanning-ledges';
  return 'pools';
};

/**
 * The full brief: what it is, how big, how deep, what it costs turn-key, what is
 * always included, and how the build runs.
 */
export function explainProduct(product: PoolProductInfo, depth: 'short' | 'full' = 'full'): string {
  const price = money(product.price);
  const head = [
    `${product.name}${product.brand ? ` by ${product.brand}` : ''} — ${product.category.toLowerCase()}.`,
    product.dimensions && product.dimensions !== 'Custom' ? `It measures ${product.dimensions}.` : null,
    product.depth && product.depth !== 'N/A' ? `Depth runs ${product.depth}.` : null,
    price ? `Turn-key from ${price}, delivery and installation included.` : null,
  ].filter(Boolean);

  if (depth === 'short') return head.join(' ');

  const scope = TURNKEY_SCOPE.slice(0, 6).map((s) => s.label.toLowerCase()).join(', ');
  const pipeline = getProjectPipeline(categoryKey(product.category));
  const tail = [
    `Standard on every build: ${scope} — and project management straight through to handover.`,
    pipeline ? `${pipeline.steps.length} managed steps, from selections to handover.` : null,
    'Waterline tile, finish, coping, deck, heating and enclosures are your selections, priced as configured.',
  ].filter(Boolean);

  return [...head, ...tail].join(' ');
}

/** A short comparison line for several matches, used when a phrase is broad. */
export function summarizeMatches(query: string, limit = 4): string | null {
  const results = searchProducts(query).slice(0, limit);
  if (!results.length) return null;
  const list = results
    .map((p) => `${p.name}${money(p.price) ? ` from ${money(p.price)}` : ''}`)
    .join('; ');
  return `${results.length === 1 ? 'One match' : `${results.length} matches`}: ${list}. Say a name and I will walk you through it.`;
}
