"use server";

import { createClient } from "@/lib/supabase/server";

export interface WaitlistResult {
  success: boolean;
  message: string;
}

export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    // Duplicate email (unique constraint violation)
    if (error.code === "23505") {
      return {
        success: true, // Still show success to user (don't reveal if email exists)
        message: "You're on the list!",
      };
    }

    console.error("Waitlist error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }

  return {
    success: true,
    message: "You're on the list!",
  };
}