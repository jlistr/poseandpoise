'use client';

import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Check, MapPin, Instagram, Globe, Building2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type LocationStatus = 'idle' | 'detecting' | 'found' | 'error';
type CurrentStep = 'profile' | 'about' | 'services' | 'template' | 'photos';
type UploadType = 'profile' | 'analyzer' | 'scanner' | null;
type ExperienceLevel = 'beginner' | 'intermediate' | 'professional' | 'expert';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface PricingTier {
  hourly: string;
  halfDay: string;
  fullDay: string;
}

interface ServicesFormData {
  experienceLevel: ExperienceLevel;
  categories: ServiceCategory[];
  pricing: PricingTier;
  travelAvailable: boolean;
  travelRadius: string;
  tfpAvailable: boolean;
}

interface ProfileFormData {
  displayName: string;
  username: string;
  location: string;
  instagram: string;
  tiktok: string;
  website: string;
  agency: string;
}

interface ModelStats {
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoes: string;
  dress: string;
  hairColor: string;
  eyeColor: string;
}

interface AboutFormData {
  stats: ModelStats;
  bio: string;
  profilePhoto: string | null;
}

interface OnboardingStep {
  id: CurrentStep;
  name: string;
  completed: boolean;
  current: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  isPro: boolean;
}

interface PortfolioPhoto {
  id: string;
  url: string;
  photographer: string;
  studio: string;
  visible: boolean;
  order: number;
}

// ============================================================================
// Design Tokens
// ============================================================================

const colors = {
  cream: '#FAF9F6',
  charcoal: '#2D2D2D',
  camel: '#C4A484',
  white: '#FFFFFF',
  border: '#E8E4DE',
  borderLight: 'rgba(44, 44, 44, 0.05)',
  textPrimary: '#2D2D2D',
  textSecondary: '#666',
  textMuted: '#999',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  instagram: '#E1306C',
};

// ============================================================================
// Icons
// ============================================================================

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? 'w-4 h-4'} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const PhotoIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M21 15L16.5 11.5L12 15L8.5 12.5L3 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ScanIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6" y="6" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

const UserIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 20C4 17 8 14 12 14C16 14 20 17 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlusIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChecklistIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CompCardIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5" y="6" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 17H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DollarIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7V17M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlaneIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 16V14L13 9V3.5C13 2.67157 12.3284 2 11.5 2C10.6716 2 10 2.67157 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CameraIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const EyeIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const EyeOffIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.73 16.74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 1L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LinkIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.479 3.53087C19.552 2.60383 18.2979 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60706C11.7642 9.26329 11.0685 9.05886 10.3533 9.00769C9.63816 8.95651 8.92037 9.05966 8.24861 9.31026C7.57685 9.56085 6.96684 9.95293 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LayoutIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 21V9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RocketIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4.5 16.5C3 18 3 21 3 21C3 21 6 21 7.5 19.5C8.32843 18.6716 8.32843 17.3284 7.5 16.5C6.67157 15.6716 5.32843 15.6716 4.5 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 4.00001C14.5 4.00001 13 6.00001 13 10C13 14 18 19 18 19C18 19 22 19 22 15C22 11 18 6.00001 14 6.00001C10 6.00001 8 8.50001 8 8.50001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 9L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ============================================================================
// Constants
// ============================================================================

const TEMPLATES: Template[] = [
  { id: 'rose', name: 'Rosé', description: 'Soft editorial blush with feminine elegance', accentColor: '#F5D5D8', bgColor: '#FFF9F9', textColor: '#2D2D2D', isPro: false },
  { id: 'poise', name: 'Poise', description: 'Timeless elegance with warm neutrals', accentColor: '#C4A484', bgColor: '#FAF9F6', textColor: '#2D2D2D', isPro: false },
  { id: 'lumiere', name: 'Lumière', description: 'Golden hour warmth with editorial flair', accentColor: '#D4A574', bgColor: '#2C2420', textColor: '#F5F0EB', isPro: false },
  { id: 'noir', name: 'Noir', description: 'Bold monochrome with dramatic contrast', accentColor: '#FFFFFF', bgColor: '#1A1A1A', textColor: '#FFFFFF', isPro: true },
];

// ============================================================================
// Shared Sub-components
// ============================================================================

interface StepIndicatorProps {
  steps: OnboardingStep[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => (
  <div className="flex items-center justify-center gap-3 mb-12">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex items-center gap-2">
          <div 
            className="w-2.5 h-2.5 rounded-full transition-colors"
            style={{ backgroundColor: step.completed || step.current ? colors.camel : colors.border }}
          />
          <span 
            className="text-xs tracking-widest"
            style={{ color: step.current ? colors.textPrimary : colors.textMuted }}
          >
            {step.name}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className="w-8 h-px" style={{ backgroundColor: colors.border }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

interface ProgressIndicatorProps {
  collectedCount: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ collectedCount }) => {
  if (collectedCount === 0) return null;
  
  return (
    <div 
      className="mt-6 p-4 rounded-xl flex items-center justify-between"
      style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.camel, color: colors.white }}
        >
          <Check size={14} />
        </div>
        <span className="text-sm" style={{ color: colors.textPrimary }}>
          <span className="font-medium">{collectedCount} field{collectedCount !== 1 ? 's' : ''}</span> collected
        </span>
      </div>
      <span className="text-xs flex items-center gap-1" style={{ color: colors.success }}>
        <Check size={12} />
        Auto-saved
      </span>
    </div>
  );
};

interface LocationDetectionProps {
  status: LocationStatus;
  location: string;
}

const LocationDetection: React.FC<LocationDetectionProps> = ({ status, location }) => (
  <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: colors.cream }}>
    <div className="flex items-start gap-3">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: status === 'found' ? colors.successLight : '#FFF8E7' }}
      >
        {status === 'found' ? (
          <Check size={18} style={{ color: colors.success }} />
        ) : (
          <MapPin size={18} style={{ color: colors.camel }} className="animate-pulse" />
        )}
      </div>
      <div className="flex-1">
        {status === 'detecting' && (
          <div>
            <p className="font-medium text-sm" style={{ color: colors.textPrimary }}>
              Detecting your location...
            </p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
              This helps us suggest relevant opportunities
            </p>
          </div>
        )}
        {status === 'found' && (
          <div>
            <p className="font-medium text-sm" style={{ color: colors.textPrimary }}>
              Found you in {location}
            </p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
              This helps us suggest appropriate services and connect you with local markets
            </p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <p className="font-medium text-sm" style={{ color: colors.textPrimary }}>
              Couldn't detect your location
            </p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
              You can enter it manually in your profile settings
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

interface SocialConnectionButtonsProps {
  onConnectInstagram: () => void;
  onConnectTikTok: () => void;
}

const SocialConnectionButtons: React.FC<SocialConnectionButtonsProps> = ({ 
  onConnectInstagram, 
  onConnectTikTok 
}) => (
  <div className="mb-6">
    <h3 className="text-xs tracking-widest mb-4 flex items-center gap-2" style={{ color: colors.camel }}>
      <Sparkles size={12} />
      CONNECT YOUR SOCIALS
    </h3>
    
    <div className="flex gap-3 mb-6">
      <button 
        type="button"
        onClick={onConnectInstagram}
        className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: colors.instagram, color: colors.white }}
      >
        <Instagram size={16} />
        Connect Instagram
      </button>
      <button 
        type="button"
        onClick={onConnectTikTok}
        className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: colors.charcoal, color: colors.white }}
      >
        <TikTokIcon />
        Connect TikTok
      </button>
    </div>

    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
      <span className="text-xs" style={{ color: colors.textMuted }}>OR ENTER MANUALLY</span>
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
    </div>
  </div>
);

