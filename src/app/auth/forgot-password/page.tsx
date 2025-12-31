"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF9F7",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        color: "#1A1A1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <Link
          href="/"
          className="fade-up"
          style={{
            display: "block",
            fontSize: "18px",
            fontWeight: 300,
            letterSpacing: "4px",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "48px",
            textDecoration: "none",
            color: "#1A1A1A",
          }}
        >
          Pose & Poise
        </Link>

        {/* Header */}
        <div className="fade-up delay-1" style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 300,
              marginBottom: "16px",
            }}
          >
            Reset Password
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "14px",
              fontWeight: 300,
              color: "rgba(26, 26, 26, 0.6)",
            }}
          >
            {success 
              ? "Check your email for the reset link"
              : "Enter your email to receive a reset link"
            }
          </p>
        </div>

        {success ? (
          <div className="fade-up delay-2" style={{ textAlign: "center" }}>
            {/* Success Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px",
                color: "rgba(26, 26, 26, 0.7)",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              We&apos;ve sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to set a new password.
            </p>
            <Link
              href="/login"
              className="auth-button"
              style={{
                display: "inline-block",
                textDecoration: "none",
                padding: "14px 32px",
              }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="fade-up delay-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />

              {error && (
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px",
                    color: "#D64545",
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}

        {/* Footer links */}
        <div
          className="fade-up delay-3"
          style={{
            marginTop: "32px",
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
            color: "rgba(26, 26, 26, 0.6)",
          }}
        >
          <p>
            Remember your password?{" "}
            <Link href="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>

        {/* Decorative element */}
        <div
          style={{
            width: "40px",
            height: "1px",
            background: "#C4A484",
            margin: "48px auto 0",
          }}
        />
      </div>
    </div>
  );
}

