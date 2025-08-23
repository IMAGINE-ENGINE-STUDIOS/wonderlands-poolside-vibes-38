-- Create storage bucket for proposal attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proposal-attachments', 'proposal-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for proposal attachments bucket
CREATE POLICY "Proposal owners can upload attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'proposal-attachments' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = 'proposals'
);

CREATE POLICY "Proposal and job owners can view attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'proposal-attachments' AND (
    -- Proposal owner can view
    auth.uid() IS NOT NULL OR
    -- Job owner can view (through proposal relationship)
    EXISTS (
      SELECT 1 FROM job_proposals jp
      JOIN job_postings j ON j.id = jp.job_id
      WHERE jp.supplier_id = auth.uid() OR j.business_id = auth.uid()
    )
  )
);

CREATE POLICY "Proposal owners can delete their attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'proposal-attachments' AND 
  auth.uid() IS NOT NULL
);