-- Create the first main admin account (you can change the email)
-- This will be the initial admin who can create other admins
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'admin@wonderland.com',
  crypt('admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Main", "last_name": "Admin", "role": "main_admin"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Create profile for the admin (will be handled by trigger, but let's ensure it)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@wonderland.com';
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
        VALUES (admin_user_id, 'admin@wonderland.com', 'Main', 'Admin', 'main_admin', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'main_admin',
            is_active = true;
    END IF;
END $$;