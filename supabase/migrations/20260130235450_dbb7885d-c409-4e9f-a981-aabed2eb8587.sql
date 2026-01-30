-- Create sales_rep_category enum
CREATE TYPE public.sales_rep_category AS ENUM ('bdr', 'ae', 'csm', 'regional_sales', 'head_of_sales');

-- Add sales_category column to profiles
ALTER TABLE public.profiles 
ADD COLUMN sales_category public.sales_rep_category;

-- Set Jessica Grey as Head of Sales
UPDATE public.profiles 
SET sales_category = 'head_of_sales' 
WHERE id = '5e64621c-83c4-48c8-a3b0-dd317d7e7336';

-- Create client_sales_team table to track multi-category rep assignments per client
CREATE TABLE public.client_sales_team (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    sales_rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category public.sales_rep_category NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- Ensure only one rep per category per client
    CONSTRAINT unique_client_category UNIQUE (client_id, category)
);

-- Create sales_commissions table to track deal commissions
CREATE TABLE public.sales_commissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    sales_rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category public.sales_rep_category NOT NULL,
    deal_value NUMERIC(12, 2) NOT NULL,
    commission_rate NUMERIC(5, 4) NOT NULL,
    commission_amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    deal_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.client_sales_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_commissions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_client_sales_team_client ON public.client_sales_team(client_id);
CREATE INDEX idx_client_sales_team_rep ON public.client_sales_team(sales_rep_id);
CREATE INDEX idx_client_sales_team_category ON public.client_sales_team(category);
CREATE INDEX idx_sales_commissions_client ON public.sales_commissions(client_id);
CREATE INDEX idx_sales_commissions_rep ON public.sales_commissions(sales_rep_id);
CREATE INDEX idx_sales_commissions_status ON public.sales_commissions(status);

-- RLS Policies for client_sales_team

-- Head of Sales can view and manage all assignments
CREATE POLICY "Head of Sales can manage all team assignments"
ON public.client_sales_team
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND sales_category = 'head_of_sales'
    )
);

-- Sales reps can view their own assignments
CREATE POLICY "Sales reps can view their assignments"
ON public.client_sales_team
FOR SELECT
USING (sales_rep_id = auth.uid());

-- RLS Policies for sales_commissions

-- Head of Sales can view and manage all commissions
CREATE POLICY "Head of Sales can manage all commissions"
ON public.sales_commissions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND sales_category = 'head_of_sales'
    )
);

-- Sales reps can view their own commissions
CREATE POLICY "Sales reps can view their commissions"
ON public.sales_commissions
FOR SELECT
USING (sales_rep_id = auth.uid());

-- Create trigger for updated_at on client_sales_team
CREATE TRIGGER update_client_sales_team_updated_at
BEFORE UPDATE ON public.client_sales_team
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on sales_commissions
CREATE TRIGGER update_sales_commissions_updated_at
BEFORE UPDATE ON public.sales_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();