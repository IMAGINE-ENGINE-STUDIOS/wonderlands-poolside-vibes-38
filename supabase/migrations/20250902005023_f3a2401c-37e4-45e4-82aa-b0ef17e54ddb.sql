-- Update profiles table to support sample users
UPDATE public.profiles 
SET email = 'rikicot@hotmail.com', role = 'main_admin', is_active = true 
WHERE email = 'rikicot@hotmail.com' OR role = 'main_admin';

-- Ensure the main admin exists
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
SELECT 
  gen_random_uuid(),
  'rikicot@hotmail.com',
  'Ricardo',
  'Admin',
  'main_admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'rikicot@hotmail.com'
);

-- Create sample supplier user
INSERT INTO public.profiles (id, email, first_name, last_name, company_name, role, is_active)
SELECT 
  gen_random_uuid(),
  'supplier.demo@wonderlands.app',
  'Demo',
  'Supplier',
  'Pool Supply Co',
  'supplier',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'supplier.demo@wonderlands.app'
);

-- Create sample contractor user  
INSERT INTO public.profiles (id, email, first_name, last_name, company_name, role, is_active)
SELECT 
  gen_random_uuid(),
  'contractor.demo@wonderlands.app',
  'Demo',
  'Contractor',
  'Premier Pool Installation',
  'installer',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'contractor.demo@wonderlands.app'
);

-- Function to check if user is the main admin only
CREATE OR REPLACE FUNCTION public.is_main_admin_only()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND email = 'rikicot@hotmail.com' 
      AND role = 'main_admin' 
      AND is_active = true
  );
$$;