
export type QuotePayload = {
  type: 'pool' | 'spa' | 'product';
  pool?: any;
  spa?: any;
  product?: any;
  extras?: any;
};

export const openQuotePreview = (payload: QuotePayload) => {
  try {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const data = JSON.stringify(payload);
    
    console.log('Opening quote preview with payload:', payload);
    console.log('Quote ID:', id);
    
    sessionStorage.setItem(`quote:${id}`, data);
    
    // Verify the data was stored
    const stored = sessionStorage.getItem(`quote:${id}`);
    if (!stored) {
      console.error('Failed to store quote data in sessionStorage');
      alert('Failed to save quote data. Please try again.');
      return;
    }
    
    const url = `/quote/${id}`;
    console.log('Opening URL:', url);
    
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      console.error('Failed to open new window - popup blocked?');
      alert('Please allow popups for this site to view quotes.');
    }
  } catch (e) {
    console.error('Failed to open quote preview:', e);
    alert('Failed to open quote preview. Please try again.');
  }
};
