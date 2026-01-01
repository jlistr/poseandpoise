import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LATE_API_KEY = process.env.LATE_API_KEY;
const LATE_PROFILE_ID = process.env.LATE_PROFILE_ID;
const LATE_API_BASE = 'https://getlate.dev/api/v1';

export async function GET() {
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
    // Fetch connected accounts from Late API
    const url = LATE_PROFILE_ID 
      ? `${LATE_API_BASE}/accounts?profileId=${LATE_PROFILE_ID}`
      : `${LATE_API_BASE}/accounts`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${LATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Late API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch social accounts' }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the response to a simpler format
    const accounts = (data.accounts || []).map((account: {
      _id: string;
      platform: string;
      username: string;
      displayName: string;
      profileUrl: string;
      profilePicture: string;
      isActive: boolean;
      tokenExpiresAt: string;
    }) => ({
      id: account._id,
      platform: account.platform,
      username: account.username,
      displayName: account.displayName,
      profileUrl: account.profileUrl,
      profilePicture: account.profilePicture,
      isActive: account.isActive,
      tokenExpiresAt: account.tokenExpiresAt,
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

