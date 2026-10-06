CREATE OR REPLACE FUNCTION public.submit_wonderlands_lead(_name text, _email text, _phone text, _message text, _source text DEFAULT 'website')
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _cid uuid := public.platform_company_id(); _client uuid; _acc uuid; _con uuid; _deal uuid;
  _n text := left(btrim(coalesce(_name,'')), 120);
  _e text := lower(left(btrim(coalesce(_email,'')), 200));
  _p text := left(btrim(coalesce(_phone,'')), 40);
  _m text := left(btrim(coalesce(_message,'')), 2000);
  _s text := left(btrim(coalesce(_source,'website')), 60);
  _first text; _last text;
BEGIN
  IF _cid IS NULL OR _n = '' OR (_e = '' AND _p = '') THEN RETURN false; END IF;
  IF _e <> '' AND _e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RETURN false; END IF;
  _first := split_part(_n, ' ', 1);
  _last := btrim(substr(_n, length(_first) + 1));
  INSERT INTO clients (company_id, first_name, last_name, email, phone, source, status, notes)
    VALUES (_cid, _first, _last, _e, nullif(_p,''), 'website_lead', 'new', nullif(concat_ws(E'\n', 'Form: ' || _s, nullif(_m,'')),'')) RETURNING id INTO _client;
  INSERT INTO crm_accounts (company_id, name, type, phone, email, source_client_id)
    VALUES (_cid, _n, 'residential', nullif(_p,''), nullif(_e,''), _client) RETURNING id INTO _acc;
  INSERT INTO crm_contacts (company_id, account_id, first_name, last_name, phone, email, is_primary)
    VALUES (_cid, _acc, _first, nullif(_last,''), nullif(_p,''), nullif(_e,''), true) RETURNING id INTO _con;
  INSERT INTO crm_deals (company_id, account_id, contact_id, title, stage, probability, amount)
    VALUES (_cid, _acc, _con, _n || ' — ' || _s, 'lead', 10, 0) RETURNING id INTO _deal;
  INSERT INTO crm_activities (company_id, account_id, deal_id, type, subject, description, due_date, status)
    VALUES (_cid, _acc, _deal, 'task', 'Website inquiry (' || _s || ') from ' || _n, nullif(_m,''), now(), 'pending');
  RETURN true;
END $function$;
REVOKE ALL ON FUNCTION public.submit_wonderlands_lead(text,text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_wonderlands_lead(text,text,text,text,text) TO anon, authenticated;