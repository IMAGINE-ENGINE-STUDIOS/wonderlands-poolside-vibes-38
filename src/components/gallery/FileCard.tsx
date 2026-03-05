import { useState, useRef } from 'react';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ExternalLink, Trash2, Download, Printer, Send,
  Pencil, Check, X
} from 'lucide-react';
import { GalleryFile } from '@/hooks/useGallery';
import { getFileIcon, formatSize, downloadFile, printFile, forwardFile } from './galleryUtils';
import { useThumbnail } from './useThumbnail';

interface FileCardProps {
  file: GalleryFile;
  isSelected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDragStart: (e: React.DragEvent, fileId: string) => void;
  onOpen: () => void;
}

const FileCard = ({ file, isSelected, onSelect, onDelete, onRename, onDragStart, onOpen }: FileCardProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.file_name);
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbSrc = useThumbnail(file.file_url, file.file_type, file.folder_id);

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== file.file_name) {
      onRename(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const startRename = () => {
    setNewName(file.file_name);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className={`group overflow-hidden border-border cursor-pointer transition-all ${
            isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
          }`}
          draggable
          onDragStart={(e) => onDragStart(e, file.id)}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              onSelect(file.id, true);
            } else {
              onOpen();
            }
          }}
        >
          <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
            {file.file_type?.startsWith('image/') ? (
              <img src={thumbSrc} alt={file.file_name} className="w-full h-full object-cover" loading="lazy" />
            ) : file.file_type?.startsWith('video/') ? (
              <video src={file.file_url} className="w-full h-full object-cover" />
            ) : (
              getFileIcon(file.file_type, "h-12 w-12")
            )}
            {/* Selection checkbox */}
            <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(file.id, true)}
                onClick={(e) => e.stopPropagation()}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-1.5">
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); window.open(file.file_url, '_blank'); }}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); downloadFile(file.file_url, file.file_name); }}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <CardContent className="p-3">
            {isRenaming ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={inputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setIsRenaming(false); }}
                  className="h-6 text-xs px-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={(e) => { e.stopPropagation(); handleRenameSubmit(); }}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={(e) => { e.stopPropagation(); setIsRenaming(false); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-foreground truncate">{file.file_name}</p>
                <p className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</p>
              </>
            )}
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => window.open(file.file_url, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" /> Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => downloadFile(file.file_url, file.file_name)}>
          <Download className="h-4 w-4 mr-2" /> Download
        </ContextMenuItem>
        <ContextMenuItem onClick={startRename}>
          <Pencil className="h-4 w-4 mr-2" /> Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => printFile(file.file_url)}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </ContextMenuItem>
        <ContextMenuItem onClick={() => forwardFile(file.file_url, file.file_name)}>
          <Send className="h-4 w-4 mr-2" /> Forward via Email
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive" onClick={() => onDelete(file.id)}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FileCard;
