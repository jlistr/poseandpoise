import Link from "next/link";
import { PortfolioTracker } from "@/components/analytics";
import { colors, typography, spacing } from "@/styles/tokens";

// Define the profile type based on your schema
interface Photo {
  id: string;
  url: string;
  caption?: string | null;
}

interface ProfileData {
  id: string;
  display_name?: string | null;
  bio?: string | null;
  agency?: string | null;
  height_cm?: number | null;
  bust_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  shoe_size?: string | null;
  hair_color?: string | null;
  eye_color?: string | null;
  location?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
  photos: Photo[];
}

interface EditorialTemplateProps {
  profile: ProfileData;
  username: string;
}

export function EditorialTemplate({ profile, username }: EditorialTemplateProps) {
  // Format measurements for display
  const measurements = [
    profile.height_cm && `${profile.height_cm}cm`,
    profile.bust_cm && profile.waist_cm && profile.hips_cm && 
      `${profile.bust_cm}-${profile.waist_cm}-${profile.hips_cm}`,
    profile.shoe_size && `Shoe ${profile.shoe_size}`,
  ].filter(Boolean);

  const details = [
    profile.hair_color && `${profile.hair_color} hair`,
    profile.eye_color && `${profile.eye_color} eyes`,
    profile.location,
  ].filter(Boolean);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background.primary,
        fontFamily: typography.fontFamily.display,
        color: colors.text.primary,
      }}
    >
      {/* Analytics Tracker */}
      <PortfolioTracker profileId={profile.id} pagePath={`/${username}`} />

      {/* Header */}
      <header
        style={{
          padding: `${spacing.padding.md} ${spacing.padding["2xl"]}`,
          borderBottom: `1px solid ${colors.border.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: typography.fontSize.logo,
            fontWeight: typography.fontWeight.light,
            letterSpacing: typography.letterSpacing.widest,
            textTransform: "uppercase",
            textDecoration: "none",
            color: colors.text.primary,
          }}
        >
          Pose & Poise
        </Link>
        <Link
          href="/signup"
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            letterSpacing: typography.letterSpacing.wider,
            textTransform: "uppercase",
            color: colors.camel,
            textDecoration: "none",
          }}
        >
          Create Your Portfolio
        </Link>
      </header>

      {/* Profile Section */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: `${spacing.padding.xl} ${spacing.padding["2xl"]}`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: spacing.gap["2xl"],
            alignItems: "start",
          }}
        >
          {/* Left Column - Info */}
          <div
            style={{
              position: "sticky",
              top: spacing.padding.xl,
            }}
          >
            {/* Name */}
            <h1
              style={{
                fontSize: typography.fontSize.featureH2,
                fontWeight: typography.fontWeight.light,
                marginBottom: spacing.padding.sm,
                lineHeight: typography.lineHeight.snug,
              }}
            >
              {profile.display_name || username}
            </h1>

            {/* Agency */}
            {profile.agency && (
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.bodySmall,
                  color: colors.camel,
                  marginBottom: spacing.padding.md,
                  textTransform: "uppercase",
                  letterSpacing: typography.letterSpacing.wide,
                }}
              >
                {profile.agency}
              </p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.body,
                  fontWeight: typography.fontWeight.light,
                  color: colors.text.secondary,
                  lineHeight: typography.lineHeight.loose,
                  marginBottom: spacing.padding.lg,
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* Divider */}
            <div
              style={{
                width: "40px",
                height: "1px",
                background: colors.camel,
                margin: `${spacing.padding.lg} 0`,
              }}
            />

            {/* Measurements */}
            {measurements.length > 0 && (
              <div style={{ marginBottom: spacing.padding.lg }}>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: typography.letterSpacing.wide,
                    marginBottom: spacing.padding.xs,
                  }}
                >
                  Measurements
                </p>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.body,
                    color: colors.text.primary,
                  }}
                >
                  {measurements.join(" • ")}
                </p>
              </div>
            )}

            {/* Details */}
            {details.length > 0 && (
              <div style={{ marginBottom: spacing.padding.lg }}>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: typography.letterSpacing.wide,
                    marginBottom: spacing.padding.xs,
                  }}
                >
                  Details
                </p>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.body,
                    color: colors.text.primary,
                  }}
                >
                  {details.join(" • ")}
                </p>
              </div>
            )}

            {/* Social Links */}
            {(profile.instagram || profile.tiktok || profile.website) && (
              <div style={{ marginBottom: spacing.padding.lg }}>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: typography.letterSpacing.wide,
                    marginBottom: spacing.padding.sm,
                  }}
                >
                  Connect
                </p>
                <div style={{ display: "flex", gap: spacing.gap.md }}>
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.secondary,
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                      }}
                      className="auth-link"
                    >
                      Instagram
                    </a>
                  )}
                  {profile.tiktok && (
                    <a
                      href={`https://tiktok.com/${profile.tiktok.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.secondary,
                        textDecoration: "none",
                      }}
                      className="auth-link"
                    >
                      TikTok
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.bodySmall,
                        color: colors.text.secondary,
                        textDecoration: "none",
                      }}
                      className="auth-link"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Photos */}
          <div>
            {profile.photos.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: spacing.gap.md,
                }}
              >
                {profile.photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    style={{
                      aspectRatio: index === 0 ? "3 / 4" : "3 / 4",
                      gridColumn: index === 0 ? "span 2" : "span 1",
                      overflow: "hidden",
                      background: colors.border.subtle,
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `${profile.display_name || username} - Photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  aspectRatio: "3 / 4",
                  background: colors.background.card,
                  border: `1px solid ${colors.border.subtle}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.body,
                    color: colors.text.muted,
                  }}
                >
                  No photos yet
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: `${spacing.padding.xl} ${spacing.padding["2xl"]}`,
          borderTop: `1px solid ${colors.border.divider}`,
          textAlign: "center",
          marginTop: spacing.padding.xl,
        }}
      >
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.text.muted,
          }}
        >
          Portfolio powered by{" "}
          <Link
            href="/"
            style={{
              color: colors.camel,
              textDecoration: "none",
            }}
          >
            Pose & Poise
          </Link>
        </p>
      </footer>
    </div>
  );
}