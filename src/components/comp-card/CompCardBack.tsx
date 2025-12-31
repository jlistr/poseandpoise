"use client";

import type { Profile } from "@/app/actions/profile";
import type { Photo } from "@/app/actions/photos";
import { colors, typography, spacing } from "@/styles/tokens";

interface CompCardBackProps {
  profile: Profile;
  photos: Photo[];
}

export function CompCardBack({ profile, photos }: CompCardBackProps) {
  const extendedProfile = profile as Profile & {
    agency_logo_url?: string;
    agency_email?: string;
    agency_phone?: string;
  };

  // Stats to display
  const stats = [
    { label: "Height", value: profile.height_cm ? `${profile.height_cm}cm` : null },
    { label: "Bust", value: profile.bust_cm ? `${profile.bust_cm}cm` : null },
    { label: "Waist", value: profile.waist_cm ? `${profile.waist_cm}cm` : null },
    { label: "Hips", value: profile.hips_cm ? `${profile.hips_cm}cm` : null },
    { label: "Shoe", value: profile.shoe_size },
    { label: "Hair", value: profile.hair_color },
    { label: "Eyes", value: profile.eye_color },
  ].filter((s) => s.value);

  // Layout based on number of photos
  const getGridStyle = () => {
    const count = photos.length;
    if (count === 0) return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" };
    if (count === 1) return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" };
    if (count === 2) return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" };
    if (count === 3) return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
    if (count === 4) return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
    return { gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr" }; // 5+ photos
  };

  return (
    <div
      id="comp-card-back"
      style={{
        width: "100%",
        maxWidth: "412px", // 5.5" at 75dpi for preview
        aspectRatio: "5.5 / 8.5",
        background: colors.cream,
        padding: spacing.padding.md,
        display: "flex",
        flexDirection: "column",
        fontFamily: typography.fontFamily.display,
        color: colors.charcoal,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Photo Collage */}
      <div
        style={{
          flex: 1,
          display: "grid",
          ...getGridStyle(),
          gap: spacing.gap.xs,
          marginBottom: spacing.padding.md,
          minHeight: 0,
        }}
      >
        {photos.length > 0 ? (
          photos.slice(0, 5).map((photo, index) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                overflow: "hidden",
                background: colors.border.subtle,
                // Make first photo span 2 rows if we have 3 photos
                ...(photos.length === 3 && index === 0 ? { gridRow: "span 2" } : {}),
              }}
            >
              {/* 
                html2canvas doesn't handle object-fit properly.
                Using absolute positioning with transform to center-crop the image.
              */}
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                crossOrigin="anonymous"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  minWidth: "100%",
                  minHeight: "100%",
                  width: "auto",
                  height: "auto",
                  maxWidth: "none",
                  maxHeight: "none",
                  display: "block",
                }}
              />
            </div>
          ))
        ) : (
          <div
            style={{
              background: colors.background.card,
              border: `1px dashed ${colors.border.light}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
              }}
            >
              Select 3-5 photos
            </p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: spacing.gap.sm,
          paddingBottom: spacing.padding.sm,
          borderBottom: `1px solid ${colors.border.divider}`,
          marginBottom: spacing.padding.sm,
        }}
      >
        {stats.map((stat) => (
          <div key={stat.label} style={{ textAlign: "center", minWidth: "50px" }}>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "8px",
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "1px",
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "11px",
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Agency Contact Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Agency Info */}
        <div>
          {profile.agency && (
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "10px",
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              {profile.agency}
            </p>
          )}
          {extendedProfile.agency_email && (
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "9px",
                color: colors.text.secondary,
              }}
            >
              {extendedProfile.agency_email}
            </p>
          )}
          {extendedProfile.agency_phone && (
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "9px",
                color: colors.text.secondary,
              }}
            >
              {extendedProfile.agency_phone}
            </p>
          )}
          {!profile.agency && !extendedProfile.agency_email && !extendedProfile.agency_phone && (
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "9px",
                color: colors.text.muted,
                fontStyle: "italic",
              }}
            >
              Add agency details in Profile
            </p>
          )}
        </div>

        {/* Agency Logo */}
        {extendedProfile.agency_logo_url && (
          <img
            src={extendedProfile.agency_logo_url}
            alt={profile.agency || "Agency"}
            crossOrigin="anonymous"
            style={{
              height: "30px",
              width: "auto",
              maxWidth: "80px",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </div>
  );
}