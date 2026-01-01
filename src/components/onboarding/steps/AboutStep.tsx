'use client';

import React, { useState, useCallback } from 'react';
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

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload
    console.log('Upload photo');
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

      {/* Profile Photo */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: colors.cream,
            borderRadius: '0.75rem',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: colors.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {data.profilePhoto ? (
              <img src={data.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <CameraIcon size={24} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>Profile Photo</p>
            <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.25rem 0 0.75rem' }}>
              Upload a clear headshot for your portfolio
            </p>
            <button
              type="button"
              onClick={handlePhotoUpload}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: colors.white,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              Upload Photo
            </button>
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
    </>
  );
}

