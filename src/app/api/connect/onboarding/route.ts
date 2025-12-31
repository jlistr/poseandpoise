// =============================================================================
// API ROUTE: CONNECTED ACCOUNT ONBOARDING
// =============================================================================
// POST /api/connect/onboarding
// Creates an account link for onboarding a connected account
//
// GET /api/connect/onboarding?accountId=acct_xxx
// Gets the current onboarding status (always fetches from Stripe API)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAccountOnboardingLink, getAccountStatus } from '@/lib/stripe/connect';

/**
 * Gets the base URL for the application.
 * In production, this should be your actual domain.
 */
function getBaseUrl(): string {
  // Check for explicit configuration first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Fallback for Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Default fallback
  return 'http://localhost:3000';
}

/**
 * POST /api/connect/onboarding
 * 
 * Creates an account onboarding link for the user's connected account.
 * 
 * Request body (optional):
 * {
 *   accountId?: string // If not provided, uses the authenticated user's account
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   url?: string,      // The onboarding URL to redirect to
 *   error?: string
 * }
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
    // STEP 2: Get the account ID
    // =======================================================================
    let accountId: string;
    
    // Check if accountId was provided in the request
    const body = await request.json().catch(() => ({}));
    
    if (body.accountId) {
      // Verify the user owns this account
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('stripe_account_id')
        .eq('profile_id', user.id)
        .eq('stripe_account_id', body.accountId)
        .single();
      
      if (!account) {
        return NextResponse.json(
          { success: false, error: 'Account not found or not authorized.' },
          { status: 403 }
        );
      }
      
      accountId = body.accountId;
    } else {
      // Get the user's connected account
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('stripe_account_id')
        .eq('profile_id', user.id)
        .single();
      
      if (!account) {
        return NextResponse.json(
          { success: false, error: 'No connected account found. Create one first.' },
          { status: 404 }
        );
      }
      
      accountId = account.stripe_account_id;
    }
    
    // =======================================================================
    // STEP 3: Create the onboarding link
    // =======================================================================
    const baseUrl = getBaseUrl();
    
    // refresh_url: Where to redirect if the link expires
    // The user should be able to get a new link from this page
    const refreshUrl = `${baseUrl}/dashboard/connect`;
    
    // return_url: Where to redirect after successful onboarding
    // This page should check the account status and update the UI
    const returnUrl = `${baseUrl}/dashboard/connect/return`;
    
    const onboardingUrl = await createAccountOnboardingLink(
      accountId,
      refreshUrl,
      returnUrl
    );
    
    // =======================================================================
    // STEP 4: Return the onboarding URL
    // =======================================================================
    return NextResponse.json({
      success: true,
      url: onboardingUrl,
      message: 'Redirect the user to this URL to complete onboarding.',
    });
    
  } catch (error) {
    console.error('[Connect Onboarding] Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create onboarding link.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/connect/onboarding
 * 
 * Gets the current onboarding status for a connected account.
 * Always fetches the status directly from Stripe API for accuracy.
 * 
 * Query parameters:
 * - accountId: (optional) The Stripe account ID. If not provided, uses the user's account.
 * 
 * Response:
 * {
 *   accountId: string,
 *   chargesEnabled: boolean,
 *   payoutsEnabled: boolean,
 *   onboardingComplete: boolean,
 *   requirementsStatus: 'complete' | 'currently_due' | 'past_due' | 'pending',
 *   pendingRequirements?: string[]
 * }
 */
export async function GET(request: Request) {
  try {
    // =======================================================================
    // STEP 1: Authenticate the user
    // =======================================================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    // =======================================================================
    // STEP 2: Get the account ID
    // =======================================================================
    const { searchParams } = new URL(request.url);
    const providedAccountId = searchParams.get('accountId');
    let stripeAccountId: string;
    
    if (providedAccountId) {
      // Verify the user owns this account
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('stripe_account_id')
        .eq('profile_id', user.id)
        .eq('stripe_account_id', providedAccountId)
        .single();
      
      if (!account) {
        return NextResponse.json(
          { error: 'Account not found or not authorized.' },
          { status: 403 }
        );
      }
      
      stripeAccountId = providedAccountId;
    } else {
      // Get the user's connected account
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('stripe_account_id')
        .eq('profile_id', user.id)
        .single();
      
      if (!account) {
        return NextResponse.json(
          { error: 'No connected account found.' },
          { status: 404 }
        );
      }
      
      stripeAccountId = account.stripe_account_id;
    }
    
    // =======================================================================
    // STEP 3: Fetch status from Stripe API (always get fresh data)
    // =======================================================================
    // IMPORTANT: Always fetch from the API directly for accurate status.
    // Do not rely solely on cached values in the database.
    const status = await getAccountStatus(stripeAccountId);
    
    // =======================================================================
    // STEP 4: Update cached status in database (optional, for quick reference)
    // =======================================================================
    // This is optional but helps with displaying status without API calls
    await supabase
      .from('connected_accounts')
      .update({
        onboarding_complete: status.onboardingComplete,
        charges_enabled: status.chargesEnabled,
        payouts_enabled: status.payoutsEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', stripeAccountId);
    
    // =======================================================================
    // STEP 5: Return the status
    // =======================================================================
    return NextResponse.json(status);
    
  } catch (error) {
    console.error('[Connect Onboarding] Error fetching status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account status.' },
      { status: 500 }
    );
  }
}

