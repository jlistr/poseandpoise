"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, typography, spacing } from "@/styles/tokens";

interface OnboardingBannerProps {
  userName?: string | null;
}

/**
 * Static banner component - renders when data is provided
 */
export function OnboardingBanner({ userName }: OnboardingBannerProps) {
  return (
    <div
      style={{
        backgroundColor: colors.camel,
        padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 150, // Above nav (which is 100)
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
        {/* Icon */}
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

        {/* Message */}
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            color: colors.charcoal,
            margin: 0,
            textAlign: "center",
          }}
        >
          {userName ? `Hey ${userName}! ` : ""}
          Complete your profile setup to unlock your dashboard, portfolio builder, and more.
        </p>

        {/* CTA Button */}
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
            transition: "all 0.2s ease",
          }}
        >
          Continue Setup
        </Link>
      </div>
    </div>
  );
}

/**
 * Self-contained banner that fetches its own status
 * Use this when you can't pass props from a server component
 * Includes a spacer to push content down when banner is visible
 */
export function OnboardingBannerAuto() {
  const [status, setStatus] = useState<{
    isLoggedIn: boolean;
    onboardingCompleted: boolean | null;
    displayName: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/user/onboarding-status');
        const data = await res.json();
        setStatus(data);
      } catch {
        // Silently fail - don't show banner if we can't fetch
        setStatus({ isLoggedIn: false, onboardingCompleted: null, displayName: null });
      }
    }
    fetchStatus();
  }, []);

  // Don't render anything while loading or if not applicable
  if (!status || !status.isLoggedIn || status.onboardingCompleted) {
    return null;
  }

  return (
    <>
      <OnboardingBanner userName={status.displayName} />
      {/* Spacer to push content below the fixed banner */}
      <div style={{ height: "52px" }} />
    </>
  );
}

