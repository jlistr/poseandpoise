"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/utils/url";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
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

        <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              display: "block",
              fontSize: "18px",
              fontWeight: 300,
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "48px",
              textDecoration: "none",
              color: "#1A1A1A",
            }}
          >
            Pose & Poise
          </Link>

          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(196, 164, 132, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              fontSize: "28px",
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: 300,
              marginBottom: "16px",
            }}
          >
            Check your email
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "14px",
              fontWeight: 300,
              color: "rgba(26, 26, 26, 0.6)",
              lineHeight: 1.7,
              marginBottom: "32px",
            }}
          >
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Click the link to activate your account.
          </p>

          <Link href="/login" className="auth-link" style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
          }}>
            Back to sign in
          </Link>

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
            Create your portfolio
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "14px",
              fontWeight: 300,
              color: "rgba(26, 26, 26, 0.6)",
            }}
          >
            Start showcasing your work in minutes
          </p>
        </div>

        {/* Form */}
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
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Terms */}
        <p
          className="fade-up delay-3"
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "12px",
            color: "rgba(26, 26, 26, 0.4)",
            lineHeight: 1.6,
          }}
        >
          By signing up, you agree to our{" "}
          <Link href="/terms" className="auth-link">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="auth-link">
            Privacy Policy
          </Link>
        </p>

        {/* Footer links */}
        <div
          className="fade-up delay-3"
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
            color: "rgba(26, 26, 26, 0.6)",
          }}
        >
          <p>
            Already have an account?{" "}
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