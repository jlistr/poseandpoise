'use client';

import { useState, useCallback } from 'react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PortfolioData, PortfolioPhoto } from '@/types/portfolio';
import { useEditMode, PhotoUploadZone } from '@/components/portfolio';

interface PortfolioPageProps {
  data: PortfolioData;
}

export function PortfolioPage({ data }: PortfolioPageProps) {
  const editMode = useEditMode();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const accentColor = editMode?.accentColor || '#FF7AA2';
  
  // Use photos from edit mode if available
  const photos = editMode?.photos ?? data.photos;

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

  return (
    <div style={{ padding: '8px 8px 80px' }}>
      {/* Photo Upload Zone (Edit Mode) */}
      <PhotoUploadZone accentColor={accentColor} />

      {/* Edit Mode Stats */}
      {editMode?.isEditMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '16px',
            marginBottom: '16px',
            background: `${accentColor}15`,
            borderRadius: '8px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
          }}
        >
          <span style={{ color: '#22C55E' }}>
            <strong>{visibleCount}</strong> visible
          </span>
          <span style={{ color: 'rgba(26, 26, 26, 0.5)' }}>
            <strong>{hiddenCount}</strong> hidden
          </span>
          <span style={{ color: 'rgba(26, 26, 26, 0.4)', fontSize: '12px' }}>
            Drag to reorder • Click eye to show/hide
          </span>
        </div>
      )}

      {/* Photo Grid with Drag & Drop */}
      {editMode?.isEditMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={displayPhotos.map(p => p.id)} strategy={rectSortingStrategy}>
            <div 
              style={{
                columnCount: 5,
                columnGap: '6px',
              }}
              className="rose-masonry-grid"
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
                  borderRadius: '4px',
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
      ) : (
        // Non-edit mode: Tight 5-column masonry grid matching reference image
        <div 
          style={{
            columnCount: 5,
            columnGap: '4px',
          }}
          className="rose-masonry-grid"
        >
          {displayPhotos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              index={index}
              onSelect={() => setSelectedPhoto(photo.url)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
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
              color: '#fff',
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

      {/* Responsive Styles - Tight 5-column masonry matching reference */}
      <style>{`
        .rose-masonry-grid {
          column-count: 5;
          column-gap: 4px;
        }
        @media (max-width: 1200px) {
          .rose-masonry-grid {
            column-count: 4;
          }
        }
        @media (max-width: 900px) {
          .rose-masonry-grid {
            column-count: 3;
          }
        }
        @media (max-width: 600px) {
          .rose-masonry-grid {
            column-count: 2;
            column-gap: 3px;
          }
        }
        @media (max-width: 380px) {
          .rose-masonry-grid {
            column-count: 2;
            column-gap: 2px;
          }
        }
      `}</style>
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
        breakInside: 'avoid',
        marginBottom: '6px',
        position: 'relative',
        border: !photo.isVisible ? '2px dashed rgba(26, 26, 26, 0.3)' : 'none',
        borderRadius: '2px',
        cursor: 'grab',
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
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
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
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
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
// Regular Photo Item (Public View) - Clean masonry style matching reference
// =============================================================================
interface PhotoItemProps {
  photo: PortfolioPhoto;
  index: number;
  onSelect: () => void;
}

function PhotoItem({ photo, index, onSelect }: PhotoItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        breakInside: 'avoid',
        marginBottom: '4px',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '3px',
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
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s ease',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          filter: isHovered ? 'brightness(1.03)' : 'none',
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
