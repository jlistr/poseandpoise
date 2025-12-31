import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const source = searchParams.get("source");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type"); // 'recovery' for password reset

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // Handle password recovery - redirect to reset password page
    if (!error && type === "recovery") {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }
    
    if (!error && data.user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .single();
      
      // If this is from waitlist, mark the waitlist entry as converted
      // and set up the user's subscription
      if (source === "waitlist") {
        // Update waitlist entry
        await supabase
          .from("waitlist")
          .update({ converted_to_user: true })
          .eq("email", data.user.email?.toLowerCase());
        
        // Ensure profile has subscription_tier set to 'FREE'
        await supabase
          .from("profiles")
          .update({ 
            subscription_tier: "FREE",
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.user.id);
        
        // Create a subscription record for the new user (if one doesn't exist)
        // This ensures the subscriptions table is populated for all users
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("profile_id", data.user.id)
          .single();
        
        if (!existingSubscription) {
          await supabase
            .from("subscriptions")
            .insert({
              profile_id: data.user.id,
              status: "active",
              tier: "FREE", // Uses subscription_tier ENUM
              current_period_start: new Date().toISOString(),
              // Free tier doesn't expire, but set a far future date for consistency
              current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
      }

      // Redirect to onboarding if not completed, otherwise to dashboard
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      
      // Redirect to the specified next page or dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to error page or login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

