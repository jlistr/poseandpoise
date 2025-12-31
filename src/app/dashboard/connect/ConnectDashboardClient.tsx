'use client';

// =============================================================================
// STRIPE CONNECT DASHBOARD CLIENT COMPONENT
// =============================================================================
// This is the main client component for managing a connected account.
// It provides UI for:
// - Creating a connected account
// - Completing onboarding
// - Viewing status
// - Managing products
// - Platform subscriptions

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface ConnectedAccount {
  id: string;
  stripe_account_id: string;
  display_name: string | null;
  contact_email: string | null;
  onboarding_complete: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

interface PlatformSubscription {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface AccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
  requirementsStatus: string;
  pendingRequirements?: string[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceId: string;
  priceInCents: number;
  currency: string;
  active: boolean;
}

interface Props {
  initialAccount: ConnectedAccount | null;
  initialSubscription: PlatformSubscription | null;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function ConnectDashboardClient({ initialAccount, initialSubscription }: Props) {
  // State
  const [account, setAccount] = useState<ConnectedAccount | null>(initialAccount);
  const [subscription] = useState<PlatformSubscription | null>(initialSubscription);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating account
  const [displayName, setDisplayName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Form state for creating product
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  
  // Fetch account status from Stripe API
  const fetchStatus = useCallback(async () => {
    if (!account?.stripe_account_id) return;
    
    try {
      const response = await fetch('/api/connect/onboarding');
      const data = await response.json();
      
      if (data.error) {
        console.error('Error fetching status:', data.error);
      } else {
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  }, [account?.stripe_account_id]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!account?.stripe_account_id) return;
    
    try {
      const response = await fetch(`/api/connect/products?accountId=${account.stripe_account_id}`);
      const data = await response.json();
      
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [account?.stripe_account_id]);
  
  // Fetch status and products on mount/account change
  useEffect(() => {
    if (account) {
      fetchStatus();
      fetchProducts();
    }
  }, [account, fetchStatus, fetchProducts]);
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  // Create connected account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/connect/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, contactEmail }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refetch to get the full account object
        window.location.reload();
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Start onboarding
  const handleStartOnboarding = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/connect/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create onboarding link');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Create product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const priceInCents = Math.round(parseFloat(productPrice) * 100);
    
    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError('Please enter a valid price');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/connect/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          priceInCents,
          currency: 'usd',
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new product to the list
        setProducts([...products, data.product]);
        // Clear form
        setProductName('');
        setProductDescription('');
        setProductPrice('');
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Subscribe to platform
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/connect/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create subscription checkout');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manage subscription (billing portal)
  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/connect/subscription', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Stripe Connect Dashboard</h1>
      
      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          <p>{error}</p>
          <button onClick={() => setError(null)} style={styles.dismissButton}>
            Dismiss
          </button>
        </div>
      )}
      
      {/* Step 1: Create Account */}
      {!account && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Get Started</h2>
          <p style={styles.sectionDescription}>
            Create a connected account to start accepting payments on the platform.
          </p>
          
          <form onSubmit={handleCreateAccount} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Business Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Store Name"
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
              />
            </div>
            
            <button type="submit" disabled={loading} style={styles.primaryButton}>
              {loading ? 'Creating...' : 'Create Connected Account'}
            </button>
          </form>
        </section>
      )}
      
      {/* Account Status */}
      {account && (
        <>
          {/* Status Card */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Account Status</h2>
            
            <div style={styles.statusGrid}>
              <div style={styles.statusCard}>
                <p style={styles.statusLabel}>Account ID</p>
                <p style={styles.statusValue}>{account.stripe_account_id}</p>
              </div>
              
              <div style={styles.statusCard}>
                <p style={styles.statusLabel}>Onboarding</p>
                <p style={{
                  ...styles.statusValue,
                  color: status?.onboardingComplete ? '#16a34a' : '#f59e0b'
                }}>
                  {status?.onboardingComplete ? '✓ Complete' : '⏳ Incomplete'}
                </p>
              </div>
              
              <div style={styles.statusCard}>
                <p style={styles.statusLabel}>Can Accept Payments</p>
                <p style={{
                  ...styles.statusValue,
                  color: status?.chargesEnabled ? '#16a34a' : '#dc2626'
                }}>
                  {status?.chargesEnabled ? '✓ Yes' : '✗ No'}
                </p>
              </div>
              
              <div style={styles.statusCard}>
                <p style={styles.statusLabel}>Requirements</p>
                <p style={styles.statusValue}>
                  {status?.requirementsStatus || 'Loading...'}
                </p>
              </div>
            </div>
            
            {/* Pending Requirements */}
            {status?.pendingRequirements && status.pendingRequirements.length > 0 && (
              <div style={styles.requirements}>
                <p style={styles.requirementsTitle}>Pending Requirements:</p>
                <ul style={styles.requirementsList}>
                  {status.pendingRequirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Onboarding Button */}
            {!status?.onboardingComplete && (
              <button 
                onClick={handleStartOnboarding} 
                disabled={loading}
                style={styles.primaryButton}
              >
                {loading ? 'Loading...' : 'Complete Onboarding'}
              </button>
            )}
            
            {/* Storefront Link */}
            {status?.chargesEnabled && (
              <div style={styles.storefrontLink}>
                <p style={styles.storefrontLabel}>Your Storefront URL:</p>
                <a 
                  href={`/store/${account.stripe_account_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  /store/{account.stripe_account_id}
                </a>
              </div>
            )}
          </section>
          
          {/* Platform Subscription */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Platform Subscription</h2>
            <p style={styles.sectionDescription}>
              Subscribe to access premium platform features.
            </p>
            
            {subscription?.status === 'active' ? (
              <div style={styles.subscriptionActive}>
                <p style={styles.subscriptionStatus}>
                  ✓ Active Subscription
                </p>
                {subscription.current_period_end && (
                  <p style={styles.subscriptionDetail}>
                    Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
                {subscription.cancel_at_period_end && (
                  <p style={styles.subscriptionWarning}>
                    ⚠️ Subscription will cancel at period end
                  </p>
                )}
                <button 
                  onClick={handleManageSubscription}
                  disabled={loading}
                  style={styles.secondaryButton}
                >
                  Manage Subscription
                </button>
              </div>
            ) : (
              <div style={styles.subscriptionInactive}>
                <p style={styles.priceDisplay}>$29.99/month</p>
                <ul style={styles.featureList}>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Custom storefront themes</li>
                  <li>✓ Lower platform fees</li>
                </ul>
                <button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  style={styles.primaryButton}
                >
                  {loading ? 'Loading...' : 'Subscribe Now'}
                </button>
              </div>
            )}
          </section>
          
          {/* Products Management */}
          {status?.chargesEnabled && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Products</h2>
              <p style={styles.sectionDescription}>
                Create and manage products for your storefront.
              </p>
              
              {/* Create Product Form */}
              <form onSubmit={handleCreateProduct} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Product Name</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Amazing Product"
                      required
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.50"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="19.99"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description (optional)</label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Describe your product..."
                    style={styles.textarea}
                  />
                </div>
                
                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
              </form>
              
              {/* Products List */}
              {products.length > 0 && (
                <div style={styles.productsList}>
                  <h3 style={styles.productsTitle}>Your Products</h3>
                  <div style={styles.productsGrid}>
                    {products.map((product) => (
                      <div key={product.id} style={styles.productCard}>
                        <h4 style={styles.productName}>{product.name}</h4>
                        {product.description && (
                          <p style={styles.productDescription}>{product.description}</p>
                        )}
                        <p style={styles.productPrice}>
                          ${(product.priceInCents / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '32px',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  sectionDescription: {
    fontSize: '0.9375rem',
    color: '#666',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  },
  textarea: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical' as const,
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#dc2626',
  },
  dismissButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#dc2626',
    fontSize: '0.875rem',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  statusCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
  },
  statusLabel: {
    fontSize: '0.75rem',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  statusValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  requirements: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  requirementsTitle: {
    fontWeight: '600',
    color: '#92400e',
    marginBottom: '8px',
  },
  requirementsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#92400e',
  },
  storefrontLink: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
  },
  storefrontLabel: {
    fontSize: '0.875rem',
    color: '#166534',
    marginBottom: '4px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
    fontFamily: 'monospace',
  },
  subscriptionActive: {
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    padding: '20px',
  },
  subscriptionStatus: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: '8px',
  },
  subscriptionDetail: {
    color: '#166534',
    marginBottom: '4px',
  },
  subscriptionWarning: {
    color: '#f59e0b',
    marginBottom: '12px',
  },
  subscriptionInactive: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
  },
  priceDisplay: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '20px',
    textAlign: 'left' as const,
  },
  productsList: {
    marginTop: '32px',
  },
  productsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  productCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
  },
  productName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  productDescription: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '8px',
  },
  productPrice: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#2563eb',
  },
};

