CREATE TABLE public.flip_site_placements (
  slot text PRIMARY KEY,
  book_id uuid REFERENCES public.flip_books(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.flip_site_placements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.flip_site_placements TO authenticated;
GRANT ALL ON public.flip_site_placements TO service_role;
ALTER TABLE public.flip_site_placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads placements" ON public.flip_site_placements FOR SELECT USING (true);
CREATE POLICY "Main admin writes placements" ON public.flip_site_placements FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());