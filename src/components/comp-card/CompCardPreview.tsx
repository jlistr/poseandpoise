"use client";

import type { Profile } from "@/app/actions/profile";
import type { Photo } from "@/app/actions/photos";
import { colors, typography, spacing } from "@/styles/tokens";

interface CompCardPreviewProps {
  profile: Profile;
  photos: Photo[];
  template?: "classic" | "minimal" | "bold";
}

export function CompCardPreview({ profile, photos, template = "classic" }: CompCardPreviewProps) {
  // Format measurements
  const stats = [
    { label: "Height", value: profile.height_cm ? `${profile.height_cm}cm` : null },
    { label: "Bust", value: profile.bust_cm ? `${profile.bust_cm}cm` : null },
    { label: "Waist", value: profile.waist_cm ? `${profile.waist_cm}cm` : null },
    { label: "Hips", value: profile.hips_cm ? `${profile.hips_cm}cm` : null },
    { label: "Shoe", value: profile.shoe_size },
    { label: "Hair", value: profile.hair_color },
    { label: "Eyes", value: profile.eye_color },
  ].filter((s) => s.value);

  const mainPhoto = photos[0];
  const secondaryPhotos = photos.slice(1, 5);

  // Reusable image container style that works with html2canvas
  const imageContainerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    background: colors.border.subtle,
  };

  // Reusable image style that simulates object-fit: cover for html2canvas
  const imageStyle: React.CSSProperties = {
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
  };

  return (
    <div
      id="comp-card-preview"
      style={{
        width: "100%",
        maxWidth: "600px",
        aspectRatio: "2 / 3",
        background: colors.cream,
        padding: spacing.padding.lg,
        display: "flex",
        flexDirection: "column",
        fontFamily: typography.fontFamily.display,
        color: colors.charcoal,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: spacing.padding.md,
          paddingBottom: spacing.padding.sm,
          borderBottom: `1px solid ${colors.border.divider}`,
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: typography.fontWeight.light,
            letterSpacing: typography.letterSpacing.wide,
            margin: 0,
          }}
        >
          {profile.display_name || profile.username || "Model Name"}
        </h1>
        {profile.agency && (
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: "11px",
              color: colors.camel,
              textTransform: "uppercase",
              letterSpacing: typography.letterSpacing.wider,
              marginTop: "4px",
            }}
          >
            {profile.agency}
          </p>
        )}
      </div>

      {/* Photos Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: secondaryPhotos.length > 0 ? "2fr 1fr" : "1fr",
          gridTemplateRows: secondaryPhotos.length > 2 ? "1fr 1fr" : "1fr",
          gap: spacing.gap.sm,
          marginBottom: spacing.padding.md,
        }}
      >
        {/* Main Photo */}
        {mainPhoto ? (
          <div
            style={{
              ...imageContainerStyle,
              gridRow: secondaryPhotos.length > 2 ? "span 2" : "span 1",
            }}
          >
            <img
              src={mainPhoto.url}
              alt="Main photo"
              crossOrigin="anonymous"
              style={imageStyle}
            />
          </div>
        ) : (
          <div
            style={{
              background: colors.background.card,
              border: `1px dashed ${colors.border.light}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gridRow: "span 2",
            }}
          >
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
              }}
            >
              Select photos
            </p>
          </div>
        )}

        {/* Secondary Photos */}
        {secondaryPhotos.map((photo) => (
          <div
            key={photo.id}
            style={imageContainerStyle}
          >
            <img
              src={photo.url}
              alt="Secondary photo"
              crossOrigin="anonymous"
              style={imageStyle}
            />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: spacing.gap.md,
          paddingTop: spacing.padding.sm,
          borderTop: `1px solid ${colors.border.divider}`,
        }}
      >
        {stats.map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "9px",
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: "12px",
                color: colors.text.primary,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Contact / Social */}
      {(profile.instagram || profile.location) && (
        <div
          style={{
            textAlign: "center",
            marginTop: spacing.padding.sm,
            paddingTop: spacing.padding.sm,
            borderTop: `1px solid ${colors.border.divider}`,
          }}
        >
          <p
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: "10px",
              color: colors.text.muted,
            }}
          >
            {[profile.location, profile.instagram].filter(Boolean).join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}