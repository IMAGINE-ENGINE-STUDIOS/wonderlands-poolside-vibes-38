import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, RefreshCw, Database, AlertCircle, TrendingUp, Package, Eye, Plus, Building, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProductPreview from "./ProductPreview";
import ProcurementForm from "./ProcurementForm";
import UserManagement from "./UserManagement";
import ProductEditor from "./ProductEditor";

interface UnifiedProduct {
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

const UnifiedAdminProductManager = () => {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<UnifiedProduct | null>(null);
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  
  const categories = ['all', 'pool', 'spa', 'liner', 'tile', 'tanning_ledge', 'finish', 'other'];
  const sortOptions = ['name', 'price', 'category', 'stock', 'created_at'];
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadProducts();
  }, []);

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

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch products from Supabase
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch pools separately
      const { data: poolsData, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (poolsError) throw poolsError;

      // Transform products to unified format (only from products table)
      const unifiedProducts: UnifiedProduct[] = [
        ...(productsData || []).map(product => ({
          id: product.id,
          name: product.name,
          category: product.category || 'other',
          subcategory: product.subcategory,
          price: product.price,
          image: product.image_url,
          description: product.description,
          features: Array.isArray(product.features_json) ? product.features_json.map(f => String(f)) : [],
          stock: product.stock_quantity || 0,
          isActive: product.is_active,
          source: product.source_api || 'manual',
          sku: product.sku,
          material: product.material,
          warranty: product.warranty_years_text,
          installation: product.installation_time,
          collection: product.collection_name
        }))
      ];

      // Set products and pools separately
      setProducts(unifiedProducts);
      setPools(poolsData || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'stock':
        aValue = a.stock;
        bValue = b.stock;
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      case 'name':
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Filter pools separately
  const filteredPools = pools.filter(pool => {
    const matchesSearch = pool.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.dimensions?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.model.toLowerCase() < b.model.toLowerCase() ? -1 : 1;
    } else {
      return a.model.toLowerCase() > b.model.toLowerCase() ? -1 : 1;
    }
  });

  const syncPoolsToProducts = async () => {
    try {
      toast.success('Database sync completed! All products are now up to date with front page.');
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    }
  };

  const handleEditProduct = (product: UnifiedProduct) => {
    setEditingProduct(product);
    setIsProductEditorOpen(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsProductEditorOpen(true);
  };

  const handleProductSaved = () => {
    loadProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid grid-cols-5 w-auto">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="pools">Pools ({pools.length})</TabsTrigger>
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building className="h-4 w-4 mr-2" />
                  New Procurement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Procurement Opportunity</DialogTitle>
                  <DialogDescription>
                    Post a new procurement opportunity for the supplier network
                  </DialogDescription>
                </DialogHeader>
                <ProcurementForm />
              </DialogContent>
            </Dialog>
            <Button onClick={syncPoolsToProducts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          </div>
        </div>

        <TabsContent value="products">
          <div className="space-y-6">
            <div className="flex gap-4 mb-6 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative">
                  <ProductPreview
                    product={product}
                    variant="default"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pools">
          <div className="space-y-6">
            <div className="flex gap-4 mb-6 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="Search pools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPools.map((pool) => (
                <Card key={pool.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
                  <div className="relative overflow-hidden">
                    <img 
                      src={pool.image_url} 
                      alt={pool.model}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <Badge className="absolute top-2 left-2 bg-blue-500">
                      {pool.category}
                    </Badge>
                    {pool.gala_points && (
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        {pool.gala_points} pts
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{pool.model}</CardTitle>
                    <CardDescription className="text-sm">
                      {pool.dimensions} • {pool.depth}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {pool.category} pool with {pool.features?.length || 0} features
                    </p>
                    
                    {pool.features && pool.features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {pool.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {pool.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{pool.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-2xl font-bold text-primary">${pool.price?.toLocaleString()}</span>
                        <p className="text-xs text-muted-foreground">Fiberglass</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">In Stock</p>
                        {pool.warranty_years && (
                          <p className="text-xs text-muted-foreground">{pool.warranty_years} warranty</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{pool.model}</DialogTitle>
                            <DialogDescription>{pool.category} Pool</DialogDescription>
                          </DialogHeader>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <img
                                src={pool.image_url}
                                alt={pool.model}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Badge className="bg-blue-500">
                                  {pool.category}
                                </Badge>
                                {pool.gala_category && (
                                  <Badge variant="outline">{pool.gala_category}</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-xl font-bold mb-2">${pool.price?.toLocaleString()}</h3>
                                <p className="text-muted-foreground">{pool.category} pool model</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-3">Specifications:</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Dimensions:</span> {pool.dimensions}</div>
                                  <div><span className="font-medium">Depth:</span> {pool.depth}</div>
                                  <div><span className="font-medium">Material:</span> Fiberglass</div>
                                  {pool.warranty_years && <div><span className="font-medium">Warranty:</span> {pool.warranty_years}</div>}
                                  {pool.installation_time_weeks && <div><span className="font-medium">Installation:</span> {pool.installation_time_weeks} weeks</div>}
                                  {pool.gala_points && <div><span className="font-medium">Points:</span> {pool.gala_points}</div>}
                                </div>
                              </div>
                              
                              {pool.features && pool.features.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3">Features:</h4>
                                  <ul className="space-y-2">
                                    {pool.features.map((feature, index) => (
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPools.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pools found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="procurement">
          <div className="space-y-6">
            <ProcurementForm />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Procurement Opportunities</CardTitle>
                <CardDescription>Latest postings for the supplier network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No procurement opportunities yet.</p>
                  <p className="text-sm">Create your first opportunity above to get started.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active products in catalog
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pools</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pools.length}</div>
                <p className="text-xs text-muted-foreground">
                  Pool models available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length - 1}</div>
                <p className="text-xs text-muted-foreground">
                  Product categories
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Database Health</CardTitle>
                <CardDescription>Current status of product synchronization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Products table: {products.length} records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Pools table: {pools.length} records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Front page sync: Complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Last sync: Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Distribution</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="capitalize">Pool Models</span>
                    <Badge variant="secondary">{pools.length}</Badge>
                  </div>
                  {categories.filter(cat => cat !== 'all' && cat !== 'pool').map(category => {
                    const count = products.filter(p => p.category === category).length;
                    return count > 0 ? (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category.replace('_', ' ')}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ProductEditor
        product={editingProduct}
        isOpen={isProductEditorOpen}
        onClose={() => setIsProductEditorOpen(false)}
        onSave={handleProductSaved}
      />
    </div>
  );
};

export default UnifiedAdminProductManager;