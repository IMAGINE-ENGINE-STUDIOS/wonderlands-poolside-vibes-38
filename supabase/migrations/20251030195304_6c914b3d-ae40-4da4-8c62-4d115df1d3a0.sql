-- Make user_id nullable to allow guest quotes
ALTER TABLE public.user_quotations 
ALTER COLUMN user_id DROP NOT NULL;

-- Add policy to allow guest quote submissions
CREATE POLICY "Anyone can submit quotes"
ON public.user_quotations
FOR INSERT
WITH CHECK (
  -- Guest quotes: no user_id required, just need basic contact info
  (user_id IS NULL AND email IS NOT NULL AND name IS NOT NULL)
  OR 
  -- Authenticated quotes: must match their own user_id
  (user_id = auth.uid())
);