// =============================================================================
// FILE: app/[username]/page.tsx
// PURPOSE: Public portfolio page - NO editing capabilities, public view only
// =============================================================================

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTemplate } from '@/templates';
import type { PortfolioData } from '@/types/portfolio';

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getPublicPortfolioData(username: string): Promise<PortfolioData | null> {
  const supabase = await createClient();

  // Get profile with public data only
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      bio,
      avatar_url,
      agency,
      location,
      template,
      is_public,
      is_published,
      height_cm,
      bust_cm,
      waist_cm,
      hips_cm,
      shoe_size,
      hair_color,
      eye_color,
      instagram,
      tiktok,
      website,
      accent_color
    `)
    .eq('username', username)
    .single();
  
  if (profileError || !profile) {
    return null;
  }
  
  // Get ONLY visible photos for public view
  const { data: photos } = await supabase
    .from('photos')
    .select('id, url, thumbnail_url, caption, sort_order, width, height')
    .eq('profile_id', profile.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  
  // Get services
  const { data: services } = await supabase
    .from('services')
    .select('id, title, description, price, sort_order')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true });
  
  // Get primary comp card for display with full details
  const { data: compCard } = await supabase
    .from('comp_cards')
    .select('id, photo_ids, template, card_type, pdf_url, uploaded_file_url')
    .eq('profile_id', profile.id)
    .eq('is_primary', true)
    .single();
  
  // Transform to PortfolioData interface
  return {
    profile: {
      displayName: profile.display_name || '',
      username: profile.username,
      bio: profile.bio || '',
      avatarUrl: profile.avatar_url || '',
      agency: profile.agency,
      location: profile.location,
    },
    stats: {
      heightCm: profile.height_cm || 0,
      bustCm: profile.bust_cm || 0,
      waistCm: profile.waist_cm || 0,
      hipsCm: profile.hips_cm || 0,
      shoeSize: profile.shoe_size || '',
      hairColor: profile.hair_color || '',
      eyeColor: profile.eye_color || '',
    },
    photos: (photos || []).map(photo => ({
      id: photo.id,
      url: photo.url,
      thumbnailUrl: photo.thumbnail_url || photo.url,
      caption: photo.caption,
      sortOrder: photo.sort_order,
      width: photo.width,
      height: photo.height,
      isVisible: true, // All photos in public view are visible
    })),
    services: (services || []).map(service => ({
      title: service.title,
      description: service.description,
      price: service.price,
    })),
    social: {
      instagram: profile.instagram,
      tiktok: profile.tiktok,
      website: profile.website,
    },
    compCard: compCard ? {
      photoIds: compCard.photo_ids,
    } : undefined,
    settings: {
      template: profile.template || 'elysian',
      accentColor: profile.accent_color,
      isPublished: profile.is_published || false,
      isPublic: profile.is_public || false,
    },
  };
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { username } = await params;
  
  // Fetch public portfolio data
  const data = await getPublicPortfolioData(username);
  
  if (!data) {
    notFound();
  }
  
  // Check if portfolio is published for public viewing
  if (!data.settings.isPublished) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF9F7',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        textAlign: 'center',
        padding: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '48px', fontWeight: 300, marginBottom: '16px' }}>
            Coming Soon
          </h1>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '16px',
            color: 'rgba(26, 26, 26, 0.6)',
          }}>
            This portfolio is being crafted and will be available soon.
          </p>
        </div>
      </div>
    );
  }
  
  // Render the selected template - PUBLIC VIEW ONLY, NO EDITING
  const Template = getTemplate(data.settings.template);
  
  return <Template data={data} />;
}

// Metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const data = await getPublicPortfolioData(username);
  
  if (!data) {
    return { title: 'Not Found' };
  }
  
  return {
    title: `${data.profile.displayName} | Model Portfolio`,
    description: data.profile.bio || `Professional portfolio of ${data.profile.displayName}`,
    openGraph: {
      title: `${data.profile.displayName} | Model Portfolio`,
      description: data.profile.bio,
      images: data.photos[0]?.url ? [{ url: data.photos[0].url }] : [],
    },
  };
}
