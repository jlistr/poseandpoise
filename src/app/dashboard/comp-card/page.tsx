import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import { getPhotos } from "@/app/actions/photos";
import { getCompCards } from "@/app/actions/comp-card";
import { CompCardClient } from "@/components/comp-card/index-enhanced";
import { colors, typography, spacing } from "@/styles/tokens";

export default async function CompCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, photosResult, compCardsResult] = await Promise.all([
    getProfile(),
    getPhotos(),
    getCompCards(),
  ]);

  const profile = profileResult.data;
  const photos = photosResult.data || [];
  const compCards = compCardsResult.data || [];

  if (!profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: colors.background.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Error loading profile.</p>
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
          maxWidth: "1200px",
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
            Comp Card Generator
          </h1>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              color: colors.text.tertiary,
            }}
          >
            Create a professional comp card to share with agencies and clients.
          </p>
        </div>

        {/* Profile Completion Warning */}
        {(!profile.display_name || !profile.height_cm) && (
          <div
            style={{
              padding: spacing.padding.md,
              background: "rgba(196, 164, 132, 0.1)",
              border: `1px solid ${colors.accent.light}`,
              marginBottom: spacing.padding.lg,
            }}
          >
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.secondary,
              }}
            >
              💡 Complete your{" "}
              <Link href="/dashboard/profile" style={{ color: colors.camel }}>
                profile
              </Link>{" "}
              to add your name and measurements to your comp card.
            </p>
          </div>
        )}

        {/* Photos Warning */}
        {photos.length === 0 && (
          <div
            style={{
              padding: spacing.padding.md,
              background: "rgba(196, 164, 132, 0.1)",
              border: `1px solid ${colors.accent.light}`,
              marginBottom: spacing.padding.lg,
            }}
          >
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.secondary,
              }}
            >
              📷 Upload{" "}
              <Link href="/dashboard/photos" style={{ color: colors.camel }}>
                photos
              </Link>{" "}
              first to create a comp card.
            </p>
          </div>
        )}

        <CompCardClient
          profile={profile}
          photos={photos}
          initialCompCards={compCards}
        />
      </main>
    </div>
  );
}