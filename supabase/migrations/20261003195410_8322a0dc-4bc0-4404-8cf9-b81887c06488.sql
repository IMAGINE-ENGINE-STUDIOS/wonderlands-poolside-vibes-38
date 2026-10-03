CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _raw text := lower(coalesce(NEW.raw_user_meta_data ->> 'role', 'consumer'));
  _role public.user_role;
BEGIN
  _role := CASE
    WHEN _raw = 'sales_rep' THEN 'sales_rep'::public.user_role
    WHEN _raw IN ('supplier','installer','contractor') THEN 'supplier'::public.user_role
    ELSE 'consumer'::public.user_role END;

  INSERT INTO public.profiles (id, email, first_name, last_name, role, company_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name', _role, NEW.raw_user_meta_data ->> 'company_name')
  ON CONFLICT (id) DO NOTHING;

  IF _role = 'consumer' AND NEW.email IS NOT NULL THEN
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM public.clients WHERE lower(email) = lower(NEW.email)) THEN
        INSERT INTO public.clients (first_name, last_name, email, phone, status, source, assigned_sales_rep_id)
        VALUES (
          coalesce(nullif(NEW.raw_user_meta_data ->> 'first_name',''), split_part(NEW.email,'@',1)),
          coalesce(NEW.raw_user_meta_data ->> 'last_name',''),
          lower(NEW.email),
          NEW.raw_user_meta_data ->> 'phone',
          'new', 'website_registration',
          (SELECT id FROM public.profiles WHERE id = '5e64621c-83c4-48c8-a3b0-dd317d7e7336'));
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'client sync failed for %: %', NEW.email, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;