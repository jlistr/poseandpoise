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
  TemplatesIcon,
  PortfolioEditorIcon,
} from "@/components/icons/Icons";
import { PortfolioVisibilityToggle } from "@/components/dashboard/PortfolioVisibilityToggle";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if onboarding is completed and get subscription tier
  const { data: profileCheck } = await supabase
    .from("profiles")
    .select("onboarding_completed, subscription_tier")
    .eq("id", user.id)
    .single();
  
  if (!profileCheck?.onboarding_completed) {
    redirect("/onboarding");
  }

  const profileResult = await getProfile();
  const profile = profileResult.data;
  
  const subscriptionTier = profileCheck?.subscription_tier || "FREE";
  const isFreeUser = subscriptionTier === "FREE";

  // Get photo count
  const { count: photoCount } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);

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

        {/* Upgrade CTA for Free Users */}
        {isFreeUser && (
          <div
            style={{
              marginBottom: spacing.padding.xl,
              padding: "28px 32px",
              background: "linear-gradient(135deg, #FFF5F7 0%, #FFF9F0 50%, #F5F0FF 100%)",
              border: "1px solid rgba(255, 122, 162, 0.3)",
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative gradient accent */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "100%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255, 122, 162, 0.08) 100%)",
                pointerEvents: "none",
              }}
            />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
              <div style={{ flex: "1 1 400px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    fontFamily: typography.fontFamily.body,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#FF7AA2",
                  }}>
                    ✨ Unlock More
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: typography.fontSize.cardH3,
                    fontWeight: typography.fontWeight.light,
                    marginBottom: "12px",
                    color: colors.text.primary,
                  }}
                >
                  Ready to Stand Out?
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    fontFamily: typography.fontFamily.body,
                    fontSize: "13px",
                    color: colors.text.secondary,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    50+ Portfolio Photos
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Premium Templates
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    PDF Comp Cards
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Advanced Analytics
                  </span>
                </div>
              </div>
              
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  backgroundColor: "#1A1A1A",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontFamily: typography.fontFamily.body,
                  fontWeight: 500,
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                Upgrade Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

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
                {photoCount ?? 0} {photoCount === 1 ? "photo" : "photos"}
              </span>
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                marginBottom: spacing.padding.xs,
              }}
            >
              Media Library
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.tertiary,
              }}
            >
              Track photo performance and engagement
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

          {/* Templates Card */}
          <Link
            href='/dashboard/templates'
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
                <TemplatesIcon size={28} />
              </span>
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.cardH3,
                fontWeight: typography.fontWeight.regular,
                marginBottom: spacing.padding.xs,
              }}
            >
              Templates
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.tertiary,
              }}
            >
              Choose your portfolio template and style
            </p>
          </Link>

          {/* Portfolio Editor Card */}
          {profile?.username && (
            <Link
              href={`/preview/${profile.username}?edit=true`}
              style={{
                padding: spacing.padding.lg,
                background: colors.background.card,
                border: `1px solid ${colors.accent.light}`,
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
                  <PortfolioEditorIcon size={28} />
                </span>
                <span
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.micro,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.charcoal,
                    background: "rgba(196, 164, 132, 0.15)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Edit Mode
                </span>
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.cardH3,
                  fontWeight: typography.fontWeight.regular,
                  marginBottom: spacing.padding.xs,
                }}
              >
                Portfolio Editor
              </h3>
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.text.tertiary,
                }}
              >
                Edit your portfolio content directly
              </p>
            </Link>
          )}
        </div>

        {/* Portfolio URL & Visibility Toggle */}
        {profile?.username && (
          <PortfolioVisibilityToggle 
            username={profile.username} 
            initialIsPublic={profile.is_public || false}
          />
        )}
      </main>
    </div>
  );
}
