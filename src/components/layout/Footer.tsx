import Link from "next/link";
import { colors, typography, spacing } from "@/styles/tokens";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  links?: FooterLink[];
  showLinks?: boolean;
}

const defaultLinks: FooterLink[] = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/#contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer({ links = defaultLinks, showLinks = true }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="section-padding"
      style={{
        padding: `${spacing.padding.xl} ${spacing.padding["2xl"]}`,
        background: colors.background.primary,
        borderTop: `1px solid ${colors.border.divider}`,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: spacing.gap.lg,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: typography.fontSize.bodySmall,
            fontWeight: typography.fontWeight.light,
            letterSpacing: "3px",
            textTransform: "uppercase",
            textDecoration: "none",
            color: colors.text.primary,
            fontFamily: typography.fontFamily.display,
          }}
        >
          Pose & Poise
        </Link>

        {showLinks && links && links.length > 0 && (
          <div style={{ display: "flex", gap: spacing.gap.lg, alignItems: "center" }}>
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="pp-nav-link"
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  color: colors.text.muted,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.text.muted,
          }}
        >
          © {currentYear} Pose & Poise. All rights reserved.
        </p>
      </div>
    </footer>
  );
}