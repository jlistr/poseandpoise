'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { colors, fonts, type ProfileData, type LocationStatus } from '../types';

// ============================================================================
// Icons
// ============================================================================

const MapPinIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const GlobeIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const BuildingIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

// ============================================================================
// Sub-components
// ============================================================================

interface LocationDetectionProps {
  status: LocationStatus;
  location: string;
}

function LocationDetection({ status, location }: LocationDetectionProps): React.JSX.Element {
  return (
    <div
      style={{
        marginBottom: '2rem',
        padding: '1rem',
        borderRadius: '0.75rem',
        backgroundColor: colors.cream,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: status === 'found' ? colors.successLight : '#FFF8E7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {status === 'found' ? (
            <CheckIcon size={18} />
          ) : (
            <MapPinIcon size={18} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          {status === 'detecting' && (
            <>
              <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>
                Detecting your location...
              </p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.25rem 0 0' }}>
                This helps us suggest relevant opportunities
              </p>
            </>
          )}
          {status === 'found' && (
            <>
              <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>
                Found you in {location}
              </p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.25rem 0 0' }}>
                This helps us suggest appropriate services and connect you with local markets
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>
                Couldn't detect your location
              </p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.25rem 0 0' }}>
                You can enter it manually in your profile settings
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SocialButtonsProps {
  onConnectInstagram: () => void;
  onConnectTikTok: () => void;
}

function SocialButtons({ onConnectInstagram, onConnectTikTok }: SocialButtonsProps): React.JSX.Element {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
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
        CONNECT YOUR SOCIALS
      </h3>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={onConnectInstagram}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: colors.instagram,
            color: colors.white,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <InstagramIcon size={16} />
          Connect Instagram
        </button>
        <button
          type="button"
          onClick={onConnectTikTok}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: colors.charcoal,
            color: colors.white,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <TikTokIcon size={16} />
          Connect TikTok
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
        <span style={{ fontSize: '11px', color: colors.textMuted, letterSpacing: '0.05em' }}>OR ENTER MANUALLY</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface ProfileStepProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  initialLocation?: string | null;
  validationErrors?: Record<string, string>;
}

export function ProfileStep({ data, onChange, initialLocation, validationErrors = {} }: ProfileStepProps): React.JSX.Element {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(
    initialLocation || data.location ? 'found' : 'idle'
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof ProfileData, value: string) => {
      onChange({ ...data, [field]: value });
    },
    [data, onChange]
  );

  // Location detection
  useEffect(() => {
    // Skip if location already provided
    if (initialLocation || data.location) {
      setLocationStatus('found');
      return;
    }

    const detectLocation = async () => {
      setLocationStatus('detecting');

      try {
        const response = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
        if (response.ok) {
          const result = await response.json();
          const city = result.city || result.locality || '';
          const state = result.principalSubdivisionCode || '';
          const country = result.countryCode || '';

          const parts = [city];
          if (state) parts.push(state.replace(/^[A-Z]{2}-/, ''));
          if (country) parts.push(country);

          const locationString = parts.filter(Boolean).join(', ');
          if (locationString) {
            onChange({ ...data, location: locationString });
            setLocationStatus('found');
            return;
          }
        }
        setLocationStatus('error');
      } catch {
        setLocationStatus('error');
      }
    };

    detectLocation();
  }, [initialLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Social connection handlers (placeholder)
  const handleConnectInstagram = () => {
    // TODO: Implement OAuth flow
    console.log('Connect Instagram');
  };

  const handleConnectTikTok = () => {
    // TODO: Implement OAuth flow
    console.log('Connect TikTok');
  };

  // Input style helper
  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '14px',
    border: `1px solid ${hasError ? colors.error : colors.border}`,
    borderRadius: '0.5rem',
    outline: 'none',
    backgroundColor: hasError ? colors.errorLight : colors.white,
    transition: 'border-color 0.2s',
  });

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
        Your Profile
      </h1>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '2rem' }}>
        Let's establish your professional identity. We'll auto-detect what we can.
      </p>

      {/* Display Name & Username */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            Display Name <span style={{ color: colors.instagram }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Your professional name"
            value={data.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            style={inputStyle(!!validationErrors.displayName)}
          />
          {validationErrors.displayName && (
            <p style={{ fontSize: '12px', color: colors.error, marginTop: '0.25rem' }}>
              {validationErrors.displayName}
            </p>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            Username <span style={{ color: colors.instagram }}>*</span>
          </label>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              placeholder="yourname"
              value={data.username}
              onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              style={{
                ...inputStyle(!!validationErrors.username),
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: 'none',
              }}
            />
            <span
              style={{
                padding: '0.625rem 0.75rem',
                fontSize: '14px',
                backgroundColor: colors.cream,
                color: colors.textMuted,
                borderTopRightRadius: '0.5rem',
                borderBottomRightRadius: '0.5rem',
                border: `1px solid ${validationErrors.username ? colors.error : colors.border}`,
                borderLeft: 'none',
              }}
            >
              .poseandpoise.studio
            </span>
          </div>
          {validationErrors.username ? (
            <p style={{ fontSize: '12px', color: colors.error, marginTop: '0.25rem' }}>
              {validationErrors.username}
            </p>
          ) : (
            <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '0.25rem' }}>
              Your portfolio will be at {data.username || 'yourname'}.poseandpoise.studio
            </p>
          )}
        </div>
      </div>

      {/* Location Detection */}
      <LocationDetection status={locationStatus} location={data.location} />

      {/* Social Connections */}
      <SocialButtons onConnectInstagram={handleConnectInstagram} onConnectTikTok={handleConnectTikTok} />

      {/* Manual Input Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Instagram */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            <InstagramIcon size={14} />
            Instagram
          </label>
          <div style={{ display: 'flex' }}>
            <span
              style={{
                padding: '0.625rem 0.75rem',
                fontSize: '14px',
                backgroundColor: colors.cream,
                color: colors.textMuted,
                borderTopLeftRadius: '0.5rem',
                borderBottomLeftRadius: '0.5rem',
                border: `1px solid ${colors.border}`,
                borderRight: 'none',
              }}
            >
              @
            </span>
            <input
              type="text"
              placeholder="yourhandle"
              value={data.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              style={{
                ...inputStyle(false),
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            />
          </div>
        </div>

        {/* TikTok */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            <TikTokIcon size={14} />
            TikTok
          </label>
          <div style={{ display: 'flex' }}>
            <span
              style={{
                padding: '0.625rem 0.75rem',
                fontSize: '14px',
                backgroundColor: colors.cream,
                color: colors.textMuted,
                borderTopLeftRadius: '0.5rem',
                borderBottomLeftRadius: '0.5rem',
                border: `1px solid ${colors.border}`,
                borderRight: 'none',
              }}
            >
              @
            </span>
            <input
              type="text"
              placeholder="yourhandle"
              value={data.tiktok}
              onChange={(e) => handleInputChange('tiktok', e.target.value)}
              style={{
                ...inputStyle(false),
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            <GlobeIcon size={14} />
            Website
          </label>
          <input
            type="text"
            placeholder="https://yourwebsite.com"
            value={data.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            style={inputStyle(false)}
          />
        </div>

        {/* Agency */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            <BuildingIcon size={14} />
            Agency <span style={{ color: colors.textMuted }}>(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Your representation"
            value={data.agency}
            onChange={(e) => handleInputChange('agency', e.target.value)}
            style={inputStyle(false)}
          />
        </div>
      </div>
    </>
  );
}

