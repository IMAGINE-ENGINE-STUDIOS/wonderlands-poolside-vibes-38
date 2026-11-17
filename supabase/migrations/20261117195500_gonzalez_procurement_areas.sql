-- González procurement project (founder order, 2026-11-17)
-- ONE project divided by partidas. The seven areas below are added to
-- Mr. Roberto González's EXISTING construction_projects record, the same
-- record behind his client dashboard and its checklists, so the admin
-- Projects section, the procurement dashboard and his client dashboard
-- all stay in sync on one source of truth. No duplicate project is made.
-- Each area becomes one phase item in a new "Procurement Areas" phase
-- plus one open procurement listing, so subcontractors bid per area.
-- The block is guarded: it only runs when exactly one project matches
-- the client, and it does nothing if the phase already exists.

DO $$
DECLARE
  v_project_id uuid;
  v_match_count int;
  v_phase_id uuid;
  v_item_id uuid;
  v_phase_order int;
  rec record;
BEGIN
  SELECT count(DISTINCT id), min(id) INTO v_match_count, v_project_id FROM (
    SELECT id FROM public.construction_projects
    WHERE project_name ILIKE '%gonz%'
       OR project_name ILIKE '%foley%'
       OR project_name ILIKE '%astoria%'
       OR notes ILIKE '%gonz%'
       OR notes ILIKE '%foley%'
       OR notes ILIKE '%astoria%'
    UNION
    SELECT cp.id FROM public.construction_projects cp
    JOIN public.clients c ON c.id = cp.client_id
    WHERE c.last_name ILIKE '%gonz%' OR c.first_name ILIKE '%roberto%'
  ) m;

  IF v_match_count IS DISTINCT FROM 1 THEN
    RAISE NOTICE 'Gonzalez procurement: expected exactly 1 matching project, found %', v_match_count;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.project_phases
    WHERE project_id = v_project_id AND phase_name = 'Procurement Areas'
  ) THEN
    RAISE NOTICE 'Gonzalez procurement: areas already loaded for project %', v_project_id;
    RETURN;
  END IF;

  -- Cover image: the Astoria 14 render from the Wonderlands catalog media.
  UPDATE public.construction_projects
  SET cover_image_url = COALESCE(
        cover_image_url,
        'https://www.wonderlandsworld.com/media/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp'
      )
  WHERE id = v_project_id;

  SELECT COALESCE(max(phase_order), -1) + 1 INTO v_phase_order
  FROM public.project_phases WHERE project_id = v_project_id;

  INSERT INTO public.project_phases (project_id, phase_name, phase_order)
  VALUES (v_project_id, 'Procurement Areas', v_phase_order)
  RETURNING id INTO v_phase_id;

  FOR rec IN
    SELECT * FROM (VALUES
      (1, 'Excavation',
       'Excavation for the new fiberglass pool and the deck area at 5425 Foley Sq, Port Richey, FL 34652. Dig and grade for a pool that measures 14 feet by 35 feet, following the site plan. Your quote must include site cleaning and dumping in its price, including hauling off and disposing of all excavated dirt and debris.'),
      (2, 'Fiberglass Pool Installation',
       'Installation of the Latham Astoria 14 fiberglass pool shell, 14 feet by 35 feet, with integrated spa and the waterfall feature shown on the site plan. Set, level and backfill the shell following the Latham installation manual. Your quote must include site cleaning and dumping in its price.'),
      (3, 'Plumbing',
       'Pool plumbing for the Astoria 14, including installation of the plumbing equipment at the equipment pad on the west side of the pool. Run all supply, return and drain lines shown on the plumbing layout of the plan set. Your quote must include site cleaning and dumping in its price.'),
      (4, 'Electrical',
       'Pool electrical work for the Astoria 14, including installation of the electrical equipment, bonding, and the pool and deck lighting shown on the site plan. Your quote must include site cleaning and dumping in its price.'),
      (5, 'Porcelain Deck Construction',
       'Construction of a porcelain deck of 1,600 square feet. Wonderlands provides the porcelain material and this quote is for labor only. The work includes six outdoor lights and two steps with a strip light on the steps. Your quote must include site cleaning and dumping in its price.'),
      (6, 'Outdoor Shower Installation',
       'Installation of one small outdoor shower, 3 feet tall, at the southwest corner of the deck as shown on the site plan. Your quote must include site cleaning and dumping in its price.'),
      (7, 'Sauna Installation',
       'Installation of a sauna for four people, set on a base of small stones placed underneath it. Your quote must include site cleaning and dumping in its price.')
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
       '5425 Foley Sq, Port Richey, FL 34652', DATE '2026-12-01', 'open');
  END LOOP;

  -- Project level listing: carries the project description shown to
  -- subcontractors, with the global condition stated plainly.
  IF NOT EXISTS (
    SELECT 1 FROM public.procurement_listings
    WHERE project_id = v_project_id AND phase_item_id IS NULL
  ) THEN
    INSERT INTO public.procurement_listings
      (project_id, phase_item_id, title, description, location, start_date, status)
    VALUES
      (v_project_id, NULL, 'Astoria 14 Fiberglass Pool',
       'New Latham Astoria 14 fiberglass pool with integrated spa for the González residence at 5425 Foley Sq, Port Richey, FL 34652. The pool measures 14 feet by 35 feet, with a depth from 3 feet 6 inches to 6 feet 6 inches, and a waterfall feature on its north edge. The project is divided into seven areas and each area is bid on its own. Work starts on or about December 1, 2026. Every quote on every area must include site cleaning and dumping in its price, including hauling off and disposing of all dirt and debris from that area.',
       '5425 Foley Sq, Port Richey, FL 34652', DATE '2026-12-01', 'open');
  END IF;

  -- Project documents for subcontractors: his site plan and the pool render.
  IF NOT EXISTS (
    SELECT 1 FROM public.procurement_documents
    WHERE project_id = v_project_id
      AND file_url = 'https://www.wonderlandsworld.com/procurement/gonzalez-roberto/site-plan-gonzales.pdf'
  ) THEN
    INSERT INTO public.procurement_documents
      (project_id, file_name, file_url, file_size, file_type, uploaded_by)
    VALUES
      (v_project_id, 'Gonzales Residence Site Plan.pdf',
       'https://www.wonderlandsworld.com/procurement/gonzalez-roberto/site-plan-gonzales.pdf',
       3937056, 'application/pdf', 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.procurement_documents
    WHERE project_id = v_project_id
      AND file_url = 'https://www.wonderlandsworld.com/media/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp'
  ) THEN
    INSERT INTO public.procurement_documents
      (project_id, file_name, file_url, file_type, uploaded_by)
    VALUES
      (v_project_id, 'Astoria 14 Fiberglass Pool by Latham.webp',
       'https://www.wonderlandsworld.com/media/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp',
       'image/webp', 'admin');
  END IF;

  RAISE NOTICE 'Gonzalez procurement: areas loaded for project %', v_project_id;
END $$;
