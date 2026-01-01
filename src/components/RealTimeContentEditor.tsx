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
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShoppingCart from "@/components/ShoppingCart";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
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
  Package
} from "lucide-react";
import { DEFAULT_PAVER_PRICE_PER_SQFT, calculatePaverCost } from "@/utils/paverPricing";

// Lazy-loaded components
const Hero = lazy(() => import("@/components/Hero"));
const PoolCatalog = lazy(() => import("@/components/PoolCatalog"));
const SpaSection = lazy(() => import("@/components/SpaSection"));
const PoolFinishesSection = lazy(() => import("@/components/PoolFinishesSection"));
const AutomaticCoversSection = lazy(() => import("@/components/AutomaticCoversSection"));
const FloridaPoolElements = lazy(() => import("@/components/FloridaPoolElements"));
const WonderlandsBrandShowcase = lazy(() => import("@/components/WonderlandsBrandShowcase"));

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
}

interface RealTimeContentEditorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SitePreviewProps {
  elements: EditableElement[];
  onElementClick: (element: EditableElement) => void;
  editMode: boolean;
  showOutlines: boolean;
  selectedDevice: string;
}

// Live Site Preview Component that displays the actual website content
const SitePreview = ({ elements, onElementClick, editMode, showOutlines, selectedDevice }: SitePreviewProps) => {
  const [showCart, setShowCart] = useState(false);
  const { getCartCount } = useShoppingCart();

  const getDeviceStyles = () => {
    switch (selectedDevice) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  return (
    <div className={`${getDeviceStyles()} bg-white min-h-full overflow-auto transition-all relative`}>
      {/* Actual Site Content */}
      <Header />
      
      <Suspense fallback={<div className="sr-only" aria-busy="true">Loading visual elements…</div>}> 
        <FloridaPoolElements />
      </Suspense>
      
      {/* Shopping Cart Button */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setShowCart(true)}
          variant="secondary"
          size="icon"
          className="shadow-lg relative"
          title="Shopping Cart"
          aria-label="Open shopping cart"
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
        <Suspense fallback={<div className="p-8 text-center text-foreground/70" aria-busy="true">Loading content…</div>}>
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
          <Footer />
        </Suspense>
      </div>
      
      {/* Shopping Cart Modal */}
      <ShoppingCart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />

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
            <div className="border rounded-lg p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">{element.content}</span>
              </div>
              <div className="text-xs text-gray-500">Drag & drop product</div>
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

      {/* Edit Mode Overlay */}
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

const RealTimeContentEditor = ({ isOpen = true, onClose }: RealTimeContentEditorProps) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [showOutlines, setShowOutlines] = useState(true);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSurfaceAreaDialog, setShowSurfaceAreaDialog] = useState(false);
  const [surfaceArea, setSurfaceArea] = useState('');
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [selectedScreen, setSelectedScreen] = useState('main');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

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
    // In a real implementation, this would update the actual DOM elements
    console.log('Applying changes to live site:', element);
    
    // Simulate DOM manipulation
    if (element.selector) {
      // This would target actual DOM elements in the live site
      setTimeout(() => {
        toast({
          title: "Live Update Applied",
          description: `Changes applied to ${element.selector}`,
        });
      }, 500);
    }
  };

  const addCustomElement = (type: EditableElement['type'], content: string) => {
    const newElement: EditableElement = {
      id: `custom-${generateId()}`,
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
    // In a real implementation, this would publish changes to the live site
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

  const [poolArea, setPoolArea] = useState('');
  const [patioArea, setPatioArea] = useState('');

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === 'pavers' || category === 'copings') {
      setShowSurfaceAreaDialog(true);
    }
  };

  const calculatePaverCost = () => {
    const totalPatioArea = parseFloat(patioArea);
    const poolAreaValue = parseFloat(poolArea);
    
    if (isNaN(totalPatioArea) || totalPatioArea <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid patio surface area",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(poolAreaValue) || poolAreaValue < 0) {
      toast({
        title: "Invalid Input", 
        description: "Please enter a valid pool area (or 0 if no pool)",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate actual surface area (patio minus pool area)
    const actualSurfaceArea = Math.max(0, totalPatioArea - poolAreaValue);
    const cost = actualSurfaceArea * DEFAULT_PAVER_PRICE_PER_SQFT;
    
    setCalculatedCost(cost);
    setSurfaceArea(actualSurfaceArea.toString());
    
    toast({
      title: "Cost Calculated",
      description: `Surface area: ${actualSurfaceArea} sq ft (${totalPatioArea} - ${poolAreaValue}) = $${cost.toLocaleString()}`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="h-full bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="flex h-full flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Live Content Editor & Marketplace
                </h1>
                <p className="text-sm text-muted-foreground">Real-time website editing with instant preview</p>
              </div>
              {pendingChanges > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                  {pendingChanges} pending changes
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${isLivePreview ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'} px-3 py-1`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isLivePreview ? 'bg-green-200 animate-pulse' : 'bg-gray-200'}`} />
                {isLivePreview ? 'Live Preview' : 'Draft Mode'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-4 p-4 overflow-hidden">
          {/* Main Editor Area - Enhanced Live Preview */}
          <div className="flex-1 border-2 rounded-xl bg-white relative overflow-auto min-w-0 shadow-lg">
            <div className="absolute top-4 left-4 z-40 flex gap-2">
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                {selectedDevice} preview
              </Badge>
              {editMode && (
                <Badge className="bg-blue-500 text-white">
                  Edit Mode Active - Click elements to edit
                </Badge>
              )}
            </div>
            <SitePreview
              elements={elements}
              onElementClick={handleElementClick}
              editMode={editMode}
              showOutlines={showOutlines}
              selectedDevice={selectedDevice}
            />
          </div>

          {/* Enhanced Right Sidebar - Tools Panel */}
          <div className="w-96 bg-card border rounded-xl p-4 flex flex-col space-y-4 overflow-y-auto shadow-lg">
            
            {/* Screen Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Screen Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="main">Main Homepage</SelectItem>
                    <SelectItem value="pools">Pool Catalog</SelectItem>
                    <SelectItem value="spas">Spa Section</SelectItem>
                    <SelectItem value="finishes">Pool Finishes</SelectItem>
                    <SelectItem value="covers">Automatic Covers</SelectItem>
                    <SelectItem value="admin">Admin Dashboard</SelectItem>
                    <SelectItem value="procurement">Procurement System</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Editor Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Editor Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? "default" : "outline"}
                  className="w-full"
                >
                  {editMode ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
                  {editMode ? 'View Mode' : 'Edit Mode'}
                </Button>
                
                <Button 
                  onClick={() => setShowOutlines(!showOutlines)}
                  variant="outline"
                  className="w-full"
                >
                  {showOutlines ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showOutlines ? 'Hide Outlines' : 'Show Outlines'}
                </Button>

                <Button 
                  onClick={() => setIsLivePreview(!isLivePreview)}
                  variant={isLivePreview ? "default" : "outline"}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isLivePreview ? 'Live Mode' : 'Draft Mode'}
                </Button>
              </CardContent>
            </Card>

            {/* Device Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Device Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
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
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={saveAsDraft} variant="outline" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>

                <Button onClick={loadDraft} variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Load Draft
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Image className="mr-2 h-4 w-4" />
                  Add Image
                </Button>

                <Button 
                  onClick={() => addCustomElement('text', 'New text element')}
                  variant="outline"
                  className="w-full"
                >
                  <Type className="mr-2 h-4 w-4" />
                  Add Text
                </Button>
                
                <Button 
                  onClick={() => addCustomElement('heading', 'New heading')}
                  variant="outline"
                  className="w-full"
                >
                  <Type className="mr-2 h-4 w-4" />
                  Add Heading
                </Button>

                <Button 
                  onClick={() => addCustomElement('button', 'New button')}
                  variant="outline"
                  className="w-full"
                >
                  <Layout className="mr-2 h-4 w-4" />
                  Add Button
                </Button>
              </CardContent>
            </Card>

            {/* Publish Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Publish Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">Pending Changes</h4>
                      <p className="text-xs text-muted-foreground">
                        {pendingChanges} changes ready to publish
                      </p>
                    </div>
                    <Badge>{pendingChanges}</Badge>
                  </div>
                  
                  <Button onClick={publishChanges} className="w-full" disabled={pendingChanges === 0}>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish to Live Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Categories & Drag-Drop */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Product Categories & Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { id: 'spas', name: 'Spas & Hot Tubs', description: 'Relaxation solutions', products: ['Luxury Spa', 'Corner Spa', 'Family Spa'] },
                    { id: 'pavers', name: 'Pavers', description: '$25/sq ft (incl. installation)', products: ['Travertine Pavers', 'Concrete Pavers', 'Natural Stone'] },
                    { id: 'copings', name: 'Copings', description: '$20/sq ft (incl. installation)', products: ['Pool Coping Edge', 'Decorative Coping', 'Safety Coping'] },
                    { id: 'tiles', name: 'Pool Tiles', description: 'Decorative finishes', products: ['Ceramic Tiles', 'Glass Tiles', 'Natural Stone Tiles'] },
                    { id: 'covers', name: 'Pool Covers', description: 'Safety & maintenance', products: ['NO COVER', 'Automatic Cover', 'Safety Cover', 'Solar Cover'] },
                    { id: 'lighting', name: 'LED Lighting', description: 'Ambiance & safety', products: ['Underwater LED', 'Landscape Lighting', 'Color Changing Lights'] },
                    { id: 'heating', name: 'Pool Heating', description: 'Extend swimming season', products: ['Heat Pump', 'Solar Heater', 'Gas Heater'] },
                    { id: 'liners', name: 'Pool Liners', description: 'Premium finishes', products: ['Vinyl Liner', 'Pattern Liner', 'Designer Liner'] },
                    { id: 'automation', name: 'Pool Automation', description: 'Smart controls', products: ['Control System', 'Mobile App', 'Voice Control'] },
                  ].map((category) => (
                    <div key={category.id} className="border rounded-lg p-2">
                      <Button
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        className="w-full text-left justify-start h-auto p-2 mb-2"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <div>
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                      </Button>
                      
              {selectedCategory === category.id && (
                         <div className="space-y-2 ml-2">
                           {category.products.map((product, idx) => (
                             <div
                               key={idx}
                               className="group flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg cursor-grab hover:from-blue-50 hover:to-blue-100 transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-md"
                               draggable
                               onDragStart={(e) => {
                                 e.dataTransfer.setData('text/plain', JSON.stringify({
                                   type: 'product',
                                   content: product,
                                   category: category.name,
                                   price: category.id === 'pavers' || category.id === 'copings' ? 25 : Math.floor(Math.random() * 5000) + 1000
                                 }));
                               }}
                               onDragEnd={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 addCustomElement('product', `${category.name}: ${product}`);
                                 toast({
                                   title: "Product Added",
                                   description: `${product} added to page`,
                                 });
                               }}
                             >
                               <div className="p-1 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                                 <Package className="h-4 w-4 text-blue-600" />
                               </div>
                               <div className="flex-1">
                                 <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{product}</span>
                                 <div className="text-xs text-gray-500">{category.name}</div>
                               </div>
                               <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                 <ArrowRight className="h-4 w-4 text-blue-500" />
                               </div>
                             </div>
                           ))}
                           <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                             <div className="text-xs font-medium text-blue-700 mb-1">✨ Drag & Drop Instructions:</div>
                             <div className="text-xs text-blue-600">Drag any product to the preview area to add it instantly to your page</div>
                           </div>
                         </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedCategory && calculatedCost > 0 && (selectedCategory === 'pavers' || selectedCategory === 'copings') && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800">
                      {selectedCategory === 'pavers' ? 'Pavers' : 'Copings'} Cost Calculator
                    </div>
                    <div className="mt-2 text-lg font-bold text-green-600">
                      Total Cost: ${calculatedCost.toLocaleString()}
                      <div className="text-xs text-green-600 font-normal">
                        Surface area: {surfaceArea} sq ft × $25/sq ft
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Element Movement Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Element Movement & Positioning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-600 mb-3">
                  Select any element to move, resize, or modify its properties
                </div>
                
                <Button 
                  onClick={() => addCustomElement('text', 'Draggable Text Box')}
                  variant="outline"
                  className="w-full text-xs"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Movable Text Box
                </Button>
                
                <Button 
                  onClick={() => addCustomElement('image', '/placeholder.svg')}
                  variant="outline"
                  className="w-full text-xs"
                >
                  <Image className="mr-2 h-3 w-3" />
                  Add Movable Image
                </Button>

                <div className="pt-2 border-t">
                  <div className="text-xs font-medium mb-2">Movement Tips:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Drag elements to reposition</li>
                    <li>• Click to edit content</li>
                    <li>• Use controls to resize</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Element Dialog */}
        {editDialog && selectedElement && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
              <h3 className="text-lg font-semibold mb-4">Edit Element</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    value={selectedElement.content}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      content: e.target.value
                    })}
                  />
                </div>
                {selectedElement.id.startsWith('custom-') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">X Position</label>
                      <Input
                        type="number"
                        value={selectedElement.position.x}
                        onChange={(e) => setSelectedElement({
                          ...selectedElement,
                          position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Y Position</label>
                      <Input
                        type="number"
                        value={selectedElement.position.y}
                        onChange={(e) => setSelectedElement({
                          ...selectedElement,
                          position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      updateElement(selectedElement);
                      setEditDialog(false);
                    }}
                  >
                    Update & Apply
                  </Button>
                  <Button variant="outline" onClick={() => setEditDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Surface Area Calculator Dialog */}
        {showSurfaceAreaDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
              <h3 className="text-lg font-semibold mb-4">Calculate {selectedCategory === 'pavers' ? 'Paver' : 'Coping'} Cost</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Total Patio Area (sq ft)</label>
                  <Input
                    type="number"
                    placeholder="Enter total patio area"
                    value={patioArea}
                    onChange={(e) => setPatioArea(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Total area where {selectedCategory} will be installed</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Pool Area (sq ft)</label>
                  <Input
                    type="number"
                    placeholder="Enter pool area (0 if no pool)"
                    value={poolArea}
                    onChange={(e) => setPoolArea(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Pool area to subtract from total patio area</p>
                </div>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <div className="font-medium mb-1">Calculation:</div>
                  <div>Cost: $20 per sq ft (includes installation)</div>
                  <div>Surface Area = Total Patio - Pool Area</div>
                  {patioArea && poolArea && !isNaN(parseFloat(patioArea)) && !isNaN(parseFloat(poolArea)) && (
                    <div className="mt-2">
                      <div className="text-sm">
                        {parseFloat(patioArea)} - {parseFloat(poolArea)} = {Math.max(0, parseFloat(patioArea) - parseFloat(poolArea))} sq ft
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        Estimated Total: ${(Math.max(0, parseFloat(patioArea) - parseFloat(poolArea)) * 20).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculatePaverCost} className="flex-1">
                    Calculate Final Cost
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowSurfaceAreaDialog(false);
                      setPatioArea('');
                      setPoolArea('');
                      setSurfaceArea('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeContentEditor;