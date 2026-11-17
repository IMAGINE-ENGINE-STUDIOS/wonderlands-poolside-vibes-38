-- González project, per area renders (founder order, 2026-11-17).
-- The founder identified three renders in the client gallery folder
-- "Roberto Final" and matched each one to its procurement area by eye:
-- the deck render shows the porcelain deck with its two front steps,
-- the pool render shows the Astoria 14 from above with the waterfall
-- feature on its north edge, and the sauna render shows the barrel
-- sauna on its small stone base. Each render is attached here as an
-- item document on the matching "Procurement Areas" phase item of
-- project a5d6bdf0-4fe7-43aa-9374-e12dc032f094, so the client
-- dashboard, the admin project view and the public procurement detail
-- all show the render inside its area. Idempotent: each insert is
-- guarded by the item belonging to that project and by the file not
-- being attached to that item already.
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf, together with
-- 20261117220000_public_procurement_projects_rpc.sql.

-- Porcelain Deck Construction: full backyard view of the porcelain deck.
INSERT INTO public.item_documents (item_id, file_name, file_url, file_type)
SELECT '43062351-cbdd-4e04-ab29-e9c2d27a464e',
       'FINAl01.jpg',
       'https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/gallery-files/fe501d72-be54-4b45-9bed-17fbbce46996/1779908486141-cv72cckb7p.jpg',
       'image/jpeg'
WHERE EXISTS (
  SELECT 1 FROM public.phase_items i
  JOIN public.project_phases ph ON ph.id = i.phase_id
  WHERE i.id = '43062351-cbdd-4e04-ab29-e9c2d27a464e'
    AND ph.project_id = 'a5d6bdf0-4fe7-43aa-9374-e12dc032f094'
)
AND NOT EXISTS (
  SELECT 1 FROM public.item_documents d
  WHERE d.item_id = '43062351-cbdd-4e04-ab29-e9c2d27a464e'
    AND d.file_url = 'https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/gallery-files/fe501d72-be54-4b45-9bed-17fbbce46996/1779908486141-cv72cckb7p.jpg'
);

-- Fiberglass Pool Installation: top view of the pool with the waterfall.
INSERT INTO public.item_documents (item_id, file_name, file_url, file_type)
SELECT 'd87b7a23-f686-42b4-95ad-ab5ffc996955',
       'FINAL.jpg',
       'https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/gallery-files/fe501d72-be54-4b45-9bed-17fbbce46996/1779908474870-t0ruxyryyn.jpg',
       'image/jpeg'
WHERE EXISTS (
  SELECT 1 FROM public.phase_items i
  JOIN public.project_phases ph ON ph.id = i.phase_id
  WHERE i.id = 'd87b7a23-f686-42b4-95ad-ab5ffc996955'
    AND ph.project_id = 'a5d6bdf0-4fe7-43aa-9374-e12dc032f094'
)
AND NOT EXISTS (
  SELECT 1 FROM public.item_documents d
  WHERE d.item_id = 'd87b7a23-f686-42b4-95ad-ab5ffc996955'
    AND d.file_url = 'https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/gallery-files/fe501d72-be54-4b45-9bed-17fbbce46996/1779908474870-t0ruxyryyn.jpg'
);

-- Sauna Installation: the barrel sauna on its small stone base.
INSERT INTO public.item_documents (item_id, file_name, file_url, file_type)
SELECT '2c02b0ef-c0eb-4af5-9160-e47eac2fedef',
       'finalsauna.jpg',
       'https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/gallery-files/fe501d72-be54-4b45-9bed-17fbbce46996/1779908700884-5pxjq7gq42.jpg',
       'image/jpeg'
WHERE EXISTS (
  SELECT 1 FROM public.phase_items i
  JOIN public.project_phases ph ON ph.id = i.phase_id
  WHERE i.id = '2c02b0ef-c0eb-4af5-9160-e47eac2fedef'
    AND ph.project_id = 'a5d6bdf0-4fe7-43aa-9374-e12dc032f094'
)
AND NOT EXISTS (
  SELECT 1 FROM public.item_documents d
  WHERE d.item_id = '2c02b0ef-c0eb-4af5-9160-e47eac2fedef'
    AND d.file_url = 'https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/gallery-files/fe501d72-be54-4b45-9bed-17fbbce46996/1779908700884-5pxjq7gq42.jpg'
);
