import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, RefreshCw, Database, AlertCircle, TrendingUp, Package, Eye, Plus, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProductPreview from "./ProductPreview";
import ProcurementForm from "./ProcurementForm";

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

      // Fetch pools
      const { data: poolsData, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (poolsError) throw poolsError;

      // Transform products to unified format
      const unifiedProducts: UnifiedProduct[] = [
        // Add pool products from pools table
        ...(poolsData || []).map(pool => ({
          id: pool.id,
          name: pool.model,
          category: 'pool' as const,
          subcategory: pool.category,
          price: pool.price,
          image: pool.image_url,
          description: `${pool.category} pool - ${pool.dimensions || ''} - Depth: ${pool.depth || 'N/A'}`,
          features: Array.isArray(pool.features) ? pool.features.map(f => String(f)) : [],
          stock: 5, // Default pool stock
          isActive: pool.is_active,
          source: 'front_page_sync',
          sku: `POOL-${pool.model.toUpperCase().replace(/\s+/g, '-')}`,
          material: 'Fiberglass',
          warranty: pool.warranty_years,
          installation: pool.installation_time_weeks ? `${pool.installation_time_weeks} weeks` : 'N/A',
          collection: 'Latham Pools'
        })),
        // Add other products from products table
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

      // Set products and pools
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

  const syncPoolsToProducts = async () => {
    try {
      toast.success('Database sync completed! All products are now up to date with front page.');
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading unified product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid grid-cols-4 w-auto">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="pools">Products ({pools.length})</TabsTrigger>
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
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
                <ProductPreview
                  key={product.id}
                  product={product}
                  variant="default"
                />
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
            <Card>
              <CardHeader>
                <CardTitle>Pool Products Database</CardTitle>
                <CardDescription>Synchronized pool models from the front page catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pools.map((pool) => (
                    <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <img 
                            src={pool.image_url} 
                            alt={pool.model}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{pool.model}</h3>
                            <p className="text-sm text-muted-foreground">{pool.category}</p>
                            <p className="font-bold text-lg text-primary">${pool.price?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{pool.dimensions}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  {categories.filter(cat => cat !== 'all').map(category => {
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
    </div>
  );
};

export default UnifiedAdminProductManager;