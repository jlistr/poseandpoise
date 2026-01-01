import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/identities
 * 
 * Returns the list of identities linked to the current user's account.
 * This includes OAuth providers (Google, Facebook, TikTok) and email.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all identities linked to the user
    const identities = user.identities || [];

    // Transform the identities for the client
    const transformedIdentities = identities.map((identity) => ({
      id: identity.id,
      provider: identity.provider,
      identityId: identity.identity_id,
      email: identity.identity_data?.email || null,
      name: identity.identity_data?.full_name || identity.identity_data?.name || null,
      avatarUrl: identity.identity_data?.avatar_url || identity.identity_data?.picture || null,
      createdAt: identity.created_at,
      lastSignInAt: identity.last_sign_in_at,
    }));

    return NextResponse.json({
      success: true,
      identities: transformedIdentities,
      totalIdentities: transformedIdentities.length,
      // User needs at least 2 identities to unlink one
      canUnlink: transformedIdentities.length > 1,
    });
  } catch (error) {
    console.error("[Auth] Error fetching identities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch identities" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/identities
 * 
 * Unlinks a specific identity from the current user's account.
 * User must have at least 2 identities to unlink one.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { identityId } = body;

    if (!identityId) {
      return NextResponse.json(
        { success: false, error: "Identity ID is required" },
        { status: 400 }
      );
    }

    // Check if user has at least 2 identities
    const identities = user.identities || [];
    if (identities.length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot unlink your only identity. You must have at least one other login method." 
        },
        { status: 400 }
      );
    }

    // Find the identity to unlink
    const identityToUnlink = identities.find(
      (identity) => identity.identity_id === identityId
    );

    if (!identityToUnlink) {
      return NextResponse.json(
        { success: false, error: "Identity not found" },
        { status: 404 }
      );
    }

    // Unlink the identity using Supabase Auth
    const { error: unlinkError } = await supabase.auth.unlinkIdentity(identityToUnlink);

    if (unlinkError) {
      console.error("[Auth] Error unlinking identity:", unlinkError);
      return NextResponse.json(
        { success: false, error: unlinkError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully disconnected ${identityToUnlink.provider}`,
      unlinkedProvider: identityToUnlink.provider,
    });
  } catch (error) {
    console.error("[Auth] Error unlinking identity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlink identity" },
      { status: 500 }
    );
  }
}

