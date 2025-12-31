-- =============================================================================
-- ADD SUBSCRIPTION_TIER TO PROFILES TABLE
-- =============================================================================
-- This column tracks the user's subscription level for feature gating.
-- Values: 'free', 'professional', 'deluxe'
-- Default: 'free' for new users

-- Add subscription_tier column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Add constraint to ensure valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_tier_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('free', 'professional', 'deluxe'));
  END IF;
END $$;

-- Add an index for faster lookups by subscription tier (useful for admin queries)
CREATE INDEX IF NOT EXISTS profiles_subscription_tier_idx ON profiles(subscription_tier);

-- Add a status column for waitlist entries to track invitations
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Add constraint for waitlist status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_status_check'
  ) THEN
    ALTER TABLE waitlist 
    ADD CONSTRAINT waitlist_status_check 
    CHECK (status IN ('pending', 'invited', 'converted', 'bounced'));
  END IF;
END $$;

COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription level: free, professional, or deluxe';
COMMENT ON COLUMN waitlist.status IS 'Status of waitlist entry: pending, invited, converted, bounced';

