// Lightweight local "file gallery" for saved quotes.
// Stores full quote snapshots in localStorage so users can reopen and modify them.

export interface SavedQuoteSnapshot {
  id: string;
  label: string;
  savedAt: string;
  total: number;
  productName: string;
  surveyData: any;
  selectedOptions: any[];
  editableTexts: Record<string, string>;
  editablePrices: Record<string, number>;
  editableQuoteAmount: number;
  hiddenSections: string[];
  customItems: any[];
  imageOverrides: Record<string, string>;
  imageCropSettings: Record<string, any>;
  // The quote's own main/cover image (data URL or URL), set from the quote
  // editor's main image control. Independent of any product section, so it
  // survives the product section being removed. Optional: older snapshots
  // simply have none.
  mainImage?: string;
  pool: any;
  customProduct: any;
  extras: any;
}

const MAX_QUOTES = 15;

const keyFor = (userId?: string | null) => `quote_gallery_${userId || 'guest'}`;

export const listSavedQuotes = (userId?: string | null): SavedQuoteSnapshot[] => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (
  userId: string | null | undefined,
  quotes: SavedQuoteSnapshot[],
  priorityId?: string
) => {
  const key = keyFor(userId);
  try {
    localStorage.setItem(key, JSON.stringify(quotes));
    return true;
  } catch {
    // Storage full. Make room WITHOUT touching the quote being saved: the
    // record identified by priorityId is always written exactly as given.
    // (The previous fallback stripped the image overrides from EVERY
    // entry — including the one being saved — and reported success, so a
    // save could silently lose the very line images it was meant to
    // persist; and when even the stripped write did not fit, the write
    // vanished while the caller still claimed the quote was saved.)
    // First, drop the oldest OTHER entries one at a time.
    let trimmed = [...quotes];
    while (trimmed.length > 1) {
      let dropIdx = -1;
      for (let i = trimmed.length - 1; i >= 0; i--) {
        if (trimmed[i].id !== priorityId) { dropIdx = i; break; }
      }
      if (dropIdx === -1) break;
      trimmed = trimmed.filter((_, i) => i !== dropIdx);
      try {
        localStorage.setItem(key, JSON.stringify(trimmed));
        return true;
      } catch {
        // Still too big — keep trimming
      }
    }
    // Last resort: strip image payloads from the OTHER entries only.
    try {
      const slim = trimmed.map(q =>
        q.id === priorityId
          ? q
          : { ...q, imageOverrides: {}, imageCropSettings: {}, mainImage: undefined }
      );
      localStorage.setItem(key, JSON.stringify(slim));
      return true;
    } catch {
      return false;
    }
  }
};

export const saveQuoteSnapshot = (
  userId: string | null | undefined,
  snapshot: Omit<SavedQuoteSnapshot, 'id' | 'savedAt'> & { id?: string }
): SavedQuoteSnapshot | null => {
  const existing = listSavedQuotes(userId);
  const id = snapshot.id || `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const record: SavedQuoteSnapshot = { ...snapshot, id, savedAt: new Date().toISOString() };
  const next = [record, ...existing.filter(q => q.id !== id)].slice(0, MAX_QUOTES);
  return persist(userId, next, id) ? record : null;
};

export const deleteSavedQuote = (userId: string | null | undefined, id: string) => {
  const next = listSavedQuotes(userId).filter(q => q.id !== id);
  persist(userId, next);
  return next;
};

// Work-in-progress draft: the editor's in-progress state for one quote
// context (a signature built from the product the tool was opened with).
// Written as the admin types, read back when the tool reopens for the same
// context — so a page reload (a deploy rotating the build mid-edit, a
// browser crash, an accidental close) can no longer throw the edits away.
// Cleared only when the quote is explicitly saved or submitted.
const wipKeyFor = (userId: string | null | undefined, signature?: string | null) =>
  `quote_wip_${userId || 'guest'}_${signature || 'default'}`;

export const readQuoteWip = (
  userId: string | null | undefined,
  signature?: string | null
): SavedQuoteSnapshot | null => {
  try {
    const raw = localStorage.getItem(wipKeyFor(userId, signature));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && typeof parsed.id === 'string' ? parsed : null;
  } catch {
    return null;
  }
};

export const writeQuoteWip = (
  userId: string | null | undefined,
  signature: string | null | undefined,
  snapshot: SavedQuoteSnapshot
) => {
  try {
    localStorage.setItem(wipKeyFor(userId, signature), JSON.stringify(snapshot));
  } catch {
    // Storage full: the gallery snapshot written alongside still holds the
    // state; the WIP copy is the restore convenience, not the only copy.
  }
};

export const clearQuoteWip = (userId: string | null | undefined, signature?: string | null) => {
  try {
    localStorage.removeItem(wipKeyFor(userId, signature));
  } catch {
    // Nothing to clear
  }
};
