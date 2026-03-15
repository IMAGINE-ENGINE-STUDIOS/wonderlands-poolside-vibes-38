
CREATE TABLE public.career_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT DEFAULT 'Orlando, FL',
  job_type TEXT DEFAULT 'full_time',
  requirements TEXT,
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.career_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active career postings" ON public.career_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Main admins can manage career postings" ON public.career_postings FOR ALL TO authenticated USING (is_main_admin()) WITH CHECK (is_main_admin());
