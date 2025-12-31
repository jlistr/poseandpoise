// =============================================================================
// API ROUTE: CREATE CONNECTED ACCOUNT
// =============================================================================
// POST /api/connect/accounts
// Creates a new Stripe Connect account for the authenticated user
//
// This endpoint:
// 1. Validates the user is authenticated
// 2. Creates a V2 Connect account with Stripe
// 3. Stores the mapping in the database
// 4. Returns the account ID for further onboarding

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createConnectedAccount } from '@/lib/stripe/connect';

/**
 * POST /api/connect/accounts
 * 
 * Request body:
 * {
 *   displayName: string,  // Business/display name
 *   contactEmail: string, // Contact email
 *   country?: string      // Optional: Country code (default: 'us')
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   accountId?: string,
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
    // STEP 2: Check if user already has a connected account
    // =======================================================================
    const { data: existingAccount } = await supabase
      .from('connected_accounts')
      .select('stripe_account_id')
      .eq('profile_id', user.id)
      .single();
    
    if (existingAccount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You already have a connected account.',
          accountId: existingAccount.stripe_account_id 
        },
        { status: 400 }
      );
    }
    
    // =======================================================================
    // STEP 3: Parse request body
    // =======================================================================
    const body = await request.json();
    const { displayName, contactEmail, country } = body;
    
    // Validate required fields
    if (!displayName || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'displayName and contactEmail are required.' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format.' },
        { status: 400 }
      );
    }
    
    // =======================================================================
    // STEP 4: Create the connected account with Stripe
    // =======================================================================
    const result = await createConnectedAccount({
      displayName,
      contactEmail,
      country: country || 'us',
    });
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create Stripe account.' },
        { status: 500 }
      );
    }
    
    // =======================================================================
    // STEP 5: Store the account mapping in the database
    // =======================================================================
    const { error: insertError } = await supabase
      .from('connected_accounts')
      .insert({
        profile_id: user.id,
        stripe_account_id: result.accountId,
        display_name: displayName,
        contact_email: contactEmail,
        onboarding_complete: false,
        charges_enabled: false,
        payouts_enabled: false,
      });
    
    if (insertError) {
      console.error('[Connect] Failed to save account to database:', insertError);
      // Note: The Stripe account was created but we failed to save it
      // In production, you might want to handle this more gracefully
      return NextResponse.json(
        { 
          success: true, 
          accountId: result.accountId,
          warning: 'Account created but failed to save to database. Please contact support.' 
        },
        { status: 201 }
      );
    }
    
    // =======================================================================
    // STEP 6: Return success response
    // =======================================================================
    return NextResponse.json(
      { 
        success: true, 
        accountId: result.accountId,
        message: 'Connected account created successfully. Complete onboarding to start accepting payments.' 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('[Connect] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/connect/accounts
 * 
 * Gets the current user's connected account information
 * 
 * Response:
 * {
 *   hasAccount: boolean,
 *   account?: {
 *     stripeAccountId: string,
 *     displayName: string,
 *     contactEmail: string,
 *     onboardingComplete: boolean,
 *     chargesEnabled: boolean,
 *     payoutsEnabled: boolean
 *   }
 * }
 */
export async function GET() {
  try {
    // Authenticate
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { hasAccount: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user's connected account
    const { data: account, error: fetchError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('profile_id', user.id)
      .single();
    
    if (fetchError || !account) {
      return NextResponse.json({ hasAccount: false });
    }
    
    return NextResponse.json({
      hasAccount: true,
      account: {
        stripeAccountId: account.stripe_account_id,
        displayName: account.display_name,
        contactEmail: account.contact_email,
        onboardingComplete: account.onboarding_complete,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    });
    
  } catch (error) {
    console.error('[Connect] Error fetching account:', error);
    return NextResponse.json(
      { hasAccount: false, error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

