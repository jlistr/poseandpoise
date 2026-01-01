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

  try {
    const body: ConnectRequest = await request.json();
    const { platform } = body;

    if (!platform || !['instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be "instagram" or "tiktok"' }, 
        { status: 400 }
      );
    }

    // Generate OAuth connection URL from Late API
    const response = await fetch(`${LATE_API_BASE}/social-accounts/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        profile_id: LATE_PROFILE_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Late API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate connection URL' }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ 
      connect_url: data.connect_url,
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

