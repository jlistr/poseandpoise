"use client";

import { useState, useEffect, useCallback } from "react";
import { getPhotos, type Photo } from "@/app/actions/photos";
import { PhotoUploader, PhotoGallery } from "@/components/photos";
import { colors, typography, spacing } from "@/styles/tokens";

interface PhotosClientProps {
  initialPhotos: Photo[];
}

export function PhotosClient({ initialPhotos }: PhotosClientProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);

  const refreshPhotos = useCallback(async () => {
    const result = await getPhotos();
    if (result.success && result.data) {
      setPhotos(result.data);
    }
  }, []);

  return (
    <div>
      {/* Upload Section */}
      <div style={{ marginBottom: spacing.padding.xl }}>
        <PhotoUploader onUploadComplete={refreshPhotos} />
      </div>

      {/* Gallery Section */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.padding.md,
          }}
        >
          <h2
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.cardH3,
              fontWeight: typography.fontWeight.regular,
            }}
          >
            Your Photos
          </h2>
          <span
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              color: colors.text.muted,
            }}
          >
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
        </div>
        <PhotoGallery photos={photos} onUpdate={refreshPhotos} />
      </div>
    </div>
  );
}