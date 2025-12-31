-- =============================================================================
-- UPDATE SUBSCRIPTIONS TABLE FOR STRIPE CHECKOUT
-- =============================================================================
-- Adds plan_id and cancel_at_period_end columns for Stripe integration

-- Add plan_id column (rename tier to plan_id for clarity with Stripe)
DO $$ 
BEGIN
  -- Check if plan_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'plan_id'
  ) THEN
    -- Add plan_id column
    ALTER TABLE subscriptions ADD COLUMN plan_id TEXT NOT NULL DEFAULT 'free';
    
    -- Copy data from tier column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscriptions' AND column_name = 'tier'
    ) THEN
      UPDATE subscriptions SET plan_id = LOWER(tier::TEXT) WHERE tier IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Add cancel_at_period_end column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx 
  ON subscriptions(stripe_subscription_id);

-- Add comment for documentation
COMMENT ON TABLE subscriptions IS 'User subscription records synced from Stripe';
COMMENT ON COLUMN subscriptions.plan_id IS 'Plan identifier: free, professional, or deluxe';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at period end';

