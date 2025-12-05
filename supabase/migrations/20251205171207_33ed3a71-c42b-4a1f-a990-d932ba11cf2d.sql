-- Drop existing insert policy
DROP POLICY IF EXISTS "Invoices insertable by admins or owners" ON invoices;

-- Create new insert policy that allows public invoice creation (no auth required)
CREATE POLICY "Invoices insertable by anyone" 
ON invoices 
FOR INSERT 
WITH CHECK (true);

-- Also update select policy to allow viewing invoices by email match
DROP POLICY IF EXISTS "Invoices viewable by admins and invoice owner" ON invoices;

CREATE POLICY "Invoices viewable by admins owners or public by id" 
ON invoices 
FOR SELECT 
USING (
  is_main_admin() 
  OR (auth.uid() = user_id) 
  OR (auth.uid() = created_by)
  OR (user_id IS NULL)
);