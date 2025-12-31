import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Mark onboarding as complete
    const { error } = await supabase
      .from("profiles")
      .update({ 
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Complete onboarding error:", error);
      return NextResponse.json(
        { error: "Failed to complete onboarding" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error("Complete onboarding error:", err);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

