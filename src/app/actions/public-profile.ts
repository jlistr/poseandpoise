"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "./profile";
import type { Photo } from "./photos";

export interface PublicProfile extends Profile {
  photos: Photo[];
}

export interface PublicProfileResult {
  success: boolean;
  message: string;
  data?: PublicProfile;
}

export async function getPublicProfile(username: string): Promise<PublicProfileResult> {
  const supabase = await createClient();

  // Fetch profile by username
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("is_public", true)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: "Profile not found",
    };
  }

  // Fetch photos for this profile
  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order", { ascending: true });

  if (photosError) {
    console.error("Fetch photos error:", photosError);
  }

  return {
    success: true,
    message: "Profile fetched",
    data: {
      ...profile,
      photos: photos || [],
    } as PublicProfile,
  };
}