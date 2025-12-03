-- Create contractor status enum
CREATE TYPE public.contractor_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');

-- Create contractors table
CREATE TABLE public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT DEFAULT 'FL',
  address_zip TEXT,
  tax_id TEXT,
  years_experience INTEGER,
  status contractor_status DEFAULT 'pending',
  subscription_active BOOLEAN DEFAULT false,
  agreement_signed BOOLEAN DEFAULT false,
  agreement_signed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create contractor licenses table
CREATE TABLE public.contractor_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  license_type TEXT NOT NULL,
  license_number TEXT,
  issuing_authority TEXT,
  expiration_date DATE,
  document_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create contractor services/pricing table
CREATE TABLE public.contractor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  service_category TEXT NOT NULL,
  service_name TEXT NOT NULL,
  labor_price NUMERIC,
  with_materials_price NUMERIC,
  price_unit TEXT DEFAULT 'flat', -- 'flat', 'per_sq_ft', 'per_panel', 'per_unit'
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create contractor agreement signatures table
CREATE TABLE public.contractor_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  agreement_version TEXT DEFAULT '1.0',
  signature_data TEXT, -- Base64 signature image
  signed_name TEXT NOT NULL,
  signed_title TEXT,
  signed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contractors
CREATE POLICY "Contractors can view own profile" ON public.contractors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Contractors can update own profile" ON public.contractors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can register as contractor" ON public.contractors
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Main admins can manage all contractors" ON public.contractors
  FOR ALL USING (is_main_admin());

-- RLS Policies for licenses
CREATE POLICY "Contractors can manage own licenses" ON public.contractor_licenses
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.contractors 
    WHERE contractors.id = contractor_licenses.contractor_id 
    AND contractors.user_id = auth.uid()
  ));

CREATE POLICY "Main admins can manage all licenses" ON public.contractor_licenses
  FOR ALL USING (is_main_admin());

-- RLS Policies for services
CREATE POLICY "Contractors can manage own services" ON public.contractor_services
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.contractors 
    WHERE contractors.id = contractor_services.contractor_id 
    AND contractors.user_id = auth.uid()
  ));

CREATE POLICY "Main admins can manage all services" ON public.contractor_services
  FOR ALL USING (is_main_admin());

CREATE POLICY "Public can view active contractor services" ON public.contractor_services
  FOR SELECT USING (is_active = true);

-- RLS Policies for agreements
CREATE POLICY "Contractors can view own agreements" ON public.contractor_agreements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.contractors 
    WHERE contractors.id = contractor_agreements.contractor_id 
    AND contractors.user_id = auth.uid()
  ));

CREATE POLICY "Contractors can sign agreements" ON public.contractor_agreements
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.contractors 
    WHERE contractors.id = contractor_agreements.contractor_id 
    AND contractors.user_id = auth.uid()
  ));

CREATE POLICY "Main admins can manage all agreements" ON public.contractor_agreements
  FOR ALL USING (is_main_admin());

-- Create storage bucket for contractor documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contractor-documents', 'contractor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Contractors can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contractor-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contractor-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all contractor documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contractor-documents' AND is_main_admin()
  );

-- Indexes
CREATE INDEX idx_contractors_user_id ON public.contractors(user_id);
CREATE INDEX idx_contractors_status ON public.contractors(status);
CREATE INDEX idx_contractor_services_contractor_id ON public.contractor_services(contractor_id);
CREATE INDEX idx_contractor_licenses_contractor_id ON public.contractor_licenses(contractor_id);