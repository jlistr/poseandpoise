// =============================================================================
// STRIPE WEBHOOKS FOR PLATFORM SUBSCRIPTIONS
// =============================================================================
// POST /api/connect/subscription-webhooks
//
// This webhook handler processes SNAPSHOT events for platform subscriptions.
// These are standard Stripe events (not thin events) for subscription lifecycle.
//
// IMPORTANT: This is DIFFERENT from the Connect webhooks (/api/connect/webhooks)
// which handle thin events for V2 account status changes.
//
// SETUP INSTRUCTIONS:
// 1. In Stripe Dashboard, go to Developers > Webhooks
// 2. Click "+ Add destination"
// 3. Select "Your account" (NOT "Connected accounts")
// 4. Keep the default "Snapshot" payload style
// 5. Add these event types:
//    - checkout.session.completed
//    - customer.subscription.created
//    - customer.subscription.updated
//    - customer.subscription.deleted
//    - invoice.paid
//    - invoice.payment_failed
// 6. Set endpoint URL to: https://yourdomain.com/api/connect/subscription-webhooks
//
// LOCAL TESTING:
// ```bash
// stripe listen --forward-to http://localhost:3000/api/connect/subscription-webhooks
// ```

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { createStripeClient } from '@/lib/stripe/connect';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Gets the webhook secret for platform subscription webhooks.
 * This is DIFFERENT from the Connect webhook secret.
 */
function getWebhookSecret(): string {
  const secret = process.env.STRIPE_PLATFORM_WEBHOOK_SECRET;
  
  if (!secret) {
    throw new Error(
      '[Platform Webhook] STRIPE_PLATFORM_WEBHOOK_SECRET is not set.\n\n' +
      'To fix this:\n' +
      '1. Go to Stripe Dashboard > Developers > Webhooks\n' +
      '2. Create or select your platform webhook endpoint\n' +
      '3. Click "Reveal" under Signing secret\n' +
      '4. Add it to your .env.local file:\n' +
      '   STRIPE_PLATFORM_WEBHOOK_SECRET=whsec_your_secret_here\n\n' +
      'For local testing, use the secret from `stripe listen` output.'
    );
  }
  
  return secret;
}

// Service role client for webhook operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

/**
 * POST /api/connect/subscription-webhooks
 * 
 * Handles snapshot events for platform subscriptions.
 * These events are for subscriptions where connected accounts pay the platform.
 */
