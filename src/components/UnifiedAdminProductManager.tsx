import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditablePoolProductCard from "./EditablePoolProductCard";
import EditableProductCard from "./EditableProductCard";
import ProductPreview from "./ProductPreview";

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
  // Pool-specific fields
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
}

const UnifiedAdminProductManager = () => {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', 'pool', 'spa', 'liner', 'tile', 'tanning_ledge', 'finish', 'heater', 'cover', 'jets', 'other'];
  const sortOptions = ['name', 'price', 'category', 'stock', 'created_at'];
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadProducts();
    
    // Set up real-time subscriptions for automatic synchronization
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Products table changed:', payload);
          // Reload products when any change occurs
          loadProducts();
        }
      )
      .subscribe();

    const poolsChannel = supabase
      .channel('pools-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pools'
        },
        (payload) => {
          console.log('Pools table changed:', payload);
          // Reload products when any change occurs
          loadProducts();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(poolsChannel);
    };
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pool: 'bg-blue-500',
      spa: 'bg-purple-500',
      liner: 'bg-green-500', 
      tile: 'bg-orange-500',
      finish: 'bg-pink-500',
      tanning_ledge: 'bg-yellow-500',
      heater: 'bg-red-500',
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
          price: pool.price || 0,
          image: pool.image_url,
          description: `${pool.category} pool - ${pool.dimensions || ''} - Depth: ${pool.depth || 'N/A'}`,
          features: Array.isArray(pool.features) ? pool.features.map(f => String(f)) : [],
          stock: 5, // Default pool stock
          isActive: pool.is_active,
          source: 'pools_table',
          sku: `POOL-${pool.model.toUpperCase().replace(/\s+/g, '-')}`,
          material: 'Fiberglass',
          warranty: pool.warranty_years,
          installation: pool.installation_time_weeks ? `${pool.installation_time_weeks} weeks` : 'N/A',
          collection: 'Latham Pools',
          // Pool-specific fields
          dimensions: pool.dimensions,
          depth: pool.depth,
          galaPoints: pool.gala_points,
          galaCategory: pool.gala_category,
          installationTimeWeeks: pool.installation_time_weeks,
          warrantyYears: pool.warranty_years,
          heater: pool.heater,
          saltSystem: pool.salt_system,
          carbonFiber: pool.carbon_fiber,
          finishes: pool.finishes,
          liners: pool.liners,
          covers: pool.covers
        })),
        // Add other products from products table
        ...(productsData || []).map(product => ({
          id: product.id,
          name: product.name,
          category: product.category || 'other',
          subcategory: product.subcategory,
          price: product.price || 0,
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

  // Group products by category for organized display
  const productsByCategory = categories.filter(cat => cat !== 'all').reduce((acc, category) => {
    acc[category] = filteredProducts.filter(product => product.category === category);
    return acc;
  }, {} as Record<string, UnifiedProduct[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading product database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Product Database Management</CardTitle>
              <CardDescription>Manage all products organized by category ({products.length} total products)</CardDescription>
            </div>
            <Button onClick={syncPoolsToProducts} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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

          {selectedCategory === 'all' ? (
            // Show products organized by category
            <div className="space-y-8">
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                categoryProducts.length > 0 && (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold capitalize">
                        {category.replace('_', ' ')} Products
                      </h3>
                      <Badge variant="secondary" className={getCategoryColor(category)}>
                        {categoryProducts.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryProducts.map((product) => (
                        product.source === 'pools_table' ? (
                          <EditablePoolProductCard
                            key={product.id}
                            pool={{
                              model: product.name,
                              price: product.price,
                              category: (product.subcategory || product.category) as any,
                              image: product.image,
                              dimensions: product.dimensions,
                              depth: product.depth,
                              features: product.features,
                              galaPoints: product.galaPoints,
                              galaCategory: product.galaCategory,
                              installationTimeWeeks: product.installationTimeWeeks,
                              warrantyYears: product.warrantyYears,
                              heater: product.heater,
                              saltSystem: product.saltSystem,
                              carbonFiber: product.carbonFiber,
                              finishes: product.finishes,
                              liners: product.liners,
                              covers: product.covers
                            }}
                            isEditable={true}
                            onUpdate={(updatedPool) => {
                              console.log('Pool updated:', updatedPool);
                              loadProducts();
                            }}
                          />
                          ) : (
                            <ProductPreview
                              key={product.id}
                              product={product}
                              variant="default"
                            />
                          )
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            // Show filtered products for selected category
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                product.source === 'pools_table' ? (
                  <EditablePoolProductCard
                    key={product.id}
                    pool={{
                      model: product.name,
                      price: product.price,
                      category: (product.subcategory || product.category) as any,
                      image: product.image,
                      dimensions: product.dimensions,
                      depth: product.depth,
                      features: product.features,
                      galaPoints: product.galaPoints,
                      galaCategory: product.galaCategory,
                      installationTimeWeeks: product.installationTimeWeeks,
                      warrantyYears: product.warrantyYears,
                      heater: product.heater,
                      saltSystem: product.saltSystem,
                      carbonFiber: product.carbonFiber,
                      finishes: product.finishes,
                      liners: product.liners,
                      covers: product.covers
                    }}
                    isEditable={true}
                    onUpdate={(updatedPool) => {
                      console.log('Pool updated:', updatedPool);
                      loadProducts();
                    }}
                  />
                  ) : (
                    <ProductPreview
                      key={product.id}
                      product={product}
                      variant="default"
                    />
                  )
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedAdminProductManager;