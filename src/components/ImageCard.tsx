import React, { useState, useRef, useEffect } from 'react';
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
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimize image URL with quality and format parameters
  const optimizedSrc = React.useMemo(() => {
    if (!src) return '';
    
    // For external URLs or already optimized images, return as-is
    if (src.startsWith('http') || src.includes('?')) {
      return src;
    }
    
    // For local images, add optimization parameters
    const url = new URL(src, window.location.origin);
    url.searchParams.set('quality', quality.toString());
    
    // Try to use WebP format if supported
    if (supportsWebP()) {
      url.searchParams.set('format', 'webp');
    }
    
    return url.toString();
  }, [src, quality]);

  // Check WebP support
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom || !containerRef.current || !imageRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (enableZoom) {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Touch support for mobile zoom
  const handleTouchStart = () => {
    if (enableZoom) {
      setIsZooming(true);
    }
  };

  const handleTouchEnd = () => {
    setIsZooming(false);
  };

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
    transition: 'transform 0.3s ease-out',
    transform: isZooming ? `scale(${zoomScale})` : 'scale(1)',
    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
  };

  const placeholderStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: 'hsl(var(--muted))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '14px',
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
          <div
            className="absolute inset-0 animate-pulse"
            style={placeholderStyle}
          >
            Loading...
          </div>
        )}

        {/* Error placeholder */}
        {isError && (
          <div
            className="absolute inset-0 bg-muted text-muted-foreground flex items-center justify-center text-sm"
            style={placeholderStyle}
          >
            Failed to load image
          </div>
        )}

        {/* Main image */}
        <img
          ref={imageRef}
          src={optimizedSrc}
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