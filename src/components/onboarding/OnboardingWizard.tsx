"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AIOnboardingChat } from "./AIOnboardingChat";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Template metadata (inline to avoid import issues)
const TEMPLATE_OPTIONS = [
  {
    id: 'rose',
    name: 'Rosé',
    description: 'Soft editorial blush with feminine elegance',
    isPremium: false,
    accentColor: '#FF7AA2',
  },
  {
    id: 'poise',
    name: 'Poise',
    description: 'Timeless elegance with warm neutrals',
    isPremium: false,
    accentColor: '#C4A484',
  },
  {
    id: 'lumiere',
    name: 'Lumière',
    description: 'Golden hour warmth with editorial flair',
    isPremium: false,
    accentColor: '#C8553D',
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Bold monochrome with dramatic contrast',
    isPremium: true,
    accentColor: '#FFFFFF',
  },
];

// Step labels for progress indicator (Step 0 = AI Setup)
const STEP_LABELS = ['AI Setup', 'Profile', 'About', 'Services', 'Template', 'Photos'];

// =============================================================================
// Types
// =============================================================================
interface OnboardingData {
  // Step 1: Profile
  displayName: string;
  username: string;
  location: string;
  instagram: string;
  tiktok: string;
  website: string;
  
  // Step 2: About
  bio: string;
  avatarUrl: string | null;
  avatarFile: File | null;
  heightCm: string;
  bustCm: string;
  waistCm: string;
  hipsCm: string;
  shoeSize: string;
  hairColor: string;
  eyeColor: string;
  
  // Step 3: Services
  servicesTitle: string;
  compCardImage: File | null;
  services: Array<{ title: string; description: string; price: string }>;
  
  // Step 4: Template
  selectedTemplate: string;
  
  // Step 5: Photos
  photos: File[];
}

interface OnboardingWizardProps {
  userEmail: string;
  userId: string;
  existingProfile?: {
    display_name?: string | null;
    username?: string | null;
    location?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  };
}

// =============================================================================
// Styles
// =============================================================================
const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#FAF9F7",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: "#1A1A1A",
    overflow: "hidden",
  },
  header: {
    padding: "16px 32px",
    borderBottom: "1px solid rgba(26, 26, 26, 0.08)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "24px",
    backgroundColor: "#FAF9F7",
  },
  progressContainer: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  progressStep: (active: boolean, completed: boolean, clickable: boolean) => ({
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "6px",
    cursor: clickable ? "pointer" : "default",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    backgroundColor: active ? "rgba(196, 164, 132, 0.1)" : "transparent",
  }),
  progressDot: (active: boolean, completed: boolean) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: completed ? "#1A1A1A" : active ? "#C4A484" : "rgba(26, 26, 26, 0.15)",
    transition: "all 0.3s ease",
  }),
  progressLabel: (active: boolean, completed: boolean) => ({
    fontFamily: "'Outfit', sans-serif",
    fontSize: "10px",
    fontWeight: active ? 600 : 400,
    letterSpacing: "0.5px",
    color: completed ? "#1A1A1A" : active ? "#C4A484" : "rgba(26, 26, 26, 0.4)",
    textTransform: "uppercase" as const,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap" as const,
  }),
  progressLine: (completed: boolean) => ({
    width: "20px",
    height: "2px",
    backgroundColor: completed ? "#1A1A1A" : "rgba(26, 26, 26, 0.1)",
    transition: "all 0.3s ease",
    flexShrink: 0,
  }),
  main: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "48px 24px 120px",
  },
  stepHeader: {
    textAlign: "center" as const,
    marginBottom: "40px",
  },
  stepLabel: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#FF7AA2",
    marginBottom: "12px",
  },
  stepTitle: {
    fontSize: "clamp(28px, 5vw, 40px)",
    fontWeight: 300,
    marginBottom: "12px",
  },
  stepDescription: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "15px",
    color: "rgba(26, 26, 26, 0.6)",
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  label: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13px",
    fontWeight: 500,
    color: "#1A1A1A",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "14px 16px",
    fontSize: "15px",
    fontFamily: "'Outfit', sans-serif",
    border: "1px solid rgba(26, 26, 26, 0.15)",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "#1A1A1A",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  textarea: {
    padding: "14px 16px",
    fontSize: "15px",
    fontFamily: "'Outfit', sans-serif",
    border: "1px solid rgba(26, 26, 26, 0.15)",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "#1A1A1A",
    outline: "none",
    resize: "vertical" as const,
    minHeight: "120px",
    lineHeight: 1.6,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  row3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },
  footer: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px 32px",
    backgroundColor: "white",
    borderTop: "1px solid rgba(26, 26, 26, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  button: (primary: boolean) => ({
    padding: "14px 32px",
    fontSize: "14px",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    letterSpacing: "1px",
    border: primary ? "none" : "1px solid rgba(26, 26, 26, 0.2)",
    borderRadius: "8px",
    backgroundColor: primary ? "#1A1A1A" : "transparent",
    color: primary ? "white" : "#1A1A1A",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }),
  skipButton: {
    padding: "14px 24px",
    fontSize: "13px",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 400,
    border: "none",
    backgroundColor: "transparent",
    color: "rgba(26, 26, 26, 0.5)",
    cursor: "pointer",
    textDecoration: "underline",
  },
  avatarUpload: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "16px",
  },
  avatarPreview: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "rgba(26, 26, 26, 0.05)",
    border: "3px solid #FF7AA2",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative" as const,
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
  },
  photoUploadBox: {
    aspectRatio: "1",
    border: "2px dashed rgba(26, 26, 26, 0.15)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "white",
  },
  photoPreview: {
    aspectRatio: "1",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative" as const,
  },
  serviceCard: {
    padding: "20px",
    backgroundColor: "white",
    border: "1px solid rgba(26, 26, 26, 0.1)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  upsellCard: {
    background: "linear-gradient(135deg, #FFF5F7 0%, #FFF9F0 100%)",
    border: "2px solid #FF7AA2",
    borderRadius: "16px",
    padding: "32px",
    textAlign: "center" as const,
    marginTop: "32px",
  },
  error: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13px",
    color: "#D64545",
    marginTop: "4px",
  },
};

