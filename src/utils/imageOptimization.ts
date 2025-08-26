
/**
 * Image optimization utility for automatic compression
 * Default quality reduced to 70 for better performance.
 */

export const optimizeImageUrl = (originalUrl: string, quality: number = 90): string => {
  // For external URLs or already optimized images, return as-is
  if (originalUrl.includes('-optimized') || !originalUrl.includes('lovable-uploads')) {
    return originalUrl;
  }
  
  // For lovable-uploads, prefer the "-optimized" variant without quality suffix
  const parts = originalUrl.split('.');
  if (parts.length > 1) {
    const extension = parts.pop();
    const basePath = parts.join('.');
    return `${basePath}-optimized.${extension}`;
  }
  
  return originalUrl;
};

/**
 * Creates an optimized data URL from an existing image.
 * - Default quality now 70
 * - Scales down to a max dimension for significant size reduction
 * - Uses WEBP when supported, otherwise JPEG
 */
export const createOptimizedImage = async (
  originalImageUrl: string, 
  quality: number = 70,
  maxDimension: number = 1600
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

      // Scale down while preserving aspect ratio
      const largestSide = Math.max(img.width, img.height);
      const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
      const targetWidth = Math.max(1, Math.round(img.width * scale));
      const targetHeight = Math.max(1, Math.round(img.height * scale));
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Prefer WEBP if supported
      let optimizedDataUrl: string;
      try {
        const test = canvas.toDataURL('image/webp', quality / 100);
        if (test.startsWith('data:image/webp')) {
          optimizedDataUrl = canvas.toDataURL('image/webp', quality / 100);
        } else {
          optimizedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        }
      } catch {
        optimizedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      }

      resolve(optimizedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = originalImageUrl;
  });
};

export const preloadOptimizedImages = (imageUrls: string[], quality: number = 70): Promise<string[]> => {
  const promises = imageUrls.map(url => createOptimizedImage(url, quality));
  return Promise.all(promises);
};
