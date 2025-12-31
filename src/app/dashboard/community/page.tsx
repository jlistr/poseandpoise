// ============================================================================
// POSE & POISE - COMMUNITY PAGE
// Location: src/app/(dashboard)/community/page.tsx
// ============================================================================

import { Suspense } from 'react';
import { fetchPosts, fetchCommunityStats, checkSubscriptionStatus } from './actions';
import CommunityPageClient from './CommunityPageClient';
import type { PostType } from '@/types/community';

interface CommunityPageProps {
  searchParams: Promise<{
    tab?: PostType;
    search?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'Community | Pose & Poise',
  description: 'Share experiences, stay safe, and connect with fellow models.',
};

async function CommunityContent({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  const activeTab = params.tab === 'success_story' ? 'success_story' : 'safety_alert';
  const search = params.search || '';
  const page = parseInt(params.page || '1', 10);

  // Fetch data in parallel
  const [postsResult, stats, subscriptionStatus] = await Promise.all([
    fetchPosts({
      post_type: activeTab,
      search: search || undefined,
      page,
      limit: 10,
    }),
    fetchCommunityStats(),
    checkSubscriptionStatus(),
  ]);

  return (
    <CommunityPageClient
      initialPosts={postsResult.posts}
      initialTotal={postsResult.total}
      initialPage={page}
      hasMore={postsResult.has_more}
      stats={stats}
      activeTab={activeTab}
      searchQuery={search}
      isLoggedIn={subscriptionStatus.isLoggedIn}
      isPaidSubscriber={subscriptionStatus.isPaidSubscriber}
    />
  );
}

function CommunityLoading() {
  return (
    <div className="community-page">
      <div className="community-loading">
        <div className="loading-spinner" />
        <p>Loading community...</p>
      </div>
    </div>
  );
}

export default function CommunityPage(props: CommunityPageProps) {
  return (
    <Suspense fallback={<CommunityLoading />}>
      <CommunityContent {...props} />
    </Suspense>
  );
}