import { useState, useEffect } from 'react';
import { getImageConfig, generateSrcSet } from '@/utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  webpSrc?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  sizeConfig?: 'poolCard' | 'logoLarge' | 'logoSmall' | 'thumbnail' | 'quoteImage' | 'hero';
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  webpSrc,
  loading = 'lazy',
  width,
  height,
  sizes,
  priority = false,
  sizeConfig
}: OptimizedImageProps) => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState(false);

  // Use size config if provided, otherwise use manual dimensions
  const config = sizeConfig ? getImageConfig(sizeConfig) : null;
  const actualWidth = width || config?.width;
  const actualHeight = height || config?.height;
  const actualSizes = sizes || config?.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

  // Use eager loading for priority images
  const actualLoading = priority ? 'eager' : loading;

  // Check WebP support
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
    };

    checkWebPSupport();
  }, []);

  const handleError = () => {
    setImgError(true);
  };

  // Generate responsive srcset for better sizing
  const generateSrcSetForImage = (baseSrc: string) => {
    return generateSrcSet(baseSrc, actualWidth || 1200);
  };

  const getOptimizedSrc = () => {
    // If we have a webp source and browser supports WebP and no error occurred
    if (webpSrc && supportsWebP && !imgError) {
      return webpSrc;
    }
    return src;
  };

  // Generate WebP path from PNG path for certain large images
  const getAutoWebPSrc = (originalSrc: string) => {
    if (originalSrc.includes('/lovable-uploads/')) {
      const filename = originalSrc.split('/').pop()?.replace('.png', '');
      // Map specific high-impact images to optimized WebP versions
      const webpMappings: Record<string, string> = {
        '7a94e712-7683-4a26-8a1c-c6974e320b5a': '/src/assets/hero-pool-optimized.webp'
      };
      
      if (filename && webpMappings[filename]) {
        return webpMappings[filename];
      }
    }
    return webpSrc;
  };

  const finalWebPSrc = webpSrc || getAutoWebPSrc(src);

  if (supportsWebP === null) {
    // Loading state - show a placeholder with proper dimensions
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        loading={actualLoading}
        width={actualWidth}
        height={actualHeight}
      />
    );
  }

  return (
    <picture>
      {finalWebPSrc && supportsWebP && !imgError && (
        <source 
          srcSet={finalWebPSrc} 
          type="image/webp"
          sizes={actualSizes}
        />
      )}
      <img 
        src={getOptimizedSrc()} 
        alt={alt} 
        className={className}
        loading={actualLoading}
        onError={handleError}
        width={actualWidth}
        height={actualHeight}
        sizes={actualSizes}
        srcSet={generateSrcSetForImage(getOptimizedSrc())}
      />
    </picture>
  );
};