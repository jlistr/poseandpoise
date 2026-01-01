import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LATE_API_KEY = process.env.LATE_API_KEY;
const LATE_API_BASE = 'https://getlate.dev/api/v1';

interface DisconnectRequest {
  accountId: string;
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
    const body: DisconnectRequest = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' }, 
        { status: 400 }
      );
    }

    // Delete the social account from Late API
    const response = await fetch(`${LATE_API_BASE}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${LATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Late API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to disconnect account' }, 
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

