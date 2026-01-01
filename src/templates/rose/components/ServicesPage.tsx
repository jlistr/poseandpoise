'use client';

import { useState } from 'react';
import type { PortfolioData } from '@/types/portfolio';
import { useEditMode } from '@/components/portfolio/PortfolioPreview';
import { RichTextEditor } from '@/components/editor';

interface ServicesPageProps {
  data: PortfolioData;
}

export function ServicesPage({ data }: ServicesPageProps) {
  const editMode = useEditMode();
  const accentColor = editMode?.accentColor || '#FF7AA2';
  const [showCompCardSelector, setShowCompCardSelector] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Use services from edit mode if available
  const services = editMode?.services ?? data.services ?? [];
  const pageTitle = editMode?.pageTitle ?? `Professional Modeling Services in ${data.profile.location || 'Your Area'}`;
  const selectedCompCardId = editMode?.selectedCompCardId;
  const compCards = editMode?.compCards ?? data.compCards ?? [];
  
  // Get photos for the selected/primary comp card
  const selectedCompCard = compCards.find(c => c.id === selectedCompCardId) || compCards.find(c => c.isPrimary);
  const compCardPhotos = selectedCompCard
    ? data.photos.filter(p => selectedCompCard.photoIds.includes(p.id)).slice(0, 4)
    : data.photos.slice(0, 4);

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Title - Editable in Edit Mode */}
      {editMode?.isEditMode ? (
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <label
            style={{
              display: 'block',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: accentColor,
              marginBottom: '8px',
            }}
          >
            Page Title (Click to edit)
          </label>
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => editMode.onPageTitleChange(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '600px',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '32px',
              fontWeight: 400,
              textAlign: 'center',
              border: 'none',
              borderBottom: `2px dashed ${accentColor}`,
              background: 'transparent',
              padding: '8px',
              outline: 'none',
              color: '#1A1A1A',
            }}
          />
        </div>
      ) : (
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '36px',
            fontWeight: 400,
            textAlign: 'center',
            marginBottom: '48px',
            color: '#1A1A1A',
          }}
        >
          {pageTitle}
        </h1>
      )}

      {/* Comp Card Section */}
      <div style={{ marginBottom: '60px' }}>
        {/* Flip Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setIsFlipped(false)}
            style={{
              padding: '10px 20px',
              background: !isFlipped ? accentColor : 'transparent',
              border: `1px solid ${!isFlipped ? accentColor : 'rgba(26, 26, 26, 0.2)'}`,
              borderRadius: 0,
              color: !isFlipped ? '#fff' : 'rgba(26, 26, 26, 0.6)',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FrontIcon />
            Front
          </button>
          <button
            onClick={() => setIsFlipped(true)}
            style={{
              padding: '10px 20px',
              background: isFlipped ? accentColor : 'transparent',
              border: `1px solid ${isFlipped ? accentColor : 'rgba(26, 26, 26, 0.2)'}`,
              borderRadius: 0,
              color: isFlipped ? '#fff' : 'rgba(26, 26, 26, 0.6)',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BackIcon />
            Back
          </button>
        </div>

        {/* Comp Card with Flip Animation */}
        <div
          style={{
            perspective: '1500px',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front of Card */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: '#fff',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
                borderRadius: 0,
                overflow: 'hidden',
              }}
            >
              {/* Comp Card Images Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '2px',
                  height: 'calc(100% - 80px)',
                }}
              >
                {compCardPhotos.map((photo, i) => (
                  <div
                    key={photo.id}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={`Comp card photo ${i + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Model Name */}
              <div
                style={{
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTop: '1px solid rgba(26, 26, 26, 0.1)',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#1A1A1A',
                    marginBottom: '4px',
                  }}
                >
                  {data.profile.displayName.toUpperCase()}
                </h3>
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: 'rgba(26, 26, 26, 0.5)',
                    textTransform: 'uppercase',
                  }}
                >
                  Model
                </span>
              </div>

              {/* Edit Mode - Change Comp Card Button */}
              {editMode?.isEditMode && compCards.length >= 1 && (
                <button
                  onClick={() => setShowCompCardSelector(!showCompCardSelector)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '8px 14px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: 0,
                    color: '#fff',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <SwapIcon />
                  {compCards.length === 1 ? 'Select Comp Card' : 'Change Comp Card'}
                </button>
              )}
            </div>

            {/* Back of Card */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: '#1A1A1A',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
                borderRadius: 0,
                overflow: 'hidden',
                transform: 'rotateY(180deg)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '24px',
                    fontWeight: 400,
                    color: '#fff',
                    marginBottom: '4px',
                  }}
                >
                  {data.profile.displayName}
                </h3>
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '2px',
                    color: accentColor,
                    textTransform: 'uppercase',
                  }}
                >
                  Model Stats
                </span>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '1px',
                }}
              >
                <StatItem label="Height" value={formatHeight(data.stats.heightCm)} accentColor={accentColor} />
                <StatItem label="Bust" value={`${data.stats.bustCm} cm`} accentColor={accentColor} />
                <StatItem label="Waist" value={`${data.stats.waistCm} cm`} accentColor={accentColor} />
                <StatItem label="Hips" value={`${data.stats.hipsCm} cm`} accentColor={accentColor} />
                <StatItem label="Shoe" value={data.stats.shoeSize} accentColor={accentColor} />
                <StatItem label="Hair" value={data.stats.hairColor} accentColor={accentColor} />
                <StatItem label="Eyes" value={data.stats.eyeColor} accentColor={accentColor} />
                <StatItem label="Location" value={data.profile.location || '—'} accentColor={accentColor} />
              </div>

              {/* Agency/Contact */}
              {data.profile.agency && (
                <div
                  style={{
                    padding: '16px 24px',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '10px',
                      letterSpacing: '1px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Represented by
                  </span>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#fff',
                    }}
                  >
                    {data.profile.agency}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comp Card Selector Dropdown */}
        {editMode?.isEditMode && showCompCardSelector && compCards.length >= 1 && (
          <div
            style={{
              maxWidth: '500px',
              margin: '16px auto 0',
              background: '#fff',
              border: '1px solid rgba(26, 26, 26, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(26, 26, 26, 0.08)',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                color: 'rgba(26, 26, 26, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Select a Comp Card
            </div>
            {compCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  editMode.onCompCardSelect(card.id);
                  setShowCompCardSelector(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: '1px solid rgba(26, 26, 26, 0.05)',
                  background: card.id === selectedCompCardId ? `${accentColor}15` : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    background: '#f0f0f0',
                  }}
                >
                  {data.photos.find(p => p.id === card.photoIds[0]) && (
                    <img
                      src={data.photos.find(p => p.id === card.photoIds[0])?.thumbnailUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1A1A1A',
                    }}
                  >
                    {card.name || 'Unnamed Comp Card'}
                  </div>
                  {card.isPrimary && (
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '10px',
                        color: accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Primary
                    </span>
                  )}
                </div>
                {card.id === selectedCompCardId && (
                  <CheckIcon />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Services Section */}
      <div>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 400,
            textAlign: 'center',
            marginBottom: '32px',
            color: '#1A1A1A',
          }}
        >
          Services & Rates
        </h2>

        {/* Services List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                background: '#fff',
                border: editMode?.isEditMode ? `2px dashed ${accentColor}40` : '1px solid rgba(26, 26, 26, 0.08)',
                borderRadius: '8px',
                position: 'relative',
              }}
            >
              {/* Service Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  gap: '16px',
                }}
              >
                {/* Service Title */}
                {editMode?.isEditMode ? (
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => editMode.onUpdateService(index, 'title', e.target.value)}
                    placeholder="Service Name"
                    style={{
                      flex: 1,
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '22px',
                      fontWeight: 500,
                      border: 'none',
                      borderBottom: `1px dashed ${accentColor}`,
                      background: 'transparent',
                      padding: '4px 0',
                      outline: 'none',
                      color: '#1A1A1A',
                    }}
                  />
                ) : (
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '22px',
                      fontWeight: 500,
                      color: '#1A1A1A',
                      margin: 0,
                    }}
                  >
                    {service.title}
                  </h3>
                )}

                {/* Service Price */}
                {editMode?.isEditMode ? (
                  <input
                    type="text"
                    value={service.price || ''}
                    onChange={(e) => {
                      // Format as USD currency - strip non-numeric chars except decimal
                      let value = e.target.value;
                      // Remove any existing $ and non-numeric chars except decimal point
                      const numericValue = value.replace(/[^0-9.]/g, '');
                      // Ensure only one decimal point
                      const parts = numericValue.split('.');
                      const formatted = parts.length > 2 
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : numericValue;
                      // Add $ prefix if there's a value
                      const finalValue = formatted ? `$${formatted}` : '';
                      editMode.onUpdateService(index, 'price', finalValue);
                    }}
                    onBlur={(e) => {
                      // On blur, format to proper currency (2 decimal places if has decimal)
                      let value = e.target.value.replace(/[^0-9.]/g, '');
                      if (value) {
                        const num = parseFloat(value);
                        if (!isNaN(num)) {
                          // Format with proper USD currency
                          const formatted = num.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          });
                          editMode.onUpdateService(index, 'price', formatted);
                        }
                      }
                    }}
                    placeholder="$0"
                    style={{
                      width: '100px',
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '18px',
                      fontWeight: 500,
                      textAlign: 'right',
                      border: 'none',
                      borderBottom: `1px dashed ${accentColor}`,
                      background: 'transparent',
                      padding: '4px 0',
                      outline: 'none',
                      color: accentColor,
                    }}
                  />
                ) : service.price ? (
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '18px',
                      fontWeight: 500,
                      color: accentColor,
                    }}
                  >
                    {service.price}
                  </span>
                ) : null}
              </div>

              {/* Service Description */}
              {editMode?.isEditMode ? (
                <RichTextEditor
                  value={service.description}
                  onChange={(value) => editMode.onUpdateService(index, 'description', value)}
                  placeholder="Describe this service..."
                  minHeight="80px"
                  accentColor={accentColor}
                />
              ) : (
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'rgba(26, 26, 26, 0.7)',
                  }}
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              )}

              {/* Remove Service Button (Edit Mode) */}
              {editMode?.isEditMode && (
                <button
                  onClick={() => editMode.onRemoveService(index)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                  title="Remove service"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Service Button (Edit Mode) */}
        {editMode?.isEditMode && (
          <button
            onClick={editMode.onAddService}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '16px',
              background: `${accentColor}10`,
              border: `2px dashed ${accentColor}40`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: accentColor,
              transition: 'all 0.2s ease',
            }}
          >
            <PlusIcon />
            Add New Service
          </button>
        )}

        {/* Empty State */}
        {services.length === 0 && !editMode?.isEditMode && (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'rgba(26, 26, 26, 0.4)',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Services coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

interface StatItemProps {
  label: string;
  value: string;
  accentColor: string;
}

function StatItem({ label, value, accentColor }: StatItemProps) {
  return (
    <div
      style={{
        background: '#1A1A1A',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      }}
    >
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '10px',
          letterSpacing: '1px',
          color: 'rgba(255, 255, 255, 0.4)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '18px',
          fontWeight: 500,
          color: '#fff',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatHeight(cm: number): string {
  if (!cm) return '—';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}" / ${cm}cm`;
}

// =============================================================================
// Icons
// =============================================================================
function FrontIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 16l-4-4 4-4" />
      <path d="M17 8l4 4-4 4" />
      <path d="M3 12h18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
