import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MediaLibrary } from '@/components/photos/MediaLibrary';

export const metadata = {
  title: 'Media Library | Pose & Poise',
  description: 'Track photo performance and engagement analytics',
};

export default async function MediaLibraryPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Get user's username for portfolio editor link
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  // Fetch photos with analytics data
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('id, url, thumbnail_url, caption, sort_order, is_visible, view_count, click_count, created_at')
    .eq('profile_id', user.id)
    .order('sort_order', { ascending: true });

  if (photosError) {
    console.error('Error fetching photos:', photosError);
  }

  // Normalize photos with defaults
  const normalizedPhotos = (photos || []).map((photo) => ({
    ...photo,
    is_visible: photo.is_visible ?? true,
    view_count: photo.view_count ?? 0,
    click_count: photo.click_count ?? 0,
  }));

  // Calculate totals
  const totalViews = normalizedPhotos.reduce((sum, p) => sum + p.view_count, 0);
  const totalClicks = normalizedPhotos.reduce((sum, p) => sum + p.click_count, 0);

  return (
    <MediaLibrary
      photos={normalizedPhotos}
      totalViews={totalViews}
      totalClicks={totalClicks}
      username={profile?.username || null}
    />
  );
}
