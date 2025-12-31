import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { colors, typography, spacing } from "@/styles/tokens";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getProfile();

  if (!result.success || !result.data) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: colors.background.primary,
        fontFamily: typography.fontFamily.display,
        color: colors.text.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p>Error loading profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background.primary,
        fontFamily: typography.fontFamily.display,
        color: colors.text.primary,
      }}
    >
 
      {/* Main Content */}
      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: `${spacing.padding.xl} ${spacing.padding["2xl"]}`,
        }}
      >
        <div style={{ marginBottom: spacing.padding.xl }}>
          <h1
            style={{
              fontSize: typography.fontSize.featureH2,
              fontWeight: typography.fontWeight.light,
              marginBottom: spacing.padding.sm,
            }}
          >
            Edit Profile
          </h1>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              color: colors.text.tertiary,
            }}
          >
            Complete your profile to showcase yourself to agencies and brands.
          </p>
        </div>

        <ProfileForm profile={result.data} />
      </main>
    </div>
  );
}