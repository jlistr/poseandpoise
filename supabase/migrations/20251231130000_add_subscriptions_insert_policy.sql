-- =============================================================================
-- ADD INSERT POLICY FOR SUBSCRIPTIONS TABLE
-- =============================================================================
-- Allows users to create their own subscription record upon signup
-- =============================================================================

-- Allow users to insert their own subscription record
CREATE POLICY "Users can create own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Also allow users to update their own subscription (for future use)
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

