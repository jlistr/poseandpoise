// ============================================================================
// POSE & POISE - COMMUNITY FEATURE TYPES
// Location: src/types/community.ts
// ============================================================================

// -----------------------------------------------------------------------------
// Database Row Types (match Supabase schema exactly)
// -----------------------------------------------------------------------------

export type PostType = 'safety_alert' | 'success_story';
export type InteractionType = 'helpful' | 'bookmark';

export interface CommunityPost {
  id: string;
  author_id: string;
  post_type: PostType;
  title: string;
  content: string;
  location: string | null;
  photographer_name: string | null;
  rating: number | null;
  tags: string[];
  image_urls: string[];
  is_anonymous: boolean;
  is_verified: boolean;
  is_published: boolean;
  helpful_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostInteraction {
  id: string;
  post_id: string;
  user_id: string;
  interaction_type: InteractionType;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Extended Types (with joined data)
// -----------------------------------------------------------------------------

export interface CommunityPostWithAuthor extends CommunityPost {
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface PostCommentWithAuthor extends PostComment {
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface CommunityPostWithDetails extends CommunityPostWithAuthor {
  user_has_helpful: boolean;
  user_has_bookmark: boolean;
}

// -----------------------------------------------------------------------------
// Form Types (for creating/editing)
// -----------------------------------------------------------------------------

export interface CreatePostInput {
  post_type: PostType;
  title: string;
  content: string;
  location?: string;
  photographer_name?: string;
  rating?: number;
  tags?: string[];
  image_urls?: string[];
  is_anonymous?: boolean;
}

export interface CreateCommentInput {
  post_id: string;
  content: string;
  is_anonymous?: boolean;
}

// -----------------------------------------------------------------------------
// Query Types (for fetching)
// -----------------------------------------------------------------------------

export interface PostsQueryParams {
  post_type?: PostType;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'helpful_count';
  sort_order?: 'asc' | 'desc';
}

export interface PostsQueryResult {
  posts: CommunityPostWithDetails[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// -----------------------------------------------------------------------------
// Community Stats
// -----------------------------------------------------------------------------

export interface CommunityStats {
  total_members: number;
  safety_alerts_count: number;
  success_stories_count: number;
  verified_photographers_count: number;
}

// -----------------------------------------------------------------------------
// Tag Options (predefined)
// -----------------------------------------------------------------------------

export const SAFETY_ALERT_TAGS = [
  'Inappropriate Behavior',
  'Pressure Tactics',
  'Non-Payment',
  'Location Issues',
  'Safety Concern',
  'Contract Issue',
  'Red Flag',
  'Editorial',
  'Fashion',
  'Commercial',
  'TFP Issues',
  'Communication Problems',
] as const;

export const SUCCESS_STORY_TAGS = [
  'Professional',
  'Creative',
  'TFP',
  'Portfolio',
  'Campaign',
  'Beauty',
  'Fashion',
  'Editorial',
  'Agency',
  'First Experience',
  'Great Communication',
  'On-Time Payment',
] as const;

export type SafetyAlertTag = typeof SAFETY_ALERT_TAGS[number];
export type SuccessStoryTag = typeof SUCCESS_STORY_TAGS[number];