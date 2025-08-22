
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Package, Waves, Droplets } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UnifiedProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  brand?: string;
  image_url?: string;
  stock_quantity?: number;
  is_active: boolean;
  source_type: 'pool' | 'product' | 'manual';
  features?: string[];
  specifications?: Record<string, any>;
}

const UnifiedAdminProductManager = () => {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UnifiedProduct | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    subcategory: '',
    brand: '',
    image_url: '',
    stock_quantity: 0,
    features: [] as string[],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch pools
      const { data: poolsData, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (poolsError) throw poolsError;

      // Unify the data structure
      const unifiedProducts: UnifiedProduct[] = [
        // Products from products table
        ...(productsData || []).map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category || 'general',
          subcategory: product.subcategory,
          brand: product.brand,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity || 0,
          is_active: product.is_active,
          source_type: 'product' as const,
          features: product.benefits || [],
          specifications: {
            material: product.material,
            warranty: product.warranty_years_text,
            installation_time: product.installation_time,
            sku: product.sku,
            pattern: product.pattern,
            motor_type: product.motor_type,
            durability: product.durability
          }
        })),
        // Pools from pools table
        ...(poolsData || []).map(pool => ({
          id: pool.id,
          name: pool.model,
          description: `${pool.category} pool with ${pool.dimensions}`,
          price: pool.price,
          category: 'pools',
          subcategory: pool.category,
          brand: 'Latham',
          image_url: pool.image_url,
          stock_quantity: 1,
          is_active: pool.is_active,
          source_type: 'pool' as const,
          features: pool.features || [],
          specifications: {
            dimensions: pool.dimensions,
            depth: pool.depth,
            warranty: pool.warranty_years,
            installation_time: `${pool.installation_time_weeks} weeks`,
            finishes: pool.finishes,
            liners: pool.liners,
            covers: pool.covers,
            heater: pool.heater,
            salt_system: pool.salt_system,
            carbon_fiber: pool.carbon_fiber,
            gala_points: pool.gala_points,
            gala_category: pool.gala_category
          }
        }))
      ];

      setProducts(unifiedProducts);
      setPools(poolsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products and pools data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          subcategory: newProduct.subcategory,
          brand: newProduct.brand,
          image_url: newProduct.image_url,
          stock_quantity: newProduct.stock_quantity,
          benefits: newProduct.features,
          is_active: true,
          source_api: 'manual'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      setIsAddDialogOpen(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: '',
        subcategory: '',
        brand: '',
        image_url: '',
        stock_quantity: 0,
        features: [],
      });
      fetchAllData();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (product: UnifiedProduct) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const tableName = product.source_type === 'pool' ? 'pools' : 'products';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const syncPoolsToProducts = async () => {
    try {
      const poolsToSync = pools.map(pool => ({
        name: pool.model,
        description: `${pool.category} pool - ${pool.dimensions}`,
        price: pool.price,
        category: 'pools',
        subcategory: pool.category,
        brand: 'Latham',
        image_url: pool.image_url,
        stock_quantity: 1,
        benefits: pool.features || [],
        is_active: true,
        source_api: 'pools_table',
        external_id: pool.id,
        material: 'Fiberglass',
        warranty_years_text: pool.warranty_years,
        installation_time: `${pool.installation_time_weeks} weeks`
      }));

      const { error } = await supabase
        .from('products')
        .upsert(poolsToSync, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Synced ${poolsToSync.length} pools to products table`,
      });
      fetchAllData();
    } catch (error) {
      console.error('Error syncing pools:', error);
      toast({
        title: "Error",
        description: "Failed to sync pools to products",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];
  const productStats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    pools: products.filter(p => p.source_type === 'pool').length,
    products: products.filter(p => p.source_type === 'product').length,
    manual: products.filter(p => p.source_type === 'manual').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading unified product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{productStats.total}</div>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{productStats.active}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{productStats.pools}</div>
            <p className="text-sm text-muted-foreground">Pools</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{productStats.products}</div>
            <p className="text-sm text-muted-foreground">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{productStats.manual}</div>
            <p className="text-sm text-muted-foreground">Manual</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, pools, and brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncPoolsToProducts} variant="outline">
            <Waves className="h-4 w-4 mr-2" />
            Sync Pools
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Add a new product to the unified catalog</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({...newProduct, stock_quantity: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unified Product Catalog</CardTitle>
          <CardDescription>
            All products, pools, and items in one unified view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{product.category}</Badge>
                      {product.subcategory && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.subcategory}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell className="font-mono">
                    ${product.price.toLocaleString()}
                  </TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        product.source_type === 'pool' ? 'default' :
                        product.source_type === 'product' ? 'secondary' : 'outline'
                      }
                    >
                      {product.source_type === 'pool' && <Waves className="h-3 w-3 mr-1" />}
                      {product.source_type === 'product' && <Package className="h-3 w-3 mr-1" />}
                      {product.source_type === 'manual' && <Edit className="h-3 w-3 mr-1" />}
                      {product.source_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedAdminProductManager;
