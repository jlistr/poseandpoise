// =============================================================================
// STRIPE CHECKOUT SESSION API
// =============================================================================
// Creates a Stripe Checkout session for subscription purchases with 7-day trial

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  stripe, 
  getPriceLookupKey, 
  TRIAL_PERIOD_DAYS,
  type PlanId, 
  type BillingInterval 
} from '@/lib/stripe';

interface CheckoutRequestBody {
  priceId: PlanId;
  billingCycle: BillingInterval;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json() as CheckoutRequestBody;
    const { priceId, billingCycle = 'monthly' } = body;
    
    // Validate plan
    if (!priceId || priceId === 'FREE') {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }
    
    // Get price lookup key
    const lookupKey = getPriceLookupKey(priceId, billingCycle);
    
    if (!lookupKey) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 400 }
      );
    }
    
    // Look up the price by lookup_key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      limit: 1,
    });
    
    if (prices.data.length === 0) {
      return NextResponse.json(
        { error: `Price not found for lookup key: ${lookupKey}` },
        { status: 400 }
      );
    }
    
    const price = prices.data[0];
    
    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', user.id)
      .single();
    
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
      
      // Store customer ID in subscriptions table
      await supabase
        .from('subscriptions')
        .upsert({
          profile_id: user.id,
          stripe_customer_id: stripeCustomerId,
          status: 'active',
          plan_id: 'FREE',
          tier: 'FREE', // Required for trigger to update profiles.subscription_tier
        }, { onConflict: 'profile_id' });
    }
    
    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/settings/billing?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/settings/billing?canceled=true`;
    
    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: {
          supabase_user_id: user.id,
          plan_id: priceId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        supabase_user_id: user.id,
      },
    });
    
    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

