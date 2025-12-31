'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/invite
 * 
 * Invites a waitlist user to create an account.
 * This endpoint should be protected by admin authentication in production.
 * 
 * Body: { email: string }
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if email is in waitlist
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (waitlistError || !waitlistEntry) {
      return NextResponse.json(
        { error: 'Email not found in waitlist' },
        { status: 404 }
      );
    }

    // Check if user already has an account
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User already has an account', status: 'already_registered' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Use Supabase Admin API to send an invitation email
    // 2. Or use a service like Resend/SendGrid to send a custom invite
    
    // For now, return instructions
    return NextResponse.json({
      success: true,
      message: `User ${email} is eligible for invitation.`,
      instructions: `
        To complete the invitation:
        1. Ask the user to visit /signup and register with email: ${email}
        2. Or configure SMTP in Supabase and use supabase.auth.admin.inviteUserByEmail()
      `,
      waitlistEntry: {
        email: waitlistEntry.email,
        createdAt: waitlistEntry.created_at,
      }
    });

  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/invite
 * 
 * Lists all waitlist entries that haven't been converted to users yet.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get all waitlist entries
    const { data: waitlist, error: waitlistError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (waitlistError) {
      return NextResponse.json(
        { error: 'Failed to fetch waitlist' },
        { status: 500 }
      );
    }

    // Get all profile emails to filter out converted users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email');

    const existingEmails = new Set(profiles?.map(p => p.email?.toLowerCase()) || []);

    // Filter to only pending (not yet registered) users
    const pendingWaitlist = waitlist?.filter(
      entry => !existingEmails.has(entry.email.toLowerCase())
    ) || [];

    return NextResponse.json({
      total: waitlist?.length || 0,
      pending: pendingWaitlist.length,
      converted: (waitlist?.length || 0) - pendingWaitlist.length,
      entries: pendingWaitlist,
    });

  } catch (error) {
    console.error('Fetch waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

