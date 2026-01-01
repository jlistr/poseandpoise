import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const photographer = formData.get("photographer") as string | null;
    const studio = formData.get("studio") as string | null;
    const visibleStr = formData.get("visible") as string | null;
    const orderStr = formData.get("order") as string | null;

    // Parse optional fields
    const isVisible = visibleStr !== "false"; // Default to true
    const sortOrder = orderStr ? parseInt(orderStr, 10) : null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPEG, PNG, or WebP." }, 
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." }, 
        { status: 400 }
      );
    }

    // Check photo count (free users: 10 max)
    const { count } = await supabase
      .from("photos")
      .select("id", { count: "exact" })
      .eq("profile_id", user.id);

    if (count !== null && count >= 10) {
      return NextResponse.json(
        { error: "Maximum photos reached. Upgrade to add more!" }, 
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("portfolio-photos")
      .upload(filename, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload photo" }, 
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("portfolio-photos")
      .getPublicUrl(filename);

    // Get next sort order if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === null) {
      const { data: existingPhotos } = await supabase
        .from("photos")
        .select("sort_order")
        .eq("profile_id", user.id)
        .order("sort_order", { ascending: false })
        .limit(1);

      finalSortOrder = existingPhotos && existingPhotos.length > 0 
        ? existingPhotos[0].sort_order + 1 
        : 0;
    }

    // Insert photo record with all fields
    const { data, error } = await supabase
      .from("photos")
      .insert({
        profile_id: user.id,
        url: publicUrl,
        sort_order: finalSortOrder,
        size_bytes: file.size,
        is_visible: isVisible,
        photographer: photographer?.trim() || null,
        studio: studio?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      // Cleanup uploaded file
      await supabase.storage.from("portfolio-photos").remove([filename]);
      return NextResponse.json(
        { error: "Failed to save photo" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, photo: data });
    
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

