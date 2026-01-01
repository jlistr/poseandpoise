import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPageClient } from "./SettingsPageClient";

export const metadata = {
  title: "Settings | Pose & Poise",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <SettingsPageClient />;
}

