-- Claim flow for procurement projects created from homeowner posts.
-- A loader can create a construction_projects row for a homeowner before
-- they have an account: created_by stays NULL, status is 'unclaimed',
-- and every procurement_listings row starts as 'draft', which keeps the
-- project off the public /procurement page (the public lookup only shows
-- projects with at least one open listing). The outreach message carries
-- a link of the form /procurement?claim=<share_token>. When the homeowner
-- signs in and claims, this function makes the project theirs and opens
-- its listings for bids.
-- SECURITY DEFINER is required: no RLS policy lets a new homeowner update
-- a platform created project whose created_by is still NULL. Once this
-- function writes created_by = auth.uid(), the existing creator policies
-- and My Postings pick the project up with no further changes.
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf.

CREATE OR REPLACE FUNCTION public.claim_procurement_project(p_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_project_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to claim a project.';
  END IF;

  SELECT cp.id INTO v_project_id
  FROM public.construction_projects cp
  WHERE cp.share_token = p_token
    AND cp.created_by IS NULL
    AND cp.status = 'unclaimed';

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'This project is not available to claim.';
  END IF;

  UPDATE public.construction_projects
  SET created_by = auth.uid(), status = 'active'
  WHERE id = v_project_id;

  UPDATE public.procurement_listings
  SET status = 'open'
  WHERE project_id = v_project_id AND status = 'draft';

  RETURN v_project_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_procurement_project(text) TO authenticated;
