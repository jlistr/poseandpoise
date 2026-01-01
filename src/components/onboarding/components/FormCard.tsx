'use client';

import React from 'react';
import { colors } from '../types';

interface FormCardProps {
  children: React.ReactNode;
}

export function FormCard({ children }: FormCardProps): React.JSX.Element {
  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </div>
  );
}

