'use client';

import React, { useRef } from 'react';
import { colors, fonts, type PortfolioPhoto, type Template, TEMPLATES, type PhotoUploadStatus } from '../types';

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

// ============================================================================
// Photo Card Component
// ============================================================================

interface PhotoCardProps {
  photo: PortfolioPhoto;
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  onRetry?: (id: string) => void;
}

function PhotoCard({ photo, onToggleVisibility, onRemove, onUpdateCredit, onRetry }: PhotoCardProps): React.JSX.Element {
  const isUploading = photo.uploadStatus === 'uploading';
  const hasError = photo.uploadStatus === 'error';
  const isUploaded = photo.uploadStatus === 'uploaded';

  return (
    <div
      style={{
        border: `1px solid ${hasError ? colors.error : colors.border}`,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        backgroundColor: colors.white,
        opacity: isUploading ? 0.8 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Image */}
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
        
        {/* Actions overlay */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          {/* Upload status indicator */}
          {isUploaded && (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
              }}
              title="Uploaded"
            >
              <CheckIcon size={14} />
            </div>
          )}
          
          {hasError && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(photo.id)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: colors.error,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
              }}
              title={`Upload failed: ${photo.uploadError || 'Unknown error'}. Click to retry.`}
            >
              <RefreshIcon size={14} />
            </button>
          )}
          
          <button
            type="button"
            onClick={() => onToggleVisibility(photo.id)}
            disabled={isUploading}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
            }}
            title={photo.visible ? 'Hide photo' : 'Show photo'}
          >
            {photo.visible ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            disabled={isUploading}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.error,
            }}
            title="Remove photo"
          >
            <TrashIcon size={14} />
          </button>
        </div>
        
        {/* Hidden badge */}
        {!photo.visible && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: colors.white,
              fontSize: '10px',
              borderRadius: '0.25rem',
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
              bottom: '0.5rem',
              left: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: colors.error,
              color: colors.white,
              fontSize: '10px',
              borderRadius: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <AlertIcon size={10} />
            Upload failed
          </div>
        )}
      </div>
      {/* Credits */}
      <div style={{ padding: '0.75rem' }}>
        <input
          type="text"
          placeholder="Photographer"
          value={photo.photographer}
          onChange={(e) => onUpdateCredit(photo.id, 'photographer', e.target.value)}
          disabled={isUploading}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '12px',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.375rem',
            marginBottom: '0.5rem',
            outline: 'none',
            opacity: isUploading ? 0.5 : 1,
          }}
        />
        <input
          type="text"
          placeholder="Studio/Location"
          value={photo.studio}
          onChange={(e) => onUpdateCredit(photo.id, 'studio', e.target.value)}
          disabled={isUploading}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '12px',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.375rem',
            outline: 'none',
            opacity: isUploading ? 0.5 : 1,
          }}
        />
      </div>
      
      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
  onUpdateCredit,
  onRetryUpload,
  selectedTemplate,
  modelName = '',
  isUploading = false,
  uploadProgress = { uploaded: 0, total: 0 },
}: PhotosStepProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const template = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[1];

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
          borderRadius: '0.75rem',
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
            borderRadius: '0.5rem',
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

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onToggleVisibility={onToggleVisibility}
              onRemove={onRemovePhoto}
              onUpdateCredit={onUpdateCredit}
              onRetry={onRetryUpload}
            />
          ))}
        </div>
      )}

      {/* Preview */}
      {photos.length > 0 && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: template.bgColor,
            borderRadius: '0.75rem',
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
                    borderRadius: '0.375rem',
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
                  borderRadius: '0.375rem',
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
    </>
  );
}

