import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ChevronDown, ChevronRight, Plus, Trash2, Upload, FileText, X, GripVertical, Download, Briefcase, Eye } from 'lucide-react';
import type { ProjectPhase, PhaseItem } from './useProjectManagement';

interface ProjectPhaseCardProps {
  phase: ProjectPhase;
  onToggleItem: (itemId: string, completed: boolean) => void;
  onAddItem: (phaseId: string, name: string) => void;
  onDeleteItem: (itemId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onUploadDocument: (itemId: string, file: File) => void;
  onDeleteDocument: (docId: string) => void;
  readOnly?: boolean;
  enableDragDrop?: boolean;
  onProcureItem?: (itemId: string, itemName: string) => void;
  onViewItemProposals?: (listing: any) => void;
  getItemProcurementListing?: (itemId: string) => any | undefined;
}

const ProjectPhaseCard: React.FC<ProjectPhaseCardProps> = ({
  phase,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onDeletePhase,
  onUploadDocument,
  onDeleteDocument,
  readOnly = false,
  enableDragDrop = false,
  onProcureItem,
  onViewItemProposals,
  getItemProcurementListing,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const completedCount = phase.items.filter(i => i.is_completed).length;
  const totalCount = phase.items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAddItem(phase.id, newItemName.trim());
    setNewItemName('');
  };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const renderItem = (item: PhaseItem, index: number) => {
    const itemContent = (dragHandleProps?: any) => (
      <div className="group">
        <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-100 transition-colors">
          {enableDragDrop && dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-neutral-600" />
            </div>
          )}
          <Checkbox
            checked={item.is_completed}
            onCheckedChange={(checked) => !readOnly && onToggleItem(item.id, !!checked)}
            disabled={readOnly}
            className="border-neutral-200 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
          <span
            className={`flex-1 text-xs  cursor-pointer ${
              item.is_completed ? 'line-through text-neutral-600' : 'text-black'
            }`}
            onClick={() => toggleItemExpand(item.id)}
          >
            {item.item_name}
          </span>
          {item.documents.length > 0 && (
            <span className="text-[10px] bg-neutral-100 text-black px-1.5 py-0.5 rounded ">
              {item.documents.length} doc{item.documents.length > 1 ? 's' : ''}
            </span>
          )}
          {item.due_date && (
            <span className="text-[10px] text-neutral-600 ">
              {new Date(item.due_date).toLocaleDateString()}
            </span>
          )}
          {!readOnly && (
            <>
              {onProcureItem && getItemProcurementListing && (() => {
                const listing = getItemProcurementListing(item.id);
                return listing ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 text-green-400/60 hover:text-green-400"
                    onClick={() => onViewItemProposals?.(listing)}
                    title="View Proposals"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 text-emerald-400/60 hover:text-emerald-400"
                    onClick={() => onProcureItem(item.id, item.item_name)}
                    title="Procure this task"
                  >
                    <Briefcase className="h-3 w-3" />
                  </Button>
                );
              })()}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-black"
                onClick={() => fileInputRefs.current[item.id]?.click()}
              >
                <Upload className="h-3 w-3" />
              </Button>
              <input
                ref={(el) => { fileInputRefs.current[item.id] = el; }}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadDocument(item.id, f);
                  e.target.value = '';
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {expandedItems.has(item.id) && item.documents.length > 0 && (
          <div className="ml-8 mt-1 mb-2 space-y-1">
            {item.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 text-[10px]  text-neutral-600 py-1 px-2 rounded bg-neutral-100"
              >
                <FileText className="h-3 w-3 flex-shrink-0 text-neutral-600" />
                <span className="flex-1 truncate text-neutral-600">
                  {doc.file_name}
                </span>
                <span className="text-neutral-600">
                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)}KB` : ''}
                </span>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.file_name}
                  className="flex items-center gap-1 text-black hover:text-black transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </a>
                {!readOnly && (
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="text-red-400/40 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    if (enableDragDrop) {
      return (
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={snapshot.isDragging ? 'shadow-lg rounded bg-white' : ''}
            >
              {itemContent(provided.dragHandleProps)}
            </div>
          )}
        </Draggable>
      );
    }

    return <div key={item.id}>{itemContent()}</div>;
  };

  const itemsList = (
    <>
      {phase.items.map((item, index) => renderItem(item, index))}
    </>
  );

  return (
    <Card className="bg-white border border-neutral-200 rounded-xl shadow-sm border-neutral-200 overflow-hidden">
      <CardHeader
        className="cursor-pointer py-3 px-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-black flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-black flex-shrink-0" />
            )}
            <CardTitle className="text-sm  text-black uppercase tracking-wide">
              {phase.phase_name}
            </CardTitle>
            <span className="text-xs  text-neutral-600 ml-2">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24">
              <Progress value={progress} className="h-2" />
            </div>
            <span className={`text-xs  font-bold ${progress === 100 ? 'text-green-400' : 'text-black'}`}>
              {progress}%
            </span>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400/60 hover:text-red-400"
                onClick={(e) => { e.stopPropagation(); onDeletePhase(phase.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 px-4 pb-4 space-y-1">
          {enableDragDrop ? (
            <Droppable droppableId={phase.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {itemsList}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            itemsList
          )}

          {!readOnly && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200">
              <Input
                placeholder="Add item..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                className="h-7 text-xs bg-transparent border-neutral-200 text-black placeholder:text-neutral-500 "
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-black"
                onClick={handleAddItem}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProjectPhaseCard;
