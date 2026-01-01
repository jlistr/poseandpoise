'use client';

import React, { useEffect, useState } from 'react';
import { colors } from '../types';

interface FormCardProps {
  children: React.ReactNode;
  /** Unique key to trigger re-animation on step change */
  stepKey?: string;
}

export function FormCard({ children, stepKey }: FormCardProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Reset animation state when step changes
    setIsVisible(false);
    setIsExiting(false);
    
    // Small delay to ensure CSS transition triggers
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [stepKey]);

  return (
    <>
      <style>{`
        @keyframes formCardEnter {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes formCardExit {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        .form-card {
          animation: formCardEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .form-card.exiting {
          animation: formCardExit 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        /* Stagger animation for child elements */
        .form-card > * {
          opacity: 0;
          animation: fieldFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes fieldFadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Stagger delays for direct children */
        .form-card > *:nth-child(1) { animation-delay: 0.05s; }
        .form-card > *:nth-child(2) { animation-delay: 0.1s; }
        .form-card > *:nth-child(3) { animation-delay: 0.15s; }
        .form-card > *:nth-child(4) { animation-delay: 0.2s; }
        .form-card > *:nth-child(5) { animation-delay: 0.25s; }
        .form-card > *:nth-child(6) { animation-delay: 0.3s; }
        .form-card > *:nth-child(7) { animation-delay: 0.35s; }
        .form-card > *:nth-child(8) { animation-delay: 0.4s; }
      `}</style>
      <div
        className={`form-card ${isExiting ? 'exiting' : ''}`}
        style={{
          backgroundColor: colors.white,
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          border: `1px solid ${colors.border}`,
          opacity: isVisible ? 1 : 0,
        }}
      >
        {children}
      </div>
    </>
  );
}

