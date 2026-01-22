-- Drop the restrictive admin-only update policy
DROP POLICY IF EXISTS "Invoices updatable by admins" ON public.invoices;

-- Create a policy allowing anyone to update invoices (passcode verification is done in frontend)
CREATE POLICY "Anyone can update invoices"
ON public.invoices
FOR UPDATE
USING (true)
WITH CHECK (true);