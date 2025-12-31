// ============================================================================
// POSE & POISE - COMMUNITY SERVER ACTIONS
// Location: src/app/(dashboard)/community/actions.ts
// ============================================================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CreatePostInput,
  CreateCommentInput,
  PostsQueryParams,
  PostsQueryResult,
  CommunityPostWithDetails,
  PostCommentWithAuthor,
  CommunityStats,
  InteractionType,
} from '@/types/community';

// -----------------------------------------------------------------------------
// Helper: Get current user and check subscription status
// -----------------------------------------------------------------------------

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, isPaidSubscriber: false };
  }

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  const isPaidSubscriber = subscription?.tier === 'PROFESSIONAL' || subscription?.tier === 'DELUXE';

  return { user, isPaidSubscriber };
}

// -----------------------------------------------------------------------------
// FETCH POSTS
// -----------------------------------------------------------------------------

export async function fetchPosts(params: PostsQueryParams = {}): Promise<PostsQueryResult> {
  const supabase = await createClient();
  const { user } = await getCurrentUser();

  const {
    post_type,
    search,
    page = 1,
    limit = 10,
    sort_by = 'created_at',
    sort_order = 'desc',
  } = params;

  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles!community_posts_author_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('is_published', true)
    .order(sort_by, { ascending: sort_order === 'asc' })
    .range(offset, offset + limit - 1);

  // Filter by post type
  if (post_type) {
    query = query.eq('post_type', post_type);
  }

  // Search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,photographer_name.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], total: 0, page, limit, has_more: false };
  }

  // Get user's interactions for these posts
  let userInteractions: Record<string, { helpful: boolean; bookmark: boolean }> = {};
  
  if (user && posts && posts.length > 0) {
    const postIds = posts.map(p => p.id);
    const { data: interactions } = await supabase
      .from('post_interactions')
      .select('post_id, interaction_type')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    if (interactions) {
      userInteractions = interactions.reduce((acc, int) => {
        if (!acc[int.post_id]) {
          acc[int.post_id] = { helpful: false, bookmark: false };
        }
        acc[int.post_id][int.interaction_type as 'helpful' | 'bookmark'] = true;
        return acc;
      }, {} as Record<string, { helpful: boolean; bookmark: boolean }>);
    }
  }

  // Combine posts with user interactions
  const postsWithDetails: CommunityPostWithDetails[] = (posts || []).map(post => ({
    ...post,
    // Hide author info for anonymous posts
    author: post.is_anonymous ? null : post.author,
    user_has_helpful: userInteractions[post.id]?.helpful || false,
    user_has_bookmark: userInteractions[post.id]?.bookmark || false,
  }));

  return {
    posts: postsWithDetails,
    total: count || 0,
    page,
    limit,
    has_more: (count || 0) > offset + limit,
  };
}

// -----------------------------------------------------------------------------
// FETCH SINGLE POST
// -----------------------------------------------------------------------------

export async function fetchPost(postId: string): Promise<CommunityPostWithDetails | null> {
  const supabase = await createClient();
  const { user } = await getCurrentUser();

  const { data: post, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles!community_posts_author_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single();

  if (error || !post) {
    return null;
  }

  // Get user's interactions
  let userHasHelpful = false;
  let userHasBookmark = false;

  if (user) {
    const { data: interactions } = await supabase
      .from('post_interactions')
      .select('interaction_type')
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (interactions) {
      userHasHelpful = interactions.some(i => i.interaction_type === 'helpful');
      userHasBookmark = interactions.some(i => i.interaction_type === 'bookmark');
    }
  }

  return {
    ...post,
    author: post.is_anonymous ? null : post.author,
    user_has_helpful: userHasHelpful,
    user_has_bookmark: userHasBookmark,
  };
}

// -----------------------------------------------------------------------------
// CREATE POST
// -----------------------------------------------------------------------------

export async function createPost(input: CreatePostInput): Promise<{ success: boolean; error?: string; postId?: string }> {
  const { user, isPaidSubscriber } = await getCurrentUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to create a post.' };
  }

  if (!isPaidSubscriber) {
    return { success: false, error: 'Upgrade to Pro to share your experiences with the community.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      author_id: user.id,
      post_type: input.post_type,
      title: input.title,
      content: input.content,
      location: input.location || null,
      photographer_name: input.photographer_name || null,
      rating: input.rating || null,
      tags: input.tags || [],
      image_urls: input.image_urls || [],
      is_anonymous: input.is_anonymous || false,
      is_published: false, // Requires moderation - set to true to auto-publish
      is_verified: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post. Please try again.' };
  }

  revalidatePath('/community');
  
  return { 
    success: true, 
    postId: data.id,
  };
}

// -----------------------------------------------------------------------------
// UPDATE POST
// -----------------------------------------------------------------------------

export async function updatePost(
  postId: string, 
  input: Partial<CreatePostInput>
): Promise<{ success: boolean; error?: string }> {
  const { user, isPaidSubscriber } = await getCurrentUser();

  if (!user) {
    return { success: false, error: 'You must be logged in.' };
  }

  if (!isPaidSubscriber) {
    return { success: false, error: 'Upgrade to Pro to edit posts.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('community_posts')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Failed to update post.' };
  }

  revalidatePath('/community');
  revalidatePath(`/community/${postId}`);
  
  return { success: true };
}

// -----------------------------------------------------------------------------
// DELETE POST
// -----------------------------------------------------------------------------

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUser();

  if (!user) {
    return { success: false, error: 'You must be logged in.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post.' };
  }

  revalidatePath('/community');
  
  return { success: true };
}

