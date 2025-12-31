// =============================================================================
// API ROUTE: CONNECTED ACCOUNT CHECKOUT
// =============================================================================
// POST /api/connect/checkout
// Creates a checkout session for purchasing from a connected account
//
// This implements DIRECT CHARGES with application fees:
// - The payment is processed on the connected account
// - The connected account's branding appears on receipts
// - The platform takes an application fee

import { NextResponse } from 'next/server';
import { 
  createCheckoutSession, 
  calculateApplicationFee,
  DEFAULT_APPLICATION_FEE_PERCENT 
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
 * POST /api/connect/checkout
 * 
 * Creates a checkout session for a direct charge to a connected account.
 * 
 * Request body:
 * {
 *   accountId: string,        // The connected account ID
 *   priceId: string,          // The price ID to charge
 *   quantity?: number,        // Quantity (default: 1)
 *   applicationFeeAmount?: number, // Optional: override the application fee
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   url?: string,             // Checkout URL to redirect the customer to
 *   sessionId?: string,       // The checkout session ID
 *   error?: string
 * }
 * 
 * USAGE EXAMPLE:
 * ```javascript
 * // On your storefront page
 * const response = await fetch('/api/connect/checkout', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     accountId: 'acct_123',
 *     priceId: 'price_abc',
 *     quantity: 1
 *   })
 * });
 * 
 * const { url } = await response.json();
 * window.location.href = url; // Redirect to Stripe Checkout
 * ```
 */
export async function POST(request: Request) {
  try {
    // =======================================================================
    // STEP 1: Parse and validate request body
    // =======================================================================
    const body = await request.json();
    const { accountId, priceId, quantity, applicationFeeAmount, priceInCents } = body;
    
    // Validate required fields
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'accountId is required.' },
        { status: 400 }
      );
    }
    
    if (!accountId.startsWith('acct_')) {
      return NextResponse.json(
        { success: false, error: 'Invalid accountId format. Must start with acct_' },
        { status: 400 }
      );
    }
    
    if (!priceId) {
      return NextResponse.json(
        { success: false, error: 'priceId is required.' },
        { status: 400 }
      );
    }
    
    // =======================================================================
    // STEP 2: Calculate application fee
    // =======================================================================
    // The application fee is what the platform earns from each transaction.
    // You can either:
    // 1. Pass a specific applicationFeeAmount in the request
    // 2. Calculate it based on a percentage of the price
    // 3. Use a fixed fee
    
    let finalApplicationFee: number;
    
    if (applicationFeeAmount !== undefined) {
      // Use the provided fee
      finalApplicationFee = applicationFeeAmount;
    } else if (priceInCents) {
      // Calculate based on the provided price
      // Default: 10% of the transaction
      finalApplicationFee = calculateApplicationFee(priceInCents);
    } else {
      // If no price provided, we'll use a minimum fee
      // In a real app, you'd want to fetch the price from Stripe
      // or require the priceInCents to be provided
      finalApplicationFee = calculateApplicationFee(1000); // $10 default for demo
    }
    
    // =======================================================================
    // STEP 3: Build checkout URLs
    // =======================================================================
    const baseUrl = getBaseUrl();
    
    // Success URL with session ID placeholder
    // {CHECKOUT_SESSION_ID} is replaced by Stripe with the actual session ID
    const successUrl = `${baseUrl}/store/${accountId}/success?session_id={CHECKOUT_SESSION_ID}`;
    
    // Cancel URL - return to the storefront
    const cancelUrl = `${baseUrl}/store/${accountId}`;
    
    // =======================================================================
    // STEP 4: Create the checkout session
    // =======================================================================
    const checkoutUrl = await createCheckoutSession({
      accountId,
      priceId,
      quantity: quantity || 1,
      applicationFeeAmount: finalApplicationFee,
      successUrl,
      cancelUrl,
    });
    
    // =======================================================================
    // STEP 5: Return the checkout URL
    // =======================================================================
    return NextResponse.json({
      success: true,
      url: checkoutUrl,
      // Note: The session ID is embedded in the URL
      message: 'Redirect the customer to the checkout URL.',
      applicationFeeAmount: finalApplicationFee,
      applicationFeePercent: DEFAULT_APPLICATION_FEE_PERCENT * 100, // e.g., 10
    });
    
  } catch (error) {
    console.error('[Connect Checkout] Error creating session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: `Failed to create checkout: ${errorMessage}` },
      { status: 500 }
    );
  }
}

