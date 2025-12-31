// =============================================================================
// STRIPE EMBEDDED PRICING TABLE PAGE
// =============================================================================
// Alternative pricing page using Stripe's no-code Pricing Table component
// Setup: Create a Pricing Table at https://dashboard.stripe.com/pricing-tables

import Link from 'next/link';
import Script from 'next/script';
import { createClient } from '@/lib/supabase/server';
import { colors, typography, spacing } from '@/styles/tokens';

export const metadata = {
  title: 'Pricing | Pose & Poise',
  description: 'Simple, transparent pricing for models at every stage of their career.',
};

async function getAuthStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return {
    isLoggedIn: !!user,
    userId: user?.id || null,
    userEmail: user?.email || null,
  };
}

export default async function EmbeddedPricingPage() {
  const { isLoggedIn, userId, userEmail } = await getAuthStatus();
  
  // Get these from your Stripe Dashboard → Product Catalog → Pricing Tables
  const pricingTableId = process.env.STRIPE_PRICING_TABLE_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.primary,
        fontFamily: typography.fontFamily.display,
        color: colors.text.primary,
      }}
    >
      {/* Stripe Pricing Table Script */}
      <Script src="https://js.stripe.com/v3/pricing-table.js" async />
      
      {/* Header */}
      <header
        style={{
          padding: `${spacing.padding.md} ${spacing.padding['2xl']}`,
          borderBottom: `1px solid ${colors.border.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: typography.fontSize.logo,
            fontWeight: typography.fontWeight.light,
            letterSpacing: typography.letterSpacing.widest,
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: colors.text.primary,
          }}
        >
          Pose & Poise
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.lg }}>
          <Link
            href="/pricing"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.tertiary,
              textDecoration: 'none',
            }}
          >
            Custom Pricing
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                letterSpacing: typography.letterSpacing.wider,
                textTransform: 'uppercase',
                padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
                background: colors.charcoal,
                color: colors.cream,
                textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/signup"
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                letterSpacing: typography.letterSpacing.wider,
                textTransform: 'uppercase',
                padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
                background: colors.charcoal,
                color: colors.cream,
                textDecoration: 'none',
              }}
            >
              Get Started
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          textAlign: 'center',
          padding: `${spacing.padding['3xl']} ${spacing.padding['2xl']} ${spacing.padding.xl}`,
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: typography.fontSize.heroH1,
            fontWeight: typography.fontWeight.light,
            marginBottom: spacing.padding.md,
            lineHeight: typography.lineHeight.tight,
          }}
        >
          Simple, Transparent Pricing
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodyLarge,
            color: colors.text.secondary,
            fontWeight: typography.fontWeight.light,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          Start for free, upgrade when you're ready. All paid plans include a 7-day free trial.
        </p>
      </section>

      {/* Stripe Pricing Table */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${spacing.padding['2xl']} ${spacing.padding['3xl']}`,
        }}
      >
        {pricingTableId && publishableKey ? (
          // @ts-expect-error - Stripe pricing table custom element
          <stripe-pricing-table
            pricing-table-id={pricingTableId}
            publishable-key={publishableKey}
            client-reference-id={userId || undefined}
            customer-email={userEmail || undefined}
          />
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: spacing.padding['3xl'],
              background: colors.background.card,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <h3
              style={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize.cardH3,
                color: colors.text.primary,
                marginBottom: spacing.padding.md,
              }}
            >
              Pricing Table Not Configured
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.body,
                color: colors.text.secondary,
                marginBottom: spacing.padding.lg,
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              To use Stripe's embedded pricing table, add these environment variables:
            </p>
            <pre
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: typography.fontSize.bodySmall,
                background: colors.charcoal,
                color: colors.cream,
                padding: spacing.padding.lg,
                textAlign: 'left',
                maxWidth: '500px',
                margin: `${spacing.padding.lg} auto`,
                overflow: 'auto',
              }}
            >
{`STRIPE_PRICING_TABLE_ID=prctbl_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...`}
            </pre>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.camel,
                textDecoration: 'underline',
              }}
            >
              Use custom pricing page instead →
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${colors.border.divider}`,
          padding: `${spacing.padding.xl} ${spacing.padding['2xl']}`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.text.muted,
          }}
        >
          © 2025 Pose & Poise. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

