-- Unsubscribe support on clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS email_unsubscribed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS clients_unsubscribe_token_idx ON public.clients(unsubscribe_token);

-- Daily campaign rotation: one row per campaign, rendered HTML saved from the admin panel
CREATE TABLE public.daily_email_rotation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_key text NOT NULL UNIQUE,
  title text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_email_rotation TO authenticated;
GRANT ALL ON public.daily_email_rotation TO service_role;
ALTER TABLE public.daily_email_rotation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Main admins manage daily rotation" ON public.daily_email_rotation
  FOR ALL USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());

-- One row per day sent: guarantees a single send per day and records which campaign went out
CREATE TABLE public.daily_email_sends (
  send_date date PRIMARY KEY,
  campaign_key text NOT NULL,
  title text,
  successful integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_email_sends TO authenticated;
GRANT ALL ON public.daily_email_sends TO service_role;
ALTER TABLE public.daily_email_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Main admins view daily sends" ON public.daily_email_sends
  FOR SELECT USING (public.is_main_admin());