'use client';

import { useState, useCallback } from 'react';
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
} from '@dnd-kit/sortable';
import { SortablePhotoItem, PhotoDragOverlay } from './SortablePhotoItem';
import { PhotoUploader } from './PhotoUploader';
import type { Photo, PhotoUpdate } from '@/types/photo';
import type { Photo as UploadedPhoto } from '@/app/actions/photos';
import styles from './PhotoGrid.module.css';

interface PhotoGridProps {
  initialPhotos: Photo[];
  onSave: (updates: PhotoUpdate[]) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  onUpdateCaption: (photoId: string, caption: string) => Promise<void>;
}

export function PhotoGrid({ initialPhotos, onSave, onDelete, onUpdateCaption }: PhotoGridProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const handleUploadComplete = useCallback(() => {
    // Refresh the page to get new photos from the server
    router.refresh();
    setShowUploader(false);
  }, [router]);

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
      setPhotos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          sort_order: index,
        }));

        setHasChanges(true);
        return newItems;
      });
    }
  }, []);

  const handleToggleVisibility = useCallback((photoId: string) => {
    setPhotos((items) =>
      items.map((item) =>
        item.id === photoId ? { ...item, is_visible: !item.is_visible } : item
      )
    );
    setHasChanges(true);
  }, []);

  const handleDelete = useCallback(async (photoId: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      await onDelete(photoId);
      setPhotos((items) =>
        items
          .filter((item) => item.id !== photoId)
          .map((item, index) => ({ ...item, sort_order: index }))
      );
    }
  }, [onDelete]);

  const handleUpdateCaption = useCallback(async (photoId: string, caption: string) => {
    setPhotos((items) =>
      items.map((item) =>
        item.id === photoId ? { ...item, caption: caption || null } : item
      )
    );
    
    try {
      await onUpdateCaption(photoId, caption);
    } catch (error) {
      console.error('Failed to update caption:', error);
    }
  }, [onUpdateCaption]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const updates: PhotoUpdate[] = photos.map((photo) => ({
      id: photo.id,
      sort_order: photo.sort_order,
      is_visible: photo.is_visible,
    }));

    try {
      await onSave(updates);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save photos:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const activePhoto = photos.find((p) => p.id === activeId);
  const visibleCount = photos.filter((p) => p.is_visible).length;
  const hiddenCount = photos.filter((p) => !p.is_visible).length;

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.statVisible}>
              <strong>{visibleCount}</strong> visible
            </div>
            <div className={styles.statHidden}>
              <strong>{hiddenCount}</strong> hidden
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructions}>
            <div className={styles.instructionItem}>
              <DragIcon />
              <span>Drag to reorder</span>
            </div>
            <div className={styles.instructionItem}>
              <EyeIcon />
              <span>Toggle visibility</span>
            </div>
            <div className={styles.instructionItem}>
              <EditIcon />
              <span>Edit caption</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.toolbarRight}>
          <button
            onClick={() => setShowUploader(!showUploader)}
            className={styles.uploadToggleButton}
            type="button"
          >
            <UploadIcon />
            Upload Photos
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`${styles.saveButton} ${hasChanges ? styles.saveButtonActive : ''}`}
            type="button"
          >
            {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Upload Section */}
      {showUploader && (
        <div className={styles.uploaderSection}>
          <PhotoUploader onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Photo Grid */}
      <div className={styles.gridWrapper}>
        {photos.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className={styles.grid}>
                {photos.map((photo) => (
                  <SortablePhotoItem
                    key={photo.id}
                    photo={photo}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDelete}
                    onUpdateCaption={handleUpdateCaption}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay adjustScale={false}>
              {activePhoto ? <PhotoDragOverlay photo={activePhoto} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className={styles.emptyState}>
            <PhotoUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function DragIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="15" cy="5" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="15" cy="19" r="1.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.474 5.408L18.592 7.526M17.836 3.672L12.109 9.399C11.779 9.729 11.539 10.138 11.412 10.587L10.5 14L13.913 13.088C14.362 12.961 14.771 12.721 15.101 12.391L20.828 6.664C21.391 6.101 21.391 5.193 20.828 4.63L19.87 3.672C19.307 3.109 18.399 3.109 17.836 3.672Z" />
      <path d="M19 15V18C19 19.1046 18.1046 20 17 20H6C4.89543 20 4 19.1046 4 18V7C4 5.89543 4.89543 5 6 5H9" />
    </svg>
  );
}