import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { colors, typography, spacing } from '@/styles/tokens';
import { PricingClient } from './PricingClient';
import { PricingHeader } from './PricingHeader';
import type { PlanId } from '@/lib/stripe';

export const metadata = {
  title: 'Pricing | Pose & Poise',
  description: 'Simple, transparent pricing for models at every stage of their career.',
};

interface UserData {
  isLoggedIn: boolean;
  currentTier: PlanId | null;
  onboardingCompleted: boolean;
  user: {
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  } | null;
}

async function getAuthStatus(): Promise<UserData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isLoggedIn: false, currentTier: null, onboardingCompleted: true, user: null };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, display_name, avatar_url, onboarding_completed')
    .eq('id', user.id)
    .single();
  
  return {
    isLoggedIn: true,
    currentTier: (profile?.subscription_tier as PlanId) || 'FREE',
    onboardingCompleted: profile?.onboarding_completed || false,
    user: {
      name: profile?.display_name || null,
      email: user.email || null,
      avatarUrl: profile?.avatar_url || null,
    },
  };
}

export default async function PricingPage() {
  const { isLoggedIn, currentTier, onboardingCompleted, user } = await getAuthStatus();
  
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.primary,
        fontFamily: typography.fontFamily.display,
        color: colors.text.primary,
      }}
    >
      {/* Onboarding Banner - shows for logged-in users who haven't completed setup */}
      {isLoggedIn && !onboardingCompleted && (
        <div
          style={{
            backgroundColor: colors.camel,
            padding: `${spacing.padding.md} ${spacing.padding.lg}`,
            position: "relative",
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.gap.lg,
              flexWrap: "wrap",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.charcoal}
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.charcoal,
                margin: 0,
                textAlign: "center",
              }}
            >
              {user?.name ? `Hey ${user.name}! ` : ""}
              Complete your profile setup to unlock your dashboard, portfolio builder, and more.
            </p>
            <Link
              href="/onboarding"
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                fontWeight: 500,
                letterSpacing: typography.letterSpacing.wider,
                textTransform: "uppercase",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: colors.charcoal,
                color: colors.cream,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Continue Setup
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <PricingHeader 
        isLoggedIn={isLoggedIn} 
        user={user}
        currentTier={currentTier}
      />

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
          Start for free, upgrade when you're ready. No hidden fees.
          {!isLoggedIn && ' All paid plans include a 7-day free trial.'}
        </p>
      </section>

      {/* Pricing Cards */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${spacing.padding['2xl']} ${spacing.padding['3xl']}`,
        }}
      >
        <PricingClient isLoggedIn={isLoggedIn} currentTier={currentTier} />
      </section>

      {/* FAQ Section */}
      <section
        style={{
          background: colors.background.card,
          borderTop: `1px solid ${colors.border.divider}`,
          padding: `${spacing.padding['3xl']} ${spacing.padding['2xl']}`,
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.featureH2,
              fontWeight: typography.fontWeight.light,
              textAlign: 'center',
              marginBottom: spacing.padding.xl,
            }}
          >
            Frequently Asked Questions
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.gap.lg,
            }}
          >
            {[
              {
                q: 'Can I upgrade or downgrade at any time?',
                a: 'Yes, you can change your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at the end of your current billing period.',
              },
              {
                q: 'Is there a free trial for paid plans?',
                a: 'Yes! Both Professional and Deluxe plans include a 7-day free trial. You can cancel anytime during the trial.',
              },
              {
                q: 'What happens to my photos if I downgrade?',
                a: 'Your photos are safe. If you exceed the new plan\'s limit, you won\'t be able to upload new photos until you\'re within the limit, but existing photos remain visible.',
              },
              {
                q: 'Can I use my own domain name?',
                a: 'Custom domains are available on the Deluxe plan. You can connect a domain you already own or purchase one through us.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a full refund within 30 days of your first payment if you\'re not satisfied. Annual plans can be refunded prorated.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  paddingBottom: spacing.padding.lg,
                  borderBottom: `1px solid ${colors.border.divider}`,
                }}
              >
                <h3
                  style={{
                    fontFamily: typography.fontFamily.display,
                    fontSize: typography.fontSize.cardH3,
                    fontWeight: typography.fontWeight.regular,
                    marginBottom: spacing.padding.sm,
                    color: colors.text.primary,
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.body,
                    color: colors.text.secondary,
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          textAlign: 'center',
          padding: `${spacing.padding['3xl']} ${spacing.padding['2xl']}`,
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize.sectionH2,
            fontWeight: typography.fontWeight.light,
            marginBottom: spacing.padding.md,
          }}
        >
          Ready to showcase your work?
        </h2>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.secondary,
            marginBottom: spacing.padding.lg,
          }}
        >
          Join thousands of models building their careers with Pose & Poise.
        </p>
        <Link
          href={isLoggedIn ? '/dashboard' : '/signup'}
          style={{
            display: 'inline-block',
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            letterSpacing: typography.letterSpacing.wider,
            textTransform: 'uppercase',
            padding: `${spacing.padding.md} ${spacing.padding.xl}`,
            background: colors.charcoal,
            color: colors.cream,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {isLoggedIn ? 'Go to Dashboard' : 'Start Free Today'}
        </Link>
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
