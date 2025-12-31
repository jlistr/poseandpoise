'use client';

import type React from 'react';

interface BuyButtonProps {
  accountId: string;
  priceId: string;
  priceInCents: number;
}

export function BuyButton({ accountId, priceId, priceInCents }: BuyButtonProps) {
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
  
  const buttonStyle: React.CSSProperties = {
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
  };
  
  return (
    <button 
      type="button"
      onClick={handleClick}
      style={buttonStyle}
    >
      Buy Now
    </button>
  );
}

