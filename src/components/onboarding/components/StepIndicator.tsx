'use client';

import React, { useEffect, useState } from 'react';
import { colors, fonts, type StepInfo } from '../types';

interface StepIndicatorProps {
  steps: StepInfo[];
}

export function StepIndicator({ steps }: StepIndicatorProps): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const currentIndex = steps.findIndex(s => s.current);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @keyframes stepPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes stepComplete {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        
        @keyframes connectorFill {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        
        .step-dot {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .step-dot.current::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid ${colors.camel};
          opacity: 0.3;
          animation: stepPulse 2s ease-in-out infinite;
        }
        
        .step-dot.just-completed {
          animation: stepComplete 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .step-label {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .step-label.current {
          font-weight: 500;
        }
        
        .connector-line {
          position: relative;
          overflow: hidden;
        }
        
        .connector-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: ${colors.camel};
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .step-item {
          opacity: 0;
          animation: stepFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes stepFadeIn {
          0% {
            opacity: 0;
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '3rem',
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div 
              className="step-item"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                animationDelay: mounted ? '0s' : `${index * 0.08}s`,
              }}
            >
              {/* Dot */}
              <div
                className={`step-dot ${step.current ? 'current' : ''}`}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: step.completed || step.current ? colors.camel : colors.border,
                  transform: step.current ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              {/* Label */}
              <span
                className={`step-label ${step.current ? 'current' : ''}`}
                style={{
                  fontSize: '11px',
                  fontFamily: fonts.body,
                  fontWeight: step.current ? 500 : 400,
                  letterSpacing: '0.15em',
                  color: step.current ? colors.textPrimary : step.completed ? colors.camel : colors.textMuted,
                }}
              >
                {step.name}
              </span>
            </div>
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className="connector-line"
                style={{
                  width: '2rem',
                  height: '2px',
                  backgroundColor: colors.border,
                  borderRadius: '1px',
                }}
              >
                <div
                  className="connector-fill"
                  style={{
                    width: '100%',
                    transform: index < currentIndex ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

