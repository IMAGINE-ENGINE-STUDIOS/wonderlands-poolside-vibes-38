ALTER TABLE public.company_sites ADD COLUMN IF NOT EXISTS custom_domain text;
CREATE UNIQUE INDEX IF NOT EXISTS company_sites_custom_domain_key ON public.company_sites (lower(custom_domain)) WHERE custom_domain IS NOT NULL;
CREATE OR REPLACE FUNCTION public.site_slug_for_domain(_host text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT slug FROM public.company_sites
  WHERE is_published AND custom_domain IS NOT NULL
    AND lower(regexp_replace(custom_domain, '^www\.', '')) = lower(regexp_replace(_host, '^www\.', ''))
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.site_slug_for_domain(text) FROM public;
GRANT EXECUTE ON FUNCTION public.site_slug_for_domain(text) TO anon, authenticated;