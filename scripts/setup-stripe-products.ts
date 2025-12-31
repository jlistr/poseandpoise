#!/usr/bin/env npx tsx
// =============================================================================
// STRIPE PRODUCTS SETUP SCRIPT
// =============================================================================
// Run with: npx tsx scripts/setup-stripe-products.ts
// 
// This script creates the required products and prices in your Stripe account
// with the correct lookup keys for the subscription system.

import { readFileSync } from 'fs';
import { resolve } from 'path';
import Stripe from 'stripe';

// Load environment variables from .env.local manually
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // .env.local not found, continue with existing env vars
  }
}

loadEnvFile();

// Check for required environment variable
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('\nEither set it in your .env.local file or run with:');
  console.log('STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/setup-stripe-products.ts');
  process.exit(1);
}

const stripe = new Stripe(secretKey, {
  apiVersion: '2025-12-15.clover',
});

interface PlanConfig {
  name: string;
  description: string;
  prices: {
    monthly: { amount: number; lookupKey: string };
    yearly: { amount: number; lookupKey: string };
  };
}

const PLANS: PlanConfig[] = [
  {
    name: 'Professional',
    description: 'For serious models building their career',
    prices: {
      monthly: { amount: 2000, lookupKey: 'professional_monthly' },  // $20.00
      yearly: { amount: 20000, lookupKey: 'professional_annual' },   // $200.00
    },
  },
  {
    name: 'Deluxe',
    description: 'For professionals who want it all',
    prices: {
      monthly: { amount: 3000, lookupKey: 'deluxe_monthly' },  // $30.00
      yearly: { amount: 30000, lookupKey: 'deluxe_annual' },   // $300.00
    },
  },
];

async function main() {
  console.log('🚀 Setting up Stripe products and prices...\n');
  
  for (const plan of PLANS) {
    console.log(`📦 Creating product: ${plan.name}`);
    
    // Check if product already exists
    const existingProducts = await stripe.products.list({
      active: true,
      limit: 100,
    });
    
    let product = existingProducts.data.find(p => p.name === plan.name);
    
    if (product) {
      console.log(`   ℹ️  Product "${plan.name}" already exists (${product.id})`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          app: 'pose-and-poise',
        },
      });
      console.log(`   ✅ Created product: ${product.id}`);
    }
    
    // Create/update prices
    for (const [interval, priceConfig] of Object.entries(plan.prices)) {
      const isYearly = interval === 'yearly';
      
      // Check if price with this lookup key already exists
      const existingPrices = await stripe.prices.list({
        lookup_keys: [priceConfig.lookupKey],
        limit: 1,
      });
      
      if (existingPrices.data.length > 0) {
        console.log(`   ℹ️  Price with lookup key "${priceConfig.lookupKey}" already exists`);
        continue;
      }
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceConfig.amount,
        currency: 'usd',
        recurring: {
          interval: isYearly ? 'year' : 'month',
        },
        lookup_key: priceConfig.lookupKey,
        transfer_lookup_key: true, // Transfer lookup key if it exists on another price
        metadata: {
          plan: plan.name.toLowerCase(),
          interval: interval,
        },
      });
      
      console.log(`   ✅ Created ${interval} price: $${priceConfig.amount / 100} (${price.id})`);
      console.log(`      Lookup key: ${priceConfig.lookupKey}`);
    }
    
    console.log('');
  }
  
  console.log('✨ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Go to https://dashboard.stripe.com/webhooks');
  console.log('2. Add endpoint: https://your-domain.com/api/webhooks/stripe');
  console.log('3. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted');
  console.log('4. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET\n');
  
  // Print summary
  console.log('📋 Created lookup keys:');
  for (const plan of PLANS) {
    console.log(`   - ${plan.prices.monthly.lookupKey}`);
    console.log(`   - ${plan.prices.yearly.lookupKey}`);
  }
}

main().catch(console.error);

