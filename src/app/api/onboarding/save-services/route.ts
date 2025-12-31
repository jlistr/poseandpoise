import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { services } = await request.json();

    if (!Array.isArray(services)) {
      return NextResponse.json(
        { error: "Invalid services data" }, 
        { status: 400 }
      );
    }

    // Filter out empty services and limit to 10
    const validServices = services
      .filter((s: { title?: string }) => s.title?.trim())
      .slice(0, 10);

    if (validServices.length === 0) {
      return NextResponse.json({ success: true, message: "No services to save" });
    }

    // Delete existing services
    await supabase
      .from("services")
      .delete()
      .eq("profile_id", user.id);

    // Insert new services
    const servicesToInsert = validServices.map((service: { title: string; description?: string; price?: string }, index: number) => ({
      profile_id: user.id,
      title: service.title.trim().slice(0, 100),
      description: (service.description || "").trim().slice(0, 500),
      price: (service.price || "").trim().slice(0, 50),
      sort_order: index,
    }));

    const { error } = await supabase
      .from("services")
      .insert(servicesToInsert);

    if (error) {
      console.error("Insert services error:", error);
      return NextResponse.json(
        { error: "Failed to save services" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error("Save services error:", err);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

