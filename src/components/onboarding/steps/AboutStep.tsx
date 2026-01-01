'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { colors, fonts, type AboutData, type ModelStats } from '../types';

// ============================================================================
// Icons
// ============================================================================

const CameraIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const ScanIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

const UploadIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const XIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BodyIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <path d="M12 8v8" />
    <path d="M8 10l4 2 4-2" />
    <path d="M9 22l3-6 3 6" />
  </svg>
);

const FileIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

type AIToolType = 'photo-analyzer' | 'comp-scanner' | null;

interface AIAnalysisResult {
  success: boolean;
  message: string;
  extractedData?: Partial<ModelStats>;
  confidence?: 'high' | 'medium' | 'low';
}

// ============================================================================
// Main Component
// ============================================================================

interface AboutStepProps {
  data: AboutData;
  onChange: (data: AboutData) => void;
}

export function AboutStep({ data, onChange }: AboutStepProps): React.JSX.Element {
  // Separate loading states for each AI tool
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isScanningCompCard, setIsScanningCompCard] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  
  // Drag states for each drop zone
  const [isProfileDragActive, setIsProfileDragActive] = useState(false);
  const [isPhotoDragActive, setIsPhotoDragActive] = useState(false);
  const [isCompCardDragActive, setIsCompCardDragActive] = useState(false);
  
  // Uploading states
  const [isUploading, setIsUploading] = useState(false);
  
  // Analysis results
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [compCardResult, setCompCardResult] = useState<AIAnalysisResult | null>(null);
  
  // Uploaded files for AI analysis (separate from profile photo)
  const [analysisPhotos, setAnalysisPhotos] = useState<string[]>([]);
  const [compCardFile, setCompCardFile] = useState<string | null>(null);
  
  // File input refs - separate for each purpose
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const photoAnalysisInputRef = useRef<HTMLInputElement>(null);
  const compCardInputRef = useRef<HTMLInputElement>(null);
  
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingBlobUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
      if (pendingBlobUrlRef.current) {
        URL.revokeObjectURL(pendingBlobUrlRef.current);
      }
    };
  }, []);

  const handleStatsChange = useCallback(
    (field: keyof ModelStats, value: string) => {
      onChange({
        ...data,
        stats: { ...data.stats, [field]: value },
      });
    },
    [data, onChange]
  );

  const handleBioChange = useCallback(
    (value: string) => {
      onChange({ ...data, bio: value });
    },
    [data, onChange]
  );

  // ============================================================================
  // Profile Photo Handlers
  // ============================================================================

  const handleProfileFileSelect = useCallback(
    async (file: File) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, WebP, or GIF image.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB.');
        return;
      }

      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
        uploadTimeoutRef.current = null;
      }

      if (pendingBlobUrlRef.current) {
        URL.revokeObjectURL(pendingBlobUrlRef.current);
        pendingBlobUrlRef.current = null;
      }

      setIsUploading(true);

      const objectUrl = URL.createObjectURL(file);
      pendingBlobUrlRef.current = objectUrl;
      onChange({ ...data, profilePhoto: objectUrl });

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/onboarding/upload-avatar', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload avatar');
        }

        const result = await response.json();
        URL.revokeObjectURL(objectUrl);
        pendingBlobUrlRef.current = null;
        onChange({ ...data, profilePhoto: result.url });
      } catch (error) {
        console.error('Avatar upload error:', error);
        alert('Failed to upload profile photo. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [data, onChange]
  );

  const handleProfilePhotoUpload = () => {
    profileFileInputRef.current?.click();
  };

  const handleProfileFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProfileFileSelect(file);
    }
    e.target.value = '';
  };

  const handleRemoveProfilePhoto = () => {
    if (data.profilePhoto && data.profilePhoto.startsWith('blob:')) {
      URL.revokeObjectURL(data.profilePhoto);
    }
    onChange({ ...data, profilePhoto: null });
  };

  // Profile drag handlers
  const handleProfileDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDragActive(true);
  };

  const handleProfileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDragActive(false);
  };

  const handleProfileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleProfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProfileFileSelect(file);
    }
  };

  // ============================================================================
  // Photo Analysis Handlers (Multiple Images)
  // ============================================================================

  const handlePhotoAnalysisFilesSelect = useCallback(async (files: File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        continue; // Skip invalid files silently
      }
      if (file.size > 10 * 1024 * 1024) {
        continue; // Skip files over 10MB
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      alert('Please upload JPEG, PNG, WebP, or GIF images (max 10MB each).');
      return;
    }

    // Limit to 5 photos max
    const filesToProcess = validFiles.slice(0, 5);
    
    // Create preview URLs
    const objectUrls = filesToProcess.map(file => URL.createObjectURL(file));
    setAnalysisPhotos(objectUrls);
    setPhotoAnalysisResult(null);
    setIsAnalyzingPhoto(true);

    try {
      // Convert all files to base64
      const base64Images = await Promise.all(
        filesToProcess.map(file => 
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        )
      );

      // Call AI API with multiple images
      const response = await fetch('/api/onboarding/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please analyze these ${base64Images.length} photo(s) to extract physical characteristics. Look for full-body shots to estimate height and proportions, and close-ups for hair and eye color.`,
          step: 'about',
          tool: 'photo-analyzer',
          images: base64Images,
        }),
      });

      const result = await response.json();

      if (result.extractedData && Object.keys(result.extractedData).length > 0) {
        // Map API response to our stats format
        const extractedStats: Partial<ModelStats> = {};
        if (result.extractedData.hairColor) extractedStats.hairColor = result.extractedData.hairColor;
        if (result.extractedData.eyeColor) extractedStats.eyeColor = result.extractedData.eyeColor;
        if (result.extractedData.heightCm) extractedStats.height = `${Math.round(Number(result.extractedData.heightCm) / 2.54)}"`;
        
        setPhotoAnalysisResult({
          success: true,
          message: result.message || `Analysis complete! I analyzed ${base64Images.length} photo(s) and detected some characteristics.`,
          extractedData: extractedStats,
          confidence: result.confidence > 0.7 ? 'high' : result.confidence > 0.4 ? 'medium' : 'low',
        });
      } else {
        setPhotoAnalysisResult({
          success: false,
          message: result.message || "I couldn't extract reliable measurements from these photos. For best results, please include a full-body shot with a reference object (like a door frame) and a close-up for hair/eye color, or enter your measurements manually below.",
        });
      }
    } catch (error) {
      console.error('Photo analysis error:', error);
      setPhotoAnalysisResult({
        success: false,
        message: "I had trouble analyzing these photos. Please try different images or enter your measurements manually.",
      });
    } finally {
      setIsAnalyzingPhoto(false);
    }
  }, []);

  const handleApplyPhotoAnalysis = () => {
    if (photoAnalysisResult?.extractedData) {
      onChange({
        ...data,
        stats: { ...data.stats, ...photoAnalysisResult.extractedData },
      });
      setPhotoAnalysisResult(prev => prev ? { ...prev, message: '✓ Applied to your profile!' } : null);
    }
  };

  const handlePhotoAnalysisUpload = () => {
    photoAnalysisInputRef.current?.click();
  };

  const handlePhotoAnalysisInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handlePhotoAnalysisFilesSelect(files);
    }
    e.target.value = '';
  };

  const handlePhotoDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPhotoDragActive(true);
  };

  const handlePhotoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPhotoDragActive(false);
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPhotoDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      handlePhotoAnalysisFilesSelect(files);
    }
  };

  const clearPhotoAnalysis = () => {
    // Revoke all blob URLs
    analysisPhotos.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setAnalysisPhotos([]);
    setPhotoAnalysisResult(null);
  };

  const removeAnalysisPhoto = (index: number) => {
    const url = analysisPhotos[index];
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    setAnalysisPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================================================
  // Comp Card Scanner Handlers
  // ============================================================================

  const handleCompCardFileSelect = useCallback(async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, WebP, GIF image, or PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB.');
      return;
    }

    // For images, show preview; for PDFs, show file name
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setCompCardFile(objectUrl);
    } else {
      setCompCardFile(file.name);
    }
    
    setCompCardResult(null);
    setIsScanningCompCard(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call AI API
      const response = await fetch('/api/onboarding/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Please scan this comp card and extract all modeling statistics.',
          step: 'about',
          tool: 'comp-scanner',
          images: [base64],
        }),
      });

      const result = await response.json();

      if (result.extractedData && Object.keys(result.extractedData).length > 0) {
        const extractedStats: Partial<ModelStats> = {};
        if (result.extractedData.heightCm) extractedStats.height = `${Math.round(Number(result.extractedData.heightCm) / 2.54 / 12)}'${Math.round(Number(result.extractedData.heightCm) / 2.54) % 12}"`;
        if (result.extractedData.bustCm) extractedStats.bust = `${Math.round(Number(result.extractedData.bustCm) / 2.54)}"`;
        if (result.extractedData.waistCm) extractedStats.waist = `${Math.round(Number(result.extractedData.waistCm) / 2.54)}"`;
        if (result.extractedData.hipsCm) extractedStats.hips = `${Math.round(Number(result.extractedData.hipsCm) / 2.54)}"`;
        if (result.extractedData.shoeSize) extractedStats.shoes = result.extractedData.shoeSize;
        if (result.extractedData.hairColor) extractedStats.hairColor = result.extractedData.hairColor;
        if (result.extractedData.eyeColor) extractedStats.eyeColor = result.extractedData.eyeColor;

        setCompCardResult({
          success: true,
          message: result.message || 'Successfully extracted your stats from the comp card!',
          extractedData: extractedStats,
          confidence: result.confidence > 0.7 ? 'high' : result.confidence > 0.4 ? 'medium' : 'low',
        });
      } else {
        setCompCardResult({
          success: false,
          message: result.message || "I couldn't read the stats from this comp card. Please make sure the text is clear and visible, or enter your measurements manually below.",
        });
      }
    } catch (error) {
      console.error('Comp card scan error:', error);
      setCompCardResult({
        success: false,
        message: "I had trouble scanning this comp card. Please try a clearer image or enter your measurements manually.",
      });
    } finally {
      setIsScanningCompCard(false);
    }
  }, []);

  const handleApplyCompCardData = () => {
    if (compCardResult?.extractedData) {
      onChange({
        ...data,
        stats: { ...data.stats, ...compCardResult.extractedData },
      });
      setCompCardResult(prev => prev ? { ...prev, message: '✓ Applied to your profile!' } : null);
    }
  };

  const handleCompCardUpload = () => {
    compCardInputRef.current?.click();
  };

  const handleCompCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCompCardFileSelect(file);
    }
    e.target.value = '';
  };

  const handleCompCardDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCompCardDragActive(true);
  };

  const handleCompCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCompCardDragActive(false);
  };

  const handleCompCardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCompCardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCompCardDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCompCardFileSelect(file);
    }
  };

  const clearCompCard = () => {
    if (compCardFile && compCardFile.startsWith('blob:')) {
      URL.revokeObjectURL(compCardFile);
    }
    setCompCardFile(null);
    setCompCardResult(null);
  };

  // ============================================================================
  // Bio Generator
  // ============================================================================

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      const response = await fetch('/api/onboarding/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Generate a professional bio for me',
          step: 'about',
          tool: 'bio-generator',
          context: {
            extractedData: {
              ...data.stats,
            },
          },
        }),
      });

      const result = await response.json();
      if (result.extractedData?.bio) {
        onChange({ ...data, bio: result.extractedData.bio });
      } else if (result.message) {
        // Extract bio from message if not in extractedData
        const bioMatch = result.message.match(/["']([^"']{50,})["']/);
        if (bioMatch) {
          onChange({ ...data, bio: bioMatch[1] });
        }
      }
    } catch (error) {
      console.error('Bio generation error:', error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  // ============================================================================
  // Styles
  // ============================================================================

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '0',
    outline: 'none',
    backgroundColor: colors.white,
    transition: 'border-color 0.2s',
    fontFamily: fonts.body,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: colors.textSecondary,
    marginBottom: '0.375rem',
    display: 'block',
    fontFamily: fonts.body,
  };

  const dropZoneStyle = (isActive: boolean, hasContent: boolean): React.CSSProperties => ({
    padding: '1.5rem',
    backgroundColor: isActive ? 'rgba(196, 164, 132, 0.1)' : hasContent ? colors.white : colors.cream,
    border: isActive ? `2px dashed ${colors.camel}` : `1px solid ${colors.border}`,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  });

  const aiToolCardStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '280px',
  };

  return (
    <>
      {/* Hidden file inputs - separate for each purpose */}
      <input
        ref={profileFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleProfileFileInputChange}
        style={{ display: 'none' }}
      />
      <input
        ref={photoAnalysisInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handlePhotoAnalysisInputChange}
        style={{ display: 'none' }}
      />
      <input
        ref={compCardInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        onChange={handleCompCardInputChange}
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
        About You
      </h1>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '2rem', fontFamily: fonts.body }}>
        Share your measurements and a bit about yourself. This helps clients find the right fit.
      </p>

      {/* Profile Photo - Simple Upload */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, marginBottom: '0.75rem', fontFamily: fonts.body }}>
          Profile Photo
        </h3>
        <div
          onDragEnter={handleProfileDragEnter}
          onDragLeave={handleProfileDragLeave}
          onDragOver={handleProfileDragOver}
          onDrop={handleProfileDrop}
          onClick={!data.profilePhoto ? handleProfilePhotoUpload : undefined}
          style={{
            ...dropZoneStyle(isProfileDragActive, !!data.profilePhoto),
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: data.profilePhoto ? 'transparent' : colors.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
              border: data.profilePhoto ? `3px solid ${colors.camel}` : 'none',
            }}
          >
            {isUploading ? (
              <div style={{ width: '24px', height: '24px', border: `3px solid ${colors.camel}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : data.profilePhoto ? (
              <img src={data.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <CameraIcon size={24} />
            )}
            {data.profilePhoto && !isUploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveProfilePhoto(); }}
                style={{
                  position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px',
                  borderRadius: '50%', backgroundColor: colors.charcoal, color: colors.white,
                  border: `2px solid ${colors.white}`, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <XIcon size={10} />
              </button>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 0.5rem', fontFamily: fonts.body }}>
              {isProfileDragActive ? 'Drop your headshot here...' : 'Upload a professional headshot for your About page'}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleProfilePhotoUpload(); }}
              disabled={isUploading}
              style={{
                padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 500,
                backgroundColor: colors.charcoal, color: colors.white,
                border: 'none', cursor: isUploading ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                opacity: isUploading ? 0.6 : 1, fontFamily: fonts.body,
              }}
            >
              <UploadIcon size={14} />
              {isUploading ? 'Uploading...' : data.profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>
        </div>
      </div>

      {/* AI-Powered Tools Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '11px', letterSpacing: '0.15em', color: colors.camel,
            marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: fonts.body, textTransform: 'uppercase',
          }}
        >
          <SparklesIcon size={12} />
          AI-POWERED MEASUREMENT EXTRACTION
        </h3>
        <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '1rem', fontFamily: fonts.body }}>
          Save time by letting AI extract your measurements. Choose one of the options below:
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Option 1: Photo Analysis (Multiple Images) */}
          <div style={aiToolCardStyle}>
            <div
              onDragEnter={handlePhotoDragEnter}
              onDragLeave={handlePhotoDragLeave}
              onDragOver={handlePhotoDragOver}
              onDrop={handlePhotoDrop}
              onClick={analysisPhotos.length === 0 && !isAnalyzingPhoto ? handlePhotoAnalysisUpload : undefined}
              style={{
                ...dropZoneStyle(isPhotoDragActive, analysisPhotos.length > 0),
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BodyIcon size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, fontFamily: fonts.body }}>
                    Analyze Photos
                  </span>
                </div>
                {analysisPhotos.length > 0 && (
                  <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: fonts.body }}>
                    {analysisPhotos.length}/5 photos
                  </span>
                )}
              </div>

              {/* Content area */}
              {analysisPhotos.length > 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Photo grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${Math.min(analysisPhotos.length, 3)}, 1fr)`,
                    gap: '0.5rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    {analysisPhotos.map((photo, index) => (
                      <div key={index} style={{ position: 'relative', aspectRatio: '1' }}>
                        <img
                          src={photo}
                          alt={`Analysis photo ${index + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            border: `1px solid ${colors.border}`,
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeAnalysisPhoto(index); }}
                          style={{
                            position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px',
                            borderRadius: '50%', backgroundColor: colors.charcoal, color: colors.white,
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px',
                          }}
                        >
                          <XIcon size={10} />
                        </button>
                      </div>
                    ))}
                    {/* Add more button if under limit */}
                    {analysisPhotos.length < 5 && !isAnalyzingPhoto && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePhotoAnalysisUpload(); }}
                        style={{
                          aspectRatio: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: colors.cream,
                          border: `1px dashed ${colors.border}`,
                          cursor: 'pointer',
                          gap: '0.25rem',
                        }}
                      >
                        <UploadIcon size={16} />
                        <span style={{ fontSize: '10px', color: colors.textMuted, fontFamily: fonts.body }}>Add more</span>
                      </button>
                    )}
                  </div>

                  {/* Clear all button */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearPhotoAnalysis(); }}
                      style={{
                        padding: '0.25rem 0.5rem', fontSize: '11px',
                        backgroundColor: 'transparent', color: colors.textMuted,
                        border: `1px solid ${colors.border}`, cursor: 'pointer',
                        fontFamily: fonts.body,
                      }}
                    >
                      Clear all
                    </button>
                  </div>

                  {isAnalyzingPhoto ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.camel }}>
                      <div style={{ width: '16px', height: '16px', border: `2px solid ${colors.camel}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '13px', fontFamily: fonts.body }}>Analyzing {analysisPhotos.length} photo(s)...</span>
                    </div>
                  ) : photoAnalysisResult && (
                    <div style={{ fontSize: '13px', fontFamily: fonts.body }}>
                      <p style={{ color: photoAnalysisResult.success ? colors.textPrimary : colors.textSecondary, marginBottom: '0.5rem' }}>
                        {photoAnalysisResult.message}
                      </p>
                      {photoAnalysisResult.success && photoAnalysisResult.extractedData && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleApplyPhotoAnalysis(); }}
                          style={{
                            padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 500,
                            backgroundColor: colors.camel, color: colors.white,
                            border: 'none', cursor: 'pointer', display: 'inline-flex',
                            alignItems: 'center', gap: '0.375rem', fontFamily: fonts.body,
                          }}
                        >
                          <CheckIcon size={14} />
                          Apply to Profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <UploadIcon size={24} />
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0.75rem 0 0', fontFamily: fonts.body }}>
                    {isPhotoDragActive ? 'Drop your photos here...' : 'Drag & drop or click to upload'}
                  </p>
                  <p style={{ fontSize: '11px', color: colors.textMuted, margin: '0.25rem 0 0', fontFamily: fonts.body }}>
                    Upload up to 5 photos for best results
                  </p>
                </div>
              )}
            </div>

            {/* Tips for photo analysis */}
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(196, 164, 132, 0.08)', border: `1px solid rgba(196, 164, 132, 0.2)` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <InfoIcon size={14} />
                <div style={{ fontSize: '11px', color: colors.textSecondary, fontFamily: fonts.body, lineHeight: 1.5 }}>
                  <strong style={{ color: colors.textPrimary }}>For best results, include:</strong>
                  <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1rem' }}>
                    <li><strong>Full-body shot</strong> standing straight next to a door or furniture</li>
                    <li><strong>Close-up</strong> of your face for hair and eye color</li>
                    <li>Good lighting with minimal shadows</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Comp Card Scanner */}
          <div style={aiToolCardStyle}>
            <div
              onDragEnter={handleCompCardDragEnter}
              onDragLeave={handleCompCardDragLeave}
              onDragOver={handleCompCardDragOver}
              onDrop={handleCompCardDrop}
              onClick={!compCardFile && !isScanningCompCard ? handleCompCardUpload : undefined}
              style={{
                ...dropZoneStyle(isCompCardDragActive, !!compCardFile),
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ScanIcon size={20} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, fontFamily: fonts.body }}>
                  Scan Comp Card
                </span>
                <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: colors.camel, color: colors.white, fontFamily: fonts.body, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended
                </span>
              </div>

              {/* Content area */}
              {compCardFile ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                    {compCardFile.startsWith('blob:') ? (
                      <img
                        src={compCardFile}
                        alt="Comp card"
                        style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ padding: '1rem', backgroundColor: colors.cream, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileIcon size={20} />
                        <span style={{ fontSize: '13px', color: colors.textPrimary, fontFamily: fonts.body }}>{compCardFile}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearCompCard(); }}
                      style={{
                        position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px',
                        borderRadius: '50%', backgroundColor: colors.charcoal, color: colors.white,
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <XIcon size={12} />
                    </button>
                  </div>

                  {isScanningCompCard ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.camel }}>
                      <div style={{ width: '16px', height: '16px', border: `2px solid ${colors.camel}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '13px', fontFamily: fonts.body }}>Scanning comp card...</span>
                    </div>
                  ) : compCardResult && (
                    <div style={{ fontSize: '13px', fontFamily: fonts.body }}>
                      <p style={{ color: compCardResult.success ? colors.textPrimary : colors.textSecondary, marginBottom: '0.5rem' }}>
                        {compCardResult.message}
                      </p>
                      {compCardResult.success && compCardResult.extractedData && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleApplyCompCardData(); }}
                          style={{
                            padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 500,
                            backgroundColor: colors.camel, color: colors.white,
                            border: 'none', cursor: 'pointer', display: 'inline-flex',
                            alignItems: 'center', gap: '0.375rem', fontFamily: fonts.body,
                          }}
                        >
                          <CheckIcon size={14} />
                          Apply to Profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <UploadIcon size={24} />
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0.75rem 0 0', fontFamily: fonts.body }}>
                    {isCompCardDragActive ? 'Drop your comp card here...' : 'Drag & drop or click to upload'}
                  </p>
                  <p style={{ fontSize: '11px', color: colors.textMuted, margin: '0.25rem 0 0', fontFamily: fonts.body }}>
                    Supports images and PDF files
                  </p>
                </div>
              )}
            </div>

            {/* Tips for comp card */}
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(196, 164, 132, 0.08)', border: `1px solid rgba(196, 164, 132, 0.2)` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <InfoIcon size={14} />
                <div style={{ fontSize: '11px', color: colors.textSecondary, fontFamily: fonts.body, lineHeight: 1.5 }}>
                  <strong style={{ color: colors.textPrimary }}>Most accurate option!</strong>
                  <p style={{ margin: '0.25rem 0 0' }}>
                    Upload your existing comp card and I&apos;ll extract all your stats automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Measurements Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, marginBottom: '1rem', fontFamily: fonts.body }}>
          Measurements
        </h3>
        <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '1rem', fontFamily: fonts.body }}>
          Enter your measurements manually, or use the AI tools above to auto-fill.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Height</label>
            <input
              type="text"
              placeholder="5'9&quot;"
              value={data.stats.height}
              onChange={(e) => handleStatsChange('height', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Bust</label>
            <input
              type="text"
              placeholder='32"'
              value={data.stats.bust}
              onChange={(e) => handleStatsChange('bust', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Waist</label>
            <input
              type="text"
              placeholder='24"'
              value={data.stats.waist}
              onChange={(e) => handleStatsChange('waist', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hips</label>
            <input
              type="text"
              placeholder='34"'
              value={data.stats.hips}
              onChange={(e) => handleStatsChange('hips', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Shoe Size</label>
            <input
              type="text"
              placeholder="8"
              value={data.stats.shoes}
              onChange={(e) => handleStatsChange('shoes', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Dress Size</label>
            <input
              type="text"
              placeholder="4"
              value={data.stats.dress}
              onChange={(e) => handleStatsChange('dress', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hair Color</label>
            <input
              type="text"
              placeholder="Brunette"
              value={data.stats.hairColor}
              onChange={(e) => handleStatsChange('hairColor', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Eye Color</label>
            <input
              type="text"
              placeholder="Brown"
              value={data.stats.eyeColor}
              onChange={(e) => handleStatsChange('eyeColor', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary, fontFamily: fonts.body }}>Bio</label>
          <button
            type="button"
            onClick={handleGenerateBio}
            disabled={isGeneratingBio}
            style={{
              padding: '0.375rem 0.75rem', fontSize: '12px', fontWeight: 500,
              backgroundColor: 'transparent', color: colors.camel,
              border: `1px solid ${colors.camel}`, cursor: isGeneratingBio ? 'not-allowed' : 'pointer',
              opacity: isGeneratingBio ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontFamily: fonts.body,
            }}
          >
            <SparklesIcon size={12} />
            {isGeneratingBio ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <textarea
          placeholder="Tell clients about yourself, your experience, and what makes you unique..."
          value={data.bio}
          onChange={(e) => handleBioChange(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
        />
        <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '0.5rem', fontFamily: fonts.body }}>
          {data.bio.length}/500 characters
        </p>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
