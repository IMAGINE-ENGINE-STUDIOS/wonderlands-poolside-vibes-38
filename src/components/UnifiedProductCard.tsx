import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Eye, Package } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';

interface UnifiedProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    subcategory?: string;
    image?: string;
    description?: string;
    features?: string[];
    specifications?: string;
    dimensions?: string;
    brand?: string;
    warranty?: string | number;
    popular?: boolean;
    stockQuantity?: number;
  };
  onViewDetails?: (product: any) => void;
  onRequestQuote?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

const UnifiedProductCard = ({ 
  product, 
  onViewDetails, 
  onRequestQuote, 
  onAddToCart,
  variant = 'default' 
}: UnifiedProductCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'pools':
        return 'bg-blue-500';
      case 'maintenance':
        return 'bg-orange-500';
      case 'outdoors':
        return 'bg-green-500';
      case 'finishes':
        return 'bg-purple-500';
      case 'liners':
        return 'bg-teal-500';
      case 'covers':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg truncate">{product.name}</h3>
            {product.popular && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${getCategoryColor(product.category)} text-white text-xs`}>
              {product.category}
            </Badge>
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails?.(product)} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <StripeCheckoutButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              variant="default"
              size="sm"
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
            {product.brand && (
              <p className="text-sm text-muted-foreground">{product.brand}</p>
            )}
          </div>
          {product.popular && (
            <Star className="h-5 w-5 text-yellow-500 fill-current ml-2" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Badge className={`${getCategoryColor(product.category)} text-white`}>
            {product.category}
          </Badge>
          {product.subcategory && (
            <Badge variant="outline" className="text-xs">
              {product.subcategory}
            </Badge>
          )}
        </div>

        <div className="text-2xl font-bold text-primary">
          {formatPrice(product.price)}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Product Image */}
        {product.image && (
          <div className="w-full h-40 bg-muted rounded-lg mb-4 overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-muted">
                    <div class="text-center text-muted-foreground">
                      <div class="w-12 h-12 mx-auto mb-2 opacity-50">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <p class="text-xs">No Image</p>
                    </div>
                  </div>
                `;
              }}
            />
          </div>
        )}

        {/* Specifications */}
        {(product.dimensions || product.specifications) && (
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Specifications</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {product.dimensions && (
                <div>Dimensions: {product.dimensions}</div>
              )}
              {product.specifications && (
                <div>{product.specifications}</div>
              )}
              {product.warranty && (
                <div>Warranty: {product.warranty}</div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 4).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {product.features.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.features.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && variant === 'detailed' && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {product.description}
            </p>
          </div>
        )}

        {/* Stock Status */}
        {product.stockQuantity !== undefined && (
          <div className="mb-4">
            <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails?.(product)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {onRequestQuote && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRequestQuote(product)}
                className="flex-1"
              >
                Get Quote
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {onAddToCart && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAddToCart(product)}
                className="flex-1"
                disabled={product.stockQuantity === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            )}
            
            <StripeCheckoutButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              variant="default"
              size="sm"
              className="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedProductCard;