-- Fix security issues identified by linter

-- 1. Fix function search path issues for security functions
CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND role = 'main_admin' 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
$$;

-- 2. Create the main admin user account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  gen_random_uuid(),
  'fosstheory@gmail.com',
  crypt('Crrrmg452077', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create profile for main admin
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  is_active
) 
SELECT 
  id,
  'fosstheory@gmail.com',
  'Main',
  'Admin',
  'consumer',
  true
FROM auth.users 
WHERE email = 'fosstheory@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Create admin_users entry
INSERT INTO admin_users (
  id,
  email,
  password_hash,
  role,
  is_active
) 
SELECT 
  id,
  'fosstheory@gmail.com',
  crypt('Crrrmg452077', gen_salt('bf')),
  'main_admin',
  true
FROM auth.users 
WHERE email = 'fosstheory@gmail.com'
ON CONFLICT (email) DO NOTHING;