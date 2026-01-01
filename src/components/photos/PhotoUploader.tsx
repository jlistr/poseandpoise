"use client";

import { useState, useRef, useCallback } from "react";
import { uploadPhoto, type Photo } from "@/app/actions/photos";
import { colors, typography, spacing } from "@/styles/tokens";
import { CameraIcon, HourglassIcon } from "@/components/icons/Icons";

interface PhotoUploaderProps {
  onUploadComplete?: (photos: Photo[]) => void;
}

export function PhotoUploader({ onUploadComplete }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    const uploadedPhotos: Photo[] = [];

    // Upload files one at a time
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
      
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadPhoto(formData);

      if (!result.success) {
        setError(result.message);
        break;
      }
      
      if (result.data) {
        uploadedPhotos.push(result.data);
      }
    }

    setUploading(false);
    setUploadProgress("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (uploadedPhotos.length > 0) {
      onUploadComplete?.(uploadedPhotos);
    }
  }, [onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? colors.camel : colors.border.light}`,
          borderRadius: "4px",
          padding: spacing.padding.xl,
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: isDragging ? "rgba(196, 164, 132, 0.05)" : "transparent",
          transition: "all 0.2s ease",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <div style={{ color: colors.camel, marginBottom: spacing.padding.md }}>
  {uploading ? <HourglassIcon size={32} /> : <CameraIcon size={32} />}
</div>
        <p
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.cardH3,
            fontWeight: typography.fontWeight.regular,
            marginBottom: spacing.padding.xs,
            color: colors.text.primary,
          }}
        >
          {uploading ? uploadProgress || "Uploading..." : "Drop photos here"}
        </p>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            color: colors.text.muted,
          }}
        >
          {uploading ? "Please wait" : "or click to browse"}
        </p>
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.text.muted,
            marginTop: spacing.padding.md,
          }}
        >
          JPEG, PNG, or WebP • Max 10MB each
        </p>
      </div>

      {error && (
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            color: "#D64545",
            marginTop: spacing.padding.sm,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}