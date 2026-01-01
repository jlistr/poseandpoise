'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { colors, fonts, type AboutData, type ModelStats } from '../types';

// ============================================================================
// Icons
// ============================================================================

const CameraIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const ScanIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

const UploadIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const XIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================================================
// Main Component
// ============================================================================

interface AboutStepProps {
  data: AboutData;
  onChange: (data: AboutData) => void;
}

export function AboutStep({ data, onChange }: AboutStepProps): React.JSX.Element {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingBlobUrlRef = useRef<string | null>(null);

  // Cleanup timeout and blob URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
      // Revoke any pending blob URL that wasn't committed
      if (pendingBlobUrlRef.current) {
        URL.revokeObjectURL(pendingBlobUrlRef.current);
      }
    };
  }, []);

  const handleStatsChange = useCallback(
    (field: keyof ModelStats, value: string) => {
      onChange({
        ...data,
        stats: { ...data.stats, [field]: value },
      });
    },
    [data, onChange]
  );

  const handleBioChange = useCallback(
    (value: string) => {
      onChange({ ...data, bio: value });
    },
    [data, onChange]
  );

  // Handle file selection/upload
  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, WebP, or GIF image.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB.');
        return;
      }

      // Cancel any pending upload timeout to prevent race conditions
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
        uploadTimeoutRef.current = null;
      }

      // Revoke any pending blob URL from a previous cancelled upload
      if (pendingBlobUrlRef.current) {
        URL.revokeObjectURL(pendingBlobUrlRef.current);
        pendingBlobUrlRef.current = null;
      }

      setIsUploading(true);

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      pendingBlobUrlRef.current = objectUrl;

      // Revoke the previous profile photo blob URL if it exists
      const previousPhotoUrl = data.profilePhoto;
      
      // Simulate upload delay (in real app, this would be an actual upload)
      uploadTimeoutRef.current = setTimeout(() => {
        // Revoke the old blob URL to prevent memory leak
        if (previousPhotoUrl && previousPhotoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previousPhotoUrl);
        }
        
        onChange({ ...data, profilePhoto: objectUrl });
        pendingBlobUrlRef.current = null; // Clear pending ref since it's now committed
        setIsUploading(false);
        uploadTimeoutRef.current = null;
      }, 500);
    },
    [data, onChange]
  );

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    if (data.profilePhoto) {
      URL.revokeObjectURL(data.profilePhoto);
    }
    onChange({ ...data, profilePhoto: null });
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAnalyzePhoto = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      onChange({
        ...data,
        stats: {
          ...data.stats,
          hairColor: 'Brunette',
          eyeColor: 'Hazel',
          height: "5'9\"",
        },
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleScanCompCard = () => {
    setIsAnalyzing(true);
    // Simulate comp card scan
    setTimeout(() => {
      onChange({
        ...data,
        stats: {
          height: "5'9\"",
          bust: '32"',
          waist: '24"',
          hips: '34"',
          shoes: '8',
          dress: '4',
          hairColor: 'Brunette',
          eyeColor: 'Hazel',
        },
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleGenerateBio = () => {
    setIsGeneratingBio(true);
    setTimeout(() => {
      onChange({
        ...data,
        bio: `A rising face in contemporary fashion, known for striking versatility and effortless presence. Equally at home in high-fashion editorials as in commercial lifestyle campaigns. Brings quiet confidence to every shoot with intentional movement and fluid poses.`,
      });
      setIsGeneratingBio(false);
    }, 1500);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    outline: 'none',
    backgroundColor: colors.white,
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: colors.textSecondary,
    marginBottom: '0.375rem',
    display: 'block',
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

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
        About You
      </h1>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '2rem' }}>
        Share your measurements and a bit about yourself. This helps clients find the right fit.
      </p>

      {/* Profile Photo - Drag & Drop Zone */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            backgroundColor: isDragActive ? 'rgba(196, 164, 132, 0.1)' : colors.cream,
            borderRadius: '0.75rem',
            border: isDragActive ? `2px dashed ${colors.camel}` : '2px dashed transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onClick={!data.profilePhoto ? handlePhotoUpload : undefined}
        >
          {/* Avatar - Perfect circle */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: data.profilePhoto ? 'transparent' : colors.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
              border: data.profilePhoto ? `3px solid ${colors.camel}` : 'none',
              boxShadow: data.profilePhoto ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {isUploading ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(196, 164, 132, 0.2)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    border: `3px solid ${colors.camel}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </div>
            ) : data.profilePhoto ? (
              <img
                src={data.profilePhoto}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <CameraIcon size={28} />
            )}

            {/* Remove button overlay */}
            {data.profilePhoto && !isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: colors.charcoal,
                  color: colors.white,
                  border: `2px solid ${colors.white}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                <XIcon size={12} />
              </button>
            )}
          </div>

          {/* Upload text and button */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>
              Profile Photo
            </p>
            <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.25rem 0 0.75rem' }}>
              {isDragActive
                ? 'Drop your image here...'
                : data.profilePhoto
                ? 'Click to change or drag a new photo'
                : 'Drag & drop a headshot, or click to browse'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoUpload();
                }}
                disabled={isUploading}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: colors.white,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.375rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  opacity: isUploading ? 0.6 : 1,
                }}
              >
                <UploadIcon size={14} />
                {isUploading ? 'Uploading...' : data.profilePhoto ? 'Change Photo' : 'Upload Photo'}
              </button>
              <span style={{ fontSize: '11px', color: colors.textMuted }}>
                JPEG, PNG, WebP • Max 5MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: colors.camel,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <SparklesIcon size={12} />
          AI-POWERED TOOLS
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleAnalyzePhoto}
            disabled={isAnalyzing || !data.profilePhoto}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: colors.cream,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              cursor: isAnalyzing || !data.profilePhoto ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing || !data.profilePhoto ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <CameraIcon size={14} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
          </button>
          <button
            type="button"
            onClick={handleScanCompCard}
            disabled={isAnalyzing}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: colors.cream,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <ScanIcon size={14} />
            {isAnalyzing ? 'Scanning...' : 'Scan Comp Card'}
          </button>
        </div>
        {!data.profilePhoto && (
          <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '0.5rem', fontStyle: 'italic' }}>
            Upload a profile photo to enable AI photo analysis
          </p>
        )}
      </div>

      {/* Measurements Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, marginBottom: '1rem' }}>
          Measurements
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Height</label>
            <input
              type="text"
              placeholder="5'9&quot;"
              value={data.stats.height}
              onChange={(e) => handleStatsChange('height', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Bust</label>
            <input
              type="text"
              placeholder='32"'
              value={data.stats.bust}
              onChange={(e) => handleStatsChange('bust', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Waist</label>
            <input
              type="text"
              placeholder='24"'
              value={data.stats.waist}
              onChange={(e) => handleStatsChange('waist', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hips</label>
            <input
              type="text"
              placeholder='34"'
              value={data.stats.hips}
              onChange={(e) => handleStatsChange('hips', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Shoe Size</label>
            <input
              type="text"
              placeholder="8"
              value={data.stats.shoes}
              onChange={(e) => handleStatsChange('shoes', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Dress Size</label>
            <input
              type="text"
              placeholder="4"
              value={data.stats.dress}
              onChange={(e) => handleStatsChange('dress', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hair Color</label>
            <input
              type="text"
              placeholder="Brunette"
              value={data.stats.hairColor}
              onChange={(e) => handleStatsChange('hairColor', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Eye Color</label>
            <input
              type="text"
              placeholder="Brown"
              value={data.stats.eyeColor}
              onChange={(e) => handleStatsChange('eyeColor', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>Bio</label>
          <button
            type="button"
            onClick={handleGenerateBio}
            disabled={isGeneratingBio}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: colors.camel,
              border: `1px solid ${colors.camel}`,
              borderRadius: '0.375rem',
              cursor: isGeneratingBio ? 'not-allowed' : 'pointer',
              opacity: isGeneratingBio ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <SparklesIcon size={12} />
            {isGeneratingBio ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <textarea
          placeholder="Tell clients about yourself, your experience, and what makes you unique..."
          value={data.bio}
          onChange={(e) => handleBioChange(e.target.value)}
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
            minHeight: '100px',
          }}
        />
        <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '0.5rem' }}>
          {data.bio.length}/500 characters
        </p>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
