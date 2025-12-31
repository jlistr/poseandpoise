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

interface ClassicTemplateProps {
  profile: ProfileData;
  username: string;
}

export function ClassicTemplate({ profile, username }: ClassicTemplateProps) {
  // TODO: Implement classic template design
  // Traditional comp card layout favored by agencies
  // 
  // Design ideas:
  // - 2x2 or 2x3 grid layout
  // - Stats prominently displayed
  // - Print-friendly aspect ratios
  // - Agency logo placement
  // - Contact info section
  
  // For now, fall back to Editorial
  return <EditorialTemplate profile={profile} username={username} />;
}