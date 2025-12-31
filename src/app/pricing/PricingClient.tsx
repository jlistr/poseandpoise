'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { colors, typography, spacing } from '@/styles/tokens';
import { CheckIcon } from '@/components/icons/Icons';
import { createCheckoutSession } from '@/app/actions/stripe';
import type { PlanId, BillingInterval } from '@/lib/stripe';

const pricingTiers = [
  {
    id: 'FREE' as PlanId,
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    yearlySavings: 0,
    description: 'Perfect for getting started',
    cta: 'Get Started',
    highlighted: false,
    features: [
      'Up to 10 portfolio images',
      'Subdomain portfolio URL',
      'Basic comp card generator',
      'Portfolio analytics',
      'Read community posts',
    ],
    note: 'No credit card required',
    trialNote: null,
  },
  {
    id: 'PROFESSIONAL' as PlanId,
    name: 'Professional',
    price: 20,
    yearlyPrice: 200,
    yearlySavings: 40,
    description: 'For serious models building their career',
    cta: 'Start 7-Day Free Trial',
    highlighted: true,
    features: [
      'Everything in Free',
      'Up to 50 portfolio images',
      'All comp card templates',
      'PDF export',
      'Priority support',
      'Read & write community posts',
    ],
    note: null,
    trialNote: '7-day free trial included',
  },
  {
    id: 'DELUXE' as PlanId,
    name: 'Deluxe',
    price: 30,
    yearlyPrice: 300,
    yearlySavings: 60,
    description: 'For professionals who want it all',
    cta: 'Start 7-Day Free Trial',
    highlighted: false,
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
    note: null,
    trialNote: '7-day free trial included',
  },
];

interface PricingClientProps {
  isLoggedIn: boolean;
  currentTier: PlanId | null;
}

