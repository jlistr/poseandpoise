'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './DashboardHeader.module.css';

type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'DELUXE' | null;

interface DashboardHeaderProps {
  userEmail?: string;
  userName?: string;
  username?: string; // The user's profile username for portfolio URL
  subscriptionTier?: SubscriptionTier;
  avatarUrl?: string | null;
}

export function DashboardHeader({ userEmail, userName, username, subscriptionTier, avatarUrl }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = userName || userEmail?.split('@')[0] || 'User';
  const previewUrl = username ? `/preview/${username}` : null;
  
  // Determine tier display info
  const tierInfo = {
    FREE: { label: 'Free', className: styles.tierBadgeFree, icon: null },
    PROFESSIONAL: { label: 'Pro', className: styles.tierBadgePro, icon: <CrownIcon /> },
    DELUXE: { label: 'Deluxe', className: styles.tierBadgeDeluxe, icon: <SparkleIcon /> },
  };
  const currentTier = subscriptionTier && subscriptionTier !== 'FREE' 
    ? tierInfo[subscriptionTier] 
    : tierInfo.FREE;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <Link href="/dashboard" className={styles.logo}>
          Pose & Poise
        </Link>

        {/* Right Side */}
        <div className={styles.headerRight}>
          {/* View Portfolio Link */}
          {previewUrl ? (
            <Link href={previewUrl} className={styles.previewLink}>
              <EyeIcon />
              <span>Preview Portfolio</span>
            </Link>
          ) : (
            <span className={styles.previewLinkDisabled}>
              <EyeIcon />
              <span>Set username to preview</span>
            </span>
          )}

          {/* User Menu */}
          <div className={styles.userMenu}>
            <button
              type="button"
              className={styles.userButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              {/* Subscription Tier Badge (next to avatar for Pro/Deluxe) */}
              {subscriptionTier && subscriptionTier !== 'FREE' && (
                <span className={`${styles.headerTierBadge} ${currentTier.className}`}>
                  {currentTier.icon}
                  {currentTier.label}
                </span>
              )}
              {avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt={displayName} 
                  width={36} 
                  height={36} 
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatar}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <ChevronIcon isOpen={isMenuOpen} />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className={styles.menuOverlay} 
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{displayName}</p>
                    {userEmail && (
                      <p className={styles.dropdownEmail}>{userEmail}</p>
                    )}
                    {/* Subscription Tier Badge in Dropdown */}
                    <span className={`${styles.tierBadge} ${currentTier.className}`}>
                      {currentTier.icon}
                      {currentTier.label} Plan
                    </span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link 
                    href="/settings" 
                    className={styles.dropdownItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <SettingsIcon />
                    Settings
                  </Link>
                  <Link 
                    href="/dashboard/support" 
                    className={styles.dropdownItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <SupportIcon />
                    Support
                  </Link>
                  <Link 
                    href="/" 
                    className={styles.dropdownItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HomeIcon />
                    Back to Home
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <form action="/auth/signout" method="post">
                    <button type="submit" className={styles.dropdownItem}>
                      <LogoutIcon />
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Icons
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      style={{ 
        transition: 'transform 0.2s ease',
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17l3-12 6 6 6-6 3 12H3z" />
      <rect x="3" y="18" width="18" height="2" rx="1" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  );
}