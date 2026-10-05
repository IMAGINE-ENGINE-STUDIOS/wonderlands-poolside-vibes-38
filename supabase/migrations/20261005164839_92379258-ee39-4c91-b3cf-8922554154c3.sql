CREATE OR REPLACE FUNCTION public.get_public_site(_slug text)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'slug', s.slug, 'title', s.title, 'theme', s.theme,
    'published', s.layout->'published',
    'company', json_build_object('name', c.name, 'phone', c.phone, 'email', c.email, 'city', c.city, 'state', c.state, 'license_number', c.license_number, 'trades', c.trades))
  FROM company_sites s JOIN companies c ON c.id = s.company_id
  WHERE s.slug = lower(_slug) AND s.is_published = true AND jsonb_typeof(s.layout->'published') = 'object'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.submit_site_lead(_slug text, _name text, _email text, _phone text, _message text, _page text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _cid uuid; _client uuid; _acc uuid; _con uuid; _deal uuid;
  _n text := left(btrim(coalesce(_name,'')), 120);
  _e text := lower(left(btrim(coalesce(_email,'')), 200));
  _p text := left(btrim(coalesce(_phone,'')), 40);
  _m text := left(btrim(coalesce(_message,'')), 2000);
  _first text; _last text;
BEGIN
  IF _n = '' OR (_e = '' AND _p = '') THEN RETURN false; END IF;
  IF _e <> '' AND _e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RETURN false; END IF;
  SELECT company_id INTO _cid FROM company_sites WHERE slug = lower(_slug) AND is_published = true;
  IF _cid IS NULL THEN RETURN false; END IF;
  _first := split_part(_n, ' ', 1);
  _last := btrim(substr(_n, length(_first) + 1));
  INSERT INTO clients (company_id, first_name, last_name, email, phone, source, status, notes)
    VALUES (_cid, _first, _last, _e, nullif(_p,''), 'website_lead', 'new', nullif(_m,'')) RETURNING id INTO _client;
  INSERT INTO crm_accounts (company_id, name, type, phone, email, source_client_id)
    VALUES (_cid, _n, 'residential', nullif(_p,''), nullif(_e,''), _client) RETURNING id INTO _acc;
  INSERT INTO crm_contacts (company_id, account_id, first_name, last_name, phone, email, is_primary)
    VALUES (_cid, _acc, _first, nullif(_last,''), nullif(_p,''), nullif(_e,''), true) RETURNING id INTO _con;
  INSERT INTO crm_deals (company_id, account_id, contact_id, title, stage, probability, amount)
    VALUES (_cid, _acc, _con, _n || ' — website inquiry', 'lead', 10, 0) RETURNING id INTO _deal;
  INSERT INTO crm_activities (company_id, account_id, deal_id, type, subject, description, due_date, status)
    VALUES (_cid, _acc, _deal, 'task', 'Website inquiry from ' || _n, nullif(concat_ws(E'\n', nullif(_m,''), CASE WHEN _page IS NOT NULL THEN 'Page: ' || left(_page,80) END),''), now(), 'pending');
  RETURN true;
END $$;

REVOKE ALL ON FUNCTION public.get_public_site(text) FROM public;
REVOKE ALL ON FUNCTION public.submit_site_lead(text,text,text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_site(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_site_lead(text,text,text,text,text,text) TO anon, authenticated;