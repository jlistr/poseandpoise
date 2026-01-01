-- ============================================================================
-- Photo Analytics: Track views, clicks, and engagement on portfolio photos
-- ============================================================================

-- Create photo_analytics table for event tracking
CREATE TABLE IF NOT EXISTS photo_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'expand')),
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_ip_hash TEXT, -- Hashed IP for anonymous deduplication
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_photo_analytics_photo_id ON photo_analytics(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_analytics_profile_id ON photo_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_photo_analytics_created_at ON photo_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_photo_analytics_event_type ON photo_analytics(event_type);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_photo_analytics_photo_event 
  ON photo_analytics(photo_id, event_type, created_at DESC);

-- ============================================================================
-- Aggregated Stats View (Materialized for performance)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS photo_stats AS
SELECT 
  photo_id,
  COUNT(*) FILTER (WHERE event_type = 'view') as view_count,
  COUNT(*) FILTER (WHERE event_type = 'click') as click_count,
  COUNT(*) FILTER (WHERE event_type = 'expand') as expand_count,
  COUNT(DISTINCT COALESCE(viewer_id::text, viewer_ip_hash)) as unique_viewers,
  MAX(created_at) as last_viewed_at
FROM photo_analytics
GROUP BY photo_id;

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_stats_photo_id ON photo_stats(photo_id);

-- ============================================================================
-- Function to refresh stats (can be called via cron or manually)
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_photo_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY photo_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Add columns to photos table for quick access to stats
-- ============================================================================

ALTER TABLE photos 
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- ============================================================================
-- Trigger to update photo stats on new analytics events
-- ============================================================================

CREATE OR REPLACE FUNCTION update_photo_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'view' THEN
    UPDATE photos SET view_count = view_count + 1 WHERE id = NEW.photo_id;
  ELSIF NEW.event_type = 'click' THEN
    UPDATE photos SET click_count = click_count + 1 WHERE id = NEW.photo_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_photo_counts
  AFTER INSERT ON photo_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_counts();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE photo_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (for tracking)
CREATE POLICY "Anyone can insert photo analytics"
  ON photo_analytics FOR INSERT
  WITH CHECK (true);

-- Profile owners can view analytics for their photos
CREATE POLICY "Profile owners can view their photo analytics"
  ON photo_analytics FOR SELECT
  USING (profile_id = auth.uid());

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT ON photo_stats TO authenticated;
GRANT SELECT ON photo_stats TO anon;

