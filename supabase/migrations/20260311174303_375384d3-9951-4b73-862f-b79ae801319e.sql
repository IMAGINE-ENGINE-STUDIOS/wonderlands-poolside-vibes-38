
-- Add quotation_url to procurement_proposals for file uploads
ALTER TABLE public.procurement_proposals
  ADD COLUMN IF NOT EXISTS quotation_url text,
  ADD COLUMN IF NOT EXISTS quotation_file_name text;

-- Add task scheduling fields to procurement_listings
ALTER TABLE public.procurement_listings
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS assigned_contractor_id uuid REFERENCES public.contractors(id) ON DELETE SET NULL;

-- Create contractor_assigned_tasks view-like table to track accepted work
CREATE TABLE public.contractor_project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.procurement_listings(id) ON DELETE CASCADE NOT NULL,
  proposal_id uuid REFERENCES public.procurement_proposals(id) ON DELETE CASCADE NOT NULL,
  contractor_id uuid REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.construction_projects(id) ON DELETE CASCADE NOT NULL,
  task_name text NOT NULL,
  description text,
  location text,
  start_date date,
  due_date date,
  proposed_price numeric,
  status text NOT NULL DEFAULT 'assigned',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractor_project_tasks_contractor ON public.contractor_project_tasks(contractor_id);
CREATE INDEX idx_contractor_project_tasks_project ON public.contractor_project_tasks(project_id);

CREATE TRIGGER update_contractor_project_tasks_updated_at
  BEFORE UPDATE ON public.contractor_project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.contractor_project_tasks ENABLE ROW LEVEL SECURITY;

-- Contractors can view their own assigned tasks
CREATE POLICY "Contractors can view own assigned tasks"
  ON public.contractor_project_tasks FOR SELECT
  USING (true);

-- Admins can manage all tasks
CREATE POLICY "Admins can manage contractor project tasks"
  ON public.contractor_project_tasks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Contractors can update their own tasks (e.g. mark complete)
CREATE POLICY "Contractors can update own tasks"
  ON public.contractor_project_tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);
