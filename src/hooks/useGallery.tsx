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
  parent_folder_id: string | null;
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
  sort_order: number;
  deleted_at?: string | null;
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
      const foldersWithCounts = await Promise.all(
        (data || []).map(async (folder) => {
          const { count } = await supabase
            .from('gallery_files')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id)
            .is('deleted_at', null);
          return { ...folder, file_count: count || 0 };
        })
      );
      setFolders(foldersWithCounts);
    }
    setLoading(false);
  }, [toast]);

  const createFolder = async (name: string, description?: string, parentFolderId?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('gallery_folders')
      .insert({
        name,
        description: description || null,
        created_by: userData.user?.id,
        parent_folder_id: parentFolderId || null,
      })
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

  const moveFolder = async (folderId: string, targetParentId: string | null) => {
    const { error } = await supabase
      .from('gallery_folders')
      .update({ parent_folder_id: targetParentId })
      .eq('id', folderId);
    if (error) {
      toast({ title: 'Error moving folder', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Folder moved' });
      await fetchFolders();
    }
  };

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  return { folders, loading, createFolder, deleteFolder, renameFolder, moveFolder, refetch: fetchFolders };
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
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading files', description: error.message, variant: 'destructive' });
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }, [folderId, toast]);

  // Check if a filename already exists in the current folder
  const checkDuplicate = useCallback(async (fileName: string): Promise<GalleryFile | null> => {
    if (!folderId) return null;
    const { data } = await supabase
      .from('gallery_files')
      .select('*')
      .eq('folder_id', folderId)
      .eq('file_name', fileName)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();
    return data as GalleryFile | null;
  }, [folderId]);

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
      await fetchFiles();
    }
  };

  // Replace an existing file record (update URL, size, type)
  const replaceFile = async (existingFileId: string, file: File) => {
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

    const { error: dbError } = await supabase.from('gallery_files').update({
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      updated_at: new Date().toISOString(),
    }).eq('id', existingFileId);

    if (dbError) {
      toast({ title: 'Error replacing file', description: dbError.message, variant: 'destructive' });
    } else {
      await fetchFiles();
    }
  };

  // Soft delete - sets deleted_at timestamp
  const deleteFile = async (fileId: string) => {
    const deletedFile = files.find(f => f.id === fileId);
    const { error } = await supabase
      .from('gallery_files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', fileId);

    if (error) {
      toast({ title: 'Error deleting file', description: error.message, variant: 'destructive' });
    } else {
      // Remove from local state immediately
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: 'File deleted',
        description: deletedFile ? `"${deletedFile.file_name}" can be restored within 24 hours` : undefined,
        action: deletedFile ? (
          <button
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={async () => {
              await supabase
                .from('gallery_files')
                .update({ deleted_at: null })
                .eq('id', fileId);
              await fetchFiles();
              toast({ title: 'File restored', description: `"${deletedFile.file_name}" has been restored` });
            }}
          >
            Undo
          </button>
        ) : undefined,
        duration: 8000,
      });
    }
  };

  // Soft bulk delete
  const bulkDelete = async (fileIds: string[]) => {
    const deletedFiles = files.filter(f => fileIds.includes(f.id));
    const { error } = await supabase
      .from('gallery_files')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', fileIds);

    if (error) {
      toast({ title: 'Error deleting files', description: error.message, variant: 'destructive' });
    } else {
      setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
      toast({
        title: `${fileIds.length} files deleted`,
        description: 'Files can be restored within 24 hours',
        action: (
          <button
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={async () => {
              await supabase
                .from('gallery_files')
                .update({ deleted_at: null })
                .in('id', fileIds);
              await fetchFiles();
              toast({ title: 'Files restored', description: `${fileIds.length} files have been restored` });
            }}
          >
            Undo
          </button>
        ),
        duration: 8000,
      });
    }
  };

  // Permanently delete files that have been soft-deleted for more than 24 hours
  const purgeExpired = useCallback(async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('gallery_files')
      .delete()
      .lt('deleted_at', cutoff)
      .not('deleted_at', 'is', null);
  }, []);

  // Run purge on mount
  useEffect(() => { purgeExpired(); }, [purgeExpired]);

  const renameFile = async (fileId: string, newName: string) => {
    const { error } = await supabase.from('gallery_files').update({ file_name: newName }).eq('id', fileId);
    if (error) {
      toast({ title: 'Error renaming file', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'File renamed' });
      await fetchFiles();
    }
  };

  const moveFile = async (fileId: string, targetFolderId: string) => {
    const { error } = await supabase.from('gallery_files').update({ folder_id: targetFolderId }).eq('id', fileId);
    if (error) {
      toast({ title: 'Error moving file', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'File moved' });
      await fetchFiles();
    }
  };

  const bulkMove = async (fileIds: string[], targetFolderId: string) => {
    const { error } = await supabase.from('gallery_files').update({ folder_id: targetFolderId }).in('id', fileIds);
    if (error) {
      toast({ title: 'Error moving files', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `${fileIds.length} files moved` });
      await fetchFiles();
    }
  };

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  return { files, loading, uploadFile, replaceFile, checkDuplicate, deleteFile, renameFile, moveFile, bulkDelete, bulkMove, refetch: fetchFiles };
};
