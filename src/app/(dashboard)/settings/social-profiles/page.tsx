import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SocialProfilesClient } from "./SocialProfilesClient";

export const metadata = {
  title: "Social Profiles | Pose & Poise",
  description: "Connect and verify your social media accounts",
};

interface SocialConnection {
  id: string;
  platform: string;
  username: string | null;
  displayName: string | null;
  profileUrl: string | null;
  profileImageUrl: string | null;
  followerCount: number | null;
  followingCount: number | null;
  verified: boolean;
  connectedAt: string | null;
  lastSyncedAt: string | null;
}

async function getSocialConnections(userId: string): Promise<SocialConnection[]> {
  const supabase = await createClient();

  const { data: connections } = await supabase
    .from('social_profile_connections')
    .select('*')
    .eq('profile_id', userId)
    .eq('status', 'connected')
    .order('platform');

  return (connections || []).map((conn) => ({
    id: conn.id,
    platform: conn.platform,
    username: conn.username,
    displayName: conn.display_name,
    profileUrl: conn.profile_url,
    profileImageUrl: conn.profile_image_url,
    followerCount: conn.follower_count,
    followingCount: conn.following_count,
    verified: conn.verified || false,
    connectedAt: conn.connected_at,
    lastSyncedAt: conn.last_synced_at,
  }));
}

export default async function SocialProfilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, instagram, tiktok')
    .eq('id', user.id)
    .single();

  const connections = await getSocialConnections(user.id);

  // Check for feature availability
  const hasOutstandApiKey = !!process.env.OUTSTAND_API_KEY;

  return (
    <SocialProfilesClient 
      initialConnections={connections}
      subscriptionTier={profile?.subscription_tier || 'FREE'}
      manualInstagram={profile?.instagram}
      manualTiktok={profile?.tiktok}
      isFeatureEnabled={hasOutstandApiKey}
    />
  );
}

