-- ==========================================================================
-- Phase 2: Core Product Schema
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Extend profiles table with model stats
-- --------------------------------------------------------------------------

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bust_cm INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS waist_cm INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hips_cm INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shoe_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS eye_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- --------------------------------------------------------------------------
-- Photos table
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS photos_profile_id_idx ON photos(profile_id);
CREATE INDEX IF NOT EXISTS photos_sort_order_idx ON photos(profile_id, sort_order);

-- --------------------------------------------------------------------------
-- Comp cards table
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS comp_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'My Comp Card',
  template TEXT DEFAULT 'classic',
  photo_ids UUID[] NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comp_cards_profile_id_idx ON comp_cards(profile_id);

-- --------------------------------------------------------------------------
-- Row Level Security: Profiles
-- --------------------------------------------------------------------------

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Public profiles viewable by everyone
CREATE POLICY "Public profiles viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = TRUE);

-- Users can view their own profile (even if not public)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- --------------------------------------------------------------------------
-- Row Level Security: Photos
-- --------------------------------------------------------------------------

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Photos viewable on public profiles
CREATE POLICY "Photos viewable on public profiles"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = photos.profile_id
      AND profiles.is_public = TRUE
    )
  );

-- Users can view their own photos
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own photos
CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own photos
CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  USING (auth.uid() = profile_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------------------------
-- Row Level Security: Comp Cards
-- --------------------------------------------------------------------------

ALTER TABLE comp_cards ENABLE ROW LEVEL SECURITY;

-- Comp cards viewable on public profiles
CREATE POLICY "Comp cards viewable on public profiles"
  ON comp_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = comp_cards.profile_id
      AND profiles.is_public = TRUE
    )
  );

-- Users can view their own comp cards
CREATE POLICY "Users can view own comp cards"
  ON comp_cards FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own comp cards
CREATE POLICY "Users can insert own comp cards"
  ON comp_cards FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own comp cards
CREATE POLICY "Users can update own comp cards"
  ON comp_cards FOR UPDATE
  USING (auth.uid() = profile_id);

-- Users can delete their own comp cards
CREATE POLICY "Users can delete own comp cards"
  ON comp_cards FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------------------------
-- Helper function: Update updated_at timestamp
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to comp_cards
DROP TRIGGER IF EXISTS update_comp_cards_updated_at ON comp_cards;
CREATE TRIGGER update_comp_cards_updated_at
  BEFORE UPDATE ON comp_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();