// =============================================================================
// Component
// =============================================================================
export function OnboardingWizard({ userEmail, userId, existingProfile }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const compCardInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<OnboardingData>({
    // Step 1
    displayName: existingProfile?.display_name || "",
    username: existingProfile?.username || "",
    location: existingProfile?.location || "",
    instagram: "",
    tiktok: "",
    website: "",
    // Step 2
    bio: existingProfile?.bio || "",
    avatarUrl: existingProfile?.avatar_url || null,
    avatarFile: null,
    heightCm: "",
    bustCm: "",
    waistCm: "",
    hipsCm: "",
    shoeSize: "",
    hairColor: "",
    eyeColor: "",
    // Step 3
    servicesTitle: "My Services",
    compCardImage: null,
    services: [{ title: "", description: "", price: "" }],
    // Step 4
    selectedTemplate: "rose",
    // Step 5
    photos: [],
  });

  const totalSteps = 6; // Including AI Setup step (step 0)

  // =========================================================================
  // Handlers
  // =========================================================================
  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use BigDataCloud's free reverse geocoding API (no API key needed)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (!response.ok) throw new Error("Failed to get location");
          
          const locationData = await response.json();
          const city = locationData.city || locationData.locality || locationData.principalSubdivision || "";
          const country = locationData.countryName || "";
          
          const locationString = [city, country].filter(Boolean).join(", ");
          updateData({ location: locationString });
        } catch {
          setError("Could not determine your location");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied. Please enable it in your browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information unavailable");
            break;
          case err.TIMEOUT:
            setError("Location request timed out");
            break;
          default:
            setError("Could not get your location");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({ 
        avatarFile: file,
        avatarUrl: URL.createObjectURL(file),
      });
    }
  };

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxPhotos = 10;
    const remainingSlots = maxPhotos - data.photos.length;
    const newPhotos = files.slice(0, remainingSlots);
    updateData({ photos: [...data.photos, ...newPhotos] });
  };

  const removePhoto = (index: number) => {
    updateData({ photos: data.photos.filter((_, i) => i !== index) });
  };

  const addService = () => {
    if (data.services.length < 10) {
      updateData({ 
        services: [...data.services, { title: "", description: "", price: "" }] 
      });
    }
  };

  const removeService = (index: number) => {
    updateData({ services: data.services.filter((_, i) => i !== index) });
  };

  const updateService = (index: number, field: string, value: string) => {
    const newServices = [...data.services];
    newServices[index] = { ...newServices[index], [field]: value };
    updateData({ services: newServices });
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!data.displayName.trim()) {
          setError("Please enter your display name");
          return false;
        }
        if (!data.username.trim()) {
          setError("Please choose a username");
          return false;
        }
        if (!/^[a-z0-9_-]{3,20}$/.test(data.username.toLowerCase())) {
          setError("Username must be 3-20 characters (letters, numbers, hyphens, underscores)");
          return false;
        }
        return true;
      case 2:
      case 3:
      case 4:
      case 5:
        return true; // These steps are optional
      default:
        return true;
    }
  };

  const saveStepData = async (): Promise<boolean> => {
    try {
      const formData = new FormData();
      
      // Always include basic profile data
      formData.append("username", data.username.toLowerCase().trim());
      formData.append("display_name", data.displayName.trim());
      
      if (currentStep === 1) {
        formData.append("location", data.location.trim());
        formData.append("instagram", data.instagram.trim());
        formData.append("tiktok", data.tiktok.trim());
        formData.append("website", data.website.trim());
      }
      
      if (currentStep === 2) {
        formData.append("bio", data.bio.trim());
        formData.append("height_cm", data.heightCm);
        formData.append("bust_cm", data.bustCm);
        formData.append("waist_cm", data.waistCm);
        formData.append("hips_cm", data.hipsCm);
        formData.append("shoe_size", data.shoeSize);
        formData.append("hair_color", data.hairColor);
        formData.append("eye_color", data.eyeColor);
        
        // Upload avatar if new file selected
        if (data.avatarFile) {
          const avatarFormData = new FormData();
          avatarFormData.append("file", data.avatarFile);
          
          const avatarRes = await fetch("/api/onboarding/upload-avatar", {
            method: "POST",
            body: avatarFormData,
          });
          
          if (!avatarRes.ok) {
            const err = await avatarRes.json();
            throw new Error(err.error || "Failed to upload avatar");
          }
        }
      }
      
      // Save profile updates
      const res = await fetch("/api/onboarding/update-profile", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      
      // Step 3: Save services
      if (currentStep === 3 && data.services.some(s => s.title.trim())) {
        const servicesRes = await fetch("/api/onboarding/save-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            services: data.services.filter(s => s.title.trim()),
          }),
        });
        
        if (!servicesRes.ok) {
          console.error("Failed to save services");
        }
      }
      
      // Step 4: Save template selection
      if (currentStep === 4) {
        const templateRes = await fetch("/api/onboarding/save-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: data.selectedTemplate,
          }),
        });
        
        if (!templateRes.ok) {
          console.error("Failed to save template");
        }
      }
      
      // Step 5: Upload photos
      if (currentStep === 5 && data.photos.length > 0) {
        for (const photo of data.photos) {
          const photoFormData = new FormData();
          photoFormData.append("file", photo);
          
          await fetch("/api/onboarding/upload-photo", {
            method: "POST",
            body: photoFormData,
          });
        }
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    const saved = await saveStepData();
    setLoading(false);
    
    if (saved) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        await completeOnboarding();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkip = async () => {
    // Mark current step as completed (skipped)
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await completeOnboarding();
    }
  };

  const handleStepClick = (step: number) => {
    // Can only navigate to completed steps or current step
    if (step <= currentStep || completedSteps.has(step)) {
      setCurrentStep(step);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
      });
      
      if (!res.ok) {
        throw new Error("Failed to complete onboarding");
      }
      
      router.push("/dashboard?welcome=true");
    } catch (err) {
      setError("Failed to complete setup. Please try again.");
      setLoading(false);
    }
  };

  // =========================================================================
  // AI Onboarding Handlers
  // =========================================================================
  const handleAIComplete = (aiData: Record<string, unknown>) => {
    // Apply extracted data from AI chat
    const updates: Partial<OnboardingData> = {};
    
    if (aiData.displayName) updates.displayName = aiData.displayName as string;
    if (aiData.username) updates.username = aiData.username as string;
    if (aiData.location) updates.location = aiData.location as string;
    if (aiData.instagram) updates.instagram = aiData.instagram as string;
    if (aiData.tiktok) updates.tiktok = aiData.tiktok as string;
    if (aiData.website) updates.website = aiData.website as string;
    if (aiData.bio) updates.bio = aiData.bio as string;
    if (aiData.heightCm) updates.heightCm = aiData.heightCm as string;
    if (aiData.bustCm) updates.bustCm = aiData.bustCm as string;
    if (aiData.waistCm) updates.waistCm = aiData.waistCm as string;
    if (aiData.hipsCm) updates.hipsCm = aiData.hipsCm as string;
    if (aiData.shoeSize) updates.shoeSize = aiData.shoeSize as string;
    if (aiData.hairColor) updates.hairColor = aiData.hairColor as string;
    if (aiData.eyeColor) updates.eyeColor = aiData.eyeColor as string;
    if (aiData.servicesTitle) updates.servicesTitle = aiData.servicesTitle as string;
    if (aiData.services && Array.isArray(aiData.services)) {
      updates.services = aiData.services as Array<{ title: string; description: string; price: string }>;
    }
    if (aiData.selectedTemplate) updates.selectedTemplate = aiData.selectedTemplate as string;
    
    updateData(updates);
    setCompletedSteps(prev => new Set([...prev, 0]));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAISkip = () => {
    setCompletedSteps(prev => new Set([...prev, 0]));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================================================================
  // Render Steps
  // =========================================================================
  
  // Step 0: AI-Powered Setup
  const renderStep0 = () => (
    <AIOnboardingChat
      onComplete={handleAIComplete}
      onSkip={handleAISkip}
      userEmail={userEmail}
      userName={data.displayName || existingProfile?.display_name || undefined}
      subscriptionTier="free"
    />
  );
  
  const renderStep1 = () => (
    <>
      <div style={styles.stepHeader}>
        <p style={styles.stepLabel}>Step 1 of 5</p>
        <h1 style={styles.stepTitle}>Set Up Your Profile</h1>
        <p style={styles.stepDescription}>
          Let&apos;s start with the basics. Tell us who you are and how people can find you.
        </p>
      </div>
      
      <div style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Display Name *</label>
          <input
            type="text"
            placeholder="Your professional name"
            value={data.displayName}
            onChange={(e) => updateData({ displayName: e.target.value })}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Username *</label>
          <input
            type="text"
            placeholder="yourname (for your portfolio URL)"
            value={data.username}
            onChange={(e) => updateData({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
            style={styles.input}
            required
          />
          <p style={{ ...styles.stepDescription, fontSize: "12px", marginTop: "4px" }}>
            Your portfolio will be at poseandpoise.com/{data.username || "yourname"}
          </p>
        </div>
        
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Location</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="City, Country"
              value={data.location}
              onChange={(e) => updateData({ location: e.target.value })}
              style={{ ...styles.input, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locationLoading}
              style={{
                padding: "14px 16px",
                border: "1px solid rgba(26, 26, 26, 0.15)",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: locationLoading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              title="Get my location"
            >
              {locationLoading ? (
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="rgba(26,26,26,0.4)" 
                  strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(26,26,26,0.6)" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="8" strokeDasharray="2 4" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Instagram</label>
            <input
              type="text"
              placeholder="@handle"
              value={data.instagram}
              onChange={(e) => updateData({ instagram: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>TikTok</label>
            <input
              type="text"
              placeholder="@handle"
              value={data.tiktok}
              onChange={(e) => updateData({ tiktok: e.target.value })}
              style={styles.input}
            />
          </div>
        </div>
        
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Website</label>
          <input
            type="url"
            placeholder="https://yourwebsite.com"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
            style={styles.input}
          />
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div style={styles.stepHeader}>
        <p style={styles.stepLabel}>Step 2 of 5</p>
        <h1 style={styles.stepTitle}>About You</h1>
        <p style={styles.stepDescription}>
          Share your story and measurements. This information appears on your About page.
        </p>
      </div>
      
      <div style={styles.form}>
        {/* Avatar Upload */}
        <div style={styles.avatarUpload}>
          <div 
            style={styles.avatarPreview}
            onClick={() => avatarInputRef.current?.click()}
          >
            {data.avatarUrl ? (
              <Image
                src={data.avatarUrl}
                alt="Profile"
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(26,26,26,0.3)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            style={{ ...styles.button(false), padding: "10px 20px", fontSize: "13px" }}
          >
            {data.avatarUrl ? "Change Photo" : "Upload Photo"}
          </button>
        </div>
        
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Bio</label>
          <textarea
            placeholder="Tell your story... What makes you unique? What are your goals?"
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            style={styles.textarea}
            rows={5}
          />
        </div>
        
        <div style={{ marginTop: "16px" }}>
          <label style={{ ...styles.label, marginBottom: "16px", display: "block" }}>
            Measurements (Optional)
          </label>
          
          <div style={styles.row3}>
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, fontSize: "11px", color: "rgba(26,26,26,0.5)" }}>Height (cm)</label>
              <input
                type="number"
                placeholder="175"
                value={data.heightCm}
                onChange={(e) => updateData({ heightCm: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, fontSize: "11px", color: "rgba(26,26,26,0.5)" }}>Bust (cm)</label>
              <input
                type="number"
                placeholder="86"
                value={data.bustCm}
                onChange={(e) => updateData({ bustCm: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, fontSize: "11px", color: "rgba(26,26,26,0.5)" }}>Waist (cm)</label>
              <input
                type="number"
                placeholder="61"
                value={data.waistCm}
                onChange={(e) => updateData({ waistCm: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={{ ...styles.row3, marginTop: "12px" }}>
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, fontSize: "11px", color: "rgba(26,26,26,0.5)" }}>Hips (cm)</label>
              <input
                type="number"
                placeholder="89"
                value={data.hipsCm}
                onChange={(e) => updateData({ hipsCm: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, fontSize: "11px", color: "rgba(26,26,26,0.5)" }}>Shoe Size</label>
              <input
                type="text"
                placeholder="EU 39"
                value={data.shoeSize}
                onChange={(e) => updateData({ shoeSize: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, fontSize: "11px", color: "rgba(26,26,26,0.5)" }}>Hair Color</label>
              <input
                type="text"
                placeholder="Brunette"
                value={data.hairColor}
                onChange={(e) => updateData({ hairColor: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={{ ...styles.row, marginTop: "12px", gridTemplateColumns: "1fr 2fr" }}>
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, fontSize: "11px", color: "rgba(26,26,26,0.5)" }}>Eye Color</label>
              <input
                type="text"
                placeholder="Brown"
                value={data.eyeColor}
                onChange={(e) => updateData({ eyeColor: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div style={styles.stepHeader}>
        <p style={styles.stepLabel}>Step 3 of 5</p>
        <h1 style={styles.stepTitle}>Your Services</h1>
        <p style={styles.stepDescription}>
          What services do you offer? Add your rates and let clients know what you can do.
        </p>
      </div>
      
      <div style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Services Page Title</label>
          <input
            type="text"
            placeholder="My Services"
            value={data.servicesTitle}
            onChange={(e) => updateData({ servicesTitle: e.target.value })}
            style={styles.input}
          />
        </div>
        
        <div>
          <label style={{ ...styles.label, marginBottom: "16px", display: "block" }}>
            Services
          </label>
          
          {data.services.map((service, index) => (
            <div key={index} style={{ ...styles.serviceCard, marginBottom: "12px" }}>
              <div style={styles.row}>
                <input
                  type="text"
                  placeholder="Service name (e.g., Editorial Shoot)"
                  value={service.title}
                  onChange={(e) => updateService(index, "title", e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Price (e.g., $500/day)"
                  value={service.price}
                  onChange={(e) => updateService(index, "price", e.target.value)}
                  style={styles.input}
                />
              </div>
              <textarea
                placeholder="Brief description of this service..."
                value={service.description}
                onChange={(e) => updateService(index, "description", e.target.value)}
                style={{ ...styles.textarea, minHeight: "80px" }}
              />
              {data.services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  style={{
                    ...styles.skipButton,
                    color: "#D64545",
                    alignSelf: "flex-start",
                    padding: "4px 0",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          {data.services.length < 10 && (
            <button
              type="button"
              onClick={addService}
              style={{
                ...styles.button(false),
                width: "100%",
                marginTop: "8px",
                borderStyle: "dashed",
              }}
            >
              + Add Another Service
            </button>
          )}
        </div>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      <div style={styles.stepHeader}>
        <p style={styles.stepLabel}>Step 4 of 5</p>
        <h1 style={styles.stepTitle}>Choose Your Template</h1>
        <p style={styles.stepDescription}>
          Select a template for your portfolio. You can always change it later.
        </p>
      </div>
      
      <div style={styles.form}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
        }}>
          {TEMPLATE_OPTIONS.map((template) => {
            const isSelected = data.selectedTemplate === template.id;
            const isLocked = template.isPremium;
            const isDark = template.id === 'noir';
            
            return (
              <button
                type="button"
                key={template.id}
                onClick={() => {
                  if (!isLocked) {
                    updateData({ selectedTemplate: template.id });
                  }
                }}
                style={{
                  position: "relative",
                  padding: 0,
                  borderRadius: "12px",
                  border: isSelected 
                    ? `2px solid ${template.accentColor}` 
                    : "1px solid rgba(26, 26, 26, 0.1)",
                  backgroundColor: "white",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  opacity: isLocked ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  overflow: "hidden",
                  boxShadow: isSelected ? `0 4px 20px ${template.accentColor}25` : "0 2px 8px rgba(26, 26, 26, 0.04)",
                }}
              >
                {/* PRO Badge */}
                {isLocked && (
                  <span style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: "0.5px",
                    backgroundColor: "rgba(26, 26, 26, 0.9)",
                    color: "white",
                    borderRadius: "4px",
                    zIndex: 10,
                  }}>
                    <span style={{ fontSize: "10px" }}>🔒</span>
                    PRO
                  </span>
                )}
                
                {/* Selected Check */}
                {isSelected && (
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: template.accentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#1A1A1A" : "white"} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                
                {/* Template Thumbnail */}
                <div style={{
                  padding: "20px",
                  paddingBottom: "16px",
                  background: isDark ? "#1A1A1A" : "#f8f8f8",
                }}>
                  <TemplateThumbnail templateId={template.id} accentColor={template.accentColor} />
                </div>
                
                {/* Template Info */}
                <div style={{ padding: "16px 20px 20px" }}>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#1A1A1A",
                    marginBottom: "6px",
                  }}>
                    {template.name}
                  </h3>
                  <p style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px",
                    color: "rgba(26, 26, 26, 0.5)",
                    lineHeight: 1.4,
                  }}>
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Upgrade prompt for premium templates */}
        <div style={{
          marginTop: "24px",
          padding: "20px",
          backgroundColor: "rgba(26, 26, 26, 0.03)",
          borderRadius: "12px",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "14px",
            color: "rgba(26, 26, 26, 0.6)",
            marginBottom: "12px",
          }}>
            Want access to <strong>Noir</strong> and future premium templates?
          </p>
          <Link
            href="/pricing"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              backgroundColor: "#1A1A1A",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </>
  );

  const renderStep5 = () => (
    <>
      <div style={styles.stepHeader}>
        <p style={styles.stepLabel}>Step 5 of 5</p>
        <h1 style={styles.stepTitle}>Your Portfolio</h1>
        <p style={styles.stepDescription}>
          Upload up to 10 photos to showcase your best work. You can always add more later.
        </p>
      </div>
      
      <div style={styles.form}>
        <div style={styles.photoGrid}>
          {data.photos.map((photo, index) => (
            <div key={index} style={styles.photoPreview}>
              <Image
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          ))}
          
          {data.photos.length < 10 && (
            <div 
              style={styles.photoUploadBox}
              onClick={() => photosInputRef.current?.click()}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(26,26,26,0.3)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "rgba(26,26,26,0.5)", marginTop: "8px" }}>
                Add Photo
              </span>
            </div>
          )}
        </div>
        
        <input
          ref={photosInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotosSelect}
          style={{ display: "none" }}
        />
        
        <p style={{ ...styles.stepDescription, textAlign: "center", marginTop: "8px" }}>
          {data.photos.length}/10 photos uploaded
        </p>
        
        {/* Upsell Card */}
        <div style={styles.upsellCard}>
          <h3 style={{ fontSize: "24px", fontWeight: 300, marginBottom: "12px" }}>
            Ready to Go Pro?
          </h3>
          <p style={{ ...styles.stepDescription, marginBottom: "20px" }}>
            Upgrade to <strong>Professional</strong> or <strong>Deluxe</strong> to unlock:
          </p>
          <ul style={{ 
            listStyle: "none", 
            padding: 0, 
            margin: "0 0 24px 0",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "14px",
          }}>
            <li style={{ padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ color: "#22C55E" }}>✓</span> Up to 50+ portfolio photos
            </li>
            <li style={{ padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ color: "#22C55E" }}>✓</span> All premium templates
            </li>
            <li style={{ padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ color: "#22C55E" }}>✓</span> PDF comp card export
            </li>
            <li style={{ padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ color: "#22C55E" }}>✓</span> Advanced analytics & more
            </li>
          </ul>
          <Link
            href="/pricing"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              backgroundColor: "#FF7AA2",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    </>
  );

  // =========================================================================
  // Main Render
  // =========================================================================
  // Check if a step can be navigated to
  const canNavigateToStep = (step: number) => {
    return step <= currentStep || completedSteps.has(step);
  };

  return (
    <div style={{ ...styles.container, display: "flex", flexDirection: "column" }}>
      {/* Keyframes for spinner animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      
      {/* Global Navbar - Onboarding specific links */}
      <Navbar 
        variant="solid" 
        isAuthenticated={true} 
        showLinks={true}
        links={[]}
        user={{
          name: data.displayName || undefined,
          email: userEmail,
          avatarUrl: data.avatarUrl || undefined,
        }}
        userPlan="trial"
      />

      {/* Step Progress Header - Hidden on step 0 (AI chat has its own header) */}
      {currentStep > 0 && (
        <header style={styles.header}>
          {/* Progress Indicator with Labels */}
          <div style={styles.progressContainer}>
            {[0, 1, 2, 3, 4, 5].map((step, index) => {
              const isActive = step === currentStep;
              const isCompleted = completedSteps.has(step) || step < currentStep;
              const clickable = canNavigateToStep(step);
              
              return (
                <div key={step} style={{ display: "flex", alignItems: "center" }}>
                  <div 
                    style={styles.progressStep(isActive, isCompleted, clickable)}
                    onClick={() => clickable && handleStepClick(step)}
                    onMouseEnter={(e) => {
                      if (clickable) {
                        e.currentTarget.style.backgroundColor = isActive 
                          ? "rgba(196, 164, 132, 0.15)" 
                          : "rgba(26, 26, 26, 0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isActive 
                        ? "rgba(196, 164, 132, 0.1)" 
                        : "transparent";
                    }}
                  >
                    <div style={styles.progressDot(isActive, isCompleted)} />
                    <span style={styles.progressLabel(isActive, isCompleted)}>
                      {STEP_LABELS[index]}
                    </span>
                  </div>
                  {index < 5 && <div style={styles.progressLine(isCompleted)} />}
                </div>
              );
            })}
          </div>
          
          {/* Hide skip button on last step */}
          {currentStep < totalSteps ? (
            <button 
              onClick={handleSkip}
              style={styles.skipButton}
            >
              Skip for now
            </button>
          ) : (
            <div style={{ width: "100px" }} /> // Spacer to maintain layout
          )}
        </header>
      )}

      {/* Main Content */}
      {currentStep === 0 ? (
        // Step 0: AI Chat takes available space with contained scrolling
        <main style={{ ...styles.main, padding: 0, maxWidth: "100%", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {renderStep0()}
        </main>
      ) : (
        <main style={{ ...styles.main, flex: 1, minHeight: 0, overflowY: "auto" }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          
          {error && (
            <p style={{ ...styles.error, textAlign: "center", marginTop: "16px" }}>
              {error}
            </p>
          )}
        </main>
      )}

      {/* Step Navigation Footer - Hidden on step 0 (AI chat has its own controls) */}
      {currentStep > 0 && (
        <footer style={styles.footer}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              ...styles.button(false),
              visibility: currentStep === 1 ? "hidden" : "visible",
            }}
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            style={styles.button(true)}
          >
            {loading 
              ? "Saving..." 
              : currentStep === totalSteps - 1
                ? "Complete Setup" 
                : "Continue"
            }
          </button>
        </footer>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

// =============================================================================
// Template Thumbnail Component (matches dashboard/templates)
// =============================================================================
function TemplateThumbnail({ templateId, accentColor }: { templateId: string; accentColor: string }) {
  const isDark = templateId === 'noir';
  const isLumiere = templateId === 'lumiere';
  
  // Lumière has a unique filmstrip design
  if (isLumiere) {
    const warmCream = '#FFF8F0';
    const portfolioDark = '#1F1816';
    const terracotta = '#C8553D';
    
    return (
      <div style={{
        aspectRatio: '4/3',
        background: warmCream,
        borderRadius: '6px',
        border: '1px solid rgba(200, 85, 61, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Hero Section with gradient */}
        <div style={{
          flex: '0 0 45%',
          background: `linear-gradient(180deg, ${portfolioDark} 0%, ${portfolioDark}F0 70%, ${warmCream} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '14px',
            fontWeight: 200,
            color: warmCream,
            letterSpacing: '0.1em',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}>
            Lumière
          </div>
        </div>
        
        {/* Filmstrip Gallery */}
        <div style={{
          flex: 1,
          background: portfolioDark,
          padding: '6px 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          {/* Sprocket holes top */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: 0,
            right: 0,
            height: '4px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`top-${i}`} style={{
                width: '4px',
                height: '3px',
                borderRadius: '1px',
                background: '#0a0a0a',
              }} />
            ))}
          </div>
          
          {/* Film frames */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              width: '32px',
              background: warmCream,
              padding: '3px',
              borderRadius: '2px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            }}>
              <div style={{
                aspectRatio: '3/4',
                background: `linear-gradient(135deg, ${terracotta}20 0%, rgba(26, 26, 26, 0.08) 100%)`,
                borderRadius: '1px',
              }} />
            </div>
          ))}
          
          {/* Sprocket holes bottom */}
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: 0,
            right: 0,
            height: '4px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`bottom-${i}`} style={{
                width: '4px',
                height: '3px',
                borderRadius: '1px',
                background: '#0a0a0a',
              }} />
            ))}
          </div>
        </div>
        
        {/* Footer with accent */}
        <div style={{
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            width: '30px',
            height: '4px',
            background: terracotta,
            borderRadius: '2px',
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: terracotta,
            boxShadow: `0 0 6px ${terracotta}40`,
          }} />
        </div>
      </div>
    );
  }
  
  // Default thumbnail for other templates
  const bgColor = isDark ? '#2a2a2a' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26, 26, 26, 0.08)';
  
  return (
    <div style={{
      aspectRatio: '4/3',
      background: bgColor,
      borderRadius: '6px',
      border: `1px solid ${borderColor}`,
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '40px',
          height: '6px',
          background: accentColor,
          borderRadius: '3px',
        }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: '20px',
              height: '4px',
              background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(26, 26, 26, 0.15)',
              borderRadius: '2px',
            }} />
          ))}
        </div>
      </div>
      
      {/* Photo Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '4px',
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26, 26, 26, 0.06)',
            borderRadius: '2px',
          }} />
        ))}
      </div>
      
      {/* Accent Dot */}
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: accentColor,
        marginTop: '10px',
      }} />
    </div>
  );
}

