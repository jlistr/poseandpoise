

      {/* Services Section */}
            <section 
                    id="services"
                            className="py-32 px-8"
                                  >
                                          <div className="max-w-4xl mx-auto">
                                                    <h2 
                                                                className="text-xs tracking-[0.3em] uppercase mb-4 text-center"
                                                                            style={{ color: accentRed }}
                                                                                      >
                                                                                                  Services
                                                                                                            </h2>
                                                                                                                      <h3 
                                                                                                                                  className="text-3xl md:text-4xl font-light mb-16 text-center"
                                                                                                                                              style={{ color: primaryBlack }}
                                                                                                                                                        >
                                                                                                                                                                    Available For
                                                                                                                                                                              </h3>
                                                                                                                                                                              
                                                                                                                                                                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                                                                                                                                                                    {services && services.length > 0 ? (
                                                                                                                                                                                                                  services.map((service) => (
                                                                                                                                                                                                                                  <div 
                                                                                                                                                                                                                                                    key={service.id}
                                                                                                                                                                                                                                                                      className="p-8 border transition-colors duration-300 hover:border-red-500"
                                                                                                                                                                                                                                                                                        style={{ borderColor: 'rgba(10, 10, 10, 0.1)' }}
                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                          <h4 
                                                                                                                                                                                                                                                                                                                                              className="text-lg font-medium mb-3"
                                                                                                                                                                                                                                                                                                                                                                  style={{ color: primaryBlack }}
                                                                                                                                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                                                                                                                                        {service.title}
                                                                                                                                                                                                                                                                                                                                                                                                                          </h4>
                                                                                                                                                                                                                                                                                                                                                                                                                             // =============================================================================
// FILE: types/portfolio.ts
// PURPOSE: Shared TypeScript interfaces for portfolio data
// =============================================================================

export interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  agency?: string;
  location?: string;
}

export interface ModelStats {
  heightCm: number;
  bustCm: number;
  waistCm: number;
  hipsCm: number;
  shoeSize: string;
  hairColor: string;
  eyeColor: string;
}

export interface PortfolioPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string | null;
  sortOrder: number;
  width?: number;
  height?: number;
  isVisible: boolean;
}

export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  price?: string;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  website?: string;
}

export interface CompCardData {
  photoIds: string[];
}

export interface SavedCompCard {
  id: string;
  name?: string;
  photoIds: string[];
  template?: string;
  isPrimary: boolean;
  cardType?: 'generated' | 'uploaded' | 'branded';
  pdfUrl?: string;
  uploadedFileUrl?: string;
}

export type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'DELUXE';

export interface PortfolioSettings {
  template: string;
  accentColor?: string;
  isPublished: boolean;
  isPublic: boolean;
  subscriptionTier?: SubscriptionTier;
}

// Main interface that ALL templates must consume
export interface PortfolioData {
  profile: ProfileData;
  stats: ModelStats;
  photos: PortfolioPhoto[];
  services?: ServiceItem[];
  social: SocialLinks;
  compCard?: CompCardData;
  compCards?: SavedCompCard[]; // All saved comp cards for selection
  settings: PortfolioSettings;
}

// Template component type
export type TemplateComponent = React.FC<{ data: PortfolioData }>;

// Template metadata (for the selector UI)
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  thumbnailUrl: string;
  accentColor: string;
  // Layout characteristics for high-fidelity previews
  layout?: 'hero-split' | 'hero-fullscreen' | 'grid-first' | 'filmstrip';
  heroStyle?: 'left-aligned' | 'centered' | 'right-aligned' | 'overlay';
  galleryStyle?: 'masonry' | 'grid-3' | 'grid-2' | 'filmstrip' | 'stacked';
  navStyle?: 'minimal' | 'classic' | 'floating' | 'hidden';
  industryFocus?: string;
}
