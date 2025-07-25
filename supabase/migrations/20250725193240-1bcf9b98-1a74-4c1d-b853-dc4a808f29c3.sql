-- Extend products table to support consolidated product types
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pattern TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS durability INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_years_text TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS motor_type TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS installation_time TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS type_category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS features_json JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_options JSONB DEFAULT '{}'::jsonb;

-- Add Stripe to retail service type since payment isn't allowed
INSERT INTO api_configurations (service_name, service_type, status, features) 
VALUES ('Stripe', 'retail', 'disconnected', ARRAY['Payments', 'Checkout', 'Subscriptions', 'Webhooks'])
ON CONFLICT (service_name) DO NOTHING;

-- Create a consolidated products view for easy querying
CREATE OR REPLACE VIEW consolidated_products AS
SELECT 
  id,
  name,
  price,
  category,
  subcategory,
  type_category,
  collection_name,
  description,
  image_url,
  brand,
  sku,
  stock_quantity,
  pattern,
  durability,
  warranty_years_text,
  material,
  motor_type,
  installation_time,
  features_json,
  benefits,
  pricing_options,
  is_active,
  created_at,
  updated_at
FROM products
WHERE is_active = true
ORDER BY category, subcategory, name;