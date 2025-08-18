-- Remove the dangerous public read policy from admin_users table
DROP POLICY IF EXISTS "Allow admin login verification" ON public.admin_users;

-- Create a more restrictive policy that only allows authenticated admin users to read admin data
CREATE POLICY "Admin users can view admin data" 
ON public.admin_users 
FOR SELECT 
USING (is_admin_user());

-- Ensure the verify_admin_password function is secure and properly isolated
-- This function already exists and is SECURITY DEFINER, which allows it to 
-- bypass RLS when authenticating admin users, which is the correct pattern

-- Add an additional security measure: ensure only the system can call admin login functions
-- by creating a more restrictive policy for admin login attempts
CREATE POLICY "System can authenticate admin users" 
ON public.admin_users 
FOR SELECT 
USING (false); -- This will be bypassed by SECURITY DEFINER functions only

-- Replace the previous policy with the more secure one
DROP POLICY IF EXISTS "Admin users can view admin data" ON public.admin_users;

-- Only allow authenticated admin users to view other admin users
CREATE POLICY "Authenticated admins can view admin data" 
ON public.admin_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users check_admin 
    WHERE check_admin.id = auth.uid() 
    AND check_admin.is_active = true
  )
);