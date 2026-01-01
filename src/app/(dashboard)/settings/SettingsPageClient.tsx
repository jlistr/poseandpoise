"use client";

import Link from "next/link";
import { colors, typography, spacing } from "@/styles/tokens";

const settingsLinks = [
  {
    href: "/settings/billing",
    title: "Billing & Subscription",
    description: "Manage your subscription plan and payment methods",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: "/settings/connected-accounts",
    title: "Connected Accounts",
    description: "Manage your social login connections (Google, Facebook)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/settings/social-profiles",
    title: "Social Profiles",
    description: "Connect and verify your social media accounts (Instagram, TikTok)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="18" cy="6" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function SettingsPageClient() {
  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.padding.xl }}>
        <h1
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.sectionH2,
            fontWeight: typography.fontWeight.light,
            color: colors.text.primary,
            marginBottom: spacing.padding.sm,
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.secondary,
          }}
        >
          Manage your account preferences and connected services.
        </p>
      </div>

      {/* Settings Links */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.gap.md,
        }}
      >
        {settingsLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.gap.lg,
              padding: spacing.padding.lg,
              backgroundColor: colors.background.card,
              borderRadius: "12px",
              border: `1px solid ${colors.border.divider}`,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = colors.charcoal;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = colors.border.divider;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(26, 26, 26, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.text.tertiary,
                flexShrink: 0,
              }}
            >
              {link.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: typography.fontSize.cardH3,
                  fontWeight: typography.fontWeight.regular,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {link.title}
              </h2>
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.text.muted,
                  margin: "4px 0 0 0",
                }}
              >
                {link.description}
              </p>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.text.tertiary}
              strokeWidth="1.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

