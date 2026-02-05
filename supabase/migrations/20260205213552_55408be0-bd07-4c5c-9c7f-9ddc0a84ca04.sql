
-- Customer cache table - stores unique customers from quote submissions
CREATE TABLE public.customer_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  total_quotes INTEGER NOT NULL DEFAULT 1,
  total_quote_value NUMERIC DEFAULT 0,
  last_quote_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_quote_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_pool_model TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_cache ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can access
CREATE POLICY "Admins can view customer cache"
ON public.customer_cache FOR SELECT
TO authenticated
USING (public.is_main_admin());

CREATE POLICY "Admins can insert customer cache"
ON public.customer_cache FOR INSERT
TO authenticated
WITH CHECK (public.is_main_admin());

CREATE POLICY "Admins can update customer cache"
ON public.customer_cache FOR UPDATE
TO authenticated
USING (public.is_main_admin());

-- Also allow anon/authenticated insert for quote form submissions via service
CREATE POLICY "Anyone can upsert via quote submission"
ON public.customer_cache FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow update for deduplication (upsert)
CREATE POLICY "Anyone can update via quote submission"
ON public.customer_cache FOR UPDATE
TO authenticated, anon
USING (true);

-- Index for fast email lookups
CREATE INDEX idx_customer_cache_email ON public.customer_cache (email);
CREATE INDEX idx_customer_cache_name ON public.customer_cache USING gin (to_tsvector('english', name));

-- Trigger for updated_at
CREATE TRIGGER update_customer_cache_updated_at
BEFORE UPDATE ON public.customer_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
