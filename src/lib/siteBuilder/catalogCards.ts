/**
 * catalogCards — fills Website Builder product cards with real Wonderlands
 * catalogue items (photo, name, price, description) — the same catalogue the
 * suites and FLIP use. Genius often adds a "products" section with empty or
 * made-up cards; hydrateProductOps() swaps those for real products so every
 * card arrives complete (image frame, text, buttons) and stays fully editable.
 * Imagine Engine Studios Corp.
 */
export interface CatalogItem { id: string; name: string; price?: number | string; description: string; image_url: string; category: string; categoryId: string }

let cache: Promise<CatalogItem[]> | null = null;
/** Loads the catalogue once per session (lazy — only when a product block needs it). */
export function loadWonderlandsCatalog(): Promise<CatalogItem[]> {
  if (!cache) cache = (async () => {
    const [{ ITEMS }, { loadCategoryEntries }] = await Promise.all([import('@/components/FlipIndex'), import('@/components/flip/flipConsoleData')]);
    const lists = await Promise.all(ITEMS.map(async (it: any) => (await loadCategoryEntries(it.id).catch(() => [])).map((e: any) => ({
      id: `${it.id}:${e.id}`, name: e.name, price: e.price, description: e.meta ?? e.brand ?? '', image_url: e.image, category: it.label, categoryId: it.id,
    }))));
    return lists.flat().filter((p) => p.image_url);
  })().catch(() => { cache = null; return []; });
  return cache;
}

const absImg = (u?: string | null) => !u ? '' : /^(https?:|data:|blob:)/.test(u) ? u : `${window.location.origin}${u.startsWith('/') ? '' : '/'}${u}`;
const fmt = (p: any) => typeof p === 'number' ? `$${p.toLocaleString()}` : String(p ?? '');

/** One finished product card (real photo + details) from a catalogue entry. */
export const cardFromCatalog = (p: CatalogItem) => ({
  name: p.name, price: p.price ? fmt(p.price) : '', description: p.description || `${p.category} by Wonderlands.`,
  image: absImg(p.image_url), badge: '', buttonLabel: 'Ask for a quote', buttonHref: '#contact', buyLabel: 'Buy now', buyLink: '',
});

/** A complete starter card for the user to fill in (never an empty shell). */
export const starterCard = (n = 1) => ({
  name: `Product ${n}`, price: '', description: 'Describe this product in one or two sentences — double-click to edit.',
  image: '', badge: '', buttonLabel: 'Ask for a quote', buttonHref: '#contact', buyLabel: 'Buy now', buyLink: '',
});

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Picks the catalogue category the request/section is about (defaults to fiberglass pools). */
function pickCategory(list: CatalogItem[], hint: string) {
  const h = norm(hint);
  const cats = [...new Set(list.map((p) => p.categoryId))];
  const byWord = cats.find((c) => { const label = norm(list.find((p) => p.categoryId === c)!.category); return label.split(' ').some((w) => w.length > 3 && h.includes(w.replace(/s$/, ''))); });
  return byWord || (cats.includes('pools') ? 'pools' : cats[0]);
}

/** Replaces empty / imageless product cards with real catalogue products. */
export function hydrateItems(items: any[] | undefined, list: CatalogItem[], hint: string, count = 6) {
  const cur = Array.isArray(items) ? items : [];
  if (!list.length) return cur.length ? cur.map((c, i) => ({ ...starterCard(i + 1), ...c })) : [1, 2, 3].map(starterCard);
  const cat = list.filter((p) => p.categoryId === pickCategory(list, hint));
  if (!cur.length) return cat.slice(0, count).map(cardFromCatalog);
  let k = 0;
  return cur.map((c) => {
    if (c?.image) return { ...starterCard(), ...c };
    const hit = list.find((p) => c?.name && norm(p.name) === norm(String(c.name))) || list.find((p) => c?.name && norm(String(c.name)).includes(norm(p.name)));
    const real = hit || cat[k++ % Math.max(1, cat.length)];
    return real ? { ...cardFromCatalog(real), ...(hit ? { buttonLabel: c.buttonLabel || 'Ask for a quote', buttonHref: c.buttonHref || '#contact' } : {}) } : { ...starterCard(), ...c };
  });
}

/** Walks Genius ops / built sections and hydrates every products block. */
export async function hydrateProductOps<T>(value: T, hint: string): Promise<T> {
  const needs = JSON.stringify(value).includes('"products"') || JSON.stringify(value).includes('"items"');
  if (!needs) return value;
  const list = await loadWonderlandsCatalog();
  const walk = (x: any): any => {
    if (Array.isArray(x)) return x.map(walk);
    if (!x || typeof x !== 'object') return x;
    const o = Object.fromEntries(Object.entries(x).map(([k, v]) => [k, walk(v)]));
    if (o.type === 'products') o.props = { ...(o.props || {}), items: hydrateItems(o.props?.items, list, `${hint} ${o.props?.title ?? ''}`) };
    return o;
  };
  return walk(value);
}

/** Fills products sections already in the doc that have empty/imageless cards (for 'update' ops). */
export async function hydrateDocProducts<D extends { pages: { sections: { type: string; props: any }[] }[] }>(d: D, hint: string): Promise<D> {
  const bad = d.pages.some((p) => p.sections.some((s) => s.type === 'products' && (!s.props.items?.length || s.props.items.some((c: any) => !c?.image))));
  if (!bad) return d;
  const list = await loadWonderlandsCatalog();
  const n = structuredClone(d);
  n.pages.forEach((p) => p.sections.forEach((s) => { if (s.type === 'products') s.props.items = hydrateItems(s.props.items, list, `${hint} ${s.props.title ?? ''}`); }));
  return n;
}
