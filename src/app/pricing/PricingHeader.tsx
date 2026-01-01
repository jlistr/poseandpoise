"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { colors, typography, spacing, zIndex } from "@/styles/tokens";
import type { PlanId } from "@/lib/stripe";

interface PricingHeaderProps {
  isLoggedIn: boolean;
  user: {
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  } | null;
  currentTier: PlanId | null;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "U";
}

export function PricingHeader({ isLoggedIn, user, currentTier }: PricingHeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(user?.name, user?.email);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    try {
      await fetch("/auth/signout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Determine if user should see upgrade button
  const showUpgrade = isLoggedIn && currentTier && currentTier !== "DELUXE";

  return (
    <header
      style={{
        padding: `${spacing.padding.md} ${spacing.padding["2xl"]}`,
        borderBottom: `1px solid ${colors.border.divider}`,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
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
              fontWeight: 500,
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

          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.lg }}>
              {/* User Avatar with Dropdown */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "24px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || "Profile"}
                      width={36}
                      height={36}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `2px solid ${colors.border.light}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: colors.charcoal,
                        color: colors.cream,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: typography.fontFamily.body,
                        fontSize: "12px",
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  {/* Dropdown arrow */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke={colors.text.tertiary}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      minWidth: "200px",
                      backgroundColor: colors.background.primary,
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                      border: `1px solid ${colors.border.divider}`,
                      overflow: "hidden",
                      zIndex: zIndex.modal,
                    }}
                  >
                    {/* User Info Header */}
                    <div
                      style={{
                        padding: "16px",
                        borderBottom: `1px solid ${colors.border.divider}`,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.bodySmall,
                          fontWeight: 500,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        {user?.name || "User"}
                      </p>
                      {user?.email && (
                        <p
                          style={{
                            fontFamily: typography.fontFamily.body,
                            fontSize: typography.fontSize.caption,
                            color: colors.text.muted,
                            margin: "4px 0 0 0",
                          }}
                        >
                          {user.email}
                        </p>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div style={{ padding: "8px 0" }}>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 16px",
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.bodySmall,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={colors.text.tertiary}
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="7" height="9" rx="1" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="12" width="7" height="9" rx="1" />
                          <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                        Dashboard
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 16px",
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.bodySmall,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={colors.text.tertiary}
                          strokeWidth="1.5"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                      </Link>

                      <Link
                        href="/support"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 16px",
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.bodySmall,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={colors.text.tertiary}
                          strokeWidth="1.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Help & Support
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div
                      style={{
                        padding: "8px 0",
                        borderTop: `1px solid ${colors.border.divider}`,
                      }}
                    >
                      <button
                        onClick={handleSignOut}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          width: "100%",
                          padding: "10px 16px",
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.bodySmall,
                          color: "#DC2626",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.06)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#DC2626"
                          strokeWidth="1.5"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16,17 21,12 16,7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

