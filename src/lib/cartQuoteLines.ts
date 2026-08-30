import type { CartItem } from '@/components/ShoppingCart';

export interface QuoteLine {
  name: string;
  price: number;
  image: string;
}

/** Turns shopping-list items (and their features) into quote breakdown lines */
export const cartToQuoteLines = (
  cartItems: CartItem[] | undefined,
  excludeName?: string | null
): QuoteLine[] =>
  (cartItems || [])
    .filter(item => !excludeName || item.name !== excludeName)
    .flatMap(item => {
      const qty = item.quantity || 1;
      return [
        {
          name: `${item.name}${qty > 1 ? ` × ${qty}` : ''}`,
          price: (item.price || 0) * qty,
          image: (item as any).image || '',
        },
        /* A selected option keeps its own photography so the quote shows the
           finish / heater / paver the guest actually chose. */
        ...(item.extras || []).map(extra => ({
          name: `${item.name} — ${extra.name}`,
          price: (extra.price || 0) * qty,
          image: (extra as any).image || '',
        })),
      ];
    });

/**
 * Merges every shopping-list product into the quote extras breakdown so a quote
 * always shows all categories the customer added (pools, saunas, fences, ...).
 * Lines already present in the breakdown are never duplicated.
 */
export const mergeCartIntoExtras = (
  extras: any,
  cartItems: CartItem[] | undefined,
  currentProductName?: string | null
): any => {
  const cartLines = cartToQuoteLines(cartItems, currentProductName);
  if (cartLines.length === 0) return extras;

  const existing: QuoteLine[] = Array.isArray(extras?.extrasBreakdown) ? extras.extrasBreakdown : [];
  const seen = new Set(existing.map(line => `${line.name}|${line.price}`));
  const missing = cartLines.filter(line => !seen.has(`${line.name}|${line.price}`));
  if (missing.length === 0) return extras;

  const extrasBreakdown = [...existing, ...missing];
  return {
    ...(extras || {}),
    extrasBreakdown,
    extrasTotal: extrasBreakdown.reduce((sum, line) => sum + (line.price || 0), 0),
  };
};
