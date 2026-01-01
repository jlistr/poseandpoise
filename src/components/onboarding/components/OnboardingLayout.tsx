'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { colors, fonts } from '../types';

// ============================================================================
// Icons
// ============================================================================

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

// ============================================================================
// Layout Component
// ============================================================================

interface OnboardingLayoutProps {
  children: React.ReactNode;
  userInitials?: string;
  profilePhoto?: string | null;
}

export function OnboardingLayout({ children, userInitials = 'U', profilePhoto }: OnboardingLayoutProps): React.JSX.Element {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.cream,
        fontFamily: fonts.body,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: '14px',
            letterSpacing: '0.2em',
            color: colors.textPrimary,
          }}
        >
          POSE & POISE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: colors.camel,
              color: colors.white,
              border: 'none',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <SparklesIcon size={14} />
            UPGRADE
          </button>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: profilePhoto ? 'transparent' : colors.charcoal,
              color: colors.cream,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 500,
              overflow: 'hidden',
              border: profilePhoto ? `2px solid ${colors.camel}` : 'none',
            }}
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              userInitials
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '42rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: '3rem',
          paddingBottom: '8rem',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          backgroundColor: colors.cream,
          borderTop: `1px solid ${colors.border}`,
          fontSize: '12px',
          color: colors.textMuted,
        }}
      >
        <span style={{ fontFamily: fonts.heading, letterSpacing: '0.15em' }}>
          POSE & POISE
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a>
          <a href="/dashboard/support" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
          <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
        </div>
        <span>© 2025 Pose & Poise. All rights reserved.</span>
      </footer>
    </div>
  );
}

