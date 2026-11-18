-- Laguna Delux posting, conversion to the standard project format
-- (founder order, 2026-11-18: CONVERT the old posting to the Astoria 14
-- style, do NOT remove it; the Astoria 14 format is the one publishing
-- style for the platform).
-- The legacy posting lives in public.job_postings: title "Laguna Delux
-- Pool and outdoor", 7010 Villa Estelle Drive, Orlando, Florida 32819,
-- budget $8,000 to $15,000, due 12/19/2026, category Pools, 0 proposals,
-- description naming a fiberglass Latham pool with spa, an outdoor
-- shower, a sauna and about 1,500 to 1,600 square feet of porcelain.
-- This migration reads that row at run time and builds the standard
-- format from it: one construction_projects record, one "Procurement
-- Areas" phase with one item per area of work named in the posting's
-- own description, one open procurement_listings row per area, and one
-- project level listing carrying the budget and the due date, so the
-- project appears on /procurement through get_public_procurement_projects
-- and stays synced with the admin Projects section and the client
-- dashboard, exactly like the Gonzalez project. The job_postings row
-- itself is left untouched; a later step retires the legacy feed once
-- every posting is converted.
-- Existing record check: the pre-existing Orlando project
-- afc72a30-e08a-43b4-a47a-17b8cf669fbb (seen on the live page as the
-- separate "Concrete Pool" project, with its own areas) appears nowhere
-- in this repo, and nothing in the repo ties it to this fiberglass
-- posting, so this migration does NOT assume they are the same job. It
-- links to an existing record only on a dual signal: a project whose
-- name matches the posting AND that already holds a listing at the
-- posting's exact address. Otherwise it creates a dedicated record.
-- Dates: the posting's only date is a due date, so it is carried as the
-- deadline of the project level listing. start_date stays NULL on every
-- new listing: the Gonzalez loader set start_date only from a known
-- work start date, and this posting has none.
-- Documents: the posting's only attachment is a broken upload whose
-- file does not exist on the server, so no document is attached here.
-- That is a named gap, to be closed with a real file from the client
-- folder if one exists.
-- Idempotent and guarded, following the Gonzalez loader pattern: the
-- phase guard, the project level listing guard and the name lookup make
-- a second run a no-op. Single transaction (one DO block).
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf.

DO $$
DECLARE
  v_job record;
  v_job_count int;
  v_project_id uuid;
  v_phase_id uuid;
  v_item_id uuid;
  v_phase_order int;
  v_linked boolean := false;
  rec record;
  v_project_description text :=
    'New Latham fiberglass pool with integrated spa for the residence at 7010 Villa Estelle Drive, Orlando, Florida 32819, with an outdoor shower, a sauna, and a porcelain deck of about 1,500 to 1,600 square feet. The project budget is $8,000 to $15,000 and the work is due by December 19, 2026. The project is divided into four areas and each area is bid on its own. Every quote on every area must include site cleaning and dumping in its price, including hauling off and disposing of all dirt and debris from that area.';
