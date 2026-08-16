/**
 * FLIP viewport reader — Genius reads what is actually on screen.
 *
 * Instead of describing a page from metadata (page numbers, tag labels, UI
 * eyebrows), Genius lifts the real content of the leaves currently visible in
 * the viewport: the headline, the prose, the named values and the selectable
 * options. Everything is read straight from the rendered DOM, so it is always
 * in sync with the book and costs nothing.
 */

export interface ViewportOption {
  label: string;
  price?: string;
}

export interface ViewportRead {
  /** The leading title of the visible spread, in sentence form. */
  title: string;
  /** Real sentences printed on the spread. */
  prose: string[];
  /** Named values, e.g. "Dimensions — 14 x 28". */
  values: { label: string; value: string }[];
  /** Selectable options / finishes / features on the spread. */
  options: ViewportOption[];
}

/** Junk that is chrome, not content. */
const CHROME = [
  'wonderlands world',
  'wonderlands',
  'flip',
  'genius',
  'add to selection',
  'add',
  'next',
  'previous',
  'back',
  'close',
  'open',
  'full screen',
  'enlarge',
  'search',
  'menu',
  'index',
  'contents',
  'prices',
  'price sheet',
  'options',
  'drawing board',
  'plate',
  'standard',
];

const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

const isChrome = (s: string) => {
  const t = clean(s).toLowerCase();
  if (!t) return true;
  if (CHROME.includes(t)) return true;
  if (/^page\s*\d+/i.test(t)) return true;
  if (/^\d{1,3}\s*(—|-|–|\/|of)\b/i.test(t)) return true; // "01 — DIMENSIONS", "3 of 32"
  if (/^on\s+[a-z ]{2,20}$/i.test(t)) return true; // running head, e.g. "ON LINERS"
  return false;
};

/** Eyebrows are set in caps with wide tracking — content is not. */
const isEyebrow = (s: string) => {
  const t = clean(s);
  if (!t) return true;
  const letters = t.replace(/[^A-Za-z]/g, '');
  return letters.length > 1 && letters === letters.toUpperCase() && t.length < 46;
};

const money = (s: string) => s.match(/\$[\d,.]+(?:\s*\/\s*[a-z ]+)?/i)?.[0];

function visiblePages(): HTMLElement[] {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.stf__item'));
  const pool = items.length ? items : Array.from(document.querySelectorAll<HTMLElement>('[data-flip-page]'));
  return pool.filter((el) => {
    const r = el.getBoundingClientRect();
    return (
      r.width > 80 &&
      r.height > 80 &&
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      getComputedStyle(el).visibility !== 'hidden'
    );
  });
}

/** Read the leaves currently open in front of the guest. */
export function readFlipViewport(): ViewportRead | null {
  if (typeof document === 'undefined') return null;
  const pages = visiblePages();
  if (!pages.length) return null;

  let title = '';
  const prose: string[] = [];
  const values: { label: string; value: string }[] = [];
  const options: ViewportOption[] = [];
  const seen = new Set<string>();

  for (const page of pages) {
    /* headline */
    if (!title) {
      const heads = Array.from(page.querySelectorAll<HTMLElement>('h1, h2, h3'));
      for (const h of heads) {
        const t = clean(h.innerText);
        if (t && !isChrome(t) && !isEyebrow(t) && t.length < 70) {
          title = t;
          break;
        }
      }
    }

    /* prose — the printed paragraphs */
    for (const p of Array.from(page.querySelectorAll<HTMLElement>('p, li'))) {
      const t = clean(p.innerText);
      if (t.length < 55 || t.length > 420) continue;
      if (isChrome(t) || isEyebrow(t)) continue;
      const k = t.slice(0, 40).toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      prose.push(t);
      if (prose.length >= 4) break;
    }

    /* named values — a short caps label immediately followed by its value */
    for (const el of Array.from(page.querySelectorAll<HTMLElement>('dt, [data-spec-label]'))) {
      const label = clean(el.innerText);
      const value = clean((el.nextElementSibling as HTMLElement | null)?.innerText);
      if (!label || !value || value.length > 60) continue;
      values.push({ label, value });
      if (values.length >= 6) break;
    }

    /* selectable options — finishes, features, models */
    for (const el of Array.from(
      page.querySelectorAll<HTMLElement>('button, [role="button"], [data-option-label]'),
    )) {
      const raw = clean(el.dataset.optionLabel || el.getAttribute('aria-label') || el.innerText);
      if (!raw || raw.length > 48) continue;
      const label = raw.replace(/\$[\d,.]+.*$/, '').trim();
      if (!label || label.length < 3 || isChrome(label)) continue;
      const k = label.toLowerCase();
      if (seen.has(`opt:${k}`)) continue;
      seen.add(`opt:${k}`);
      options.push({ label, price: money(raw) });
      if (options.length >= 8) break;
    }
  }

  if (!title && !prose.length && !options.length) return null;
  return { title, prose, values, options };
}

/**
 * Act on an option the guest picked from a chip: find it on the open spread and
 * click it, exactly as if the guest had touched the page.
 */
export function clickViewportOption(label: string): boolean {
  const want = label.toLowerCase();
  for (const page of visiblePages()) {
    const candidates = Array.from(
      page.querySelectorAll<HTMLElement>('button, [role="button"], [data-option-label]'),
    );
    const hit =
      candidates.find((el) => clean(el.dataset.optionLabel || el.innerText).toLowerCase() === want) ??
      candidates.find((el) => clean(el.dataset.optionLabel || el.innerText).toLowerCase().includes(want));
    if (hit) {
      hit.click();
      return true;
    }
  }
  return false;
}
