// =============================================================================
// FILE: app/dashboard/preview/[username]/page.tsx
// PURPOSE: Preview mode for paid subscribers - allows editing directly on the page
// =============================================================================

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PortfolioPreview } from '@/components/portfolio';
import type { PortfolioData } from '@/types/portfolio';

interface PageProps {
  params: Promise<{ username: string }>;
}

type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'DELUXE';

async function getPortfolioData(username: string): Promise<PortfolioData | null> {
  const supabase = await createClient();

  // Get profile with all related data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      email,
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
      accent_color,
      subscription_tier
    `)
    .eq('username', username)
    .single();
  
  if (profileError || !profile) {
    return null;
  }
  
  // Get ALL photos (owner can see hidden ones)
  const { data: photos } = await supabase
    .from('photos')
    .select('id, url, thumbnail_url, caption, sort_order, width, height, is_visible')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true });
  
  // Get services
  const { data: services } = await supabase
    .from('services')
    .select('id, title, description, price, sort_order')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true });
  
  // Get all saved comp cards
  const { data: compCards } = await supabase
    .from('comp_cards')
    .select('id, name, photo_ids, template, is_primary')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });
  
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
      isVisible: photo.is_visible ?? true,
    })),
    services: (services || []).map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
    })),
    social: {
      instagram: profile.instagram,
      tiktok: profile.tiktok,
      website: profile.website,
    },
    compCards: (compCards || []).map(card => ({
      id: card.id,
      name: card.name,
      photoIds: card.photo_ids,
      template: card.template,
      isPrimary: card.is_primary,
    })),
    settings: {
      template: profile.template || 'rose',
      accentColor: profile.accent_color,
      isPublished: profile.is_published || false,
      isPublic: profile.is_public || false,
      subscriptionTier: (profile.subscription_tier as SubscriptionTier) || 'FREE',
    },
  };
}

export default async function PreviewPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // Get profile and verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, subscription_tier')
    .eq('username', username)
    .single();
  
  if (!profile) {
    notFound();
  }
  
  // Verify the logged-in user owns this profile
  if (user.id !== profile.id) {
    redirect('/dashboard');
  }
  
  // Check subscription tier - only PROFESSIONAL and DELUXE can edit
  const tier = profile.subscription_tier as SubscriptionTier || 'FREE';
  const canEdit = tier === 'PROFESSIONAL' || tier === 'DELUXE';
  
  // Fetch portfolio data
  const data = await getPortfolioData(username);
  
  if (!data) {
    notFound();
  }
  
  // Render the preview editor (with or without edit capabilities based on tier)
  return <PortfolioPreview data={data} username={username} canEdit={canEdit} />;
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  
  return {
    title: `Preview - ${username} | Pose & Poise`,
    description: 'Preview and edit your portfolio',
  };
}

