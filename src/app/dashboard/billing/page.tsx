// =============================================================================
// BILLING MANAGEMENT PAGE
// =============================================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PLANS, type PlanId } from '@/lib/stripe';
import { BillingClient } from './BillingClient';

export const metadata = {
  title: 'Billing | Pose & Poise',
  description: 'Manage your subscription and billing',
};

async function getBillingData(userId: string) {
  const supabase = await createClient();
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('profile_id', userId)
    .single();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, email')
    .eq('id', userId)
    .single();
  
  return {
    subscription,
    profile,
  };
}

export default async function BillingPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { subscription, profile } = await getBillingData(user.id);
  
  const currentTier = (profile?.subscription_tier as PlanId) || 'FREE';
  const currentPlan = PLANS[currentTier];
  
  return (
    <BillingClient
      currentTier={currentTier}
      currentPlan={currentPlan}
      subscription={subscription}
      hasStripeCustomer={!!subscription?.stripe_customer_id}
    />
  );
}

