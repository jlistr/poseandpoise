import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Update photo credits (photographer and studio) without re-uploading the file.
 * Used when users edit credits after a photo has already been uploaded.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { photo_id, photographer, studio } = body;

    if (!photo_id) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    // Verify the photo belongs to the user
    const { data: existingPhoto, error: fetchError } = await supabase
      .from("photos")
      .select("id, profile_id")
      .eq("id", photo_id)
      .single();

    if (fetchError || !existingPhoto) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (existingPhoto.profile_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the credits
    const { data, error } = await supabase
      .from("photos")
      .update({
        photographer: photographer?.trim() || null,
        studio: studio?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", photo_id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "Failed to update photo credits" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, photo: data });
  } catch (err) {
    console.error("Update photo credits error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

