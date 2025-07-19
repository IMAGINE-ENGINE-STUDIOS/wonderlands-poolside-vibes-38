import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, DollarSign, Package } from "lucide-react";
import type { Product } from "./ProductCatalog";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
}

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

const ProductCard = ({ product, onViewDetails, onRequestQuote }: ProductCardProps) => {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${getCategoryColor(product.category)} text-white capitalize font-medium px-3 py-1`}>
            {product.category}
          </Badge>
        </div>
        
        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Image */}
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-teal/20 rounded-lg overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={48} className="text-primary/60" />
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-teal" />
          <span className="text-2xl font-bold text-foreground">
            {product.price.toLocaleString()}
          </span>
        </div>
        
        {/* Specifications */}
        {(product.dimensions || product.specifications) && (
          <div className="space-y-2 text-sm">
            {product.dimensions && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">{product.dimensions}</span>
              </div>
            )}
            {product.specifications && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specs:</span>
                <span className="font-medium">{product.specifications}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Features:</h4>
            <ul className="space-y-1">
              {product.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={() => onViewDetails(product)}
            variant="outline"
            className="flex-1 hover:scale-105 transition-all duration-300"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          <Button 
            onClick={() => onRequestQuote(product)}
            variant="gradient"
            className="flex-1 hover:scale-105 transition-all duration-300"
            size="sm"
          >
            Get Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;