import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Edit3, 
  Move3D, 
  Copy, 
  Eye, 
  EyeOff,
  Settings
} from 'lucide-react';
import { EditableElement } from '@/hooks/useWebBuilder';

interface EditableSectionProps {
  children: React.ReactNode;
  sectionId: string;
  sectionTitle: string;
  isBuilderMode: boolean;
  onMove?: (direction: 'up' | 'down') => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  className?: string;
}

const EditableSection: React.FC<EditableSectionProps> = ({
  children,
  sectionId,
  sectionTitle,
  isBuilderMode,
  onMove,
  onDelete,
  onDuplicate,
  onEdit,
  onToggleVisibility,
  isVisible = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isBuilderMode) {
    return (
      <div id={sectionId} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      id={sectionId}
      className={`relative ${className} ${!isVisible ? 'opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section Outline */}
      <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none" />
      
      {/* Section Label */}
      <div className="absolute top-2 left-2 z-50">
        <Card className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium">
          {sectionTitle}
        </Card>
      </div>

      {/* Section Controls */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-50 flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 border border-border">
          {/* Move Up */}
          {onMove && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-none"
              onClick={() => onMove('up')}
              title="Move Section Up"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
          )}
          
          {/* Move Down */}
          {onMove && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-none"
              onClick={() => onMove('down')}
              title="Move Section Down"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          )}
          
          {/* Edit */}
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-none"
              onClick={onEdit}
              title="Edit Section"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
          
          {/* Toggle Visibility */}
          {onToggleVisibility && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-none"
              onClick={onToggleVisibility}
              title={isVisible ? "Hide Section" : "Show Section"}
            >
              {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          )}
          
          {/* Duplicate */}
          {onDuplicate && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-none"
              onClick={onDuplicate}
              title="Duplicate Section"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          
          {/* Delete */}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive rounded-none"
              onClick={onDelete}
              title="Delete Section"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default EditableSection;