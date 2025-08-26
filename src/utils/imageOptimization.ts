
/**
 * Enhanced image optimization utility with aggressive compression and caching
 */

// Cache for optimized images
const imageCache = new Map<string, string>();

export const optimizeImageUrl = (originalUrl: string, quality: number = 75): string => {
  // For external URLs or already optimized images, return as-is
  if (originalUrl.includes('-optimized') || !originalUrl.includes('lovable-uploads')) {
    return originalUrl;
  }
  
  // For lovable-uploads, prefer the "-optimized" variant
  const parts = originalUrl.split('.');
  if (parts.length > 1) {
    const extension = parts.pop();
    const basePath = parts.join('.');
    return `${basePath}-optimized.${extension}`;
  }
  
  return originalUrl;
};

export const createOptimizedImage = async (
  originalImageUrl: string, 
  quality: number = 75
): Promise<string> => {
  // Check cache first
  const cacheKey = `${originalImageUrl}-${quality}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

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
      
      // Calculate optimal dimensions (max 1200px width)
      const maxWidth = 1200;
      const maxHeight = 800;
      
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to optimized data URL with specified quality
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      
      // Cache the result
      imageCache.set(cacheKey, optimizedDataUrl);
      
      resolve(optimizedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = originalImageUrl;
  });
};

export const preloadOptimizedImages = (imageUrls: string[], quality: number = 75): Promise<string[]> => {
  const promises = imageUrls.map(url => createOptimizedImage(url, quality));
  return Promise.all(promises);
};

// Preload critical images with aggressive optimization
export const preloadCriticalImages = () => {
  const criticalImages = [
    '/lovable-uploads/f0ee9d81-bffb-4340-8f6e-c2090e67204e.png', // Logo
    '/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png', // Hero image
  ];
  
  criticalImages.forEach(url => {
    createOptimizedImage(url, 80).catch(() => {
      // Silent fail for preloading
    });
  });
};

// Initialize preloading when module loads
if (typeof window !== 'undefined') {
  // Delay preloading to not block initial render
  setTimeout(preloadCriticalImages, 100);
}
