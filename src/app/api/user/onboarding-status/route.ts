import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/user/onboarding-status
 * 
 * Returns the current user's onboarding completion status
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        isLoggedIn: false,
        onboardingCompleted: null,
        displayName: null,
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, onboarding_completed')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      isLoggedIn: true,
      onboardingCompleted: profile?.onboarding_completed || false,
      displayName: profile?.display_name || null,
    });
  } catch (error) {
    console.error("[API] Error fetching onboarding status:", error);
    return NextResponse.json({
      isLoggedIn: false,
      onboardingCompleted: null,
      displayName: null,
    });
  }
}

