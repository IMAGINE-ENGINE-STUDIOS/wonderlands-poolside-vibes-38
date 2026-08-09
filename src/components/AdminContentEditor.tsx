import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Copy
} from "lucide-react";

interface EditableContent {
  id: string;
  type: 'text' | 'image' | 'section' | 'textbox';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  styles?: string;
}

interface AdminContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminContentEditor = ({ isOpen, onClose }: AdminContentEditorProps) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableContent | null>(null);
  const [showOutlines, setShowOutlines] = useState(true);
  const [elements, setElements] = useState<EditableContent[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [newTextBox, setNewTextBox] = useState({ content: '', x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTextBox = () => {
    const newElement: EditableContent = {
      id: generateId(),
      type: 'textbox',
      content: newTextBox.content || 'New text box',
      position: { x: newTextBox.x, y: newTextBox.y },
      size: { width: 300, height: 100 },
      styles: 'bg-white border border-gray-300 p-4 rounded shadow'
    };
    setElements([...elements, newElement]);
    setNewTextBox({ content: '', x: 0, y: 0 });
    toast({
      title: "Text Box Added",
      description: "New text box has been added to the page",
    });
  };

  const editElement = (element: EditableContent) => {
    setSelectedElement(element);
    setEditDialog(true);
  };

  const updateElement = (updatedElement: EditableContent) => {
    setElements(elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    ));
    toast({
      title: "Element Updated",
      description: "Content has been updated successfully",
    });
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    toast({
      title: "Element Deleted",
      description: "Content has been removed",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: EditableContent = {
          id: generateId(),
          type: 'image',
          content: e.target?.result as string,
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        };
        setElements([...elements, newImage]);
        toast({
          title: "Image Uploaded",
          description: "Image has been added to the page",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = () => {
    // In a real implementation, this would save to a database
    localStorage.setItem('adminEditorContent', JSON.stringify(elements));
    toast({
      title: "Changes Saved",
      description: "All content changes have been saved",
    });
  };

  const loadSavedContent = () => {
    const saved = localStorage.getItem('adminEditorContent');
    if (saved) {
      setElements(JSON.parse(saved));
      toast({
        title: "Content Loaded",
        description: "Previously saved content has been loaded",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Content Editor - Full Site Management
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="editor" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">Visual Editor</TabsTrigger>
            <TabsTrigger value="content">Content Manager</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="h-full mt-4">
            <div className="flex gap-4 h-full">
              {/* Toolbar */}
              <div className="w-64 border-r pr-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Editor Tools</CardTitle>
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

                    <Button onClick={saveChanges} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>

                    <Button onClick={loadSavedContent} variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Load Saved
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Add Elements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-2">
                      <Input
                        placeholder="Text content"
                        value={newTextBox.content}
                        onChange={(e) => setNewTextBox({...newTextBox, content: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="X position"
                          value={newTextBox.x}
                          onChange={(e) => setNewTextBox({...newTextBox, x: parseInt(e.target.value) || 0})}
                        />
                        <Input
                          type="number"
                          placeholder="Y position"
                          value={newTextBox.y}
                          onChange={(e) => setNewTextBox({...newTextBox, y: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <Button onClick={addTextBox} className="w-full">
                        <Type className="mr-2 h-4 w-4" />
                        Add Text Box
                      </Button>
                    </div>

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
                      Upload Image
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Area */}
              <div className="flex-1 border rounded-lg bg-white relative overflow-auto">
                <div className="min-h-[600px] relative">
                  {/* Website Preview Iframe Simulation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="p-8 text-center">
                      <h1 className={`text-4xl font-bold mb-4 ${showOutlines ? 'outline-dashed outline-2 outline-blue-500' : ''}`}>
                        Wonderlands Pools
                      </h1>
                      <p className={`text-lg text-gray-600 mb-8 ${showOutlines ? 'outline-dashed outline-2 outline-green-500' : ''}`}>
                        Transform your backyard into a paradise
                      </p>
                      
                      {/* Sample editable sections */}
                      <div className={`grid grid-cols-3 gap-6 mb-8 ${showOutlines ? 'outline-dashed outline-2 outline-purple-500' : ''}`}>
                        <div className="p-4 bg-white rounded shadow">
                          <h3 className="font-semibold">Premium Pools</h3>
                          <p className="text-sm text-gray-600">Luxury swimming pools</p>
                        </div>
                        <div className="p-4 bg-white rounded shadow">
                          <h3 className="font-semibold">Expert Installation</h3>
                          <p className="text-sm text-gray-600">Professional service</p>
                        </div>
                        <div className="p-4 bg-white rounded shadow">
                          <h3 className="font-semibold">Lifetime Warranty</h3>
                          <p className="text-sm text-gray-600">Peace of mind guarantee</p>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Elements */}
                    {elements.map((element) => (
                      <div
                        key={element.id}
                        className={`absolute cursor-pointer ${element.styles || ''} ${
                          editMode && showOutlines ? 'outline-dashed outline-2 outline-red-500' : ''
                        }`}
                        style={{
                          left: element.position.x,
                          top: element.position.y,
                          width: element.size?.width,
                          height: element.size?.height,
                        }}
                        onClick={() => editMode && editElement(element)}
                      >
                        {element.type === 'image' ? (
                          <img loading="lazy" decoding="async" 
                            src={element.content} 
                            alt="Uploaded" 
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="p-2">{element.content}</div>
                        )}
                        
                        {editMode && (
                          <div className="absolute -top-8 right-0 flex gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
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
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Text Elements</h3>
                      {elements.filter(el => el.type === 'textbox').map(element => (
                        <div key={element.id} className="p-2 border rounded flex justify-between items-center">
                          <span className="truncate">{element.content}</span>
                          <Button size="sm" onClick={() => editElement(element)}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Images</h3>
                      {elements.filter(el => el.type === 'image').map(element => (
                        <div key={element.id} className="p-2 border rounded flex justify-between items-center">
                          <span>Image {element.id.slice(0, 6)}</span>
                          <Button size="sm" onClick={() => editElement(element)}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Title</label>
                    <Input defaultValue="Wonderlands Pools" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Description</label>
                    <Textarea defaultValue="Transform your backyard into a paradise" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <Input type="color" defaultValue="#3b82f6" />
                  </div>
                  <Button>Update Global Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Element Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Element</DialogTitle>
            </DialogHeader>
            {selectedElement && (
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
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      updateElement(selectedElement);
                      setEditDialog(false);
                    }}
                  >
                    Update
                  </Button>
                  <Button variant="outline" onClick={() => setEditDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default AdminContentEditor;