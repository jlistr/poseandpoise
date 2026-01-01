'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { colors, typography, spacing } from '@/styles/tokens';

interface PhotoWithAnalytics {
  id: string;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
  is_visible: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
}

interface MediaLibraryProps {
  photos: PhotoWithAnalytics[];
  totalViews: number;
  totalClicks: number;
  username: string | null;
}

type SortOption = 'views' | 'clicks' | 'recent' | 'order';

export function MediaLibrary({ photos, totalViews, totalClicks, username }: MediaLibraryProps) {
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithAnalytics | null>(null);

  // Sort photos based on selected option
  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.view_count - a.view_count;
      case 'clicks':
        return b.click_count - a.click_count;
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'order':
      default:
        return a.sort_order - b.sort_order;
    }
  });

  // Calculate engagement rate
  const engagementRate = totalViews > 0 
    ? ((totalClicks / totalViews) * 100).toFixed(1) 
    : '0';

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.padding.lg,
        flexWrap: 'wrap',
        gap: spacing.gap.md,
      }}>
        <div>
          <h1 style={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.sectionH2,
            fontWeight: typography.fontWeight.light,
            marginBottom: spacing.padding.xs,
            color: colors.text.primary,
          }}>
            Media Library
          </h1>
          <p style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
            color: colors.text.tertiary,
          }}>
            Track how your photos perform on your public portfolio
          </p>
        </div>
        
        {username && (
          <Link
            href={`/preview/${username}?edit=true`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              background: colors.charcoal,
              color: colors.cream,
              textDecoration: 'none',
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.button,
              fontWeight: typography.fontWeight.regular,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
          >
            <EditIcon />
            Manage Photos
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.gap.md,
        marginBottom: spacing.padding.xl,
      }}>
        <StatCard 
          label="Total Photos" 
          value={photos.length.toString()} 
          sublabel={`${photos.filter(p => p.is_visible).length} visible`}
        />
        <StatCard 
          label="Total Views" 
          value={formatNumber(totalViews)} 
          sublabel="All-time"
          highlight
        />
        <StatCard 
          label="Total Clicks" 
          value={formatNumber(totalClicks)} 
          sublabel="Photo interactions"
        />
        <StatCard 
          label="Engagement Rate" 
          value={`${engagementRate}%`} 
          sublabel="Clicks / Views"
        />
      </div>

      {/* Sort Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.gap.sm,
        marginBottom: spacing.padding.lg,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.caption,
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Sort by:
        </span>
        {(['views', 'clicks', 'recent', 'order'] as SortOption[]).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            style={{
              padding: '8px 16px',
              background: sortBy === option ? colors.charcoal : 'transparent',
              color: sortBy === option ? colors.cream : colors.text.secondary,
              border: `1px solid ${sortBy === option ? colors.charcoal : colors.border.light}`,
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              fontWeight: typography.fontWeight.regular,
              letterSpacing: '0.5px',
              textTransform: 'capitalize',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {option === 'order' ? 'Portfolio Order' : option}
          </button>
        ))}
      </div>

      {/* Photo Grid with Analytics */}
      {photos.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: spacing.gap.md,
        }}>
          {sortedPhotos.map((photo, index) => (
            <PhotoCard 
              key={photo.id} 
              photo={photo} 
              rank={sortBy === 'views' || sortBy === 'clicks' ? index + 1 : undefined}
              onClick={() => setSelectedPhoto(photo)}
            />
          ))}
        </div>
      ) : (
        <EmptyState username={username} />
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <PhotoDetailModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  sublabel, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  sublabel: string;
  highlight?: boolean;
}) {
  return (
    <div style={{
      padding: spacing.padding.lg,
      background: highlight ? 'rgba(196, 164, 132, 0.08)' : colors.white,
      border: `1px solid ${highlight ? colors.accent.light : colors.border.subtle}`,
    }}>
      <p style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.caption,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: spacing.padding.xs,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: typography.fontFamily.display,
        fontSize: '36px',
        fontWeight: typography.fontWeight.light,
        color: highlight ? colors.camel : colors.text.primary,
        marginBottom: '4px',
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.caption,
        color: colors.text.muted,
      }}>
        {sublabel}
      </p>
    </div>
  );
}

