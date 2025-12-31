// =============================================================================
// STRIPE CONNECT CLIENT MODULE
// =============================================================================
// This module provides all the functionality needed for Stripe Connect integration
// using the V2 Accounts API. It handles:
// - Creating connected accounts
// - Generating onboarding links
// - Checking account status
// - Managing products on connected accounts
// - Processing payments with application fees
//
// IMPORTANT: Before using this module, ensure you have:
// 1. A Stripe account with Connect enabled
// 2. The STRIPE_SECRET_KEY environment variable set
// 3. Accounts V2 enabled in your Stripe Dashboard (Settings > Product Previews)

import Stripe from 'stripe';

// =============================================================================
// STRIPE CLIENT INITIALIZATION
// =============================================================================

/**
 * Validates that the Stripe secret key is present.
 * Throws a helpful error if the key is missing.
 */
function validateStripeKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error(
      '[Stripe Connect] STRIPE_SECRET_KEY is not set.\n\n' +
      'To fix this:\n' +
      '1. Go to https://dashboard.stripe.com/apikeys\n' +
      '2. Copy your Secret key (starts with sk_test_ or sk_live_)\n' +
      '3. Add it to your .env.local file:\n' +
      '   STRIPE_SECRET_KEY=sk_test_your_key_here\n\n' +
      'Note: Use sk_test_ keys for development and sk_live_ keys for production.'
    );
  }
  
  return secretKey;
}

/**
 * Creates a new Stripe client instance.
 * The API version is automatically set by the SDK.
 * 
 * We create a new client for each request to ensure we always have
 * the latest configuration and avoid any potential state issues.
 */
export function createStripeClient(): Stripe {
  const secretKey = validateStripeKey();
  
  // Create a new Stripe client
  // The SDK automatically uses the latest API version (2025-12-15.clover)
  const stripeClient = new Stripe(secretKey, {
    typescript: true,
  });
  
  return stripeClient;
}

// Export a singleton instance for convenience
// Note: For server-side Next.js, this is safe as each request gets a fresh module context
export const stripeClient = createStripeClient();

// =============================================================================
// CONNECTED ACCOUNT TYPES
// =============================================================================

/**
 * Parameters for creating a new connected account
 */
export interface CreateConnectedAccountParams {
  /** Display name shown in the Stripe Dashboard */
  displayName: string;
  /** Contact email for the connected account */
  contactEmail: string;
  /** Country code (ISO 3166-1 alpha-2), defaults to 'us' */
  country?: string;
}

/**
 * Result from creating a connected account
 */
export interface ConnectedAccountResult {
  /** The Stripe account ID (starts with 'acct_') */
  accountId: string;
  /** Whether the account was successfully created */
  success: boolean;
  /** Error message if creation failed */
  error?: string;
}

/**
 * Status information for a connected account
 */
export interface AccountStatus {
  /** The Stripe account ID */
  accountId: string;
  /** Whether the account can process card payments */
  chargesEnabled: boolean;
  /** Whether the account can receive payouts */
  payoutsEnabled: boolean;
  /** Whether onboarding is complete (no currently_due or past_due requirements) */
  onboardingComplete: boolean;
  /** Current requirements status */
  requirementsStatus: 'complete' | 'currently_due' | 'past_due' | 'pending';
  /** Details about any pending requirements */
  pendingRequirements?: string[];
}

// =============================================================================
// CONNECTED ACCOUNT CREATION (V2 API)
// =============================================================================

/**
 * Creates a new connected account using the Stripe V2 Accounts API.
 * 
 * This uses the modern V2 API which provides:
 * - Unified account and customer representation
 * - Configurable merchant and customer capabilities
 * - Structured identity data
 * 
 * IMPORTANT: Do NOT use type: 'express' or type: 'standard' at the top level.
 * The V2 API uses configurations instead.
 * 
 * @param params - Account creation parameters
 * @returns The created account result with account ID
 * 
 * @example
 * ```typescript
 * const result = await createConnectedAccount({
 *   displayName: 'Acme Store',
 *   contactEmail: 'owner@acme.com',
 *   country: 'us'
 * });
 * 
 * if (result.success) {
 *   // Store result.accountId in your database
 *   console.log('Account created:', result.accountId);
 * }
 * ```
 */
