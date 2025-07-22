-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON public.admin_users;

-- Create a function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  )
$$;

-- Create non-recursive policies
CREATE POLICY "Allow admin login verification" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage users" 
ON public.admin_users 
FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Ensure the demo admin user exists with proper password hash
-- This is the bcrypt hash for "admin123!"
INSERT INTO public.admin_users (id, email, password_hash, role, is_active) 
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'admin@wonderlandspools.com', 
  '$2b$10$K8BOwvQX8PQJ6tFYZGOiU.5r1L0Z8Y9BwV3xY4fNjXqL8E6vKQl5u',
  'super_admin',
  true
) 
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;