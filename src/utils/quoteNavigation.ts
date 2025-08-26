
export type QuotePayload = {
  type: 'pool' | 'spa' | 'product';
  pool?: any;
  spa?: any;
  product?: any;
  extras?: any;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
};

export const openQuotePreview = (payload: QuotePayload) => {
  try {
    console.log('Opening quote preview with payload:', payload);
    
    // Validate payload
    if (!payload || !payload.type) {
      console.error('Invalid payload - missing type');
      return;
    }

    const id = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure the payload is properly structured for pools
    if (payload.type === 'pool' && payload.pool) {
      payload.pool.quoteId = id;
      payload.pool.quoteDate = new Date().toISOString();
      payload.pool.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    }
    
    const dataString = JSON.stringify(payload);
    console.log('Storing quote data with ID:', id);
    console.log('Quote data string length:', dataString.length);
    
    try {
      sessionStorage.setItem(`quote:${id}`, dataString);
      console.log('Data stored successfully in sessionStorage');
    } catch (storageError) {
      console.error('Failed to store in sessionStorage:', storageError);
      // Try localStorage as fallback
      try {
        localStorage.setItem(`quote:${id}`, dataString);
        console.log('Data stored successfully in localStorage as fallback');
      } catch (localError) {
        console.error('Failed to store in localStorage:', localError);
        return;
      }
    }
    
    // Verify the data was stored
    const stored = sessionStorage.getItem(`quote:${id}`) || localStorage.getItem(`quote:${id}`);
    if (!stored) {
      console.error('Failed to verify stored quote data');
      return;
    }
    
    console.log('Quote data verified successfully');
    
    const url = `/quote/${id}`;
    console.log('Opening quote URL:', url);
    
    // Navigate in the same tab instead of opening new window
    window.location.href = url;
    
  } catch (error) {
    console.error('Error in openQuotePreview:', error);
  }
};

// Helper function to retrieve quote data
export const getQuoteData = (id: string): QuotePayload | null => {
  try {
    const stored = sessionStorage.getItem(`quote:${id}`) || localStorage.getItem(`quote:${id}`);
    if (!stored) {
      console.error('No quote data found for ID:', id);
      return null;
    }
    
    const data = JSON.parse(stored);
    console.log('Retrieved quote data:', data);
    return data;
  } catch (error) {
    console.error('Error retrieving quote data:', error);
    return null;
  }
};

// Helper function to clear old quote data (cleanup)
export const clearOldQuotes = () => {
  try {
    const keys = Object.keys(sessionStorage).filter(key => key.startsWith('quote:'));
    keys.forEach(key => sessionStorage.removeItem(key));
    
    const localKeys = Object.keys(localStorage).filter(key => key.startsWith('quote:'));
    localKeys.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keys.length + localKeys.length} old quotes`);
  } catch (error) {
    console.error('Error clearing old quotes:', error);
  }
};
