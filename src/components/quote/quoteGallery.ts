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

const persist = (userId: string | null | undefined, quotes: SavedQuoteSnapshot[]) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(quotes));
    return true;
  } catch {
    // Storage full — drop image overrides (largest payload) and retry once
    try {
      const slim = quotes.map(q => ({ ...q, imageOverrides: {}, imageCropSettings: {} }));
      localStorage.setItem(keyFor(userId), JSON.stringify(slim));
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
  return persist(userId, next) ? record : null;
};

export const deleteSavedQuote = (userId: string | null | undefined, id: string) => {
  const next = listSavedQuotes(userId).filter(q => q.id !== id);
  persist(userId, next);
  return next;
};
