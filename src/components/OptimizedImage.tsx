import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  webpSrc?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  webpSrc,
  loading = 'lazy' 
}: OptimizedImageProps) => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState(false);

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
    // Loading state - show a placeholder or the original image
    return <img src={src} alt={alt} className={className} loading={loading} />;
  }

  return (
    <picture>
      {finalWebPSrc && supportsWebP && !imgError && (
        <source srcSet={finalWebPSrc} type="image/webp" />
      )}
      <img 
        src={getOptimizedSrc()} 
        alt={alt} 
        className={className}
        loading={loading}
        onError={handleError}
      />
    </picture>
  );
};