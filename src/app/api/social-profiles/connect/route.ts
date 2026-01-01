import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOutstandClient, type OutstandPlatform } from "@/lib/outstand/client";

/**
 * POST /api/social-profiles/connect
 * 
 * Initiates OAuth flow to connect a social media account via Outstand.so
 * Returns the authorization URL to redirect the user to
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { platform } = body as { platform: OutstandPlatform };

    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Platform is required" },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms: OutstandPlatform[] = [
      'instagram', 'tiktok', 'twitter', 'facebook', 
      'linkedin', 'youtube', 'pinterest', 'threads', 'bluesky'
    ];

    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, error: `Invalid platform: ${platform}` },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.OUTSTAND_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Social profile connection is not configured. Please contact support." 
        },
        { status: 503 }
      );
    }

    // Get the callback URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const redirectUrl = `${origin}/api/social-profiles/callback`;

    // Get auth URL from Outstand
    const outstand = getOutstandClient();
    const authResponse = await outstand.getAuthUrl(platform, redirectUrl, user.id);

    // Store the state in the database for verification later
    await supabase
      .from('social_profile_connections')
      .upsert({
        profile_id: user.id,
        platform,
        state: authResponse.state,
        status: 'pending',
        expires_at: authResponse.expiresAt,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'profile_id,platform',
      });

    return NextResponse.json({
      success: true,
      authUrl: authResponse.authUrl,
      state: authResponse.state,
    });
  } catch (error) {
    console.error("[Social Profiles] Error initiating connection:", error);
    
    // Check if it's a missing API key error
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { success: false, error: "Social profile service temporarily unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to initiate connection" },
      { status: 500 }
    );
  }
}

