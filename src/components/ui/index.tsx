"use client";

import { forwardRef, InputHTMLAttributes, ButtonHTMLAttributes } from "react";
import { colors, typography, spacing, effects, borders } from "@/styles/tokens";
import type { ButtonVariant } from "@/types";

/**
 * Button Component
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      border: "none",
      padding: `${spacing.padding.md} ${spacing.padding["2xl"]}`,
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.button,
      fontWeight: typography.fontWeight.regular,
      letterSpacing: typography.letterSpacing.wider,
      textTransform: "uppercase",
      cursor: "pointer",
      transition: effects.transition.button,
      position: "relative",
      overflow: "hidden",
    };

    const variants: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        background: colors.charcoal,
        color: colors.cream,
      },
      accent: {
        background: colors.camel,
        color: colors.charcoal,
      },
      outline: {
        background: "transparent",
        color: colors.charcoal,
        border: borders.input,
      },
      ghost: {
        background: "transparent",
        color: colors.charcoal,
      },
    };

    return (
      <button
        ref={ref}
        style={{ ...baseStyles, ...variants[variant], ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * Input Component
 */
interface InputComponentProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputComponentProps>(
  ({ style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className="pp-input"
        style={{
          background: "transparent",
          border: borders.input,
          padding: `${spacing.padding.md} ${spacing.padding.md}`,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.bodySmall,
          width: "100%",
          maxWidth: "320px",
          outline: "none",
          transition: effects.transition.fast,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

/**
 * Feature Card Component
 */
interface FeatureCardProps {
  num: string;
  title: string;
  description: string;
}

export function FeatureCard({ num, title, description }: FeatureCardProps) {
  return (
    <div
      className="pp-feature-card"
      style={{
        padding: spacing.padding.xl,
        background: colors.background.card,
        backdropFilter: effects.backdrop.blur,
        border: borders.card,
        transition: effects.transition.smooth,
      }}
    >
      <span
        style={{
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.micro,
          letterSpacing: typography.letterSpacing.wider,
          color: colors.camel,
        }}
      >
        {num}
      </span>
      <div
        style={{
          width: "40px",
          height: "1px",
          background: colors.camel,
          margin: `${spacing.padding.md} 0`,
        }}
      />
      <h3
        style={{
          fontFamily: typography.fontFamily.display,
          fontSize: typography.fontSize.cardH3,
          fontWeight: typography.fontWeight.regular,
          marginBottom: spacing.padding.sm,
          color: colors.text.primary,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.bodySmall,
          fontWeight: typography.fontWeight.light,
          color: colors.text.tertiary,
          lineHeight: typography.lineHeight.relaxed,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/**
 * Section Label Component
 */
interface SectionLabelProps {
  children: React.ReactNode;
  color?: string;
}

export function SectionLabel({ children, color = colors.camel }: SectionLabelProps) {
  return (
    <p
      style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.label,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: "uppercase",
        color,
        marginBottom: spacing.padding.lg,
      }}
    >
      {children}
    </p>
  );
}

/**
 * Nav Link Component
 */
interface NavLinkProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export function NavLink({ children, href = "#", className }: NavLinkProps) {
  return (
    <a
      href={href}
      className={`pp-nav-link ${className || ""}`}
      style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.label,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: "uppercase",
        color: colors.text.primary,
        textDecoration: "none",
        transition: effects.transition.fast,
        cursor: "pointer",
      }}
    >
      {children}
    </a>
  );
}

/**
 * Accent Line Component
 */
interface AccentLineProps {
  width?: string;
  margin?: string;
}

export function AccentLine({ width = "40px", margin = `${spacing.padding.md} 0` }: AccentLineProps) {
  return (
    <div
      style={{
        width,
        height: "1px",
        background: colors.camel,
        margin,
      }}
    />
  );
}
