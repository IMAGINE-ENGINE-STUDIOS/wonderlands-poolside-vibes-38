-- Create a supplier user account
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'supplier@wonderland.com',
  crypt('supplier123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Pool", "last_name": "Supplier", "role": "supplier", "company_name": "Pool Supply Co"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Create a consumer user account
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'consumer@wonderland.com',
  crypt('consumer123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "John", "last_name": "Consumer", "role": "consumer"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Create profiles for both users (ensuring proper role assignment)
DO $$
DECLARE
    supplier_user_id UUID;
    consumer_user_id UUID;
BEGIN
    -- Handle supplier profile
    SELECT id INTO supplier_user_id FROM auth.users WHERE email = 'supplier@wonderland.com';
    
    IF supplier_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, first_name, last_name, company_name, role, is_active)
        VALUES (supplier_user_id, 'supplier@wonderland.com', 'Pool', 'Supplier', 'Pool Supply Co', 'supplier', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'supplier',
            company_name = 'Pool Supply Co',
            is_active = true;
    END IF;
    
    -- Handle consumer profile
    SELECT id INTO consumer_user_id FROM auth.users WHERE email = 'consumer@wonderland.com';
    
    IF consumer_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
        VALUES (consumer_user_id, 'consumer@wonderland.com', 'John', 'Consumer', 'consumer', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'consumer',
            is_active = true;
    END IF;
END $$;