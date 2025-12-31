-- =============================================================================
-- ADD ONBOARDING_COMPLETED FLAG TO PROFILES
-- =============================================================================
-- Tracks whether a user has completed the initial onboarding wizard

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add a comment for documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the initial onboarding wizard';

