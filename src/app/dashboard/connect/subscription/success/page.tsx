// =============================================================================
// PLATFORM SUBSCRIPTION SUCCESS PAGE
// =============================================================================
// /dashboard/connect/subscription/success?session_id=cs_xxx
//
// This page is shown after a connected account successfully subscribes
// to the platform subscription.

import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SubscriptionSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  
  // After a short delay, the webhook will have processed the subscription
  // For now, just show a success message
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Success Icon */}
        <div style={styles.iconContainer}>
          <span style={styles.icon}>✓</span>
        </div>
        
        {/* Success Message */}
        <h1 style={styles.title}>Subscription Active!</h1>
        
        <p style={styles.message}>
          Thank you for subscribing to our platform. You now have access
          to all premium features including priority support, advanced
          analytics, and reduced platform fees.
        </p>
        
        {/* Session Details */}
        {session_id && (
          <div style={styles.details}>
            <p style={styles.detailLabel}>Subscription Reference:</p>
            <p style={styles.detailValue}>{session_id.slice(0, 20)}...</p>
          </div>
        )}
        
        {/* Features */}
        <div style={styles.features}>
          <h3 style={styles.featuresTitle}>What&apos;s Included:</h3>
          <ul style={styles.featuresList}>
            <li>✓ Priority support</li>
            <li>✓ Advanced analytics dashboard</li>
            <li>✓ Custom storefront themes</li>
            <li>✓ Lower platform fees (5% instead of 10%)</li>
            <li>✓ Featured placement in marketplace</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div style={styles.actions}>
          <a href="/dashboard/connect" style={styles.primaryButton}>
            Go to Dashboard
          </a>
        </div>
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
    maxWidth: '520px',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '48px 32px',
    textAlign: 'center' as const,
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  icon: {
    fontSize: '40px',
    color: '#16a34a',
  },
  title: {
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
  details: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '0.9375rem',
    fontFamily: 'monospace',
    color: '#1a1a1a',
  },
  features: {
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
    textAlign: 'left' as const,
  },
  featuresTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '12px',
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#166534',
    lineHeight: '1.8',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  primaryButton: {
    display: 'block',
    padding: '14px 24px',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
};

