/**
 * configuratorPresets — fills the Website Builder "Configurable product" block
 * (the same option technology as the home-page product cards: finishes, liners,
 * pavers, heaters, covers, add-ons, live total) with real Wonderlands data.
 * Base product comes from the shared catalogue (catalogCards); options come
 * from the same data files the home-page cards read. Nothing is invented —
 * options without a known price keep an empty price for the company to fill.
 * Imagine Engine Studios Corp.
 */
import { loadWonderlandsCatalog, type CatalogItem } from './catalogCards';

export interface ConfigOption { group: string; name: string; detail: string; price: string; unit: string; image: string; pick: 'one' | 'many' }

const abs = (u?: string) => !u ? '' : /^(https?:|data:|blob:)/.test(u) ? u : `${window.location.origin}${u.startsWith('/') ? '' : '/'}${u}`;
const opt = (group: string, name: string, price: number | string = '', detail = '', image = '', unit = '', pick: 'one' | 'many' = 'one'): ConfigOption =>
  ({ group, name, detail, price: price === '' ? '' : String(price), unit, image: abs(image), pick });

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');

/** Same heater + cover prices as the home-page pool card. */
const HEATERS: [string, number][] = [['Pentair MasterTemp 125 (125K BTU)', 3450], ['Pentair MasterTemp 250 (250K BTU)', 5520], ['Pentair MasterTemp 400 (400K BTU)', 7245], ['Pentair UltraTemp 90 Heat Pump', 7762], ['Pentair UltraTemp 110 Heat Pump', 9488], ['Pentair UltraTemp 140 Heat Pump', 11212]];
const HEATER_IMG = '/media/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp';
const COVERS: [string, number, string][] = [['Eclipse Automatic Cover', 27000, '/media/1fd97401-223a-4a79-bf65-e7734138513e.webp'], ['CS3000 Automatic Cover', 30000, '/media/af4bf30f-30a2-42bc-aa71-2b3bdc25b0bc.png'], ['Infinity 4000 Automatic Cover', 32000, '/media/3adb0804-f3a6-4d17-a38e-feb05f6fbdf9.png']];

async function poolOptions(model: string): Promise<ConfigOption[]> {
  const [{ getProductsByCompatiblePool }, { poolLiners }, { paverTypes }] = await Promise.all([
    import('@/data/consolidatedProducts'), import('@/data/poolData'), import('@/data/paverData')]);
  return [
    ...getProductsByCompatiblePool('finish', model).slice(0, 8).map((f: any) => opt('Pool Finishes', f.name, f.price ?? '', f.collection ?? '', f.image)),
    ...poolLiners.slice(0, 6).map((l: any) => opt('Pool Liner', l.name, l.price, l.type, l.image, '/sqft')),
    ...paverTypes.slice(0, 6).map((p: any) => opt('Deck Pavers', p.name, p.basePrice, p.description, p.image, '/sqft')),
    ...COVERS.map(([n, p, i]) => opt('Automatic Cover', n, p, '', i)),
    ...HEATERS.map(([n, p]) => opt('Pool Heater', n, p, '', HEATER_IMG)),
    opt('Additional Features', 'Jets', 1800, '', '', '', 'many'),
  ];
}

/** Picks the base catalogue product from the request (falls back to the first pool). */
function pickBase(list: CatalogItem[], hint: string) {
  const h = norm(hint);
  return list.find((p) => h.includes(norm(p.name).trim()))
    || list.find((p) => norm(p.category).split(' ').some((w) => w.length > 3 && h.includes(w.replace(/s$/, ''))))
    || list.find((p) => p.categoryId === 'pools') || list[0];
}

/** Full props for a configurable product (real product + real options). Keeps any props already set. */
export async function configuratorProps(cur: Record<string, any> = {}, hint = ''): Promise<Record<string, any>> {
  const list = await loadWonderlandsCatalog();
  const base = pickBase(list, `${hint} ${cur.name ?? ''}`);
  const name = cur.name || base?.name || 'Your product';
  const isPool = !base || /pool/i.test(base.category) || /pool/i.test(hint);
  const options = cur.options?.length ? cur.options : isPool ? await poolOptions(name) : [opt('Additional Features', 'Installation', '', 'Describe what is included', '', '', 'many')];
  return {
    title: '', badge: '', note: 'Price includes installation at your home address', size: '', depth: '', installation: '', warranty: '', included: '',
    quoteLabel: 'Instant Quote', quoteHref: '#contact', buyLabel: 'Checkout', buyLink: '',
    ...cur,
    name, price: cur.price || (base?.price != null ? String(base.price).replace(/[^0-9.]/g, '') : ''),
    image: cur.image || abs(base?.image_url), description: cur.description || base?.description || '', options,
  };
}

/** Fills every configurator section that is missing its product or options. */
export async function hydrateConfigurators<D extends { pages: { sections: { type: string; props: any }[] }[] }>(d: D, hint: string): Promise<D> {
  const todo = d.pages.flatMap((p) => p.sections).filter((s) => s.type === 'configurator' && (!s.props.options?.length || !s.props.image));
  if (!todo.length) return d;
  const n = structuredClone(d);
  for (const p of n.pages) for (const s of p.sections)
    if (s.type === 'configurator' && (!s.props.options?.length || !s.props.image)) s.props = await configuratorProps(s.props, `${hint} ${s.props.title ?? ''}`);
  return n;
}
