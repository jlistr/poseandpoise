'use client';

import React, { useCallback, useState } from 'react';
import { colors, fonts, type ServicesData, type ExperienceLevel, type PricingTier } from '../types';

// ============================================================================
// Icons
// ============================================================================

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const PlaneIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

// ============================================================================
// Main Component
// ============================================================================

interface ServicesStepProps {
  data: ServicesData;
  onChange: (data: ServicesData) => void;
}

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'New to modeling, building portfolio' },
  { id: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
  { id: 'professional', label: 'Professional', description: '3+ years, established career' },
  { id: 'expert', label: 'Expert', description: 'Top-tier, international work' },
];

export function ServicesStep({ data, onChange }: ServicesStepProps): React.JSX.Element {
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleExperienceChange = useCallback(
    (level: ExperienceLevel) => {
      onChange({ ...data, experienceLevel: level });
    },
    [data, onChange]
  );

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      onChange({
        ...data,
        categories: data.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
        ),
      });
    },
    [data, onChange]
  );

  const handlePricingChange = useCallback(
    (field: keyof PricingTier, value: string) => {
      onChange({
        ...data,
        pricing: { ...data.pricing, [field]: value },
      });
    },
    [data, onChange]
  );

  const handleTravelToggle = useCallback(() => {
    onChange({ ...data, travelAvailable: !data.travelAvailable });
  }, [data, onChange]);

  const handleTfpToggle = useCallback(() => {
    onChange({ ...data, tfpAvailable: !data.tfpAvailable });
  }, [data, onChange]);

  const handleSuggestServices = () => {
    setIsSuggesting(true);
    setTimeout(() => {
      onChange({
        ...data,
        experienceLevel: 'intermediate',
        categories: data.categories.map((cat) => ({
          ...cat,
          selected: ['fashion', 'commercial', 'editorial'].includes(cat.id),
        })),
        pricing: { hourly: '150', halfDay: '500', fullDay: '900' },
        travelAvailable: true,
        travelRadius: '100',
      });
      setIsSuggesting(false);
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
        Your Services
      </h1>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '2rem' }}>
        Tell us what you offer. This helps clients find the right model for their projects.
      </p>

      {/* AI Suggest Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={handleSuggestServices}
          disabled={isSuggesting}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: colors.cream,
            color: colors.camel,
            border: `1px solid ${colors.camel}`,
            borderRadius: '0.5rem',
            cursor: isSuggesting ? 'not-allowed' : 'pointer',
            opacity: isSuggesting ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <SparklesIcon size={14} />
          {isSuggesting ? 'Analyzing your profile...' : 'Suggest services based on my profile'}
        </button>
      </div>

      {/* Experience Level */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, marginBottom: '1rem' }}>
          Experience Level
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => handleExperienceChange(level.id)}
              style={{
                padding: '1rem',
                textAlign: 'left',
                backgroundColor: data.experienceLevel === level.id ? colors.cream : colors.white,
                border: `1px solid ${data.experienceLevel === level.id ? colors.camel : colors.border}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>{level.label}</span>
                {data.experienceLevel === level.id && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: colors.camel,
                      color: colors.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon size={12} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.25rem 0 0' }}>{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Service Categories */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, marginBottom: '1rem' }}>
          Service Categories
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {data.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryToggle(category.id)}
              style={{
                padding: '1rem',
                textAlign: 'left',
                backgroundColor: category.selected ? colors.cream : colors.white,
                border: `1px solid ${category.selected ? colors.camel : colors.border}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>{category.name}</span>
                {category.selected && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: colors.camel,
                      color: colors.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon size={12} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.25rem 0 0' }}>{category.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, marginBottom: '1rem' }}>
          Rates <span style={{ fontWeight: 400, color: colors.textMuted }}>(optional)</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '0.375rem', display: 'block' }}>
              Hourly
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                }}
              >
                $
              </span>
              <input
                type="text"
                placeholder="150"
                value={data.pricing.hourly}
                onChange={(e) => handlePricingChange('hourly', e.target.value.replace(/[^0-9]/g, ''))}
                style={{ ...inputStyle, paddingLeft: '1.5rem' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '0.375rem', display: 'block' }}>
              Half Day (4hr)
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                }}
              >
                $
              </span>
              <input
                type="text"
                placeholder="500"
                value={data.pricing.halfDay}
                onChange={(e) => handlePricingChange('halfDay', e.target.value.replace(/[^0-9]/g, ''))}
                style={{ ...inputStyle, paddingLeft: '1.5rem' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '0.375rem', display: 'block' }}>
              Full Day (8hr)
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                }}
              >
                $
              </span>
              <input
                type="text"
                placeholder="900"
                value={data.pricing.fullDay}
                onChange={(e) => handlePricingChange('fullDay', e.target.value.replace(/[^0-9]/g, ''))}
                style={{ ...inputStyle, paddingLeft: '1.5rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Travel & TFP */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Travel Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: colors.cream,
            borderRadius: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PlaneIcon size={18} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>Available for Travel</p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.125rem 0 0' }}>
                Willing to travel for bookings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTravelToggle}
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              backgroundColor: data.travelAvailable ? colors.camel : colors.border,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: colors.white,
                position: 'absolute',
                top: '2px',
                left: data.travelAvailable ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>

        {/* TFP Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: colors.cream,
            borderRadius: '0.5rem',
          }}
        >
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>Open to TFP/Collab</p>
            <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.125rem 0 0' }}>
              Trade for prints / collaboration shoots
            </p>
          </div>
          <button
            type="button"
            onClick={handleTfpToggle}
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              backgroundColor: data.tfpAvailable ? colors.camel : colors.border,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: colors.white,
                position: 'absolute',
                top: '2px',
                left: data.tfpAvailable ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      </div>
    </>
  );
}

