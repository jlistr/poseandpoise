-- =============================================================================
-- STRIPE CONNECT ACCOUNTS TABLE
-- =============================================================================
-- Stores the mapping between platform users and their Stripe Connect accounts.
-- This allows users to become sellers/merchants on the platform.

CREATE TABLE IF NOT EXISTS connected_accounts (
  -- Primary key: UUID for the connected account record
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign key to the user's profile
  -- Each user can have one connected account
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- The Stripe Connect account ID (starts with 'acct_')
  -- This is the V2 Account ID from Stripe
  stripe_account_id TEXT NOT NULL UNIQUE,
  
  -- Display name for the connected account (from user input)
  display_name TEXT,
  
  -- Contact email for the connected account
  contact_email TEXT,
  
  -- Whether the account has completed onboarding
  -- This is derived from checking requirements via API, but cached here for quick access
  onboarding_complete BOOLEAN DEFAULT FALSE,
  
  -- Whether the account can process payments (card_payments capability is active)
  -- This is derived from checking capabilities via API, but cached here for quick access
  charges_enabled BOOLEAN DEFAULT FALSE,
  
  -- Whether the account can receive payouts
  payouts_enabled BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by stripe_account_id
CREATE INDEX IF NOT EXISTS idx_connected_accounts_stripe_id ON connected_accounts(stripe_account_id);

-- Index for faster lookups by profile_id  
CREATE INDEX IF NOT EXISTS idx_connected_accounts_profile_id ON connected_accounts(profile_id);

-- =============================================================================
-- PLATFORM SUBSCRIPTIONS FOR CONNECTED ACCOUNTS
-- =============================================================================
-- Stores subscription information when connected accounts subscribe to the platform.
-- With V2 accounts, the connected account ID (acct_) serves as both the account and customer.

CREATE TABLE IF NOT EXISTS platform_subscriptions (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- The connected account this subscription belongs to
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  
  -- Stripe subscription ID
  stripe_subscription_id TEXT UNIQUE,
  
  -- Current subscription status
  -- Possible values: active, trialing, past_due, canceled, unpaid, incomplete, paused
  status TEXT NOT NULL DEFAULT 'incomplete',
  
  -- The price ID they're subscribed to
  stripe_price_id TEXT,
  
  -- Current billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Whether subscription will cancel at period end
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_subs_connected_account ON platform_subscriptions(connected_account_id);
CREATE INDEX IF NOT EXISTS idx_platform_subs_stripe_id ON platform_subscriptions(stripe_subscription_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on connected_accounts
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own connected account
CREATE POLICY "Users can view own connected account"
  ON connected_accounts FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can only insert their own connected account
CREATE POLICY "Users can create own connected account"
  ON connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can only update their own connected account
CREATE POLICY "Users can update own connected account"
  ON connected_accounts FOR UPDATE
  USING (auth.uid() = profile_id);

-- Enable RLS on platform_subscriptions
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view subscriptions for their connected accounts
CREATE POLICY "Users can view own platform subscriptions"
  ON platform_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connected_accounts ca
      WHERE ca.id = platform_subscriptions.connected_account_id
      AND ca.profile_id = auth.uid()
    )
  );

-- =============================================================================
-- TRIGGER FOR UPDATED_AT
-- =============================================================================

-- Trigger for connected_accounts (uses existing function if available)
DROP TRIGGER IF EXISTS update_connected_accounts_updated_at ON connected_accounts;
CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for platform_subscriptions
DROP TRIGGER IF EXISTS update_platform_subscriptions_updated_at ON platform_subscriptions;
CREATE TRIGGER update_platform_subscriptions_updated_at
  BEFORE UPDATE ON platform_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