export async function createConnectedAccount(
  params: CreateConnectedAccountParams
): Promise<ConnectedAccountResult> {
  try {
    const client = createStripeClient();
    
    // Create the connected account using V2 API
    // Note: We use v2.core.accounts.create() for the V2 Accounts API
    const account = await client.v2.core.accounts.create({
      // Display name shown in Stripe Dashboard and to the connected account
      display_name: params.displayName,
      
      // Contact email for the connected account
      contact_email: params.contactEmail,
      
      // Identity information - country is required
      // Note: Country must be a valid 2-letter ISO country code
      identity: {
        country: (params.country || 'us') as 'us' | 'gb' | 'ca' | 'au' | 'de' | 'fr' | 'nl' | 'be' | 'at' | 'ch' | 'dk' | 'fi' | 'ie' | 'it' | 'lu' | 'no' | 'pt' | 'es' | 'se' | 'nz' | 'sg' | 'hk' | 'jp' | 'mx' | 'br',
      },
      
      // Dashboard access level:
      // - 'full': Full Stripe Dashboard access (recommended for most use cases)
      // - 'express': Limited Express Dashboard
      // - 'none': No dashboard access
      dashboard: 'full',
      
      // Default responsibilities for the platform
      defaults: {
        responsibilities: {
          // Who collects Stripe fees:
          // - 'stripe': Stripe collects fees directly from the connected account
          // - 'application': Platform collects fees, then pays Stripe
          fees_collector: 'stripe',
          
          // Who is responsible for negative balances:
          // - 'stripe': Stripe handles losses (requires approval)
          // - 'application': Platform is responsible for negative balances
          losses_collector: 'stripe',
        },
      },
      
      // Configuration for different use cases
      configuration: {
        // Customer configuration: Allows the account to pay the platform (subscriptions)
        // This is needed if you want to charge the connected account for platform fees
        customer: {},
        
        // Merchant configuration: Allows the account to accept payments
        merchant: {
          capabilities: {
            // Request card payment capability
            // This must be requested for the account to accept card payments
            card_payments: {
              requested: true,
            },
          },
        },
      },
    });
    
    return {
      accountId: account.id,
      success: true,
    };
    
  } catch (error) {
    console.error('[Stripe Connect] Failed to create account:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error creating connected account';
    
    return {
      accountId: '',
      success: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// ACCOUNT ONBOARDING (V2 API)
// =============================================================================

/**
 * Creates an account link for onboarding a connected account.
 * 
 * The account link is a hosted page where the connected account owner
 * can complete verification and provide required information.
 * 
 * @param accountId - The Stripe account ID (starts with 'acct_')
 * @param refreshUrl - URL to redirect if the link expires (user should be able to get a new link)
 * @param returnUrl - URL to redirect after successful onboarding
 * @returns The account link URL
 * 
 * @example
 * ```typescript
 * const linkUrl = await createAccountOnboardingLink(
 *   'acct_123',
 *   'https://myapp.com/connect/refresh',
 *   'https://myapp.com/connect/return'
 * );
 * 
 * // Redirect the user to linkUrl
 * ```
 */
export async function createAccountOnboardingLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  const client = createStripeClient();
  
  // Create an account link using V2 API
  const accountLink = await client.v2.core.accountLinks.create({
    // The connected account to onboard
    account: accountId,
    
    // Use case configuration
    use_case: {
      // Type of account link
      type: 'account_onboarding',
      
      // Onboarding-specific options
      account_onboarding: {
        // Which configurations to collect information for
        // 'merchant': Collect info needed for accepting payments
        // 'customer': Collect info needed for the account to pay the platform
        configurations: ['merchant', 'customer'],
        
        // URL to redirect if the link expires or user needs to restart
        // Your app should generate a new link when this URL is hit
        refresh_url: refreshUrl,
        
        // URL to redirect after successful completion
        // Include the accountId so you know which account completed onboarding
        return_url: `${returnUrl}?accountId=${accountId}`,
      },
    },
  });
  
  return accountLink.url;
}

// =============================================================================
// ACCOUNT STATUS (V2 API)
// =============================================================================

/**
 * Retrieves the current status of a connected account.
 * 
 * This checks:
 * - Whether card payments capability is active
 * - Whether there are outstanding requirements
 * - The overall onboarding status
 * 
 * IMPORTANT: Always fetch status from the API directly for accurate information.
 * Do not rely solely on cached values in your database.
 * 
 * @param accountId - The Stripe account ID
 * @returns The account status
 * 
 * @example
 * ```typescript
 * const status = await getAccountStatus('acct_123');
 * 
 * if (status.chargesEnabled) {
 *   console.log('Account can process payments!');
 * }
 * 
 * if (!status.onboardingComplete) {
 *   console.log('Requirements pending:', status.pendingRequirements);
 * }
 * ```
 */
export async function getAccountStatus(accountId: string): Promise<AccountStatus> {
  const client = createStripeClient();
  
  // Retrieve the account with expanded configuration and requirements
  // The 'include' parameter specifies which nested objects to populate
  const account = await client.v2.core.accounts.retrieve(accountId, {
    include: ['configuration.merchant', 'requirements'],
  });
  
  // Check if card payments capability is active
  // This is the key indicator that the account can process payments
  const chargesEnabled = 
    account?.configuration?.merchant?.capabilities?.card_payments?.status === 'active';
  
  // Get the requirements status
  // Possible values: 'complete', 'currently_due', 'past_due', 'pending'
  const requirementsStatus = 
    account.requirements?.summary?.minimum_deadline?.status;
  
  // Onboarding is complete when there are no currently_due or past_due requirements
  const onboardingComplete = 
    requirementsStatus !== 'currently_due' && 
    requirementsStatus !== 'past_due';
  
  // Get any pending requirements for display to the user
  // These are fields the user still needs to provide
  // Note: The exact structure depends on the Stripe API version
  const entries = account.requirements?.entries as Array<{
    state?: string;
    acquirer_reference_number?: string;
    type?: string;
  }> | undefined;
  
  const pendingRequirements = entries
    ?.filter(entry => entry.state === 'required' || entry.state === 'optional')
    ?.map(entry => entry.acquirer_reference_number || entry.type || 'Unknown requirement')
    ?? [];
  
  return {
    accountId,
    chargesEnabled,
    // Note: payoutsEnabled would need to check the recipient configuration
    // For simplicity, we tie it to charges_enabled in this example
    payoutsEnabled: chargesEnabled,
    onboardingComplete,
    requirementsStatus: (requirementsStatus || 'pending') as AccountStatus['requirementsStatus'],
    pendingRequirements: pendingRequirements.length > 0 ? pendingRequirements : undefined,
  };
}

// =============================================================================
// PRODUCT MANAGEMENT ON CONNECTED ACCOUNTS
// =============================================================================

/**
 * Parameters for creating a product on a connected account
 */
export interface CreateProductParams {
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Price in cents (e.g., 1999 for $19.99) */
  priceInCents: number;
  /** Currency code (e.g., 'usd') */
  currency?: string;
}

/**
 * Product with price information
 */
export interface ProductWithPrice {
  id: string;
  name: string;
  description: string | null;
  priceId: string;
  priceInCents: number;
  currency: string;
  active: boolean;
}

/**
 * Creates a product on a connected account.
 * 
 * This creates both the product and a default price in a single call.
 * The product will be owned by the connected account, not the platform.
 * 
 * @param accountId - The connected account ID
 * @param params - Product creation parameters
 * @returns The created product with price
 * 
 * @example
 * ```typescript
 * const product = await createProductOnConnectedAccount('acct_123', {
 *   name: 'Premium Widget',
 *   description: 'Our best widget yet',
 *   priceInCents: 2999,
 *   currency: 'usd'
 * });
 * ```
 */
export async function createProductOnConnectedAccount(
  accountId: string,
  params: CreateProductParams
): Promise<ProductWithPrice> {
  const client = createStripeClient();
  
  // Create the product on the connected account
  // The stripeAccount option adds the Stripe-Account header to the request
  const product = await client.products.create(
    {
      name: params.name,
      description: params.description,
      // Create a default price along with the product
      default_price_data: {
        // Price in smallest currency unit (cents for USD)
        unit_amount: params.priceInCents,
        currency: params.currency || 'usd',
      },
    },
    {
      // This header makes the request on behalf of the connected account
      // The product will be created in their account, not the platform's
      stripeAccount: accountId,
    }
  );
  
  // Get the price details
  const price = product.default_price as Stripe.Price;
  
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceId: price.id,
    priceInCents: price.unit_amount || 0,
    currency: price.currency,
    active: product.active,
  };
}

/**
 * Lists all active products for a connected account.
 * 
 * @param accountId - The connected account ID
 * @param limit - Maximum number of products to return (default: 20)
 * @returns List of products with their prices
 * 
 * @example
 * ```typescript
 * const products = await listProductsOnConnectedAccount('acct_123');
 * products.forEach(p => console.log(`${p.name}: $${p.priceInCents / 100}`));
 * ```
 */
export async function listProductsOnConnectedAccount(
  accountId: string,
  limit: number = 20
): Promise<ProductWithPrice[]> {
  const client = createStripeClient();
  
  // List products from the connected account
  const products = await client.products.list(
    {
      limit,
      active: true,
      // Expand the default_price to get price details in the same request
      expand: ['data.default_price'],
    },
    {
      // Make the request on behalf of the connected account
      stripeAccount: accountId,
    }
  );
  
  // Transform to our ProductWithPrice format
  return products.data
    .filter(product => product.default_price) // Only include products with prices
    .map(product => {
      const price = product.default_price as Stripe.Price;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        priceId: price.id,
        priceInCents: price.unit_amount || 0,
        currency: price.currency,
        active: product.active,
      };
    });
}

// =============================================================================
// CHECKOUT AND PAYMENTS
// =============================================================================

/**
 * Parameters for creating a checkout session
 */
export interface CreateCheckoutParams {
  /** The connected account ID */
  accountId: string;
  /** Price ID to charge */
  priceId: string;
  /** Quantity to purchase */
  quantity?: number;
  /** Application fee in cents (platform's cut) */
  applicationFeeAmount?: number;
  /** Success URL after payment */
  successUrl: string;
  /** Cancel URL if user cancels */
  cancelUrl: string;
}

/**
 * Creates a checkout session for a direct charge to a connected account.
 * 
 * Direct charges mean:
 * - The payment is processed on the connected account
 * - The connected account's branding appears on receipts
 * - The platform can take an application fee
 * 
 * @param params - Checkout session parameters
 * @returns The checkout session URL
 * 
 * @example
 * ```typescript
 * const checkoutUrl = await createCheckoutSession({
 *   accountId: 'acct_123',
 *   priceId: 'price_abc',
 *   quantity: 1,
 *   applicationFeeAmount: 100, // $1.00 platform fee
 *   successUrl: 'https://myapp.com/success?session_id={CHECKOUT_SESSION_ID}',
 *   cancelUrl: 'https://myapp.com/cancel'
 * });
 * 
 * // Redirect customer to checkoutUrl
 * ```
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<string> {
  const client = createStripeClient();
  
  // Create a checkout session on the connected account
  const session = await client.checkout.sessions.create(
    {
      // Line items to purchase
      line_items: [
        {
          price: params.priceId,
          quantity: params.quantity || 1,
        },
      ],
      
      // Payment intent data for the charge
      payment_intent_data: {
        // Application fee is the platform's cut of each transaction
        // This amount goes to your platform account
        application_fee_amount: params.applicationFeeAmount,
      },
      
      // Mode: 'payment' for one-time payments, 'subscription' for recurring
      mode: 'payment',
      
      // Success URL - use {CHECKOUT_SESSION_ID} placeholder for the session ID
      success_url: params.successUrl,
      
      // Cancel URL - where to redirect if user cancels
      cancel_url: params.cancelUrl,
    },
    {
      // Process this on the connected account
      stripeAccount: params.accountId,
    }
  );
  
  // Return the checkout URL
  if (!session.url) {
    throw new Error('Checkout session created but no URL returned');
  }
  
  return session.url;
}

// =============================================================================
// PLATFORM SUBSCRIPTIONS (Charging Connected Accounts)
// =============================================================================

/**
 * Parameters for creating a subscription checkout for a connected account
 */
export interface CreatePlatformSubscriptionParams {
  /** The connected account ID (will be used as customer_account) */
  accountId: string;
  /** The price ID for the subscription */
  priceId: string;
  /** Success URL after subscription */
  successUrl: string;
  /** Cancel URL if user cancels */
  cancelUrl: string;
}

/**
 * Creates a checkout session for a platform subscription.
 * 
 * This allows the platform to charge connected accounts for SaaS fees.
 * With V2 accounts, we use customer_account instead of customer.
 * 
 * @param params - Subscription parameters
 * @returns The checkout session URL
 * 
 * @example
 * ```typescript
 * const checkoutUrl = await createPlatformSubscriptionCheckout({
 *   accountId: 'acct_123',
 *   priceId: 'price_platform_monthly',
 *   successUrl: 'https://myapp.com/subscription/success',
 *   cancelUrl: 'https://myapp.com/subscription/cancel'
 * });
 * ```
 */
export async function createPlatformSubscriptionCheckout(
  params: CreatePlatformSubscriptionParams
): Promise<string> {
  const client = createStripeClient();
  
  // Validate that we have a platform subscription price
  if (!params.priceId) {
    throw new Error(
      '[Stripe Connect] Platform subscription price ID is not set.\n\n' +
      'To fix this:\n' +
      '1. Create a subscription product in Stripe Dashboard\n' +
      '2. Create a recurring price for that product\n' +
      '3. Set the price ID in your environment or pass it to this function'
    );
  }
  
  // Create checkout session for the subscription
  // Note: We use customer_account for V2 accounts, NOT customer
  const session = await client.checkout.sessions.create({
    // For V2 accounts, use customer_account instead of customer
    // This is the connected account ID (acct_xxx)
    customer_account: params.accountId,
    
    // Subscription mode for recurring payments
    mode: 'subscription',
    
    // The subscription items
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    
    // Redirect URLs
    success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: params.cancelUrl,
  });
  
  if (!session.url) {
    throw new Error('Subscription checkout session created but no URL returned');
  }
  
  return session.url;
}

/**
 * Creates a billing portal session for a connected account.
 * 
 * The billing portal allows the connected account to:
 * - View their subscription details
 * - Update payment methods
 * - Cancel their subscription
 * 
 * @param accountId - The connected account ID
 * @param returnUrl - URL to return to after the portal session
 * @returns The billing portal URL
 * 
 * @example
 * ```typescript
 * const portalUrl = await createBillingPortalSession(
 *   'acct_123',
 *   'https://myapp.com/dashboard'
 * );
 * ```
 */
export async function createBillingPortalSession(
  accountId: string,
  returnUrl: string
): Promise<string> {
  const client = createStripeClient();
  
  // Create a billing portal session
  // Note: For V2 accounts, use customer_account instead of customer
  const session = await client.billingPortal.sessions.create({
    // The connected account that will access the portal
    customer_account: accountId,
    
    // Where to redirect after the user exits the portal
    return_url: returnUrl,
  });
  
  return session.url;
}

// =============================================================================
// WEBHOOK HELPERS
// =============================================================================

/**
 * Thin event structure from Stripe webhooks.
 * This is the lightweight notification that arrives at your webhook endpoint.
 */
export interface ThinEvent {
  id: string;
  type: string;
  related_object?: {
    id: string;
    type: string;
  };
}

/**
 * Parses a thin event from a webhook payload.
 * 
 * Thin events are lightweight notifications that only include the event ID
 * and type. You must fetch the full event data separately.
 * 
 * @param payload - The raw request body
 * @param signature - The Stripe-Signature header value
 * @param webhookSecret - Your webhook signing secret
 * @returns The parsed thin event
 */
export function parseThinEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): ThinEvent {
  const client = createStripeClient();
  
  // Parse the thin event with signature verification
  // Note: parseThinEvent is available in stripe SDK v20+
  const thinEvent = (client as unknown as {
    parseThinEvent: (payload: string | Buffer, signature: string, secret: string) => ThinEvent;
  }).parseThinEvent(payload, signature, webhookSecret);
  
  return thinEvent;
}

