import { useState, useRef } from 'react';
import { useGallery, useGalleryFiles } from '@/hooks/useGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  FolderPlus, ArrowLeft, Upload, Trash2, Copy, ExternalLink,
  Folder, FileText, Image, Film, File, Link2, Search
} from 'lucide-react';

const getFileIcon = (type: string | null) => {
  if (!type) return <File className="h-8 w-8 text-muted-foreground" />;
  if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
  if (type.startsWith('video/')) return <Film className="h-8 w-8 text-purple-500" />;
  if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
};

const formatSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const GalleryFilesPage = () => {
  const { folders, loading, createFolder, deleteFolder } = useGallery();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFolderData, setSelectedFolderData] = useState<{ name: string; share_token: string } | null>(null);
  const { files, loading: filesLoading, uploadFile, deleteFile } = useGalleryFiles(selectedFolder);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), newFolderDesc.trim());
    setNewFolderName('');
    setNewFolderDesc('');
    setCreateDialogOpen(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    setUploading(true);
    for (let i = 0; i < fileList.length; i++) {
      await uploadFile(fileList[i]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/gallery/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Private share link copied to clipboard' });
  };

  const openFolder = (folder: { id: string; name: string; share_token: string }) => {
    setSelectedFolder(folder.id);
    setSelectedFolderData({ name: folder.name, share_token: folder.share_token });
  };

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(f =>
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {selectedFolder && (
              <Button variant="ghost" size="icon" onClick={() => { setSelectedFolder(null); setSelectedFolderData(null); }}>
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
                    <Button onClick={handleCreateFolder} className="w-full" disabled={!newFolderName.trim()}>
                      Create Gallery
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

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
              <p className="text-muted-foreground text-sm">Create your first gallery to start organizing files</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFolders.map(folder => (
                <Card
                  key={folder.id}
                  className="group cursor-pointer hover:shadow-md transition-shadow border-border"
                  onClick={() => openFolder(folder)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Folder className="h-10 w-10 text-primary shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{folder.name}</h3>
                          <p className="text-xs text-muted-foreground">{folder.file_count} file{folder.file_count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={e => { e.stopPropagation(); copyShareLink(folder.share_token); }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {folder.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{folder.description}</p>
                    )}
                  </CardContent>
                </Card>
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
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-20">
              <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No files yet</h3>
              <p className="text-muted-foreground text-sm">Upload files to this gallery</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFiles.map(file => (
                <Card key={file.id} className="group overflow-hidden border-border">
                  <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                    {file.file_type?.startsWith('image/') ? (
                      <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" loading="lazy" />
                    ) : file.file_type?.startsWith('video/') ? (
                      <video src={file.file_url} className="w-full h-full object-cover" />
                    ) : (
                      getFileIcon(file.file_type)
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => window.open(file.file_url, '_blank')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteFile(file.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-foreground truncate">{file.file_name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GalleryFilesPage;
