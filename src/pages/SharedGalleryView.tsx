import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  ExternalLink, File, FileText, Film, Image, Lock, Folder,
  ChevronRight, Download, Printer, Send,
} from 'lucide-react';
import { GalleryFile } from '@/hooks/useGallery';
import { downloadFile, printFile, forwardFile } from '@/components/gallery/galleryUtils';
import FileViewer from '@/components/gallery/FileViewer';

interface SharedFolder {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

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

/** Map shared file data to GalleryFile shape for the FileViewer */
const toGalleryFile = (f: { id: string; file_name: string; file_url: string; file_type: string | null; file_size: number | null; created_at: string }, folderId: string): GalleryFile => ({
  id: f.id,
  folder_id: folderId,
  file_name: f.file_name,
  file_url: f.file_url,
  file_type: f.file_type,
  file_size: f.file_size,
  thumbnail_url: null,
  description: null,
  uploaded_by: null,
  created_at: f.created_at,
  sort_order: 0,
});

const SharedGalleryView = () => {
  const { token } = useParams<{ token: string }>();
  const [rootFolder, setRootFolder] = useState<{ id: string; name: string } | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [subfolders, setSubfolders] = useState<SharedFolder[]>([]);
  const [files, setFiles] = useState<{ id: string; file_name: string; file_url: string; file_type: string | null; file_size: number | null; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // FileViewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Load root folder from token
  useEffect(() => {
    const loadRoot = async () => {
      if (!token) { setNotFound(true); setLoading(false); return; }
      const { data: folder } = await supabase
        .from('gallery_folders')
        .select('id, name')
        .eq('share_token', token)
        .eq('is_active', true)
        .single();
      if (!folder) { setNotFound(true); setLoading(false); return; }
      setRootFolder(folder);
      setCurrentFolderId(folder.id);
      setBreadcrumbs([{ id: folder.id, name: folder.name }]);
    };
    loadRoot();
  }, [token]);

  const loadFolderContents = useCallback(async (folderId: string) => {
    setLoading(true);
    const [foldersRes, filesRes] = await Promise.all([
      supabase
        .from('gallery_folders')
        .select('id, name, parent_folder_id')
        .eq('parent_folder_id', folderId)
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('gallery_files')
        .select('id, file_name, file_url, file_type, file_size, created_at')
        .eq('folder_id', folderId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    ]);
    setSubfolders(foldersRes.data || []);
    setFiles(filesRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentFolderId) loadFolderContents(currentFolderId);
  }, [currentFolderId, loadFolderContents]);

  const navigateToSubfolder = (folder: SharedFolder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setCurrentFolderId(target.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const openFileViewer = (fileIndex: number) => {
    setViewerIndex(fileIndex);
    setViewerOpen(true);
  };

  // Convert files to GalleryFile[] for FileViewer
  const galleryFiles: GalleryFile[] = currentFolderId
    ? files.map(f => toGalleryFile(f, currentFolderId))
    : [];

  if (loading && !rootFolder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Gallery Not Found</h2>
          <p className="text-muted-foreground text-sm mt-1">This link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const currentName = breadcrumbs[breadcrumbs.length - 1]?.name || '';
  const totalItems = subfolders.length + files.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Shared Gallery</p>

          {breadcrumbs.length > 1 && (
            <nav className="flex items-center gap-1 text-sm mb-2 flex-wrap">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  {i < breadcrumbs.length - 1 ? (
                    <button onClick={() => navigateToBreadcrumb(i)} className="text-primary hover:underline">
                      {crumb.name}
                    </button>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.name}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <h1 className="text-3xl font-bold text-foreground">{currentName}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {subfolders.length > 0 && `${subfolders.length} folder${subfolders.length !== 1 ? 's' : ''}`}
            {subfolders.length > 0 && files.length > 0 && ', '}
            {files.length > 0 && `${files.length} file${files.length !== 1 ? 's' : ''}`}
            {totalItems === 0 && 'Empty'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : totalItems === 0 ? (
          <p className="text-center text-muted-foreground py-20">This folder is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Subfolders */}
            {subfolders.map(folder => (
              <Card
                key={folder.id}
                className="group cursor-pointer hover:shadow-md transition-shadow border-border"
                onClick={() => navigateToSubfolder(folder)}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Folder className="h-16 w-16 text-primary/60" />
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-foreground truncate">{folder.name}</p>
                  <p className="text-[10px] text-muted-foreground">Folder</p>
                </CardContent>
              </Card>
            ))}

            {/* Files with context menu and click-to-open viewer */}
            {files.map((file, fileIndex) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger>
                  <Card
                    className="group overflow-hidden border-border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openFileViewer(fileIndex)}
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                      {file.file_type?.startsWith('image/') ? (
                        <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" loading="lazy" />
                      ) : file.file_type?.startsWith('video/') ? (
                        <video src={file.file_url} className="w-full h-full object-cover" />
                      ) : (
                        getFileIcon(file.file_type)
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1.5">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); openFileViewer(fileIndex); }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); downloadFile(file.file_url, file.file_name); }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs font-medium text-foreground truncate">{file.file_name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</p>
                    </CardContent>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => openFileViewer(fileIndex)}>
                    <ExternalLink className="h-4 w-4 mr-2" /> Open
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => downloadFile(file.file_url, file.file_name)}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => printFile(file.file_url)}>
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => forwardFile(file.file_url, file.file_name)}>
                    <Send className="h-4 w-4 mr-2" /> Forward via Email
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>

      {/* File Viewer - same UI as admin gallery */}
      <FileViewer
        files={galleryFiles}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </div>
  );
};

export default SharedGalleryView;
