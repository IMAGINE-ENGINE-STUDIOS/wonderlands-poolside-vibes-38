import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { optimizeImageUrl } from '@/utils/imageOptimization';

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
  quality = 90,
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
  const [optimizedSrc, setOptimizedSrc] = useState(() => optimizeImageUrl(src, quality));
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Recompute optimized URL when src/quality change
  useEffect(() => {
    setOptimizedSrc(optimizeImageUrl(src, quality));
  }, [src, quality]);

  // Handle image load and optimize if needed
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    // Fallback: if optimized fails, try original URL once
    setIsLoaded(false);
    setIsError(false);
    setOptimizedSrc(prev => (prev !== src ? src : prev));
    if (imageRef.current && optimizedSrc === src) {
      setIsError(true);
    }
    onError?.();
  }, [onError, src, optimizedSrc]);

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
          src={optimizedSrc}
          alt={alt}
          loading={loading}
          decoding="async"
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