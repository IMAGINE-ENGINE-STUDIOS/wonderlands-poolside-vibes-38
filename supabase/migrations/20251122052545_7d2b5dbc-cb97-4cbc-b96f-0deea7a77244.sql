-- Create performance_metrics table for tracking app performance
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Device & Browser Info
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  user_agent TEXT,
  
  -- Performance Metrics
  page_url TEXT NOT NULL,
  load_time_ms INTEGER, -- time to fully load page
  dom_content_loaded_ms INTEGER, -- DOMContentLoaded event
  first_contentful_paint_ms INTEGER, -- FCP
  largest_contentful_paint_ms INTEGER, -- LCP
  time_to_interactive_ms INTEGER, -- TTI
  
  -- Error Tracking
  error_message TEXT,
  error_stack TEXT,
  error_type TEXT, -- 'js_error', 'network_error', 'promise_rejection'
  
  -- Session Info
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Network Info
  connection_type TEXT, -- '4g', '3g', 'wifi', etc.
  effective_connection_type TEXT
);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Admin users can view all metrics
CREATE POLICY "Admin users can view all performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'main_admin'
  )
);

-- Anyone can insert metrics (for tracking)
CREATE POLICY "Anyone can insert performance metrics"
ON public.performance_metrics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);
CREATE INDEX idx_performance_metrics_device_type ON public.performance_metrics(device_type);
CREATE INDEX idx_performance_metrics_page_url ON public.performance_metrics(page_url);
CREATE INDEX idx_performance_metrics_error_type ON public.performance_metrics(error_type) WHERE error_type IS NOT NULL;