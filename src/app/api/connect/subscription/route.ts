// =============================================================================
// API ROUTE: PLATFORM SUBSCRIPTIONS FOR CONNECTED ACCOUNTS
// =============================================================================
// POST /api/connect/subscription - Create subscription checkout for connected account
// GET /api/connect/subscription - Get subscription status
// DELETE /api/connect/subscription - Cancel subscription (redirect to billing portal)
//
// This allows the platform to charge connected accounts for SaaS fees.
// With V2 accounts, we use customer_account instead of customer.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  createPlatformSubscriptionCheckout,
  createBillingPortalSession,
  PLATFORM_SUBSCRIPTION_PRICE_ID 
} from '@/lib/stripe/connect';

/**
 * Gets the base URL for the application.
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

/**
 * POST /api/connect/subscription
 * 
 * Creates a checkout session for a platform subscription.
 * This allows the platform to charge connected accounts for using the platform.
 * 
 * Request body:
 * {
 *   priceId?: string  // Optional: override the default subscription price
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   url?: string,     // Checkout URL to redirect to
 *   error?: string
 * }
 * 
 * USAGE EXAMPLE:
 * ```javascript
 * // On the connected account's dashboard
 * const response = await fetch('/api/connect/subscription', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({})
 * });
 * 
 * const { url } = await response.json();
 * window.location.href = url; // Redirect to subscription checkout
 * ```
 */
export async function POST(request: Request) {
  try {
    // =======================================================================
    // STEP 1: Authenticate the user
    // =======================================================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    // =======================================================================
    // STEP 2: Get the user's connected account
    // =======================================================================
    const { data: account, error: accountError } = await supabase
      .from('connected_accounts')
      .select('stripe_account_id')
      .eq('profile_id', user.id)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: 'No connected account found. Create one first.' },
        { status: 404 }
      );
    }
    
    // =======================================================================
    // STEP 3: Parse request body for optional price override
    // =======================================================================
    const body = await request.json().catch(() => ({}));
    const priceId = body.priceId || PLATFORM_SUBSCRIPTION_PRICE_ID;
    
    // Validate price ID exists
    if (!priceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Platform subscription price not configured. ' +
                 'Set STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID environment variable.' 
        },
        { status: 500 }
      );
    }
    
    // =======================================================================
    // STEP 4: Create the subscription checkout
    // =======================================================================
    const baseUrl = getBaseUrl();
    
    const checkoutUrl = await createPlatformSubscriptionCheckout({
      // The connected account ID is used as customer_account for V2 accounts
      accountId: account.stripe_account_id,
      priceId,
      successUrl: `${baseUrl}/dashboard/connect/subscription/success`,
      cancelUrl: `${baseUrl}/dashboard/connect`,
    });
    
    // =======================================================================
    // STEP 5: Return the checkout URL
    // =======================================================================
    return NextResponse.json({
      success: true,
      url: checkoutUrl,
      message: 'Redirect the user to complete their subscription.',
    });
    
  } catch (error) {
    console.error('[Connect Subscription] Error creating checkout:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: `Failed to create subscription checkout: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/connect/subscription
 * 
 * Gets the current subscription status for the user's connected account.
 * 
 * Response:
 * {
 *   hasSubscription: boolean,
 *   subscription?: {
 *     status: string,
 *     currentPeriodEnd: string,
 *     cancelAtPeriodEnd: boolean
 *   }
 * }
 */
export async function GET() {
  try {
    // =======================================================================
    // STEP 1: Authenticate the user
    // =======================================================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { hasSubscription: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // =======================================================================
    // STEP 2: Get the user's connected account
    // =======================================================================
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('profile_id', user.id)
      .single();
    
    if (!account) {
      return NextResponse.json({ hasSubscription: false });
    }
    
    // =======================================================================
    // STEP 3: Get the subscription status from database
    // =======================================================================
    const { data: subscription } = await supabase
      .from('platform_subscriptions')
      .select('*')
      .eq('connected_account_id', account.id)
      .single();
    
    if (!subscription) {
      return NextResponse.json({ hasSubscription: false });
    }
    
    // =======================================================================
    // STEP 4: Return the subscription status
    // =======================================================================
    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.stripe_price_id,
      },
    });
    
  } catch (error) {
    console.error('[Connect Subscription] Error fetching status:', error);
    return NextResponse.json(
      { hasSubscription: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/connect/subscription
 * 
 * Creates a billing portal session for managing the subscription.
 * The user can cancel their subscription through the portal.
 * 
 * Response:
 * {
 *   success: boolean,
 *   url?: string,     // Billing portal URL
 *   error?: string
 * }
 */
export async function DELETE() {
  try {
    // =======================================================================
    // STEP 1: Authenticate the user
    // =======================================================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    // =======================================================================
    // STEP 2: Get the user's connected account
    // =======================================================================
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('stripe_account_id')
      .eq('profile_id', user.id)
      .single();
    
    if (!account) {
      return NextResponse.json(
        { success: false, error: 'No connected account found.' },
        { status: 404 }
      );
    }
    
    // =======================================================================
    // STEP 3: Create billing portal session
    // =======================================================================
    const baseUrl = getBaseUrl();
    
    const portalUrl = await createBillingPortalSession(
      account.stripe_account_id,
      `${baseUrl}/dashboard/connect`
    );
    
    // =======================================================================
    // STEP 4: Return the portal URL
    // =======================================================================
    return NextResponse.json({
      success: true,
      url: portalUrl,
      message: 'Redirect to the billing portal to manage your subscription.',
    });
    
  } catch (error) {
    console.error('[Connect Subscription] Error creating portal:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: `Failed to create billing portal: ${errorMessage}` },
      { status: 500 }
    );
  }
}

