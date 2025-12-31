"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, typography, spacing, zIndex } from "@/styles/tokens";

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  links?: NavLink[];
  showLinks?: boolean;
  variant?: "transparent" | "solid";
  isAuthenticated?: boolean;
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

export function Navbar({ 
  links,
  showLinks = true,
  variant = "transparent",
  isAuthenticated = false,
}: NavbarProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Use provided links, or default based on auth status
  const navLinks = links ?? (isAuthenticated ? authenticatedLinks : publicLinks);

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