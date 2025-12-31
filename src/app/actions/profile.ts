"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  height_cm: number | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  shoe_size: string | null;
  hair_color: string | null;
  eye_color: string | null;
  location: string | null;
  agency: string | null;
  agency_logo_url: string | null;
  agency_email: string | null;
  agency_phone: string | null;
  agency_instagram: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  is_public: boolean;
  selected_template: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileResult {
  success: boolean;
  message: string;
  data?: Profile;
}

export async function getProfile(): Promise<ProfileResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Get profile error:", error);
    return {
      success: false,
      message: "Failed to fetch profile",
    };
  }

  return {
    success: true,
    message: "Profile fetched",
    data: data as Profile,
  };
}

export async function updateProfile(formData: FormData): Promise<ProfileResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  // Extract form data
  const username = formData.get("username") as string | null;
  const display_name = formData.get("display_name") as string | null;
  const bio = formData.get("bio") as string | null;
  const height_cm = formData.get("height_cm") ? parseInt(formData.get("height_cm") as string) : null;
  const bust_cm = formData.get("bust_cm") ? parseInt(formData.get("bust_cm") as string) : null;
  const waist_cm = formData.get("waist_cm") ? parseInt(formData.get("waist_cm") as string) : null;
  const hips_cm = formData.get("hips_cm") ? parseInt(formData.get("hips_cm") as string) : null;
  const shoe_size = formData.get("shoe_size") as string | null;
  const hair_color = formData.get("hair_color") as string | null;
  const eye_color = formData.get("eye_color") as string | null;
  const location = formData.get("location") as string | null;
  const agency = formData.get("agency") as string | null;
  const agency_email = formData.get("agency_email") as string | null;
  const agency_phone = formData.get("agency_phone") as string | null;
  const agency_instagram = formData.get("agency_instagram") as string | null;
  const instagram = formData.get("instagram") as string | null;
  const tiktok = formData.get("tiktok") as string | null;
  const website = formData.get("website") as string | null;
  const is_public = formData.get("is_public") === "true";

  // Validate username format (if provided)
  if (username) {
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        success: false,
        message: "Username must be 3-20 characters, lowercase letters, numbers, hyphens, or underscores only",
      };
    }
  }

  // Validate agency email format (if provided)
  if (agency_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(agency_email)) {
      return {
        success: false,
        message: "Please enter a valid agency email address",
      };
    }
  }

  // Validate agency phone format (if provided) - expects +1 (XXX) XXX-XXXX
  if (agency_phone) {
    const phoneRegex = /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/;
    if (!phoneRegex.test(agency_phone)) {
      return {
        success: false,
        message: "Agency phone must be in format: +1 (555) 123-4567",
      };
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: username?.toLowerCase().trim() || null,
      display_name: display_name?.trim() || null,
      bio: bio?.trim() || null,
      height_cm,
      bust_cm,
      waist_cm,
      hips_cm,
      shoe_size: shoe_size?.trim() || null,
      hair_color: hair_color?.trim() || null,
      eye_color: eye_color?.trim() || null,
      location: location?.trim() || null,
      agency: agency?.trim() || null,
      agency_email: agency_email?.trim() || null,
      agency_phone: agency_phone?.trim() || null,
      agency_instagram: agency_instagram?.trim() || null,
      instagram: instagram?.trim() || null,
      tiktok: tiktok?.trim() || null,
      website: website?.trim() || null,
      is_public,
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Update profile error:", error);
    
    // Handle unique constraint violation (username taken)
    if (error.code === "23505") {
      return {
        success: false,
        message: "Username is already taken",
      };
    }
    
    return {
      success: false,
      message: "Failed to update profile",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return {
    success: true,
    message: "Profile updated successfully",
    data: data as Profile,
  };
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!username || username.length < 3) return false;
  
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Check username error:", error);
    return false;
  }

  // Available if no result, or if it's the current user's username
  return !data || data.id === user?.id;
}