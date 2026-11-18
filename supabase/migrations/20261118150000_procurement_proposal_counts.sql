-- Proposal counting for public procurement projects (founder ruling
-- 2026-11-18: every Astoria style project posting shows its bids counted,
-- per project and per area). This replaces get_public_procurement_projects
-- with the identical function plus one field: proposal_count on every
-- listing object, the count of procurement_proposals rows for that
-- listing. Everything else is unchanged from migration 20261117220000.
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf.

CREATE OR REPLACE FUNCTION public.get_public_procurement_projects()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(json_agg(p.obj ORDER BY p.latest_listing_at DESC), '[]'::json)
  FROM (
    SELECT
      max(pl.created_at) AS latest_listing_at,
      json_build_object(
        'project_id', cp.id,
        'project_name', cp.project_name,
        'cover_image_url', cp.cover_image_url,
        'project_status', cp.status,
        'listings', (
          SELECT COALESCE(json_agg(lb.obj ORDER BY lb.ord_group, lb.ord), '[]'::json)
          FROM (
            SELECT
              CASE WHEN pl2.phase_item_id IS NULL THEN 0 ELSE 1 END AS ord_group,
              COALESCE(pi.item_order, 0) AS ord,
              json_build_object(
                'id', pl2.id,
                'title', pl2.title,
                'description', pl2.description,
                'location', pl2.location,
                'budget_min', pl2.budget_min,
                'budget_max', pl2.budget_max,
                'deadline', pl2.deadline,
                'start_date', pl2.start_date,
                'status', pl2.status,
                'phase_item_id', pl2.phase_item_id,
                'item_order', pi.item_order,
                'created_at', pl2.created_at,
                'proposal_count', (
                  SELECT count(*) FROM public.procurement_proposals pp
                  WHERE pp.listing_id = pl2.id
                ),
                'documents', (
                  SELECT COALESCE(json_agg(dd.obj ORDER BY dd.created_at DESC), '[]'::json)
                  FROM (
                    SELECT
                      d.created_at,
                      json_build_object(
                        'id', d.id,
                        'file_name', d.file_name,
                        'file_url', d.file_url,
                        'file_type', d.file_type,
                        'file_size', d.file_size
                      ) AS obj
                    FROM public.item_documents d
                    WHERE d.item_id = pl2.phase_item_id
                  ) dd
                )
              ) AS obj
            FROM public.procurement_listings pl2
            LEFT JOIN public.phase_items pi ON pi.id = pl2.phase_item_id
            WHERE pl2.project_id = cp.id AND pl2.status = 'open'
          ) lb
        ),
        'documents', (
          SELECT COALESCE(json_agg(db.obj ORDER BY db.created_at DESC), '[]'::json)
          FROM (
            SELECT
              pd.created_at,
              json_build_object(
                'id', pd.id,
                'file_name', pd.file_name,
                'file_url', pd.file_url,
                'file_type', pd.file_type,
                'file_size', pd.file_size
              ) AS obj
            FROM public.procurement_documents pd
            WHERE pd.project_id = cp.id
          ) db
        )
      ) AS obj
    FROM public.construction_projects cp
    JOIN public.procurement_listings pl
      ON pl.project_id = cp.id AND pl.status = 'open'
    GROUP BY cp.id, cp.project_name, cp.cover_image_url, cp.status
  ) p;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_procurement_projects() TO anon, authenticated;
