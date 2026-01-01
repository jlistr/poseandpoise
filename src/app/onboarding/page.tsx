import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile with all fields including measurements
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      display_name, 
      username, 
      location, 
      bio, 
      avatar_url, 
      agency, 
      onboarding_completed, 
      selected_template,
      height_cm,
      bust_cm,
      waist_cm,
      hips_cm,
      shoe_size,
      hair_color,
      eye_color,
      instagram,
      tiktok,
      website,
      subscription_tier
    `)
    .eq("id", user.id)
    .single();

  // Fetch existing services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("profile_id", user.id);

  // Fetch existing photos
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("profile_id", user.id)
    .order("sort_order", { ascending: true });

  // If onboarding is already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard 
      userEmail={user.email || ""} 
      userId={user.id}
      subscriptionTier={profile?.subscription_tier || "FREE"}
      existingProfile={profile ? {
        display_name: profile.display_name,
        username: profile.username,
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        agency: profile.agency,
        selected_template: profile.selected_template,
        // Measurements
        height_cm: profile.height_cm,
        bust_cm: profile.bust_cm,
        waist_cm: profile.waist_cm,
        hips_cm: profile.hips_cm,
        shoe_size: profile.shoe_size,
        hair_color: profile.hair_color,
        eye_color: profile.eye_color,
        // Socials
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        website: profile.website,
      } : undefined}
      existingServices={services || undefined}
      existingPhotos={photos || undefined}
    />
  );
}

