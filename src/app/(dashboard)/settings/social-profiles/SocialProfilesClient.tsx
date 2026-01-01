"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { colors, typography, spacing } from "@/styles/tokens";

interface SocialConnection {
  id: string;
  platform: string;
  username: string | null;
  displayName: string | null;
  profileUrl: string | null;
  profileImageUrl: string | null;
  followerCount: number | null;
  followingCount: number | null;
  verified: boolean;
  connectedAt: string | null;
  lastSyncedAt: string | null;
}

interface SocialProfilesClientProps {
  initialConnections: SocialConnection[];
  subscriptionTier: string;
  manualInstagram?: string | null;
  manualTiktok?: string | null;
  isFeatureEnabled: boolean;
}

// Platform configuration
const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#000000',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

function formatNumber(num: number | null): string {
  if (!num) return '—';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function SocialProfilesClient({ 
  initialConnections, 
  subscriptionTier,
  manualInstagram,
  manualTiktok,
  isFeatureEnabled,
}: SocialProfilesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState(initialConnections);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle URL params for success/error messages
  useEffect(() => {
    const successPlatform = searchParams.get('success');
    const errorType = searchParams.get('error');

    if (successPlatform) {
      const platform = PLATFORMS.find(p => p.id === successPlatform);
      setSuccess(`Successfully connected ${platform?.name || successPlatform}!`);
      router.replace('/settings/social-profiles');
      router.refresh();
    }

    if (errorType) {
      const errorMessages: Record<string, string> = {
        oauth_denied: 'You denied access to the social account.',
        invalid_callback: 'Invalid callback. Please try again.',
        invalid_state: 'Session expired. Please try again.',
        connection_failed: 'Failed to connect account. Please try again.',
      };
      setError(errorMessages[errorType] || 'An error occurred.');
      router.replace('/settings/social-profiles');
    }
  }, [searchParams, router]);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/social-profiles/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate connection');
      }

      // Redirect to OAuth flow
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: string, platform: string) => {
    setDisconnecting(connectionId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/social-profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      setConnections(prev => prev.filter(c => c.id !== connectionId));
      setSuccess(`Disconnected ${PLATFORMS.find(p => p.id === platform)?.name || platform}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  };

  // Get connected platforms
  const connectedPlatforms = new Set(connections.map(c => c.platform));

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
          Social Profiles
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.secondary,
          }}
        >
          Connect your social media accounts to verify ownership and display follower counts on your portfolio.
        </p>
      </div>

      {/* Feature Not Enabled Notice */}
      {!isFeatureEnabled && (
        <div
          style={{
            padding: spacing.padding.lg,
            marginBottom: spacing.padding.xl,
            backgroundColor: "rgba(196, 164, 132, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(196, 164, 132, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.gap.md }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.camel} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <h3
                style={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: typography.fontSize.cardH3,
                  fontWeight: typography.fontWeight.regular,
                  color: colors.text.primary,
                  margin: "0 0 4px 0",
                }}
              >
                Coming Soon
              </h3>
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.text.secondary,
                  margin: 0,
                }}
              >
                Verified social profile connections are coming soon! In the meantime, you can add your social handles manually in your Profile settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div
          style={{
            padding: spacing.padding.md,
            marginBottom: spacing.padding.lg,
            backgroundColor: "rgba(220, 38, 38, 0.08)",
            borderRadius: "8px",
            border: "1px solid rgba(220, 38, 38, 0.2)",
          }}
        >
          <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodySmall, color: "#DC2626", margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div
          style={{
            padding: spacing.padding.md,
            marginBottom: spacing.padding.lg,
            backgroundColor: "rgba(34, 197, 94, 0.08)",
            borderRadius: "8px",
            border: "1px solid rgba(34, 197, 94, 0.2)",
          }}
        >
          <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodySmall, color: "#16A34A", margin: 0 }}>
            {success}
          </p>
        </div>
      )}

      {/* Manual Entries Info */}
      {(manualInstagram || manualTiktok) && (
        <div
          style={{
            backgroundColor: colors.background.card,
            borderRadius: "12px",
            border: `1px solid ${colors.border.divider}`,
            overflow: "hidden",
            marginBottom: spacing.padding.xl,
          }}
        >
          <div style={{ padding: spacing.padding.lg, borderBottom: `1px solid ${colors.border.divider}` }}>
            <h2 style={{ fontFamily: typography.fontFamily.display, fontSize: typography.fontSize.cardH3, fontWeight: typography.fontWeight.regular, color: colors.text.primary, margin: 0 }}>
              Current Social Links
            </h2>
            <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.muted, margin: "4px 0 0 0" }}>
              Manually entered in your profile (not verified)
            </p>
          </div>
          <div style={{ padding: spacing.padding.lg }}>
            {manualInstagram && (
              <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.md, marginBottom: manualTiktok ? spacing.padding.md : 0 }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#E1306C10", display: "flex", alignItems: "center", justifyContent: "center", color: "#E1306C" }}>
                  {PLATFORMS.find(p => p.id === 'instagram')?.icon}
                </div>
                <div>
                  <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.body, fontWeight: 500, color: colors.text.primary, margin: 0 }}>
                    @{manualInstagram.replace('@', '')}
                  </p>
                  <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.muted, margin: "2px 0 0 0" }}>
                    Instagram • Not verified
                  </p>
                </div>
              </div>
            )}
            {manualTiktok && (
              <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.md }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#00000010", display: "flex", alignItems: "center", justifyContent: "center", color: "#000000" }}>
                  {PLATFORMS.find(p => p.id === 'tiktok')?.icon}
                </div>
                <div>
                  <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.body, fontWeight: 500, color: colors.text.primary, margin: 0 }}>
                    @{manualTiktok.replace('@', '')}
                  </p>
                  <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.muted, margin: "2px 0 0 0" }}>
                    TikTok • Not verified
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connected Accounts */}
      {connections.length > 0 && (
        <div
          style={{
            backgroundColor: colors.background.card,
            borderRadius: "12px",
            border: `1px solid ${colors.border.divider}`,
            overflow: "hidden",
            marginBottom: spacing.padding.xl,
          }}
        >
          <div style={{ padding: spacing.padding.lg, borderBottom: `1px solid ${colors.border.divider}` }}>
            <h2 style={{ fontFamily: typography.fontFamily.display, fontSize: typography.fontSize.cardH3, fontWeight: typography.fontWeight.regular, color: colors.text.primary, margin: 0 }}>
              Verified Accounts
            </h2>
          </div>
          <div>
            {connections.map((conn, index) => {
              const platform = PLATFORMS.find(p => p.id === conn.platform);
              const isDisconnecting = disconnecting === conn.id;

              return (
                <div
                  key={conn.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: spacing.padding.lg,
                    borderBottom: index < connections.length - 1 ? `1px solid ${colors.border.divider}` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.md }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: `${platform?.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: platform?.color,
                      }}
                    >
                      {conn.profileImageUrl ? (
                        <img
                          src={conn.profileImageUrl}
                          alt={conn.username || ''}
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        platform?.icon
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.body, fontWeight: 500, color: colors.text.primary, margin: 0 }}>
                          @{conn.username}
                        </p>
                        {conn.verified && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1D9BF0">
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                          </svg>
                        )}
                      </div>
                      <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.muted, margin: "2px 0 0 0" }}>
                        {platform?.name} • {formatNumber(conn.followerCount)} followers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(conn.id, conn.platform)}
                    disabled={isDisconnecting}
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      fontWeight: 500,
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      backgroundColor: "transparent",
                      color: "#DC2626",
                      cursor: isDisconnecting ? "not-allowed" : "pointer",
                      opacity: isDisconnecting ? 0.6 : 1,
                    }}
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connect Platforms */}
      {isFeatureEnabled && (
        <div
          style={{
            backgroundColor: colors.background.card,
            borderRadius: "12px",
            border: `1px solid ${colors.border.divider}`,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: spacing.padding.lg, borderBottom: `1px solid ${colors.border.divider}` }}>
            <h2 style={{ fontFamily: typography.fontFamily.display, fontSize: typography.fontSize.cardH3, fontWeight: typography.fontWeight.regular, color: colors.text.primary, margin: 0 }}>
              Connect a Platform
            </h2>
            <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.muted, margin: "4px 0 0 0" }}>
              Verify your social accounts and display follower counts
            </p>
          </div>
          <div>
            {PLATFORMS.map((platform, index) => {
              const isConnected = connectedPlatforms.has(platform.id);
              const isConnecting = connecting === platform.id;

              return (
                <div
                  key={platform.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: spacing.padding.lg,
                    borderBottom: index < PLATFORMS.length - 1 ? `1px solid ${colors.border.divider}` : "none",
                    opacity: isConnected ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.md }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: `${platform.color}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: platform.color,
                      }}
                    >
                      {platform.icon}
                    </div>
                    <div>
                      <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.body, fontWeight: 500, color: colors.text.primary, margin: 0 }}>
                        {platform.name}
                      </p>
                      <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.muted, margin: "2px 0 0 0" }}>
                        {isConnected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {!isConnected && (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting}
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
                        cursor: isConnecting ? "not-allowed" : "pointer",
                        opacity: isConnecting ? 0.6 : 1,
                      }}
                    >
                      {isConnecting ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div
        style={{
          marginTop: spacing.padding.xl,
          padding: spacing.padding.lg,
          backgroundColor: "rgba(196, 164, 132, 0.08)",
          borderRadius: "8px",
          border: "1px solid rgba(196, 164, 132, 0.2)",
        }}
      >
        <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.secondary, margin: 0, lineHeight: 1.6 }}>
          <strong>Why verify?</strong> Verified social accounts show a checkmark badge and follower count on your portfolio, helping agencies and clients trust your online presence.
        </p>
      </div>
    </div>
  );
}

