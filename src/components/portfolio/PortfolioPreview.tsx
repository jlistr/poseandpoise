'use client';

import { useState, useCallback, useMemo, useTransition, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTemplate, TEMPLATE_METADATA } from '@/templates';
import {
  savePhotoUpdates, 
  saveTemplate, 
  togglePublished,
  saveProfileUpdate,
  saveServices,
  uploadAvatar,
  uploadPortfolioPhoto,
  deletePortfolioPhoto,
} from '@/app/actions/portfolio';
import type { PortfolioData, PortfolioPhoto, ServiceItem, SavedCompCard } from '@/types/portfolio';
import {
  EyeIcon,
  CheckIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
} from '@/components/icons/Icons';

// =============================================================================
// Edit Mode Context - Provides edit state and handlers to all template pages
// =============================================================================
interface EditModeContextValue {
  isEditMode: boolean;
  canEdit: boolean;
  // Photo editing
  photos: PortfolioPhoto[];
  onPhotosChange: (photos: PortfolioPhoto[]) => void;
  onTogglePhotoVisibility: (photoId: string) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
  onAddPhotos: (files: FileList) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  isUploadingPhotos: boolean;
  // Profile editing
  bio: string;
  onBioChange: (value: string) => void;
  avatarUrl: string;
  onAvatarUpload: (file: File) => Promise<void>;
  // Services editing
  services: ServiceItem[];
  onServicesChange: (services: ServiceItem[]) => void;
  onAddService: () => void;
  onUpdateService: (index: number, field: keyof ServiceItem, value: string) => void;
  onRemoveService: (index: number) => void;
  // Comp cards
  compCards: SavedCompCard[];
  selectedCompCardId: string | null;
  onCompCardSelect: (id: string) => void;
  // Page title editing
  pageTitle: string;
  onPageTitleChange: (value: string) => void;
  // Save status
  isSaving: boolean;
  hasChanges: boolean;
  // Accent color from template
  accentColor: string;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function useEditMode() {
  return useContext(EditModeContext);
}

// =============================================================================
// Main Component
// =============================================================================
interface PortfolioPreviewProps {
  data: PortfolioData;
  username: string;
  canEdit?: boolean;
  initialEditMode?: boolean;
}

export function PortfolioPreview({ data, username, canEdit = true, initialEditMode = false }: PortfolioPreviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Edit mode toggle - can be initialized via prop (e.g., from URL query param)
  const [isEditMode, setIsEditMode] = useState(initialEditMode && canEdit);
  
  // State for editable data
  const [photos, setPhotos] = useState<PortfolioPhoto[]>(data.photos);
  const [bio, setBio] = useState(data.profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(data.profile.avatarUrl);
  const [services, setServices] = useState<ServiceItem[]>(data.services || []);
  const [selectedTemplate, setSelectedTemplate] = useState(data.settings.template);
  const [isPublished, setIsPublished] = useState(data.settings.isPublished);
  const [pageTitle, setPageTitle] = useState(`Professional Modeling Services in ${data.profile.location || 'Your Area'}`);
  const [selectedCompCardId, setSelectedCompCardId] = useState<string | null>(
    data.compCards?.find(c => c.isPrimary)?.id || null
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  
  // Get accent color from selected template
  const currentTemplateData = TEMPLATE_METADATA.find(t => t.id === selectedTemplate);
  const accentColor = currentTemplateData?.accentColor || '#C4A484';
  
  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (selectedTemplate !== data.settings.template) return true;
    if (bio !== data.profile.bio) return true;
    if (avatarUrl !== data.profile.avatarUrl) return true;
    if (JSON.stringify(services) !== JSON.stringify(data.services || [])) return true;
    
    for (let i = 0; i < photos.length; i++) {
      const current = photos[i];
      const original = data.photos.find(p => p.id === current.id);
      if (!original) continue;
      if (current.sortOrder !== original.sortOrder) return true;
      if (current.isVisible !== original.isVisible) return true;
    }
    
    return false;
  }, [photos, selectedTemplate, bio, avatarUrl, services, data]);

  // Photo handlers
  const handlePhotosChange = useCallback((newPhotos: PortfolioPhoto[]) => {
    setPhotos(newPhotos);
    setSaveStatus('idle');
  }, []);

  const handleTogglePhotoVisibility = useCallback((photoId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, isVisible: !p.isVisible } : p
    ));
    setSaveStatus('idle');
  }, []);

  const handleReorderPhotos = useCallback((fromIndex: number, toIndex: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      const [removed] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, removed);
      // Update sort order
      return newPhotos.map((p, i) => ({ ...p, sortOrder: i }));
    });
    setSaveStatus('idle');
  }, []);

  // Photo upload handler
  const handleAddPhotos = useCallback(async (files: FileList) => {
    setIsUploadingPhotos(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadPortfolioPhoto(formData);
      });

      const results = await Promise.all(uploadPromises);
      
      // Add successfully uploaded photos to state
      const newPhotos: PortfolioPhoto[] = [];
      for (const result of results) {
        if (result.success && result.photo) {
          newPhotos.push({
            id: result.photo.id,
            url: result.photo.url,
            thumbnailUrl: result.photo.url,
            sortOrder: result.photo.sortOrder,
            isVisible: result.photo.isVisible,
          });
        }
      }

      if (newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...newPhotos]);
        setSaveStatus('idle');
      }

      // Report any errors
      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        console.error('Some photos failed to upload:', errors.map(e => e.error));
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setIsUploadingPhotos(false);
    }
  }, []);

  // Photo delete handler
  const handleDeletePhoto = useCallback(async (photoId: string) => {
    const result = await deletePortfolioPhoto(photoId);
    
    if (result.success) {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      setSaveStatus('idle');
    } else {
      console.error('Failed to delete photo:', result.error);
    }
  }, []);

  // Avatar upload handler
  const handleAvatarUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadAvatar(formData);
    if (result.success && result.url) {
      setAvatarUrl(result.url);
      setSaveStatus('idle');
    } else {
      console.error('Failed to upload avatar:', result.error);
    }
  }, []);

  // Services handlers
  const handleAddService = useCallback(() => {
    setServices(prev => [...prev, { title: 'New Service', description: '', price: '$0' }]);
    setSaveStatus('idle');
  }, []);

  const handleUpdateService = useCallback((index: number, field: keyof ServiceItem, value: string) => {
    setServices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setSaveStatus('idle');
  }, []);

  const handleRemoveService = useCallback((index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
    setSaveStatus('idle');
  }, []);

  // Save all changes
  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    
    try {
      // Save photo updates
      const photoUpdates = photos.map(p => ({
        id: p.id,
        sortOrder: p.sortOrder,
        isVisible: p.isVisible,
      }));
      
      const photoResult = await savePhotoUpdates(photoUpdates);
      if (!photoResult.success) {
        setSaveStatus('error');
        return;
      }
      
      // Save template if changed
      if (selectedTemplate !== data.settings.template) {
        const templateResult = await saveTemplate(selectedTemplate);
        if (!templateResult.success) {
          setSaveStatus('error');
          return;
        }
      }
      
      // Save profile updates
      if (bio !== data.profile.bio || avatarUrl !== data.profile.avatarUrl) {
        const profileResult = await saveProfileUpdate({
          bio,
          avatarUrl: avatarUrl !== data.profile.avatarUrl ? avatarUrl : undefined,
        });
        if (!profileResult.success) {
          setSaveStatus('error');
          return;
        }
      }
      
      // Save services if changed
      if (JSON.stringify(services) !== JSON.stringify(data.services || [])) {
        const servicesResult = await saveServices(
          services.map((s, i) => ({
            title: s.title,
            description: s.description,
            price: s.price || '',
            sortOrder: i,
          }))
        );
        if (!servicesResult.success) {
          setSaveStatus('error');
          return;
        }
      }
      
      setSaveStatus('saved');
      startTransition(() => router.refresh());
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
    }
  }, [photos, selectedTemplate, bio, avatarUrl, services, data, router]);

  // Toggle edit mode and save
  const handleToggleEditMode = useCallback(() => {
    if (isEditMode && hasChanges) {
      // Exiting edit mode with unsaved changes - prompt to save
      if (confirm('You have unsaved changes. Save before exiting?')) {
        handleSave().then(() => setIsEditMode(false));
      } else {
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  }, [isEditMode, hasChanges, handleSave]);

  // Publish toggle
  const handlePublish = useCallback(async () => {
    setSaveStatus('saving');
    const result = await togglePublished(!isPublished);
    
    if (result.success) {
      setIsPublished(!isPublished);
      setSaveStatus('saved');
      startTransition(() => router.refresh());
    } else {
      setSaveStatus('error');
    }
  }, [isPublished, router]);

  // Build preview data with edits applied
  const previewData = useMemo(() => {
    const visiblePhotos = photos
      .filter(p => p.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    return {
      ...data,
      profile: { ...data.profile, bio, avatarUrl },
      photos: isEditMode ? photos : visiblePhotos, // Show all in edit mode
      services,
      compCards: data.compCards || [], // Ensure compCards are passed through
      settings: { ...data.settings, template: selectedTemplate },
    };
  }, [data, photos, bio, avatarUrl, services, selectedTemplate, isEditMode]);

  // Context value for child components
  const editModeValue: EditModeContextValue = {
    isEditMode: isEditMode && canEdit,
    canEdit,
    photos,
    onPhotosChange: handlePhotosChange,
    onTogglePhotoVisibility: handleTogglePhotoVisibility,
    onReorderPhotos: handleReorderPhotos,
    onAddPhotos: handleAddPhotos,
    onDeletePhoto: handleDeletePhoto,
    isUploadingPhotos,
    bio,
    onBioChange: (value) => { setBio(value); setSaveStatus('idle'); },
    avatarUrl,
    onAvatarUpload: handleAvatarUpload,
    services,
    onServicesChange: (s) => { setServices(s); setSaveStatus('idle'); },
    onAddService: handleAddService,
    onUpdateService: handleUpdateService,
    onRemoveService: handleRemoveService,
    compCards: data.compCards || [],
    selectedCompCardId,
    onCompCardSelect: setSelectedCompCardId,
    pageTitle,
    onPageTitleChange: (value) => { setPageTitle(value); setSaveStatus('idle'); },
    isSaving: saveStatus === 'saving',
    hasChanges,
    accentColor,
  };

  const Template = getTemplate(selectedTemplate);

  return (
    <EditModeContext.Provider value={editModeValue}>
      <div style={{ minHeight: '100vh' }}>
        {/* Toolbar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: '#1A1A1A',
            borderBottom: '1px solid rgba(196, 164, 132, 0.2)',
          }}
        >
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {/* Left side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '13px',
                  color: 'rgba(250, 249, 247, 0.7)',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeftIcon size={14} />
                <span>Dashboard</span>
              </Link>
              
              <div style={{ width: '1px', height: '20px', background: 'rgba(250, 249, 247, 0.15)' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EyeIcon size={14} color="rgba(250, 249, 247, 0.6)" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'rgba(250, 249, 247, 0.6)' }}>
                  Preview Mode
                </span>
              </div>
            </div>

            {/* Center */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Current Template Display */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(250, 249, 247, 0.05)',
                border: '1px solid rgba(250, 249, 247, 0.1)',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: accentColor,
                }} />
                <span style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '14px',
                  color: '#FAF9F7',
                }}>
                  {currentTemplateData?.name || 'Elysian'}
                </span>
                <Link
                  href="/dashboard/templates"
                  style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    background: 'rgba(250, 249, 247, 0.1)',
                    borderRadius: '3px',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    color: 'rgba(250, 249, 247, 0.7)',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                  }}
                >
                  Change
                </Link>
              </div>

              {/* Edit Mode Toggle - Combined with Save */}
              {canEdit && (
                <button
                  onClick={async () => {
                    if (isEditMode) {
                      // Save and exit
                      await handleSave();
                      setIsEditMode(false);
                    } else {
                      setIsEditMode(true);
                    }
                  }}
                  disabled={saveStatus === 'saving'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isEditMode 
                      ? hasChanges 
                        ? '#22C55E' 
                        : '#C4A484' 
                      : 'rgba(250, 249, 247, 0.08)',
                    border: '1px solid rgba(250, 249, 247, 0.15)',
                    padding: '8px 14px',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '13px',
                    color: isEditMode ? '#1A1A1A' : '#FAF9F7',
                    cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: saveStatus === 'saving' ? 0.7 : 1,
                  }}
                >
                  {saveStatus === 'saving' ? (
                    <><Spinner /><span>Saving...</span></>
                  ) : isEditMode ? (
                    <><CheckIcon size={14} /><span>Save & Exit</span></>
                  ) : (
                    <><EditIcon /><span>Edit Mode</span></>
                  )}
                </button>
              )}

              {/* Separate Save Button when in Edit Mode */}
              {canEdit && isEditMode && hasChanges && (
                <button
                  onClick={() => setIsEditMode(false)}
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    border: '1px solid rgba(250, 249, 247, 0.2)',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '12px',
                    color: 'rgba(250, 249, 247, 0.7)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Launch Portfolio Button */}
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#C4A484',
                  color: '#1A1A1A',
                  padding: '8px 14px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                <span>Launch Site</span>
                <ExternalLinkIcon size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Edit Mode Hint Banner */}
        {isEditMode && canEdit && (
          <div
            style={{
              background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}DD 100%)`,
              padding: '10px 24px',
              textAlign: 'center',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: '#1A1A1A',
            }}
          >
            <strong>Edit Mode Active</strong> — Click on text, images, or elements to edit them directly. 
            Click <strong>"Save & Exit"</strong> when done.
          </div>
        )}

        {/* Subscription Upgrade Banner (for free users) */}
        {!canEdit && (
          <div
            style={{
              background: 'linear-gradient(90deg, #1A1A1A 0%, #2A2A2A 100%)',
              padding: '12px 24px',
              textAlign: 'center',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              color: '#FAF9F7',
              borderBottom: '1px solid rgba(196, 164, 132, 0.2)',
            }}
          >
            <span style={{ color: 'rgba(250, 249, 247, 0.7)' }}>
              Upgrade to <strong style={{ color: '#C4A484' }}>Professional</strong> or{' '}
              <strong style={{ color: '#C4A484' }}>Deluxe</strong> to unlock inline editing.
            </span>
            <Link
              href="/pricing"
              style={{
                marginLeft: '16px',
                padding: '6px 14px',
                background: '#C4A484',
                borderRadius: '4px',
                color: '#1A1A1A',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '12px',
              }}
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Template */}
        <Template data={previewData} />
      </div>
    </EditModeContext.Provider>
  );
}

// =============================================================================
// Icons
// =============================================================================
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.474 5.408L18.592 7.526M17.836 3.672L12.109 9.399C11.779 9.729 11.539 10.138 11.412 10.587L10.5 14L13.913 13.088C14.362 12.961 14.771 12.721 15.101 12.391L20.828 6.664C21.391 6.101 21.391 5.193 20.828 4.63L19.87 3.672C19.307 3.109 18.399 3.109 17.836 3.672Z" />
      <path d="M19 15V18C19 19.1046 18.1046 20 17 20H6C4.89543 20 4 19.1046 4 18V7C4 5.89543 4.89543 5 6 5H9" />
    </svg>
  );
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes portfolioSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '14px', height: '14px', border: '2px solid rgba(26, 26, 26, 0.2)', borderTopColor: '#1A1A1A', borderRadius: '50%', animation: 'portfolioSpin 0.8s linear infinite' }} />
    </>
  );
}
