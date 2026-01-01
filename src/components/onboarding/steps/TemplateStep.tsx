'use client';

import React from 'react';
import { colors, fonts, type Template, TEMPLATES } from '../types';

// ============================================================================
// Icons
// ============================================================================

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const StarIcon: React.FC<{ size?: number }> = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ============================================================================
// High-Fidelity Template Previews
// ============================================================================

interface TemplatePreviewProps {
  template: Template;
  isSelected: boolean;
  modelName: string;
  onClick: () => void;
}

// Rosé Template - Split hero with masonry gallery
function RosePreview({ template, modelName }: { template: Template; modelName: string }): React.JSX.Element {
  return (
    <div style={{ backgroundColor: template.bgColor, height: '100%', overflow: 'hidden' }}>
      {/* Minimal nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
        <div style={{ width: '40px', height: '3px', backgroundColor: template.accentColor, borderRadius: '2px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: '16px', height: '2px', backgroundColor: template.textColor, opacity: 0.3, borderRadius: '1px' }} />
          ))}
        </div>
      </div>

      {/* Split hero */}
      <div style={{ display: 'flex', height: '55%', gap: '2px', padding: '0 12px' }}>
        {/* Left - Large image */}
        <div style={{ flex: '1.2', backgroundColor: template.accentColor, opacity: 0.4, borderRadius: '2px' }} />
        {/* Right - Text */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px' }}>
          <div style={{ width: '60%', height: '3px', backgroundColor: template.textColor, opacity: 0.15, marginBottom: '6px', borderRadius: '1px' }} />
          <div style={{ fontFamily: fonts.heading, fontSize: '11px', color: template.textColor, marginBottom: '2px' }}>
            {modelName || 'Your Name'}
          </div>
          <div style={{ fontSize: '6px', letterSpacing: '0.1em', color: template.textColor, opacity: 0.5 }}>MODEL</div>
          <div style={{ marginTop: '8px', width: '40px', height: '12px', backgroundColor: template.accentColor, borderRadius: '6px' }} />
        </div>
      </div>

      {/* Masonry gallery */}
      <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '3px', height: '35%' }}>
        <div style={{ backgroundColor: template.accentColor, opacity: 0.3, borderRadius: '2px', gridRow: 'span 2' }} />
        <div style={{ backgroundColor: template.accentColor, opacity: 0.25, borderRadius: '2px' }} />
        <div style={{ backgroundColor: template.accentColor, opacity: 0.35, borderRadius: '2px' }} />
        <div style={{ backgroundColor: template.accentColor, opacity: 0.2, borderRadius: '2px', gridColumn: 'span 2' }} />
      </div>
    </div>
  );
}

// Poise Template - Centered hero with 3-column grid
function PoisePreview({ template, modelName }: { template: Template; modelName: string }): React.JSX.Element {
  return (
    <div style={{ backgroundColor: template.bgColor, height: '100%', overflow: 'hidden' }}>
      {/* Classic nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${template.textColor}10` }}>
        <div style={{ fontFamily: fonts.heading, fontSize: '8px', letterSpacing: '0.15em', color: template.textColor, opacity: 0.7 }}>P&P</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['PORT', 'ABOUT', 'CONTACT'].map(item => (
            <div key={item} style={{ fontSize: '5px', letterSpacing: '0.05em', color: template.textColor, opacity: 0.5 }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Centered hero */}
      <div style={{ height: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: template.accentColor, opacity: 0.6, marginBottom: '8px' }} />
        <div style={{ fontFamily: fonts.heading, fontSize: '13px', color: template.textColor, marginBottom: '2px' }}>
          {modelName || 'Your Name'}
        </div>
        <div style={{ fontSize: '6px', letterSpacing: '0.15em', color: template.accentColor }}>MODEL • ARTIST</div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: template.accentColor, opacity: 0.5 }} />
          ))}
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{ padding: '0 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', height: '38%' }}>
        {[0.4, 0.5, 0.35, 0.45, 0.3, 0.55].map((opacity, i) => (
          <div key={i} style={{ backgroundColor: template.accentColor, opacity, borderRadius: '2px' }} />
        ))}
      </div>
    </div>
  );
}

// Lumière Template - Cinematic filmstrip
function LumierePreview({ template, modelName }: { template: Template; modelName: string }): React.JSX.Element {
  const warmCream = '#FFF8F0';
  const terracotta = '#C8553D';

  return (
    <div style={{ backgroundColor: template.bgColor, height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Floating nav */}
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px', zIndex: 5 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: warmCream, opacity: 0.6 }} />
        ))}
      </div>

      {/* Hero with overlay text */}
      <div style={{ height: '45%', position: 'relative', background: `linear-gradient(180deg, ${template.bgColor} 0%, rgba(44, 36, 32, 0.8) 100%)` }}>
        <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
          <div style={{ fontFamily: fonts.heading, fontSize: '14px', fontStyle: 'italic', color: warmCream, marginBottom: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {modelName || 'Your Name'}
          </div>
          <div style={{ width: '30px', height: '2px', backgroundColor: terracotta, borderRadius: '1px' }} />
        </div>
      </div>

      {/* Filmstrip gallery */}
      <div style={{ backgroundColor: '#1A1512', padding: '8px 0', height: '35%', position: 'relative' }}>
        {/* Sprocket holes */}
        <div style={{ position: 'absolute', top: '3px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ width: '4px', height: '3px', backgroundColor: '#0a0a0a', borderRadius: '1px' }} />
          ))}
        </div>
        {/* Film frames */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', height: '100%', alignItems: 'center', padding: '6px 12px' }}>
          {[0.9, 1, 0.85].map((scale, i) => (
            <div key={i} style={{ width: '32px', backgroundColor: warmCream, padding: '3px', borderRadius: '2px', transform: `scale(${scale})`, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <div style={{ aspectRatio: '3/4', background: `linear-gradient(135deg, ${terracotta}30 0%, rgba(26, 26, 26, 0.1) 100%)`, borderRadius: '1px' }} />
            </div>
          ))}
        </div>
        {/* Sprocket holes bottom */}
        <div style={{ position: 'absolute', bottom: '3px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ width: '4px', height: '3px', backgroundColor: '#0a0a0a', borderRadius: '1px' }} />
          ))}
        </div>
      </div>

      {/* Footer accent */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '24px', height: '3px', backgroundColor: terracotta, borderRadius: '1.5px' }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: terracotta, boxShadow: `0 0 6px ${terracotta}60` }} />
      </div>
    </div>
  );
}

