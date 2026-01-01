'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type OnboardingData,
  type OnboardingStep,
  type ProfileData,
  type AboutData,
  type ServicesData,
  type PortfolioPhoto,
  type ExistingProfile,
  type ExistingService,
  type ExistingPhoto,
  type PhotoUploadStatus,
  DEFAULT_PROFILE_DATA,
  DEFAULT_ABOUT_DATA,
  DEFAULT_SERVICES_DATA,
  DEFAULT_SERVICE_CATEGORIES,
} from '../types';

// ============================================================================
// API Response Types
// ============================================================================

interface PhotoUploadErrorResponse {
  error: string;
}

interface PhotoUploadSuccessResponse {
  success: boolean;
  photo?: {
    id: string;
    url: string;
    profile_id: string;
    sort_order: number;
    size_bytes: number;
    is_visible: boolean;
    photographer: string | null;
    studio: string | null;
    created_at: string;
  };
}

// ============================================================================
// Hook
// ============================================================================

interface UseOnboardingDataProps {
  existingProfile?: ExistingProfile;
  existingServices?: ExistingService[];
  existingPhotos?: ExistingPhoto[];
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
  reorderPhotos: (oldIndex: number, newIndex: number) => void;
  updatePhotoCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  retryPhotoUpload: (id: string) => void;
  getCollectedFieldsCount: (step: OnboardingStep) => number;
  isUploading: boolean;
  uploadProgress: { uploaded: number; total: number };
  // Incremental save functions
  saveTemplate: () => Promise<void>;
  saveProfile: () => Promise<void>;
  saveServices: () => Promise<void>;
  isSavingTemplate: boolean;
  isSavingProfile: boolean;
  isSavingServices: boolean;
}

