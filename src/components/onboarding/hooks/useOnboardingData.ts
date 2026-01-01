'use client';

import { useState, useCallback } from 'react';
import {
  type OnboardingData,
  type OnboardingStep,
  type ProfileData,
  type AboutData,
  type ServicesData,
  type PortfolioPhoto,
  type ExistingProfile,
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
  getCollectedFieldsCount: (step: OnboardingStep) => number;
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
    selectedTemplate: 'ivory',
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

  // Photo management
  const addPhotos = useCallback((files: FileList) => {
    const newPhotos: PortfolioPhoto[] = Array.from(files).map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      photographer: '',
      studio: '',
      visible: true,
      order: data.photos.length + index,
    }));
    setData((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
  }, [data.photos.length]);

  const togglePhotoVisibility = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)),
    }));
  }, []);

  const removePhoto = useCallback((id: string) => {
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
    getCollectedFieldsCount,
  };
}