// Noir Template - Bold 2-column with dramatic images
function NoirPreview({ template, modelName }: { template: Template; modelName: string }): React.JSX.Element {
  return (
    <div style={{ backgroundColor: template.bgColor, height: '100%', overflow: 'hidden' }}>
      {/* Hidden nav - just a subtle line */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)', margin: '8px 12px' }} />

      {/* Grid-first layout - 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', padding: '0 12px', height: '55%' }}>
        <div style={{ backgroundColor: template.accentColor, opacity: 0.15, position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '6px', left: '6px', right: '6px' }}>
            <div style={{ fontFamily: fonts.heading, fontSize: '10px', color: template.textColor, marginBottom: '2px' }}>
              {modelName || 'Your Name'}
            </div>
            <div style={{ fontSize: '5px', letterSpacing: '0.2em', color: template.textColor, opacity: 0.5 }}>MODEL</div>
          </div>
        </div>
        <div style={{ backgroundColor: template.accentColor, opacity: 0.1 }} />
        <div style={{ backgroundColor: template.accentColor, opacity: 0.08 }} />
        <div style={{ backgroundColor: template.accentColor, opacity: 0.12 }} />
      </div>

      {/* Stats bar */}
      <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '8px 12px' }}>
        {['5\'10"', '32-24-34', 'NYC'].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '8px', fontWeight: 600, color: template.textColor }}>{stat}</div>
            <div style={{ fontSize: '4px', color: template.textColor, opacity: 0.4, marginTop: '2px' }}>
              {['HEIGHT', 'MEASUREMENTS', 'BASED'][i]}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom 2-column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', padding: '0 12px', height: '20%' }}>
        <div style={{ backgroundColor: template.accentColor, opacity: 0.06 }} />
        <div style={{ backgroundColor: template.accentColor, opacity: 0.09 }} />
      </div>
    </div>
  );
}

// Main preview component that routes to the correct template
function TemplatePreview({ template, isSelected, modelName, onClick }: TemplatePreviewProps): React.JSX.Element {
  const renderPreview = () => {
    switch (template.id) {
      case 'rose':
        return <RosePreview template={template} modelName={modelName} />;
      case 'poise':
        return <PoisePreview template={template} modelName={modelName} />;
      case 'lumiere':
        return <LumierePreview template={template} modelName={modelName} />;
      case 'noir':
        return <NoirPreview template={template} modelName={modelName} />;
      default:
        return <PoisePreview template={template} modelName={modelName} />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 0,
        border: isSelected ? `3px solid ${colors.camel}` : `1px solid ${colors.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected 
          ? `0 8px 24px rgba(196, 164, 132, 0.25), 0 0 0 1px ${colors.camel}` 
          : '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: colors.camel,
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(196, 164, 132, 0.4)',
          }}
        >
          <CheckIcon size={16} />
        </div>
      )}

      {/* Pro badge */}
      {template.isPro && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '4px 8px',
            background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
            color: colors.white,
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <StarIcon size={8} />
          PRO
        </div>
      )}

      {/* High-fidelity preview */}
      <div style={{ height: '220px', width: '100%' }}>
        {renderPreview()}
      </div>

      {/* Info section */}
      <div
        style={{
          padding: '14px 16px',
          backgroundColor: colors.white,
          textAlign: 'left',
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ fontFamily: fonts.heading, fontSize: '16px', fontWeight: 500, color: colors.textPrimary }}>
            {template.name}
          </div>
          {/* Layout indicator */}
          <div style={{ 
            fontSize: '9px', 
            letterSpacing: '0.05em', 
            color: colors.textMuted,
            backgroundColor: colors.cream,
            padding: '2px 6px',
            borderRadius: '3px',
          }}>
            {template.galleryStyle === 'masonry' ? 'MASONRY' : 
             template.galleryStyle === 'grid-3' ? '3-COL' :
             template.galleryStyle === 'grid-2' ? '2-COL' : 
             'FILM'}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.4 }}>
          {template.description}
        </div>
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
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '0.5rem' }}>
        Each template offers a unique layout and gallery style. Pick one that showcases your work best.
      </p>
      <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '2rem' }}>
        You can change this anytime from your dashboard.
      </p>

      {/* Template Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.25rem',
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

      {/* Layout legend */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem 1.25rem',
          backgroundColor: colors.cream,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: colors.textSecondary, marginBottom: '0.75rem' }}>
          LAYOUT STYLES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Split Hero', desc: 'Image left, text right' },
            { label: 'Centered Hero', desc: 'Focused intro section' },
            { label: 'Filmstrip', desc: 'Cinematic photo scroll' },
            { label: 'Grid-First', desc: 'Photos take center stage' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.camel, marginTop: '6px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: colors.textPrimary }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
