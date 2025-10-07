import { useState } from "react";
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
}

const ProductMediaGallery = ({ media, productName, className = "" }: ProductMediaGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle backwards compatibility - convert single image string to media array
  const mediaItems: MediaItem[] = typeof media === 'string' 
    ? [{ type: 'image', url: media, alt: productName }]
    : media;

  const currentMedia = mediaItems[currentIndex];
  const hasMultipleItems = mediaItems.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`relative group ${className}`}>
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
          className="w-full h-full object-cover object-[center_4%]"
          sizeConfig="hero"
        />
      )}

      {/* Navigation Arrows - Only show if multiple items */}
      {hasMultipleItems && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Indicator Dots */}
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
