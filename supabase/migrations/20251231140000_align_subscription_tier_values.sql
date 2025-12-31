-- =============================================================================
-- ALIGN SUBSCRIPTION TIER VALUES
-- =============================================================================
-- Converts subscriptions.tier from TEXT to the subscription_tier ENUM
-- and adds a stripe_price_id column for Stripe plan identification
-- =============================================================================

-- Step 1: Add stripe_price_id column for Stripe integration
-- This separates the business tier from the Stripe billing identifier
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe Price ID (e.g., price_xxx) - used for billing integration';

-- Step 2: Map existing tier values to uppercase ENUM values
-- 'free' -> 'FREE', 'pro' -> 'PROFESSIONAL', 'agency' -> 'DELUXE'
UPDATE subscriptions 
SET tier = CASE 
  WHEN LOWER(tier) = 'free' THEN 'FREE'
  WHEN LOWER(tier) = 'pro' THEN 'PROFESSIONAL'
  WHEN LOWER(tier) = 'professional' THEN 'PROFESSIONAL'
  WHEN LOWER(tier) = 'agency' THEN 'DELUXE'
  WHEN LOWER(tier) = 'deluxe' THEN 'DELUXE'
  ELSE 'FREE'  -- Default fallback
END
WHERE tier IS NOT NULL;

-- Step 3: Handle NULL values
UPDATE subscriptions SET tier = 'FREE' WHERE tier IS NULL;

-- Step 4: Drop default before type conversion
ALTER TABLE subscriptions ALTER COLUMN tier DROP DEFAULT;

-- Step 5: Convert to ENUM type
ALTER TABLE subscriptions 
ALTER COLUMN tier TYPE subscription_tier 
USING tier::subscription_tier;

-- Step 6: Set default and NOT NULL
ALTER TABLE subscriptions ALTER COLUMN tier SET DEFAULT 'FREE'::subscription_tier;
ALTER TABLE subscriptions ALTER COLUMN tier SET NOT NULL;

-- Step 7: Update helper functions to use consistent values
-- Update is_paid_subscriber to check for PROFESSIONAL or DELUXE
CREATE OR REPLACE FUNCTION is_paid_subscriber(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE profile_id = user_id
    AND tier IN ('PROFESSIONAL', 'DELUXE')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update has_pro_subscription to check for PROFESSIONAL or higher
CREATE OR REPLACE FUNCTION has_pro_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE profile_id = user_id
    AND status = 'active'
    AND tier IN ('PROFESSIONAL', 'DELUXE')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add a function to sync profile tier from subscription (useful for triggers)
CREATE OR REPLACE FUNCTION sync_profile_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET subscription_tier = NEW.tier,
      updated_at = NOW()
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to keep profiles.subscription_tier in sync
DROP TRIGGER IF EXISTS sync_subscription_tier_trigger ON subscriptions;
CREATE TRIGGER sync_subscription_tier_trigger
  AFTER INSERT OR UPDATE OF tier ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_subscription_tier();

-- =============================================================================
-- SUMMARY OF CHANGES
-- =============================================================================
-- 1. Added stripe_price_id column for Stripe plan IDs
-- 2. Converted subscriptions.tier to subscription_tier ENUM
-- 3. Mapped: 'free' -> FREE, 'pro' -> PROFESSIONAL, 'agency' -> DELUXE
-- 4. Updated helper functions to use ENUM values
-- 5. Added trigger to auto-sync profiles.subscription_tier
-- =============================================================================

