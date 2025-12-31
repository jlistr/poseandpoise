'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TEMPLATES } from '@/config/template';
import type { TemplateId } from '@/types/template';
import { 
  EyeIcon, 
  ChevronDownIcon, 
  CheckIcon, 
  LockIcon,
  ArrowLeftIcon,
  ExternalLinkIcon 
} from '@/components/icons/Icons';

interface OwnerPreviewBannerProps {
  username: string;
  currentTemplate: string;
}

export function OwnerPreviewBanner({ 
  username, 
  currentTemplate 
}: OwnerPreviewBannerProps) {
  const [selected, setSelected] = useState<TemplateId>(currentTemplate as TemplateId);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentTemplateData = TEMPLATES.find(t => t.id === selected);

  const handleSelect = async (templateId: TemplateId) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template?.isAvailable) return;
    
    setSelected(templateId);
    setIsOpen(false);
    setSaving(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ selected_template: templateId })
        .eq('id', user.id);
    }

    setSaving(false);
    
    // Reload to show new template
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#1A1A1A',
        borderBottom: '1px solid rgba(196, 164, 132, 0.2)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left side - Back to dashboard + Preview indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: 'rgba(250, 249, 247, 0.7)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            <ArrowLeftIcon size={14} />
            <span>Dashboard</span>
          </Link>
          
          <div 
            style={{ 
              width: '1px', 
              height: '20px', 
              background: 'rgba(250, 249, 247, 0.15)' 
            }} 
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <EyeIcon size={14} color="rgba(250, 249, 247, 0.6)" />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                color: 'rgba(250, 249, 247, 0.6)',
                letterSpacing: '0.5px',
              }}
            >
              Preview Mode — Only you can see this
            </span>
          </div>
        </div>

        {/* Right side - Template dropdown and share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Template Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(250, 249, 247, 0.08)',
                border: '1px solid rgba(250, 249, 247, 0.15)',
                padding: '8px 14px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                color: '#FAF9F7',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ color: 'rgba(250, 249, 247, 0.5)', fontSize: '12px' }}>
                Template:
              </span>
              <span>{currentTemplateData?.name || 'Editorial'}</span>
              {saving ? (
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(250, 249, 247, 0.2)',
                    borderTopColor: '#C4A484',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              ) : (
                <ChevronDownIcon 
                  size={14} 
                  style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }} 
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '280px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(26, 26, 26, 0.1)',
                  boxShadow: '0 8px 32px rgba(26, 26, 26, 0.15)',
                  zIndex: 100,
                }}
              >
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template.id)}
                    disabled={!template.isAvailable}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px 16px',
                      background: selected === template.id 
                        ? 'rgba(196, 164, 132, 0.08)' 
                        : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(26, 26, 26, 0.06)',
                      cursor: template.isAvailable ? 'pointer' : 'not-allowed',
                      opacity: template.isAvailable ? 1 : 0.5,
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Check or Lock icon */}
                    <div style={{ marginTop: '2px' }}>
                      {selected === template.id ? (
                        <CheckIcon size={16} color="#C4A484" />
                      ) : !template.isAvailable ? (
                        <LockIcon size={16} color="rgba(26, 26, 26, 0.3)" />
                      ) : (
                        <div style={{ width: '16px' }} />
                      )}
                    </div>
                    
                    {/* Template info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px',
                      }}>
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: '16px',
                            color: '#1A1A1A',
                          }}
                        >
                          {template.name}
                        </span>
                        {!template.isAvailable && (
                          <span
                            style={{
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: '9px',
                              fontWeight: 500,
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              color: '#C4A484',
                              background: 'rgba(196, 164, 132, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '2px',
                            }}
                          >
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '12px',
                          color: 'rgba(26, 26, 26, 0.5)',
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share/View Live Link */}
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#C4A484',
              color: '#1A1A1A',
              padding: '8px 16px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Share</span>
            <ExternalLinkIcon size={12} />
          </a>
        </div>
      </div>

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}