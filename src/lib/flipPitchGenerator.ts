/**
 * Flip pitch generator — the house copywriter, written in plain TypeScript.
 *
 * Every spoken pitch, page introduction and reply chip is composed locally from
 * seeded template banks: no language model is billed for text. The only paid
 * service left in the narration pipeline is the voice, which reads whatever this
 * file writes.
 *
 * The seed is the page key, so the same leaf always reads the same way (the book
 * is consistent), while different leaves read differently.
 */

import type { NarratorAction, NarratorContext, NarratorScript } from '@/lib/narratorStore';
import type { FlipManifest, FlipPageRef } from '@/lib/flipPageRegistry';

/* ------------------------------- randomness ------------------------------- */

/** Deterministic 32-bit hash — the seed of a page's voice. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRandom(seed: string) {
  let state = hash(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

type Rand = () => number;

const pick = <T,>(rand: Rand, list: readonly T[]): T => list[Math.floor(rand() * list.length) % list.length];

/* -------------------------------- templates ------------------------------- */

const OPENERS = [
  'Take your time with this one.',
  'Here is where the design starts to breathe.',
  'This page is worth a slow read.',
  'Let me set the scene for you.',
  'Look at this leaf for a moment.',
  'Everything on this page was drawn on purpose.',
  'This is one of my favourite pages in the book.',
] as const;

const CADENCE = [
  'Nothing here is decoration for its own sake.',
  'Every line has a reason behind it.',
  'It is all measured, permitted and installed by our own crews.',
  'What you see is what gets delivered to the property.',
  'Detail first, then comfort, then the view.',
] as const;

const CLOSERS = [
  'When it feels right, add it to your selection and we will carry it forward.',
  'Turn the page whenever you are ready — the next leaf builds on this one.',
  'Tell me what draws you and I will take you straight there.',
  'Ask me for a price, a drawing, or a different finish and I will open it.',
  'If you would like this drawn on your own property, say the word.',
] as const;

const INDEX_LINES = [
  'This is the annual: every discipline the house builds, laid out as one book.',
  'Fourteen disciplines, one property. Start anywhere — the book keeps your place.',
  'Think of this index as the front desk of the whole studio.',
] as const;

const CATEGORY_LINES = [
  (c: string) => `The ${c} edition. Models, finishes, options and prices, in the order a project actually happens.`,
  (c: string) => `Welcome to ${c}. I will read you through the collection, plate by plate.`,
  (c: string) => `${c} — drawn, priced and installed turnkey. Delivery, installation and the product are all included.`,
] as const;

const PRODUCT_LINES = [
  (p: string) => `${p}, shown as it is delivered.`,
  (p: string) => `This is ${p} — measured, then set on a prepared base.`,
  (p: string) => `${p}. Read the specification opposite, then choose the finish.`,
] as const;

const PAGE_LINES: Record<string, readonly string[]> = {
  Plate: ['The photography is the product, not a rendering.', 'This is the vessel itself, in daylight.'],
  Specification: ['Dimensions, depth and capacity, exactly as the manufacturer publishes them.'],
  'Price Sheet': ['All prices include delivery, installation and the product as described.'],
  Options: ['Choose freely — nothing here is a package you cannot break apart.'],
  Portfolio: ['Built work, on real properties, in Florida light.'],
  Collection: ['The full collection, smallest to largest.'],
  Estimate: ['This estimate updates live as you add to your selection.'],
  'Drawing Board': ['Draw directly on this spread — the page will hold still while you work.'],
  Letter: ['A short word from the house before you begin.'],
  'Our Promise': ['How a Wonderlands project is carried from first drawing to first swim.'],
  Contents: ['The contents of the book, page by page.'],
  Statement: ['The intent of this discipline, in one page.'],
  Edition: ['The edition plate — the cover of what follows.'],
  Discipline: ['One discipline, one leaf. Open it and the book becomes its own edition.'],
};

const money = (n?: number) => (typeof n === 'number' && n > 0 ? `$${Math.round(n).toLocaleString()}` : null);

/* ------------------------------- generation ------------------------------- */

