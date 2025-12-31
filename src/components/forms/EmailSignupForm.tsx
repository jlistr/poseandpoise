"use client";

import { useState, FormEvent } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";
import { colors, typography, spacing, borders } from "@/styles/tokens";

interface EmailSignupFormProps {
  buttonText?: string;
  placeholder?: string;
  className?: string;
}

export function EmailSignupForm({
  buttonText = "Get Started Free",
  placeholder = "Enter your email",
  className = "",
}: EmailSignupFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await joinWaitlist(email);

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.message);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.body,
          padding: `${spacing.padding.lg} ${spacing.padding.xl}`,
          background: "rgba(196, 164, 132, 0.08)",
          borderRadius: "8px",
          border: "1px solid rgba(196, 164, 132, 0.2)",
        }}
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          marginBottom: "8px",
        }}>
          <span style={{ 
            width: "32px", 
            height: "32px", 
            borderRadius: "50%", 
            background: colors.camel,
            color: colors.cream,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}>
            ✓
          </span>
          <span style={{ 
            fontWeight: 500, 
            color: colors.charcoal,
            fontSize: typography.fontSize.body,
          }}>
            Check your inbox!
          </span>
        </div>
        <p style={{
          fontSize: typography.fontSize.bodySmall,
          color: "rgba(26, 26, 26, 0.7)",
          margin: 0,
          paddingLeft: "44px",
          lineHeight: 1.6,
        }}>
          We&apos;ve sent a verification link to <strong>{email}</strong>.
          Click the link to create your free account and start building your portfolio.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`hero-form ${className}`}
      style={{
        display: "flex",
        gap: spacing.gap.sm,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
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
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="pp-button"
        style={{
          background: colors.charcoal,
          color: colors.cream,
          border: "none",
          padding: `${spacing.padding.md} ${spacing.padding["2xl"]}`,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.button,
          fontWeight: typography.fontWeight.regular,
          letterSpacing: typography.letterSpacing.wider,
          textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          transition: "all 0.2s ease",
        }}
      >
        {loading ? "Sending..." : buttonText}
      </button>
      {error && (
        <p
          style={{
            width: "100%",
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: "#D64545",
            marginTop: spacing.padding.xs,
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
