CREATE TABLE IF NOT EXISTS public.narration_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text NOT NULL UNIQUE,
  script text NOT NULL,
  voice text NOT NULL DEFAULT 'alloy',
  audio_path text,
  plays integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.narration_cache TO anon;
GRANT SELECT ON public.narration_cache TO authenticated;
GRANT ALL ON public.narration_cache TO service_role;

ALTER TABLE public.narration_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saved readings are readable by everyone"
ON public.narration_cache FOR SELECT
USING (true);

CREATE INDEX IF NOT EXISTS narration_cache_key_idx ON public.narration_cache (cache_key);

CREATE TRIGGER update_narration_cache_updated_at
BEFORE UPDATE ON public.narration_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();