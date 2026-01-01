'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TEMPLATE_METADATA } from '@/templates';
import { getPortfolioUrl } from '@/lib/utils/portfolioUrl';
import { saveTemplate } from '@/app/actions/portfolio';

interface UserProfile {
  username: string;
  display_name: string;
  template: string;
  is_published: boolean;
  subscription_tier: 'FREE' | 'PROFESSIONAL' | 'DELUXE' | null;
}

export default function TemplateSettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('elysian');
  const [originalTemplate, setOriginalTemplate] = useState('elysian');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, display_name, template, is_published, subscription_tier')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
          setSelectedTemplate(data.template || 'elysian');
          setOriginalTemplate(data.template || 'elysian');
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const hasChanges = selectedTemplate !== originalTemplate;

  const handleSave = async () => {
    setSaveStatus('saving');
    const result = await saveTemplate(selectedTemplate);
    
    if (result.success) {
      setOriginalTemplate(selectedTemplate);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSaveAndPreview = async () => {
    // Save first if there are changes
    if (hasChanges) {
      await handleSave();
    }
    
    // Open the portfolio preview
    if (profile?.username) {
      window.open(getPortfolioUrl(profile.username), '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF9F7',
      }}>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          color: 'rgba(26, 26, 26, 0.5)',
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Check subscription tier - FREE users can use non-premium templates
  const tier = profile?.subscription_tier || 'FREE';
  const isPaidUser = tier === 'PROFESSIONAL' || tier === 'DELUXE';
  
  // Function to check if a template is accessible
  const canSelectTemplate = (templateId: string) => {
    const template = TEMPLATE_METADATA.find(t => t.id === templateId);
    if (!template) return false;
    return isPaidUser || !template.isPremium;
  };

  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '42px',
          fontWeight: 400,
          color: '#1A1A1A',
          marginBottom: '12px',
        }}>
          Choose Your Template
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: 'rgba(26, 26, 26, 0.6)',
          marginBottom: '24px',
        }}>
          Select a design that reflects your unique style. Preview it live at{' '}
          <a 
            href={profile?.username ? getPortfolioUrl(profile.username) : '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#C4A484',
              textDecoration: 'none',
              fontFamily: "'SF Mono', monospace",
              fontSize: '14px',
              background: 'rgba(196, 164, 132, 0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(196, 164, 132, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(196, 164, 132, 0.1)';
            }}
          >
            {profile?.username || 'username'}.poseandpoise.studio
          </a>
        </p>

        {/* Premium Templates Upgrade Banner - only shown to free users */}
        {!isPaidUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(196, 164, 132, 0.1) 0%, rgba(196, 164, 132, 0.05) 100%)',
            border: '1px solid rgba(196, 164, 132, 0.2)',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(196, 164, 132, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}>
                ✨
              </div>
              <div>
                <p style={{
                  fontWeight: 500,
                  color: '#1A1A1A',
                  marginBottom: '2px',
                }}>
                  Unlock Premium Templates
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(26, 26, 26, 0.6)',
                }}>
                  Upgrade to Professional or Deluxe to access exclusive premium designs
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #C4A484 0%, #A08060 100%)',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 500,
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Template Grid & Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start',
        }}>
          {/* Template Cards */}
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '32px',
            }}>
              {TEMPLATE_METADATA.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={() => canSelectTemplate(template.id) && setSelectedTemplate(template.id)}
                  disabled={!canSelectTemplate(template.id)}
                  isPremiumLocked={template.isPremium && !isPaidUser}
                />
              ))}
            </div>

            {/* Save Button */}
            <div style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(26, 26, 26, 0.08)',
            }}>
              <button
                onClick={handleSave}
                disabled={!hasChanges && saveStatus !== 'saved'}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: saveStatus === 'saved' ? 'rgba(34, 197, 94, 0.1)' : hasChanges ? '#1A1A1A' : '#f5f5f5',
                  border: 'none',
                  borderRadius: '0',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: saveStatus === 'saved' ? '#22C55E' : hasChanges ? '#fff' : 'rgba(26, 26, 26, 0.4)',
                  cursor: hasChanges ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
              >
                {saveStatus === 'saving' ? (
                  <span>Saving...</span>
                ) : saveStatus === 'saved' ? (
                  <>
                    <CheckIcon />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>{hasChanges ? 'Save Template' : 'Saved'}</span>
                )}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            {/* Preview Frame */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(26, 26, 26, 0.08)',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(26, 26, 26, 0.06)',
            }}>
              {/* Mini Browser Chrome */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(26, 26, 26, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }} />
                </div>
              </div>

              {/* Preview Content */}
              <div style={{ padding: '24px' }}>
                <TemplatePreview 
                  templateId={selectedTemplate}
                  displayName={profile?.display_name || 'Your Name'}
                  username={profile?.username || 'username'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Template Card Component
// =============================================================================
interface TemplateCardProps {
  template: typeof TEMPLATE_METADATA[0];
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  isPremiumLocked?: boolean;
}

function TemplateCard({ template, isSelected, onSelect, disabled, isPremiumLocked }: TemplateCardProps) {
  const isDark = template.id === 'obsidian';

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      style={{
        position: 'relative',
        padding: '0',
        background: '#fff',
        border: isSelected ? `2px solid ${template.accentColor}` : '1px solid rgba(26, 26, 26, 0.1)',
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? `0 4px 20px ${template.accentColor}25` : '0 2px 8px rgba(26, 26, 26, 0.04)',
        opacity: isPremiumLocked ? 0.6 : 1,
      }}
    >
      {/* Selected Checkmark */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: template.accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}>
          <CheckIcon color="#fff" size={14} />
        </div>
      )}

      {/* Pro Badge with Lock for free users */}
      {template.isPremium && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          background: isPremiumLocked ? 'rgba(26, 26, 26, 0.9)' : 'rgba(26, 26, 26, 0.8)',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: '#fff',
          zIndex: 10,
        }}>
          {isPremiumLocked ? (
            <>
              <span style={{ fontSize: '10px' }}>🔒</span>
              PRO
            </>
          ) : (
            <>
              <span style={{ fontSize: '8px' }}>✦</span>
              PRO
            </>
          )}
        </div>
      )}

      {/* Template Thumbnail */}
      <div style={{
        padding: '20px',
        paddingBottom: '16px',
        background: isDark ? '#1A1A1A' : '#f8f8f8',
      }}>
        <TemplateThumbnail templateId={template.id} accentColor={template.accentColor} />
      </div>

      {/* Template Info */}
      <div style={{ padding: '16px 20px 20px' }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '20px',
          fontWeight: 500,
          color: '#1A1A1A',
          marginBottom: '6px',
        }}>
          {template.name}
        </h3>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '13px',
          color: 'rgba(26, 26, 26, 0.5)',
          lineHeight: 1.4,
        }}>
          {template.description}
        </p>
      </div>
    </button>
  );
}

