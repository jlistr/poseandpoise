"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

interface NavbarProps {
  links?: NavLink[];
  showLinks?: boolean;
  variant?: "transparent" | "solid";
  isAuthenticated?: boolean;
  user?: UserInfo;
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
}: NavbarProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Use provided links, or default based on auth status
  const navLinks = links ?? (isAuthenticated ? authenticatedLinks : publicLinks);
  const initials = getInitials(user?.name, user?.email);

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
              <Link
                href="/dashboard"
                className={`pp-nav-link ${loaded ? "fade-up delay-5" : ""}`}
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.text.tertiary,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                Dashboard
              </Link>
              
              {/* User Avatar */}
              <Link
                href="/dashboard/settings"
                className={loaded ? "fade-up delay-6" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                }}
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
                {user?.name && (
                  <span
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: colors.text.primary,
                    }}
                  >
                    {user.name}
                  </span>
                )}
              </Link>
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