-- Temporary diagnostic for the González procurement load (2026-11-17).
-- Returns project names and match counts so the loader migration can be
-- aimed at the right existing record. Dropped by a follow up migration
-- as soon as the load is verified.
CREATE OR REPLACE FUNCTION public.gonzalez_diag()
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'total_projects', (SELECT count(*) FROM public.construction_projects),
    'projects', COALESCE((
      SELECT json_agg(json_build_object('id', p.id, 'name', p.project_name, 'client_id', p.client_id, 'status', p.status) ORDER BY p.created_at)
      FROM public.construction_projects p
    ), '[]'::json),
    'clients_matching', COALESCE((
      SELECT json_agg(json_build_object('id', c.id, 'first_name', c.first_name, 'last_name', c.last_name))
      FROM public.clients c
      WHERE c.last_name ILIKE '%gonz%' OR c.first_name ILIKE '%roberto%'
    ), '[]'::json)
  ) INTO result;
  RETURN result;
END; $$;

GRANT EXECUTE ON FUNCTION public.gonzalez_diag() TO anon, authenticated;
