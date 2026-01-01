// =============================================================================
// STRIPE WEBHOOK HANDLER
// =============================================================================
// Handles Stripe webhook events for subscription lifecycle management
// Uses service role client to bypass RLS for database operations

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { stripe, getTierFromLookupKey } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Service role client for webhook operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // =======================================================================
      // CHECKOUT COMPLETED - User completed payment/started trial
      // =======================================================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await handleSubscriptionChange(subscription);
        }
        break;
      }

      // =======================================================================
      // SUBSCRIPTION UPDATED - Plan change, renewal, trial end, etc.
      // =======================================================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      // =======================================================================
      // SUBSCRIPTION DELETED - Cancelled or expired
      // =======================================================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// HELPER: Handle subscription creation/update
// =============================================================================
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Get user ID from subscription metadata or customer lookup
  let userId = subscription.metadata.supabase_user_id;
  
  if (!userId) {
    // Try to find user by customer ID
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (customer.deleted) {
      console.error('Customer was deleted:', subscription.customer);
      return;
    }
    
    userId = customer.metadata.supabase_user_id;
    
    if (!userId) {
      // Last resort: look up in our database
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('profile_id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single();
      
      if (!existingSub) {
        console.error('Could not find user for subscription:', subscription.id);
        return;
      }
      
      userId = existingSub.profile_id;
    }
  }

  await upsertSubscription(userId, subscription);
}

async function upsertSubscription(userId: string, subscription: Stripe.Subscription) {
  // Get the price from the subscription
  const subscriptionItem = subscription.items.data[0];
  const price = subscriptionItem?.price;
  
  // Determine plan from lookup key
  const lookupKey = price?.lookup_key ?? '';
  const planId = getTierFromLookupKey(lookupKey);
  
  // Map Stripe status to our status values
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'active',
    trialing: 'active', // Treat trial as active
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'incomplete',
    incomplete_expired: 'expired',
    paused: 'paused',
  };
  
  const status = statusMap[subscription.status] || 'active';

  // Cast subscription to access period fields (Stripe SDK v20+ types)
  const sub = subscription as unknown as {
    customer: string;
    id: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };
  
  // Upsert subscription data
  // Note: 'tier' column triggers sync_profile_subscription_tier() to update profiles.subscription_tier
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      profile_id: userId,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      plan_id: planId,
      tier: planId, // Required for trigger to update profiles.subscription_tier
      status: status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' });
  
  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }
  
  console.log(`Updated subscription for user ${userId}: ${planId} (${status})`);
}

// =============================================================================
// HELPER: Handle subscription deletion
// =============================================================================
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Try to find user by subscription ID
  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (!existingSub) {
    console.error('Could not find subscription to delete:', subscription.id);
    return;
  }
  
  // Downgrade to free plan
  // Note: 'tier' column triggers sync_profile_subscription_tier() to update profiles.subscription_tier
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_id: 'FREE',
      tier: 'FREE', // Required for trigger to update profiles.subscription_tier
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', existingSub.profile_id);
  
  if (error) {
    console.error('Error downgrading subscription:', error);
    throw error;
  }
  
  console.log(`Downgraded user ${existingSub.profile_id} to free tier`);
}

