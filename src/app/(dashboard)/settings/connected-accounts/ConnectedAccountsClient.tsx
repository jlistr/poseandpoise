"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { colors, typography, spacing } from "@/styles/tokens";

interface Identity {
  id: string;
  provider: string;
  identityId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string | null;
}

interface ConnectedAccountsClientProps {
  initialIdentities: Identity[];
  canUnlink: boolean;
  userEmail: string;
}

// Provider display info
const PROVIDER_INFO: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  google: {
    name: "Google",
    color: "#4285F4",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  email: {
    name: "Email",
    color: "#1A1A1A",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M22 7l-10 6L2 7"/>
      </svg>
    ),
  },
  tiktok: {
    name: "TikTok",
    color: "#000000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
  },
};

function getProviderInfo(provider: string) {
  return PROVIDER_INFO[provider] || {
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    color: "#666666",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
  };
}

export function ConnectedAccountsClient({ 
  initialIdentities, 
  canUnlink: initialCanUnlink,
  userEmail 
}: ConnectedAccountsClientProps) {
  const router = useRouter();
  const [identities, setIdentities] = useState(initialIdentities);
  const [canUnlink, setCanUnlink] = useState(initialCanUnlink);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDisconnect = async (identity: Identity) => {
    if (!canUnlink) {
      setError("You cannot disconnect your only login method. Add another login method first.");
      return;
    }

    setDisconnecting(identity.identityId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/identities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identityId: identity.identityId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect account");
      }

      // Update local state
      const updatedIdentities = identities.filter(i => i.identityId !== identity.identityId);
      setIdentities(updatedIdentities);
      setCanUnlink(updatedIdentities.length > 1);
      setSuccess(`Successfully disconnected ${getProviderInfo(identity.provider).name}`);
      
      // Refresh the page data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect account");
    } finally {
      setDisconnecting(null);
    }
  };

  const handleConnect = async (provider: "google" | "facebook") => {
    setConnecting(provider);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      
      // Use linkIdentity to connect a new provider
      const { error: linkError } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/settings/connected-accounts`,
        },
      });

      if (linkError) {
        throw linkError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect account");
      setConnecting(null);
    }
  };

  // Check which providers are already connected
  const connectedProviders = new Set(identities.map(i => i.provider));

  // Available providers to connect
  const availableProviders = ["google", "facebook"].filter(
    p => !connectedProviders.has(p)
  );

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
          Connected Accounts
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.secondary,
          }}
        >
          Manage your social login connections. You can link multiple accounts for easier access.
        </p>
      </div>

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
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: "#DC2626",
              margin: 0,
            }}
          >
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
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: "#16A34A",
              margin: 0,
            }}
          >
            {success}
          </p>
        </div>
      )}

      {/* Connected Accounts Section */}
      <div
        style={{
          backgroundColor: colors.background.card,
          borderRadius: "12px",
          border: `1px solid ${colors.border.divider}`,
          overflow: "hidden",
          marginBottom: spacing.padding.xl,
        }}
      >
        <div
          style={{
            padding: spacing.padding.lg,
            borderBottom: `1px solid ${colors.border.divider}`,
          }}
        >
          <h2
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.cardH3,
              fontWeight: typography.fontWeight.regular,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            Connected
          </h2>
        </div>

        <div>
          {identities.map((identity, index) => {
            const providerInfo = getProviderInfo(identity.provider);
            const isDisconnecting = disconnecting === identity.identityId;

            return (
              <div
                key={identity.identityId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: spacing.padding.lg,
                  borderBottom: index < identities.length - 1 ? `1px solid ${colors.border.divider}` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.md }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: `${providerInfo.color}10`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {providerInfo.icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.body,
                        fontWeight: 500,
                        color: colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {providerInfo.name}
                    </p>
                    <p
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.caption,
                        color: colors.text.muted,
                        margin: "2px 0 0 0",
                      }}
                    >
                      {identity.email || userEmail}
                    </p>
                  </div>
                </div>

                {canUnlink && identity.provider !== "email" ? (
                  <button
                    onClick={() => handleDisconnect(identity)}
                    disabled={isDisconnecting}
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      fontWeight: 500,
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      backgroundColor: isDisconnecting ? "rgba(220, 38, 38, 0.1)" : "transparent",
                      color: "#DC2626",
                      cursor: isDisconnecting ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      opacity: isDisconnecting ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isDisconnecting) {
                        e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisconnecting) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                ) : (
                  <span
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      color: colors.text.muted,
                      padding: "8px 16px",
                    }}
                  >
                    {identities.length === 1 ? "Primary" : "Connected"}
                  </span>
                )}
              </div>
            );
          })}

          {identities.length === 0 && (
            <div
              style={{
                padding: spacing.padding.xl,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.body,
                  color: colors.text.muted,
                  margin: 0,
                }}
              >
                No connected accounts found.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Connect More Accounts Section */}
      {availableProviders.length > 0 && (
        <div
          style={{
            backgroundColor: colors.background.card,
            borderRadius: "12px",
            border: `1px solid ${colors.border.divider}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: spacing.padding.lg,
              borderBottom: `1px solid ${colors.border.divider}`,
            }}
          >
            <h2
              style={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Connect More Accounts
            </h2>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                margin: "4px 0 0 0",
              }}
            >
              Link additional accounts for easier sign-in options
            </p>
          </div>

          <div>
            {availableProviders.map((provider, index) => {
              const providerInfo = getProviderInfo(provider);
              const isConnecting = connecting === provider;

              return (
                <div
                  key={provider}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: spacing.padding.lg,
                    borderBottom: index < availableProviders.length - 1 ? `1px solid ${colors.border.divider}` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.md }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: `${providerInfo.color}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {providerInfo.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.body,
                          fontWeight: 500,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        {providerInfo.name}
                      </p>
                      <p
                        style={{
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.caption,
                          color: colors.text.muted,
                          margin: "2px 0 0 0",
                        }}
                      >
                        Not connected
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnect(provider as "google" | "facebook")}
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
                      backgroundColor: isConnecting ? colors.charcoal : colors.charcoal,
                      color: colors.cream,
                      cursor: isConnecting ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      opacity: isConnecting ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isConnecting) {
                        e.currentTarget.style.backgroundColor = "#333";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isConnecting) {
                        e.currentTarget.style.backgroundColor = colors.charcoal;
                      }
                    }}
                  >
                    {isConnecting ? "Connecting..." : "Connect"}
                  </button>
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
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.text.secondary,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          <strong>Note:</strong> You must have at least one connected account to sign in. 
          If you want to disconnect an account, make sure you have another login method connected first.
        </p>
      </div>
    </div>
  );
}

