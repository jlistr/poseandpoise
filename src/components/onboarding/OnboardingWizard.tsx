'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Types
import {
  type OnboardingStep,
  type StepInfo,
  type ExistingProfile,
  type ExistingService,
  type ExistingPhoto,
  colors,
  fonts,
} from './types';

// Components
import { OnboardingLayout, StepIndicator, FormCard, ProgressIndicator } from './components';
import { ProfileStep, AboutStep, ServicesStep, TemplateStep, PhotosStep } from './steps';

// Hooks
import { useOnboardingData } from './hooks';

// ============================================================================
// Icons
// ============================================================================

const ChevronLeftIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const RocketIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// ============================================================================
// Step Configuration
// Order: Template → Photos → Profile → Services → About
// 1. Template: Set the "container" for your work first
// 2. Photos: High-value step - upload images to see your portfolio come alive
// 3. Profile: Quick objective data (height, measurements, location, socials)
// 4. Services: Business end - comp card, rates, booking info
// 5. About: Save the laborious bio writing for last when you're motivated
// 
// Note: After onboarding, photos can also be managed via the Portfolio Editor
// which provides WYSIWYG editing where models can see how photos look in context
// ============================================================================

const STEPS: OnboardingStep[] = ['template', 'photos', 'profile', 'services', 'about'];

const STEP_LABELS: Record<OnboardingStep, string> = {
  template: 'TEMPLATE',
  photos: 'PHOTOS',
  profile: 'PROFILE',
  services: 'SERVICES',
  about: 'ABOUT',
};

// ============================================================================
// Main Component
// ============================================================================

interface OnboardingWizardProps {
  userEmail: string;
  userId: string;
  existingProfile?: ExistingProfile;
  existingServices?: ExistingService[];
  existingPhotos?: ExistingPhoto[];
}

