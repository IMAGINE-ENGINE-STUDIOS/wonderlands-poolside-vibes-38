-- Folder access rule (founder, 2026-11-14): only the main admin can enter
-- all customer folders in /files. A customer opens ONLY their own folder,
-- and only through the link shared to them (the token-scoped
-- get_shared_gallery RPC, SECURITY DEFINER — unaffected by these policies).
-- Non-admins must not be able to browse the folder list or reach another
-- customer's folder; the block holds server-side in RLS.
--
-- Audit before this change (live, 2026-11-14): the two "Anyone can view…"
-- SELECT policies were already dropped (2026-10-02 migration), so anon and
-- consumer/supplier accounts already read zero gallery rows. The one
-- remaining over-broad grant was the sales-rep SELECT: any active sales
-- rep could view EVERY folder and file, although every folder in the
-- table was created by a main-admin account. Scope sales reps to the
-- folders they created — the same scoping their UPDATE policy already
-- uses — so "only the admin sees all folders" holds literally.

DROP POLICY IF EXISTS "Sales reps can view folders" ON public.gallery_folders;
CREATE POLICY "Sales reps can view own folders" ON public.gallery_folders
  FOR SELECT USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'sales_rep' AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Sales reps can view files" ON public.gallery_files;
CREATE POLICY "Sales reps can view files in own folders" ON public.gallery_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'sales_rep' AND is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM public.gallery_folders f
      WHERE f.id = gallery_files.folder_id AND f.created_by = auth.uid()
    )
  );
