import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Plus, Trash2, Image as ImageIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
  stock_quantity?: number;
  features?: string[];
  specifications?: Record<string, any>;
  options?: Array<{ name: string; price: number; description?: string }>;
  is_active: boolean;
}

interface EditableProductPreviewProps {
  product: Product;
  onUpdate: (updatedProduct: Product) => void;
  onClose: () => void;
}

const EditableProductPreview = ({ product, onUpdate, onClose }: EditableProductPreviewProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const [newOption, setNewOption] = useState({ name: '', price: 0, description: '' });
  const [showAddOption, setShowAddOption] = useState(false);
  const { toast } = useToast();

  const categories = [
    'pool', 'spa', 'liner', 'tile', 'finish', 'cover', 'heater', 'jets', 'accessories'
  ];

  const handleSave = () => {
    onUpdate(editedProduct);
    setEditMode(false);
    toast({
      title: "Product Updated",
      description: "Changes have been saved successfully",
      duration: 3000
    });
  };

  const handleAddOption = () => {
    if (newOption.name && newOption.price >= 0) {
      setEditedProduct(prev => ({
        ...prev,
        options: [...(prev.options || []), { ...newOption }]
      }));
      setNewOption({ name: '', price: 0, description: '' });
      setShowAddOption(false);
    }
  };

  const handleRemoveOption = (index: number) => {
    setEditedProduct(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {editMode ? 'Edit Product' : 'Product Preview'}
          </DialogTitle>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {editedProduct.image_url ? (
                <img 
                  src={editedProduct.image_url} 
                  alt={editedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            {editMode && (
              <Input
                placeholder="Image URL"
                value={editedProduct.image_url || ''}
                onChange={(e) => setEditedProduct(prev => ({ ...prev, image_url: e.target.value }))}
              />
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Name */}
            {editMode ? (
              <Input
                value={editedProduct.name}
                onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                className="text-xl font-bold"
              />
            ) : (
              <h2 className="text-2xl font-bold">{editedProduct.name}</h2>
            )}

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              {editMode ? (
                <Select 
                  value={editedProduct.category} 
                  onValueChange={(value) => setEditedProduct(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary">{editedProduct.category}</Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Price:</span>
              {editMode ? (
                <div className="flex items-center gap-1">
                  <span>$</span>
                  <Input
                    type="number"
                    value={editedProduct.price}
                    onChange={(e) => setEditedProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-32"
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  ${editedProduct.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stock:</span>
              {editMode ? (
                <Input
                  type="number"
                  value={editedProduct.stock_quantity}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                  className="w-32"
                />
              ) : (
                <Badge variant={editedProduct.stock_quantity > 0 ? "default" : "destructive"}>
                  {editedProduct.stock_quantity} in stock
                </Badge>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Description:</span>
              {editMode ? (
                <Textarea
                  value={editedProduct.description || ''}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              ) : (
                <p className="text-sm">{editedProduct.description || 'No description available'}</p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Features:</span>
              {editMode ? (
                <Textarea
                  placeholder="Enter features separated by commas"
                  value={editedProduct.features?.join(', ') || ''}
                  onChange={(e) => setEditedProduct(prev => ({ 
                    ...prev, 
                    features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                  }))}
                />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {editedProduct.features?.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">No features listed</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Options */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Product Options</h3>
            {editMode && (
              <Button 
                onClick={() => setShowAddOption(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          <div className="grid gap-3">
            {editedProduct.options?.map((option, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">
                      +${option.price.toLocaleString()}
                    </div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {editMode && (
                    <Button
                      onClick={() => handleRemoveOption(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            )) || (
              <div className="text-sm text-muted-foreground text-center py-4">
                No options available
              </div>
            )}
          </div>

          {/* Add Option Dialog */}
          <Dialog open={showAddOption} onOpenChange={setShowAddOption}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product Option</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Option name"
                  value={newOption.name}
                  onChange={(e) => setNewOption(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Additional price"
                  value={newOption.price}
                  onChange={(e) => setNewOption(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
                <Textarea
                  placeholder="Option description (optional)"
                  value={newOption.description}
                  onChange={(e) => setNewOption(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddOption(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddOption}>
                    Add Option
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditableProductPreview;