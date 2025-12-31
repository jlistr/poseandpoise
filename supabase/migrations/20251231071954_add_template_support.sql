-- =============================================================================
-- MIGRATION: Add template selection and publishing support
-- FILE: supabase/migrations/YYYYMMDD_add_template_support.sql
-- =============================================================================

-- Add template and publishing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'rose';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accent_color TEXT; -- Optional custom accent override

-- Create index for faster published profile lookups
CREATE INDEX IF NOT EXISTS profiles_is_published_idx ON profiles(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS profiles_username_published_idx ON profiles(username, is_published);

-- =============================================================================
-- TEMPLATE REGISTRY TABLE
-- Stores available templates and their metadata
-- =============================================================================

CREATE TABLE IF NOT EXISTS portfolio_templates (
  id TEXT PRIMARY KEY,                    -- 'rose', 'poise', 'lumiere', 'noir'
  name TEXT NOT NULL,                     -- Display name: 'Rosé', 'Poise', etc.
  description TEXT,                       -- Short description for selector UI
  accent_color TEXT,                      -- Primary accent color hex
  thumbnail_url TEXT,                     -- Preview image URL
  is_premium BOOLEAN DEFAULT FALSE,       -- Requires Pro subscription?
  is_active BOOLEAN DEFAULT TRUE,         -- Can users select this template?
  sort_order INTEGER DEFAULT 0,           -- Display order in selector
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing table (if table already existed)
ALTER TABLE portfolio_templates ADD COLUMN IF NOT EXISTS accent_color TEXT;
ALTER TABLE portfolio_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Seed default templates
INSERT INTO portfolio_templates (id, name, description, accent_color, is_premium, sort_order) VALUES
  ('rose', 'Rosé', 'Soft editorial blush with feminine elegance', '#FF7AA2', FALSE, 1),
  ('poise', 'Poise', 'Timeless elegance with warm neutrals', '#C4A484', FALSE, 2),
  ('lumiere', 'Lumière', 'Golden hour warmth with editorial flair', '#A78E14', FALSE, 3),
  ('noir', 'Noir', 'Bold monochrome with dramatic contrast', '#FFFFFF', TRUE, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color,
  is_premium = EXCLUDED.is_premium,
  sort_order = EXCLUDED.sort_order;

-- =============================================================================
-- SUBSCRIPTIONS TABLE (if not already exists)
-- Tracks user subscription status for premium feature access
-- =============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'none', -- 'none', 'active', 'past_due', 'canceled', 'expired'
  tier TEXT NOT NULL DEFAULT 'free',   -- 'free', 'pro'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_profile_id_idx ON subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);

-- =============================================================================
-- SERVICES TABLE
-- Optional services/offerings a model can list
-- =============================================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS services_profile_id_idx ON services(profile_id);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Templates: Anyone can view active templates
ALTER TABLE portfolio_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates viewable by everyone"
  ON portfolio_templates FOR SELECT
  USING (is_active = TRUE);

-- Subscriptions: Users can only view their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = profile_id);

-- Services: Users can manage own, public profiles show services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services viewable on public profiles"
  ON services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = services.profile_id
      AND profiles.is_published = TRUE
    )
  );

CREATE POLICY "Users can view own services"
  ON services FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own services"
  ON services FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own services"
  ON services FOR DELETE
  USING (auth.uid() = profile_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to check if user has Pro subscription
CREATE OR REPLACE FUNCTION has_pro_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE profile_id = user_id
    AND status = 'active'
    AND tier = 'pro'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate template selection
CREATE OR REPLACE FUNCTION validate_template_selection()
RETURNS TRIGGER AS $$
DECLARE
  template_is_premium BOOLEAN;
  user_has_pro BOOLEAN;
BEGIN
  -- Get template premium status
  SELECT is_premium INTO template_is_premium
  FROM portfolio_templates
  WHERE id = NEW.template;
  
  -- If template doesn't exist, default to 'rose'
  IF template_is_premium IS NULL THEN
    NEW.template := 'rose';
    RETURN NEW;
  END IF;
  
  -- If template is premium, check subscription
  IF template_is_premium THEN
    user_has_pro := has_pro_subscription(NEW.id);
    
    IF NOT user_has_pro THEN
      -- Revert to previous template or default
      NEW.template := COALESCE(OLD.template, 'rose');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to validate template on update
DROP TRIGGER IF EXISTS validate_template_on_update ON profiles;
CREATE TRIGGER validate_template_on_update
  BEFORE UPDATE OF template ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_template_selection();

-- Function to publish portfolio
CREATE OR REPLACE FUNCTION publish_portfolio(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  photo_count INTEGER;
  profile_complete BOOLEAN;
BEGIN
  -- Check minimum requirements
  SELECT COUNT(*) INTO photo_count
  FROM photos
  WHERE profile_id = user_id;
  
  -- Require at least 4 photos
  IF photo_count < 4 THEN
    RAISE EXCEPTION 'At least 4 photos required to publish';
  END IF;
  
  -- Check profile has required fields
  SELECT 
    display_name IS NOT NULL AND 
    bio IS NOT NULL AND 
    username IS NOT NULL
  INTO profile_complete
  FROM profiles
  WHERE id = user_id;
  
  IF NOT profile_complete THEN
    RAISE EXCEPTION 'Profile incomplete. Name, bio, and username required.';
  END IF;
  
  -- Publish the portfolio
  UPDATE profiles
  SET 
    is_published = TRUE,
    is_public = TRUE,
    published_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;