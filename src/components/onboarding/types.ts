// ============================================================================
// Onboarding Types & Design Tokens
// ============================================================================

// Step Types (ordered: template → photos → profile → services → about)
export type OnboardingStep = 'template' | 'photos' | 'profile' | 'services' | 'about';
export type LocationStatus = 'idle' | 'detecting' | 'found' | 'error';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'professional' | 'expert';

// Data Interfaces
export interface ProfileData {
  displayName: string;
  username: string;
  location: string;
  instagram: string;
  tiktok: string;
  website: string;
  agency: string;
}

export interface ModelStats {
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoes: string;
  dress: string;
  hairColor: string;
  eyeColor: string;
}

export interface AboutData {
  stats: ModelStats;
  bio: string;
  profilePhoto: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export interface PricingTier {
  hourly: string;
  halfDay: string;
  fullDay: string;
}

export interface ServicesData {
  experienceLevel: ExperienceLevel;
  categories: ServiceCategory[];
  pricing: PricingTier;
  travelAvailable: boolean;
  travelRadius: string;
  tfpAvailable: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  isPro: boolean;
  // Layout characteristics
  layout: 'hero-split' | 'hero-fullscreen' | 'grid-first' | 'filmstrip';
  heroStyle: 'left-aligned' | 'centered' | 'right-aligned' | 'overlay';
  galleryStyle: 'masonry' | 'grid-3' | 'grid-2' | 'filmstrip' | 'stacked';
  navStyle: 'minimal' | 'classic' | 'floating' | 'hidden';
}

export type PhotoUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

export interface PortfolioPhoto {
  id: string;
  url: string;
  file?: File;
  photographer: string;
  studio: string;
  visible: boolean;
  order: number;
  // Upload tracking
  uploadStatus: PhotoUploadStatus;
  uploadError?: string;
  serverId?: string; // ID from database after successful upload
  // Track what was uploaded to detect credit changes after upload
  uploadedPhotographer?: string;
  uploadedStudio?: string;
}

export interface OnboardingData {
  profile: ProfileData;
  about: AboutData;
  services: ServicesData;
  selectedTemplate: string;
  photos: PortfolioPhoto[];
}

// Step Info for Indicator
export interface StepInfo {
  id: OnboardingStep;
  name: string;
  completed: boolean;
  current: boolean;
}

// Props for existing profile data
export interface ExistingProfile {
  display_name?: string | null;
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  agency?: string | null;
}

// ============================================================================
// Design Tokens - Inline styles for Tailwind v4 compatibility
// ============================================================================

export const colors = {
  // Primary
  cream: '#FAF9F6',
  charcoal: '#2D2D2D',
  camel: '#C4A484',
  white: '#FFFFFF',
  
  // Borders
  border: '#E8E4DE',
  borderLight: 'rgba(44, 44, 44, 0.05)',
  
  // Text
  textPrimary: '#2D2D2D',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  // Status
  success: '#4CAF50',
  successLight: '#E8F5E9',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  
  // Social
  instagram: '#E1306C',
  tiktok: '#000000',
} as const;

export const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'Outfit', sans-serif",
} as const;

export const spacing = {
  cardPadding: '2rem',
  sectionGap: '2rem',
  inputGap: '1rem',
} as const;

// ============================================================================
// Default Data
// ============================================================================

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'fashion', name: 'Fashion', description: 'Runway, editorial, commercial fashion', selected: false },
  { id: 'commercial', name: 'Commercial', description: 'Advertising, product, lifestyle', selected: false },
  { id: 'editorial', name: 'Editorial', description: 'Magazine, artistic, conceptual', selected: false },
  { id: 'fitness', name: 'Fitness', description: 'Athletic wear, sports, wellness', selected: false },
  { id: 'glamour', name: 'Glamour', description: 'Beauty, swimwear, lingerie', selected: false },
  { id: 'portrait', name: 'Portrait', description: 'Headshots, personal branding', selected: false },
];

export const TEMPLATES: Template[] = [
  {
    id: 'elysian',
    name: 'Elysian',
    description: 'Soft pink masonry gallery with feminine elegance',
    accentColor: '#FF7AA2',
    bgColor: '#FAF8F6',
    textColor: '#2D2D2D',
    isPro: false,
    layout: 'hero-split',
    heroStyle: 'left-aligned',
    galleryStyle: 'masonry',
    navStyle: 'minimal',
  },
  {
    id: 'altar',
    name: 'Altar',
    description: 'Centered hero with clean 3-column grid',
    accentColor: '#C4A484',
    bgColor: '#FAF9F6',
    textColor: '#2D2D2D',
    isPro: false,
    layout: 'hero-fullscreen',
    heroStyle: 'centered',
    galleryStyle: 'grid-3',
    navStyle: 'classic',
  },
  {
    id: 'solstice',
    name: 'Solstice',
    description: 'Cinematic filmstrip with vintage warmth',
    accentColor: '#D4A574',
    bgColor: '#2C2420',
    textColor: '#F5F0EB',
    isPro: false,
    layout: 'filmstrip',
    heroStyle: 'overlay',
    galleryStyle: 'filmstrip',
    navStyle: 'floating',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Bold 2-column with dramatic full-bleed images',
    accentColor: '#FFFFFF',
    bgColor: '#1A1A1A',
    textColor: '#FFFFFF',
    isPro: true,
    layout: 'grid-first',
    heroStyle: 'right-aligned',
    galleryStyle: 'grid-2',
    navStyle: 'hidden',
  },
];

export const DEFAULT_PROFILE_DATA: ProfileData = {
  displayName: '',
  username: '',
  location: '',
  instagram: '',
  tiktok: '',
  website: '',
  agency: '',
};

export const DEFAULT_ABOUT_DATA: AboutData = {
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
  bio: '',
  profilePhoto: null,
};

export const DEFAULT_SERVICES_DATA: ServicesData = {
  experienceLevel: 'beginner',
  categories: DEFAULT_SERVICE_CATEGORIES,
  pricing: { hourly: '', halfDay: '', fullDay: '' },
  travelAvailable: false,
  travelRadius: '',
  tfpAvailable: true,
};

