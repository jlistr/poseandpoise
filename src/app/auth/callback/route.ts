import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubdomainUrl } from "@/lib/utils/url";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const source = searchParams.get("source");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type"); // 'recovery' for password reset

  // Use environment-based URL for redirects (handles prod vs local)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // Handle password recovery - redirect to reset password page
    if (!error && type === "recovery") {
      return NextResponse.redirect(`${baseUrl}/auth/reset-password`);
    }
    
    if (!error && data.user) {
      // Check if user has completed onboarding and get username
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, username")
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

      // Redirect to onboarding if not completed
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(`${baseUrl}/onboarding`);
      }
      
      // In production with a username, redirect to their subdomain
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction && profile?.username) {
        const subdomainUrl = getSubdomainUrl(profile.username, next);
        return NextResponse.redirect(subdomainUrl);
      }
      
      // Development or no username: redirect to main domain
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Redirect to error page or login with error
  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`);
}

