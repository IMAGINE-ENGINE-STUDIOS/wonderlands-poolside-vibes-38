import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import ProductOptionsManager, { ProductCategory } from './ProductOptionsManager';
import { Edit, ShoppingCart, DollarSign, Waves } from 'lucide-react';
import { useShoppingCart } from './ShoppingCart';

interface SmartProductCardProps {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image?: string;
  description?: string;
  dimensions?: string;
  features?: string[];
  collection?: string;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
}

const getCategoryColor = (category: ProductCategory) => {
  switch (category) {
    case 'pool': return 'bg-gradient-to-r from-blue-500 to-teal-500';
    case 'spa': return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'tanning-ledge': return 'bg-gradient-to-r from-orange-500 to-yellow-500';
    case 'finish': return 'bg-gradient-to-r from-emerald-500 to-cyan-500';
    case 'liner': return 'bg-gradient-to-r from-indigo-500 to-purple-500';
    case 'cover': return 'bg-gradient-to-r from-gray-500 to-slate-500';
    case 'paver': return 'bg-gradient-to-r from-amber-500 to-orange-500';
    case 'coping': return 'bg-gradient-to-r from-stone-500 to-neutral-500';
    case 'tile': return 'bg-gradient-to-r from-rose-500 to-pink-500';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getCategoryLabel = (category: ProductCategory) => {
  switch (category) {
    case 'tanning-ledge': return 'Tanning Ledge';
    default: return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

const getAvailableOptionsLabel = (category: ProductCategory) => {
  switch (category) {
    case 'pool':
    case 'spa':
    case 'tanning-ledge':
      return 'Full customization available';
    case 'finish':
    case 'liner':
      return 'Alternative options available';
    case 'cover':
      return 'Color, motor & encasement options';
    case 'paver':
    case 'coping':
      return 'Shape, size & color options';
    case 'tile':
      return 'Material & pattern options';
    default:
      return 'Options available';
  }
};

const SmartProductCard = ({ 
  id, 
  name, 
  price, 
  category, 
  image, 
  description, 
  dimensions, 
  features,
  collection,
  isAdmin = false,
  onEdit 
}: SmartProductCardProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [totalPrice, setTotalPrice] = useState(price);
  const { addToCart } = useShoppingCart();

  const handleOptionsChange = (options: any) => {
    setSelectedOptions(options);
    // Calculate price changes based on options
    let calculatedPrice = price;
    
    // Add option-specific pricing logic here
    if (options.surfaceArea && (category === 'paver' || category === 'coping')) {
      calculatedPrice += parseFloat(options.surfaceArea) * 15;
    }
    
    setTotalPrice(calculatedPrice);
  };

  const handleAddToCart = () => {
    addToCart({
      id: `${category}_${id}_${Date.now()}`,
      name: name,
      price: totalPrice,
      category: category,
      image: image,
      extras: selectedOptions ? [{ name: 'Custom Options', price: totalPrice - price }] : []
    });
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/40 overflow-hidden">
        {/* Product Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image">
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
              <Waves size={48} className="text-primary/60" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getCategoryColor(category)} text-white capitalize font-medium px-3 py-1`}>
              {getCategoryLabel(category)}
            </Badge>
          </div>

          {/* Admin Edit Button */}
          {isAdmin && onEdit && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
              onClick={() => onEdit(id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            
            {collection && (
              <Badge variant="secondary" className="text-xs font-semibold">
                {collection}
              </Badge>
            )}

            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            {dimensions && (
              <p className="text-xs text-muted-foreground font-medium">
                Dimensions: {dimensions}
              </p>
            )}
          </div>

          {/* Features */}
          {features && features.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key Features</h4>
              <div className="flex flex-wrap gap-1">
                {features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">
                ${totalPrice.toLocaleString()}
              </span>
              {totalPrice !== price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Available Options Info */}
          <div className="text-xs text-primary font-medium">
            {getAvailableOptionsLabel(category)}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => setShowOptions(true)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Editor Studio
            </Button>
            <Button 
              onClick={handleAddToCart}
              variant="default"
              className="flex-1"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Options Dialog */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
              {name} - Configuration Options
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <ProductOptionsManager 
              productType={category}
              productName={name}
              onOptionsChange={handleOptionsChange}
            />
            
            <Separator />
            
            {/* Price Summary */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h4 className="font-semibold">Total Price</h4>
                <p className="text-sm text-muted-foreground">
                  Including selected options
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${totalPrice.toLocaleString()}
                </div>
                {totalPrice !== price && (
                  <div className="text-sm text-muted-foreground">
                    Base: ${price.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowOptions(false)}
              >
                Close
              </Button>
              <Button 
                className="flex-1"
              onClick={() => {
                handleAddToCart();
                setShowOptions(false);
              }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart with Options
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartProductCard;