-- Create pavers table for storing paver products
CREATE TABLE IF NOT EXISTS public.pavers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  collection text NOT NULL,
  description text,
  base_price numeric NOT NULL DEFAULT 15.00,
  image_url text,
  category text NOT NULL DEFAULT 'paver',
  colors jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pavers ENABLE ROW LEVEL SECURITY;

-- Create policies for pavers
CREATE POLICY "Anyone can view active pavers" 
ON public.pavers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage pavers" 
ON public.pavers 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Insert Appian Collection pavers
INSERT INTO public.pavers (name, collection, description, base_price, image_url, colors) VALUES
('Appian Adobe', 'Appian Collection', 'Premium Appian Collection Adobe pavers with authentic earthen tones', 28, '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png', '[{"name": "Adobe Clay", "hex": "#B8956B", "priceModifier": 1.0}, {"name": "Desert Sand", "hex": "#D2B48C", "priceModifier": 1.05}, {"name": "Terracotta", "hex": "#C65D07", "priceModifier": 1.1}]'),
('Appian Amaretto', 'Appian Collection', 'Rich Amaretto tones from the Appian Collection', 30, '/lovable-uploads/5e630c2e-3a3f-49bf-b5d5-425a69959416.png', '[{"name": "Amaretto", "hex": "#C4A484", "priceModifier": 1.0}, {"name": "Warm Beige", "hex": "#D4B896", "priceModifier": 1.05}, {"name": "Golden Brown", "hex": "#B8956B", "priceModifier": 1.1}]'),
('Appian Harvest Blend', 'Appian Collection', 'Multi-toned Harvest Blend from the Appian Collection', 32, '/lovable-uploads/a5fa0931-4c93-4c42-81b9-e8ad3f61e659.png', '[{"name": "Harvest Mix", "hex": "#B8956B", "priceModifier": 1.0}, {"name": "Autumn Blend", "hex": "#C4A484", "priceModifier": 1.05}, {"name": "Golden Harvest", "hex": "#D2B48C", "priceModifier": 1.1}]'),
('Appian Knightsbridge', 'Appian Collection', 'Elegant Knightsbridge style from the Appian Collection', 35, '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png', '[{"name": "Knightsbridge Gray", "hex": "#8B7765", "priceModifier": 1.0}, {"name": "English Stone", "hex": "#9C8A7A", "priceModifier": 1.05}, {"name": "London Fog", "hex": "#A69B8E", "priceModifier": 1.1}]'),
('Appian Napoli', 'Appian Collection', 'Mediterranean Napoli style from the Appian Collection', 33, '/lovable-uploads/1a896779-5d8f-4f85-b26b-ab797c2afac4.png', '[{"name": "Napoli Stone", "hex": "#A69B8E", "priceModifier": 1.0}, {"name": "Mediterranean", "hex": "#B8A897", "priceModifier": 1.05}, {"name": "Tuscan Blend", "hex": "#C4B5A6", "priceModifier": 1.1}]'),
('Appian Rio', 'Appian Collection', 'Warm Rio tones from the Appian Collection', 29, '/lovable-uploads/b7d9216e-3489-4a50-827d-974a5b6481be.png', '[{"name": "Rio Sand", "hex": "#D2B48C", "priceModifier": 1.0}, {"name": "Copacabana", "hex": "#DEB887", "priceModifier": 1.05}, {"name": "Brazilian Tan", "hex": "#CD853F", "priceModifier": 1.1}]'),
('Appian Slate', 'Appian Collection', 'Modern Slate finish from the Appian Collection', 34, '/lovable-uploads/fcc4d668-4682-47d8-89c4-5cba819f80ed.png', '[{"name": "Slate Gray", "hex": "#708090", "priceModifier": 1.0}, {"name": "Charcoal Slate", "hex": "#36454F", "priceModifier": 1.05}, {"name": "Storm Gray", "hex": "#696969", "priceModifier": 1.1}]'),
('Appian Titanium', 'Appian Collection', 'Contemporary Titanium finish from the Appian Collection', 36, '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png', '[{"name": "Titanium", "hex": "#5F6A6B", "priceModifier": 1.0}, {"name": "Platinum", "hex": "#71797E", "priceModifier": 1.05}, {"name": "Steel Gray", "hex": "#6C7B7F", "priceModifier": 1.1}]'),
('Appian Charco', 'Appian Collection', 'Deep Charco tones from the Appian Collection', 31, '/lovable-uploads/6d98de42-0baa-42af-a04c-3b16e3dcb6a6.png', '[{"name": "Charco", "hex": "#36454F", "priceModifier": 1.0}, {"name": "Dark Slate", "hex": "#2F4F4F", "priceModifier": 1.05}, {"name": "Midnight Gray", "hex": "#2C3539", "priceModifier": 1.1}]');

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pavers_updated_at
    BEFORE UPDATE ON public.pavers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();