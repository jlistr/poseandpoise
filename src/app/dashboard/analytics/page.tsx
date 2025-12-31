import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics";
import { colors, typography, spacing } from "@/styles/tokens";
import { getProfile } from "@/app/actions/profile";
import { TemplateSelector } from "@/components/dashboard/TemplateSelector";
import { DEFAULT_TEMPLATE } from "@/config/template";
import { EditorialTemplate } from "@/components/templates/EditorialTemplate";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
export const metadata = {
  title: "Analytics | Pose & Poise",
  description: "Track your portfolio views and visitor insights",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile for portfolio link
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_public")
    .eq("id", user.id)
    .single();

  const portfolioUrl = profile?.username
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://poseandpoise.studio"}/${profile.username}`
    : null;

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
        {/* Header */}
        <div
          style={{
            marginBottom: spacing.padding.xl,
            paddingBottom: spacing.padding.lg,
            borderBottom: `1px solid ${colors.border.divider}`,
          }}
        >
          <h1
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.sectionH2,
              fontWeight: typography.fontWeight.light,
              color: colors.text.primary,
              marginBottom: spacing.padding.sm,
            }}
          >
            Analytics
          </h1>
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              color: colors.text.secondary,
            }}
          >
            Track how people are discovering and viewing your portfolio.
          </p>

          {/* Portfolio link info */}
          {portfolioUrl && profile?.is_public && (
            <div
              style={{
                marginTop: spacing.padding.md,
                padding: spacing.padding.md,
                background: colors.background.card,
                border: `1px solid ${colors.border.subtle}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: spacing.gap.sm,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "4px",
                  }}
                >
                  Your Portfolio
                </p>
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    color: colors.camel,
                    textDecoration: "none",
                  }}
                >
                  {portfolioUrl}
                </a>
              </div>
            </div>
          )}

          {!profile?.is_public && (
            <div
              style={{
                marginTop: spacing.padding.md,
                padding: spacing.padding.md,
                background: "rgba(196, 164, 132, 0.1)",
                border: `1px solid ${colors.accent.light}`,
              }}
            >
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.text.secondary,
                }}
              >
                ⚠️ Your portfolio is currently private. Make it public in your{" "}
                <Link
                  href="/dashboard/profile"
                  style={{ color: colors.camel, textDecoration: "underline" }}
                >
                  Profile settings
                </Link>{" "}
                to start tracking views.
              </p>
            </div>
          )}
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
      </main>
    </div>
  );
}