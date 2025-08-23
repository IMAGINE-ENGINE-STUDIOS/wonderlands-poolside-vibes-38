import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Move3D, Trash2, Copy, Edit3, Package } from "lucide-react";

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

interface DraggableElementProps {
  element: EditableElement;
  editMode: boolean;
  showOutlines: boolean;
  isPreviewMode: boolean;
  onElementClick: (element: EditableElement) => void;
  onElementUpdate: (element: EditableElement) => void;
  onElementDelete: (id: string) => void;
  onElementDuplicate: (element: EditableElement) => void;
}

export const DraggableElement = ({
  element,
  editMode,
  showOutlines,
  isPreviewMode,
  onElementClick,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate
}: DraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(element.content);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode || isPreviewMode) return;
    
    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !editMode) return;
    
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    
    onElementUpdate({
      ...element,
      position: newPosition
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for drag
  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  const handleDoubleClick = () => {
    if (!editMode || isPreviewMode || element.type === 'image') return;
    setIsInlineEditing(true);
  };

  const handleInlineEditSave = () => {
    onElementUpdate({
      ...element,
      content: editedContent
    });
    setIsInlineEditing(false);
  };

  const handleInlineEditCancel = () => {
    setEditedContent(element.content);
    setIsInlineEditing(false);
  };

  const renderContent = () => {
    if (isInlineEditing && (element.type === 'text' || element.type === 'heading' || element.type === 'button')) {
      return (
        <Input
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleInlineEditSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInlineEditSave();
            } else if (e.key === 'Escape') {
              handleInlineEditCancel();
            }
          }}
          className="w-full h-full border-0 bg-transparent"
          autoFocus
        />
      );
    }

    switch (element.type) {
      case 'image':
        return (
          <img 
            src={element.content} 
            alt="Custom" 
            className={`w-full h-full object-cover rounded ${isPreviewMode ? 'pointer-events-none' : ''}`}
            draggable={false}
          />
        );
      case 'product':
        return (
          <div className={`border rounded-lg p-3 bg-card shadow-sm max-w-xs ${isPreviewMode ? 'pointer-events-none' : ''}`}>
            {element.productData?.image_url && (
              <img 
                src={element.productData.image_url} 
                alt={element.content}
                className={`w-full h-32 object-cover rounded mb-2 ${isPreviewMode ? 'pointer-events-none' : ''}`}
                draggable={false}
              />
            )}
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{element.content}</span>
            </div>
            {element.productData?.price && (
              <div className="text-sm text-green-600 font-semibold">
                ${element.productData.price.toLocaleString()}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {element.productData?.description || 'Product from marketplace'}
            </div>
          </div>
        );
      default:
        return (
          <div 
            className={`w-full h-full ${isPreviewMode ? 'pointer-events-none select-none' : 'cursor-text'}`}
            onDoubleClick={handleDoubleClick}
          >
            {element.content}
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${element.styles || 'bg-card border border-border p-4 rounded shadow'} ${
        editMode && showOutlines ? 'outline-dashed outline-2 outline-primary' : ''
      } ${editMode ? 'hover:shadow-lg transition-shadow' : ''} ${
        isPreviewMode ? 'pointer-events-none select-none' : ''
      } ${isDragging ? 'z-50 opacity-75' : 'z-10'}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size?.width || 'auto',
        height: element.size?.height || 'auto',
        cursor: editMode && !isPreviewMode && !isInlineEditing ? 'move' : 'default'
      }}
      onClick={() => editMode && !isPreviewMode && !isDragging && onElementClick(element)}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      
      {editMode && !isPreviewMode && !isInlineEditing && (
        <div className="absolute -top-8 right-0 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 bg-card border border-border"
            onClick={(e) => {
              e.stopPropagation();
              setIsInlineEditing(true);
            }}
            title="Edit Text (Double-click also works)"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 bg-card border border-border"
            onClick={(e) => {
              e.stopPropagation();
              onElementClick(element);
            }}
            title="Move Element"
          >
            <Move3D className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 bg-card border border-border"
            onClick={(e) => {
              e.stopPropagation();
              onElementDuplicate(element);
            }}
            title="Duplicate Element"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onElementDelete(element.id);
            }}
            title="Delete Element"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {editMode && !isPreviewMode && isDragging && (
        <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
          Moving: {element.position.x}, {element.position.y}
        </div>
      )}
    </div>
  );
};