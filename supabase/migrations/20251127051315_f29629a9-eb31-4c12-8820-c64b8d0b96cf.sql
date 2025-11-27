-- Add view counting and caching tables for procurement system

-- Add view count and cached counts to job_postings
ALTER TABLE job_postings
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS proposal_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create job_views table for tracking individual views
CREATE TABLE IF NOT EXISTS job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip INET,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT,
  UNIQUE(job_id, viewer_id, session_id)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewer_id ON job_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_last_activity ON job_postings(last_activity DESC);

-- Enable RLS on job_views
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert views
CREATE POLICY "Anyone can record job views"
ON job_views FOR INSERT
WITH CHECK (true);

-- Policy: Users can view all view records
CREATE POLICY "Anyone can view job views"
ON job_views FOR SELECT
USING (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_postings
  SET view_count = view_count + 1
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS trigger_increment_job_view_count ON job_views;
CREATE TRIGGER trigger_increment_job_view_count
AFTER INSERT ON job_views
FOR EACH ROW
EXECUTE FUNCTION increment_job_view_count();

-- Function to update proposal count cache
CREATE OR REPLACE FUNCTION update_proposal_count_cache()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_postings
    SET proposal_count = proposal_count + 1,
        last_activity = now()
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_postings
    SET proposal_count = GREATEST(0, proposal_count - 1),
        last_activity = now()
    WHERE id = OLD.job_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to maintain proposal count cache
DROP TRIGGER IF EXISTS trigger_update_proposal_count ON job_proposals;
CREATE TRIGGER trigger_update_proposal_count
AFTER INSERT OR DELETE ON job_proposals
FOR EACH ROW
EXECUTE FUNCTION update_proposal_count_cache();

-- Initialize existing counts
UPDATE job_postings
SET proposal_count = (
  SELECT COUNT(*)
  FROM job_proposals
  WHERE job_proposals.job_id = job_postings.id
)
WHERE proposal_count = 0;

-- Add message thread tracking
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unread_count_1 INTEGER DEFAULT 0,
  unread_count_2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_message_threads_participants ON message_threads(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_message_threads_job_id ON message_threads(job_id);

-- Enable RLS on message_threads
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own threads
CREATE POLICY "Users can view their message threads"
ON message_threads FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Policy: Users can create message threads
CREATE POLICY "Users can create message threads"
ON message_threads FOR INSERT
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Policy: Users can update their own threads
CREATE POLICY "Users can update their message threads"
ON message_threads FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);