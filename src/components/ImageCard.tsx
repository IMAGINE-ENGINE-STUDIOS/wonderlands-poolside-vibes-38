import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageCardProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  enableZoom?: boolean;
  zoomScale?: number;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

const ImageCard = React.forwardRef<HTMLDivElement, ImageCardProps>(({
  src,
  alt,
  className,
  width,
  height,
  objectFit = 'cover',
  enableZoom = true,
  zoomScale = 2,
  quality = 85,
  placeholder = 'blur',
  loading = 'lazy',
  onLoad,
  onError,
  style,
  ...props
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimize image on load with canvas compression
  const handleImageLoad = useCallback(() => {
    if (imageRef.current && quality < 100) {
      const img = imageRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas size based on desired dimensions or original size
        const maxWidth = width || 800;
        const maxHeight = height || 600;
        
        let { naturalWidth, naturalHeight } = img;
        
        // Calculate optimal dimensions while maintaining aspect ratio
        if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
          const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
          naturalWidth *= ratio;
          naturalHeight *= ratio;
        }
        
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
        
        // Convert to optimized format
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        
        // Only use compressed version if it's smaller or same size
        if (compressedDataUrl.length < src.length || src.startsWith('data:')) {
          setOptimizedSrc(compressedDataUrl);
        }
      }
    }
    
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  }, [quality, width, height, src, onLoad]);

  const handleImageError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  }, [enableZoom]);

  const handleMouseEnter = useCallback(() => {
    if (enableZoom) setIsZooming(true);
  }, [enableZoom]);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    if (enableZoom) setIsZooming(true);
  }, [enableZoom]);

  const handleTouchEnd = useCallback(() => {
    setIsZooming(false);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    cursor: enableZoom ? 'zoom-in' : 'default',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isZooming ? `scale(${zoomScale})` : 'scale(1)',
    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
    willChange: enableZoom ? 'transform' : 'auto',
  };

  return (
    <div
      ref={ref}
      className={cn('relative inline-block', className)}
      style={containerStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{ width, height }}
      >
        {/* Loading placeholder */}
        {!isLoaded && !isError && placeholder === 'blur' && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        )}

        {/* Error placeholder */}
        {isError && (
          <div className="absolute inset-0 bg-muted text-muted-foreground flex items-center justify-center text-sm">
            Failed to load image
          </div>
        )}

        {/* Main image */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          loading={loading}
          style={imageStyle}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isError ? 'hidden' : 'block'
          )}
        />

        {/* Zoom indicator */}
        {enableZoom && isZooming && (
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-2 pointer-events-none">
            <div className="w-4 h-4 border-2 border-primary rounded-full relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-primary rotate-45"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
ImageCard.displayName = 'ImageCard';

export default ImageCard;