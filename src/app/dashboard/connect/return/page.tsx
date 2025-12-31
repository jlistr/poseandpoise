// =============================================================================
// ONBOARDING RETURN PAGE
// =============================================================================
// /dashboard/connect/return?accountId=acct_xxx
//
// This page is shown after a user completes or exits the onboarding flow.
// It fetches the current account status and redirects to the dashboard.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAccountStatus } from '@/lib/stripe/connect';

interface PageProps {
  searchParams: Promise<{ accountId?: string }>;
}

export default async function OnboardingReturnPage({ searchParams }: PageProps) {
  const { accountId } = await searchParams;
  
  // Validate account ID
  if (!accountId || !accountId.startsWith('acct_')) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Invalid Return URL</h1>
          <p style={styles.message}>
            The onboarding return URL is invalid. Please try again.
          </p>
          <a href="/dashboard/connect" style={styles.link}>
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  // Verify the user owns this account
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('stripe_account_id')
    .eq('profile_id', user.id)
    .eq('stripe_account_id', accountId)
    .single();
  
  if (!account) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Account Not Found</h1>
          <p style={styles.message}>
            We couldn&apos;t find this account. Please try again.
          </p>
          <a href="/dashboard/connect" style={styles.link}>
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  // Fetch the current status from Stripe
  let status;
  try {
    status = await getAccountStatus(accountId);
  } catch (error) {
    console.error('[Onboarding Return] Error fetching status:', error);
    redirect('/dashboard/connect');
  }
  
  // Update the database with the latest status
  await supabase
    .from('connected_accounts')
    .update({
      onboarding_complete: status.onboardingComplete,
      charges_enabled: status.chargesEnabled,
      payouts_enabled: status.payoutsEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', accountId);
  
  // Show success or continue message based on status
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status.onboardingComplete && status.chargesEnabled ? (
          <>
            {/* Success State */}
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.successTitle}>Onboarding Complete!</h1>
            <p style={styles.message}>
              Your account is now ready to accept payments.
              You can start creating products and sharing your storefront.
            </p>
            <div style={styles.statusInfo}>
              <p>✓ Account verified</p>
              <p>✓ Card payments enabled</p>
              <p>✓ Payouts enabled</p>
            </div>
          </>
        ) : (
          <>
            {/* Incomplete State */}
            <div style={styles.warningIcon}>⏳</div>
            <h1 style={styles.title}>Almost There!</h1>
            <p style={styles.message}>
              Your account setup is in progress. Some information may still
              need to be verified, or there are additional requirements to complete.
            </p>
            <div style={styles.statusInfo}>
              <p style={status.onboardingComplete ? styles.done : styles.pending}>
                {status.onboardingComplete ? '✓' : '○'} Requirements submitted
              </p>
              <p style={status.chargesEnabled ? styles.done : styles.pending}>
                {status.chargesEnabled ? '✓' : '○'} Card payments enabled
              </p>
            </div>
            {status.requirementsStatus !== 'complete' && (
              <p style={styles.note}>
                Current status: <strong>{status.requirementsStatus}</strong>
              </p>
            )}
          </>
        )}
        
        <a href="/dashboard/connect" style={styles.button}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '48px 32px',
    textAlign: 'center' as const,
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: '40px',
    color: '#16a34a',
  },
  warningIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: '40px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px',
  },
  successTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: '12px',
  },
  message: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  statusInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left' as const,
  },
  done: {
    color: '#16a34a',
    marginBottom: '8px',
  },
  pending: {
    color: '#666',
    marginBottom: '8px',
  },
  note: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '24px',
  },
  button: {
    display: 'inline-block',
    padding: '14px 32px',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    textDecoration: 'none',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
};

