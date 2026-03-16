-- Create career_applications table for resume tracking
CREATE TABLE public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_id UUID NOT NULL REFERENCES public.career_postings(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit career applications"
  ON public.career_applications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Main admins can manage career applications"
  ON public.career_applications FOR ALL
  TO authenticated
  USING (is_main_admin())
  WITH CHECK (is_main_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('career-resumes', 'career-resumes', true);

CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'career-resumes');

CREATE POLICY "Anyone can view resumes"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'career-resumes');

CREATE POLICY "Admins can delete resumes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'career-resumes' AND is_main_admin());