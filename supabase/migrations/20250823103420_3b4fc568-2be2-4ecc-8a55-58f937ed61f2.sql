-- Create user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('main_admin', 'supplier', 'consumer', 'installer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to use the enum type
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Enable realtime for job_postings if not already enabled
ALTER TABLE public.job_postings REPLICA IDENTITY FULL;
ALTER TABLE public.job_proposals REPLICA IDENTITY FULL;

-- Add job_postings and job_proposals to realtime publication
DO $$
BEGIN
    PERFORM pg_catalog.pg_get_publication_tables('supabase_realtime') 
    WHERE schemaname = 'public' AND tablename = 'job_postings';
    
    IF NOT FOUND THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.job_postings;
    END IF;
    
    PERFORM pg_catalog.pg_get_publication_tables('supabase_realtime') 
    WHERE schemaname = 'public' AND tablename = 'job_proposals';
    
    IF NOT FOUND THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.job_proposals;
    END IF;
END
$$;