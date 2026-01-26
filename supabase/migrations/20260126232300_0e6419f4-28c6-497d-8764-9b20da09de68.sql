-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  bundle_price NUMERIC NOT NULL,
  original_price NUMERIC,
  included_items JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  highlight_text TEXT,
  image_url TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Public can view active promotions
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (is_active = true);

-- Main admins can manage all promotions
CREATE POLICY "Main admins can manage promotions"
ON public.promotions
FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- Insert seed data: Bermuda Pool + Barrel Sauna bundle
INSERT INTO public.promotions (name, description, bundle_price, original_price, included_items, is_active, highlight_text)
VALUES (
  'Bermuda Pool + Barrel Sauna Bundle',
  'Transform your backyard into a luxurious retreat with our exclusive bundle featuring the stunning Bermuda fiberglass pool paired with a premium barrel sauna.',
  72863,
  85000,
  '[
    {"name": "Bermuda Fiberglass Pool", "value": "16x32 ft"},
    {"name": "Premium Barrel Sauna", "value": "4-person capacity"},
    {"name": "Professional Installation", "value": "Included"},
    {"name": "Pool Equipment Package", "value": "Pump, filter, heater"},
    {"name": "LED Lighting System", "value": "Color-changing"},
    {"name": "Extended Warranty", "value": "10 years"}
  ]'::jsonb,
  true,
  'SAVE $12,137!'
);