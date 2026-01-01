"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EyeIcon, EyeOffIcon } from "@/components/icons/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "14px",
              fontWeight: 300,
              color: "rgba(26, 26, 26, 0.6)",
            }}
          >
            Sign in to manage your portfolio
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
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                style={{ width: "100%" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  color: "rgba(26, 26, 26, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(26, 26, 26, 0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26, 26, 26, 0.4)")}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

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
              {loading ? "Signing in..." : "Sign In"}
            </button>
            
            <Link
              href="/auth/forgot-password"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "rgba(26, 26, 26, 0.6)",
                textAlign: "center",
                display: "block",
                textDecoration: "none",
                marginTop: "8px",
              }}
              className="auth-link"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

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
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="auth-link">
              Sign up
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