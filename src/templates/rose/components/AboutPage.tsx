'use client';

import { useRef, useState } from 'react';
import type { PortfolioData } from '@/types/portfolio';
import { useEditMode } from '@/components/portfolio/PortfolioPreview';
import { RichTextEditor } from '@/components/editor';

interface AboutPageProps {
  data: PortfolioData;
}

export function AboutPage({ data }: AboutPageProps) {
  const editMode = useEditMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const accentColor = editMode?.accentColor || '#FF7AA2';
  const avatarUrl = editMode?.avatarUrl ?? data.profile.avatarUrl;
  const bio = editMode?.bio ?? data.profile.bio;

  // Handle avatar file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editMode) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      await editMode.onAvatarUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback avatar with initials
  const initials = data.profile.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Full-width Solid Pink Hero Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '450px',
          background: `${accentColor}20`,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Hero Section with Avatar */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '80px',
          paddingBottom: '80px',
          marginBottom: '48px',
          zIndex: 1,
        }}
      >
        {/* Avatar Container */}
        <div
          style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `5px solid ${accentColor}`,
            boxShadow: `0 12px 48px ${accentColor}40`,
            zIndex: 1,
            background: '#f0f0f0',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={data.profile.displayName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}AA 100%)`,
                color: '#fff',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '64px',
                fontWeight: 300,
              }}
            >
              {initials}
            </div>
          )}

          {/* Edit Mode - Upload Overlay */}
          {editMode?.isEditMode && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: 'none',
                  cursor: isUploading ? 'wait' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#fff',
                  fontFamily: "'Outfit', sans-serif",
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <CameraIcon />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>
                  {isUploading ? 'Uploading...' : 'Change Photo'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* About Section */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {/* Section Title */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '36px',
            fontWeight: 400,
            textAlign: 'center',
            marginBottom: '8px',
            color: '#1A1A1A',
          }}
        >
          About {data.profile.displayName}
        </h2>

        {/* Edit Mode Label */}
        {editMode?.isEditMode && (
          <p
            style={{
              textAlign: 'center',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: accentColor,
              marginBottom: '16px',
            }}
          >
            Click below to edit bio
          </p>
        )}

        {/* Bio Content - RTE or Static (All text is editable in RTE) */}
        {editMode?.isEditMode ? (
          <div style={{ marginBottom: '48px' }}>
            <RichTextEditor
              value={bio}
              onChange={editMode.onBioChange}
              placeholder="Tell your story... Share your journey, passions, and what makes you unique as a model. Include what you offer, your experience, and a call to action."
              minHeight="300px"
              accentColor={accentColor}
            />
          </div>
        ) : (
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '16px',
              lineHeight: 1.8,
              color: 'rgba(26, 26, 26, 0.8)',
              textAlign: 'center',
              marginBottom: '48px',
            }}
            dangerouslySetInnerHTML={{ 
              __html: bio || `
                <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 400; margin-bottom: 24px;">What I Offer</h3>
                <p>✓ <strong>Editorial:</strong> Striking and stylish concepts</p>
                <p>✓ <strong>Commercial:</strong> Professional and versatile looks</p>
                <p>✓ <strong>Runway:</strong> Graceful and captivating presence</p>
                <p>✓ <strong>Print:</strong> High-quality, impactful imagery</p>
                <p style="margin-top: 32px; color: rgba(26, 26, 26, 0.6);">
                  Interested in working with me? Visit the <strong>Services</strong> page to check out my rates and portfolio!
                </p>
              `
            }}
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Icons
// =============================================================================
function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
