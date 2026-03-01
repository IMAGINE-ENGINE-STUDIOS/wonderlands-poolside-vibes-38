
-- Add internal share token for personnel sharing
ALTER TABLE public.construction_projects 
ADD COLUMN internal_share_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex');

-- Create cost tracking table
CREATE TABLE public.project_cost_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.project_phases(id) ON DELETE SET NULL,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  status TEXT NOT NULL DEFAULT 'quoted',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.project_cost_items ENABLE ROW LEVEL SECURITY;

-- Main admins full access
CREATE POLICY "Main admins can manage all cost items"
  ON public.project_cost_items FOR ALL
  USING (is_main_admin())
  WITH CHECK (is_main_admin());

-- Anyone can view cost items (needed for internal personnel link)
CREATE POLICY "Anyone can view cost items by project"
  ON public.project_cost_items FOR SELECT
  USING (true);

-- Anyone with the internal link can insert/update cost items
CREATE POLICY "Anyone can insert cost items"
  ON public.project_cost_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update cost items"
  ON public.project_cost_items FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete cost items"
  ON public.project_cost_items FOR DELETE
  USING (true);