BEGIN
  SELECT count(*) INTO v_job_count
  FROM public.job_postings
  WHERE title = 'Laguna Delux Pool and outdoor';

  IF v_job_count = 0 THEN
    RAISE NOTICE 'Laguna conversion: posting not found, nothing converted';
    RETURN;
  END IF;

  SELECT * INTO v_job
  FROM public.job_postings
  WHERE title = 'Laguna Delux Pool and outdoor'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_job_count > 1 THEN
    RAISE NOTICE 'Laguna conversion: % postings share the title, converting the oldest (%)', v_job_count, v_job.id;
  END IF;

  RAISE NOTICE 'Laguna conversion: source posting % location % budget % to % deadline %',
    v_job.id, v_job.location, v_job.budget_min, v_job.budget_max, v_job.deadline;

  -- Find the project record: one already carrying the posting's name
  -- (an earlier run of this migration, or a record made for this job).
  SELECT id INTO v_project_id
  FROM public.construction_projects
  WHERE project_name = v_job.title
  ORDER BY created_at ASC
  LIMIT 1;

  -- Or link to an existing record only on the dual signal described in
  -- the header: name match plus a listing at the exact same address.
  IF v_project_id IS NULL THEN
    SELECT cp.id INTO v_project_id
    FROM public.construction_projects cp
    WHERE cp.project_name ILIKE '%laguna%'
      AND EXISTS (
        SELECT 1 FROM public.procurement_listings pl
        WHERE pl.project_id = cp.id AND pl.location = v_job.location
      )
    ORDER BY cp.created_at ASC
    LIMIT 1;

    IF v_project_id IS NOT NULL THEN
      v_linked := true;
    END IF;
  END IF;

  -- Otherwise create the record, keeping the posting's own words on it.
  IF v_project_id IS NULL THEN
    INSERT INTO public.construction_projects (project_name, status, notes)
    VALUES (
      v_job.title,
      'active',
      v_project_description || ' Original posting text: ' || COALESCE(v_job.description, '')
    )
    RETURNING id INTO v_project_id;
  END IF;

  -- Cover image: the Laguna Deluxe render from the Wonderlands catalog
  -- media, the model named in the posting's title, set only if empty,
  -- the same pattern the Gonzalez loader used for the Astoria 14.
  UPDATE public.construction_projects
  SET cover_image_url = COALESCE(
        cover_image_url,
        'https://www.wonderlandsworld.com/media/laguna-deluxe-pool.webp'
      )
  WHERE id = v_project_id;

  -- Project level listing: carries the project description shown to
  -- subcontractors, the posting's budget and its due date as deadline.
  IF NOT EXISTS (
    SELECT 1 FROM public.procurement_listings
    WHERE project_id = v_project_id AND phase_item_id IS NULL
  ) THEN
    INSERT INTO public.procurement_listings
      (project_id, phase_item_id, title, description, location,
       budget_min, budget_max, deadline, start_date, status)
    VALUES
      (v_project_id, NULL, v_job.title, v_project_description, v_job.location,
       v_job.budget_min, v_job.budget_max, v_job.deadline, NULL, 'open');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.project_phases
    WHERE project_id = v_project_id AND phase_name = 'Procurement Areas'
  ) THEN
    RAISE NOTICE 'Laguna conversion: areas already loaded for project %', v_project_id;
    RETURN;
  END IF;

  SELECT COALESCE(max(phase_order), -1) + 1 INTO v_phase_order
  FROM public.project_phases WHERE project_id = v_project_id;

  INSERT INTO public.project_phases (project_id, phase_name, phase_order)
  VALUES (v_project_id, 'Procurement Areas', v_phase_order)
  RETURNING id INTO v_phase_id;

  -- Areas come only from the work named in the posting's description:
  -- the fiberglass Latham pool with spa, the porcelain deck, the
  -- outdoor shower and the sauna. Nothing else is added.
  FOR rec IN
    SELECT * FROM (VALUES
      (1, 'Fiberglass Pool Installation',
       'Installation of the Latham fiberglass pool shell with integrated spa at 7010 Villa Estelle Drive, Orlando, Florida 32819. Set, level and backfill the shell following the Latham installation manual. Your quote must include site cleaning and dumping in its price.'),
      (2, 'Porcelain Deck Construction',
       'Construction of a porcelain deck of about 1,500 to 1,600 square feet around the pool. Your quote must include site cleaning and dumping in its price.'),
      (3, 'Outdoor Shower Installation',
       'Installation of one outdoor shower by the pool. Your quote must include site cleaning and dumping in its price.'),
      (4, 'Sauna Installation',
       'Installation of a sauna by the pool area. Your quote must include site cleaning and dumping in its price.')
    ) AS t(item_order, item_name, item_description)
    ORDER BY t.item_order
  LOOP
    INSERT INTO public.phase_items (phase_id, item_name, item_order, notes)
    VALUES (v_phase_id, rec.item_name, rec.item_order - 1, rec.item_description)
    RETURNING id INTO v_item_id;

    INSERT INTO public.procurement_listings
      (project_id, phase_item_id, title, description, location, start_date, status)
    VALUES
      (v_project_id, v_item_id, rec.item_name, rec.item_description,
       v_job.location, NULL, 'open');
  END LOOP;

  RAISE NOTICE 'Laguna conversion: areas loaded for project % (linked existing record: %)', v_project_id, v_linked;
END $$;
