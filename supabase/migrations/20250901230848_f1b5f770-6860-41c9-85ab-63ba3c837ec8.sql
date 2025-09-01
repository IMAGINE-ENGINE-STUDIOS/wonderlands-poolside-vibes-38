
-- 1) Safely promote the specified user to main_admin (won't fail if user doesn't exist yet)
DO $$
BEGIN
  PERFORM public.promote_user_to_main_admin('rikicot@hotmail.com');
EXCEPTION WHEN others THEN
  RAISE NOTICE 'User % not found yet; after the user signs up, rerun promotion or I can re-apply it.', 'rikicot@hotmail.com';
END
$$;

-- 2) Create per-user API token storage (hashed) with strict RLS
CREATE TABLE IF NOT EXISTS public.user_api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text,
  token_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  expires_at timestamptz
);

-- Basic indices
CREATE INDEX IF NOT EXISTS idx_user_api_tokens_user_id ON public.user_api_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_tokens_active ON public.user_api_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_user_api_tokens_expires_at ON public.user_api_tokens(expires_at);

-- RLS
ALTER TABLE public.user_api_tokens ENABLE ROW LEVEL SECURITY;

-- Users manage their own tokens
CREATE POLICY "Users can view own tokens"
  ON public.user_api_tokens
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tokens"
  ON public.user_api_tokens
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tokens"
  ON public.user_api_tokens
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tokens"
  ON public.user_api_tokens
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view/manage all tokens
CREATE POLICY "Main admins can view tokens"
  ON public.user_api_tokens
  FOR SELECT
  USING (is_main_admin());

CREATE POLICY "Main admins can manage tokens"
  ON public.user_api_tokens
  FOR ALL
  USING (is_main_admin())
  WITH CHECK (is_main_admin());

-- Updated_at trigger
CREATE TRIGGER set_user_api_tokens_updated_at
BEFORE UPDATE ON public.user_api_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Expires_at validation via trigger (use validation trigger not CHECK constraints)
CREATE OR REPLACE FUNCTION public.validate_future_expires()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_validate_future_expires ON public.user_api_tokens;
CREATE TRIGGER tr_validate_future_expires
BEFORE INSERT OR UPDATE ON public.user_api_tokens
FOR EACH ROW
EXECUTE FUNCTION public.validate_future_expires();

-- 3) Service offerings for contractors/suppliers (their services)
CREATE TABLE IF NOT EXISTS public.service_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  base_price numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_offerings_user_id ON public.service_offerings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_active ON public.service_offerings(is_active);

ALTER TABLE public.service_offerings ENABLE ROW LEVEL SECURITY;

-- Users manage their own services
CREATE POLICY "Users can manage own services"
  ON public.service_offerings
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Main admins can manage all services
CREATE POLICY "Main admins can manage all services"
  ON public.service_offerings
  FOR ALL
  USING (is_main_admin())
  WITH CHECK (is_main_admin());

-- Updated_at trigger
CREATE TRIGGER set_service_offerings_updated_at
BEFORE UPDATE ON public.service_offerings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Optional role enforcement for sample users (safe no-op if not signed up yet)
DO $$
BEGIN
  UPDATE public.profiles SET role = 'supplier', is_active = true, updated_at = now()
  WHERE email = 'supplier_demo@wonderlands.world';
  
  UPDATE public.profiles SET role = 'installer', is_active = true, updated_at = now()
  WHERE email = 'contractor_demo@wonderlands.world';
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Profiles not present yet; once users sign up, this will need to be re-run if roles are not set at signup.';
END
$$;
