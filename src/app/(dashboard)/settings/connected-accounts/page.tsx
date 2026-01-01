import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConnectedAccountsClient } from "./ConnectedAccountsClient";

export const metadata = {
  title: "Connected Accounts | Pose & Poise",
  description: "Manage your connected social media accounts",
};

interface Identity {
  id: string;
  provider: string;
  identityId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string | null;
}

async function getIdentities(userId: string): Promise<{
  identities: Identity[];
  canUnlink: boolean;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { identities: [], canUnlink: false };
  }

  const identities = (user.identities || []).map((identity) => ({
    id: identity.id,
    provider: identity.provider,
    identityId: identity.identity_id,
    email: identity.identity_data?.email || null,
    name: identity.identity_data?.full_name || identity.identity_data?.name || null,
    avatarUrl: identity.identity_data?.avatar_url || identity.identity_data?.picture || null,
    createdAt: identity.created_at || new Date().toISOString(),
    lastSignInAt: identity.last_sign_in_at || null,
  }));

  return {
    identities,
    canUnlink: identities.length > 1,
  };
}

export default async function ConnectedAccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { identities, canUnlink } = await getIdentities(user.id);

  return (
    <ConnectedAccountsClient 
      initialIdentities={identities} 
      canUnlink={canUnlink}
      userEmail={user.email || ""}
    />
  );
}

