'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CommunityPostWithDetails, CommunityStats, PostType } from '@/types/community';
import CreatePostModal from './CreatePostModal';
import { toggleInteraction } from './actions';

interface CommunityPageClientProps {
  initialPosts: CommunityPostWithDetails[];
  initialTotal: number;
  initialPage: number;
  hasMore: boolean;
  stats: CommunityStats;
  activeTab: PostType;
  searchQuery: string;
  isLoggedIn: boolean;
  isPaidSubscriber: boolean;
}

export default function CommunityPageClient({
  initialPosts,
  initialTotal,
  initialPage,
  hasMore,
  stats,
  activeTab,
  searchQuery,
  isLoggedIn,
  isPaidSubscriber,
}: CommunityPageClientProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [loadingInteraction, setLoadingInteraction] = useState<string | null>(null);

  const handleHelpful = async (postId: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    setLoadingInteraction(postId);
    const result = await toggleInteraction(postId, 'helpful');
    
    if (result.success) {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            user_has_helpful: result.isActive,
            helpful_count: result.isActive ? post.helpful_count + 1 : post.helpful_count - 1,
          };
        }
        return post;
      }));
    }
    setLoadingInteraction(null);
  };

  const handleBookmark = async (postId: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    setLoadingInteraction(postId);
    const result = await toggleInteraction(postId, 'bookmark');
    
    if (result.success) {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            user_has_bookmark: result.isActive,
          };
        }
        return post;
      }));
    }
    setLoadingInteraction(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1a1a1a' }}>
              Community
            </h1>
            <p style={{ color: '#666', fontSize: '0.9375rem' }}>
              Share experiences, stay safe, and connect with fellow models.
            </p>
          </div>
          
          {isLoggedIn && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span style={{ fontSize: '1.125rem' }}>+</span>
              Share Experience
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={statCardStyles}>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a1a1a' }}>{stats.total_members.toLocaleString()}</div>
          <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.25rem' }}>Community Members</div>
        </div>
        <div style={{ ...statCardStyles, borderLeft: '3px solid #ef4444' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a1a1a' }}>{stats.safety_alerts_count}</div>
          <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.25rem' }}>Safety Alerts</div>
        </div>
        <div style={{ ...statCardStyles, borderLeft: '3px solid #22c55e' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a1a1a' }}>{stats.success_stories_count}</div>
          <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.25rem' }}>Success Stories</div>
        </div>
        <div style={{ ...statCardStyles, borderLeft: '3px solid #3b82f6' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a1a1a' }}>{stats.verified_photographers_count}</div>
          <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.25rem' }}>Verified Photographers</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0' }}>
        <a
          href="?tab=safety_alert"
          style={{
            padding: '0.75rem 1.25rem',
            textDecoration: 'none',
            borderBottom: activeTab === 'safety_alert' ? '2px solid #ef4444' : '2px solid transparent',
            color: activeTab === 'safety_alert' ? '#ef4444' : '#666',
            fontWeight: activeTab === 'safety_alert' ? 600 : 400,
            fontSize: '0.9375rem',
            transition: 'all 0.15s',
            marginBottom: '-1px',
          }}
        >
          ⚠️ Safety Alerts
        </a>
        <a
          href="?tab=success_story"
          style={{
            padding: '0.75rem 1.25rem',
            textDecoration: 'none',
            borderBottom: activeTab === 'success_story' ? '2px solid #22c55e' : '2px solid transparent',
            color: activeTab === 'success_story' ? '#22c55e' : '#666',
            fontWeight: activeTab === 'success_story' ? 600 : 400,
            fontSize: '0.9375rem',
            transition: 'all 0.15s',
            marginBottom: '-1px',
          }}
        >
          ⭐ Success Stories
        </a>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            color: '#666',
            background: '#fafafa',
            borderRadius: '12px',
            border: '1px dashed #e5e5e5',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {activeTab === 'safety_alert' ? '🛡️' : '✨'}
            </div>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              No {activeTab === 'safety_alert' ? 'safety alerts' : 'success stories'} yet
            </p>
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Be the first to share your experience with the community!
            </p>
            {isLoggedIn && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.625rem 1.25rem',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Share Your Experience
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              style={{
                padding: '1.5rem',
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: '12px',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Post header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.375rem', color: '#1a1a1a' }}>
                    {post.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: '#666' }}>
                    <span>{post.is_anonymous ? 'Anonymous' : post.author?.display_name || 'Unknown'}</span>
                    <span>·</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.location && (
                      <>
                        <span>·</span>
                        <span>📍 {post.location}</span>
                      </>
                    )}
                    {post.photographer_name && (
                      <>
                        <span>·</span>
                        <span>📸 {post.photographer_name}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {post.is_verified && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#22c55e', 
                      background: '#f0fdf4',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}>
                      ✓ Verified
                    </span>
                  )}
                  {post.rating && (
                    <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>
                      {'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '100px',
                        background: post.post_type === 'safety_alert' ? '#fef2f2' : '#f0fdf4',
                        color: post.post_type === 'safety_alert' ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <p style={{ 
                color: '#444', 
                fontSize: '0.9375rem', 
                lineHeight: 1.6, 
                marginBottom: '1rem',
                whiteSpace: 'pre-wrap',
              }}>
                {post.content.length > 300 ? `${post.content.slice(0, 300)}...` : post.content}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
                <button
                  onClick={() => handleHelpful(post.id)}
                  disabled={loadingInteraction === post.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    background: post.user_has_helpful ? '#f0fdf4' : 'transparent',
                    border: post.user_has_helpful ? '1px solid #22c55e' : '1px solid #e5e5e5',
                    borderRadius: '100px',
                    color: post.user_has_helpful ? '#16a34a' : '#666',
                    fontSize: '0.8125rem',
                    cursor: loadingInteraction === post.id ? 'wait' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  👍 {post.helpful_count} Helpful
                </button>
                
                <button
                  onClick={() => handleBookmark(post.id)}
                  disabled={loadingInteraction === post.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    background: post.user_has_bookmark ? '#eff6ff' : 'transparent',
                    border: post.user_has_bookmark ? '1px solid #3b82f6' : '1px solid #e5e5e5',
                    borderRadius: '100px',
                    color: post.user_has_bookmark ? '#3b82f6' : '#666',
                    fontSize: '0.8125rem',
                    cursor: loadingInteraction === post.id ? 'wait' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {post.user_has_bookmark ? '🔖' : '📑'} Bookmark
                </button>
                
                <span style={{ fontSize: '0.8125rem', color: '#999' }}>
                  💬 {post.comment_count} comments
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination info */}
      {initialTotal > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
          Showing {posts.length} of {initialTotal} posts
          {hasMore && ' • More posts available'}
        </div>
      )}

      {/* Login prompt */}
      {!isLoggedIn && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          borderRadius: '12px', 
          textAlign: 'center',
        }}>
          <p style={{ color: '#92400e', fontWeight: 500, marginBottom: '0.75rem' }}>
            Join the community to share and interact
          </p>
          <a 
            href="/login" 
            style={{ 
              display: 'inline-block',
              padding: '0.625rem 1.25rem',
              background: '#92400e',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Log In to Get Started
          </a>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultPostType={activeTab}
        isPaidSubscriber={isPaidSubscriber}
      />
    </div>
  );
}

const statCardStyles: React.CSSProperties = {
  padding: '1.25rem',
  background: '#fafafa',
  borderRadius: '10px',
  borderLeft: '3px solid #1a1a1a',
};
