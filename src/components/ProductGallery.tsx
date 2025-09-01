import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Grid3X3 } from 'lucide-react';
import PoolProductCard from './PoolProductCard';
import SpaProductCard from './SpaProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  description?: string;
  model?: string;
  dimensions?: string;
  depth?: string;
  type?: string;
}

interface ProductGalleryProps {
  products: Product[];
  title?: string;
  columns?: number;
  isBuilderMode?: boolean;
  onAddProduct?: (product: Product) => void;
  onRemoveProduct?: (productId: string) => void;
  onProductClick?: (product: Product) => void;
  galleryType?: 'pools' | 'spas' | 'mixed';
  className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  products = [],
  title = "Product Gallery",
  columns = 3,
  isBuilderMode = false,
  onAddProduct,
  onRemoveProduct,
  onProductClick,
  galleryType = 'mixed',
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const productData = e.dataTransfer.getData('application/json');
      const product: Product = JSON.parse(productData);
      
      if (onAddProduct) {
        onAddProduct(product);
      }
    } catch (error) {
      console.error('Error parsing dropped product:', error);
    }
  };

  const getGridColumns = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const renderProductCard = (product: Product) => {
    const commonProps = {
      key: product.id,
      onViewDetails: () => onProductClick?.(product),
      onRequestQuote: () => {},
    };

    // Convert product to pool/spa format
    const poolProduct = {
      model: product.model || product.name,
      image: product.image_url || '',
      price: product.price,
      dimensions: product.dimensions || '',
      depth: product.depth || '',
      description: product.description || '',
      type: product.type || 'fiberglass',
      category: (product.category === 'premium' || product.category === 'deluxe' || 
                product.category === 'standard' || product.category === 'compact') 
                ? product.category as 'premium' | 'deluxe' | 'standard' | 'compact'
                : 'standard' as const
    };

    if (galleryType === 'spas') {
      return (
        <div className="relative group">
          <SpaProductCard
            {...commonProps}
            spa={poolProduct}
          />
          {isBuilderMode && onRemoveProduct && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemoveProduct(product.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="relative group">
        <PoolProductCard
          {...commonProps}
          pool={poolProduct}
        />
        {isBuilderMode && onRemoveProduct && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveProduct(product.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card 
      className={`${className} ${isDragOver ? 'border-primary bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            {title}
            <Badge variant="secondary">{products.length} items</Badge>
          </CardTitle>
          
          {isBuilderMode && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                Drop products here
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {products.length === 0 ? (
          <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center ${
            isDragOver ? 'border-primary bg-primary/5' : ''
          }`}>
            <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No products yet
            </h3>
            <p className="text-sm text-muted-foreground">
              {isBuilderMode ? 'Drag products from the toolbar to add them here' : 'Products will appear here when available'}
            </p>
          </div>
        ) : (
          <div className={`grid ${getGridColumns()} gap-6`}>
            {products.map(renderProductCard)}
          </div>
        )}
        
        {/* Drop zone indicator */}
        {isBuilderMode && isDragOver && (
          <div className="fixed inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50">
            <div className="text-center">
              <Plus className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold text-primary">Drop Product Here</h3>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductGallery;