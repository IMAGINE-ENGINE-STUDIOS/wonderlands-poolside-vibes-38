
-- Allow anyone to insert documents (for client/personnel uploads via share links)
CREATE POLICY "Anyone can insert documents"
  ON public.item_documents
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update documents
CREATE POLICY "Anyone can update documents"
  ON public.item_documents
  FOR UPDATE
  USING (true);

-- Create storage bucket if not exists and ensure public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to upload to project-documents bucket
CREATE POLICY "Anyone can upload project documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'project-documents');

-- Allow anyone to read project documents
CREATE POLICY "Anyone can read project documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-documents');
