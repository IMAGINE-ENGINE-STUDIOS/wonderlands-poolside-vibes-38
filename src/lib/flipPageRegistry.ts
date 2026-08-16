/**
 * FLIP page registry — the book's table of record.
 *
 * FLIP publishes, on every render of the open edition, the full ordered list of
 * leaves it is holding (numbered like a real book, page 1 upward) plus the
 * controls needed to turn to any of them. Genius and the /flip-pages file read
 * from here, so nothing has to be inferred or guessed.
 *
 * Kept as a tiny external store: no provider nesting, no re-render cost on the
 * FLIP render path.
 */

export type FlipScope = 'home' | 'category' | 'product';

export interface FlipPageRef {
  /** Human page number, 1-based, as printed in the book. */
  number: number;
  /** react-pageflip index, 0-based. */
  index: number;
  key: string;
  /** Short page type, e.g. "Plate", "Price Sheet". */
  label: string;
  /** Full readable page title. */
  title: string;
}

export interface FlipManifest {
  scope: FlipScope;
  categoryId: string;
  categoryLabel: string;
  productId?: string;
  productName?: string;
  pages: FlipPageRef[];
  current: number;
}

export interface FlipControls {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  openHome: () => void;
  openCategory: (categoryId: string) => void;
  openProduct: (categoryId: string, productId: string) => void;
  openSearch?: (open: boolean) => void;
}

type Listener = (manifest: FlipManifest | null) => void;

const listeners = new Set<Listener>();
let manifest: FlipManifest | null = null;
let controls: FlipControls | null = null;

export function setFlipManifest(next: FlipManifest | null) {
  manifest = next;
  listeners.forEach((l) => l(manifest));
}

export function getFlipManifest() {
  return manifest;
}

export function subscribeFlip(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setFlipControls(next: FlipControls | null) {
  controls = next;
}

export function getFlipControls() {
  return controls;
}

/** True when the reader is inside the FLIP experience right now. */
export function isFlipActive() {
  return manifest !== null && controls !== null;
}

/** Turn to a printed page number (1-based). Returns the page it landed on. */
export function turnToPageNumber(pageNumber: number): FlipPageRef | null {
  if (!manifest || !controls) return null;
  const page = manifest.pages.find((p) => p.number === pageNumber);
  if (!page) return null;
  controls.goTo(page.index);
  return page;
}

/** Find a page by loose text: number, page type, or title fragment. */
export function findFlipPage(query: string): FlipPageRef | null {
  if (!manifest) return null;
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const asNumber = Number.parseInt(q.replace(/[^0-9]/g, ''), 10);
  if (/^\D*\d+\D*$/.test(q) && Number.isFinite(asNumber)) {
    const byNumber = manifest.pages.find((p) => p.number === asNumber);
    if (byNumber) return byNumber;
  }
  return (
    manifest.pages.find((p) => p.title.toLowerCase() === q) ??
    manifest.pages.find((p) => p.title.toLowerCase().includes(q)) ??
    manifest.pages.find((p) => p.label.toLowerCase().includes(q)) ??
    null
  );
}

/** Compact digest of the open book — cheap enough to hand to any consumer. */
export function flipManifestDigest(maxPages = 60): string {
  if (!manifest) return '';
  const head =
    manifest.scope === 'product'
      ? `Open book: ${manifest.productName} (${manifest.categoryLabel})`
      : manifest.scope === 'category'
        ? `Open edition: ${manifest.categoryLabel}`
        : 'Open edition: The Outdoor Annual (main index)';
  const lines = manifest.pages
    .slice(0, maxPages)
    .map((p) => `${p.number}. ${p.title} — ${p.label}`)
    .join('\n');
  return `${head}\nPages ${manifest.pages.length} total, reader on page ${manifest.current + 1}.\n${lines}`;
}
