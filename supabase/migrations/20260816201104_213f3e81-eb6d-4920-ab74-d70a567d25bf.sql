CREATE TABLE public.genius_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  whatsapp_optin boolean NOT NULL DEFAULT false,
  preferred_at timestamptz,
  timezone text,
  topic text,
  notes text,
  status text NOT NULL DEFAULT 'requested',
  source text NOT NULL DEFAULT 'genius',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.genius_appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.genius_appointments TO authenticated;
GRANT ALL ON public.genius_appointments TO service_role;

ALTER TABLE public.genius_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request an appointment"
  ON public.genius_appointments FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read appointments"
  ON public.genius_appointments FOR SELECT TO authenticated
  USING (public.is_current_admin() OR public.is_main_admin());

CREATE POLICY "Admins can update appointments"
  ON public.genius_appointments FOR UPDATE TO authenticated
  USING (public.is_current_admin() OR public.is_main_admin())
  WITH CHECK (public.is_current_admin() OR public.is_main_admin());

CREATE POLICY "Admins can delete appointments"
  ON public.genius_appointments FOR DELETE TO authenticated
  USING (public.is_current_admin() OR public.is_main_admin());

CREATE TRIGGER update_genius_appointments_updated_at
  BEFORE UPDATE ON public.genius_appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_genius_appointments_preferred_at ON public.genius_appointments (preferred_at DESC);