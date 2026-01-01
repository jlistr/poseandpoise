'use client';

import { useState, useCallback, useRef } from 'react';
import { useEditMode } from './PortfolioPreview';

interface PhotoUploadZoneProps {
  accentColor?: string;
}

export function PhotoUploadZone({ accentColor = '#C4A484' }: PhotoUploadZoneProps) {
  const editMode = useEditMode();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && editMode?.onAddPhotos) {
      await editMode.onAddPhotos(files);
    }
  }, [editMode]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && editMode?.onAddPhotos) {
      await editMode.onAddPhotos(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editMode]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Only show in edit mode
  if (!editMode?.isEditMode) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        padding: '40px 24px',
        border: `2px dashed ${isDragging ? accentColor : 'rgba(26, 26, 26, 0.2)'}`,
        borderRadius: '12px',
        background: isDragging ? `${accentColor}10` : 'rgba(26, 26, 26, 0.02)',
        cursor: editMode.isUploadingPhotos ? 'wait' : 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        marginBottom: '24px',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {editMode.isUploadingPhotos ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Spinner color={accentColor} />
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            color: 'rgba(26, 26, 26, 0.6)',
            margin: 0,
          }}>
            Uploading photos...
          </p>
        </div>
      ) : (
        <>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: `${accentColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UploadIcon color={accentColor} />
          </div>
          
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '15px',
            fontWeight: 500,
            color: '#2D2D2D',
            margin: '0 0 8px',
          }}>
            {isDragging ? 'Drop photos here' : 'Add Photos to Your Portfolio'}
          </p>
          
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            color: 'rgba(26, 26, 26, 0.5)',
            margin: 0,
          }}>
            Drag & drop or click to upload • JPEG, PNG, WebP up to 10MB
          </p>
        </>
      )}
    </div>
  );
}

// Icons
function UploadIcon({ color = '#C4A484' }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Spinner({ color = '#C4A484' }: { color?: string }) {
  return (
    <>
      <style>{`@keyframes photoUploadSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: '24px',
        height: '24px',
        border: `3px solid ${color}30`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'photoUploadSpin 0.8s linear infinite',
      }} />
    </>
  );
}

