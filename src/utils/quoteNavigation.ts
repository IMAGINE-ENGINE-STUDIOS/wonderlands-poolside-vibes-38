export type QuotePayload = {
  type: 'pool' | 'spa' | 'product';
  pool?: any;
  spa?: any;
  product?: any;
  extras?: any;
};

export const openQuotePreview = (payload: QuotePayload) => {
  try {
    const id = `${Date.now()}`;
    sessionStorage.setItem(`quote:${id}`, JSON.stringify(payload));
    window.open(`/quote/${id}`, '_blank', 'noopener');
  } catch (e) {
    console.error('Failed to open quote preview', e);
  }
};
