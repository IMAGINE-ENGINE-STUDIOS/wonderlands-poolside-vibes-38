import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save, X, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  image?: string;
  description?: string;
  features?: string[];
  stock: number;
  isActive: boolean;
  source?: string;
  sku?: string;
  material?: string;
  warranty?: string;
  installation?: string;
  collection?: string;
}

interface EditableProductCardProps {
  product: Product;
  onUpdate?: (updatedProduct: Product) => void;
}

const EditableProductCard = ({ product, onUpdate }: EditableProductCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pool: 'bg-blue-500',
      spa: 'bg-purple-500',
      liner: 'bg-green-500',
      tile: 'bg-orange-500',
      finish: 'bg-pink-500',
      tanning_ledge: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[category] || colors.other;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Determine which table to update based on source
      if (product.source === 'pools_table') {
        // Update pools table
        const { error } = await supabase
          .from('pools')
          .update({
            model: editedProduct.name,
            price: editedProduct.price,
            dimensions: editedProduct.description,
            warranty_years: editedProduct.warranty,
            installation_time_weeks: editedProduct.installation ? parseInt(editedProduct.installation.split(' ')[0]) : null,
          })
          .eq('id', product.id);
          
        if (error) throw error;
      } else {
        // Update products table
        const { error } = await supabase
          .from('products')
          .update({
            name: editedProduct.name,
            price: editedProduct.price,
            stock_quantity: editedProduct.stock,
            description: editedProduct.description,
            material: editedProduct.material,
            warranty_years_text: editedProduct.warranty,
            installation_time: editedProduct.installation,
            collection_name: editedProduct.collection,
          })
          .eq('id', product.id);
          
        if (error) throw error;
      }
      
      toast.success('Product updated successfully');
      onUpdate?.(editedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProduct({ ...product });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <Badge className={`absolute top-2 left-2 ${getCategoryColor(product.category)}`}>
          {product.category.replace('_', ' ')}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        {product.stock <= 5 && (
          <Badge variant="destructive" className="absolute bottom-2 left-2">
            Low Stock: {product.stock}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedProduct.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-lg font-semibold mb-2"
                placeholder="Product name"
              />
            ) : (
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
            )}
            <CardDescription className="text-sm">
              {product.subcategory && `${product.subcategory} • `}
              {product.sku}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editedProduct.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Product description"
              className="min-h-[60px]"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  value={editedProduct.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  value={editedProduct.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            
            {product.source !== 'pools_table' && (
              <>
                <Input
                  value={editedProduct.material || ''}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  placeholder="Material"
                />
                <Input
                  value={editedProduct.collection || ''}
                  onChange={(e) => handleInputChange('collection', e.target.value)}
                  placeholder="Collection"
                />
              </>
            )}
            
            <Input
              value={editedProduct.warranty || ''}
              onChange={(e) => handleInputChange('warranty', e.target.value)}
              placeholder="Warranty"
            />
            
            <Input
              value={editedProduct.installation || ''}
              onChange={(e) => handleInputChange('installation', e.target.value)}
              placeholder="Installation time"
            />

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>
            
            {product.features && product.features.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {product.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-2xl font-bold text-primary">${product.price.toLocaleString()}</span>
                {product.material && (
                  <p className="text-xs text-muted-foreground">{product.material}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Stock: {product.stock}</p>
                {product.warranty && (
                  <p className="text-xs text-muted-foreground">{product.warranty} warranty</p>
                )}
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                  <DialogDescription>{product.description}</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Badge className={getCategoryColor(product.category)}>
                        {product.category.replace('_', ' ')}
                      </Badge>
                      {product.subcategory && (
                        <Badge variant="outline">{product.subcategory}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">${product.price.toLocaleString()}</h3>
                      <p className="text-muted-foreground">{product.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Specifications:</h4>
                      <div className="space-y-2 text-sm">
                        {product.sku && <div><span className="font-medium">SKU:</span> {product.sku}</div>}
                        {product.material && <div><span className="font-medium">Material:</span> {product.material}</div>}
                        {product.warranty && <div><span className="font-medium">Warranty:</span> {product.warranty}</div>}
                        {product.installation && <div><span className="font-medium">Installation Time:</span> {product.installation}</div>}
                        {product.collection && <div><span className="font-medium">Collection:</span> {product.collection}</div>}
                        <div><span className="font-medium">Stock:</span> {product.stock} units</div>
                      </div>
                    </div>
                    
                    {product.features && product.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Features:</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EditableProductCard;