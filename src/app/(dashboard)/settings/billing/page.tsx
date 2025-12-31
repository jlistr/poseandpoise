// =============================================================================
// BILLING SETTINGS PAGE
// =============================================================================
// Displays current subscription and allows plan selection with Stripe Checkout

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PLANS, type PlanId } from '@/lib/stripe';
import { BillingClient } from './BillingClient';

export const metadata = {
  title: 'Billing | Pose & Poise',
  description: 'Manage your subscription and billing',
};

interface SubscriptionData {
  plan_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
}

async function getSubscriptionData(userId: string): Promise<SubscriptionData | null> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('subscriptions')
    .select('plan_id, status, current_period_end, cancel_at_period_end, stripe_customer_id')
    .eq('profile_id', userId)
    .single();
  
  return data;
}

export default async function BillingPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const subscription = await getSubscriptionData(user.id);
  
  const currentPlanId = (subscription?.plan_id?.toUpperCase() as PlanId) || 'FREE';
  const currentPlan = PLANS[currentPlanId] || PLANS.FREE;
  
  return (
    <BillingClient
      currentPlanId={currentPlanId}
      currentPlan={currentPlan}
      subscription={subscription}
      hasStripeCustomer={!!subscription?.stripe_customer_id}
    />
  );
}

