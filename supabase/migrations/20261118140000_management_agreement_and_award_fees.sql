-- Homeowner management agreement + contractor award fee (founder spec
-- 2026-11-18). When a project owner accepts a proposal, they first click
-- "I accept" on a simple management agreement: they hire Wonderlands World
-- Experience LLC to manage the project for 10% of the accepted budget,
-- collected in the first payment. That acceptance is recorded in
-- management_agreements. At the same award, the HIRED subcontractor owes
-- Wonderlands a platform fee (a configurable percentage of the contract,
-- founder range 8-10%, not finally fixed) — recorded in
-- contractor_award_fees.
--
-- VISIBILITY RULE (hard): contractor_award_fees is contractor-side only.
-- Its SELECT policy admits ONLY the winning contractor and main admins.
-- The project owner who created the record at award time can NOT read it
-- back — the subcontractor's percentage appears nowhere on homeowner
-- surfaces, not in the agreement, not in My Postings, not in bid
-- comparisons, not in owner notifications.
--
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf BEFORE the award flow is used live: the award code
-- writes the agreement record as part of acceptance and refuses to award
-- if that write fails.

CREATE TABLE IF NOT EXISTS public.management_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.procurement_listings(id) ON DELETE CASCADE,
  proposal_id uuid NOT NULL UNIQUE REFERENCES public.procurement_proposals(id) ON DELETE CASCADE,
  accepted_by uuid NOT NULL REFERENCES auth.users(id),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  contract_amount numeric(12,2) NOT NULL,
  fee_percent numeric(5,2) NOT NULL,
  fee_amount numeric(12,2) NOT NULL,
  agreement_version text NOT NULL,
  agreement_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS management_agreements_listing_idx
  ON public.management_agreements (listing_id);
CREATE INDEX IF NOT EXISTS management_agreements_project_idx
  ON public.management_agreements (project_id);

ALTER TABLE public.management_agreements ENABLE ROW LEVEL SECURITY;

-- The accepting owner reads their own agreements; admins read all.
DROP POLICY IF EXISTS "Owners read own management agreements" ON public.management_agreements;
CREATE POLICY "Owners read own management agreements" ON public.management_agreements
FOR SELECT TO authenticated
USING (accepted_by = auth.uid() OR is_main_admin());

-- Only the project's own creator can record an acceptance, and only as
-- themselves. No update or delete policies: the record is immutable.
DROP POLICY IF EXISTS "Creators record own management agreements" ON public.management_agreements;
CREATE POLICY "Creators record own management agreements" ON public.management_agreements
FOR INSERT TO authenticated
WITH CHECK (
  accepted_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.construction_projects cp
    WHERE cp.id = project_id AND cp.created_by = auth.uid()
  )
);

CREATE TABLE IF NOT EXISTS public.contractor_award_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.procurement_listings(id) ON DELETE CASCADE,
  proposal_id uuid NOT NULL UNIQUE REFERENCES public.procurement_proposals(id) ON DELETE CASCADE,
  contractor_id uuid NOT NULL REFERENCES public.contractors(id),
  contract_amount numeric(12,2) NOT NULL,
  fee_percent numeric(5,2) NOT NULL,
  fee_amount numeric(12,2) NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contractor_award_fees_contractor_idx
  ON public.contractor_award_fees (contractor_id);

ALTER TABLE public.contractor_award_fees ENABLE ROW LEVEL SECURITY;

-- ONLY the winning contractor (through their contractor record) and main
-- admins can read a fee row. Deliberately NO policy for the project owner.
DROP POLICY IF EXISTS "Winning contractor reads own award fees" ON public.contractor_award_fees;
CREATE POLICY "Winning contractor reads own award fees" ON public.contractor_award_fees
FOR SELECT TO authenticated
USING (
  is_main_admin()
  OR EXISTS (
    SELECT 1 FROM public.contractors c
    WHERE c.id = contractor_id AND c.user_id = auth.uid()
  )
);

-- The award is recorded by the project's creator (the owner accepting the
-- proposal) or by an admin awarding directly.
DROP POLICY IF EXISTS "Award records contractor fee" ON public.contractor_award_fees;
CREATE POLICY "Award records contractor fee" ON public.contractor_award_fees
FOR INSERT TO authenticated
WITH CHECK (
  is_main_admin()
  OR EXISTS (
    SELECT 1 FROM public.procurement_listings pl
    JOIN public.construction_projects cp ON cp.id = pl.project_id
    WHERE pl.id = listing_id AND cp.created_by = auth.uid()
  )
);
