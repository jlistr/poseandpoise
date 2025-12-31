// =============================================================================
// API ROUTE: CONNECTED ACCOUNT PRODUCTS
// =============================================================================
// POST /api/connect/products - Create a product on a connected account
// GET /api/connect/products?accountId=acct_xxx - List products for an account
//
// Products are created on the connected account, not the platform.
// This allows each seller/merchant to have their own product catalog.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  createProductOnConnectedAccount, 
  listProductsOnConnectedAccount 
} from '@/lib/stripe/connect';

/**
 * POST /api/connect/products
 * 
 * Creates a new product on a connected account.
 * 
 * Request body:
 * {
 *   accountId?: string,    // Optional: defaults to user's connected account
 *   name: string,          // Product name
 *   description?: string,  // Product description
 *   priceInCents: number,  // Price in cents (e.g., 1999 for $19.99)
 *   currency?: string      // Currency code (default: 'usd')
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   product?: {
 *     id: string,
 *     name: string,
 *     description: string | null,
 *     priceId: string,
 *     priceInCents: number,
 *     currency: string,
 *     active: boolean
 *   },
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
    // STEP 2: Parse and validate request body
    // =======================================================================
    const body = await request.json();
    const { accountId: providedAccountId, name, description, priceInCents, currency } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Product name is required.' },
        { status: 400 }
      );
    }
    
    if (!priceInCents || typeof priceInCents !== 'number' || priceInCents < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid priceInCents is required (must be a positive number).' },
        { status: 400 }
      );
    }
    
    // =======================================================================
    // STEP 3: Get or verify the account ID
    // =======================================================================
    let accountId: string;
    
    if (providedAccountId) {
      // Verify the user owns this account
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('stripe_account_id, charges_enabled')
        .eq('profile_id', user.id)
        .eq('stripe_account_id', providedAccountId)
        .single();
      
      if (!account) {
        return NextResponse.json(
          { success: false, error: 'Account not found or not authorized.' },
          { status: 403 }
        );
      }
      
      accountId = account.stripe_account_id;
    } else {
      // Get the user's connected account
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('stripe_account_id, charges_enabled')
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
    // STEP 4: Create the product on the connected account
    // =======================================================================
    const product = await createProductOnConnectedAccount(accountId, {
      name,
      description,
      priceInCents,
      currency: currency || 'usd',
    });
    
    // =======================================================================
    // STEP 5: Return the created product
    // =======================================================================
    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
    
  } catch (error) {
    console.error('[Connect Products] Error creating product:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: `Failed to create product: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/connect/products
 * 
 * Lists products for a connected account.
 * 
 * Query parameters:
 * - accountId: (optional) The Stripe account ID. If not provided, uses the user's account.
 * - limit: (optional) Maximum number of products (default: 20)
 * 
 * Response:
 * {
 *   products: Array<{
 *     id: string,
 *     name: string,
 *     description: string | null,
 *     priceId: string,
 *     priceInCents: number,
 *     currency: string,
 *     active: boolean
 *   }>
 * }
 */
export async function GET(request: Request) {
  try {
    // =======================================================================
    // STEP 1: Get query parameters
    // =======================================================================
    const { searchParams } = new URL(request.url);
    const providedAccountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    let accountId: string;
    
    // =======================================================================
    // STEP 2: Determine the account ID
    // =======================================================================
    if (providedAccountId) {
      // Use the provided account ID
      // Note: For public storefronts, you might not require authentication
      // But you should validate the account ID format
      if (!providedAccountId.startsWith('acct_')) {
        return NextResponse.json(
          { error: 'Invalid account ID format.' },
          { status: 400 }
        );
      }
      
      accountId = providedAccountId;
    } else {
      // Require authentication if no account ID provided
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Please provide an accountId or sign in.' },
          { status: 400 }
        );
      }
      
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
      
      accountId = account.stripe_account_id;
    }
    
    // =======================================================================
    // STEP 3: Fetch products from the connected account
    // =======================================================================
    const products = await listProductsOnConnectedAccount(accountId, limit);
    
    // =======================================================================
    // STEP 4: Return the products
    // =======================================================================
    return NextResponse.json({ products });
    
  } catch (error) {
    console.error('[Connect Products] Error listing products:', error);
    
    return NextResponse.json(
      { error: 'Failed to list products.' },
      { status: 500 }
    );
  }
}

