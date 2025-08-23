-- Drop the policy that's preventing the column type change
DROP POLICY IF EXISTS "Public can view supplier profiles for products" ON public.profiles;

-- Create user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('main_admin', 'supplier', 'consumer', 'installer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to use the enum type
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Recreate the policy
CREATE POLICY "Public can view supplier profiles for products"
ON public.profiles
FOR SELECT
USING ((role = 'supplier'::user_role) AND (is_active = true));

-- Enable realtime for job_postings and job_proposals
ALTER TABLE public.job_postings REPLICA IDENTITY FULL;
ALTER TABLE public.job_proposals REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'job_postings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.job_postings;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'job_proposals'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.job_proposals;
    END IF;
END
$$;