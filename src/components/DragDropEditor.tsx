import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Move, 
  Trash2, 
  Plus, 
  Save, 
  Eye, 
  EyeOff, 
  Palette, 
  Type,
  Image as ImageIcon,
  Layout,
  MousePointer,
  Undo,
  Redo
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'card' | 'layout';
  content: string;
  styles: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
  };
  editable: boolean;
}

interface DragDropEditorProps {
  isActive: boolean;
  onToggle: () => void;
  showEnableButton?: boolean;
}

export const DragDropEditor: React.FC<DragDropEditorProps> = ({ isActive, onToggle, showEnableButton = false }) => {
  const { toast } = useToast();
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<EditableElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize with existing page elements
  useEffect(() => {
    if (isActive) {
      scanPageElements();
    }
  }, [isActive]);

  const scanPageElements = () => {
    const scannedElements: EditableElement[] = [];
    
    // Scan for text elements
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span').forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        scannedElements.push({
          id: `text-${index}`,
          type: 'text',
          content: el.textContent || '',
          styles: {
            position: { x: rect.left, y: rect.top },
            size: { width: rect.width, height: rect.height },
            color: window.getComputedStyle(el).color,
            fontSize: window.getComputedStyle(el).fontSize,
            fontWeight: window.getComputedStyle(el).fontWeight,
          },
          editable: true
        });
      }
    });

    // Scan for buttons
    document.querySelectorAll('button').forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        scannedElements.push({
          id: `button-${index}`,
          type: 'button',
          content: el.textContent || '',
          styles: {
            position: { x: rect.left, y: rect.top },
            size: { width: rect.width, height: rect.height },
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            color: window.getComputedStyle(el).color,
          },
          editable: true
        });
      }
    });

    // Scan for images
    document.querySelectorAll('img').forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        scannedElements.push({
          id: `image-${index}`,
          type: 'image',
          content: (el as HTMLImageElement).src,
          styles: {
            position: { x: rect.left, y: rect.top },
            size: { width: rect.width, height: rect.height },
          },
          editable: true
        });
      }
    });

    setElements(scannedElements);
    saveToHistory(scannedElements);
    
    toast({
      title: "Editor Activated",
      description: `Found ${scannedElements.length} editable elements`,
    });
  };

  const saveToHistory = (newElements: EditableElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  };

  const handleElementUpdate = (id: string, updates: Partial<EditableElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    if (!isActive) return;
    
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setDragOffset({
        x: e.clientX - element.styles.position.x,
        y: e.clientY - element.styles.position.y
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };

    handleElementUpdate(selectedElement, {
      styles: {
        ...elements.find(el => el.id === selectedElement)?.styles!,
        position: newPosition
      }
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setSelectedElement(null);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(null);
    
    toast({
      title: "Element Deleted",
      description: "Element removed from the page",
    });
  };

  const addNewElement = (type: EditableElement['type']) => {
    const newElement: EditableElement = {
      id: `${type}-${Date.now()}`,
      type,
      content: type === 'text' ? 'New Text' : type === 'button' ? 'New Button' : '',
      styles: {
        position: { x: 100, y: 100 },
        size: { width: 200, height: type === 'text' ? 40 : type === 'button' ? 50 : 100 },
        color: '#000000',
        backgroundColor: type === 'button' ? '#3b82f6' : 'transparent',
      },
      editable: true
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(newElement.id);
    
    toast({
      title: "Element Added",
      description: `New ${type} element created`,
    });
  };

  const applyChangesToDOM = () => {
    elements.forEach(element => {
      const domElement = document.querySelector(`[data-editor-id="${element.id}"]`);
      if (domElement) {
        if (element.type === 'text' || element.type === 'button') {
          domElement.textContent = element.content;
        }
        
        const htmlElement = domElement as HTMLElement;
        htmlElement.style.position = 'absolute';
        htmlElement.style.left = `${element.styles.position.x}px`;
        htmlElement.style.top = `${element.styles.position.y}px`;
        htmlElement.style.width = `${element.styles.size.width}px`;
        htmlElement.style.height = `${element.styles.size.height}px`;
        
        if (element.styles.color) htmlElement.style.color = element.styles.color;
        if (element.styles.backgroundColor) htmlElement.style.backgroundColor = element.styles.backgroundColor;
        if (element.styles.fontSize) htmlElement.style.fontSize = element.styles.fontSize;
        if (element.styles.fontWeight) htmlElement.style.fontWeight = element.styles.fontWeight;
      }
    });
    
    toast({
      title: "Changes Applied",
      description: "All modifications have been applied to the page",
    });
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  if (!isActive) {
    if (!showEnableButton) return null;
    
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        size="lg"
      >
        <Edit className="h-4 w-4 mr-2" />
        Enable Editor
      </Button>
    );
  }

  return (
    <>
      {/* Editor Overlay */}
      <div 
        className="fixed inset-0 z-40 pointer-events-none"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
      >
        {elements.map(element => (
          <div
            key={element.id}
            className={`absolute border-2 border-dashed pointer-events-auto cursor-move ${
              selectedElement === element.id ? 'border-primary bg-primary/10' : 'border-gray-400 hover:border-primary'
            }`}
            style={{
              left: element.styles.position.x,
              top: element.styles.position.y,
              width: element.styles.size.width,
              height: element.styles.size.height,
            }}
            onMouseDown={(e) => handleDragStart(e, element.id)}
            onClick={() => setSelectedElement(element.id)}
          >
            <div className="absolute -top-6 left-0 bg-primary text-white px-2 py-1 text-xs rounded">
              {element.type}
            </div>
            {selectedElement === element.id && (
              <Button
                onClick={() => deleteElement(element.id)}
                size="sm"
                variant="destructive"
                className="absolute -top-8 right-0 h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Editor Panel */}
      <Card className="fixed top-4 right-4 w-80 z-50 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Drag & Drop Editor</CardTitle>
            <Button onClick={onToggle} size="sm" variant="outline">
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={undo} size="sm" variant="outline" disabled={historyIndex <= 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button onClick={redo} size="sm" variant="outline" disabled={historyIndex >= history.length - 1}>
              <Redo className="h-4 w-4" />
            </Button>
            <Button onClick={applyChangesToDOM} size="sm" variant="default">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Add Elements */}
          <div>
            <h4 className="font-medium mb-2">Add Elements</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => addNewElement('text')} 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                <Type className="h-3 w-3 mr-1" />
                Text
              </Button>
              <Button 
                onClick={() => addNewElement('button')} 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                <MousePointer className="h-3 w-3 mr-1" />
                Button
              </Button>
              <Button 
                onClick={() => addNewElement('image')} 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Image
              </Button>
              <Button 
                onClick={() => addNewElement('layout')} 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                <Layout className="h-3 w-3 mr-1" />
                Layout
              </Button>
            </div>
          </div>

          {/* Element Properties */}
          {selectedElementData && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Edit Selected Element</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Content</label>
                  {selectedElementData.type === 'text' || selectedElementData.type === 'button' ? (
                    <Input
                      value={selectedElementData.content}
                      onChange={(e) => handleElementUpdate(selectedElementData.id, { content: e.target.value })}
                      className="mt-1"
                    />
                  ) : selectedElementData.type === 'image' ? (
                    <Input
                      value={selectedElementData.content}
                      onChange={(e) => handleElementUpdate(selectedElementData.id, { content: e.target.value })}
                      placeholder="Image URL"
                      className="mt-1"
                    />
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Width</label>
                    <Input
                      type="number"
                      value={selectedElementData.styles.size.width}
                      onChange={(e) => handleElementUpdate(selectedElementData.id, {
                        styles: {
                          ...selectedElementData.styles,
                          size: { ...selectedElementData.styles.size, width: Number(e.target.value) }
                        }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Height</label>
                    <Input
                      type="number"
                      value={selectedElementData.styles.size.height}
                      onChange={(e) => handleElementUpdate(selectedElementData.id, {
                        styles: {
                          ...selectedElementData.styles,
                          size: { ...selectedElementData.styles.size, height: Number(e.target.value) }
                        }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {(selectedElementData.type === 'text' || selectedElementData.type === 'button') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Text Color</label>
                      <Input
                        type="color"
                        value={selectedElementData.styles.color || '#000000'}
                        onChange={(e) => handleElementUpdate(selectedElementData.id, {
                          styles: { ...selectedElementData.styles, color: e.target.value }
                        })}
                        className="mt-1 h-10"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Background</label>
                      <Input
                        type="color"
                        value={selectedElementData.styles.backgroundColor || '#ffffff'}
                        onChange={(e) => handleElementUpdate(selectedElementData.id, {
                          styles: { ...selectedElementData.styles, backgroundColor: e.target.value }
                        })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Element List */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Elements ({elements.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {elements.map(element => (
                <div
                  key={element.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    selectedElement === element.id ? 'bg-primary/10 border border-primary' : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {element.type}
                    </Badge>
                    <span className="text-xs truncate">
                      {element.content.substring(0, 20)}...
                    </span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};