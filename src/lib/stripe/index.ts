// =============================================================================
// STRIPE CONFIGURATION
// =============================================================================

import Stripe from 'stripe';

// Lazy-initialized Stripe instance to avoid build-time errors
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// Server-side Stripe instance (use in API routes only)
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

// =============================================================================
// PRICE LOOKUP KEYS - Map to your Stripe Dashboard price lookup keys
// =============================================================================
export const PRICE_LOOKUP_KEYS = {
  PROFESSIONAL: {
    monthly: 'professional_monthly',
    yearly: 'professional_annual',
  },
  DELUXE: {
    monthly: 'deluxe_monthly',
    yearly: 'deluxe_annual',
  },
} as const;

// Legacy: Environment-based price IDs (for backward compatibility)
export const STRIPE_PRICES = {
  PROFESSIONAL: {
    monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID!,
  },
  DELUXE: {
    monthly: process.env.STRIPE_DELUXE_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_DELUXE_YEARLY_PRICE_ID!,
  },
} as const;

// =============================================================================
// TRIAL CONFIGURATION
// =============================================================================
export const TRIAL_PERIOD_DAYS = 7;

// =============================================================================
// PLAN CONFIGURATION
// =============================================================================
export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Up to 10 portfolio images',
      'Subdomain portfolio URL',
      'Basic comp card generator',
      'Portfolio analytics',
      'Read community posts',
    ],
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professional',
    description: 'For serious models building their career',
    price: { monthly: 20, yearly: 200 },
    features: [
      'Everything in Free',
      'Up to 50 portfolio images',
      'All comp card templates',
      'PDF export',
      'Priority support',
      'Read & write community posts',
    ],
  },
  DELUXE: {
    id: 'DELUXE',
    name: 'Deluxe',
    description: 'For professionals who want it all',
    price: { monthly: 30, yearly: 300 },
    features: [
      'Everything in Professional',
      'Unlimited portfolio images',
      'Advanced analytics insights',
      'Custom domain support',
      'Central message hub',
      'SMS notifications',
      'Calendar & event planning',
      'Promote photographers & agencies',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingInterval = 'monthly' | 'yearly';

// =============================================================================
// HELPER: Get Price Lookup Key for a plan and interval
// =============================================================================
export function getPriceLookupKey(planId: PlanId, interval: BillingInterval): string | null {
  if (planId === 'FREE') return null;
  return PRICE_LOOKUP_KEYS[planId]?.[interval] || null;
}

// =============================================================================
// CACHED PRICE IDS - Avoid repeated API calls
// =============================================================================
const priceIdCache: Map<string, string> = new Map();
let cacheInitialized = false;

// Initialize cache by fetching all prices at once
async function initializePriceCache(): Promise<void> {
  if (cacheInitialized) return;
  
  const allLookupKeys = [
    PRICE_LOOKUP_KEYS.PROFESSIONAL.monthly,
    PRICE_LOOKUP_KEYS.PROFESSIONAL.yearly,
    PRICE_LOOKUP_KEYS.DELUXE.monthly,
    PRICE_LOOKUP_KEYS.DELUXE.yearly,
  ];
  
  try {
    const prices = await stripe.prices.list({
      lookup_keys: allLookupKeys,
      active: true,
      limit: 10,
    });
    
    for (const price of prices.data) {
      if (price.lookup_key) {
        priceIdCache.set(price.lookup_key, price.id);
      }
    }
    
    cacheInitialized = true;
    console.log('[Stripe] Price cache initialized:', Object.fromEntries(priceIdCache));
  } catch (error) {
    console.error('[Stripe] Failed to initialize price cache:', error);
  }
}

// Get cached price ID for a lookup key
export async function getCachedPriceId(lookupKey: string): Promise<string | null> {
  // Check cache first
  if (priceIdCache.has(lookupKey)) {
    return priceIdCache.get(lookupKey)!;
  }
  
  // Initialize cache if not done
  if (!cacheInitialized) {
    await initializePriceCache();
    if (priceIdCache.has(lookupKey)) {
      return priceIdCache.get(lookupKey)!;
    }
  }
  
  // Fallback: single lookup (shouldn't happen if cache worked)
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  
  if (prices.data.length > 0) {
    priceIdCache.set(lookupKey, prices.data[0].id);
    return prices.data[0].id;
  }
  
  return null;
}

// =============================================================================
// HELPER: Get Price ID for a plan and interval (legacy, uses env vars)
// =============================================================================
export function getPriceId(planId: PlanId, interval: BillingInterval): string | null {
  if (planId === 'FREE') return null;
  return STRIPE_PRICES[planId]?.[interval] || null;
}

// =============================================================================
// HELPER: Map Stripe Price lookup key to internal tier
// =============================================================================
export function getTierFromLookupKey(lookupKey: string): PlanId {
  // Check Professional prices
  if (
    lookupKey === PRICE_LOOKUP_KEYS.PROFESSIONAL.monthly ||
    lookupKey === PRICE_LOOKUP_KEYS.PROFESSIONAL.yearly
  ) {
    return 'PROFESSIONAL';
  }
  
  // Check Deluxe prices
  if (
    lookupKey === PRICE_LOOKUP_KEYS.DELUXE.monthly ||
    lookupKey === PRICE_LOOKUP_KEYS.DELUXE.yearly
  ) {
    return 'DELUXE';
  }
  
  // Default to FREE
  return 'FREE';
}

// =============================================================================
// HELPER: Map Stripe Price ID to internal tier (legacy)
// =============================================================================
export function getTierFromPriceId(priceId: string): PlanId {
  // Check Professional prices
  if (
    priceId === STRIPE_PRICES.PROFESSIONAL.monthly ||
    priceId === STRIPE_PRICES.PROFESSIONAL.yearly
  ) {
    return 'PROFESSIONAL';
  }
  
  // Check Deluxe prices
  if (
    priceId === STRIPE_PRICES.DELUXE.monthly ||
    priceId === STRIPE_PRICES.DELUXE.yearly
  ) {
    return 'DELUXE';
  }
  
  // Default to FREE
  return 'FREE';
}

