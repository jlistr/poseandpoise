import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PhotoGrid } from '@/components/photos';
import { revalidatePath } from 'next/cache';
import type { Photo, PhotoUpdate } from '@/types/photo';

export default async function PhotosPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch photos ordered by sort_order (including analytics counts)
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*, view_count, click_count')
    .eq('profile_id', user.id)
    .order('sort_order', { ascending: true });

  if (photosError) {
    console.error('Error fetching photos:', photosError);
  }

  // Normalize photos to ensure is_visible exists (defaults to true)
  const normalizedPhotos: Photo[] = (photos || []).map((photo) => ({
    ...photo,
    is_visible: photo.is_visible ?? true,
    view_count: photo.view_count ?? 0,
    click_count: photo.click_count ?? 0,
  }));

  // Server action: Save photo order and visibility
  async function savePhotos(updates: PhotoUpdate[]) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    for (const update of updates) {
      const { error } = await supabase
        .from('photos')
        .update({
          sort_order: update.sort_order,
          is_visible: update.is_visible,
        })
        .eq('id', update.id)
        .eq('profile_id', user.id);

      if (error) {
        console.error('Error updating photo:', update.id, error);
        throw new Error(`Failed to update photo: ${error.message}`);
      }
    }

    revalidatePath('/dashboard/photos');
  }

  // Server action: Update photo caption
  async function updateCaption(photoId: string, caption: string) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('photos')
      .update({
        caption: caption || null,
      })
      .eq('id', photoId)
      .eq('profile_id', user.id);

    if (error) {
      console.error('Error updating caption:', error);
      throw new Error(`Failed to update caption: ${error.message}`);
    }

    revalidatePath('/dashboard/photos');
  }

  // Server action: Delete a photo
  async function deletePhoto(photoId: string) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get the photo to delete from storage as well
    const { data: photo } = await supabase
      .from('photos')
      .select('url, thumbnail_url')
      .eq('id', photoId)
      .eq('profile_id', user.id)
      .single();

    if (photo) {
      try {
        const urlPath = new URL(photo.url).pathname;
        const storagePath = urlPath.split('/storage/v1/object/public/portfolio-photos/')[1];
        
        if (storagePath) {
          await supabase.storage
            .from('portfolio-photos')
            .remove([storagePath]);
        }

        if (photo.thumbnail_url) {
          const thumbPath = new URL(photo.thumbnail_url).pathname;
          const thumbStoragePath = thumbPath.split('/storage/v1/object/public/portfolio-photos/')[1];
          if (thumbStoragePath) {
            await supabase.storage
              .from('portfolio-photos')
              .remove([thumbStoragePath]);
          }
        }
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
      }
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('profile_id', user.id);

    if (error) {
      console.error('Error deleting photo:', error);
      throw new Error(`Failed to delete photo: ${error.message}`);
    }

    revalidatePath('/dashboard/photos');
  }

  return (
    <PhotoGrid
      initialPhotos={normalizedPhotos}
      onSave={savePhotos}
      onDelete={deletePhoto}
      onUpdateCaption={updateCaption}
    />
  );
}