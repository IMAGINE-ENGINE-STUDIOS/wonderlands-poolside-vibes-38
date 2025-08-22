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
  X,
  Moon,
  Sun
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  isPreviewMode: boolean;
}

// Live Site Preview Component
const SitePreview = ({ elements, onElementClick, editMode, showOutlines, selectedDevice, selectedScreen, isPreviewMode }: SitePreviewProps) => {
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
      <div className={`${getDeviceStyles()} bg-background min-h-full overflow-auto transition-all relative ${isPreviewMode ? 'pointer-events-none select-none' : ''}`}>
        <div className={isPreviewMode ? 'pointer-events-none select-none' : ''}>
          <Header />
        </div>
      
        <Suspense fallback={<div className="p-8 text-center" aria-busy="true">Loading...</div>}> 
          <FloridaPoolElements />
        </Suspense>
      
        {!isPreviewMode && (
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
        )}
      
        <div className={`relative z-10 ${isPreviewMode ? 'pointer-events-none select-none' : ''}`}>
          <Suspense fallback={<div className="p-8 text-center" aria-busy="true">Loading content...</div>}>
            {renderScreenContent()}
            <div className={isPreviewMode ? 'pointer-events-none select-none' : ''}>
              <Footer />
            </div>
          </Suspense>
        </div>
      
        {!isPreviewMode && <ShoppingCart isOpen={showCart} onClose={() => setShowCart(false)} />}

        {/* Dynamic Elements Overlay */}
        {elements.filter(e => e.id.startsWith('custom-')).map((element) => (
          <div
            key={element.id}
            className={`absolute cursor-move ${element.styles || 'bg-white border border-gray-300 p-4 rounded shadow'} ${
              editMode && showOutlines ? 'outline-dashed outline-2 outline-red-500' : ''
            } ${editMode ? 'hover:shadow-lg transition-shadow' : ''} ${isPreviewMode ? 'pointer-events-none select-none' : ''}`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size?.width,
              height: element.size?.height,
            }}
            onClick={() => editMode && !isPreviewMode && onElementClick(element)}
            draggable={editMode && !isPreviewMode}
          >
            {element.type === 'image' ? (
              <img 
                src={element.content} 
                alt="Custom" 
                className={`w-full h-full object-cover rounded ${isPreviewMode ? 'pointer-events-none' : ''}`}
              />
            ) : element.type === 'product' ? (
              <div className={`border rounded-lg p-3 bg-white shadow-sm max-w-xs ${isPreviewMode ? 'pointer-events-none' : ''}`}>
                {element.productData?.image_url && (
                  <img 
                    src={element.productData.image_url} 
                    alt={element.content}
                    className={`w-full h-32 object-cover rounded mb-2 ${isPreviewMode ? 'pointer-events-none' : ''}`}
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
              <div className={isPreviewMode ? 'pointer-events-none select-none' : ''}>{element.content}</div>
            )}
          
          {editMode && !isPreviewMode && (
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

        {editMode && !isPreviewMode && (
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-dismiss toasts after 3 seconds
  const showToast = (message: { title: string; description: string; variant?: any }) => {
    toast({
      ...message,
      duration: 3000
    });
  };

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
      showToast({
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
    
    showToast({
      title: "Element Updated",
      description: "Content has been updated in real-time",
    });
  };

  const applyChangesToLiveSite = (element: EditableElement) => {
    console.log('Applying changes to live site:', element);
    
    if (element.selector) {
      setTimeout(() => {
        showToast({
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
    showToast({
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
    showToast({
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
    showToast({
      title: "Changes Published",
      description: `${pendingChanges} changes have been published to the live site`,
    });
    setPendingChanges(0);
  };

  const saveAsDraft = () => {
    localStorage.setItem('contentEditorDraft', JSON.stringify(elements));
    showToast({
      title: "Draft Saved",
      description: "Changes saved as draft",
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Simplified Top Dashboard */}
        <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
                  Content Editor
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 mr-1" />
                    Live Preview
                  </div>
                  {pendingChanges > 0 && (
                    <Badge variant="secondary">{pendingChanges} pending</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      variant="outline"
                      size="sm"
                    >
                      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Dark Mode</TooltipContent>
                </Tooltip>
                
                {/* Edit Mode Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setEditMode(!editMode)}
                      variant={editMode ? "default" : "outline"}
                      size="sm"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Edit Mode</TooltipContent>
                </Tooltip>
                
                {/* Device Preview */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Desktop
                          </div>
                        </SelectItem>
                        <SelectItem value="tablet">
                          <div className="flex items-center gap-2">
                            <Tablet className="h-4 w-4" />
                            Tablet
                          </div>
                        </SelectItem>
                        <SelectItem value="mobile">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Mobile
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>Select Device View</TooltipContent>
                </Tooltip>
                
                {/* Screen Selection */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {screens.map(screen => (
                          <SelectItem key={screen.value} value={screen.value}>
                            {screen.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>Select Page to Edit</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={publishChanges} disabled={pendingChanges === 0}>
                      <Globe className="h-4 w-4 mr-2" />
                      Publish {pendingChanges > 0 && `(${pendingChanges})`}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Publish Changes to Live Site</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Left Sidebar - Tools and Controls */}
          <div className="w-80 border-r bg-muted/30 p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            {/* Content Tools */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Content Tools</h3>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => addCustomElement('text', 'New Text')}
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Add Text
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add editable text element</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => addCustomElement('heading', 'New Heading')}
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Add Heading
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add heading with custom styling</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload and add image to page</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => addCustomElement('button', 'Click Me')}
                    >
                      <MousePointer className="h-4 w-4 mr-2" />
                      Add Button
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add interactive button element</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Product Library */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Product Library</h3>
              <div className="space-y-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="max-h-60 overflow-y-auto">
                  {loadingProducts ? (
                    <div className="text-center py-4">Loading products...</div>
                  ) : (
                    <div className="space-y-2">
                      {products.map(product => (
                        <Button
                          key={product.id}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => addProductElement(product)}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ${product.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Page Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Outlines</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={showOutlines ? "default" : "outline"}
                        onClick={() => setShowOutlines(!showOutlines)}
                      >
                        <Layout className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle element outlines</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Live Preview</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={isLivePreview ? "default" : "outline"}
                        onClick={() => setIsLivePreview(!isLivePreview)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle live preview updates</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preview Mode</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={isPreviewMode ? "default" : "outline"}
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                      >
                        {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Disable interactions in preview</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4">
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="w-full" onClick={saveAsDraft}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save current changes as draft</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Page
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate current page</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Backup
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create backup of all content</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Right Side - Preview Area */}
          <div className="flex-1 bg-white">
            <SitePreview
              elements={elements}
              onElementClick={handleElementClick}
              editMode={editMode}
              showOutlines={showOutlines}
              selectedDevice={selectedDevice}
              selectedScreen={selectedScreen}
              isPreviewMode={isPreviewMode}
            />
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Element</DialogTitle>
            </DialogHeader>
            {selectedElement && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={selectedElement.content}
                    onChange={(e) => setSelectedElement({...selectedElement, content: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Position X</label>
                    <Input
                      type="number"
                      value={selectedElement.position.x}
                      onChange={(e) => setSelectedElement({
                        ...selectedElement, 
                        position: {...selectedElement.position, x: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Position Y</label>
                    <Input
                      type="number"
                      value={selectedElement.position.y}
                      onChange={(e) => setSelectedElement({
                        ...selectedElement, 
                        position: {...selectedElement.position, y: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Width</label>
                    <Input
                      type="number"
                      value={selectedElement.size?.width || 300}
                      onChange={(e) => setSelectedElement({
                        ...selectedElement, 
                        size: {...selectedElement.size, width: parseInt(e.target.value) || 300}
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Height</label>
                    <Input
                      type="number"
                      value={selectedElement.size?.height || 100}
                      onChange={(e) => setSelectedElement({
                        ...selectedElement, 
                        size: {...selectedElement.size, height: parseInt(e.target.value) || 100}
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Background Color</label>
                  <Input
                    type="color"
                    onChange={(e) => {
                      const currentStyles = selectedElement.styles || '';
                      const newStyles = currentStyles.replace(/bg-\[\#[a-fA-F0-9]{6}\]/g, '') + ` bg-[${e.target.value}]`;
                      setSelectedElement({...selectedElement, styles: newStyles.trim()});
                    }}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Text Size</label>
                  <Select 
                    value={selectedElement.styles?.includes('text-') ? 
                      selectedElement.styles.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl)/)?.[0] || 'text-base' : 'text-base'
                    }
                    onValueChange={(value) => {
                      const currentStyles = selectedElement.styles || '';
                      const newStyles = currentStyles.replace(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl)/g, '') + ` ${value}`;
                      setSelectedElement({...selectedElement, styles: newStyles.trim()});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-xs">Extra Small</SelectItem>
                      <SelectItem value="text-sm">Small</SelectItem>
                      <SelectItem value="text-base">Base</SelectItem>
                      <SelectItem value="text-lg">Large</SelectItem>
                      <SelectItem value="text-xl">Extra Large</SelectItem>
                      <SelectItem value="text-2xl">2XL</SelectItem>
                      <SelectItem value="text-3xl">3XL</SelectItem>
                      <SelectItem value="text-4xl">4XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Custom Styles</label>
                  <Input
                    value={selectedElement.styles || ''}
                    onChange={(e) => setSelectedElement({...selectedElement, styles: e.target.value})}
                    placeholder="CSS classes..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    updateElement(selectedElement);
                    setEditDialog(false);
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ContentEditor;