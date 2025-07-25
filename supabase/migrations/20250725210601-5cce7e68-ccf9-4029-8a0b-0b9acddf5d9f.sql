-- Fix security definer view by dropping and recreating as a regular view
DROP VIEW IF EXISTS consolidated_products;

-- Create consolidated_products as a regular view (not security definer)
CREATE VIEW consolidated_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.subcategory,
    p.type_category,
    p.collection_name,
    p.pattern,
    p.motor_type,
    p.brand,
    p.sku,
    p.image_url,
    p.stock_quantity,
    p.material,
    p.benefits,
    p.durability,
    p.features_json,
    p.warranty_years_text,
    p.installation_time,
    p.is_active,
    p.pricing_options,
    p.created_at,
    p.updated_at
FROM products p
WHERE p.is_active = true AND p.stock_quantity > 0;

-- Fix function search paths by setting them explicitly
ALTER FUNCTION public.auto_promote_first_user() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';