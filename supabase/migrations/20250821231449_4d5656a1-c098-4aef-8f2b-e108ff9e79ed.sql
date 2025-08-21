-- Create procurement system tables

-- Job postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('pools', 'outdoors', 'patios', 'improvements', 'construction')),
  budget_min NUMERIC,
  budget_max NUMERIC,
  deadline DATE,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job attachments table
CREATE TABLE public.job_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job requirements/checklist table
CREATE TABLE public.job_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  requirement_text TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job proposals table
CREATE TABLE public.job_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.profiles(id),
  proposal_text TEXT,
  proposed_price NUMERIC,
  estimated_timeline TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proposal attachments table
CREATE TABLE public.proposal_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.job_proposals(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_postings
CREATE POLICY "Anyone can view open job postings" 
ON public.job_postings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create job postings" 
ON public.job_postings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND business_id = auth.uid());

CREATE POLICY "Business owners can update their job postings" 
ON public.job_postings 
FOR UPDATE 
USING (business_id = auth.uid());

CREATE POLICY "Business owners can delete their job postings" 
ON public.job_postings 
FOR DELETE 
USING (business_id = auth.uid());

-- RLS Policies for job_attachments
CREATE POLICY "Anyone can view job attachments" 
ON public.job_attachments 
FOR SELECT 
USING (true);

CREATE POLICY "Job owners can manage attachments" 
ON public.job_attachments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings 
    WHERE id = job_attachments.job_id 
    AND business_id = auth.uid()
  )
);

-- RLS Policies for job_requirements
CREATE POLICY "Anyone can view job requirements" 
ON public.job_requirements 
FOR SELECT 
USING (true);

CREATE POLICY "Job owners can manage requirements" 
ON public.job_requirements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings 
    WHERE id = job_requirements.job_id 
    AND business_id = auth.uid()
  )
);

-- RLS Policies for job_proposals
CREATE POLICY "Job owners and proposal authors can view proposals" 
ON public.job_proposals 
FOR SELECT 
USING (
  supplier_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.job_postings 
    WHERE id = job_proposals.job_id 
    AND business_id = auth.uid()
  )
);

CREATE POLICY "Authenticated suppliers can create proposals" 
ON public.job_proposals 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND supplier_id = auth.uid());

CREATE POLICY "Proposal authors can update their proposals" 
ON public.job_proposals 
FOR UPDATE 
USING (supplier_id = auth.uid());

CREATE POLICY "Proposal authors can delete their proposals" 
ON public.job_proposals 
FOR DELETE 
USING (supplier_id = auth.uid());

-- RLS Policies for proposal_attachments
CREATE POLICY "Proposal viewers can view attachments" 
ON public.proposal_attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.job_proposals jp
    JOIN public.job_postings j ON j.id = jp.job_id
    WHERE jp.id = proposal_attachments.proposal_id
    AND (jp.supplier_id = auth.uid() OR j.business_id = auth.uid())
  )
);

CREATE POLICY "Proposal owners can manage attachments" 
ON public.proposal_attachments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.job_proposals 
    WHERE id = proposal_attachments.proposal_id 
    AND supplier_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_proposals_updated_at
  BEFORE UPDATE ON public.job_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_job_postings_category ON public.job_postings(category);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_business_id ON public.job_postings(business_id);
CREATE INDEX idx_job_postings_created_at ON public.job_postings(created_at DESC);
CREATE INDEX idx_job_proposals_job_id ON public.job_proposals(job_id);
CREATE INDEX idx_job_proposals_supplier_id ON public.job_proposals(supplier_id);