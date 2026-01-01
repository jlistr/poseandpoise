'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { colors, fonts, type PortfolioPhoto, TEMPLATES } from '../types';

// ============================================================================
// Icons
// ============================================================================

const UploadIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const EyeIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const TrashIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const RefreshIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const GripIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="8" cy="6" r="2" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="16" cy="12" r="2" />
    <circle cx="8" cy="18" r="2" />
    <circle cx="16" cy="18" r="2" />
  </svg>
);

// ============================================================================
// Sortable Photo Card Component
// ============================================================================

interface SortablePhotoCardProps {
  photo: PortfolioPhoto;
  index: number;
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  onRetry?: (id: string) => void;
}

function SortablePhotoCard({ photo, index, onToggleVisibility, onRemove, onUpdateCredit, onRetry }: SortablePhotoCardProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  const isUploading = photo.uploadStatus === 'uploading';
  const hasError = photo.uploadStatus === 'error';
  const isUploaded = photo.uploadStatus === 'uploaded';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: `1px solid ${hasError ? colors.error : isDragging ? colors.camel : colors.border}`,
        borderRadius: 0,
        overflow: 'hidden',
        backgroundColor: colors.white,
        boxShadow: isDragging ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {/* Image with overlays */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: colors.cream,
          overflow: 'hidden',
        }}
      >
        <img
          src={photo.url}
          alt="Portfolio"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: photo.visible ? 1 : 0.5,
          }}
        />

        {/* Top bar with drag handle and position */}
        <div
          {...attributes}
          {...listeners}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '0.5rem 0.75rem',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <GripIcon size={14} />
          <span style={{ 
            fontSize: '12px', 
            color: colors.white, 
            fontWeight: 500,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            #{index + 1}
          </span>
        </div>
        
        {/* Upload status overlay */}
        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: colors.white,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}
        
        {/* Actions overlay - top right */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            display: 'flex',
            gap: '0.35rem',
          }}
        >
          {/* Upload status indicator */}
          {isUploaded && (
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
              title="Uploaded"
            >
              <CheckIcon size={12} />
            </div>
          )}
          
          {hasError && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(photo.id)}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: colors.error,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
              title={`Upload failed: ${photo.uploadError || 'Unknown error'}. Click to retry.`}
            >
              <RefreshIcon size={12} />
            </button>
          )}
          
          <button
            type="button"
            onClick={() => onToggleVisibility(photo.id)}
            disabled={isUploading}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title={photo.visible ? 'Hide photo' : 'Show photo'}
          >
            {photo.visible ? <EyeIcon size={12} /> : <EyeOffIcon size={12} />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            disabled={isUploading}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.error,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="Remove photo"
          >
            <TrashIcon size={12} />
          </button>
        </div>
        
        {/* Hidden badge */}
        {!photo.visible && !hasError && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: colors.white,
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: 0,
            }}
          >
            Hidden
          </div>
        )}
        
        {/* Error badge */}
        {hasError && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '0.5rem 1rem',
              backgroundColor: colors.error,
              color: colors.white,
              fontSize: '11px',
              fontWeight: 500,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertIcon size={14} />
            Upload failed
          </div>
        )}

        {/* Credits Overlay - Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)',
            padding: '2rem 0.75rem 0.75rem',
          }}
        >
          {/* Photographer */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Photographer
            </label>
            <input
              type="text"
              placeholder="Add photographer..."
              value={photo.photographer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateCredit(photo.id, 'photographer', e.target.value)}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.35rem 0',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.white,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                outline: 'none',
                opacity: isUploading ? 0.5 : 1,
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = colors.camel;
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)';
              }}
            />
          </div>

          {/* Studio */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Studio
            </label>
            <input
              type="text"
              placeholder="Add studio..."
              value={photo.studio}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateCredit(photo.id, 'studio', e.target.value)}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.35rem 0',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.white,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                outline: 'none',
                opacity: isUploading ? 0.5 : 1,
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = colors.camel;
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Photo card for drag overlay
function PhotoCardOverlay({ photo }: { photo: PortfolioPhoto }): React.JSX.Element {
  return (
    <div
      style={{
        width: '180px',
        backgroundColor: colors.white,
        borderRadius: 0,
        boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        transform: 'rotate(3deg)',
        border: `2px solid ${colors.camel}`,
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={photo.url}
          alt="Dragging"
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            aspectRatio: '3/4',
            objectFit: 'cover',
          }}
        />
        {/* Credits overlay on drag preview */}
        {(photo.photographer || photo.studio) && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              padding: '1.5rem 0.5rem 0.5rem',
            }}
          >
            {photo.photographer && (
              <p style={{ 
                margin: 0, 
                fontSize: '11px', 
                color: colors.white,
                fontWeight: 500,
              }}>
                📷 {photo.photographer}
              </p>
            )}
            {photo.studio && (
              <p style={{ 
                margin: '0.15rem 0 0', 
                fontSize: '10px', 
                color: 'rgba(255,255,255,0.8)',
              }}>
                📍 {photo.studio}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface PhotosStepProps {
  photos: PortfolioPhoto[];
  onAddPhotos: (files: FileList) => void;
  onToggleVisibility: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onReorderPhotos: (oldIndex: number, newIndex: number) => void;
  onUpdateCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  onRetryUpload?: (id: string) => void;
  selectedTemplate: string;
  modelName?: string;
  isUploading?: boolean;
  uploadProgress?: { uploaded: number; total: number };
}

export function PhotosStep({
  photos,
  onAddPhotos,
  onToggleVisibility,
  onRemovePhoto,
  onReorderPhotos,
  onUpdateCredit,
  onRetryUpload,
  selectedTemplate,
  modelName = '',
  isUploading = false,
  uploadProgress = { uploaded: 0, total: 0 },
}: PhotosStepProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const template = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[1];

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderPhotos(oldIndex, newIndex);
      }
    }
  }, [photos, onReorderPhotos]);

  const activePhoto = photos.find(p => p.id === activeId);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddPhotos(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <>
      {/* Header */}
      <h1
        style={{
          fontFamily: fonts.heading,
          fontSize: '1.875rem',
          fontWeight: 400,
          color: colors.textPrimary,
          marginBottom: '0.5rem',
        }}
      >
        Your Portfolio Photos
      </h1>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '2rem' }}>
        Upload your best work. High-quality images make a strong first impression.
      </p>

      {/* Upload Area */}
      <div
        onClick={handleUploadClick}
        onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
        role="button"
        tabIndex={0}
        style={{
          border: `2px dashed ${colors.border}`,
          borderRadius: 0,
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: colors.cream,
          transition: 'border-color 0.2s',
          marginBottom: '2rem',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.camel)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: colors.camel,
          }}
        >
          <UploadIcon size={24} />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>
          Click to upload or drag and drop
        </p>
        <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.5rem 0 0' }}>
          JPEG, PNG, or WebP up to 10MB each
        </p>
      </div>

      {/* Upload Progress */}
      {photos.length > 0 && isUploading && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: colors.cream,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: `2px solid ${colors.border}`,
              borderTopColor: colors.camel,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '13px', color: colors.textSecondary }}>
            Uploading photos... {uploadProgress.uploaded} of {uploadProgress.total} complete
          </span>
        </div>
      )}

      {/* Photos Grid with Drag & Drop */}
      {photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              {photos.map((photo, index) => (
                <SortablePhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onToggleVisibility={onToggleVisibility}
                  onRemove={onRemovePhoto}
                  onUpdateCredit={onUpdateCredit}
                  onRetry={onRetryUpload}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activePhoto && <PhotoCardOverlay photo={activePhoto} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* Preview */}
      {photos.length > 0 && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: template.bgColor,
            borderRadius: 0,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: template.textColor,
              opacity: 0.6,
              marginBottom: '0.75rem',
            }}
          >
            PORTFOLIO PREVIEW
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {photos
              .filter((p) => p.visible)
              .slice(0, 5)
              .map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    width: '80px',
                    height: '100px',
                    borderRadius: 0,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={photo.url}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            {photos.filter((p) => p.visible).length > 5 && (
              <div
                style={{
                  width: '80px',
                  height: '100px',
                  borderRadius: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                +{photos.filter((p) => p.visible).length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: colors.textMuted,
          }}
        >
          <p style={{ fontSize: '14px', margin: 0 }}>No photos uploaded yet</p>
          <p style={{ fontSize: '12px', margin: '0.5rem 0 0' }}>
            Upload at least 3-5 photos to create a compelling portfolio
          </p>
        </div>
      )}

      {/* Drag hint */}
      {photos.length > 1 && (
        <p
          style={{
            fontSize: '12px',
            color: colors.textMuted,
            textAlign: 'center',
            marginTop: '0.5rem',
          }}
        >
          Drag photos to reorder them in your portfolio
        </p>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

