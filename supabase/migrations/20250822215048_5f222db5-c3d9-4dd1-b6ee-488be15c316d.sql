-- Create sample users with different roles
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'john.consumer@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "John", "last_name": "Smith", "role": "consumer"}'),
  ('22222222-2222-2222-2222-222222222222', 'jane.supplier@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "Jane", "last_name": "Wilson", "role": "supplier"}'),
  ('33333333-3333-3333-3333-333333333333', 'mike.installer@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"first_name": "Mike", "last_name": "Johnson", "role": "installer"}');

-- Create sample profiles (will auto-trigger from users table)
INSERT INTO public.profiles (id, email, first_name, last_name, role, company_name, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'john.consumer@example.com', 'John', 'Smith', 'consumer', null, true),
  ('22222222-2222-2222-2222-222222222222', 'jane.supplier@example.com', 'Jane', 'Wilson', 'supplier', 'Premium Pool Supplies Inc.', true),
  ('33333333-3333-3333-3333-333333333333', 'mike.installer@example.com', 'Mike', 'Johnson', 'installer', 'Sunshine Pool Installations', true);

-- Add sample products with real information
INSERT INTO public.products (id, name, price, category, subcategory, image_url, description, brand, sku, stock_quantity, is_active, supplier_id, features_json, benefits, warranty_years_text, material, installation_time)
VALUES 
  (gen_random_uuid(), 'Hayward Super Pump VS', 1299, 'maintenance', 'pumps', '/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png', 'Variable speed pool pump with energy efficient motor', 'Hayward', 'HW-SP-VS-100', 45, true, '22222222-2222-2222-2222-222222222222', 
   '["Variable Speed", "Energy Star Certified", "Digital Display", "Auto-Prime"]', 
   '["Up to 90% energy savings", "Quiet operation", "Extended motor life"]', '3 years', 'Thermoplastic', '2-4 hours'),
  
  (gen_random_uuid(), 'Pentair FNS Plus Sand Filter', 850, 'maintenance', 'filters', '/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png', 'High-rate sand filter with corrosion-proof tank', 'Pentair', 'PT-FNS-24', 32, true, '22222222-2222-2222-2222-222222222222',
   '["Corrosion-proof tank", "6-position valve", "High flow rate", "Easy maintenance"]',
   '["Crystal clear water", "Long lasting", "Reduced maintenance"]', '2 years', 'Fiberglass', '3-5 hours'),
   
  (gen_random_uuid(), 'Polaris 360 Pool Cleaner', 399, 'maintenance', 'cleaners', '/lovable-uploads/96f46291-85e7-4b48-9465-623400a8e835.png', 'Pressure-side automatic pool cleaner', 'Polaris', 'PL-360-CLN', 28, true, '22222222-2222-2222-2222-222222222222',
   '["Three-wheel drive", "Single chamber filter", "All-wheel drive"]',
   '["Superior cleaning", "Easy to use", "Reliable performance"]', '2 years', 'Durable plastic', '30 minutes'),
   
  (gen_random_uuid(), 'Jandy AquaPure Ei Salt System', 1899, 'maintenance', 'salt-systems', '/lovable-uploads/85d596d1-7479-4926-9732-a76fdac75eee.png', 'Electronic salt water chlorination system', 'Jandy', 'JD-AP-EI-25', 18, true, '22222222-2222-2222-2222-222222222222',
   '["Self-cleaning cell", "Digital display", "Pool/spa operation", "Freeze protection"]',
   '["Soft silky water", "No chlorine odor", "Reduced eye irritation"]', '3 years', 'Titanium plates', '4-6 hours');

-- Create sample orders with realistic data
INSERT INTO public.orders (id, consumer_id, supplier_id, product_id, quantity, unit_price, total_amount, commission_amount, supplier_amount, status, tracking_number, delivery_address, created_at)
SELECT 
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  p.supplier_id,
  p.id,
  CASE 
    WHEN p.name LIKE '%Pump%' THEN 1
    WHEN p.name LIKE '%Filter%' THEN 1  
    WHEN p.name LIKE '%Cleaner%' THEN 2
    ELSE 1
  END,
  p.price,
  p.price * CASE 
    WHEN p.name LIKE '%Pump%' THEN 1
    WHEN p.name LIKE '%Filter%' THEN 1
    WHEN p.name LIKE '%Cleaner%' THEN 2
    ELSE 1
  END,
  (p.price * CASE 
    WHEN p.name LIKE '%Pump%' THEN 1
    WHEN p.name LIKE '%Filter%' THEN 1
    WHEN p.name LIKE '%Cleaner%' THEN 2
    ELSE 1
  END) * 0.10,
  (p.price * CASE 
    WHEN p.name LIKE '%Pump%' THEN 1
    WHEN p.name LIKE '%Filter%' THEN 1
    WHEN p.name LIKE '%Cleaner%' THEN 2
    ELSE 1
  END) * 0.90,
  CASE 
    WHEN random() < 0.3 THEN 'pending'
    WHEN random() < 0.7 THEN 'processing'
    ELSE 'completed'
  END,
  CASE 
    WHEN random() < 0.7 THEN 'TRK' || lpad((random() * 1000000)::int::text, 6, '0')
    ELSE null
  END,
  '{"street": "123 Palm Beach Dr", "city": "Miami", "state": "FL", "zip": "33101", "country": "USA"}'::jsonb,
  now() - (random() * 30 || ' days')::interval
FROM public.products p
WHERE p.supplier_id = '22222222-2222-2222-2222-222222222222'
LIMIT 6;

-- Add consumer preferences for the sample consumer
INSERT INTO public.consumer_preferences (consumer_id, preferred_payment_methods, delivery_address, business_address)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '["credit_card", "paypal"]'::jsonb,
  '{"street": "123 Palm Beach Dr", "city": "Miami", "state": "FL", "zip": "33101", "country": "USA"}'::jsonb,
  '{"street": "456 Business Blvd", "city": "Miami", "state": "FL", "zip": "33102", "country": "USA"}'::jsonb
);

-- Add supplier banking config for sample supplier
INSERT INTO public.supplier_banking_config (supplier_id, commission_rate, is_verified, bank_account_details)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  10.00,
  true,
  '{"bank_name": "First National Bank", "account_type": "Business Checking", "routing": "123456789"}'::jsonb
);