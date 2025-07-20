-- Create user_quotations table for saving pool quotation data
CREATE TABLE public.user_quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  yard_size TEXT,
  soil_type TEXT,
  access_width TEXT,
  utility_lines TEXT,
  special_requests TEXT,
  timeline TEXT,
  budget TEXT,
  pool_model TEXT,
  pool_price DECIMAL(10,2),
  pool_category TEXT,
  selected_options JSONB DEFAULT '[]'::jsonb,
  total_quote_amount DECIMAL(10,2),
  recommendations TEXT[],
  uploaded_image_url TEXT,
  processed_image_url TEXT,
  gala_user_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_quotations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since there's no Supabase auth yet)
CREATE POLICY "Allow all operations on user_quotations" 
ON public.user_quotations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_quotations_updated_at
BEFORE UPDATE ON public.user_quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create an index for better performance on email lookups
CREATE INDEX idx_user_quotations_email ON public.user_quotations(email);

-- Create an index for better performance on status
CREATE INDEX idx_user_quotations_status ON public.user_quotations(status);