/**
 * Full event structure from Stripe V2 events API.
 */
export interface FullEvent {
  id: string;
  type: string;
  data?: unknown;
  related_object?: {
    id: string;
    type: string;
  };
}

/**
 * Retrieves the full event data for a thin event.
 * 
 * @param eventId - The event ID from the thin event
 * @returns The full event object with all data
 */
export async function getFullEvent(eventId: string): Promise<FullEvent> {
  const client = createStripeClient();
  
  // Fetch the complete event data
  const event = await client.v2.core.events.retrieve(eventId);
  
  return event as unknown as FullEvent;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Platform subscription price ID.
 * 
 * PLACEHOLDER: Replace with your actual subscription price ID.
 * You can create this in the Stripe Dashboard or via the API.
 * 
 * This price was created for this demo:
 * - Product: Platform Subscription - Pro
 * - Price: $29.99/month
 * - Price ID: price_1SkRgF1fCsdgIc4sxIsnETEp
 */
export const PLATFORM_SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID 
  || 'price_1SkRgF1fCsdgIc4sxIsnETEp'; // TODO: Replace with your price ID or set env var

/**
 * Default application fee percentage (as a decimal).
 * For example, 0.10 = 10% platform fee.
 */
export const DEFAULT_APPLICATION_FEE_PERCENT = 0.10;

/**
 * Calculates the application fee for a given amount.
 * 
 * @param amountInCents - The total amount in cents
 * @param feePercent - The fee percentage (default: 10%)
 * @returns The fee amount in cents
 */
export function calculateApplicationFee(
  amountInCents: number,
  feePercent: number = DEFAULT_APPLICATION_FEE_PERCENT
): number {
  return Math.round(amountInCents * feePercent);
}

