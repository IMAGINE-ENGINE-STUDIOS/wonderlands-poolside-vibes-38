// Image optimization utilities for SEO performance

export interface ImageDimensions {
  width: number;
  height: number;
  sizes: string;
}

// Predefined size configurations for different use cases
export const imageSizeConfigs = {
  // Pool card images in catalog (displayed at ~400x256)
  poolCard: {
    width: 400,
    height: 256,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  },
  
  // Logo images
  logoLarge: {
    width: 96,
    height: 96,
    sizes: "(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
  },
  
  logoSmall: {
    width: 48,
    height: 48,
    sizes: "48px"
  },
  
  // Option selection thumbnails
  thumbnail: {
    width: 64,
    height: 64,
    sizes: "64px"
  },
  
  // Quote images (small display)
  quoteImage: {
    width: 80,
    height: 80,
    sizes: "80px"
  },
  
  // Hero images
  hero: {
    width: 1200,
    height: 600,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  }
} as const;

// Generate srcset for responsive images
export const generateSrcSet = (baseSrc: string, maxWidth: number = 1200): string => {
  if (!baseSrc.includes('/lovable-uploads/')) return baseSrc;
  
  const sizes = [400, 800, 1200].filter(size => size <= maxWidth);
  return sizes.map(size => `${baseSrc} ${size}w`).join(', ');
};

// Get appropriate image config based on context
export const getImageConfig = (context: keyof typeof imageSizeConfigs): ImageDimensions => {
  return imageSizeConfigs[context];
};