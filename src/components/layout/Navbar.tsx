"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { colors, typography, spacing, zIndex } from "@/styles/tokens";

interface NavLink {
  label: string;
  href: string;
}

interface UserInfo {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

type UserPlan = "free" | "professional" | "deluxe" | "trial";

interface NavbarProps {
  links?: NavLink[];
  showLinks?: boolean;
  variant?: "transparent" | "solid";
  isAuthenticated?: boolean;
  user?: UserInfo;
  userPlan?: UserPlan;
  onSignOut?: () => void;
}

const publicLinks: NavLink[] = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Examples", href: "/examples" },
  { label: "Contact", href: "/#contact" },
];

const authenticatedLinks: NavLink[] = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Examples", href: "/examples" },
  { label: "Support", href: "/support" },
];

// Get initials from name or email
function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

export function Navbar({ 
  links,
  showLinks = true,
  variant = "transparent",
  isAuthenticated = false,
  user,
  userPlan = "free",
  onSignOut,
}: NavbarProps) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

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

  // Use provided links, or default based on auth status
  const navLinks = links ?? (isAuthenticated ? authenticatedLinks : publicLinks);
  const initials = getInitials(user?.name, user?.email);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    if (onSignOut) {
      onSignOut();
    } else {
      // Default sign out behavior - call the logout API
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    }
  };

  return (
    <nav
      style={{
        position: variant === "transparent" ? "fixed" : "relative",
        top: 0,
        left: 0,
        right: 0,
        padding: `${spacing.padding.lg} ${spacing.padding["2xl"]}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: zIndex.nav,
        background: variant === "transparent" 
          ? `linear-gradient(to bottom, ${colors.background.primary} 60%, transparent)`
          : colors.background.primary,
        borderBottom: variant === "solid" 
          ? `1px solid ${colors.border.divider}` 
          : "none",
      }}
    >
      <Link
        href="/"
        className={loaded ? "fade-up delay-1" : ""}
        style={{
          fontSize: typography.fontSize.logo,
          fontWeight: typography.fontWeight.light,
          letterSpacing: typography.letterSpacing.widest,
          textTransform: "uppercase",
          textDecoration: "none",
          color: colors.text.primary,
          fontFamily: typography.fontFamily.display,
        }}
      >
        Pose & Poise
      </Link>

      {showLinks && (
        <div 
          className="nav-links" 
          style={{ 
            display: "flex", 
            alignItems: "center",
            gap: spacing.gap.xl,
          }}
        >
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className={`pp-nav-link ${loaded ? `fade-up delay-${i + 2}` : ""}`}
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.tertiary,
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Auth Links */}
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.lg }}>
              {/* Upgrade CTA - Show for Free, Professional, or Trial plans */}
              {(userPlan === "free" || userPlan === "professional" || userPlan === "trial") && (
                <Link
                  href="/pricing"
                  className={loaded ? "fade-up delay-5" : ""}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    fontWeight: 500,
                    letterSpacing: typography.letterSpacing.wider,
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    background: `linear-gradient(135deg, #FF7AA2 0%, ${colors.accent.solid} 100%)`,
                    color: "#FFFFFF",
                    textDecoration: "none",
                    borderRadius: "6px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 8px rgba(255, 122, 162, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 122, 162, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 122, 162, 0.25)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {userPlan === "professional" ? "Go Deluxe" : "Upgrade"}
                </Link>
              )}
              
              {/* User Avatar with Dropdown */}
              <div 
                ref={dropdownRef}
                className={loaded ? "fade-up delay-6" : ""}
                style={{ position: "relative" }}
              >
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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
                        border: `2px solid ${colors.border.divider}`,
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.text.tertiary} strokeWidth="1.5">
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.text.tertiary} strokeWidth="1.5">
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.text.tertiary} strokeWidth="1.5">
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5">
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
                className={`pp-nav-link ${loaded ? "fade-up delay-5" : ""}`}
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.text.tertiary,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={loaded ? "fade-up delay-5" : ""}
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
        </div>
      )}
    </nav>
  );
}