import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { X, DollarSign, Thermometer, Shield, Zap, Droplets, Sun, Waves, Clock, Award, Palette, Camera, Layers, Plus, Minus, Download, Printer, ShoppingCart, Search, ChevronDown, Settings, Armchair, Flame, ChefHat, Utensils, Home, Music, Package, Cpu } from "lucide-react";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SurveyQuoteTool from '@/components/SurveyQuoteTool';
import { useShoppingCart } from '@/components/ShoppingCartProvider';
import { Belgard3DVisualizer } from '@/components/Belgard3DVisualizer';

// Helper function to get product price
const getProductPrice = (product: BelgardProduct) => {
  return product.price || 0;
};

interface BelgardProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  collection?: string;
  description?: string;
  image_url?: string;
  material?: string;
  pattern?: string;
  benefits?: string[];
  installation_time?: string;
  warranty_years_text?: string;
}

interface BelgardExtras {
  selectedProducts: { [productId: string]: boolean };
  quantities: { [productId: string]: number };
  dimensions: { [productId: string]: { length: number; width: number; area: number } };
  notes: string;
}

const BelgardStudio = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useShoppingCart();

  // Product categories
  const [products, setProducts] = useState<BelgardProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BelgardProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('scene');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Configuration state
  const [extras, setExtras] = useState<BelgardExtras>({
    selectedProducts: {},
    quantities: {},
    dimensions: {},
    notes: ''
  });

  // UI state
  const [activePanel, setActivePanel] = useState('products');
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const categories = [
    { id: 'scene', name: 'Scene', icon: Cpu },
    { id: 'concrete-pavers', name: 'Concrete Pavers & Slabs', icon: Package },
    { id: 'permeable-pavers', name: 'Permeable Pavers', icon: Droplets },
    { id: 'porcelain-pavers', name: 'Porcelain Pavers', icon: Layers },
    { id: 'wall-systems', name: 'Wall Systems', icon: Shield },
    { id: 'caps-edgers', name: 'Caps & Edgers', icon: Settings },
    { id: 'outdoor-kitchens', name: 'Outdoor Kitchens', icon: ChefHat },
    { id: 'fireplaces', name: 'Fireplaces', icon: Flame },
    { id: 'fire-pits', name: 'Fire Pit Kits', icon: Flame },
    { id: 'pergolas', name: 'Pergolas & Panels', icon: Home },
    { id: 'accessories', name: 'Accessories', icon: Plus }
  ];

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .in('category', [
            'concrete-pavers', 'permeable-pavers', 'porcelain-pavers', 
            'wall-systems', 'caps-edgers', 'outdoor-kitchens', 
            'fireplaces', 'fire-pits', 'pergolas', 'accessories'
          ]);

        if (error) {
          console.error('Error loading products:', error);
          toast({
            title: "Error",
            description: "Failed to load Belgard products",
            variant: "destructive"
          });
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load Belgard products",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  // Filter products by category and search
  useEffect(() => {
    if (selectedCategory === 'scene') {
      setFilteredProducts([]);
      return;
    }

    let filtered = products.filter(product => 
      product.category === selectedCategory
    );

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.collection?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Calculate total price
  const calculateTotalPrice = () => {
    return Object.entries(extras.selectedProducts)
      .filter(([_, selected]) => selected)
      .reduce((total, [productId]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return total;
        
        const quantity = extras.quantities[productId] || 1;
        const dimensions = extras.dimensions[productId];
        const area = dimensions?.area || 1;
        
        return total + (product.price * quantity * area);
      }, 0);
  };

  // Handle product selection
  const toggleProduct = (productId: string) => {
    setExtras(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [productId]: !prev.selectedProducts[productId]
      },
      quantities: {
        ...prev.quantities,
        [productId]: prev.quantities[productId] || 1
      },
      dimensions: {
        ...prev.dimensions,
        [productId]: prev.dimensions[productId] || { length: 10, width: 10, area: 100 }
      }
    }));
  };

  // Handle quantity change
  const updateQuantity = (productId: string, quantity: number) => {
    setExtras(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [productId]: Math.max(1, quantity)
      }
    }));
  };

  // Handle dimensions change
  const updateDimensions = (productId: string, field: 'length' | 'width', value: number) => {
    setExtras(prev => {
      const currentDimensions = prev.dimensions[productId] || { length: 10, width: 10, area: 100 };
      const newDimensions = {
        ...currentDimensions,
        [field]: Math.max(1, value)
      };
      newDimensions.area = newDimensions.length * newDimensions.width;

      return {
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [productId]: newDimensions
        }
      };
    });
  };

  // Add to cart
  const handleAddToCart = () => {
    const selectedItems = Object.entries(extras.selectedProducts)
      .filter(([_, selected]) => selected)
      .map(([productId]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;

        const quantity = extras.quantities[productId] || 1;
        const dimensions = extras.dimensions[productId];
        const totalPrice = product.price * quantity * (dimensions?.area || 1);

        return {
          id: product.id,
          name: `${product.name}${dimensions ? ` (${dimensions.length}'×${dimensions.width}')` : ''}`,
          price: totalPrice,
          category: product.category,
          image: product.image_url,
          quantity: 1,
          extras: [{
            name: 'Configuration',
            price: 0
          }]
        };
      })
      .filter(Boolean);

    if (selectedItems.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one Belgard product to add to cart.",
        variant: "destructive"
      });
      return;
    }

    selectedItems.forEach(item => {
      if (item) addToCart(item);
    });

    toast({
      title: "Added to Cart",
      description: `${selectedItems.length} Belgard product(s) added to your cart`,
    });
  };

  // Generate quote
  const generateQuote = () => {
    const selectedItems = Object.entries(extras.selectedProducts)
      .filter(([_, selected]) => selected)
      .map(([productId]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;

        const quantity = extras.quantities[productId] || 1;
        const dimensions = extras.dimensions[productId];
        
        return {
          name: product.name,
          category: product.category,
          collection: product.collection,
          price: product.price,
          quantity,
          dimensions,
          totalPrice: product.price * quantity * (dimensions?.area || 1),
          description: product.description
        };
      })
      .filter(Boolean);

    if (selectedItems.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product to generate a quote.",
        variant: "destructive"
      });
      return;
    }

    const quote = {
      type: 'belgard-hardscape',
      timestamp: new Date().toISOString(),
      items: selectedItems,
      totalPrice: calculateTotalPrice(),
      notes: extras.notes,
      estimatedInstallation: '2-4 weeks',
      warranty: 'Varies by product'
    };

    localStorage.setItem('belgard-quote', JSON.stringify(quote));
    
    const quoteWindow = window.open('', '_blank');
    if (quoteWindow) {
      quoteWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Belgard Hardscape Quote</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
            .total { font-size: 20px; font-weight: bold; margin-top: 30px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Belgard Hardscape Quote</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          ${selectedItems.map(item => `
            <div class="item">
              <h3>${item.name}</h3>
              <p><strong>Category:</strong> ${item.category}</p>
              ${item.collection ? `<p><strong>Collection:</strong> ${item.collection}</p>` : ''}
              <p><strong>Unit Price:</strong> $${item.price.toFixed(2)}</p>
              <p><strong>Quantity:</strong> ${item.quantity}</p>
              ${item.dimensions ? `<p><strong>Dimensions:</strong> ${item.dimensions.length}' × ${item.dimensions.width}' (${item.dimensions.area} sq ft)</p>` : ''}
              <p><strong>Total:</strong> $${item.totalPrice.toFixed(2)}</p>
              ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
            </div>
          `).join('')}
          <div class="total">
            Total Quote: $${quote.totalPrice.toFixed(2)}
          </div>
          ${quote.notes ? `<p><strong>Notes:</strong> ${quote.notes}</p>` : ''}
          <p><strong>Estimated Installation:</strong> ${quote.estimatedInstallation}</p>
          <p><strong>Warranty:</strong> ${quote.warranty}</p>
        </body>
        </html>
      `);
      quoteWindow.document.close();
    }

    toast({
      title: "Quote Generated",
      description: "Your Belgard hardscape quote has been generated and opened in a new window.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Belgard products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-sm"
              >
                ← Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-primary">Belgard Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-primary">
                  ${calculateTotalPrice().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">{category.name}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Configuration Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Selection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Selected Products:</span>
                    <span>{Object.values(extras.selectedProducts).filter(Boolean).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Area:</span>
                    <span>
                      {Object.entries(extras.selectedProducts)
                        .filter(([_, selected]) => selected)
                        .reduce((total, [productId]) => {
                          const dimensions = extras.dimensions[productId];
                          return total + (dimensions?.area || 0);
                        }, 0)} sq ft
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedCategory === 'scene' ? (
              <Belgard3DVisualizer />
            ) : (
              <>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${categories.find(c => c.id === selectedCategory)?.name || 'products'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">
                        ${product.price}/sq ft
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {product.collection && (
                          <p className="text-sm text-muted-foreground">{product.collection}</p>
                        )}
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Selection Controls */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={extras.selectedProducts[product.id] || false}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <label htmlFor={`product-${product.id}`} className="text-sm font-medium">
                            Select Product
                          </label>
                        </div>

                        {extras.selectedProducts[product.id] && (
                          <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground">Length (ft)</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={extras.dimensions[product.id]?.length || 10}
                                  onChange={(e) => updateDimensions(product.id, 'length', parseInt(e.target.value) || 1)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Width (ft)</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={extras.dimensions[product.id]?.width || 10}
                                  onChange={(e) => updateDimensions(product.id, 'width', parseInt(e.target.value) || 1)}
                                  className="h-8"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Quantity</label>
                              <Input
                                type="number"
                                min="1"
                                value={extras.quantities[product.id] || 1}
                                onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                                className="h-8"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Area: {extras.dimensions[product.id]?.area || 100} sq ft
                            </div>
                            <div className="text-sm font-semibold">
                              Subtotal: ${((product.price * (extras.quantities[product.id] || 1) * (extras.dimensions[product.id]?.area || 100))).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              </>
            )}

            {filteredProducts.length === 0 && selectedCategory !== 'scene' && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No products match "${searchQuery}" in ${categories.find(c => c.id === selectedCategory)?.name}`
                    : `No products available in ${categories.find(c => c.id === selectedCategory)?.name}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        {Object.values(extras.selectedProducts).some(Boolean) && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {Object.values(extras.selectedProducts).filter(Boolean).length} products selected
                </p>
                <p className="text-lg font-semibold">
                  Total: ${calculateTotalPrice().toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={generateQuote}>
                  <Printer className="h-4 w-4 mr-2" />
                  Generate Quote
                </Button>
                <Button onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button onClick={() => setShowQuoteModal(true)}>
                  Request Survey
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quote Modal */}
        {showQuoteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Request Site Survey</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuoteModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <SurveyQuoteTool 
                  pool={null}
                  isOpen={true}
                  onClose={() => setShowQuoteModal(false)}
                  customProduct={{
                    name: 'Belgard Hardscape Installation',
                    price: calculateTotalPrice(),
                    type: 'hardscape'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BelgardStudio;