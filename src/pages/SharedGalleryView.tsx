import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, File, FileText, Film, Image, Lock } from 'lucide-react';

interface SharedFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
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

const SharedGalleryView = () => {
  const { token } = useParams<{ token: string }>();
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) { setNotFound(true); setLoading(false); return; }

      const { data: folder } = await supabase
        .from('gallery_folders')
        .select('id, name')
        .eq('share_token', token)
        .eq('is_active', true)
        .single();

      if (!folder) { setNotFound(true); setLoading(false); return; }

      setFolderName(folder.name);

      const { data: fileData } = await supabase
        .from('gallery_files')
        .select('id, file_name, file_url, file_type, file_size, created_at')
        .eq('folder_id', folder.id)
        .order('created_at', { ascending: false });

      setFiles(fileData || []);
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Shared Gallery</p>
          <h1 className="text-3xl font-bold text-foreground">{folderName}</h1>
          <p className="text-muted-foreground text-sm mt-1">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>

        {files.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">This gallery is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map(file => (
              <Card key={file.id} className="group overflow-hidden border-border">
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  {file.file_type?.startsWith('image/') ? (
                    <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" loading="lazy" />
                  ) : file.file_type?.startsWith('video/') ? (
                    <video src={file.file_url} className="w-full h-full object-cover" controls />
                  ) : (
                    getFileIcon(file.file_type)
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => window.open(file.file_url, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-foreground truncate">{file.file_name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedGalleryView;
