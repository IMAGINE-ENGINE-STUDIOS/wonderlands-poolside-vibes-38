
-- Allow sales reps to insert new clients (they'll be assigned to the rep automatically)
CREATE POLICY "Sales reps can insert new clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'sales_rep'
    AND profiles.is_active = true
  )
);
