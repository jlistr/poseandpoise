"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PdfUploadResult {
  success: boolean;
  message: string;
  url?: string;
}

export interface ImageUploadResult {
  success: boolean;
  message: string;
  url?: string;
}

/**
 * Upload a preview image of the comp card for display in portfolios
 */
export async function uploadCompCardImage(
  compCardId: string,
  imageBlob: Blob
): Promise<ImageUploadResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  // Verify ownership of comp card
  const { data: compCard, error: fetchError } = await supabase
    .from("comp_cards")
    .select("id, profile_id")
    .eq("id", compCardId)
    .eq("profile_id", user.id)
    .single();

  if (fetchError || !compCard) {
    return {
      success: false,
      message: "Comp card not found",
    };
  }

  // Generate filename with appropriate extension
  const extension = imageBlob.type === "image/png" ? "png" : "jpg";
  const fileName = `${compCardId}-preview.${extension}`;
  const filePath = `${user.id}/${fileName}`;

  // Convert Blob to ArrayBuffer for upload
  const arrayBuffer = await imageBlob.arrayBuffer();

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("comp-cards")
    .upload(filePath, arrayBuffer, {
      contentType: imageBlob.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Image upload error:", uploadError);
    return {
      success: false,
      message: "Failed to upload image",
    };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("comp-cards")
    .getPublicUrl(filePath);

  // Update comp card with uploaded file URL (used for preview display)
  const { error: updateError } = await supabase
    .from("comp_cards")
    .update({ uploaded_file_url: urlData.publicUrl })
    .eq("id", compCardId)
    .eq("profile_id", user.id);

  if (updateError) {
    console.error("Update comp card error:", updateError);
    return {
      success: false,
      message: "Failed to save image URL",
    };
  }

  revalidatePath("/dashboard/comp-card");

  return {
    success: true,
    message: "Image uploaded",
    url: urlData.publicUrl,
  };
}

export async function uploadCompCardPdf(
  compCardId: string,
  pdfBlob: Blob
): Promise<PdfUploadResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  // Verify ownership of comp card
  const { data: compCard, error: fetchError } = await supabase
    .from("comp_cards")
    .select("id, profile_id")
    .eq("id", compCardId)
    .eq("profile_id", user.id)
    .single();

  if (fetchError || !compCard) {
    return {
      success: false,
      message: "Comp card not found",
    };
  }

  // Generate filename
  const fileName = `${compCardId}.pdf`;
  const filePath = `${user.id}/${fileName}`;

  // Convert Blob to ArrayBuffer for upload
  const arrayBuffer = await pdfBlob.arrayBuffer();

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("comp-cards")
    .upload(filePath, arrayBuffer, {
      contentType: "application/pdf",
      upsert: true, // Overwrite if exists
    });

  if (uploadError) {
    console.error("PDF upload error:", uploadError);
    return {
      success: false,
      message: "Failed to upload PDF",
    };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("comp-cards")
    .getPublicUrl(filePath);

  // Update comp card with PDF URL
  const { error: updateError } = await supabase
    .from("comp_cards")
    .update({ pdf_url: urlData.publicUrl })
    .eq("id", compCardId)
    .eq("profile_id", user.id);

  if (updateError) {
    console.error("Update comp card error:", updateError);
    return {
      success: false,
      message: "Failed to save PDF URL",
    };
  }

  revalidatePath("/dashboard/comp-card");

  return {
    success: true,
    message: "PDF uploaded",
    url: urlData.publicUrl,
  };
}