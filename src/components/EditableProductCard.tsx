import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save, X, Package, Upload, Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Clock, Award } from "lucide-react";
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
  // Pool-specific fields that match PoolProductCard
  model?: string;
  dimensions?: string;
  depth?: string;
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
  // Additional product fields
  brand?: string;
  pattern?: string;
  motorType?: string;
  durability?: number;
  benefits?: string[];
  typeCategory?: string;
  collectionName?: string;
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
      pool: 'bg-gradient-to-r from-coral to-orange',
      spa: 'bg-gradient-to-r from-purple-500 to-pink-500',
      liner: 'bg-gradient-to-r from-green-500 to-teal-500',
      tile: 'bg-gradient-to-r from-orange-500 to-red-500',
      finish: 'bg-gradient-to-r from-pink-500 to-purple-500',
      tanning_ledge: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      premium: 'bg-gradient-to-r from-coral to-orange',
      deluxe: 'bg-gradient-to-r from-primary to-teal',
      standard: 'bg-gradient-to-r from-secondary to-accent',
      compact: 'bg-gradient-to-r from-teal to-primary',
      other: 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[category] || colors.other;
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setEditedProduct(prev => ({ ...prev, image: base64String }));
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (product.source === 'pools_table') {
        // Update pools table with all pool-specific fields
        const { error } = await supabase
          .from('pools')
          .update({
            model: editedProduct.name,
            price: editedProduct.price,
            category: editedProduct.subcategory || editedProduct.category,
            image_url: editedProduct.image,
            dimensions: editedProduct.dimensions,
            depth: editedProduct.depth,
            features: editedProduct.features || [],
            gala_points: editedProduct.galaPoints,
            gala_category: editedProduct.galaCategory,
            installation_time_weeks: editedProduct.installationTimeWeeks,
            warranty_years: String(editedProduct.warrantyYears || ''),
            heater: editedProduct.heater || false,
            salt_system: editedProduct.saltSystem || false,
            carbon_fiber: editedProduct.carbonFiber || false,
            finishes: editedProduct.finishes || [],
            liners: editedProduct.liners || [],
            covers: editedProduct.covers || []
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
            category: editedProduct.category,
            subcategory: editedProduct.subcategory,
            image_url: editedProduct.image,
            brand: editedProduct.brand,
            sku: editedProduct.sku,
            material: editedProduct.material,
            warranty_years_text: editedProduct.warranty,
            installation_time: editedProduct.installation,
            collection_name: editedProduct.collection,
            pattern: editedProduct.pattern,
            motor_type: editedProduct.motorType,
            durability: editedProduct.durability,
            benefits: editedProduct.benefits || [],
            type_category: editedProduct.typeCategory,
            features_json: editedProduct.features || []
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

  // Helper function to render array fields as editable tags
  const renderArrayEditor = (label: string, value: string[], onChange: (newValue: string[]) => void) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {item}
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder={`Add ${label.toLowerCase()}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const input = e.currentTarget;
            if (input.value.trim()) {
              onChange([...value, input.value.trim()]);
              input.value = '';
            }
          }
        }}
      />
    </div>
  );

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Pool Image - matches PoolProductCard exactly */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image">
        {editedProduct.image ? (
          <img 
            src={editedProduct.image} 
            alt={editedProduct.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
            <Waves size={48} className="text-primary/60" />
          </div>
        )}
        
        {/* Category Badge overlay - matches PoolProductCard */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(product.category)} text-white capitalize font-medium px-3 py-1`}>
            {product.category}
          </Badge>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            {isEditing ? 'Editing Mode' : 'Click to Edit'}
          </div>
        </div>
        
        {/* Edit/Upload Button */}
        <div className="absolute top-2 right-2 flex gap-1">
          {isEditing && (
            <label htmlFor="image-upload" className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-3 w-3" />
                </span>
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        
        {product.stock <= 5 && (
          <Badge variant="destructive" className="absolute bottom-2 left-2">
            Low Stock: {product.stock}
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Product Name - matches PoolProductCard style */}
        {isEditing ? (
          <Input
            value={editedProduct.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="text-lg sm:text-xl font-bold"
            placeholder="Product/Pool name"
          />
        ) : (
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        )}
        
        {/* Price - matches PoolProductCard style */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
          {isEditing ? (
            <Input
              type="number"
              value={editedProduct.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className="text-lg sm:text-xl lg:text-2xl font-bold max-w-32"
              placeholder="0.00"
            />
          ) : (
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4 animate-fade-in-up">
            <Separator />
            
            {/* Basic Product Info */}
            <Textarea
              value={editedProduct.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Product description"
              className="min-h-[60px]"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input
                  type="number"
                  value={editedProduct.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={editedProduct.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="SKU"
                />
              </div>
            </div>

            {/* Pool-specific fields */}
            {product.source === 'pools_table' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Dimensions</label>
                    <Input
                      value={editedProduct.dimensions || ''}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      placeholder="e.g., 16' x 32'"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Depth</label>
                    <Input
                      value={editedProduct.depth || ''}
                      onChange={(e) => handleInputChange('depth', e.target.value)}
                      placeholder="e.g., 3'6&quot; - 6'6&quot;"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm font-medium">Installation (weeks)</label>
                    <Input
                      type="number"
                      value={editedProduct.installationTimeWeeks || ''}
                      onChange={(e) => handleInputChange('installationTimeWeeks', parseInt(e.target.value) || undefined)}
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Warranty</label>
                    <Input
                      value={editedProduct.warrantyYears || ''}
                      onChange={(e) => handleInputChange('warrantyYears', e.target.value)}
                      placeholder="Lifetime"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">GALA Points</label>
                    <Input
                      type="number"
                      value={editedProduct.galaPoints || ''}
                      onChange={(e) => handleInputChange('galaPoints', parseInt(e.target.value) || undefined)}
                      placeholder="500"
                    />
                  </div>
                </div>

                {/* Pool Features */}
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={editedProduct.heater || false}
                        onCheckedChange={(checked) => handleInputChange('heater', checked)}
                      />
                      <Thermometer className="h-4 w-4" />
                      <span className="text-sm">Heater</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={editedProduct.saltSystem || false}
                        onCheckedChange={(checked) => handleInputChange('saltSystem', checked)}
                      />
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm">Salt System</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={editedProduct.carbonFiber || false}
                        onCheckedChange={(checked) => handleInputChange('carbonFiber', checked)}
                      />
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Carbon Fiber</span>
                    </label>
                  </div>
                </div>

                {/* Array fields for pool */}
                {renderArrayEditor('Features', editedProduct.features || [], (newFeatures) => 
                  handleInputChange('features', newFeatures)
                )}
                {renderArrayEditor('Finishes', editedProduct.finishes || [], (newFinishes) => 
                  handleInputChange('finishes', newFinishes)
                )}
                {renderArrayEditor('Liners', editedProduct.liners || [], (newLiners) => 
                  handleInputChange('liners', newLiners)
                )}
                {renderArrayEditor('Covers', editedProduct.covers || [], (newCovers) => 
                  handleInputChange('covers', newCovers)
                )}
              </>
            )}

            {/* Product-specific fields */}
            {product.source !== 'pools_table' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Material</label>
                    <Input
                      value={editedProduct.material || ''}
                      onChange={(e) => handleInputChange('material', e.target.value)}
                      placeholder="Material"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Brand</label>
                    <Input
                      value={editedProduct.brand || ''}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Brand"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Collection</label>
                    <Input
                      value={editedProduct.collection || ''}
                      onChange={(e) => handleInputChange('collection', e.target.value)}
                      placeholder="Collection"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pattern</label>
                    <Input
                      value={editedProduct.pattern || ''}
                      onChange={(e) => handleInputChange('pattern', e.target.value)}
                      placeholder="Pattern"
                    />
                  </div>
                </div>

                {renderArrayEditor('Features', editedProduct.features || [], (newFeatures) => 
                  handleInputChange('features', newFeatures)
                )}
                {renderArrayEditor('Benefits', editedProduct.benefits || [], (newBenefits) => 
                  handleInputChange('benefits', newBenefits)
                )}
              </>
            )}
            
            <Input
              value={editedProduct.warranty || ''}
              onChange={(e) => handleInputChange('warranty', e.target.value)}
              placeholder="Warranty information"
            />
            
            <Input
              value={editedProduct.installation || ''}
              onChange={(e) => handleInputChange('installation', e.target.value)}
              placeholder="Installation time"
            />

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Features & Tech - matches PoolProductCard */}
            <div className="space-y-2">
              {product.saltSystem && (
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-teal" />
                  <span className="font-medium">Salt system included</span>
                </div>
              )}
              {product.carbonFiber && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">Carbon Fiber Technology</span>
                </div>
              )}
              {product.heater && (
                <div className="flex items-center gap-2 text-sm">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Heater Ready</span>
                </div>
              )}
            </div>

            {/* Basic Info - matches PoolProductCard */}
            <div className="text-sm text-muted-foreground space-y-1">
              {product.dimensions && <p>Dimensions: {product.dimensions}</p>}
              {product.depth && <p>Depth: {product.depth}</p>}
              {product.source === 'pools_table' && <p>Includes: 3 ft perimeter pavers around pool area</p>}
              {product.installationTimeWeeks && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Installation: {product.installationTimeWeeks} weeks</span>
                </div>
              )}
              {(product.warrantyYears || product.warranty) && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span className="font-bold text-primary">
                    Warranty: {product.warrantyYears === "Lifetime" || product.warrantyYears === "Life" || product.warranty?.includes("Lifetime") 
                      ? "LIFETIME WARRANTY" 
                      : `${product.warrantyYears || product.warranty}`}
                  </span>
                </div>
              )}
              <p className="text-sm font-medium">Stock: {product.stock} units available</p>
            </div>
            
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
                        {product.dimensions && <div><span className="font-medium">Dimensions:</span> {product.dimensions}</div>}
                        {product.depth && <div><span className="font-medium">Depth:</span> {product.depth}</div>}
                        {product.material && <div><span className="font-medium">Material:</span> {product.material}</div>}
                        {(product.warranty || product.warrantyYears) && <div><span className="font-medium">Warranty:</span> {product.warranty || product.warrantyYears}</div>}
                        {(product.installation || product.installationTimeWeeks) && <div><span className="font-medium">Installation:</span> {product.installation || `${product.installationTimeWeeks} weeks`}</div>}
                        {(product.collection || product.collectionName) && <div><span className="font-medium">Collection:</span> {product.collection || product.collectionName}</div>}
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