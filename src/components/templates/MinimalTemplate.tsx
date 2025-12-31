import { EditorialTemplate } from "./EditorialTemplate";

// Re-use the same props interface
interface Photo {
  id: string;
  url: string;
  caption?: string | null;
}

interface ProfileData {
  id: string;
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
  photos: Photo[];
}

interface MinimalTemplateProps {
  profile: ProfileData;
  username: string;
}

export function MinimalTemplate({ profile, username }: MinimalTemplateProps) {
  // TODO: Implement minimal template design
  // Clean, focused design that lets photos take center stage
  // 
  // Design ideas:
  // - Full-bleed hero image
  // - Minimal text overlay
  // - Single-column photo scroll
  // - Hidden stats until hover/click
  
  // For now, fall back to Editorial
  return <EditorialTemplate profile={profile} username={username} />;
}