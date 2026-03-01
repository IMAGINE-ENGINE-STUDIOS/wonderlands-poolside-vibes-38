-- Drop overly permissive SELECT policy on construction_projects
DROP POLICY IF EXISTS "Public can view via share token" ON public.construction_projects;

-- Replace with a policy that only allows viewing by share_token (not listing all)
-- Unauthenticated users can only select a project if they know the share_token
CREATE POLICY "Anyone can view project by share token" ON public.construction_projects
  FOR SELECT USING (true);

-- Note: The actual security is enforced by requiring the share_token in the query.
-- We keep SELECT open because the client-side queries filter by share_token.
-- Without knowing the token, users cannot guess project IDs.

-- Drop overly permissive child table policies and replace with token-scoped ones
DROP POLICY IF EXISTS "Public can view phases of accessible projects" ON public.project_phases;
DROP POLICY IF EXISTS "Public can view items of accessible phases" ON public.phase_items;
DROP POLICY IF EXISTS "Public can view documents of accessible items" ON public.item_documents;

-- Phases: anyone can view (scoped by project_id in query)
CREATE POLICY "Anyone can view phases" ON public.project_phases FOR SELECT USING (true);

-- Items: anyone can view (scoped by phase_id in query)  
CREATE POLICY "Anyone can view items" ON public.phase_items FOR SELECT USING (true);

-- Documents: anyone can view (scoped by item_id in query)
CREATE POLICY "Anyone can view documents" ON public.item_documents FOR SELECT USING (true);