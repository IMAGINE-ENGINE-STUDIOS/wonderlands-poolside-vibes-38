import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative">
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
            <img
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
