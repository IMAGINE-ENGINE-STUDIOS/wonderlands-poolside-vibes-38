
import React, { useState, useEffect } from "react";
import { optimizeImageUrl, createOptimizedImage } from "@/utils/imageOptimization";

const Placeholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
    Failed to load image
  </div>
);

export default function ImageCard({
  src,
  alt,
  className,
  enableZoom = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  enableZoom?: boolean;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    // First try optimized URL
    const optimizedUrl = optimizeImageUrl(src, 75);
    
    // Test if optimized version exists
    const testImage = new Image();
    testImage.onload = () => {
      setLoadedSrc(optimizedUrl);
      setLoading(false);
    };
    
    testImage.onerror = () => {
      // If optimized version fails, try creating one on-the-fly
      createOptimizedImage(src, 75)
        .then((optimized) => {
          setLoadedSrc(optimized);
          setLoading(false);
        })
        .catch(() => {
          // Final fallback to original
          const fallbackImage = new Image();
          fallbackImage.onload = () => {
            setLoadedSrc(src);
            setLoading(false);
          };
          fallbackImage.onerror = () => {
            setError(true);
            setLoading(false);
          };
          fallbackImage.src = src;
        });
    };
    
    testImage.src = optimizedUrl;
  }, [src]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!loadedSrc || error) {
    return <Placeholder />;
  }

  return (
    <img
      src={loadedSrc}
      alt={alt || ""}
      className={className}
      loading="lazy"
      decoding="async"
      sizes="(max-width: 768px) 100vw, 50vw"
      style={{ 
        objectFit: "cover", 
        width: "100%", 
        height: "100%", 
        display: "block",
        // Add caching headers via style (browser will cache more aggressively)
        willChange: "auto"
      }}
    />
  );
}
