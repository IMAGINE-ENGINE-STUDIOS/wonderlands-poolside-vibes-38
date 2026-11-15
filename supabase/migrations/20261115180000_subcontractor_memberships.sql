-- Subcontractor Network memberships (founder, 2026-11-15): a business pays
-- $50 one-time to set up its subcontractor profile plus $150 per month to
-- keep getting jobs through the Wonderlands procurement solution.
-- Billing runs through the subcontractor-billing edge function (Stripe
-- Checkout, service role writes only). Owners read their own row; main
-- admins manage all rows.

CREATE TABLE public.subcontractor_memberships (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'inactive',
  setup_paid boolean NOT NULL DEFAULT false,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subcontractor_memberships TO authenticated;
GRANT ALL ON public.subcontractor_memberships TO service_role;
ALTER TABLE public.subcontractor_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own or admin reads subcontractor membership"
  ON public.subcontractor_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_main_admin());

CREATE POLICY "Main admin manages subcontractor memberships"
  ON public.subcontractor_memberships FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());
