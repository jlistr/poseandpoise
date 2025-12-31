'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLANS, type PlanId } from '@/lib/stripe';

interface BillingClientProps {
  currentTier: PlanId;
  currentPlan: typeof PLANS[PlanId];
  subscription: {
    status: string;
    current_period_end?: string;
    stripe_customer_id?: string;
  } | null;
  hasStripeCustomer: boolean;
}

export function BillingClient({ 
  currentTier, 
  currentPlan, 
  subscription,
  hasStripeCustomer 
}: BillingClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    setLoading(true);
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
    } catch (err) {
      setError('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isPaid = currentTier !== 'FREE';
  const isActive = subscription?.status === 'active';

  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      maxWidth: '800px',
    }}>
      {/* Page Title */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '36px',
        fontWeight: 400,
        color: '#1A1A1A',
        marginBottom: '8px',
      }}>
        Billing
      </h1>
      <p style={{
        fontSize: '15px',
        color: 'rgba(26, 26, 26, 0.6)',
        marginBottom: '32px',
      }}>
        Manage your subscription and payment details
      </p>

      {/* Current Plan Card */}
      <div style={{
        background: '#fff',
        border: '1px solid rgba(26, 26, 26, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}>
          <div>
            <p style={{
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'rgba(26, 26, 26, 0.5)',
              marginBottom: '8px',
            }}>
              Current Plan
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '28px',
              fontWeight: 500,
              color: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              {currentPlan.name}
              {isPaid && (
                <span style={{
                  fontSize: '12px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  padding: '4px 10px',
                  background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                  color: isActive ? '#22C55E' : '#EAB308',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {subscription?.status || 'Active'}
                </span>
              )}
            </h2>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#1A1A1A',
            }}>
              ${currentPlan.price.monthly}
              <span style={{
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                color: 'rgba(26, 26, 26, 0.5)',
              }}>
                /month
              </span>
            </p>
          </div>
        </div>

        {/* Next billing date */}
        {isPaid && subscription?.current_period_end && (
          <p style={{
            fontSize: '14px',
            color: 'rgba(26, 26, 26, 0.6)',
            marginBottom: '20px',
          }}>
            {isActive ? 'Renews' : 'Access until'}: {formatDate(subscription.current_period_end)}
          </p>
        )}

        {/* Features */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid rgba(26, 26, 26, 0.08)',
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(26, 26, 26, 0.5)',
            marginBottom: '12px',
          }}>
            Includes:
          </p>
          <ul style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            {currentPlan.features.slice(0, 6).map((feature, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: 'rgba(26, 26, 26, 0.7)',
              }}>
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {/* Manage Billing (for paid users) */}
        {hasStripeCustomer && (
          <button
            onClick={handleManageBilling}
            disabled={loading}
            style={{
              padding: '14px 28px',
              background: '#1A1A1A',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Loading...' : (
              <>
                <CreditCardIcon />
                Manage Billing
              </>
            )}
          </button>
        )}

        {/* Upgrade Button (for free users) */}
        {currentTier === 'FREE' && (
          <Link
            href="/pricing"
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #C4A484 0%, #A08060 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <SparkleIcon />
            Upgrade Plan
          </Link>
        )}

        {/* Change Plan (for paid users) */}
        {isPaid && (
          <Link
            href="/pricing"
            style={{
              padding: '14px 28px',
              background: '#f5f5f5',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Change Plan
          </Link>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#EF4444',
          borderRadius: '6px',
          fontSize: '14px',
        }}>
          {error}
        </p>
      )}

      {/* Plan Comparison */}
      {currentTier === 'FREE' && (
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'rgba(196, 164, 132, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(196, 164, 132, 0.2)',
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 400,
            marginBottom: '12px',
            color: '#1A1A1A',
          }}>
            Unlock More Features
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(26, 26, 26, 0.7)',
            marginBottom: '20px',
            lineHeight: 1.6,
          }}>
            Upgrade to Professional or Deluxe to access premium templates, 
            unlimited photos, custom domains, and more.
          </p>
          <Link
            href="/pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#C4A484',
              textDecoration: 'none',
            }}
          >
            View all plans
            <ArrowIcon />
          </Link>
        </div>
      )}
    </div>
  );
}

// Icons
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4A484" strokeWidth="2.5">
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

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

