-- Add deleted_at column for soft delete
ALTER TABLE public.gallery_files 
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- Index for efficient filtering of non-deleted files
CREATE INDEX IF NOT EXISTS idx_gallery_files_deleted_at 
ON public.gallery_files (deleted_at) WHERE deleted_at IS NULL;

-- Index for cleanup of expired soft-deleted files  
CREATE INDEX IF NOT EXISTS idx_gallery_files_deleted_expired 
ON public.gallery_files (deleted_at) WHERE deleted_at IS NOT NULL;