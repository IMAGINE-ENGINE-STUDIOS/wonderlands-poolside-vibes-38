-- Fix security definer view issue by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS consolidated_products;

-- Create regular view (not security definer)
CREATE VIEW consolidated_products AS
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