export function PricingClient({ isLoggedIn, currentTier }: PricingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: PlanId) => {
    if (planId === 'FREE') {
      router.push('/signup');
      return;
    }

    if (!isLoggedIn) {
      router.push(`/signup?plan=${planId.toLowerCase()}`);
      return;
    }

    setLoadingPlan(planId);
    setError(null);

    startTransition(async () => {
      const result = await createCheckoutSession(planId, billingInterval);
      
      if (result.error) {
        setError(result.error);
        setLoadingPlan(null);
      } else if (result.url) {
        window.location.href = result.url;
      }
    });
  };

  return (
    <>
      {/* Billing Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: spacing.padding.xl,
      }}>
        <div style={{
          display: 'inline-flex',
          background: colors.background.card,
          border: `1px solid ${colors.border.subtle}`,
          padding: '4px',
          gap: '4px',
        }}>
          <button
            onClick={() => setBillingInterval('monthly')}
            style={{
              padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
              background: billingInterval === 'monthly' ? colors.charcoal : 'transparent',
              color: billingInterval === 'monthly' ? colors.cream : colors.text.secondary,
              border: 'none',
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            style={{
              padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
              background: billingInterval === 'yearly' ? colors.charcoal : 'transparent',
              color: billingInterval === 'yearly' ? colors.cream : colors.text.secondary,
              border: 'none',
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Yearly
            <span style={{
              background: colors.camel,
              color: colors.cream,
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '2px',
              fontWeight: 600,
            }}>
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 24px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#EF4444',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing.gap.lg,
          alignItems: 'stretch',
        }}
      >
        {pricingTiers.map((tier) => {
          const isCurrentPlan = currentTier === tier.id;
          const isLoading = loadingPlan === tier.id && isPending;
          const price = billingInterval === 'yearly' ? tier.yearlyPrice : tier.price;
          const priceLabel = billingInterval === 'yearly' ? '/year' : '/month';

          return (
            <div
              key={tier.name}
              style={{
                background: tier.highlighted ? colors.charcoal : colors.background.card,
                border: tier.highlighted
                  ? 'none'
                  : isCurrentPlan
                    ? `2px solid ${colors.camel}`
                    : `1px solid ${colors.border.subtle}`,
                padding: spacing.padding.xl,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* Popular Badge */}
              {tier.highlighted && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: colors.camel,
                    color: colors.cream,
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    letterSpacing: typography.letterSpacing.wider,
                    textTransform: 'uppercase',
                    padding: '6px 16px',
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22C55E',
                    fontFamily: typography.fontFamily.body,
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Current Plan
                </div>
              )}

              {/* Tier Name */}
              <h3
                style={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: typography.fontSize.cardH3,
                  fontWeight: typography.fontWeight.regular,
                  color: tier.highlighted ? colors.cream : colors.text.primary,
                  marginBottom: spacing.padding.xs,
                }}
              >
                {tier.name}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: tier.highlighted
                    ? 'rgba(250, 247, 242, 0.7)'
                    : colors.text.secondary,
                  marginBottom: spacing.padding.lg,
                }}
              >
                {tier.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: spacing.padding.lg }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: typography.fontFamily.display,
                      fontSize: '48px',
                      fontWeight: typography.fontWeight.light,
                      color: tier.highlighted ? colors.cream : colors.text.primary,
                    }}
                  >
                    ${price === 0 ? '0' : price}
                  </span>
                  <span
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.body,
                      color: tier.highlighted
                        ? 'rgba(250, 247, 242, 0.7)'
                        : colors.text.muted,
                    }}
                  >
                    {priceLabel}
                  </span>
                </div>

                {/* Yearly savings */}
                {billingInterval === 'yearly' && tier.yearlySavings > 0 && (
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: colors.camel,
                      marginTop: spacing.padding.xs,
                    }}
                  >
                    Save ${tier.yearlySavings} compared to monthly
                  </p>
                )}

                {/* Note */}
                {tier.note && (
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      color: tier.highlighted
                        ? 'rgba(250, 247, 242, 0.6)'
                        : colors.text.muted,
                      marginTop: spacing.padding.xs,
                      fontStyle: 'italic',
                    }}
                  >
                    {tier.note}
                  </p>
                )}
                
                {/* Trial Note */}
                {tier.trialNote && !isCurrentPlan && (
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      color: colors.camel,
                      marginTop: spacing.padding.xs,
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    {tier.trialNote}
                  </p>
                )}
              </div>

              {/* CTA Button */}
              {isCurrentPlan ? (
                <Link
                  href="/dashboard/billing"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    letterSpacing: typography.letterSpacing.wide,
                    textTransform: 'uppercase',
                    padding: `${spacing.padding.md} ${spacing.padding.lg}`,
                    background: 'transparent',
                    color: tier.highlighted ? colors.cream : colors.text.secondary,
                    border: `1px solid ${tier.highlighted ? 'rgba(250, 247, 242, 0.3)' : colors.border.subtle}`,
                    textDecoration: 'none',
                    marginBottom: spacing.padding.lg,
                  }}
                >
                  Manage Plan
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={isLoading}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    letterSpacing: typography.letterSpacing.wide,
                    textTransform: 'uppercase',
                    padding: `${spacing.padding.md} ${spacing.padding.lg}`,
                    background: tier.highlighted ? colors.cream : colors.charcoal,
                    color: tier.highlighted ? colors.charcoal : colors.cream,
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    marginBottom: spacing.padding.lg,
                    transition: 'all 0.3s ease',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? 'Loading...' : tier.cta}
                </button>
              )}

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: tier.highlighted
                    ? 'rgba(250, 247, 242, 0.2)'
                    : colors.border.divider,
                  marginBottom: spacing.padding.lg,
                }}
              />

              {/* Features List */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.gap.sm,
                }}
              >
                {tier.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: spacing.gap.sm,
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: tier.highlighted
                        ? 'rgba(250, 247, 242, 0.9)'
                        : colors.text.secondary,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tier.highlighted ? colors.camel : colors.camel,
                      }}
                    >
                      <CheckIcon size={16} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

