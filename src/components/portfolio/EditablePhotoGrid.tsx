'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PortfolioPhoto } from '@/types/portfolio';

interface EditablePhotoGridProps {
  photos: PortfolioPhoto[];
  onPhotosChange: (photos: PortfolioPhoto[]) => void;
  columns?: number;
}

export function EditablePhotoGrid({ 
  photos, 
  onPhotosChange,
  columns = 3,
}: EditablePhotoGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

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
      const oldIndex = photos.findIndex((item) => item.id === active.id);
      const newIndex = photos.findIndex((item) => item.id === over.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      onPhotosChange(newPhotos);
    }
  }, [photos, onPhotosChange]);

  const handleToggleVisibility = useCallback((photoId: string) => {
    const newPhotos = photos.map((item) =>
      item.id === photoId ? { ...item, isVisible: !item.isVisible } : item
    );
    onPhotosChange(newPhotos);
  }, [photos, onPhotosChange]);

  const activePhoto = photos.find((p) => p.id === activeId);
  const visibleCount = photos.filter((p) => p.isVisible).length;
  const hiddenCount = photos.filter((p) => !p.isVisible).length;

  return (
    <div style={{ padding: '16px' }}>
      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'rgba(26, 26, 26, 0.04)',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontSize: '13px',
            color: '#22C55E',
          }}>
            <strong>{visibleCount}</strong> visible
          </span>
          <span style={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontSize: '13px',
            color: 'rgba(26, 26, 26, 0.5)',
          }}>
            <strong>{hiddenCount}</strong> hidden
          </span>
        </div>
        <div style={{ 
          fontFamily: "'Outfit', sans-serif", 
          fontSize: '12px',
          color: 'rgba(26, 26, 26, 0.5)',
        }}>
          Drag to reorder • Click eye to toggle visibility
        </div>
      </div>

      {/* Sortable Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '12px',
            }}
          >
            {photos.map((photo) => (
              <SortablePhotoItem
                key={photo.id}
                photo={photo}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false}>
          {activePhoto ? <PhotoOverlay photo={activePhoto} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// =============================================================================
// Sortable Photo Item
// =============================================================================
interface SortablePhotoItemProps {
  photo: PortfolioPhoto;
  onToggleVisibility: (id: string) => void;
}

function SortablePhotoItem({ photo, onToggleVisibility }: SortablePhotoItemProps) {
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

  const handleVisibilityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleVisibility(photo.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'relative',
        aspectRatio: '3/4',
        borderRadius: '8px',
        overflow: 'hidden',
        border: photo.isVisible ? '2px solid transparent' : '2px dashed rgba(26, 26, 26, 0.2)',
      }}
      {...attributes}
    >
      {/* Draggable Image Area - only this part is draggable */}
      <div
        {...listeners}
        style={{
          position: 'absolute',
          inset: 0,
          cursor: 'grab',
        }}
      >
        <Image
          src={photo.thumbnailUrl || photo.url}
          alt={photo.caption || 'Portfolio photo'}
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          style={{
            objectFit: 'cover',
            filter: photo.isVisible ? 'none' : 'grayscale(100%) opacity(0.4)',
            transition: 'filter 0.2s ease',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>

      {/* Visibility Toggle - separate from drag area */}
      <button
        type="button"
        onClick={handleVisibilityClick}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: photo.isVisible ? 'rgba(34, 197, 94, 0.9)' : 'rgba(0, 0, 0, 0.6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 10,
          touchAction: 'manipulation',
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
          padding: '4px 8px',
          borderRadius: '4px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          pointerEvents: 'none',
        }}
      >
        #{photo.sortOrder + 1}
      </div>

      {/* Hidden overlay */}
      {!photo.isVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(26, 26, 26, 0.3)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            Hidden
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Photo Overlay (for drag preview)
// =============================================================================
function PhotoOverlay({ photo }: { photo: PortfolioPhoto }) {
  return (
    <div
      style={{
        width: '150px',
        aspectRatio: '3/4',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        transform: 'rotate(3deg)',
      }}
    >
      <Image
        src={photo.thumbnailUrl || photo.url}
        alt={photo.caption || 'Dragging photo'}
        fill
        sizes="150px"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}

// =============================================================================
// Icons
// =============================================================================
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

