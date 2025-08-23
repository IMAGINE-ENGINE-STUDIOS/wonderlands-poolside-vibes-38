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
  Users
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

  const addElement = (type: EditableElement['type'], content: string) => {
    const newElement: EditableElement = {
      id: generateId(),
      type,
      content,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { 
        width: type === 'image' ? 200 : 300, 
        height: type === 'image' ? 150 : type === 'button' ? 40 : 100 
      },
      styles: type === 'button' ? 'bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90' : 
              type === 'heading' ? 'text-2xl font-bold text-foreground' :
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
      // Apply changes in real-time
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
    // In a real implementation, this would publish to the live site
    toast({
      title: "Changes Published",
      description: `${pendingChanges} changes published to live site`,
    });
    setPendingChanges(0);
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
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Element List</CardTitle>
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

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Device Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { value: 'desktop', label: 'Desktop', icon: Monitor },
                          { value: 'tablet', label: 'Tablet', icon: Tablet },
                          { value: 'mobile', label: 'Mobile', icon: Smartphone }
                        ].map(({ value, label, icon: Icon }) => (
                          <Button
                            key={value}
                            onClick={() => setSelectedDevice(value)}
                            variant={selectedDevice === value ? "default" : "outline"}
                            className="w-full justify-start"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {label}
                          </Button>
                        ))}
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
                        
                        <Button 
                          onClick={() => setIsLivePreview(!isLivePreview)}
                          variant={isLivePreview ? "default" : "outline"}
                          className="w-full"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Live Preview
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Communication</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          onClick={() => setShowJoinChat(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Open Join (Video Chat)
                        </Button>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className={`p-4 bg-white rounded shadow ${showOutlines ? 'outline-dashed outline-2 outline-green-500' : ''}`}>
                        <h3 className="font-semibold">Premium Pools</h3>
                        <p className="text-sm text-gray-600">Luxury swimming pools</p>
                      </div>
                      <div className={`p-4 bg-white rounded shadow ${showOutlines ? 'outline-dashed outline-2 outline-green-500' : ''}`}>
                        <h3 className="font-semibold">Expert Installation</h3>
                        <p className="text-sm text-gray-600">Professional service</p>
                      </div>
                      <div className={`p-4 bg-white rounded shadow ${showOutlines ? 'outline-dashed outline-2 outline-green-500' : ''}`}>
                        <h3 className="font-semibold">Lifetime Warranty</h3>
                        <p className="text-sm text-gray-600">Peace of mind guarantee</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Elements */}
                  {elements.map((element) => (
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
                      onClick={() => editMode && setSelectedElement(element)}
                      draggable={editMode}
                      onDragEnd={(e) => {
                        if (editMode) {
                          const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                          updateElement({
                            ...element,
                            position: {
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top
                            }
                          });
                        }
                      }}
                    >
                      {element.type === 'image' ? (
                        <img 
                          src={element.content} 
                          alt="Custom" 
                          className="w-full h-full object-cover rounded"
                          draggable={false}
                        />
                      ) : (
                        <div className="break-words">{element.content}</div>
                      )}
                      
                      {editMode && selectedElement?.id === element.id && (
                        <div className="absolute -top-8 right-0 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDialog(true);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {editMode && (
                    <div className="absolute inset-0 bg-blue-500/5 pointer-events-none">
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Edit Mode Active - Click elements to select
                      </div>
                    </div>
                  )}
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

          {/* Edit Dialog */}
          {selectedElement && (
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
              <DialogContent>
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
                    <Button onClick={() => {
                      updateElement(selectedElement);
                      setEditDialog(false);
                    }}>
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