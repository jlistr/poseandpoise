'use client';

import React, { useEffect, useState, useRef } from 'react';
import { colors } from '../types';

// Check Icon
const CheckIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Sparkle Icon for celebration
const SparkleIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

interface ProgressIndicatorProps {
  collectedCount: number;
}

export function ProgressIndicator({ collectedCount }: ProgressIndicatorProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const prevCountRef = useRef(collectedCount);

  // Animate count changes
  useEffect(() => {
    if (collectedCount > prevCountRef.current) {
      // Count increased - show celebration
      setShowCelebration(true);
      const celebrationTimer = setTimeout(() => setShowCelebration(false), 600);
      
      // Animate the number counting up
      const start = prevCountRef.current;
      const end = collectedCount;
      const duration = 300;
      const startTime = Date.now();
      
      const animateCount = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        setDisplayCount(Math.round(start + (end - start) * eased));
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      
      requestAnimationFrame(animateCount);
      prevCountRef.current = collectedCount;
      
      return () => clearTimeout(celebrationTimer);
    } else {
      setDisplayCount(collectedCount);
      prevCountRef.current = collectedCount;
    }
  }, [collectedCount]);

  // Entrance animation
  useEffect(() => {
    if (collectedCount > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [collectedCount, isVisible]);

  if (collectedCount === 0) return null;

  return (
    <>
      <style>{`
        @keyframes progressSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes checkBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes sparkleRotate {
          0% { transform: rotate(0deg) scale(0); opacity: 0; }
          50% { transform: rotate(180deg) scale(1); opacity: 1; }
          100% { transform: rotate(360deg) scale(0); opacity: 0; }
        }
        
        @keyframes countPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes savedPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .progress-indicator {
          animation: progressSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .progress-check {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .progress-check.celebrating {
          animation: checkBounce 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .progress-count {
          display: inline-block;
          transition: all 0.2s ease;
        }
        
        .progress-count.celebrating {
          animation: countPop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: ${colors.camel};
        }
        
        .sparkle {
          position: absolute;
          color: ${colors.camel};
          animation: sparkleRotate 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .sparkle-1 { top: -8px; left: -8px; animation-delay: 0s; }
        .sparkle-2 { top: -8px; right: -8px; animation-delay: 0.1s; }
        .sparkle-3 { bottom: -8px; left: -8px; animation-delay: 0.15s; }
        .sparkle-4 { bottom: -8px; right: -8px; animation-delay: 0.05s; }
        
        .saved-indicator {
          animation: savedPulse 2s ease-in-out infinite;
        }
      `}</style>
      <div
        className="progress-indicator"
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: '0.75rem',
          backgroundColor: colors.white,
          border: `1px solid ${showCelebration ? colors.camel : colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: isVisible ? 1 : 0,
          transition: 'border-color 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            className={`progress-check ${showCelebration ? 'celebrating' : ''}`}
            style={{
              position: 'relative',
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
            {/* Celebration sparkles */}
            {showCelebration && (
              <>
                <span className="sparkle sparkle-1"><SparkleIcon size={8} /></span>
                <span className="sparkle sparkle-2"><SparkleIcon size={10} /></span>
                <span className="sparkle sparkle-3"><SparkleIcon size={10} /></span>
                <span className="sparkle sparkle-4"><SparkleIcon size={8} /></span>
              </>
            )}
          </div>
          <span style={{ fontSize: '14px', color: colors.textPrimary }}>
            <strong className={`progress-count ${showCelebration ? 'celebrating' : ''}`}>
              {displayCount}
            </strong> field{collectedCount !== 1 ? 's' : ''} collected
          </span>
        </div>
        <span
          className="saved-indicator"
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
    </>
  );
}

