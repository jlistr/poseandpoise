-- =============================================================================
-- MIGRATION: Add waitlist conversion tracking and ensure subscription_tier
-- =============================================================================

-- Add converted_to_user column to waitlist table
-- This tracks whether a waitlist signup has been converted to a full user account
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS converted_to_user BOOLEAN DEFAULT FALSE;

-- Add subscription_tier to profiles if not exists (for free subscriber defaults)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Create index for faster lookups on waitlist
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);
CREATE INDEX IF NOT EXISTS waitlist_converted_idx ON waitlist(converted_to_user) WHERE converted_to_user = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN waitlist.converted_to_user IS 'Whether this waitlist entry has been converted to a full user account via email verification';