// =============================================================================
// Template Thumbnail (Mini Preview)
// =============================================================================
function TemplateThumbnail({ templateId, accentColor }: { templateId: string; accentColor: string }) {
  const isDark = templateId === 'obsidian';
  const isSolstice = templateId === 'solstice';
  
  // Lumière has a unique filmstrip design
  if (isSolstice) {
    const warmCream = '#FFF8F0';
    const portfolioDark = '#1F1816';
    const terracotta = '#C8553D';
    
    return (
      <div style={{
        aspectRatio: '4/3',
        background: warmCream,
        borderRadius: '6px',
        border: '1px solid rgba(200, 85, 61, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Hero Section with gradient */}
        <div style={{
          flex: '0 0 45%',
          background: `linear-gradient(180deg, ${portfolioDark} 0%, ${portfolioDark}F0 70%, ${warmCream} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '14px',
            fontWeight: 200,
            color: warmCream,
            letterSpacing: '0.1em',
            textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`,
          }}>
            Lumière
          </div>
        </div>
        
        {/* Filmstrip Gallery */}
        <div style={{
          flex: 1,
          background: portfolioDark,
          padding: '6px 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          {/* Sprocket holes top */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: 0,
            right: 0,
            height: '4px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`top-${i}`} style={{
                width: '4px',
                height: '3px',
                borderRadius: '1px',
                background: '#0a0a0a',
              }} />
            ))}
          </div>
          
          {/* Film frames */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              width: '32px',
              background: warmCream,
              padding: '3px',
              borderRadius: '2px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            }}>
              <div style={{
                aspectRatio: '3/4',
                background: `linear-gradient(135deg, ${terracotta}20 0%, rgba(26, 26, 26, 0.08) 100%)`,
                borderRadius: '1px',
              }} />
            </div>
          ))}
          
          {/* Sprocket holes bottom */}
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: 0,
            right: 0,
            height: '4px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`bottom-${i}`} style={{
                width: '4px',
                height: '3px',
                borderRadius: '1px',
                background: '#0a0a0a',
              }} />
            ))}
          </div>
        </div>
        
        {/* Footer with accent */}
        <div style={{
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            width: '30px',
            height: '4px',
            background: terracotta,
            borderRadius: '2px',
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: terracotta,
            boxShadow: `0 0 6px ${terracotta}40`,
          }} />
        </div>
      </div>
    );
  }
  
  // Default thumbnail for other templates
  const bgColor = isDark ? '#2a2a2a' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26, 26, 26, 0.08)';
  
  return (
    <div style={{
      aspectRatio: '4/3',
      background: bgColor,
      borderRadius: '6px',
      border: `1px solid ${borderColor}`,
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '40px',
          height: '6px',
          background: accentColor,
          borderRadius: '3px',
        }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: '20px',
              height: '4px',
              background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(26, 26, 26, 0.15)',
              borderRadius: '2px',
            }} />
          ))}
        </div>
      </div>
      
      {/* Photo Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '4px',
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26, 26, 26, 0.06)',
            borderRadius: '2px',
          }} />
        ))}
      </div>
      
      {/* Accent Dot */}
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: accentColor,
        marginTop: '10px',
      }} />
    </div>
  );
}

// =============================================================================
// Template Preview
// =============================================================================
function TemplatePreview({ templateId, displayName, username }: { templateId: string; displayName: string; username: string }) {
  const template = TEMPLATE_METADATA.find(t => t.id === templateId);
  const isDark = templateId === 'obsidian';
  const accentColor = template?.accentColor || '#C4A484';
  
  return (
    <div style={{
      background: isDark ? '#1A1A1A' : '#FAF9F7',
      borderRadius: '8px',
      overflow: 'hidden',
      minHeight: '400px',
    }}>
      {/* Preview Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26, 26, 26, 0.06)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 400,
            fontStyle: 'italic',
            color: accentColor,
            marginBottom: '4px',
          }}>
            {displayName || 'Jana Rose'}
          </h2>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '2px',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(26, 26, 26, 0.4)',
            textTransform: 'uppercase',
          }}>
            Model
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '1px',
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(26, 26, 26, 0.5)',
          textTransform: 'uppercase',
        }}>
          <span>Portfolio</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </div>
      
      {/* Preview Grid */}
      <div style={{
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            aspectRatio: '3/4',
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26, 26, 26, 0.04)',
            borderRadius: '4px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26, 26, 26, 0.06)'}`,
          }} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Icons
// =============================================================================
function CheckIcon({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

