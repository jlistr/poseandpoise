'use client';

import { useState, useCallback, useRef } from 'react';
import {
  type OnboardingData,
  type OnboardingStep,
  type ProfileData,
  type AboutData,
  type ServicesData,
  type PortfolioPhoto,
  type ExistingProfile,
  type PhotoUploadStatus,
  DEFAULT_PROFILE_DATA,
  DEFAULT_ABOUT_DATA,
  DEFAULT_SERVICES_DATA,
} from '../types';

// ============================================================================
// Hook
// ============================================================================

interface UseOnboardingDataProps {
  existingProfile?: ExistingProfile;
}

interface UseOnboardingDataReturn {
  data: OnboardingData;
  updateProfile: (profile: ProfileData) => void;
  updateAbout: (about: AboutData) => void;
  updateServices: (services: ServicesData) => void;
  updateSelectedTemplate: (templateId: string) => void;
  addPhotos: (files: FileList) => void;
  togglePhotoVisibility: (id: string) => void;
  removePhoto: (id: string) => void;
  updatePhotoCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  retryPhotoUpload: (id: string) => void;
  getCollectedFieldsCount: (step: OnboardingStep) => number;
  isUploading: boolean;
  uploadProgress: { uploaded: number; total: number };
}

export function useOnboardingData({ existingProfile }: UseOnboardingDataProps = {}): UseOnboardingDataReturn {
  const [data, setData] = useState<OnboardingData>(() => ({
    profile: {
      ...DEFAULT_PROFILE_DATA,
      displayName: existingProfile?.display_name || '',
      username: existingProfile?.username || '',
      location: existingProfile?.location || '',
      agency: existingProfile?.agency || '',
    },
    about: {
      ...DEFAULT_ABOUT_DATA,
      bio: existingProfile?.bio || '',
      profilePhoto: existingProfile?.avatar_url || null,
    },
    services: DEFAULT_SERVICES_DATA,
    selectedTemplate: 'altar',
    photos: [],
  }));

  // Profile updates
  const updateProfile = useCallback((profile: ProfileData) => {
    setData((prev) => ({ ...prev, profile }));
  }, []);

  // About updates
  const updateAbout = useCallback((about: AboutData) => {
    setData((prev) => ({ ...prev, about }));
  }, []);

  // Services updates
  const updateServices = useCallback((services: ServicesData) => {
    setData((prev) => ({ ...prev, services }));
  }, []);

  // Template updates
  const updateSelectedTemplate = useCallback((templateId: string) => {
    setData((prev) => ({ ...prev, selectedTemplate: templateId }));
  }, []);

  // Track upload queue
  const uploadQueueRef = useRef<Set<string>>(new Set());

  // Helper to update a single photo's status
  const updatePhotoStatus = useCallback((id: string, updates: Partial<PortfolioPhoto>) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  // Upload a single photo to the server
  const uploadPhoto = useCallback(async (photo: PortfolioPhoto) => {
    if (!photo.file || uploadQueueRef.current.has(photo.id)) return;
    
    uploadQueueRef.current.add(photo.id);
    updatePhotoStatus(photo.id, { uploadStatus: 'uploading' });

    try {
      const formData = new FormData();
      formData.append('file', photo.file);
      formData.append('photographer', photo.photographer || '');
      formData.append('studio', photo.studio || '');
      formData.append('visible', String(photo.visible));
      formData.append('order', String(photo.order));

      const response = await fetch('/api/onboarding/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      updatePhotoStatus(photo.id, { 
        uploadStatus: 'uploaded',
        serverId: result.photo?.id,
        url: result.photo?.url || photo.url, // Use server URL if available
        // Track what was uploaded so we can detect changes later
        uploadedPhotographer: photo.photographer,
        uploadedStudio: photo.studio,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      updatePhotoStatus(photo.id, { 
        uploadStatus: 'error',
        uploadError: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      uploadQueueRef.current.delete(photo.id);
    }
  }, [updatePhotoStatus]);

  // Generate unique ID for photos
  // Using crypto.randomUUID() for guaranteed uniqueness even with rapid uploads
  const generatePhotoId = useCallback((): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `photo-${crypto.randomUUID()}`;
    }
    // Fallback for environments without crypto.randomUUID
    return `photo-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Photo management - adds photos and starts upload immediately
  const addPhotos = useCallback((files: FileList) => {
    const newPhotos: PortfolioPhoto[] = Array.from(files).map((file, index) => ({
      id: generatePhotoId(),
      url: URL.createObjectURL(file),
      file,
      photographer: '',
      studio: '',
      visible: true,
      order: data.photos.length + index,
      uploadStatus: 'pending' as PhotoUploadStatus,
      // Track what was uploaded to detect credit changes
      uploadedPhotographer: '',
      uploadedStudio: '',
    }));
    
    setData((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    
    // Start uploading each photo
    newPhotos.forEach((photo) => {
      uploadPhoto(photo);
    });
  }, [data.photos.length, uploadPhoto, generatePhotoId]);

  const togglePhotoVisibility = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)),
    }));
  }, []);

  const removePhoto = useCallback((id: string) => {
    // TODO: If photo is already uploaded (has serverId), delete from server too
    setData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  }, []);

  const updatePhotoCredit = useCallback((id: string, field: 'photographer' | 'studio', value: string) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  }, []);

  // Retry failed upload
  const retryPhotoUpload = useCallback((id: string) => {
    const photo = data.photos.find((p) => p.id === id);
    if (photo && photo.file && photo.uploadStatus === 'error') {
      uploadPhoto(photo);
    }
  }, [data.photos, uploadPhoto]);

  // Computed upload status
  const isUploading = data.photos.some((p) => p.uploadStatus === 'uploading');
  const uploadProgress = {
    uploaded: data.photos.filter((p) => p.uploadStatus === 'uploaded').length,
    total: data.photos.length,
  };

  // Count collected fields for progress indicator
  const getCollectedFieldsCount = useCallback(
    (step: OnboardingStep): number => {
      switch (step) {
        case 'profile': {
          const { displayName, username, location, instagram, tiktok, website, agency } = data.profile;
          return [displayName, username, location, instagram, tiktok, website, agency].filter(Boolean).length;
        }
        case 'about': {
          const { stats, bio, profilePhoto } = data.about;
          const statsCount = Object.values(stats).filter(Boolean).length;
          return statsCount + (bio ? 1 : 0) + (profilePhoto ? 1 : 0);
        }
        case 'services': {
          const { experienceLevel, categories, pricing, travelAvailable, tfpAvailable } = data.services;
          const selectedCategories = categories.filter((c) => c.selected).length;
          const pricingCount = Object.values(pricing).filter(Boolean).length;
          return (
            (experienceLevel ? 1 : 0) +
            selectedCategories +
            pricingCount +
            (travelAvailable ? 1 : 0) +
            (tfpAvailable ? 1 : 0)
          );
        }
        case 'template':
          return data.selectedTemplate ? 1 : 0;
        case 'photos':
          return data.photos.length;
        default:
          return 0;
      }
    },
    [data]
  );

  return {
    data,
    updateProfile,
    updateAbout,
    updateServices,
    updateSelectedTemplate,
    addPhotos,
    togglePhotoVisibility,
    removePhoto,
    updatePhotoCredit,
    retryPhotoUpload,
    getCollectedFieldsCount,
    isUploading,
    uploadProgress,
  };
}

