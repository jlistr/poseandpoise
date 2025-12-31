"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export interface WaitlistResult {
  success: boolean;
  message: string;
}

/**
 * Join waitlist by creating a Supabase Auth user with email verification.
 * When the user verifies their email, they are automatically converted to
 * a free subscriber and redirected to complete their profile setup.
 */
export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address",
    };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || headersList.get("x-forwarded-host") || "";
  
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // First, check if email already exists in waitlist table
  const { data: existingWaitlist } = await supabase
    .from("waitlist")
    .select("id, converted_to_user")
    .eq("email", normalizedEmail)
    .single();

  if (existingWaitlist?.converted_to_user) {
    return {
      success: true, // Don't reveal if user exists
      message: "Check your email for a verification link!",
    };
  }

  // Check if user already exists in auth.users
  // We do this by attempting to sign in with OTP - if they exist they'll get an email
  const { error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: crypto.randomUUID(), // Generate random password - they'll use magic link
    options: {
      emailRedirectTo: `${origin}/auth/callback?source=waitlist&next=/dashboard/profile`,
      data: {
        source: "waitlist",
        subscription_tier: "FREE",
      },
    },
  });

  if (signUpError) {
    // User might already exist - try sending magic link instead
    if (signUpError.message.includes("already registered") || 
        signUpError.message.includes("already exists")) {
      // Send magic link to existing user
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${origin}/auth/callback?source=waitlist&next=/dashboard/profile`,
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        console.error("OTP error:", otpError);
        return {
          success: false,
          message: "Something went wrong. Please try again.",
        };
      }

      return {
        success: true,
        message: "Check your email for a verification link!",
      };
    }

    console.error("Signup error:", signUpError);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }

  // Also add to waitlist table for tracking
  const { error: waitlistError } = await supabase
    .from("waitlist")
    .upsert(
      { 
        email: normalizedEmail,
        converted_to_user: false,
      },
      { onConflict: "email" }
    );

  if (waitlistError) {
    // Non-critical - just log it
    console.error("Waitlist tracking error:", waitlistError);
  }

  return {
    success: true,
    message: "Check your email for a verification link!",
  };
}
