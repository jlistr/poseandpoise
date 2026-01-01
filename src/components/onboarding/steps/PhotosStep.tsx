'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { colors, fonts, type PortfolioPhoto, TEMPLATES } from '../types';

// ============================================================================
// Icons
// ============================================================================

const UploadIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const EyeIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const TrashIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const RefreshIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

// Photo Organizer Icon - Camera with magnifying glass and @ symbol
const PhotoOrganizerIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="12" width="32" height="24" rx="3" />
    <path d="M12 12V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
    <circle cx="20" cy="24" r="6" />
    <circle cx="20" cy="24" r="3" />
    {/* Magnifying glass */}
    <circle cx="38" cy="36" r="6" fill="#FAF9F7" stroke="currentColor" strokeWidth="2" />
    <path d="M42 40l4 4" strokeWidth="2.5" strokeLinecap="round" />
    {/* @ symbol inside magnifying glass */}
    <text x="38" y="39" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="bold">@</text>
  </svg>
);

const InfoIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const GripIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="8" cy="6" r="2" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="16" cy="12" r="2" />
    <circle cx="8" cy="18" r="2" />
    <circle cx="16" cy="18" r="2" />
  </svg>
);

// ============================================================================
// Sortable Photo Card Component
// ============================================================================

interface SortablePhotoCardProps {
  photo: PortfolioPhoto;
  index: number;
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  onRetry?: (id: string) => void;
}

