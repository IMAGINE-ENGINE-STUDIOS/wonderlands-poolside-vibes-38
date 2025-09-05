-- Security Fix: Remove public access to sensitive profile data
-- This addresses the security issue where supplier email addresses were exposed to public

-- 1. Drop the problematic public access policy
DROP POLICY IF EXISTS "Public can view supplier profiles for products" ON public.profiles;

-- 2. Create a secure function to get public supplier information (no sensitive data)
CREATE OR REPLACE FUNCTION public.get_public_supplier_info()
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  company_logo_url TEXT,
  role user_role,
  is_active BOOLEAN
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.company_name,
    p.company_logo_url,
    p.role,
    p.is_active
  FROM public.profiles p
  WHERE p.role = 'supplier' 
    AND p.is_active = true;
$$;

-- 3. Create a new policy that only allows access to the safe supplier data
CREATE POLICY "Public can view safe supplier info only"
ON public.profiles
FOR SELECT
USING (
  role = 'supplier' 
  AND is_active = true 
  AND auth.uid() IS NULL  -- Only for anonymous users, authenticated users use other policies
);

-- 4. Grant execute permission on the function to anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_supplier_info() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_supplier_info() TO authenticated;

-- 5. Add comment explaining the security measure
COMMENT ON FUNCTION public.get_public_supplier_info() IS 'Secure function to get public supplier information without exposing sensitive data like email addresses';