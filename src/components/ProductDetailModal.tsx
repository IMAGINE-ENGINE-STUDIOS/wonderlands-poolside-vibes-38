
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, DollarSign, Star } from "lucide-react";
import { openQuotePreview } from "@/utils/quoteNavigation";
import ImageCard from "./ImageCard";

interface Product {
  id: string;
  name?: string;
  model?: string;
  price: number;
  category: string;
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  type?: string;
  description?: string;
  specifications?: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote: (product: Product, extras?: any) => void;
}

const ProductDetailModal = ({ product, isOpen, onClose, onRequestQuote }: ProductDetailModalProps) => {
  if (!product) return null;

  const getCategoryColor = (category: string) => {
    const colors = {
      premium: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      deluxe: 'bg-gradient-to-r from-purple-500 to-pink-500',
      standard: 'bg-gradient-to-r from-blue-500 to-teal-500',
      compact: 'bg-gradient-to-r from-green-500 to-emerald-500',
      default: 'bg-gradient-to-r from-primary to-teal'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${getCategoryColor(product.category)} text-white capitalize font-medium px-3 py-1`}>
              {product.category}
            </Badge>
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? "currentColor" : "none"} />
              ))}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">{product.name || product.model}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="w-full h-80 bg-gradient-to-br from-primary/20 to-teal/20 rounded-lg overflow-hidden">
              {product.image ? (
                <ImageCard 
                  src={product.image} 
                  alt={product.name || product.model || 'Product'}
                  className="w-full h-full object-cover"
                  enableZoom={false}
                  objectFit="cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={80} className="text-primary/60" />
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Price */}
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-teal" />
              <span className="text-3xl font-bold text-foreground">
                ${product.price.toLocaleString()}
              </span>
            </div>

            <Separator />

            {/* Specifications */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Specifications</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {product.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">{product.dimensions}</span>
                  </div>
                )}
                {product.specifications && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specifications:</span>
                    <span className="font-medium">{product.specifications}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </>
            )}

            {/* Action Button */}
            <div className="pt-6">
              <Button 
                onClick={() => openQuotePreview({ type: 'product', product })}
                variant="gradient"
                size="lg"
                className="w-full hover:scale-105 transition-all duration-300"
              >
                Request Quote for {product.name || product.model}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
