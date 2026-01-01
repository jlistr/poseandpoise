'use client';

import React from 'react';
import { colors } from '../types';

// Check Icon
const CheckIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface ProgressIndicatorProps {
  collectedCount: number;
}

export function ProgressIndicator({ collectedCount }: ProgressIndicatorProps): React.JSX.Element | null {
  if (collectedCount === 0) return null;

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: '0.75rem',
        backgroundColor: colors.white,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: colors.camel,
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon size={14} />
        </div>
        <span style={{ fontSize: '14px', color: colors.textPrimary }}>
          <strong>{collectedCount}</strong> field{collectedCount !== 1 ? 's' : ''} collected
        </span>
      </div>
      <span
        style={{
          fontSize: '12px',
          color: colors.success,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <CheckIcon size={12} />
        Auto-saved
      </span>
    </div>
  );
}

