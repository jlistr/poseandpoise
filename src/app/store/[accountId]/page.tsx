// =============================================================================
// STOREFRONT PAGE FOR CONNECTED ACCOUNTS
// =============================================================================
// /store/[accountId]
//
// This page displays products from a connected account and allows customers
// to make purchases. Each connected account has their own storefront.
//
// NOTE: In production, you should use a more user-friendly identifier
// (like a username or slug) instead of the raw Stripe account ID.
// The account ID is used here for simplicity in this demo.
//
// TODO: Replace accountId with a username/slug lookup:
// 1. Add a 'slug' column to connected_accounts table
// 2. Look up the account by slug instead of stripe_account_id
// 3. URL becomes /store/[slug] instead of /store/[accountId]

import { listProductsOnConnectedAccount } from '@/lib/stripe/connect';

// =============================================================================
// PAGE COMPONENT
// =============================================================================

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default async function StorefrontPage({ params }: PageProps) {
  const { accountId } = await params;
  
  // Validate account ID format
  if (!accountId || !accountId.startsWith('acct_')) {
    return <InvalidAccountPage />;
  }
  
  // Fetch products from the connected account
  let products: Awaited<ReturnType<typeof listProductsOnConnectedAccount>> = [];
  let error: string | null = null;
  
  try {
    products = await listProductsOnConnectedAccount(accountId, 20);
  } catch (e) {
    console.error('[Storefront] Error fetching products:', e);
    error = 'Unable to load products. Please try again later.';
  }
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Store</h1>
        <p style={styles.subtitle}>
          Browse and purchase products
        </p>
        {/* 
          TODO: In production, display the connected account's business name
          instead of the account ID. This requires fetching account details
          from Stripe or storing the business name in your database.
        */}
        <p style={styles.accountId}>
          Store ID: {accountId.slice(0, 12)}...
        </p>
      </header>
      
      {/* Error State */}
      {error && (
        <div style={styles.error}>
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty State */}
      {!error && products.length === 0 && (
        <div style={styles.empty}>
          <h2 style={styles.emptyTitle}>No Products Yet</h2>
          <p style={styles.emptyText}>
            This store doesn&apos;t have any products available yet.
            Check back soon!
          </p>
        </div>
      )}
      
      {/* Products Grid */}
      {products.length > 0 && (
        <div style={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              accountId={accountId}
            />
          ))}
        </div>
      )}
      
      {/* Footer */}
      <footer style={styles.footer}>
        <p>Powered by Stripe Connect</p>
      </footer>
    </div>
  );
}

// =============================================================================
// PRODUCT CARD COMPONENT
// =============================================================================

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    priceId: string;
    priceInCents: number;
    currency: string;
    active: boolean;
  };
  accountId: string;
}

function ProductCard({ product, accountId }: ProductCardProps) {
  // Format price for display
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency.toUpperCase(),
  }).format(product.priceInCents / 100);
  
  return (
    <div style={styles.card}>
      {/* Product Image Placeholder */}
      <div style={styles.imagePlaceholder}>
        <span style={styles.imageIcon}>📦</span>
      </div>
      
      {/* Product Info */}
      <div style={styles.cardContent}>
        <h3 style={styles.productName}>{product.name}</h3>
        
        {product.description && (
          <p style={styles.productDescription}>
            {product.description}
          </p>
        )}
        
        <p style={styles.productPrice}>{price}</p>
        
        {/* Buy Button - Client Component */}
        <form action={`/api/connect/checkout`} method="POST">
          <input type="hidden" name="accountId" value={accountId} />
          <input type="hidden" name="priceId" value={product.priceId} />
          <input type="hidden" name="priceInCents" value={product.priceInCents} />
          <BuyButton accountId={accountId} priceId={product.priceId} priceInCents={product.priceInCents} />
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// BUY BUTTON (Client-side)
// =============================================================================

'use client';

function BuyButton({ 
  accountId, 
  priceId, 
  priceInCents 
}: { 
  accountId: string; 
  priceId: string; 
  priceInCents: number;
}) {
  const handleClick = async () => {
    try {
      const response = await fetch('/api/connect/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          priceId,
          priceInCents,
          quantity: 1,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
      }
    } catch {
      alert('An error occurred. Please try again.');
    }
  };
  
  return (
    <button 
      type="button"
      onClick={handleClick}
      style={styles.buyButton}
    >
      Buy Now
    </button>
  );
}

// =============================================================================
// INVALID ACCOUNT PAGE
// =============================================================================

function InvalidAccountPage() {
  return (
    <div style={styles.container}>
      <div style={styles.error}>
        <h1 style={styles.errorTitle}>Invalid Store</h1>
        <p style={styles.errorText}>
          The store you&apos;re looking for doesn&apos;t exist or the URL is invalid.
        </p>
        <a href="/" style={styles.link}>
          Return Home
        </a>
      </div>
    </div>
  );
}

// =============================================================================
// STYLES
// =============================================================================
// Using inline styles for simplicity. In production, use CSS modules or Tailwind.

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#666',
    marginBottom: '4px',
  },
  accountId: {
    fontSize: '0.875rem',
    color: '#999',
    fontFamily: 'monospace',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIcon: {
    fontSize: '4rem',
  },
  cardContent: {
    padding: '20px',
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  productDescription: {
    fontSize: '0.9375rem',
    color: '#666',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  productPrice: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: '16px',
  },
  buyButton: {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#666',
  },
  error: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    marginBottom: '24px',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '8px',
  },
  errorText: {
    fontSize: '1rem',
    color: '#991b1b',
    marginBottom: '16px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '60px',
    padding: '20px',
    color: '#999',
    fontSize: '0.875rem',
  },
};

