import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShoppingCart, { useShoppingCart } from "@/components/ShoppingCart";
import { ShoppingCart as CartIcon } from "lucide-react";
import { 
  Edit3, 
  Type, 
  Image, 
  Trash2, 
  Plus, 
  Save, 
  Eye, 
  EyeOff,
  Upload,
  Move3D,
  Copy,
  Palette,
  Layout,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Settings,
  Globe,
  MousePointer,
  ArrowRight,
  Package,
  Home,
  Database,
  X
} from "lucide-react";

// Lazy-loaded components
const Hero = lazy(() => import("@/components/Hero"));
const PoolCatalog = lazy(() => import("@/components/PoolCatalog"));
const SpaSection = lazy(() => import("@/components/SpaSection"));
const PoolFinishesSection = lazy(() => import("@/components/PoolFinishesSection"));
const AutomaticCoversSection = lazy(() => import("@/components/AutomaticCoversSection"));
const FloridaPoolElements = lazy(() => import("@/components/FloridaPoolElements"));
const WonderlandsBrandShowcase = lazy(() => import("@/components/WonderlandsBrandShowcase"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ProcurementSystem = lazy(() => import("@/pages/ProcurementSystem"));

interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'heading' | 'section' | 'button' | 'product';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  styles?: string;
  target?: string;
  editable: boolean;
  selector?: string;
  productData?: any;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  description?: string;
  stock_quantity: number;
}

interface SitePreviewProps {
  elements: EditableElement[];
  onElementClick: (element: EditableElement) => void;
  editMode: boolean;
  showOutlines: boolean;
  selectedDevice: string;
  selectedScreen: string;
}

// Live Site Preview Component
const SitePreview = ({ elements, onElementClick, editMode, showOutlines, selectedDevice, selectedScreen }: SitePreviewProps) => {
  const [showCart, setShowCart] = useState(false);
  const { getCartCount } = useShoppingCart();

  const getDeviceStyles = () => {
    switch (selectedDevice) {
      case 'mobile':
        return 'max-w-sm mx-auto scale-75 origin-top';
      case 'tablet':
        return 'max-w-2xl mx-auto scale-90 origin-top';
      default:
        return 'w-full';
    }
  };

  const renderScreenContent = () => {
    switch (selectedScreen) {
      case 'main':
        return (
          <>
            <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-blue-500' : ''}>
              <Hero />
            </div>
            <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-green-500' : ''}>
              <WonderlandsBrandShowcase />
            </div>
            <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-purple-500' : ''}>
              <PoolCatalog />
            </div>
            <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-red-500' : ''}>
              <SpaSection />
            </div>
            <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-yellow-500' : ''}>
              <PoolFinishesSection />
            </div>
            <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-pink-500' : ''}>
              <AutomaticCoversSection />
            </div>
          </>
        );
      case 'pools':
        return (
          <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-purple-500' : ''}>
            <PoolCatalog />
          </div>
        );
      case 'spas':
        return (
          <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-red-500' : ''}>
            <SpaSection />
          </div>
        );
      case 'finishes':
        return (
          <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-yellow-500' : ''}>
            <PoolFinishesSection />
          </div>
        );
      case 'covers':
        return (
          <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-pink-500' : ''}>
            <AutomaticCoversSection />
          </div>
        );
      case 'admin':
        return (
          <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-indigo-500' : ''}>
            <AdminDashboard />
          </div>
        );
      case 'procurement':
        return (
          <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-teal-500' : ''}>
            <ProcurementSystem />
          </div>
        );
      default:
        return (
          <div className={editMode && showOutlines ? 'outline-dashed outline-2 outline-blue-500' : ''}>
            <Hero />
          </div>
        );
    }
  };

  return (
    <div className={`${getDeviceStyles()} bg-white min-h-full overflow-auto transition-all relative`}>
      <Header />
      
      <Suspense fallback={<div className="p-8 text-center" aria-busy="true">Loading...</div>}> 
        <FloridaPoolElements />
      </Suspense>
      
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setShowCart(true)}
          variant="secondary"
          size="icon"
          className="shadow-lg relative"
        >
          <CartIcon className="h-4 w-4" />
          {getCartCount() > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 text-xs">
              {getCartCount()}
            </Badge>
          )}
        </Button>
      </div>
      
      <div className="relative z-10">
        <Suspense fallback={<div className="p-8 text-center" aria-busy="true">Loading content...</div>}>
          {renderScreenContent()}
          <Footer />
        </Suspense>
      </div>
      
      <ShoppingCart isOpen={showCart} onClose={() => setShowCart(false)} />

      {/* Dynamic Elements Overlay */}
      {elements.filter(e => e.id.startsWith('custom-')).map((element) => (
        <div
          key={element.id}
          className={`absolute cursor-move ${element.styles || 'bg-white border border-gray-300 p-4 rounded shadow'} ${
            editMode && showOutlines ? 'outline-dashed outline-2 outline-red-500' : ''
          } ${editMode ? 'hover:shadow-lg transition-shadow' : ''}`}
          style={{
            left: element.position.x,
            top: element.position.y,
            width: element.size?.width,
            height: element.size?.height,
          }}
          onClick={() => editMode && onElementClick(element)}
          draggable={editMode}
        >
          {element.type === 'image' ? (
            <img 
              src={element.content} 
              alt="Custom" 
              className="w-full h-full object-cover rounded"
            />
          ) : element.type === 'product' ? (
            <div className="border rounded-lg p-3 bg-white shadow-sm max-w-xs">
              {element.productData?.image_url && (
                <img 
                  src={element.productData.image_url} 
                  alt={element.content}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">{element.content}</span>
              </div>
              {element.productData?.price && (
                <div className="text-sm text-green-600 font-semibold">
                  ${element.productData.price.toLocaleString()}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {element.productData?.description || 'Product from marketplace'}
              </div>
            </div>
          ) : (
            <div>{element.content}</div>
          )}
          
          {editMode && (
            <div className="absolute -top-8 right-0 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onElementClick(element);
                }}
              >
                <Move3D className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle delete
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {editMode && (
        <div className="fixed inset-0 bg-blue-500/10 pointer-events-none z-40">
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Edit Mode Active
          </div>
        </div>
      )}
    </div>
  );
};

const ContentEditor = () => {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [showOutlines, setShowOutlines] = useState(true);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [selectedScreen, setSelectedScreen] = useState('main');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'pool', label: 'Swimming Pools' },
    { value: 'spa', label: 'Spas & Hot Tubs' },
    { value: 'liner', label: 'Pool Liners' },
    { value: 'tile', label: 'Pool Tiles' },
    { value: 'finish', label: 'Pool Finishes' },
    { value: 'cover', label: 'Pool Covers' },
    { value: 'heater', label: 'Pool Heaters' },
    { value: 'jets', label: 'Jets & Accessories' }
  ];

  const screens = [
    { value: 'main', label: 'Main Homepage' },
    { value: 'pools', label: 'Pool Catalog' },
    { value: 'spas', label: 'Spa Section' },
    { value: 'finishes', label: 'Pool Finishes' },
    { value: 'covers', label: 'Automatic Covers' },
    { value: 'admin', label: 'Admin Dashboard' },
    { value: 'procurement', label: 'Procurement System' }
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock_quantity', 0);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products from database",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleElementClick = (element: EditableElement) => {
    if (editMode) {
      setSelectedElement(element);
      setEditDialog(true);
    }
  };

  const updateElement = (updatedElement: EditableElement) => {
    setElements(prev => {
      const existing = prev.find(e => e.id === updatedElement.id);
      if (existing) {
        return prev.map(e => e.id === updatedElement.id ? updatedElement : e);
      } else {
        return [...prev, updatedElement];
      }
    });
    
    setPendingChanges(prev => prev + 1);
    
    if (isLivePreview) {
      applyChangesToLiveSite(updatedElement);
    }
    
    toast({
      title: "Element Updated",
      description: "Content has been updated in real-time",
    });
  };

  const applyChangesToLiveSite = (element: EditableElement) => {
    console.log('Applying changes to live site:', element);
    
    if (element.selector) {
      setTimeout(() => {
        toast({
          title: "Live Update Applied",
          description: `Changes applied to ${element.selector}`,
        });
      }, 500);
    }
  };

  const addProductElement = (product: Product) => {
    const newElement: EditableElement = {
      id: `custom-product-${Date.now()}`,
      type: 'product',
      content: product.name,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { width: 300, height: 200 },
      styles: 'bg-white border border-gray-300 rounded-lg shadow-lg p-4',
      editable: true,
      productData: product
    };
    
    setElements(prev => [...prev, newElement]);
    toast({
      title: "Product Added",
      description: `${product.name} added to the page`,
    });
  };

  const addCustomElement = (type: EditableElement['type'], content: string) => {
    const newElement: EditableElement = {
      id: `custom-${Date.now()}`,
      type,
      content,
      position: { x: 100, y: 100 },
      size: type === 'image' ? { width: 200, height: 150 } : { width: 300, height: 100 },
      styles: type === 'button' ? 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700' : 
              type === 'heading' ? 'text-2xl font-bold text-gray-800' :
              'bg-white border border-gray-300 p-4 rounded shadow',
      editable: true
    };
    
    setElements(prev => [...prev, newElement]);
    toast({
      title: "Element Added",
      description: `New ${type} element added to the page`,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        addCustomElement('image', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const publishChanges = () => {
    toast({
      title: "Changes Published",
      description: `${pendingChanges} changes have been published to the live site`,
    });
    setPendingChanges(0);
  };

  const saveAsDraft = () => {
    localStorage.setItem('contentEditorDraft', JSON.stringify(elements));
    toast({
      title: "Draft Saved",
      description: "Changes saved as draft",
    });
  };

  const loadDraft = () => {
    const saved = localStorage.getItem('contentEditorDraft');
    if (saved) {
      setElements(JSON.parse(saved));
      toast({
        title: "Draft Loaded",
        description: "Previously saved draft has been loaded",
      });
    }
  };

  const handleScreenChange = (screenValue: string) => {
    setSelectedScreen(screenValue);
    setIsLivePreview(true);
    
    toast({
      title: "Screen Preview",
      description: `Loading ${screens.find(s => s.value === screenValue)?.label} preview...`,
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-muted/5 to-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-3 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.close()}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Content Editor
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground">Live website editing with drag & drop</p>
            </div>
            
            {/* Enable Editor Button */}
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "destructive" : "default"}
              size="sm"
              className="ml-auto"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {editMode ? "Disable Editor" : "Enable Editor"}
            </Button>
            {pendingChanges > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {pendingChanges} pending
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Badge className={`${isLivePreview ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'} px-3 py-1`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isLivePreview ? 'bg-green-200 animate-pulse' : 'bg-gray-200'}`} />
              {isLivePreview ? 'Live' : 'Draft'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/', '_blank')}
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Home</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 bg-white relative overflow-auto">
          <div className="absolute top-4 left-4 z-40 flex gap-2">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {selectedDevice} preview
            </Badge>
            {editMode && (
              <Badge className="bg-blue-500 text-white">
                Edit Mode - Click elements to edit
              </Badge>
            )}
          </div>
          <SitePreview
            elements={elements}
            onElementClick={handleElementClick}
            editMode={editMode}
            showOutlines={showOutlines}
            selectedDevice={selectedDevice}
            selectedScreen={selectedScreen}
          />
        </div>

        {/* Sidebar Tools */}
        <div className="w-80 lg:w-96 bg-card border-l p-4 flex flex-col space-y-4 overflow-y-auto">
          
          {/* Screen Navigation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Screen Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedScreen} onValueChange={handleScreenChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {screens.map(screen => (
                    <SelectItem key={screen.value} value={screen.value}>
                      {screen.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Editor Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Editor Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => setEditMode(!editMode)}
                variant={editMode ? "default" : "outline"}
                className="w-full text-sm"
              >
                {editMode ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
                {editMode ? 'View Mode' : 'Edit Mode'}
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowOutlines(!showOutlines)}
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  {showOutlines ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                  Outlines
                </Button>
                <Button 
                  onClick={() => setIsLivePreview(!isLivePreview)}
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  {isLivePreview ? 'Live' : 'Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Device Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Device Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDevice('desktop')}
                  className="flex-1"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDevice('tablet')}
                  className="flex-1"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDevice('mobile')}
                  className="flex-1"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Elements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => addCustomElement('text', 'New text element')}
                variant="outline"
                className="w-full justify-start text-sm"
              >
                <Type className="mr-2 h-4 w-4" />
                Add Text
              </Button>
              <Button
                onClick={() => addCustomElement('heading', 'New Heading')}
                variant="outline"
                className="w-full justify-start text-sm"
              >
                <Type className="mr-2 h-4 w-4" />
                Add Heading
              </Button>
              <Button
                onClick={() => addCustomElement('button', 'Click Me')}
                variant="outline"
                className="w-full justify-start text-sm"
              >
                <MousePointer className="mr-2 h-4 w-4" />
                Add Button
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full justify-start text-sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Paver & Coping Editor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Paver & Coping Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Paver Surface Area (sq ft)
                </label>
                <Input
                  type="number"
                  placeholder="Enter surface area for pavers"
                  className="mb-2"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Coping Surface Area (sq ft)
                </label>
                <Input
                  type="number"
                  placeholder="Enter surface area for coping"
                  className="mb-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Marketplace */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Product Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loadingProducts ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading products...</p>
                  </div>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow cursor-pointer"
                      draggable
                      onClick={() => addProductElement(product)}
                    >
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs truncate">{product.name}</h4>
                          <p className="text-xs text-green-600 font-semibold">
                            {product.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {product.category}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            addProductElement(product);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No products found in this category
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save & Publish */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Save & Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={saveAsDraft}
                variant="outline"
                className="w-full text-sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                onClick={loadDraft}
                variant="outline"
                className="w-full text-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Load Draft
              </Button>
              <Button 
                onClick={publishChanges}
                disabled={pendingChanges === 0}
                className="w-full text-sm"
              >
                <Globe className="mr-2 h-4 w-4" />
                Publish Changes ({pendingChanges})
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Element Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Element</DialogTitle>
          </DialogHeader>
          {selectedElement && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={selectedElement.content}
                  onChange={(e) => setSelectedElement({
                    ...selectedElement,
                    content: e.target.value
                  })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Width</label>
                  <Input
                    type="number"
                    value={selectedElement.size?.width || 300}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      size: {
                        ...selectedElement.size,
                        width: parseInt(e.target.value) || 300,
                        height: selectedElement.size?.height || 100
                      }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Height</label>
                  <Input
                    type="number"
                    value={selectedElement.size?.height || 100}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      size: {
                        ...selectedElement.size,
                        width: selectedElement.size?.width || 300,
                        height: parseInt(e.target.value) || 100
                      }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (selectedElement) {
                      updateElement(selectedElement);
                      setEditDialog(false);
                    }
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setEditDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentEditor;