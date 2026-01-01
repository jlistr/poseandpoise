import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LATE_API_KEY = process.env.LATE_API_KEY;
const LATE_PROFILE_ID = process.env.LATE_PROFILE_ID;
const LATE_API_BASE = 'https://getlate.dev/api/v1';

interface ConnectRequest {
  platform: 'instagram' | 'tiktok';
}

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!LATE_API_KEY) {
    return NextResponse.json({ error: 'Late API key not configured' }, { status: 500 });
  }

  if (!LATE_PROFILE_ID) {
    return NextResponse.json({ error: 'Late Profile ID not configured' }, { status: 500 });
  }

  try {
    const body: ConnectRequest = await request.json();
    const { platform } = body;

    if (!platform || !['instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be "instagram" or "tiktok"' }, 
        { status: 400 }
      );
    }

    // Build callback URL for redirect after OAuth
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poseandpoise.studio';
    const callbackUrl = `${baseUrl}/api/social/callback?platform=${platform}`;

    // Generate OAuth connection URL from Late API
    // Endpoint: GET /v1/connect/{platform}?profileId={profileId}&redirect_url={callbackUrl}
    const url = new URL(`${LATE_API_BASE}/connect/${platform}`);
    url.searchParams.set('profileId', LATE_PROFILE_ID);
    url.searchParams.set('redirect_url', callbackUrl);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Late API error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate connection URL' }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    // Late API returns "authUrl", we'll normalize to "connect_url" for our frontend
    return NextResponse.json({ 
      connect_url: data.authUrl,
      platform,
    });
  } catch (error) {
    console.error('Error generating connect URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
