"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(26, 26, 26, 0.6)" }}>
          Loading...
        </p>
      </div>
    );
  }

  // Invalid or expired session
  if (isValidSession === false) {
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
          {/* Logo */}
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

          {/* Error Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(214, 69, 69, 0.1)",
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
              stroke="#D64545"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 300,
              marginBottom: "16px",
            }}
          >
            Link Expired
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "14px",
              color: "rgba(26, 26, 26, 0.6)",
              marginBottom: "24px",
              lineHeight: 1.6,
            }}
          >
            This password reset link has expired or is invalid. 
            Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="auth-button"
            style={{
              display: "inline-block",
              textDecoration: "none",
              padding: "14px 32px",
            }}
          >
            Request New Link
          </Link>
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
            {success ? "Password Updated" : "Set New Password"}
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
              ? "Redirecting you to your dashboard..."
              : "Enter your new password below"
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
                lineHeight: 1.6,
              }}
            >
              Your password has been successfully updated.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="fade-up delay-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                  minLength={8}
                />
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "12px",
                    color: "rgba(26, 26, 26, 0.5)",
                    marginTop: "6px",
                    paddingLeft: "4px",
                  }}
                >
                  Must be at least 8 characters
                </p>
              </div>
              
              <input
                type="password"
                placeholder="Confirm New Password"
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}

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