export function useOnboardingData({ existingProfile, existingServices, existingPhotos }: UseOnboardingDataProps = {}): UseOnboardingDataReturn {
  // Build initial services data from existing services
  const buildInitialServices = (): ServicesData => {
    if (!existingServices || existingServices.length === 0) {
      return DEFAULT_SERVICES_DATA;
    }

    // Mark categories as selected based on existing services
    const selectedCategoryIds = new Set(existingServices.map((s) => s.category));
    const categories = DEFAULT_SERVICE_CATEGORIES.map((cat) => ({
      ...cat,
      selected: selectedCategoryIds.has(cat.id),
      description: existingServices.find((s) => s.category === cat.id)?.description || cat.description,
    }));

    // Get pricing from first service (they share pricing)
    const firstService = existingServices[0];
    const pricing = {
      hourly: firstService?.pricing?.hourly?.toString() || '',
      halfDay: firstService?.pricing?.half_day?.toString() || '',
      fullDay: firstService?.pricing?.full_day?.toString() || '',
    };

    // Preserve metadata fields from existing services (use first service as source)
    // These fields are stored at the service level but apply to all services
    const experienceLevel = firstService?.experience_level || DEFAULT_SERVICES_DATA.experienceLevel;
    const travelAvailable = firstService?.travel_available ?? DEFAULT_SERVICES_DATA.travelAvailable;
    const travelRadius = firstService?.travel_radius || DEFAULT_SERVICES_DATA.travelRadius;
    const tfpAvailable = firstService?.tfp_available ?? DEFAULT_SERVICES_DATA.tfpAvailable;

    return {
      experienceLevel,
      categories,
      pricing,
      travelAvailable,
      travelRadius,
      tfpAvailable,
    };
  };

  // Build initial photos from existing photos
  const buildInitialPhotos = (): PortfolioPhoto[] => {
    if (!existingPhotos || existingPhotos.length === 0) {
      return [];
    }

    return existingPhotos.map((photo) => ({
      id: `existing-${photo.id}`,
      url: photo.url,
      photographer: photo.photographer || '',
      studio: photo.studio || '',
      visible: photo.is_visible,
      order: photo.sort_order,
      uploadStatus: 'uploaded' as PhotoUploadStatus,
      serverId: photo.id,
      uploadedPhotographer: photo.photographer || '',
      uploadedStudio: photo.studio || '',
    }));
  };

  const [data, setData] = useState<OnboardingData>(() => ({
    profile: {
      ...DEFAULT_PROFILE_DATA,
      displayName: existingProfile?.display_name || '',
      username: existingProfile?.username || '',
      location: existingProfile?.location || '',
      agency: existingProfile?.agency || '',
      instagram: existingProfile?.instagram || '',
      tiktok: existingProfile?.tiktok || '',
      website: existingProfile?.website || '',
    },
    about: {
      ...DEFAULT_ABOUT_DATA,
      bio: existingProfile?.bio || '',
      profilePhoto: existingProfile?.avatar_url || null,
      stats: {
        height: existingProfile?.height_cm?.toString() || '',
        bust: existingProfile?.bust_cm?.toString() || '',
        waist: existingProfile?.waist_cm?.toString() || '',
        hips: existingProfile?.hips_cm?.toString() || '',
        shoes: existingProfile?.shoe_size || '',
        dress: '',
        hairColor: existingProfile?.hair_color || '',
        eyeColor: existingProfile?.eye_color || '',
      },
    },
    services: buildInitialServices(),
    selectedTemplate: existingProfile?.selected_template || 'altar',
    photos: buildInitialPhotos(),
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
        const errorData: PhotoUploadErrorResponse = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: PhotoUploadSuccessResponse = await response.json();
      
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

  const reorderPhotos = useCallback((oldIndex: number, newIndex: number) => {
    setData((prev) => {
      const photos = [...prev.photos];
      const [movedPhoto] = photos.splice(oldIndex, 1);
      photos.splice(newIndex, 0, movedPhoto);
      // Update order property to reflect new positions
      const reorderedPhotos = photos.map((photo, index) => ({
        ...photo,
        order: index,
      }));
      return { ...prev, photos: reorderedPhotos };
    });
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

  // ============================================================================
  // Incremental Save Functions
  // ============================================================================

  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingServices, setIsSavingServices] = useState(false);

  // Track last saved values to avoid unnecessary API calls
  const lastSavedTemplateRef = useRef<string | null>(existingProfile?.selected_template || null);
  const lastSavedProfileRef = useRef<ProfileData | null>(null);
  const lastSavedServicesRef = useRef<ServicesData | null>(null);

  // Valid template IDs for validation
  const VALID_TEMPLATES = ['elysian', 'altar', 'solstice', 'obsidian'];

  // Save template selection immediately
  const saveTemplate = useCallback(async () => {
    // Validate template before saving
    if (!data.selectedTemplate || !VALID_TEMPLATES.includes(data.selectedTemplate)) {
      console.warn('Invalid template selection, skipping save:', data.selectedTemplate);
      return;
    }
    
    if (data.selectedTemplate === lastSavedTemplateRef.current) return;
    
    setIsSavingTemplate(true);
    try {
      const response = await fetch('/api/onboarding/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: data.selectedTemplate }),
      });
      
      if (response.ok) {
        lastSavedTemplateRef.current = data.selectedTemplate;
        console.log('Template saved successfully:', data.selectedTemplate);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save template:', errorData);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSavingTemplate(false);
    }
  }, [data.selectedTemplate]);

  // Save profile data
  const saveProfile = useCallback(async () => {
    setIsSavingProfile(true);
    try {
      // Only save if we have the required fields
      if (!data.profile.username.trim() || !data.profile.displayName.trim()) {
        return;
      }
      const formData = new FormData();
      formData.append('username', data.profile.username.toLowerCase().trim());
      formData.append('display_name', data.profile.displayName.trim());
      if (data.profile.location) formData.append('location', data.profile.location.trim());
      if (data.profile.instagram) formData.append('instagram', data.profile.instagram.trim());
      if (data.profile.tiktok) formData.append('tiktok', data.profile.tiktok.trim());
      if (data.profile.website) formData.append('website', data.profile.website.trim());
      if (data.profile.agency) formData.append('agency', data.profile.agency.trim());
      if (data.about.bio) formData.append('bio', data.about.bio.trim());

      // Add measurements
      const { stats } = data.about;
      if (stats.height) formData.append('height_cm', stats.height);
      if (stats.bust) formData.append('bust_cm', stats.bust);
      if (stats.waist) formData.append('waist_cm', stats.waist);
      if (stats.hips) formData.append('hips_cm', stats.hips);
      if (stats.shoes) formData.append('shoe_size', stats.shoes);
      if (stats.dress) formData.append('dress_size', stats.dress);
      if (stats.hairColor) formData.append('hair_color', stats.hairColor);
      if (stats.eyeColor) formData.append('eye_color', stats.eyeColor);

      const response = await fetch('/api/onboarding/update-profile', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        lastSavedProfileRef.current = { ...data.profile };
        console.log('Profile saved');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSavingProfile(false);
    }
  }, [data.profile, data.about]);

  // Save services data
  const saveServices = useCallback(async () => {
    setIsSavingServices(true);
    try {
      const selectedCategories = data.services.categories.filter((c) => c.selected);
      const payload = {
        experience_level: data.services.experienceLevel,
        services: selectedCategories.map((cat) => ({
          category: cat.id,
          title: cat.name,
          description: cat.description,
          pricing: {
            hourly: data.services.pricing.hourly ? Number(data.services.pricing.hourly) : null,
            half_day: data.services.pricing.halfDay ? Number(data.services.pricing.halfDay) : null,
            full_day: data.services.pricing.fullDay ? Number(data.services.pricing.fullDay) : null,
          },
        })),
        travel_available: data.services.travelAvailable,
        travel_radius: data.services.travelRadius,
        tfp_available: data.services.tfpAvailable,
      };

      const response = await fetch('/api/onboarding/save-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        lastSavedServicesRef.current = { ...data.services };
        console.log('Services saved');
      }
    } catch (error) {
      console.error('Failed to save services:', error);
    } finally {
      setIsSavingServices(false);
    }
  }, [data.services]);

  // Auto-save template when it changes (immediate)
  useEffect(() => {
    // Skip if it's the initial value from existingProfile
    if (data.selectedTemplate === existingProfile?.selected_template) return;
    if (data.selectedTemplate === lastSavedTemplateRef.current) return;
    
    saveTemplate();
  }, [data.selectedTemplate, existingProfile?.selected_template, saveTemplate]);

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
    reorderPhotos,
    updatePhotoCredit,
    retryPhotoUpload,
    getCollectedFieldsCount,
    isUploading,
    uploadProgress,
    // Incremental saves
    saveTemplate,
    saveProfile,
    saveServices,
    isSavingTemplate,
    isSavingProfile,
    isSavingServices,
  };
}

