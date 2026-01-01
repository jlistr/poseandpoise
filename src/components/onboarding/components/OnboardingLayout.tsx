'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { colors, fonts } from '../types';

// ============================================================================
// Icons
// ============================================================================

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const LogOutIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ============================================================================
// Layout Component
// ============================================================================

interface OnboardingLayoutProps {
  children: React.ReactNode;
  userInitials?: string;
  profilePhoto?: string | null;
  userName?: string;
  userEmail?: string;
  subscriptionTier?: string;
}

export function OnboardingLayout({ 
  children, 
  userInitials = 'U', 
  profilePhoto,
  userName,
  userEmail,
  subscriptionTier = 'FREE'
}: OnboardingLayoutProps): React.JSX.Element {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setSigningOut(false);
    }
  };

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
          {/* Avatar with Dropdown Menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
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
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label="User menu"
              aria-expanded={menuOpen}
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
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '220px',
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* User Info Header */}
                <div style={{
                  padding: '16px',
                  borderBottom: `1px solid ${colors.border}`,
                  backgroundColor: colors.cream,
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: colors.textPrimary,
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {userName || 'User'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.textMuted,
                    marginBottom: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {userEmail}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    backgroundColor: colors.camel,
                    color: colors.white,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}>
                    {subscriptionTier}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '14px',
                    fontFamily: fonts.body,
                    color: colors.textPrimary,
                    cursor: signingOut ? 'wait' : 'pointer',
                    textAlign: 'left',
                    opacity: signingOut ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.cream)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOutIcon size={16} />
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
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

