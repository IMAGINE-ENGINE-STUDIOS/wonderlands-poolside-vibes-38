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
        '0aa90de6-b1eb-43a4-91ec-10c05388c900': '/src/assets/pools/olympia-12-optimized.webp',
        'd707c6e1-8471-404f-9312-bd6773152617': '/src/assets/pools/olympia-14-optimized.webp',
        '63844c0c-04e6-4628-ad09-1b98c9283cf0': '/src/assets/pools/enchantment-921-optimized.webp',
        '749a82f6-561b-4f6b-982b-d343dfac9565': '/src/assets/pools/enchantment-924-optimized.webp',
        'd7541cc8-f254-4f85-b6ee-f636a8726dcc': '/src/assets/pools/enchantment-917-optimized.webp',
        '7a94e712-7683-4a26-8a1c-c6974e320b5a': '/src/assets/hero-pool-optimized.webp',
        // Additional optimized images
        'e2d562f0-9a55-4293-8a9f-26d9b09ebf15': '/src/assets/pools/jamaica.jpg',
        'ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5': '/src/assets/pools/aruba-16-new.jpg',
        '2677d17d-ba82-407b-896c-b4b3e238b8d5': '/src/assets/pools/tuscan-1324.jpg',
        '579d34e1-ef64-4134-bf8b-dff4980bb17a': '/src/assets/pools/tuscan-1120.jpg',
        '121eda70-3d05-4624-afb0-5dba766d8b2f': '/src/assets/pools/milan-16.jpg',
        'c7c3ab88-34ab-47d4-bf6c-38893a5b13f2': '/src/assets/pools/astoria-12.jpg'
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