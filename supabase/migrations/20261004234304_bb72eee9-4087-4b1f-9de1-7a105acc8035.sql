-- CRM + Web Builder foundation (Job 2, Phase 1). All rows isolated by company_id.
CREATE TABLE public.crm_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT public.current_company_id() REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'residential',
  industry text, phone text, email text, website text, billing_address text,
  source_client_id uuid,
  assigned_to uuid,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_accounts TO authenticated;
GRANT ALL ON public.crm_accounts TO service_role;
ALTER TABLE public.crm_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_accounts company access" ON public.crm_accounts FOR ALL TO authenticated
  USING (public.is_main_admin() OR public.is_company_member(company_id))
  WITH CHECK (public.is_main_admin() OR public.is_company_member(company_id));
CREATE INDEX crm_accounts_company_idx ON public.crm_accounts(company_id, updated_at DESC);

CREATE TABLE public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT public.current_company_id() REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  first_name text, last_name text, title text, phone text, email text,
  is_primary boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT ALL ON public.crm_contacts TO service_role;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_contacts company access" ON public.crm_contacts FOR ALL TO authenticated
  USING (public.is_main_admin() OR public.is_company_member(company_id))
  WITH CHECK (public.is_main_admin() OR public.is_company_member(company_id));
CREATE INDEX crm_contacts_company_idx ON public.crm_contacts(company_id, account_id);

CREATE TABLE public.crm_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT public.current_company_id() REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'discovery',
  amount numeric NOT NULL DEFAULT 0,
  probability integer NOT NULL DEFAULT 10,
  expected_close_date date,
  assigned_to uuid,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_deals TO authenticated;
GRANT ALL ON public.crm_deals TO service_role;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_deals company access" ON public.crm_deals FOR ALL TO authenticated
  USING (public.is_main_admin() OR public.is_company_member(company_id))
  WITH CHECK (public.is_main_admin() OR public.is_company_member(company_id));
CREATE INDEX crm_deals_company_stage_idx ON public.crm_deals(company_id, stage, position);

CREATE TABLE public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT public.current_company_id() REFERENCES public.companies(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'note',
  subject text NOT NULL,
  description text,
  due_date timestamptz,
  status text NOT NULL DEFAULT 'pending',
  performed_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT ALL ON public.crm_activities TO service_role;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_activities company access" ON public.crm_activities FOR ALL TO authenticated
  USING (public.is_main_admin() OR public.is_company_member(company_id))
  WITH CHECK (public.is_main_admin() OR public.is_company_member(company_id));
CREATE INDEX crm_activities_company_due_idx ON public.crm_activities(company_id, status, due_date);
CREATE INDEX crm_activities_account_idx ON public.crm_activities(account_id, created_at DESC);

CREATE TABLE public.company_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT public.current_company_id() REFERENCES public.companies(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'My site',
  layout jsonb NOT NULL DEFAULT '{"sections":[]}'::jsonb,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.company_sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_sites TO authenticated;
GRANT ALL ON public.company_sites TO service_role;
ALTER TABLE public.company_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_sites public published" ON public.company_sites FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "company_sites company access" ON public.company_sites FOR ALL TO authenticated
  USING (public.is_main_admin() OR public.is_company_member(company_id))
  WITH CHECK (public.is_main_admin() OR public.is_company_member(company_id));
CREATE INDEX company_sites_company_idx ON public.company_sites(company_id);

-- Link existing quotes and invoices to deals (nullable, nothing existing changes)
ALTER TABLE public.user_quotations ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES public.crm_deals(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES public.crm_deals(id) ON DELETE SET NULL;

CREATE TRIGGER crm_accounts_updated BEFORE UPDATE ON public.crm_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER crm_contacts_updated BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER crm_deals_updated BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER crm_activities_updated BEFORE UPDATE ON public.crm_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER company_sites_updated BEFORE UPDATE ON public.company_sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();