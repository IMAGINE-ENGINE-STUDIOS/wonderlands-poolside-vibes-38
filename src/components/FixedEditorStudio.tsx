import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Video,
  Users,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TextCard from './TextCard';
import JoinVideoChat from './JoinVideoChat';

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
  productData?: {
    name: string;
    price: number;
    image?: string;
    category: string;
    type: string;
    description?: string;
    features?: string[];
    options?: ProductOption[];
  };
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  image?: string;
  selected: boolean;
}

interface FixedEditorStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const FixedEditorStudio: React.FC<FixedEditorStudioProps> = ({ isOpen, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [showOutlines, setShowOutlines] = useState(true);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [showTextCard, setShowTextCard] = useState(false);
  const [showJoinChat, setShowJoinChat] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<EditableElement[]>([]);
  const [totalQuoteAmount, setTotalQuoteAmount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Load saved elements on mount
  useEffect(() => {
    const saved = localStorage.getItem('editorStudioElements');
    if (saved) {
      try {
        setElements(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved elements:', error);
      }
    }
  }, []);

  // Auto-save elements
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem('editorStudioElements', JSON.stringify(elements));
    }
  }, [elements]);

  // Listen for product selection from search
  useEffect(() => {
    const handleOpenEditor = (event: CustomEvent) => {
      const product = event.detail.product;
      addProductElement(product);
    };

    window.addEventListener('openEditorStudio', handleOpenEditor as EventListener);
    return () => window.removeEventListener('openEditorStudio', handleOpenEditor as EventListener);
  }, []);

  // Calculate total quote amount
  useEffect(() => {
    const products = elements.filter(el => el.type === 'product' && el.productData);
    const total = products.reduce((sum, product) => {
      const basePrice = product.productData?.price || 0;
      const optionsPrice = product.productData?.options?.reduce((optSum, opt) => 
        opt.selected ? optSum + opt.price : optSum, 0) || 0;
      return sum + basePrice + optionsPrice;
    }, 0);
    setTotalQuoteAmount(total);
    setSelectedProducts(products);
  }, [elements]);

  const addProductElement = (product: any) => {
    const productOptions: ProductOption[] = [];
    
    // Add relevant options based on product type
    if (product.type === 'pool') {
      productOptions.push(
        { id: 'heater', name: 'Pool Heater', price: 5000, image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png', selected: false },
        { id: 'cover', name: 'Automatic Cover', price: 16000, image: '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png', selected: false },
        { id: 'jets', name: 'Spa Jets', price: 1800, image: '/lovable-uploads/4f27a800-295b-476c-924c-1790ab191a5c.png', selected: false },
        { id: 'lights', name: 'LED Lights', price: 800, selected: false }
      );
    } else if (product.type === 'finish') {
      productOptions.push(
        { id: 'premium', name: 'Premium Application', price: 2000, selected: false },
        { id: 'warranty', name: 'Extended Warranty', price: 500, selected: false }
      );
    } else if (product.type === 'cover') {
      productOptions.push(
        { id: 'installation', name: 'Professional Installation', price: 1500, selected: false },
        { id: 'maintenance', name: 'Maintenance Package', price: 800, selected: false }
      );
    }

    const newElement: EditableElement = {
      id: generateId(),
      type: 'product',
      content: product.name,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { width: 400, height: 350 },
      styles: 'bg-background border border-border rounded-lg shadow-lg overflow-hidden',
      editable: true,
      productData: {
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        type: product.type,
        description: product.description,
        features: product.features,
        options: productOptions
      }
    };
    
    setElements(prev => [...prev, newElement]);
    setPendingChanges(prev => prev + 1);
    
    toast({
      title: "Product Added",
      description: `${product.name} added to your configuration`,
    });
  };

  const addElement = (type: EditableElement['type'], content: string) => {
    const newElement: EditableElement = {
      id: generateId(),
      type,
      content,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { 
        width: type === 'image' ? 200 : type === 'product' ? 400 : 300, 
        height: type === 'image' ? 150 : type === 'button' ? 40 : type === 'product' ? 350 : 100 
      },
      styles: type === 'button' ? 'bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90' : 
              type === 'heading' ? 'text-2xl font-bold text-foreground' :
              type === 'product' ? 'bg-background border border-border rounded-lg shadow-lg overflow-hidden' :
              'bg-background border border-border p-4 rounded shadow',
      editable: true
    };
    
    setElements(prev => [...prev, newElement]);
    setPendingChanges(prev => prev + 1);
    
    toast({
      title: "Element Added",
      description: `New ${type} element added successfully`,
    });
  };

  const updateElement = (updatedElement: EditableElement) => {
    setElements(prev => prev.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    ));
    
    setPendingChanges(prev => prev + 1);
    
    if (isLivePreview) {
      setTimeout(() => {
        toast({
          title: "Element Updated",
          description: "Changes applied in real-time",
        });
      }, 500);
    }
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
    setPendingChanges(prev => prev + 1);
    
    toast({
      title: "Element Deleted",
      description: "Element removed successfully",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        addElement('image', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = () => {
    localStorage.setItem('editorStudioElements', JSON.stringify(elements));
    setPendingChanges(0);
    
    toast({
      title: "Changes Saved",
      description: `${elements.length} elements saved successfully`,
    });
  };

  const publishChanges = () => {
    toast({
      title: "Changes Published",
      description: `${pendingChanges} changes published to live site`,
    });
    setPendingChanges(0);
  };

  const generateQuote = () => {
    const quoteData = {
      products: selectedProducts.map(product => ({
        name: product.productData?.name,
        price: product.productData?.price,
        image: product.productData?.image,
        options: product.productData?.options?.filter(opt => opt.selected)
      })),
      totalAmount: totalQuoteAmount,
      timestamp: new Date().toISOString()
    };

    // Create printable quote
    const quoteWindow = window.open('', '_blank');
    if (quoteWindow) {
      quoteWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pool Configuration Quote</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                .print-hide { display: none !important; }
                body { margin: 0; padding: 20px; }
                * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
              }
            </style>
          </head>
          <body class="bg-white">
            <div class="max-w-4xl mx-auto p-8">
              <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-blue-600 mb-2">Wonderlands Pools</h1>
                <h2 class="text-xl text-gray-700">Pool Configuration Quote</h2>
              </div>
              
              <div class="grid gap-6">
                ${selectedProducts.map(product => `
                  <div class="border rounded-lg p-4 shadow-sm">
                    <div class="flex items-start gap-4">
                      ${product.productData?.image ? `
                        <img src="${product.productData.image}" alt="${product.productData.name}" class="w-32 h-24 object-cover rounded">
                      ` : ''}
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold">${product.productData?.name}</h3>
                        <p class="text-sm text-gray-600 mb-2">${product.productData?.category}</p>
                        <div class="text-xl font-bold text-blue-600">$${product.productData?.price.toLocaleString()}</div>
                        ${product.productData?.options?.filter(opt => opt.selected).length ? `
                          <div class="mt-3">
                            <h4 class="font-medium text-sm mb-2">Selected Options:</h4>
                            ${product.productData.options.filter(opt => opt.selected).map(option => `
                              <div class="flex items-center gap-2 text-sm">
                                ${option.image ? `<img src="${option.image}" alt="${option.name}" class="w-8 h-8 object-cover rounded">` : ''}
                                <span>${option.name}: +$${option.price.toLocaleString()}</span>
                              </div>
                            `).join('')}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="mt-8 p-6 bg-blue-50 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="text-xl font-semibold">Total Quote Amount:</span>
                  <span class="text-3xl font-bold text-blue-600">$${totalQuoteAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="mt-6 text-center text-sm text-gray-600">
                <p>Quote generated on ${new Date().toLocaleDateString()}</p>
                <p>Valid for 30 days from quote date</p>
              </div>
            </div>
            
            <script>
              window.addEventListener('load', function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              });
            </script>
          </body>
        </html>
      `);
      quoteWindow.document.close();
    }
  };

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

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen && !showTextCard && !showJoinChat} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl h-[95vh] overflow-hidden p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-background/80 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <DialogTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    Editor Studio
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={editMode ? "default" : "secondary"}>
                      {editMode ? 'Edit Mode' : 'View Mode'}
                    </Badge>
                    {pendingChanges > 0 && (
                      <Badge variant="outline">{pendingChanges} pending</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {totalQuoteAmount > 0 && (
                    <Button
                      onClick={generateQuote}
                      variant="default"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Generate Quote (${totalQuoteAmount.toLocaleString()})
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowJoinChat(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                  <Button
                    onClick={() => setShowTextCard(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    TextCard
                  </Button>
                  <Button onClick={onClose} variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Tools */}
              <div className="w-80 border-r bg-background/50 p-4 overflow-y-auto">
                <Tabs defaultValue="elements" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="elements">Elements</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="elements" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Add Elements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          onClick={() => addElement('text', 'New Text')}
                          variant="outline" 
                          className="w-full justify-start"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          Text
                        </Button>
                        <Button 
                          onClick={() => addElement('heading', 'New Heading')}
                          variant="outline" 
                          className="w-full justify-start"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          Heading
                        </Button>
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline" 
                          className="w-full justify-start"
                        >
                          <Image className="h-4 w-4 mr-2" />
                          Image
                        </Button>
                        <Button 
                          onClick={() => addElement('button', 'Click Me')}
                          variant="outline" 
                          className="w-full justify-start"
                        >
                          <MousePointer className="h-4 w-4 mr-2" />
                          Button
                        </Button>
                        <Button 
                          onClick={() => addElement('product', 'Product Placeholder')}
                          variant="outline" 
                          className="w-full justify-start"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Product Card
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          Elements ({elements.length})
                          {totalQuoteAmount > 0 && (
                            <Badge className="ml-2">
                              ${totalQuoteAmount.toLocaleString()}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {elements.map(element => (
                            <div
                              key={element.id}
                              className={`p-2 rounded border cursor-pointer transition-colors ${
                                selectedElement?.id === element.id 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:bg-muted/50'
                              }`}
                              onClick={() => setSelectedElement(element)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {element.type}
                                  </Badge>
                                  <span className="text-sm truncate">
                                    {element.content.substring(0, 15)}...
                                  </span>
                                  {element.type === 'product' && element.productData && (
                                    <Badge variant="outline" className="text-xs">
                                      ${element.productData.price.toLocaleString()}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(element.id);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Design Tools</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          onClick={() => setEditMode(!editMode)}
                          variant={editMode ? "default" : "outline"}
                          className="w-full"
                        >
                          {editMode ? <Eye className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                          {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                        </Button>
                        
                        <Button
                          onClick={() => setShowOutlines(!showOutlines)}
                          variant={showOutlines ? "default" : "outline"}
                          className="w-full"
                        >
                          <Layout className="h-4 w-4 mr-2" />
                          {showOutlines ? 'Hide Outlines' : 'Show Outlines'}
                        </Button>

                        <Button
                          onClick={() => setShowTextCard(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          Open TextCard
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button onClick={saveChanges} className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        
                        <Button 
                          onClick={publishChanges} 
                          variant="outline" 
                          className="w-full"
                          disabled={pendingChanges === 0}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Publish ({pendingChanges})
                        </Button>

                        {totalQuoteAmount > 0 && (
                          <Button 
                            onClick={generateQuote} 
                            variant="default"
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Generate Quote
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Main Canvas */}
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-4 overflow-auto">
                <div className={`${getDeviceStyles()} bg-white rounded-lg shadow-lg min-h-[600px] relative overflow-hidden`}>
                  {/* Sample Website Content */}
                  <div className={`p-8 ${showOutlines ? 'outline-dashed outline-2 outline-blue-500' : ''}`}>
                    <h1 className="text-4xl font-bold mb-4 text-center">
                      Wonderlands Pools
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 text-center">
                      Transform your backyard into a paradise
                    </p>
                    
                    {/* Quote Summary */}
                    {totalQuoteAmount > 0 && (
                      <div className="mb-8 p-4 bg-primary/10 rounded-lg border">
                        <h3 className="text-xl font-semibold mb-2">Current Quote</h3>
                        <div className="text-2xl font-bold text-primary">
                          ${totalQuoteAmount.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Elements */}
                  {elements.map(element => (
                    <div
                      key={element.id}
                      className={`absolute cursor-pointer transition-all duration-200 ${
                        showOutlines ? 'outline-dashed outline-2 outline-primary' : ''
                      } ${
                        selectedElement?.id === element.id ? 'ring-2 ring-primary' : ''
                      } ${element.styles || ''}`}
                      style={{
                        left: element.position.x,
                        top: element.position.y,
                        width: element.size?.width,
                        height: element.size?.height,
                      }}
                      onClick={() => setSelectedElement(element)}
                    >
                      {element.type === 'text' && (
                        <p className="text-sm">{element.content}</p>
                      )}
                      {element.type === 'heading' && (
                        <h2 className="text-xl font-bold">{element.content}</h2>
                      )}
                      {element.type === 'image' && (
                        <img 
                          src={element.content} 
                          alt="Element" 
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                      {element.type === 'button' && (
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                          {element.content}
                        </button>
                      )}
                      {element.type === 'product' && element.productData && (
                        <div className="w-full h-full bg-white rounded-lg border shadow-lg overflow-hidden">
                          {element.productData.image && (
                            <img 
                              src={element.productData.image} 
                              alt={element.productData.name}
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-3">
                            <h3 className="font-semibold text-sm mb-1">{element.productData.name}</h3>
                            <div className="text-lg font-bold text-primary mb-2">
                              ${element.productData.price.toLocaleString()}
                            </div>
                            <Badge className="text-xs mb-2">{element.productData.category}</Badge>
                            {element.productData.options && element.productData.options.some(opt => opt.selected) && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs text-muted-foreground">Options:</div>
                                {element.productData.options.filter(opt => opt.selected).map(option => (
                                  <div key={option.id} className="flex items-center gap-1 text-xs">
                                    {option.image && (
                                      <img src={option.image} alt={option.name} className="w-4 h-4 object-cover rounded" />
                                    )}
                                    <span>{option.name} (+${option.price.toLocaleString()})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

          {/* Element Edit Dialog */}
          {selectedElement && (
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Element</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      value={selectedElement.content}
                      onChange={(e) => setSelectedElement({...selectedElement, content: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">X Position</label>
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
                      <label className="text-sm font-medium mb-2 block">Y Position</label>
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
                      <label className="text-sm font-medium mb-2 block">Width</label>
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
                      <label className="text-sm font-medium mb-2 block">Height</label>
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

                  {/* Product Options Panel */}
                  {selectedElement.type === 'product' && selectedElement.productData?.options && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Product Options</h4>
                      <div className="grid gap-3">
                        {selectedElement.productData.options.map(option => (
                          <div key={option.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={option.selected}
                                onChange={(e) => {
                                  const updatedOptions = selectedElement.productData!.options!.map(opt =>
                                    opt.id === option.id ? { ...opt, selected: e.target.checked } : opt
                                  );
                                  const updatedElement = {
                                    ...selectedElement,
                                    productData: {
                                      ...selectedElement.productData!,
                                      options: updatedOptions
                                    }
                                  };
                                  setSelectedElement(updatedElement);
                                }}
                                className="w-4 h-4"
                              />
                              {option.image && (
                                <img src={option.image} alt={option.name} className="w-12 h-12 object-cover rounded" />
                              )}
                              <div>
                                <div className="font-medium">{option.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  +${option.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Custom Styles (Tailwind Classes)</label>
                    <Input
                      value={selectedElement.styles || ''}
                      onChange={(e) => setSelectedElement({...selectedElement, styles: e.target.value})}
                      placeholder="bg-blue-500 text-white p-4 rounded..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        updateElement(selectedElement);
                        setEditDialog(false);
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </DialogContent>
      </Dialog>

      {/* TextCard Component */}
      <TextCard
        isOpen={showTextCard}
        onClose={() => setShowTextCard(false)}
      />

      {/* Join Video Chat Component */}
      <JoinVideoChat
        isOpen={showJoinChat}
        onClose={() => setShowJoinChat(false)}
      />
    </>
  );
};

export default FixedEditorStudio;