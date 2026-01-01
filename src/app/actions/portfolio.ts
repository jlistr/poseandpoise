// =============================================================================
// FILE: app/actions/portfolio.ts
// PURPOSE: Server actions for managing portfolio data (photos, template, etc.)
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Simple server-side HTML sanitization (removes dangerous patterns)
function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove script tags, on* event handlers, javascript: URLs
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript\s*:/gi, '');
  
  // Allow only safe tags
  const allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span', 'div', 'font'];
  const tagPattern = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  
  clean = clean.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // For anchor tags, ensure href is safe
      if (tagName.toLowerCase() === 'a') {
        const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
          if (href.toLowerCase().startsWith('javascript:')) {
            return match.replace(hrefMatch[0], '');
          }
        }
      }
      return match;
    }
    return '';
  });
  
  return clean;
}

export interface PhotoUpdate {
  id: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface ProfileUpdate {
  bio?: string;
  avatarUrl?: string;
  displayName?: string;
  location?: string;
}

export interface ServiceUpdate {
  id?: string;
  title: string;
  description: string;
  price: string;
  sortOrder: number;
}

// =============================================================================
// Save photo order and visibility changes
// =============================================================================
export async function savePhotoUpdates(updates: PhotoUpdate[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    for (const update of updates) {
      const { error } = await supabase
        .from('photos')
        .update({
          sort_order: update.sortOrder,
          is_visible: update.isVisible,
        })
        .eq('id', update.id)
        .eq('profile_id', user.id);

      if (error) {
        console.error('Error updating photo:', update.id, error);
        return { success: false, error: `Failed to update photo: ${error.message}` };
      }
    }

    revalidatePath(`/[username]`, 'page');
    revalidatePath('/dashboard/photos');
    
    return { success: true };
  } catch (err) {
    console.error('Error saving photo updates:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// Save template selection
// =============================================================================
export async function saveTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ template: templateId })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating template:', error);
      return { success: false, error: `Failed to update template: ${error.message}` };
    }

    revalidatePath(`/[username]`, 'page');
    
    return { success: true };
  } catch (err) {
    console.error('Error saving template:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// Publish/unpublish portfolio
// =============================================================================
export async function togglePublished(isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_published: isPublished })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating published status:', error);
      return { success: false, error: `Failed to update published status: ${error.message}` };
    }

    revalidatePath(`/[username]`, 'page');
    
    return { success: true };
  } catch (err) {
    console.error('Error toggling published:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// Update profile data (bio, avatar, etc.)
// =============================================================================
export async function saveProfileUpdate(update: ProfileUpdate): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const updateData: Record<string, string | undefined> = {};
    
    // Sanitize bio if provided (it may contain HTML from RTE)
    if (update.bio !== undefined) {
      updateData.bio = sanitizeHtml(update.bio);
    }
    
    if (update.avatarUrl !== undefined) {
      updateData.avatar_url = update.avatarUrl;
    }
    
    if (update.displayName !== undefined) {
      // Plain text - just trim
      updateData.display_name = update.displayName.trim().slice(0, 100);
    }
    
    if (update.location !== undefined) {
      updateData.location = update.location.trim().slice(0, 100);
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: `Failed to update profile: ${error.message}` };
    }

    revalidatePath(`/[username]`, 'page');
    revalidatePath('/dashboard/profile');
    
    return { success: true };
  } catch (err) {
    console.error('Error saving profile update:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// Update services
// =============================================================================
export async function saveServices(services: ServiceUpdate[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Delete existing services for this user
    await supabase
      .from('services')
      .delete()
      .eq('profile_id', user.id);

    // Insert new services
    if (services.length > 0) {
      const servicesToInsert = services.map((service, index) => ({
        profile_id: user.id,
        title: service.title.trim().slice(0, 100),
        description: sanitizeHtml(service.description),
        price: service.price.trim().slice(0, 50),
        sort_order: service.sortOrder ?? index,
      }));

      const { error } = await supabase
        .from('services')
        .insert(servicesToInsert);

      if (error) {
        console.error('Error inserting services:', error);
        return { success: false, error: `Failed to save services: ${error.message}` };
      }
    }

    revalidatePath(`/[username]`, 'page');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (err) {
    console.error('Error saving services:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// Upload portfolio photo
// =============================================================================
export interface UploadPhotoResult {
  success: boolean;
  photo?: {
    id: string;
    url: string;
    sortOrder: number;
    isVisible: boolean;
  };
  error?: string;
}

export async function uploadPortfolioPhoto(formData: FormData): Promise<UploadPhotoResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, or WebP.' };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 10MB.' };
    }

    // Get current max sort order
    const { data: existingPhotos } = await supabase
      .from('photos')
      .select('sort_order')
      .eq('profile_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSortOrder = existingPhotos && existingPhotos.length > 0 
      ? existingPhotos[0].sort_order + 1 
      : 0;

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${user.id}/photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('portfolio-photos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return { success: false, error: `Failed to upload: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-photos')
      .getPublicUrl(filename);

    // Insert photo record
    const { data: photoRecord, error: insertError } = await supabase
      .from('photos')
      .insert({
        profile_id: user.id,
        url: publicUrl,
        sort_order: nextSortOrder,
        is_visible: true,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting photo record:', insertError);
      return { success: false, error: `Failed to save photo: ${insertError.message}` };
    }

    revalidatePath(`/[username]`, 'page');
    revalidatePath('/dashboard/photos');

    return { 
      success: true, 
      photo: {
        id: photoRecord.id,
        url: publicUrl,
        sortOrder: nextSortOrder,
        isVisible: true,
      }
    };
  } catch (err) {
    console.error('Error uploading photo:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// Delete portfolio photo
// =============================================================================
export async function deletePortfolioPhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Get photo URL to delete from storage
    const { data: photo } = await supabase
      .from('photos')
      .select('url')
      .eq('id', photoId)
      .eq('profile_id', user.id)
      .single();

    if (!photo) {
      return { success: false, error: 'Photo not found' };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('profile_id', user.id);

    if (deleteError) {
      console.error('Error deleting photo:', deleteError);
      return { success: false, error: `Failed to delete: ${deleteError.message}` };
    }

    // Try to delete from storage (extract path from URL)
    try {
      const url = new URL(photo.url);
      const pathMatch = url.pathname.match(/\/portfolio-photos\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from('portfolio-photos')
          .remove([pathMatch[1]]);
      }
    } catch {
      // Storage deletion is best-effort
      console.warn('Could not delete photo from storage');
    }

    revalidatePath(`/[username]`, 'page');
    revalidatePath('/dashboard/photos');

    return { success: true };
  } catch (err) {
    console.error('Error deleting photo:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// Upload avatar image
// =============================================================================
export async function uploadAvatar(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF.' };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 5MB.' };
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${user.id}/avatar-${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('portfolio-photos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return { success: false, error: `Failed to upload: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-photos')
      .getPublicUrl(filename);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile with avatar:', updateError);
      return { success: false, error: `Failed to update profile: ${updateError.message}` };
    }

    revalidatePath(`/[username]`, 'page');
    revalidatePath('/dashboard/profile');

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('Error uploading avatar:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

