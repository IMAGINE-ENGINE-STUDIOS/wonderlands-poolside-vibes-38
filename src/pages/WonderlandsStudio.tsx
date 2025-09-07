import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { spas, pools } from "@/components/PoolCatalog";
import { tanningLedges, poolLiners, poolTiles } from "@/data/poolData";
import { poolFinishes } from "@/data/consolidatedProducts";
import { paverTypes } from "@/data/paverData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Minus, 
  Package, 
  Plus, 
  Settings, 
  ShoppingCart, 
  Sun, 
  Waves 
} from 'lucide-react';

interface Product {
  id?: string;
  model?: string;
  name?: string;
  price: number;
  image?: string;
  category: string;
  dimensions?: string;
  depth?: string;
  installationTimeWeeks?: number;
  warrantyYears?: string;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  heater?: boolean;
  description?: string;
  features?: string[];
  warranty?: string;
  type?: string;
  gala_category?: string;
  gala_points?: number;
  collection?: string;
  subcategory?: string;
  
  // Paver specific fields
  paverType?: string;
  surfaceArea?: number;
  copingType?: string;
  copingColor?: string;
  copingPaverOption: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: string;
  concreteConstruction: boolean;
}

// Helper function to get discounted price for deluxe pools
const getProductPrice = (product: Product) => {
  if (product.category === 'premium') {
    return Math.round(product.price * 0.70); // 30% discount
  }
  return product.price;
};