function SortablePhotoCard({ photo, index, onToggleVisibility, onRemove, onUpdateCredit, onRetry }: SortablePhotoCardProps): React.JSX.Element {
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
    zIndex: isDragging ? 100 : 'auto',
  };

  const isUploading = photo.uploadStatus === 'uploading';
  const hasError = photo.uploadStatus === 'error';
  const isUploaded = photo.uploadStatus === 'uploaded';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: `1px solid ${hasError ? colors.error : isDragging ? colors.camel : colors.border}`,
        borderRadius: 0,
        overflow: 'hidden',
        backgroundColor: colors.white,
        boxShadow: isDragging ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {/* Image with overlays */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: colors.cream,
          overflow: 'hidden',
        }}
      >
        <img
          src={photo.url}
          alt="Portfolio"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: photo.visible ? 1 : 0.5,
          }}
        />

        {/* Top bar with drag handle and position */}
        <div
          {...attributes}
          {...listeners}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '0.5rem 0.75rem',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <GripIcon size={14} />
          <span style={{ 
            fontSize: '12px', 
            color: colors.white, 
            fontWeight: 500,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            #{index + 1}
          </span>
        </div>
        
        {/* Upload status overlay */}
        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: colors.white,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}
        
        {/* Actions overlay - top right */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            display: 'flex',
            gap: '0.35rem',
          }}
        >
          {/* Upload status indicator */}
          {isUploaded && (
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
              title="Uploaded"
            >
              <CheckIcon size={12} />
            </div>
          )}
          
          {hasError && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(photo.id)}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: colors.error,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
              title={`Upload failed: ${photo.uploadError || 'Unknown error'}. Click to retry.`}
            >
              <RefreshIcon size={12} />
            </button>
          )}
          
          <button
            type="button"
            onClick={() => onToggleVisibility(photo.id)}
            disabled={isUploading}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title={photo.visible ? 'Hide photo' : 'Show photo'}
          >
            {photo.visible ? <EyeIcon size={12} /> : <EyeOffIcon size={12} />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            disabled={isUploading}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.error,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="Remove photo"
          >
            <TrashIcon size={12} />
          </button>
        </div>
        
        {/* Hidden badge */}
        {!photo.visible && !hasError && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: colors.white,
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: 0,
            }}
          >
            Hidden
          </div>
        )}
        
        {/* Error badge */}
        {hasError && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '0.5rem 1rem',
              backgroundColor: colors.error,
              color: colors.white,
              fontSize: '11px',
              fontWeight: 500,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertIcon size={14} />
            Upload failed
          </div>
        )}

        {/* Credits Overlay - Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)',
            padding: '2rem 0.75rem 0.75rem',
          }}
        >
          {/* Photographer */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Photographer
            </label>
            <input
              type="text"
              placeholder="Add photographer..."
              value={photo.photographer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateCredit(photo.id, 'photographer', e.target.value)}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.35rem 0',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.white,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                outline: 'none',
                opacity: isUploading ? 0.5 : 1,
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = colors.camel;
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)';
              }}
            />
          </div>

          {/* Studio */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Studio
            </label>
            <input
              type="text"
              placeholder="Add studio..."
              value={photo.studio}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateCredit(photo.id, 'studio', e.target.value)}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.35rem 0',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.white,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                outline: 'none',
                opacity: isUploading ? 0.5 : 1,
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = colors.camel;
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Photo card for drag overlay
function PhotoCardOverlay({ photo }: { photo: PortfolioPhoto }): React.JSX.Element {
  return (
    <div
      style={{
        width: '180px',
        backgroundColor: colors.white,
        borderRadius: 0,
        boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        transform: 'rotate(3deg)',
        border: `2px solid ${colors.camel}`,
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={photo.url}
          alt="Dragging"
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            aspectRatio: '3/4',
            objectFit: 'cover',
          }}
        />
        {/* Credits overlay on drag preview */}
        {(photo.photographer || photo.studio) && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              padding: '1.5rem 0.5rem 0.5rem',
            }}
          >
            {photo.photographer && (
              <p style={{ 
                margin: 0, 
                fontSize: '11px', 
                color: colors.white,
                fontWeight: 500,
              }}>
                📷 {photo.photographer}
              </p>
            )}
            {photo.studio && (
              <p style={{ 
                margin: '0.15rem 0 0', 
                fontSize: '10px', 
                color: 'rgba(255,255,255,0.8)',
              }}>
                📍 {photo.studio}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface PhotosStepProps {
  photos: PortfolioPhoto[];
  onAddPhotos: (files: FileList) => void;
  onToggleVisibility: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onReorderPhotos: (oldIndex: number, newIndex: number) => void;
  onUpdateCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  onRetryUpload?: (id: string) => void;
  selectedTemplate: string;
  modelName?: string;
  isUploading?: boolean;
  uploadProgress?: { uploaded: number; total: number };
}

// Types for AI detection
interface PhotoCredit {
  photographer?: string | null;
  studio?: string | null;
  instagram?: string | null;
  confidence?: 'high' | 'medium' | 'low';
  reasoning?: string;
}

interface AIDetectionResult {
  success: boolean;
  message: string;
  credits: PhotoCredit[];
}

export function PhotosStep({
  photos,
  onAddPhotos,
  onToggleVisibility,
  onRemovePhoto,
  onReorderPhotos,
  onUpdateCredit,
  onRetryUpload,
  selectedTemplate,
  modelName = '',
  isUploading = false,
  uploadProgress = { uploaded: 0, total: 0 },
}: PhotosStepProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiDetectionInputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const template = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[1];
  
  // AI Detection state
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionPhotos, setDetectionPhotos] = useState<string[]>([]);
  const [detectionResult, setDetectionResult] = useState<AIDetectionResult | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

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
        onReorderPhotos(oldIndex, newIndex);
      }
    }
  }, [photos, onReorderPhotos]);

  const activePhoto = photos.find(p => p.id === activeId);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddPhotos(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  // AI Detection handlers
  const handleAIDetectionClick = () => {
    aiDetectionInputRef.current?.click();
  };

  const handleAIDetectionFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    e.target.value = ''; // Reset input
    
    // Validate and limit files
    const validFiles = files
      .filter(f => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type))
      .filter(f => f.size <= 10 * 1024 * 1024)
      .slice(0, 10);
    
    if (validFiles.length === 0) {
      alert('Please upload valid image files (JPEG, PNG, WebP, GIF) under 10MB.');
      return;
    }
    
    // Create preview URLs
    const previewUrls = validFiles.map(f => URL.createObjectURL(f));
    setDetectionPhotos(previewUrls);
    setDetectionResult(null);
    setIsDetecting(true);
    setShowAIPanel(true);
    
    try {
      // Convert to base64
      const base64Images = await Promise.all(
        validFiles.map(file => 
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        )
      );
      
      // Call AI API
      const response = await fetch('/api/onboarding/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze these ${base64Images.length} portfolio photos to detect photographer and studio credits. Look for watermarks, signatures, logos, and any visible text that indicates the photographer or studio name.`,
          step: 'photos',
          tool: 'photo-organizer',
          images: base64Images,
        }),
      });
      
      const result = await response.json();
      
      if (result.extractedData?.photos && result.extractedData.photos.length > 0) {
        setDetectionResult({
          success: true,
          message: result.message || `Found potential credits in ${result.extractedData.photos.filter((p: PhotoCredit) => p.photographer || p.studio).length} of ${base64Images.length} photos.`,
          credits: result.extractedData.photos,
        });
      } else {
        setDetectionResult({
          success: false,
          message: result.message || "I couldn't detect any photographer watermarks or studio logos in these photos. You can manually add credits to each photo below.",
          credits: [],
        });
      }
    } catch (error) {
      console.error('AI detection error:', error);
      setDetectionResult({
        success: false,
        message: "I had trouble analyzing these photos. Please try again or add credits manually.",
        credits: [],
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const clearAIDetection = () => {
    detectionPhotos.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setDetectionPhotos([]);
    setDetectionResult(null);
    setShowAIPanel(false);
  };

  return (
    <>
      {/* Hidden file input for AI detection */}
      <input
        ref={aiDetectionInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleAIDetectionFileChange}
        style={{ display: 'none' }}
      />

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
        Your Portfolio Photos
      </h1>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '2rem' }}>
        Upload your best work. High-quality images make a strong first impression.
      </p>

      {/* AI Detection Tool */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <SparklesIcon size={14} />
          <span style={{ 
            fontSize: '11px', 
            letterSpacing: '0.15em', 
            color: colors.camel,
            fontFamily: fonts.body,
            textTransform: 'uppercase',
          }}>
            AI-POWERED CREDITS DETECTION
          </span>
        </div>
        
        {!showAIPanel ? (
          <button
            type="button"
            onClick={handleAIDetectionClick}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              backgroundColor: colors.cream,
              border: `1px solid ${colors.border}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.camel;
              e.currentTarget.style.backgroundColor = 'rgba(196, 164, 132, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.backgroundColor = colors.cream;
            }}
          >
            <div style={{ color: colors.camel }}>
              <PhotoOrganizerIcon size={32} />
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                fontWeight: 500, 
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}>
                Detect Photographers & Studios
              </p>
              <p style={{ 
                margin: '0.25rem 0 0', 
                fontSize: '12px', 
                color: colors.textMuted,
                fontFamily: fonts.body,
              }}>
                AI scans your photos for watermarks, signatures, and studio logos to auto-credit photographers
              </p>
            </div>
            <div style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: colors.camel,
              color: colors.white,
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: fonts.body,
            }}>
              NEW
            </div>
          </button>
        ) : (
          <div style={{
            padding: '1.25rem',
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
          }}>
            {/* Header with close button */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhotoOrganizerIcon size={20} />
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                }}>
                  AI Credits Detection
                </span>
              </div>
              <button
                type="button"
                onClick={clearAIDetection}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '11px',
                  backgroundColor: 'transparent',
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                }}
              >
                Close
              </button>
            </div>
            
            {/* Photo previews */}
            {detectionPhotos.length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}>
                {detectionPhotos.slice(0, 6).map((url, idx) => (
                  <div key={idx} style={{ 
                    width: '60px', 
                    height: '60px', 
                    overflow: 'hidden',
                    border: `1px solid ${colors.border}`,
                  }}>
                    <img 
                      src={url} 
                      alt={`Detection ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                ))}
                {detectionPhotos.length > 6 && (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: colors.cream,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: colors.textMuted,
                    fontFamily: fonts.body,
                  }}>
                    +{detectionPhotos.length - 6}
                  </div>
                )}
              </div>
            )}
            
            {/* Loading state */}
            {isDetecting && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: colors.cream,
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${colors.border}`,
                  borderTopColor: colors.camel,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <span style={{ 
                  fontSize: '13px', 
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}>
                  Scanning {detectionPhotos.length} photo(s) for watermarks and signatures...
                </span>
              </div>
            )}
            
            {/* Results */}
            {detectionResult && !isDetecting && (
              <div>
                <p style={{ 
                  fontSize: '13px', 
                  color: detectionResult.success ? colors.textPrimary : colors.textSecondary,
                  marginBottom: '1rem',
                  fontFamily: fonts.body,
                }}>
                  {detectionResult.message}
                </p>
                
                {detectionResult.success && detectionResult.credits.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}>
                    {detectionResult.credits.map((credit, idx) => (
                      (credit.photographer || credit.studio || credit.instagram) && (
                        <div key={idx} style={{
                          padding: '0.75rem',
                          backgroundColor: colors.cream,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                        }}>
                          {detectionPhotos[idx] && (
                            <div style={{ 
                              width: '50px', 
                              height: '50px', 
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}>
                              <img 
                                src={detectionPhotos[idx]} 
                                alt={`Photo ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              marginBottom: '0.25rem',
                            }}>
                              <span style={{ 
                                fontSize: '12px', 
                                fontWeight: 500,
                                color: colors.textPrimary,
                                fontFamily: fonts.body,
                              }}>
                                Photo {idx + 1}
                              </span>
                              {credit.confidence && (
                                <span style={{
                                  fontSize: '9px',
                                  padding: '2px 6px',
                                  backgroundColor: credit.confidence === 'high' ? '#4CAF50' : 
                                                   credit.confidence === 'medium' ? '#FF9800' : '#9E9E9E',
                                  color: colors.white,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  fontFamily: fonts.body,
                                }}>
                                  {credit.confidence}
                                </span>
                              )}
                            </div>
                            {credit.photographer && (
                              <p style={{ 
                                margin: 0, 
                                fontSize: '12px',
                                color: colors.textSecondary,
                                fontFamily: fonts.body,
                              }}>
                                📷 <strong>Photographer:</strong> {credit.photographer}
                              </p>
                            )}
                            {credit.studio && (
                              <p style={{ 
                                margin: '0.15rem 0 0', 
                                fontSize: '12px',
                                color: colors.textSecondary,
                                fontFamily: fonts.body,
                              }}>
                                📍 <strong>Studio:</strong> {credit.studio}
                              </p>
                            )}
                            {credit.instagram && (
                              <p style={{ 
                                margin: '0.15rem 0 0', 
                                fontSize: '12px',
                                color: colors.textSecondary,
                                fontFamily: fonts.body,
                              }}>
                                📱 <strong>Instagram:</strong> {credit.instagram}
                              </p>
                            )}
                            {credit.reasoning && (
                              <p style={{ 
                                margin: '0.25rem 0 0', 
                                fontSize: '11px',
                                color: colors.textMuted,
                                fontStyle: 'italic',
                                fontFamily: fonts.body,
                              }}>
                                {credit.reasoning}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleAIDetectionClick}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: colors.charcoal,
                      color: colors.white,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: fonts.body,
                    }}
                  >
                    Scan More Photos
                  </button>
                  <button
                    type="button"
                    onClick={clearAIDetection}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '12px',
                      backgroundColor: 'transparent',
                      color: colors.textMuted,
                      border: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      fontFamily: fonts.body,
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
            
            {/* Empty state - prompt to upload */}
            {detectionPhotos.length === 0 && !isDetecting && !detectionResult && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ 
                  fontSize: '13px', 
                  color: colors.textMuted,
                  margin: '0 0 1rem',
                  fontFamily: fonts.body,
                }}>
                  Upload photos to scan for photographer credits
                </p>
                <button
                  type="button"
                  onClick={handleAIDetectionClick}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: colors.camel,
                    color: colors.white,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: fonts.body,
                  }}
                >
                  Select Photos to Scan
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Info tip */}
        <div style={{ 
          marginTop: '0.75rem', 
          padding: '0.75rem', 
          backgroundColor: 'rgba(196, 164, 132, 0.08)', 
          border: '1px solid rgba(196, 164, 132, 0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
        }}>
          <InfoIcon size={14} />
          <p style={{ 
            margin: 0, 
            fontSize: '11px', 
            color: colors.textSecondary,
            fontFamily: fonts.body,
            lineHeight: 1.5,
          }}>
            AI looks for watermarks, signatures, and logos in your photos. Detection works best with clear, high-resolution images. You can always manually add or edit credits on each photo.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onClick={handleUploadClick}
        onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
        role="button"
        tabIndex={0}
        style={{
          border: `2px dashed ${colors.border}`,
          borderRadius: 0,
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: colors.cream,
          transition: 'border-color 0.2s',
          marginBottom: '2rem',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.camel)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: colors.camel,
          }}
        >
          <UploadIcon size={24} />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, margin: 0 }}>
          Click to upload or drag and drop
        </p>
        <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0.5rem 0 0' }}>
          JPEG, PNG, or WebP up to 10MB each
        </p>
      </div>

      {/* Upload Progress */}
      {photos.length > 0 && isUploading && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: colors.cream,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: `2px solid ${colors.border}`,
              borderTopColor: colors.camel,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '13px', color: colors.textSecondary }}>
            Uploading photos... {uploadProgress.uploaded} of {uploadProgress.total} complete
          </span>
        </div>
      )}

      {/* Photos Grid with Drag & Drop */}
      {photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              {photos.map((photo, index) => (
                <SortablePhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onToggleVisibility={onToggleVisibility}
                  onRemove={onRemovePhoto}
                  onUpdateCredit={onUpdateCredit}
                  onRetry={onRetryUpload}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activePhoto && <PhotoCardOverlay photo={activePhoto} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* Preview */}
      {photos.length > 0 && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: template.bgColor,
            borderRadius: 0,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: template.textColor,
              opacity: 0.6,
              marginBottom: '0.75rem',
            }}
          >
            PORTFOLIO PREVIEW
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {photos
              .filter((p) => p.visible)
              .slice(0, 5)
              .map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    width: '80px',
                    height: '100px',
                    borderRadius: 0,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={photo.url}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            {photos.filter((p) => p.visible).length > 5 && (
              <div
                style={{
                  width: '80px',
                  height: '100px',
                  borderRadius: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                +{photos.filter((p) => p.visible).length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: colors.textMuted,
          }}
        >
          <p style={{ fontSize: '14px', margin: 0 }}>No photos uploaded yet</p>
          <p style={{ fontSize: '12px', margin: '0.5rem 0 0' }}>
            Upload at least 3-5 photos to create a compelling portfolio
          </p>
        </div>
      )}

      {/* Drag hint */}
      {photos.length > 1 && (
        <p
          style={{
            fontSize: '12px',
            color: colors.textMuted,
            textAlign: 'center',
            marginTop: '0.5rem',
          }}
        >
          Drag photos to reorder them in your portfolio
        </p>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

