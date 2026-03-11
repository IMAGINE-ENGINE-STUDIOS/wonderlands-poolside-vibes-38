
CREATE TABLE public.procurement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.procurement_listings(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.procurement_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read procurement documents"
  ON public.procurement_documents FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert procurement documents"
  ON public.procurement_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete procurement documents"
  ON public.procurement_documents FOR DELETE
  TO authenticated
  USING (true);
