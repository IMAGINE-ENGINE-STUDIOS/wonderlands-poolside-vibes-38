import * as React from "react";
const { useState, useRef, useEffect, lazy, Suspense, createContext } = React;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WebBuilderContext, useWebBuilder, EditableElement } from "@/hooks/useWebBuilder";
import WebBuilderTools from "@/components/WebBuilderTools";
import ProductGallery from "@/components/ProductGallery";
import EditableSection from "@/components/EditableSection";
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
import FixedEditorStudio from "@/components/FixedEditorStudio";

// Lazy-loaded components - Now editable
const EditableIndex = lazy(() => import("@/pages/EditableIndex"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ProcurementSystem = lazy(() => import("@/pages/ProcurementSystem"));

// Remove interface as it's now imported from useWebBuilder hook

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
  selectedDevice: string;
  selectedScreen: string;
}

// Enhanced Site Preview Component
const SitePreview = ({ selectedDevice, selectedScreen }: SitePreviewProps) => {
  const builderContext = useWebBuilder();

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
        return <EditableIndex />;
      case 'admin':
        return <AdminDashboard />;
      case 'procurement':
        return <ProcurementSystem />;
      default:
        return <EditableIndex />;
    }
  };

    return (
      <WebBuilderContext.Provider value={builderContext}>
        <div className={`${getDeviceStyles()} bg-background min-h-full overflow-auto transition-all relative`}>
          <Suspense fallback={<div className="p-8 text-center" aria-busy="true">Loading content...</div>}>
            {renderScreenContent()}
          </Suspense>
          
          {/* Builder Mode Indicator */}
          {builderContext.isBuilderMode && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              🔧 Builder Mode Active - Edit your website
            </div>
          )}
        </div>
      </WebBuilderContext.Provider>
    );
  };

const ContentEditor = () => {
  const builderContext = useWebBuilder();
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [selectedScreen, setSelectedScreen] = useState('main');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  // Load products on mount and category change
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

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
    { value: 'main', label: 'Main Website' },
    { value: 'admin', label: 'Admin Dashboard' },
    { value: 'procurement', label: 'Procurement System' }
  ];

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

      const { data, error } = await query.limit(50);

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

  const handleAddSection = (sectionType: string) => {
    toast({
      title: "Section Added",
      description: `${sectionType} section added to the page`,
    });
  };

  const handleSave = () => {
    // Save current builder state
    localStorage.setItem('webBuilderState', JSON.stringify(builderContext.elements));
    toast({
      title: "Changes Saved",
      description: "Your website changes have been saved",
    });
  };

  return (
    <WebBuilderContext.Provider value={builderContext}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {/* Enhanced Top Dashboard */}
          <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-1" />
                      Web Builder
                    </div>
                    <Badge variant={builderContext.isBuilderMode ? "default" : "secondary"}>
                      {builderContext.isBuilderMode ? 'Building' : 'Preview'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Builder Mode Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={builderContext.toggleBuilderMode}
                        variant={builderContext.isBuilderMode ? "default" : "outline"}
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle Builder Mode</TooltipContent>
                  </Tooltip>
                  
                  {/* Device Preview */}
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-[100]">
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
                  
                  {/* Screen Selection */}
                  <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border max-h-64 overflow-y-auto z-[100]">
                      {screens.map(screen => (
                        <SelectItem key={screen.value} value={screen.value}>
                          {screen.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1">
            {/* Builder Tools Sidebar */}
            {builderContext.isBuilderMode && (
              <div className="w-80 border-r bg-muted/5 p-4 overflow-y-auto h-screen">
                <WebBuilderTools
                  products={products}
                  onAddElement={builderContext.addElement}
                  onAddSection={handleAddSection}
                  onUndo={builderContext.undo}
                  onRedo={builderContext.redo}
                  onSave={handleSave}
                  canUndo={builderContext.currentHistoryIndex > 0}
                  canRedo={builderContext.currentHistoryIndex < builderContext.editHistory.length - 1}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 bg-background">
              <SitePreview
                selectedDevice={selectedDevice}
                selectedScreen={selectedScreen}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </WebBuilderContext.Provider>
  );
};

export default ContentEditor;