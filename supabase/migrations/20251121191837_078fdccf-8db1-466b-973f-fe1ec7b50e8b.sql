-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  quotation_id UUID REFERENCES public.user_quotations(id),
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT NOT NULL,
  
  -- Invoice Details
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Items and Pricing
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment Information
  payment_terms TEXT DEFAULT 'Net 30',
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_date DATE,
  
  -- Additional Information
  notes TEXT,
  terms_conditions TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Invoices viewable by admins and invoice owner"
  ON public.invoices
  FOR SELECT
  USING (
    is_main_admin() OR 
    auth.uid() = user_id OR 
    auth.uid() = created_by
  );

CREATE POLICY "Invoices insertable by admins"
  ON public.invoices
  FOR INSERT
  WITH CHECK (is_main_admin());

CREATE POLICY "Invoices updatable by admins"
  ON public.invoices
  FOR UPDATE
  USING (is_main_admin());

CREATE POLICY "Invoices deletable by admins"
  ON public.invoices
  FOR DELETE
  USING (is_main_admin());

-- Create index for faster lookups
CREATE INDEX idx_invoices_customer_email ON public.invoices(customer_email);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_payment_status ON public.invoices(payment_status);

-- Create trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  year_prefix TEXT;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_prefix || '-%';
  
  RETURN 'INV-' || year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
END;
$$;