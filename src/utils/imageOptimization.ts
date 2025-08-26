/**
 * Image optimization utility for automatic compression to 90% quality
 */

export const optimizeImageUrl = (originalUrl: string, quality: number = 90): string => {
  // For external URLs or already optimized images, return as-is
  if (originalUrl.includes('-optimized') || !originalUrl.includes('lovable-uploads')) {
    return originalUrl;
  }
  
  // Add optimization suffix to internal images
  const parts = originalUrl.split('.');
  if (parts.length > 1) {
    const extension = parts.pop();
    const basePath = parts.join('.');
    return `${basePath}-optimized-${quality}.${extension}`;
  }
  
  return originalUrl;
};

export const createOptimizedImage = async (
  originalImageUrl: string, 
  quality: number = 90
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      // Convert to optimized data URL with specified quality
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      resolve(optimizedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = originalImageUrl;
  });
};

export const preloadOptimizedImages = (imageUrls: string[], quality: number = 90): Promise<string[]> => {
  const promises = imageUrls.map(url => createOptimizedImage(url, quality));
  return Promise.all(promises);
};