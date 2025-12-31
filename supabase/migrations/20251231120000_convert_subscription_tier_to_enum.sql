-- =============================================================================
-- CONVERT SUBSCRIPTION_TIER TO ENUM TYPE
-- =============================================================================
-- This migration converts the TEXT subscription_tier column to a proper ENUM
-- for better type safety and performance.
-- 
-- ENUM Values: FREE, PROFESSIONAL, DELUXE
-- 
-- To modify the ENUM later, use:
--   ALTER TYPE subscription_tier ADD VALUE 'NEW_VALUE';
--   (Note: PostgreSQL does not support removing ENUM values directly)
-- =============================================================================

-- Step 1: Create the ENUM type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('FREE', 'PROFESSIONAL', 'DELUXE');
  END IF;
END $$;

-- Step 2: Drop the existing CHECK constraint (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_tier_check'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_subscription_tier_check;
  END IF;
END $$;

-- Step 3: Convert the column from TEXT to ENUM
-- First, update any existing lowercase values to uppercase
UPDATE profiles 
SET subscription_tier = UPPER(subscription_tier)
WHERE subscription_tier IS NOT NULL 
  AND subscription_tier != UPPER(subscription_tier);

-- Handle any NULL or empty values - default to 'FREE'
UPDATE profiles 
SET subscription_tier = 'FREE'
WHERE subscription_tier IS NULL OR subscription_tier = '';

-- Step 4: Drop the default value before type conversion
ALTER TABLE profiles ALTER COLUMN subscription_tier DROP DEFAULT;

-- Step 5: Alter the column type using USING clause for conversion
ALTER TABLE profiles 
ALTER COLUMN subscription_tier TYPE subscription_tier 
USING subscription_tier::subscription_tier;

-- Step 6: Set default value for new rows (using the ENUM type)
ALTER TABLE profiles 
ALTER COLUMN subscription_tier SET DEFAULT 'FREE'::subscription_tier;

-- Step 7: Ensure NOT NULL constraint
ALTER TABLE profiles 
ALTER COLUMN subscription_tier SET NOT NULL;

-- Update the comment
COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription level: FREE (default), PROFESSIONAL, or DELUXE';
COMMENT ON TYPE subscription_tier IS 'Subscription tiers for feature gating. Values: FREE, PROFESSIONAL, DELUXE';

-- =============================================================================
-- HELPER FUNCTIONS FOR ENUM MANAGEMENT
-- =============================================================================

-- Function to get all subscription tier values (useful for frontend)
CREATE OR REPLACE FUNCTION get_subscription_tiers()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT enumlabel::TEXT 
    FROM pg_enum 
    WHERE enumtypid = 'subscription_tier'::regtype
    ORDER BY enumsortorder
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if a tier has access to a feature
-- This allows easy feature gating based on subscription level
CREATE OR REPLACE FUNCTION has_feature_access(
  user_tier subscription_tier,
  required_tier subscription_tier
) RETURNS BOOLEAN AS $$
DECLARE
  tier_order CONSTANT TEXT[] := ARRAY['FREE', 'PROFESSIONAL', 'DELUXE'];
  user_level INT;
  required_level INT;
BEGIN
  -- Find position of each tier in the hierarchy
  SELECT array_position(tier_order, user_tier::TEXT) INTO user_level;
  SELECT array_position(tier_order, required_tier::TEXT) INTO required_level;
  
  -- User has access if their tier is >= required tier
  RETURN user_level >= required_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- NOTES ON MODIFYING THE ENUM
-- =============================================================================
-- 
-- To ADD a new tier (e.g., 'ENTERPRISE'):
--   ALTER TYPE subscription_tier ADD VALUE 'ENTERPRISE';
--   -- Optionally specify position:
--   ALTER TYPE subscription_tier ADD VALUE 'ENTERPRISE' AFTER 'DELUXE';
--
-- To RENAME a value (PostgreSQL 10+):
--   ALTER TYPE subscription_tier RENAME VALUE 'OLD_NAME' TO 'NEW_NAME';
--
-- To REMOVE a value: PostgreSQL doesn't support this directly. You would need to:
--   1. Create a new ENUM type without the value
--   2. Update all references to the new type
--   3. Drop the old type
--   4. Rename the new type
--
-- =============================================================================
