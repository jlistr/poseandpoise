import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Valid event types
const VALID_EVENT_TYPES = ['view', 'click', 'expand'] as const;
type EventType = typeof VALID_EVENT_TYPES[number];

interface PhotoEventRequest {
  photoId: string;
  eventType: EventType;
}

/**
 * POST /api/analytics/photo-event
 * 
 * Track view, click, or expand events on portfolio photos.
 * Provides analytics data for models to understand which images
 * attract the most attention from potential clients.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PhotoEventRequest;
    const { photoId, eventType } = body;

    // Validate request
    if (!photoId) {
      return NextResponse.json(
        { error: 'photoId is required' },
        { status: 400 }
      );
    }

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get photo to find profile_id (owner)
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('profile_id')
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Don't track owner viewing their own photos
    if (user?.id === photo.profile_id) {
      return NextResponse.json({ 
        success: true, 
        tracked: false,
        reason: 'Owner views not tracked'
      });
    }

    // Hash IP for anonymous tracking (privacy-friendly)
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    
    // Use a salt to make the hash more secure
    const salt = process.env.ANALYTICS_SALT || 'poseandpoise-analytics';
    const ipHash = crypto
      .createHash('sha256')
      .update(ip + salt)
      .digest('hex')
      .slice(0, 16);

    // Insert analytics event
    const { error: insertError } = await supabase
      .from('photo_analytics')
      .insert({
        photo_id: photoId,
        profile_id: photo.profile_id,
        event_type: eventType,
        viewer_id: user?.id || null,
        viewer_ip_hash: ipHash,
        user_agent: headersList.get('user-agent')?.slice(0, 500) || null,
        referrer: headersList.get('referer')?.slice(0, 500) || null,
      });

    if (insertError) {
      console.error('Error inserting photo analytics:', insertError);
      // Don't fail the request - analytics should be non-blocking
      return NextResponse.json({ 
        success: true, 
        tracked: false,
        reason: 'Database error'
      });
    }

    return NextResponse.json({ 
      success: true, 
      tracked: true 
    });

  } catch (error) {
    console.error('Photo analytics error:', error);
    // Analytics errors should not break the user experience
    return NextResponse.json({ 
      success: true, 
      tracked: false,
      reason: 'Server error'
    });
  }
}

/**
 * GET /api/analytics/photo-event?photoId=xxx
 * 
 * Get analytics stats for a specific photo.
 * Only the photo owner can view these stats.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: 'photoId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get photo to verify ownership
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('profile_id, view_count, click_count')
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Only owner can view stats
    if (photo.profile_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view these stats' },
        { status: 403 }
      );
    }

    // Get detailed stats from materialized view
    const { data: stats } = await supabase
      .from('photo_stats')
      .select('*')
      .eq('photo_id', photoId)
      .single();

    // Get recent events (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentEvents } = await supabase
      .from('photo_analytics')
      .select('event_type, created_at')
      .eq('photo_id', photoId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate daily breakdown
    const dailyStats: Record<string, { views: number; clicks: number }> = {};
    
    if (recentEvents) {
      for (const event of recentEvents) {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { views: 0, clicks: 0 };
        }
        if (event.event_type === 'view') {
          dailyStats[date].views++;
        } else if (event.event_type === 'click') {
          dailyStats[date].clicks++;
        }
      }
    }

    return NextResponse.json({
      photoId,
      totalViews: photo.view_count || stats?.view_count || 0,
      totalClicks: photo.click_count || stats?.click_count || 0,
      uniqueViewers: stats?.unique_viewers || 0,
      lastViewedAt: stats?.last_viewed_at || null,
      dailyStats,
    });

  } catch (error) {
    console.error('Error fetching photo analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

