'use client';

import React from 'react';
import { colors, fonts, type Template, TEMPLATES } from '../types';

// ============================================================================
// Icons
// ============================================================================

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ============================================================================
// Template Preview Component
// ============================================================================

interface TemplatePreviewProps {
  template: Template;
  isSelected: boolean;
  modelName: string;
  onClick: () => void;
}

function TemplatePreview({ template, isSelected, modelName, onClick }: TemplatePreviewProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 0,
        border: isSelected ? `2px solid ${colors.camel}` : `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        position: 'relative',
      }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: colors.camel,
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <CheckIcon size={14} />
        </div>
      )}

      {/* Pro badge */}
      {template.isPro && (
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: colors.white,
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            zIndex: 10,
          }}
        >
          <LockIcon size={10} />
          PRO
        </div>
      )}

      {/* Preview */}
      <div
        style={{
          backgroundColor: template.bgColor,
          padding: '1.5rem',
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Mock content */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: template.accentColor,
            marginBottom: '0.75rem',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: '18px',
            color: template.textColor,
            marginBottom: '0.25rem',
          }}
        >
          {modelName || 'Your Name'}
        </div>
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: template.textColor,
            opacity: 0.6,
          }}
        >
          MODEL • ARTIST
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: colors.white,
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>{template.name}</div>
        <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '0.25rem' }}>{template.description}</div>
      </div>
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface TemplateStepProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  modelName?: string;
}

export function TemplateStep({ selectedTemplate, onSelectTemplate, modelName = '' }: TemplateStepProps): React.JSX.Element {
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
        Choose Your Template
      </h1>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '2rem' }}>
        Select a design that reflects your style. You can change this anytime.
      </p>

      {/* Template Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
        }}
      >
        {TEMPLATES.map((template) => (
          <TemplatePreview
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            modelName={modelName}
            onClick={() => onSelectTemplate(template.id)}
          />
        ))}
      </div>

      {/* Tip */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: colors.cream,
          borderRadius: '0.5rem',
          fontSize: '13px',
          color: colors.textSecondary,
        }}
      >
        <strong style={{ color: colors.textPrimary }}>Tip:</strong> Choose a template that matches your brand. Dark themes work great for dramatic portfolios, while light themes suit commercial work.
      </div>
    </>
  );
}

