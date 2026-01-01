import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOutstandClient } from "@/lib/outstand/client";

/**
 * GET /api/social-profiles/callback
 * 
 * OAuth callback handler for Outstand.so
 * Called after user authorizes the social media connection
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const state = searchParams.get('state');
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error("[Social Profiles] OAuth error:", error);
    return NextResponse.redirect(
      `${origin}/settings/social-profiles?error=oauth_denied`
    );
  }

  // Validate required params
  if (!state || !code) {
    return NextResponse.redirect(
      `${origin}/settings/social-profiles?error=invalid_callback`
    );
  }

  try {
    const supabase = await createClient();

    // Verify the state exists in our database
    const { data: pendingConnection, error: dbError } = await supabase
      .from('social_profile_connections')
      .select('*')
      .eq('state', state)
      .eq('status', 'pending')
      .single();

    if (dbError || !pendingConnection) {
      console.error("[Social Profiles] Invalid or expired state:", state);
      return NextResponse.redirect(
        `${origin}/settings/social-profiles?error=invalid_state`
      );
    }

    // Verify user is still authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== pendingConnection.profile_id) {
      return NextResponse.redirect(
        `${origin}/login?next=/settings/social-profiles`
      );
    }

    // Finalize the connection with Outstand
    const outstand = getOutstandClient();
    const account = await outstand.finalizeConnection(state, code);

    // Update the connection record with account data
    await supabase
      .from('social_profile_connections')
      .update({
        status: 'connected',
        outstand_account_id: account.id,
        username: account.username,
        display_name: account.displayName,
        profile_url: account.profileUrl,
        profile_image_url: account.profileImageUrl,
        follower_count: account.followerCount,
        following_count: account.followingCount,
        verified: account.verified || false,
        connected_at: account.connectedAt,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('state', state);

    // Also update the profile's social links
    const platformField = pendingConnection.platform === 'twitter' ? 'twitter' : pendingConnection.platform;
    if (['instagram', 'tiktok'].includes(pendingConnection.platform)) {
      await supabase
        .from('profiles')
        .update({
          [platformField]: account.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.redirect(
      `${origin}/settings/social-profiles?success=${pendingConnection.platform}`
    );
  } catch (error) {
    console.error("[Social Profiles] Error finalizing connection:", error);
    return NextResponse.redirect(
      `${origin}/settings/social-profiles?error=connection_failed`
    );
  }
}

