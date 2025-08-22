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

  const loadDraft = () => {
    const saved = localStorage.getItem('contentEditorDraft');
    if (saved) {
      setElements(JSON.parse(saved));
      showToast({
        title: "Draft Loaded",
        description: "Previously saved draft has been loaded",
      });
    }
  };

  const handleScreenChange = (screenValue: string) => {
    setSelectedScreen(screenValue);
    setIsLivePreview(true);
    
    showToast({
      title: "Screen Preview",
      description: `Loading ${screens.find(s => s.value === screenValue)?.label} preview...`,
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-muted/5 to-background flex flex-col">
      {/* Simplified Header */}
      <div className="border-b bg-card/80 backdrop-blur-md px-6 py-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Edit3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Content Editor</h1>
                <p className="text-sm text-muted-foreground">Design mode active</p>
              </div>
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
              <Button
                variant={editMode ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setEditMode(!editMode);
                  showToast({
                    title: editMode ? "Edit Mode Disabled" : "Edit Mode Enabled",
                    description: editMode ? "Click elements to edit them" : "Edit mode is now active"
                  });
                }}
                className="px-3"
                title="Toggle edit mode - click elements to edit when enabled"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectedDevice('desktop');
                  showToast({
                    title: "Desktop View",
                    description: "Switched to desktop preview"
                  });
                }}
                title="Desktop view - full width preview"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedDevice === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectedDevice('tablet');
                  showToast({
                    title: "Tablet View",
                    description: "Switched to tablet preview"
                  });
                }}
                title="Tablet view - medium width preview"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectedDevice('mobile');
                  showToast({
                    title: "Mobile View",
                    description: "Switched to mobile preview"
                  });
                }}
                title="Mobile view - small width preview"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDarkMode = !isDarkMode;
                setIsDarkMode(newDarkMode);
                if (newDarkMode) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                showToast({
                  title: newDarkMode ? "Dark Mode Enabled" : "Light Mode Enabled",
                  description: `Switched to ${newDarkMode ? 'dark' : 'light'} theme`
                });
              }}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {pendingChanges > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {pendingChanges} changes
              </Badge>
            )}
            
            <Button
              onClick={publishChanges}
              disabled={pendingChanges === 0}
              size="sm"
              className="px-4"
              title={`Publish ${pendingChanges} pending changes to live site`}
            >
              <Save className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 bg-background relative overflow-auto">
          <div className="absolute top-4 left-4 z-40 flex gap-2">
            <Badge variant="outline" className="bg-card/90 backdrop-blur-sm">
              {selectedDevice} • {selectedScreen}
            </Badge>
            {editMode && !isPreviewMode && (
              <Badge className="bg-primary text-primary-foreground">
                Edit Mode Active
              </Badge>
            )}
            {isPreviewMode && (
              <Badge className="bg-green-500 text-white">
                Preview Mode - Interactions Disabled
              </Badge>
            )}
          </div>
          <SitePreview
            elements={elements}
            onElementClick={handleElementClick}
            editMode={editMode && !isPreviewMode}
            showOutlines={showOutlines}
            selectedDevice={selectedDevice}
            selectedScreen={selectedScreen}
            isPreviewMode={isPreviewMode}
          />
        </div>

        {/* Sidebar Tools */}
        <div className="w-80 lg:w-96 bg-card/50 backdrop-blur-sm border-l p-4 flex flex-col space-y-4 overflow-y-auto">
          
          {/* Quick Navigation */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Page Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedScreen} onValueChange={handleScreenChange}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border z-50">
                  {screens.map(screen => (
                    <SelectItem key={screen.value} value={screen.value}>
                      {screen.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Edit Controls */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Edit Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setShowOutlines(!showOutlines);
                    showToast({
                      title: showOutlines ? "Outlines Hidden" : "Outlines Shown",
                      description: showOutlines ? "Element borders are now hidden" : "Element borders are now visible"
                    });
                  }}
                  variant={showOutlines ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  title="Toggle element outlines visibility"
                >
                  {showOutlines ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button 
                  onClick={() => {
                    setIsLivePreview(!isLivePreview);
                    showToast({
                      title: isLivePreview ? "Live Preview Disabled" : "Live Preview Enabled",
                      description: isLivePreview ? "Changes will be applied manually" : "Changes will be applied in real-time"
                    });
                  }}
                  variant={isLivePreview ? "default" : "outline"}
                  size="sm" 
                  className="flex-1"
                  title="Toggle live preview mode"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Elements */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    addCustomElement('text', 'New text');
                    showToast({
                      title: "Text Added",
                      description: "New text element added to page"
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  title="Add text element"
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    addCustomElement('heading', 'New Heading');
                    showToast({
                      title: "Heading Added",
                      description: "New heading element added to page"
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  title="Add heading element"
                >
                  <Layout className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    addCustomElement('button', 'Click Me');
                    showToast({
                      title: "Button Added",
                      description: "New button element added to page"
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  title="Add button element"
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  title="Upload and add image"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>


          {/* Product Library */}
          <Card className="flex-1 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Product Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border z-50">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {loadingProducts ? (
                  <div className="text-center py-6">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  </div>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-3 bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                      onClick={() => addProductElement(product)}
                    >
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-16 object-cover rounded mb-2"
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs truncate group-hover:text-primary transition-colors">{product.name}</h4>
                          <p className="text-xs text-green-600 font-semibold">
                            ${product.price.toLocaleString()}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {product.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <div className="text-center py-6">
                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No products available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={saveAsDraft}
                  variant="outline"
                  size="sm"
                  title="Save current changes as draft"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button 
                  onClick={loadDraft}
                  variant="outline"
                  size="sm"
                  title="Load previously saved draft"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
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