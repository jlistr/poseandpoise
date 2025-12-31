-- ==========================================================================
-- Phase 3: Portfolio Analytics
-- ==========================================================================

-- Portfolio views tracking
CREATE TABLE IF NOT EXISTS portfolio_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  visitor_id TEXT, -- anonymous fingerprint for unique visitor counting
  referrer TEXT,
  referrer_domain TEXT, -- extracted domain for grouping
  country TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  page_path TEXT, -- '/username' or '/username/comp-card/xyz'
  session_id TEXT, -- group views in same session
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS portfolio_views_profile_id_idx ON portfolio_views(profile_id);
CREATE INDEX IF NOT EXISTS portfolio_views_viewed_at_idx ON portfolio_views(viewed_at);
CREATE INDEX IF NOT EXISTS portfolio_views_profile_date_idx ON portfolio_views(profile_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS portfolio_views_visitor_idx ON portfolio_views(profile_id, visitor_id);

-- Comp card download/view tracking
CREATE TABLE IF NOT EXISTS comp_card_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comp_card_id UUID REFERENCES comp_cards(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  visitor_id TEXT,
  action TEXT DEFAULT 'view', -- 'view', 'download'
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comp_card_views_comp_card_id_idx ON comp_card_views(comp_card_id);
CREATE INDEX IF NOT EXISTS comp_card_views_profile_id_idx ON comp_card_views(profile_id);

-- RLS Policies
ALTER TABLE portfolio_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_card_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own analytics
CREATE POLICY "Users can view own portfolio analytics"
  ON portfolio_views FOR SELECT
  USING (auth.uid() = profile_id);

-- Anyone can insert views (for tracking)
CREATE POLICY "Anyone can record portfolio views"
  ON portfolio_views FOR INSERT
  WITH CHECK (true);

-- Users can view their own comp card analytics
CREATE POLICY "Users can view own comp card analytics"
  ON comp_card_views FOR SELECT
  USING (auth.uid() = profile_id);

-- Anyone can insert comp card views
CREATE POLICY "Anyone can record comp card views"
  ON comp_card_views FOR INSERT
  WITH CHECK (true);

-- ==========================================================================
-- Helper function for analytics aggregation
-- ==========================================================================

-- Get daily view counts for a profile
CREATE OR REPLACE FUNCTION get_daily_views(
  p_profile_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  view_date DATE,
  total_views BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(viewed_at) as view_date,
    COUNT(*) as total_views,
    COUNT(DISTINCT visitor_id) as unique_visitors
  FROM portfolio_views
  WHERE profile_id = p_profile_id
    AND viewed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(viewed_at)
  ORDER BY view_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;