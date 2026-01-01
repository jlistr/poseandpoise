import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOutstandClient } from "@/lib/outstand/client";

/**
 * GET /api/social-profiles
 * 
 * Lists all connected social profiles for the current user
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

    // Get connected social profiles from database
    const { data: connections, error: dbError } = await supabase
      .from('social_profile_connections')
      .select('*')
      .eq('profile_id', user.id)
      .eq('status', 'connected')
      .order('platform');

    if (dbError) {
      console.error("[Social Profiles] Error fetching connections:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch social profiles" },
        { status: 500 }
      );
    }

    // Transform the data for the client
    const profiles = (connections || []).map((conn) => ({
      id: conn.id,
      platform: conn.platform,
      username: conn.username,
      displayName: conn.display_name,
      profileUrl: conn.profile_url,
      profileImageUrl: conn.profile_image_url,
      followerCount: conn.follower_count,
      followingCount: conn.following_count,
      verified: conn.verified,
      connectedAt: conn.connected_at,
      lastSyncedAt: conn.last_synced_at,
    }));

    return NextResponse.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error("[Social Profiles] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch social profiles" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-profiles
 * 
 * Disconnects a social profile
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

    const body = await request.json();
    const { connectionId, platform } = body;

    if (!connectionId && !platform) {
      return NextResponse.json(
        { success: false, error: "connectionId or platform is required" },
        { status: 400 }
      );
    }

    // Find the connection
    let query = supabase
      .from('social_profile_connections')
      .select('*')
      .eq('profile_id', user.id)
      .eq('status', 'connected');

    if (connectionId) {
      query = query.eq('id', connectionId);
    } else if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: connection, error: fetchError } = await query.single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { success: false, error: "Connection not found" },
        { status: 404 }
      );
    }

    // Disconnect from Outstand if we have an account ID
    if (connection.outstand_account_id && process.env.OUTSTAND_API_KEY) {
      try {
        const outstand = getOutstandClient();
        await outstand.disconnectAccount(connection.outstand_account_id);
      } catch (outstandError) {
        console.warn("[Social Profiles] Error disconnecting from Outstand:", outstandError);
        // Continue anyway - we'll remove from our database
      }
    }

    // Update the connection status
    await supabase
      .from('social_profile_connections')
      .update({
        status: 'disconnected',
        disconnected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    // Optionally clear the profile's social link
    if (['instagram', 'tiktok'].includes(connection.platform)) {
      await supabase
        .from('profiles')
        .update({
          [connection.platform]: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      message: `Disconnected ${connection.platform}`,
    });
  } catch (error) {
    console.error("[Social Profiles] Error disconnecting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect social profile" },
      { status: 500 }
    );
  }
}

