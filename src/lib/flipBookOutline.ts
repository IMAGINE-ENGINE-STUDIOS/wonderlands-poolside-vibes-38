/**
 * The FLIP book outline — every page of the latest edition, numbered like a
 * real book, from the index to the last leaf.
 *
 * The outline is composed from the same sources FLIP renders from (the console
 * editions and the studio option groups), so the numbering matches the book the
 * reader turns. It is built locally, cached, and costs nothing.
 */

import { ITEMS } from '@/components/FlipIndex';
import { loadCategoryEntries, getCachedCategoryEntries, type ConsoleEntry } from '@/components/flip/flipConsoleData';
import { mergeStudioGroups } from '@/lib/flipStudioFeatures';

export interface OutlinePage {
  /** Continuous page number across the whole book, 1-based. */
  number: number;
  /** Page number inside its own edition, 1-based — what FLIP turns to. */
  editionPage: number;
  label: string;
  title: string;
  /** Deep link back into FLIP. */
  href: string;
}

export interface OutlineChapter {
  id: string;
  title: string;
  subtitle?: string;
  kind: 'front' | 'edition' | 'book';
  categoryId?: string;
  productId?: string;
  pages: OutlinePage[];
}

export interface FlipBookOutline {
  chapters: OutlineChapter[];
  totalPages: number;
}

const MAX_MODELS = 24;
const OPTIONS_PER_PAGE = 8;

let cached: FlipBookOutline | null = null;

/** Pages a product book always prints, in order. */
const PRODUCT_BOOK_PAGES: { label: string; title: string }[] = [
  { label: 'Plate', title: 'Opening plate' },
  { label: 'Statement', title: 'The statement' },
  { label: 'Story', title: 'The story' },
  { label: 'Dimensions', title: 'Dimensions & depth' },
  { label: 'Options', title: 'Features & additions' },
  { label: 'Portfolio', title: 'Built work' },
  { label: 'Brand', title: 'The maker' },
  { label: 'Letter', title: 'A word from the house' },
  { label: 'Drawing Board', title: 'Design board — left leaf' },
  { label: 'Drawing Board', title: 'Design board — right leaf' },
  { label: 'Price Sheet', title: 'Live cost of the design' },
  { label: 'Options', title: 'Configure & add to selection' },
];

function frontMatter(counter: { n: number }): OutlineChapter {
  const pages: OutlinePage[] = [];
  const push = (label: string, title: string, editionPage: number, href: string) => {
    counter.n += 1;
    pages.push({ number: counter.n, editionPage, label, title, href });
  };
  push('Edition', 'The Outdoor Annual — cover leaf', 1, '/flip?page=1');
  push('Index', 'The annual index — every discipline', 2, '/flip?page=2');
  ITEMS.forEach((item, i) => {
    push('Discipline', item.label, 3 + i, `/flip?page=${3 + i}`);
  });
  push('Our Promise', 'The service memoir', 3 + ITEMS.length, `/flip?page=${3 + ITEMS.length}`);
  return { id: 'front', title: 'Front matter', subtitle: 'The annual index', kind: 'front', pages };
}

function editionChapter(
  item: (typeof ITEMS)[number],
  entries: ConsoleEntry[],
  counter: { n: number },
): OutlineChapter {
  const pages: OutlinePage[] = [];
  let editionPage = 0;
  const push = (label: string, title: string) => {
    counter.n += 1;
    editionPage += 1;
    pages.push({
      number: counter.n,
      editionPage,
      label,
      title,
      href: `/flip?cat=${encodeURIComponent(item.id)}&page=${editionPage}`,
    });
  };

  const models = entries.slice(0, MAX_MODELS);
  const groups = mergeStudioGroups(item.id, []) as { title: string; items?: unknown[]; options?: unknown[] }[];

  push('Edition', `${item.label} — edition plate`);
  push('Contents', `${item.label} — contents`);
  push('Letter', `${item.label} — letter to the reader`);
  push('Statement', `${item.label} — the intent`);
  push('Collection', `${item.label} — the collection`);
  push('Portfolio', `${item.label} — portfolio I`);
  push('Portfolio', `${item.label} — portfolio II`);
  models.forEach((m) => {
    push('Plate', `${m.name} — plate`);
    push('Specification', `${m.name} — specification`);
  });
  const priceSheets = Math.max(1, Math.ceil(models.length / 6));
  for (let i = 0; i < priceSheets; i += 1) {
    push('Price Sheet', `${item.label} — price sheet ${i + 1}`);
  }
  groups.forEach((g) => {
    const count = (g.items ?? g.options ?? []).length || 1;
    const chunks = Math.max(1, Math.ceil(count / OPTIONS_PER_PAGE));
    for (let i = 0; i < chunks; i += 1) {
      push('Options', `${g.title}${chunks > 1 ? ` (${i + 1}/${chunks})` : ''}`);
    }
  });
  push('Estimate', `${item.label} — your estimate`);
  push('Edition', `${item.label} — closing leaf`);

  return {
    id: `edition-${item.id}`,
    title: item.label,
    subtitle: `${models.length} models · ${groups.length} option chapters`,
    kind: 'edition',
    categoryId: item.id,
    pages,
  };
}

function productChapter(
  item: (typeof ITEMS)[number],
  entry: ConsoleEntry,
  counter: { n: number },
): OutlineChapter {
  const pages: OutlinePage[] = PRODUCT_BOOK_PAGES.map((p, i) => {
    counter.n += 1;
    return {
      number: counter.n,
      editionPage: i + 1,
      label: p.label,
      title: `${entry.name} — ${p.title}`,
      href: `/flip?cat=${encodeURIComponent(item.id)}&product=${encodeURIComponent(String(entry.id))}&page=${i + 1}`,
    };
  });
  return {
    id: `book-${item.id}-${entry.id}`,
    title: entry.name,
    subtitle: `${item.label} product book`,
    kind: 'book',
    categoryId: item.id,
    productId: String(entry.id),
    pages,
  };
}

/** Build (and cache) the numbered outline of the whole book. */
export async function buildFlipBookOutline(): Promise<FlipBookOutline> {
  if (cached) return cached;
  const counter = { n: 0 };
  const chapters: OutlineChapter[] = [frontMatter(counter)];

  for (const item of ITEMS) {
    let entries = getCachedCategoryEntries(item.id);
    if (!entries) {
      entries = await loadCategoryEntries(item.id).catch(() => [] as ConsoleEntry[]);
    }
    const list = (entries ?? []).slice(0, MAX_MODELS);
    chapters.push(editionChapter(item, list, counter));
    list.forEach((entry) => chapters.push(productChapter(item, entry, counter)));
  }

  cached = { chapters, totalPages: counter.n };
  return cached;
}

export function getCachedFlipBookOutline() {
  return cached;
}
