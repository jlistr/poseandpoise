// =============================================================================
// STRIPE WEBHOOK HANDLER
// =============================================================================
// Handles Stripe webhook events for subscription lifecycle

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { stripe, getTierFromLookupKey, getTierFromPriceId } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Use service role for webhook operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      // CHECKOUT COMPLETED - User completed payment
      // =======================================================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await handleSubscriptionUpdate(subscription);
        }
        break;
      }

      // =======================================================================
      // SUBSCRIPTION CREATED
      // =======================================================================
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      // =======================================================================
      // SUBSCRIPTION UPDATED - Plan change, renewal, etc.
      // =======================================================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      // =======================================================================
      // SUBSCRIPTION DELETED - Cancelled or expired
      // =======================================================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      // =======================================================================
      // INVOICE PAYMENT FAILED
      // =======================================================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await handlePaymentFailed(subscription);
        }
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
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  
  if (!userId) {
    // Try to find user by customer ID
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (customer.deleted) return;
    
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('profile_id')
      .eq('stripe_customer_id', customer.id)
      .single();
    
    if (!existingSub) {
      console.error('Could not find user for subscription:', subscription.id);
      return;
    }
    
    await updateSubscriptionInDb(existingSub.profile_id, subscription);
  } else {
    await updateSubscriptionInDb(userId, subscription);
  }
}

async function updateSubscriptionInDb(userId: string, subscription: Stripe.Subscription) {
  // Get the price from the subscription
  const price = subscription.items.data[0]?.price;
  const priceId = price?.id;
  const lookupKey = price?.lookup_key;
  
  // Determine tier from lookup key first, fall back to price ID
  let tier = 'FREE';
  if (lookupKey) {
    tier = getTierFromLookupKey(lookupKey);
  } else if (priceId) {
    tier = getTierFromPriceId(priceId);
  }
  
  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'active', // Treat trial as active
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'none',
    incomplete_expired: 'expired',
    paused: 'canceled',
  };
  
  const status = statusMap[subscription.status] || 'none';
  
  // Update subscriptions table (include both tier and plan_id for compatibility)
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      profile_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: status,
      tier: tier,
      plan_id: tier.toLowerCase(), // Store lowercase version as plan_id
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' });
  
  if (subError) {
    console.error('Error updating subscription:', subError);
    throw subError;
  }
  
  // The sync trigger will automatically update profiles.subscription_tier
  console.log(`Updated subscription for user ${userId}: ${tier} (${status})`);
}

// =============================================================================
// HELPER: Handle subscription cancellation
// =============================================================================
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  
  if (!userId) {
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('profile_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    
    if (existingSub) {
      await downgradeToFree(existingSub.profile_id, subscription);
    }
  } else {
    await downgradeToFree(userId, subscription);
  }
}

async function downgradeToFree(userId: string, _subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      tier: 'FREE',
      plan_id: 'free',
      stripe_subscription_id: null,
      stripe_price_id: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', userId);
  
  if (error) {
    console.error('Error downgrading subscription:', error);
    throw error;
  }
  
  console.log(`Downgraded user ${userId} to FREE tier`);
}

// =============================================================================
// HELPER: Handle payment failure
// =============================================================================
async function handlePaymentFailed(subscription: Stripe.Subscription) {
  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (existingSub) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', existingSub.profile_id);
    
    console.log(`Marked subscription as past_due for user ${existingSub.profile_id}`);
  }
}

