CREATE TABLE public.investor_nda_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  signature text NOT NULL,
  nda_version text NOT NULL DEFAULT 'v1',
  user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.investor_nda_signatures TO authenticated;
GRANT ALL ON public.investor_nda_signatures TO service_role;
ALTER TABLE public.investor_nda_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Main admins read NDA signatures" ON public.investor_nda_signatures
  FOR SELECT TO authenticated USING (public.is_main_admin());

CREATE OR REPLACE FUNCTION public.sign_investor_nda(_first text, _last text, _email text, _signature text, _version text DEFAULT 'v1', _ua text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _id uuid; _e text := lower(left(btrim(coalesce(_email,'')),200));
BEGIN
  IF btrim(coalesce(_first,'')) = '' OR btrim(coalesce(_last,'')) = '' THEN RAISE EXCEPTION 'name required'; END IF;
  IF _e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'invalid email'; END IF;
  IF _signature IS NULL OR _signature !~ '^data:image/png;base64,' OR length(_signature) > 400000 THEN RAISE EXCEPTION 'invalid signature'; END IF;
  INSERT INTO investor_nda_signatures (first_name, last_name, email, signature, nda_version, user_agent)
  VALUES (left(btrim(_first),80), left(btrim(_last),80), _e, _signature, left(coalesce(_version,'v1'),20), left(_ua,300))
  RETURNING id INTO _id;
  RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.sign_investor_nda(text,text,text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.sign_investor_nda(text,text,text,text,text,text) TO anon, authenticated;