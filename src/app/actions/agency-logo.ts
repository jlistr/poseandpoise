"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AgencyLogoResult {
  success: boolean;
  message: string;
  url?: string;
}

export async function uploadAgencyLogo(formData: FormData): Promise<AgencyLogoResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("Auth error:", authError);
    return { success: false, message: `Auth error: ${authError.message}` };
  }

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, message: "No file provided" };
  }

  console.log("Uploading logo:", {
    name: file.name,
    type: file.type,
    size: file.size,
    userId: user.id,
  });

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, message: `Invalid file type: ${file.type}. Use JPEG, PNG, WebP, or SVG.` };
  }

  // Validate file size (2MB max for logos)
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, message: "File too large. Maximum size is 2MB." };
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `agency-logo.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  console.log("File path:", filePath);

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("agency-logos")
    .upload(filePath, arrayBuffer, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { success: false, message: `Upload failed: ${uploadError.message}` };
  }

  console.log("Upload success:", uploadData);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("agency-logos")
    .getPublicUrl(filePath);

  console.log("Public URL:", urlData.publicUrl);

  // Update profile with logo URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ agency_logo_url: urlData.publicUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("Update profile error:", updateError);
    return { success: false, message: `Profile update failed: ${updateError.message}` };
  }

  revalidatePath("/dashboard/comp-card");
  revalidatePath("/dashboard/profile");

  return {
    success: true,
    message: "Logo uploaded",
    url: urlData.publicUrl,
  };
}

export async function deleteAgencyLogo(): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  // Get current logo URL to find file path
  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_logo_url")
    .eq("id", user.id)
    .single();

  if (profile?.agency_logo_url) {
    // Extract file path and delete from storage
    const urlParts = profile.agency_logo_url.split("/agency-logos/");
    if (urlParts[1]) {
      const { error: deleteError } = await supabase.storage
        .from("agency-logos")
        .remove([decodeURIComponent(urlParts[1])]);
      
      if (deleteError) {
        console.error("Delete storage error:", deleteError);
      }
    }
  }

  // Clear URL in profile
  const { error } = await supabase
    .from("profiles")
    .update({ agency_logo_url: null })
    .eq("id", user.id);

  if (error) {
    console.error("Clear logo URL error:", error);
    return { success: false, message: `Failed to remove logo: ${error.message}` };
  }

  revalidatePath("/dashboard/comp-card");
  revalidatePath("/dashboard/profile");

  return { success: true, message: "Logo removed" };
}