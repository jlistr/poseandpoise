# Stripe Connect Integration Guide

This document provides a comprehensive overview of the Stripe Connect integration in this application. It covers the setup, architecture, and usage of all Connect-related features.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Architecture](#architecture)
4. [API Endpoints](#api-endpoints)
5. [Webhooks](#webhooks)
6. [UI Pages](#ui-pages)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This integration implements Stripe Connect using the **V2 Accounts API**, which provides:

- **Unified Account Management**: A single entity represents both the connected account and customer
- **Configurable Capabilities**: Merchant and customer configurations for different use cases
- **Direct Charges**: Payments processed on connected accounts with application fees

### Key Features

1. **Connected Account Onboarding** - Users can create accounts and complete KYC verification
2. **Product Management** - Connected accounts can create and manage their products
3. **Storefront** - Each connected account has a public storefront page
4. **Direct Charges** - Customers pay connected accounts directly (with platform fees)
5. **Platform Subscriptions** - Connected accounts can subscribe to the platform
6. **Billing Portal** - Connected accounts can manage their subscriptions

---

## Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# Stripe API Keys
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Webhook Secrets
# For Connect webhooks (thin events for V2 accounts)
# Get this when you create the webhook endpoint
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_your_connect_webhook_secret

# For platform subscription webhooks (snapshot events)
STRIPE_PLATFORM_WEBHOOK_SECRET=whsec_your_platform_webhook_secret

# Platform Subscription Price ID
# Create this in Stripe Dashboard or use the one created by this demo
STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID=price_1SkRgF1fCsdgIc4sxIsnETEp

# App URL (for redirect URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Enable Accounts V2 in Stripe Dashboard

1. Go to [Stripe Dashboard Settings > Product Previews](https://dashboard.stripe.com/settings/early_access)
2. Enable **Accounts v2**
3. Acknowledge the preview terms

### 3. Run Database Migrations

```bash
# Apply the migration to create connected_accounts and platform_subscriptions tables
supabase db push
# Or if using direct SQL:
# Run the migration file: supabase/migrations/20251231200000_add_stripe_connect.sql
```

### 4. Configure Webhooks

#### Connect Webhooks (Thin Events for V2 Accounts)

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **+ Add destination**
3. Select **Connected accounts** as the event source
4. Select **Show advanced options** → **Thin** payload style
5. Add these event types:
   - `v2.core.account[requirements].updated`
   - `v2.core.account[configuration.merchant].capability_status_updated`
   - `v2.core.account[configuration.customer].capability_status_updated`
6. Set endpoint URL: `https://yourdomain.com/api/connect/webhooks`
7. Copy the signing secret to `STRIPE_CONNECT_WEBHOOK_SECRET`

#### Platform Subscription Webhooks (Snapshot Events)

1. Create another webhook endpoint
2. Select **Your account** (not Connected accounts)
3. Keep the default **Snapshot** payload style
4. Add these event types:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Set endpoint URL: `https://yourdomain.com/api/connect/subscription-webhooks`
6. Copy the signing secret to `STRIPE_PLATFORM_WEBHOOK_SECRET`

---

## Architecture

### File Structure

```
src/
├── lib/stripe/
│   ├── connect.ts          # Core Connect functions and Stripe client
│   └── CONNECT_README.md   # This documentation
├── app/api/connect/
│   ├── accounts/route.ts   # Create/get connected accounts
│   ├── onboarding/route.ts # Account links and status
│   ├── products/route.ts   # Product management
│   ├── checkout/route.ts   # Direct charge checkout
│   ├── subscription/route.ts # Platform subscriptions
│   ├── webhooks/route.ts   # Thin events for V2 accounts
│   └── subscription-webhooks/route.ts # Platform subscription events
├── app/store/[accountId]/
│   ├── page.tsx            # Storefront page
│   └── success/page.tsx    # Checkout success
└── app/dashboard/connect/
    ├── page.tsx            # Connect dashboard
    ├── ConnectDashboardClient.tsx # Dashboard UI
    ├── return/page.tsx     # Onboarding return
    └── subscription/success/page.tsx
```

### Key Concepts

#### V2 Accounts API

Instead of using `type: 'express'` or `type: 'standard'`, V2 accounts use configurations:

```typescript
const account = await stripeClient.v2.core.accounts.create({
  display_name: 'Store Name',
  contact_email: 'owner@store.com',
  identity: { country: 'us' },
  dashboard: 'full',
  defaults: {
    responsibilities: {
      fees_collector: 'stripe',
      losses_collector: 'stripe',
    },
  },
  configuration: {
    customer: {}, // Allows account to pay platform
    merchant: {   // Allows account to accept payments
      capabilities: {
        card_payments: { requested: true },
      },
    },
  },
});
```

#### Direct Charges with Application Fees

Payments are processed on the connected account:

```typescript
const session = await stripeClient.checkout.sessions.create({
  line_items: [{ price: 'price_xxx', quantity: 1 }],
  payment_intent_data: {
    application_fee_amount: 100, // Platform fee in cents
  },
  mode: 'payment',
  success_url: '...',
}, {
  stripeAccount: accountId, // Stripe-Account header
});
```

#### Platform Subscriptions with customer_account

For V2 accounts, use `customer_account` instead of `customer`:

```typescript
const session = await stripeClient.checkout.sessions.create({
  customer_account: accountId, // The connected account ID
  mode: 'subscription',
  line_items: [{ price: 'price_xxx', quantity: 1 }],
  success_url: '...',
});
```

---

## API Endpoints

### Connected Accounts

#### `POST /api/connect/accounts`
Create a new connected account.

**Request:**
```json
{
  "displayName": "My Store",
  "contactEmail": "owner@mystore.com",
  "country": "us"
}
```

**Response:**
```json
{
  "success": true,
  "accountId": "acct_xxx"
}
```

#### `GET /api/connect/accounts`
Get the current user's connected account.

### Onboarding

#### `POST /api/connect/onboarding`
Create an account link for onboarding.

**Response:**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/..."
}
```

#### `GET /api/connect/onboarding`
Get the current onboarding status.

**Response:**
```json
{
  "accountId": "acct_xxx",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "onboardingComplete": true,
  "requirementsStatus": "complete"
}
```

### Products

#### `POST /api/connect/products`
Create a product on a connected account.

**Request:**
```json
{
  "name": "Product Name",
  "description": "Optional description",
  "priceInCents": 1999,
  "currency": "usd"
}
```

#### `GET /api/connect/products?accountId=acct_xxx`
List products for a connected account.

### Checkout

#### `POST /api/connect/checkout`
Create a checkout session for direct charge.

**Request:**
```json
{
  "accountId": "acct_xxx",
  "priceId": "price_xxx",
  "quantity": 1,
  "priceInCents": 1999
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/..."
}
```

### Platform Subscriptions

#### `POST /api/connect/subscription`
Create a subscription checkout for the connected account.

#### `GET /api/connect/subscription`
Get the current subscription status.

#### `DELETE /api/connect/subscription`
Create a billing portal session.

---

## Webhooks

### Thin Events (V2 Accounts)

**Endpoint:** `/api/connect/webhooks`

Handled events:
- `v2.core.account[requirements].updated` - Requirements changed
- `v2.core.account[configuration.merchant].capability_status_updated` - Payment capability changed
- `v2.core.account[configuration.customer].capability_status_updated` - Customer capability changed

Thin events only contain the event ID. The full event must be fetched:

```typescript
const thinEvent = stripeClient.parseThinEvent(body, signature, secret);
const fullEvent = await stripeClient.v2.core.events.retrieve(thinEvent.id);
```

### Snapshot Events (Platform Subscriptions)

**Endpoint:** `/api/connect/subscription-webhooks`

Handled events:
- `checkout.session.completed` - Checkout completed
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated (upgrade, downgrade, renewal)
- `customer.subscription.deleted` - Subscription canceled
- `invoice.paid` - Invoice paid
- `invoice.payment_failed` - Payment failed

---

## UI Pages

### Storefront (`/store/[accountId]`)

Public storefront for a connected account. Displays products and allows purchases.

**Note:** In production, replace `accountId` with a user-friendly slug.

### Connect Dashboard (`/dashboard/connect`)

Connected account management interface:
- Create account (if none exists)
- Complete onboarding
- View status
- Manage products
- Platform subscription

### Onboarding Return (`/dashboard/connect/return`)

Shown after completing or exiting onboarding. Updates status from Stripe API.

### Subscription Success (`/dashboard/connect/subscription/success`)

Shown after successful platform subscription checkout.

---

## Testing

### Local Testing with Stripe CLI

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)

2. Forward webhooks to your local server:

```bash
# For Connect webhooks (thin events)
stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated' --forward-thin-to http://localhost:3000/api/connect/webhooks

# For platform subscription webhooks (snapshot events)
stripe listen --forward-to http://localhost:3000/api/connect/subscription-webhooks
```

3. Use the webhook signing secret from the CLI output

### Test Mode

Always use test API keys (`sk_test_...`) during development:
- Test card: `4242 4242 4242 4242`
- Any future expiry, any CVC

### Test Accounts

Use test data for connected accounts:
- SSN last 4: `0000`
- Phone: `+15555555555`
- Email: any valid email

---

## Troubleshooting

### "STRIPE_SECRET_KEY is not set"

Add `STRIPE_SECRET_KEY` to your `.env.local` file.

### "Invalid webhook signature"

1. Ensure you're using the correct webhook secret for the endpoint
2. For local testing, use the secret from `stripe listen` output
3. Make sure you're not double-parsing the request body

### "No account ID in event"

Check that you're correctly extracting the account ID from thin events:
```typescript
const accountId = eventData.related_object?.id || eventData.data?.id;
```

### Onboarding never completes

1. Ensure Accounts V2 is enabled in Dashboard
2. Check for pending requirements in the onboarding status
3. Verify the webhook is receiving `requirements.updated` events

### Products not showing in storefront

1. Verify the account has `charges_enabled: true`
2. Check the product is active in Stripe
3. Ensure you're using the correct connected account ID

### Platform subscription not working

1. Verify `STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID` is set
2. Check the price is a recurring price (not one-time)
3. Ensure the account has customer configuration

---

## Additional Resources

- [Stripe Connect Documentation](https://docs.stripe.com/connect)
- [V2 Accounts API Reference](https://docs.stripe.com/api/v2/core/accounts)
- [Thin Events Documentation](https://docs.stripe.com/event-destinations#thin-events)
- [Direct Charges Guide](https://docs.stripe.com/connect/direct-charges)

