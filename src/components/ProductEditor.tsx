import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Save, Upload } from "lucide-react";
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

interface ProductEditorProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ProductEditor = ({ product, isOpen, onClose, onSave }: ProductEditorProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'other',
    subcategory: product?.subcategory || '',
    price: product?.price?.toString() || '',
    image: product?.image || '',
    description: product?.description || '',
    features: product?.features || [],
    stock: product?.stock?.toString() || '0',
    isActive: product?.isActive ?? true,
    sku: product?.sku || '',
    material: product?.material || '',
    warranty: product?.warranty || '',
    installation: product?.installation || '',
    collection: product?.collection || '',
    newFeature: ''
  });

  const [loading, setLoading] = useState(false);

  const categories = ['pool', 'spa', 'liner', 'tile', 'tanning_ledge', 'finish', 'other'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (formData.newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, prev.newFeature.trim()],
        newFeature: ''
      }));
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory || null,
        price: parseFloat(formData.price),
        image_url: formData.image || null,
        description: formData.description || null,
        features_json: formData.features,
        stock_quantity: parseInt(formData.stock),
        is_active: formData.isActive,
        sku: formData.sku || null,
        material: formData.material || null,
        warranty_years_text: formData.warranty || null,
        installation_time: formData.installation || null,
        collection_name: formData.collection || null,
        source_api: 'admin_manual'
      };

      let error;

      if (product?.id) {
        // Update existing product
        const result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        error = result.error;
      } else {
        // Create new product
        const result = await supabase
          .from('products')
          .insert(productData);
        error = result.error;
      }

      if (error) throw error;

      toast.success(product?.id ? 'Product updated successfully' : 'Product created successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product?.id ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
          <DialogDescription>
            {product?.id ? 'Update product information' : 'Add a new product to the catalog'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  placeholder="Enter subcategory"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Product SKU"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Product description..."
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <Card>
                  <CardContent className="p-4">
                    <img
                      src={formData.image}
                      alt="Product preview"
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  placeholder="e.g., Fiberglass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  id="warranty"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  placeholder="e.g., 10 years"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installation">Installation Time</Label>
                <Input
                  id="installation"
                  value={formData.installation}
                  onChange={(e) => handleInputChange('installation', e.target.value)}
                  placeholder="e.g., 2-3 weeks"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection">Collection</Label>
                <Input
                  id="collection"
                  value={formData.collection}
                  onChange={(e) => handleInputChange('collection', e.target.value)}
                  placeholder="e.g., Premium Series"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature..."
                  value={formData.newFeature}
                  onChange={(e) => handleInputChange('newFeature', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active Product</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(value) => handleInputChange('isActive', value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {product?.id ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditor;