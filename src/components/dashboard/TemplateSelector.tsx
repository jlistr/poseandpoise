'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TEMPLATES } from '@/config/template';
import type { TemplateId } from '@/types';

interface TemplateSelectorProps {
  currentTemplate: TemplateId;
  username: string | null;
  onTemplateChange?: (templateId: TemplateId) => void;
}

export function TemplateSelector({ 
  currentTemplate, 
  username,
  onTemplateChange 
}: TemplateSelectorProps) {
  const [selected, setSelected] = useState<TemplateId>(currentTemplate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSelect = async (templateId: TemplateId) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template?.isAvailable) return;
    
    setSelected(templateId);
    setSaving(true);
    
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ selected_template: templateId })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    setSaving(false);
    
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onTemplateChange?.(templateId);
    }
  };

  const handleLaunch = () => {
    if (username) {
      window.open(`/${username}`, '_blank');
    }
  };

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      {/* Section Header */}
      <div style={{ marginBottom: '32px' }}>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#C4A484',
        }}>
          Portfolio Theme
        </span>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 300,
          marginTop: '8px',
          color: '#1A1A1A',
        }}>
          Choose Your Template
        </h2>
        <div style={{ 
          width: '40px', 
          height: '1px', 
          background: '#C4A484', 
          marginTop: '16px' 
        }} />
      </div>

      {/* Template Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selected === template.id}
            onSelect={() => handleSelect(template.id)}
          />
        ))}
      </div>

      {/* Status & Launch Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleLaunch}
          disabled={!username}
          style={{
            background: username ? '#1A1A1A' : 'rgba(26, 26, 26, 0.3)',
            color: '#FAF9F7',
            border: 'none',
            padding: '16px 32px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            cursor: username ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          onMouseEnter={(e) => {
            if (username) {
              e.currentTarget.style.background = '#C4A484';
            }
          }}
          onMouseLeave={(e) => {
            if (username) {
              e.currentTarget.style.background = '#1A1A1A';
            }
          }}
        >
          <span>Launch Portfolio</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </button>

        {/* Status Messages */}
        {saving && (
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            color: 'rgba(26, 26, 26, 0.6)',
          }}>
            Saving...
          </span>
        )}
        {saved && (
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            color: '#C4A484',
          }}>
            ✓ Template saved
          </span>
        )}
        {!username && (
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            color: 'rgba(26, 26, 26, 0.5)',
          }}>
            Set a username to launch your portfolio
          </span>
        )}
      </div>
    </div>
  );
}

/* Template Card Component */
function TemplateCard({ 
  template, 
  isSelected, 
  onSelect 
}: { 
  template: typeof TEMPLATES[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isDisabled = !template.isAvailable;

  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      style={{
        position: 'relative',
        background: isSelected ? 'rgba(196, 164, 132, 0.08)' : '#FFFFFF',
        border: isSelected 
          ? '2px solid #C4A484' 
          : '1px solid rgba(26, 26, 26, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Thumbnail Preview Area */}
      <div style={{
        aspectRatio: '16/10',
        background: isDisabled 
          ? 'linear-gradient(135deg, #E8E6E3 0%, #D8D6D3 100%)'
          : 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Template Preview Illustration */}
        <TemplatePreviewIcon templateId={template.id} isDisabled={isDisabled} />
        
        {/* Coming Soon Badge */}
        {isDisabled && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '6px 12px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#1A1A1A',
          }}>
            Coming Soon
          </div>
        )}

        {/* Selected Checkmark */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '24px',
            height: '24px',
            background: '#C4A484',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FAF9F7" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '20px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 400,
          marginBottom: '8px',
          color: '#1A1A1A',
        }}>
          {template.name}
        </h3>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '13px',
          fontWeight: 300,
          lineHeight: 1.6,
          color: 'rgba(26, 26, 26, 0.6)',
          margin: 0,
        }}>
          {template.description}
        </p>
      </div>
    </div>
  );
}

/* Template Preview Icons */
function TemplatePreviewIcon({ 
  templateId, 
  isDisabled 
}: { 
  templateId: string;
  isDisabled: boolean;
}) {
  const color = isDisabled ? '#A8A6A3' : '#FAF9F7';
  const accentColor = isDisabled ? '#C4C2BF' : '#C4A484';

  switch (templateId) {
    case 'editorial':
      return (
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          {/* Asymmetric editorial layout */}
          <rect x="8" y="8" width="45" height="64" fill={color} opacity="0.2" />
          <rect x="58" y="8" width="28" height="30" fill={accentColor} opacity="0.6" />
          <rect x="58" y="42" width="54" height="30" fill={color} opacity="0.15" />
          <rect x="90" y="8" width="22" height="30" fill={color} opacity="0.2" />
        </svg>
      );
    case 'minimal':
      return (
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          {/* Single centered image */}
          <rect x="25" y="10" width="70" height="50" fill={color} opacity="0.2" />
          <line x1="25" y1="68" x2="95" y2="68" stroke={accentColor} strokeWidth="2" opacity="0.6" />
        </svg>
      );
    case 'classic':
      return (
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          {/* 2x2 grid layout */}
          <rect x="8" y="8" width="50" height="30" fill={color} opacity="0.2" />
          <rect x="62" y="8" width="50" height="30" fill={color} opacity="0.2" />
          <rect x="8" y="42" width="50" height="30" fill={color} opacity="0.2" />
          <rect x="62" y="42" width="50" height="30" fill={accentColor} opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
}