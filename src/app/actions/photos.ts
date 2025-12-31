"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Photo {
  id: string;
  profile_id: string;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  created_at: string;
}

export interface PhotoResult {
  success: boolean;
  message: string;
  data?: Photo;
}

export interface PhotosResult {
  success: boolean;
  message: string;
  data?: Photo[];
}

export async function getPhotos(): Promise<PhotosResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("profile_id", user.id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Get photos error:", error);
    return {
      success: false,
      message: "Failed to fetch photos",
    };
  }

  return {
    success: true,
    message: "Photos fetched",
    data: data as Photo[],
  };
}

export async function uploadPhoto(formData: FormData): Promise<PhotoResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const file = formData.get("file") as File;

  if (!file) {
    return {
      success: false,
      message: "No file provided",
    };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: "Invalid file type. Please upload JPEG, PNG, or WebP.",
    };
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      success: false,
      message: "File too large. Maximum size is 10MB.",
    };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("portfolio-photos")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return {
      success: false,
      message: "Failed to upload photo",
    };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("portfolio-photos")
    .getPublicUrl(filePath);

  // Get current max sort_order
  const { data: existingPhotos } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("profile_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingPhotos && existingPhotos.length > 0 
    ? existingPhotos[0].sort_order + 1 
    : 0;

  // Insert photo record
  const { data, error } = await supabase
    .from("photos")
    .insert({
      profile_id: user.id,
      url: urlData.publicUrl,
      sort_order: nextSortOrder,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (error) {
    console.error("Insert photo error:", error);
    // Try to clean up uploaded file
    await supabase.storage.from("portfolio-photos").remove([filePath]);
    return {
      success: false,
      message: "Failed to save photo",
    };
  }

  revalidatePath("/dashboard/photos");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Photo uploaded",
    data: data as Photo,
  };
}

export async function deletePhoto(photoId: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  // Get photo to find storage path
  const { data: photo, error: fetchError } = await supabase
    .from("photos")
    .select("url")
    .eq("id", photoId)
    .eq("profile_id", user.id)
    .single();

  if (fetchError || !photo) {
    return {
      success: false,
      message: "Photo not found",
    };
  }

  // Extract file path from URL
  const url = new URL(photo.url);
  const pathParts = url.pathname.split("/");
  const bucketIndex = pathParts.findIndex(p => p === "portfolio-photos");
  const filePath = pathParts.slice(bucketIndex + 1).join("/");

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("portfolio-photos")
    .remove([filePath]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    // Continue anyway - we'll still delete the DB record
  }

  // Delete from database
  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Delete photo error:", error);
    return {
      success: false,
      message: "Failed to delete photo",
    };
  }

  revalidatePath("/dashboard/photos");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Photo deleted",
  };
}

export async function updatePhotoOrder(
  photoIds: string[]
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  // Update each photo's sort_order
  const updates = photoIds.map((id, index) =>
    supabase
      .from("photos")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("profile_id", user.id)
  );

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);

  if (hasError) {
    console.error("Update order error:", results.filter((r) => r.error));
    return {
      success: false,
      message: "Failed to update photo order",
    };
  }

  revalidatePath("/dashboard/photos");

  return {
    success: true,
    message: "Photo order updated",
  };
}

export async function updatePhotoCaption(
  photoId: string,
  caption: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const { error } = await supabase
    .from("photos")
    .update({ caption: caption.trim() || null })
    .eq("id", photoId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Update caption error:", error);
    return {
      success: false,
      message: "Failed to update caption",
    };
  }

  revalidatePath("/dashboard/photos");

  return {
    success: true,
    message: "Caption updated",
  };
}