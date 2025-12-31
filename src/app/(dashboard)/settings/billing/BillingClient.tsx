'use client';

// =============================================================================
// BILLING CLIENT COMPONENT
// =============================================================================
// Interactive billing management with plan selection and Stripe integration

import { useState } from 'react';
import { colors, typography, spacing } from '@/styles/tokens';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/stripe';

interface SubscriptionInfo {
  plan_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
}

interface BillingClientProps {
  currentPlanId: PlanId;
  currentPlan: typeof PLANS[PlanId];
  subscription: SubscriptionInfo | null;
  hasStripeCustomer: boolean;
}

export function BillingClient({ 
  currentPlanId, 
  currentPlan, 
  subscription,
  hasStripeCustomer 
}: BillingClientProps) {
  const [billingCycle, setBillingCycle] = useState<BillingInterval>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleSubscribe = async (planId: PlanId) => {
    if (planId === 'FREE' || planId === currentPlanId) return;

    setLoadingPlan(planId);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: planId, billingCycle }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isPaid = currentPlanId !== 'FREE';
  const isActive = subscription?.status === 'active';
  const isCanceling = subscription?.cancel_at_period_end;

  return (
    <div style={{ fontFamily: typography.fontFamily.body, maxWidth: '900px' }}>
      {/* Header */}
      <h1 style={{
        fontFamily: typography.fontFamily.display,
        fontSize: '36px',
        fontWeight: typography.fontWeight.regular,
        color: colors.text.primary,
        marginBottom: spacing.padding.xs,
      }}>
        Billing
      </h1>
      <p style={{
        fontSize: typography.fontSize.body,
        color: colors.text.secondary,
        marginBottom: spacing.padding.xl,
      }}>
        Manage your subscription and payment details
      </p>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: spacing.padding.md,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#EF4444',
          fontSize: typography.fontSize.bodySmall,
          marginBottom: spacing.padding.lg,
        }}>
          {error}
        </div>
      )}

      {/* Current Plan Card */}
      <div style={{
        background: colors.background.card,
        border: `1px solid ${colors.border.subtle}`,
        padding: spacing.padding.lg,
        marginBottom: spacing.padding.xl,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.padding.md,
        }}>
          <div>
            <p style={{
              fontSize: typography.fontSize.label,
              fontWeight: typography.fontWeight.medium,
              letterSpacing: typography.letterSpacing.wider,
              textTransform: 'uppercase',
              color: colors.text.muted,
              marginBottom: spacing.padding.xs,
            }}>
              Current Plan
            </p>
            <h2 style={{
              fontFamily: typography.fontFamily.display,
              fontSize: '28px',
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.gap.sm,
            }}>
              {currentPlan.name}
              {isPaid && (
                <span style={{
                  fontSize: typography.fontSize.label,
                  fontFamily: typography.fontFamily.body,
                  fontWeight: typography.fontWeight.medium,
                  padding: '4px 10px',
                  background: isCanceling 
                    ? 'rgba(234, 179, 8, 0.1)' 
                    : isActive 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : 'rgba(234, 179, 8, 0.1)',
                  color: isCanceling ? '#EAB308' : isActive ? '#22C55E' : '#EAB308',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {isCanceling ? 'Canceling' : subscription?.status || 'Active'}
                </span>
              )}
            </h2>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontFamily: typography.fontFamily.display,
              fontSize: '32px',
              fontWeight: typography.fontWeight.light,
              color: colors.text.primary,
            }}>
              ${currentPlan.price.monthly}
              <span style={{
                fontSize: typography.fontSize.body,
                fontFamily: typography.fontFamily.body,
                color: colors.text.muted,
              }}>
                /month
              </span>
            </p>
          </div>
        </div>

        {/* Billing period info */}
        {isPaid && subscription?.current_period_end && (
          <p style={{
            fontSize: typography.fontSize.bodySmall,
            color: colors.text.secondary,
            marginBottom: spacing.padding.md,
          }}>
            {isCanceling 
              ? `Access until: ${formatDate(subscription.current_period_end)}`
              : `Renews: ${formatDate(subscription.current_period_end)}`
            }
          </p>
        )}

        {/* Features */}
        <div style={{
          paddingTop: spacing.padding.md,
          borderTop: `1px solid ${colors.border.divider}`,
        }}>
          <p style={{
            fontSize: typography.fontSize.label,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.muted,
            marginBottom: spacing.padding.sm,
          }}>
            Includes:
          </p>
          <ul style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing.gap.xs,
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            {currentPlan.features.slice(0, 6).map((feature, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.gap.xs,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.secondary,
              }}>
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Manage Billing Button */}
        {hasStripeCustomer && (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            style={{
              marginTop: spacing.padding.lg,
              padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
              background: colors.charcoal,
              color: colors.cream,
              border: 'none',
              fontSize: typography.fontSize.bodySmall,
              fontWeight: typography.fontWeight.medium,
              cursor: portalLoading ? 'not-allowed' : 'pointer',
              opacity: portalLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.gap.xs,
            }}
          >
            {portalLoading ? 'Loading...' : (
              <>
                <CreditCardIcon />
                Manage Billing
              </>
            )}
          </button>
        )}
      </div>

      {/* Plan Selection */}
      <div style={{ marginBottom: spacing.padding.xl }}>
        <h3 style={{
          fontFamily: typography.fontFamily.display,
          fontSize: typography.fontSize.cardH3,
          fontWeight: typography.fontWeight.regular,
          color: colors.text.primary,
          marginBottom: spacing.padding.md,
        }}>
          {isPaid ? 'Change Plan' : 'Upgrade Your Plan'}
        </h3>

        {/* Billing Toggle */}
        <div style={{
          display: 'inline-flex',
          background: colors.background.card,
          border: `1px solid ${colors.border.subtle}`,
          padding: '4px',
          marginBottom: spacing.padding.lg,
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: `${spacing.padding.xs} ${spacing.padding.md}`,
              background: billingCycle === 'monthly' ? colors.charcoal : 'transparent',
              color: billingCycle === 'monthly' ? colors.cream : colors.text.secondary,
              border: 'none',
              fontSize: typography.fontSize.bodySmall,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: `${spacing.padding.xs} ${spacing.padding.md}`,
              background: billingCycle === 'yearly' ? colors.charcoal : 'transparent',
              color: billingCycle === 'yearly' ? colors.cream : colors.text.secondary,
              border: 'none',
              fontSize: typography.fontSize.bodySmall,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.gap.xs,
            }}
          >
            Yearly
            <span style={{
              background: colors.camel,
              color: colors.cream,
              fontSize: '10px',
              padding: '2px 6px',
              fontWeight: typography.fontWeight.semibold,
            }}>
              Save 17%
            </span>
          </button>
        </div>

        {/* Plan Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.gap.md,
        }}>
          {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([planId, plan]) => {
            const isCurrentPlan = currentPlanId === planId;
            const isLoading = loadingPlan === planId;
            const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
            const priceLabel = billingCycle === 'yearly' ? '/year' : '/month';
            const isHighlighted = planId === 'PROFESSIONAL';

            return (
              <div
                key={planId}
                style={{
                  background: isHighlighted ? colors.charcoal : colors.background.card,
                  border: isCurrentPlan 
                    ? `2px solid ${colors.camel}` 
                    : `1px solid ${colors.border.subtle}`,
                  padding: spacing.padding.lg,
                  position: 'relative',
                }}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22C55E',
                    fontSize: '10px',
                    fontWeight: typography.fontWeight.semibold,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                  }}>
                    Current
                  </div>
                )}

                {/* Popular Badge */}
                {isHighlighted && !isCurrentPlan && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: colors.camel,
                    color: colors.cream,
                    fontSize: typography.fontSize.caption,
                    letterSpacing: typography.letterSpacing.wider,
                    textTransform: 'uppercase',
                    padding: '6px 16px',
                  }}>
                    Most Popular
                  </div>
                )}

                {/* Plan Name */}
                <h4 style={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: typography.fontSize.cardH3,
                  fontWeight: typography.fontWeight.regular,
                  color: isHighlighted ? colors.cream : colors.text.primary,
                  marginBottom: spacing.padding.xs,
                }}>
                  {plan.name}
                </h4>

                {/* Description */}
                <p style={{
                  fontSize: typography.fontSize.bodySmall,
                  color: isHighlighted ? 'rgba(250, 249, 247, 0.7)' : colors.text.secondary,
                  marginBottom: spacing.padding.md,
                }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{ marginBottom: spacing.padding.md }}>
                  <span style={{
                    fontFamily: typography.fontFamily.display,
                    fontSize: '40px',
                    fontWeight: typography.fontWeight.light,
                    color: isHighlighted ? colors.cream : colors.text.primary,
                  }}>
                    ${price}
                  </span>
                  <span style={{
                    fontSize: typography.fontSize.body,
                    color: isHighlighted ? 'rgba(250, 249, 247, 0.7)' : colors.text.muted,
                  }}>
                    {priceLabel}
                  </span>
                </div>

                {/* Trial Note */}
                {planId !== 'FREE' && !isCurrentPlan && (
                  <p style={{
                    fontSize: typography.fontSize.caption,
                    color: isHighlighted ? 'rgba(250, 249, 247, 0.6)' : colors.text.muted,
                    marginBottom: spacing.padding.md,
                    fontStyle: 'italic',
                  }}>
                    7-day free trial included
                  </p>
                )}

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <div style={{
                    padding: `${spacing.padding.sm} ${spacing.padding.md}`,
                    background: 'transparent',
                    color: isHighlighted ? 'rgba(250, 249, 247, 0.5)' : colors.text.muted,
                    border: `1px solid ${isHighlighted ? 'rgba(250, 249, 247, 0.2)' : colors.border.subtle}`,
                    textAlign: 'center',
                    fontSize: typography.fontSize.bodySmall,
                    marginBottom: spacing.padding.md,
                  }}>
                    Current Plan
                  </div>
                ) : planId === 'FREE' ? (
                  <div style={{
                    padding: `${spacing.padding.sm} ${spacing.padding.md}`,
                    background: 'transparent',
                    color: colors.text.muted,
                    border: `1px solid ${colors.border.subtle}`,
                    textAlign: 'center',
                    fontSize: typography.fontSize.bodySmall,
                    marginBottom: spacing.padding.md,
                  }}>
                    Free Forever
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(planId)}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: `${spacing.padding.sm} ${spacing.padding.md}`,
                      background: isHighlighted ? colors.cream : colors.charcoal,
                      color: isHighlighted ? colors.charcoal : colors.cream,
                      border: 'none',
                      fontSize: typography.fontSize.bodySmall,
                      fontWeight: typography.fontWeight.medium,
                      letterSpacing: typography.letterSpacing.wide,
                      textTransform: 'uppercase',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                      marginBottom: spacing.padding.md,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Start Free Trial'}
                  </button>
                )}

                {/* Divider */}
                <div style={{
                  height: '1px',
                  background: isHighlighted ? 'rgba(250, 249, 247, 0.2)' : colors.border.divider,
                  marginBottom: spacing.padding.md,
                }} />

                {/* Features */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.gap.xs,
                }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: spacing.gap.xs,
                      fontSize: typography.fontSize.bodySmall,
                      color: isHighlighted ? 'rgba(250, 249, 247, 0.9)' : colors.text.secondary,
                    }}>
                      <span style={{ color: colors.camel, flexShrink: 0 }}>
                        <CheckIcon />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ICONS
// =============================================================================

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

