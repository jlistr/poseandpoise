// =============================================================================
// STRIPE CONNECT WEBHOOKS - THIN EVENTS FOR V2 ACCOUNTS
// =============================================================================
// POST /api/connect/webhooks
//
// This webhook handler processes THIN events for V2 Connect accounts.
// Thin events are lightweight notifications that only include the event ID.
// You must fetch the full event data separately.
//
// SETUP INSTRUCTIONS:
// 1. In Stripe Dashboard, go to Developers > Webhooks
// 2. Click "+ Add destination"
// 3. Select "Connected accounts" as the event source
// 4. Select "Show advanced options" and choose "Thin" payload style
// 5. Add these event types:
//    - v2.core.account[requirements].updated
//    - v2.core.account[configuration.merchant].capability_status_updated
//    - v2.core.account[configuration.customer].capability_status_updated
// 6. Set endpoint URL to: https://yourdomain.com/api/connect/webhooks
//
// LOCAL TESTING:
// Use the Stripe CLI to forward thin events to your local endpoint:
// ```bash
// stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' --forward-thin-to http://localhost:3000/api/connect/webhooks
// ```

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { 
  createStripeClient, 
  getAccountStatus,
  parseThinEvent,
  getFullEvent,
  type ThinEvent,
  type FullEvent
} from '@/lib/stripe/connect';

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Validates that the webhook secret is configured.
 */
function getWebhookSecret(): string {
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  
  if (!secret) {
    throw new Error(
      '[Connect Webhook] STRIPE_CONNECT_WEBHOOK_SECRET is not set.\n\n' +
      'To fix this:\n' +
      '1. Go to Stripe Dashboard > Developers > Webhooks\n' +
      '2. Create or select your webhook endpoint\n' +
      '3. Click "Reveal" under Signing secret\n' +
      '4. Add it to your .env.local file:\n' +
      '   STRIPE_CONNECT_WEBHOOK_SECRET=whsec_your_secret_here\n\n' +
      'For local testing, use the secret from `stripe listen` output.'
    );
  }
  
  return secret;
}

// Service role client for webhook operations (bypasses RLS)
// This is necessary because webhooks don't have user authentication
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

/**
 * POST /api/connect/webhooks
 * 
 * Handles thin events from Stripe for V2 Connect accounts.
 * 
 * Thin Event Structure:
 * {
 *   id: string,           // Event ID (evt_xxx)
 *   type: string,         // Event type
 *   related_object: {
 *     id: string,         // Related object ID (e.g., acct_xxx)
 *     type: string        // Object type
 *   }
 * }
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
      console.error('[Connect Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }
    
    // =======================================================================
    // STEP 2: Verify and parse the thin event
    // =======================================================================
    const webhookSecret = getWebhookSecret();
    
    // Parse the thin event with signature verification
    // This validates the webhook came from Stripe
    let thinEvent: ThinEvent;
    try {
      thinEvent = parseThinEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Connect Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }
    
    eventId = thinEvent.id;
    eventType = thinEvent.type;
    
    console.log(`[Connect Webhook] Received thin event: ${eventType} (${eventId})`);
    
    // =======================================================================
    // STEP 3: Fetch the full event data
    // =======================================================================
    // Thin events only contain the ID - we need to fetch the full event
    // to get all the details we need to process it
    const fullEvent: FullEvent = await getFullEvent(eventId);
    
    console.log(`[Connect Webhook] Processing event type: ${fullEvent.type}`);
    
    // =======================================================================
    // STEP 4: Handle the event based on its type
    // =======================================================================
    // Note: V2 Connect events have specific type strings
    // Using string comparison since TypeScript may not have all types defined
    const eventTypeStr = fullEvent.type;
    
    if (eventTypeStr === 'v2.core.account[requirements].updated') {
      // =====================================================================
      // REQUIREMENTS UPDATED
      // =====================================================================
      // This event fires when account requirements change.
      // Requirements can change due to:
      // - User providing/updating information
      // - Regulatory changes
      // - Risk assessment updates
      await handleRequirementsUpdated(fullEvent);
    } else if (eventTypeStr === 'v2.core.account[configuration.merchant].capability_status_updated') {
      // =====================================================================
      // MERCHANT CAPABILITY STATUS UPDATED
      // =====================================================================
      // This event fires when merchant capabilities (like card_payments) change.
      // The capability can become:
      // - 'active': Ready to process payments
      // - 'inactive': Cannot process payments
      // - 'pending': Waiting for verification
      await handleMerchantCapabilityUpdated(fullEvent);
    } else if (eventTypeStr === 'v2.core.account[configuration.customer].capability_status_updated') {
      // =====================================================================
      // CUSTOMER CAPABILITY STATUS UPDATED
      // =====================================================================
      // This event fires when customer capabilities change.
      // This affects the account's ability to pay the platform (subscriptions).
      await handleCustomerCapabilityUpdated(fullEvent);
    } else if (eventTypeStr === 'v2.core.account[configuration.recipient].capability_status_updated') {
      // =====================================================================
      // RECIPIENT CAPABILITY STATUS UPDATED (if using recipient configuration)
      // =====================================================================
      await handleRecipientCapabilityUpdated(fullEvent);
    } else {
      // =====================================================================
      // UNHANDLED EVENT TYPES
      // =====================================================================
      console.log(`[Connect Webhook] Unhandled event type: ${fullEvent.type}`);
    }
    
    // =======================================================================
    // STEP 5: Return success
    // =======================================================================
    // Always return 200 to acknowledge receipt
    // If you return an error, Stripe will retry the webhook
    return NextResponse.json({ 
      received: true,
      eventId,
      eventType 
    });
    
  } catch (error) {
    console.error(`[Connect Webhook] Error processing event ${eventId}:`, error);
    
    // Check if this is a signature verification error
    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }
    
    // For other errors, return 500 so Stripe retries
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
 * Handles the v2.core.account[requirements].updated event.
 * 
 * This event fires when account requirements change. We should:
 * 1. Fetch the current account status
 * 2. Update our database with the new status
 * 3. Optionally notify the user if action is needed
 */
