/**
 * Genius' flip brain — local intent resolution, zero text-generation cost.
 *
 * Genius treats FLIP as the main content: page turns, editions, product books,
 * prices and selections are all resolved here, in the browser, from the live
 * page registry and the product lookup. Only when a guest clearly asks for
 * something outside the book (a tool, a calculator, a staff-free destination)
 * does she leave the flip.
 *
 * Nothing in this file calls a paid API. The voice is the only billed step.
 */

import type { NarratorAction } from '@/lib/narratorStore';
import {
  findFlipPage,
  getFlipControls,
  getFlipManifest,
  isFlipActive,
  type FlipPageRef,
} from '@/lib/flipPageRegistry';
import { geniusAck, geniusFallback } from '@/lib/flipPitchGenerator';
import { GENIUS_DESTINATIONS, isGeniusAllowedPath } from '@/lib/geniusAccess';
import { readFlipViewport } from '@/lib/flipViewportReader';
import { getAllProducts } from '@/data/poolProductLookup';
import { ITEMS } from '@/components/FlipIndex';

export interface GeniusResolution {
  handled: boolean;
  reply: string;
  actions: NarratorAction[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const money = (n?: number | null) => (typeof n === 'number' && n > 0 ? `$${Math.round(n).toLocaleString()}` : null);

/** A chip never says a page number out loud — it says where it goes. */
function pageChip(page: FlipPageRef): NarratorAction {
  return { label: page.label, type: 'flip_goto', payload: String(page.number) };
}

/** Which discipline does this phrase point at? */
function matchCategory(text: string) {
  const t = norm(text);
  return (
    ITEMS.find((i) => t.includes(norm(i.label))) ??
    ITEMS.find((i) => t.includes(norm(i.id))) ??
    ITEMS.find((i) => norm(i.label).split(' ').some((w) => w.length > 4 && t.includes(w))) ??
    null
  );
}

/** Which catalog product does this phrase point at? */
function matchProduct(text: string) {
  const t = norm(text);
  const products = getAllProducts();
  return (
    products.find((p) => t.includes(norm(p.name))) ??
    products.find((p) => {
      const words = norm(p.name).split(' ').filter((w) => w.length > 3);
      return words.length > 0 && words.every((w) => t.includes(w));
    }) ??
    null
  );
}

function matchRoute(text: string) {
  const t = norm(text);
  for (const dest of GENIUS_DESTINATIONS) {
    if (!isGeniusAllowedPath(dest.path)) continue;
    if (t.includes(norm(dest.label))) return { label: dest.label, path: dest.path };
  }
  return null;
}

/**
 * Resolve a guest request locally. Returns handled:false only when nothing in
 * the book or the catalog matches — the caller then offers guidance.
 */
export function resolveGeniusRequest(text: string): GeniusResolution {
  const raw = text.trim();
  const t = norm(raw);
  const manifest = getFlipManifest();
  const controls = getFlipControls();
  const seed = `${t}:${manifest?.current ?? 0}`;
  const ack = geniusAck(seed);

  /* ---------------------------- page manipulation --------------------------- */

  if (isFlipActive() && manifest && controls) {
    if (/\b(next page|turn the page|forward|keep going|continue)\b/.test(t)) {
      controls.next();
      return { handled: true, reply: `${ack} Turning forward.`, actions: bookChips() };
    }
    if (/\b(previous page|go back a page|back a page|last page i was|previous)\b/.test(t)) {
      controls.prev();
      return { handled: true, reply: `${ack} Back one leaf.`, actions: bookChips() };
    }
    if (/\b(first page|beginning|start of the book|cover)\b/.test(t)) {
      controls.goTo(0);
      return { handled: true, reply: `${ack} We are at the front of the book.`, actions: bookChips() };
    }
    if (/\b(last page|end of the book|back cover)\b/.test(t)) {
      controls.goTo(manifest.pages.length - 1);
      return { handled: true, reply: `${ack} The closing leaf.`, actions: bookChips() };
    }
    const pageAsk = raw.match(/page\s*(?:number\s*)?(\d{1,3})/i);
    if (pageAsk) {
      const page = findFlipPage(pageAsk[1]);
      if (page) {
        controls.goTo(page.index);
        return { handled: true, reply: `${ack} Page ${page.number} — ${page.title}.`, actions: bookChips() };
      }
      return {
        handled: true,
        reply: `This edition runs to page ${manifest.pages.length}, so there is no page ${pageAsk[1]} here.`,
        actions: bookChips(),
      };
    }
    if (/\b(how many pages|contents|what pages|list the pages|index of pages|table of contents)\b/.test(t)) {
      const preview = manifest.pages.slice(0, 6).map((p) => `${p.number}. ${p.title}`).join('; ');
      return {
        handled: true,
        reply: `This edition holds ${manifest.pages.length} pages. ${preview}… I can open the full numbered file if you want the whole book at once.`,
        actions: [
          { label: 'Open the page file', type: 'navigate', payload: '/flip-pages' },
          ...bookChips().slice(0, 3),
        ],
      };
    }
    if (/\b(where am i|which page)\b/.test(t)) {
      const here = manifest.pages[manifest.current];
      return {
        handled: true,
        reply: here
          ? `You are on page ${here.number} of ${manifest.pages.length} — ${here.title}.`
          : `You are inside the ${manifest.categoryLabel} edition.`,
        actions: bookChips(),
      };
    }
    /* named page inside the open book: "prices", "options", "specification"… */
    const namedPage =
      /\b(price|prices|price sheet|cost)\b/.test(t)
        ? manifest.pages.find((p) => p.label === 'Price Sheet')
        : /\b(option|options|finish|finishes)\b/.test(t)
          ? manifest.pages.find((p) => p.label === 'Options')
          : /\b(spec|specification|dimensions|depth)\b/.test(t)
            ? manifest.pages.find((p) => p.label === 'Specification')
            : /\b(draw|drawing|board|sketch|layout)\b/.test(t)
              ? manifest.pages.find((p) => p.label === 'Drawing Board')
              : /\b(estimate|quote total|my total)\b/.test(t)
                ? manifest.pages.find((p) => p.label === 'Estimate')
                : /\b(gallery|portfolio|photos|images)\b/.test(t)
                  ? manifest.pages.find((p) => p.label === 'Portfolio')
                  : undefined;
    if (namedPage) {
      controls.goTo(namedPage.index);
      return { handled: true, reply: `${ack} Page ${namedPage.number} — ${namedPage.title}.`, actions: bookChips() };
    }
    if (/\b(index|home|main menu|start over|back to the book)\b/.test(t)) {
      controls.openHome();
      return { handled: true, reply: `${ack} Back to the annual index.`, actions: bookChips() };
    }
  }

  /* ------------------------- products and disciplines ----------------------- */

  const product = matchProduct(raw);
  if (product) {
    const price = money(product.price);
    const category = ITEMS.find((i) => norm(i.label) === norm(product.category ?? '')) ?? matchCategory(product.category ?? '');
    if (controls && category) controls.openProduct(category.id, String((product as any).id ?? product.name));
    const bits = [
      `${product.name}${product.category ? ` — ${product.category}` : ''}.`,
      price ? `Turnkey from ${price}, delivery and installation included.` : null,
      (product as any).dimensions ? `Dimensions ${(product as any).dimensions}.` : null,
      (product as any).depth ? `Depth ${(product as any).depth}.` : null,
      controls && category ? 'I am opening its book now.' : 'Open its edition and I will read it to you.',
    ].filter(Boolean);
    return {
      handled: true,
      reply: bits.join(' '),
      actions: [
        { label: `Add ${product.name}`, type: 'add_to_cart' },
        ...bookChips(5),
      ],
    };
  }

  const category = matchCategory(raw);
  if (category && controls) {
    controls.openCategory(category.id);
    return {
      handled: true,
      reply: `${ack} Opening the ${category.label} edition — models, finishes and prices in order.`,
      actions: bookChips(),
    };
  }

  /* ----------------------- explicit trip outside the flip ------------------- */

  const wantsOutside = /\b(open|take me to|go to|show me|launch)\b/.test(t);
  const route = matchRoute(raw);
  if (route && wantsOutside) {
    return {
      handled: true,
      reply: `${ack} ${route.label} it is — that one lives outside the book.`,
      actions: [{ label: route.label, type: 'navigate', payload: route.path }, ...bookChips(3)],
    };
  }

  if (/\b(cart|selection|basket|checkout)\b/.test(t)) {
    return {
      handled: true,
      reply: 'Your selection travels with you through the book. I can add whatever page you are on, or take you to checkout.',
      actions: [
        { label: 'Add this page', type: 'add_to_cart' },
        { label: 'Checkout', type: 'navigate', payload: '/checkout' },
        ...bookChips(3),
      ],
    };
  }

  return { handled: false, reply: geniusFallback(seed), actions: bookChips() };
}

/** Standing chips for moving through the open book. */
/**
 * Everywhere the guest can go from the open book, in the order they ask for it.
 *
 * Genius offers the whole shelf of the open edition — every additional-feature
 * spread, the finishes, the price sheet, the photography, the specification and
 * the drawing board — not just the next leaf. `limit` keeps the chip row short
 * when a reply already carries its own leading action.
 */
export function bookChips(limit = 6): NarratorAction[] {
  const manifest = getFlipManifest();
  if (!manifest) {
    return [
      { label: 'Open the FLIP', type: 'navigate', payload: '/flip' },
      { label: 'All pages', type: 'navigate', payload: '/flip-pages' },
      { label: 'Book a designer', type: 'navigate', payload: '/schedule' },
    ].slice(0, limit) as NarratorAction[];
  }

  const here = manifest.pages[manifest.current];
  const chips: NarratorAction[] = [];
  const seen = new Set<string>();
  const add = (chip: NarratorAction) => {
    const key = `${chip.type}:${chip.payload ?? chip.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    chips.push(chip);
  };

  /* Options printed on the open spread lead — they answer the real question. */
  const view = readFlipViewport();
  view?.options.slice(0, 2).forEach((o) =>
    add({
      label: o.price ? `${o.label} · ${o.price}` : o.label,
      type: 'flip_option',
      payload: o.label,
    }),
  );

  const elsewhere = (label: string) =>
    manifest.pages.filter((p) => p.label === label && p.number !== here?.number);

  /* The whole additional-features run, named as it is printed. */
  const optionPages = elsewhere('Options');
  if (optionPages.length) {
    add({
      label: optionPages.length > 1 ? 'See all additional features' : `See ${optionPages[0].title.toLowerCase()}`,
      type: 'flip_goto',
      payload: String(optionPages[0].number),
    });
    optionPages.slice(1, 3).forEach((p) => add(pageChip(p)));
  }

  /* Then the pages a buyer asks for next, in the order they ask for them. */
  (['Price Sheet', 'Specification', 'Portfolio', 'Estimate', 'Drawing Board', 'Collection'] as const).forEach(
    (label) => {
      const page = elsewhere(label)[0];
      if (page) add(pageChip(page));
    },
  );

  add({ label: 'Next page', type: 'flip_next' });
  add({ label: 'Index', type: 'flip_home' });
  add({ label: 'Book a designer', type: 'navigate', payload: '/schedule' });

  return chips.slice(0, limit);
}

export default resolveGeniusRequest;
