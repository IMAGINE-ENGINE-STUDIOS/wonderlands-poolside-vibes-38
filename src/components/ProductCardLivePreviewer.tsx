import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Edit, X, Upload, Waves, DollarSign, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  image_url?: string;
  description?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  gala_points?: number;
  gala_category?: string;
  installation_time_weeks?: number;
  warranty_years?: number | string;
  heater?: boolean;
  salt_system?: boolean;
  carbon_fiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  stock_quantity?: number;
  brand?: string;
  sku?: string;
  is_active: boolean;
  source?: string;
}

interface ProductCardLivePreviewerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export const ProductCardLivePreviewer = ({ product, isOpen, onClose, onSave }: ProductCardLivePreviewerProps) => {
  const [editedProduct, setEditedProduct] = useState<Product | null>(product);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setImagePreview(product.image_url || '');
    }
  }, [product]);

  if (!product || !editedProduct) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-gradient-to-r from-coral to-orange';
      case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
      case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
      case 'compact': return 'bg-gradient-to-r from-teal to-primary';
      case 'pools': return 'bg-gradient-to-r from-primary to-teal';
      default: return 'bg-gradient-to-r from-primary to-teal';
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    if (!editedProduct) return;
    
    setEditedProduct(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: keyof Product, value: string) => {
    if (!editedProduct) return;
    
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setEditedProduct(prev => ({
      ...prev!,
      [field]: arrayValue
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleInputChange('image_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editedProduct) return;

    try {
      let imageUrl = editedProduct.image_url;

      // Upload image if a new one was selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${editedProduct.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      // Update the product in the appropriate table
      const updateData = {
        ...editedProduct,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editedProduct.source === 'pools_table') {
        const { error: poolsError } = await supabase
          .from('pools')
          .update(updateData)
          .eq('id', editedProduct.id);
        error = poolsError;
      } else {
        const { error: productsError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', editedProduct.id);
        error = productsError;
      }

      if (error) throw error;

      onSave({
        ...updateData,
        warranty_years: String(updateData.warranty_years || '')
      });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Product updated successfully",
        duration: 3000
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product changes",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Product Card Live Previewer</DialogTitle>
          <div className="flex gap-2">
            <Button
              variant={isEditing ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            {isEditing && (
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Form */}
          {isEditing && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Edit Product</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={editedProduct.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editedProduct.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editedProduct.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={editedProduct.dimensions || ''}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="depth">Depth</Label>
                  <Input
                    id="depth"
                    value={editedProduct.depth || ''}
                    onChange={(e) => handleInputChange('depth', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="installation_time">Installation Time (weeks)</Label>
                  <Input
                    id="installation_time"
                    type="number"
                    value={editedProduct.installation_time_weeks || ''}
                    onChange={(e) => handleInputChange('installation_time_weeks', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="warranty">Warranty (years)</Label>
                  <Input
                    id="warranty"
                    value={editedProduct.warranty_years || ''}
                    onChange={(e) => handleInputChange('warranty_years', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    value={editedProduct.features?.join(', ') || ''}
                    onChange={(e) => handleArrayInputChange('features', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedProduct.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Product Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4" />
                  </div>
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
              {/* Product Image */}
              <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt={editedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
                    <Waves size={48} className="text-primary/60" />
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${getCategoryColor(editedProduct.category)} text-white capitalize font-medium px-3 py-1`}>
                    {editedProduct.category}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                {/* Product Name */}
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {editedProduct.name}
                  </h3>
                  {editedProduct.gala_category && (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {editedProduct.gala_category}
                    </Badge>
                  )}
                </div>
                
                {/* Price */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                    ${editedProduct.price.toLocaleString()}
                  </span>
                </div>
                
                {/* Basic Info */}
                <div className="text-sm text-muted-foreground space-y-1">
                  {editedProduct.dimensions && <p>Size: {editedProduct.dimensions}</p>}
                  {editedProduct.depth && <p>Depth: {editedProduct.depth}</p>}
                  {editedProduct.installation_time_weeks && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Installation: {editedProduct.installation_time_weeks} weeks</span>
                    </div>
                  )}
                  {editedProduct.warranty_years && (
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>Warranty: {editedProduct.warranty_years}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {editedProduct.features && editedProduct.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="space-y-1">
                      {editedProduct.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Description */}
                {editedProduct.description && (
                  <div className="space-y-2">
                    <Separator />
                    <p className="text-sm text-muted-foreground">
                      {editedProduct.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button className="flex-1">
                    Get Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCardLivePreviewer;