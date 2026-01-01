"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { colors, typography, spacing, effects, zIndex } from "@/styles/tokens";
import { FeatureCard, SectionLabel } from "@/components/ui";
import type { Feature } from "@/types";
import { Navbar, Footer, OnboardingBannerAuto } from "@/components/layout";
import { EmailSignupForm, ContactForm } from "@/components/forms";
import { CheckIcon } from "@/components/icons/Icons";

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAG: Set to false to hide the hero image
// ═══════════════════════════════════════════════════════════════════════════════
const SHOW_HERO_IMAGE = true;
const HERO_IMAGE_PATH = "/images/hero-model.jpg";

const FEATURES: Feature[] = [
  {
    num: "01",
    title: "Instant Portfolio",
    desc: "Upload your photos, add your stats, and have a polished portfolio live in minutes.",
  },
  {
    num: "02",
    title: "Digital Comp Cards",
    desc: "Generate beautiful, shareable comp cards that update automatically.",
  },
  {
    num: "03",
    title: "Agency Discovery",
    desc: "Get noticed by agencies and brands actively searching for fresh talent.",
  },
];

const PRICING_TIERS = [
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
      "Choose from layout templates",
      "Choose from color themes",
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

export default function LandingPage() {
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -100px 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    // Observe all elements with scroll animation classes
    const animatedElements = document.querySelectorAll(
      ".scroll-fade-up, .scroll-fade-in, .scroll-scale-in"
    );
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background.primary,
        fontFamily: typography.fontFamily.display,
        color: colors.text.primary,
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fade-up { animation: fadeUp 1s ease-out forwards; }
        .fade-in { animation: fadeIn 1.2s ease-out forwards; }
        
        .delay-1 { animation-delay: 0.2s; opacity: 0; }
        .delay-2 { animation-delay: 0.4s; opacity: 0; }
        .delay-3 { animation-delay: 0.6s; opacity: 0; }
        .delay-4 { animation-delay: 0.8s; opacity: 0; }
        .delay-5 { animation-delay: 1s; opacity: 0; }
        
        /* Scroll animations */
        .scroll-fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .scroll-fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scroll-fade-in {
          opacity: 0;
          transition: opacity 0.8s ease-out;
        }
        
        .scroll-fade-in.visible {
          opacity: 1;
        }
        
        .scroll-scale-in {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .scroll-scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }
        
        /* Stagger delays for children */
        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
        
        .pp-button:hover {
          background: ${colors.camel} !important;
          transform: translateY(-2px);
          box-shadow: ${effects.shadow.buttonHover};
        }
        
        .pp-button-accent:hover {
          background: ${colors.charcoal} !important;
          color: ${colors.cream} !important;
        }
        
        .pp-input:focus { border-color: ${colors.camel} !important; }
        .pp-input::placeholder { color: ${colors.text.muted}; letter-spacing: 1px; }
        
        .pp-feature-card:hover {
          transform: translateY(-5px);
          box-shadow: ${effects.shadow.cardHover};
          border-color: ${colors.accent.hover} !important;
        }
        
        .pp-nav-link:hover { color: ${colors.camel} !important; }
        
        .pp-pricing-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .pp-pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
        
        .pp-pricing-cta:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        @media (max-width: 1024px) {
          .hero-section { padding: 140px 32px 48px !important; }
          .hero-image-container { 
            width: clamp(200px, 30vw, 300px) !important;
            height: clamp(280px, 40vh, 400px) !important;
          }
        }
        
        @media (max-width: 768px) {
          .hero-section { padding: 120px 24px 40px !important; }
          .section-padding { padding: 48px 24px !important; }
          .nav-links { display: none !important; }
          .hero-form { flex-direction: column !important; align-items: stretch !important; }
          .pp-input { max-width: 100% !important; }
          .features-header { flex-direction: column !important; align-items: flex-start !important; }
          .hero-image-container { display: none !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .decorative-circle { display: none !important; }
        }
      `}</style>

      {/* Onboarding Banner - shows for logged-in users who haven't completed setup */}
      <OnboardingBannerAuto />

      {/* Navigation */}
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          minHeight: "auto",
          display: "flex",
          alignItems: "flex-start",
          padding: `180px ${spacing.padding["2xl"]} ${spacing.padding["3xl"]}`,
          position: "relative",
        }}
      >
        {/* Hero Image - subtle lifestyle photo */}
        {SHOW_HERO_IMAGE && (
          <div
            className={loaded ? "fade-in delay-3 hero-image-container" : "hero-image-container"}
            style={{
              position: "absolute",
              top: "160px",
              right: "5%",
              width: "clamp(260px, 25vw, 380px)",
              height: "clamp(360px, 45vh, 520px)",
              zIndex: zIndex.base,
              overflow: "hidden",
            }}
          >
            {/* Soft cream overlay for blend */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${colors.accent.wash} 0%, transparent 40%, transparent 60%, ${colors.cream}99 100%)`,
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
            {/* Subtle border frame */}
            <div
              style={{
                position: "absolute",
                inset: "-8px",
                border: `1px solid ${colors.accent.light}`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
            <img
              src={HERO_IMAGE_PATH}
              alt="Model in urban setting"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                filter: "saturate(0.85) contrast(0.95)",
                opacity: 0.9,
              }}
            />
          </div>
        )}
        
        {/* Fallback decorative element when image is hidden */}
        {!SHOW_HERO_IMAGE && (
          <div
            className={loaded ? "fade-in delay-3" : ""}
            style={{
              position: "absolute",
              top: "160px",
              right: "8%",
              width: "280px",
              height: "380px",
              background: `linear-gradient(135deg, ${colors.accent.wash} 0%, ${colors.accent.subtle} 100%)`,
              zIndex: zIndex.base,
            }}
          />
        )}
        
        {/* Decorative circle */}
        <div
          className={`decorative-circle ${loaded ? "fade-in delay-4" : ""}`}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: "120px",
            height: "120px",
            border: `1px solid ${colors.accent.light}`,
            borderRadius: effects.borderRadius.full,
            zIndex: zIndex.base,
          }}
        />

        <div style={{ maxWidth: "900px", position: "relative", zIndex: zIndex.above }}>
          <SectionLabel>
            <span className={loaded ? "fade-up delay-1" : ""}>
              The Portfolio Platform for Models
            </span>
          </SectionLabel>

          <h1
            className={loaded ? "fade-up delay-2" : ""}
            style={{
              fontSize: typography.fontSize.heroH1,
              fontWeight: typography.fontWeight.light,
              lineHeight: typography.lineHeight.tight,
              marginBottom: spacing.padding.xl,
              letterSpacing: typography.letterSpacing.tight,
            }}
          >
            Your craft,
            <br />
            <em style={{ fontWeight: typography.fontWeight.light }}>beautifully</em> presented
          </h1>

          <p
            className={loaded ? "fade-up delay-3" : ""}
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodyLarge,
              fontWeight: typography.fontWeight.light,
              lineHeight: typography.lineHeight.loose,
              color: colors.text.secondary,
              maxWidth: "480px",
              marginBottom: spacing.padding["2xl"],
            }}
          >
            Create a stunning portfolio that captures your essence. Share your comp cards, get
            discovered by top agencies, and book your next opportunity—all in one place.
          </p>

          <EmailSignupForm />
          
          <p
            className={loaded ? "fade-up delay-5" : ""}
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.label,
              color: colors.text.muted,
              marginTop: spacing.padding.md,
            }}
          >
            Join 2,400+ models already on the platform
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="section-padding"
        style={{
          padding: `${spacing.padding["3xl"]} ${spacing.padding["2xl"]}`,
          background: colors.background.section,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            className="features-header scroll-fade-up"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: spacing.padding["2xl"],
              flexWrap: "wrap",
              gap: spacing.gap.xl,
            }}
          >
            <div>
              <SectionLabel>Why Choose Us</SectionLabel>
              <h2
                style={{
                  fontSize: typography.fontSize.featureH2,
                  fontWeight: typography.fontWeight.light,
                  lineHeight: typography.lineHeight.snug,
                }}
              >
                Built for the
                <br />
                modern model
              </h2>
            </div>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.light,
                color: colors.text.tertiary,
                maxWidth: "360px",
                lineHeight: typography.lineHeight.loose,
              }}
            >
              Everything you need to showcase your work, connect with clients, and manage your
              modeling career.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: spacing.gap.md,
            }}
          >
            {FEATURES.map((feature, index) => (
              <div 
                key={feature.num} 
                className={`scroll-fade-up stagger-${index + 1}`}
              >
                <FeatureCard
                  num={feature.num}
                  title={feature.title}
                  description={feature.desc}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="section-padding"
        style={{
          padding: `${spacing.padding["3xl"]} ${spacing.padding["2xl"]}`,
          background: colors.background.primary,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Pricing Header */}
          <div className="scroll-fade-up" style={{ textAlign: "center", marginBottom: spacing.padding["2xl"] }}>
            <SectionLabel>Pricing</SectionLabel>
            <h2
              style={{
                fontSize: typography.fontSize.featureH2,
                fontWeight: typography.fontWeight.light,
                lineHeight: typography.lineHeight.snug,
                marginBottom: spacing.padding.md,
              }}
            >
              Simple, transparent pricing
            </h2>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.light,
                color: colors.text.secondary,
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              Start for free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div
            className="pricing-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: spacing.gap.lg,
              alignItems: "stretch",
            }}
          >
            {PRICING_TIERS.map((tier, index) => (
              <div
                key={tier.name}
                className={`pp-pricing-card scroll-scale-in stagger-${index + 1}`}
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
                      ${tier.price}
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
                        color: colors.camel,
                        marginTop: spacing.padding.xs,
                      }}
                    >
                      ${tier.yearlyPrice}/year — Save ${tier.yearlySavings}
                    </p>
                  )}

                  {/* Note */}
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
                  className="pp-pricing-cta"
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
                          color: colors.camel,
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
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="section-padding"
        style={{
          padding: `${spacing.padding["3xl"]} ${spacing.padding["2xl"]}`,
          background: colors.background.dark,
          color: colors.textLight.primary,
          textAlign: "center",
        }}
      >
        <div className="scroll-fade-up">
          <SectionLabel color={colors.camel}>Ready to Begin?</SectionLabel>
          <h2
            style={{
              fontSize: typography.fontSize.sectionH2,
              fontWeight: typography.fontWeight.light,
              lineHeight: typography.lineHeight.snug,
              marginBottom: spacing.padding.md,
            }}
          >
            Your portfolio awaits
          </h2>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              fontWeight: typography.fontWeight.light,
              color: colors.textLight.secondary,
              marginBottom: spacing.padding["2xl"],
            }}
          >
            Free to start. No credit card required.
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
              background: colors.cream,
              color: colors.charcoal,
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
            className="pp-button-accent"
          >
            Create Your Portfolio
          </Link>
        </div>
      </section>

      {/* Contact Form */}
      <section 
        id="contact" 
        className="section-padding"
        style={{ 
          padding: `${spacing.padding["3xl"]} ${spacing.padding["2xl"]}`,
          background: colors.background.primary,
        }}
      >
        <div className="scroll-fade-up" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <SectionLabel>Get in Touch</SectionLabel>
          <h2
            style={{
              fontSize: typography.fontSize.featureH2,
              fontWeight: typography.fontWeight.light,
              lineHeight: typography.lineHeight.snug,
              marginBottom: spacing.padding.xl,
            }}
          >
            Contact Us
          </h2>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}