// -----------------------------------------------------------------------------
// TOGGLE INTERACTION (Helpful / Bookmark)
// -----------------------------------------------------------------------------

export async function toggleInteraction(
  postId: string, 
  interactionType: InteractionType
): Promise<{ success: boolean; isActive: boolean; error?: string }> {
  const { user } = await getCurrentUser();

  if (!user) {
    return { success: false, isActive: false, error: 'You must be logged in.' };
  }

  const supabase = await createClient();

  // Check if interaction already exists
  const { data: existing } = await supabase
    .from('post_interactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('interaction_type', interactionType)
    .single();

  if (existing) {
    // Remove interaction
    const { error } = await supabase
      .from('post_interactions')
      .delete()
      .eq('id', existing.id);

    if (error) {
      return { success: false, isActive: true, error: 'Failed to remove interaction.' };
    }

    revalidatePath('/community');
    return { success: true, isActive: false };
  } else {
    // Add interaction
    const { error } = await supabase
      .from('post_interactions')
      .insert({
        post_id: postId,
        user_id: user.id,
        interaction_type: interactionType,
      });

    if (error) {
      return { success: false, isActive: false, error: 'Failed to add interaction.' };
    }

    revalidatePath('/community');
    return { success: true, isActive: true };
  }
}

// -----------------------------------------------------------------------------
// FETCH COMMENTS
// -----------------------------------------------------------------------------

export async function fetchComments(postId: string): Promise<PostCommentWithAuthor[]> {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      author:profiles!post_comments_author_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return (comments || []).map(comment => ({
    ...comment,
    author: comment.is_anonymous ? null : comment.author,
  }));
}

// -----------------------------------------------------------------------------
// CREATE COMMENT
// -----------------------------------------------------------------------------

export async function createComment(input: CreateCommentInput): Promise<{ success: boolean; error?: string }> {
  const { user, isPaidSubscriber } = await getCurrentUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to comment.' };
  }

  if (!isPaidSubscriber) {
    return { success: false, error: 'Upgrade to Pro to comment on posts.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('post_comments')
    .insert({
      post_id: input.post_id,
      author_id: user.id,
      content: input.content,
      is_anonymous: input.is_anonymous || false,
    });

  if (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: 'Failed to post comment.' };
  }

  revalidatePath('/community');
  revalidatePath(`/community/${input.post_id}`);
  
  return { success: true };
}

// -----------------------------------------------------------------------------
// DELETE COMMENT
// -----------------------------------------------------------------------------

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUser();

  if (!user) {
    return { success: false, error: 'You must be logged in.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', user.id);

  if (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment.' };
  }

  revalidatePath('/community');
  
  return { success: true };
}

// -----------------------------------------------------------------------------
// FETCH COMMUNITY STATS
// -----------------------------------------------------------------------------

export async function fetchCommunityStats(): Promise<CommunityStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('community_stats')
    .select('*')
    .single();

  if (error || !data) {
    return {
      total_members: 0,
      safety_alerts_count: 0,
      success_stories_count: 0,
      verified_photographers_count: 0,
    };
  }

  return data;
}

// -----------------------------------------------------------------------------
// CHECK USER SUBSCRIPTION STATUS
// -----------------------------------------------------------------------------

export async function checkSubscriptionStatus(): Promise<{ 
  isLoggedIn: boolean; 
  isPaidSubscriber: boolean;
  userId?: string;
}> {
  const { user, isPaidSubscriber } = await getCurrentUser();
  
  return {
    isLoggedIn: !!user,
    isPaidSubscriber,
    userId: user?.id,
  };
}

// -----------------------------------------------------------------------------
// FETCH USER'S OWN POSTS
// -----------------------------------------------------------------------------

export async function fetchMyPosts(): Promise<CommunityPostWithDetails[]> {
  const { user } = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles!community_posts_author_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }

  return (posts || []).map(post => ({
    ...post,
    author: post.is_anonymous ? null : post.author,
    user_has_helpful: false,
    user_has_bookmark: false,
  }));
}

// -----------------------------------------------------------------------------
// FETCH USER'S BOOKMARKED POSTS
// -----------------------------------------------------------------------------

export async function fetchBookmarkedPosts(): Promise<CommunityPostWithDetails[]> {
  const { user } = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createClient();

  // First get bookmarked post IDs
  const { data: bookmarks } = await supabase
    .from('post_interactions')
    .select('post_id')
    .eq('user_id', user.id)
    .eq('interaction_type', 'bookmark');

  if (!bookmarks || bookmarks.length === 0) {
    return [];
  }

  const postIds = bookmarks.map(b => b.post_id);

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles!community_posts_author_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `)
    .in('id', postIds)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarked posts:', error);
    return [];
  }

  return (posts || []).map(post => ({
    ...post,
    author: post.is_anonymous ? null : post.author,
    user_has_helpful: false,
    user_has_bookmark: true,
  }));
}