export async function POST(request: Request) {
  let eventId = 'unknown';
  let eventType = 'unknown';
  
  try {
    // =======================================================================
    // STEP 1: Get the raw body and signature
    // =======================================================================
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      console.error('[Platform Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }
    
    // =======================================================================
    // STEP 2: Verify and parse the event
    // =======================================================================
    const webhookSecret = getWebhookSecret();
    const stripeClient = createStripeClient();
    
    // Construct the event with signature verification
    let event: Stripe.Event;
    
    try {
      event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Platform Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }
    
    eventId = event.id;
    eventType = event.type;
    
    console.log(`[Platform Webhook] Received event: ${eventType} (${eventId})`);
    
    // =======================================================================
    // STEP 3: Handle the event based on its type
    // =======================================================================
    switch (event.type) {
      // =====================================================================
      // CHECKOUT COMPLETED
      // =====================================================================
      // Fires when a customer completes checkout for a subscription
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      // =====================================================================
      // SUBSCRIPTION CREATED
      // =====================================================================
      // Fires when a new subscription is created
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      // =====================================================================
      // SUBSCRIPTION UPDATED
      // =====================================================================
      // Fires when a subscription is updated (plan change, renewal, etc.)
      // This is the main event for tracking subscription status changes
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      // =====================================================================
      // SUBSCRIPTION DELETED
      // =====================================================================
      // Fires when a subscription is canceled and the cancellation takes effect
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      // =====================================================================
      // INVOICE PAID
      // =====================================================================
      // Fires when an invoice is successfully paid
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      
      // =====================================================================
      // INVOICE PAYMENT FAILED
      // =====================================================================
      // Fires when payment for an invoice fails
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      // =====================================================================
      // PAYMENT METHOD ATTACHED
      // =====================================================================
      // Fires when a customer adds a payment method
      case 'payment_method.attached':
        console.log(`[Platform Webhook] Payment method attached`);
        // TODO: Store payment method info if needed
        break;
      
      // =====================================================================
      // PAYMENT METHOD DETACHED
      // =====================================================================
      // Fires when a customer removes a payment method
      case 'payment_method.detached':
        console.log(`[Platform Webhook] Payment method detached`);
        // TODO: Update stored payment method info if needed
        break;
      
      // =====================================================================
      // CUSTOMER UPDATED
      // =====================================================================
      // Fires when customer information changes
      case 'customer.updated':
        console.log(`[Platform Webhook] Customer updated`);
        // TODO: Update stored customer info if needed
        break;
      
      // =====================================================================
      // BILLING PORTAL EVENTS
      // =====================================================================
      case 'billing_portal.session.created':
        console.log(`[Platform Webhook] Billing portal session created`);
        break;
      
      // =====================================================================
      // UNHANDLED EVENT TYPES
      // =====================================================================
      default:
        console.log(`[Platform Webhook] Unhandled event type: ${event.type}`);
    }
    
    // =======================================================================
    // STEP 4: Return success
    // =======================================================================
    return NextResponse.json({ 
      received: true,
      eventId,
      eventType 
    });
    
  } catch (error) {
    console.error(`[Platform Webhook] Error processing event ${eventId}:`, error);
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handles checkout.session.completed event.
 * This fires when a connected account completes subscription checkout.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`[Platform Webhook] Checkout completed: ${session.id}`);
  
  // For subscriptions, the subscription is created automatically
  // The customer.subscription.created event will handle the database update
  
  if (session.mode === 'subscription' && session.subscription) {
    console.log(`[Platform Webhook] Subscription checkout completed: ${session.subscription}`);
  }
  
  // For V2 accounts, customer_account contains the connected account ID
  // Note: In the API, this is accessed differently than regular customers
  const customerAccount = (session as unknown as { customer_account?: string }).customer_account;
  
  if (customerAccount) {
    console.log(`[Platform Webhook] Connected account: ${customerAccount}`);
  }
}

/**
 * Handles customer.subscription.created event.
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log(`[Platform Webhook] Subscription created: ${subscription.id}`);
  
  // For V2 accounts, get the account ID from customer_account
  // Note: customer_account is on the subscription for V2 accounts
  const accountId = (subscription as unknown as { customer_account?: string }).customer_account 
    || subscription.customer as string;
  
  if (!accountId) {
    console.error('[Platform Webhook] No account ID in subscription');
    return;
  }
  
  console.log(`[Platform Webhook] Account ID: ${accountId}`);
  
  await upsertPlatformSubscription(accountId, subscription);
}

/**
 * Handles customer.subscription.updated event.
 * 
 * This event fires for many subscription changes:
 * - Plan upgrades/downgrades
 * - Payment method changes
 * - Renewal
 * - Trial ending
 * - Cancellation scheduled (cancel_at_period_end = true)
 * - Pause/resume
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log(`[Platform Webhook] Subscription updated: ${subscription.id} (status: ${subscription.status})`);
  
  // Get the account ID
  const accountId = (subscription as unknown as { customer_account?: string }).customer_account 
    || subscription.customer as string;
  
  if (!accountId) {
    console.error('[Platform Webhook] No account ID in subscription update');
    return;
  }
  
  await upsertPlatformSubscription(accountId, subscription);
  
  // Check for specific update scenarios
  
  // Cancellation scheduled
  if (subscription.cancel_at_period_end) {
    console.log(`[Platform Webhook] Subscription ${subscription.id} will cancel at period end`);
    // TODO: Send email notification about upcoming cancellation
  }
  
  // Subscription paused
  if (subscription.pause_collection) {
    console.log(`[Platform Webhook] Subscription ${subscription.id} is paused`);
    // TODO: Limit access to platform features
  }
  
  // Plan changed (upgrade/downgrade)
  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId) {
    console.log(`[Platform Webhook] Subscription ${subscription.id} price: ${priceId}`);
    // TODO: Grant/revoke features based on plan
  }
}

/**
 * Handles customer.subscription.deleted event.
 * This fires when a subscription is fully canceled (not just scheduled to cancel).
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log(`[Platform Webhook] Subscription deleted: ${subscription.id}`);
  
  const accountId = (subscription as unknown as { customer_account?: string }).customer_account 
    || subscription.customer as string;
  
  if (!accountId) {
    console.error('[Platform Webhook] No account ID in subscription deletion');
    return;
  }
  
  // Update the subscription status to canceled
  const { data: connectedAccount } = await supabaseAdmin
    .from('connected_accounts')
    .select('id')
    .eq('stripe_account_id', accountId)
    .single();
  
  if (!connectedAccount) {
    console.error('[Platform Webhook] Connected account not found:', accountId);
    return;
  }
  
  const { error } = await supabaseAdmin
    .from('platform_subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('connected_account_id', connectedAccount.id)
    .eq('stripe_subscription_id', subscription.id);
  
  if (error) {
    console.error('[Platform Webhook] Failed to update canceled subscription:', error);
  } else {
    console.log(`[Platform Webhook] Subscription ${subscription.id} marked as canceled`);
    // TODO: Revoke premium features for this connected account
  }
}

/**
 * Handles invoice.paid event.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log(`[Platform Webhook] Invoice paid: ${invoice.id}`);
  
  // The subscription will be updated separately via customer.subscription.updated
  // You might want to track invoice history here
  
  // Access subscription from the invoice (may be string, Subscription, or null)
  const subscriptionId = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id;
  
  if (subId) {
    console.log(`[Platform Webhook] Subscription ${subId} invoice paid`);
    // TODO: Send receipt email
  }
}

/**
 * Handles invoice.payment_failed event.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log(`[Platform Webhook] Invoice payment failed: ${invoice.id}`);
  
  const accountId = (invoice as unknown as { customer_account?: string }).customer_account 
    || invoice.customer as string;
  
  if (accountId) {
    console.log(`[Platform Webhook] Payment failed for account: ${accountId}`);
    // TODO: Send payment failure notification
    // TODO: Consider limiting platform access after multiple failures
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Upserts a platform subscription in the database.
 * 
 * @param accountId - The connected account ID (acct_xxx)
 * @param subscription - The Stripe subscription object
 */
async function upsertPlatformSubscription(
  accountId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  // First, get the connected_account record
  const { data: connectedAccount, error: accountError } = await supabaseAdmin
    .from('connected_accounts')
    .select('id')
    .eq('stripe_account_id', accountId)
    .single();
  
  if (accountError || !connectedAccount) {
    console.error('[Platform Webhook] Connected account not found:', accountId);
    // The account might not exist in our database yet
    // This can happen if the webhook fires before our API creates the record
    return;
  }
  
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price?.id || null;
  
  // Map Stripe status to our status
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
  
  // Get period timestamps (they may be on the subscription object)
  const currentPeriodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
  const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
  
  // Upsert the subscription
  const { error: upsertError } = await supabaseAdmin
    .from('platform_subscriptions')
    .upsert(
      {
        connected_account_id: connectedAccount.id,
        stripe_subscription_id: subscription.id,
        status,
        stripe_price_id: priceId,
        current_period_start: currentPeriodStart 
          ? new Date(currentPeriodStart * 1000).toISOString() 
          : null,
        current_period_end: currentPeriodEnd 
          ? new Date(currentPeriodEnd * 1000).toISOString() 
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { 
        onConflict: 'stripe_subscription_id',
        ignoreDuplicates: false 
      }
    );
  
  if (upsertError) {
    console.error('[Platform Webhook] Failed to upsert subscription:', upsertError);
  } else {
    console.log(`[Platform Webhook] Subscription ${subscription.id} upserted (${status})`);
  }
}

