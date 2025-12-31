// =============================================================================
// STRIPE CONNECT DASHBOARD PAGE
// =============================================================================
// /dashboard/connect
//
// This page allows users to:
// 1. Create a connected account (if they don't have one)
// 2. Complete onboarding (if not complete)
// 3. View account status
// 4. Manage products
// 5. Subscribe to the platform
//
// The UI updates based on the current state of the connected account.

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ConnectDashboardClient from './ConnectDashboardClient';

export default async function ConnectDashboardPage() {
  // Check authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch the user's connected account from the database
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('profile_id', user.id)
    .single();
  
  // Fetch platform subscription if they have an account
  let subscription = null;
  if (account) {
    const { data: sub } = await supabase
      .from('platform_subscriptions')
      .select('*')
      .eq('connected_account_id', account.id)
      .single();
    subscription = sub;
  }
  
  return (
    <ConnectDashboardClient 
      initialAccount={account}
      initialSubscription={subscription}
    />
  );
}

