-- Construction Projects table
CREATE TABLE public.construction_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE SET NULL,
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project Phases table
CREATE TABLE public.project_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  phase_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase Items (checklist items)
CREATE TABLE public.phase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES public.project_phases(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  due_date DATE,
  notes TEXT,
  item_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Item Documents (file uploads per checklist item)
CREATE TABLE public.item_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.phase_items(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.construction_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_documents ENABLE ROW LEVEL SECURITY;

-- RLS: construction_projects
CREATE POLICY "Main admins can manage all projects" ON public.construction_projects FOR ALL USING (is_main_admin()) WITH CHECK (is_main_admin());
CREATE POLICY "Public can view via share token" ON public.construction_projects FOR SELECT USING (true);

-- RLS: project_phases
CREATE POLICY "Main admins can manage phases" ON public.project_phases FOR ALL USING (is_main_admin()) WITH CHECK (is_main_admin());
CREATE POLICY "Public can view phases of accessible projects" ON public.project_phases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.construction_projects WHERE id = project_phases.project_id)
);

-- RLS: phase_items
CREATE POLICY "Main admins can manage items" ON public.phase_items FOR ALL USING (is_main_admin()) WITH CHECK (is_main_admin());
CREATE POLICY "Public can view items of accessible phases" ON public.phase_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_phases pp JOIN public.construction_projects cp ON cp.id = pp.project_id WHERE pp.id = phase_items.phase_id)
);

-- RLS: item_documents
CREATE POLICY "Main admins can manage documents" ON public.item_documents FOR ALL USING (is_main_admin()) WITH CHECK (is_main_admin());
CREATE POLICY "Public can view documents of accessible items" ON public.item_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.phase_items pi JOIN public.project_phases pp ON pp.id = pi.phase_id JOIN public.construction_projects cp ON cp.id = pp.project_id WHERE pi.id = item_documents.item_id)
);

-- Unique index on share_token
CREATE UNIQUE INDEX idx_construction_projects_share_token ON public.construction_projects(share_token);

-- Triggers for updated_at
CREATE TRIGGER update_construction_projects_updated_at BEFORE UPDATE ON public.construction_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON public.project_phases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_phase_items_updated_at BEFORE UPDATE ON public.phase_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', true);

CREATE POLICY "Anyone can view project documents" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');
CREATE POLICY "Admins can upload project documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents');
CREATE POLICY "Admins can delete project documents" ON storage.objects FOR DELETE USING (bucket_id = 'project-documents');