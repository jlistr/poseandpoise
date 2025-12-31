// =============================================================================
// STRIPE CHECKOUT SESSION API
// =============================================================================
// Creates a Stripe Checkout session for subscription purchases

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, getPriceId, type PlanId, type BillingInterval } from '@/lib/stripe';

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
    const { planId, interval = 'monthly' } = await request.json() as {
      planId: PlanId;
      interval?: BillingInterval;
    };
    
    // Validate plan
    if (!planId || planId === 'FREE') {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }
    
    // Get price ID
    const priceId = getPriceId(planId, interval);
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 400 }
      );
    }
    
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
      
      // Store customer ID
      await supabase
        .from('subscriptions')
        .upsert({
          profile_id: user.id,
          stripe_customer_id: stripeCustomerId,
          status: 'none',
          tier: 'FREE',
        }, { onConflict: 'profile_id' });
    }
    
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?subscription=cancelled`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
        },
        trial_period_days: 14, // 14-day free trial
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });
    
    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

