-- Mail queue — the Resend quota fallback (founder ruling 2026-11-22).
-- When Resend refuses a send (daily quota / rate limit), the sender parks the
-- fully rendered mail here instead of losing it. The socialite-scheduler
-- drains the queue on its normal 5-minute rhythm once Resend accepts again.
CREATE TABLE public.mail_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL,
  from_addr text NOT NULL,
  to_addrs jsonb NOT NULL,
  subject text NOT NULL,
  html text,
  text_body text,
  reply_to text,
  headers jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  provider_id text,
  sent_at timestamptz
);
CREATE INDEX mail_queue_status_created_idx ON public.mail_queue (status, created_at);
GRANT SELECT ON public.mail_queue TO authenticated;
GRANT ALL ON public.mail_queue TO service_role;
ALTER TABLE public.mail_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Main admins view mail queue" ON public.mail_queue
  FOR SELECT USING (public.is_main_admin());