export default function WonderlandsStudio() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState('pools');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFeatureCarousel, setActiveFeatureCarousel] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState({
    finish: 'Standard',
    heater: false,
    heaterModel: '',
    cover: false,
    coverOption: '',
    jets: false,
    jetQuantity: 4,
    tiles: false,
    tileOption: '',
    pavers: false,
    paverType: '',
    screenEnclosure: false,
    screenEnclosureType: ''
  });

  // Additional features data - comprehensive product catalog
  const finishOptions = poolFinishes.map(finish => ({
    name: finish.name,
    price: finish.price,
    image: finish.image,
    description: finish.description
  }));

  const poolHeaters = [
    { name: "Gas Heater 400K BTU", price: 3200, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "High-efficiency gas heater for rapid heating" },
    { name: "Heat Pump 140K BTU", price: 4800, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Energy-efficient heat pump technology" },
    { name: "Solar Heating System", price: 6500, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Eco-friendly solar heating solution" },
    { name: "Electric Heater 57K BTU", price: 2800, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Compact electric heating unit" },
    { name: "Hybrid Heat Pump", price: 5200, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Combines heat pump and gas heating" }
  ];

  const coverOptions = [
    { name: "NO COVER", price: 0, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "No pool cover selected" },
    { name: "Standard Safety Cover", price: 2500, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Mesh safety cover for protection" },
    { name: "Automatic Cover", price: 12000, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Motorized retractable cover system" },
    { name: "Solar Cover", price: 800, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Heat-retaining solar bubble cover" },
    { name: "Vinyl Safety Cover", price: 3200, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Solid vinyl cover for winter protection" },
    { name: "Automatic Solar Cover", price: 15000, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Premium automatic solar heating cover" }
  ];

  const tileOptions = poolTiles.map(tile => ({
    name: tile.name,
    price: tile.price,
    image: tile.image,
    description: tile.description
  }));

  const paverOptions = paverTypes.map(paver => ({
    name: paver.name,
    price: paver.basePrice * 100, // Assuming 100 sq ft base area
    image: paver.image,
    description: paver.description
  }));

  const screenEnclosureOptions = [
    { name: "Basic Screen Enclosure", price: 8500, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Standard aluminum frame with screen mesh" },
    { name: "Premium Glass Enclosure", price: 18000, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Tempered glass panels with aluminum frame" },
    { name: "Retractable Screen System", price: 25000, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Motorized retractable screen enclosure" },
    { name: "Climate Control Enclosure", price: 35000, image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png", description: "Insulated enclosure with HVAC system" }
  ];

  // Initialize product from URL parameters
  useEffect(() => {
    const model = searchParams.get('model');
    const price = searchParams.get('price');
    const category = searchParams.get('category');
    const image = searchParams.get('image');
    const dimensions = searchParams.get('dimensions');
    const depth = searchParams.get('depth');
    const installationTimeWeeks = searchParams.get('installationTimeWeeks');
    const warrantyYears = searchParams.get('warrantyYears');
    const saltSystem = searchParams.get('saltSystem') === 'true';
    const carbonFiber = searchParams.get('carbonFiber') === 'true';

    if (model && price && category) {
      const urlProduct: Product = {
        model: decodeURIComponent(model),
        price: parseInt(price),
        category: decodeURIComponent(category),
        image: image ? decodeURIComponent(image) : undefined,
        dimensions: dimensions ? decodeURIComponent(dimensions) : undefined,
        depth: depth ? decodeURIComponent(depth) : undefined,
        installationTimeWeeks: installationTimeWeeks ? parseInt(installationTimeWeeks) : undefined,
        warrantyYears: warrantyYears ? decodeURIComponent(warrantyYears) : undefined,
        saltSystem,
        carbonFiber,
        copingPaverOption: '',
        screenEnclosure: false,
        screenEnclosureArea: 0,
        screenEnclosureQuality: '',
        concreteConstruction: false
      };

      setSelectedProduct(urlProduct);
      setSelectedCategory(category === 'standard' || category === 'premium' ? 'pools' : category);
      setLeftSidebarCollapsed(true);
    }
  }, [searchParams]);

  // Get filtered products based on selected category
  const getFilteredProducts = () => {
    switch (selectedCategory) {
      case 'pools':
        return pools;
      case 'spas':
        return spas;
      case 'tanning-ledges':
        return tanningLedges;
      default:
        return [];
    }
  };

  // Calculate total price including extras
  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0;
    
    let total = getProductPrice(selectedProduct);
    
    // Add finish cost (find the selected finish and add its price)
    if (selectedExtras.finish !== 'Standard') {
      const finish = finishOptions.find(f => f.name === selectedExtras.finish);
      if (finish) total += finish.price;
    }
    
    // Add heater cost
    if (selectedExtras.heater && selectedExtras.heaterModel) {
      const heater = poolHeaters.find(h => h.name === selectedExtras.heaterModel);
      if (heater) total += heater.price;
    }
    
    // Add cover cost
    if (selectedExtras.cover && selectedExtras.coverOption) {
      const cover = coverOptions.find(c => c.name === selectedExtras.coverOption);
      if (cover) total += cover.price;
    }
    
    // Add spa jets cost
    if (selectedExtras.jets) {
      total += selectedExtras.jetQuantity * 250; // $250 per jet
    }
    
    // Add tile cost
    if (selectedExtras.tiles && selectedExtras.tileOption) {
      const tile = tileOptions.find(t => t.name === selectedExtras.tileOption);
      if (tile) total += tile.price;
    }

    // Add paver cost
    if (selectedExtras.pavers && selectedExtras.paverType) {
      const paver = paverOptions.find(p => p.name === selectedExtras.paverType);
      if (paver) total += paver.price;
    }

    // Add screen enclosure cost
    if (selectedExtras.screenEnclosure && selectedExtras.screenEnclosureType) {
      const enclosure = screenEnclosureOptions.find(e => e.name === selectedExtras.screenEnclosureType);
      if (enclosure) total += enclosure.price;
    }
    
    return total;
  };

  // Category color mapping
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'spa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ledge':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!selectedProduct) return;

    try {
      const orderData = {
        product_name: selectedProduct.model || selectedProduct.name || 'Unknown Product',
        product_category: selectedProduct.category,
        product_type: selectedProduct.type || selectedProduct.category,
        base_price: getProductPrice(selectedProduct),
        total_amount: calculateTotalPrice(),
        quantity: 1,
        extras_data: selectedExtras,
        product_identifier: selectedProduct.id || `${selectedProduct.model}-${Date.now()}`
      };

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: orderData
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "There was an issue processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg md:text-xl font-bold">Wonderlands Studio</h1>
            {selectedProduct && (
              <Badge variant="outline" className="hidden md:inline-flex">
                {selectedProduct.model || selectedProduct.name}
              </Badge>
            )}
          </div>
          {selectedProduct && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-lg font-bold text-primary">
                  ${calculateTotalPrice().toLocaleString()}
                </p>
              </div>
              <Button onClick={handleCheckout} className="hidden md:flex">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6 min-h-screen">
          {/* Left Sidebar - Product Categories */}
          <div className={`transition-all duration-300 ${leftSidebarCollapsed ? 'lg:w-12' : 'lg:w-80'} ${leftSidebarCollapsed ? 'hidden md:block' : ''}`}>
            {leftSidebarCollapsed ? (
              <Card className="h-fit">
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLeftSidebarCollapsed(false)}
                    className="w-full justify-center"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Products</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLeftSidebarCollapsed(true)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <TabsList className="grid grid-cols-1 gap-1 h-auto bg-transparent p-0">
                      <TabsTrigger value="pools" className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Waves className="h-4 w-4 mr-2" />
                        Pools
                      </TabsTrigger>
                      <TabsTrigger value="spas" className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Droplets className="h-4 w-4 mr-2" />
                        Spas
                      </TabsTrigger>
                      <TabsTrigger value="tanning-ledges" className="justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Sun className="h-4 w-4 mr-2" />
                        Tanning Ledges
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                      {getFilteredProducts().map((product, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedProduct?.model === product.model || selectedProduct?.name === product.name
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setSelectedProduct(product);
                            setLeftSidebarCollapsed(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.model || product.name || 'Product'} 
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {product.model || product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                ${getProductPrice(product).toLocaleString()}
                              </p>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {product.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Product Details & Configuration */}
          <div className="flex-1">
            {selectedProduct ? (
              <div className="space-y-4 md:space-y-6">
                {/* Large Product Image */}
                <Card>
                  <CardContent className="p-3 md:p-6">
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                      {selectedProduct.image ? (
                        <img 
                          src={selectedProduct.image} 
                          alt={selectedProduct.model || selectedProduct.name || 'Product'} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h1 className="text-xl md:text-2xl font-bold">
                            {selectedProduct.model || selectedProduct.name}
                          </h1>
                          <p className="text-2xl md:text-3xl font-bold text-primary mt-2">
                            ${getProductPrice(selectedProduct).toLocaleString()}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={getCategoryColor(selectedProduct.category)}>
                              {selectedProduct.category}
                            </Badge>
                            {selectedProduct.dimensions && (
                              <Badge variant="outline">{selectedProduct.dimensions}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configuration Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Additional Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    {/* Pool Finish */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Pool Finish</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newCarousel = selectedExtras.finish === 'Standard' ? 'finish' : null;
                            setSelectedExtras({ 
                              ...selectedExtras, 
                              finish: selectedExtras.finish === 'Standard' ? finishOptions[0]?.name || 'Standard' : selectedExtras.finish 
                            });
                            setActiveFeatureCarousel(newCarousel);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {selectedExtras.finish}
                          <ChevronDown className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                      {activeFeatureCarousel === 'finish' && (
                        <div className="max-h-32 overflow-hidden">
                          <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                              {finishOptions.map((finish) => (
                                <CarouselItem key={finish.name} className="pl-1 basis-1/2 md:basis-1/3">
                                  <div
                                    className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                      selectedExtras.finish === finish.name
                                        ? 'border-primary shadow-md'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      setSelectedExtras({ ...selectedExtras, finish: finish.name });
                                      setActiveFeatureCarousel(null);
                                    }}
                                  >
                                    <img src={finish.image} alt={finish.name} className="w-full h-12 md:h-16 object-cover rounded" />
                                    <p className="text-xs font-medium mt-1 truncate">{finish.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {finish.price > 0 ? `+$${finish.price.toLocaleString()}` : 'Included'}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex" />
                            <CarouselNext className="hidden md:flex" />
                          </Carousel>
                        </div>
                      )}
                    </div>

                    {/* Heater */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Pool Heater</Label>
                          <p className="text-xs text-muted-foreground">Extend your swimming season</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.heater}
                            onCheckedChange={(checked) => {
                              setSelectedExtras({ ...selectedExtras, heater: !!checked });
                              if (checked) {
                                setActiveFeatureCarousel('heater');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                      {selectedExtras.heater && activeFeatureCarousel === 'heater' && (
                        <div className="max-h-32 overflow-hidden">
                          <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                              {poolHeaters.map((heater) => (
                                <CarouselItem key={heater.name} className="pl-1 basis-1/1 md:basis-1/2">
                                  <div
                                    className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                      selectedExtras.heaterModel === heater.name
                                        ? 'border-primary shadow-md'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      setSelectedExtras({ ...selectedExtras, heaterModel: heater.name });
                                      setActiveFeatureCarousel(null);
                                    }}
                                  >
                                    <img src={heater.image} alt={heater.name} className="w-full h-12 md:h-16 object-cover rounded" />
                                    <p className="text-xs font-medium mt-1 truncate">{heater.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      ${heater.price.toLocaleString()}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex" />
                            <CarouselNext className="hidden md:flex" />
                          </Carousel>
                        </div>
                      )}
                    </div>

                    {/* Cover */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Safety Cover</Label>
                          <p className="text-xs text-muted-foreground">Protect your investment</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.cover}
                            onCheckedChange={(checked) => {
                              setSelectedExtras({ ...selectedExtras, cover: !!checked });
                              if (checked) {
                                setActiveFeatureCarousel('cover');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                      {selectedExtras.cover && activeFeatureCarousel === 'cover' && (
                        <div className="max-h-32 overflow-hidden">
                          <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                              {coverOptions.filter(cover => cover.name !== 'NO COVER').map((cover) => (
                                <CarouselItem key={cover.name} className="pl-1 basis-1/1 md:basis-1/2">
                                  <div
                                    className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                      selectedExtras.coverOption === cover.name
                                        ? 'border-primary shadow-md'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      setSelectedExtras({ ...selectedExtras, coverOption: cover.name });
                                      setActiveFeatureCarousel(null);
                                    }}
                                  >
                                    <img src={cover.image} alt={cover.name} className="w-full h-12 md:h-16 object-cover rounded" />
                                    <p className="text-xs font-medium mt-1 truncate">{cover.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      ${cover.price.toLocaleString()}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex" />
                            <CarouselNext className="hidden md:flex" />
                          </Carousel>
                        </div>
                      )}
                    </div>

                    {/* Jets */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Spa Jets</Label>
                        <p className="text-xs text-muted-foreground">Therapeutic water features</p>
                      </div>
                      <Checkbox
                        checked={selectedExtras.jets}
                        onCheckedChange={(checked) => setSelectedExtras({ ...selectedExtras, jets: !!checked })}
                      />
                    </div>

                    {selectedExtras.jets && (
                      <div>
                        <Label className="text-sm font-medium">Number of Jets</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedExtras({ 
                              ...selectedExtras, 
                              jetQuantity: Math.max(2, selectedExtras.jetQuantity - 1) 
                            })}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 min-w-[2rem] text-center">{selectedExtras.jetQuantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedExtras({ 
                              ...selectedExtras, 
                              jetQuantity: Math.min(12, selectedExtras.jetQuantity + 1) 
                            })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tiles */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Premium Tiles</Label>
                          <p className="text-xs text-muted-foreground">Upgrade waterline aesthetics</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.tiles}
                            onCheckedChange={(checked) => {
                              setSelectedExtras({ ...selectedExtras, tiles: !!checked });
                              if (checked) {
                                setActiveFeatureCarousel('tiles');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                      {selectedExtras.tiles && activeFeatureCarousel === 'tiles' && (
                        <div className="max-h-32 overflow-hidden">
                          <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                              {tileOptions.map((tile) => (
                                <CarouselItem key={tile.name} className="pl-1 basis-1/2 md:basis-1/3">
                                  <div
                                    className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                      selectedExtras.tileOption === tile.name
                                        ? 'border-primary shadow-md'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      setSelectedExtras({ ...selectedExtras, tileOption: tile.name });
                                      setActiveFeatureCarousel(null);
                                    }}
                                  >
                                    <img src={tile.image} alt={tile.name} className="w-full h-12 md:h-16 object-cover rounded" />
                                    <p className="text-xs font-medium mt-1 truncate">{tile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      ${tile.price.toLocaleString()}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex" />
                            <CarouselNext className="hidden md:flex" />
                          </Carousel>
                        </div>
                      )}
                    </div>

                    {/* Pavers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Premium Pavers</Label>
                          <p className="text-xs text-muted-foreground">Upgrade your pool deck</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.pavers}
                            onCheckedChange={(checked) => {
                              setSelectedExtras({ ...selectedExtras, pavers: !!checked });
                              if (checked) {
                                setActiveFeatureCarousel('pavers');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                      {selectedExtras.pavers && activeFeatureCarousel === 'pavers' && (
                        <div className="max-h-32 overflow-hidden">
                          <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                              {paverOptions.map((paver) => (
                                <CarouselItem key={paver.name} className="pl-1 basis-1/1 md:basis-1/2">
                                  <div
                                    className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                      selectedExtras.paverType === paver.name
                                        ? 'border-primary shadow-md'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      setSelectedExtras({ ...selectedExtras, paverType: paver.name });
                                      setActiveFeatureCarousel(null);
                                    }}
                                  >
                                    <img src={paver.image} alt={paver.name} className="w-full h-12 md:h-16 object-cover rounded" />
                                    <p className="text-xs font-medium mt-1 truncate">{paver.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      +$${paver.price.toLocaleString()}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex" />
                            <CarouselNext className="hidden md:flex" />
                          </Carousel>
                        </div>
                      )}
                    </div>

                    {/* Screen Enclosure */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-sm font-medium">Screen Enclosure</Label>
                          <p className="text-xs text-muted-foreground">Year-round comfort and protection</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedExtras.screenEnclosure}
                            onCheckedChange={(checked) => {
                              setSelectedExtras({ ...selectedExtras, screenEnclosure: !!checked });
                              if (checked) {
                                setActiveFeatureCarousel('screenEnclosure');
                              } else {
                                setActiveFeatureCarousel(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                      {selectedExtras.screenEnclosure && activeFeatureCarousel === 'screenEnclosure' && (
                        <div className="max-h-32 overflow-hidden">
                          <Carousel className="w-full">
                            <CarouselContent className="-ml-1">
                              {screenEnclosureOptions.map((enclosure) => (
                                <CarouselItem key={enclosure.name} className="pl-1 basis-1/1 md:basis-1/2">
                                  <div
                                    className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 ${
                                      selectedExtras.screenEnclosureType === enclosure.name
                                        ? 'border-primary shadow-md'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      setSelectedExtras({ ...selectedExtras, screenEnclosureType: enclosure.name });
                                      setActiveFeatureCarousel(null);
                                    }}
                                  >
                                    <img src={enclosure.image} alt={enclosure.name} className="w-full h-12 md:h-16 object-cover rounded" />
                                    <p className="text-xs font-medium mt-1 truncate">{enclosure.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      +$${enclosure.price.toLocaleString()}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex" />
                            <CarouselNext className="hidden md:flex" />
                          </Carousel>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Price Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                      <span>Price Summary</span>
                      <span className="text-2xl md:text-3xl font-bold text-primary">
                        ${calculateTotalPrice().toLocaleString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price ({selectedProduct.model || selectedProduct.name})</span>
                        <span>${getProductPrice(selectedProduct).toLocaleString()}</span>
                      </div>
                      
                      {selectedExtras.finish !== 'Standard' && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Pool Finish: {selectedExtras.finish}</span>
                          <span>+${finishOptions.find(f => f.name === selectedExtras.finish)?.price.toLocaleString() || '0'}</span>
                        </div>
                      )}
                      
                      {selectedExtras.heater && selectedExtras.heaterModel && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Heater: {selectedExtras.heaterModel}</span>
                          <span>+${poolHeaters.find(h => h.name === selectedExtras.heaterModel)?.price.toLocaleString() || '0'}</span>
                        </div>
                      )}
                      
                      {selectedExtras.cover && selectedExtras.coverOption && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Cover: {selectedExtras.coverOption}</span>
                          <span>+${coverOptions.find(c => c.name === selectedExtras.coverOption)?.price.toLocaleString() || '0'}</span>
                        </div>
                      )}
                      
                      {selectedExtras.jets && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Spa Jets: {selectedExtras.jetQuantity} jets</span>
                          <span>+${(selectedExtras.jetQuantity * 250).toLocaleString()}</span>
                        </div>
                      )}
                      
                      {selectedExtras.tiles && selectedExtras.tileOption && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tiles: {selectedExtras.tileOption}</span>
                          <span>+${tileOptions.find(t => t.name === selectedExtras.tileOption)?.price.toLocaleString() || '0'}</span>
                        </div>
                      )}

                      {selectedExtras.pavers && selectedExtras.paverType && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Pavers: {selectedExtras.paverType}</span>
                          <span>+${paverOptions.find(p => p.name === selectedExtras.paverType)?.price.toLocaleString() || '0'}</span>
                        </div>
                      )}

                      {selectedExtras.screenEnclosure && selectedExtras.screenEnclosureType && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Screen Enclosure: {selectedExtras.screenEnclosureType}</span>
                          <span>+${screenEnclosureOptions.find(e => e.name === selectedExtras.screenEnclosureType)?.price.toLocaleString() || '0'}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleCheckout} 
                      className="w-full mt-6" 
                      size="lg"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Select a Product</h2>
                  <p className="text-muted-foreground">Choose a pool, spa, or tanning ledge from the sidebar to get started.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}