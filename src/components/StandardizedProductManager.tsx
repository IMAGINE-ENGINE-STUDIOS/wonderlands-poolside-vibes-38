import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Package, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PoolProductCard from './PoolProductCard';

interface Product {
  id: string;
  name: string;
  model?: string;
  price: number;
  category: string;
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
  isActive: boolean;
  source?: string;
}

export const StandardizedProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Load from pools table
      const { data: poolsData, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .eq('is_active', true);

      // Load from products table
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (poolsError) throw poolsError;
      if (productsError) throw productsError;

      // Transform pools data to unified format
      const transformedPools = (poolsData || []).map(pool => ({
        id: pool.id,
        name: pool.model,
        model: pool.model,
        price: pool.price,
        category: 'pools',
        subcategory: pool.category,
        image: pool.image_url,
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
        isActive: pool.is_active,
        source: 'pools_table'
      }));

      // Transform products data to unified format
      const transformedProducts = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        subcategory: product.subcategory,
        image: product.image_url,
        description: product.description,
        features: Array.isArray(product.features_json) 
          ? product.features_json.filter((f): f is string => typeof f === 'string')
          : [],
        brand: product.brand,
        sku: product.sku,
        stockQuantity: product.stock_quantity,
        isActive: product.is_active,
        source: 'products_table'
      }));

      const allProducts = [...transformedPools, ...transformedProducts];
      setProducts(allProducts);
      
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' 
        ? (aValue < bValue ? -1 : 1)
        : (aValue > bValue ? -1 : 1);
    });

    setFilteredProducts(filtered);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    toast({
      title: "Success",
      description: "Product updated successfully"
    });
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="min-w-fit"
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {sortOrder.toUpperCase()}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredProducts.length} Products
          </Badge>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <PoolProductCard
            key={product.id}
            pool={{
              model: product.name,
              price: product.price,
              category: product.subcategory as any || 'standard',
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
            onViewDetails={(pool) => {
              toast({
                title: "Product Details",
                description: `Viewing ${pool.model}`
              });
            }}
            onRequestQuote={(pool) => {
              toast({
                title: "Quote Request",
                description: `Quote requested for ${pool.model}`
              });
            }}
            isAdmin={true}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No products available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default StandardizedProductManager;