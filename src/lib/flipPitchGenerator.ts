/**
 * Flip pitch generator — the house copywriter, written in plain TypeScript.
 *
 * Genius speaks about what is printed on the leaves in front of the guest: the
 * headline, the prose and the options actually rendered in the viewport (see
 * `flipViewportReader`). Nothing is billed for this text — the voice is the only
 * paid step — and nothing structural is read aloud: no page numbers, no page
 * tags, no running heads like "ON LINERS".
 *
 * Two short sentences, then one invitation. That is the whole house style.
 */

import type { NarratorAction, NarratorContext, NarratorScript } from '@/lib/narratorStore';
import type { FlipManifest, FlipPageRef } from '@/lib/flipPageRegistry';
import { readFlipViewport, type ViewportRead } from '@/lib/flipViewportReader';

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

const INVITES = [
  'Want the price?',
  'Shall I open the options?',
  'Which finish interests you?',
  'Want this on your property?',
  'Say the word and I will turn ahead.',
] as const;

const money = (n?: number) => (typeof n === 'number' && n > 0 ? `$${Math.round(n).toLocaleString()}` : null);

/** First sentence of a paragraph, trimmed to something speakable. */
function firstSentence(text: string, max = 190) {
  const s = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return s.length > max ? `${s.slice(0, max).replace(/[,;\s]+\S*$/, '')}…` : s;
}

/* ------------------------------- generation ------------------------------- */

export interface PitchInput {
  context: NarratorContext;
  branch?: string;
  manifest?: FlipManifest | null;
  page?: FlipPageRef | null;
}

/**
 * Compose a short spoken pitch for the spread the guest is looking at.
 * Pure function apart from one DOM read, no cost, microseconds per call.
 */
export function generateFlipPitch({ context, branch, manifest, page }: PitchInput): NarratorScript {
  const view = readFlipViewport();
  const seed = `${context.key}::${branch ?? ''}::${page?.key ?? ''}`;
  const rand = makeRandom(seed);
  const parts: string[] = [];

  const heading = view?.title || context.product || context.category || context.title;
  const price = money(context.price);

  if (view?.prose.length) {
    /* Read the page itself: headline, then the line that carries the meaning. */
    if (heading) parts.push(`${heading}.`);
    parts.push(firstSentence(view.prose[0]));
  } else if (view?.values.length) {
    if (heading) parts.push(`${heading}.`);
    parts.push(view.values.slice(0, 2).map((v) => `${v.label.toLowerCase()} ${v.value}`).join(', ') + '.');
  } else {
    if (heading) parts.push(`${heading}.`);
    if (price) parts.push(`Turnkey from ${price}, delivery and installation included.`);
  }

  if (view?.options.length) {
    const names = view.options.slice(0, 3).map((o) => o.label);
    parts.push(`On this spread: ${names.join(', ')}.`);
  }

  if (branch) parts.push(`On ${branch.toLowerCase()} — here is the short version.`);
  parts.push(pick(rand, INVITES));

  return {
    script: parts.filter(Boolean).join(' '),
    actions: generateActions({ context, manifest, page }, view),
  };
}

/** Contextual chips — the options actually on the spread come first. */
export function generateActions(
  { context, manifest, page }: Omit<PitchInput, 'branch'>,
  viewRead?: ViewportRead | null,
): NarratorAction[] {
  const view = viewRead ?? readFlipViewport();
  const actions: NarratorAction[] = [];

  /* What the guest can choose right here, right now. */
  view?.options.slice(0, 3).forEach((o) => {
    actions.push({
      label: o.price ? `${o.label} · ${o.price}` : o.label,
      type: 'flip_option',
      payload: o.label,
    });
  });

  if (context.scope === 'product' && context.product) {
    actions.push({ label: `Add ${context.product}`, type: 'add_to_cart' });
  }

  /* The rest of the open edition — additional features, price sheet, board. */
  bookChips(6).forEach((chip) => {
    if (actions.some((a) => a.type === chip.type && (a.payload ?? a.label) === (chip.payload ?? chip.label))) return;
    actions.push(chip);
  });

  if (manifest && page) {
    const nextPage = manifest.pages.find((p) => p.number === page.number + 1);
    if (nextPage && !actions.some((a) => a.type === 'flip_next')) {
      actions.push({ label: 'Turn the page', type: 'flip_next' });
    }
  }

  if (context.scope !== 'index' && !actions.some((a) => a.type === 'flip_home')) {
    actions.push({ label: 'Back to the index', type: 'flip_home' });
  }

  return actions.slice(0, 6);
}

/* --------------------------- conversational copy -------------------------- */

const ACK = ['Of course.', 'Done.', 'Right away.', 'Happily.'] as const;

const UNSURE = [
  'Name a discipline or a model and I will open it.',
  'Tell me what you want to see — a pool, a sauna, a price — and I will take you there.',
  'Say a model name, like “Milan”, and I will open its book.',
] as const;

export function geniusAck(seed: string) {
  return pick(makeRandom(seed), ACK);
}

export function geniusFallback(seed: string) {
  return pick(makeRandom(seed), UNSURE);
}
