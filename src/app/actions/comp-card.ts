"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CompCard {
  id: string;
  profile_id: string;
  name: string;
  template: string;
  card_type: "generated" | "uploaded" | "branded";
  photo_ids: string[];
  is_primary: boolean;
  pdf_url?: string;
  uploaded_file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CompCardResult {
  success: boolean;
  message: string;
  data?: CompCard;
}

export interface CompCardsResult {
  success: boolean;
  message: string;
  data?: CompCard[];
}

export async function getCompCards(): Promise<CompCardsResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const { data, error } = await supabase
    .from("comp_cards")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get comp cards error:", error);
    return {
      success: false,
      message: "Failed to fetch comp cards",
    };
  }

  return {
    success: true,
    message: "Comp cards fetched",
    data: data as CompCard[],
  };
}

export async function createCompCard(
  name: string,
  photoIds: string[],
  cardType: "simple" | "branded" | "upload" = "simple"
): Promise<CompCardResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  // Map cardType to database card_type
  const dbCardType = cardType === "simple" ? "generated" : cardType === "upload" ? "uploaded" : "branded";

  // Allow empty photoIds for uploaded cards
  if (cardType !== "upload" && photoIds.length === 0) {
    return {
      success: false,
      message: "Please select at least one photo",
    };
  }

  if (photoIds.length > 6) {
    return {
      success: false,
      message: "Maximum 6 photos per comp card (1 headshot + 5 back)",
    };
  }

  const { data, error } = await supabase
    .from("comp_cards")
    .insert({
      profile_id: user.id,
      name: name.trim() || "My Comp Card",
      template: "classic",
      card_type: dbCardType,
      photo_ids: photoIds,
    })
    .select()
    .single();

  if (error) {
    console.error("Create comp card error:", error);
    return {
      success: false,
      message: "Failed to create comp card",
    };
  }

  revalidatePath("/dashboard/comp-card");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Comp card created",
    data: data as CompCard,
  };
}

export async function deleteCompCard(compCardId: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  // Get comp card to delete associated files
  const { data: compCard } = await supabase
    .from("comp_cards")
    .select("pdf_url, uploaded_file_url")
    .eq("id", compCardId)
    .eq("profile_id", user.id)
    .single();

  // Delete PDF from storage if exists
  if (compCard?.pdf_url) {
    const pdfPath = compCard.pdf_url.split("/comp-cards/")[1];
    if (pdfPath) {
      await supabase.storage.from("comp-cards").remove([pdfPath]);
    }
  }

  const { error } = await supabase
    .from("comp_cards")
    .delete()
    .eq("id", compCardId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Delete comp card error:", error);
    return {
      success: false,
      message: "Failed to delete comp card",
    };
  }

  revalidatePath("/dashboard/comp-card");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Comp card deleted",
  };
}

export async function updateCompCard(
  compCardId: string,
  updates: { name?: string; photo_ids?: string[]; template?: string; card_type?: string }
): Promise<CompCardResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const { data, error } = await supabase
    .from("comp_cards")
    .update(updates)
    .eq("id", compCardId)
    .eq("profile_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Update comp card error:", error);
    return {
      success: false,
      message: "Failed to update comp card",
    };
  }

  revalidatePath("/dashboard/comp-card");

  return {
    success: true,
    message: "Comp card updated",
    data: data as CompCard,
  };
}