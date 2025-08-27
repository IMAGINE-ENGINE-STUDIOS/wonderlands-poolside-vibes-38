import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageCardProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  enableZoom?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  src, 
  alt, 
  className = "", 
  objectFit = "cover",
  enableZoom = true 
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = () => {
    if (enableZoom) {
      setIsZoomed(true);
    }
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-transform duration-300",
          enableZoom && "cursor-pointer hover:scale-105",
          className
        )}
        style={{ objectFit }}
        onClick={handleImageClick}
      />

      {enableZoom && (
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{alt}</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ImageCard;