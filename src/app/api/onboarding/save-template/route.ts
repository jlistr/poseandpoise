import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_TEMPLATES = ['rose', 'poise', 'lumiere', 'noir'];
const FREE_TEMPLATES = ['rose', 'poise', 'lumiere'];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { templateId } = await request.json();

    if (!templateId || !VALID_TEMPLATES.includes(templateId)) {
      return NextResponse.json(
        { error: "Invalid template selection" }, 
        { status: 400 }
      );
    }

    // Check if user can access this template
    // Free users can only access free templates
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const tier = profile?.subscription_tier || "FREE";
    const isPaidUser = tier === "PROFESSIONAL" || tier === "DELUXE";

    // If template is premium and user is not paid, fall back to rose
    const finalTemplate = (!isPaidUser && !FREE_TEMPLATES.includes(templateId)) 
      ? 'rose' 
      : templateId;

    // Update profile with selected template
    const { error } = await supabase
      .from("profiles")
      .update({ 
        selected_template: finalTemplate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Save template error:", error);
      return NextResponse.json(
        { error: "Failed to save template" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      template: finalTemplate,
      wasDowngraded: finalTemplate !== templateId,
    });
    
  } catch (err) {
    console.error("Save template error:", err);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

