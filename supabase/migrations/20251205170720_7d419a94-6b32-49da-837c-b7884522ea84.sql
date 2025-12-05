-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Invoices insertable by admins" ON invoices;

-- Create new insert policy that allows admins OR authenticated users to create their own invoices
CREATE POLICY "Invoices insertable by admins or owners" 
ON invoices 
FOR INSERT 
WITH CHECK (
  is_main_admin() 
  OR (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR created_by = auth.uid()))
);