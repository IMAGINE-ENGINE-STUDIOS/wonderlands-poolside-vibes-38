
-- Add parent_folder_id for nested folders
ALTER TABLE public.gallery_folders 
ADD COLUMN parent_folder_id uuid REFERENCES public.gallery_folders(id) ON DELETE SET NULL;

-- Create index for faster nested folder queries
CREATE INDEX idx_gallery_folders_parent ON public.gallery_folders(parent_folder_id);

-- Add sort_order to gallery_files for drag reordering
ALTER TABLE public.gallery_files 
ADD COLUMN sort_order integer DEFAULT 0;
