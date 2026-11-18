-- Procurement unification (founder ruling 2026-11-18): ONE procurement
-- system. Jobs published from the contractor dashboard console now write
-- construction_projects + procurement_listings + procurement_proposals —
-- the same records the public /procurement page reads — instead of the
-- legacy job_postings / job_proposals tables.
--
-- What already exists and is NOT changed here: company members manage
-- their own company's records on all three tables ("Company members
-- manage own company records", 20261004221704), admins manage everything,
-- open listings are publicly readable, and contractors manage their own
-- proposals. What was missing is the poster-as-creator path: a signed-in
-- user who created a project must be able to insert it, manage its
-- listings, read and act on the proposals sent to those listings, and
-- attach documents to it — regardless of which company row the records
-- carry. These policies add exactly that, nothing wider.
--
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf.

-- Projects: creators insert their own projects
DROP POLICY IF EXISTS "Creators insert own projects" ON public.construction_projects;
CREATE POLICY "Creators insert own projects" ON public.construction_projects FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND public.is_company_member(company_id));

-- Listings: creators read, insert and update listings on their own projects
DROP POLICY IF EXISTS "Creators read listings on own projects" ON public.procurement_listings;
CREATE POLICY "Creators read listings on own projects" ON public.procurement_listings FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.construction_projects cp WHERE cp.id = project_id AND cp.created_by = auth.uid()));

DROP POLICY IF EXISTS "Creators insert listings on own projects" ON public.procurement_listings;
CREATE POLICY "Creators insert listings on own projects" ON public.procurement_listings FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.construction_projects cp WHERE cp.id = project_id AND cp.created_by = auth.uid()));

DROP POLICY IF EXISTS "Creators update listings on own projects" ON public.procurement_listings;
CREATE POLICY "Creators update listings on own projects" ON public.procurement_listings FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.construction_projects cp WHERE cp.id = project_id AND cp.created_by = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.construction_projects cp WHERE cp.id = project_id AND cp.created_by = auth.uid()));

-- Proposals: listing owners read and act on proposals sent to their listings
DROP POLICY IF EXISTS "Listing owners read proposals" ON public.procurement_proposals;
CREATE POLICY "Listing owners read proposals" ON public.procurement_proposals FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.procurement_listings pl JOIN public.construction_projects cp ON cp.id = pl.project_id WHERE pl.id = listing_id AND cp.created_by = auth.uid()));

DROP POLICY IF EXISTS "Listing owners update proposals" ON public.procurement_proposals;
CREATE POLICY "Listing owners update proposals" ON public.procurement_proposals FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.procurement_listings pl JOIN public.construction_projects cp ON cp.id = pl.project_id WHERE pl.id = listing_id AND cp.created_by = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.procurement_listings pl JOIN public.construction_projects cp ON cp.id = pl.project_id WHERE pl.id = listing_id AND cp.created_by = auth.uid()));

-- Documents: creators attach documents to their own projects
DROP POLICY IF EXISTS "Creators insert own project documents" ON public.procurement_documents;
CREATE POLICY "Creators insert own project documents" ON public.procurement_documents FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.construction_projects cp WHERE cp.id = project_id AND cp.created_by = auth.uid()));