// Photo Card Component
function PhotoCard({ 
  photo, 
  rank,
  onClick 
}: { 
  photo: PhotoWithAnalytics; 
  rank?: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: colors.white,
        border: `1px solid ${colors.border.subtle}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? '0 12px 40px rgba(0, 0, 0, 0.08)' : 'none',
      }}
    >
      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: rank === 1 ? '#D4AF37' : rank === 2 ? '#C0C0C0' : '#CD7F32',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: typography.fontFamily.body,
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {rank}
        </div>
      )}

      {/* Visibility Badge */}
      {!photo.is_visible && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          padding: '4px 8px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          fontFamily: typography.fontFamily.body,
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          Hidden
        </div>
      )}

      {/* Photo */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '100%',
        background: colors.background.primary,
      }}>
        <Image
          src={photo.thumbnail_url || photo.url}
          alt={photo.caption || 'Portfolio photo'}
          fill
          style={{
            objectFit: 'cover',
            opacity: photo.is_visible ? 1 : 0.5,
          }}
          sizes="(max-width: 768px) 100vw, 280px"
        />
      </div>

      {/* Stats */}
      <div style={{
        padding: spacing.padding.md,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: spacing.gap.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <EyeIcon />
            <span style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.secondary,
            }}>
              {formatNumber(photo.view_count)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClickIcon />
            <span style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.secondary,
            }}>
              {formatNumber(photo.click_count)}
            </span>
          </div>
        </div>
        
        {photo.view_count > 0 && (
          <span style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.caption,
            color: colors.camel,
            fontWeight: 500,
          }}>
            {((photo.click_count / photo.view_count) * 100).toFixed(0)}% CTR
          </span>
        )}
      </div>
    </div>
  );
}

// Photo Detail Modal
function PhotoDetailModal({ 
  photo, 
  onClose 
}: { 
  photo: PhotoWithAnalytics; 
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.padding.lg,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.white,
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
        }}
      >
        {/* Image */}
        <div style={{
          position: 'relative',
          minHeight: '400px',
          background: '#000',
        }}>
          <Image
            src={photo.url}
            alt={photo.caption || 'Portfolio photo'}
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Details */}
        <div style={{ padding: spacing.padding.lg }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: colors.text.secondary,
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <CloseIcon />
          </button>

          <h3 style={{
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSize.cardH3,
            fontWeight: typography.fontWeight.regular,
            marginBottom: spacing.padding.lg,
          }}>
            Photo Analytics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap.md }}>
            <DetailRow label="Views" value={formatNumber(photo.view_count)} />
            <DetailRow label="Clicks" value={formatNumber(photo.click_count)} />
            <DetailRow 
              label="Click Rate" 
              value={photo.view_count > 0 
                ? `${((photo.click_count / photo.view_count) * 100).toFixed(1)}%` 
                : 'N/A'
              } 
            />
            <DetailRow 
              label="Status" 
              value={photo.is_visible ? 'Visible' : 'Hidden'} 
            />
            <DetailRow 
              label="Added" 
              value={new Date(photo.created_at).toLocaleDateString()} 
            />
            {photo.caption && (
              <DetailRow label="Caption" value={photo.caption} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: spacing.padding.sm,
      borderBottom: `1px solid ${colors.border.subtle}`,
    }}>
      <span style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.bodySmall,
        color: colors.text.muted,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.bodySmall,
        color: colors.text.primary,
        fontWeight: 500,
      }}>
        {value}
      </span>
    </div>
  );
}

// Empty State
function EmptyState({ username }: { username: string | null }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: `${spacing.padding["3xl"]} ${spacing.padding.xl}`,
      background: colors.white,
      border: `1px solid ${colors.border.subtle}`,
    }}>
      <div style={{ color: colors.camel, marginBottom: spacing.padding.md }}>
        <CameraIcon />
      </div>
      <h3 style={{
        fontFamily: typography.fontFamily.display,
        fontSize: typography.fontSize.cardH3,
        fontWeight: typography.fontWeight.regular,
        marginBottom: spacing.padding.sm,
      }}>
        No photos yet
      </h3>
      <p style={{
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.body,
        color: colors.text.tertiary,
        marginBottom: spacing.padding.lg,
        maxWidth: '400px',
        margin: '0 auto',
      }}>
        Upload photos to your portfolio to start tracking engagement and see which images resonate with your audience.
      </p>
      {username && (
        <Link
          href={`/preview/${username}?edit=true`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 32px',
            background: colors.charcoal,
            color: colors.cream,
            textDecoration: 'none',
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.button,
            fontWeight: typography.fontWeight.regular,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Add Photos
        </Link>
      )}
    </div>
  );
}

// Utility function
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Icons
function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ClickIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

