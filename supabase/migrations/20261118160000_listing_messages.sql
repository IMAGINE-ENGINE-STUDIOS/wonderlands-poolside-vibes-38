-- Messages with the project owner for the single procurement system
-- (founder ruling 2026-11-18: every Astoria style project posting carries
-- a messages feature, communication with the project owner). One private
-- thread per (listing, bidder): the project owner
-- (construction_projects.created_by) and one bidder talk on one listing.
-- Any signed in contractor may open a thread, including before bidding.
-- This is the single system counterpart of job_messages, which stays
-- tied to the legacy job_postings records and is not extended.
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf.

CREATE TABLE IF NOT EXISTS public.listing_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.procurement_listings(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_messages_thread_idx
  ON public.listing_messages (listing_id, bidder_id, created_at);
CREATE INDEX IF NOT EXISTS listing_messages_project_idx
  ON public.listing_messages (project_id, created_at);

ALTER TABLE public.listing_messages ENABLE ROW LEVEL SECURITY;

-- A thread is visible to the project owner, the thread's bidder, and admins.
DROP POLICY IF EXISTS "Listing thread participants read" ON public.listing_messages;
CREATE POLICY "Listing thread participants read" ON public.listing_messages
FOR SELECT TO authenticated
USING (
  bidder_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.construction_projects cp
    WHERE cp.id = listing_messages.project_id AND cp.created_by = auth.uid()
  )
  OR is_main_admin()
);

-- Sending: you must be the sender, and a participant: either the thread's
-- bidder, or the owner of the listing's project. The listing and project
-- named on the row must belong together.
DROP POLICY IF EXISTS "Listing thread participants send" ON public.listing_messages;
CREATE POLICY "Listing thread participants send" ON public.listing_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.procurement_listings pl
    WHERE pl.id = listing_messages.listing_id AND pl.project_id = listing_messages.project_id
  )
  AND (
    bidder_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.construction_projects cp
      WHERE cp.id = listing_messages.project_id AND cp.created_by = auth.uid()
    )
    OR is_main_admin()
  )
);

-- Realtime, the same switch on as the legacy message table.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'listing_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_messages;
  END IF;
END $$;
