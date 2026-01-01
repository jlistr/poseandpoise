'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PortfolioData, PortfolioPhoto } from '@/types/portfolio';
import { useEditMode, PhotoUploadZone } from '@/components/portfolio';
import { usePhotoAnalytics } from '@/hooks/usePhotoAnalytics';

interface LumiereTemplateProps {
  data: PortfolioData;
}

type PageSection = 'portfolio' | 'about' | 'services' | 'contact';

export function LumiereTemplate({ data }: LumiereTemplateProps) {
  const editMode = useEditMode();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Color palette inspired by the hero video's warm Mediterranean sunset tones
  // Coral terracotta accent, teal secondary, warm cream backgrounds
  const accentColor = editMode?.accentColor || '#C8553D'; // Terracotta coral from video lighting
  const secondaryAccent = '#2D8A8A'; // Teal from headscarf pattern
  const warmCream = '#FFF8F0'; // Warm cream with coral undertone
  const deepWarm = '#3D2A26'; // Deep espresso brown
  const portfolioDark = '#1F1816'; // Warm charcoal with burgundy tint

  // Scroll to section handler
  const scrollToSection = (section: PageSection) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };
  
  // Use photos from edit mode if available
  const photos = editMode?.photos ?? data.photos;
  const profile = data.profile;
  const social = data.social;

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        editMode?.onReorderPhotos(oldIndex, newIndex);
      }
    }
  }, [photos, editMode]);

  const handleToggleVisibility = useCallback((photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    editMode?.onTogglePhotoVisibility(photoId);
  }, [editMode]);

  const activePhoto = photos.find(p => p.id === activeId);

  // Stats for edit mode
  const visibleCount = photos.filter(p => p.isVisible).length;
  const hiddenCount = photos.filter(p => !p.isVisible).length;

  // Filter photos for display (show all in edit mode, only visible otherwise)
  const displayPhotos = editMode?.isEditMode ? photos : photos.filter(p => p.isVisible);

  // Process bio HTML to use accent color for checkmarks
  const processedBio = profile.bio?.replace(
    /color:\s*rgb\(255,\s*122,\s*162\)/g,
    `color: ${accentColor}`
  ).replace(
    /✓/g,
    `<span style="color: ${accentColor}">✓</span>`
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: warmCream, color: deepWarm }}>
      {/* Fixed Navigation Header */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
        }}
      >
        {/* Logo / Name */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.25rem',
            fontWeight: 300,
            color: warmCream,
            letterSpacing: '0.1em',
            textShadow: '0 2px 15px rgba(0, 0, 0, 0.4)',
          }}
        >
          {profile.displayName}
        </button>

        {/* Desktop Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
          }}
          className="desktop-nav"
        >
          {(['portfolio', 'about', 'services', 'contact'] as PageSection[]).map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: warmCream,
                textShadow: '0 2px 15px rgba(0, 0, 0, 0.4)',
                padding: '8px 0',
                position: 'relative',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: warmCream,
          }}
          className="mobile-menu-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Full-Screen Menu */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: `linear-gradient(135deg, ${deepWarm} 0%, ${portfolioDark} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
          }}
        >
          {(['portfolio', 'about', 'services', 'contact'] as PageSection[]).map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 300,
                letterSpacing: '0.1em',
                textTransform: 'capitalize',
                color: warmCream,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
              onMouseLeave={(e) => e.currentTarget.style.color = warmCream}
            >
              {section}
            </button>
          ))}
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>

      {/* Hero Video Section */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source
            src="/images/Subtle_wind_gently_blowing_through_the_model_s_hair_and_patterned_headscarf,_soft_eye_blink_with_a_s_seed2679121730.mp4"
            type="video/mp4"
          />
        </video>

        {/* Warm Terracotta Overlay for Mediterranean aesthetic */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(
              180deg,
              rgba(200, 85, 61, 0.08) 0%,
              transparent 25%,
              transparent 65%,
              rgba(255, 248, 240, 0.85) 100%
            )`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Hero Content Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(3rem, 10vw, 6rem)',
              fontWeight: 200,
              color: warmCream,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: '0.1em',
              textShadow: '0 4px 50px rgba(0, 0, 0, 0.4), 0 2px 20px rgba(200, 85, 61, 0.2)',
              marginBottom: '1rem',
            }}
          >
            {profile.displayName}
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(255, 248, 240, 0.9)',
              textShadow: '0 2px 25px rgba(0, 0, 0, 0.4)',
            }}
          >
            Model
          </p>
        </div>

        {/* Scroll Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'bounce 2s infinite',
          }}
        >
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255, 248, 240, 0.75)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            Scroll
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 248, 240, 0.75)"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' }}
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
            40% { transform: translateX(-50%) translateY(-10px); }
            60% { transform: translateX(-50%) translateY(-5px); }
          }
          
          /* Photo pop animation on hover */
          .photo-item-animated:hover {
            z-index: 10;
          }
          
          /* Shimmer effect on images */
          .photo-item-animated::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            transition: left 0.5s ease;
            pointer-events: none;
          }
          
          .photo-item-animated:hover::after {
            left: 100%;
          }
        `}</style>
      </section>

      {/* Portfolio Section - Filmstrip (flush with hero video) */}
      <section 
        id="portfolio" 
        style={{ 
          padding: '0', 
          overflow: 'hidden',
          background: portfolioDark,
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 300,
            color: accentColor,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            letterSpacing: '0.05em',
            textAlign: 'center',
            marginBottom: '1rem',
            paddingTop: '4rem',
          }}
        >
          Portfolio
        </h2>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            color: 'rgba(255, 248, 240, 0.5)',
            textAlign: 'center',
            marginBottom: '3rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Scroll to explore
        </p>

        {/* Edit Mode - Keep Grid for easier editing */}
        {editMode?.isEditMode ? (
          <div style={{ padding: '0 2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Photo Upload Zone (Edit Mode) */}
            <PhotoUploadZone accentColor={accentColor} />

            {/* Edit Mode Stats */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                padding: '16px',
                marginBottom: '24px',
                background: `${accentColor}15`,
                borderRadius: '8px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
              }}
            >
              <span style={{ color: '#22C55E' }}>
                <strong>{visibleCount}</strong> visible
              </span>
              <span style={{ color: `${deepWarm}80` }}>
                <strong>{hiddenCount}</strong> hidden
              </span>
              <span style={{ color: `${deepWarm}66`, fontSize: '12px' }}>
                Drag to reorder • Click eye to show/hide
              </span>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={displayPhotos.map(p => p.id)} strategy={rectSortingStrategy}>
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {displayPhotos.map((photo, index) => (
                    <SortablePhotoItem
                      key={photo.id}
                      photo={photo}
                      index={index}
                      accentColor={accentColor}
                      onToggleVisibility={handleToggleVisibility}
                      onSelect={() => setSelectedPhoto(photo.url)}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activePhoto && (
                  <div
                    style={{
                      width: '200px',
                      background: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      transform: 'rotate(3deg)',
                    }}
                  >
                    <img
                      src={activePhoto.thumbnailUrl || activePhoto.url}
                      alt=""
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          // Non-edit mode: Horizontal Filmstrip
          <FilmstripGallery
            photos={displayPhotos}
            accentColor={accentColor}
            onSelectPhoto={setSelectedPhoto}
          />
        )}
      </section>

      {/* About Section - Enhanced with Visual Appeal */}
      <section
        id="about"
        style={{
          padding: '8rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Background Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, ${accentColor}08 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 100%, ${secondaryAccent}05 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
          {/* Section Header with Decorative Elements */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            {/* Decorative Line Above */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${accentColor}60)`,
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: accentColor,
                  boxShadow: `0 0 12px ${accentColor}40`,
                }}
              />
              <div
                style={{
                  width: '60px',
                  height: '1px',
                  background: `linear-gradient(90deg, ${accentColor}60, transparent)`,
                }}
              />
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 200,
                color: accentColor,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              About
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: `${deepWarm}80`,
                letterSpacing: '0.05em',
              }}
            >
              The story behind the lens
            </p>
          </div>

          {/* Two Column Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            {/* Left Column - Visual Element */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {/* Decorative Frame */}
              <div
                style={{
                  position: 'relative',
                  width: '280px',
                  height: '350px',
                }}
              >
                {/* Outer Frame */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-12px',
                    border: `1px solid ${accentColor}30`,
                    borderRadius: '4px',
                  }}
                />
                {/* Corner Accents */}
                <div style={{ position: 'absolute', top: '-12px', left: '-12px', width: '24px', height: '24px', borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
                <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '24px', height: '24px', borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
                <div style={{ position: 'absolute', bottom: '-12px', left: '-12px', width: '24px', height: '24px', borderBottom: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
                <div style={{ position: 'absolute', bottom: '-12px', right: '-12px', width: '24px', height: '24px', borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
                
                {/* Image Container */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${accentColor}15 0%, ${secondaryAccent}10 100%)`,
                    borderRadius: '2px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {photos[0] ? (
                    <img
                      src={photos[0].url}
                      alt={profile.displayName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(20%)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        color: `${deepWarm}40`,
                      }}
                    >
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Floating Accent Element */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 24px ${accentColor}40`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '1.5rem',
                      fontWeight: 300,
                      color: warmCream,
                      letterSpacing: '0.05em',
                    }}
                  >
                    ✦
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div>
              {/* Quote/Tagline */}
              <div
                style={{
                  marginBottom: '2rem',
                  paddingLeft: '1.5rem',
                  borderLeft: `3px solid ${accentColor}`,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    fontStyle: 'italic',
                    color: deepWarm,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  "Every frame tells a story, every pose speaks volumes."
                </p>
              </div>

              {/* Bio Content */}
              {processedBio && (
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '15px',
                    lineHeight: 2,
                    color: `${deepWarm}DD`,
                    marginBottom: '2.5rem',
                  }}
                  dangerouslySetInnerHTML={{ __html: processedBio }}
                />
              )}

              {/* Stats/Highlights */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, ${warmCream} 0%, ${accentColor}08 100%)`,
                  borderRadius: '8px',
                  border: `1px solid ${accentColor}15`,
                }}
              >
                {[
                  { number: '5+', label: 'Years Experience' },
                  { number: '100+', label: 'Projects' },
                  { number: '∞', label: 'Creativity' },
                ].map((stat, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        fontWeight: 300,
                        color: accentColor,
                        lineHeight: 1,
                        marginBottom: '0.25rem',
                      }}
                    >
                      {stat.number}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '11px',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        color: `${deepWarm}80`,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        style={{
          padding: '6rem 2rem',
          background: `linear-gradient(180deg, transparent 0%, ${accentColor}08 50%, transparent 100%)`,
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 300,
              color: accentColor,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            Services
          </h2>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px',
              color: `${deepWarm}99`,
              marginBottom: '3rem',
            }}
          >
            Professional modeling services tailored to your creative vision
          </p>

          {/* Services Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              { title: 'Editorial', desc: 'High-fashion editorial shoots for magazines and publications' },
              { title: 'Commercial', desc: 'Brand campaigns, advertisements, and product photography' },
              { title: 'Runway', desc: 'Fashion shows, lookbooks, and live event modeling' },
              { title: 'Print', desc: 'Catalogs, e-commerce, and promotional materials' },
            ].map((service) => (
              <div
                key={service.title}
                style={{
                  padding: '2rem',
                  background: warmCream,
                  border: `1px solid ${accentColor}25`,
                  borderRadius: '4px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 30px ${accentColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    color: accentColor,
                    marginBottom: '0.75rem',
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '14px',
                    color: `${deepWarm}B3`,
                    lineHeight: 1.6,
                  }}
                >
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        style={{
          padding: '6rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 300,
              color: accentColor,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            Get in Touch
          </h2>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              color: `${deepWarm}B3`,
              lineHeight: 1.8,
              marginBottom: '2rem',
            }}
          >
            Interested in working together? I'd love to hear about your project.
            Let's create something beautiful.
          </p>

          {/* Contact Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            {social.instagram && (
              <a
                href={`https://instagram.com/${social.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  color: accentColor,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                @{social.instagram.replace('@', '')}
              </a>
            )}

            {social.website && (
              <a
                href={social.website.startsWith('http') ? social.website : `https://${social.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  color: accentColor,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {social.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {/* Contact CTA Button */}
          <a
            href={social.instagram ? `https://instagram.com/${social.instagram.replace('@', '')}` : '#'}
            style={{
              display: 'inline-block',
              marginTop: '2.5rem',
              padding: '14px 40px',
              background: `linear-gradient(135deg, ${accentColor} 0%, #B04A34 100%)`,
              color: warmCream,
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 12px 30px ${accentColor}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Book Me
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '2rem',
          textAlign: 'center',
          borderTop: `1px solid ${accentColor}25`,
        }}
      >
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            color: `${deepWarm}80`,
          }}
        >
          © {new Date().getFullYear()} {profile.displayName}. All rights reserved.
        </p>
      </footer>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: `linear-gradient(135deg, ${deepWarm}F5 0%, ${portfolioDark}F8 100%)`,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: warmCream,
              fontSize: '32px',
              cursor: 'pointer',
              padding: '8px',
              lineHeight: 1,
            }}
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
          <img
            src={selectedPhoto}
            alt="Full size"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Filmstrip Gallery Component
// =============================================================================
interface FilmstripGalleryProps {
  photos: PortfolioPhoto[];
  accentColor: string;
  onSelectPhoto: (url: string) => void;
}

function FilmstripGallery({ photos, accentColor, onSelectPhoto }: FilmstripGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check scroll position
  const updateScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate active index based on scroll position
      const frameWidth = 420; // Approximate frame width including gap
      const newIndex = Math.round(scrollLeft / frameWidth);
      setActiveIndex(Math.min(newIndex, photos.length - 1));
    }
  }, [photos.length]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => scrollEl.removeEventListener('scroll', updateScrollButtons);
    }
  }, [updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const frameWidth = 420;
      scrollRef.current.scrollTo({
        left: index * frameWidth,
        behavior: 'smooth',
      });
    }
  };

  const portfolioDark = '#1F1816'; // Warm charcoal with burgundy tint
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Filmstrip Container */}
      <div
        style={{
          position: 'relative',
          background: portfolioDark,
          padding: '20px 0',
          overflow: 'hidden',
        }}
      >
        {/* Top Sprocket Holes */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: 0,
            right: 0,
            height: '12px',
            display: 'flex',
            justifyContent: 'center',
            gap: '28px',
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`top-${i}`}
              style={{
                width: '12px',
                height: '8px',
                borderRadius: '2px',
                background: '#0a0a0a',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Bottom Sprocket Holes */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: 0,
            right: 0,
            height: '12px',
            display: 'flex',
            justifyContent: 'center',
            gap: '28px',
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              style={{
                width: '12px',
                height: '8px',
                borderRadius: '2px',
                background: '#0a0a0a',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Scrollable Frame Container */}
        <div
          ref={scrollRef}
          className="filmstrip-scroll"
          style={{
            display: 'flex',
            gap: '20px',
            padding: '0 calc(50vw - 180px)',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {photos.map((photo, index) => (
            <FilmFrame
              key={photo.id}
              photo={photo}
              index={index}
              isActive={index === activeIndex}
              accentColor={accentColor}
              onSelect={() => onSelectPhoto(photo.url)}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 248, 240, 0.95)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D2A26" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 248, 240, 0.95)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D2A26" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Dot Indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          paddingBottom: '4rem',
        }}
      >
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            style={{
              width: index === activeIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: index === activeIndex ? accentColor : `${accentColor}40`,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .filmstrip-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// Film Frame Component
// =============================================================================
interface FilmFrameProps {
  photo: PortfolioPhoto;
  index: number;
  isActive: boolean;
  accentColor: string;
  onSelect: () => void;
}

function FilmFrame({ photo, index, isActive, accentColor, onSelect }: FilmFrameProps) {
  const [isHovered, setIsHovered] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const warmCream = '#FFF8F0';
  const deepWarm = '#3D2A26';
  const { trackClick, createViewObserver } = usePhotoAnalytics();

  // Animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (frameRef.current) {
      observer.observe(frameRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  // Analytics view tracking
  useEffect(() => {
    if (!frameRef.current || !photo.id) return;

    const analyticsObserver = createViewObserver(photo.id, 0.5);
    analyticsObserver.observe(frameRef.current);

    return () => analyticsObserver.disconnect();
  }, [photo.id, createViewObserver]);

  // Handle click with analytics tracking
  const handleClick = useCallback(() => {
    if (photo.id) {
      trackClick(photo.id);
    }
    onSelect();
  }, [photo.id, trackClick, onSelect]);

  return (
    <div
      ref={frameRef}
      style={{
        flexShrink: 0,
        scrollSnapAlign: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          width: '360px',
          background: warmCream,
          padding: '12px',
          borderRadius: '4px',
          boxShadow: isActive 
            ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 2px ${accentColor}`
            : '0 8px 24px rgba(0, 0, 0, 0.3)',
          transform: isActive ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.4s ease',
          cursor: 'pointer',
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Photo */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '2px',
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption || `Photo ${index + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              aspectRatio: '3 / 4',
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          
          {/* Hover Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, ${isHovered ? '0.4' : '0'}) 100%)`,
              transition: 'all 0.4s ease',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            {isHovered && (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '12px',
                  color: warmCream,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.3s ease',
                }}
              >
                View
              </span>
            )}
          </div>
        </div>

        {/* Frame Number */}
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '10px',
              color: `${deepWarm}66`,
              letterSpacing: '1px',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '10px',
              color: `${deepWarm}66`,
              letterSpacing: '1px',
            }}
          >
            {photo.caption || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Sortable Photo Item (Edit Mode)
// =============================================================================
interface SortablePhotoItemProps {
  photo: PortfolioPhoto;
  index: number;
  accentColor: string;
  onToggleVisibility: (photoId: string, e: React.MouseEvent) => void;
  onSelect: () => void;
}

function SortablePhotoItem({ photo, index, accentColor, onToggleVisibility, onSelect }: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'relative',
        border: !photo.isVisible ? '2px dashed rgba(61, 52, 38, 0.3)' : 'none',
        borderRadius: '4px',
        cursor: 'grab',
        overflow: 'hidden',
      }}
      {...attributes}
    >
      {/* Draggable Image Area */}
      <div {...listeners} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <img
          src={photo.thumbnailUrl || photo.url}
          alt={photo.caption || `Photo ${index + 1}`}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: !photo.isVisible ? 'grayscale(100%) opacity(0.4)' : 'none',
            transition: 'filter 0.3s ease',
          }}
          onClick={onSelect}
        />
      </div>

      {/* Visibility Toggle Button */}
      <button
        onClick={(e) => onToggleVisibility(photo.id, e)}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: photo.isVisible ? 'rgba(34, 197, 94, 0.9)' : 'rgba(0, 0, 0, 0.6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
          transition: 'transform 0.2s ease',
        }}
        title={photo.isVisible ? 'Click to hide' : 'Click to show'}
      >
        {photo.isVisible ? <EyeIcon /> : <EyeOffIcon />}
      </button>

      {/* Sort Order Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          background: 'rgba(61, 42, 38, 0.85)',
          color: '#FFF8F0',
          padding: '4px 10px',
          borderRadius: '4px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '12px',
          fontWeight: 500,
          pointerEvents: 'none',
        }}
      >
        #{photo.sortOrder + 1}
      </div>

      {/* Hidden Label */}
      {!photo.isVisible && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(61, 42, 38, 0.75)',
            color: '#FFF8F0',
            padding: '8px 16px',
            borderRadius: '4px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            pointerEvents: 'none',
          }}
        >
          Hidden
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Regular Photo Item (Public View) with Scroll Animation
// =============================================================================
interface PhotoItemProps {
  photo: PortfolioPhoto;
  index: number;
  accentColor: string;
  onSelect: () => void;
}

function PhotoItem({ photo, index, accentColor, onSelect }: PhotoItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add a staggered delay based on index for a cascading effect
          setTimeout(() => {
            setIsVisible(true);
          }, (index % 3) * 100); // Stagger by column position
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={itemRef}
      className="photo-item-animated"
      style={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '4px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${(index % 3) * 0.12}s`,
        boxShadow: isHovered 
          ? '0 25px 50px rgba(0, 0, 0, 0.25), 0 10px 20px rgba(0, 0, 0, 0.15)' 
          : '0 4px 15px rgba(0, 0, 0, 0.08)',
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={photo.url}
        alt={photo.caption || `Photo ${index + 1}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          filter: isHovered ? 'brightness(1.05) contrast(1.02)' : 'none',
        }}
      />
      {/* Hover Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, transparent 60%, rgba(61, 42, 38, ${isHovered ? '0.4' : '0'}) 100%)`,
          transition: 'all 0.4s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// =============================================================================
// Icons
// =============================================================================
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