export interface PitchInput {
  context: NarratorContext;
  branch?: string;
  manifest?: FlipManifest | null;
  page?: FlipPageRef | null;
}

/**
 * Compose a spoken pitch for the leaf the reader is on. Pure function, no cost,
 * a few microseconds per call.
 */
export function generateFlipPitch({ context, branch, manifest, page }: PitchInput): NarratorScript {
  const seed = `${context.key}::${branch ?? ''}::${page?.key ?? ''}`;
  const rand = makeRandom(seed);
  const parts: string[] = [];

  parts.push(pick(rand, OPENERS));

  if (page) {
    parts.push(
      `Page ${page.number}${manifest ? ` of ${manifest.pages.length}` : ''} — ${page.title}.`,
    );
    const lines = PAGE_LINES[page.label];
    if (lines) parts.push(pick(rand, lines));
  }

  if (context.scope === 'index') {
    parts.push(pick(rand, INDEX_LINES));
    if (context.features?.length) {
      parts.push(`Tonight's disciplines include ${context.features.slice(0, 5).join(', ')}.`);
    }
  } else if (context.scope === 'category') {
    parts.push(pick(rand, CATEGORY_LINES)(context.category ?? context.title));
    if (context.features?.length) {
      parts.push(`On the shelf: ${context.features.slice(0, 4).join(', ')}.`);
    }
  } else if (context.product) {
    parts.push(pick(rand, PRODUCT_LINES)(context.product));
    const price = money(context.price);
    if (price) parts.push(`Turnkey from ${price}, delivery and installation included.`);
    if (context.features?.length) {
      parts.push(`Companion models in this edition: ${context.features.slice(0, 3).join(', ')}.`);
    }
  } else {
    parts.push(`${context.title}.`);
  }

  if (branch) parts.push(`You asked about ${branch.toLowerCase()} — that is exactly where I would look next.`);

  parts.push(pick(rand, CADENCE));
  parts.push(pick(rand, CLOSERS));

  return { script: parts.join(' '), actions: generateActions({ context, manifest, page }) };
}

/** Contextual chips — flip moves first, then commerce. */
export function generateActions({ context, manifest, page }: Omit<PitchInput, 'branch'>): NarratorAction[] {
  const actions: NarratorAction[] = [];

  if (manifest && page) {
    const nextPage = manifest.pages.find((p) => p.number === page.number + 1);
    if (nextPage) actions.push({ label: `Turn to ${nextPage.label}`, type: 'flip_goto', payload: String(nextPage.number) });
    const priceSheet = manifest.pages.find((p) => p.label === 'Price Sheet' && p.number !== page.number);
    if (priceSheet) actions.push({ label: 'Prices', type: 'flip_goto', payload: String(priceSheet.number) });
    const options = manifest.pages.find((p) => p.label === 'Options' && p.number !== page.number);
    if (options) actions.push({ label: 'Options', type: 'flip_goto', payload: String(options.number) });
    const board = manifest.pages.find((p) => p.label === 'Drawing Board');
    if (board) actions.push({ label: 'Draw it', type: 'flip_goto', payload: String(board.number) });
  }

  if (context.scope === 'product' && context.product) {
    actions.push({ label: 'Add to selection', type: 'add_to_cart' });
  }
  if (context.scope !== 'index') {
    actions.push({ label: 'Back to the index', type: 'flip_home' });
  }
  actions.push({ label: 'All pages', type: 'navigate', payload: '/flip-pages' });

  return actions.slice(0, 5);
}

/* --------------------------- conversational copy -------------------------- */

const ACK = [
  'Of course.',
  'Happily.',
  'Consider it done.',
  'Right away.',
  'With pleasure.',
] as const;

const UNSURE = [
  'I keep the whole book in hand, so tell me a discipline, a model or a page number and I will open it.',
  'I can turn to any page, read it aloud, price a model or add it to your selection — which would you like?',
  'Say a name like “Milan”, a discipline like “saunas”, or “page 12”, and I will take you there.',
] as const;

export function geniusAck(seed: string) {
  return pick(makeRandom(seed), ACK);
}

export function geniusFallback(seed: string) {
  return pick(makeRandom(seed), UNSURE);
}
