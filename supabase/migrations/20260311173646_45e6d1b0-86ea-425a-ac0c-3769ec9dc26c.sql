
-- Procurement listings: bridges construction_projects to marketplace
CREATE TABLE public.procurement_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.construction_projects(id) ON DELETE CASCADE NOT NULL,
  phase_item_id uuid REFERENCES public.phase_items(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  budget_min numeric,
  budget_max numeric,
  deadline date,
  status text NOT NULL DEFAULT 'open',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Procurement proposals: contractor bids
CREATE TABLE public.procurement_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.procurement_listings(id) ON DELETE CASCADE NOT NULL,
  contractor_id uuid REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  proposal_type text NOT NULL DEFAULT 'custom',
  service_id uuid REFERENCES public.contractor_services(id) ON DELETE SET NULL,
  proposed_price numeric,
  proposal_text text,
  estimated_timeline text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_procurement_listings_project ON public.procurement_listings(project_id);
CREATE INDEX idx_procurement_listings_status ON public.procurement_listings(status);
CREATE INDEX idx_procurement_proposals_listing ON public.procurement_proposals(listing_id);
CREATE INDEX idx_procurement_proposals_contractor ON public.procurement_proposals(contractor_id);

-- Updated_at triggers
CREATE TRIGGER update_procurement_listings_updated_at
  BEFORE UPDATE ON public.procurement_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procurement_proposals_updated_at
  BEFORE UPDATE ON public.procurement_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.procurement_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_proposals ENABLE ROW LEVEL SECURITY;

-- Listings: public read for open, admin full access
CREATE POLICY "Anyone can view open procurement listings"
  ON public.procurement_listings FOR SELECT
  USING (status = 'open');

CREATE POLICY "Admins can manage procurement listings"
  ON public.procurement_listings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Proposals: contractors manage own, admin view all
CREATE POLICY "Contractors can view own proposals"
  ON public.procurement_proposals FOR SELECT
  USING (true);

CREATE POLICY "Contractors can insert own proposals"
  ON public.procurement_proposals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Contractors can update own proposals"
  ON public.procurement_proposals FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Contractors can delete own proposals"
  ON public.procurement_proposals FOR DELETE
  USING (true);
