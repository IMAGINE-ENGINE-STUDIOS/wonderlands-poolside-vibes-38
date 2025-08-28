-- Create referrals table for REFERN TO EERN portal
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_phone TEXT,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  lead_phone TEXT,
  lead_company TEXT,
  project_type TEXT NOT NULL,
  estimated_budget NUMERIC,
  project_description TEXT,
  lead_urgency TEXT DEFAULT 'medium',
  referrer_user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'qualified', 'converted', 'rejected')),
  commission_rate NUMERIC DEFAULT 5.00,
  estimated_commission NUMERIC GENERATED ALWAYS AS (COALESCE(estimated_budget, 0) * (commission_rate / 100)) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Referrers can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (
  (referrer_user_id = auth.uid()) OR 
  (referrer_user_id IS NULL AND referrer_email = auth.email())
);

CREATE POLICY "Admins can manage all referrals" 
ON public.referrals 
FOR ALL 
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referrals_updated_at();