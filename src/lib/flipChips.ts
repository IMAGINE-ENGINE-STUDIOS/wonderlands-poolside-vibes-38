/**
 * The chips Genius offers beside every answer.
 *
 * Its own module so both the local pitch generator and the flip brain can build
 * the same shelf of destinations without importing each other.
 */

import type { NarratorAction } from '@/lib/narratorStore';
import { getFlipManifest, type FlipPageRef } from '@/lib/flipPageRegistry';
import { readFlipViewport } from '@/lib/flipViewportReader';

/** Chip copy: the destination, without repeating the edition already open. */
function chipLabel(page: FlipPageRef): string {
  const title = (page.title || page.label).replace(/\s*[—–-]\s*/g, ' — ');
  const tail = title.split(' — ').pop()?.trim();
  return tail && tail.length > 2 ? tail : title;
}

/** A chip never says a page number out loud — it says where it goes. */
export function pageChip(page: FlipPageRef): NarratorAction {
  return { label: chipLabel(page), type: 'flip_goto', payload: String(page.number) };
}

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
    /* Two leaves can print the same heading — a guest only needs one chip. */
    const key = `${chip.type}:${chip.label.toLowerCase()}`;
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
