
-- Gallery folders table
CREATE TABLE public.gallery_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  share_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(share_token)
);

-- Gallery files table
CREATE TABLE public.gallery_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES public.gallery_folders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  thumbnail_url TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_files ENABLE ROW LEVEL SECURITY;

-- RLS for gallery_folders
CREATE POLICY "Main admins can manage all folders" ON public.gallery_folders FOR ALL USING (is_main_admin()) WITH CHECK (is_main_admin());

CREATE POLICY "Sales reps can view folders" ON public.gallery_folders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sales_rep' AND is_active = true)
);

CREATE POLICY "Sales reps can create folders" ON public.gallery_folders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sales_rep' AND is_active = true)
);

CREATE POLICY "Sales reps can update own folders" ON public.gallery_folders FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Anyone can view folder by share token" ON public.gallery_folders FOR SELECT USING (true);

-- RLS for gallery_files
CREATE POLICY "Main admins can manage all files" ON public.gallery_files FOR ALL USING (is_main_admin()) WITH CHECK (is_main_admin());

CREATE POLICY "Sales reps can view files" ON public.gallery_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sales_rep' AND is_active = true)
);

CREATE POLICY "Sales reps can upload files" ON public.gallery_files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sales_rep' AND is_active = true)
);

CREATE POLICY "Sales reps can delete own files" ON public.gallery_files FOR DELETE USING (uploaded_by = auth.uid());

CREATE POLICY "Anyone can view files in shared folders" ON public.gallery_files FOR SELECT USING (true);

-- Storage bucket for gallery files
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-files', 'gallery-files', true);

-- Storage RLS
CREATE POLICY "Admins and sales reps can upload gallery files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'gallery-files' AND (is_main_admin() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sales_rep' AND is_active = true))
);

CREATE POLICY "Anyone can view gallery files" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-files');

CREATE POLICY "Admins can delete gallery files" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-files' AND is_main_admin());

-- Updated at trigger
CREATE TRIGGER update_gallery_folders_updated_at BEFORE UPDATE ON public.gallery_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_files_updated_at BEFORE UPDATE ON public.gallery_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
