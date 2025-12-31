'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  stripe, 
  getPriceLookupKey,
  getCachedPriceId,
  TRIAL_PERIOD_DAYS,
  type PlanId, 
  type BillingInterval 
} from '@/lib/stripe';
import { redirect } from 'next/navigation';

// =============================================================================
// CREATE CHECKOUT SESSION
// =============================================================================
export async function createCheckoutSession(planId: PlanId, interval: BillingInterval = 'monthly') {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login?redirect=/pricing');
  }
  
  // Validate plan
  if (!planId || planId === 'FREE') {
    return { error: 'Invalid plan selected' };
  }
  
  // Get price lookup key
  const lookupKey = getPriceLookupKey(planId, interval);
  
  if (!lookupKey) {
    return { error: 'Price not configured for this plan' };
  }
  
  try {
    // Run price lookup and subscription lookup in parallel for speed
    const [priceId, { data: subscription }] = await Promise.all([
      getCachedPriceId(lookupKey),
      supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('profile_id', user.id)
        .single()
    ]);
    
    if (!priceId) {
      console.error(`[Stripe] No price found for lookup_key: ${lookupKey}`);
      return { 
        error: `Stripe price "${lookupKey}" not found. Please create the products in your Stripe Dashboard with the correct lookup keys.` 
      };
    }
    
    let stripeCustomerId = subscription?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;
      
      // Store customer ID (fire-and-forget - don't block checkout)
      supabase
        .from('subscriptions')
        .upsert({
          profile_id: user.id,
          stripe_customer_id: stripeCustomerId,
          status: 'active',
          plan_id: 'FREE',
        }, { onConflict: 'profile_id' })
        .then(({ error }) => {
          if (error) console.error('Failed to store customer ID:', error);
        });
    }
    
    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;
    
    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
        },
        trial_period_days: TRIAL_PERIOD_DAYS,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });
    
    return { url: checkoutSession.url };
    
  } catch (error) {
    console.error('Checkout error:', error);
    // Return actual error message for debugging
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return { error: message };
  }
}

// =============================================================================
// GET CURRENT SUBSCRIPTION
// =============================================================================
export async function getCurrentSubscription() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, status, current_period_end, cancel_at_period_end')
    .eq('profile_id', user.id)
    .single();
  
  return subscription;
}

