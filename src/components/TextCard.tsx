import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Palette,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Settings,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextElement {
  id: string;
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  color: string;
  backgroundColor: string;
  textAlign: string;
  lineHeight: number;
  letterSpacing: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  isVisible: boolean;
}

interface TextCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextCard: React.FC<TextCardProps> = ({ isOpen, onClose }) => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<TextElement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  // Font options
  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New',
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
  ];

  const fontWeights = [
    { label: 'Thin', value: '100' },
    { label: 'Light', value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semi Bold', value: '600' },
    { label: 'Bold', value: '700' },
    { label: 'Extra Bold', value: '800' },
    { label: 'Black', value: '900' }
  ];

  // Load saved text elements on component mount
  useEffect(() => {
    const saved = localStorage.getItem('textCardElements');
    if (saved) {
      setTextElements(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever textElements change
  useEffect(() => {
    localStorage.setItem('textCardElements', JSON.stringify(textElements));
  }, [textElements]);

  const createNewTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      content: 'New Text Element',
      fontSize: 16,
      fontFamily: 'Inter',
      fontWeight: '400',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#000000',
      backgroundColor: 'transparent',
      textAlign: 'left',
      lineHeight: 1.5,
      letterSpacing: 0,
      position: { x: 100, y: 100 },
      width: 300,
      height: 50,
      isVisible: true
    };

    setTextElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
    
    toast({
      title: "Text Element Created",
      description: "New text element added to the canvas",
    });
  };

  const updateSelectedElement = (updates: Partial<TextElement>) => {
    if (!selectedElement) return;

    const updatedElement = { ...selectedElement, ...updates };
    setSelectedElement(updatedElement);
    
    setTextElements(prev => prev.map(el => 
      el.id === selectedElement.id ? updatedElement : el
    ));
  };

  const deleteElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
    
    toast({
      title: "Text Element Deleted",
      description: "Text element has been removed",
    });
  };

  const toggleElementVisibility = (id: string) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, isVisible: !el.isVisible } : el
    ));
  };

  const applyToAllText = () => {
    if (!selectedElement) return;

    // Apply current element's styles to all text on the page
    const elementsToUpdate = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    
    elementsToUpdate.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.fontFamily = selectedElement.fontFamily;
      htmlEl.style.fontSize = `${selectedElement.fontSize}px`;
      htmlEl.style.fontWeight = selectedElement.fontWeight;
      htmlEl.style.fontStyle = selectedElement.fontStyle;
      htmlEl.style.color = selectedElement.color;
      htmlEl.style.textAlign = selectedElement.textAlign;
      htmlEl.style.lineHeight = selectedElement.lineHeight.toString();
      htmlEl.style.letterSpacing = `${selectedElement.letterSpacing}px`;
    });

    toast({
      title: "Styles Applied",
      description: "Text styles applied to all text elements on the page",
    });
  };

  const exportSettings = () => {
    const settings = {
      elements: textElements,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Text settings have been downloaded",
    });
  };

  const getElementStyles = (element: TextElement) => ({
    position: 'absolute' as const,
    left: element.position.x,
    top: element.position.y,
    width: element.width,
    height: element.height,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    color: element.color,
    backgroundColor: element.backgroundColor,
    textAlign: element.textAlign as any,
    lineHeight: element.lineHeight,
    letterSpacing: element.letterSpacing,
    display: element.isVisible ? 'block' : 'none',
    border: selectedElement?.id === element.id ? '2px dashed hsl(var(--primary))' : 'none',
    padding: '8px',
    cursor: isEditMode ? 'move' : 'default',
    userSelect: isEditMode ? 'none' as const : 'auto' as const
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Text Canvas Area */}
      <div className="flex-1 relative bg-background overflow-auto">
        <div className="absolute inset-0 p-4">
          <div className="relative w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Canvas Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100">
              {textElements.map(element => (
                <div
                  key={element.id}
                  style={getElementStyles(element)}
                  onClick={() => setSelectedElement(element)}
                  draggable={isEditMode}
                  onDragEnd={(e) => {
                    if (isEditMode && selectedElement?.id === element.id) {
                      const rect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                      updateSelectedElement({
                        position: {
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        }
                      });
                    }
                  }}
                  contentEditable={!isEditMode}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    if (selectedElement?.id === element.id) {
                      updateSelectedElement({ content: e.target.textContent || '' });
                    }
                  }}
                >
                  {element.content}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            size="sm"
          >
            {isEditMode ? <Edit className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
            {isEditMode ? 'Edit Mode' : 'View Mode'}
          </Button>
          <Button onClick={createNewTextElement} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Text
          </Button>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4"
        >
          Close TextCard
        </Button>
      </div>

      {/* Control Panel */}
      <div className="w-96 bg-background border-l border-border p-4 overflow-y-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              TextCard Controller
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Control all text elements in your application
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Element List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Text Elements</h3>
                <Badge variant="secondary">{textElements.length}</Badge>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {textElements.map(element => (
                  <div
                    key={element.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      selectedElement?.id === element.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedElement(element)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1">
                        {element.content.substring(0, 20)}...
                      </span>
                      <div className="flex gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(element.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          {element.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedElement && (
              <>
                <Separator />
                
                {/* Content */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Input
                    value={selectedElement.content}
                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                    placeholder="Enter text content..."
                  />
                </div>

                {/* Typography */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Typography</h3>
                  
                  {/* Font Family */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Font Family</label>
                    <Select
                      value={selectedElement.fontFamily}
                      onValueChange={(value) => updateSelectedElement({ fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map(font => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Font Size: {selectedElement.fontSize}px
                    </label>
                    <Slider
                      value={[selectedElement.fontSize]}
                      onValueChange={([value]) => updateSelectedElement({ fontSize: value })}
                      min={8}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Font Weight</label>
                    <Select
                      value={selectedElement.fontWeight}
                      onValueChange={(value) => updateSelectedElement({ fontWeight: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeights.map(weight => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Style Toggles */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateSelectedElement({
                        fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
                      })}
                      variant={selectedElement.fontStyle === 'italic' ? "default" : "outline"}
                      size="sm"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => updateSelectedElement({
                        textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline'
                      })}
                      variant={selectedElement.textDecoration === 'underline' ? "default" : "outline"}
                      size="sm"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Colors</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Text Color</label>
                      <Input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Background</label>
                      <Input
                        type="color"
                        value={selectedElement.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.backgroundColor}
                        onChange={(e) => updateSelectedElement({ backgroundColor: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Text Alignment</label>
                  <div className="flex gap-1">
                    {[
                      { value: 'left', icon: AlignLeft },
                      { value: 'center', icon: AlignCenter },
                      { value: 'right', icon: AlignRight },
                      { value: 'justify', icon: AlignJustify }
                    ].map(({ value, icon: Icon }) => (
                      <Button
                        key={value}
                        onClick={() => updateSelectedElement({ textAlign: value })}
                        variant={selectedElement.textAlign === value ? "default" : "outline"}
                        size="sm"
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Spacing */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Spacing</h3>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Line Height: {selectedElement.lineHeight.toFixed(1)}
                    </label>
                    <Slider
                      value={[selectedElement.lineHeight]}
                      onValueChange={([value]) => updateSelectedElement({ lineHeight: value })}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Letter Spacing: {selectedElement.letterSpacing}px
                    </label>
                    <Slider
                      value={[selectedElement.letterSpacing]}
                      onValueChange={([value]) => updateSelectedElement({ letterSpacing: value })}
                      min={-5}
                      max={20}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Position & Size */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Position & Size</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">X Position</label>
                      <Input
                        type="number"
                        value={selectedElement.position.x}
                        onChange={(e) => updateSelectedElement({
                          position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Y Position</label>
                      <Input
                        type="number"
                        value={selectedElement.position.y}
                        onChange={(e) => updateSelectedElement({
                          position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Width</label>
                      <Input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Height</label>
                      <Input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Global Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                onClick={applyToAllText}
                variant="outline"
                className="w-full"
                disabled={!selectedElement}
              >
                <Palette className="h-4 w-4 mr-2" />
                Apply to All Text
              </Button>
              
              <Button onClick={exportSettings} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextCard;