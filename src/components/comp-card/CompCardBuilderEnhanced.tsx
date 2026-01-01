"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createCompCard, deleteCompCard, type CompCard } from "@/app/actions/comp-card";
import { uploadCompCardPdf, uploadCompCardImage } from "@/app/actions/comp-card-pdf";
import { CompCardPreview } from "./CompCardPreview";
import { CompCardFront } from "./CompCardFront";
import { CompCardBack } from "./CompCardBack";
import type { Profile } from "@/app/actions/profile";
import type { Photo } from "@/app/actions/photos";
import { colors, typography, spacing } from "@/styles/tokens";
import Link from "next/link";

// =============================================================================
// Photo Picker Modal Component
// =============================================================================

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  selectedIds: string[];
  onSelect: (photoId: string) => void;
  mode: 'single' | 'multiple';
  maxSelections?: number;
  title: string;
  excludeIds?: string[];
}

function PhotoPickerModal({
  isOpen,
  onClose,
  photos,
  selectedIds,
  onSelect,
  mode,
  maxSelections = 5,
  title,
  excludeIds = [],
}: PhotoPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PHOTOS_PER_PAGE = 20;

  // Filter and paginate photos
  const filteredPhotos = useMemo(() => {
    let result = photos;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.caption?.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }
    return result;
  }, [photos, searchQuery]);

  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE);
  const paginatedPhotos = filteredPhotos.slice(
    (currentPage - 1) * PHOTOS_PER_PAGE,
    currentPage * PHOTOS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (!isOpen) return null;

  const canSelectMore = mode === 'single' || selectedIds.length < maxSelections;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.cream,
          width: '90%',
          maxWidth: '800px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border.light}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: typography.fontFamily.display,
                fontSize: '20px',
                fontWeight: typography.fontWeight.regular,
                color: colors.charcoal,
                margin: 0,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                margin: '4px 0 0 0',
              }}
            >
              {filteredPhotos.length} photos available
              {mode === 'multiple' && ` • ${selectedIds.length}/${maxSelections} selected`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: colors.text.muted,
              fontSize: '24px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border.subtle}` }}>
          <input
            type="text"
            placeholder="Search by caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.body,
              border: `1px solid ${colors.border.light}`,
              background: colors.white,
              outline: 'none',
            }}
          />
        </div>

        {/* Photo Grid */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px 24px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
            }}
          >
            {paginatedPhotos.map((photo) => {
              const isSelected = selectedIds.includes(photo.id);
              const isExcluded = excludeIds.includes(photo.id);
              const selectionIndex = selectedIds.indexOf(photo.id);
              const canSelect = !isExcluded && (isSelected || canSelectMore);

              return (
                <div
                  key={photo.id}
                  onClick={() => canSelect && onSelect(photo.id)}
                  style={{
                    aspectRatio: '3 / 4',
                    position: 'relative',
                    cursor: canSelect ? 'pointer' : 'not-allowed',
                    border: isSelected
                      ? `3px solid ${colors.camel}`
                      : `1px solid ${colors.border.subtle}`,
                    overflow: 'hidden',
                    opacity: isExcluded ? 0.3 : (!canSelect ? 0.5 : 1),
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img
                    src={photo.thumbnail_url || photo.url}
                    alt={photo.caption || ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isSelected && mode === 'single' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: colors.camel,
                        color: colors.cream,
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                      }}
                    >
                      Selected
                    </div>
                  )}
                  {isSelected && mode === 'multiple' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: colors.camel,
                        color: colors.cream,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {selectionIndex + 1}
                    </div>
                  )}
                  {isExcluded && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.cream,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                      }}
                    >
                      In Use
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {paginatedPhotos.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: colors.text.muted,
                fontFamily: typography.fontFamily.body,
              }}
            >
              No photos found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                background: currentPage === 1 ? colors.background.card : colors.charcoal,
                color: currentPage === 1 ? colors.text.muted : colors.cream,
                border: 'none',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
              }}
            >
              Previous
            </button>
            <span
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.secondary,
                padding: '0 12px',
              }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                background: currentPage === totalPages ? colors.background.card : colors.charcoal,
                color: currentPage === totalPages ? colors.text.muted : colors.cream,
                border: 'none',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${colors.border.light}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: colors.charcoal,
              color: colors.cream,
              border: 'none',
              cursor: 'pointer',
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Info Icon SVG Component
function InfoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// Tooltip Component
function InfoTooltip({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        style={{
          background: "transparent",
          border: "none",
          cursor: "help",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.text.muted,
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = colors.camel)}
        onMouseLeave={(e) => (e.currentTarget.style.color = colors.text.muted)}
        aria-label="More information"
      >
        <InfoIcon size={18} />
      </button>
      {isVisible && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            padding: spacing.padding.md,
            background: colors.charcoal,
            color: colors.cream,
            borderRadius: "4px",
            width: "320px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            zIndex: 100,
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            lineHeight: "1.5",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: `6px solid ${colors.charcoal}`,
            }}
          />
          {children}
        </div>
      )}
    </div>
  );
}

type CardMode = "simple" | "branded" | "upload";
type PreviewSide = "front" | "back";

interface ExtendedProfile extends Profile {
  agency_logo_url: string | null;
  agency_email: string | null;
  agency_phone: string | null;
  agency_instagram: string | null;
}

interface CompCardBuilderProps {
  profile: ExtendedProfile;
  photos: Photo[];
  existingCompCards: CompCard[];
  onUpdate?: () => void;
}

export function CompCardBuilder({ profile, photos, existingCompCards, onUpdate }: CompCardBuilderProps) {
  // Mode and view state
  const [cardMode, setCardMode] = useState<CardMode>("simple");
  const [previewSide, setPreviewSide] = useState<PreviewSide>("front");
  
  // Simple mode state
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  
  // Branded mode state
  const [headshotId, setHeadshotId] = useState<string | null>(null);
  const [backPhotoIds, setBackPhotoIds] = useState<string[]>([]);
  
  // Upload mode state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  
  // Common state
  const [cardName, setCardName] = useState("My Comp Card");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [viewingCardId, setViewingCardId] = useState<string | null>(null);
  
  // Photo picker modal state
  const [showHeadshotPicker, setShowHeadshotPicker] = useState(false);
  const [showBackPhotosPicker, setShowBackPhotosPicker] = useState(false);
  const [showSimplePhotoPicker, setShowSimplePhotoPicker] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialLoadRef = useRef(true);

  // Auto-select most recent comp card on initial load
  useEffect(() => {
    if (initialLoadRef.current && existingCompCards.length > 0) {
      initialLoadRef.current = false;
      const mostRecent = existingCompCards[0];
      const cardType = (mostRecent as CompCard & { card_type?: string })?.card_type;
      
      setViewingCardId(mostRecent.id);
      
      // Set mode based on card type
      if (cardType === "branded") {
        setCardMode("branded");
        setPreviewSide("front");
      } else if (cardType === "uploaded") {
        setCardMode("upload");
      } else {
        setCardMode("simple");
      }
    }
  }, [existingCompCards]);

  // Derived data
  const selectedPhotos = selectedPhotoIds
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is Photo => p !== undefined);
    
  const headshotPhoto = headshotId ? photos.find((p) => p.id === headshotId) || null : null;
  
  const backPhotos = backPhotoIds
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is Photo => p !== undefined);

  // Get the viewing card and its type
  const viewingCard = viewingCardId ? existingCompCards.find((c) => c.id === viewingCardId) : null;
  const viewingCardType = (viewingCard as CompCard & { card_type?: string })?.card_type;

  // Profile with agency info (agency details come from profile)
  const profileWithLogo: ExtendedProfile = {
    ...profile,
    agency_logo_url: profile.agency_logo_url,
    agency_email: profile.agency_email,
    agency_phone: profile.agency_phone,
    agency_instagram: profile.agency_instagram,
  };

  const getPreviewPhotos = (): Photo[] => {
    if (viewingCardId && viewingCard) {
      return viewingCard.photo_ids
        .map((id) => photos.find((p) => p.id === id))
        .filter((p): p is Photo => p !== undefined);
    }
    return selectedPhotos;
  };

  const previewPhotos = getPreviewPhotos();

  // Get headshot and back photos for viewing a branded card
  const getViewingBrandedPhotos = () => {
    if (viewingCardId && viewingCard && viewingCardType === "branded") {
      const allPhotos = viewingCard.photo_ids
        .map((id) => photos.find((p) => p.id === id))
        .filter((p): p is Photo => p !== undefined);
      return {
        headshot: allPhotos[0] || null,
        backPhotos: allPhotos.slice(1),
      };
    }
    return { headshot: headshotPhoto, backPhotos };
  };

  const viewingBrandedPhotos = getViewingBrandedPhotos();

  // Handlers
  const handleModeChange = (mode: CardMode) => {
    setCardMode(mode);
    setViewingCardId(null);
    setMessage(null);
    if (mode === "branded") {
      setPreviewSide("front");
    }
  };

  const toggleSimplePhoto = (photoId: string) => {
    setViewingCardId(null);
    setSelectedPhotoIds((prev) => {
      if (prev.includes(photoId)) return prev.filter((id) => id !== photoId);
      if (prev.length >= 5) return prev;
      return [...prev, photoId];
    });
  };

  const selectHeadshot = (photoId: string) => {
    setViewingCardId(null);
    setHeadshotId(photoId === headshotId ? null : photoId);
  };

  const toggleBackPhoto = (photoId: string) => {
    setViewingCardId(null);
    if (photoId === headshotId) return;
    setBackPhotoIds((prev) => {
      if (prev.includes(photoId)) return prev.filter((id) => id !== photoId);
      if (prev.length >= 5) return prev;
      return [...prev, photoId];
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Please upload a JPEG, PNG, WebP, or PDF file" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "File too large. Maximum size is 10MB." });
      return;
    }

    setUploadedFile(file);
    
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    
    setMessage(null);
  };

  const handleViewSavedCard = (cardId: string) => {
    const card = existingCompCards.find((c) => c.id === cardId);
    const cardType = (card as CompCard & { card_type?: string })?.card_type;
    
    setViewingCardId(cardId);
    setSelectedPhotoIds([]);
    setHeadshotId(null);
    setBackPhotoIds([]);
    setMessage(null);
    
    // Set mode based on card type for proper preview
    if (cardType === "branded") {
      setCardMode("branded");
      setPreviewSide("front");
    } else if (cardType === "uploaded") {
      setCardMode("upload");
    } else {
      setCardMode("simple");
    }
  };

  const handleStartNew = () => {
    setViewingCardId(null);
    setSelectedPhotoIds([]);
    setHeadshotId(null);
    setBackPhotoIds([]);
    setUploadedFile(null);
    setUploadPreview(null);
    setCardName("My Comp Card");
    setMessage(null);
  };

  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const generatePdf = async (elementId: string): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    try {
      const images = element.querySelectorAll("img");
      const originalSrcs: string[] = [];
      
      for (const img of Array.from(images)) {
        originalSrcs.push(img.src);
        try {
          const base64 = await imageToBase64(img.src);
          img.src = base64;
        } catch (e) {
          console.error("Failed to convert image:", e);
        }
      }

      await Promise.all(
        Array.from(images).map(
          (img) => new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FAF9F7",
        logging: false,
      } as Parameters<typeof html2canvas>[1]);

      Array.from(images).forEach((img, index) => {
        img.src = originalSrcs[index];
      });

      // 5.5" x 8.5" at 72 DPI
      const width = 5.5 * 25.4;
      const height = 8.5 * 25.4;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [width, height],
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, width, height);

      return pdf.output("blob");
    } catch (error) {
      console.error("PDF generation error:", error);
      return null;
    }
  };

  const generateBrandedPdf = async (): Promise<Blob | null> => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const width = 5.5 * 25.4;
      const height = 8.5 * 25.4;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [width, height],
      });

      // Ensure we're on front side
      setPreviewSide("front");
      await new Promise((r) => setTimeout(r, 200));

      // Generate front
      const frontElement = document.getElementById("comp-card-front");
      if (frontElement) {
        const images = frontElement.querySelectorAll("img");
        const originalSrcs: string[] = [];
        for (const img of Array.from(images)) {
          originalSrcs.push(img.src);
          try { img.src = await imageToBase64(img.src); } catch {}
        }
        await new Promise((r) => setTimeout(r, 100));
        
        const frontCanvas = await html2canvas(frontElement, {
          scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#FAF9F7", logging: false,
        } as Parameters<typeof html2canvas>[1]);
        
        Array.from(images).forEach((img, i) => { img.src = originalSrcs[i]; });
        
        const frontImg = frontCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(frontImg, "JPEG", 0, 0, width, height);
      }

      // Generate back
      setPreviewSide("back");
      await new Promise((r) => setTimeout(r, 200));

      const backElement = document.getElementById("comp-card-back");
      if (backElement) {
        pdf.addPage([width, height], "portrait");
        
        const images = backElement.querySelectorAll("img");
        const originalSrcs: string[] = [];
        for (const img of Array.from(images)) {
          originalSrcs.push(img.src);
          try { img.src = await imageToBase64(img.src); } catch {}
        }
        await new Promise((r) => setTimeout(r, 100));
        
        const backCanvas = await html2canvas(backElement, {
          scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#FAF9F7", logging: false,
        } as Parameters<typeof html2canvas>[1]);
        
        Array.from(images).forEach((img, i) => { img.src = originalSrcs[i]; });
        
        const backImg = backCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(backImg, "JPEG", 0, 0, width, height);
      }

      setPreviewSide("front");
      return pdf.output("blob");
    } catch (error) {
      console.error("PDF generation error:", error);
      return null;
    }
  };

  // Generate a preview image of the comp card (front side only) for portfolio display
  const generatePreviewImage = async (elementId: string): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    try {
      const html2canvas = (await import("html2canvas")).default;
      
      const images = element.querySelectorAll("img");
      const originalSrcs: string[] = [];
      
      for (const img of Array.from(images)) {
        originalSrcs.push(img.src);
        try {
          const base64 = await imageToBase64(img.src);
          img.src = base64;
        } catch (e) {
          console.error("Failed to convert image:", e);
        }
      }

      await Promise.all(
        Array.from(images).map(
          (img) => new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FAF9F7",
        logging: false,
      } as Parameters<typeof html2canvas>[1]);

      Array.from(images).forEach((img, index) => {
        img.src = originalSrcs[index];
      });

      // Convert canvas to blob
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          0.9
        );
      });
    } catch (error) {
      console.error("Image generation error:", error);
      return null;
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setGenerating(true);
    setMessage({ type: "success", text: "Generating comp card..." });

    let pdfBlob: Blob | null = null;
    let previewImageBlob: Blob | null = null;
    let photoIds: string[] = [];

    if (cardMode === "simple") {
      if (selectedPhotoIds.length === 0) {
        setLoading(false);
        setGenerating(false);
        setMessage({ type: "error", text: "Please select at least one photo" });
        return;
      }
      photoIds = selectedPhotoIds;
      // Generate both PDF and preview image
      pdfBlob = await generatePdf("comp-card-preview");
      previewImageBlob = await generatePreviewImage("comp-card-preview");
    } else if (cardMode === "branded") {
      if (!headshotId) {
        setLoading(false);
        setGenerating(false);
        setMessage({ type: "error", text: "Please select a headshot" });
        return;
      }
      photoIds = [headshotId, ...backPhotoIds];
      // Generate PDF (includes both sides)
      pdfBlob = await generateBrandedPdf();
      // Generate preview image (front side only)
      setPreviewSide("front");
      await new Promise((r) => setTimeout(r, 200));
      previewImageBlob = await generatePreviewImage("comp-card-front");
    } else if (cardMode === "upload") {
      if (!uploadedFile) {
        setLoading(false);
        setGenerating(false);
        setMessage({ type: "error", text: "Please upload a file" });
        return;
      }
      pdfBlob = uploadedFile.type === "application/pdf" 
        ? uploadedFile 
        : new Blob([uploadedFile], { type: uploadedFile.type });
      // For uploaded images, use the file itself as the preview
      if (uploadedFile.type.startsWith("image/")) {
        previewImageBlob = uploadedFile;
      }
    }

    setGenerating(false);

    if (!pdfBlob && cardMode !== "upload") {
      setLoading(false);
      setMessage({ type: "error", text: "Failed to generate PDF" });
      return;
    }

    setMessage({ type: "success", text: "Saving comp card..." });

    const result = await createCompCard(cardName, photoIds, cardMode);

    if (!result.success || !result.data) {
      setLoading(false);
      setMessage({ type: "error", text: result.message });
      return;
    }

    // Upload PDF
    if (pdfBlob) {
      const pdfResult = await uploadCompCardPdf(result.data.id, pdfBlob);
      if (!pdfResult.success) {
        setLoading(false);
        setMessage({ type: "error", text: pdfResult.message });
        return;
      }
    }

    // Upload preview image for portfolio display
    if (previewImageBlob) {
      const imageResult = await uploadCompCardImage(result.data.id, previewImageBlob);
      if (!imageResult.success) {
        console.warn("Failed to upload preview image:", imageResult.message);
        // Don't fail the whole operation, just log the warning
      }
    }

    setLoading(false);
    setMessage({ type: "success", text: "Comp card saved!" });
    handleStartNew();
    setViewingCardId(result.data.id);
    onUpdate?.();
  };

  const handleDownload = async () => {
    setGenerating(true);
    setMessage({ type: "success", text: "Generating PDF..." });

    let pdfBlob: Blob | null = null;
    let downloadName = viewingCard?.name || cardName;

    if (viewingCard) {
      const extCard = viewingCard as CompCard & { pdf_url?: string };
      if (extCard.pdf_url) {
        window.open(extCard.pdf_url, "_blank");
        setGenerating(false);
        setMessage(null);
        return;
      }
    }

    if (cardMode === "simple") {
      pdfBlob = await generatePdf("comp-card-preview");
    } else if (cardMode === "branded") {
      pdfBlob = await generateBrandedPdf();
    } else if (cardMode === "upload" && uploadedFile) {
      pdfBlob = uploadedFile.type === "application/pdf"
        ? uploadedFile
        : new Blob([uploadedFile], { type: uploadedFile.type });
    }

    setGenerating(false);

    if (!pdfBlob) {
      setMessage({ type: "error", text: "Nothing to download" });
      return;
    }

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    const ext = cardMode === "upload" && uploadedFile?.type.startsWith("image/") ? "jpg" : "pdf";
    link.download = `${downloadName.replace(/\s+/g, "-").toLowerCase()}-comp-card.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({ type: "success", text: "Downloaded!" });
  };

  const handleDelete = async (compCardId: string) => {
    if (!confirm("Delete this comp card?")) return;
    const result = await deleteCompCard(compCardId);
    if (result.success) {
      if (viewingCardId === compCardId) setViewingCardId(null);
      onUpdate?.();
    }
  };

  const handleViewPdf = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  const isCreatingNew = !viewingCardId;
  
  // Show front/back toggle for branded mode (both creating and viewing)
  const showFrontBackToggle = cardMode === "branded";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.gap["2xl"], alignItems: "start" }}>
      {/* Left: Builder */}
      <div>
        {/* Mode Selector */}
        <div style={{ marginBottom: spacing.padding.lg }}>
          <label style={{
            display: "block",
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.text.muted,
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: spacing.padding.sm,
          }}>
            Card Type
          </label>
          <div style={{ display: "flex", gap: spacing.gap.sm }}>
            {[
              { value: "simple", label: "Simple" },
              { value: "branded", label: "Agency Branded" },
              { value: "upload", label: "Upload Existing" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleModeChange(option.value as CardMode)}
                style={{
                  padding: `${spacing.padding.sm} ${spacing.padding.md}`,
                  background: cardMode === option.value ? colors.charcoal : "transparent",
                  color: cardMode === option.value ? colors.cream : colors.text.secondary,
                  border: `1px solid ${cardMode === option.value ? colors.charcoal : colors.border.light}`,
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agency Branded Info Panel */}
        {cardMode === "branded" && (
          <div
            style={{
              marginBottom: spacing.padding.lg,
              padding: spacing.padding.md,
              background: "rgba(196, 164, 132, 0.08)",
              border: `1px solid ${colors.accent.light}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.gap.sm }}>
              <div style={{ flexShrink: 0, marginTop: "2px" }}>
                <InfoIcon size={18} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    color: colors.text.secondary,
                    marginBottom: spacing.padding.sm,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  Industry Standard Comp Card (5.5" × 8.5")
                </p>
                <div
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    color: colors.text.muted,
                    lineHeight: "1.6",
                  }}
                >
                  <p style={{ marginBottom: "8px" }}>
                    <strong style={{ color: colors.text.secondary }}>Front:</strong> High-impact headshot with your name and agency logo in the bottom corner.
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    <strong style={{ color: colors.text.secondary }}>Back:</strong> 3-5 photos showing versatility (full-body, lifestyle, editorial), your stats, and agency contact details.
                  </p>
                </div>
                
                {/* Check if agency info is set */}
                {(!profileWithLogo.agency || !profileWithLogo.agency_logo_url) && (
                  <div
                    style={{
                      marginTop: spacing.padding.sm,
                      paddingTop: spacing.padding.sm,
                      borderTop: `1px solid ${colors.border.subtle}`,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.caption,
                        color: colors.camel,
                      }}
                    >
                      ⚠️ {!profileWithLogo.agency && !profileWithLogo.agency_logo_url 
                        ? "Agency name and logo not set." 
                        : !profileWithLogo.agency 
                        ? "Agency name not set." 
                        : "Agency logo not uploaded."}
                      {" "}
                      <Link
                        href="/dashboard/profile"
                        style={{
                          color: colors.camel,
                          textDecoration: "underline",
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        Update in Profile →
                      </Link>
                    </p>
                  </div>
                )}
                
                {profileWithLogo.agency && profileWithLogo.agency_logo_url && (
                  <div
                    style={{
                      marginTop: spacing.padding.sm,
                      paddingTop: spacing.padding.sm,
                      borderTop: `1px solid ${colors.border.subtle}`,
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.gap.sm,
                    }}
                  >
                    <img
                      src={profileWithLogo.agency_logo_url}
                      alt={profileWithLogo.agency}
                      style={{ height: "24px", width: "auto", maxWidth: "80px", objectFit: "contain" }}
                    />
                    <span
                      style={{
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.caption,
                        color: colors.text.secondary,
                      }}
                    >
                      {profileWithLogo.agency}
                    </span>
                    <Link
                      href="/dashboard/profile"
                      style={{
                        marginLeft: "auto",
                        fontFamily: typography.fontFamily.body,
                        fontSize: typography.fontSize.caption,
                        color: colors.text.muted,
                        textDecoration: "underline",
                      }}
                    >
                      Edit
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Card Name */}
        {isCreatingNew && (
          <div style={{ marginBottom: spacing.padding.lg }}>
            <label style={{
              display: "block",
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: spacing.padding.xs,
            }}>
              Card Name
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="My Comp Card"
              style={{
                background: "transparent",
                border: `1px solid ${colors.border.light}`,
                padding: "12px 16px",
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                width: "100%",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Mode-specific content */}
        {cardMode === "simple" && isCreatingNew && (
          <div style={{ marginBottom: spacing.padding.lg }}>
            <label style={{
              display: "block",
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: spacing.padding.sm,
            }}>
              Select Photos ({selectedPhotoIds.length}/4)
            </label>
            <div
              style={{
                padding: spacing.padding.md,
                background: colors.background.card,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              {selectedPhotoIds.length > 0 ? (
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  {selectedPhotoIds.map((photoId, index) => {
                    const photo = photos.find(p => p.id === photoId);
                    if (!photo) return null;
                    return (
                      <div
                        key={photoId}
                        style={{
                          width: "70px",
                          height: "88px",
                          position: "relative",
                          overflow: "hidden",
                          border: `2px solid ${colors.camel}`,
                        }}
                      >
                        <img
                          src={photo.thumbnail_url || photo.url}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: "2px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: colors.camel,
                            color: colors.cream,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSimplePhoto(photoId);
                          }}
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.6)",
                            color: colors.cream,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.bodySmall,
                    color: colors.text.muted,
                    marginBottom: "12px",
                  }}
                >
                  Select up to 4 photos for your simple comp card
                </p>
              )}
              <button
                onClick={() => setShowSimplePhotoPicker(true)}
                style={{
                  padding: "8px 16px",
                  background: selectedPhotoIds.length >= 4 ? colors.background.card : colors.charcoal,
                  color: selectedPhotoIds.length >= 4 ? colors.text.muted : colors.cream,
                  border: selectedPhotoIds.length >= 4 ? `1px solid ${colors.border.light}` : "none",
                  cursor: selectedPhotoIds.length >= 4 ? "not-allowed" : "pointer",
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.caption,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
                disabled={selectedPhotoIds.length >= 4}
              >
                {selectedPhotoIds.length === 0 ? "Browse Photos" : selectedPhotoIds.length >= 4 ? "Maximum Selected" : "Add More Photos"}
              </button>
            </div>
          </div>
        )}

        {cardMode === "branded" && isCreatingNew && (
          <>
            {/* Headshot Selection - Compact UI */}
            <div style={{ marginBottom: spacing.padding.lg }}>
              <label style={{
                display: "block",
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: spacing.padding.sm,
              }}>
                Front: Headshot
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.gap.md,
                  padding: spacing.padding.md,
                  background: colors.background.card,
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                {headshotPhoto ? (
                  <div
                    style={{
                      width: "80px",
                      height: "100px",
                      position: "relative",
                      overflow: "hidden",
                      border: `2px solid ${colors.camel}`,
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={headshotPhoto.thumbnail_url || headshotPhoto.url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "100px",
                      background: colors.background.primary,
                      border: `1px dashed ${colors.border.light}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "24px", color: colors.text.muted }}>+</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: headshotPhoto ? colors.text.primary : colors.text.muted,
                      marginBottom: "8px",
                    }}
                  >
                    {headshotPhoto ? "Headshot selected" : "No headshot selected"}
                  </p>
                  <button
                    onClick={() => setShowHeadshotPicker(true)}
                    style={{
                      padding: "8px 16px",
                      background: colors.charcoal,
                      color: colors.cream,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.caption,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {headshotPhoto ? "Change Photo" : "Browse Photos"}
                  </button>
                </div>
              </div>
            </div>

            {/* Back Photos Selection - Compact UI */}
            <div style={{ marginBottom: spacing.padding.lg }}>
              <label style={{
                display: "block",
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: spacing.padding.sm,
              }}>
                Back: Photos ({backPhotoIds.length}/5)
              </label>
              <div
                style={{
                  padding: spacing.padding.md,
                  background: colors.background.card,
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                {backPhotoIds.length > 0 ? (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    {backPhotoIds.map((photoId, index) => {
                      const photo = photos.find(p => p.id === photoId);
                      if (!photo) return null;
                      return (
                        <div
                          key={photoId}
                          style={{
                            width: "60px",
                            height: "75px",
                            position: "relative",
                            overflow: "hidden",
                            border: `2px solid ${colors.camel}`,
                          }}
                        >
                          <img
                            src={photo.thumbnail_url || photo.url}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "2px",
                              left: "2px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: colors.camel,
                              color: colors.cream,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: 600,
                            }}
                          >
                            {index + 1}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBackPhoto(photoId);
                            }}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "rgba(0,0,0,0.6)",
                              color: colors.cream,
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    style={{
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.bodySmall,
                      color: colors.text.muted,
                      marginBottom: "12px",
                    }}
                  >
                    Select 3-5 photos for the back of your comp card
                  </p>
                )}
                <button
                  onClick={() => setShowBackPhotosPicker(true)}
                  style={{
                    padding: "8px 16px",
                    background: backPhotoIds.length >= 5 ? colors.background.card : colors.charcoal,
                    color: backPhotoIds.length >= 5 ? colors.text.muted : colors.cream,
                    border: backPhotoIds.length >= 5 ? `1px solid ${colors.border.light}` : "none",
                    cursor: backPhotoIds.length >= 5 ? "not-allowed" : "pointer",
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.caption,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                  disabled={backPhotoIds.length >= 5}
                >
                  {backPhotoIds.length === 0 ? "Browse Photos" : backPhotoIds.length >= 5 ? "Maximum Selected" : "Add More Photos"}
                </button>
              </div>
            </div>
          </>
        )}

        {cardMode === "upload" && isCreatingNew && (
          <div style={{ marginBottom: spacing.padding.lg }}>
            <label style={{
              display: "block",
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: spacing.padding.sm,
            }}>
              Upload Existing Comp Card
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                padding: spacing.padding.lg,
                background: uploadedFile ? "rgba(196, 164, 132, 0.1)" : colors.background.card,
                border: `2px dashed ${uploadedFile ? colors.camel : colors.border.light}`,
                cursor: "pointer",
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.bodySmall,
                color: colors.text.secondary,
              }}
            >
              {uploadedFile ? `✓ ${uploadedFile.name}` : "Click to upload (JPEG, PNG, WebP, or PDF)"}
            </button>
          </div>
        )}

        {/* Viewing saved card indicator */}
        {viewingCardId && (
          <div style={{
            marginBottom: spacing.padding.lg,
            padding: spacing.padding.sm,
            background: "rgba(26, 26, 26, 0.03)",
            border: `1px solid ${colors.border.subtle}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodySmall, color: colors.text.secondary }}>
              Viewing: {viewingCard?.name || "Saved Card"}
              {viewingCardType && (
                <span style={{ marginLeft: "8px", fontSize: "10px", color: colors.text.muted }}>
                  ({viewingCardType})
                </span>
              )}
            </p>
            <button
              onClick={handleStartNew}
              style={{
                background: "transparent",
                border: "none",
                color: colors.camel,
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              + New Card
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: spacing.gap.sm, flexWrap: "wrap" }}>
          {isCreatingNew && (
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{
                background: colors.charcoal,
                color: colors.cream,
                border: "none",
                padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.button,
                letterSpacing: typography.letterSpacing.wider,
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? (generating ? "Generating..." : "Saving...") : "Save Comp Card"}
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={generating}
            style={{
              background: "transparent",
              color: colors.text.secondary,
              border: `1px solid ${colors.border.light}`,
              padding: `${spacing.padding.sm} ${spacing.padding.lg}`,
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.button,
              letterSpacing: typography.letterSpacing.wider,
              textTransform: "uppercase",
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.5 : 1,
            }}
          >
            {generating ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {message && (
          <p style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.bodySmall,
            color: message.type === "success" ? colors.camel : "#D64545",
            marginTop: spacing.padding.sm,
          }}>
            {message.text}
          </p>
        )}

        {/* Saved Comp Cards */}
        {existingCompCards.length > 0 && (
          <div style={{ marginTop: spacing.padding.xl }}>
            <h3 style={{
              fontFamily: typography.fontFamily.display,
              fontSize: typography.fontSize.cardH3,
              fontWeight: typography.fontWeight.regular,
              marginBottom: spacing.padding.md,
            }}>
              Saved Comp Cards
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.gap.sm }}>
              {existingCompCards.map((card) => {
                const isViewing = viewingCardId === card.id;
                const extCard = card as CompCard & { pdf_url?: string; card_type?: string };
                return (
                  <div
                    key={card.id}
                    onClick={() => handleViewSavedCard(card.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: spacing.padding.sm,
                      background: isViewing ? "rgba(196, 164, 132, 0.1)" : colors.background.card,
                      border: `1px solid ${isViewing ? colors.camel : colors.border.subtle}`,
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodySmall, color: colors.text.primary }}>
                        {card.name}
                        {extCard.card_type && extCard.card_type !== "generated" && (
                          <span style={{ marginLeft: "8px", fontSize: "10px", color: colors.text.muted, textTransform: "uppercase" }}>
                            ({extCard.card_type})
                          </span>
                        )}
                      </p>
                      <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.caption, color: colors.text.muted }}>
                        {card.photo_ids.length} photos
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                      {extCard.pdf_url && (
                        <button
                          onClick={() => handleViewPdf(extCard.pdf_url!)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px 8px" }}
                          title="View PDF"
                        >
                          📄
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(card.id)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px 8px" }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: Preview */}
      <div>
        {/* Flip control for branded mode - always show when in branded mode */}
        {showFrontBackToggle && (
          <div style={{ display: "flex", gap: spacing.gap.sm, marginBottom: spacing.padding.sm }}>
            <button
              onClick={() => setPreviewSide("front")}
              style={{
                padding: `${spacing.padding.xs} ${spacing.padding.sm}`,
                background: previewSide === "front" ? colors.charcoal : "transparent",
                color: previewSide === "front" ? colors.cream : colors.text.secondary,
                border: `1px solid ${previewSide === "front" ? colors.charcoal : colors.border.light}`,
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                cursor: "pointer",
              }}
            >
              Front
            </button>
            <button
              onClick={() => setPreviewSide("back")}
              style={{
                padding: `${spacing.padding.xs} ${spacing.padding.sm}`,
                background: previewSide === "back" ? colors.charcoal : "transparent",
                color: previewSide === "back" ? colors.cream : colors.text.secondary,
                border: `1px solid ${previewSide === "back" ? colors.charcoal : colors.border.light}`,
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.caption,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        )}

        <p style={{
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.caption,
          color: colors.text.muted,
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: spacing.padding.sm,
        }}>
          Preview {cardMode === "branded" && `— ${previewSide}`}
          {viewingCard && ` — ${viewingCard.name}`}
        </p>

        {/* Preview based on mode */}
        {cardMode === "simple" && (
          <CompCardPreview profile={profileWithLogo} photos={viewingCardId ? previewPhotos : selectedPhotos} />
        )}

        {cardMode === "branded" && (
          previewSide === "front" ? (
            <CompCardFront 
              profile={profileWithLogo} 
              headshot={viewingCardId ? viewingBrandedPhotos.headshot : headshotPhoto} 
            />
          ) : (
            <CompCardBack 
              profile={profileWithLogo} 
              photos={viewingCardId ? viewingBrandedPhotos.backPhotos : backPhotos} 
            />
          )
        )}

        {cardMode === "upload" && (
          uploadPreview ? (
            <div style={{
              width: "100%",
              maxWidth: "412px",
              aspectRatio: "5.5 / 8.5",
              background: colors.cream,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}>
              <img src={uploadPreview} alt="Uploaded comp card" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{
              width: "100%",
              maxWidth: "412px",
              aspectRatio: "5.5 / 8.5",
              background: colors.background.card,
              border: `1px dashed ${colors.border.light}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}>
              <p style={{ fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.body, color: colors.text.muted }}>
                {uploadedFile?.type === "application/pdf" ? "PDF uploaded (no preview)" : "Upload a comp card"}
              </p>
            </div>
          )
        )}
      </div>

      {/* Photo Picker Modals */}
      <PhotoPickerModal
        isOpen={showHeadshotPicker}
        onClose={() => setShowHeadshotPicker(false)}
        photos={photos}
        selectedIds={headshotId ? [headshotId] : []}
        onSelect={(photoId) => {
          selectHeadshot(photoId);
          setShowHeadshotPicker(false);
        }}
        mode="single"
        title="Select Headshot"
      />

      <PhotoPickerModal
        isOpen={showBackPhotosPicker}
        onClose={() => setShowBackPhotosPicker(false)}
        photos={photos}
        selectedIds={backPhotoIds}
        onSelect={toggleBackPhoto}
        mode="multiple"
        maxSelections={5}
        title="Select Back Photos"
        excludeIds={headshotId ? [headshotId] : []}
      />

      <PhotoPickerModal
        isOpen={showSimplePhotoPicker}
        onClose={() => setShowSimplePhotoPicker(false)}
        photos={photos}
        selectedIds={selectedPhotoIds}
        onSelect={toggleSimplePhoto}
        mode="multiple"
        maxSelections={4}
        title="Select Photos"
      />
    </div>
  );
}