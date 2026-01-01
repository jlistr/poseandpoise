'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Photo } from '@/types/photo';
import styles from './SortablePhotoItem.module.css';

interface SortablePhotoItemProps {
  photo: Photo;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
}

export function SortablePhotoItem({
  photo,
  onToggleVisibility,
  onDelete,
  onUpdateCaption,
}: SortablePhotoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [captionValue, setCaptionValue] = useState(photo.caption || '');
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setCaptionValue(photo.caption || '');
    setIsEditing(true);
  };

  const handleSaveCaption = () => {
    onUpdateCaption(photo.id, captionValue.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setCaptionValue(photo.caption || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveCaption();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${!photo.is_visible ? styles.cardHidden : ''}`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
      >
        <DragIcon />
      </button>

      {/* Sort Order Badge */}
      <div className={styles.sortBadge}>
        #{photo.sort_order + 1}
      </div>

      {/* Analytics Badge */}
      {(photo.view_count !== undefined || photo.click_count !== undefined) && (
        <div className={styles.analyticsBadge}>
          <span title="Views">
            <ViewIcon size={12} />
            {photo.view_count ?? 0}
          </span>
          <span title="Clicks">
            <ClickIcon size={12} />
            {photo.click_count ?? 0}
          </span>
        </div>
      )}

      {/* Photo Image */}
      <div className={`${styles.imageWrapper} ${!photo.is_visible ? styles.imageHidden : ''}`}>
        <img
          src={photo.thumbnail_url || photo.url}
          alt={photo.caption || 'Portfolio photo'}
          className={styles.image}
        />
        
        {/* Hidden Overlay */}
        {!photo.is_visible && (
          <div className={styles.hiddenOverlay}>
            <EyeOffIcon size={32} />
          </div>
        )}
      </div>

      {/* Photo Controls */}
      <div className={styles.controls}>
        {/* Caption Display/Edit */}
        <div className={styles.captionWrapper}>
          {isEditing ? (
            <div className={styles.captionEditRow}>
              <input
                ref={inputRef}
                type="text"
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter caption..."
                className={styles.captionInput}
              />
              <button
                type="button"
                onClick={handleSaveCaption}
                className={styles.captionSaveButton}
                title="Save"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className={styles.captionCancelButton}
                title="Cancel"
              >
                <CloseIcon />
              </button>
            </div>
          ) : (
            <div className={styles.captionDisplayRow}>
              <p className={styles.caption}>
                {photo.caption || <span className={styles.captionPlaceholder}>No caption</span>}
              </p>
              <button
                type="button"
                onClick={handleEditClick}
                className={styles.editButton}
                title="Edit caption"
              >
                <EditIcon />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={() => onToggleVisibility(photo.id)}
            className={`${styles.visibilityButton} ${photo.is_visible ? styles.visibilityButtonActive : ''}`}
          >
            {photo.is_visible ? (
              <>
                <EyeIcon />
                Visible
              </>
            ) : (
              <>
                <EyeOffIcon />
                Hidden
              </>
            )}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(photo.id)}
            className={styles.deleteButton}
            title="Delete photo"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// Drag Overlay version (shown while dragging)
export function PhotoDragOverlay({ photo }: { photo: Photo }) {
  return (
    <div className={styles.dragOverlay}>
      <div className={styles.dragOverlayImage}>
        <img
          src={photo.thumbnail_url || photo.url}
          alt={photo.caption || 'Portfolio photo'}
          className={styles.image}
        />
      </div>
    </div>
  );
}

// SVG Icons
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

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.474 5.408L18.592 7.526M17.836 3.672L12.109 9.399C11.779 9.729 11.539 10.138 11.412 10.587L10.5 14L13.913 13.088C14.362 12.961 14.771 12.721 15.101 12.391L20.828 6.664C21.391 6.101 21.391 5.193 20.828 4.63L19.87 3.672C19.307 3.109 18.399 3.109 17.836 3.672Z" />
      <path d="M19 15V18C19 19.1046 18.1046 20 17 20H6C4.89543 20 4 19.1046 4 18V7C4 5.89543 4.89543 5 6 5H9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function EyeOffIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function ViewIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ClickIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 15l-2 5L9 9l11 4-5 2z" />
      <path d="M22 22l-5-5" />
    </svg>
  );
}