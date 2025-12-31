// Template IDs
export type TemplateId = 'editorial' | 'minimal' | 'classic';

// Photo type
export interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  sort_order?: number;
}

// Profile data returned from getPublicProfile
export interface ProfileData {
  id: string;
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  agency?: string | null;
  height_cm?: number | null;
  bust_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  shoe_size?: string | null;
  hair_color?: string | null;
  eye_color?: string | null;
  location?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
  selected_template?: TemplateId | null;
  is_public?: boolean;
  photos: Photo[];
}

// Props interface for all template components
export interface TemplateProps {
  profile: ProfileData;
  username: string;
}

// Template metadata for the selector UI
export interface PortfolioTemplate {
  id: TemplateId;
  name: string;
  description: string;
  thumbnailUrl?: string;
  isAvailable: boolean;
  isPremium: boolean;
}