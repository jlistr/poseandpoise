"use client";

import { useState } from "react";
import { deletePhoto, updatePhotoCaption } from "@/app/actions/photos";
import type { Photo } from "@/app/actions/photos";
import { colors, typography, spacing } from "@/styles/tokens";
import { EditIcon, DeleteIcon } from "../icons/Icons";

interface PhotoGalleryProps {
  photos: Photo[];
  onUpdate?: () => void;
}

export function PhotoGallery({ photos, onUpdate }: PhotoGalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const handleDelete = async (photoId: string) => {
    if (!confirm("Delete this photo?")) return;

    setDeletingId(photoId);
    await deletePhoto(photoId);
    setDeletingId(null);
    onUpdate?.();
  };

  const handleEditCaption = (photo: Photo) => {
    setEditingId(photo.id);
    setEditCaption(photo.caption || "");
  };

  const handleSaveCaption = async (photoId: string) => {
    await updatePhotoCaption(photoId, editCaption);
    setEditingId(null);
    setEditCaption("");
    onUpdate?.();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCaption("");
  };

  if (photos.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: spacing.padding.xl,
          color: colors.text.muted,
        }}
      >
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
          }}
        >
          No photos yet. Upload some to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: spacing.gap.md,
      }}
    >
      {photos.map((photo) => (
        <div
          key={photo.id}
          style={{
            position: "relative",
            background: colors.background.card,
            border: `1px solid ${colors.border.subtle}`,
            overflow: "hidden",
          }}
        >
          {/* Image */}
          <div
            style={{
              aspectRatio: "3 / 4",
              overflow: "hidden",
            }}
          >
            <img
              src={photo.url}
              alt={photo.caption || "Portfolio photo"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: deletingId === photo.id ? 0.5 : 1,
                transition: "opacity 0.2s ease",
              }}
            />
          </div>

          {/* Actions overlay */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              display: "flex",
              gap: "4px",
            }}
          >
            <button
              onClick={() => handleEditCaption(photo)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255, 255, 255, 0.9)",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Edit caption"
            >
              <EditIcon/>
            </button>
            <button 
              onClick={() => handleDelete(photo.id)}
              disabled={deletingId === photo.id}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255, 255, 255, 0.9)",
                cursor: deletingId === photo.id ? "not-allowed" : "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Delete photo"
            >
              <DeleteIcon/>
            </button>
          </div>

          {/* Caption */}
          <div style={{ padding: spacing.padding.sm }}>
            {editingId === photo.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Add a caption..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${colors.border.light}`,
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    outline: "none",
                  }}
                  autoFocus
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleSaveCaption(photo.id)}
                    style={{
                      flex: 1,
                      padding: "6px",
                      background: colors.charcoal,
                      color: colors.cream,
                      border: "none",
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      flex: 1,
                      padding: "6px",
                      background: "transparent",
                      color: colors.text.muted,
                      border: `1px solid ${colors.border.light}`,
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  color: photo.caption ? colors.text.secondary : colors.text.muted,
                  fontStyle: photo.caption ? "normal" : "italic",
                  margin: 0,
                  minHeight: "20px",
                }}
              >
                {photo.caption || "No caption"}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}