// =============================================================================
// CHECKOUT SUCCESS PAGE
// =============================================================================
// /store/[accountId]/success?session_id=cs_xxx
//
// This page is shown after a successful checkout.
// The session_id can be used to fetch checkout session details.

interface PageProps {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { accountId } = await params;
  const { session_id } = await searchParams;
  
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Success Icon */}
        <div style={styles.iconContainer}>
          <span style={styles.icon}>✓</span>
        </div>
        
        {/* Success Message */}
        <h1 style={styles.title}>Payment Successful!</h1>
        
        <p style={styles.message}>
          Thank you for your purchase. Your order has been confirmed
          and you will receive a confirmation email shortly.
        </p>
        
        {/* Session Details (for demo purposes) */}
        {session_id && (
          <div style={styles.details}>
            <p style={styles.detailLabel}>Order Reference:</p>
            <p style={styles.detailValue}>{session_id.slice(0, 20)}...</p>
          </div>
        )}
        
        {/* Actions */}
        <div style={styles.actions}>
          <a href={`/store/${accountId}`} style={styles.primaryButton}>
            Continue Shopping
          </a>
          <a href="/" style={styles.secondaryButton}>
            Return Home
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
  content: {
    maxWidth: '480px',
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
    color: '#1a1a1a',
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
    marginBottom: '32px',
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
  secondaryButton: {
    display: 'block',
    padding: '14px 24px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
};

