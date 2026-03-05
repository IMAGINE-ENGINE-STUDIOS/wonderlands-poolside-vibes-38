import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GalleryFolder {
  id: string;
  name: string;
  description: string | null;
  share_token: string;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  file_count?: number;
}

export interface GalleryFile {
  id: string;
  folder_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export const useGallery = () => {
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_folders')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading folders', description: error.message, variant: 'destructive' });
    } else {
      // Get file counts
      const foldersWithCounts = await Promise.all(
        (data || []).map(async (folder) => {
          const { count } = await supabase
            .from('gallery_files')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id);
          return { ...folder, file_count: count || 0 };
        })
      );
      setFolders(foldersWithCounts);
    }
    setLoading(false);
  }, [toast]);

  const createFolder = async (name: string, description?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('gallery_folders')
      .insert({ name, description: description || null, created_by: userData.user?.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating folder', description: error.message, variant: 'destructive' });
      return null;
    }
    toast({ title: 'Folder created' });
    await fetchFolders();
    return data;
  };

  const deleteFolder = async (id: string) => {
    const { error } = await supabase.from('gallery_folders').update({ is_active: false }).eq('id', id);
    if (error) {
      toast({ title: 'Error deleting folder', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Folder deleted' });
      await fetchFolders();
    }
  };

  const renameFolder = async (id: string, name: string) => {
    const { error } = await supabase.from('gallery_folders').update({ name }).eq('id', id);
    if (error) {
      toast({ title: 'Error renaming folder', description: error.message, variant: 'destructive' });
    } else {
      await fetchFolders();
    }
  };

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  return { folders, loading, createFolder, deleteFolder, renameFolder, refetch: fetchFolders };
};

export const useGalleryFiles = (folderId: string | null) => {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (!folderId) { setFiles([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_files')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading files', description: error.message, variant: 'destructive' });
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }, [folderId, toast]);

  const uploadFile = async (file: File) => {
    if (!folderId) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `${folderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-files')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      return;
    }

    const { data: urlData } = supabase.storage.from('gallery-files').getPublicUrl(filePath);
    const { data: userData } = await supabase.auth.getUser();

    const { error: dbError } = await supabase.from('gallery_files').insert({
      folder_id: folderId,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: userData.user?.id,
    });

    if (dbError) {
      toast({ title: 'Error saving file record', description: dbError.message, variant: 'destructive' });
    } else {
      toast({ title: 'File uploaded' });
      await fetchFiles();
    }
  };

  const deleteFile = async (fileId: string) => {
    const { error } = await supabase.from('gallery_files').delete().eq('id', fileId);
    if (error) {
      toast({ title: 'Error deleting file', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'File deleted' });
      await fetchFiles();
    }
  };

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  return { files, loading, uploadFile, deleteFile, refetch: fetchFiles };
};
