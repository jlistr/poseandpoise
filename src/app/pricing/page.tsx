import Link from "next/link";
import { colors, typography, spacing } from "@/styles/tokens";
import { CheckIcon } from "@/components/icons/Icons";

export const metadata = {
  title: "Pricing | Pose & Poise",
  description: "Simple, transparent pricing for models at every stage of their career.",
};

const pricingTiers = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    yearlySavings: 0,
    description: "Perfect for getting started",
    cta: "Get Started",
    ctaHref: "/signup",
    highlighted: false,
    features: [
      "Up to 10 portfolio images",
      "Subdomain portfolio URL",
      "Basic comp card generator",
      "Portfolio analytics",
      "Read community posts",
    ],
    note: "No credit card required",
  },
  {
    name: "Professional",
    price: 20,
    yearlyPrice: 200,
    yearlySavings: 40,
    description: "For serious models building their career",
    cta: "Start Free Trial",
    ctaHref: "/signup?plan=professional",
    highlighted: true,
    features: [
      "Everything in Free",
      "Up to 50 portfolio images",
      "All comp card templates",
      "PDF export",
      "Priority support",
      "Read & write community posts",
    ],
    note: null,
  },
  {
    name: "Deluxe",
    price: 30,
    yearlyPrice: 300,
    yearlySavings: 60,
    description: "For professionals who want it all",
    cta: "Start Free Trial",
    ctaHref: "/signup?plan=deluxe",
    highlighted: false,
    features: [
      "Everything in Professional",
      "Unlimited portfolio images",
      "Custom domain support",
      "Central message hub",
      "SMS notifications",
      "Calendar & event planning",
      "Promote photographers & agencies",
    ],
    note: null,
  },
];

export default function PricingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background.primary,
        fontFamily: typography.fontFamily.display,
        color: colors.text.primary,
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: `${spacing.padding.md} ${spacing.padding["2xl"]}`,
          borderBottom: `1px solid ${colors.border.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: typography.fontSize.logo,
            fontWeight: typography.fontWeight.light,
            letterSpacing: typography.letterSpacing.widest,
            textTransform: "uppercase",
            textDecoration: "none",
            color: colors.text.primary,
          }}
        >
          Pose & Poise
        </Link>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.gap.lg,
          }}
        >
          <Link
            href="/pricing"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: colors.charcoal,
              textDecoration: "none",
            }}
          >
            Pricing
          </Link>
          <Link
            href="/examples"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.tertiary,
              textDecoration: "none",
            }}
          >
            Examples
          </Link>
          <Link
            href="/support"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.tertiary,
              textDecoration: "none",
            }}
          >
            Support
          </Link>
          <Link
            href="/login"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.tertiary,
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              letterSpacing: typography.letterSpacing.wider,
              textTransform: "uppercase",
              padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
              background: colors.charcoal,
              color: colors.cream,
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: `${spacing.padding["3xl"]} ${spacing.padding["2xl"]} ${spacing.padding.xl}`,
          maxWidth: "800px",
          margin: "0 auto",
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
        </p>
      </section>

      {/* Pricing Cards */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: `0 ${spacing.padding["2xl"]} ${spacing.padding["3xl"]}`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: spacing.gap.lg,
            alignItems: "stretch",
          }}
        >
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.highlighted
                  ? colors.charcoal
                  : colors.background.card,
                border: tier.highlighted
                  ? "none"
                  : `1px solid ${colors.border.subtle}`,
                padding: spacing.padding.xl,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {/* Popular Badge */}
              {tier.highlighted && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: colors.camel,
                    color: colors.cream,
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    letterSpacing: typography.letterSpacing.wider,
                    textTransform: "uppercase",
                    padding: "6px 16px",
                  }}
                >
                  Most Popular
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
                    ? "rgba(250, 247, 242, 0.7)"
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
                    display: "flex",
                    alignItems: "baseline",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: typography.fontFamily.display,
                      fontSize: "48px",
                      fontWeight: typography.fontWeight.light,
                      color: tier.highlighted ? colors.cream : colors.text.primary,
                    }}
                  >
                    ${tier.price === 0 ? "0" : tier.price}
                  </span>
                  <span
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.body,
                      color: tier.highlighted
                        ? "rgba(250, 247, 242, 0.7)"
                        : colors.text.muted,
                    }}
                  >
                    /month
                  </span>
                </div>

                {/* Yearly pricing */}
                {tier.yearlyPrice > 0 && (
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: tier.highlighted ? colors.camel : colors.camel,
                      marginTop: spacing.padding.xs,
                    }}
                  >
                    ${tier.yearlyPrice}/year — Save ${tier.yearlySavings}
                  </p>
                )}

                {/* Note (e.g., "No credit card required") */}
                {tier.note && (
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      color: tier.highlighted
                        ? "rgba(250, 247, 242, 0.6)"
                        : colors.text.muted,
                      marginTop: spacing.padding.xs,
                      fontStyle: "italic",
                    }}
                  >
                    {tier.note}
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={tier.ctaHref}
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  letterSpacing: typography.letterSpacing.wide,
                  textTransform: "uppercase",
                  padding: `${spacing.padding.md} ${spacing.padding.lg}`,
                  background: tier.highlighted ? colors.cream : colors.charcoal,
                  color: tier.highlighted ? colors.charcoal : colors.cream,
                  textDecoration: "none",
                  marginBottom: spacing.padding.lg,
                  transition: "all 0.3s ease",
                }}
              >
                {tier.cta}
              </Link>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: tier.highlighted
                    ? "rgba(250, 247, 242, 0.2)"
                    : colors.border.divider,
                  marginBottom: spacing.padding.lg,
                }}
              />

              {/* Features List */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.gap.sm,
                }}
              >
                {tier.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: spacing.gap.sm,
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: tier.highlighted
                        ? "rgba(250, 247, 242, 0.9)"
                        : colors.text.secondary,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section
        style={{
          background: colors.background.card,
          borderTop: `1px solid ${colors.border.divider}`,
          padding: `${spacing.padding["3xl"]} ${spacing.padding["2xl"]}`,
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.featureH2,
              fontWeight: typography.fontWeight.light,
              textAlign: "center",
              marginBottom: spacing.padding.xl,
            }}
          >
            Frequently Asked Questions
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.gap.lg,
            }}
          >
            {[
              {
                q: "Can I upgrade or downgrade at any time?",
                a: "Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the end of your current billing period.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes! Both Professional and Deluxe plans include a 14-day free trial. No credit card required to start.",
              },
              {
                q: "What happens to my photos if I downgrade?",
                a: "Your photos are safe. If you exceed the new plan's limit, you won't be able to upload new photos until you're within the limit, but existing photos remain visible.",
              },
              {
                q: "Can I use my own domain name?",
                a: "Custom domains are available on the Deluxe plan. You can connect a domain you already own or purchase one through us.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a full refund within 30 days of your first payment if you're not satisfied. Annual plans can be refunded prorated.",
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
          textAlign: "center",
          padding: `${spacing.padding["3xl"]} ${spacing.padding["2xl"]}`,
          maxWidth: "600px",
          margin: "0 auto",
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
          href="/signup"
          style={{
            display: "inline-block",
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            letterSpacing: typography.letterSpacing.wider,
            textTransform: "uppercase",
            padding: `${spacing.padding.md} ${spacing.padding.xl}`,
            background: colors.charcoal,
            color: colors.cream,
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
        >
          Start Free Today
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${colors.border.divider}`,
          padding: `${spacing.padding.xl} ${spacing.padding["2xl"]}`,
          textAlign: "center",
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