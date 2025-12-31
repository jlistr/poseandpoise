import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import { colors, typography, spacing } from "@/styles/tokens";
import {
  AvatarIcon,
  CameraIcon,
  CompCardIcon,
  AnalyticsIcon,
} from "@/components/icons/Icons";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = await getProfile();
  const profile = profileResult.data;

  // Calculate profile completion
  const profileFields = [
    profile?.display_name,
    profile?.username,
    profile?.bio,
    profile?.height_cm,
    profile?.hair_color,
    profile?.eye_color,
    profile?.location,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completionPercent = Math.round(
    (completedFields / profileFields.length) * 100
  );

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
          maxWidth: "1000px",
          margin: "0 auto",
          padding: `${spacing.padding.xl} ${spacing.padding["2xl"]}`,
        }}
      >
        {/* Welcome */}
        <div style={{ marginBottom: spacing.padding.xl }}>
          <h1
            style={{
              fontSize: typography.fontSize.featureH2,
              fontWeight: typography.fontWeight.light,
              marginBottom: spacing.padding.sm,
            }}
          >
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              color: colors.text.tertiary,
            }}
          >
            Build your portfolio and get discovered.
          </p>
        </div>

        {/* Progress Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: spacing.gap.md,
          }}
        >
          {/* Profile Card */}
          <Link
            href='/dashboard/profile'
            style={{
              padding: spacing.padding.lg,
              background: colors.background.card,
              border: `1px solid ${colors.border.subtle}`,
              textDecoration: "none",
              color: colors.text.primary,
              transition: "all 0.3s ease",
            }}
            className='pp-feature-card'
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: spacing.padding.md,
              }}
            >
              <span style={{ color: colors.charcoal }}>
                <AvatarIcon size={28} />
              </span>
              <span
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  color:
                    completionPercent === 100
                      ? colors.charcoal
                      : colors.text.muted,
                  background:
                    completionPercent === 100
                      ? "rgba(196, 164, 132, 0.1)"
                      : "rgba(26, 26, 26, 0.05)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                }}
              >
                {completionPercent}%
              </span>
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                marginBottom: spacing.padding.xs,
              }}
            >
              Profile
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.tertiary,
              }}
            >
              {completionPercent === 100
                ? "Your profile is complete"
                : "Add your stats, bio, and social links"}
            </p>
          </Link>

          {/* Photos Card */}
          <Link
            href='/dashboard/photos'
            style={{
              padding: spacing.padding.lg,
              background: colors.background.card,
              border: `1px solid ${colors.border.subtle}`,
              textDecoration: "none",
              color: colors.text.primary,
              transition: "all 0.3s ease",
            }}
            className='pp-feature-card'
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: spacing.padding.md,
              }}
            >
              <span style={{ color: colors.charcoal }}>
                <CameraIcon size={28} />
              </span>
              <span
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  color: colors.text.muted,
                  background: "rgba(26, 26, 26, 0.05)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                }}
              >
                0 photos
              </span>
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                marginBottom: spacing.padding.xs,
              }}
            >
              Photos
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.tertiary,
              }}
            >
              Upload and organize your portfolio photos
            </p>
          </Link>

          {/* Comp Card */}
          <Link
            href='/dashboard/comp-card'
            style={{
              padding: spacing.padding.lg,
              background: colors.background.card,
              border: `1px solid ${colors.border.subtle}`,
              textDecoration: "none",
              color: colors.text.primary,
              transition: "all 0.3s ease",
            }}
            className='pp-feature-card'
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: spacing.padding.md,
              }}
            >
              <span style={{ color: colors.charcoal }}>
                <CompCardIcon size={28} />
              </span>
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                marginBottom: spacing.padding.xs,
              }}
            >
              Comp Card
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.tertiary,
              }}
            >
              Generate a professional comp card
            </p>
          </Link>

          {/* Analytics Card */}
          <Link
            href='/dashboard/analytics'
            style={{
              padding: spacing.padding.lg,
              background: colors.background.card,
              border: `1px solid ${colors.border.subtle}`,
              textDecoration: "none",
              color: colors.text.primary,
              transition: "all 0.3s ease",
            }}
            className='pp-feature-card'
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: spacing.padding.md,
              }}
            >
              <span style={{ color: colors.charcoal }}>
                <AnalyticsIcon size={28} />
              </span>
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                marginBottom: spacing.padding.xs,
              }}
            >
              Analytics
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.tertiary,
              }}
            >
              Track portfolio views and visitors
            </p>
          </Link>
        </div>

        {/* Portfolio URL */}
        {profile?.username && (
          <div
            style={{
              marginTop: spacing.padding.xl,
              padding: spacing.padding.lg,
              background: "rgba(196, 164, 132, 0.05)",
              border: `1px solid ${colors.accent.light}`,
            }}
          >
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: spacing.padding.xs,
              }}
            >
              Your Portfolio URL
            </p>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.body,
                color: colors.text.primary,
              }}
            >
              poseandpoise.studio/
              <span style={{ color: colors.charcoal }}>{profile.username}</span>
              {!profile.is_public && (
                <span
                  style={{
                    marginLeft: "12px",
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                    background: "rgba(26, 26, 26, 0.05)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  Private
                </span>
              )}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
