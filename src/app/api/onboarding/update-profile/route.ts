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
    
    // Extract and validate data
    const username = formData.get("username") as string;
    const displayName = formData.get("display_name") as string;
    
    if (!username || !displayName) {
      return NextResponse.json(
        { error: "Username and display name are required" }, 
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, lowercase letters, numbers, hyphens, or underscores only" }, 
        { status: 400 }
      );
    }

    // Check username availability
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .neq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" }, 
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, string | number | null> = {
      username: username.toLowerCase().trim(),
      display_name: displayName.trim(),
    };

    // Optional fields
    const optionalFields = [
      "location", "instagram", "tiktok", "website", "agency", "bio",
      "shoe_size", "hair_color", "eye_color"
    ];
    
    for (const field of optionalFields) {
      const value = formData.get(field) as string | null;
      if (value !== null) {
        updateData[field] = value.trim() || null;
      }
    }

    // Numeric fields
    const numericFields = ["height_cm", "bust_cm", "waist_cm", "hips_cm"];
    for (const field of numericFields) {
      const value = formData.get(field) as string | null;
      if (value !== null && value !== "") {
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          updateData[field] = num;
        }
      }
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error("Onboarding update error:", err);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

