import { useState, useRef, useCallback, useMemo } from 'react';
import { useGallery, useGalleryFiles, GalleryFolder } from '@/hooks/useGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useToast } from '@/hooks/use-toast';
import {
  FolderPlus, ArrowLeft, Upload, Folder, Search,
  Link2, ExternalLink, Download, Trash2, Printer, CheckSquare, XSquare,
} from 'lucide-react';
import FileCard from '@/components/gallery/FileCard';
import FolderCard from '@/components/gallery/FolderCard';
import { downloadFile, downloadFilesAsZip } from '@/components/gallery/galleryUtils';
import FileViewer from '@/components/gallery/FileViewer';
import UploadQueue, { UploadQueueItem } from '@/components/gallery/UploadQueue';

const GalleryFilesPage = () => {
  const { folders, loading, createFolder, deleteFolder, renameFolder, moveFolder } = useGallery();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFolderData, setSelectedFolderData] = useState<{ name: string; share_token: string } | null>(null);
  const { files, loading: filesLoading, uploadFile, deleteFile, renameFile, moveFile, bulkDelete } = useGalleryFiles(selectedFolder);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const queueIdRef = useRef(0);

  const handleCreateFolder = async (parentId?: string) => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), newFolderDesc.trim(), parentId || undefined);
    setNewFolderName('');
    setNewFolderDesc('');
    setCreateDialogOpen(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    setUploading(true);
    
    // Add all files to queue
    const queueItems: UploadQueueItem[] = Array.from(fileList).map(file => ({
      id: `upload-${++queueIdRef.current}`,
      file,
      status: 'queued' as const,
      progress: 0,
    }));
    setUploadQueue(prev => [...prev, ...queueItems]);

    for (const item of queueItems) {
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 30 } : q));
      try {
        await uploadFile(item.file);
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', progress: 100 } : q));
      } catch (err: any) {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: err?.message || 'Upload failed' } : q));
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/gallery/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Private share link copied to clipboard' });
  };

  const openFolder = (folder: GalleryFolder) => {
    setSelectedFolder(folder.id);
    setSelectedFolderData({ name: folder.name, share_token: folder.share_token });
    setSelectedFiles(new Set());
    setSearchQuery('');
  };

  const handleFileSelect = (fileId: string, multi: boolean) => {
    setSelectedFiles(prev => {
      const next = new Set(multi ? prev : []);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
  };

  const clearSelection = () => setSelectedFiles(new Set());

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    await bulkDelete(Array.from(selectedFiles));
    setSelectedFiles(new Set());
  };

  const handleBulkDownload = () => {
    const selected = files.filter(f => selectedFiles.has(f.id));
    if (selected.length === 0) return;
    downloadFilesAsZip(selected);
  };

  const handleBulkPrint = () => {
    const selected = files.filter(f => selectedFiles.has(f.id));
    selected.forEach(f => {
      if (f.file_type?.startsWith('image/') || f.file_type === 'application/pdf') {
        window.open(f.file_url, '_blank');
      }
    });
  };

  // Drag & drop handlers
  const handleFileDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData('fileId', fileId);
    e.dataTransfer.setData('type', 'file');
  };

  const handleFolderDragStart = (e: React.DragEvent, folderId: string) => {
    e.dataTransfer.setData('folderId', folderId);
    e.dataTransfer.setData('type', 'folder');
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (type === 'file') {
      const fileId = e.dataTransfer.getData('fileId');
      if (fileId) moveFile(fileId, targetFolderId);
    } else if (type === 'folder') {
      const folderId = e.dataTransfer.getData('folderId');
      if (folderId && folderId !== targetFolderId) moveFolder(folderId, targetFolderId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Drop files from OS onto the page
  const handlePageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedFolder) return;
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles.length) return;
    setUploading(true);

    const queueItems: UploadQueueItem[] = Array.from(droppedFiles).map(file => ({
      id: `upload-${++queueIdRef.current}`,
      file,
      status: 'queued' as const,
      progress: 0,
    }));
    setUploadQueue(prev => [...prev, ...queueItems]);

    for (const item of queueItems) {
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 30 } : q));
      try {
        await uploadFile(item.file);
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', progress: 100 } : q));
      } catch (err: any) {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: err?.message || 'Upload failed' } : q));
      }
    }

    setUploading(false);
  }, [selectedFolder, uploadFile]);

  const currentFolders = folders.filter(f =>
    selectedFolder ? f.parent_folder_id === selectedFolder : !f.parent_folder_id
  );

  const filteredFolders = currentFolders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(f =>
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasSelection = selectedFiles.size > 0;

  return (
    <div
      className="min-h-screen bg-background"
      onDrop={handlePageDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {selectedFolder && (
              <Button variant="ghost" size="icon" onClick={() => { setSelectedFolder(null); setSelectedFolderData(null); setSelectedFiles(new Set()); }}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {selectedFolder ? selectedFolderData?.name : 'File Gallery'}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedFolder ? 'Manage files in this gallery' : 'Renders, manuals & documents repository'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedFolder && selectedFolderData && (
              <>
                <Button variant="outline" size="sm" onClick={() => copyShareLink(selectedFolderData.share_token)}>
                  <Link2 className="h-4 w-4 mr-1" /> Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/gallery/${selectedFolderData.share_token}`, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-1" /> Preview
                </Button>
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4 mr-1" /> {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUpload}
                  accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.pptx"
                />
              </>
            )}
            {!selectedFolder && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <FolderPlus className="h-4 w-4 mr-1" /> New Gallery
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Gallery</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Gallery Name</Label>
                      <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="e.g. Client Renders - Smith" />
                    </div>
                    <div>
                      <Label>Description (optional)</Label>
                      <Textarea value={newFolderDesc} onChange={e => setNewFolderDesc(e.target.value)} placeholder="What's in this gallery?" />
                    </div>
                    <Button onClick={() => handleCreateFolder()} className="w-full" disabled={!newFolderName.trim()}>
                      Create Gallery
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Bulk actions bar */}
        {hasSelection && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg border border-border">
            <span className="text-sm font-medium text-foreground mr-2">{selectedFiles.size} selected</span>
            <Button variant="outline" size="sm" onClick={selectAll}>
              <CheckSquare className="h-4 w-4 mr-1" /> Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              <XSquare className="h-4 w-4 mr-1" /> Clear
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={handleBulkDownload}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkPrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={selectedFolder ? 'Search files...' : 'Search galleries...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Right-click on background context menu */}
        <ContextMenu>
          <ContextMenuTrigger className="min-h-[400px] block">
            {/* Folders View */}
            {!selectedFolder && (
              loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="text-center py-20">
                  <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No galleries yet</h3>
                  <p className="text-muted-foreground text-sm">Create your first gallery or right-click to create one</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFolders.map(folder => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onOpen={openFolder}
                      onDelete={deleteFolder}
                      onRename={renameFolder}
                      onCopyLink={copyShareLink}
                      onDragStart={handleFolderDragStart}
                      onDrop={handleFolderDrop}
                      onDragOver={handleDragOver}
                    />
                  ))}
                </div>
              )
            )}

            {/* Files View */}
            {selectedFolder && (
              filesLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <>
                  {/* Sub-folders */}
                  {filteredFolders.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Sub-folders</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredFolders.map(folder => (
                          <FolderCard
                            key={folder.id}
                            folder={folder}
                            onOpen={openFolder}
                            onDelete={deleteFolder}
                            onRename={renameFolder}
                            onCopyLink={copyShareLink}
                            onDragStart={handleFolderDragStart}
                            onDrop={handleFolderDrop}
                            onDragOver={handleDragOver}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  {filteredFiles.length === 0 && filteredFolders.length === 0 ? (
                    <div className="text-center py-20">
                      <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-1">No files yet</h3>
                      <p className="text-muted-foreground text-sm">Upload files or drag & drop them here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredFiles.map((file, index) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          isSelected={selectedFiles.has(file.id)}
                          onSelect={handleFileSelect}
                          onDelete={deleteFile}
                          onRename={renameFile}
                          onDragStart={handleFileDragStart}
                          onOpen={() => { setViewerIndex(index); setViewerOpen(true); }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )
            )}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => setCreateDialogOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" /> New Folder
            </ContextMenuItem>
            {selectedFolder && (
              <ContextMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Upload Files
              </ContextMenuItem>
            )}
            {hasSelection && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleBulkDownload}>
                  <Download className="h-4 w-4 mr-2" /> Download Selected ({selectedFiles.size})
                </ContextMenuItem>
                <ContextMenuItem className="text-destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Selected ({selectedFiles.size})
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* Create folder dialog for context menu */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFolder ? 'Create Sub-folder' : 'Create New Gallery'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name</Label>
              <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name..." />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={newFolderDesc} onChange={e => setNewFolderDesc(e.target.value)} placeholder="What's in this folder?" />
            </div>
            <Button onClick={() => handleCreateFolder(selectedFolder || undefined)} className="w-full" disabled={!newFolderName.trim()}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Viewer */}
      <FileViewer
        files={filteredFiles}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />

      {/* Upload Queue */}
      <UploadQueue
        items={uploadQueue}
        onDismiss={(id) => setUploadQueue(prev => prev.filter(q => q.id !== id))}
        onClearCompleted={() => setUploadQueue(prev => prev.filter(q => q.status !== 'done'))}
      />
    </div>
  );
};

export default GalleryFilesPage;