interface TextInputWithPrefixProps {
  label: string;
  icon: React.ReactNode;
  prefix: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const TextInputWithPrefix: React.FC<TextInputWithPrefixProps> = ({
  label,
  icon,
  prefix,
  placeholder,
  value,
  onChange,
}) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-2" style={{ color: colors.textPrimary }}>
      {icon}
      {label}
    </label>
    <div className="flex">
      <span 
        className="px-3 py-2.5 text-sm rounded-l-lg"
        style={{ backgroundColor: colors.cream, color: colors.textMuted, border: `1px solid ${colors.border}`, borderRight: 'none' }}
      >
        {prefix}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="flex-1 px-3 py-2.5 text-sm rounded-r-lg outline-none transition-all"
        style={{ border: `1px solid ${colors.border}`, borderLeft: 'none' }}
      />
    </div>
  </div>
);

interface TextInputProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChange,
  optional = false,
}) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-2" style={{ color: colors.textPrimary }}>
      {icon}
      {label}
      {optional && <span style={{ color: colors.textMuted }}>(optional)</span>}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
      style={{ border: `1px solid ${colors.border}` }}
    />
  </div>
);

// ============================================================================
// About Section Sub-components
// ============================================================================

interface AIToolButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

const AIToolButton: React.FC<AIToolButtonProps> = ({ icon, title, description, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex-1 min-w-[180px] flex items-center gap-3 p-4 transition-all hover:opacity-90"
    style={{
      backgroundColor: colors.white,
      border: `1px solid ${colors.border}`,
      cursor: disabled ? 'wait' : 'pointer',
      opacity: disabled ? 0.7 : 1,
    }}
  >
    <div
      className="w-10 h-10 flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: colors.cream }}
    >
      {icon}
    </div>
    <div className="text-left">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{title}</span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded"
          style={{ backgroundColor: colors.camel, color: colors.white }}
        >
          AI
        </span>
      </div>
      <span className="text-xs" style={{ color: colors.textMuted }}>{description}</span>
    </div>
  </button>
);

interface StatsGridProps {
  stats: ModelStats;
  onChange: (field: keyof ModelStats, value: string) => void;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, onChange }) => {
  const fields: { key: keyof ModelStats; label: string; placeholder: string }[] = [
    { key: 'height', label: 'Height', placeholder: "5'9\"" },
    { key: 'bust', label: 'Bust', placeholder: '32"' },
    { key: 'waist', label: 'Waist', placeholder: '24"' },
    { key: 'hips', label: 'Hips', placeholder: '34"' },
    { key: 'shoes', label: 'Shoes', placeholder: '8' },
    { key: 'dress', label: 'Dress', placeholder: '4' },
    { key: 'hairColor', label: 'Hair', placeholder: 'Brunette' },
    { key: 'eyeColor', label: 'Eyes', placeholder: 'Hazel' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-[10px] mb-1" style={{ color: colors.textMuted }}>
            {label}
          </label>
          <input
            type="text"
            value={stats[key]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 text-sm outline-none transition-all"
            style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.white }}
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Step Content Components
// ============================================================================

interface ProfileStepProps {
  formData: ProfileFormData;
  locationStatus: LocationStatus;
  onInputChange: (field: keyof ProfileFormData, value: string) => void;
  onConnectInstagram: () => void;
  onConnectTikTok: () => void;
  validationErrors?: Record<string, string>;
}

const ProfileStepContent: React.FC<ProfileStepProps> = ({
  formData,
  locationStatus,
  onInputChange,
  onConnectInstagram,
  onConnectTikTok,
  validationErrors = {},
}) => (
  <>
    <h1
      className="text-3xl mb-2"
      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textPrimary }}
    >
      Your Profile
    </h1>
    <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
      Let's establish your professional identity. We'll auto-detect what we can.
    </p>

    {/* Display Name & Username */}
    <div className="space-y-4 mb-8">
      <div>
        <label className="flex items-center gap-2 text-sm mb-2" style={{ color: colors.textPrimary }}>
          Display Name <span style={{ color: colors.instagram }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Your professional name"
          value={formData.displayName}
          onChange={(e) => onInputChange('displayName', e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all"
          style={{ 
            border: `1px solid ${validationErrors.displayName ? '#dc2626' : colors.border}`,
            backgroundColor: validationErrors.displayName ? '#fef2f2' : undefined
          }}
        />
        {validationErrors.displayName && (
          <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
            {validationErrors.displayName}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm mb-2" style={{ color: colors.textPrimary }}>
          Username <span style={{ color: colors.instagram }}>*</span>
        </label>
        <div className="flex">
          <span 
            className="px-3 py-2.5 text-sm rounded-l-lg"
            style={{ 
              backgroundColor: colors.cream, 
              color: colors.textMuted, 
              borderTop: `1px solid ${validationErrors.username ? '#dc2626' : colors.border}`,
              borderBottom: `1px solid ${validationErrors.username ? '#dc2626' : colors.border}`,
              borderLeft: `1px solid ${validationErrors.username ? '#dc2626' : colors.border}`,
              borderRight: 'none',
            }}
          >
            poseandpoise.com/
          </span>
          <input
            type="text"
            placeholder="yourname"
            value={formData.username}
            onChange={(e) => onInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            className="flex-1 px-3 py-2.5 text-sm rounded-r-lg outline-none transition-all"
            style={{ 
              borderTop: `1px solid ${validationErrors.username ? '#dc2626' : colors.border}`,
              borderBottom: `1px solid ${validationErrors.username ? '#dc2626' : colors.border}`,
              borderRight: `1px solid ${validationErrors.username ? '#dc2626' : colors.border}`,
              borderLeft: 'none',
              backgroundColor: validationErrors.username ? '#fef2f2' : undefined
            }}
          />
        </div>
        {validationErrors.username ? (
          <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
            {validationErrors.username}
          </p>
        ) : (
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
            Your portfolio will be at poseandpoise.com/{formData.username || 'yourname'}
          </p>
        )}
      </div>
    </div>

    <LocationDetection status={locationStatus} location={formData.location} />

    <SocialConnectionButtons
      onConnectInstagram={onConnectInstagram}
      onConnectTikTok={onConnectTikTok}
    />

    <div className="space-y-4">
      <TextInputWithPrefix
        label="Instagram"
        icon={<Instagram size={14} />}
        prefix="@"
        placeholder="yourhandle"
        value={formData.instagram}
        onChange={(value) => onInputChange('instagram', value)}
      />

      <TextInputWithPrefix
        label="TikTok"
        icon={<TikTokIcon className="w-3.5 h-3.5" />}
        prefix="@"
        placeholder="yourhandle"
        value={formData.tiktok}
        onChange={(value) => onInputChange('tiktok', value)}
      />

      <TextInput
        label="Website"
        icon={<Globe size={14} />}
        placeholder="https://yourwebsite.com"
        value={formData.website}
        onChange={(value) => onInputChange('website', value)}
      />

      <TextInput
        label="Agency"
        icon={<Building2 size={14} />}
        placeholder="Your representation"
        value={formData.agency}
        onChange={(value) => onInputChange('agency', value)}
        optional
      />
    </div>
  </>
);

interface AboutStepProps {
  formData: AboutFormData;
  isAnalyzing: boolean;
  isGeneratingBio: boolean;
  analysisComplete: boolean;
  onStatsChange: (field: keyof ModelStats, value: string) => void;
  onBioChange: (value: string) => void;
  onPhotoUpload: () => void;
  onAnalyzerClick: () => void;
  onScannerClick: () => void;
  onGenerateBio: () => void;
}

const AboutStep: React.FC<AboutStepProps> = ({
  formData,
  isAnalyzing,
  isGeneratingBio,
  analysisComplete,
  onStatsChange,
  onBioChange,
  onPhotoUpload,
  onAnalyzerClick,
  onScannerClick,
  onGenerateBio,
}) => (
  <>
    <h1
      className="text-3xl mb-2"
      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textPrimary }}
    >
      About You
    </h1>
    <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
      Share your story and stats. Use AI tools to speed things up, or fill in manually.
    </p>

    {/* AI Tools Section */}
    <div className="p-6 rounded-xl mb-8" style={{ backgroundColor: colors.cream }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} style={{ color: colors.camel }} />
        <span className="text-xs tracking-widest font-medium" style={{ color: colors.camel }}>
          AI-POWERED SHORTCUTS
        </span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <AIToolButton
          icon={<PhotoIcon size={20} />}
          title="Photo Analyzer"
          description="Extract stats from photo"
          onClick={onAnalyzerClick}
          disabled={isAnalyzing}
        />
        <AIToolButton
          icon={<ScanIcon size={20} />}
          title="Comp Card Scanner"
          description="Import all stats instantly"
          onClick={onScannerClick}
          disabled={isAnalyzing}
        />
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div
          className="flex items-center gap-2 mt-4 p-3"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
        >
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.camel, borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: colors.textSecondary }}>Analyzing your image...</span>
        </div>
      )}

      {analysisComplete && (
        <div
          className="flex items-center gap-2 mt-4 p-3"
          style={{ backgroundColor: colors.successLight, border: `1px solid ${colors.success}` }}
        >
          <Check size={16} style={{ color: colors.success }} />
          <span className="text-sm" style={{ color: colors.success }}>Stats extracted successfully! Review below.</span>
        </div>
      )}
    </div>

    {/* Divider */}
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
      <span className="text-xs tracking-wider" style={{ color: colors.textMuted }}>OR FILL MANUALLY</span>
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
    </div>

    {/* Profile Photo + Stats Row */}
    <div className="flex gap-8 mb-8">
      {/* Profile Photo */}
      <div className="flex-shrink-0">
        <label className="block text-xs tracking-wider mb-2 uppercase" style={{ color: colors.textMuted }}>
          Profile Photo
        </label>
        <button
          type="button"
          onClick={onPhotoUpload}
          className="w-36 h-44 flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden"
          style={{ backgroundColor: colors.cream, border: `1px dashed ${colors.border}` }}
        >
          {formData.profilePhoto ? (
            <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <>
              <UserIcon size={32} />
              <div className="flex items-center gap-1 text-xs" style={{ color: colors.textMuted }}>
                <PlusIcon size={14} />
                Add Photo
              </div>
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="flex-1">
        <label className="block text-xs tracking-wider mb-2 uppercase" style={{ color: colors.textMuted }}>
          Your Stats
        </label>
        <StatsGrid stats={formData.stats} onChange={onStatsChange} />
      </div>
    </div>

    {/* Bio Section */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs tracking-wider uppercase" style={{ color: colors.textMuted }}>
          Your Bio
        </label>
        <button
          type="button"
          onClick={onGenerateBio}
          disabled={isGeneratingBio}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${colors.camel}`,
            color: colors.camel,
            opacity: isGeneratingBio ? 0.7 : 1,
            cursor: isGeneratingBio ? 'wait' : 'pointer',
          }}
        >
          <Sparkles size={12} />
          {isGeneratingBio ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>
      <textarea
        value={formData.bio}
        onChange={(e) => onBioChange(e.target.value)}
        placeholder="Tell your story... What draws you to modeling? What makes you unique? What type of work excites you?"
        rows={5}
        className="w-full px-4 py-3 text-sm outline-none resize-y transition-all"
        style={{
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.white,
          lineHeight: 1.7,
          fontFamily: 'Outfit, system-ui, sans-serif',
        }}
      />
      <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
        This will appear on your public portfolio page.
      </p>
    </div>

    {/* Beginner Tip */}
    <div
      className="p-4"
      style={{ backgroundColor: colors.cream, borderLeft: `3px solid ${colors.camel}` }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
        Don't have a comp card yet?
      </p>
      <p className="text-xs" style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
        No problem! Fill in your stats here and we'll generate a professional comp card for you in the next step.
      </p>
    </div>
  </>
);

// ============================================================================
// Services Step Sub-components
// ============================================================================

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  onToggle: (id: string) => void;
}

const ServiceCategoryCard: React.FC<ServiceCategoryCardProps> = ({ category, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(category.id)}
    className="flex items-center gap-3 p-4 text-left transition-all"
    style={{
      backgroundColor: category.selected ? colors.cream : colors.white,
      border: `1px solid ${category.selected ? colors.camel : colors.border}`,
    }}
  >
    <div
      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
      style={{
        backgroundColor: category.selected ? colors.camel : 'transparent',
        border: category.selected ? 'none' : `1px solid ${colors.border}`,
      }}
    >
      {category.selected && <Check size={12} color={colors.white} />}
    </div>
    <div>
      <span className="text-sm font-medium block" style={{ color: colors.textPrimary }}>
        {category.name}
      </span>
      <span className="text-xs" style={{ color: colors.textMuted }}>
        {category.description}
      </span>
    </div>
  </button>
);

interface ExperienceLevelSelectorProps {
  value: ExperienceLevel;
  onChange: (level: ExperienceLevel) => void;
}

const ExperienceLevelSelector: React.FC<ExperienceLevelSelectorProps> = ({ value, onChange }) => {
  const levels: { id: ExperienceLevel; label: string; description: string }[] = [
    { id: 'beginner', label: 'Beginner', description: '< 1 year' },
    { id: 'intermediate', label: 'Intermediate', description: '1-3 years' },
    { id: 'professional', label: 'Professional', description: '3-5 years' },
    { id: 'expert', label: 'Expert', description: '5+ years' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {levels.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={() => onChange(level.id)}
          className="p-3 text-center transition-all"
          style={{
            backgroundColor: value === level.id ? colors.charcoal : colors.white,
            border: `1px solid ${value === level.id ? colors.charcoal : colors.border}`,
            color: value === level.id ? colors.white : colors.textPrimary,
          }}
        >
          <span className="text-sm font-medium block">{level.label}</span>
          <span className="text-xs opacity-70">{level.description}</span>
        </button>
      ))}
    </div>
  );
};

interface PricingInputsProps {
  pricing: PricingTier;
  onChange: (field: keyof PricingTier, value: string) => void;
}

const PricingInputs: React.FC<PricingInputsProps> = ({ pricing, onChange }) => (
  <div className="grid grid-cols-3 gap-4">
    {[
      { key: 'hourly' as const, label: 'Hourly Rate', placeholder: '150' },
      { key: 'halfDay' as const, label: 'Half-Day (4hr)', placeholder: '500' },
      { key: 'fullDay' as const, label: 'Full-Day (8hr)', placeholder: '900' },
    ].map(({ key, label, placeholder }) => (
      <div key={key}>
        <label className="block text-xs mb-2" style={{ color: colors.textMuted }}>
          {label}
        </label>
        <div className="flex">
          <span
            className="px-3 py-2.5 text-sm"
            style={{
              backgroundColor: colors.cream,
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRight: 'none',
            }}
          >
            $
          </span>
          <input
            type="text"
            value={pricing[key]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2.5 text-sm outline-none transition-all"
            style={{ border: `1px solid ${colors.border}`, borderLeft: 'none' }}
          />
        </div>
      </div>
    ))}
  </div>
);

interface ServicesStepProps {
  formData: ServicesFormData;
  isSuggesting: boolean;
  suggestionsApplied: boolean;
  onExperienceChange: (level: ExperienceLevel) => void;
  onCategoryToggle: (id: string) => void;
  onPricingChange: (field: keyof PricingTier, value: string) => void;
  onTravelToggle: () => void;
  onTravelRadiusChange: (value: string) => void;
  onTfpToggle: () => void;
  onSuggestServices: () => void;
}

const ServicesStep: React.FC<ServicesStepProps> = ({
  formData,
  isSuggesting,
  suggestionsApplied,
  onExperienceChange,
  onCategoryToggle,
  onPricingChange,
  onTravelToggle,
  onTravelRadiusChange,
  onTfpToggle,
  onSuggestServices,
}) => (
  <>
    <h1
      className="text-3xl mb-2"
      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textPrimary }}
    >
      Your Services
    </h1>
    <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
      Showcase what you offer. We'll suggest competitive pricing based on your market and experience.
    </p>

    {/* AI Tools Section */}
    <div className="p-6 rounded-xl mb-8" style={{ backgroundColor: colors.cream }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} style={{ color: colors.camel }} />
        <span className="text-xs tracking-widest font-medium" style={{ color: colors.camel }}>
          AI-POWERED SHORTCUTS
        </span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <AIToolButton
          icon={<ChecklistIcon size={20} />}
          title="Smart Suggestions"
          description="Recommend services & pricing"
          onClick={onSuggestServices}
          disabled={isSuggesting}
        />
        <div
          className="flex-1 min-w-[180px] flex items-center gap-3 p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            opacity: 0.6,
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: colors.cream }}
          >
            <CompCardIcon size={20} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Comp Card Generator</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: colors.charcoal, color: colors.white }}
              >
                PRO
              </span>
            </div>
            <span className="text-xs" style={{ color: colors.textMuted }}>Upgrade to unlock</span>
          </div>
        </div>
      </div>

      {/* Suggestion Status */}
      {isSuggesting && (
        <div
          className="flex items-center gap-2 mt-4 p-3"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
        >
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.camel, borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: colors.textSecondary }}>Analyzing your market and generating suggestions...</span>
        </div>
      )}

      {suggestionsApplied && (
        <div
          className="flex items-center gap-2 mt-4 p-3"
          style={{ backgroundColor: colors.successLight, border: `1px solid ${colors.success}` }}
        >
          <Check size={16} style={{ color: colors.success }} />
          <span className="text-sm" style={{ color: colors.success }}>Services and pricing suggestions applied! Review below.</span>
        </div>
      )}
    </div>

    {/* Divider */}
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
      <span className="text-xs tracking-wider" style={{ color: colors.textMuted }}>OR CONFIGURE MANUALLY</span>
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
    </div>

    {/* Experience Level */}
    <div className="mb-8">
      <label className="block text-xs tracking-wider mb-3 uppercase" style={{ color: colors.textMuted }}>
        Experience Level
      </label>
      <ExperienceLevelSelector value={formData.experienceLevel} onChange={onExperienceChange} />
    </div>

    {/* Service Categories */}
    <div className="mb-8">
      <label className="block text-xs tracking-wider mb-3 uppercase" style={{ color: colors.textMuted }}>
        Services You Offer
      </label>
      <div className="grid grid-cols-2 gap-3">
        {formData.categories.map((category) => (
          <ServiceCategoryCard
            key={category.id}
            category={category}
            onToggle={onCategoryToggle}
          />
        ))}
      </div>
    </div>

    {/* Pricing */}
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <DollarIcon size={14} />
        <label className="text-xs tracking-wider uppercase" style={{ color: colors.textMuted }}>
          Your Rates (USD)
        </label>
      </div>
      <PricingInputs pricing={formData.pricing} onChange={onPricingChange} />
      <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
        Based on your experience and location, similar models charge $100-200/hr in your market.
      </p>
    </div>

    {/* Travel & TFP */}
    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* Travel */}
      <div className="p-4" style={{ backgroundColor: colors.cream }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PlaneIcon size={16} />
            <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Available for Travel</span>
          </div>
          <button
            type="button"
            onClick={onTravelToggle}
            className="w-10 h-6 rounded-full transition-colors relative"
            style={{ backgroundColor: formData.travelAvailable ? colors.camel : colors.border }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
              style={{ left: formData.travelAvailable ? '22px' : '4px' }}
            />
          </button>
        </div>
        {formData.travelAvailable && (
          <div>
            <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Travel Radius</label>
            <input
              type="text"
              value={formData.travelRadius}
              onChange={(e) => onTravelRadiusChange(e.target.value)}
              placeholder="e.g., 100 miles or Nationwide"
              className="w-full px-3 py-2 text-sm outline-none"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.white }}
            />
          </div>
        )}
      </div>

      {/* TFP */}
      <div className="p-4" style={{ backgroundColor: colors.cream }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CameraIcon size={16} />
            <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Open to TFP</span>
          </div>
          <button
            type="button"
            onClick={onTfpToggle}
            className="w-10 h-6 rounded-full transition-colors relative"
            style={{ backgroundColor: formData.tfpAvailable ? colors.camel : colors.border }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
              style={{ left: formData.tfpAvailable ? '22px' : '4px' }}
            />
          </button>
        </div>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          {formData.tfpAvailable
            ? "You're open to trade collaborations (Time for Print)"
            : "Toggle on if you're open to unpaid creative collaborations"}
        </p>
      </div>
    </div>

    {/* Upsell Banner */}
    <div
      className="p-4 flex items-center justify-between"
      style={{ backgroundColor: '#FFF8E7', border: `1px solid ${colors.camel}` }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} style={{ color: colors.camel }} />
          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
            Unlock Comp Card Generator
          </span>
        </div>
        <p className="text-xs" style={{ color: colors.textSecondary }}>
          Professional and Deluxe members can generate unlimited comp cards for different markets.
        </p>
      </div>
      <button
        type="button"
        className="px-4 py-2 text-xs font-medium tracking-wider"
        style={{ backgroundColor: colors.camel, color: colors.white }}
      >
        VIEW PLANS
      </button>
    </div>
  </>
);

// ============================================================================
// Template Step Component
// ============================================================================

interface TemplateStepProps {
  templates: Template[];
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  modelName: string;
}

const TemplateStep: React.FC<TemplateStepProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  modelName,
}) => {
  const selected = templates.find(t => t.id === selectedTemplate) || templates[0];

  return (
    <>
      <h1
        className="text-3xl mb-2"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textPrimary }}
      >
        Choose Your Template
      </h1>
      <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>
        Select a design that reflects your unique style.
      </p>
      <p className="text-xs mb-8 flex items-center gap-2">
        <span style={{ color: colors.textMuted }}>Preview it live at</span>
        <code 
          className="px-2 py-1 rounded text-xs"
          style={{ backgroundColor: colors.cream, color: colors.camel }}
        >
          poseandpoise.com/{modelName.toLowerCase().replace(' ', '')}
        </code>
      </p>

      <div className="flex gap-8">
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => !template.isPro && onSelectTemplate(template.id)}
                className={`text-left transition-all relative overflow-hidden rounded-lg ${
                  selectedTemplate === template.id ? 'ring-2 ring-offset-2' : ''
                } ${template.isPro ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                style={{ 
                  border: `1px solid ${selectedTemplate === template.id ? colors.camel : colors.border}`,
                }}
              >
                {template.isPro && (
                  <div 
                    className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium"
                    style={{ backgroundColor: colors.charcoal, color: colors.white }}
                  >
                    <Sparkles size={10} />
                    PRO
                  </div>
                )}
                <div className="p-4 h-32" style={{ backgroundColor: template.bgColor }}>
                  <div className="w-8 h-1 rounded mb-3" style={{ backgroundColor: template.accentColor }} />
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: template.textColor, opacity: 0.2 }} />
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="text-sm font-medium" style={{ color: colors.textPrimary }}>{template.name}</h3>
                  <p className="text-xs" style={{ color: colors.textMuted }}>{template.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div 
            className="mt-6 p-4 flex items-center justify-between"
            style={{ backgroundColor: '#FFF8E7', border: `1px solid ${colors.camel}` }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: colors.camel }} />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Unlock All Templates</span>
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Professional and Deluxe members get access to all premium templates.
              </p>
            </div>
            <button 
              type="button" 
              className="px-4 py-2 text-xs font-medium tracking-wider transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.camel, color: colors.white }}
            >
              VIEW PLANS
            </button>
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-wider uppercase" style={{ color: colors.textMuted }}>LIVE PREVIEW</span>
            <button 
              type="button" 
              className="flex items-center gap-1 text-xs hover:underline"
              style={{ color: colors.camel }}
            >
              <EyeIcon size={12} />
              Open Full Preview
            </button>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg" style={{ border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-1.5 px-3 py-2" style={{ backgroundColor: '#F5F5F5' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F56' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#27CA40' }} />
            </div>
            <div className="p-4 min-h-[300px]" style={{ backgroundColor: selected.bgColor }}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 
                    className="text-lg font-medium"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: selected.textColor }}
                  >
                    {modelName}
                  </h3>
                  <span 
                    className="text-[10px] tracking-widest uppercase"
                    style={{ color: selected.textColor, opacity: 0.6 }}
                  >
                    MODEL
                  </span>
                </div>
                <div className="flex gap-4 text-[10px]" style={{ color: selected.textColor, opacity: 0.8 }}>
                  <span>PORTFOLIO</span>
                  <span>ABOUT</span>
                  <span>CONTACT</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="aspect-[3/4] rounded" 
                    style={{ backgroundColor: selected.textColor, opacity: 0.15 }} 
                  />
                ))}
              </div>
            </div>
            <div 
              className="px-3 py-2 text-[10px]"
              style={{ backgroundColor: '#F5F5F5', color: colors.textMuted }}
            >
              poseandpoise.com/{modelName.toLowerCase().replace(' ', '')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// Photos Step Component
// ============================================================================

interface PhotosStepProps {
  photos: PortfolioPhoto[];
  onAddPhotos: (files: FileList) => void;
  onToggleVisibility: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onUpdateCredit: (id: string, field: 'photographer' | 'studio', value: string) => void;
  selectedTemplate: string;
  templates: Template[];
  modelName: string;
}

const PhotosStep: React.FC<PhotosStepProps> = ({
  photos,
  onAddPhotos,
  onToggleVisibility,
  onRemovePhoto,
  onUpdateCredit,
  selectedTemplate,
  templates,
  modelName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onAddPhotos(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddPhotos(e.target.files);
    }
  };

  const visibleCount = photos.filter(p => p.visible).length;
  const hiddenCount = photos.filter(p => !p.visible).length;
  const selected = templates.find(t => t.id === selectedTemplate) || templates[0];

  return (
    <>
      <h1
        className="text-3xl mb-2"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: colors.textPrimary }}
      >
        Upload Your Photos
      </h1>
      <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
        Add your best shots and give credit to photographers and studios.
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => photoInputRef.current?.click()}
        className={`mb-8 p-8 text-center cursor-pointer transition-all border-2 border-dashed rounded-xl ${
          isDragging ? 'border-camel' : ''
        }`}
        style={{ 
          backgroundColor: isDragging ? colors.cream : colors.white, 
          borderColor: isDragging ? colors.camel : colors.border 
        }}
      >
        <div className="flex flex-col items-center" style={{ color: colors.charcoal }}>
          <UploadIcon size={32} />
          <p className="text-sm font-medium mt-3" style={{ color: colors.textPrimary }}>
            Drag & drop photos here, or click to browse
          </p>
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
            Supports JPG, PNG, WEBP up to 10MB each
          </p>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {photos.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm" style={{ color: colors.success }}>{visibleCount} visible</span>
            <span className="text-sm" style={{ color: colors.textMuted }}>{hiddenCount} hidden</span>
            <span className="text-xs" style={{ color: colors.textMuted }}>
              Drag to reorder • Click eye to show/hide
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative group">
                <div
                  className="aspect-[3/4] bg-cover bg-center relative overflow-hidden rounded-lg"
                  style={{
                    backgroundImage: `url(${photo.url})`,
                    opacity: photo.visible ? 1 : 0.5,
                  }}
                >
                  <div 
                    className="absolute bottom-2 left-2 px-2 py-1 text-[10px] font-medium rounded"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: colors.white }}
                  >
                    #{index + 1}
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onToggleVisibility(photo.id); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: photo.visible ? colors.success : colors.textMuted,
                        color: colors.white 
                      }}
                    >
                      {photo.visible ? <EyeIcon size={12} /> : <EyeOffIcon size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingPhoto(editingPhoto === photo.id ? null : photo.id); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.camel, color: colors.white }}
                    >
                      <LinkIcon size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemovePhoto(photo.id); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FF5F56', color: colors.white }}
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                </div>

                {editingPhoto === photo.id && (
                  <div 
                    className="absolute inset-x-0 bottom-0 p-3 z-10 rounded-b-lg"
                    style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                  >
                    <input
                      type="text"
                      placeholder="Photographer name"
                      value={photo.photographer}
                      onChange={(e) => onUpdateCredit(photo.id, 'photographer', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1.5 text-xs mb-2 outline-none"
                      style={{ border: `1px solid ${colors.border}` }}
                    />
                    <input
                      type="text"
                      placeholder="Studio name"
                      value={photo.studio}
                      onChange={(e) => onUpdateCredit(photo.id, 'studio', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1.5 text-xs outline-none"
                      style={{ border: `1px solid ${colors.border}` }}
                    />
                  </div>
                )}

                {editingPhoto !== photo.id && (photo.photographer || photo.studio) && (
                  <div className="mt-1">
                    {photo.photographer && (
                      <p className="text-[10px]" style={{ color: colors.textMuted }}>📸 {photo.photographer}</p>
                    )}
                    {photo.studio && (
                      <p className="text-[10px]" style={{ color: colors.textMuted }}>🏠 {photo.studio}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {photos.length > 0 && (
        <div className="p-6 rounded-xl" style={{ backgroundColor: colors.cream }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium" style={{ color: colors.textPrimary }}>Ready to launch?</h3>
              <p className="text-xs" style={{ color: colors.textMuted }}>Your portfolio is looking great! Here's a preview.</p>
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors hover:opacity-80"
                style={{ 
                  border: `1px solid ${colors.border}`, 
                  backgroundColor: colors.white, 
                  color: colors.textPrimary 
                }}
              >
                <EyeIcon size={14} />
                Preview Portfolio
              </button>
              <button 
                type="button" 
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ 
                  border: `1px solid ${colors.camel}`, 
                  backgroundColor: 'transparent', 
                  color: colors.camel 
                }}
              >
                <LayoutIcon size={14} />
                Open Editor
              </button>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-1.5 px-3 py-2" style={{ backgroundColor: '#F5F5F5' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF5F56' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#27CA40' }} />
            </div>
            <div className="p-4" style={{ backgroundColor: selected.bgColor }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 
                    className="text-sm font-medium"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: selected.textColor }}
                  >
                    {modelName}
                  </h3>
                  <span 
                    className="text-[8px] tracking-widest uppercase"
                    style={{ color: selected.textColor, opacity: 0.6 }}
                  >
                    MODEL
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {photos.filter(p => p.visible).slice(0, 5).map((photo) => (
                  <div 
                    key={photo.id} 
                    className="aspect-[3/4] bg-cover bg-center rounded" 
                    style={{ backgroundImage: `url(${photo.url})` }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// Main Component Props
// ============================================================================

interface ExistingProfile {
  display_name?: string | null;
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  agency?: string | null;
}

interface OnboardingWizardProps {
  userEmail: string;
  userId: string;
  existingProfile?: ExistingProfile;
}

// ============================================================================
// Main Component
// ============================================================================

export function OnboardingWizard({ 
  userEmail, 
  userId, 
  existingProfile 
}: OnboardingWizardProps): React.JSX.Element {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CurrentStep>('profile');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('detecting');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeUploadType, setActiveUploadType] = useState<UploadType>(null);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [isConnectingTikTok, setIsConnectingTikTok] = useState(false);
  const [socialConnectError, setSocialConnectError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: existingProfile?.display_name || '',
    username: existingProfile?.username || '',
    location: existingProfile?.location || '',
    instagram: '',
    tiktok: '',
    website: '',
    agency: existingProfile?.agency || '',
  });

  const [aboutData, setAboutData] = useState<AboutFormData>({
    stats: {
      height: '',
      bust: '',
      waist: '',
      hips: '',
      shoes: '',
      dress: '',
      hairColor: '',
      eyeColor: '',
    },
    bio: existingProfile?.bio || '',
    profilePhoto: existingProfile?.avatar_url || null,
  });

  const [servicesData, setServicesData] = useState<ServicesFormData>({
    experienceLevel: 'beginner',
    categories: [
      { id: 'editorial', name: 'Editorial', description: 'Magazine & fashion spreads', selected: false },
      { id: 'commercial', name: 'Commercial', description: 'Advertising & brands', selected: false },
      { id: 'runway', name: 'Runway', description: 'Fashion shows & events', selected: false },
      { id: 'lifestyle', name: 'Lifestyle', description: 'Casual & everyday looks', selected: false },
      { id: 'fitness', name: 'Fitness', description: 'Athletic & wellness', selected: false },
      { id: 'beauty', name: 'Beauty', description: 'Makeup & skincare', selected: false },
      { id: 'catalog', name: 'Catalog', description: 'E-commerce & product', selected: false },
      { id: 'promotional', name: 'Promotional', description: 'Events & brand ambassador', selected: false },
    ],
    pricing: {
      hourly: '',
      halfDay: '',
      fullDay: '',
    },
    travelAvailable: false,
    travelRadius: '',
    tfpAvailable: false,
  });

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionsApplied, setSuggestionsApplied] = useState(false);

  // Template and Photos state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('poise');
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);

  // Model name derived from profile data
  const modelName = profileData.displayName || 'Your Name';

  const steps: OnboardingStep[] = [
    { id: 'profile', name: 'PROFILE', completed: ['about', 'services', 'template', 'photos'].includes(currentStep), current: currentStep === 'profile' },
    { id: 'about', name: 'ABOUT', completed: ['services', 'template', 'photos'].includes(currentStep), current: currentStep === 'about' },
    { id: 'services', name: 'SERVICES', completed: ['template', 'photos'].includes(currentStep), current: currentStep === 'services' },
    { id: 'template', name: 'TEMPLATE', completed: currentStep === 'photos', current: currentStep === 'template' },
    { id: 'photos', name: 'PHOTOS', completed: false, current: currentStep === 'photos' },
  ];

  // Location detection - use existing profile location or detect via geolocation API
  useEffect(() => {
    // If we already have a location from existing profile, use it
    if (existingProfile?.location) {
      setLocationStatus('found');
      return;
    }

    // Otherwise, try to detect location via browser geolocation
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get location name
          // Note: Nominatim requires a User-Agent header per their usage policy
          // https://operations.osmfoundation.org/policies/nominatim/
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'PoseAndPoise/1.0 (https://poseandpoise.com; contact@poseandpoise.com)',
              },
            }
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          const country = data.address?.country_code?.toUpperCase() || '';
          const locationString = [city, state, country].filter(Boolean).join(', ');
          
          if (locationString) {
            setProfileData(prev => ({ ...prev, location: locationString }));
            setLocationStatus('found');
          } else {
            setLocationStatus('error');
          }
        } catch {
          setLocationStatus('error');
        }
      },
      () => {
        setLocationStatus('error');
      },
      { timeout: 10000 }
    );
  }, [existingProfile?.location]);

  // Calculate collected fields
  const profileCollected = Object.values(profileData).filter(Boolean).length;
  const aboutCollected =
    Object.values(aboutData.stats).filter(Boolean).length +
    (aboutData.bio ? 1 : 0) +
    (aboutData.profilePhoto ? 1 : 0);
  const servicesCollected =
    servicesData.categories.filter(c => c.selected).length +
    Object.values(servicesData.pricing).filter(Boolean).length +
    (servicesData.travelAvailable ? 1 : 0) +
    (servicesData.tfpAvailable ? 1 : 0);
  
  const photosCollected = photos.length;
  
  const collectedFields = 
    currentStep === 'profile' ? profileCollected : 
    currentStep === 'about' ? aboutCollected : 
    currentStep === 'services' ? servicesCollected :
    currentStep === 'photos' ? photosCollected : 0;

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleProfileInputChange = (field: keyof ProfileFormData, value: string): void => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleStatsChange = (field: keyof ModelStats, value: string): void => {
    setAboutData(prev => ({
      ...prev,
      stats: { ...prev.stats, [field]: value },
    }));
  };

  const handleBioChange = (value: string): void => {
    setAboutData(prev => ({ ...prev, bio: value }));
  };

  const handleConnectInstagram = async (): Promise<void> => {
    setIsConnectingInstagram(true);
    setSocialConnectError(null);
    
    try {
      const response = await fetch('/api/social-profiles/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'instagram' }),
      });
      
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirect to OAuth provider - loading state will be cleared by page navigation
        // but we reset it here in case the redirect is blocked or delayed
        setIsConnectingInstagram(false);
        window.location.href = data.authUrl;
      } else {
        setSocialConnectError(data.error || 'Failed to connect Instagram');
        setIsConnectingInstagram(false);
      }
    } catch (error) {
      console.error('Instagram connection error:', error);
      setSocialConnectError('Failed to connect Instagram. Please try again.');
      setIsConnectingInstagram(false);
    }
  };

  const handleConnectTikTok = async (): Promise<void> => {
    setIsConnectingTikTok(true);
    setSocialConnectError(null);
    
    try {
      const response = await fetch('/api/social-profiles/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'tiktok' }),
      });
      
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirect to OAuth provider - loading state will be cleared by page navigation
        // but we reset it here in case the redirect is blocked or delayed
        setIsConnectingTikTok(false);
        window.location.href = data.authUrl;
      } else {
        setSocialConnectError(data.error || 'Failed to connect TikTok');
        setIsConnectingTikTok(false);
      }
    } catch (error) {
      console.error('TikTok connection error:', error);
      setSocialConnectError('Failed to connect TikTok. Please try again.');
      setIsConnectingTikTok(false);
    }
  };

  const triggerFileUpload = (type: UploadType): void => {
    setActiveUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;

      if (activeUploadType === 'profile') {
        setAboutData(prev => ({ ...prev, profilePhoto: imageUrl }));
      } else if (activeUploadType === 'analyzer') {
        simulatePhotoAnalysis();
      } else if (activeUploadType === 'scanner') {
        simulateCompCardScan();
      }
      
      // Reset upload type after processing is complete
      setActiveUploadType(null);
    };
    reader.readAsDataURL(file);
  };

  const simulatePhotoAnalysis = (): void => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    setTimeout(() => {
      setAboutData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          hairColor: 'Brunette',
          eyeColor: 'Hazel',
          height: "5'9\"",
        },
      }));
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setTimeout(() => setAnalysisComplete(false), 3000);
    }, 2000);
  };

  const simulateCompCardScan = (): void => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    setTimeout(() => {
      setAboutData(prev => ({
        ...prev,
        stats: {
          height: "5'9\"",
          bust: '32"',
          waist: '24"',
          hips: '34"',
          shoes: '8',
          dress: '4',
          hairColor: 'Brunette',
          eyeColor: 'Hazel',
        },
      }));
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setTimeout(() => setAnalysisComplete(false), 3000);
    }, 2500);
  };

  const handleGenerateBio = (): void => {
    setIsGeneratingBio(true);
    setTimeout(() => {
      setAboutData(prev => ({
        ...prev,
        bio: `A rising face in contemporary fashion, known for striking versatility and effortless presence. Equally at home in high-fashion editorials as in commercial lifestyle campaigns. Brings quiet confidence to every shoot with intentional movement and fluid poses. Drawn to work that tells a story, collaborating with photographers and creatives who push boundaries.`,
      }));
      setIsGeneratingBio(false);
    }, 1500);
  };

  // Services Handlers
  const handleExperienceChange = (level: ExperienceLevel): void => {
    setServicesData(prev => ({ ...prev, experienceLevel: level }));
  };

  const handleCategoryToggle = (id: string): void => {
    setServicesData(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === id ? { ...cat, selected: !cat.selected } : cat
      ),
    }));
  };

  const handlePricingChange = (field: keyof PricingTier, value: string): void => {
    setServicesData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }));
  };

  const handleTravelToggle = (): void => {
    setServicesData(prev => ({ ...prev, travelAvailable: !prev.travelAvailable }));
  };

  const handleTravelRadiusChange = (value: string): void => {
    setServicesData(prev => ({ ...prev, travelRadius: value }));
  };

  const handleTfpToggle = (): void => {
    setServicesData(prev => ({ ...prev, tfpAvailable: !prev.tfpAvailable }));
  };

  const handleSuggestServices = (): void => {
    setIsSuggesting(true);
    setSuggestionsApplied(false);

    setTimeout(() => {
      setServicesData(prev => ({
        ...prev,
        experienceLevel: 'intermediate',
        categories: prev.categories.map(cat => ({
          ...cat,
          selected: ['editorial', 'commercial', 'lifestyle', 'beauty'].includes(cat.id),
        })),
        pricing: {
          hourly: '150',
          halfDay: '500',
          fullDay: '900',
        },
        travelAvailable: true,
        travelRadius: '50 miles',
        tfpAvailable: true,
      }));
      setIsSuggesting(false);
      setSuggestionsApplied(true);
      setTimeout(() => setSuggestionsApplied(false), 3000);
    }, 2000);
  };

  // Photo handlers
  const handleAddPhotos = (files: FileList): void => {
    const timestamp = Date.now();
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: PortfolioPhoto = {
          id: `photo-${timestamp}-${index}`,
          url: e.target?.result as string,
          photographer: '',
          studio: '',
          visible: true,
          // Calculate order based on current state length inside the callback
          // to handle async completion correctly
          order: 0, // Will be set correctly in setPhotos
        };
        setPhotos((prev) => {
          const updatedPhoto = { ...newPhoto, order: prev.length };
          return [...prev, updatedPhoto];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTogglePhotoVisibility = (id: string): void => {
    setPhotos((prev) => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  };

  const handleRemovePhoto = (id: string): void => {
    setPhotos((prev) => prev.filter(p => p.id !== id));
  };

  const handleUpdatePhotoCredit = (id: string, field: 'photographer' | 'studio', value: string): void => {
    setPhotos((prev) => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleLaunchPortfolio = (): void => {
    // TODO: Implement actual portfolio launch logic
    alert('Portfolio launched successfully! 🚀');
  };

  const handleBack = (): void => {
    if (currentStep === 'about') setCurrentStep('profile');
    else if (currentStep === 'services') setCurrentStep('about');
    else if (currentStep === 'template') setCurrentStep('services');
    else if (currentStep === 'photos') setCurrentStep('template');
  };

  const validateProfileStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!profileData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    
    if (!profileData.username.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(profileData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    } else if (profileData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = (): void => {
    // Validate current step before proceeding
    if (currentStep === 'profile') {
      if (!validateProfileStep()) return;
      setCurrentStep('about');
    } else if (currentStep === 'about') {
      setCurrentStep('services');
    } else if (currentStep === 'services') {
      setCurrentStep('template');
    } else if (currentStep === 'template') {
      setCurrentStep('photos');
    }
    // photos is the last step - could redirect to dashboard or show completion
  };

  const handleSkip = (): void => {
    // Skip bypasses validation and moves to the next step
    setValidationErrors({});
    if (currentStep === 'profile') {
      setCurrentStep('about');
    } else if (currentStep === 'about') {
      setCurrentStep('services');
    } else if (currentStep === 'services') {
      setCurrentStep('template');
    } else if (currentStep === 'template') {
      setCurrentStep('photos');
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream, fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: colors.border }}>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '14px',
            letterSpacing: '0.2em',
            color: colors.textPrimary,
          }}
        >
          POSE & POISE
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.camel, color: colors.white }}
          >
            <Sparkles size={14} />
            UPGRADE
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: colors.charcoal, color: colors.cream }}
          >
            JL
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        <StepIndicator steps={steps} />

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: `1px solid ${colors.border}` }}>
          {currentStep === 'profile' && (
            <ProfileStepContent
              formData={profileData}
              locationStatus={locationStatus}
              onInputChange={handleProfileInputChange}
              onConnectInstagram={handleConnectInstagram}
              onConnectTikTok={handleConnectTikTok}
              validationErrors={validationErrors}
            />
          )}

          {currentStep === 'about' && (
            <AboutStep
              formData={aboutData}
              isAnalyzing={isAnalyzing}
              isGeneratingBio={isGeneratingBio}
              analysisComplete={analysisComplete}
              onStatsChange={handleStatsChange}
              onBioChange={handleBioChange}
              onPhotoUpload={() => triggerFileUpload('profile')}
              onAnalyzerClick={() => triggerFileUpload('analyzer')}
              onScannerClick={() => triggerFileUpload('scanner')}
              onGenerateBio={handleGenerateBio}
            />
          )}

          {currentStep === 'services' && (
            <ServicesStep
              formData={servicesData}
              isSuggesting={isSuggesting}
              suggestionsApplied={suggestionsApplied}
              onExperienceChange={handleExperienceChange}
              onCategoryToggle={handleCategoryToggle}
              onPricingChange={handlePricingChange}
              onTravelToggle={handleTravelToggle}
              onTravelRadiusChange={handleTravelRadiusChange}
              onTfpToggle={handleTfpToggle}
              onSuggestServices={handleSuggestServices}
            />
          )}

          {currentStep === 'template' && (
            <TemplateStep
              templates={TEMPLATES}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
              modelName={modelName}
            />
          )}

          {currentStep === 'photos' && (
            <PhotosStep
              photos={photos}
              onAddPhotos={handleAddPhotos}
              onToggleVisibility={handleTogglePhotoVisibility}
              onRemovePhoto={handleRemovePhoto}
              onUpdateCredit={handleUpdatePhotoCredit}
              selectedTemplate={selectedTemplate}
              templates={TEMPLATES}
              modelName={modelName}
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep !== 'profile' && (
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-6 rounded-lg text-sm font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
                style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
              >
                <ChevronLeft size={16} />
                BACK
              </button>
            )}
            {currentStep === 'profile' && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
              >
                SKIP
              </button>
            )}
            {currentStep !== 'photos' ? (
              <button
                type="button"
                onClick={handleContinue}
                className="flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.charcoal, color: colors.white }}
              >
                CONTINUE
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunchPortfolio}
                className="flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.camel, color: colors.white }}
              >
                <RocketIcon size={16} />
                LAUNCH PORTFOLIO
              </button>
            )}
          </div>
        </div>

        <ProgressIndicator collectedCount={collectedFields} />
      </main>

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 px-8 py-4 flex items-center justify-between text-xs"
        style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.border}`, color: colors.textMuted }}
      >
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.15em' }}>
          POSE & POISE
        </span>
        <div className="flex gap-6">
          <a href="/pricing" className="hover:opacity-70">Pricing</a>
          <a href="/dashboard/support" className="hover:opacity-70">Contact</a>
          <a href="/privacy" className="hover:opacity-70">Privacy</a>
          <a href="/terms" className="hover:opacity-70">Terms</a>
        </div>
        <span>© 2025 Pose & Poise. All rights reserved.</span>
      </footer>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Outfit:wght@300;400;500&display=swap');
        
        input:focus, textarea:focus {
          border-color: ${colors.camel} !important;
        }
        
        input::placeholder, textarea::placeholder {
          color: ${colors.textMuted};
        }
      `}</style>
    </div>
  );
}

