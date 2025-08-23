-- Fix user_quotations security by adding user authentication and proper RLS policies

-- Add user_id column to link quotations to authenticated users
ALTER TABLE public.user_quotations 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admins can update quotations" ON public.user_quotations;
DROP POLICY IF EXISTS "Admins can view all quotations" ON public.user_quotations;
DROP POLICY IF EXISTS "Users can insert their own quotations" ON public.user_quotations;

-- Create secure RLS policies

-- Only authenticated users can create quotations with their own user_id
CREATE POLICY "Authenticated users can create their own quotations"
ON public.user_quotations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only view their own quotations, admins can view all
CREATE POLICY "Users can view their own quotations"
ON public.user_quotations  
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_main_admin());

-- Users can only update their own quotations, admins can update all
CREATE POLICY "Users can update their own quotations"
ON public.user_quotations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_main_admin());

-- Only admins can delete quotations
CREATE POLICY "Only admins can delete quotations"
ON public.user_quotations
FOR DELETE
TO authenticated
USING (is_main_admin());

-- Create index for performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_quotations_user_id ON public.user_quotations(user_id);