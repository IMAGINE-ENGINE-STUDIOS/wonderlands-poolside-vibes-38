
import React, { useState } from "react";

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

  const handleError = () => {
    if (!error) {
      // Final fallback to placeholder
      setError(true);
    }
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
