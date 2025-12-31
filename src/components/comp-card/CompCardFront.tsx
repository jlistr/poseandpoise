"use client";

import type { Profile } from "@/app/actions/profile";
import type { Photo } from "@/app/actions/photos";
import { colors, typography, spacing } from "@/styles/tokens";

interface CompCardFrontProps {
  profile: Profile;
  headshot: Photo | null;
}

export function CompCardFront({ profile, headshot }: CompCardFrontProps) {
  return (
    <div
      id="comp-card-front"
      style={{
        width: "100%",
        maxWidth: "412px", // 5.5" at 75dpi for preview
        aspectRatio: "5.5 / 8.5",
        background: colors.cream,
        position: "relative",
        overflow: "hidden",
        fontFamily: typography.fontFamily.display,
        color: colors.charcoal,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Headshot - Full bleed */}
      {headshot ? (
        <img
          src={headshot.url}
          alt="Headshot"
          crossOrigin="anonymous"
          style={{
            // Simulate object-fit: cover for html2canvas compatibility
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
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
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
              fontSize: typography.fontSize.body,
              color: colors.text.muted,
            }}
          >
            Select a headshot
          </p>
        </div>
      )}

      {/* Overlay for name and logo */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing.padding.lg,
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          zIndex: 1,
        }}
      >
        {/* Model Name */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: typography.fontWeight.light,
            letterSpacing: typography.letterSpacing.wide,
            color: colors.cream,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {profile.display_name || profile.username || "Model Name"}
        </h1>

        {/* Agency Logo */}
        {(profile as Profile & { agency_logo_url?: string }).agency_logo_url && (
          <img
            src={(profile as Profile & { agency_logo_url?: string }).agency_logo_url}
            alt={profile.agency || "Agency"}
            crossOrigin="anonymous"
            style={{
              height: "40px",
              width: "auto",
              maxWidth: "100px",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </div>
  );
}