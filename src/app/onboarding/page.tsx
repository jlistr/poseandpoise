import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, location, bio, avatar_url, agency, onboarding_completed")
    .eq("id", user.id)
    .single();

  // If onboarding is already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard 
      userEmail={user.email || ""} 
      userId={user.id}
      existingProfile={profile ? {
        display_name: profile.display_name,
        username: profile.username,
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        agency: profile.agency,
      } : undefined}
    />
  );
}

