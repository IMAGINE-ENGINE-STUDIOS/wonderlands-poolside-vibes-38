import { useState, useRef } from 'react';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Copy, Trash2, Pencil, Check, X } from 'lucide-react';
import { GalleryFolder } from '@/hooks/useGallery';

interface FolderCardProps {
  folder: GalleryFolder;
  onOpen: (folder: GalleryFolder) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCopyLink: (token: string) => void;
  onDragStart: (e: React.DragEvent, folderId: string) => void;
  onDrop: (e: React.DragEvent, folderId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const FolderCard = ({ folder, onOpen, onDelete, onRename, onCopyLink, onDragStart, onDrop, onDragOver }: FolderCardProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename(folder.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const startRename = () => {
    setNewName(folder.name);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className="group cursor-pointer hover:shadow-md transition-shadow border-border gallery-folder-accent"
          draggable
          onDragStart={(e) => onDragStart(e, folder.id)}
          onDrop={(e) => onDrop(e, folder.id)}
          onDragOver={onDragOver}
          onClick={() => !isRenaming && onOpen(folder)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Folder className="h-10 w-10 text-[hsl(var(--teal))] shrink-0" />
                <div className="min-w-0">
                  {isRenaming ? (
                    <div className="flex items-center gap-1">
                      <Input
                        ref={inputRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setIsRenaming(false); }}
                        className="h-7 text-sm px-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={(e) => { e.stopPropagation(); handleRenameSubmit(); }}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={(e) => { e.stopPropagation(); setIsRenaming(false); }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-foreground truncate">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">{folder.file_count} file{folder.file_count !== 1 ? 's' : ''}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onCopyLink(folder.share_token); }}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(folder.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {folder.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{folder.description}</p>
            )}
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onOpen(folder)}>
          <Folder className="h-4 w-4 mr-2" /> Open
        </ContextMenuItem>
        <ContextMenuItem onClick={startRename}>
          <Pencil className="h-4 w-4 mr-2" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCopyLink(folder.share_token)}>
          <Copy className="h-4 w-4 mr-2" /> Copy Share Link
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive" onClick={() => onDelete(folder.id)}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FolderCard;