async function handleRequirementsUpdated(event: unknown): Promise<void> {
  // Extract the account ID from the event
  // The structure depends on the event type, but generally:
  // event.related_object.id contains the account ID
  const eventData = event as { 
    related_object?: { id?: string };
    data?: { id?: string };
  };
  
  const accountId = eventData.related_object?.id || eventData.data?.id;
  
  if (!accountId) {
    console.error('[Connect Webhook] No account ID in requirements updated event');
    return;
  }
  
  console.log(`[Connect Webhook] Requirements updated for account: ${accountId}`);
  
  // Fetch the current status from Stripe
  const status = await getAccountStatus(accountId);
  
  // Update the database with the new status
  const { error } = await supabaseAdmin
    .from('connected_accounts')
    .update({
      onboarding_complete: status.onboardingComplete,
      charges_enabled: status.chargesEnabled,
      payouts_enabled: status.payoutsEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', accountId);
  
  if (error) {
    console.error('[Connect Webhook] Failed to update account status:', error);
    // Don't throw - we still want to acknowledge the webhook
  }
  
  // Log the requirements status for debugging
  console.log(`[Connect Webhook] Account ${accountId} status:`, {
    onboardingComplete: status.onboardingComplete,
    chargesEnabled: status.chargesEnabled,
    requirementsStatus: status.requirementsStatus,
    pendingRequirements: status.pendingRequirements,
  });
  
  // TODO: If status.requirementsStatus is 'currently_due' or 'past_due',
  // you might want to send an email notification to the user
  // asking them to complete their onboarding
  if (status.requirementsStatus === 'currently_due' || status.requirementsStatus === 'past_due') {
    console.log(`[Connect Webhook] Account ${accountId} has pending requirements - consider notifying user`);
    // await sendOnboardingReminderEmail(accountId);
  }
}

/**
 * Handles the v2.core.account[configuration.merchant].capability_status_updated event.
 * 
 * This event fires when merchant capabilities change (e.g., card_payments).
 */
async function handleMerchantCapabilityUpdated(event: unknown): Promise<void> {
  const eventData = event as { 
    related_object?: { id?: string };
    data?: { id?: string };
  };
  
  const accountId = eventData.related_object?.id || eventData.data?.id;
  
  if (!accountId) {
    console.error('[Connect Webhook] No account ID in merchant capability event');
    return;
  }
  
  console.log(`[Connect Webhook] Merchant capability updated for account: ${accountId}`);
  
  // Fetch and update the current status
  const status = await getAccountStatus(accountId);
  
  await supabaseAdmin
    .from('connected_accounts')
    .update({
      charges_enabled: status.chargesEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', accountId);
  
  // Log the capability status
  if (status.chargesEnabled) {
    console.log(`[Connect Webhook] Account ${accountId} can now process payments!`);
    // TODO: Send congratulations email or enable features in your app
  } else {
    console.log(`[Connect Webhook] Account ${accountId} cannot process payments`);
    // TODO: Consider notifying the user to complete requirements
  }
}

/**
 * Handles the v2.core.account[configuration.customer].capability_status_updated event.
 * 
 * This event fires when customer capabilities change.
 * This affects the account's ability to pay for platform subscriptions.
 */
async function handleCustomerCapabilityUpdated(event: unknown): Promise<void> {
  const eventData = event as { 
    related_object?: { id?: string };
    data?: { id?: string };
  };
  
  const accountId = eventData.related_object?.id || eventData.data?.id;
  
  if (!accountId) {
    console.error('[Connect Webhook] No account ID in customer capability event');
    return;
  }
  
  console.log(`[Connect Webhook] Customer capability updated for account: ${accountId}`);
  
  // For customer capabilities, we might want to check if the account
  // can now subscribe to platform services
  const status = await getAccountStatus(accountId);
  
  console.log(`[Connect Webhook] Account ${accountId} customer status:`, {
    onboardingComplete: status.onboardingComplete,
  });
  
  // TODO: Enable platform subscription features when customer capability is active
}

/**
 * Handles the v2.core.account[configuration.recipient].capability_status_updated event.
 * 
 * This event fires when recipient capabilities change.
 * This affects the account's ability to receive transfers.
 */
async function handleRecipientCapabilityUpdated(event: unknown): Promise<void> {
  const eventData = event as { 
    related_object?: { id?: string };
    data?: { id?: string };
  };
  
  const accountId = eventData.related_object?.id || eventData.data?.id;
  
  if (!accountId) {
    console.error('[Connect Webhook] No account ID in recipient capability event');
    return;
  }
  
  console.log(`[Connect Webhook] Recipient capability updated for account: ${accountId}`);
  
  // Fetch and update the current status
  const status = await getAccountStatus(accountId);
  
  await supabaseAdmin
    .from('connected_accounts')
    .update({
      payouts_enabled: status.payoutsEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', accountId);
}

