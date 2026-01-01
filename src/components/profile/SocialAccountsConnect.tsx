'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { colors, typography, spacing } from '@/styles/tokens';

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  displayName: string;
  profileUrl: string;
  profilePicture: string;
  isActive: boolean;
  tokenExpiresAt: string;
}

interface SocialAccountsConnectProps {
  onAccountConnected?: (platform: string, username: string) => void;
}

export function SocialAccountsConnect({ onAccountConnected }: SocialAccountsConnectProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch connected accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/social/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data.accounts || []);
      
      // Notify parent of connected accounts
      if (onAccountConnected) {
        data.accounts?.forEach((account: SocialAccount) => {
          onAccountConnected(account.platform, account.username);
        });
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  }, [onAccountConnected]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Generate connection URL and open in new window
  const handleConnect = async (platform: 'instagram' | 'tiktok') => {
    setConnecting(platform);
    setError(null);

    try {
      const response = await fetch('/api/social/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate connection URL');
      }

      const data = await response.json();
      
      // Open OAuth flow in new window
      const popup = window.open(data.connect_url, '_blank', 'width=600,height=700');
      
      // Poll for account connection (simple approach)
      if (popup) {
        const pollInterval = setInterval(async () => {
          try {
            // Check if popup is closed
            if (popup.closed) {
              clearInterval(pollInterval);
              // Refresh accounts after popup closes
              await fetchAccounts();
              setConnecting(null);
            }
          } catch {
            // Cross-origin errors are expected, ignore them
          }
        }, 1000);

        // Clear interval after 5 minutes max
        setTimeout(() => {
          clearInterval(pollInterval);
          setConnecting(null);
        }, 300000);
      }
    } catch (err) {
      console.error('Error connecting:', err);
      setError(`Failed to connect ${platform}`);
      setConnecting(null);
    }
  };

  const instagramAccount = accounts.find(a => a.platform === 'instagram');
  const tiktokAccount = accounts.find(a => a.platform === 'tiktok');

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.gap.sm,
    padding: '12px 20px',
    background: colors.charcoal,
    color: colors.cream,
    border: 'none',
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: 400,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const connectedStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.gap.md,
    padding: '12px 16px',
    background: 'rgba(196, 164, 132, 0.1)',
    border: `1px solid ${colors.accent.light}`,
  };

  const platformIconStyle = {
    width: '20px',
    height: '20px',
    opacity: 0.9,
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.padding.md, color: colors.text.muted }}>
        Loading connected accounts...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap.md }}>
      {error && (
        <div style={{
          padding: spacing.padding.sm,
          background: 'rgba(220, 53, 69, 0.1)',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          color: '#dc3545',
          fontSize: typography.fontSize.bodySmall,
          fontFamily: typography.fontFamily.body,
        }}>
          {error}
        </div>
      )}

      {/* Instagram */}
      <div>
        <label style={{
          display: 'block',
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.caption,
          fontWeight: 400,
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: spacing.padding.xs,
        }}>
          Instagram
        </label>
        {instagramAccount ? (
          <div style={connectedStyle}>
            {instagramAccount.profilePicture && (
              <Image
                src={instagramAccount.profilePicture}
                alt={instagramAccount.displayName}
                width={36}
                height={36}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.body,
                color: colors.text.primary,
                margin: 0,
              }}>
                @{instagramAccount.username}
              </p>
              <p style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                margin: 0,
              }}>
                {instagramAccount.displayName}
              </p>
            </div>
            <span style={{
              fontSize: typography.fontSize.caption,
              color: colors.accent.solid,
              fontWeight: 500,
            }}>
              ✓ Connected
            </span>
          </div>
        ) : (
          <button
            onClick={() => handleConnect('instagram')}
            disabled={connecting === 'instagram'}
            style={{
              ...buttonStyle,
              opacity: connecting === 'instagram' ? 0.7 : 1,
              cursor: connecting === 'instagram' ? 'wait' : 'pointer',
            }}
          >
            <InstagramIcon style={platformIconStyle} />
            {connecting === 'instagram' ? 'Connecting...' : 'Connect Instagram'}
          </button>
        )}
      </div>

      {/* TikTok */}
      <div>
        <label style={{
          display: 'block',
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.caption,
          fontWeight: 400,
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: spacing.padding.xs,
        }}>
          TikTok
        </label>
        {tiktokAccount ? (
          <div style={connectedStyle}>
            {tiktokAccount.profilePicture && (
              <Image
                src={tiktokAccount.profilePicture}
                alt={tiktokAccount.displayName}
                width={36}
                height={36}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.body,
                color: colors.text.primary,
                margin: 0,
              }}>
                @{tiktokAccount.username}
              </p>
              <p style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                margin: 0,
              }}>
                {tiktokAccount.displayName}
              </p>
            </div>
            <span style={{
              fontSize: typography.fontSize.caption,
              color: colors.accent.solid,
              fontWeight: 500,
            }}>
              ✓ Connected
            </span>
          </div>
        ) : (
          <button
            onClick={() => handleConnect('tiktok')}
            disabled={connecting === 'tiktok'}
            style={{
              ...buttonStyle,
              opacity: connecting === 'tiktok' ? 0.7 : 1,
              cursor: connecting === 'tiktok' ? 'wait' : 'pointer',
            }}
          >
            <TikTokIcon style={platformIconStyle} />
            {connecting === 'tiktok' ? 'Connecting...' : 'Connect TikTok'}
          </button>
        )}
      </div>

      <p style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.caption,
        color: colors.text.muted,
        marginTop: spacing.padding.sm,
      }}>
        Connect your social accounts to auto-populate your handles and enable cross-posting features.
      </p>
    </div>
  );
}

// Instagram Icon
function InstagramIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

// TikTok Icon
function TikTokIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