export function OnboardingWizard({ userEmail, userId, existingProfile, existingServices, existingPhotos }: OnboardingWizardProps): React.JSX.Element {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('template');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Data management hook
  const {
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
    isUploading: isUploadingPhotos,
    uploadProgress,
    // Incremental saves
    saveProfile,
    saveServices,
    isSavingProfile,
    isSavingServices,
  } = useOnboardingData({ existingProfile, existingServices, existingPhotos });

  // Get user initials for header
  const userInitials = data.profile.displayName
    ? data.profile.displayName.charAt(0).toUpperCase()
    : userEmail.charAt(0).toUpperCase();

  // Build step info for indicator
  const steps: StepInfo[] = STEPS.map((step, index) => ({
    id: step,
    name: STEP_LABELS[step],
    completed: STEPS.indexOf(currentStep) > index,
    current: currentStep === step,
  }));

  // Navigation
  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Save current step data before navigating away
  const saveCurrentStepData = useCallback(async () => {
    switch (currentStep) {
      case 'profile':
        await saveProfile();
        break;
      case 'services':
        await saveServices();
        break;
      case 'about':
        // About data is included in profile save
        await saveProfile();
        break;
      // Template saves automatically on change
      // Photos upload immediately
    }
  }, [currentStep, saveProfile, saveServices]);

  const handleBack = useCallback(async () => {
    if (!isFirstStep) {
      // Save current step data before going back
      await saveCurrentStepData();
      setCurrentStep(STEPS[currentStepIndex - 1]);
      setValidationErrors({});
    }
  }, [currentStepIndex, isFirstStep, saveCurrentStepData]);

  const handleSkip = useCallback(async () => {
    if (!isLastStep) {
      // Save current step data before skipping
      await saveCurrentStepData();
      setCurrentStep(STEPS[currentStepIndex + 1]);
      setValidationErrors({});
    }
  }, [currentStepIndex, isLastStep, saveCurrentStepData]);

  const validateCurrentStep = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 'profile') {
      if (!data.profile.displayName.trim()) {
        errors.displayName = 'Display name is required';
      }
      if (!data.profile.username.trim()) {
        errors.username = 'Username is required';
      } else if (!/^[a-z0-9_-]+$/.test(data.profile.username)) {
        errors.username = 'Username can only contain lowercase letters, numbers, hyphens, and underscores';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, data.profile]);

  // Validate required profile fields before launching (profile is no longer last step)
  const validateForLaunch = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!data.profile.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    if (!data.profile.username.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-z0-9_-]+$/.test(data.profile.username)) {
      errors.username = 'Username can only contain lowercase letters, numbers, hyphens, and underscores';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Navigate to profile step to show errors
      setCurrentStep('profile');
      return false;
    }

    return true;
  }, [data.profile]);

  const handleContinue = useCallback(async () => {
    if (!validateCurrentStep()) return;

    if (!isLastStep) {
      // Save current step data before continuing
      await saveCurrentStepData();
      setCurrentStep(STEPS[currentStepIndex + 1]);
      setValidationErrors({});
    }
  }, [currentStepIndex, isLastStep, validateCurrentStep, saveCurrentStepData]);

  // Save and launch portfolio
  const handleLaunchPortfolio = useCallback(async () => {
    // Validate required profile fields before launching
    if (!validateForLaunch()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // 1. Save profile data
      const profileFormData = new FormData();
      profileFormData.append('username', data.profile.username.toLowerCase().trim());
      profileFormData.append('display_name', data.profile.displayName.trim());
      if (data.profile.location) profileFormData.append('location', data.profile.location.trim());
      if (data.profile.instagram) profileFormData.append('instagram', data.profile.instagram.trim());
      if (data.profile.tiktok) profileFormData.append('tiktok', data.profile.tiktok.trim());
      if (data.profile.website) profileFormData.append('website', data.profile.website.trim());
      if (data.profile.agency) profileFormData.append('agency', data.profile.agency.trim());
      if (data.about.bio) profileFormData.append('bio', data.about.bio.trim());

      // Add measurements (field names must match backend: height_cm, bust_cm, etc.)
      const { stats } = data.about;
      if (stats.height) profileFormData.append('height_cm', stats.height);
      if (stats.bust) profileFormData.append('bust_cm', stats.bust);
      if (stats.waist) profileFormData.append('waist_cm', stats.waist);
      if (stats.hips) profileFormData.append('hips_cm', stats.hips);
      if (stats.shoes) profileFormData.append('shoe_size', stats.shoes);
      if (stats.dress) profileFormData.append('dress_size', stats.dress);
      if (stats.hairColor) profileFormData.append('hair_color', stats.hairColor);
      if (stats.eyeColor) profileFormData.append('eye_color', stats.eyeColor);

      const profileResponse = await fetch('/api/onboarding/update-profile', {
        method: 'POST',
        body: profileFormData,
      });

      if (!profileResponse.ok) {
        const profileError = await profileResponse.json();
        throw new Error(profileError.error || 'Failed to save profile');
      }

      // 2. Save services data
      const selectedCategories = data.services.categories.filter((c) => c.selected);
      if (selectedCategories.length > 0 || data.services.experienceLevel) {
        const servicesPayload = {
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

        const servicesResponse = await fetch('/api/onboarding/save-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servicesPayload),
        });

        if (!servicesResponse.ok) {
          const servicesError = await servicesResponse.json();
          throw new Error(servicesError.error || 'Failed to save services');
        }
      }

      // 3. Save template selection
      const templateResponse = await fetch('/api/onboarding/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: data.selectedTemplate }),
      });

      if (!templateResponse.ok) {
        const templateError = await templateResponse.json();
        throw new Error(templateError.error || 'Failed to save template');
      }

      // 4. Handle photos - upload pending/failed ones, update credits for already-uploaded ones
      for (const photo of data.photos) {
        // Skip photos currently uploading - they'll complete on their own
        if (photo.uploadStatus === 'uploading') {
          continue;
        }
        
        // For already-uploaded photos, check if credits were edited after upload
        if (photo.uploadStatus === 'uploaded' && photo.serverId) {
          const creditsChanged = 
            photo.photographer !== (photo.uploadedPhotographer || '') ||
            photo.studio !== (photo.uploadedStudio || '');
          
          if (creditsChanged) {
            // Update credits on the server without re-uploading the file
            try {
              const updateResponse = await fetch('/api/onboarding/update-photo-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  photo_id: photo.serverId,
                  photographer: photo.photographer || '',
                  studio: photo.studio || '',
                }),
              });
              if (!updateResponse.ok) {
                console.error('Failed to update photo credits:', photo.id);
              }
            } catch (err) {
              console.error('Error updating photo credits:', err);
            }
          }
          continue;
        }
        
        // Upload pending or failed photos
        if (photo.file && (photo.uploadStatus === 'pending' || photo.uploadStatus === 'error')) {
          const photoFormData = new FormData();
          photoFormData.append('file', photo.file);
          photoFormData.append('photographer', photo.photographer || '');
          photoFormData.append('studio', photo.studio || '');
          photoFormData.append('visible', String(photo.visible));
          photoFormData.append('order', String(photo.order));

          const photoResponse = await fetch('/api/onboarding/upload-photo', {
            method: 'POST',
            body: photoFormData,
          });

          if (!photoResponse.ok) {
            console.error('Failed to upload photo:', photo.id);
          }
        }
      }

      // 5. Mark onboarding complete
      const completeResponse = await fetch('/api/onboarding/complete', {
        method: 'POST',
      });

      if (!completeResponse.ok) {
        const completeError = await completeResponse.json();
        throw new Error(completeError.error || 'Failed to complete onboarding');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setSaveError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  }, [data, router, validateForLaunch]);

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'profile':
        return (
          <ProfileStep
            data={data.profile}
            onChange={updateProfile}
            initialLocation={existingProfile?.location}
            validationErrors={validationErrors}
          />
        );
      case 'about':
        return <AboutStep data={data.about} onChange={updateAbout} />;
      case 'services':
        return <ServicesStep data={data.services} onChange={updateServices} />;
      case 'template':
        return (
          <TemplateStep
            selectedTemplate={data.selectedTemplate}
            onSelectTemplate={updateSelectedTemplate}
            modelName={data.profile.displayName}
          />
        );
      case 'photos':
        return (
          <PhotosStep
            photos={data.photos}
            onAddPhotos={addPhotos}
            onToggleVisibility={togglePhotoVisibility}
            onRemovePhoto={removePhoto}
            onReorderPhotos={reorderPhotos}
            onUpdateCredit={updatePhotoCredit}
            onRetryUpload={retryPhotoUpload}
            selectedTemplate={data.selectedTemplate}
            modelName={data.profile.displayName}
            isUploading={isUploadingPhotos}
            uploadProgress={uploadProgress}
          />
        );
      default:
        return null;
    }
  };

  const collectedFields = getCollectedFieldsCount(currentStep);

  return (
    <OnboardingLayout userInitials={userInitials} profilePhoto={data.about.profilePhoto}>
      {/* Step Indicator */}
      <StepIndicator steps={steps} />

      {/* Form Card */}
      <FormCard>
        {/* Step Content */}
        {renderStepContent()}

        {/* Error Message */}
        {saveError && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: colors.errorLight,
              border: `1px solid ${colors.error}`,
              color: colors.error,
              fontSize: '14px',
            }}
          >
            {saveError}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          {/* Back Button */}
          {!isFirstStep && (
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeftIcon size={16} />
              BACK
            </button>
          )}

          {/* Skip Button (only on first step) */}
          {isFirstStep && (
            <button
              type="button"
              onClick={handleSkip}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              SKIP
            </button>
          )}

          {/* Continue / Launch Button */}
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleContinue}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                backgroundColor: colors.charcoal,
                color: colors.white,
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              CONTINUE
              <ChevronRightIcon size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunchPortfolio}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                backgroundColor: colors.camel,
                color: colors.white,
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              <RocketIcon size={16} />
              {isSaving ? 'LAUNCHING...' : 'LAUNCH PORTFOLIO'}
            </button>
          )}
        </div>
      </FormCard>

      {/* Progress Indicator */}
      <ProgressIndicator collectedCount={collectedFields} />
    </OnboardingLayout>
  );
}
