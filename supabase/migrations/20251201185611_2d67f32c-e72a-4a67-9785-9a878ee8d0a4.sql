-- Create clients table for CRM
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Address
  address_street TEXT,
  address_city TEXT,
  address_state TEXT DEFAULT 'FL',
  address_zip TEXT,
  location_region TEXT,
  
  -- Budget & Interests
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  interests JSONB DEFAULT '[]'::jsonb,
  
  -- Survey
  survey_uploaded BOOLEAN DEFAULT false,
  survey_file_url TEXT,
  
  -- Sales Rep Assignment
  assigned_sales_rep_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Pipeline Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost')),
  
  -- Source tracking
  source TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create client_activities table for tracking progress
CREATE TABLE public.client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'survey_received', 'proposal_sent', 'status_change')),
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Main admins can manage all clients"
ON public.clients
FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

CREATE POLICY "Sales reps can view their assigned clients"
ON public.clients
FOR SELECT
USING (assigned_sales_rep_id = auth.uid());

CREATE POLICY "Sales reps can update their assigned clients"
ON public.clients
FOR UPDATE
USING (assigned_sales_rep_id = auth.uid())
WITH CHECK (assigned_sales_rep_id = auth.uid());

-- RLS Policies for client_activities
CREATE POLICY "Main admins can manage all activities"
ON public.client_activities
FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

CREATE POLICY "Sales reps can view activities for their clients"
ON public.client_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_activities.client_id
    AND clients.assigned_sales_rep_id = auth.uid()
  )
);

CREATE POLICY "Sales reps can create activities for their clients"
ON public.client_activities
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_activities.client_id
    AND clients.assigned_sales_rep_id = auth.uid()
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_assigned_rep ON public.clients(assigned_sales_rep_id);
CREATE INDEX idx_client_activities_client_id ON public.client_activities(client_id);
CREATE INDEX idx_client_activities_created_at ON public.client_activities(created_at DESC);