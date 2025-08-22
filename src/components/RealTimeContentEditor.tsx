import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Globe
} from "lucide-react";

interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'heading' | 'section' | 'button';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  styles?: string;
  target?: string;
  editable: boolean;
  selector?: string;
}

interface RealTimeContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SitePreviewProps {
  elements: EditableElement[];
  onElementClick: (element: EditableElement) => void;
  editMode: boolean;
  showOutlines: boolean;
  selectedDevice: string;
}

// Live Site Preview Component that mirrors the actual website
const SitePreview = ({ elements, onElementClick, editMode, showOutlines, selectedDevice }: SitePreviewProps) => {
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
    <div className={`${getDeviceStyles()} bg-white min-h-full overflow-auto transition-all`}>
      {/* Header */}
      <header className={`bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 ${showOutlines ? 'outline-dashed outline-2 outline-blue-500' : ''}`}>
        <div className="container mx-auto">
          <h1 
            className={`text-4xl font-bold mb-2 ${editMode ? 'cursor-pointer hover:bg-white/10 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-yellow-300' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'site-title',
              type: 'heading',
              content: 'Wonderlands Pools',
              position: { x: 0, y: 0 },
              editable: true,
              selector: 'h1'
            })}
          >
            {elements.find(e => e.id === 'site-title')?.content || 'Wonderlands Pools'}
          </h1>
          <p 
            className={`text-xl ${editMode ? 'cursor-pointer hover:bg-white/10 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-yellow-300' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'site-subtitle',
              type: 'text',
              content: 'Transform your backyard into a paradise',
              position: { x: 0, y: 0 },
              editable: true,
              selector: 'header p'
            })}
          >
            {elements.find(e => e.id === 'site-subtitle')?.content || 'Transform your backyard into a paradise'}
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`py-16 bg-gradient-to-br from-blue-50 to-cyan-50 ${showOutlines ? 'outline-dashed outline-2 outline-green-500' : ''}`}>
        <div className="container mx-auto px-6 text-center">
          <h2 
            className={`text-5xl font-bold mb-6 text-gray-800 ${editMode ? 'cursor-pointer hover:bg-white/20 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-purple-400' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'hero-title',
              type: 'heading',
              content: 'Premium Pool Installation',
              position: { x: 0, y: 0 },
              editable: true,
              selector: '.hero h2'
            })}
          >
            {elements.find(e => e.id === 'hero-title')?.content || 'Premium Pool Installation'}
          </h2>
          <p 
            className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto ${editMode ? 'cursor-pointer hover:bg-white/20 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-purple-400' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'hero-description',
              type: 'text',
              content: 'Experience luxury with our custom-designed pools, expert installation, and lifetime warranty.',
              position: { x: 0, y: 0 },
              editable: true,
              selector: '.hero p'
            })}
          >
            {elements.find(e => e.id === 'hero-description')?.content || 'Experience luxury with our custom-designed pools, expert installation, and lifetime warranty.'}
          </p>
          <div 
            className={`flex flex-wrap justify-center gap-4 ${editMode ? 'cursor-pointer hover:bg-white/20 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-orange-400' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'hero-buttons',
              type: 'section',
              content: 'CTA Buttons Section',
              position: { x: 0, y: 0 },
              editable: true,
              selector: '.hero .buttons'
            })}
          >
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {elements.find(e => e.id === 'cta-primary')?.content || 'Get Free Quote'}
            </Button>
            <Button size="lg" variant="outline">
              {elements.find(e => e.id === 'cta-secondary')?.content || 'View Gallery'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 bg-white ${showOutlines ? 'outline-dashed outline-2 outline-red-500' : ''}`}>
        <div className="container mx-auto px-6">
          <h2 
            className={`text-4xl font-bold text-center mb-12 text-gray-800 ${editMode ? 'cursor-pointer hover:bg-gray-100 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-indigo-400' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'features-title',
              type: 'heading',
              content: 'Why Choose Wonderlands Pools?',
              position: { x: 0, y: 0 },
              editable: true,
              selector: '.features h2'
            })}
          >
            {elements.find(e => e.id === 'features-title')?.content || 'Why Choose Wonderlands Pools?'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { id: 'feature-1', title: 'Expert Design', desc: 'Custom pool designs tailored to your space' },
              { id: 'feature-2', title: 'Quality Materials', desc: 'Premium materials for lasting beauty' },
              { id: 'feature-3', title: 'Lifetime Warranty', desc: 'Peace of mind with our lifetime guarantee' }
            ].map((feature, index) => (
              <div 
                key={feature.id}
                className={`text-center p-6 rounded-lg border hover:shadow-lg transition-shadow ${editMode ? 'cursor-pointer hover:bg-gray-50' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-teal-400' : ''}`}
                onClick={() => editMode && onElementClick({
                  id: feature.id,
                  type: 'section',
                  content: feature.title,
                  position: { x: 0, y: 0 },
                  editable: true,
                  selector: `.feature-${index + 1}`
                })}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {elements.find(e => e.id === `${feature.id}-title`)?.content || feature.title}
                </h3>
                <p className="text-gray-600">
                  {elements.find(e => e.id === `${feature.id}-desc`)?.content || feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-16 bg-gray-100 ${showOutlines ? 'outline-dashed outline-2 outline-pink-500' : ''}`}>
        <div className="container mx-auto px-6 text-center">
          <h2 
            className={`text-4xl font-bold mb-6 text-gray-800 ${editMode ? 'cursor-pointer hover:bg-white/50 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-emerald-400' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'contact-title',
              type: 'heading',
              content: 'Ready to Transform Your Backyard?',
              position: { x: 0, y: 0 },
              editable: true,
              selector: '.contact h2'
            })}
          >
            {elements.find(e => e.id === 'contact-title')?.content || 'Ready to Transform Your Backyard?'}
          </h2>
          <p 
            className={`text-xl text-gray-600 mb-8 ${editMode ? 'cursor-pointer hover:bg-white/50 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-emerald-400' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'contact-description',
              type: 'text',
              content: 'Contact us today for a free consultation and quote.',
              position: { x: 0, y: 0 },
              editable: true,
              selector: '.contact p'
            })}
          >
            {elements.find(e => e.id === 'contact-description')?.content || 'Contact us today for a free consultation and quote.'}
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            {elements.find(e => e.id === 'contact-cta')?.content || 'Get Started Today'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`bg-gray-800 text-white py-8 ${showOutlines ? 'outline-dashed outline-2 outline-gray-400' : ''}`}>
        <div className="container mx-auto px-6 text-center">
          <p 
            className={`${editMode ? 'cursor-pointer hover:bg-white/10 p-2 rounded' : ''} ${showOutlines ? 'outline-dashed outline-1 outline-gray-300' : ''}`}
            onClick={() => editMode && onElementClick({
              id: 'footer-text',
              type: 'text',
              content: '© 2024 Wonderlands Pools. All rights reserved.',
              position: { x: 0, y: 0 },
              editable: true,
              selector: 'footer p'
            })}
          >
            {elements.find(e => e.id === 'footer-text')?.content || '© 2024 Wonderlands Pools. All rights reserved.'}
          </p>
        </div>
      </footer>

      {/* Dynamic Elements Overlay */}
      {elements.filter(e => e.id.startsWith('custom-')).map((element) => (
        <div
          key={element.id}
          className={`absolute cursor-pointer ${element.styles || 'bg-white border border-gray-300 p-4 rounded shadow'} ${
            editMode && showOutlines ? 'outline-dashed outline-2 outline-red-500' : ''
          }`}
          style={{
            left: element.position.x,
            top: element.position.y,
            width: element.size?.width,
            height: element.size?.height,
          }}
          onClick={() => editMode && onElementClick(element)}
        >
          {element.type === 'image' ? (
            <img 
              src={element.content} 
              alt="Custom" 
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div>{element.content}</div>
          )}
          
          {editMode && (
            <div className="absolute -top-8 right-0 flex gap-1">
              <Button
                size="sm"
                variant="destructive"
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
    </div>
  );
};

const RealTimeContentEditor = ({ isOpen, onClose }: RealTimeContentEditorProps) => {
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
    const cost = actualSurfaceArea * 15; // $15 per sq ft including installation
    
    setCalculatedCost(cost);
    setSurfaceArea(actualSurfaceArea.toString());
    
    toast({
      title: "Cost Calculated",
      description: `Surface area: ${actualSurfaceArea} sq ft (${totalPatioArea} - ${poolAreaValue}) = $${cost.toLocaleString()}`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-screen flex-col">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <h1 className="text-xl font-semibold">Real-Time Content Editor</h1>
              {pendingChanges > 0 && (
                <Badge variant="secondary">{pendingChanges} pending changes</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={isLivePreview ? 'bg-green-500' : 'bg-gray-500'}>
                {isLivePreview ? 'Live Preview' : 'Draft Mode'}
              </Badge>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-4 p-4 overflow-hidden">
          {/* Main Editor Area - Live Preview Only */}
          <div className="flex-1 border rounded-lg bg-white relative overflow-auto min-w-0">
            <SitePreview
              elements={elements}
              onElementClick={handleElementClick}
              editMode={editMode}
              showOutlines={showOutlines}
              selectedDevice={selectedDevice}
            />
          </div>

          {/* Right Sidebar - All Tools and Controls */}
          <div className="w-96 bg-white border rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
            
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

            {/* Product Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { id: 'pools', name: 'Swimming Pools', description: 'Custom pool designs' },
                    { id: 'spas', name: 'Spas & Hot Tubs', description: 'Relaxation solutions' },
                    { id: 'pavers', name: 'Pavers', description: '$15/sq ft (incl. installation)' },
                    { id: 'copings', name: 'Copings', description: '$15/sq ft (incl. installation)' },
                    { id: 'tiles', name: 'Pool Tiles', description: 'Decorative finishes' },
                    { id: 'covers', name: 'Pool Covers', description: 'Safety & maintenance' },
                    { id: 'lighting', name: 'LED Lighting', description: 'Ambiance & safety' },
                    { id: 'heating', name: 'Pool Heating', description: 'Extend swimming season' },
                  ].map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className="w-full text-left justify-start h-auto p-3"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div>
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-muted-foreground">{category.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedCategory && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">Selected: {
                      selectedCategory === 'pools' ? 'Swimming Pools' :
                      selectedCategory === 'spas' ? 'Spas & Hot Tubs' :
                      selectedCategory === 'pavers' ? 'Pavers' :
                      selectedCategory === 'copings' ? 'Copings' :
                      selectedCategory === 'tiles' ? 'Pool Tiles' :
                      selectedCategory === 'covers' ? 'Pool Covers' :
                      selectedCategory === 'lighting' ? 'LED Lighting' :
                      selectedCategory === 'heating' ? 'Pool Heating' : selectedCategory
                    }</div>
                    {calculatedCost > 0 && (selectedCategory === 'pavers' || selectedCategory === 'copings') && (
                      <div className="mt-2 text-lg font-bold text-green-600">
                        Total Cost: ${calculatedCost.toLocaleString()}
                        <div className="text-xs text-gray-600 font-normal">
                          Surface area: {surfaceArea} sq ft
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  <div>Cost: $15 per sq ft (includes installation)</div>
                  <div>Surface Area = Total Patio - Pool Area</div>
                  {patioArea && poolArea && !isNaN(parseFloat(patioArea)) && !isNaN(parseFloat(poolArea)) && (
                    <div className="mt-2">
                      <div className="text-sm">
                        {parseFloat(patioArea)} - {parseFloat(poolArea)} = {Math.max(0, parseFloat(patioArea) - parseFloat(poolArea))} sq ft
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        Estimated Total: ${(Math.max(0, parseFloat(patioArea) - parseFloat(poolArea)) * 15).toLocaleString()}
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