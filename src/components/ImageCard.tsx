
import React, { useEffect, useMemo, useRef, useState } from "react";
import { optimizeImageUrl } from "@/utils/imageOptimization";

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
  objectFit = "cover",
}: {
  src?: string;
  alt?: string;
  className?: string;
  enableZoom?: boolean;
  objectFit?: React.CSSProperties["objectFit"];
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(src);
  const [error, setError] = useState(false);

  // Track whether we've already tried the original as a fallback
  const triedOriginalRef = useRef(false);

  // Compute preferred (optimized) URL for lovable-uploads
  const preferredSrc = useMemo(() => {
    if (!src) return undefined;
    try {
      return optimizeImageUrl(src);
    } catch {
      return src;
    }
  }, [src]);

  // When src changes, try the optimized version first (if different), otherwise the original
  useEffect(() => {
    setError(false);
    triedOriginalRef.current = !preferredSrc || preferredSrc === src;
    setLoadedSrc(preferredSrc || src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, preferredSrc]);

  const handleError = () => {
    // If the optimized failed and we haven't tried the original yet, try original
    if (!triedOriginalRef.current && src) {
      triedOriginalRef.current = true;
      setLoadedSrc(src);
      setError(false);
      return;
    }
    // Final fallback to placeholder
    setError(true);
  };

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
      onError={handleError}
      style={{ objectFit, width: "100%", height: "100%", display: "block" }}
    />
  );
}
