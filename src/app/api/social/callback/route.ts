import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth Callback Handler for Late API Social Account Connection
 * 
 * Late redirects here after the user completes OAuth authentication.
 * Query parameters may include:
 * - success: boolean indicating if connection was successful
 * - social_account_id: the ID of the newly connected account
 * - error: error message if connection failed
 * - platform: the platform that was connected (instagram/tiktok)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Extract callback parameters from Late
  const success = searchParams.get('success');
  const socialAccountId = searchParams.get('social_account_id') || searchParams.get('accountId');
  const error = searchParams.get('error');
  const platform = searchParams.get('platform');
  
  // Build redirect URL to profile page with status
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poseandpoise.studio';
  const redirectUrl = new URL('/dashboard/profile', baseUrl);
  
  if (success === 'true' || socialAccountId) {
    // Success case
    redirectUrl.searchParams.set('social_connected', 'true');
    if (platform) {
      redirectUrl.searchParams.set('platform', platform);
    }
    if (socialAccountId) {
      redirectUrl.searchParams.set('account_id', socialAccountId);
    }
  } else if (error) {
    // Error case
    redirectUrl.searchParams.set('social_error', error);
    if (platform) {
      redirectUrl.searchParams.set('platform', platform);
    }
  } else {
    // Unknown state - just redirect back
    redirectUrl.searchParams.set('social_callback', 'true');
  }
  
  return NextResponse.redirect(redirectUrl);
}

