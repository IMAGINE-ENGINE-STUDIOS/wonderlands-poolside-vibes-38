import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  productName: string;
  productPrice?: number;
  productDescription?: string;
}

export const ProductImageModal = ({
  isOpen,
  onClose,
  imageSrc,
  productName,
  productPrice,
  productDescription,
}: ProductImageModalProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to trigger close
  const minSwipeDistance = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientY;
    setTouchEnd(currentTouch);
    
    if (touchStart !== null) {
      const distance = currentTouch - touchStart;
      // Only track downward swipes
      if (distance > 0) {
        setSwipeDistance(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeDistance(0);
      return;
    }
    
    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > minSwipeDistance;
    
    if (isDownSwipe) {
      onClose();
    }
    
    setSwipeDistance(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div 
          ref={contentRef}
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: swipeDistance > 0 ? `translateY(${swipeDistance}px)` : 'none',
            transition: swipeDistance === 0 ? 'transform 0.3s ease-out' : 'none',
            opacity: swipeDistance > 0 ? Math.max(1 - (swipeDistance / 300), 0.5) : 1,
          }}
        >
          {/* Close button - prominent in right corner */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm hover:bg-background border-2 border-border shadow-lg h-10 w-10 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>

          {/* Image */}
          <div className="relative w-full aspect-square bg-muted">
            <img loading="lazy" decoding="async"
              src={imageSrc}
              alt={productName}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Product info */}
          <div className="p-6 space-y-2 bg-background">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {productName}
              </DialogTitle>
            </DialogHeader>
            
            {productPrice !== undefined && productPrice > 0 && (
              <p className="text-xl font-semibold text-primary">
                ${productPrice.toLocaleString()}
              </p>
            )}
            
            {productDescription && (
              <p className="text-sm text-muted-foreground">
                {productDescription}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
