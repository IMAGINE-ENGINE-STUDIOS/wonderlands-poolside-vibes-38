import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Eye,
  Package
} from 'lucide-react';

interface PoolProduct {
  id: string;
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact' | 'screen-enclosures';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  galaPoints?: number;
  galaCategory?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  heater?: boolean;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  order: number;
  isActive: boolean;
}

export const ProductCardManager = () => {
  const [products, setProducts] = useState<PoolProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PoolProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Load products from localStorage or API
    const savedProducts = localStorage.getItem('poolProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Initialize with default products
      const defaultProducts: PoolProduct[] = [
        {
          id: '1',
          model: 'Astoria 12',
          price: 111000,
          category: 'premium',
          dimensions: "12′ × 26′",
          depth: "3′ 6″ to 5′ 6″",
          galaPoints: 11100,
          galaCategory: "Luxury Collection",
          installationTimeWeeks: 6,
          warrantyYears: "Lifetime",
          features: ["LED Lighting", "Premium Finish", "Advanced Filtration"],
          heater: true,
          saltSystem: true,
          carbonFiber: true,
          order: 1,
          isActive: true
        },
        {
          id: '2',
          model: 'Apollo 14',
          price: 98500,
          category: 'premium',
          dimensions: "14′ × 30′",
          depth: "4′ 6″ to 6′",
          galaPoints: 9850,
          galaCategory: "Luxury Collection",
          installationTimeWeeks: 6,
          warrantyYears: "Lifetime",
          features: ["Smart Pool Technology", "Energy Efficient", "Premium Materials"],
          heater: true,
          saltSystem: true,
          carbonFiber: true,
          order: 2,
          isActive: true
        }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('poolProducts', JSON.stringify(defaultProducts));
    }
  }, []);

  const saveProducts = (updatedProducts: PoolProduct[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('poolProducts', JSON.stringify(updatedProducts));
  };

  const handleCreateProduct = () => {
    const newProduct: PoolProduct = {
      id: Date.now().toString(),
      model: '',
      price: 0,
      category: 'standard',
      order: products.length + 1,
      isActive: true,
      features: []
    };
    setSelectedProduct(newProduct);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEditProduct = (product: PoolProduct) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveProduct = (product: PoolProduct) => {
    if (isCreating) {
      const updatedProducts = [...products, product];
      saveProducts(updatedProducts);
      toast({
        title: "Product Created",
        description: `${product.model} has been added to the catalog.`
      });
    } else {
      const updatedProducts = products.map(p => p.id === product.id ? product : p);
      saveProducts(updatedProducts);
      toast({
        title: "Product Updated",
        description: `${product.model} has been updated successfully.`
      });
    }
    setIsEditing(false);
    setIsCreating(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    saveProducts(updatedProducts);
    toast({
      title: "Product Deleted",
      description: "Product has been removed from the catalog."
    });
  };

  const handleMoveProduct = (productId: string, direction: 'up' | 'down') => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const newProducts = [...products];
    const targetIndex = direction === 'up' ? productIndex - 1 : productIndex + 1;

    if (targetIndex >= 0 && targetIndex < products.length) {
      [newProducts[productIndex], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[productIndex]];
      
      // Update order numbers
      newProducts.forEach((product, index) => {
        product.order = index + 1;
      });

      saveProducts(newProducts);
      toast({
        title: "Order Updated",
        description: `Product order has been changed.`
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-gradient-to-r from-coral to-orange';
      case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
      case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
      case 'compact': return 'bg-gradient-to-r from-teal to-primary';
      case 'screen-enclosures': return 'bg-gradient-to-r from-orange to-coral';
      default: return 'bg-gradient-to-r from-primary to-teal';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pool Product Manager
            </div>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Catalog ({products.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {products.map((product, index) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">#{product.order}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.model || 'Untitled Product'}</h4>
                            <Badge className={`${getCategoryColor(product.category)} text-white text-xs`}>
                              {product.category}
                            </Badge>
                            {!product.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMoveProduct(product.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMoveProduct(product.id, 'down')}
                          disabled={index === products.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Product Editor */}
            <div>
              {isEditing && selectedProduct ? (
                <ProductEditor 
                  product={selectedProduct} 
                  onSave={handleSaveProduct}
                  onCancel={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setSelectedProduct(null);
                  }}
                  isCreating={isCreating}
                />
              ) : (
                <Card className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a product to edit or create a new one</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProductEditorProps {
  product: PoolProduct;
  onSave: (product: PoolProduct) => void;
  onCancel: () => void;
  isCreating: boolean;
}

const ProductEditor = ({ product, onSave, onCancel, isCreating }: ProductEditorProps) => {
  const [editedProduct, setEditedProduct] = useState<PoolProduct>(product);
  const [featuresText, setFeaturesText] = useState(product.features?.join(', ') || '');

  const handleSave = () => {
    const productToSave = {
      ...editedProduct,
      features: featuresText.split(',').map(f => f.trim()).filter(f => f.length > 0)
    };
    onSave(productToSave);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          {isCreating ? 'Create New Product' : 'Edit Product'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="model">Product Model</Label>
            <Input
              id="model"
              value={editedProduct.model}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, model: e.target.value }))}
              placeholder="e.g., Astoria 12"
            />
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={editedProduct.price}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={editedProduct.category} 
              onValueChange={(value: 'premium' | 'deluxe' | 'standard' | 'compact' | 'screen-enclosures') => 
                setEditedProduct(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="screen-enclosures">Screen Enclosures</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="galaCategory">GALA Category</Label>
            <Input
              id="galaCategory"
              value={editedProduct.galaCategory || ''}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, galaCategory: e.target.value }))}
              placeholder="e.g., Luxury Collection"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              value={editedProduct.dimensions || ''}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, dimensions: e.target.value }))}
              placeholder="e.g., 12′ × 26′"
            />
          </div>
          <div>
            <Label htmlFor="depth">Depth</Label>
            <Input
              id="depth"
              value={editedProduct.depth || ''}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, depth: e.target.value }))}
              placeholder="e.g., 3′ 6″ to 5′ 6″"
            />
          </div>
          <div>
            <Label htmlFor="installationWeeks">Installation Time (weeks)</Label>
            <Input
              id="installationWeeks"
              type="number"
              value={editedProduct.installationTimeWeeks || ''}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, installationTimeWeeks: Number(e.target.value) }))}
              placeholder="6"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Textarea
            id="features"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="LED Lighting, Premium Finish, Advanced Filtration"
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="galaPoints">GALA Points</Label>
            <Input
              id="galaPoints"
              type="number"
              value={editedProduct.galaPoints || ''}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, galaPoints: Number(e.target.value) }))}
              placeholder="11100"
            />
          </div>
          <div>
            <Label htmlFor="warranty">Warranty Years</Label>
            <Input
              id="warranty"
              value={editedProduct.warrantyYears || ''}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, warrantyYears: e.target.value }))}
              placeholder="Lifetime or 25"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editedProduct.heater || false}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, heater: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Heater Ready</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editedProduct.saltSystem || false}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, saltSystem: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Salt System Compatible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editedProduct.carbonFiber || false}
              onChange={(e) => setEditedProduct(prev => ({ ...prev, carbonFiber: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Carbon Fiber Technology</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardManager;