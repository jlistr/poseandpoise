"use client";

import { useState, FormEvent } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";
import { colors, typography, spacing, effects, borders } from "@/styles/tokens";

interface EmailSignupFormProps {
  buttonText?: string;
  placeholder?: string;
  className?: string;
}

export function EmailSignupForm({
  buttonText = "Start Free",
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
          color: colors.camel,
          padding: `${spacing.padding.md} 0`,
        }}
      >
        ✓ You&apos;re on the list. We&apos;ll be in touch soon.
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
        }}
      >
        {loading ? "Joining..." : buttonText}
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