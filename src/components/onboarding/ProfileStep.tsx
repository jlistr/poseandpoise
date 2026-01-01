"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// =============================================================================
// Types
// =============================================================================
type LocationStatus = "idle" | "detecting" | "found" | "error";

export interface ProfileFormData {
  displayName: string;
  username: string;
  location: string;
  instagram: string;
  tiktok: string;
  website: string;
  agency: string;
}

interface ProfileStepProps {
  onContinue: (data: ProfileFormData) => void;
  onSkip: () => void;
  initialData?: Partial<ProfileFormData>;
  /** If true, renders as a standalone page with header/footer. If false, renders just the form content. */
  standalone?: boolean;
}

// =============================================================================
// Icons
// =============================================================================
const MapPinIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CheckIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const GlobeIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const BuildingIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <line x1="8" y1="6" x2="8" y2="6" />
    <line x1="16" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="8" y2="10" />
    <line x1="16" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="8" y2="14" />
    <line x1="16" y1="14" x2="16" y2="14" />
  </svg>
);

const SparklesIcon = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
  </svg>
);

const ChevronRightIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// =============================================================================
// Component
// =============================================================================
export function ProfileStep({ onContinue, onSkip, initialData, standalone = true }: ProfileStepProps) {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: initialData?.displayName || "",
    username: initialData?.username || "",
    location: initialData?.location || "",
    instagram: initialData?.instagram || "",
    tiktok: initialData?.tiktok || "",
    website: initialData?.website || "",
    agency: initialData?.agency || "",
  });

  // Sync formData when initialData prop changes (e.g., from AI chat updates)
  // Note: We track individual field values instead of the initialData object reference
  // to avoid unnecessary effect runs when parent re-renders with a new object reference
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        displayName: initialData.displayName || prev.displayName,
        username: initialData.username || prev.username,
        location: initialData.location || prev.location,
        instagram: initialData.instagram || prev.instagram,
        tiktok: initialData.tiktok || prev.tiktok,
        website: initialData.website || prev.website,
        agency: initialData.agency || prev.agency,
      }));
    }
  }, [
    initialData?.displayName,
    initialData?.username,
    initialData?.location,
    initialData?.instagram,
    initialData?.tiktok,
    initialData?.website,
    initialData?.agency,
  ]);

  // Calculate collected fields for progress indicator
  const collectedFields = Object.values(formData).filter(Boolean).length;

  // Handle input changes
  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Location detection on mount
  useEffect(() => {
    const detectLocation = async () => {
      // Skip if location already provided via initialData prop
      // Note: We check initialData directly instead of formData to avoid stale closure issues
      // since this effect runs on mount before the sync effect updates formData
      if (initialData?.location) {
        setLocationStatus("found");
        return;
      }

      setLocationStatus("detecting");

      try {
        // First try IP-based geolocation (more reliable, no permission needed)
        const response = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
        
        if (response.ok) {
          const data = await response.json();
          const city = data.city || data.locality || "";
          const state = data.principalSubdivisionCode || "";
          const country = data.countryCode || "";
          
          // Format as "City, State, Country" (e.g., "New Braunfels, TX, USA")
          const parts = [city];
          if (state) parts.push(state.replace(/^[A-Z]{2}-/, "")); // Remove country prefix from state code
          if (country) parts.push(country);
          
          const locationString = parts.filter(Boolean).join(", ");
          
          if (locationString) {
            setFormData((prev) => ({ ...prev, location: locationString }));
            setLocationStatus("found");
            return;
          }
        }
        
        // Fallback to browser geolocation if IP-based fails
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const geoResponse = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                
                if (geoResponse.ok) {
                  const geoData = await geoResponse.json();
                  const city = geoData.city || geoData.locality || "";
                  const state = geoData.principalSubdivisionCode || "";
                  const country = geoData.countryCode || "";
                  
                  const parts = [city];
                  if (state) parts.push(state.replace(/^[A-Z]{2}-/, ""));
                  if (country) parts.push(country);
                  
                  const locationString = parts.filter(Boolean).join(", ");
                  
                  if (locationString) {
                    setFormData((prev) => ({ ...prev, location: locationString }));
                    setLocationStatus("found");
                    return;
                  }
                }
                setLocationStatus("error");
              } catch {
                setLocationStatus("error");
              }
            },
            () => {
              setLocationStatus("error");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
          );
        } else {
          setLocationStatus("error");
        }
      } catch {
        setLocationStatus("error");
      }
    };

    detectLocation();
  }, [initialData?.location]); // Run on mount and if initialData.location changes

  // Handle form submission
  const handleContinue = () => {
    onContinue(formData);
  };

  // Form content that can be rendered standalone or embedded
  const formContent = (
    <>
      {/* Form Card */}
        <div
          className="bg-white rounded-2xl p-8 shadow-sm"
          style={{ borderColor: "#E8E4DE", borderWidth: "1px" }}
        >
          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif", color: "#2D2D2D" }}
          >
            Your Profile
          </h1>
          <p className="text-sm mb-8" style={{ color: "#666" }}>
            Let&apos;s establish your professional identity. We&apos;ll auto-detect what we can.
          </p>

          {/* Display Name and Username */}
          <div className="space-y-4 mb-8">
            {/* Display Name */}
            <div>
              <label
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: "#2D2D2D" }}
              >
                Display Name <span style={{ color: "#E1306C" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Your professional name"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all focus:border-[#C4A484]"
                style={{ border: "1px solid #E8E4DE" }}
                required
              />
            </div>

            {/* Username */}
            <div>
              <label
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: "#2D2D2D" }}
              >
                Username <span style={{ color: "#E1306C" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="yourname"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all focus:border-[#C4A484]"
                style={{ border: "1px solid #E8E4DE" }}
                required
              />
              <p className="text-xs mt-1" style={{ color: "#999" }}>
                Your portfolio will be at poseandpoise.com/{formData.username || "yourname"}
              </p>
            </div>
          </div>

          {/* Location Detection */}
          <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: "#FAF9F6" }}>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: locationStatus === "found" ? "#E8F5E9" : "#FFF8E7",
                }}
              >
                {locationStatus === "found" ? (
                  <CheckIcon size={18} className="text-[#4CAF50]" />
                ) : (
                  <MapPinIcon
                    size={18}
                    className={`text-[#C4A484] ${locationStatus === "detecting" ? "animate-pulse" : ""}`}
                  />
                )}
              </div>
              <div className="flex-1">
                {locationStatus === "detecting" && (
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#2D2D2D" }}>
                      Detecting your location...
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#999" }}>
                      This helps us suggest relevant opportunities
                    </p>
                  </div>
                )}
                {locationStatus === "found" && (
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#2D2D2D" }}>
                      Found you in {formData.location}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#999" }}>
                      This helps us suggest appropriate services and connect you with local markets
                    </p>
                  </div>
                )}
                {locationStatus === "error" && (
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#2D2D2D" }}>
                      Couldn&apos;t detect your location
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#999" }}>
                      Please enter your location manually below
                    </p>
                  </div>
                )}
                {locationStatus === "idle" && (
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#2D2D2D" }}>
                      Location
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#999" }}>
                      Enter your location to connect with local opportunities
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Connections */}
          <div className="mb-6">
            <h3
              className="text-xs tracking-widest mb-4 flex items-center gap-2"
              style={{ color: "#C4A484" }}
            >
              <SparklesIcon size={12} />
              CONNECT YOUR SOCIALS
            </h3>

            <div className="flex gap-3 mb-6">
              <button
                type="button"
                className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: "#E1306C", color: "white" }}
              >
                <InstagramIcon size={16} />
                Connect Instagram
              </button>
              <button
                type="button"
                className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: "#2D2D2D", color: "white" }}
              >
                <TikTokIcon size={16} />
                Connect TikTok
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: "#E8E4DE" }} />
              <span className="text-xs" style={{ color: "#999" }}>
                OR ENTER MANUALLY
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#E8E4DE" }} />
            </div>
          </div>

          {/* Manual Input Fields */}
          <div className="space-y-4">
            {/* Instagram */}
            <div>
              <label
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: "#2D2D2D" }}
              >
                <InstagramIcon size={14} />
                Instagram
              </label>
              <div className="flex">
                <span
                  className="px-3 py-2.5 text-sm rounded-l-lg"
                  style={{
                    backgroundColor: "#FAF9F6",
                    color: "#999",
                    border: "1px solid #E8E4DE",
                    borderRight: "none",
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  placeholder="yourhandle"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm rounded-r-lg outline-none transition-all focus:border-[#C4A484]"
                  style={{ border: "1px solid #E8E4DE", borderLeft: "none" }}
                />
              </div>
            </div>

            {/* TikTok */}
            <div>
              <label
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: "#2D2D2D" }}
              >
                <TikTokIcon size={14} />
                TikTok
              </label>
              <div className="flex">
                <span
                  className="px-3 py-2.5 text-sm rounded-l-lg"
                  style={{
                    backgroundColor: "#FAF9F6",
                    color: "#999",
                    border: "1px solid #E8E4DE",
                    borderRight: "none",
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  placeholder="yourhandle"
                  value={formData.tiktok}
                  onChange={(e) => handleInputChange("tiktok", e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm rounded-r-lg outline-none transition-all focus:border-[#C4A484]"
                  style={{ border: "1px solid #E8E4DE", borderLeft: "none" }}
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: "#2D2D2D" }}
              >
                <GlobeIcon size={14} />
                Website
              </label>
              <input
                type="text"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all focus:border-[#C4A484]"
                style={{ border: "1px solid #E8E4DE" }}
              />
            </div>

            {/* Agency */}
            <div>
              <label
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: "#2D2D2D" }}
              >
                <BuildingIcon size={14} />
                Agency <span style={{ color: "#999" }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Your representation"
                value={formData.agency}
                onChange={(e) => handleInputChange("agency", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all focus:border-[#C4A484]"
                style={{ border: "1px solid #E8E4DE" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ border: "1px solid #E8E4DE", color: "#666" }}
            >
              SKIP
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#2D2D2D", color: "white" }}
            >
              CONTINUE
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Inline Progress Indicator */}
        {collectedFields > 0 && (
          <div
            className="mt-6 p-4 rounded-xl flex items-center justify-between"
            style={{ backgroundColor: "white", border: "1px solid #E8E4DE" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#C4A484", color: "white" }}
              >
                <CheckIcon size={14} />
              </div>
              <span className="text-sm" style={{ color: "#2D2D2D" }}>
                <span className="font-medium">{collectedFields} field{collectedFields !== 1 ? "s" : ""}</span>{" "}
                collected
              </span>
            </div>
            <span className="text-xs flex items-center gap-1" style={{ color: "#4CAF50" }}>
              <CheckIcon size={12} />
              Auto-saved
            </span>
          </div>
        )}
    </>
  );

  // If not standalone, just return the form content
  if (!standalone) {
    return formContent;
  }

  // Standalone mode: render full page with header/footer
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAF9F6",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4 border-b"
        style={{ borderColor: "#E8E4DE" }}
      >
        <div
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "14px",
            letterSpacing: "0.2em",
            color: "#2D2D2D",
          }}
        >
          POSE & POISE
        </div>
        <Link
          href="/pricing"
          className="px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2"
          style={{ backgroundColor: "#C4A484", color: "white" }}
        >
          <SparklesIcon size={14} />
          UPGRADE
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[
            { name: "PROFILE", completed: true, current: true },
            { name: "ABOUT", completed: false, current: false },
            { name: "SERVICES", completed: false, current: false },
            { name: "TEMPLATE", completed: false, current: false },
            { name: "PHOTOS", completed: false, current: false },
          ].map((step, index, arr) => (
            <div key={step.name} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: step.completed || step.current ? "#C4A484" : "#E8E4DE",
                  }}
                />
                <span
                  className="text-xs tracking-widest"
                  style={{ color: step.current ? "#2D2D2D" : "#999" }}
                >
                  {step.name}
                </span>
              </div>
              {index < arr.length - 1 && (
                <div className="w-8 h-px" style={{ backgroundColor: "#E8E4DE" }} />
              )}
            </div>
          ))}
        </div>

        {formContent}
      </main>

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 px-8 py-4 flex items-center justify-between text-xs"
        style={{
          backgroundColor: "#FAF9F6",
          borderTop: "1px solid #E8E4DE",
          color: "#999",
        }}
      >
        <span
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            letterSpacing: "0.15em",
          }}
        >
          POSE & POISE
        </span>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:opacity-70">
            Pricing
          </Link>
          <Link href="/contact" className="hover:opacity-70">
            Contact
          </Link>
          <Link href="/privacy" className="hover:opacity-70">
            Privacy
          </Link>
          <Link href="/terms" className="hover:opacity-70">
            Terms
          </Link>
        </div>
        <span>© 2025 Pose & Poise. All rights reserved.</span>
      </footer>
    </div>
  );
}

