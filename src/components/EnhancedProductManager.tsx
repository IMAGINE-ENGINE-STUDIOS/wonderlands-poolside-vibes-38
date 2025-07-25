import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Package,
  Waves,
  Car,
  Wrench,
  Monitor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PoolProductCard from './PoolProductCard';
import ProductCard from './ProductCard';

type ProductCategory = 'outdoors' | 'pools' | 'maintenance';

interface Product {
  id: string;
  name: string;
  model?: string;
  price: number;
  category: ProductCategory;
  subcategory?: string;
  image?: string;
  description?: string;
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
  stockQuantity?: number;
  brand?: string;
  sku?: string;
  order: number;
  isActive: boolean;
}

export const EnhancedProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'all'>('all');
  const { toast } = useToast();

  // Load products from both localStorage and Supabase
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Load all pools from PoolCatalog.tsx
    const poolsFromCatalog = [
      { 
        model: "Astoria 12", 
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
        carbonFiber: true
      },
      { 
        model: "Apollo 14", 
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
        carbonFiber: true
      },
      { 
        model: "Coral 16", 
        price: 96400, 
        category: 'premium', 
        dimensions: "16′ × 32′",
        depth: "3′ 6″ to 6′",
        galaPoints: 9640,
        galaCategory: "Luxury Collection",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime",
        features: ["Spacious Design", "Coral Reef Finish", "Built-in Steps"],
        heater: true,
        saltSystem: true,
        carbonFiber: true
      },
      { 
        model: "Ariel 16", 
        price: 102000, 
        category: 'premium', 
        dimensions: "16′ × 34′",
        depth: "3′ 6″ to 6′ 6″",
        galaPoints: 10200,
        galaCategory: "Luxury Collection",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime",
        features: ["Auto Cover Ready", "Multiple Entry Points", "Premium Design"],
        heater: true,
        saltSystem: true,
        carbonFiber: true
      },
      { 
        model: "Valencia", 
        price: 65500, 
        category: 'standard',
        dimensions: "14′ 6″ × 28′",
        depth: "3′ 7″ to 5′ 10″",
        galaPoints: 1965,
        galaCategory: "Classic Series",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      },
      { 
        model: "Cape Cod", 
        price: 58900, 
        category: 'standard',
        dimensions: "14′ × 28′",
        depth: "3′ 6″ to 5′ 6″",
        galaPoints: 1767,
        galaCategory: "Classic Series",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      },
      { 
        model: "St. Lucia", 
        price: 72500, 
        category: 'standard',
        dimensions: "16′ × 32′",
        depth: "3′ 6″ to 6′",
        galaPoints: 2175,
        galaCategory: "Classic Series",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      },
      { 
        model: "Synergy", 
        price: 68900, 
        category: 'standard',
        dimensions: "16′ × 30′",
        depth: "3′ 6″ to 6′",
        galaPoints: 2067,
        galaCategory: "Classic Series",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      },
      { 
        model: "Bermuda", 
        price: 78500, 
        category: 'deluxe',
        dimensions: "16′ × 34′",
        depth: "3′ 6″ to 6′",
        galaPoints: 3925,
        galaCategory: "Executive Series",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      },
      { 
        model: "Fiji", 
        price: 71200, 
        category: 'standard',
        dimensions: "14′ × 30′",
        depth: "3′ 6″ to 6′",
        galaPoints: 2136,
        galaCategory: "Classic Series",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      },
      { 
        model: "Genesis", 
        price: 85400, 
        category: 'deluxe',
        dimensions: "16′ × 36′",
        depth: "3′ 6″ to 6′",
        galaPoints: 4270,
        galaCategory: "Executive Series",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      },
      { 
        model: "Jamaica", 
        price: 46100, 
        category: 'compact',
        dimensions: "10′ × 20′",
        depth: "4′ 6″ to 5′ 6″",
        galaPoints: 922,
        galaCategory: "Compact Collection",
        installationTimeWeeks: 6,
        warrantyYears: "Lifetime"
      }
    ];

    // Convert pools to unified product format
    let localProducts: Product[] = poolsFromCatalog.map((pool: any, index: number) => ({
      id: `pool_${index + 1}`,
      name: pool.model,
      model: pool.model,
      price: pool.price,
      category: 'pools' as ProductCategory,
      subcategory: 'pools',
      dimensions: pool.dimensions,
      depth: pool.depth,
      features: pool.features || [],
      galaPoints: pool.galaPoints,
      galaCategory: pool.galaCategory,
      installationTimeWeeks: pool.installationTimeWeeks,
      warrantyYears: pool.warrantyYears,
      heater: pool.heater || false,
      saltSystem: pool.saltSystem || false,
      carbonFiber: pool.carbonFiber || false,
      finishes: pool.finishes || [],
      liners: pool.liners || [],
      covers: pool.covers || [],
      order: index + 1,
      isActive: true
    }));

    // Add sample maintenance products
    const maintenanceProducts: Product[] = [
      {
        id: 'maint_1',
        name: 'Pool Chlorine Tablets',
        price: 45,
        category: 'maintenance',
        subcategory: 'chemicals',
        description: 'High-quality chlorine tablets for pool sanitization',
        brand: 'AquaChem',
        sku: 'AC-CHLOR-50',
        stockQuantity: 120,
        features: ['Slow dissolving', '99% active chlorine', 'Stabilized'],
        order: localProducts.length + 1,
        isActive: true
      },
      {
        id: 'maint_2',
        name: 'Pool Vacuum Head',
        price: 89,
        category: 'maintenance',
        subcategory: 'cleaning',
        description: 'Professional-grade vacuum head for thorough pool cleaning',
        brand: 'Pentair',
        sku: 'PEN-VAC-HD',
        stockQuantity: 45,
        features: ['Wide cleaning path', 'Durable construction', 'Universal fit'],
        order: localProducts.length + 2,
        isActive: true
      }
    ];

    // Add sample outdoor products
    const outdoorProducts: Product[] = [
      {
        id: 'outdoor_1',
        name: 'Pool Deck Chairs (Set of 4)',
        price: 299,
        category: 'outdoors',
        subcategory: 'furniture',
        description: 'Weather-resistant pool deck lounge chairs',
        brand: 'OutdoorLux',
        sku: 'OL-CHAIR-4SET',
        stockQuantity: 25,
        features: ['UV resistant', 'Adjustable backrest', 'Quick dry fabric'],
        order: localProducts.length + 3,
        isActive: true
      },
      {
        id: 'outdoor_2',
        name: 'Pool Umbrella - Large',
        price: 159,
        category: 'outdoors',
        subcategory: 'shade',
        description: '12ft tilting pool umbrella with wind vent',
        brand: 'SunShade',
        sku: 'SS-UMB-12',
        stockQuantity: 18,
        features: ['12ft diameter', 'Tilt mechanism', 'Fade resistant'],
        order: localProducts.length + 4,
        isActive: true
      }
    ];

    localProducts = [...localProducts, ...maintenanceProducts, ...outdoorProducts];

    // Load from Supabase for pools table
    try {
      const { data: poolsData, error } = await (supabase as any)
        .from('pools')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && poolsData) {
        const supabasePools = poolsData.map((pool: any, index: number) => ({
          id: pool.id,
          name: pool.model,
          model: pool.model,
          price: pool.price,
          category: 'pools' as ProductCategory,
          subcategory: 'pools',
          dimensions: pool.dimensions,
          depth: pool.depth,
          features: pool.features || [],
          galaPoints: pool.gala_points,
          galaCategory: pool.gala_category,
          installationTimeWeeks: pool.installation_time_weeks,
          warrantyYears: pool.warranty_years,
          heater: pool.heater,
          saltSystem: pool.salt_system,
          carbonFiber: pool.carbon_fiber,
          finishes: pool.finishes || [],
          liners: pool.liners || [],
          covers: pool.covers || [],
          order: localProducts.length + index + 1,
          isActive: pool.is_active ?? true
        }));
        
        // Only add if not already in local products (avoid duplicates)
        const existingPoolIds = new Set(localProducts.filter(p => p.category === 'pools').map(p => p.model));
        const newPools = supabasePools.filter(pool => !existingPoolIds.has(pool.model));
        localProducts = [...localProducts, ...newPools];
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
    }

    setProducts(localProducts);
  };

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    
    // Save pool products to localStorage for backward compatibility
    const poolProducts = updatedProducts
      .filter(p => p.category === 'pools')
      .map(p => ({
        id: p.id,
        model: p.name,
        price: p.price,
        category: p.subcategory === 'pools' ? 'premium' : 'standard', // Legacy mapping
        order: p.order,
        isActive: p.isActive,
        features: p.features || [],
        dimensions: p.dimensions,
        depth: p.depth,
        galaPoints: p.galaPoints,
        galaCategory: p.galaCategory,
        installationTimeWeeks: p.installationTimeWeeks,
        warrantyYears: p.warrantyYears,
        heater: p.heater,
        saltSystem: p.saltSystem,
        carbonFiber: p.carbonFiber,
        finishes: p.finishes,
        liners: p.liners,
        covers: p.covers
      }));
    
    localStorage.setItem('poolProducts', JSON.stringify(poolProducts));
  };

  const handleCategorySelect = (category: ProductCategory) => {
    setSelectedCategory(category);
    setShowCategoryDialog(false);
    
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      category,
      subcategory: getDefaultSubcategory(category),
      order: products.length + 1,
      isActive: true,
      features: []
    };
    
    setSelectedProduct(newProduct);
    setIsCreating(true);
    setIsEditing(true);
  };

  const getDefaultSubcategory = (category: ProductCategory): string => {
    switch (category) {
      case 'outdoors':
        return 'outdoor-equipment';
      case 'pools':
        return 'pools';
      case 'maintenance':
        return 'cleaning-supplies';
      default:
        return 'general';
    }
  };

  const getCategoryIcon = (category: ProductCategory) => {
    switch (category) {
      case 'outdoors':
        return <Car className="h-4 w-4" />;
      case 'pools':
        return <Waves className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: ProductCategory) => {
    switch (category) {
      case 'outdoors':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'pools':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'maintenance':
        return 'bg-gradient-to-r from-orange-500 to-amber-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const handleCreateProduct = () => {
    setShowCategoryDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      if (product.category === 'pools' && product.subcategory === 'pools') {
        // Save to Supabase pools table
        const poolData = {
          model: product.name,
          price: product.price,
          category: 'premium', // Default mapping
          dimensions: product.dimensions,
          depth: product.depth,
          features: product.features || [],
          gala_points: product.galaPoints,
          gala_category: product.galaCategory,
          installation_time_weeks: product.installationTimeWeeks,
          warranty_years: product.warrantyYears,
          heater: product.heater || false,
          salt_system: product.saltSystem || false,
          carbon_fiber: product.carbonFiber || false,
          finishes: product.finishes || [],
          liners: product.liners || [],
          covers: product.covers || [],
          is_active: product.isActive
        };

        if (isCreating) {
          const { error } = await (supabase as any)
            .from('pools')
            .insert([poolData]);
          
          if (error) throw error;
        } else {
          const { error } = await (supabase as any)
            .from('pools')
            .update(poolData)
            .eq('id', product.id);
          
          if (error) throw error;
        }
      } else {
        // For non-pool products, save to products table
        const productData = {
          name: product.name,
          price: product.price,
          category: product.subcategory,
          description: product.description,
          brand: product.brand,
          sku: product.sku,
          stock_quantity: product.stockQuantity || 0,
          image_url: product.image,
          is_active: product.isActive
        };

        if (isCreating) {
          const { error } = await (supabase as any)
            .from('products')
            .insert([productData]);
          
          if (error) throw error;
        } else {
          const { error } = await (supabase as any)
            .from('products')
            .update(productData)
            .eq('id', product.id);
          
          if (error) throw error;
        }
      }

      if (isCreating) {
        const updatedProducts = [...products, product];
        saveProducts(updatedProducts);
        toast({
          title: "Product Created",
          description: `${product.name} has been added to the catalog.`
        });
      } else {
        const updatedProducts = products.map(p => p.id === product.id ? product : p);
        saveProducts(updatedProducts);
        toast({
          title: "Product Updated",
          description: `${product.name} has been updated successfully.`
        });
      }

      setIsEditing(false);
      setIsCreating(false);
      setSelectedProduct(null);
      loadProducts(); // Reload from database
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      if (product.category === 'pools' && product.subcategory === 'pools') {
        const { error } = await (supabase as any)
          .from('pools')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
      }

      const updatedProducts = products.filter(p => p.id !== productId);
      saveProducts(updatedProducts);
      toast({
        title: "Product Deleted",
        description: "Product has been removed from the catalog."
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
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

  const filteredProducts = products.filter(product => 
    filterCategory === 'all' || product.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Category Selection Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Product Category</DialogTitle>
            <DialogDescription>
              Choose the category for your new product. This will determine the available fields and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-green-50"
              onClick={() => handleCategorySelect('outdoors')}
            >
              <Car className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Outdoors</div>
                <div className="text-xs text-muted-foreground">All outdoor products and equipment</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-blue-50"
              onClick={() => handleCategorySelect('pools')}
            >
              <Waves className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Pools</div>
                <div className="text-xs text-muted-foreground">Pools, liners, tiles, pumps, salt systems, accessories</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-orange-50"
              onClick={() => handleCategorySelect('maintenance')}
            >
              <Wrench className="h-6 w-6 text-orange-600" />
              <div className="text-center">
                <div className="font-semibold">Maintenance</div>
                <div className="text-xs text-muted-foreground">Chlorine, cleaning supplies, testing kits, nets, etc.</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Universal Product Manager
            </div>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="mb-6">
            <Label htmlFor="category-filter">Filter by Category</Label>
            <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as ProductCategory | 'all')}>
              <SelectTrigger className="w-[200px] mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="outdoors">Outdoors</SelectItem>
                <SelectItem value="pools">Pools</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Catalog ({filteredProducts.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product, index) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">#{product.order}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.name || 'Untitled Product'}</h4>
                            <Badge className={`${getCategoryColor(product.category)} text-white text-xs flex items-center gap-1`}>
                              {getCategoryIcon(product.category)}
                              {product.category}
                            </Badge>
                            {!product.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${product.price.toLocaleString()}
                            {product.subcategory && ` • ${product.subcategory}`}
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
                          disabled={index === filteredProducts.length - 1}
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
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {filterCategory === 'all' 
                      ? 'No products found. Add your first product to get started.'
                      : `No ${filterCategory} products found.`
                    }
                  </div>
                )}
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
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
  isCreating: boolean;
}

const ProductEditor = ({ product, onSave, onCancel, isCreating }: ProductEditorProps) => {
  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const [featuresText, setFeaturesText] = useState(product.features?.join(', ') || '');
  const [showPreview, setShowPreview] = useState(true);

  const handleSave = () => {
    const productToSave = {
      ...editedProduct,
      features: featuresText.split(',').map(f => f.trim()).filter(f => f.length > 0)
    };
    onSave(productToSave);
  };

  const updateField = (field: keyof Product, value: any) => {
    setEditedProduct(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof Product, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setEditedProduct(prev => ({ ...prev, [field]: items }));
  };

  // Convert Product to Pool format for PoolProductCard
  const convertToPoolFormat = (product: Product) => ({
    model: product.name,
    price: product.price,
    category: 'premium' as const,
    dimensions: product.dimensions,
    depth: product.depth,
    features: product.features || [],
    galaPoints: product.galaPoints,
    galaCategory: product.galaCategory,
    installationTimeWeeks: product.installationTimeWeeks,
    warrantyYears: product.warrantyYears,
    heater: product.heater,
    saltSystem: product.saltSystem,
    carbonFiber: product.carbonFiber,
    finishes: product.finishes,
    liners: product.liners,
    covers: product.covers,
    image: product.image
  });

  // Convert Product to ProductCard format
  const convertToProductFormat = (product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.subcategory || product.category,
    dimensions: product.dimensions,
    specifications: product.description,
    features: product.features || [],
    description: product.description,
    image: product.image
  });

  return (
    <div className="space-y-6">
      {/* Card Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Live Card Preview
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </CardTitle>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                This is how your product will appear to customers:
              </p>
              <div className="max-w-md mx-auto">
                {editedProduct.category === 'pools' ? (
                  <PoolProductCard
                    pool={convertToPoolFormat(editedProduct)}
                    onViewDetails={() => {}}
                    onRequestQuote={() => {}}
                  />
                ) : (
                  <ProductCard
                    product={convertToProductFormat(editedProduct)}
                    onViewDetails={() => {}}
                    onRequestQuote={() => {}}
                  />
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Product Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {isCreating ? 'Create New Product' : 'Edit Product'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={editedProduct.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Astoria 12 or Pool Chlorine"
            />
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={editedProduct.price}
              onChange={(e) => updateField('price', Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>

        {/* Category-specific fields */}
        {editedProduct.category === 'pools' && (
          <>
            <Separator />
            <h4 className="font-semibold text-primary">Pool-Specific Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={editedProduct.dimensions || ''}
                  onChange={(e) => updateField('dimensions', e.target.value)}
                  placeholder="e.g., 12′ × 26′"
                />
              </div>
              <div>
                <Label htmlFor="depth">Depth</Label>
                <Input
                  id="depth"
                  value={editedProduct.depth || ''}
                  onChange={(e) => updateField('depth', e.target.value)}
                  placeholder="e.g., 3′ 6″ to 5′ 6″"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="galaPoints">GALA Points</Label>
                <Input
                  id="galaPoints"
                  type="number"
                  value={editedProduct.galaPoints || ''}
                  onChange={(e) => updateField('galaPoints', Number(e.target.value))}
                  placeholder="11100"
                />
              </div>
              <div>
                <Label htmlFor="installationWeeks">Installation Time (weeks)</Label>
                <Input
                  id="installationWeeks"
                  type="number"
                  value={editedProduct.installationTimeWeeks || ''}
                  onChange={(e) => updateField('installationTimeWeeks', Number(e.target.value))}
                  placeholder="6"
                />
              </div>
              <div>
                <Label htmlFor="warranty">Warranty Years</Label>
                <Input
                  id="warranty"
                  value={editedProduct.warrantyYears || ''}
                  onChange={(e) => updateField('warrantyYears', e.target.value)}
                  placeholder="Lifetime or 25"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedProduct.heater || false}
                  onChange={(e) => updateField('heater', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Heater Ready</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedProduct.saltSystem || false}
                  onChange={(e) => updateField('saltSystem', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Salt System Compatible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedProduct.carbonFiber || false}
                  onChange={(e) => updateField('carbonFiber', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Carbon Fiber Technology</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finishes">Available Finishes (comma-separated)</Label>
              <Textarea
                id="finishes"
                value={editedProduct.finishes?.join(', ') || ''}
                onChange={(e) => updateArrayField('finishes', e.target.value)}
                placeholder="Ocean Blue, Sapphire Blue, Aquamarine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liners">Available Liners (comma-separated)</Label>
              <Textarea
                id="liners"
                value={editedProduct.liners?.join(', ') || ''}
                onChange={(e) => updateArrayField('liners', e.target.value)}
                placeholder="Premium Vinyl, Fiberglass, Tile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="covers">Available Covers (comma-separated)</Label>
              <Textarea
                id="covers"
                value={editedProduct.covers?.join(', ') || ''}
                onChange={(e) => updateArrayField('covers', e.target.value)}
                placeholder="Automatic Safety Cover, Solar Cover, Winter Cover"
              />
            </div>
          </>
        )}

        {/* General product fields */}
        {editedProduct.category !== 'pools' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={editedProduct.brand || ''}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="e.g., Pentair, Hayward"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={editedProduct.sku || ''}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="e.g., PEN-123456"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedProduct.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Product description..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={editedProduct.stockQuantity || ''}
                onChange={(e) => updateField('stockQuantity', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </>
        )}

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
    </div>
  );
};

export default EnhancedProductManager;