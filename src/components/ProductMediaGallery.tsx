import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface ProductMediaGalleryProps {
  media: MediaItem[] | string; // Support both new format and backwards compatibility
  productName: string;
  className?: string;
  // Wonderlands Studio chrome (founder 2026-11-01): opt-in only — swipe on
  // the stage image, always-visible arrows (phone-first), and the per-image
  // tabs rendered by the Studio beside its "Product Image" tag instead of
  // the in-gallery dots/counter. Other surfaces keep the default chrome.
  studioChrome?: boolean;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

const ProductMediaGallery = ({ media, productName, className = "", studioChrome = false, activeIndex, onActiveIndexChange }: ProductMediaGalleryProps) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = activeIndex ?? internalIndex;
  const setCurrentIndex = (updater: number | ((prev: number) => number)) => {
    const next = typeof updater === "function" ? (updater as (prev: number) => number)(currentIndex) : updater;
    if (onActiveIndexChange) onActiveIndexChange(next);
    else setInternalIndex(next);
  };
  const touchStartX = useRef<number | null>(null);

  // Handle backwards compatibility - convert single image string to media array
  const mediaItems: MediaItem[] = typeof media === 'string'
    ? [{ type: 'image', url: media, alt: productName }]
    : Array.isArray(media) ? media.filter(Boolean) : [];

  const safeIndex = mediaItems.length > 0 ? Math.min(currentIndex, mediaItems.length - 1) : 0;
  const currentMedia = mediaItems[safeIndex];
  const hasMultipleItems = mediaItems.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  if (!currentMedia) return null;

  // Studio swipe: horizontal touch drag on the stage image itself.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40 || !hasMultipleItems) return;
    if (dx < 0) goToNext();
    else goToPrevious();
  };

  return (
    <div
      className={`relative group ${className}`}
      {...(studioChrome ? { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd } : {})}
    >
      {/* Media Display */}
      {currentMedia.type === 'video' ? (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-cover"
            poster={currentMedia.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Play className="h-3 w-3" />
            Video
          </div>
        </div>
      ) : (
        <OptimizedImage
          src={currentMedia.url}
          alt={currentMedia.alt || productName}
          className="w-full h-full object-contain"
          sizeConfig="hero"
        />
      )}

      {/* Navigation Arrows - Only show if multiple items */}
      {hasMultipleItems && (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous image"
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg transition-opacity duration-200 z-10 ${studioChrome ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next image"
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg transition-opacity duration-200 z-10 ${studioChrome ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Indicator Dots + Counter — default chrome only; in Studio the
          per-image tabs live beside the "Product Image" tag instead. */}
      {hasMultipleItems && !studioChrome && (
        <>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {mediaItems.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductMediaGallery;
